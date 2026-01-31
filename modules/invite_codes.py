"""
邀请码管理模块 - 邀请码验证和登录记录
"""

import json
import csv
import time
from datetime import datetime

from .config import INVITE_CODES_FILE, LOGIN_RECORDS_FILE


def load_invite_codes():
    """加载邀请码数据"""
    if INVITE_CODES_FILE.exists():
        with open(INVITE_CODES_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"codes": [], "login_records": []}


def save_invite_codes(data):
    """保存邀请码数据"""
    with open(INVITE_CODES_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def verify_invite_code(code: str) -> bool:
    """验证邀请码是否有效"""
    data = load_invite_codes()
    return code.upper() in [c.upper() for c in data.get("codes", [])]


def init_login_csv():
    """初始化登录记录CSV文件（如果不存在）"""
    if not LOGIN_RECORDS_FILE.exists():
        with open(LOGIN_RECORDS_FILE, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['序号', '邀请码', '登录日期', '登录时间', '时间戳'])
        print(f"[初始化] 创建登录记录文件: {LOGIN_RECORDS_FILE}")


def get_next_record_id():
    """获取下一个记录序号"""
    if not LOGIN_RECORDS_FILE.exists():
        return 1

    with open(LOGIN_RECORDS_FILE, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        rows = list(reader)
        if len(rows) <= 1:  # 只有表头或空文件
            return 1
        return len(rows)  # 序号 = 行数（不含表头）


def record_login(code: str):
    """记录登录信息到CSV文件"""
    # 确保CSV文件存在
    init_login_csv()

    now = datetime.now()
    record_id = get_next_record_id()

    login_record = {
        "id": record_id,
        "invite_code": code.upper(),
        "login_date": now.strftime("%Y-%m-%d"),
        "login_time": now.strftime("%H:%M:%S"),
        "timestamp": int(time.time())
    }

    # 写入CSV文件
    with open(LOGIN_RECORDS_FILE, 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([
            login_record["id"],
            login_record["invite_code"],
            login_record["login_date"],
            login_record["login_time"],
            login_record["timestamp"]
        ])

    # 同时保存到JSON（保持向后兼容）
    data = load_invite_codes()
    data["login_records"].append({
        "invite_code": login_record["invite_code"],
        "login_time": now.isoformat(),
        "timestamp": login_record["timestamp"]
    })
    save_invite_codes(data)

    print(f"[登录记录] #{record_id} 邀请码: {code}, 日期: {login_record['login_date']}, 时间: {login_record['login_time']}")


def get_login_records_from_csv():
    """从CSV文件读取登录记录"""
    if not LOGIN_RECORDS_FILE.exists():
        return []

    records = []
    with open(LOGIN_RECORDS_FILE, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            records.append(row)
    return records
