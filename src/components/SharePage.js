import React, { useEffect, useState } from 'react';
import personalitiesData from '../data/sbti-personalities.json';
import mbtiData from '../data/mbti-data.json';
import DonateModal from './DonateModal';
import './SharePage.css';

function SharePage({ onStartTest }) {
  const [params, setParams] = useState(null);
  const [personality, setPersonality] = useState(null);
  const [mbtiInfo, setMbtiInfo] = useState(null);
  const [showDonate, setShowDonate] = useState(false);

  useEffect(() => {
    // 解析URL参数（支持search和hash两种方式）
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
    
    // 优先使用search参数，如果没有则尝试hash参数
    const sbtiCode = searchParams.get('sbti') || hashParams.get('sbti');
    const mbtiType = searchParams.get('mbti') || hashParams.get('mbti');
    const score = searchParams.get('score') || hashParams.get('score');

    if (sbtiCode && mbtiType) {
      setParams({ sbti: sbtiCode, mbti: mbtiType, score });
      
      // 查找人格信息
      const sbtiPersonality = personalitiesData.personalities.find(p => p.code === sbtiCode);
      setPersonality(sbtiPersonality);
      
      const mbtiTypeInfo = mbtiData.types[mbtiType];
      setMbtiInfo(mbtiTypeInfo);
    }
  }, []);

  if (!params) {
    return (
      <div className="share-page">
        <div className="share-error">
          <div className="error-icon">🤔</div>
          <h2>链接似乎有问题</h2>
          <p>该分享链接可能已过期或格式不正确</p>
          <button className="btn-primary pulse" onClick={onStartTest}>
            测测我是什么人格
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="share-page">
      <div className="share-card">
        <div className="share-header">
          <div className="share-logo">✦ SBTI</div>
          <p>有人分享了自己的人格画像</p>
        </div>

        <div className="share-result">
          {personality ? (
            <>
              <div className="share-sbti">
                <div className="share-code">{personality.code}</div>
                <div className="share-name">{personality.name}</div>
                <div className="share-tagline">「{personality.tagline}」</div>
                {params.score && (
                  <div className="share-score">匹配度: {params.score}%</div>
                )}
              </div>

              <div className="share-mbti">
                <span className="mbti-label">MBTI</span>
                <span className="mbti-value">{params.mbti}</span>
                {mbtiInfo && <span className="mbti-desc">{mbtiInfo.name}</span>}
              </div>

              <div className="share-traits">
                {personality.traits.slice(0, 3).map((trait, index) => (
                  <span key={index} className="share-trait">{trait}</span>
                ))}
              </div>
            </>
          ) : (
            <div className="share-simple">
              <div className="share-code">{params.sbti}</div>
              <div className="share-mbti-simple">MBTI: {params.mbti}</div>
              {params.score && (
                <div className="share-score">匹配度: {params.score}%</div>
              )}
            </div>
          )}
        </div>

        <div className="share-cta">
          <h3>想知道你是什么奇葩人格吗？</h3>
          <p>80道题，15维度，27种人格 + 16种MBTI类型</p>
          <button className="btn-primary pulse" onClick={onStartTest}>
            立即开测 👉
          </button>
        </div>
      </div>

      <footer className="share-footer">
        <p>SBTI · 找到属于你的精准（奇葩）人格画像</p>
        
        <div className="footer-links">
          <button className="donate-btn" onClick={() => setShowDonate(true)}>
            <span className="donate-icon">☕</span>
            <span>请我喝咖啡</span>
          </button>
          <span className="divider">·</span>
          <a 
            href="https://space.bilibili.com/417038183" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="ref-link"
          >
            <span className="ref-icon">📺</span>
            <span>参考作者</span>
          </a>
        </div>
        
        <div className="social-links">
          <a href="https://x.com/whalehat_oylm" target="_blank" rel="noopener noreferrer" className="social-link">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span>X</span>
          </a>
          <span className="divider">·</span>
          <a href="https://github.com/quqicolour/SoulBTI" target="_blank" rel="noopener noreferrer" className="social-link">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span>GitHub</span>
          </a>
        </div>
      </footer>

      {showDonate && <DonateModal onClose={() => setShowDonate(false)} />}
    </div>
  );
}

export default SharePage;
