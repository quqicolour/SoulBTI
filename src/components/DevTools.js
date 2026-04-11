/**
 * 开发者工具 - 用于测试 DeepSeek 连接等
 * 仅在开发环境显示
 */

import React, { useState } from 'react';
import { testDeepSeekConnection } from '../utils/deepseek-test';
import './DevTools.css';

function DevTools() {
  const [isOpen, setIsOpen] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  // 只在开发环境显示
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const handleTestDeepSeek = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await testDeepSeekConnection();
    setTestResult(result);
    setTesting(false);
  };

  return (
    <div className="devtools">
      <button 
        className="devtools-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        🔧
      </button>
      
      {isOpen && (
        <div className="devtools-panel">
          <h3>开发者工具</h3>
          
          <div className="devtools-section">
            <h4>API 测试</h4>
            <button 
              className="devtools-btn"
              onClick={handleTestDeepSeek}
              disabled={testing}
            >
              {testing ? '测试中...' : '🧪 测试 DeepSeek 连接'}
            </button>
            
            {testResult && (
              <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
                <pre>{testResult.message}</pre>
              </div>
            )}
          </div>
          
          <div className="devtools-info">
            <p>环境: {process.env.NODE_ENV}</p>
            <p>API Key: {process.env.REACT_APP_DEEPSEEK_KEY ? '已配置' : '未配置'}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DevTools;
