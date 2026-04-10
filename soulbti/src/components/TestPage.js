import React, { useState, useEffect } from 'react';
import './TestPage.css';

function TestPage({ questions, totalQuestions, onComplete, onExit }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleSelectOption = (optionIndex) => {
    setSelectedOption(optionIndex);
    const option = currentQuestion.options[optionIndex];
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        value: option.value,
        dimension: currentQuestion.dimension
      }
    }));

    // 自动进入下一题（延迟300ms让用户看到选择效果）
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
      }
    }, 300);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      // 恢复之前的选择
      const prevAnswer = answers[questions[currentIndex - 1].id];
      if (prevAnswer) {
        const question = questions[currentIndex - 1];
        const optionIndex = question.options.findIndex(o => o.value === prevAnswer.value);
        setSelectedOption(optionIndex);
      } else {
        setSelectedOption(null);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
    }
  };

  const handleSubmit = () => {
    const answersArray = Object.values(answers);
    if (answersArray.length >= totalQuestions * 0.8) {
      onComplete(answersArray);
    }
  };

  // 恢复当前题目的选择
  useEffect(() => {
    const currentAnswer = answers[currentQuestion.id];
    if (currentAnswer) {
      const optionIndex = currentQuestion.options.findIndex(o => o.value === currentAnswer.value);
      setSelectedOption(optionIndex);
    } else {
      setSelectedOption(null);
    }
  }, [currentIndex, currentQuestion, answers]);

  const isLastQuestion = currentIndex === questions.length - 1;
  const hasAnswered = Object.keys(answers).length;

  return (
    <div className="test-page">
      <nav className="test-nav">
        <button className="nav-back" onClick={onExit}>
          ← 返回
        </button>
        <div className="nav-progress">
          第 {currentIndex + 1} / {questions.length} 题
        </div>
        <div className="nav-spacer"></div>
      </nav>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="question-card">
        <div className="question-badge">
          第 {currentIndex + 1} 题
          <span className="dimension-tag">{getDimensionLabel(currentQuestion.dimension)}</span>
        </div>
        
        <h2 className="question-text">{currentQuestion.text}</h2>

        <div className="options-list">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              className={`option-btn ${selectedOption === index ? 'selected' : ''}`}
              onClick={() => handleSelectOption(index)}
            >
              <span className="option-label">{['A', 'B', 'C', 'D'][index]}</span>
              <span className="option-text">{option.label}</span>
              <span className="option-side">{option.side}</span>
            </button>
          ))}
        </div>

        <div className="question-actions">
          <button 
            className="btn-secondary"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            ← 上一题
          </button>
          
          {isLastQuestion ? (
            <button 
              className="btn-primary"
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < questions.length * 0.8}
            >
              查看结果
            </button>
          ) : (
            <button 
              className="btn-secondary"
              onClick={handleNext}
            >
              跳过 →
            </button>
          )}
        </div>

        <div className="answer-progress">
          已回答 {hasAnswered} / {questions.length} 题
          {hasAnswered >= questions.length * 0.8 && (
            <span className="ready-badge">可以查看结果了</span>
          )}
        </div>
      </div>
    </div>
  );
}

function getDimensionLabel(dimension) {
  const labels = {
    energy: '能量来源',
    information: '认知方式',
    decision: '决策方式',
    lifestyle: '生活态度',
    selfworth: '自我价值',
    emotion: '情感表达',
    risk: '风险偏好',
    control: '控制欲望',
    independence: '独立性',
    outlook: '世界观',
    reality: '现实感',
    competition: '竞争意识',
    attachment: '依恋模式',
    stability: '情绪稳定',
    creativity: '创造力'
  };
  return labels[dimension] || dimension;
}

export default TestPage;
