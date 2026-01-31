"""
Gemini API模块 - 封装所有Gemini API调用
"""

import os
import io
import json
import base64
import time
import asyncio
import requests
from pathlib import Path
from typing import Optional, List
from PIL import Image

from .config import GEMINI_API_BASE, GEMINI_API_KEY, MAX_RETRIES, RETRY_DELAY


# ============ 工具函数 ============

def get_image_base64(image_path: str) -> str:
    """将图片转换为base64编码"""
    with open(image_path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
    return encoded_string


def get_image_mime_type(image_path: str) -> str:
    """获取图片的MIME类型"""
    ext = Path(image_path).suffix.lower()
    mime_types = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
    }
    return mime_types.get(ext, 'image/png')


def parse_json_from_text(text: str) -> Optional[dict]:
    """从文本中解析JSON"""
    try:
        json_start = text.find('```json')
        if json_start != -1:
            json_start = text.find('\n', json_start) + 1
            json_end = text.find('```', json_start)
            if json_end != -1:
                json_str = text[json_start:json_end].strip()
                return json.loads(json_str)

        json_start = text.find('{')
        json_end = text.rfind('}') + 1
        if json_start != -1 and json_end > json_start:
            json_str = text[json_start:json_end]
            return json.loads(json_str)

    except json.JSONDecodeError as e:
        print(f"JSON解析错误: {e}")

    return None


# ============ 文本生成 ============

def _generate_text_sync(prompt: str, thinking_level: str = "high") -> tuple[str, str]:
    """
    同步版本的文本生成（内部函数，会在线程池中执行）
    
    返回: (生成的文本, 重试信息提示)
    """
    url = f"{GEMINI_API_BASE}/gemini-3-pro-preview:generateContent"

    payload = {
        "model": "gemini-3-pro-preview",
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "thinkingConfig": {
                "thinkingLevel": thinking_level
            }
        }
    }

    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
    }

    retry_info = ""
    last_error = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            print(f"[文本生成] 第{attempt}次尝试...")
            response = requests.post(url, json=payload, headers=headers, timeout=120)
            print(f"文本生成 Status Code: {response.status_code}")

            if response.status_code == 200:
                result = response.json()
                # 解析响应,提取文本
                if "candidates" in result and len(result["candidates"]) > 0:
                    candidate = result["candidates"][0]
                    if "content" in candidate and "parts" in candidate["content"]:
                        for part in candidate["content"]["parts"]:
                            if "text" in part:
                                if attempt > 1:
                                    retry_info = f"⚠️ 接口不稳定，已在第{attempt}次重试后成功"
                                return part["text"], retry_info
                print(f"响应格式异常: {result}")
                last_error = "响应格式异常"
            else:
                print(f"文本生成失败: {response.text}")
                last_error = f"API返回错误: {response.status_code}"

        except requests.exceptions.Timeout:
            last_error = "请求超时"
            print(f"[文本生成] 第{attempt}次尝试超时")
        except requests.exceptions.ConnectionError:
            last_error = "网络连接错误"
            print(f"[文本生成] 第{attempt}次尝试连接错误")
        except Exception as e:
            last_error = str(e)
            print(f"[文本生成] 第{attempt}次尝试错误: {e}")

        # 如果不是最后一次尝试，等待后重试
        if attempt < MAX_RETRIES:
            print(f"[文本生成] 等待{RETRY_DELAY}秒后重试...")
            time.sleep(RETRY_DELAY)

    # 所有重试都失败
    retry_info = f"❌ 接口调用失败（已重试{MAX_RETRIES}次）: {last_error}"
    return "", retry_info


async def generate_text(prompt: str, thinking_level: str = "high") -> tuple[str, str]:
    """
    异步版本的文本生成（使用线程池避免阻塞事件循环）
    
    返回: (生成的文本, 重试信息提示)
    """
    # 在线程池中执行同步的HTTP请求，避免阻塞事件循环
    return await asyncio.to_thread(_generate_text_sync, prompt, thinking_level)


# ============ 图片生成 ============

def _generate_ppt_image_sync(prompt: str, output_path: Path, reference_image_path: Optional[str] = None, custom_logo_path: Optional[str] = None, reference_type: str = "reference", template_analysis: Optional[dict] = None, page_materials: Optional[List[dict]] = None) -> tuple[bool, str]:
    """
    同步版本的PPT图片生成（内部函数，会在线程池中执行）
    
    参数:
        page_materials: 页面素材列表 [{type, path, filename, description}, ...]
    
    返回: (是否成功, 重试信息提示)
    """
    # Logo图片路径 - 只有用户上传了自定义logo才处理
    LOGO_PATH = None
    if custom_logo_path and os.path.exists(custom_logo_path):
        LOGO_PATH = Path(custom_logo_path)
        print(f"使用自定义Logo: {LOGO_PATH}")
    else:
        print("未上传Logo，跳过Logo处理")
    
    url = f"{GEMINI_API_BASE}/gemini-3-pro-image-preview:generateContent"

    retry_info = ""
    last_error = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            print(f"[图片生成] 第{attempt}次尝试...")

            # 检查有哪些图片
            has_logo = LOGO_PATH is not None and LOGO_PATH.exists()
            has_reference = reference_image_path and os.path.exists(reference_image_path)

            # 构建完整的prompt，包含所有图片说明
            full_prompt = prompt

            if has_logo:
                full_prompt += """

【请注意】附件的图片中包含用户上传的公司logo，请将该logo放在生成的图片的右上角，保持logo的清晰和完整。"""

            if has_reference:
                if reference_type == "template":
                    # 母版模式：严格遵循
                    full_prompt += """

【最高优先级 - PPT母版设计规范】
附件中包含用户上传的PPT母版图片，这是必须严格遵循的设计模板。
生成的PPT页面必须完全按照母版的视觉风格，忽略其他任何配色或字体设置。"""
                    
                    # 如果有分析结果，添加具体参数
                    if template_analysis:
                        colors = template_analysis.get("colors", {})
                        fonts = template_analysis.get("fonts", {})
                        layout = template_analysis.get("layout", {})
                        background = template_analysis.get("background", {})
                        style_summary = template_analysis.get("style_summary", "")
                        
                        full_prompt += f"""

【母版分析结果 - 必须严格执行】

■ 配色方案（必须使用这些精确色值）：
  - 背景色: {colors.get('background', '按母版')}
  - 主色调（大标题）: {colors.get('primary', '按母版')}
  - 辅助色（次级标题）: {colors.get('secondary', '按母版')}
  - 点缀色（高亮元素）: {colors.get('accent', '按母版')}
  - 主要文字色: {colors.get('text_primary', '按母版')}
  - 次要文字色: {colors.get('text_secondary', '按母版')}

■ 字体规范：
  - 标题: {fonts.get('title_style', '粗体')}，约{fonts.get('title_size', '48pt')}
  - 正文: {fonts.get('body_style', '常规')}，约{fonts.get('body_size', '14pt')}

■ 布局结构：
  - 标题位置: {layout.get('title_position', '按母版')}
  - 内容区域: {layout.get('content_area', '按母版')}
  - 有顶部栏: {'是' if layout.get('has_header') else '否'}
  - 有底部栏: {'是' if layout.get('has_footer') else '否'}

■ 背景设计：
  - 背景类型: {background.get('type', '按母版')}
  - 背景描述: {background.get('description', '按母版')}
  - 装饰元素: {background.get('decoration_description', '无') if background.get('has_decorations') else '无'}

■ 整体风格: {style_summary}

请严格按照以上规范生成，确保生成的图片看起来像是同一套PPT模板的不同页面。

【特别强调】如果母版中存在背景图片、背景图案或装饰性元素，请务必在生成时保留并复刻这些背景设计，确保每一页都有与母版一致的背景效果。"""
                    else:
                        full_prompt += """

请仔细观察母版图片中的：
1. 精确的配色方案（背景色、标题色、正文色、强调色的具体色值）
2. 字体风格和大小比例
3. 标题和内容的布局位置
4. 背景设计（纯色/渐变/图片/装饰元素）
5. 整体视觉风格和专业感

生成的图片必须在视觉上与母版保持高度一致，像是同一套模板的不同页面。

【特别强调】如果母版中存在背景图片、背景图案或装饰性元素，请务必在生成时保留并复刻这些背景设计，确保每一页都有与母版一致的背景效果。"""
                elif reference_type == "refine":
                    # 微调模式：基于当前已生成的图片进行微调
                    full_prompt += """

【微调模式 - 最高优先级】
附件中包含当前已生成的PPT页面图片，这是微调的基准。
请严格遵循以下原则：

⚠️ 核心要求：
1. 保持当前图片的整体布局结构不变
2. 保持当前图片的配色方案不变
3. 保持当前图片的字体风格不变
4. 仅根据用户的具体修改意见进行局部调整
5. 用户没有明确要求修改的部分，必须保持原样

请基于参考图片，仅做用户要求的微调，确保生成的图片与原图在视觉上保持高度一致性。"""
                else:
                    # 普通参考模式
                    full_prompt += """

【同时】附件中包含一张参考图，该参考图是用户上传的，生成结果图的时候，请尽量参考这个参考图的配色、字体和风格等。"""

            # 构建parts列表
            parts = [{"text": full_prompt}]

            # 添加logo图片（仅当用户上传了自定义logo时）
            if has_logo:
                logo_base64 = get_image_base64(str(LOGO_PATH))
                logo_mime = get_image_mime_type(str(LOGO_PATH))
                parts.append({
                    "inline_data": {
                        "mime_type": logo_mime,
                        "data": logo_base64
                    }
                })
                print(f"已加载logo图片: {LOGO_PATH}")

            # 添加额外的参考图
            if has_reference:
                ref_base64 = get_image_base64(reference_image_path)
                ref_mime = get_image_mime_type(reference_image_path)
                parts.append({
                    "inline_data": {
                        "mime_type": ref_mime,
                        "data": ref_base64
                    }
                })
                print(f"已加载参考图: {reference_image_path}, 类型: {reference_type}")

            # 新增：添加页面素材
            if page_materials:
                images_added = 0
                image_descriptions = []
                table_texts = []
                
                for i, material in enumerate(page_materials):
                    material_type = material.get("type", "image")
                    material_desc = material.get("description", "")
                    
                    if material_type == "image":
                        # 图片素材：添加到inline_data
                        material_path = material.get("path")
                        if material_path and os.path.exists(material_path):
                            try:
                                material_base64 = get_image_base64(material_path)
                                material_mime = get_image_mime_type(material_path)
                                parts.append({
                                    "inline_data": {
                                        "mime_type": material_mime,
                                        "data": material_base64
                                    }
                                })
                                images_added += 1
                                # 收集图片描述
                                if material_desc:
                                    image_descriptions.append(f"图片{images_added}: {material_desc}")
                                print(f"已加载图片素材 {i+1}: {material.get('filename')} - {material_desc or '无描述'}")
                            except Exception as e:
                                print(f"加载图片素材失败 {material.get('filename')}: {e}")
                    
                    elif material_type in ["table", "table_text"]:
                        # 表格素材：添加到prompt文本
                        table_text = material.get("table_text", "")
                        if table_text:
                            table_header = f"【表格: {material.get('filename')}】"
                            if material_desc:
                                table_header += f"\n说明: {material_desc}"
                            table_texts.append(f"{table_header}\n{table_text}")
                            print(f"已加载表格素材 {i+1}: {material.get('filename')} - {material_desc or '无描述'}")
                
                # 构建素材说明
                material_prompts = []
                
                if images_added > 0:
                    image_desc_text = ""
                    if image_descriptions:
                        image_desc_text = "\n用户对图片的说明：\n" + "\n".join(image_descriptions)
                    material_prompts.append(f"""
【用户上传的图片素材 - 最高优先级】
附件中包含用户上传的 {images_added} 个图片素材（可能是图表、截图等）。{image_desc_text}
请务必：
1. 将这些图片素材直接复制/嵌入到生成的PPT页面中
2. 保持素材的原始内容、比例和清晰度
3. 不要对图片素材进行总结、重新绘制或简化
4. 图片素材应该作为该页面的核心内容元素，合理安排布局
5. 根据用户的说明来理解图片的用途和含义""")
                
                if table_texts:
                    # 合并表格文本，限制总长度
                    combined_table_text = chr(10).join(table_texts)
                    if len(combined_table_text) > 3000:
                        combined_table_text = combined_table_text[:3000] + "\n...(表格数据过长，已截取前3000字)"
                    
                    material_prompts.append(f"""
【用户上传的表格数据 - 最高优先级】
以下是用户指定要在此页显示的表格数据，请务必：
1. 将表格数据完整、准确地呈现在PPT页面中
2. 可以将表格数据转换为美观的表格图形、图表或数据可视化
3. 保持数据的准确性，不要修改或省略数据
4. 根据表格内容和用户说明选择合适的可视化方式（表格、柱状图、饼图、折线图等）

{combined_table_text}""")
                
                if material_prompts:
                    full_prompt += "\n".join(material_prompts)
                    # 更新parts中的prompt
                    parts[0] = {"text": full_prompt}

            print(f"最终prompt长度: {len(full_prompt)}, 附件数量: {len(parts) - 1}, 母版模式: {reference_type == 'template'}")

            # 构建请求payload
            payload = {
                "model": "gemini-3-pro-image-preview",
                "contents": [
                    {
                        "parts": parts
                    }
                ],
                "generationConfig": {
                    "responseModalities": ["TEXT", "IMAGE"],
                    "imageConfig": {
                        "aspectRatio": "16:9",
                        "imageSize": "4K"
                    }
                }
            }

            headers = {
                "Content-Type": "application/json",
                "x-goog-api-key": GEMINI_API_KEY
            }

            # 发送请求
            response = requests.post(url, json=payload, headers=headers, timeout=180)
            print(f"图片生成 Status Code: {response.status_code}")

            if response.status_code == 200:
                result = response.json()

                # 解析响应，提取图片
                if "candidates" in result and len(result["candidates"]) > 0:
                    candidate = result["candidates"][0]
                    if "content" in candidate and "parts" in candidate["content"]:
                        for part in candidate["content"]["parts"]:
                            # 处理图片响应
                            if "inlineData" in part:
                                image_data = part["inlineData"]["data"]
                                # 解码base64并保存图片
                                image_bytes = base64.b64decode(image_data)
                                
                                # 压缩图片以加快前端加载速度
                                try:
                                    img = Image.open(io.BytesIO(image_bytes))
                                    # 转换为RGB（如果是RGBA）
                                    if img.mode == 'RGBA':
                                        # 创建白色背景
                                        background = Image.new('RGB', img.size, (255, 255, 255))
                                        background.paste(img, mask=img.split()[3])
                                        img = background
                                    elif img.mode != 'RGB':
                                        img = img.convert('RGB')
                                    
                                    # 保存为JPEG格式，质量85%，文件大小约500KB-1MB
                                    output_path_jpg = str(output_path).replace('.png', '.jpg')
                                    img.save(output_path_jpg, 'JPEG', quality=85, optimize=True)
                                    print(f"图片已压缩保存: {output_path_jpg} (原始PNG -> JPEG)")
                                    
                                    # 更新输出路径为jpg
                                    if attempt > 1:
                                        retry_info = f"⚠️ 接口不稳定，已在第{attempt}次重试后成功"
                                    return True, retry_info
                                except Exception as compress_err:
                                    print(f"图片压缩失败，使用原始格式: {compress_err}")
                                    # 压缩失败则保存原始PNG
                                    with open(output_path, "wb") as f:
                                        f.write(image_bytes)
                                    print(f"图片已保存: {output_path}")
                                    if attempt > 1:
                                        retry_info = f"⚠️ 接口不稳定，已在第{attempt}次重试后成功"
                                    return True, retry_info

                print(f"响应中未找到图片")
                last_error = "响应中未找到图片"
            else:
                print(f"图片生成失败: {response.status_code}")
                last_error = f"API返回错误: {response.status_code}"

        except requests.exceptions.Timeout:
            last_error = "请求超时"
            print(f"[图片生成] 第{attempt}次尝试超时")
        except requests.exceptions.ConnectionError:
            last_error = "网络连接错误"
            print(f"[图片生成] 第{attempt}次尝试连接错误")
        except Exception as e:
            last_error = str(e)
            print(f"[图片生成] 第{attempt}次尝试错误: {e}")
            import traceback
            traceback.print_exc()

        # 如果不是最后一次尝试，等待后重试
        if attempt < MAX_RETRIES:
            print(f"[图片生成] 等待{RETRY_DELAY}秒后重试...")
            time.sleep(RETRY_DELAY)

    # 所有重试都失败
    retry_info = f"❌ 图片生成失败（已重试{MAX_RETRIES}次）: {last_error}"
    return False, retry_info


async def generate_ppt_image(prompt: str, output_path: Path, reference_image_path: Optional[str] = None, custom_logo_path: Optional[str] = None, reference_type: str = "reference", template_analysis: Optional[dict] = None, page_materials: Optional[List[dict]] = None) -> tuple[bool, str]:
    """
    异步版本的PPT图片生成（使用线程池避免阻塞事件循环）
    
    参数:
        page_materials: 页面素材列表 [{type, path, filename, description}, ...]
    
    返回: (是否成功, 重试信息提示)
    """
    # 在线程池中执行同步的HTTP请求，避免阻塞事件循环
    return await asyncio.to_thread(
        _generate_ppt_image_sync, 
        prompt, 
        output_path, 
        reference_image_path, 
        custom_logo_path, 
        reference_type, 
        template_analysis,
        page_materials
    )


# ============ 母版分析 ============

def analyze_template_design(image_path: str) -> dict:
    """
    使用 AI 分析母版图片，提取设计规范
    返回：包含配色、字体、布局等参数的字典
    """
    print(f"[母版分析] 开始分析: {image_path}")
    
    try:
        # 获取图片数据
        image_base64 = get_image_base64(image_path)
        image_mime = get_image_mime_type(image_path)
        
        # 优化后的 Prompt：去掉了 JSON 内部的干扰描述，改为外部说明
        analysis_prompt = """你是一个专业的 PPT 设计分析师。
请直接输出 JSON 数据，禁止包含任何开场白、思考过程、Markdown 标签或总结。

必须返回的 JSON 结构如下：
{
    "colors": {
        "background": "#FFFFFF",
        "primary": "#000000",
        "secondary": "#000000", 
        "accent": "#000000",
        "text_primary": "#000000",
        "text_secondary": "#000000"
    },
    "fonts": {
        "title_style": "字体风格描述",
        "title_size": "字号估计",
        "body_style": "正文字体风格描述",
        "body_size": "正文字号估计"
    },
    "layout": {
        "title_position": "标题位置描述",
        "content_area": "内容区域描述",
        "has_header": true,
        "has_footer": true,
        "has_sidebar": false
    },
    "background": {
        "type": "纯色/渐变/图片/图案",
        "description": "详细描述",
        "has_decorations": true,
        "decoration_description": "装饰描述"
    },
    "style_summary": "整体风格总结"
}

要求：
1. 颜色必须是有效的 6 位十六进制 (#RRGGBB)。
2. 必须使用中文回答。
3. 严格遵循 JSON 格式。"""

        url = f"{GEMINI_API_BASE}/gemini-3-pro-preview:generateContent"
        
        payload = {
            "model": "gemini-3-pro-preview",
            "contents": [{
                "parts": [
                    {"text": analysis_prompt},
                    {
                        "inline_data": {
                            "mime_type": image_mime,
                            "data": image_base64
                        }
                    }
                ]
            }],
            # 关键配置：强制开启 JSON 输出模式
            "generationConfig": {
                "response_mime_type": "application/json"
            }
        }
        
        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": GEMINI_API_KEY
        }
        
        response = requests.post(url, json=payload, headers=headers, timeout=3600)
        
        if response.status_code == 200:
            result = response.json()
            # 提取文本内容 - 注意：parts[1]才是实际响应，parts[0]可能是thinking
            raw_text = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[1].get("text", "")
            
            # --- 健壮的解析逻辑 ---
            # 1. 尝试直接解析
            try:
                analysis = json.loads(raw_text)
            except json.JSONDecodeError:
                # 2. 如果解析失败，尝试正则提取内容（防止 AI 返回了 Markdown 标签或碎碎念）
                import re
                json_match = re.search(r'\{[\s\S]*\}', raw_text)
                if json_match:
                    clean_content = json_match.group()
                    # 移除可能存在的 JSON 内部注释（常见报错原因）
                    clean_content = re.sub(r'//.*', '', clean_content) 
                    analysis = json.loads(clean_content)
                else:
                    raise ValueError("无法在响应中找到有效的 JSON 结构")

            print(f"[母版分析] 分析成功: {analysis.get('style_summary', '无总结')}")
            return analysis
        
        else:
            print(f"[母版分析] API 调用失败: {response.status_code}, {response.text}")
            return None
            
    except Exception as e:
        print(f"[母版分析] 发生异常: {str(e)}")
        return None
