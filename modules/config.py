"""
配置模块 - 存放所有配置常量
"""

import os
from pathlib import Path

# 加载 .env 文件
from dotenv import load_dotenv
load_dotenv()

# ============ API配置 ============

# Gemini API 配置
GEMINI_API_BASE = os.environ.get("GEMINI_API_BASE", "https://generativelanguage.googleapis.com/v1beta/models")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")  # 必需：用户进行提供

# 科大讯飞ASR配置（可选：用于语音转写功能）
XFYUN_APPID = os.environ.get("IFLYTEK_APP_ID", "")
XFYUN_SECRET_KEY = os.environ.get("IFLYTEK_API_SECRET", "")
LFASR_HOST = 'https://raasr.xfyun.cn/v2/api'

# ============ 文件路径配置 ============

# 邀请码文件路径
INVITE_CODES_FILE = Path("./invite_codes.json")

# 登录记录目录
RECORDS_DIR = Path("./records")
RECORDS_DIR.mkdir(exist_ok=True)

# 登录记录CSV文件
LOGIN_RECORDS_FILE = RECORDS_DIR / "login_records.csv"

# 输出目录
OUTPUT_DIR = Path("./outputs")
OUTPUT_DIR.mkdir(exist_ok=True)

# 参考图目录
REFERENCE_DIR = Path("./references")
REFERENCE_DIR.mkdir(exist_ok=True)

# 录音文件目录
AUDIO_DIR = Path("./audio")
AUDIO_DIR.mkdir(exist_ok=True)

# 素材文件目录（页面素材）
MATERIALS_DIR = Path("./materials")
MATERIALS_DIR.mkdir(exist_ok=True)

# 支持性文档目录
SUPPORT_DOCS_DIR = Path("./support_docs")
SUPPORT_DOCS_DIR.mkdir(exist_ok=True)

# 前端构建目录
FRONTEND_BUILD_DIR = Path("./frontend/build")

# 访问计数文件
VISIT_COUNT_FILE = RECORDS_DIR / "visit_count.txt"

# ============ 默认配色方案 ============

COLORS = {
    "blue": "#1C2662",      # 蓝色 - 大标题、背景色块、强调边框
    "gold": "#DAA050",      # 金色 - 关键数据、次级标题、图表高亮
    "red": "#BC2424",       # 红色 - 警示风险、特别强调点
    "gray": "#666464",      # 灰色 - 正文文字、图表坐标轴
    "light_gray": "#F5F5F5",
    "white": "#FFFFFF",
}

# ============ 重试配置 ============

MAX_RETRIES = 3
RETRY_DELAY = 5  # 秒
