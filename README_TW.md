<div align="center">

<img src="docs/images/logo.png" alt="SlideBot AI Logo" width="600"/>

# SlideBot AI 2.0

### 智慧簡報生成平台

**輸入主題、大綱或素材，AI 幫你生成專業演示文稿**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com)

[English](./README_EN.md) | **繁體中文** | [简体中文](./README.md)

---

### 🚀 線上體驗

我們已部署線上體驗版本，歡迎試用！

🔗 **體驗地址：[http://223.6.255.214/](http://223.6.255.214/) 【中國大陸】**
🔗 **體驗地址：[http://47.77.231.44/](http://47.77.231.44/) 【海外】**

📮 需要內測邀請碼？請聯繫作者獲取！

</div>

---

## ✨ 2.0 新增功能

🆕 **📄 支援上傳參考文件** - 專案報告、數據分析、會議紀要等，AI會自動擷取要點輔助生成

🆕 **📊 支援插入圖表素材** - 上傳Excel表格或截圖，AI直接嵌入對應頁面

🆕 **💬 素材描述功能** - 為每個素材添加說明，AI理解更精準

---

## 🔄 2025年1月30日更新

🗜️ **圖片壓縮優化** - 生成的PPT圖片自動壓縮為JPEG格式（品質85%），檔案體積減少60%以上，前端載入更快

---

## 🔄 2025年1月29日更新

🎉 **生成完成提示** - PPT生成完成後彈出提示視窗，快速下載ZIP/PDF或進入微調模式

⏳ **上傳載入優化** - 素材上傳過程中顯示載入動畫，上傳完成前禁止關閉彈窗，避免誤操作

🔄 **重新生成動畫** - 單頁重新生成時顯示遮罩動畫，清晰展示當前狀態

📁 **檔案格式驗證** - 母版和Logo上傳增加格式校驗，僅支援PNG/JPG/WebP/GIF，不支援EMF/SVG等向量格式

💡 **格式提示優化** - 上傳區域顯示明確的格式說明，避免使用者上傳不支援的檔案類型

---

## 🔄 2025年1月28日更新

📝 **每頁主旨設定** - 選擇具體頁數後，可為每一頁單獨設定主旨/主題，AI生成更精準的大綱

✏️ **大綱預覽編輯** - 大綱生成後右側預覽區可直接編輯標題和內容，點擊「應用編輯」同步到大綱

🎯 **圖片微調模式** - 圖片生成後點擊頁面進入微調模式，僅修改指定部分，其他元素保持不變

🔢 **頁碼顯示控制** - 進階設定→版面設定中可選擇隱藏頁碼

---

## ✨ 專案亮點

🚀 **一鍵生成** - 輸入主題或想法，AI 自動生成完整 PPT，從大綱到設計一氣呵成

🎙️ **語音轉寫** - 支援上傳會議錄音，AI 自動轉寫並整理成結構化簡報

📄 **文件理解** - 上傳PDF/Word/PPT/Excel文件，AI自動擷取關鍵資訊

📊 **素材嵌入** - 為指定頁面上傳圖表、截圖、數據表格，AI直接嵌入PPT

🎨 **多種風格** - 內建商務簡約、酷炫技術等預設風格，支援完全自訂

🖼️ **AI 繪圖** - 基於 Google Gemini 圖像生成模型，為每頁生成專業級配圖

📝 **即時協作** - 互動式修改大綱和設計，AI 理解你的回饋並即時調整

🎯 **精準控制** - 自訂配色、字型、頁數、Logo，滿足企業 VI 需求

---

## 📸 效果展示

### 功能介紹動畫

<div align="center">
<video src="https://github.com/user-attachments/assets/30d55221-8774-4ba9-9e70-0516a729d158" controls width="100%"></video>
</div>

### 登入介面

<div align="center">
<img src="docs/images/login.png" alt="SlideBot AI 登入介面" width="800"/>

*簡潔優雅的登入介面，支援邀請碼驗證*
</div>

### 工作台

<div align="center">
<img src="docs/images/workbench.png" alt="SlideBot AI 工作台" width="800"/>

*功能豐富的工作台：選擇風格、調整內容豐富度、上傳錄音轉寫*
</div>

### 生成過程

<div align="center">
<img src="docs/images/generating.png" alt="PPT生成過程" width="800"/>

*即時顯示生成進度，支援逐頁預覽和修改*
</div>

### 設計成果展示

<div align="center">

| 研究流程圖 | 背景分析 |
|:---:|:---:|
| <img src="docs/images/result-1.png" width="400"/> | <img src="docs/images/result-2.png" width="400"/> |

| 架構圖 | 業務分析 |
|:---:|:---:|
| <img src="docs/images/result-3.png" width="400"/> | <img src="docs/images/result-4.png" width="400"/> |

*AI 生成的專業級 PPT 頁面，支援多種風格和佈局*
</div>

### 📊 表格資料嵌入效果

<div align="center">
<img src="docs/images/result-table.png" alt="表格資料嵌入效果" width="800"/>

*支援上傳Excel表格資料，AI自動理解並嵌入PPT頁面，生成專業的資料展示*
</div>

---

## 🎬 完整工作流程

<div align="center">

### 從想法到 PPT 的完整旅程

</div>

```
┌─────────────────────────────────────────────────────────────────┐
│  Step 1: 📝 輸入你的想法                                        │
│  ─────────────────────────────────────────────────────────────  │
│  "幫我做一個關於2026年AI發展趨勢的PPT，                          │
│   面向投資人，需要數據支撐，10頁左右"                            │
│                                                                  │
│  💡 可上傳會議錄音，AI 自動轉寫整理                              │
│  📄 可上傳參考文件（PDF/Word/PPT/Excel），AI 自動擷取要點        │
└─────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 2: 🎨 選擇風格 & 配置參數                                  │
│  ─────────────────────────────────────────────────────────────  │
│  • 風格預設：商務簡約 / 酷炫技術 / 自訂                          │
│  • 內容豐富度：內容豐富 / 簡約風格 / 跟隨整體                    │
│  • 頁數控制：自動判斷 或 指定 1-20 頁                            │
│  • 進階設定：配色方案 / 字型 / Logo / 母版                       │
└─────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 3: 📋 AI 生成大綱（可修改）                                │
│  ─────────────────────────────────────────────────────────────  │
│  第1頁：封面 - 2026 AI趨勢展望                                   │
│  第2頁：市場規模 - 萬億級賽道                                    │
│  第3頁：技術突破 - 多模態與Agent                                 │
│  ...                                                             │
│                                                                  │
│  ✏️ 不滿意？告訴 AI 你的修改意見，即時調整                       │
│  📊 可為指定頁面上傳圖表素材（圖片/Excel/貼上的表格片段），生成時自動嵌入       │
└─────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 4: 🎯 AI 生成設計方案（可修改）                            │
│  ─────────────────────────────────────────────────────────────  │
│  為每一頁生成詳細的設計理念和視覺方案：                          │
│  • 頁面佈局結構                                                  │
│  • 配色運用說明                                                  │
│  • 圖表/圖形建議                                                 │
│                                                                  │
│  ✏️ 不滿意？繼續對話調整，直到滿意為止                           │
└─────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 5: 🖼️ AI 逐頁生成 PPT 圖片                                │
│  ─────────────────────────────────────────────────────────────  │
│  🎨 正在生成第 3/10 頁...                                        │
│  ████████████████░░░░░░░░░░░░ 50%                               │
│                                                                  │
│  📊 上傳的素材會自動嵌入對應頁面                                 │
│  ✏️ 單頁不滿意？點擊縮圖，輸入修改意見重新生成                   │
└─────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 6: 📥 下載成品                                             │
│  ─────────────────────────────────────────────────────────────  │
│  • ZIP 打包下載（所有圖片）                                      │
│  • PDF 一鍵匯出                                                  │
│  • 使用 WPS【PDF轉PPT】工具進一步編輯                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ 技術架構

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  React 18 + 響應式設計 + 深色/淺色主題                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Backend                               │
│  FastAPI + Python 3.10+ + 異步架構                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AI Services                             │
│  Google Gemini (文本生成 + 圖片生成)                         │
│  科大訊飛 iFlytek (語音轉寫)                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 快速開始

### 環境需求

- Python 3.10+
- Node.js 18+
- Google Gemini API Key

### 安裝步驟

```bash
# 1. 複製專案
git clone https://github.com/tonyqinatcmu/SlideBot.AI.git
cd SlideBot.AI

# 2. 安裝後端依賴
pip install -r requirements.txt

# 3. 設定環境變數
cp .env.example .env
# 編輯 .env 檔案，填入你的 API Key

# 4. 安裝前端依賴並建構
cd frontend
npm install
npm run build
cd ..

# 5. 啟動服務
python server.py
```

造訪 `http://localhost:8001` 開始使用！  
預設邀請碼為「VISITOR」，可以修改 invite_codes.json 檔案。  

---

## ⚙️ 設定說明

在 `.env` 檔案中設定以下參數：

```env
# Google Gemini API (必需)
GEMINI_API_KEY=your_gemini_api_key

# 科大訊飛語音轉寫 (選用，用於錄音轉寫功能)
IFLYTEK_APP_ID=your_iflytek_app_id
IFLYTEK_API_SECRET=your_iflytek_api_secret

# 服務設定
PORT=8001
HOST=0.0.0.0
```

### API 金鑰取得

| 服務 | 用途 | 取得地址 |
|------|------|----------|
| Google Gemini | 文本/圖像生成 | [Google AI Studio](https://makersuite.google.com/app/apikey) |
| 科大訊飛 | 語音轉寫（選用） | [訊飛開放平台](https://www.xfyun.cn/) |

---

## 📁 專案結構

```
slidebot/
├── server.py              # 後端主程式（FastAPI路由）
├── requirements.txt       # Python 依賴
├── .env.example           # 環境變數範例
├── .gitignore             # Git 忽略設定
├── LICENSE                # MIT 開源協議
├── invite_codes.json      # 邀請碼設定
│
├── modules/               # 後端模組（模組化架構）
│   ├── __init__.py       # 模組導出
│   ├── config.py         # 設定常數（API金鑰、路徑等）
│   ├── prompts.py        # AI提示詞模板
│   ├── models.py         # Pydantic資料模型
│   ├── asr.py            # 科大訊飛語音轉寫
│   ├── invite_codes.py   # 邀請碼管理
│   ├── session.py        # 會話狀態管理
│   ├── gemini_api.py     # Gemini API調用封裝
│   └── visit_counter.py  # 訪問計數器
│
├── frontend/              # React 前端
│   ├── src/
│   │   ├── App.js        # 主元件（包含所有UI邏輯）
│   │   └── index.js      # 入口檔案
│   ├── public/
│   │   ├── index.html
│   │   └── wps-tip.png   # WPS 提示圖
│   └── package.json
│
├── docs/                  # 文件資源
│   └── images/           # README 截圖
│
├── outputs/               # 生成的圖片輸出（自動建立）
├── references/            # 上傳的參考檔案（自動建立）
├── audio/                 # 錄音檔案（自動建立）
└── records/               # 使用記錄（自動建立）
```

---

## 🎨 功能特性

### 核心功能

| 功能 | 描述 |
|------|------|
| 🤖 智慧大綱 | 根據輸入自動生成結構化PPT大綱，支援即時修改 |
| 🎨 風格設計 | AI為每頁生成詳細的設計方案和視覺理念 |
| 🖼️ 圖片生成 | 使用Gemini生成專業級配圖，支援2K/4K解析度 |
| 📝 即時迭代 | 對話式互動，隨時調整內容和設計 |
| 📥 多格式匯出 | 支援ZIP打包和PDF一鍵匯出 |

### 進階功能

| 功能 | 描述 |
|------|------|
| 🎙️ 錄音轉寫 | 上傳會議錄音，AI自動轉寫並整理成PPT |
| 🏢 母版支援 | 上傳企業母版圖片，保持VI一致性 |
| 🎯 自訂配色 | 靈活設定主色、輔助色、強調色 |
| 📝 自訂字型 | 中英文字型分別設定 |
| 📊 內容豐富度 | 數據豐富/簡約風格自由切換 |
| 🌙 深色模式 | 支援深色/淺色主題切換 |

### 🚧 開發計畫 (TODO)

- [x] 智慧大綱生成與迭代修改
- [x] AI 設計風格生成
- [x] Gemini 圖片逐頁生成
- [x] 錄音轉寫整理成 PPT
- [x] 自訂配色、字型、Logo
- [x] ZIP / PDF 多格式匯出
- [x] 素材上傳 - 支援用戶上傳 PDF、Word、PPT、Excel、圖片等素材，AI 自動擷取整理
- [ ] **演講稿生成** - 除 PPT 外，為用戶生成配套的演講稿 / 講稿
- [ ] **風格持久化** - 儲存用戶的個人化風格偏好，下次使用自動載入

---

## 🔧 開發指南

### 本地開發

```bash
# 後端開發（熱重載）
uvicorn server:app --reload --port 8001

# 前端開發
cd frontend
npm start
```

### 生產部署

推薦使用以下方式部署：

```bash
# 生產環境部署
uvicorn server:app --host 0.0.0.0 --port 8001

# 或使用 Docker（可自行編寫 Dockerfile）
```

配合 Nginx 反向代理和 Systemd 服務管理可實現更穩定的生產環境部署。

---

## 🤝 貢獻指南

我們歡迎所有形式的貢獻！

1. Fork 本專案
2. 建立你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟一個 Pull Request

---

## 📄 開源協議

本專案採用 [MIT License](LICENSE) 開源協議。

---

### 開源專案

- [Google Gemini](https://deepmind.google/technologies/gemini/) - 多模態AI模型
- [科大訊飛](https://www.xfyun.cn/) - 語音轉寫服務
- [FastAPI](https://fastapi.tiangolo.com/) - 現代高效能Python Web框架
- [React](https://reactjs.org/) - 使用者介面建構函式庫

---

## ⭐ Star 歷史

如果這個專案對你有幫助，請給我們一個 Star ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=tonyqinatcmu/SlideBot.AI&type=Date)](https://star-history.com/#tonyqinatcmu/SlideBot.AI&Date)

---

## 👨‍💻 聯絡作者

<div align="center">

### Shenlin (Tony) Qin

| 📧 郵箱 | 💬 微信 | 🔗 LinkedIn |
|:---:|:---:|:---:|
| [tonyqinatcmu@gmail.com](mailto:tonyqinatcmu@gmail.com) | <img src="docs/images/wechat-qr.jpg" width="150"/> | [![LinkedIn](https://img.shields.io/badge/LinkedIn-Shenlin%20Qin-blue?style=flat&logo=linkedin)](https://hk.linkedin.com/in/shenlinqin) |

---

### Jie Tang

| 📧 郵箱 | 💬 微信 | 🔗 LinkedIn |
|:---:|:---:|:---:|
| [jobtj@sina.com](mailto:jobtj@sina.com) | <img src="docs/images/wechat-jie-tang.jpg" width="150"/> | [![LinkedIn](https://img.shields.io/badge/LinkedIn-Jie%20Tang-blue?style=flat&logo=linkedin)](https://www.linkedin.com/in/jay-tang-a0773352) |

---

歡迎交流探討 AI、產品設計、創業等話題！

</div>

---

<div align="center">

**用 ❤️ 打造 | Made with ❤️**

[回報Bug](https://github.com/tonyqinatcmu/SlideBot.AI/issues) · [功能建議](https://github.com/tonyqinatcmu/SlideBot.AI/issues) · [討論區](https://github.com/tonyqinatcmu/SlideBot.AI/discussions)

</div>
