/**
 * SBTI/MBTI 人格计算工具
 */

// 计算各维度得分
export function calculateDimensions(answers, questions) {
  const dimensions = {};
  
  // 初始化所有维度
  const dimensionIds = [
    'energy', 'information', 'decision', 'lifestyle',
    'selfworth', 'emotion', 'risk', 'control',
    'independence', 'outlook', 'reality', 'competition',
    'attachment', 'stability', 'creativity'
  ];
  
  dimensionIds.forEach(id => {
    dimensions[id] = { score: 0, count: 0 };
  });
  
  // 累加各维度得分
  answers.forEach(answer => {
    const question = questions.find(q => q.id === answer.questionId);
    if (question && dimensions[question.dimension]) {
      dimensions[question.dimension].score += answer.value;
      dimensions[question.dimension].count += 1;
    }
  });
  
  // 计算平均值并确定倾向
  const result = {};
  Object.keys(dimensions).forEach(key => {
    const dim = dimensions[key];
    if (dim.count > 0) {
      result[key] = {
        score: dim.score / dim.count,
        rawScore: dim.score
      };
    }
  });
  
  return result;
}

// 计算MBTI类型
export function calculateMBTI(dimensions) {
  const mbti = [];
  
  // E/I - 能量来源
  if (dimensions.energy) {
    mbti.push(dimensions.energy.score > 0 ? 'E' : 'I');
  }
  
  // S/N - 认知方式
  if (dimensions.information) {
    mbti.push(dimensions.information.score > 0 ? 'N' : 'S');
  }
  
  // T/F - 决策方式
  if (dimensions.decision) {
    mbti.push(dimensions.decision.score > 0 ? 'F' : 'T');
  }
  
  // J/P - 生活态度
  if (dimensions.lifestyle) {
    mbti.push(dimensions.lifestyle.score > 0 ? 'P' : 'J');
  }
  
  return mbti.join('');
}

// 计算SBTI人格匹配度
export function calculateSBTIMatch(dimensions, personalities) {
  const matches = personalities.map(personality => {
    let matchScore = 0;
    let totalWeight = 0;
    
    Object.keys(personality.dimensions).forEach(dimKey => {
      const expectedValue = personality.dimensions[dimKey];
      const actualValue = dimensions[dimKey]?.rawScore || 0;
      
      // 计算匹配度（越接近预期值匹配度越高）
      const diff = Math.abs(actualValue - expectedValue);
      const weight = Math.abs(expectedValue) / 3; // 权重基于期望值的强度
      
      matchScore += (1 - Math.min(diff / 4, 1)) * weight;
      totalWeight += weight;
    });
    
    const finalScore = totalWeight > 0 ? (matchScore / totalWeight) * 100 : 0;
    
    return {
      ...personality,
      matchScore: Math.round(finalScore)
    };
  });
  
  // 按匹配度排序
  matches.sort((a, b) => b.matchScore - a.matchScore);
  
  return matches;
}

// 获取维度代码
export function getDimensionCode(dimensionId, score) {
  const codeMap = {
    energy: score > 0 ? 'E' : 'I',
    information: score > 0 ? 'N' : 'S',
    decision: score > 0 ? 'F' : 'T',
    lifestyle: score > 0 ? 'P' : 'J',
    selfworth: score > 0 ? 'H' : 'L',
    emotion: score > 0 ? 'O' : 'R',
    risk: score > 0 ? 'D' : 'C',
    control: score > 0 ? 'A' : 'G',
    independence: score > 0 ? 'U' : 'V',
    outlook: score > 0 ? 'P' : 'M',
    reality: score > 0 ? 'I' : 'B',
    competition: score > 0 ? 'W' : 'K',
    attachment: score > 0 ? 'X' : 'S',
    stability: score > 0 ? 'Z' : 'Y',
    creativity: score > 0 ? 'N' : 'Q'
  };
  
  return codeMap[dimensionId] || '';
}

// 获取维度详情
export function getDimensionDetails(dimensionId, score) {
  const isPositive = score > 0;
  const absScore = Math.abs(score);
  let intensity = '中等';
  
  if (absScore >= 1.5) intensity = '强烈';
  else if (absScore >= 0.5) intensity = '明显';
  else intensity = '轻微';
  
  const details = {
    energy: {
      positive: { name: '外放', desc: '从社交中获取能量' },
      negative: { name: '内敛', desc: '从独处中获取能量' }
    },
    information: {
      positive: { name: '直觉', desc: '关注整体和可能性' },
      negative: { name: '实感', desc: '关注具体细节' }
    },
    decision: {
      positive: { name: '感性', desc: '基于价值观做决定' },
      negative: { name: '理性', desc: '基于逻辑做决定' }
    },
    lifestyle: {
      positive: { name: '随性', desc: '喜欢灵活应变' },
      negative: { name: '计划', desc: '喜欢有序安排' }
    },
    selfworth: {
      positive: { name: '高自尊', desc: '相信自己的价值' },
      negative: { name: '低自尊', desc: '常自我怀疑' }
    },
    emotion: {
      positive: { name: '开放', desc: '直接表达情感' },
      negative: { name: '压抑', desc: '内敛不表露' }
    },
    risk: {
      positive: { name: '冒险', desc: '追求刺激挑战' },
      negative: { name: '保守', desc: '规避风险' }
    },
    control: {
      positive: { name: '掌控', desc: '控制欲强' },
      negative: { name: '放松', desc: '顺其自然' }
    },
    independence: {
      positive: { name: '独立', desc: '自给自足' },
      negative: { name: '依赖', desc: '需要他人支持' }
    },
    outlook: {
      positive: { name: '乐观', desc: '看到机会与希望' },
      negative: { name: '悲观', desc: '看到问题与风险' }
    },
    reality: {
      positive: { name: '理想', desc: '追求理想' },
      negative: { name: '务实', desc: '脚踏实地' }
    },
    competition: {
      positive: { name: '竞争', desc: '追求领先胜出' },
      negative: { name: '合作', desc: '注重团队协作' }
    },
    attachment: {
      positive: { name: '亲密', desc: '渴望亲密关系' },
      negative: { name: '疏离', desc: '保持距离' }
    },
    stability: {
      positive: { name: '稳定', desc: '情绪平稳' },
      negative: { name: '波动', desc: '情绪起伏大' }
    },
    creativity: {
      positive: { name: '创新', desc: '突破创新' },
      negative: { name: '传统', desc: '遵循常规' }
    }
  };
  
  const detail = details[dimensionId];
  if (!detail) return null;
  
  return {
    ...detail,
    code: isPositive ? detail.positive.name : detail.negative.name,
    desc: isPositive ? detail.positive.desc : detail.negative.desc,
    intensity,
    score: score.toFixed(2)
  };
}

// 生成雷达图数据
export function generateRadarData(dimensions) {
  const dimensionNames = {
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
  
  return Object.keys(dimensions).map(key => ({
    dimension: dimensionNames[key] || key,
    score: Math.abs(dimensions[key].score),
    fullMark: 2,
    code: getDimensionCode(key, dimensions[key].score)
  }));
}
