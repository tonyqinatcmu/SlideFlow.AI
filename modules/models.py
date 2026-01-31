"""
数据模型模块 - Pydantic模型定义
"""

from typing import Optional
from pydantic import BaseModel


class LoginRequest(BaseModel):
    invite_code: str


class UserInputRequest(BaseModel):
    session_id: str
    content: str
    page_count: Optional[int] = None  # 页数限制
    page_instructions: Optional[str] = None  # 逐页说明
    design_principles: Optional[str] = None  # 用户自定义设计原则
    template_settings: Optional[dict] = None  # 模板设置（配色、字体等）


class RefineRequest(BaseModel):
    session_id: str
    feedback: str


class GenerateImageRequest(BaseModel):
    session_id: str
    page_index: int


class GenerateAllImagesRequest(BaseModel):
    session_id: str


class BaseRequest(BaseModel):
    session_id: str


class RefinePageRequest(BaseModel):
    session_id: str
    page_index: int
    feedback: str


class OutlineUpdateRequest(BaseModel):
    """大纲直接更新请求（用于前端编辑后同步）"""
    session_id: str
    outline_json: list
