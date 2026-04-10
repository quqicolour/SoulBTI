import React, { useState, useCallback, useEffect } from 'react';
import HomePage from './components/HomePage';
import TestPage from './components/TestPage';
import ResultPage from './components/ResultPage';
import SharePage from './components/SharePage';
import questionsData from './data/sbti-questions.json';
import './App.css';

function App() {
  const [page, setPage] = useState('home'); // home, test, result, share
  const [testMode, setTestMode] = useState(null); // 60 or 80
  const [answers, setAnswers] = useState([]);

  // 检测是否是分享链接（支持Vercel部署）
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
    
    // 优先使用search参数，如果没有则尝试hash参数
    const sbti = searchParams.get('sbti') || hashParams.get('sbti');
    const mbti = searchParams.get('mbti') || hashParams.get('mbti');
    
    if (sbti && mbti) {
      setPage('share');
    }
  }, []);

  // 开始测试
  const handleStartTest = useCallback((mode) => {
    setTestMode(mode);
    setPage('test');
    setAnswers([]);
    // 清除分享参数
    if (window.history.replaceState) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // 完成测试
  const handleComplete = useCallback((finalAnswers) => {
    setAnswers(finalAnswers);
    setPage('result');
  }, []);

  // 退出测试
  const handleExit = useCallback(() => {
    if (window.confirm('确定要退出测试吗？你的答案将不会保存。')) {
      setPage('home');
      setTestMode(null);
      setAnswers([]);
    }
  }, []);

  // 重新测试
  const handleRetake = useCallback(() => {
    setPage('home');
    setTestMode(null);
    setAnswers([]);
  }, []);

  // 获取测试题目
  const getTestQuestions = () => {
    const allQuestions = questionsData.questions;
    
    if (testMode === 60) {
      // 60题模式：确保所有15个维度都有题目被选中
      const questionsByDimension = {};
      
      // 按维度分组
      allQuestions.forEach(q => {
        if (!questionsByDimension[q.dimension]) {
          questionsByDimension[q.dimension] = [];
        }
        questionsByDimension[q.dimension].push(q);
      });
      
      const selectedQuestions = [];
      const dimensionIds = Object.keys(questionsByDimension);
      
      // 第一步：每个维度至少选2道题
      dimensionIds.forEach(dim => {
        const questions = questionsByDimension[dim];
        const shuffled = [...questions].sort(() => Math.random() - 0.5);
        selectedQuestions.push(...shuffled.slice(0, 2));
      });
      
      // 第二步：如果不够60道，从MBTI相关题目中补充
      if (selectedQuestions.length < 60) {
        const mbtiQuestions = allQuestions.filter(q => q.mbti && !selectedQuestions.includes(q));
        const shuffledMbti = [...mbtiQuestions].sort(() => Math.random() - 0.5);
        const needed = 60 - selectedQuestions.length;
        selectedQuestions.push(...shuffledMbti.slice(0, needed));
      }
      
      // 第三步：如果还不够，从剩余题目中随机补充
      if (selectedQuestions.length < 60) {
        const remaining = allQuestions.filter(q => !selectedQuestions.includes(q));
        const shuffled = [...remaining].sort(() => Math.random() - 0.5);
        const needed = 60 - selectedQuestions.length;
        selectedQuestions.push(...shuffled.slice(0, needed));
      }
      
      // 打乱顺序
      return selectedQuestions.sort(() => Math.random() - 0.5);
    }
    
    // 80题模式：返回所有题目并打乱
    return [...allQuestions].sort(() => Math.random() - 0.5);
  };

  return (
    <div className="App">
      {page === 'home' && (
        <HomePage onStartTest={handleStartTest} />
      )}
      
      {page === 'test' && testMode && (
        <TestPage
          questions={getTestQuestions()}
          totalQuestions={testMode}
          onComplete={handleComplete}
          onExit={handleExit}
        />
      )}
      
      {page === 'result' && (
        <ResultPage
          answers={answers}
          onRetake={handleRetake}
        />
      )}

      {page === 'share' && (
        <SharePage
          onStartTest={handleStartTest}
        />
      )}
    </div>
  );
}

export default App;
