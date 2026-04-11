/**
 * 星空背景组件
 * 创建梦幻星空动画效果
 */

import React from 'react';
import './StarryBackground.css';

function StarryBackground() {
  // 生成随机星星
  const generateStars = (count, className) => {
    const stars = [];
    for (let i = 0; i < count; i++) {
      const style = {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${3 + Math.random() * 4}s`,
      };
      stars.push(<div key={`${className}-${i}`} className={className} style={style} />);
    }
    return stars;
  };

  // 生成流星
  const generateMeteors = (count) => {
    const meteors = [];
    for (let i = 0; i < count; i++) {
      const style = {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 50}%`,
        animationDelay: `${Math.random() * 10}s`,
        animationDuration: `${2 + Math.random() * 3}s`,
      };
      meteors.push(<div key={`meteor-${i}`} className="meteor" style={style} />);
    }
    return meteors;
  };

  // 生成星云
  const generateNebulas = () => {
    const nebulas = [
      { top: '10%', left: '10%', color: 'rgba(139, 92, 246, 0.3)', size: '400px' },
      { top: '60%', left: '70%', color: 'rgba(236, 72, 153, 0.2)', size: '500px' },
      { top: '30%', left: '80%', color: 'rgba(59, 130, 246, 0.25)', size: '350px' },
      { top: '70%', left: '20%', color: 'rgba(168, 85, 247, 0.2)', size: '450px' },
    ];
    
    return nebulas.map((neb, index) => (
      <div
        key={`nebula-${index}`}
        className="nebula"
        style={{
          top: neb.top,
          left: neb.left,
          width: neb.size,
          height: neb.size,
          background: `radial-gradient(circle, ${neb.color} 0%, transparent 70%)`,
        }}
      />
    ));
  };

  return (
    <div className="starry-background">
      {/* 渐变背景 */}
      <div className="sky-gradient" />
      
      {/* 星云 */}
      {generateNebulas()}
      
      {/* 星星层 */}
      <div className="stars-container">
        {generateStars(50, 'star tiny')}
        {generateStars(30, 'star small')}
        {generateStars(20, 'star medium')}
        {generateStars(10, 'star large')}
      </div>
      
      {/* 流星 */}
      <div className="meteors-container">
        {generateMeteors(5)}
      </div>
      
      {/* 月亮 */}
      <div className="moon">
        <div className="moon-glow" />
        <div className="moon-body" />
      </div>
    </div>
  );
}

export default StarryBackground;
