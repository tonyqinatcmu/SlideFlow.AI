import React, { useState, useRef, useEffect, useCallback, createContext, useContext } from 'react';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8004/api';

// ============ 主题系统 ============
const ThemeContext = createContext();

const themes = {
  dark: {
    name: 'dark',
    bg: '#030712',
    bgSecondary: '#0a0f1a',
    bgTertiary: '#111827',
    bgCard: 'rgba(17, 24, 39, 0.95)',
    bgInput: 'rgba(17, 24, 39, 0.8)',
    border: 'rgba(59, 130, 246, 0.2)',
    borderLight: 'rgba(59, 130, 246, 0.1)',
    text: '#f0f9ff',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    primary: '#3b82f6',
    primaryLight: 'rgba(59, 130, 246, 0.15)',
    secondary: '#8b5cf6',
    accent: '#06b6d4',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)',
    shadow: '0 4px 24px rgba(0, 0, 0, 0.5)',
    shadowLg: '0 25px 50px rgba(0, 0, 0, 0.6)',
    shadowGlow: '0 0 30px rgba(59, 130, 246, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.8)',
  },
  light: {
    name: 'light',
    bg: '#f8fafc',
    bgSecondary: '#ffffff',
    bgTertiary: '#f1f5f9',
    bgCard: 'rgba(255, 255, 255, 0.98)',
    bgInput: 'rgba(241, 245, 249, 0.8)',
    border: 'rgba(148, 163, 184, 0.3)',
    borderLight: 'rgba(148, 163, 184, 0.15)',
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    primary: '#2563eb',
    primaryLight: 'rgba(37, 99, 235, 0.1)',
    secondary: '#7c3aed',
    accent: '#0891b2',
    success: '#059669',
    error: '#dc2626',
    warning: '#d97706',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #0891b2 100%)',
    shadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
    shadowLg: '0 25px 50px rgba(0, 0, 0, 0.15)',
    shadowGlow: '0 0 30px rgba(37, 99, 235, 0.15)',
    overlay: 'rgba(0, 0, 0, 0.5)',
  }
};

const useTheme = () => useContext(ThemeContext);

// ============ Logo组件 ============
const Logo = ({ size = 60 }) => {
  const theme = useTheme();
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <defs>
        <linearGradient id="logoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={theme.primary} />
          <stop offset="100%" stopColor={theme.accent} />
        </linearGradient>
        <linearGradient id="logoGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={theme.secondary} />
          <stop offset="100%" stopColor={theme.primary} />
        </linearGradient>
      </defs>
      <path d="M60 12 C35 12 20 28 18 45 C16 55 18 65 25 73 C28 77 30 82 30 88 L30 95 C30 98 32 100 35 100 L50 100" stroke="url(#logoGrad1)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M60 12 C85 12 100 28 102 45 C104 55 102 65 95 73 C92 77 90 82 90 88 L90 95 C90 98 88 100 85 100 L70 100" stroke="url(#logoGrad2)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M60 15 L60 55" stroke="url(#logoGrad1)" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="30" cy="32" r="3" fill={theme.primary}/><circle cx="42" cy="45" r="2.5" fill={theme.primary}/>
      <circle cx="28" cy="58" r="3" fill={theme.secondary}/><circle cx="45" cy="70" r="2.5" fill={theme.secondary}/>
      <circle cx="90" cy="32" r="3" fill={theme.primary}/><circle cx="78" cy="45" r="2.5" fill={theme.secondary}/>
      <circle cx="92" cy="58" r="3" fill={theme.secondary}/><circle cx="75" cy="70" r="2.5" fill={theme.accent}/>
      <rect x="70" y="75" width="35" height="40" rx="4" fill={theme.bgSecondary} stroke="url(#logoGrad2)" strokeWidth="2"/>
      <rect x="76" y="83" width="18" height="2" rx="1" fill={theme.secondary}/>
      <rect x="76" y="89" width="22" height="2" rx="1" fill={theme.accent}/>
      <rect x="76" y="95" width="15" height="2" rx="1" fill={theme.accent}/>
      <path d="M65 110 L72 85" stroke={theme.accent} strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="65" cy="112" r="3" fill={theme.accent}/>
    </svg>
  );
};

// ============ 常量配置 ============
const STAGES = { INPUT: 'input', OUTLINE: 'outline', OUTLINE_REFINE: 'outline_refine', STYLE: 'style', STYLE_REFINE: 'style_refine', GENERATE: 'generate', COMPLETE: 'complete' };

const COLOR_SCHEMES = {
  ceibs: { name: '蓝金经典', colors: ['#1C2662', '#DAA050', '#BC2424', '#666464'], primary: '#1C2662', secondary: '#DAA050', accent: '#BC2424', gray: '#666464' },
  tech: { name: '科技蓝', colors: ['#0066CC', '#003366', '#66B2FF'], primary: '#0066CC', secondary: '#003366', accent: '#66B2FF' },
  elegant: { name: '沉稳灰蓝', colors: ['#2C3E50', '#5D6D7E', '#85929E'], primary: '#2C3E50', secondary: '#5D6D7E', accent: '#85929E' },
  nature: { name: '自然绿意', colors: ['#1E5631', '#3D8B4F', '#78B58E'], primary: '#1E5631', secondary: '#3D8B4F', accent: '#78B58E' },
  ocean: { name: '海洋蓝', colors: ['#0A4D68', '#088395', '#05BFDB'], primary: '#0A4D68', secondary: '#088395', accent: '#05BFDB' },
  purple: { name: '优雅紫', colors: ['#4A148C', '#7B1FA2', '#AB47BC'], primary: '#4A148C', secondary: '#7B1FA2', accent: '#AB47BC' },
};

const FONT_SCHEMES = {
  default: { name: '雅黑 + Arial', title: 'Microsoft YaHei', body: 'Microsoft YaHei', eng: 'Arial', sizes: { mainTitle: 48, pageTitle: 18, body: 14, caption: 12 } },
  elegant: { name: '黑体 + 宋体', title: 'SimHei', body: 'SimSun', eng: 'Times New Roman', sizes: { mainTitle: 48, pageTitle: 18, body: 14, caption: 12 } },
  modern: { name: '思源黑体', title: 'Source Han Sans CN', body: 'Source Han Sans CN', eng: 'Arial', sizes: { mainTitle: 48, pageTitle: 18, body: 14, caption: 12 } },
};

// ============ 风格预设提示词 ============
const DEFAULT_STYLE_PROMPTS = {
  business: `【商务简约风】
- 整体风格：商务简约风，金融商务，背景要白色
- 文案优先，去除不必要的英文装饰，尽量使用中文
- 去除过于复杂的图形，尽量用类似于SmartArt或简单的框图/列表，但是信息还是要丰富
- 颜色不要用太多红色，除了警示风险外
- 注意不要用大色块
- 背景是白底`,

  tech: `【酷炫技术风】
- 整体风格：内容翔实，体现技术风格，背景要白色
- 文案优先，去除不必要的英文装饰，尽量使用中文
- 颜色不要用太多红色，除了警示风险外
- 注意不要用大色块
- 图文表并茂`,

  custom: `【自定义风格】
基于商务简约风进行修改：
- 整体风格：商务简约风，金融商务，背景要白色
- 文案优先，去除不必要的英文装饰，尽量使用中文
- 去除过于复杂的图形，尽量用类似于SmartArt或简单的框图/列表，但是信息还是要丰富
- 颜色不要用太多红色，除了警示风险外
- 注意不要用大色块
- 背景是白底

【请在此添加您的修改要求】`
};

const STYLE_PRESETS = {
  business: { name: '商务简约', icon: '💼', colorScheme: 'ceibs', fontScheme: 'default', description: '金融商务风格，白底简洁，SmartArt框图', tags: ['白底', '简洁', '文案优先'], principles: DEFAULT_STYLE_PROMPTS.business },
  tech: { name: '酷炫技术', icon: '🚀', colorScheme: 'tech', fontScheme: 'modern', description: '技术风格，内容翔实，图文表并茂', tags: ['白底', '技术风', '图表丰富'], principles: DEFAULT_STYLE_PROMPTS.tech },
  custom: { name: '自定义风格', icon: '🎨', colorScheme: 'ceibs', fontScheme: 'default', description: '基于商务简约风修改', tags: ['自由定制'], principles: DEFAULT_STYLE_PROMPTS.custom },
};

const QUALITY_OPTIONS = {
  fast: { name: '快速呈现', desc: '2K分辨率，生成速度快', icon: '⚡', thinking_level: 'medium', imageSize: '2k' },
  high: { name: '高清质量', desc: '4K分辨率，画质更清晰', icon: '✨', thinking_level: 'medium', imageSize: '4k' },
};

// 内容丰富度选项
const CONTENT_RICHNESS_OPTIONS = {
  rich: { name: '内容丰富', icon: '📊', prompt: '数据驱动，内容翔实，突出重点，尽量用数据说话，图文并茂' },
  simple: { name: '简约风格', icon: '✨', prompt: '商务现代简约风，结构清晰，剔除冗余修饰，利用图形化替代长文本，尽量将描述性的文本转化为直观的图' },
  default: { name: '跟随整体风格', icon: '🎯', prompt: '' },
};

// ============ 打字机效果组件 ============
const TypewriterText = ({ texts, typingSpeed = 100, deleteSpeed = 50, pauseDuration = 2000 }) => {
  const [displayText, setDisplayText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const currentText = texts[textIndex];
    
    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseDuration);
      return () => clearTimeout(pauseTimer);
    }

    if (isDeleting) {
      if (displayText.length === 0) {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % texts.length);
      } else {
        const deleteTimer = setTimeout(() => {
          setDisplayText(currentText.substring(0, displayText.length - 1));
        }, deleteSpeed);
        return () => clearTimeout(deleteTimer);
      }
    } else {
      if (displayText.length === currentText.length) {
        setIsPaused(true);
      } else {
        const typeTimer = setTimeout(() => {
          setDisplayText(currentText.substring(0, displayText.length + 1));
        }, typingSpeed);
        return () => clearTimeout(typeTimer);
      }
    }
  }, [displayText, isDeleting, isPaused, textIndex, texts, typingSpeed, deleteSpeed, pauseDuration]);

  return (
    <span>
      {displayText}
      <span style={{ 
        borderRight: '3px solid currentColor', 
        marginLeft: '2px',
        animation: 'blink 1s step-end infinite'
      }} />
    </span>
  );
};

// 页数选项 1-20
const PAGE_OPTIONS = [{ value: '', label: '自动判断' }, ...Array.from({ length: 20 }, (_, i) => ({ value: i + 1, label: (i + 1) + ' 页' }))];

// 说话人选项 1-20
const SPEAKER_OPTIONS = [{ value: '', label: '自动识别' }, ...Array.from({ length: 20 }, (_, i) => ({ value: i + 1, label: (i + 1) + ' 人' }))];

const LOGO_POSITIONS = [{ value: 'top-right', label: '右上角' }, { value: 'top-left', label: '左上角' }, { value: 'bottom-right', label: '右下角' }, { value: 'bottom-left', label: '左下角' }, { value: 'none', label: '不显示' }];
const PAGE_NUMBER_POSITIONS = [{ value: 'bottom-center', label: '底部居中' }, { value: 'bottom-right', label: '右下角' }, { value: 'bottom-left', label: '左下角' }, { value: 'none', label: '不显示' }];

// ============ API ============
const api = {
  async login(inviteCode) { const res = await fetch(`${API_BASE_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ invite_code: inviteCode }) }); return res.json(); },
  async generateOutline(sessionId, content, pageCount, pageInstructions, designPrinciples, templateSettings) { const res = await fetch(`${API_BASE_URL}/outline/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: sessionId, content, page_count: pageCount || null, page_instructions: pageInstructions || null, design_principles: designPrinciples || null, template_settings: templateSettings || null }) }); return res.json(); },
  async refineOutline(sessionId, feedback) { const res = await fetch(`${API_BASE_URL}/outline/refine`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: sessionId, feedback }) }); return res.json(); },
  async updateOutline(sessionId, outlineJson) { const res = await fetch(`${API_BASE_URL}/outline/update`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: sessionId, outline_json: outlineJson }) }); return res.json(); },
  async confirmOutline(sessionId) { const res = await fetch(`${API_BASE_URL}/outline/confirm`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: sessionId }) }); return res.json(); },
  async generateStyle(sessionId) { const res = await fetch(`${API_BASE_URL}/style/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: sessionId, content: '' }) }); return res.json(); },
  async refineStyle(sessionId, feedback) { const res = await fetch(`${API_BASE_URL}/style/refine`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: sessionId, feedback }) }); return res.json(); },
  async confirmStyle(sessionId) { const res = await fetch(`${API_BASE_URL}/style/confirm`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: sessionId }) }); return res.json(); },
  async generateImage(sessionId, pageIndex) { const res = await fetch(`${API_BASE_URL}/image/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: sessionId, page_index: pageIndex }) }); return res.json(); },
  async uploadLogo(sessionId, file) { const formData = new FormData(); formData.append('file', file); const res = await fetch(`${API_BASE_URL}/logo/upload?session_id=${sessionId}`, { method: 'POST', body: formData }); return res.json(); },
  async uploadReference(sessionId, file, type) { const formData = new FormData(); formData.append('file', file); const res = await fetch(`${API_BASE_URL}/reference/upload?session_id=${sessionId}&type=${type || 'reference'}`, { method: 'POST', body: formData }); return res.json(); },
  async uploadAudio(sessionId, file, numSpeaker) { const formData = new FormData(); formData.append('session_id', sessionId); formData.append('file', file); if (numSpeaker) formData.append('num_speaker', numSpeaker); const res = await fetch(`${API_BASE_URL}/audio/upload`, { method: 'POST', body: formData }); return res.json(); },
  async refinePageAndRegenerate(sessionId, pageIndex, feedback) { const res = await fetch(`${API_BASE_URL}/page/refine-and-regenerate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: sessionId, page_index: pageIndex, feedback }) }); return res.json(); },
  async getVisitCount() { const res = await fetch(`${API_BASE_URL}/visit/count`); return res.json(); },
  async incrementVisit() { const res = await fetch(`${API_BASE_URL}/visit/increment`, { method: 'POST' }); return res.json(); },
  // 新增：支持性文档API
  async uploadSupportDoc(sessionId, file) { const formData = new FormData(); formData.append('session_id', sessionId); formData.append('file', file); const res = await fetch(`${API_BASE_URL}/support-doc/upload`, { method: 'POST', body: formData }); return res.json(); },
  async clearSupportDocs(sessionId) { const res = await fetch(`${API_BASE_URL}/support-doc/clear?session_id=${sessionId}`, { method: 'DELETE' }); return res.json(); },
  async listSupportDocs(sessionId) { const res = await fetch(`${API_BASE_URL}/support-doc/list/${sessionId}`); return res.json(); },
  // 新增：页面素材API
  async uploadPageMaterial(sessionId, pageIndex, file, description = '') { const formData = new FormData(); formData.append('session_id', sessionId); formData.append('page_index', pageIndex); formData.append('file', file); formData.append('description', description); const res = await fetch(`${API_BASE_URL}/page-material/upload`, { method: 'POST', body: formData }); return res.json(); },
  async addTableTextMaterial(sessionId, pageIndex, tableText, description = '') { const formData = new FormData(); formData.append('session_id', sessionId); formData.append('page_index', pageIndex); formData.append('table_text', tableText); formData.append('description', description); const res = await fetch(`${API_BASE_URL}/page-material/add-table-text`, { method: 'POST', body: formData }); return res.json(); },
  async removePageMaterial(sessionId, pageIndex, materialIndex) { const res = await fetch(`${API_BASE_URL}/page-material/remove?session_id=${sessionId}&page_index=${pageIndex}&material_index=${materialIndex}`, { method: 'DELETE' }); return res.json(); },
  async listPageMaterials(sessionId) { const res = await fetch(`${API_BASE_URL}/page-material/list/${sessionId}`); return res.json(); },
  getImageUrl(filename, timestamp) { return timestamp ? `${API_BASE_URL}/image/${encodeURIComponent(filename)}?t=${timestamp}` : `${API_BASE_URL}/image/${encodeURIComponent(filename)}`; },
  getDownloadUrl(sessionId) { return `${API_BASE_URL}/download/${sessionId}`; },
  getPdfDownloadUrl(sessionId) { return `${API_BASE_URL}/download/${sessionId}/pdf`; },
};

const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// ============ 全局样式 ============
const GlobalStyles = ({ theme }) => (
  <style>{`
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif; background: ${theme.bg}; color: ${theme.text}; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
    @keyframes gradientMove { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
    @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.8; } }
    @keyframes loading-bar { 0% { transform: translateX(-100%); } 50% { transform: translateX(200%); } 100% { transform: translateX(400%); } }
    *::-webkit-scrollbar { width: 6px; height: 6px; }
    *::-webkit-scrollbar-track { background: transparent; }
    *::-webkit-scrollbar-thumb { background: ${theme.bgTertiary}; border-radius: 3px; }
    *::-webkit-scrollbar-thumb:hover { background: ${theme.primary}; }
    ::selection { background: ${theme.primaryLight}; }
    input, textarea, select { outline: none; transition: all 0.3s ease; }
    input:focus, textarea:focus, select:focus { border-color: ${theme.primary} !important; box-shadow: 0 0 0 3px ${theme.primaryLight}; }
    button { transition: all 0.2s ease; cursor: pointer; }
    button:hover:not(:disabled) { transform: translateY(-2px); }
    .glass-effect { backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
  `}</style>
);

// ============ 科技感背景 ============
const TechBackground = () => {
  const theme = useTheme();
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: `linear-gradient(${theme.primary} 1px, transparent 1px), linear-gradient(90deg, ${theme.primary} 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '50%', height: '50%', background: `radial-gradient(circle, ${theme.primaryLight} 0%, transparent 60%)`, filter: 'blur(80px)' }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '50%', height: '50%', background: `radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 60%)`, filter: 'blur(80px)' }} />
    </div>
  );
};

// ============ Modal组件 ============
const Modal = ({ isOpen, onClose, title, subtitle, children, width = '600px', isLoading = false }) => {
  const theme = useTheme();
  if (!isOpen) return null;
  const handleClose = () => { if (!isLoading) onClose(); };
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease' }} onClick={handleClose}>
      <div style={{ position: 'absolute', inset: 0, background: theme.overlay, backdropFilter: 'blur(8px)' }} />
      <div className="glass-effect" style={{ position: 'relative', width, maxWidth: '95vw', maxHeight: '85vh', background: theme.bgCard, borderRadius: '24px', border: `1px solid ${theme.border}`, boxShadow: `${theme.shadowLg}, 0 0 40px ${theme.primaryLight}`, overflow: 'hidden', animation: 'slideUp 0.3s ease' }} onClick={e => e.stopPropagation()}>
        <div style={{ height: '3px', background: theme.gradient, backgroundSize: '200% 200%', animation: 'gradientMove 3s ease infinite' }} />
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: theme.text, marginBottom: subtitle ? '4px' : 0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: '12px', color: theme.textMuted }}>{subtitle}</p>}
          </div>
          <button onClick={handleClose} disabled={isLoading} style={{ width: '36px', height: '36px', background: theme.bgTertiary, border: `1px solid ${theme.border}`, borderRadius: '10px', color: isLoading ? theme.border : theme.textMuted, fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.5 : 1 }}>×</button>
        </div>
        <div style={{ padding: '24px', maxHeight: 'calc(85vh - 80px)', overflowY: 'auto' }}>{children}</div>
      </div>
    </div>
  );
};

// ============ 通用组件 ============
const ColorPreview = ({ colors, size = 20, showGlow = false }) => {
  const theme = useTheme();
  return (
    <div style={{ display: 'flex', gap: '3px' }}>
      {colors.map((c, i) => (<div key={i} style={{ width: size, height: size, borderRadius: '6px', background: c, border: `1px solid ${theme.borderLight}`, boxShadow: showGlow ? `0 0 10px ${c}40` : 'none' }} />))}
    </div>
  );
};

const Tag = ({ children, color = 'primary', size = 'sm' }) => {
  const theme = useTheme();
  const colors = { primary: { bg: theme.primaryLight, text: theme.primary }, secondary: { bg: `${theme.secondary}15`, text: theme.secondary }, accent: { bg: `${theme.accent}15`, text: theme.accent }, success: { bg: `${theme.success}15`, text: theme.success }, warning: { bg: `${theme.warning}15`, text: theme.warning } };
  const c = colors[color] || colors.primary;
  const sizes = { xs: { padding: '2px 6px', fontSize: '10px' }, sm: { padding: '4px 10px', fontSize: '11px' }, md: { padding: '6px 12px', fontSize: '12px' } };
  const s = sizes[size] || sizes.sm;
  return (<span style={{ ...s, background: c.bg, color: c.text, borderRadius: '6px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>{children}</span>);
};

const ThemeToggle = ({ isDark, onToggle }) => {
  const theme = useTheme();
  return (
    <button onClick={onToggle} style={{ width: '40px', height: '40px', borderRadius: '12px', border: `1px solid ${theme.border}`, background: theme.bgTertiary, color: theme.textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {isDark ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
    </button>
  );
};

const TabButton = ({ active, onClick, children, icon }) => {
  const theme = useTheme();
  return (<button onClick={onClick} style={{ padding: '10px 16px', background: active ? theme.primaryLight : 'transparent', border: active ? `1px solid ${theme.primary}` : `1px solid transparent`, borderRadius: '10px', color: active ? theme.primary : theme.textSecondary, fontSize: '13px', fontWeight: active ? 600 : 500, display: 'flex', alignItems: 'center', gap: '6px' }}>{icon && <span>{icon}</span>}{children}</button>);
};

// ============ 风格卡片 ============
const StyleCard = ({ preset, presetKey, isSelected, onClick, onEditPrompt }) => {
  const theme = useTheme();
  return (
    <div onClick={onClick} style={{ padding: '12px', background: isSelected ? `linear-gradient(135deg, ${theme.primaryLight}, ${theme.bgTertiary})` : theme.bgTertiary, border: isSelected ? `2px solid ${theme.primary}` : `1px solid ${theme.border}`, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden' }}>
      {isSelected && (<div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: theme.gradient }} />)}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <span style={{ fontSize: '22px' }}>{preset.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: isSelected ? theme.primary : theme.text }}>{preset.name}</div>
          <div style={{ fontSize: '11px', color: theme.textMuted, lineHeight: 1.3 }}>{preset.description}</div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onEditPrompt(); }} style={{ padding: '4px 8px', background: isSelected ? theme.primary : 'transparent', border: `1px solid ${isSelected ? theme.primary : theme.border}`, borderRadius: '6px', color: isSelected ? '#fff' : theme.textSecondary, fontSize: '10px', fontWeight: 500 }}>✏️ 编辑</button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {preset.tags.map((tag, i) => (<Tag key={i} size="xs" color={isSelected ? 'primary' : 'secondary'}>{tag}</Tag>))}
      </div>
    </div>
  );
};

// ============ 主应用组件 ============
function SlideBotApp({ onLogout, isDark, onThemeToggle }) {
  const theme = useTheme();
  const [sessionId] = useState(generateSessionId);
  const [stage, setStage] = useState(STAGES.INPUT);
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [outline, setOutline] = useState([]);
  const [styleDesign, setStyleDesign] = useState([]);
  const [pptImages, setPptImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  
  const [selectedStylePreset, setSelectedStylePreset] = useState('business');
  const [stylePrompts, setStylePrompts] = useState({ ...DEFAULT_STYLE_PROMPTS });
  const [designPrinciples, setDesignPrinciples] = useState(DEFAULT_STYLE_PROMPTS.business);
  const [pageCount, setPageCount] = useState('');
  const [pageInstructions, setPageInstructions] = useState({}); // 每页主旨: {0: '主旨1', 1: '主旨2', ...}
  const [showPageInstructions, setShowPageInstructions] = useState(false); // 是否展开每页主旨设置
  const [selectedQuality, setSelectedQuality] = useState('high');
  const [contentRichness, setContentRichness] = useState('default');  // 内容丰富度: rich, simple, default
  const [selectedColorScheme, setSelectedColorScheme] = useState('ceibs');
  const [selectedFontScheme, setSelectedFontScheme] = useState('default');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoPosition, setLogoPosition] = useState('top-right');
  const [pageNumberPosition, setPageNumberPosition] = useState('bottom-center');
  const [templateFile, setTemplateFile] = useState(null);
  
  const [audioFile, setAudioFile] = useState(null);
  const [audioFileName, setAudioFileName] = useState('');
  const [numSpeaker, setNumSpeaker] = useState('');
  const [audioTranscript, setAudioTranscript] = useState('');
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  
  // 新增：支持性文档
  const [supportDocs, setSupportDocs] = useState([]);
  const [isUploadingSupportDoc, setIsUploadingSupportDoc] = useState(false);
  const [showDocPreviewModal, setShowDocPreviewModal] = useState(false);
  const [docPreviewData, setDocPreviewData] = useState(null); // {filename, textLength, textPreview}
  
  // 新增：页面素材
  const [pageMaterials, setPageMaterials] = useState({});
  const [selectedMaterialPage, setSelectedMaterialPage] = useState(0);
  const [showMaterialUploadModal, setShowMaterialUploadModal] = useState(false);
  const [pasteTableText, setPasteTableText] = useState('');
  const [pasteTableDesc, setPasteTableDesc] = useState(''); // 粘贴表格的描述
  const [materialUploadTab, setMaterialUploadTab] = useState('image'); // 'image' | 'table' | 'paste'
  const [pendingFile, setPendingFile] = useState(null); // 待上传的文件
  const [pendingFileDesc, setPendingFileDesc] = useState(''); // 文件描述
  const [showDescModal, setShowDescModal] = useState(false); // 描述输入弹窗
  const [isUploadingPageMaterial, setIsUploadingPageMaterial] = useState(false); // 素材上传中状态
  
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showWpsTip, setShowWpsTip] = useState(false);
  const [showStyleConfirmModal, setShowStyleConfirmModal] = useState(false);
  const [showPromptEditModal, setShowPromptEditModal] = useState(false);
  const [editingPromptKey, setEditingPromptKey] = useState(null);
  const [tempEditPrompt, setTempEditPrompt] = useState('');
  const [editingPageIndex, setEditingPageIndex] = useState(null);
  const [regeneratingPageIndex, setRegeneratingPageIndex] = useState(null); // 正在重新生成的页面索引
  const [showCompleteTip, setShowCompleteTip] = useState(false); // 显示完成后的微调提示
  const [editableOutline, setEditableOutline] = useState({}); // 右侧预览编辑的大纲内容: {pageIndex: {title, content}}
  const [outlineEditTip, setOutlineEditTip] = useState(false); // 是否显示编辑提示
  const [settingsTab, setSettingsTab] = useState('color');
  
  // 自定义配色
  const [customColors, setCustomColors] = useState({
    primary: '#1C2662',    // 主色调：大标题、背景色块、强调边框
    secondary: '#DAA050',  // 辅助色：关键数据、次级标题、图表高亮
    accent: '#BC2424',     // 强调色：警示风险、特别强调点
    text: '#666464'        // 文字色：正文文字、图表坐标轴
  });
  const [useCustomColors, setUseCustomColors] = useState(false);
  
  // 自定义字体
  const [customFonts, setCustomFonts] = useState({
    chinese: 'Microsoft YaHei',
    english: 'Arial',
    mainTitleSize: 48,
    pageTitleSize: 18,
    bodySize: 14
  });
  const [useCustomFonts, setUseCustomFonts] = useState(false);
  const [templateAnalysis, setTemplateAnalysis] = useState(null);
  const [isAnalyzingTemplate, setIsAnalyzingTemplate] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const audioInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const templateInputRef = useRef(null);
  const supportDocInputRef = useRef(null);
  const pageMaterialInputRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const addMessage = useCallback((role, content) => { setMessages(prev => [...prev, { role, content, timestamp: Date.now() }]); }, []);

  const handleStylePresetChange = useCallback((key) => {
    setSelectedStylePreset(key);
    const preset = STYLE_PRESETS[key];
    setDesignPrinciples(stylePrompts[key] || preset.principles);
    setSelectedColorScheme(preset.colorScheme);
    setSelectedFontScheme(preset.fontScheme);
  }, [stylePrompts]);

  const handleOpenPromptEdit = useCallback((key) => {
    setEditingPromptKey(key);
    setTempEditPrompt(stylePrompts[key] || DEFAULT_STYLE_PROMPTS[key] || '');
    setShowPromptEditModal(true);
  }, [stylePrompts]);

  const handleSavePrompt = useCallback(() => {
    if (editingPromptKey) {
      setStylePrompts(prev => ({ ...prev, [editingPromptKey]: tempEditPrompt }));
      if (selectedStylePreset === editingPromptKey) { setDesignPrinciples(tempEditPrompt); }
    }
    setShowPromptEditModal(false);
    setEditingPromptKey(null);
  }, [editingPromptKey, tempEditPrompt, selectedStylePreset]);

  const getTemplateSettings = useCallback(() => ({
    color_scheme: useCustomColors ? {
      name: '自定义配色',
      colors: [customColors.primary, customColors.secondary, customColors.accent, customColors.text],
      primary: customColors.primary,
      secondary: customColors.secondary,
      accent: customColors.accent,
      gray: customColors.text
    } : COLOR_SCHEMES[selectedColorScheme],
    font_scheme: useCustomFonts ? {
      name: '自定义字体',
      title: customFonts.chinese,
      body: customFonts.chinese,
      eng: customFonts.english,
      sizes: {
        mainTitle: customFonts.mainTitleSize,
        pageTitle: customFonts.pageTitleSize,
        body: customFonts.bodySize,
        caption: 12
      }
    } : FONT_SCHEMES[selectedFontScheme],
    logo_position: logoPosition,
    page_number_position: pageNumberPosition,
    has_logo: !!logoFile,
    has_template: !!templateFile,
    quality: QUALITY_OPTIONS[selectedQuality],
    content_richness: CONTENT_RICHNESS_OPTIONS[contentRichness],
  }), [selectedColorScheme, selectedFontScheme, logoPosition, pageNumberPosition, logoFile, templateFile, selectedQuality, useCustomColors, customColors, useCustomFonts, customFonts, contentRichness]);

  const handleLogoSelect = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (file) { 
      setLogoFile(file); 
      setLogoPreview(URL.createObjectURL(file)); 
      try { 
        await api.uploadLogo(sessionId, file); 
      } catch (err) { 
        console.error('Logo upload error:', err); 
      } 
    }
  }, [sessionId]);

  const handleTemplateSelect = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (file) { 
      setTemplateFile(file); 
      setIsAnalyzingTemplate(true);
      setTemplateAnalysis(null);
      addMessage('assistant', '📤 母版已上传，AI 正在深度分析设计规范...\n\n🔄 分析中（约30-60秒）：配色方案、字体规范、布局结构、背景设计...');
      try { 
        const result = await api.uploadReference(sessionId, file, 'template'); 
        if (result.template_analysis) {
          setTemplateAnalysis(result.template_analysis);
          const analysis = result.template_analysis;
          const colors = analysis.colors || {};
          const fonts = analysis.fonts || {};
          const layout = analysis.layout || {};
          const background = analysis.background || {};
          
          let msg = `✅ 母版分析完成！\n\n`;
          msg += `📊 **分析结果**\n\n`;
          msg += `🎨 **配色方案**\n`;
          msg += `• 背景色: ${colors.background || '-'}\n`;
          msg += `• 主色调: ${colors.primary || '-'}\n`;
          msg += `• 辅助色: ${colors.secondary || '-'}\n`;
          msg += `• 文字色: ${colors.text_primary || '-'}\n\n`;
          msg += `📝 **字体规范**\n`;
          msg += `• 标题: ${fonts.title_style || '-'}，${fonts.title_size || '-'}\n`;
          msg += `• 正文: ${fonts.body_style || '-'}，${fonts.body_size || '-'}\n\n`;
          msg += `📐 **布局结构**\n`;
          msg += `• 标题位置: ${layout.title_position || '-'}\n`;
          msg += `• 内容区域: ${layout.content_area || '-'}\n\n`;
          msg += `🖼️ **背景设计**\n`;
          msg += `• 类型: ${background.type || '-'}\n`;
          msg += `• ${background.description || '-'}\n\n`;
          msg += `💡 **风格总结**\n${analysis.style_summary || '-'}\n\n`;
          msg += `生成 PPT 时将严格按照以上规范执行。`;
          
          addMessage('assistant', msg);
        } else {
          addMessage('assistant', '✓ 母版已上传，生成时将参考此母版风格。');
        }
      } catch (err) { 
        console.error(err); 
        addMessage('assistant', '❌ 母版上传或分析失败，请重试');
      } finally {
        setIsAnalyzingTemplate(false);
      }
    }
  }, [sessionId, addMessage]);

  const handleAudioSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) { setAudioFile(file); setAudioFileName(file.name); setAudioTranscript(''); }
  }, []);

  const handleUploadAudio = useCallback(async () => {
    if (!audioFile) return;
    setIsUploadingAudio(true);
    try {
      const result = await api.uploadAudio(sessionId, audioFile, numSpeaker);
      if (result.success) { setAudioTranscript(result.transcript); addMessage('assistant', '✓ 录音转写完成'); }
    } catch (err) { console.error(err); addMessage('assistant', '❌ 录音转写失败'); }
    finally { setIsUploadingAudio(false); }
  }, [audioFile, numSpeaker, sessionId, addMessage]);

  const handleClearAudio = useCallback(() => {
    setAudioFile(null); setAudioFileName(''); setAudioTranscript(''); setNumSpeaker('');
    if (audioInputRef.current) audioInputRef.current.value = '';
  }, []);

  // 新增：支持性文档处理
  const handleSupportDocSelect = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('文件过大，请上传小于10MB的文档');
      return;
    }
    setIsUploadingSupportDoc(true);
    try {
      const result = await api.uploadSupportDoc(sessionId, file);
      if (result.success) {
        setSupportDocs(prev => [...prev, { filename: result.filename, textLength: result.text_length }]);
        // 弹出预览Modal而不是添加消息
        setDocPreviewData({
          filename: result.filename,
          textLength: result.text_length,
          textPreview: result.text_preview
        });
        setShowDocPreviewModal(true);
      } else {
        alert(`上传失败: ${result.message}`);
      }
    } catch (err) {
      alert(`上传失败: ${err.message}`);
    } finally {
      setIsUploadingSupportDoc(false);
      if (supportDocInputRef.current) supportDocInputRef.current.value = '';
    }
  }, [sessionId]);

  const handleClearSupportDocs = useCallback(async () => {
    if (!window.confirm('确定要清除所有已上传的支持性文档吗？')) return;
    try {
      await api.clearSupportDocs(sessionId);
      setSupportDocs([]);
    } catch (err) {
      console.error(err);
    }
  }, [sessionId]);

  // 新增：页面素材处理
  const handlePageMaterialSelect = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      addMessage('assistant', '❌ 文件过大，请上传小于5MB的文件');
      return;
    }
    // 保存待上传文件，弹出描述输入框
    setPendingFile(file);
    setPendingFileDesc('');
    setShowDescModal(true);
    if (pageMaterialInputRef.current) pageMaterialInputRef.current.value = '';
  }, [addMessage]);

  const handleConfirmUploadWithDesc = useCallback(async () => {
    if (!pendingFile) return;
    const file = pendingFile;
    const description = pendingFileDesc.trim();
    const ext = file.name.split('.').pop()?.toLowerCase();
    const isTable = ['xlsx', 'xls', 'csv'].includes(ext);
    
    setIsUploadingPageMaterial(true); // 开始上传
    addMessage('user', `📎 上传${isTable ? '表格' : '图片'}到第 ${selectedMaterialPage + 1} 页: ${file.name}${description ? ` (${description})` : ''}`);
    
    try {
      const result = await api.uploadPageMaterial(sessionId, selectedMaterialPage, file, description);
      if (result.success) {
        setPageMaterials(prev => {
          const newMaterials = { ...prev };
          if (!newMaterials[selectedMaterialPage]) newMaterials[selectedMaterialPage] = [];
          newMaterials[selectedMaterialPage] = [...newMaterials[selectedMaterialPage], { 
            filename: result.filename, 
            type: result.type || 'image',
            description: description 
          }];
          return newMaterials;
        });
        addMessage('assistant', `✅ ${isTable ? '表格' : '图片'}已添加到第 ${selectedMaterialPage + 1} 页`);
      } else {
        addMessage('assistant', `❌ 上传失败: ${result.message}`);
      }
    } catch (err) {
      addMessage('assistant', `❌ 上传失败: ${err.message}`);
    } finally {
      setIsUploadingPageMaterial(false); // 结束上传
      setShowDescModal(false);
      setPendingFile(null);
      setPendingFileDesc('');
    }
  }, [sessionId, selectedMaterialPage, pendingFile, pendingFileDesc, addMessage]);

  const handlePasteTableSubmit = useCallback(async () => {
    if (!pasteTableText.trim()) {
      addMessage('assistant', '❌ 请输入表格内容');
      return;
    }
    const description = pasteTableDesc.trim();
    setIsUploadingPageMaterial(true); // 开始上传
    addMessage('user', `📋 粘贴表格到第 ${selectedMaterialPage + 1} 页${description ? ` (${description})` : ''}`);
    try {
      const result = await api.addTableTextMaterial(sessionId, selectedMaterialPage, pasteTableText, description);
      if (result.success) {
        setPageMaterials(prev => {
          const newMaterials = { ...prev };
          if (!newMaterials[selectedMaterialPage]) newMaterials[selectedMaterialPage] = [];
          newMaterials[selectedMaterialPage] = [...newMaterials[selectedMaterialPage], { 
            filename: result.filename, 
            type: 'table_text',
            description: description
          }];
          return newMaterials;
        });
        setPasteTableText('');
        setPasteTableDesc('');
        addMessage('assistant', `✅ 表格内容已添加到第 ${selectedMaterialPage + 1} 页`);
      } else {
        addMessage('assistant', `❌ 添加失败: ${result.message}`);
      }
    } catch (err) {
      addMessage('assistant', `❌ 添加失败: ${err.message}`);
    } finally {
      setIsUploadingPageMaterial(false); // 结束上传
    }
  }, [sessionId, selectedMaterialPage, pasteTableText, pasteTableDesc, addMessage]);

  const handleRemovePageMaterial = useCallback(async (pageIndex, materialIndex) => {
    try {
      const result = await api.removePageMaterial(sessionId, pageIndex, materialIndex);
      if (result.success) {
        setPageMaterials(prev => {
          const newMaterials = { ...prev };
          if (newMaterials[pageIndex]) newMaterials[pageIndex] = newMaterials[pageIndex].filter((_, i) => i !== materialIndex);
          return newMaterials;
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, [sessionId]);

  const totalMaterialCount = Object.values(pageMaterials).flat().length;

  const handleGenerateOutline = useCallback(async (input) => {
    setIsLoading(true); setLoadingText('🧠 AI 正在分析内容，生成大纲...');
    try {
      // 构建页面指令字符串
      let pageInstructionsStr = '';
      if (Object.keys(pageInstructions).length > 0) {
        const instructions = Object.entries(pageInstructions)
          .filter(([_, v]) => v.trim())
          .map(([idx, v]) => `第${parseInt(idx) + 1}页: ${v}`)
          .join('\n');
        if (instructions) {
          pageInstructionsStr = instructions;
        }
      }
      
      const result = await api.generateOutline(sessionId, input, pageCount ? parseInt(pageCount) : null, pageInstructionsStr, designPrinciples, getTemplateSettings());
      if (result.success) { 
        const outlineData = result.outline_json || [];
        setOutline(outlineData);
        // 初始化可编辑大纲
        const editableInit = {};
        outlineData.forEach((page, i) => {
          editableInit[i] = {
            title: page.title || page.theme || '',
            content: page.content || ''
          };
        });
        setEditableOutline(editableInit);
        setOutlineEditTip(true); // 显示编辑提示
        setStage(STAGES.OUTLINE_REFINE); 
        // 格式化大纲为可读文本
        const outlineText = outlineData.map((page, i) => 
          `【第${i + 1}页】${page.title || page.theme || ''}\n${page.content || ''}`
        ).join('\n\n');
        addMessage('assistant', `✨ 已生成 ${outlineData.length} 页大纲：\n\n${outlineText}\n\n💡 您可以在右侧预览区直接编辑内容，修改后点击"应用编辑"同步更改。\n\n如需通过对话修改，请输入修改意见；确认无误请点击"确认大纲"按钮。`); 
      }
      else addMessage('assistant', '❌ 生成失败: ' + result.message);
    } catch (err) { 
      addMessage('assistant', '❌ 请求失败: ' + err.message); 
    } finally { setIsLoading(false); }
  }, [sessionId, addMessage, pageCount, pageInstructions, designPrinciples, getTemplateSettings]);

  const handleRefineOutline = useCallback(async (feedback) => {
    setIsLoading(true); setLoadingText('📝 正在修改大纲...');
    try { 
      const result = await api.refineOutline(sessionId, feedback); 
      if (result.success) { 
        const outlineData = result.outline_json || [];
        setOutline(outlineData);
        // 同步更新可编辑大纲
        const editableInit = {};
        outlineData.forEach((page, i) => {
          editableInit[i] = {
            title: page.title || page.theme || '',
            content: page.content || ''
          };
        });
        setEditableOutline(editableInit);
        // 格式化大纲为可读文本
        const outlineText = outlineData.map((page, i) => 
          `【第${i + 1}页】${page.title || page.theme || ''}\n${page.content || ''}`
        ).join('\n\n');
        addMessage('assistant', `✓ 大纲已更新：\n\n${outlineText}\n\n💡 您可以在右侧预览区直接编辑内容。\n\n如需继续修改，请输入意见；确认无误请点击"确认大纲"按钮。`); 
      } 
    }
    catch (err) { addMessage('assistant', '❌ 请求失败: ' + err.message); } finally { setIsLoading(false); }
  }, [sessionId, addMessage]);

  // 应用右侧预览编辑的大纲内容
  const handleApplyOutlineEdits = useCallback(async () => {
    const updatedOutline = outline.map((page, i) => {
      const edited = editableOutline[i];
      if (edited) {
        return {
          ...page,
          title: edited.title,
          theme: edited.title, // theme和title保持一致
          content: edited.content
        };
      }
      return page;
    });
    setOutline(updatedOutline);
    setOutlineEditTip(false);
    
    // 同步到后端
    try {
      await api.updateOutline(sessionId, updatedOutline);
      addMessage('assistant', '✅ 大纲编辑已应用并同步！如需继续修改，可以输入修改意见；确认无误请点击"确认大纲"按钮。');
    } catch (err) {
      console.error('同步大纲失败:', err);
      addMessage('assistant', '⚠️ 大纲编辑已应用到本地，但同步失败。请重试或继续操作。');
    }
  }, [outline, editableOutline, sessionId, addMessage]);

  const handleGenerateStyle = useCallback(async () => {
    setLoadingText('🎨 正在设计页面风格...');
    try { 
      const result = await api.generateStyle(sessionId); 
      if (result.success) { 
        const styleData = result.style_json || [];
        setStyleDesign(styleData); 
        setStage(STAGES.STYLE_REFINE); 
        // 格式化设计方案为可读文本
        const styleText = styleData.map((page, i) => 
          `【第${i + 1}页】${page.title || page.theme || ''}\n设计理念: ${page.design_concept || '—'}\n布局: ${page.layout || '—'}`
        ).join('\n\n');
        addMessage('assistant', `✨ 设计方案已生成：\n\n${styleText}\n\n如需调整设计，请输入修改意见；确认无误请点击"开始生成PPT"按钮。`); 
      } 
    }
    catch (err) { addMessage('assistant', '❌ 请求失败: ' + err.message); } finally { setIsLoading(false); }
  }, [sessionId, addMessage]);

  // handleConfirmOutline 必须在 handleGenerateStyle 之后定义
  const handleConfirmOutline = useCallback(async () => {
    setIsLoading(true); setLoadingText('🎨 正在生成设计方案...');
    try {
      // 【关键修复】在确认大纲前，先检查并同步右侧预览区的编辑内容
      // 这样即使用户没有点击"应用编辑"按钮，编辑内容也会被保存
      if (Object.keys(editableOutline).length > 0) {
        const updatedOutline = outline.map((page, i) => {
          const edited = editableOutline[i];
          if (edited) {
            return {
              ...page,
              title: edited.title,
              theme: edited.title,
              content: edited.content
            };
          }
          return page;
        });
        // 同步到后端
        try {
          await api.updateOutline(sessionId, updatedOutline);
          setOutline(updatedOutline); // 同时更新前端状态
          console.log('大纲编辑已自动同步');
        } catch (syncErr) {
          console.error('同步编辑内容失败:', syncErr);
          // 即使同步失败也继续，但记录警告
        }
      }
      
      await api.confirmOutline(sessionId);
      addMessage('assistant', '✓ 大纲已确认');
      await handleGenerateStyle();
    }
    catch (err) { addMessage('assistant', '❌ 请求失败: ' + err.message); setIsLoading(false); }
  }, [sessionId, addMessage, handleGenerateStyle, editableOutline, outline]);

  const handleRefineStyle = useCallback(async (feedback) => {
    setIsLoading(true); setLoadingText('🎨 正在调整设计...');
    try { 
      const result = await api.refineStyle(sessionId, feedback); 
      if (result.success) { 
        const styleData = result.style_json || [];
        setStyleDesign(styleData); 
        // 格式化设计方案为可读文本
        const styleText = styleData.map((page, i) => 
          `【第${i + 1}页】${page.title || page.theme || ''}\n设计理念: ${page.design_concept || '—'}\n布局: ${page.layout || '—'}`
        ).join('\n\n');
        addMessage('assistant', `✓ 设计方案已更新：\n\n${styleText}\n\n如需继续调整，请输入意见；确认无误请点击"开始生成PPT"按钮。`); 
      } 
    }
    catch (err) { addMessage('assistant', '❌ 请求失败: ' + err.message); } finally { setIsLoading(false); }
  }, [sessionId, addMessage]);

  const handleGenerateAllImages = useCallback(async () => {
    const total = outline.length || styleDesign.length;
    if (total === 0) { setIsLoading(false); return; }
    setPptImages([]); let success = 0;
    for (let i = 0; i < total; i++) {
      setLoadingText('🖼️ 生成第 ' + (i + 1) + '/' + total + ' 页...'); setCurrentPage(i);
      try { 
        const result = await api.generateImage(sessionId, i); 
        if (result.success) { 
          setPptImages(prev => { const u = [...prev]; u[i] = { page: i + 1, filename: result.filename }; return u; }); 
          success++; 
          // 每页生成成功后提示
          addMessage('assistant', `✓ 第 ${i + 1}/${total} 页生成完成`);
        } else { 
          setPptImages(prev => { const u = [...prev]; u[i] = { page: i + 1, error: true }; return u; }); 
          addMessage('assistant', `❌ 第 ${i + 1} 页生成失败`);
        } 
      }
      catch { 
        setPptImages(prev => { const u = [...prev]; u[i] = { page: i + 1, error: true }; return u; }); 
        addMessage('assistant', `❌ 第 ${i + 1} 页生成失败`);
      }
    }
    setIsLoading(false); 
    setStage(STAGES.COMPLETE); 
    setShowCompleteTip(true); // 显示完成提示
    addMessage('assistant', '🎉 全部生成完成！成功 ' + success + '/' + total + ' 页');
  }, [sessionId, outline, styleDesign, addMessage]);

  // handleConfirmStyle 必须在 handleGenerateAllImages 之后定义
  const handleConfirmStyle = useCallback(async () => {
    setIsLoading(true); setLoadingText('🚀 准备生成PPT...');
    try { await api.confirmStyle(sessionId); setStage(STAGES.GENERATE); addMessage('assistant', '🎬 开始生成PPT图像...'); await handleGenerateAllImages(); }
    catch (err) { addMessage('assistant', '❌ 请求失败: ' + err.message); setIsLoading(false); }
  }, [sessionId, addMessage, handleGenerateAllImages]);

  const handleRefinePageAndRegenerate = useCallback(async (pageIndex, feedback) => {
    setIsLoading(true); 
    setRegeneratingPageIndex(pageIndex); // 设置正在重新生成的页面
    setLoadingText('🔄 重新生成第 ' + (pageIndex + 1) + ' 页...');
    try { 
      const result = await api.refinePageAndRegenerate(sessionId, pageIndex, feedback); 
      if (result.success) { 
        setPptImages(prev => { const u = [...prev]; u[pageIndex] = { page: pageIndex + 1, filename: result.image_filename, timestamp: Date.now() }; return u; }); 
        addMessage('assistant', '✓ 第 ' + (pageIndex + 1) + ' 页已更新'); 
      } 
    }
    catch (err) { addMessage('assistant', '❌ 请求失败: ' + err.message); } 
    finally { 
      setIsLoading(false); 
      setRegeneratingPageIndex(null); // 重置状态
    }
  }, [sessionId, addMessage]);

  const handleStartGenerate = useCallback(() => {
    if (!userInput.trim() && !audioTranscript) return;
    setShowStyleConfirmModal(true);
  }, [userInput, audioTranscript]);

  const handleConfirmAndGenerate = useCallback(async () => {
    setShowStyleConfirmModal(false);
    const text = userInput.trim();
    const input = audioTranscript && text ? text + '\n\n【录音内容】\n' + audioTranscript : audioTranscript ? audioTranscript : text;
    addMessage('user', text || '📎 使用录音生成');
    setUserInput('');
    if (audioTranscript) handleClearAudio();
    await handleGenerateOutline(input);
  }, [userInput, audioTranscript, addMessage, handleGenerateOutline, handleClearAudio]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const text = userInput.trim();
    if (!text && stage !== STAGES.INPUT) return;
    if (isLoading) return;
    if (stage === STAGES.INPUT) { handleStartGenerate(); } 
    else {
      addMessage('user', text); setUserInput('');
      switch (stage) {
        case STAGES.OUTLINE_REFINE: await handleRefineOutline(text); break;
        case STAGES.STYLE_REFINE: await handleRefineStyle(text); break;
        case STAGES.COMPLETE: if (editingPageIndex !== null) { await handleRefinePageAndRegenerate(editingPageIndex, text); } break;
        default: break;
      }
    }
  }, [userInput, isLoading, stage, editingPageIndex, addMessage, handleStartGenerate, handleRefineOutline, handleRefineStyle, handleRefinePageAndRegenerate]);

  const handleDownload = useCallback(() => { window.open(api.getDownloadUrl(sessionId), '_blank'); }, [sessionId]);
  const handleDownloadPdf = useCallback(() => { 
    window.open(api.getPdfDownloadUrl(sessionId), '_blank'); 
    // 延迟显示WPS提示，让下载先开始
    setTimeout(() => setShowWpsTip(true), 500);
  }, [sessionId]);

  // ============ 渲染设置Modal ============
  const renderSettingsModalContent = () => (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', padding: '4px', background: theme.bgTertiary, borderRadius: '12px' }}>
        <TabButton active={settingsTab === 'color'} onClick={() => setSettingsTab('color')} icon="🎨">配色方案</TabButton>
        <TabButton active={settingsTab === 'font'} onClick={() => setSettingsTab('font')} icon="📝">字体方案</TabButton>
        <TabButton active={settingsTab === 'layout'} onClick={() => setSettingsTab('layout')} icon="📐">布局设置</TabButton>
        <TabButton active={settingsTab === 'file'} onClick={() => setSettingsTab('file')} icon="📁">母版及Logo上传</TabButton>
      </div>
      <div style={{ marginBottom: '16px', padding: '10px 14px', background: `${theme.primary}10`, borderRadius: '8px', borderLeft: `3px solid ${theme.primary}`, fontSize: '12px', color: theme.textSecondary }}>
        💡 以上设置均为可选项，不填写则按默认风格生成 PPT
      </div>
      {settingsTab === 'color' && (
        <div>
          <div style={{ fontSize: '13px', color: theme.textMuted, marginBottom: '16px' }}>选择 PPT 的主题配色方案</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {Object.entries(COLOR_SCHEMES).map(([key, scheme]) => (
              <button key={key} onClick={() => { setSelectedColorScheme(key); setUseCustomColors(false); }} style={{ padding: '16px', background: (selectedColorScheme === key && !useCustomColors) ? `linear-gradient(135deg, ${theme.primaryLight}, ${theme.bgTertiary})` : theme.bgTertiary, border: (selectedColorScheme === key && !useCustomColors) ? `2px solid ${theme.primary}` : `1px solid ${theme.border}`, borderRadius: '14px', textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
                {(selectedColorScheme === key && !useCustomColors) && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: theme.gradient }} />}
                <ColorPreview colors={scheme.colors} size={24} showGlow={selectedColorScheme === key && !useCustomColors} />
                <div style={{ fontSize: '13px', fontWeight: 600, color: (selectedColorScheme === key && !useCustomColors) ? theme.primary : theme.text, marginTop: '10px' }}>{scheme.name}</div>
              </button>
            ))}
          </div>
          
          {/* 自定义配色 */}
          <div style={{ padding: '16px', background: useCustomColors ? `linear-gradient(135deg, ${theme.primaryLight}, ${theme.bgTertiary})` : theme.bgTertiary, border: useCustomColors ? `2px solid ${theme.primary}` : `1px solid ${theme.border}`, borderRadius: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: useCustomColors ? '16px' : '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px' }}>🎨</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: useCustomColors ? theme.primary : theme.text }}>自定义配色</span>
              </div>
              <button onClick={() => setUseCustomColors(!useCustomColors)} style={{ padding: '6px 12px', background: useCustomColors ? theme.primary : 'transparent', border: `1px solid ${useCustomColors ? theme.primary : theme.border}`, borderRadius: '6px', color: useCustomColors ? '#fff' : theme.textSecondary, fontSize: '12px' }}>{useCustomColors ? '✓ 已启用' : '启用'}</button>
            </div>
            {useCustomColors && (
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input type="color" value={customColors.primary} onChange={(e) => setCustomColors(prev => ({ ...prev, primary: e.target.value }))} style={{ width: '40px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: theme.text }}>主色调</div>
                    <div style={{ fontSize: '11px', color: theme.textMuted }}>大标题、背景色块、强调边框</div>
                  </div>
                  <input type="text" value={customColors.primary} onChange={(e) => setCustomColors(prev => ({ ...prev, primary: e.target.value }))} style={{ width: '80px', padding: '6px 8px', background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: '6px', fontSize: '11px', color: theme.text, textAlign: 'center' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input type="color" value={customColors.secondary} onChange={(e) => setCustomColors(prev => ({ ...prev, secondary: e.target.value }))} style={{ width: '40px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: theme.text }}>辅助色</div>
                    <div style={{ fontSize: '11px', color: theme.textMuted }}>关键数据、次级标题、图表高亮</div>
                  </div>
                  <input type="text" value={customColors.secondary} onChange={(e) => setCustomColors(prev => ({ ...prev, secondary: e.target.value }))} style={{ width: '80px', padding: '6px 8px', background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: '6px', fontSize: '11px', color: theme.text, textAlign: 'center' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input type="color" value={customColors.accent} onChange={(e) => setCustomColors(prev => ({ ...prev, accent: e.target.value }))} style={{ width: '40px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: theme.text }}>强调色</div>
                    <div style={{ fontSize: '11px', color: theme.textMuted }}>警示风险、特别强调点</div>
                  </div>
                  <input type="text" value={customColors.accent} onChange={(e) => setCustomColors(prev => ({ ...prev, accent: e.target.value }))} style={{ width: '80px', padding: '6px 8px', background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: '6px', fontSize: '11px', color: theme.text, textAlign: 'center' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input type="color" value={customColors.text} onChange={(e) => setCustomColors(prev => ({ ...prev, text: e.target.value }))} style={{ width: '40px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: theme.text }}>文字色</div>
                    <div style={{ fontSize: '11px', color: theme.textMuted }}>正文文字、图表坐标轴</div>
                  </div>
                  <input type="text" value={customColors.text} onChange={(e) => setCustomColors(prev => ({ ...prev, text: e.target.value }))} style={{ width: '80px', padding: '6px 8px', background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: '6px', fontSize: '11px', color: theme.text, textAlign: 'center' }} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {settingsTab === 'font' && (
        <div>
          <div style={{ fontSize: '13px', color: theme.textMuted, marginBottom: '16px' }}>选择中英文字体搭配</div>
          <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
            {Object.entries(FONT_SCHEMES).map(([key, scheme]) => (
              <button key={key} onClick={() => { setSelectedFontScheme(key); setUseCustomFonts(false); }} style={{ padding: '16px', background: (selectedFontScheme === key && !useCustomFonts) ? `linear-gradient(135deg, ${theme.primaryLight}, ${theme.bgTertiary})` : theme.bgTertiary, border: (selectedFontScheme === key && !useCustomFonts) ? `2px solid ${theme.primary}` : `1px solid ${theme.border}`, borderRadius: '14px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', background: theme.gradient, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 700, color: '#fff' }}>Aa</div>
                <div><div style={{ fontSize: '14px', fontWeight: 600, color: (selectedFontScheme === key && !useCustomFonts) ? theme.primary : theme.text }}>{scheme.name}</div><div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '4px' }}>中文: {scheme.title} | 英文: {scheme.eng}</div></div>
              </button>
            ))}
          </div>
          
          {/* 自定义字体 */}
          <div style={{ padding: '16px', background: useCustomFonts ? `linear-gradient(135deg, ${theme.primaryLight}, ${theme.bgTertiary})` : theme.bgTertiary, border: useCustomFonts ? `2px solid ${theme.primary}` : `1px solid ${theme.border}`, borderRadius: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: useCustomFonts ? '16px' : '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px' }}>✏️</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: useCustomFonts ? theme.primary : theme.text }}>自定义字体</span>
              </div>
              <button onClick={() => setUseCustomFonts(!useCustomFonts)} style={{ padding: '6px 12px', background: useCustomFonts ? theme.primary : 'transparent', border: `1px solid ${useCustomFonts ? theme.primary : theme.border}`, borderRadius: '6px', color: useCustomFonts ? '#fff' : theme.textSecondary, fontSize: '12px' }}>{useCustomFonts ? '✓ 已启用' : '启用'}</button>
            </div>
            {useCustomFonts && (
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: theme.text, marginBottom: '6px' }}>中文字体</div>
                    <select value={customFonts.chinese} onChange={(e) => setCustomFonts(prev => ({ ...prev, chinese: e.target.value }))} style={{ width: '100%', padding: '10px', background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: '8px', fontSize: '13px', color: theme.text }}>
                      <option value="Microsoft YaHei">微软雅黑</option>
                      <option value="SimHei">黑体</option>
                      <option value="SimSun">宋体</option>
                      <option value="KaiTi">楷体</option>
                      <option value="Source Han Sans CN">思源黑体</option>
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: theme.text, marginBottom: '6px' }}>英文/数字字体</div>
                    <select value={customFonts.english} onChange={(e) => setCustomFonts(prev => ({ ...prev, english: e.target.value }))} style={{ width: '100%', padding: '10px', background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: '8px', fontSize: '13px', color: theme.text }}>
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Calibri">Calibri</option>
                      <option value="Georgia">Georgia</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: theme.text, marginBottom: '6px' }}>大标题 (pt)</div>
                    <input type="number" value={customFonts.mainTitleSize} onChange={(e) => setCustomFonts(prev => ({ ...prev, mainTitleSize: parseInt(e.target.value) || 48 }))} style={{ width: '100%', padding: '10px', background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: '8px', fontSize: '13px', color: theme.text, textAlign: 'center' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: theme.text, marginBottom: '6px' }}>页标题 (pt)</div>
                    <input type="number" value={customFonts.pageTitleSize} onChange={(e) => setCustomFonts(prev => ({ ...prev, pageTitleSize: parseInt(e.target.value) || 18 }))} style={{ width: '100%', padding: '10px', background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: '8px', fontSize: '13px', color: theme.text, textAlign: 'center' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: theme.text, marginBottom: '6px' }}>正文 (pt)</div>
                    <input type="number" value={customFonts.bodySize} onChange={(e) => setCustomFonts(prev => ({ ...prev, bodySize: parseInt(e.target.value) || 14 }))} style={{ width: '100%', padding: '10px', background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: '8px', fontSize: '13px', color: theme.text, textAlign: 'center' }} />
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: theme.textMuted, padding: '8px', background: theme.bgInput, borderRadius: '6px' }}>
                  💡 建议：大标题 48pt，页标题 18pt，正文 12-16pt
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {settingsTab === 'layout' && (
        <div>
          <div style={{ marginBottom: '24px' }}><div style={{ fontSize: '13px', fontWeight: 600, color: theme.text, marginBottom: '12px' }}>🏷️ Logo 位置</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {LOGO_POSITIONS.map(p => (<button key={p.value} onClick={() => setLogoPosition(p.value)} style={{ padding: '12px 8px', background: logoPosition === p.value ? theme.primaryLight : theme.bgTertiary, border: logoPosition === p.value ? `2px solid ${theme.primary}` : `1px solid ${theme.border}`, borderRadius: '10px', fontSize: '11px', fontWeight: 500, color: logoPosition === p.value ? theme.primary : theme.textSecondary }}>{p.label}</button>))}
            </div>
          </div>
          <div><div style={{ fontSize: '13px', fontWeight: 600, color: theme.text, marginBottom: '12px' }}>🔢 页码位置</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {PAGE_NUMBER_POSITIONS.map(p => (<button key={p.value} onClick={() => setPageNumberPosition(p.value)} style={{ padding: '12px 8px', background: pageNumberPosition === p.value ? theme.primaryLight : theme.bgTertiary, border: pageNumberPosition === p.value ? `2px solid ${theme.primary}` : `1px solid ${theme.border}`, borderRadius: '10px', fontSize: '11px', fontWeight: 500, color: pageNumberPosition === p.value ? theme.primary : theme.textSecondary }}>{p.label}</button>))}
            </div>
          </div>
        </div>
      )}
      {settingsTab === 'file' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ padding: '20px', background: theme.bgTertiary, borderRadius: '14px', border: `1px solid ${templateFile ? (templateAnalysis ? theme.success : theme.warning) : theme.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', background: templateFile ? (templateAnalysis ? `${theme.success}20` : `${theme.warning}20`) : theme.primaryLight, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                {isAnalyzingTemplate ? '⏳' : (templateFile ? (templateAnalysis ? '✓' : '📄') : '📄')}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: theme.text }}>PPT 母版</div>
                <div style={{ fontSize: '11px', color: theme.textMuted }}>
                  {isAnalyzingTemplate ? '🔄 AI 正在深度分析母版风格，请稍候（约30-60秒）...' : (templateAnalysis ? '✅ 分析完成，已提取设计规范' : '上传母版截图，AI 将自动分析配色、字体、布局等')}
                </div>
              </div>
            </div>
            <input ref={templateInputRef} type="file" accept=".png,.jpg,.jpeg,.webp,.gif" onChange={handleTemplateSelect} style={{ display: 'none' }} />
            <button onClick={() => templateInputRef.current?.click()} disabled={isAnalyzingTemplate} style={{ width: '100%', padding: '12px', background: templateFile ? `${templateAnalysis ? theme.success : theme.warning}20` : 'transparent', border: `1px dashed ${templateFile ? (templateAnalysis ? theme.success : theme.warning) : theme.border}`, borderRadius: '10px', color: templateFile ? (templateAnalysis ? theme.success : theme.warning) : theme.textSecondary, fontSize: '13px' }}>
              {isAnalyzingTemplate ? '🔄 AI 分析中，请稍候...' : (templateFile ? '✓ ' + templateFile.name + '（点击更换）' : '📎 点击上传母版截图')}
            </button>
            <div style={{ fontSize: '10px', color: theme.textMuted, marginTop: '6px', textAlign: 'center' }}>
              ⚠️ 请上传 PPT 页面的<strong>截图</strong>（PNG/JPG/WebP），不支持 PPT/PPTX 文件
            </div>
            
            {/* 母版分析详细结果 */}
            {templateAnalysis && (
              <div style={{ marginTop: '16px', padding: '16px', background: theme.bgCard, borderRadius: '12px', border: `1px solid ${theme.border}` }}>
                <div style={{ fontWeight: 600, color: theme.text, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📊</span> 母版分析结果
                </div>
                
                {/* 配色方案 */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '6px' }}>🎨 配色方案</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {templateAnalysis.colors && Object.entries(templateAnalysis.colors).map(([key, color]) => (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: theme.bgTertiary, borderRadius: '6px' }}>
                        <div style={{ width: '16px', height: '16px', background: color, borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)' }} />
                        <span style={{ fontSize: '10px', color: theme.textSecondary }}>{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 字体信息 */}
                {templateAnalysis.fonts && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '6px' }}>📝 字体规范</div>
                    <div style={{ fontSize: '11px', color: theme.textSecondary, lineHeight: 1.6 }}>
                      <div>标题：{templateAnalysis.fonts.title_style}，{templateAnalysis.fonts.title_size}</div>
                      <div>正文：{templateAnalysis.fonts.body_style}，{templateAnalysis.fonts.body_size}</div>
                    </div>
                  </div>
                )}
                
                {/* 布局信息 */}
                {templateAnalysis.layout && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '6px' }}>📐 布局结构</div>
                    <div style={{ fontSize: '11px', color: theme.textSecondary, lineHeight: 1.6 }}>
                      <div>标题位置：{templateAnalysis.layout.title_position}</div>
                      <div>内容区域：{templateAnalysis.layout.content_area}</div>
                    </div>
                  </div>
                )}
                
                {/* 背景信息 */}
                {templateAnalysis.background && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '6px' }}>🖼️ 背景设计</div>
                    <div style={{ fontSize: '11px', color: theme.textSecondary, lineHeight: 1.6 }}>
                      <div>类型：{templateAnalysis.background.type}</div>
                      <div>{templateAnalysis.background.description}</div>
                      {templateAnalysis.background.has_decorations && templateAnalysis.background.decoration_description && (
                        <div>装饰：{templateAnalysis.background.decoration_description}</div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* 风格总结 */}
                {templateAnalysis.style_summary && (
                  <div style={{ padding: '10px', background: `${theme.primary}10`, borderRadius: '8px', borderLeft: `3px solid ${theme.primary}` }}>
                    <div style={{ fontSize: '11px', color: theme.primary, fontWeight: 500 }}>💡 风格总结</div>
                    <div style={{ fontSize: '12px', color: theme.text, marginTop: '4px', lineHeight: 1.5 }}>{templateAnalysis.style_summary}</div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div style={{ padding: '20px', background: theme.bgTertiary, borderRadius: '14px', border: `1px solid ${logoFile ? theme.success : theme.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', background: logoFile ? `${theme.success}20` : theme.primaryLight, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>{logoPreview ? <img src={logoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: '18px' }}>🏷️</span>}</div>
              <div><div style={{ fontSize: '14px', fontWeight: 600, color: theme.text }}>公司 Logo</div><div style={{ fontSize: '11px', color: theme.textMuted }}>上传 Logo 图片，将显示在 PPT 右上角</div></div>
            </div>
            <input ref={logoInputRef} type="file" accept=".png,.jpg,.jpeg,.webp,.gif" onChange={handleLogoSelect} style={{ display: 'none' }} />
            <button onClick={() => logoInputRef.current?.click()} style={{ width: '100%', padding: '12px', background: logoFile ? `${theme.success}20` : 'transparent', border: `1px dashed ${logoFile ? theme.success : theme.border}`, borderRadius: '10px', color: logoFile ? theme.success : theme.textSecondary, fontSize: '13px' }}>{logoFile ? '✓ ' + logoFile.name + '（点击更换）' : '📎 点击上传 Logo 图片'}</button>
            <div style={{ fontSize: '10px', color: theme.textMuted, marginTop: '6px', textAlign: 'center' }}>
              支持 PNG/JPG/WebP 格式，不支持 EMF/SVG 等矢量格式
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ============ 渲染风格确认Modal ============
  const renderStyleConfirmModal = () => (
    <div>
      <div style={{ marginBottom: '24px', padding: '20px', background: `linear-gradient(135deg, ${theme.bgTertiary}, ${theme.primaryLight})`, borderRadius: '16px', border: `1px solid ${theme.border}`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: theme.gradient }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <span style={{ fontSize: '40px' }}>{STYLE_PRESETS[selectedStylePreset].icon}</span>
          <div><div style={{ fontSize: '18px', fontWeight: 700, color: theme.text, marginBottom: '4px' }}>{STYLE_PRESETS[selectedStylePreset].name}</div><div style={{ fontSize: '12px', color: theme.textMuted }}>{STYLE_PRESETS[selectedStylePreset].description}</div></div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <Tag color="primary" size="md"><ColorPreview colors={COLOR_SCHEMES[selectedColorScheme].colors} size={12} /><span style={{ marginLeft: '6px' }}>{COLOR_SCHEMES[selectedColorScheme].name}</span></Tag>
          <Tag color="secondary" size="md">📝 {FONT_SCHEMES[selectedFontScheme].name}</Tag>
          <Tag color="accent" size="md">{QUALITY_OPTIONS[selectedQuality].icon} {QUALITY_OPTIONS[selectedQuality].name}</Tag>
          {pageCount && <Tag color="warning" size="md">📄 {pageCount} 页</Tag>}
          {logoFile && <Tag color="success" size="md">✓ Logo</Tag>}
          {templateFile && <Tag color="success" size="md">✓ 母版</Tag>}
        </div>
      </div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div><div style={{ fontSize: '14px', fontWeight: 600, color: theme.text }}>📋 设计原则</div><div style={{ fontSize: '11px', color: theme.textMuted }}>AI 将根据以下原则生成 PPT</div></div>
          <button onClick={() => handleOpenPromptEdit(selectedStylePreset)} style={{ padding: '8px 14px', background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: '8px', color: theme.textSecondary, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}><span>✏️</span> 编辑预设</button>
        </div>
        <textarea value={designPrinciples} onChange={(e) => setDesignPrinciples(e.target.value)} style={{ width: '100%', height: '200px', padding: '16px', background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: '12px', fontSize: '12px', color: theme.text, resize: 'none', lineHeight: 1.7, fontFamily: 'inherit' }} />
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={() => setShowStyleConfirmModal(false)} style={{ flex: 1, padding: '16px', background: theme.bgTertiary, border: `1px solid ${theme.border}`, borderRadius: '14px', color: theme.textSecondary, fontSize: '14px', fontWeight: 500 }}>取消</button>
        <button onClick={handleConfirmAndGenerate} style={{ flex: 2, padding: '16px', background: theme.gradient, border: 'none', borderRadius: '14px', color: '#fff', fontSize: '14px', fontWeight: 700, boxShadow: theme.shadowGlow }}>🚀 确认并开始生成</button>
      </div>
    </div>
  );

  // ============ 渲染消息 ============
  const renderMessage = (msg, index) => {
    const isUser = msg.role === 'user';
    return (
      <div key={index} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: '16px', animation: 'fadeIn 0.3s ease' }}>
        {!isUser && (<div style={{ width: '32px', height: '32px', borderRadius: '10px', background: theme.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', flexShrink: 0, padding: '4px', boxShadow: `0 0 15px ${theme.primaryLight}` }}><Logo size={24} /></div>)}
        <div style={{ maxWidth: '80%', padding: '14px 18px', borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: isUser ? theme.gradient : theme.bgCard, color: isUser ? '#fff' : theme.text, fontSize: '14px', lineHeight: 1.7, border: isUser ? 'none' : `1px solid ${theme.border}`, boxShadow: isUser ? theme.shadowGlow : theme.shadow }}>
          {msg.content.split('\n').map((line, i) => <div key={i} style={{ minHeight: line ? 'auto' : '6px' }}>{line}</div>)}
        </div>
      </div>
    );
  };

  // ============ 渲染预览 ============
  const renderPreview = () => {
    const currentOutline = outline[currentPage]; const currentStyle = styleDesign[currentPage]; const currentImage = pptImages[currentPage];
    const isCurrentPageRegenerating = regeneratingPageIndex === currentPage;
    
    if (currentImage?.filename && !currentImage.error) { 
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img 
            src={api.getImageUrl(currentImage.filename, currentImage.timestamp)} 
            alt="" 
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px', opacity: isCurrentPageRegenerating ? 0.3 : 1, transition: 'opacity 0.3s ease' }} 
            onError={(e) => { 
              console.error('图片加载失败:', currentImage.filename); 
              e.target.style.display = 'none'; 
              e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
            }}
          />
          {/* 重新生成遮罩 */}
          {isCurrentPageRegenerating && (
            <div style={{ 
              position: 'absolute', 
              inset: 0, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center', 
              background: 'rgba(0,0,0,0.6)',
              borderRadius: '8px',
              zIndex: 10
            }}>
              <div style={{ width: '48px', height: '48px', border: '3px solid transparent', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
              <div style={{ fontSize: '16px', color: '#fff', fontWeight: 600 }}>正在重新生成...</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '8px' }}>第 {currentPage + 1} 页</div>
            </div>
          )}
        </div>
      ); 
    }
    if (currentOutline) {
      const isEditable = stage === STAGES.OUTLINE_REFINE;
      const editedPage = editableOutline[currentPage] || { title: currentOutline.title || currentOutline.theme || '', content: currentOutline.content || '' };
      
      return (
        <div style={{ width: '100%', height: '100%', padding: '32px', display: 'flex', flexDirection: 'column' }}>
          {/* 编辑提示 */}
          {isEditable && outlineEditTip && (
            <div style={{ 
              marginBottom: '12px', 
              padding: '10px 14px', 
              background: `${theme.warning}15`, 
              borderRadius: '10px', 
              border: `1px solid ${theme.warning}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '12px', color: theme.warning, fontWeight: 500 }}>
                💡 可直接编辑下方内容，修改后点击「应用编辑」按钮同步到大纲
              </span>
              <button 
                onClick={() => setOutlineEditTip(false)}
                style={{ 
                  padding: '2px 8px', 
                  background: 'transparent', 
                  border: 'none', 
                  color: theme.textMuted, 
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >×</button>
            </div>
          )}
          
          {/* 标题 - 可编辑 */}
          {isEditable ? (
            <input
              type="text"
              value={editedPage.title}
              onChange={(e) => setEditableOutline(prev => ({
                ...prev,
                [currentPage]: { ...prev[currentPage], title: e.target.value }
              }))}
              style={{ 
                fontSize: '22px', 
                fontWeight: 700, 
                color: theme.primary, 
                marginBottom: '16px',
                background: theme.bgInput,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                padding: '8px 12px',
                outline: 'none'
              }}
              placeholder="页面标题"
            />
          ) : (
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: theme.primary, marginBottom: '16px' }}>{currentOutline.title || currentOutline.theme}</h2>
          )}
          
          {currentStyle && (<div style={{ padding: '14px', background: theme.primaryLight, borderRadius: '10px', marginBottom: '16px', fontSize: '13px', color: theme.textSecondary, borderLeft: `4px solid ${theme.primary}` }}>💡 {currentStyle.design_concept}</div>)}
          
          {/* 内容 - 可编辑 */}
          {isEditable ? (
            <textarea
              value={editedPage.content}
              onChange={(e) => setEditableOutline(prev => ({
                ...prev,
                [currentPage]: { ...prev[currentPage], content: e.target.value }
              }))}
              style={{ 
                flex: 1, 
                background: theme.bgTertiary, 
                borderRadius: '14px', 
                padding: '18px', 
                border: `1px solid ${theme.border}`,
                fontSize: '13px',
                color: theme.text,
                lineHeight: 1.7,
                resize: 'none',
                fontFamily: 'inherit',
                outline: 'none'
              }}
              placeholder="页面内容"
            />
          ) : (
            <div style={{ flex: 1, background: theme.bgTertiary, borderRadius: '14px', padding: '18px', overflow: 'auto', border: `1px solid ${theme.border}` }}><pre style={{ fontSize: '13px', color: theme.textSecondary, whiteSpace: 'pre-wrap', lineHeight: 1.7, margin: 0, fontFamily: 'inherit' }}>{currentOutline.content}</pre></div>
          )}
          
          {/* 应用编辑按钮 */}
          {isEditable && (
            <button
              onClick={handleApplyOutlineEdits}
              style={{
                marginTop: '12px',
                padding: '12px 20px',
                background: theme.gradient,
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: theme.shadowGlow
              }}
            >
              ✅ 应用编辑到大纲
            </button>
          )}
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '20px' }}>
        <div style={{ animation: 'float 3s ease-in-out infinite' }}><Logo size={100} /></div>
        <div style={{ fontSize: '28px', fontWeight: 800 }}><span style={{ color: theme.text }}>SlideBot</span><span style={{ color: theme.accent }}> AI</span><span style={{ fontSize: '12px', marginLeft: '8px', padding: '3px 8px', background: theme.accent, color: '#fff', borderRadius: '6px', verticalAlign: 'middle' }}>2.0 Beta</span></div>
        <div style={{ fontSize: '14px', color: theme.textMuted }}>输入您的想法，AI 将为您生成专业 PPT</div>
      </div>
    );
  };

  // ============ 渲染缩略图 ============
  const renderThumbnails = () => {
    const pages = outline.length > 0 ? outline : styleDesign; if (pages.length === 0) return null;
    return (
      <div style={{ width: '140px', overflowY: 'auto', paddingRight: '8px' }}>
        {pages.map((page, i) => {
          const isActive = currentPage === i; 
          const isEditing = editingPageIndex === i; 
          const isRegenerating = regeneratingPageIndex === i;
          const img = pptImages[i]; 
          const hasImage = img?.filename && !img.error;
          return (
            <div key={i} onClick={() => { 
              if (isRegenerating) return; // 重新生成时禁止点击
              setCurrentPage(i); 
              if (stage === STAGES.COMPLETE && hasImage) { 
                setEditingPageIndex(i); 
                setShowCompleteTip(false); // 点击后关闭完成提示
                addMessage('assistant', '🎯 【微调模式】第 ' + (i + 1) + ' 页\n\n请输入您想要修改的内容，AI 将基于当前图片进行微调：\n• 仅修改您提到的部分\n• 其他元素保持不变\n• 整体风格保持一致\n\n例如："把标题改成蓝色" 或 "增加一个数据图表"'); 
              } 
            }} style={{ 
              border: isEditing ? `2px solid ${theme.accent}` : isActive ? `2px solid ${theme.primary}` : `1px solid ${theme.border}`, 
              borderRadius: '10px', 
              padding: '8px', 
              marginBottom: '10px', 
              cursor: isRegenerating ? 'wait' : 'pointer', 
              background: isActive ? theme.primaryLight : 'transparent', 
              transition: 'all 0.2s ease', 
              boxShadow: isActive ? `0 0 15px ${theme.primaryLight}` : 'none',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* 重新生成遮罩 */}
              {isRegenerating && (
                <div style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  background: 'rgba(0,0,0,0.7)', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  zIndex: 10,
                  borderRadius: '8px'
                }}>
                  <div style={{ width: '20px', height: '20px', border: '2px solid transparent', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  <div style={{ fontSize: '9px', color: '#fff', marginTop: '4px' }}>更新中</div>
                </div>
              )}
              <div style={{ aspectRatio: '16/9', background: theme.bgTertiary, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: '6px' }}>
                {hasImage ? <img src={api.getImageUrl(img.filename, img.timestamp)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '16px', color: theme.textMuted, fontWeight: 600 }}>{i + 1}</span>}
              </div>
              <div style={{ fontSize: '10px', color: theme.textSecondary, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{page.theme || page.title || ('P' + (i + 1))}</div>
            </div>
          );
        })}
      </div>
    );
  };

  // ============ 主渲染 ============
  return (
    <div style={{ display: 'flex', height: '100vh', background: theme.bg, position: 'relative' }}>
      <TechBackground />
      
      {/* 全局上传遮罩 - 支持性文档上传中 */}
      {isUploadingSupportDoc && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0,0,0,0.7)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 9999,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{ 
            textAlign: 'center', 
            color: '#fff',
            padding: '40px',
            background: theme.bgCard,
            borderRadius: '20px',
            border: `1px solid ${theme.border}`,
            boxShadow: theme.shadowLg
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'pulse 1.5s ease-in-out infinite' }}>📄</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: theme.text, marginBottom: '8px' }}>正在解析文档...</div>
            <div style={{ fontSize: '14px', color: theme.textMuted }}>请稍候，解析完成后将显示预览</div>
            <div style={{ marginTop: '20px', width: '200px', height: '4px', background: theme.bgTertiary, borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: '30%', height: '100%', background: theme.gradient, borderRadius: '2px', animation: 'loading-bar 1.5s ease-in-out infinite' }} />
            </div>
          </div>
        </div>
      )}
      
      {/* 左侧对话区 */}
      <div className="glass-effect" style={{ width: '450px', display: 'flex', flexDirection: 'column', borderRight: `1px solid ${theme.border}`, background: theme.bgSecondary, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Logo size={36} />
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800 }}><span style={{ color: theme.primary }}>SlideBot</span><span style={{ color: theme.accent }}> AI</span><span style={{ fontSize: '10px', marginLeft: '6px', padding: '2px 6px', background: theme.accent, color: '#fff', borderRadius: '4px', verticalAlign: 'middle' }}>2.0 Beta</span></div>
              <div style={{ fontSize: '11px', color: theme.textMuted }}>智能演示文稿生成平台</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <ThemeToggle isDark={isDark} onToggle={onThemeToggle} />
            {onLogout && (<button onClick={() => window.confirm('确定退出？') && onLogout()} style={{ padding: '10px 14px', background: 'transparent', color: theme.textMuted, border: `1px solid ${theme.border}`, borderRadius: '10px', fontSize: '12px', fontWeight: 500 }}>退出</button>)}
          </div>
        </div>

        {/* 消息区 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px' }}>
          {stage === STAGES.INPUT && messages.length === 0 && (
            <div style={{ marginBottom: '24px' }}>
              {/* 风格选择 */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: theme.text, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><span>🎨</span> 选择风格</div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {Object.entries(STYLE_PRESETS).map(([key, preset]) => (<StyleCard key={key} preset={preset} presetKey={key} isSelected={selectedStylePreset === key} onClick={() => handleStylePresetChange(key)} onEditPrompt={() => handleOpenPromptEdit(key)} />))}
                </div>
              </div>
              
              {/* 内容丰富度 */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: theme.text, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><span>📋</span> 内容丰富度</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {Object.entries(CONTENT_RICHNESS_OPTIONS).map(([key, opt]) => (
                    <button 
                      key={key} 
                      onClick={() => setContentRichness(key)} 
                      style={{ 
                        flex: 1, 
                        padding: '12px 16px', 
                        background: contentRichness === key ? theme.primaryLight : theme.bgTertiary, 
                        border: contentRichness === key ? `2px solid ${theme.primary}` : `1px solid ${theme.border}`, 
                        borderRadius: '12px', 
                        color: contentRichness === key ? theme.primary : theme.textSecondary, 
                        fontSize: '13px', 
                        fontWeight: 600, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span>{opt.icon}</span> {opt.name}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 参数设置 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '6px' }}>📄 页数 (1-20)</div>
                  <select value={pageCount} onChange={(e) => { setPageCount(e.target.value); if (!e.target.value) { setShowPageInstructions(false); setPageInstructions({}); } }} style={{ width: '100%', padding: '12px', background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: '10px', fontSize: '13px', color: theme.text, fontWeight: 500 }}>
                    {PAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '6px' }}>✨ 质量</div>
                  <div style={{ display: 'flex', border: `1px solid ${theme.border}`, borderRadius: '10px', overflow: 'hidden' }}>
                    {Object.entries(QUALITY_OPTIONS).map(([key, opt]) => (<button key={key} onClick={() => setSelectedQuality(key)} style={{ flex: 1, padding: '12px', background: selectedQuality === key ? theme.primaryLight : 'transparent', border: 'none', color: selectedQuality === key ? theme.primary : theme.textSecondary, fontSize: '12px', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>{opt.icon} {opt.name}</button>))}
                  </div>
                </div>
              </div>
              
              {/* 每页主旨设置（可选） */}
              {pageCount && (
                <div style={{ marginBottom: '14px' }}>
                  <button 
                    onClick={() => setShowPageInstructions(!showPageInstructions)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: showPageInstructions ? theme.primaryLight : theme.bgTertiary,
                      border: `1px solid ${showPageInstructions ? theme.primary : theme.border}`,
                      borderRadius: showPageInstructions ? '10px 10px 0 0' : '10px',
                      color: showPageInstructions ? theme.primary : theme.textSecondary,
                      fontSize: '12px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>📝</span>
                      <span>设置每页主旨</span>
                      <span style={{ fontSize: '10px', color: theme.textMuted }}>(可选)</span>
                    </span>
                    <span style={{ fontSize: '14px', transform: showPageInstructions ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                  </button>
                  
                  {showPageInstructions && (
                    <div style={{
                      padding: '14px',
                      background: theme.bgCard,
                      border: `1px solid ${theme.primary}`,
                      borderTop: 'none',
                      borderRadius: '0 0 10px 10px',
                      maxHeight: '300px',
                      overflowY: 'auto'
                    }}>
                      <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '12px' }}>
                        💡 为每一页设置主旨/主题，帮助 AI 更精准地生成内容
                      </div>
                      {Array.from({ length: parseInt(pageCount) }, (_, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                          <span style={{
                            width: '28px',
                            height: '28px',
                            background: theme.primaryLight,
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: theme.primary,
                            flexShrink: 0
                          }}>{i + 1}</span>
                          <input
                            type="text"
                            value={pageInstructions[i] || ''}
                            onChange={(e) => setPageInstructions(prev => ({ ...prev, [i]: e.target.value }))}
                            placeholder={`第 ${i + 1} 页主旨（例如：公司介绍、市场分析、团队成员）`}
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              background: theme.bgInput,
                              border: `1px solid ${theme.border}`,
                              borderRadius: '8px',
                              fontSize: '12px',
                              color: theme.text,
                              outline: 'none'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* 支持性文档上传 */}
              <div style={{ padding: '14px', background: supportDocs.length > 0 ? `${theme.success}08` : theme.bgTertiary, border: `1px solid ${supportDocs.length > 0 ? theme.success : theme.border}`, borderRadius: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: supportDocs.length > 0 ? '10px' : '0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px' }}>📄</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: theme.text }}>支持性文档</span>
                    <span style={{ fontSize: '10px', color: theme.textMuted }}>(可选)</span>
                  </div>
                  <button onClick={() => supportDocInputRef.current?.click()} disabled={isUploadingSupportDoc} style={{ padding: '6px 12px', background: isUploadingSupportDoc ? theme.bgTertiary : theme.primary, border: 'none', borderRadius: '6px', color: '#fff', fontSize: '11px', cursor: isUploadingSupportDoc ? 'not-allowed' : 'pointer', opacity: isUploadingSupportDoc ? 0.6 : 1 }}>{isUploadingSupportDoc ? '上传中...' : '+ 上传'}</button>
                </div>
                <input ref={supportDocInputRef} type="file" accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.txt" onChange={handleSupportDocSelect} style={{ display: 'none' }} />
                {supportDocs.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {supportDocs.map((doc, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: theme.bgInput, borderRadius: '6px' }}>
                        <span style={{ fontSize: '12px' }}>📎</span>
                        <span style={{ fontSize: '11px', color: theme.text, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.filename}</span>
                        <span style={{ fontSize: '10px', color: theme.textMuted }}>({doc.textLength}字)</span>
                      </div>
                    ))}
                    <button onClick={handleClearSupportDocs} style={{ padding: '4px', background: 'transparent', border: `1px solid ${theme.error}`, borderRadius: '4px', color: theme.error, fontSize: '10px', cursor: 'pointer' }}>清除全部</button>
                  </div>
                )}
                {supportDocs.length === 0 && <div style={{ fontSize: '10px', color: theme.textMuted, marginTop: '6px' }}>支持 PDF、Word、PPT、Excel，内容将参与大纲生成</div>}
              </div>
              
              {/* 更多设置 */}
              <button onClick={() => setShowSettingsModal(true)} style={{ width: '100%', padding: '14px', background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: '12px', color: theme.textSecondary, fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}><span>⚙️</span><span>高级设置（可选）：配色 / 字体 / 布局 / 母版</span><ColorPreview colors={COLOR_SCHEMES[selectedColorScheme].colors} size={14} /></button>
            </div>
          )}
          
          {messages.length === 0 && stage === STAGES.INPUT && (<div style={{ textAlign: 'center', padding: '30px 20px' }}><div style={{ width: '60px', height: '60px', background: theme.primaryLight, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px' }}>💡</div><div style={{ fontSize: '15px', color: theme.text, fontWeight: 600, marginBottom: '8px' }}>开始创作</div><div style={{ fontSize: '13px', color: theme.textMuted, lineHeight: 1.6 }}>在下方输入 PPT 主题、大纲、详细想法或素材<br/>也可以上传会议录音，AI 将为您智能整理</div></div>)}
          
          {messages.map((msg, i) => renderMessage(msg, i))}
          
          {isLoading && (<div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px', background: theme.bgCard, borderRadius: '14px', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}><div style={{ width: '20px', height: '20px', border: `2px solid ${theme.bgTertiary}`, borderTopColor: theme.primary, borderRadius: '50%', animation: 'spin 1s linear infinite' }} /><span style={{ fontSize: '14px', color: theme.textSecondary, fontWeight: 500 }}>{loadingText}</span></div>)}
          
          {!isLoading && stage === STAGES.OUTLINE_REFINE && (<div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}><button onClick={handleConfirmOutline} style={{ flex: 1, padding: '14px', background: theme.gradient, color: '#fff', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: 700, boxShadow: theme.shadowGlow }}>✓ 确认大纲，继续</button><button onClick={() => { setSelectedMaterialPage(0); setShowMaterialUploadModal(true); }} style={{ padding: '14px 16px', background: theme.bgCard, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: '14px', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>📎 上传素材{totalMaterialCount > 0 && <span style={{ padding: '2px 8px', background: theme.success, borderRadius: '10px', color: '#fff', fontSize: '11px' }}>{totalMaterialCount}</span>}</button><button onClick={() => textareaRef.current?.focus()} style={{ padding: '14px 16px', background: theme.bgCard, color: theme.textSecondary, border: `1px solid ${theme.border}`, borderRadius: '14px', fontSize: '14px', fontWeight: 500 }}>✏️ 修改</button></div>)}
          {!isLoading && stage === STAGES.STYLE_REFINE && (<div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}><button onClick={handleConfirmStyle} style={{ flex: 1, padding: '14px', background: theme.gradient, color: '#fff', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: 700, boxShadow: theme.shadowGlow }}>🚀 开始生成 PPT</button><button onClick={() => textareaRef.current?.focus()} style={{ flex: 1, padding: '14px', background: theme.bgCard, color: theme.textSecondary, border: `1px solid ${theme.border}`, borderRadius: '14px', fontSize: '14px', fontWeight: 500 }}>🎨 调整设计</button></div>)}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区 - 增大版本，集成录音上传 */}
        <div style={{ padding: '16px 22px', borderTop: `1px solid ${theme.border}`, background: theme.bgSecondary }}>
          {editingPageIndex !== null && (<div style={{ marginBottom: '12px', padding: '10px 14px', background: `${theme.accent}15`, borderRadius: '10px', border: `1px solid ${theme.accent}30`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: '13px', color: theme.accent, fontWeight: 500 }}>🎯 微调第 {editingPageIndex + 1} 页 - 仅修改您提到的部分</span><button onClick={() => setEditingPageIndex(null)} style={{ padding: '6px 10px', background: 'transparent', color: theme.textMuted, border: `1px solid ${theme.border}`, borderRadius: '8px', fontSize: '11px' }}>退出微调</button></div>)}
          
          {/* 录音上传区域 - 集成到输入框上方 */}
          {stage === STAGES.INPUT && (
            <div style={{ marginBottom: '12px', padding: '12px 14px', background: audioTranscript ? `${theme.success}08` : theme.bgCard, border: `1px solid ${audioTranscript ? theme.success : theme.border}`, borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.textSecondary, fontSize: '13px', fontWeight: 500 }}>
                  <span style={{ fontSize: '16px' }}>🎙️</span>
                  <span>录音转写</span>
                </div>
                <div style={{ height: '20px', width: '1px', background: theme.border }} />
                <select value={numSpeaker} onChange={(e) => setNumSpeaker(e.target.value)} disabled={audioTranscript} style={{ padding: '6px 10px', background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: '6px', fontSize: '12px', color: theme.text, minWidth: '100px' }}>{SPEAKER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                <input ref={audioInputRef} type="file" accept="audio/*" onChange={handleAudioSelect} style={{ display: 'none' }} />
                <button onClick={() => audioInputRef.current?.click()} disabled={audioTranscript} style={{ padding: '6px 12px', background: audioFile ? theme.primaryLight : 'transparent', border: `1px solid ${audioFile ? theme.primary : theme.border}`, borderRadius: '6px', fontSize: '12px', color: audioFile ? theme.primary : theme.textMuted, fontWeight: 500 }}>{audioFile ? '📎 ' + audioFileName.slice(0, 15) + (audioFileName.length > 15 ? '...' : '') : '📂 选择文件'}</button>
                {audioFile && !audioTranscript && (<button onClick={handleUploadAudio} disabled={isUploadingAudio} style={{ padding: '6px 14px', background: theme.gradient, border: 'none', borderRadius: '6px', fontSize: '12px', color: '#fff', fontWeight: 600 }}>{isUploadingAudio ? '⏳ 转写中...' : '▶ 开始转写'}</button>)}
                {audioTranscript && <Tag color="success" size="sm">✓ 转写完成</Tag>}
                {(audioFile || audioTranscript) && !isUploadingAudio && (<button onClick={handleClearAudio} style={{ padding: '4px 8px', background: 'transparent', border: `1px solid ${theme.error}40`, borderRadius: '4px', color: theme.error, fontSize: '11px' }}>✕</button>)}
              </div>
              {audioTranscript && (<div style={{ marginTop: '10px', padding: '10px 12px', background: theme.bgInput, borderRadius: '8px', fontSize: '12px', color: theme.textSecondary, maxHeight: '60px', overflow: 'auto', lineHeight: 1.5 }}>{audioTranscript.slice(0, 300)}{audioTranscript.length > 300 ? '...' : ''}</div>)}
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
            <textarea 
              ref={textareaRef} 
              value={userInput} 
              onChange={(e) => setUserInput(e.target.value)} 
              placeholder={stage === STAGES.INPUT 
                ? '请输入您的 PPT 主题、大纲、详细想法或素材内容...\n\n例如：\n• Q4销售业绩汇报，包含销售数据、团队亮点、明年目标\n• 新产品发布会，需要展示技术架构、功能亮点、市场分析\n• 粘贴会议纪要、报告文档，AI 将帮您整理成演示文稿' 
                : '输入修改意见...'
              } 
              disabled={isLoading} 
              style={{ 
                width: '100%', 
                padding: '14px 56px 14px 16px', 
                background: theme.bgInput, 
                border: `1px solid ${theme.border}`, 
                borderRadius: '14px', 
                fontSize: '14px', 
                color: theme.text, 
                resize: 'none', 
                height: stage === STAGES.INPUT ? '120px' : '56px', 
                lineHeight: 1.6,
                fontFamily: 'inherit'
              }} 
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && stage !== STAGES.INPUT) { e.preventDefault(); handleSubmit(e); } }} 
            />
            <button type="submit" disabled={isLoading || (!userInput.trim() && !audioTranscript)} style={{ position: 'absolute', right: '10px', bottom: '10px', width: '40px', height: '40px', background: (isLoading || (!userInput.trim() && !audioTranscript)) ? theme.bgTertiary : theme.gradient, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: (isLoading || (!userInput.trim() && !audioTranscript)) ? 'none' : theme.shadowGlow }}>➤</button>
          </form>
          {stage === STAGES.INPUT && (
            <div style={{ marginTop: '8px', fontSize: '11px', color: theme.textMuted, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>💡 支持输入：主题、大纲、详细想法、会议纪要、文档素材</span>
              <span style={{ color: theme.border }}>|</span>
              <span>按 Enter 换行，点击按钮发送</span>
            </div>
          )}
        </div>
      </div>

      {/* 右侧预览区 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: theme.bg, position: 'relative', zIndex: 1 }}>
        <div className="glass-effect" style={{ padding: '14px 26px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: theme.bgSecondary }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ fontSize: '14px', fontWeight: 600, color: theme.text }}>预览</span>{(outline.length > 0 || styleDesign.length > 0) && (<Tag color="secondary">{outline.length || styleDesign.length} 页</Tag>)}</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => window.location.reload()} style={{ padding: '10px 16px', background: 'transparent', color: theme.textMuted, border: `1px solid ${theme.border}`, borderRadius: '10px', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}><span>🔄</span> 新建</button>
            {stage === STAGES.COMPLETE && pptImages.some(i => i?.filename) && (<><button onClick={handleDownload} style={{ padding: '10px 18px', background: theme.gradient, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', boxShadow: theme.shadowGlow }}><span>⬇️</span> 下载 ZIP</button><button onClick={handleDownloadPdf} style={{ padding: '10px 18px', background: `linear-gradient(135deg, ${theme.secondary}, ${theme.accent})`, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}><span>📄</span> 下载 PDF</button></>)}
          </div>
        </div>
        
        <div style={{ flex: 1, display: 'flex', padding: '26px', gap: '20px', overflow: 'hidden' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '100%', maxWidth: '960px', background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: '20px', overflow: 'hidden', boxShadow: `${theme.shadowLg}, 0 0 40px ${theme.primaryLight}` }}>
                <div style={{ height: '4px', background: theme.gradient, backgroundSize: '200% 200%', animation: 'gradientMove 3s ease infinite' }} />
                <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%' }}><div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bg }}>{renderPreview()}</div></div>
              </div>
            </div>
            {(outline.length > 0 || styleDesign.length > 0) && (<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginTop: '20px' }}><button onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0} style={{ width: '40px', height: '40px', background: theme.bgCard, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: '10px', opacity: currentPage === 0 ? 0.4 : 1, fontSize: '16px', fontWeight: 600 }}>←</button><div style={{ padding: '10px 20px', background: theme.bgCard, borderRadius: '10px', border: `1px solid ${theme.border}` }}><span style={{ fontSize: '14px', fontWeight: 600, color: theme.primary }}>{currentPage + 1}</span><span style={{ fontSize: '14px', color: theme.textMuted }}> / {outline.length || styleDesign.length}</span></div><button onClick={() => setCurrentPage(Math.min((outline.length || styleDesign.length) - 1, currentPage + 1))} disabled={currentPage >= (outline.length || styleDesign.length) - 1} style={{ width: '40px', height: '40px', background: theme.bgCard, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: '10px', opacity: currentPage >= (outline.length || styleDesign.length) - 1 ? 0.4 : 1, fontSize: '16px', fontWeight: 600 }}>→</button></div>)}
          </div>
          {renderThumbnails()}
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} title="高级设置" subtitle="以下均为可选项，不填写则按默认风格生成">{renderSettingsModalContent()}</Modal>
      <Modal isOpen={showStyleConfirmModal} onClose={() => setShowStyleConfirmModal(false)} title="确认风格设置" subtitle="检查并调整设计原则，然后开始生成">{renderStyleConfirmModal()}</Modal>
      <Modal isOpen={showPromptEditModal} onClose={() => setShowPromptEditModal(false)} title={'编辑提示词 - ' + (editingPromptKey ? STYLE_PRESETS[editingPromptKey]?.name : '')} subtitle="修改后将保存到当前会话" width="700px">
        <div>
          <textarea value={tempEditPrompt} onChange={(e) => setTempEditPrompt(e.target.value)} style={{ width: '100%', height: '400px', padding: '16px', background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: '12px', fontSize: '13px', color: theme.text, resize: 'none', lineHeight: 1.7, fontFamily: 'inherit' }} placeholder="输入详细的设计原则..." />
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button onClick={() => { if (editingPromptKey) setTempEditPrompt(DEFAULT_STYLE_PROMPTS[editingPromptKey] || ''); }} style={{ padding: '14px 20px', background: 'transparent', border: `1px solid ${theme.warning}`, borderRadius: '12px', color: theme.warning, fontSize: '13px', fontWeight: 500 }}>🔄 恢复默认</button>
            <button onClick={() => setShowPromptEditModal(false)} style={{ flex: 1, padding: '14px', background: theme.bgTertiary, border: `1px solid ${theme.border}`, borderRadius: '12px', color: theme.textSecondary, fontSize: '13px' }}>取消</button>
            <button onClick={handleSavePrompt} style={{ flex: 1, padding: '14px', background: theme.gradient, border: 'none', borderRadius: '12px', color: '#fff', fontSize: '13px', fontWeight: 600 }}>✓ 保存</button>
          </div>
        </div>
      </Modal>
      
      {/* 页面素材上传Modal */}
      <Modal isOpen={showMaterialUploadModal} onClose={() => setShowMaterialUploadModal(false)} title="📎 上传页面素材" subtitle="选择页码并上传图片/表格，素材将直接嵌入该页PPT" width="650px" isLoading={isUploadingPageMaterial}>
        {isUploadingPageMaterial && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, borderRadius: '24px' }}>
            <div style={{ textAlign: 'center', color: '#fff' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px', animation: 'pulse 1.5s ease-in-out infinite' }}>⏳</div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>正在上传素材...</div>
              <div style={{ fontSize: '12px', marginTop: '6px', opacity: 0.8 }}>请勿关闭窗口</div>
            </div>
          </div>
        )}
        <div style={{ padding: '16px 0' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: theme.text, marginBottom: '10px' }}>选择目标页面</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px', maxHeight: '180px', overflowY: 'auto', padding: '4px' }}>
              {outline.map((page, i) => (
                <button key={i} onClick={() => setSelectedMaterialPage(i)} style={{ padding: '10px 6px', background: selectedMaterialPage === i ? `linear-gradient(135deg, ${theme.primaryLight}, ${theme.bgTertiary})` : theme.bgTertiary, border: selectedMaterialPage === i ? `2px solid ${theme.primary}` : `1px solid ${theme.border}`, borderRadius: '10px', cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: selectedMaterialPage === i ? theme.primary : theme.text }}>{i + 1}</div>
                  <div style={{ fontSize: '9px', color: theme.textMuted, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{page.title?.slice(0, 6) || `第${i + 1}页`}</div>
                  {pageMaterials[i]?.length > 0 && <div style={{ marginTop: '4px', fontSize: '9px', padding: '1px 4px', background: theme.success, borderRadius: '6px', color: '#fff' }}>{pageMaterials[i].length}个</div>}
                </button>
              ))}
            </div>
          </div>
          
          {/* 素材类型Tab */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', padding: '4px', background: theme.bgTertiary, borderRadius: '10px' }}>
            <button onClick={() => setMaterialUploadTab('image')} style={{ flex: 1, padding: '10px', background: materialUploadTab === 'image' ? theme.bgCard : 'transparent', border: 'none', borderRadius: '8px', color: materialUploadTab === 'image' ? theme.primary : theme.textSecondary, fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: materialUploadTab === 'image' ? theme.shadow : 'none' }}>🖼️ 图片</button>
            <button onClick={() => setMaterialUploadTab('table')} style={{ flex: 1, padding: '10px', background: materialUploadTab === 'table' ? theme.bgCard : 'transparent', border: 'none', borderRadius: '8px', color: materialUploadTab === 'table' ? theme.primary : theme.textSecondary, fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: materialUploadTab === 'table' ? theme.shadow : 'none' }}>📊 表格文件</button>
            <button onClick={() => setMaterialUploadTab('paste')} style={{ flex: 1, padding: '10px', background: materialUploadTab === 'paste' ? theme.bgCard : 'transparent', border: 'none', borderRadius: '8px', color: materialUploadTab === 'paste' ? theme.primary : theme.textSecondary, fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: materialUploadTab === 'paste' ? theme.shadow : 'none' }}>📋 粘贴表格</button>
          </div>
          
          {/* 图片上传 */}
          {materialUploadTab === 'image' && (
            <div style={{ padding: '24px', background: theme.bgTertiary, borderRadius: '14px', border: `2px dashed ${theme.border}`, textAlign: 'center' }}>
              <input ref={pageMaterialInputRef} type="file" accept=".png,.jpg,.jpeg,.gif,.webp" onChange={handlePageMaterialSelect} style={{ display: 'none' }} />
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>🖼️</div>
              <button onClick={() => pageMaterialInputRef.current?.click()} disabled={isUploadingPageMaterial} style={{ padding: '12px 28px', background: isUploadingPageMaterial ? theme.bgTertiary : theme.gradient, border: 'none', borderRadius: '10px', color: isUploadingPageMaterial ? theme.textMuted : '#fff', fontSize: '13px', fontWeight: 600, cursor: isUploadingPageMaterial ? 'not-allowed' : 'pointer', boxShadow: isUploadingPageMaterial ? 'none' : theme.shadowGlow }}>{isUploadingPageMaterial ? '上传中...' : `上传图片到第 ${selectedMaterialPage + 1} 页`}</button>
              <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '12px' }}>支持 PNG、JPG、GIF、WebP（最大 5MB）<br/>上传后可添加描述，帮助AI理解图片含义</div>
            </div>
          )}
          
          {/* 表格文件上传 */}
          {materialUploadTab === 'table' && (
            <div style={{ padding: '24px', background: theme.bgTertiary, borderRadius: '14px', border: `2px dashed ${theme.border}`, textAlign: 'center' }}>
              <input ref={pageMaterialInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handlePageMaterialSelect} style={{ display: 'none' }} />
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>📊</div>
              <button onClick={() => pageMaterialInputRef.current?.click()} disabled={isUploadingPageMaterial} style={{ padding: '12px 28px', background: isUploadingPageMaterial ? theme.bgTertiary : theme.gradient, border: 'none', borderRadius: '10px', color: isUploadingPageMaterial ? theme.textMuted : '#fff', fontSize: '13px', fontWeight: 600, cursor: isUploadingPageMaterial ? 'not-allowed' : 'pointer', boxShadow: isUploadingPageMaterial ? 'none' : theme.shadowGlow }}>{isUploadingPageMaterial ? '上传中...' : `上传表格到第 ${selectedMaterialPage + 1} 页`}</button>
              <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '12px' }}>支持 Excel (.xlsx, .xls) 和 CSV 文件<br/>上传后可添加描述，帮助AI理解数据含义</div>
            </div>
          )}
          
          {/* 粘贴表格 */}
          {materialUploadTab === 'paste' && (
            <div style={{ padding: '20px', background: theme.bgTertiary, borderRadius: '14px', border: `1px solid ${theme.border}` }}>
              <div style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '10px' }}>从Excel复制表格后，粘贴到下方：</div>
              <textarea value={pasteTableText} onChange={(e) => setPasteTableText(e.target.value)} disabled={isUploadingPageMaterial} placeholder="在此粘贴表格内容...&#10;&#10;示例格式：&#10;产品名称 | 销售额 | 增长率&#10;产品A | 100万 | 15%&#10;产品B | 80万 | 10%" style={{ width: '100%', height: '120px', padding: '12px', background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: '10px', fontSize: '13px', color: theme.text, resize: 'none', fontFamily: 'monospace', lineHeight: 1.5 }} />
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '6px' }}>📝 描述（可选）- 帮助AI理解表格含义：</div>
                <input type="text" value={pasteTableDesc} onChange={(e) => setPasteTableDesc(e.target.value)} disabled={isUploadingPageMaterial} placeholder="例如：Q3各产品销售额对比表" style={{ width: '100%', padding: '10px 12px', background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: '8px', fontSize: '13px', color: theme.text }} />
              </div>
              <button onClick={handlePasteTableSubmit} disabled={!pasteTableText.trim() || isUploadingPageMaterial} style={{ marginTop: '12px', width: '100%', padding: '12px', background: (pasteTableText.trim() && !isUploadingPageMaterial) ? theme.gradient : theme.bgTertiary, border: 'none', borderRadius: '10px', color: (pasteTableText.trim() && !isUploadingPageMaterial) ? '#fff' : theme.textMuted, fontSize: '13px', fontWeight: 600, cursor: (pasteTableText.trim() && !isUploadingPageMaterial) ? 'pointer' : 'not-allowed' }}>{isUploadingPageMaterial ? '添加中...' : `添加表格到第 ${selectedMaterialPage + 1} 页`}</button>
            </div>
          )}
          
          {pageMaterials[selectedMaterialPage]?.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: theme.text, marginBottom: '8px' }}>第 {selectedMaterialPage + 1} 页已添加的素材</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {pageMaterials[selectedMaterialPage].map((m, mi) => (
                  <div key={mi} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: theme.bgInput, borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '16px' }}>{m.type === 'image' ? '🖼️' : '📊'}</span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '12px', color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.filename}</div>
                        {m.description && <div style={{ fontSize: '10px', color: theme.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>💬 {m.description}</div>}
                      </div>
                      <span style={{ fontSize: '10px', color: theme.textMuted, padding: '2px 6px', background: theme.bgTertiary, borderRadius: '4px', flexShrink: 0 }}>{m.type === 'image' ? '图片' : '表格'}</span>
                    </div>
                    <button onClick={() => handleRemovePageMaterial(selectedMaterialPage, mi)} style={{ padding: '4px 10px', background: 'transparent', border: `1px solid ${theme.error}`, borderRadius: '4px', color: theme.error, fontSize: '11px', cursor: 'pointer', marginLeft: '8px', flexShrink: 0 }}>移除</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {totalMaterialCount > 0 && (
            <div style={{ marginTop: '16px', padding: '12px', background: `${theme.success}15`, borderRadius: '10px', border: `1px solid ${theme.success}30` }}>
              <div style={{ fontSize: '12px', color: theme.success, fontWeight: 600 }}>✅ 已添加 {totalMaterialCount} 个素材到 {Object.keys(pageMaterials).filter(k => pageMaterials[k]?.length > 0).length} 页</div>
            </div>
          )}
        </div>
      </Modal>
      
      {/* 素材描述输入弹窗 */}
      <Modal isOpen={showDescModal} onClose={() => { if (!isUploadingPageMaterial) { setShowDescModal(false); setPendingFile(null); } }} title="📝 添加素材描述" subtitle="描述可以帮助AI更好地理解素材用途（可选）" width="450px" isLoading={isUploadingPageMaterial}>
        {pendingFile && (
          <div style={{ padding: '16px 0', position: 'relative' }}>
            {isUploadingPageMaterial && (
              <div style={{ position: 'absolute', inset: '-16px', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, borderRadius: '12px' }}>
                <div style={{ textAlign: 'center', color: '#fff' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px', animation: 'pulse 1.5s ease-in-out infinite' }}>⏳</div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>正在上传...</div>
                  <div style={{ fontSize: '12px', marginTop: '6px', opacity: 0.8 }}>请勿关闭窗口</div>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '12px 16px', background: theme.bgTertiary, borderRadius: '10px' }}>
              <span style={{ fontSize: '28px' }}>{['xlsx', 'xls', 'csv'].includes(pendingFile.name.split('.').pop()?.toLowerCase()) ? '📊' : '🖼️'}</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: theme.text }}>{pendingFile.name}</div>
                <div style={{ fontSize: '12px', color: theme.textMuted }}>将添加到第 {selectedMaterialPage + 1} 页</div>
              </div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: theme.text, marginBottom: '8px' }}>素材描述</div>
              <input 
                type="text" 
                value={pendingFileDesc} 
                onChange={(e) => setPendingFileDesc(e.target.value)} 
                placeholder="例如：Q3销售数据对比图、公司组织架构表..." 
                disabled={isUploadingPageMaterial}
                style={{ 
                  width: '100%', 
                  padding: '12px 14px', 
                  background: theme.bgInput, 
                  border: `1px solid ${theme.border}`, 
                  borderRadius: '10px', 
                  fontSize: '14px', 
                  color: theme.text 
                }}
                autoFocus
              />
              <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '8px' }}>
                💡 描述会作为上下文传给AI，帮助生成更符合预期的PPT页面
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => { setShowDescModal(false); setPendingFile(null); }} 
                disabled={isUploadingPageMaterial}
                style={{ 
                  flex: 1, 
                  padding: '12px', 
                  background: theme.bgTertiary, 
                  border: `1px solid ${theme.border}`, 
                  borderRadius: '10px', 
                  color: theme.textSecondary, 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  cursor: isUploadingPageMaterial ? 'not-allowed' : 'pointer',
                  opacity: isUploadingPageMaterial ? 0.5 : 1
                }}
              >
                取消
              </button>
              <button 
                onClick={handleConfirmUploadWithDesc} 
                disabled={isUploadingPageMaterial}
                style={{ 
                  flex: 1, 
                  padding: '12px', 
                  background: isUploadingPageMaterial ? theme.bgTertiary : theme.gradient, 
                  border: 'none', 
                  borderRadius: '10px', 
                  color: isUploadingPageMaterial ? theme.textMuted : '#fff', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  cursor: isUploadingPageMaterial ? 'not-allowed' : 'pointer',
                  boxShadow: isUploadingPageMaterial ? 'none' : theme.shadowGlow
                }}
              >
                {isUploadingPageMaterial ? '上传中...' : '✓ 确认上传'}
              </button>
            </div>
          </div>
        )}
      </Modal>
      
      {/* 支持性文档预览确认Modal */}
      <Modal isOpen={showDocPreviewModal} onClose={() => setShowDocPreviewModal(false)} title="📄 文档解析完成" subtitle="请确认抽取的内容是否正确" width="600px">
        {docPreviewData && (
          <div style={{ padding: '16px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '12px 16px', background: `${theme.success}15`, borderRadius: '10px', border: `1px solid ${theme.success}30` }}>
              <span style={{ fontSize: '24px' }}>✅</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: theme.text }}>{docPreviewData.filename}</div>
                <div style={{ fontSize: '12px', color: theme.textMuted }}>已抽取 {docPreviewData.textLength} 字</div>
              </div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: theme.text, marginBottom: '8px' }}>📝 内容预览</div>
              <div style={{ 
                maxHeight: '300px', 
                overflowY: 'auto', 
                padding: '14px', 
                background: theme.bgTertiary, 
                borderRadius: '10px', 
                border: `1px solid ${theme.border}`,
                fontSize: '12px',
                color: theme.textSecondary,
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace'
              }}>
                {docPreviewData.textPreview}
              </div>
            </div>
            
            <div style={{ padding: '12px', background: theme.bgInput, borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: theme.textMuted, lineHeight: 1.6 }}>
                💡 <strong>提示：</strong>文档内容将作为参考信息，帮助AI更好地理解您的需求并生成大纲。您仍可继续上传更多文档或调整其他设置。
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setShowDocPreviewModal(false)} 
                style={{ 
                  flex: 1, 
                  padding: '14px', 
                  background: theme.gradient, 
                  border: 'none', 
                  borderRadius: '12px', 
                  color: '#fff', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  boxShadow: theme.shadowGlow
                }}
              >
                ✓ 确认，继续设置
              </button>
            </div>
          </div>
        )}
      </Modal>
      
      {/* 生成完成提示Modal */}
      <Modal isOpen={showCompleteTip} onClose={() => setShowCompleteTip(false)} title="🎉 PPT 生成完成！" subtitle="您可以下载或微调" width="520px">
        <div style={{ padding: '10px 0' }}>
          {/* 下载区域 */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            marginBottom: '24px' 
          }}>
            <button 
              onClick={() => { handleDownload(); setShowCompleteTip(false); }} 
              style={{ 
                flex: 1, 
                padding: '16px', 
                background: theme.gradient, 
                border: 'none', 
                borderRadius: '14px', 
                color: '#fff', 
                fontSize: '15px', 
                fontWeight: 700, 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: theme.shadowGlow
              }}
            >
              <span style={{ fontSize: '20px' }}>⬇️</span> 下载 ZIP
            </button>
            <button 
              onClick={() => { handleDownloadPdf(); setShowCompleteTip(false); }} 
              style={{ 
                flex: 1, 
                padding: '16px', 
                background: `linear-gradient(135deg, ${theme.secondary}, ${theme.accent})`, 
                border: 'none', 
                borderRadius: '14px', 
                color: '#fff', 
                fontSize: '15px', 
                fontWeight: 700, 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '20px' }}>📄</span> 下载 PDF
            </button>
          </div>
          
          {/* 微调提示 */}
          <div style={{ 
            padding: '20px', 
            background: `linear-gradient(135deg, ${theme.primaryLight}, ${theme.bgTertiary})`, 
            borderRadius: '16px', 
            border: `2px solid ${theme.primary}`,
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '28px' }}>🎯</span>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: theme.primary }}>需要微调某一页？</div>
                <div style={{ fontSize: '13px', color: theme.textSecondary, marginTop: '4px' }}>点击左侧缩略图，即可进入微调模式</div>
              </div>
            </div>
            <div style={{ 
              padding: '14px 16px', 
              background: theme.bgCard, 
              borderRadius: '10px',
              fontSize: '13px',
              color: theme.textMuted,
              lineHeight: 1.7
            }}>
              <div style={{ marginBottom: '8px' }}>✨ <strong style={{ color: theme.text }}>微调模式说明：</strong></div>
              <div>• 仅修改您提到的部分，其他元素保持不变</div>
              <div>• 例如："把标题改成蓝色" 或 "增加一个数据图表"</div>
              <div>• 整体风格保持一致</div>
            </div>
          </div>
          
          <button 
            onClick={() => setShowCompleteTip(false)} 
            style={{ 
              width: '100%',
              padding: '14px', 
              background: theme.bgTertiary, 
              border: `1px solid ${theme.border}`, 
              borderRadius: '12px', 
              color: theme.textSecondary, 
              fontSize: '14px', 
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            我知道了，稍后处理
          </button>
        </div>
      </Modal>
      
      {/* WPS PDF转PPT提示 */}
      <Modal isOpen={showWpsTip} onClose={() => setShowWpsTip(false)} title="🎉 大功告成！" subtitle="PDF已开始下载" width="500px">
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '15px', color: theme.text, marginBottom: '24px', lineHeight: 1.8 }}>
            您可以使用 WPS 的<span style={{ color: theme.primary, fontWeight: 700 }}>【PDF转PPT】</span>工具，<br/>
            将下载的 PDF 转为 PPT 进行进一步调整。
          </div>
          <img 
            src="/wps-tip.png" 
            alt="WPS PDF转PPT" 
            style={{ 
              maxWidth: '100%', 
              borderRadius: '12px', 
              boxShadow: theme.shadow,
              border: `1px solid ${theme.border}`
            }} 
          />
          <button 
            onClick={() => setShowWpsTip(false)} 
            style={{ 
              marginTop: '24px',
              padding: '14px 40px', 
              background: theme.gradient, 
              border: 'none', 
              borderRadius: '12px', 
              color: '#fff', 
              fontSize: '14px', 
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            知道了
          </button>
        </div>
      </Modal>
    </div>
  );
}

// ============ 登录页面 ============
function LoginPage({ onLoginSuccess, isDark, onThemeToggle }) {
  const theme = useTheme();
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) { setError('请输入邀请码'); return; }
    setIsLoading(true); setError('');
    try {
      const result = await api.login(inviteCode);
      if (result.success) {
        setSuccess(true);
        localStorage.setItem('slidebot_logged_in', 'true');
        setTimeout(() => onLoginSuccess(), 800);
      } else setError(result.message || '邀请码无效');
    } catch { setError('网络错误，请重试'); } finally { setIsLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: theme.bg, position: 'relative', overflow: 'hidden' }}>
      <TechBackground />

      <div style={{ flex: 1, display: 'flex', position: 'relative', zIndex: 1 }}>
        {/* 左侧品牌区域 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px' }}>
          <div style={{ animation: 'float 4s ease-in-out infinite' }}><Logo size={140} /></div>
          <h1 style={{ fontSize: '56px', fontWeight: 900, marginTop: '32px', marginBottom: '16px', minHeight: '70px' }}>
            <span style={{ color: theme.text }}>
              <TypewriterText 
                texts={['SlideBot AI 2.0', 'AI 智能 PPT', '一键生成演示']} 
                typingSpeed={120} 
                deleteSpeed={60} 
                pauseDuration={2500} 
              />
            </span>
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <p style={{ fontSize: '18px', color: theme.textSecondary, margin: 0 }}>智能演示文稿生成平台</p>
            <span style={{ padding: '4px 12px', background: theme.accent, color: '#fff', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>Beta 测试版</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Tag color="primary" size="md">🧠 AI 智能生成</Tag>
            <Tag color="secondary" size="md">🎨 多种风格</Tag>
            <Tag color="accent" size="md">📄 文档支持</Tag>
            <Tag color="success" size="md">📊 表格素材</Tag>
          </div>
        </div>

        {/* 右侧登录区域 */}
        <div style={{ width: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' }}>
        <div className="glass-effect" style={{ width: '100%', maxWidth: '380px', padding: '40px', background: theme.bgCard, borderRadius: '28px', border: `1px solid ${theme.border}`, boxShadow: `${theme.shadowLg}, 0 0 60px ${theme.primaryLight}`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: theme.gradient, backgroundSize: '200% 200%', animation: 'gradientMove 3s ease infinite' }} />
          <div style={{ position: 'absolute', top: '20px', right: '20px' }}><ThemeToggle isDark={isDark} onToggle={onThemeToggle} /></div>
          <div style={{ textAlign: 'center', marginBottom: '36px', marginTop: '8px' }}>
            <Logo size={56} />
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: theme.text, marginTop: '16px' }}>欢迎使用</h2>
            <p style={{ fontSize: '14px', color: theme.textMuted, marginTop: '8px' }}>输入邀请码开始体验</p>
          </div>

          {success ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: `linear-gradient(135deg, ${theme.success}, ${theme.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: `0 0 30px ${theme.success}40` }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <div style={{ fontSize: '18px', color: theme.success, fontWeight: 700 }}>登录成功</div>
              <div style={{ fontSize: '13px', color: theme.textMuted, marginTop: '8px' }}>正在跳转...</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <input type="text" value={inviteCode} onChange={(e) => { setInviteCode(e.target.value.toUpperCase()); setError(''); }} placeholder="请输入邀请码" disabled={isLoading} style={{ width: '100%', padding: '18px', fontSize: '18px', fontWeight: 700, letterSpacing: '3px', background: theme.bgInput, border: `2px solid ${error ? theme.error : theme.border}`, borderRadius: '14px', color: theme.text, textAlign: 'center', marginBottom: '20px' }} />
              {error && (<div style={{ marginBottom: '20px', padding: '14px', background: `${theme.error}15`, borderRadius: '10px', color: theme.error, fontSize: '13px', textAlign: 'center', border: `1px solid ${theme.error}30` }}>{error}</div>)}
              <button type="submit" disabled={isLoading || !inviteCode.trim()} style={{ width: '100%', padding: '18px', fontSize: '16px', fontWeight: 700, color: '#fff', background: (isLoading || !inviteCode.trim()) ? theme.bgTertiary : theme.gradient, border: 'none', borderRadius: '14px', boxShadow: (isLoading || !inviteCode.trim()) ? 'none' : theme.shadowGlow }}>{isLoading ? '验证中...' : '🚀 进入系统'}</button>
            </form>
          )}
        </div>
      </div>
      </div>

      {/* 底部信息栏 */}
      <div style={{ padding: '20px 60px', borderTop: `1px solid ${theme.border}`, background: `${theme.bgCard}60`, backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '60px', position: 'relative', zIndex: 1 }}>
        {/* 联系我们 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '12px', color: theme.textSecondary }}>
          <span style={{ fontWeight: 600, color: theme.text }}>📞 联系我们</span>
          <span>电话: +86 13916723286 / +86 18116316020</span>
          <span>邮箱: <a href="mailto:tonyqinshanghai@gmail.com" style={{ color: theme.primary, textDecoration: 'none' }}>tonyqinshanghai@gmail.com</a></span>
        </div>
      </div>
    </div>
  );
}

// ============ 主App ============
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('slidebot_logged_in') === 'true');
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('slidebot_theme');
    return saved ? saved === 'dark' : true;
  });

  const theme = isDark ? themes.dark : themes.light;
  const handleThemeToggle = () => { const next = !isDark; setIsDark(next); localStorage.setItem('slidebot_theme', next ? 'dark' : 'light'); };
  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => { localStorage.removeItem('slidebot_logged_in'); setIsLoggedIn(false); };

  return (
    <ThemeContext.Provider value={theme}>
      <GlobalStyles theme={theme} />
      {isLoggedIn ? <SlideBotApp onLogout={handleLogout} isDark={isDark} onThemeToggle={handleThemeToggle} /> : <LoginPage onLoginSuccess={handleLogin} isDark={isDark} onThemeToggle={handleThemeToggle} />}
    </ThemeContext.Provider>
  );
}

export default App;
