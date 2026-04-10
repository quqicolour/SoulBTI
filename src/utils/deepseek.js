/**
 * DeepSeek AI 服务
 * 用于生成毒舌评语
 */

const API_KEY = process.env.REACT_APP_DEEPSEEK_KEY;
const API_URL = process.env.REACT_APP_DEEPSEEK_URL || 'https://api.deepseek.com/v1/chat/completions';

/**
 * 生成毒舌评语
 * @param {string} sbtiType - SBTI人格类型
 * @param {string} sbtiName - SBTI人格名称
 * @param {string} mbtiType - MBTI类型
 * @param {object} dimensions - 维度得分
 * @returns {Promise<string>} - 毒舌评语
 */
export async function generateRoast(sbtiType, sbtiName, mbtiType, dimensions) {
  // 如果没有API Key，返回本地生成的毒舌评语
  if (!API_KEY || API_KEY === 'your-deepseek-api-key-here') {
    return generateLocalRoast(sbtiType, sbtiName, mbtiType, dimensions);
  }

  try {
    const prompt = buildRoastPrompt(sbtiType, sbtiName, mbtiType, dimensions);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
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
