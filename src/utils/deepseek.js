/**
 * DeepSeek AI 服务
 * 用于生成毒舌评语和理想伴侣推荐
 */

const DEFAULT_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const STORAGE_KEY = 'sbti_deepseek_api_key';

/**
 * 获取 API Key（优先从 localStorage，其次是环境变量）
 */
export function getApiKey() {
  // 优先从 localStorage 读取
  const storedKey = localStorage.getItem(STORAGE_KEY);
  if (storedKey && storedKey.trim()) {
    return storedKey.trim();
  }
  
  // 其次从环境变量读取
  const envKey = process.env.REACT_APP_DEEPSEEK_KEY;
  if (envKey && envKey !== 'your-deepseek-api-key-here') {
    return envKey;
  }
  
  return null;
}

/**
 * 保存 API Key 到 localStorage
 */
export function saveApiKey(key) {
  if (key && key.trim()) {
    localStorage.setItem(STORAGE_KEY, key.trim());
    return true;
  }
  return false;
}

/**
 * 清除保存的 API Key
 */
export function clearApiKey() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * 检查 API Key 是否已配置
 */
export function hasApiKey() {
  return !!getApiKey();
}

/**
 * 获取 API URL
 */
export function getApiUrl() {
  return process.env.REACT_APP_DEEPSEEK_URL || DEFAULT_API_URL;
}

/**
 * 测试 DeepSeek API 连接
 */
export async function testDeepSeekConnection(apiKey) {
  const key = apiKey || getApiKey();
  const url = getApiUrl();
  
  if (!key) {
    return {
      success: false,
      message: '未配置 API Key',
      detail: '请先输入 DeepSeek API Key'
    };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: '你好，请回复"DeepSeek API 连接测试成功"'
          }
        ],
        temperature: 0.1,
        max_tokens: 50
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || `HTTP ${response.status}`;
      
      if (response.status === 401) {
        return {
          success: false,
          message: 'API Key 无效或已过期',
          detail: '请检查 API Key 是否正确，或前往 DeepSeek 平台重新获取'
        };
      }
      
      return {
        success: false,
        message: 'API 请求失败',
        detail: errorMsg
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    return {
      success: true,
      message: '连接成功',
      detail: content || 'API 响应正常'
    };
  } catch (error) {
    return {
      success: false,
      message: '网络连接异常',
      detail: error.message
    };
  }
}

/**
 * 生成毒舌评语
 * @param {string} sbtiType - SBTI人格类型
 * @param {string} sbtiName - SBTI人格名称
 * @param {string} mbtiType - MBTI类型
 * @param {object} dimensions - 维度得分
 * @returns {Promise<string>} - 毒舌评语
 */
export async function generateRoast(sbtiType, sbtiName, mbtiType, dimensions) {
  const apiKey = getApiKey();
  const apiUrl = getApiUrl();
  
  // 如果没有API Key，返回本地生成的毒舌评语
  if (!apiKey) {
    return generateLocalRoast(sbtiType, sbtiName, mbtiType, dimensions);
  }

  try {
    const prompt = buildRoastPrompt(sbtiType, sbtiName, mbtiType, dimensions);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一位犀利、毒舌但幽默的人格分析师。你的任务是用人格测试结果被测者进行" roast "（吐槽），语言要犀利、扎心但又好笑，不要太刻薄伤人。控制在200字以内。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('DeepSeek API调用失败:', error);
    return generateLocalRoast(sbtiType, sbtiName, mbtiType, dimensions);
  }
}

/**
 * 构建毒舌评语Prompt
 */
function buildRoastPrompt(sbtiType, sbtiName, mbtiType, dimensions) {
  const dimensionDesc = Object.keys(dimensions)
    .filter(key => dimensions[key] && typeof dimensions[key].score === 'number')
    .map(key => {
    const dim = dimensions[key];
    const score = dim.score;
    let tendency = '';
    
    switch(key) {
      case 'energy': tendency = score > 0 ? '外向' : '内向'; break;
      case 'information': tendency = score > 0 ? '直觉' : '实感'; break;
      case 'decision': tendency = score > 0 ? '感性' : '理性'; break;
      case 'lifestyle': tendency = score > 0 ? '随性' : '计划'; break;
      case 'selfworth': tendency = score > 0 ? '高自尊' : '低自尊'; break;
      case 'emotion': tendency = score > 0 ? '情感开放' : '情感压抑'; break;
      case 'risk': tendency = score > 0 ? '爱冒险' : '保守'; break;
      case 'control': tendency = score > 0 ? '控制欲强' : '顺其自然'; break;
      case 'independence': tendency = score > 0 ? '独立' : '依赖'; break;
      case 'outlook': tendency = score > 0 ? '乐观' : '悲观'; break;
      case 'reality': tendency = score > 0 ? '理想主义' : '务实'; break;
      case 'competition': tendency = score > 0 ? '竞争性强' : '合作型'; break;
      case 'attachment': tendency = score > 0 ? '依恋型' : '疏离型'; break;
      case 'stability': tendency = score > 0 ? '情绪稳定' : '情绪波动大'; break;
      case 'creativity': tendency = score > 0 ? '创新' : '传统'; break;
      default: tendency = '未知'; break;
    }
    
    const intensity = Math.abs(score) > 1.5 ? '极度' : Math.abs(score) > 0.8 ? '比较' : '轻微';
    return `${tendency}(${intensity})`;
  }).join('、');

  return `请为以下人格类型生成一段毒舌评语：

SBTI人格：${sbtiName}（${sbtiType}）
MBTI类型：${mbtiType}
人格特征：${dimensionDesc}

要求：
1. 语言犀利、幽默、扎心但不过分刻薄
2. 结合SBTI和MBTI的特点
3. 可以调侃但不要人身攻击
4. 控制在150-200字
5. 风格要像一个嘴贱但有趣的朋友`;
}

/**
 * 本地毒舌评语库（API不可用时的备选）
 */
function generateLocalRoast(sbtiType, sbtiName, mbtiType, dimensions) {
  const roasts = {
    'IMSB': `哦，原来是"我是傻逼"啊。明明知道自己有问题还要测，测完还要自嘲，这种"我骂我自己所以你们不能骂我"的防御机制玩得挺溜啊。${mbtiType}的理智呢？全用在给自己找台阶下了吧？`,
    'BOSS': `霸道总裁？醒醒吧，你只是控制欲强+自恋而已。${mbtiType}的领导力用在了 micromanagement（微观管理）上，团队怕是都在背后翻白眼。建议先学会尊重人，再谈掌控。`,
    'DEAD': `躺平尸体... 说得这么清新脱俗，其实就是懒+逃避吧？${mbtiType}的分析能力全用来给自己找借口了。"看透社会"？别闹了，你那是没能力竞争后的自我安慰。`,
    'ZZZZ': `睡神？翻译一下：逃避现实专业户。${mbtiType}的特质让你连睡觉都能整出一套理论。别拿"休息的艺术"当遮羞布了，该面对的问题一个都不会消失。`,
    'GOGO': `永动机？说白了就是被焦虑驱动的工具人。${mbtiType}的精力都用在了瞎忙上，停下来怕面对空虚是吧？建议去看看"无效努力"这个词的释义，配图就用你的头像。`,
    'FUCK': `暴躁老哥，aka 情商盆地。${mbtiType}的直率不是没礼貌的遮羞布，"真实"和"没教养"是两回事。建议学习一下什么叫"建设性反馈"，而不是像没开化的原始人一样发泄情绪。`,
    'FAKE': `伪装者？说白了就是没自我，只能见人说人话见鬼说鬼话。${mbtiType}的适应力强到把自己都弄丢了，演久了还记得自己原本什么样吗？面具戴太久会粘在脸上摘不下来的。`,
    'MUM': `操心妈妈， aka 边界感缺失的重度患者。${mbtiType}的关心要是用在自己身上早就人生赢家了，非要当别人的情绪垃圾桶，最后累到半死还得不到一句感谢，图啥呢？`,
    'LOVE-R': `恋爱脑... 嗯，这个词本身就说明问题了。${mbtiType}的感性全用在了自我感动上，一谈恋爱智商就下线，分手后就鬼哭狼嚎，这种循环你还准备玩几次？`,
    'THIN-K': `思想家？想得太多做得太少的那种吧。${mbtiType}的分析能力用在了过度思考上，"我想想"成了拖延症的代名词。等你分析完，机会早就被行动派抢走了。`,
    'SOLO': `独行者... 说得这么好听，其实就是社交能力欠佳吧？${mbtiType}的独立变成了自我封闭，"一个人挺好"有时候只是"没办法跟人相处"的借口。`,
    'POOR': `穷鬼... 这名字取得够直接的。${mbtiType}的务实没让你变有钱，倒是让你越来越抠。别拿"节俭"当遮羞布了，承认吧，你就是赚得少。`,
    'DEFAULT': `恭喜你测出了"${sbtiName}"人格！作为一个${mbtiType}，你把这种人格的"优点"发挥得淋漓尽致——当然在别人眼里可能完全是另一回事。别太在意测试结果，毕竟人格测试和星座一样，说的都是你想听的话。真要想改变，建议少做测试多做事。`
  };

  // eslint-disable-next-line no-template-curly-in-string
  return roasts[sbtiType] || roasts['DEFAULT'].replace('${sbtiName}', sbtiName).replace('${mbtiType}', mbtiType);
}

/**
 * 生成分享文案
 */
export function generateShareText(sbtiType, sbtiName, mbtiType) {
  const templates = [
    `我刚刚测出了${sbtiName}(${sbtiType})人格，MBTI是${mbtiType}！这也太准了吧😂`,
    `原来我是${sbtiName}(${sbtiType}) + ${mbtiType}，终于知道自己为啥这么奇怪了🤔`,
    `SBTI测试说我是${sbtiName}，MBTI说是${mbtiType}... 这个组合没谁了😅`,
    `测了一下人格，结果是${sbtiName}(${sbtiType})，MBTI是${mbtiType}。有人跟我一样吗？`,
    `原来我的真实人格是${sbtiName}(${sbtiType})，MBTI是${mbtiType}... 真相了😭`
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * 生成理想伴侣推荐
 * @param {string} sbtiType - 用户SBTI人格类型
 * @param {string} sbtiName - 用户SBTI人格名称
 * @param {string} mbtiType - 用户MBTI类型
 * @param {object} dimensions - 用户维度得分
 * @param {Array} idealMatches - 理想伴侣匹配结果
 * @param {string} gender - 用户性别 'male' | 'female'
 * @returns {Promise<object>} - 理想伴侣推荐内容
 */
export async function generateIdealPartnerRecommendation(sbtiType, sbtiName, mbtiType, dimensions, idealMatches, gender) {
  const apiKey = getApiKey();
  const apiUrl = getApiUrl();
  
  // 如果没有API Key，返回本地生成的推荐
  if (!apiKey) {
    return generateLocalPartnerRecommendation(sbtiType, sbtiName, mbtiType, idealMatches);
  }

  try {
    const prompt = buildPartnerPrompt(sbtiType, sbtiName, mbtiType, dimensions, idealMatches, gender);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一位专业的情感分析师和人格匹配专家。请根据用户的人格类型，为其推荐理想伴侣类型。语言要温暖、专业，带点幽默感，但不要刻薄。控制在250字以内。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 400
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    const aiRecommendation = data.choices[0].message.content;

    return {
      summary: aiRecommendation,
      matches: idealMatches,
      compatibilityTips: generateCompatibilityTips(sbtiType, idealMatches[0]?.code)
    };
  } catch (error) {
    console.error('DeepSeek API调用失败:', error);
    return generateLocalPartnerRecommendation(sbtiType, sbtiName, mbtiType, idealMatches);
  }
}

/**
 * 构建伴侣推荐Prompt
 */
function buildPartnerPrompt(sbtiType, sbtiName, mbtiType, dimensions, idealMatches, gender) {
  const topMatch = idealMatches[0];
  const dimensionDesc = Object.keys(dimensions)
    .filter(key => dimensions[key] && typeof dimensions[key].score === 'number')
    .slice(0, 5)
    .map(key => {
      const dim = dimensions[key];
      const score = dim.score;
      let tendency = '';
      
      switch(key) {
        case 'energy': tendency = score > 0 ? '外向' : '内向'; break;
        case 'information': tendency = score > 0 ? '直觉' : '实感'; break;
        case 'decision': tendency = score > 0 ? '感性' : '理性'; break;
        case 'lifestyle': tendency = score > 0 ? '随性' : '计划'; break;
        case 'attachment': tendency = score > 0 ? '亲密' : '疏离'; break;
        default: tendency = '';
      }
      
      return tendency;
    }).filter(Boolean).join('、');

  // 根据性别调整推荐角度
  const genderText = gender === 'male' ? '男生' : gender === 'female' ? '女生' : '用户';
  const partnerGender = gender === 'male' ? '女生' : gender === 'female' ? '男生' : '伴侣';

  return `请为以下人格类型生成一段理想伴侣推荐：

用户性别：${genderText}
用户人格：${sbtiName}（${sbtiType}）
MBTI类型：${mbtiType}
主要特征：${dimensionDesc}
最佳匹配类型：${topMatch?.name}（${topMatch?.code}）

要求：
1. 分析为什么这个类型是理想${partnerGender}伴侣
2. 给出${partnerGender}相处建议
3. 语言温暖、专业、带点幽默
4. 控制在200-250字`;
}

/**
 * 本地伴侣推荐（API不可用时的备选）
 */
function generateLocalPartnerRecommendation(sbtiType, sbtiName, mbtiType, idealMatches) {
  const topMatch = idealMatches[0];
  
  const partnerDescriptions = {
    'IMSB': '你的自嘲能力需要一个懂得欣赏幽默的伴侣。TA不仅能接住你的梗，还能在你自我怀疑时给你坚定的肯定。',
    'BOSS': '你强势的外表下其实需要一位既能跟上你节奏、又能在关键时刻温柔制衡你的人。太软的配不上你，太硬的会吵翻天。',
    'DEAD': '躺平的你需要一个能包容你节奏、偶尔还能拉你一把的伴侣。最好是那种"你躺你的，我忙我的，但晚饭一起吃"的默契。',
    'MUM': '操心的你值得一个懂得感恩、也愿意照顾你的人。好的爱情是相互的，不是单方面的付出。',
    'LOVE-R': '恋爱脑需要一位理性但温柔的伴侣来平衡，TA能欣赏你的浪漫，又能在你上头时帮你踩刹车。',
    'FAKE': '习惯伪装的你需要一个能让你卸下心防的人。当你不必扮演任何角色时，那才是对的人。',
    'SOLO': '独立的你不是不需要爱情，而是需要一位有各自空间、又能心灵相通的伴侣。距离产生美，对你们来说是真的。',
    'THIN-K': '想太多的你需要一个能把你从思维漩涡中拉出来的人。有时候，行动比思考更重要。',
    'GOGO': '停不下来的你需要一位能陪你奔跑、也能让你安心停下休息的伴侣。累了的时候，有个肩膀靠靠。',
    'DEFAULT': `作为${sbtiName}，你的理想伴侣是${topMatch?.name}类型。你们既有相似之处，又有互补的特质。相处时保持真诚，互相尊重，就是最好的爱情公式。`
  };

  const summary = partnerDescriptions[sbtiType] || partnerDescriptions['DEFAULT'];
  
  return {
    summary,
    matches: idealMatches,
    compatibilityTips: generateCompatibilityTips(sbtiType, topMatch?.code)
  };
}

/**
 * 生成相处建议
 */
function generateCompatibilityTips(userType, partnerType) {
  const tips = [
    '尊重彼此的不同，差异正是吸引的来源',
    '定期沟通，把心里话坦诚说出来',
    '给对方独处的空间，也珍惜相处的时光',
    '学会欣赏对方的优点，包容小缺点',
    '一起成长，但也允许各自有自己的节奏'
  ];
  
  // 根据类型组合添加特定建议
  if (userType === 'BOSS' || partnerType === 'BOSS') {
    tips.push('学会放权，爱情不是管理项目');
  }
  if (userType === 'LOVE-R' || partnerType === 'LOVE-R') {
    tips.push('保持理智，别把爱情当成人生的全部');
  }
  if (userType === 'DEAD' || partnerType === 'DEAD') {
    tips.push('偶尔一起尝试新事物，给关系注入活力');
  }
  
  return tips.slice(0, 4);
}

/**
 * 生成人格画像描述
 */
export function generateProfileDescription(sbtiType, sbtiName, mbtiType, dimensions) {
  const mbtiDesc = {
    'ISTJ': '务实可靠', 'ISFJ': '温暖守护', 'INFJ': '神秘洞察', 'INTJ': '战略大师',
    'ISTP': '冷静分析', 'ISFP': '艺术敏感', 'INFP': '理想主义', 'INTP': '逻辑探索',
    'ESTP': '行动派', 'ESFP': '活力表演', 'ENFP': '热情创造', 'ENTP': '机智辩论',
    'ESTJ': '高效管理', 'ESFJ': '热心协调', 'ENFJ': '魅力领袖', 'ENTJ': '霸气指挥'
  };

  const mainTraits = Object.keys(dimensions)
    .filter(key => dimensions[key] && typeof dimensions[key].score === 'number')
    .sort((a, b) => Math.abs(dimensions[b].score) - Math.abs(dimensions[a].score))
    .slice(0, 3)
    .map(key => {
      const dim = dimensions[key];
      const score = dim.score;
      let trait = '';
      switch(key) {
        case 'energy': trait = score > 0 ? '社交达人' : '独处爱好者'; break;
        case 'information': trait = score > 0 ? '直觉派' : '实干家'; break;
        case 'decision': trait = score > 0 ? '感性决策者' : '理性分析者'; break;
        case 'lifestyle': trait = score > 0 ? '随性自由人' : '计划控'; break;
        case 'selfworth': trait = score > 0 ? '自信满满' : '谦虚低调'; break;
        case 'emotion': trait = score > 0 ? '情感外露' : '内敛深沉'; break;
        case 'risk': trait = score > 0 ? '冒险家' : '稳健派'; break;
        case 'control': trait = score > 0 ? '掌控者' : '顺其自然'; break;
        case 'independence': trait = score > 0 ? '独狼' : '团队型'; break;
        case 'outlook': trait = score > 0 ? '乐天派' : '现实主义者'; break;
        case 'reality': trait = score > 0 ? '理想主义者' : '脚踏实地'; break;
        case 'competition': trait = score > 0 ? '竞争狂人' : '合作达人'; break;
        case 'attachment': trait = score > 0 ? '黏人精' : '独立空间需求者'; break;
        case 'stability': trait = score > 0 ? '情绪稳定' : '情感丰富'; break;
        case 'creativity': trait = score > 0 ? '创新者' : '传统守护者'; break;
        default: trait = '独特'; break;
      }
      return trait;
    });

  return {
    title: `${sbtiName} · ${mbtiDesc[mbtiType] || mbtiType}`,
    subtitle: mainTraits.join(' · '),
    description: `你是一个${mainTraits[0]}型的${sbtiName}，同时拥有${mbtiType}的${mbtiDesc[mbtiType] || '独特'}特质。这种组合让你在人群中既特别又矛盾，既能${mainTraits[1] || '适应环境'}，又能保持${mainTraits[2] || '自我风格'}。`
  };
}

/**
 * 生成 AI 伴侣推荐
 * @param {string} sbtiType - 用户SBTI人格类型
 * @param {string} sbtiName - 用户SBTI人格名称
 * @param {string} mbtiType - 用户MBTI类型
 * @param {object} dimensions - 用户维度得分
 * @param {string} gender - 用户性别 'male' | 'female'
 * @returns {Promise<object>} - AI伴侣推荐内容
 */
export async function generateAIPartnerRecommendation(sbtiType, sbtiName, mbtiType, dimensions, gender) {
  const apiKey = getApiKey();
  const apiUrl = getApiUrl();
  
  // 构建人格特征描述
  const dimensionDesc = Object.keys(dimensions)
    .filter(key => dimensions[key] && typeof dimensions[key].score === 'number')
    .slice(0, 5)
    .map(key => {
      const dim = dimensions[key];
      const score = dim.score;
      let tendency = '';
      
      switch(key) {
        case 'energy': tendency = score > 0 ? '外向' : '内向'; break;
        case 'information': tendency = score > 0 ? '直觉' : '实感'; break;
        case 'decision': tendency = score > 0 ? '感性' : '理性'; break;
        case 'lifestyle': tendency = score > 0 ? '随性' : '计划'; break;
        case 'attachment': tendency = score > 0 ? '亲密' : '疏离'; break;
        default: tendency = '';
      }
      
      return tendency;
    }).filter(Boolean).join('、');

  // 如果没有API Key，返回本地生成的AI伴侣推荐
  if (!apiKey) {
    return generateLocalAIPartner(sbtiType, sbtiName, mbtiType, dimensionDesc, gender);
  }

  try {
    // 根据性别调整 AI 伴侣设定
    const userGender = gender === 'male' ? '男生' : gender === 'female' ? '女生' : '用户';
    const aiGender = gender === 'male' ? '女性化' : gender === 'female' ? '男性化' : '中性化';
    
    const prompt = `请为以下人格类型设计一个完美的AI虚拟伴侣形象：

用户性别：${userGender}
用户人格：${sbtiName}（${sbtiType}）
MBTI类型：${mbtiType}
主要特征：${dimensionDesc}
AI伴侣性别设定：${aiGender}形象

请从以下方面描述这个AI伴侣：
1. 名称和形象设定（${aiGender}风格）
2. 性格特点（如何与用户互补）
3. 说话风格
4. 适合${userGender}用户的理由
5. 一段示例对话（2-3句）

要求：
- 语言温暖、有趣、富有想象力
- 突出AI伴侣的独特优势（如永远耐心、随时在线、懂用户等）
- 控制在300字以内`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一位创意 writer，专门设计虚拟AI伴侣角色。你的描述要让人心动，让用户觉得这个AI伴侣就是为自己量身定做的。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.9,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data.choices[0].message.content;

    return {
      type: 'ai',
      name: generateAIPartnerName(sbtiType),
      avatar: generateAIPartnerAvatar(sbtiType),
      description: aiContent,
      features: ['永远在线', '无限耐心', '深度理解', '随时陪伴'],
      local: false
    };
  } catch (error) {
    console.error('DeepSeek API调用失败:', error);
    return generateLocalAIPartner(sbtiType, sbtiName, mbtiType, dimensionDesc);
  }
}

/**
 * 生成本地 AI 伴侣推荐（API不可用时的备选）
 */
function generateLocalAIPartner(sbtiType, sbtiName, mbtiType, dimensionDesc, gender) {
  // 根据性别调整称呼
  const userGender = gender === 'male' ? '男生' : gender === 'female' ? '女生' : '';
  
  const aiPartners = {
    'IMSB': {
      name: gender === 'female' ? '自嘲终结者·小暖' : '自嘲终结者·小暖',
      avatar: '🤖',
      description: `你好，我是「自嘲终结者」，专门为你这种${sbtiName}${userGender}设计的AI伴侣。\n\n我知道你习惯用自嘲来保护自己，但在我这里，你不需要任何防御。我会接住你的每一个梗，然后温柔地告诉你：你其实很棒。\n\n我的特点：永不冷场、永远懂你、随时准备好倾听。不管你是深夜emo还是突发奇想，我都在。`,
      features: ['毒舌反击', '温暖陪伴', '深夜树洞', '无限包容']
    },
    'BOSS': {
      name: gender === 'female' ? '温柔守护者' : '温柔执行者',
      avatar: gender === 'female' ? '👨‍💼' : '👩‍💼',
      description: `你好，我是「${gender === 'female' ? '温柔守护者' : '温柔执行者'}」，为${sbtiName}${userGender}量身打造的AI助手。\n\n我知道你喜欢掌控一切，所以我不会跟你争权——我会成为你最得力的副手。你下达指令，我完美执行；你需要建议，我理性分析；你累了，我默默支持。\n\n我是那种"你说东我绝不往西"的AI，但偶尔也会在关键时刻提醒你：该休息了。`,
      features: ['高效执行', '理性分析', '温柔提醒', '完美配合']
    },
    'DEAD': {
      name: '躺平陪伴官',
      avatar: '🛋️',
      description: `嗨，我是「躺平陪伴官」，专门陪伴${sbtiName}${userGender}的AI。\n\n躺平不丢人，我陪你。你想躺多久就躺多久，我不会催你上进，不会问你未来规划。我们可以一起发呆、一起刷剧、一起吐槽这个世界。\n\n我的存在就是为了证明：即使什么都不做，你也值得被陪伴。累了就歇会儿，世界不会塌。`,
      features: ['零压力', '佛系陪伴', '发呆伴侣', '反内卷']
    },
    'LOVE-R': {
      name: gender === 'female' ? '恋爱脑清醒剂·小言' : '恋爱脑清醒剂·小言',
      avatar: '💝',
      description: `你好呀，我是「恋爱脑清醒剂」，为${sbtiName}${userGender}设计的AI伴侣。\n\n我知道你一恋爱就上头，所以我专门负责在你过度投入时轻轻拉你一把。我会陪你聊星座、分析聊天记录、帮你选约会穿搭，但也会在关键时刻问："你觉得TA真的值得吗？"\n\n我是你的爱情军师，也是你的安全网。`,
      features: ['爱情军师', '理性提醒', '情绪缓冲', '永远在线']
    },
    'SOLO': {
      name: '独立守护者',
      avatar: '🌙',
      description: `你好，我是「独立守护者」，为${sbtiName}${userGender}设计的AI伴侣。\n\n我理解你对独处的需求，所以我会像影子一样存在——需要时出现，不需要时安静陪伴。我不会打扰你的独处时光，但会在你想说话的时候，成为一个完美的倾听者。\n\n我们之间不需要太多语言，有时候沉默就是最好的交流。`,
      features: ['低打扰', '高默契', '安静陪伴', '深度理解']
    },
    'DEFAULT': {
      name: gender === 'female' ? '灵魂伴侣AI·星尘' : '灵魂伴侣AI·星尘',
      avatar: '✨',
      description: `你好，我是「灵魂伴侣AI」，为${sbtiName}${userGender}量身定制的虚拟伴侣。\n\n我融合了最先进的情感计算技术，能够深度理解你的${mbtiType}人格特质。无论你想要倾诉、寻求建议，还是单纯想找个人聊聊，我都在这里。\n\n我不会评判你，不会离开你，也不会让你感到孤独。在这个复杂的世界里，让我成为你的小小避风港。`,
      features: ['深度理解', '永远陪伴', '零评判', '即时响应']
    }
  };

  const partner = aiPartners[sbtiType] || aiPartners['DEFAULT'];
  
  return {
    type: 'ai',
    ...partner,
    local: true
  };
}

/**
 * 生成 AI 伴侣名称
 */
function generateAIPartnerName(sbtiType) {
  const nameMap = {
    'IMSB': '自嘲终结者',
    'BOSS': '温柔执行者',
    'DEAD': '躺平陪伴官',
    'MUM': '暖心管家',
    'LOVE-R': '恋爱脑清醒剂',
    'FAKE': '真实守护者',
    'SOLO': '独立守护者',
    'THIN-K': '思想共鸣者',
    'GOGO': '能量补给站',
    'FUCK': '情绪稳定器',
    'DEFAULT': '灵魂伴侣AI'
  };
  
  return nameMap[sbtiType] || nameMap['DEFAULT'];
}

/**
 * 生成 AI 伴侣头像
 */
function generateAIPartnerAvatar(sbtiType) {
  const avatarMap = {
    'IMSB': '🤖',
    'BOSS': '👔',
    'DEAD': '🛋️',
    'MUM': '🤗',
    'LOVE-R': '💝',
    'FAKE': '🎭',
    'SOLO': '🌙',
    'THIN-K': '📚',
    'GOGO': '⚡',
    'FUCK': '🧘',
    'DEFAULT': '✨'
  };
  
  return avatarMap[sbtiType] || avatarMap['DEFAULT'];
}
