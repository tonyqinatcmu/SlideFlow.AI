"""
会话管理模块 - 会话状态和消息管理
"""

from typing import Dict
from datetime import datetime

from .prompts import DEFAULT_DESIGN_PRINCIPLES


# ============ 会话状态枚举 ============

class SessionStage:
    INPUT = "input"              # 用户输入想法
    OUTLINE = "outline"          # 生成大纲
    OUTLINE_REFINE = "outline_refine"  # 大纲迭代
    STYLE = "style"              # 生成设计风格
    STYLE_REFINE = "style_refine"      # 风格迭代
    GENERATE = "generate"        # 生成图片
    COMPLETE = "complete"        # 完成


# ============ 会话存储 ============

sessions: Dict[str, dict] = {}


def get_session(session_id: str) -> dict:
    """获取或创建会话"""
    if session_id not in sessions:
        sessions[session_id] = {
            "stage": SessionStage.INPUT,
            "user_input": "",
            "outline_text": "",
            "outline_json": [],
            "style_text": "",
            "style_json": [],
            "generated_images": [],
            "reference_image_path": None,
            "messages": [],
            # 用户设置
            "page_count": None,  # 页数限制
            "page_instructions": "",  # 逐页说明
            "design_principles": DEFAULT_DESIGN_PRINCIPLES,  # 设计原则
            # 录音转写内容
            "audio_transcript": "",  # 录音转写文本
            # 支持性文档内容
            "support_docs_text": "",  # 抽取的文档文本
            "support_docs_files": [],  # 上传的文档列表 [{filename, path, text_length}]
            # 页面素材
            "page_materials": {},  # {page_index_str: [{type, path, filename, description}, ...]}
        }
    return sessions[session_id]


def add_message(session_id: str, role: str, content: str):
    """添加消息到会话"""
    session = get_session(session_id)
    session["messages"].append({
        "role": role,
        "content": content,
        "timestamp": datetime.now().isoformat()
    })
