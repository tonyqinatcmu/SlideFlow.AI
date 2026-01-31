"""
PPT智能生成器 - 后端API服务
严格按照产品流程实现

流程：
1. 用户输入想法（可上传录音转写）
2. 生成大纲（使用特定提示词模板）
3. 对话迭代修改大纲
4. 生成设计风格和绘制prompt
5. 对话迭代修改风格
6. 逐页生成PPT图片（Gemini图片生成 + 参考图）
7. 下载打包
"""

import os
import re
import time
import zipfile
from pathlib import Path
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image

# 导入所有模块
from modules.config import (
    XFYUN_APPID,
    XFYUN_SECRET_KEY,
    OUTPUT_DIR,
    REFERENCE_DIR,
    AUDIO_DIR,
    MATERIALS_DIR,
    SUPPORT_DOCS_DIR,
    FRONTEND_BUILD_DIR,
    LOGIN_RECORDS_FILE
)
from modules.prompts import (
    OUTLINE_PROMPT_TEMPLATE,
    DEFAULT_DESIGN_PRINCIPLES,
    REFINE_OUTLINE_PROMPT,
    STYLE_GENERATION_PROMPT,
    REFINE_STYLE_PROMPT,
    REFINE_PAGE_PROMPT,
    build_color_scheme_spec,
    build_font_scheme_spec
)
from modules.models import (
    LoginRequest,
    UserInputRequest,
    RefineRequest,
    GenerateImageRequest,
    GenerateAllImagesRequest,
    BaseRequest,
    RefinePageRequest,
    OutlineUpdateRequest
)
from modules.asr import XfyunASR, parse_xfyun_result, format_dialogue_as_text
from modules.invite_codes import (
    load_invite_codes,
    verify_invite_code,
    record_login,
    get_login_records_from_csv
)
from modules.session import SessionStage, get_session, add_message
from modules.gemini_api import (
    parse_json_from_text,
    generate_text,
    generate_ppt_image,
    analyze_template_design
)
from modules.visit_counter import get_visit_count, increment_visit_count
from modules.doc_extract import extract_text_from_document, extract_table_from_file

# ============ FastAPI应用 ============

app = FastAPI(
    title="PPT智能生成器API",
    description="基于Gemini的PPT智能生成服务",
    version="2.0.0"
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ 健康检查和默认配置 ============

@app.get("/api/health")
async def root():
    return {
        "message": "PPT智能生成器API服务正在运行",
        "version": "2.0.0",
        "docs": "/docs"
    }


@app.get("/api/defaults")
async def get_defaults():
    """获取默认配置"""
    return {
        "design_principles": DEFAULT_DESIGN_PRINCIPLES
    }


# ============ 登录验证 ============

@app.post("/api/login")
async def login(request: LoginRequest):
    """验证邀请码并登录"""
    code = request.invite_code.strip()

    if not code:
        return {"success": False, "message": "请输入邀请码"}

    if verify_invite_code(code):
        record_login(code)
        return {"success": True, "message": "登录成功", "invite_code": code.upper()}
    else:
        return {"success": False, "message": "邀请码无效，请检查后重试"}


@app.get("/api/login/records")
async def get_login_records():
    """获取登录记录（管理接口）"""
    records = get_login_records_from_csv()
    data = load_invite_codes()
    return {
        "total_codes": len(data.get("codes", [])),
        "total_logins": len(records),
        "records": records[-50:],
        "csv_file": str(LOGIN_RECORDS_FILE)
    }


@app.get("/api/login/records/download")
async def download_login_records():
    """下载登录记录CSV文件"""
    if not LOGIN_RECORDS_FILE.exists():
        raise HTTPException(status_code=404, detail="登录记录文件不存在")
    return FileResponse(path=LOGIN_RECORDS_FILE, filename="login_records.csv", media_type="text/csv")


# ============ 会话管理 ============

@app.get("/api/session/{session_id}")
async def get_session_info(session_id: str):
    """获取会话信息"""
    session = get_session(session_id)
    return {
        "session_id": session_id,
        "stage": session["stage"],
        "outline": session["outline_json"],
        "style": session["style_json"],
        "images": session["generated_images"],
        "messages": session["messages"],
        "audio_transcript": session.get("audio_transcript", "")
    }


# ============ 录音上传和ASR转写 ============

@app.post("/api/audio/upload")
async def upload_audio(
    session_id: str = Form(...),
    num_speaker: Optional[int] = Form(None),
    file: UploadFile = File(...)
):
    """上传录音文件并进行ASR转写"""
    session = get_session(session_id)
    file_ext = Path(file.filename).suffix or '.mp3'
    audio_path = AUDIO_DIR / f"{session_id}_audio{file_ext}"

    with open(audio_path, "wb") as f:
        content = await file.read()
        f.write(content)

    print(f"音频文件已保存: {audio_path}")
    print(f"说话人数设置: {num_speaker if num_speaker else '自动判断'}")

    try:
        asr = XfyunASR(appid=XFYUN_APPID, secret_key=XFYUN_SECRET_KEY, upload_file_path=str(audio_path))
        result = asr.get_result(num_speaker)
        dialogue_list = parse_xfyun_result(result)

        if dialogue_list:
            transcript_text = format_dialogue_as_text(dialogue_list)
            session["audio_transcript"] = transcript_text
            add_message(session_id, "assistant", f"✅ 录音转写完成！\n\n{transcript_text}")
            return {"success": True, "message": "录音转写完成", "transcript": transcript_text, "dialogue_count": len(dialogue_list)}
        else:
            return {"success": False, "message": "转写结果为空，请检查音频文件", "transcript": ""}
    except Exception as e:
        print(f"ASR转写错误: {e}")
        return {"success": False, "message": f"转写失败: {str(e)}", "transcript": ""}


@app.get("/api/audio/transcript/{session_id}")
async def get_audio_transcript(session_id: str):
    """获取录音转写内容"""
    session = get_session(session_id)
    return {"success": True, "transcript": session.get("audio_transcript", "")}


# ============ 支持性文档上传 ============

@app.post("/api/support-doc/upload")
async def upload_support_document(
    session_id: str = Form(...),
    file: UploadFile = File(...)
):
    """
    上传支持性文档并抽取文本
    支持：PDF、Word、PPT、Excel、TXT
    """
    session = get_session(session_id)
    
    # 检查文件类型
    allowed_extensions = ['.pdf', '.docx', '.doc', '.pptx', '.ppt', '.xlsx', '.xls', '.txt']
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        return {
            "success": False,
            "message": f"不支持的文件类型: {file_ext}，支持: {', '.join(allowed_extensions)}"
        }
    
    # 保存文件
    file_path = SUPPORT_DOCS_DIR / f"{session_id}_{int(time.time())}_{file.filename}"
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    print(f"支持性文档已保存: {file_path}")
    
    # 抽取文本
    extracted_text = extract_text_from_document(str(file_path), file.filename)
    
    if not extracted_text:
        return {
            "success": False,
            "message": "文档文本抽取失败，请检查文件是否正常或安装相应的依赖库"
        }
    
    # 截取前10000字符（避免过长）
    if len(extracted_text) > 10000:
        extracted_text = extracted_text[:10000] + "\n...(内容过长，已截取前10000字)"
    
    # 保存到session
    session["support_docs_files"].append({
        "filename": file.filename,
        "path": str(file_path),
        "text_length": len(extracted_text)
    })
    
    # 累加文本
    if session["support_docs_text"]:
        session["support_docs_text"] += f"\n\n--- {file.filename} ---\n{extracted_text}"
    else:
        session["support_docs_text"] = f"--- {file.filename} ---\n{extracted_text}"
    
    add_message(session_id, "assistant", f"✅ 文档 \"{file.filename}\" 已上传并抽取文本（{len(extracted_text)}字）")
    
    return {
        "success": True,
        "message": "文档上传成功",
        "filename": file.filename,
        "text_length": len(extracted_text),
        "text_preview": extracted_text[:500] + "..." if len(extracted_text) > 500 else extracted_text
    }


@app.delete("/api/support-doc/clear")
async def clear_support_documents(session_id: str):
    """清除所有支持性文档"""
    session = get_session(session_id)
    session["support_docs_text"] = ""
    session["support_docs_files"] = []
    
    return {"success": True, "message": "已清除所有支持性文档"}


@app.get("/api/support-doc/list/{session_id}")
async def list_support_documents(session_id: str):
    """获取已上传的支持性文档列表"""
    session = get_session(session_id)
    return {
        "success": True,
        "files": session.get("support_docs_files", []),
        "total_text_length": len(session.get("support_docs_text", ""))
    }


# ============ 页面素材上传 ============

@app.post("/api/page-material/upload")
async def upload_page_material(
    session_id: str = Form(...),
    page_index: int = Form(...),
    file: UploadFile = File(...),
    description: str = Form(default="")
):
    """
    上传页面素材（图片或Excel表格）
    这些素材会直接参与对应页面的PPT图片生成
    """
    session = get_session(session_id)
    
    # 检查文件类型（支持图片和Excel）
    image_extensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    excel_extensions = ['.xlsx', '.xls', '.csv']
    allowed_extensions = image_extensions + excel_extensions
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        return {
            "success": False,
            "message": f"支持的文件类型: 图片({', '.join(image_extensions)}) 或 表格({', '.join(excel_extensions)})"
        }
    
    # 检查页码是否有效
    outline = session.get("outline_json", [])
    if page_index < 0 or page_index >= len(outline):
        return {
            "success": False,
            "message": f"页码无效，当前大纲共 {len(outline)} 页"
        }
    
    # 保存文件
    material_filename = f"{session_id}_page{page_index}_{int(time.time())}_{file.filename}"
    material_path = MATERIALS_DIR / material_filename
    
    with open(material_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    print(f"页面素材已保存: {material_path}")
    
    # 判断素材类型
    if file_ext in image_extensions:
        material_type = "image"
        table_text = None
    else:
        material_type = "table"
        # 抽取表格内容为文本
        table_text = extract_table_from_file(str(material_path), file.filename)
    
    # 存入session
    if "page_materials" not in session:
        session["page_materials"] = {}
    
    page_key = str(page_index)
    if page_key not in session["page_materials"]:
        session["page_materials"][page_key] = []
    
    material_data = {
        "filename": file.filename,
        "path": str(material_path),
        "type": material_type,
        "description": description.strip()
    }
    if table_text:
        material_data["table_text"] = table_text
    
    session["page_materials"][page_key].append(material_data)
    
    page_title = outline[page_index].get("title", f"第{page_index + 1}页")
    type_label = "表格" if material_type == "table" else "图片"
    add_message(session_id, "assistant", f"✅ {type_label} \"{file.filename}\" 已添加到第 {page_index + 1} 页（{page_title}）")
    
    return {
        "success": True,
        "message": f"{type_label}已添加到第 {page_index + 1} 页",
        "page_index": page_index,
        "filename": file.filename,
        "type": material_type,
        "description": description.strip(),
        "table_preview": table_text[:500] if table_text and len(table_text) > 500 else table_text,
        "total_materials": len(session["page_materials"][page_key])
    }


@app.post("/api/page-material/add-table-text")
async def add_table_text_material(
    session_id: str = Form(...),
    page_index: int = Form(...),
    table_text: str = Form(...),
    description: str = Form(default="")
):
    """
    添加粘贴的表格文本到指定页面
    """
    session = get_session(session_id)
    
    # 检查页码是否有效
    outline = session.get("outline_json", [])
    if page_index < 0 or page_index >= len(outline):
        return {
            "success": False,
            "message": f"页码无效，当前大纲共 {len(outline)} 页"
        }
    
    if not table_text.strip():
        return {
            "success": False,
            "message": "表格内容不能为空"
        }
    
    # 存入session
    if "page_materials" not in session:
        session["page_materials"] = {}
    
    page_key = str(page_index)
    if page_key not in session["page_materials"]:
        session["page_materials"][page_key] = []
    
    # 生成一个标识名
    table_id = f"粘贴的表格_{int(time.time())}"
    
    session["page_materials"][page_key].append({
        "filename": table_id,
        "path": None,
        "type": "table_text",
        "table_text": table_text.strip(),
        "description": description.strip()
    })
    
    page_title = outline[page_index].get("title", f"第{page_index + 1}页")
    add_message(session_id, "assistant", f"✅ 表格内容已添加到第 {page_index + 1} 页（{page_title}）")
    
    return {
        "success": True,
        "message": f"表格内容已添加到第 {page_index + 1} 页",
        "page_index": page_index,
        "filename": table_id,
        "type": "table_text",
        "description": description.strip(),
        "total_materials": len(session["page_materials"][page_key])
    }


@app.delete("/api/page-material/remove")
async def remove_page_material(
    session_id: str,
    page_index: int,
    material_index: int
):
    """移除指定页面的某个素材"""
    session = get_session(session_id)
    
    page_key = str(page_index)
    materials = session.get("page_materials", {}).get(page_key, [])
    
    if material_index < 0 or material_index >= len(materials):
        return {"success": False, "message": "素材索引无效"}
    
    removed = materials.pop(material_index)
    
    # 删除文件
    if removed.get("path"):
        try:
            os.remove(removed["path"])
        except:
            pass
    
    return {
        "success": True,
        "message": f"已移除素材: {removed['filename']}"
    }


@app.get("/api/page-material/list/{session_id}")
async def list_page_materials(session_id: str):
    """获取所有页面的素材列表"""
    session = get_session(session_id)
    return {
        "success": True,
        "materials": session.get("page_materials", {})
    }


@app.get("/api/page-material/list/{session_id}/{page_index}")
async def list_page_materials_by_page(session_id: str, page_index: int):
    """获取指定页面的素材列表"""
    session = get_session(session_id)
    page_key = str(page_index)
    materials = session.get("page_materials", {}).get(page_key, [])
    return {
        "success": True,
        "page_index": page_index,
        "materials": materials
    }


# ============ 步骤1: 用户输入想法 ============

@app.post("/api/input")
async def submit_user_input(request: UserInputRequest):
    """提交用户输入的PPT想法"""
    session = get_session(request.session_id)
    session["user_input"] = request.content
    session["stage"] = SessionStage.OUTLINE
    add_message(request.session_id, "user", request.content)
    return {"success": True, "message": "已收到您的想法，正在生成大纲...", "next_step": "generate_outline"}


# ============ 步骤2: 生成大纲 ============

@app.post("/api/outline/generate")
async def generate_outline(request: UserInputRequest):
    """生成PPT大纲"""
    session = get_session(request.session_id)

    if request.page_count:
        session["page_count"] = request.page_count
    if request.page_instructions:
        session["page_instructions"] = request.page_instructions
    if request.design_principles:
        session["design_principles"] = request.design_principles
    if request.template_settings:
        session["template_settings"] = request.template_settings

    page_constraint = f"【页数要求】请严格生成{request.page_count}页PPT。" if request.page_count else ""
    page_instructions = f"【逐页说明】\n{request.page_instructions}" if request.page_instructions else ""

    # 合并用户输入、录音转写、支持性文档
    audio_transcript = session.get("audio_transcript", "")
    support_docs_text = session.get("support_docs_text", "")

    # 构建完整的输入内容
    combined_input = f"【用户输入的想法】\n{request.content}"
    
    if audio_transcript:
        combined_input += f"\n\n【会议录音转写内容】\n{audio_transcript}"
    
    if support_docs_text:
        combined_input += f"\n\n【支持性文档内容（请参考以下文档内容生成大纲）】\n{support_docs_text}"

    user_input = combined_input

    prompt = OUTLINE_PROMPT_TEMPLATE.format(user_input=user_input, page_constraint=page_constraint, page_instructions=page_instructions)
    response_text, retry_info = await generate_text(prompt)

    if not response_text:
        return {"success": False, "message": f"大纲生成失败，{retry_info}", "retry_info": retry_info}

    json_data = parse_json_from_text(response_text)

    if json_data and "pages" in json_data:
        session["outline_text"] = response_text
        session["outline_json"] = json_data["pages"]
        session["user_input"] = request.content
        session["stage"] = SessionStage.OUTLINE_REFINE

        assistant_msg = f"已为您生成PPT大纲：\n\n{response_text}\n\n如果您对大纲满意，请输入'确认'继续生成设计风格；如果需要修改，请告诉我您的调整意见。"
        if retry_info:
            assistant_msg = f"{retry_info}\n\n{assistant_msg}"
        add_message(request.session_id, "assistant", assistant_msg)

        return {"success": True, "outline_text": response_text, "outline_json": json_data["pages"], "message": "大纲生成完成，请确认或提出修改意见", "retry_info": retry_info}
    else:
        return {"success": False, "message": f"大纲生成失败，请重试。{retry_info}" if retry_info else "大纲生成失败，请重试", "raw_response": response_text, "retry_info": retry_info}


# ============ 步骤3: 大纲迭代修改 ============

@app.post("/api/outline/refine")
async def refine_outline(request: RefineRequest):
    """修改大纲"""
    session = get_session(request.session_id)
    add_message(request.session_id, "user", request.feedback)

    if any(keyword in request.feedback.lower() for keyword in ["确认", "ok", "满意", "可以", "没问题", "通过"]):
        session["stage"] = SessionStage.STYLE
        add_message(request.session_id, "assistant", "好的，大纲已确认！正在为您生成设计风格和绘图方案...")
        return {"success": True, "confirmed": True, "message": "大纲已确认，请继续生成设计风格", "next_step": "generate_style"}

    prompt = REFINE_OUTLINE_PROMPT.format(current_outline=session["outline_text"], user_feedback=request.feedback)
    response_text, retry_info = await generate_text(prompt)

    if not response_text:
        return {"success": False, "message": f"修改失败，{retry_info}", "retry_info": retry_info}

    json_data = parse_json_from_text(response_text)

    if json_data and "pages" in json_data:
        session["outline_text"] = response_text
        session["outline_json"] = json_data["pages"]
        assistant_msg = f"已根据您的反馈修改大纲：\n\n{response_text}\n\n请确认是否满意，或继续提出调整意见。"
        if retry_info:
            assistant_msg = f"{retry_info}\n\n{assistant_msg}"
        add_message(request.session_id, "assistant", assistant_msg)
        return {"success": True, "confirmed": False, "outline_text": response_text, "outline_json": json_data["pages"], "message": "大纲已修改，请确认或继续调整", "retry_info": retry_info}
    else:
        return {"success": False, "message": f"修改失败，请重试。{retry_info}" if retry_info else "修改失败，请重试", "retry_info": retry_info}


@app.post("/api/outline/confirm")
async def confirm_outline(request: BaseRequest):
    """显式确认大纲（按钮确认）"""
    session = get_session(request.session_id)
    session["stage"] = SessionStage.STYLE
    add_message(request.session_id, "assistant", "大纲已确认！正在为您生成设计风格和绘图方案...")
    return {"success": True, "confirmed": True, "message": "大纲已确认，请继续生成设计风格", "next_step": "generate_style"}


@app.post("/api/outline/update")
async def update_outline(request: OutlineUpdateRequest):
    """直接更新大纲JSON（用于前端编辑后同步）"""
    session = get_session(request.session_id)
    
    # 更新大纲
    session["outline_json"] = request.outline_json
    
    # 重新生成大纲文本
    outline_text = "\n\n".join([
        f"【第{i+1}页】{page.get('title', page.get('theme', ''))}\n{page.get('content', '')}"
        for i, page in enumerate(request.outline_json)
    ])
    session["outline_text"] = outline_text
    
    print(f"大纲已更新: {len(request.outline_json)} 页")
    
    return {
        "success": True,
        "message": "大纲已更新",
        "outline_json": request.outline_json
    }


# ============ 步骤4: 生成设计风格和绘图Prompt ============

@app.post("/api/style/generate")
async def generate_style(request: UserInputRequest):
    """生成设计风格和绘图Prompt"""
    session = get_session(request.session_id)

    outline_text = "\n\n".join([
        f"第{p['page']}页：{p.get('theme', p.get('title', ''))}\n页面标题：{p.get('title', '')}\n核心要点：\n{p.get('content', '')}"
        for p in session["outline_json"]
    ])

    design_principles = session.get("design_principles", DEFAULT_DESIGN_PRINCIPLES)
    template_settings = session.get("template_settings", {})
    color_scheme = template_settings.get("color_scheme", {})
    font_scheme = template_settings.get("font_scheme", {})
    
    content_richness = template_settings.get("content_richness", {})
    content_richness_prompt = content_richness.get("prompt", "")
    if content_richness_prompt:
        design_principles = f"{design_principles}\n\n【内容风格要求】\n{content_richness_prompt}"

    # 修复3: 添加页码位置处理
    page_number_position = template_settings.get("page_number_position", "bottom-center")
    if page_number_position == "none":
        page_number_instruction = "页面不需要显示页码。"
    elif page_number_position == "bottom-left":
        page_number_instruction = "左下角需要显示ppt页码。"
    elif page_number_position == "bottom-right":
        page_number_instruction = "右下角需要显示ppt页码。"
    else:  # bottom-center (默认)
        page_number_instruction = "底部居中需要显示ppt页码。"

    color_scheme_spec = build_color_scheme_spec(color_scheme)
    font_scheme_spec = build_font_scheme_spec(font_scheme)
    
    example_primary = color_scheme.get('primary', '#1C2662')
    example_secondary = color_scheme.get('secondary', '#DAA050')
    example_accent = color_scheme.get('accent', '#BC2424')
    example_gray = color_scheme.get('gray', '#666464')

    prompt = STYLE_GENERATION_PROMPT.format(
        outline=outline_text, design_principles=design_principles,
        color_scheme_spec=color_scheme_spec, font_scheme_spec=font_scheme_spec,
        page_number_instruction=page_number_instruction,  # 修复3: 添加参数
        example_primary=example_primary, example_secondary=example_secondary,
        example_accent=example_accent, example_gray=example_gray
    )

    response_text, retry_info = await generate_text(prompt)

    if not response_text:
        return {"success": False, "message": f"设计方案生成失败，{retry_info}", "retry_info": retry_info}

    json_data = parse_json_from_text(response_text)

    if json_data and "pages" in json_data:
        session["style_text"] = response_text
        session["style_json"] = json_data["pages"]
        session["stage"] = SessionStage.STYLE_REFINE

        style_summary = "\n\n".join([f"**第{p['page']}页：{p.get('theme', '')}**\n设计理念：{p.get('design_concept', '')}\n" for p in json_data["pages"]])
        assistant_msg = f"已为您生成设计方案：\n\n{style_summary}\n\n如果您对设计方案满意，请输入'生成'开始生成PPT图片；如果需要调整风格，请告诉我您的意见。"
        if retry_info:
            assistant_msg = f"{retry_info}\n\n{assistant_msg}"
        add_message(request.session_id, "assistant", assistant_msg)

        style_json_without_prompt = [{"page": p["page"], "theme": p.get("theme", ""), "design_concept": p.get("design_concept", "")} for p in json_data["pages"]]
        return {"success": True, "style_text": response_text, "style_json": style_json_without_prompt, "message": "设计方案生成完成，请确认或提出修改意见", "retry_info": retry_info}
    else:
        return {"success": False, "message": f"设计方案生成失败，请重试。{retry_info}" if retry_info else "设计方案生成失败，请重试", "raw_response": response_text, "retry_info": retry_info}


# ============ 步骤5: 设计风格迭代修改 ============

@app.post("/api/style/refine")
async def refine_style(request: RefineRequest):
    """修改设计风格"""
    session = get_session(request.session_id)
    add_message(request.session_id, "user", request.feedback)

    if any(keyword in request.feedback.lower() for keyword in ["生成", "开始", "确认", "ok", "可以"]):
        session["stage"] = SessionStage.GENERATE
        add_message(request.session_id, "assistant", "好的，设计方案已确认！开始逐页生成PPT图片...")
        return {"success": True, "confirmed": True, "message": "设计方案已确认，开始生成图片", "next_step": "generate_images"}

    prompt = REFINE_STYLE_PROMPT.format(current_style=session["style_text"], user_feedback=request.feedback)
    response_text, retry_info = await generate_text(prompt)

    if not response_text:
        return {"success": False, "message": f"修改失败，{retry_info}", "retry_info": retry_info}

    json_data = parse_json_from_text(response_text)

    if json_data and "pages" in json_data:
        session["style_text"] = response_text
        session["style_json"] = json_data["pages"]
        assistant_msg = f"已根据您的反馈修改设计方案。请输入'生成'开始生成PPT图片，或继续调整。"
        if retry_info:
            assistant_msg = f"{retry_info}\n\n{assistant_msg}"
        add_message(request.session_id, "assistant", assistant_msg)

        style_json_without_prompt = [{"page": p["page"], "theme": p.get("theme", ""), "design_concept": p.get("design_concept", "")} for p in json_data["pages"]]
        return {"success": True, "confirmed": False, "style_json": style_json_without_prompt, "message": "设计方案已修改，请确认或继续调整", "retry_info": retry_info}
    else:
        return {"success": False, "message": f"修改失败，请重试。{retry_info}" if retry_info else "修改失败，请重试", "retry_info": retry_info}


@app.post("/api/style/confirm")
async def confirm_style(request: BaseRequest):
    """显式确认设计风格（按钮确认）"""
    session = get_session(request.session_id)
    session["stage"] = SessionStage.GENERATE
    add_message(request.session_id, "assistant", "设计方案已确认！开始逐页生成PPT图片...")
    return {"success": True, "confirmed": True, "message": "设计方案已确认，开始生成图片", "next_step": "generate_images"}


# ============ 步骤6: 上传参考图 ============

# 支持的图片格式
SUPPORTED_IMAGE_FORMATS = {'.png', '.jpg', '.jpeg', '.webp', '.gif'}

@app.post("/api/reference/upload")
async def upload_reference_image(session_id: str, file: UploadFile = File(...), type: str = "reference"):
    """上传参考图片/母版（用于保持风格一致）"""
    session = get_session(session_id)

    # 校验文件格式
    original_ext = Path(file.filename).suffix.lower() or '.png'
    if original_ext not in SUPPORTED_IMAGE_FORMATS:
        return {
            "success": False,
            "message": f"不支持的文件格式: {original_ext}。请上传 PNG/JPG/WebP/GIF 格式的图片（PPT页面截图），不支持 PPT/PPTX/EMF 等文件。"
        }

    file_path = REFERENCE_DIR / f"{session_id}_reference{original_ext}"

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    session["reference_image_path"] = str(file_path)
    session["reference_type"] = type
    print(f"[上传] 参考图/母版已保存: {file_path}, 类型: {type}")

    template_analysis = None
    if type == "template":
        template_analysis = analyze_template_design(str(file_path))
        if template_analysis:
            session["template_analysis"] = template_analysis
            print(f"[上传] 母版分析完成并保存到session")

    return {
        "success": True,
        "message": "母版上传并分析成功" if type == "template" and template_analysis else ("母版上传成功" if type == "template" else "参考图上传成功"),
        "file_path": str(file_path),
        "type": type,
        "template_analysis": template_analysis
    }


@app.post("/api/logo/upload")
async def upload_logo(session_id: str, file: UploadFile = File(...)):
    """上传用户自定义Logo"""
    session = get_session(session_id)
    
    # 校验文件格式
    original_ext = Path(file.filename).suffix.lower()
    if original_ext not in SUPPORTED_IMAGE_FORMATS:
        return {
            "success": False,
            "message": f"不支持的文件格式: {original_ext}。请上传 PNG/JPG/WebP/GIF 格式的图片，不支持 EMF/SVG 等矢量格式。"
        }
    
    logo_filename = f"{session_id}_logo{original_ext}"
    logo_path = REFERENCE_DIR / logo_filename

    with open(logo_path, "wb") as f:
        content = await file.read()
        f.write(content)

    session["custom_logo_path"] = str(logo_path)
    return {"success": True, "message": "Logo上传成功", "logo_path": str(logo_path)}


# ============ 单页修改并重新生成 ============

@app.post("/api/page/refine-and-regenerate")
async def refine_page_and_regenerate(request: RefinePageRequest):
    """微调单页设计并重新生成图片 - 基于当前已生成的图片进行微调"""
    session = get_session(request.session_id)
    style_pages = session.get("style_json", [])

    if request.page_index >= len(style_pages):
        raise HTTPException(status_code=400, detail="页码超出范围")

    current_page = style_pages[request.page_index]
    page_num = request.page_index + 1
    
    # 获取当前已生成的图片路径作为微调参考
    current_image_path = None
    generated_images = session.get("generated_images", [])
    if request.page_index < len(generated_images) and generated_images[request.page_index]:
        img_info = generated_images[request.page_index]
        if img_info.get("image_path"):
            current_image_path = img_info["image_path"]
            print(f"[微调模式] 第{page_num}页使用当前图片作为参考: {current_image_path}")

    prompt = REFINE_PAGE_PROMPT.format(
        page_num=page_num, theme=current_page.get("theme", ""),
        design_concept=current_page.get("design_concept", ""),
        current_prompt=current_page.get("prompt", ""), user_feedback=request.feedback
    )

    response_text, text_retry_info = await generate_text(prompt)

    if not response_text:
        return {"success": False, "message": f"设计方案修改失败，{text_retry_info}", "retry_info": text_retry_info}

    json_data = parse_json_from_text(response_text)

    if json_data:
        updated_page = {
            "page": page_num,
            "theme": json_data.get("theme", current_page.get("theme", "")),
            "design_concept": json_data.get("design_concept", ""),
            "prompt": json_data.get("prompt", "")
        }
        session["style_json"][request.page_index] = updated_page

        # 构建微调增强的prompt
        refine_prompt = updated_page["prompt"]
        if current_image_path:
            # 在prompt中添加微调说明
            refine_prompt = f"""【微调模式】请基于参考图片进行微调，用户的修改意见是：{request.feedback}

仅修改用户提到的部分，其他元素（布局、配色、风格）尽量保持与参考图一致。

原设计prompt：
{updated_page["prompt"]}"""

        output_path = OUTPUT_DIR / f"{request.session_id}_第{page_num}页.jpg"
        success, image_retry_info = await generate_ppt_image(
            prompt=refine_prompt, output_path=output_path,
            reference_image_path=current_image_path if current_image_path else session.get("reference_image_path"),
            custom_logo_path=session.get("custom_logo_path"),
            reference_type="refine" if current_image_path else session.get("reference_type", "reference"),
            template_analysis=session.get("template_analysis")
        )

        combined_retry_info = ""
        if text_retry_info:
            combined_retry_info += text_retry_info
        if image_retry_info:
            combined_retry_info += ("\n" if combined_retry_info else "") + image_retry_info

        if success:
            full_filename = f"{request.session_id}_第{page_num}页.jpg"
            image_info = {"page": page_num, "theme": updated_page.get("theme", ""), "image_path": str(output_path), "filename": full_filename}

            while len(session["generated_images"]) <= request.page_index:
                session["generated_images"].append(None)
            session["generated_images"][request.page_index] = image_info

            assistant_msg = f"✅ 第{page_num}页已根据您的意见微调完成"
            if combined_retry_info:
                assistant_msg = f"{combined_retry_info}\n\n{assistant_msg}"
            add_message(request.session_id, "assistant", assistant_msg)

            return {
                "success": True,
                "updated_style": {"page": updated_page["page"], "theme": updated_page["theme"], "design_concept": updated_page["design_concept"]},
                "image_path": str(output_path), "image_filename": full_filename,
                "message": f"第{page_num}页已微调完成", "retry_info": combined_retry_info
            }
        else:
            return {"success": False, "message": f"图片重新生成失败。{image_retry_info}" if image_retry_info else "图片重新生成失败", "retry_info": image_retry_info}
    else:
        return {"success": False, "message": f"设计方案修改失败，请重试。{text_retry_info}" if text_retry_info else "设计方案修改失败，请重试", "retry_info": text_retry_info}


# ============ 步骤7: 逐页生成PPT图片 ============

@app.post("/api/image/generate")
async def generate_single_image(request: GenerateImageRequest):
    """生成单页PPT图片"""
    session = get_session(request.session_id)
    style_pages = session.get("style_json", [])

    if request.page_index >= len(style_pages):
        raise HTTPException(status_code=400, detail="页码超出范围")

    page_style = style_pages[request.page_index]
    prompt = page_style.get("prompt", "")

    if not prompt:
        raise HTTPException(status_code=400, detail="该页没有生成提示词")

    output_path = OUTPUT_DIR / f"{request.session_id}_第{request.page_index + 1}页.jpg"

    # 获取该页的素材
    page_materials = session.get("page_materials", {}).get(str(request.page_index), [])
    if page_materials:
        print(f"第{request.page_index + 1}页有 {len(page_materials)} 个素材")

    success, retry_info = await generate_ppt_image(
        prompt=prompt, output_path=output_path,
        reference_image_path=session.get("reference_image_path"),
        custom_logo_path=session.get("custom_logo_path"),
        reference_type=session.get("reference_type", "reference"),
        template_analysis=session.get("template_analysis"),
        page_materials=page_materials  # 新增：传入页面素材
    )

    if success:
        full_filename = f"{request.session_id}_第{request.page_index + 1}页.jpg"
        image_info = {"page": request.page_index + 1, "theme": page_style.get("theme", ""), "image_path": str(output_path), "filename": full_filename}

        while len(session["generated_images"]) <= request.page_index:
            session["generated_images"].append(None)
        session["generated_images"][request.page_index] = image_info

        assistant_msg = f"✅ 第{request.page_index + 1}页生成完成"
        if retry_info:
            assistant_msg = f"{retry_info}\n\n{assistant_msg}"
        add_message(request.session_id, "assistant", assistant_msg)

        return {"success": True, "page_index": request.page_index, "image_path": str(output_path), "filename": full_filename, "retry_info": retry_info}
    else:
        add_message(request.session_id, "assistant", f"⚠️ 第{request.page_index + 1}页生成失败。{retry_info}" if retry_info else f"⚠️ 第{request.page_index + 1}页生成失败")
        raise HTTPException(status_code=500, detail=f"图片生成失败。{retry_info}" if retry_info else "图片生成失败")


@app.post("/api/image/generate-all")
async def generate_all_images(request: GenerateAllImagesRequest):
    """生成所有PPT图片"""
    session = get_session(request.session_id)
    style_pages = session.get("style_json", [])

    if not style_pages:
        raise HTTPException(status_code=400, detail="请先生成设计方案")

    session["stage"] = SessionStage.GENERATE
    results = []
    all_retry_info = []

    for i, page_style in enumerate(style_pages):
        prompt = page_style.get("prompt", "")

        if not prompt:
            results.append({"page": i + 1, "success": False, "error": "没有生成提示词"})
            continue

        output_path = OUTPUT_DIR / f"{request.session_id}_第{i + 1}页.jpg"

        # 获取该页的素材
        page_materials = session.get("page_materials", {}).get(str(i), [])
        if page_materials:
            print(f"第{i+1}页有 {len(page_materials)} 个素材")

        success, retry_info = await generate_ppt_image(
            prompt=prompt, output_path=output_path,
            reference_image_path=session.get("reference_image_path"),
            custom_logo_path=session.get("custom_logo_path"),
            reference_type=session.get("reference_type", "reference"),
            template_analysis=session.get("template_analysis"),
            page_materials=page_materials  # 新增：传入页面素材
        )

        result = {
            "page": i + 1, "theme": page_style.get("theme", ""), "success": success,
            "image_path": str(output_path) if success else None,
            "filename": f"第{i + 1}页.jpg" if success else None, "retry_info": retry_info
        }
        results.append(result)

        if retry_info:
            all_retry_info.append(f"第{i + 1}页: {retry_info}")

        if success:
            while len(session["generated_images"]) <= i:
                session["generated_images"].append(None)
            session["generated_images"][i] = result

    session["stage"] = SessionStage.COMPLETE

    complete_msg = f"🎉 所有{len(style_pages)}页PPT已生成完成！\n\n成功：{sum(1 for r in results if r['success'])}页\n失败：{sum(1 for r in results if not r['success'])}页\n\n您可以点击'下载PPT'按钮打包下载所有图片。"
    if all_retry_info:
        complete_msg = "⚠️ 生成过程中遇到接口不稳定：\n" + "\n".join(all_retry_info) + "\n\n" + complete_msg
    add_message(request.session_id, "assistant", complete_msg)

    return {"success": True, "total": len(style_pages), "results": results, "retry_info": all_retry_info if all_retry_info else None}


# ============ 步骤8: 下载打包 ============

@app.get("/api/download/{session_id}")
async def download_ppt_package(session_id: str):
    """下载PPT图片包（ZIP格式）"""
    session = get_session(session_id)
    images = session.get("generated_images", [])

    if not images:
        raise HTTPException(status_code=400, detail="没有生成的图片")

    zip_path = OUTPUT_DIR / f"{session_id}_PPT.zip"

    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for img in images:
            if img and img.get("image_path") and os.path.exists(img["image_path"]):
                zipf.write(img["image_path"], img["filename"])

    return FileResponse(zip_path, media_type="application/zip", filename=f"PPT_{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip")


@app.get("/api/download/{session_id}/pdf")
async def download_ppt_pdf(session_id: str):
    """下载PPT图片合并为PDF"""
    session = get_session(session_id)
    images = session.get("generated_images", [])

    if not images:
        raise HTTPException(status_code=400, detail="没有生成的图片")

    valid_images = []
    for img in images:
        if img and img.get("image_path") and os.path.exists(img["image_path"]):
            try:
                pil_img = Image.open(img["image_path"])
                if pil_img.mode == 'RGBA':
                    pil_img = pil_img.convert('RGB')
                elif pil_img.mode != 'RGB':
                    pil_img = pil_img.convert('RGB')
                valid_images.append(pil_img)
            except Exception as e:
                print(f"无法读取图片 {img['image_path']}: {e}")

    if not valid_images:
        raise HTTPException(status_code=400, detail="没有有效的图片可生成PDF")

    pdf_path = OUTPUT_DIR / f"{session_id}_PPT.pdf"
    first_image = valid_images[0]
    if len(valid_images) > 1:
        first_image.save(pdf_path, "PDF", save_all=True, append_images=valid_images[1:], resolution=150.0)
    else:
        first_image.save(pdf_path, "PDF", resolution=150.0)

    return FileResponse(pdf_path, media_type="application/pdf", filename=f"PPT_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf")


@app.get("/api/image/{filename}")
async def get_image(filename: str):
    """获取单张图片"""
    exact_path = OUTPUT_DIR / filename
    if exact_path.exists():
        return FileResponse(exact_path, media_type="image/png")

    for file_path in OUTPUT_DIR.glob("*"):
        if filename in file_path.name:
            return FileResponse(file_path, media_type="image/png")

    raise HTTPException(status_code=404, detail="图片不存在")


# ============ 对话接口（统一入口）============

@app.post("/api/chat")
async def chat(request: UserInputRequest):
    """统一的对话接口，根据当前阶段自动处理"""
    session = get_session(request.session_id)
    stage = session["stage"]

    add_message(request.session_id, "user", request.content)

    if stage == SessionStage.INPUT:
        return await generate_outline(request)

    elif stage in [SessionStage.OUTLINE, SessionStage.OUTLINE_REFINE]:
        refine_req = RefineRequest(session_id=request.session_id, feedback=request.content)
        result = await refine_outline(refine_req)
        if result.get("confirmed"):
            return await generate_style(request)
        return result

    elif stage in [SessionStage.STYLE, SessionStage.STYLE_REFINE]:
        refine_req = RefineRequest(session_id=request.session_id, feedback=request.content)
        result = await refine_style(refine_req)
        if result.get("confirmed"):
            gen_req = GenerateAllImagesRequest(session_id=request.session_id)
            return await generate_all_images(gen_req)
        return result

    elif stage == SessionStage.GENERATE:
        add_message(request.session_id, "assistant", "正在生成图片中，请稍候...")
        return {"success": True, "message": "正在生成图片中"}

    elif stage == SessionStage.COMPLETE:
        if "修改第" in request.content:
            match = re.search(r'修改第\s*(\d+)\s*页', request.content)
            if match:
                page_num = int(match.group(1))
                add_message(request.session_id, "assistant", f"请告诉我您希望如何修改第{page_num}页的设计。")
                return {"success": True, "message": f"请描述第{page_num}页的修改要求", "editing_page": page_num}

        add_message(request.session_id, "assistant", "您的PPT已生成完成。\n- 如需修改某页，请说'修改第X页'\n- 如需下载，请点击'下载PPT'按钮")
        return {"success": True, "message": "PPT已完成，可以下载或修改"}

    return {"success": False, "message": "未知状态"}


# ============ 访问计数器 ============

@app.get("/api/visit/count")
async def get_visit():
    """获取访问次数"""
    count = await get_visit_count()
    return {"count": count}


@app.post("/api/visit/increment")
async def increment_visit():
    """增加访问次数"""
    new_count = await increment_visit_count()
    return {"count": new_count}


# ============ 静态文件服务（放在所有API路由之后）============

def setup_static_files():
    """设置前端静态文件服务"""
    if FRONTEND_BUILD_DIR.exists():
        print(f"📁 检测到前端构建目录: {FRONTEND_BUILD_DIR}")

        static_dir = FRONTEND_BUILD_DIR / "static"
        if static_dir.exists():
            app.mount("/static", StaticFiles(directory=static_dir), name="static")
            print("✅ 已挂载 /static 静态资源")

        @app.get("/{full_path:path}")
        async def serve_frontend(full_path: str):
            """服务前端页面"""
            file_path = FRONTEND_BUILD_DIR / full_path
            if file_path.exists() and file_path.is_file():
                return FileResponse(file_path)
            return FileResponse(FRONTEND_BUILD_DIR / "index.html")

        print("✅ 已配置前端SPA路由")
    else:
        print(f"⚠️  前端构建目录不存在: {FRONTEND_BUILD_DIR}")
        print("   请先构建前端: cd frontend && npm run build")


setup_static_files()

# ============ 启动服务 ============

if __name__ == "__main__":
    import uvicorn

    print("=" * 60)
    print("🎯 PPT智能生成器 - 后端服务")
    print("=" * 60)
    print(f"API文档: http://localhost:8001/docs")
    print(f"健康检查: http://localhost:8001/")
    print("=" * 60)

    uvicorn.run(app, host="0.0.0.0", port=8001)
