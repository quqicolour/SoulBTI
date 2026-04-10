import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  calculateDimensions, 
  calculateMBTI, 
  calculateSBTIMatch,
  getDimensionDetails,
  generateRadarData
} from '../utils/calculator';
import { generateRoast, generateShareText, generateProfileDescription } from '../utils/deepseek';
import questionsData from '../data/sbti-questions.json';
import personalitiesData from '../data/sbti-personalities.json';
import mbtiData from '../data/mbti-data.json';
import ProfileCard from './ProfileCard';
import DonateModal from './DonateModal';
import './ResultPage.css';

function ResultPage({ answers, onRetake }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [dimensions, setDimensions] = useState(null);
  const [mbtiType, setMbtiType] = useState('');
  const [sbtiMatch, setSbtiMatch] = useState(null);
  const [roast, setRoast] = useState('');
  const [profileDesc, setProfileDesc] = useState('');
  const [loading, setLoading] = useState({
    roast: true,
    capture: false
  });
  const [shareUrl, setShareUrl] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showDonate, setShowDonate] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  
  const profileCardRef = useRef(null);

  // 初始化数据
  useEffect(() => {
    const dims = calculateDimensions(answers, questionsData.questions);
    setDimensions(dims);
    
    const mbti = calculateMBTI(dims);
    setMbtiType(mbti);
    
    const matches = calculateSBTIMatch(dims, personalitiesData.personalities);
    setSbtiMatch(matches[0]);

    // 生成分享链接（使用hash方式，适配Vercel等静态托管）
    const params = new URLSearchParams({
      sbti: matches[0].code,
      mbti: mbti,
      score: matches[0].matchScore
    });
    // 使用hash路由方式，避免Vercel刷新404问题
    setShareUrl(`${window.location.origin}/#share?${params.toString()}`);

    // 生成人格描述
    const desc = generateProfileDescription(matches[0].code, matches[0].name, mbti, dims);
    setProfileDesc(desc.description);
  }, [answers]);

  // 获取AI毒舌评语
  useEffect(() => {
    if (sbtiMatch && mbtiType && dimensions) {
      generateRoast(sbtiMatch.code, sbtiMatch.name, mbtiType, dimensions)
        .then(text => {
          setRoast(text);
          setLoading(prev => ({ ...prev, roast: false }));
        })
        .catch(() => {
          setLoading(prev => ({ ...prev, roast: false }));
        });
    }
  }, [sbtiMatch, mbtiType, dimensions]);

  // 截图功能
  const handleCapture = useCallback(async () => {
    if (profileCardRef.current) {
      setLoading(prev => ({ ...prev, capture: true }));
      try {
        const result = await profileCardRef.current.capture();
        if (result) {
          setCapturedImage(result.dataUrl);
          return result;
        }
      } catch (error) {
        console.error('截图失败:', error);
      } finally {
        setLoading(prev => ({ ...prev, capture: false }));
      }
    }
    return null;
  }, []);

  // 预览截图
  const handlePreview = useCallback(async () => {
    if (!capturedImage) {
      await handleCapture();
    }
    setShowImageModal(true);
  }, [capturedImage, handleCapture]);

  // 下载图片
  const handleDownload = useCallback(async () => {
    const result = capturedImage ? { dataUrl: capturedImage } : await handleCapture();
    if (result) {
      const link = document.createElement('a');
      link.download = `SBTI人格画像_${sbtiMatch?.code}_${mbtiType}.png`;
      link.href = result.dataUrl;
      link.click();
    }
  }, [capturedImage, handleCapture, sbtiMatch, mbtiType]);

  // 复制分享链接
  const handleCopyLink = useCallback(async () => {
    const shareText = generateShareText(sbtiMatch?.code, sbtiMatch?.name, mbtiType);
    const fullText = `${shareText}\n\n${shareUrl}`;
    
    try {
      await navigator.clipboard.writeText(fullText);
      alert('分享链接已复制到剪贴板！');
    } catch (err) {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = fullText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('分享链接已复制到剪贴板！');
    }
  }, [shareUrl, sbtiMatch, mbtiType]);

  // 分享到社交媒体
  const handleShare = useCallback((platform) => {
    const shareText = generateShareText(sbtiMatch?.code, sbtiMatch?.name, mbtiType);
    const encodedText = encodeURIComponent(shareText + '\n' + shareUrl);
    
    let shareLink = '';
    switch (platform) {
      case 'weibo':
        shareLink = `https://service.weibo.com/share/share.php?title=${encodedText}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      default:
        handleCopyLink();
        return;
    }
    
    window.open(shareLink, '_blank', 'width=600,height=400');
  }, [shareUrl, sbtiMatch, mbtiType, handleCopyLink]);

  // Web Share API
  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `我的SBTI人格：${sbtiMatch?.name}`,
          text: generateShareText(sbtiMatch?.code, sbtiMatch?.name, mbtiType),
          url: shareUrl
        });
      } catch (err) {
        // 用户取消
      }
    } else {
      setShowShareModal(true);
    }
  }, [shareUrl, sbtiMatch, mbtiType]);

  if (!dimensions || !sbtiMatch) {
    return <div className="loading">正在分析你的人格...</div>;
  }

  const mbtiInfo = mbtiData.types[mbtiType];
  const radarData = generateRadarData(dimensions);

  return (
    <div className="result-page">
      <div className="result-header">
        <h1>🎉 测试完成！</h1>
        <p>你的人格画像已生成</p>
      </div>

      {/* 快捷操作栏 */}
      <div className="action-bar">
        <button className="action-btn primary" onClick={handlePreview} disabled={loading.capture}>
          {loading.capture ? '生成中...' : '👁️ 预览人格画像'}
        </button>
        <button className="action-btn" onClick={handleNativeShare}>
          🔗 分享结果
        </button>
        <button className="action-btn" onClick={onRetake}>
          🔄 重新测试
        </button>
      </div>

      {/* 人格画像卡片（可截图） */}
      <div className="profile-section" id="profile-card">
        <ProfileCard
          ref={profileCardRef}
          sbtiType={sbtiMatch.code}
          sbtiName={sbtiMatch.name}
          sbtiTagline={sbtiMatch.tagline}
          mbtiType={mbtiType}
          mbtiName={mbtiInfo?.name || mbtiType}
          dimensions={dimensions}
          roast={roast}
          profileDesc={profileDesc}
          matchScore={sbtiMatch.matchScore}
        />
      </div>

      {/* 标签页 */}
      <div className="result-tabs">
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          详细分析
        </button>
        <button 
          className={`tab-btn ${activeTab === 'sbti' ? 'active' : ''}`}
          onClick={() => setActiveTab('sbti')}
        >
          SBTI人格
        </button>
        <button 
          className={`tab-btn ${activeTab === 'mbti' ? 'active' : ''}`}
          onClick={() => setActiveTab('mbti')}
        >
          MBTI类型
        </button>
        <button 
          className={`tab-btn ${activeTab === 'dimensions' ? 'active' : ''}`}
          onClick={() => setActiveTab('dimensions')}
        >
          维度分析
        </button>
      </div>

      <div className="result-content">
        {activeTab === 'profile' && (
          <div className="profile-analysis">
            <div className="analysis-card">
              <h3>🎭 人格组合解读</h3>
              <p className="analysis-text">
                你是<strong>{sbtiMatch.name}({sbtiMatch.code})</strong>型人格，
                同时拥有<strong>{mbtiType}</strong>的特质。
                这种独特的组合让你在人群中脱颖而出，
                既有{sbtiMatch.name}的{sbtiMatch.tagline}特质，
                又具备{mbtiInfo?.name || mbtiType}的{mbtiInfo?.traits?.join('、') || '独特'}风格。
              </p>
            </div>

            <div className="analysis-card">
              <h3>💡 核心特质</h3>
              <div className="traits-grid">
                {sbtiMatch.traits.map((trait, index) => (
                  <div key={index} className="trait-item">
                    <span className="trait-number">{index + 1}</span>
                    <span className="trait-text">{trait}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="analysis-card">
              <h3>💼 适合职业</h3>
              <div className="careers-grid">
                {sbtiMatch.careers.map((career, index) => (
                  <span key={index} className="career-badge">{career}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sbti' && (
          <SBTIResult 
            personality={sbtiMatch} 
            matchScore={sbtiMatch.matchScore}
          />
        )}
        
        {activeTab === 'mbti' && (
          <MBTIResult 
            type={mbtiType} 
            info={mbtiInfo}
            dimensions={dimensions}
          />
        )}
        
        {activeTab === 'dimensions' && (
          <DimensionsResult 
            dimensions={dimensions}
            radarData={radarData}
          />
        )}
      </div>

      {/* 分享弹窗 */}
      {showShareModal && (
        <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={e => e.stopPropagation()}>
            <h3>分享到</h3>
            <div className="share-options">
              <button className="share-option" onClick={() => handleShare('weibo')}>
                <span className="share-icon">📱</span>
                <span>微博</span>
              </button>
              <button className="share-option" onClick={() => handleShare('twitter')}>
                <span className="share-icon">🐦</span>
                <span>Twitter</span>
              </button>
              <button className="share-option" onClick={handleCopyLink}>
                <span className="share-icon">📋</span>
                <span>复制链接</span>
              </button>
            </div>
            <button className="close-modal" onClick={() => setShowShareModal(false)}>
              关闭
            </button>
          </div>
        </div>
      )}

      {/* 图片预览弹窗 */}
      {showImageModal && capturedImage && (
        <div className="image-modal-overlay" onClick={() => setShowImageModal(false)}>
          <div className="image-modal" onClick={e => e.stopPropagation()}>
            <h3>🎨 你的人格画像</h3>
            <div className="image-preview">
              <img src={capturedImage} alt="人格画像" />
            </div>
            <div className="image-actions">
              <button className="btn-download" onClick={handleDownload}>
                💾 保存到本地
              </button>
              <button className="btn-close" onClick={() => setShowImageModal(false)}>
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="result-footer">
        <p>SBTI · 仅供娱乐，别当真</p>
        
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

function SBTIResult({ personality, matchScore }) {
  return (
    <div className="sbti-result">
      <div className="personality-card">
        <div className="match-score">
          <div className="score-circle">
            <span className="score-value">{matchScore}%</span>
            <span className="score-label">匹配度</span>
          </div>
        </div>
        
        <div className="personality-header">
          <div className="personality-code">{personality.code}</div>
          <h2 className="personality-name">{personality.name}</h2>
          <p className="personality-tagline">「{personality.tagline}」</p>
        </div>
        
        <p className="personality-desc">{personality.description}</p>
        
        <div className="traits-section">
          <h3>核心特质</h3>
          <div className="traits-list">
            {personality.traits.map((trait, index) => (
              <span key={index} className="trait-tag">{trait}</span>
            ))}
          </div>
        </div>
        
        <div className="careers-section">
          <h3>适合职业</h3>
          <div className="careers-list">
            {personality.careers.map((career, index) => (
              <span key={index} className="career-tag">{career}</span>
            ))}
          </div>
        </div>

        {personality.mbtiMatch && (
          <div className="mbti-match-section">
            <h3>相近MBTI类型</h3>
            <div className="mbti-match-list">
              {personality.mbtiMatch.map((type, index) => (
                <span key={index} className="mbti-match-tag">{type}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MBTIResult({ type, info, dimensions }) {
  if (!info) return <div className="no-data">暂无该类型的详细数据</div>;

  const ei = dimensions.energy?.score > 0 ? 'E' : 'I';
  const sn = dimensions.information?.score > 0 ? 'N' : 'S';
  const tf = dimensions.decision?.score > 0 ? 'F' : 'T';
  const jp = dimensions.lifestyle?.score > 0 ? 'P' : 'J';

  return (
    <div className="mbti-result">
      <div className="mbti-card">
        <div className="mbti-type-large">{type}</div>
        <h2 className="mbti-name">{info.name}</h2>
        <p className="mbti-desc">{info.description}</p>
        
        <div className="mbti-letters">
          <div className={`letter ${ei === 'E' ? 'active' : ''}`}>
            <span className="letter-char">E</span>
            <span className="letter-name">外向</span>
            <span className="letter-score">{Math.abs(dimensions.energy?.score || 0).toFixed(1)}</span>
          </div>
          <div className={`letter ${ei === 'I' ? 'active' : ''}`}>
            <span className="letter-char">I</span>
            <span className="letter-name">内向</span>
          </div>
          
          <div className={`letter ${sn === 'S' ? 'active' : ''}`}>
            <span className="letter-char">S</span>
            <span className="letter-name">实感</span>
            <span className="letter-score">{Math.abs(dimensions.information?.score || 0).toFixed(1)}</span>
          </div>
          <div className={`letter ${sn === 'N' ? 'active' : ''}`}>
            <span className="letter-char">N</span>
            <span className="letter-name">直觉</span>
          </div>
          
          <div className={`letter ${tf === 'T' ? 'active' : ''}`}>
            <span className="letter-char">T</span>
            <span className="letter-name">思考</span>
            <span className="letter-score">{Math.abs(dimensions.decision?.score || 0).toFixed(1)}</span>
          </div>
          <div className={`letter ${tf === 'F' ? 'active' : ''}`}>
            <span className="letter-char">F</span>
            <span className="letter-name">情感</span>
          </div>
          
          <div className={`letter ${jp === 'J' ? 'active' : ''}`}>
            <span className="letter-char">J</span>
            <span className="letter-name">判断</span>
            <span className="letter-score">{Math.abs(dimensions.lifestyle?.score || 0).toFixed(1)}</span>
          </div>
          <div className={`letter ${jp === 'P' ? 'active' : ''}`}>
            <span className="letter-char">P</span>
            <span className="letter-name">知觉</span>
          </div>
        </div>
        
        <div className="mbti-traits">
          <h3>主要特征</h3>
          <div className="traits-list">
            {info.traits.map((trait, index) => (
              <span key={index} className="trait-tag">{trait}</span>
            ))}
          </div>
        </div>
        
        <div className="mbti-careers">
          <h3>适合职业</h3>
          <div className="careers-list">
            {info.careers.map((career, index) => (
              <span key={index} className="career-tag">{career}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DimensionsResult({ dimensions, radarData }) {
  return (
    <div className="dimensions-result">
      <h3>15维度详细分析</h3>
      <div className="dimensions-grid">
        {Object.keys(dimensions).map(key => {
          const detail = getDimensionDetails(key, dimensions[key].score);
          if (!detail) return null;
          
          return (
            <div key={key} className="dimension-item">
              <div className="dimension-header">
                <span className="dimension-code">{detail.code}</span>
                <span className="dimension-intensity">{detail.intensity}</span>
              </div>
              <div className="dimension-bar">
                <div 
                  className="dimension-fill"
                  style={{ 
                    width: `${Math.abs(dimensions[key].score) / 2 * 100}%`,
                    background: dimensions[key].score > 0 ? '#f59e0b' : '#78716c'
                  }}
                ></div>
              </div>
              <p className="dimension-desc">{detail.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ResultPage;
