"""
SlideFlow 模块包

包含以下模块：
- config: 配置常量
- prompts: 提示词模板
- models: Pydantic数据模型
- asr: 科大讯飞ASR语音转写
- invite_codes: 邀请码管理
- session: 会话管理
- gemini_api: Gemini API调用
- visit_counter: 访问计数
- doc_extract: 文档文本抽取
"""

from .config import *
from .prompts import *
from .models import *
from .asr import XfyunASR, parse_xfyun_result, format_dialogue_as_text
from .invite_codes import (
    load_invite_codes, 
    save_invite_codes, 
    verify_invite_code, 
    record_login, 
    get_login_records_from_csv
)
from .session import SessionStage, sessions, get_session, add_message
from .gemini_api import (
    get_image_base64,
    get_image_mime_type,
    parse_json_from_text,
    generate_text,
    generate_ppt_image,
    analyze_template_design
)
from .visit_counter import get_visit_count, increment_visit_count
from .doc_extract import (
    extract_text_from_document,
    extract_table_from_file
)
