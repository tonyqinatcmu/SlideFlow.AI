"""
提示词模板模块 - 存放所有AI提示词模板
"""

# ============ 大纲生成提示词模板 ============

OUTLINE_PROMPT_TEMPLATE = """请根据用户输入的PPT整体的思路，梳理出每一页的核心要点。这些要点会在后续被使用制作ppt。

{page_constraint}

{page_instructions}

用户的想法：
{user_input}

【示例结果格式】

第1页：核心策略总览
页面标题：2026年核心策略：防风险 + 多交易
核心要点：
关键词一：防风险
	核心目标：防范尾部风险。
	应对措施：系统性迭代风控系统（从单纯的收益拆解转向风险监控）。
关键词二：多交易
	核心目标：获取绝对收益。
	应对措施：开发系统化的交易信号与策略。

第2页：为什么要防风险？（背景与逻辑）
页面标题：市场环境研判：尾部风险隐现
核心要点（罗列三大原因）：
宏观叙事存疑：当前主流宏观趋势拥挤，存在被证伪的可能性。
资产估值高位：各类资产前期持续上涨，价格处于高位。
相关性上升：跨资产相关性显著增强（低相关资产变同向波动），加大了分散配置的难度。
结论：需为各类资产波动率的同时放大做好准备。

请按照上述格式输出每一页的大纲。同时请输出JSON格式便于程序解析：

```json
{{
    "pages": [
        {{
            "page": 1,
            "theme": "页面主题",
            "title": "页面标题",
            "content": "核心要点内容（可以是多行文本）"
        }}
    ]
}}
```
"""

# ============ 默认设计原则 ============

DEFAULT_DESIGN_PRINCIPLES = """- 整体风格：商务简约风，金融商务，背景要白色
- 文案优先，去除不必要的英文装饰，尽量使用中文
- 去除过于复杂的图形（例如天平等），尽量用类似于SmartArt或简单的框图/列表，但是信息还是要丰富
- 颜色不要用太多红色，除了警示风险外
- 注意不要用大色块
- 背景是白底"""

# ============ 大纲修改提示词 ============

REFINE_OUTLINE_PROMPT = """用户对当前的PPT大纲有修改意见，请根据用户反馈进行调整。

【当前大纲】
{current_outline}

【用户反馈】
{user_feedback}

请输出修改后的完整大纲，保持之前的格式。同时输出JSON：

```json
{{
    "pages": [
        {{
            "page": 1,
            "theme": "页面主题",
            "title": "页面标题", 
            "content": "核心要点内容"
        }}
    ]
}}
```
"""

# ============ 设计风格生成提示词 ============
# 【修复3】将固定的页码位置改为占位符 {page_number_instruction}

STYLE_GENERATION_PROMPT = """请帮我根据如下的PPT大纲，为每一页生成详细的设计方案和绘图提示词。

【配色方案规范】
{color_scheme_spec}

【字体规范】
{font_scheme_spec}

【设计原则】
{design_principles}

【PPT大纲】
{outline}

请为每一页生成：
1. 设计理念说明
2. 详细的图片生成提示词（Prompt），用于Gemini图片生成API

【请注意】页面左上角需要有这一页的标题。{page_number_instruction}

输出JSON格式：
```json
{{
    "pages": [
        {{
            "page": 1,
            "theme": "页面主题",
            "design_concept": "设计理念说明",
            "prompt": "详细的图片生成提示词，包含所有视觉元素、颜色、布局、文字内容等"
        }}
    ]
}}
```

【部分prompt示例】请参考！！！

【参考提示词1】: "提示词： > PPT幻灯片设计，专业商务风格。背景为纯白色，标题文字为"2026年核心策略总览" 18pt，主色调（{example_primary}） 。 核心视觉元素是一个扁平化风格的天平图形。天平支点为主色调（{example_primary}）。天平左侧： 稍沉，装饰有强调色（{example_accent}）轮廓的盾牌图标，配文字"防风险 (Risk Prevention)"及"关键词: 稳健底仓、回撤控制"，下方有一个强调色的向下加粗箭头。天平右侧： 稍高，装饰有辅助色（{example_secondary}）的硬币堆叠和上升趋势箭头图标，配文字"多交易 (More Trading)"及"关键词: 增厚收益、灵活应对"，下方有一个辅助色的向上加粗箭头。整体风格整洁、数字化，信息层级清晰。"

【参考提示词2】: "提示词： PPT幻灯片设计，专业商务风格。背景为纯白色，标题为"白盒固收+"， 文字标题为18pt，主色调（{example_primary}）。 视觉中心是一个大型的倒金字塔（漏斗型）结构，由上至下分为三个水平色块区域：顶层（最宽）： 主色调（{example_primary}）色块，白色文字。中层： 辅助色（{example_secondary}）色块，白色文字。底层（最窄）： 文字色（{example_gray}）色块，白色文字。整体排版层次分明，高端企业VI色调，画面整洁。"
 

"""

# ============ 默认配色方案描述 ============

DEFAULT_COLOR_SCHEME_SPEC = """• 主色调 (Primary):
  - 蓝色 (Blue): #1C2662 —— 用于大标题、背景色块、强调边框
  - 金色 (Gold): #DAA050 —— 用于关键数据、次级标题、图表高亮
  - 红色 (Red): #BC2424 —— 用于警示风险、特别强调点
• 辅助色 (Secondary):
  - 灰色 (Gray): #666464 —— 用于正文文字、图表坐标轴"""

# ============ 默认字体方案描述 ============

DEFAULT_FONT_SCHEME_SPEC = """• 中文：微软雅黑 (Microsoft YaHei)
• 英文/数字：Arial
• 字号建议：大标题 48pt，页标题 18pt，正文 12-16pt，图片中的文字标题18pt，正文12-16pt。"""

# ============ 风格修改提示词 ============

REFINE_STYLE_PROMPT = """用户对当前的设计方案有修改意见，请根据用户反馈进行调整。

【当前设计方案】
{current_style}

【用户反馈】
{user_feedback}

请输出修改后的完整设计方案，保持JSON格式：
```json
{{
    "pages": [
        {{
            "page": 1,
            "theme": "页面主题",
            "design_concept": "设计理念说明",
            "prompt": "修改后的图片生成提示词"
        }}
    ]
}}
```
"""

# ============ 单页修改Prompt模板 ============

REFINE_PAGE_PROMPT = """用户对PPT的第{page_num}页有微调意见，请根据用户反馈对这一页进行**微调**。

【重要原则】
⚠️ 这是微调模式，不是重新设计！请务必：
1. 保持当前页面的整体布局、配色、字体风格不变
2. 仅针对用户提到的具体问题进行修改
3. 用户没有提到的内容保持原样
4. 尽量保持与原设计的视觉一致性

【当前页面信息】
页码：第{page_num}页
主题：{theme}
当前设计理念：{design_concept}
当前绘图Prompt：{current_prompt}

【用户微调意见】
{user_feedback}

请根据用户的微调意见，输出修改后的设计方案。只修改用户提到的部分，其他保持不变。格式如下：

```json
{{
    "page": {page_num},
    "theme": "页面主题（保持不变或根据用户要求调整）",
    "design_concept": "微调后的设计理念说明（说明修改了哪些部分）",
    "prompt": "微调后的详细图片生成提示词（保持原有风格，仅修改用户提到的部分）"
}}
```
"""


# ============ 辅助函数 ============

def build_color_scheme_spec(color_scheme: dict) -> str:
    """根据配色方案构建描述文本"""
    if not color_scheme:
        return DEFAULT_COLOR_SCHEME_SPEC
    
    name = color_scheme.get('name', '自定义配色')
    primary = color_scheme.get('primary', '#1C2662')
    secondary = color_scheme.get('secondary', '#DAA050')
    accent = color_scheme.get('accent', '#BC2424')
    gray = color_scheme.get('gray', '#666464')
    
    return f"""• 配色方案名称: {name}
• 主色调 (Primary): {primary} —— 用于大标题、背景色块、强调边框
• 辅助色 (Secondary): {secondary} —— 用于关键数据、次级标题、图表高亮
• 强调色 (Accent): {accent} —— 用于警示、特别强调点
• 文字色 (Gray): {gray} —— 用于正文文字、图表坐标轴

【重要】请严格使用上述配色，不要使用其他颜色！"""


def build_font_scheme_spec(font_scheme: dict) -> str:
    """根据字体方案构建描述文本"""
    if not font_scheme:
        return DEFAULT_FONT_SCHEME_SPEC
    
    name = font_scheme.get('name', '自定义字体')
    title = font_scheme.get('title', '微软雅黑')
    body = font_scheme.get('body', '微软雅黑')
    eng = font_scheme.get('eng', 'Arial')
    sizes = font_scheme.get('sizes', {})
    
    main_title_size = sizes.get('mainTitle', 48)
    page_title_size = sizes.get('pageTitle', 18)
    body_size = sizes.get('body', 14)
    
    return f"""• 字体方案名称: {name}
• 中文标题字体: {title}
• 中文正文字体: {body}
• 英文/数字字体: {eng}
• 字号建议：大标题 {main_title_size}pt，页标题 {page_title_size}pt，正文 {body_size}pt

【重要】请严格使用上述字体设置！"""
