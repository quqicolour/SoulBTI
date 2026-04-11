import React, { useState, useEffect } from 'react';
import DonateModal from './DonateModal';
import { 
  getApiKey, 
  saveApiKey, 
  clearApiKey, 
  testDeepSeekConnection
} from '../utils/deepseek';
import './HomePage.css';

function HomePage({ onStartTest }) {
  const [showDonate, setShowDonate] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [testStatus, setTestStatus] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedGender, setSelectedGender] = useState(null); // 'male' or 'female'

  // 加载已保存的 API Key（仅用于判断是否有key，不显示在输入框）
  const [hasSavedKey, setHasSavedKey] = useState(false);
  
  useEffect(() => {
    const savedKey = getApiKey();
    setHasSavedKey(!!savedKey);
  }, []);

  // 处理 API Key 输入
  const handleApiKeyChange = (e) => {
    setApiKey(e.target.value);
    setIsSaved(false);
    setTestStatus(null);
  };

  // 测试连接
  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestStatus({
        success: false,
        message: '请输入 API Key'
      });
      return;
    }

    setIsTesting(true);
    setTestStatus(null);
    
    const result = await testDeepSeekConnection(apiKey.trim());
    setTestStatus(result);
    setIsTesting(false);
  };

  // 保存 API Key
  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      return;
    }
    
    if (saveApiKey(apiKey.trim())) {
      setIsSaved(true);
      setHasSavedKey(true);
      setApiKey(''); // 清空输入框，保护隐私
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  // 清除 API Key
  const handleClearApiKey = () => {
    clearApiKey();
    setHasSavedKey(false);
    setApiKey('');
    setTestStatus(null);
    setIsSaved(false);
  };

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="sparkle">✦</div>
        <h1>看清世界，认清自己</h1>
        <p className="subtitle">找到属于你的精准人格画像</p>
        
        <div className="features">
          <div className="feature">
            <div className="feature-icon">✦</div>
            <div className="feature-title">15维度</div>
            <div className="feature-desc">比MBTI更全面</div>
          </div>
          <div className="feature">
            <div className="feature-icon">🎯</div>
            <div className="feature-title">27种人格</div>
            <div className="feature-desc">包含隐藏人格</div>
          </div>
          <div className="feature">
            <div className="feature-icon">🎭</div>
            <div className="feature-title">双系统</div>
            <div className="feature-desc">SBTI + MBTI</div>
          </div>
        </div>
      </div>

      {/* 性别选择 */}
      <div className="gender-section">
        <h3>选择你的性别</h3>
        <div className="gender-cards">
          <button 
            className={`gender-card ${selectedGender === 'male' ? 'selected' : ''}`}
            onClick={() => setSelectedGender('male')}
          >
            <div className="gender-icon">👨</div>
            <div className="gender-label">男生</div>
          </button>
          
          <button 
            className={`gender-card ${selectedGender === 'female' ? 'selected' : ''}`}
            onClick={() => setSelectedGender('female')}
          >
            <div className="gender-icon">👩</div>
            <div className="gender-label">女生</div>
          </button>
        </div>
      </div>

      {/* 测试模式选择 */}
      <div className={`test-options ${selectedGender ? 'enabled' : 'disabled'}`}>
        <h3>选择测试模式</h3>
        <div className="option-cards">
          <button 
            className="option-card"
            onClick={() => selectedGender && onStartTest(60, selectedGender)}
            disabled={!selectedGender}
          >
            <div className="option-number">60</div>
            <div className="option-label">题快速版</div>
            <div className="option-time">约5-8分钟</div>
            <div className="option-desc">适合快速了解自己的核心人格特征</div>
          </button>
          
          <button 
            className="option-card recommended"
            onClick={() => selectedGender && onStartTest(80, selectedGender)}
            disabled={!selectedGender}
          >
            <div className="recommended-badge">推荐</div>
            <div className="option-number">80</div>
            <div className="option-label">题完整版</div>
            <div className="option-time">约10-15分钟</div>
            <div className="option-desc">全面深入的人格分析，更精准的结果</div>
          </button>
        </div>
        {!selectedGender && (
          <p className="select-gender-hint">👆 请先选择性别，再选择测试模式</p>
        )}
      </div>

      {/* AI 设置区域 */}
      <div className="ai-settings-section">
        <button 
          className="settings-toggle"
          onClick={() => setShowSettings(!showSettings)}
        >
          <span className="settings-icon">🤖</span>
          <span className="settings-text">
            {hasSavedKey ? 'AI 功能已配置 ✅' : '配置 DeepSeek AI'}
          </span>
          <span className={`settings-arrow ${showSettings ? 'open' : ''}`}>▼</span>
        </button>
        
        {showSettings && (
          <div className="settings-panel">
            <div className="settings-header">
              <h4>🧠 DeepSeek AI 配置</h4>
              <p className="settings-desc">
                配置 API Key 后，将启用 AI 生成的毒舌评语和理想伴侣推荐
              </p>
            </div>
            
            <div className="api-key-input-group">
              <label>
                API Key
                {hasSavedKey && <span className="saved-badge">已保存</span>}
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={handleApiKeyChange}
                placeholder={hasSavedKey ? "已保存 API Key，输入新值可覆盖" : "请输入 DeepSeek API Key（sk-开头）"}
                className="api-key-input"
              />
              <p className="api-key-hint">
                <a 
                  href="https://platform.deepseek.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  还没有 Key？前往 DeepSeek 平台获取 →
                </a>
              </p>
            </div>
            
            <div className="settings-actions">
              <button 
                className="btn-test"
                onClick={handleTestConnection}
                disabled={isTesting || !apiKey.trim()}
              >
                {isTesting ? '测试中...' : '🧪 测试连接'}
              </button>
              
              <button 
                className="btn-save"
                onClick={handleSaveApiKey}
                disabled={!apiKey.trim()}
              >
                {isSaved ? '✅ 已保存' : '💾 保存到本地'}
              </button>
              
              {hasSavedKey && (
                <button 
                  className="btn-clear"
                  onClick={handleClearApiKey}
                >
                  🗑️ 清除已保存的Key
                </button>
              )}
            </div>
            
            {testStatus && (
              <div className={`test-result ${testStatus.success ? 'success' : 'error'}`}>
                <div className="test-result-title">
                  {testStatus.success ? '✅' : '❌'} {testStatus.message}
                </div>
                <div className="test-result-detail">{testStatus.detail}</div>
              </div>
            )}
            
            <div className="settings-info">
              <p>💡 提示：API Key 仅保存在您的浏览器本地，不会上传到任何服务器</p>
              <p>💡 不配置 AI 功能也能正常使用，将使用本地默认内容</p>
            </div>
          </div>
        )}
      </div>

      <footer className="footer">
        <div className="footer-main">
          <p className="footer-tagline">嘿嘿 · 仅供娱乐，别当真</p>
          
          <div className="footer-actions">
            <button className="action-btn donate" onClick={() => setShowDonate(true)}>
              <span className="btn-icon">☕</span>
              <span className="btn-text">请我喝咖啡</span>
            </button>
            
            <a 
              href="https://space.bilibili.com/417038183" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="action-btn reference"
            >
              <span className="btn-icon">📺</span>
              <span className="btn-text">参考作者</span>
            </a>
          </div>
          
          <div className="footer-social">
            <a href="https://x.com/whalehat_oylm" target="_blank" rel="noopener noreferrer" className="social-link" title="Follow on X">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span>@whalehat_oylm</span>
            </a>
            <a href="https://github.com/quqicolour/SoulBTI" target="_blank" rel="noopener noreferrer" className="social-link" title="Star on GitHub">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>

      {showDonate && <DonateModal onClose={() => setShowDonate(false)} />}
    </div>
  );
}

export default HomePage;
