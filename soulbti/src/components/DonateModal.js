import React from 'react';
import './DonateModal.css';

function DonateModal({ onClose }) {
  return (
    <div className="donate-modal-overlay" onClick={onClose}>
      <div className="donate-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>×</button>
        
        <div className="donate-content">
          <div className="donate-icon">☕</div>
          <h3>请我喝杯咖啡</h3>
          <p className="donate-desc">
            如果这个项目对你有帮助<br/>
            可以请我喝杯咖啡支持一下～
          </p>
          
          <div className="qr-code-container">
            <img 
              src="/images/zhifubao.jpg" 
              alt="支付宝收款码" 
              className="qr-code"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="qr-placeholder" style={{display: 'none'}}>
              <p>收款码加载失败</p>
              <p className="qr-tip">路径: /public/images/zhifubao.jpg</p>
            </div>
          </div>
          
          <p className="donate-thanks">❤️ 感谢你的支持！</p>
        </div>
      </div>
    </div>
  );
}

export default DonateModal;
