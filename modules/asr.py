"""
科大讯飞ASR模块 - 语音转写功能
"""

import os
import json
import base64
import hashlib
import hmac
import time
import urllib
import requests
from typing import Optional, List

from .config import XFYUN_APPID, XFYUN_SECRET_KEY, LFASR_HOST


class XfyunASR:
    """科大讯飞非实时语音转写API"""

    def __init__(self, appid: str, secret_key: str, upload_file_path: str):
        self.appid = appid
        self.secret_key = secret_key
        self.upload_file_path = upload_file_path
        self.ts = str(int(time.time()))
        self.signa = self._get_signa()

    def _get_signa(self) -> str:
        """生成签名"""
        m2 = hashlib.md5()
        m2.update((self.appid + self.ts).encode('utf-8'))
        md5 = m2.hexdigest()
        md5 = bytes(md5, encoding='utf-8')
        signa = hmac.new(self.secret_key.encode('utf-8'), md5, hashlib.sha1).digest()
        signa = base64.b64encode(signa)
        return str(signa, 'utf-8')

    def upload(self, num_speaker: Optional[int] = None) -> dict:
        """上传音频文件"""
        print("上传音频文件...")
        file_len = os.path.getsize(self.upload_file_path)
        file_name = os.path.basename(self.upload_file_path)

        param_dict = {
            'appId': self.appid,
            'signa': self.signa,
            'ts': self.ts,
            'fileSize': file_len,
            'fileName': file_name,
            'duration': '200',
            'roleType': 1,  # 开启角色分离
            'pd': 'finance',  # 金融领域
        }

        # 如果用户指定了说话人数，则传入
        if num_speaker is not None:
            param_dict['roleNum'] = num_speaker

        print(f"上传参数: {param_dict}")

        data = open(self.upload_file_path, 'rb').read(file_len)
        response = requests.post(
            url=LFASR_HOST + '/upload?' + urllib.parse.urlencode(param_dict),
            headers={"Content-type": "application/json"},
            data=data
        )
        result = json.loads(response.text)
        print(f"上传响应: {result}")
        return result

    def get_result(self, num_speaker: Optional[int] = None) -> dict:
        """获取转写结果"""
        upload_resp = self.upload(num_speaker)

        if upload_resp.get('code') != '000000':
            return upload_resp

        order_id = upload_resp['content']['orderId']

        param_dict = {
            'appId': self.appid,
            'signa': self.signa,
            'ts': self.ts,
            'orderId': order_id,
            'resultType': 'transfer,predict',
        }

        print("查询转写结果...")
        status = 3
        result = None

        # 轮询等待结果
        while status == 3:
            response = requests.post(
                url=LFASR_HOST + '/getResult?' + urllib.parse.urlencode(param_dict),
                headers={"Content-type": "application/json"}
            )
            result = json.loads(response.text)
            status = result.get('content', {}).get('orderInfo', {}).get('status', 0)
            print(f"状态: {status}")

            if status == 4:
                break
            time.sleep(5)

        return result


def parse_xfyun_result(response_data: dict) -> List[dict]:
    """
    解析科大讯飞非实时语音转写结果
    :param response_data: API返回的完整字典对象
    :return: 解析后的对话列表 [{"speaker": "说话人1", "text": "内容"}, ...]
    """
    if response_data.get('code') != '000000':
        print(f"API错误: {response_data.get('descInfo')}")
        return []

    content = response_data.get('content', {})
    order_result_str = content.get('orderResult')

    if not order_result_str:
        print("转写结果为空")
        return []

    try:
        order_result = json.loads(order_result_str)
    except json.JSONDecodeError:
        print("orderResult解析失败")
        return []

    # 优先使用 lattice
    lattices = order_result.get('lattice') or order_result.get('lattice2', [])

    dialogue_list = []

    for item in lattices:
        json_1best_str = item.get('json_1best', '{}')
        try:
            json_1best = json.loads(json_1best_str)
        except json.JSONDecodeError:
            continue

        st = json_1best.get('st', {})
        speaker_id = st.get('rl', '0')

        # 拼接文字
        segment_text = ""
        rt_list = st.get('rt', [])
        for rt in rt_list:
            ws_list = rt.get('ws', [])
            for ws in ws_list:
                cw_list = ws.get('cw', [])
                for cw in cw_list:
                    word = cw.get('w', '')
                    segment_text += word

        dialogue_list.append({
            "speaker": f"说话人{speaker_id}",
            "text": segment_text,
            "bg": st.get('bg')
        })

    # 按时间排序
    dialogue_list.sort(key=lambda x: int(x['bg']) if x['bg'] else 0)

    return dialogue_list


def format_dialogue_as_text(dialogue_list: List[dict]) -> str:
    """将对话列表格式化为文本"""
    lines = []
    for item in dialogue_list:
        lines.append(f"{item['speaker']}: {item['text']}")
    return "\n".join(lines)
