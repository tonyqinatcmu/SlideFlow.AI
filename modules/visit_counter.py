"""
访问计数模块 - 网站访问统计
"""

import asyncio

from .config import VISIT_COUNT_FILE


def _get_visit_count_sync():
    """同步获取当前访问次数（内部函数）"""
    if VISIT_COUNT_FILE.exists():
        try:
            return int(VISIT_COUNT_FILE.read_text().strip())
        except:
            return 218
    return 218


def _increment_visit_count_sync():
    """同步增加访问次数并返回新值（内部函数）"""
    count = _get_visit_count_sync() + 1
    VISIT_COUNT_FILE.write_text(str(count))
    return count


async def get_visit_count():
    """异步获取访问次数"""
    count = await asyncio.to_thread(_get_visit_count_sync)
    return count


async def increment_visit_count():
    """异步增加访问次数"""
    new_count = await asyncio.to_thread(_increment_visit_count_sync)
    return new_count
