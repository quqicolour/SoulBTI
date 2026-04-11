/**
 * DeepSeek API 连接测试
 */

const API_KEY = process.env.REACT_APP_DEEPSEEK_KEY;
const API_URL = process.env.REACT_APP_DEEPSEEK_URL || 'https://api.deepseek.com/v1/chat/completions';

/**
 * 测试 DeepSeek API 连接
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function testDeepSeekConnection() {
  // 检查 API Key
  if (!API_KEY || API_KEY === 'your-deepseek-api-key-here') {
    return {
      success: false,
      message: '❌ 未配置 DeepSeek API Key\n\n请在 .env 文件中设置有效的 REACT_APP_DEEPSEEK_KEY\n获取地址: https://platform.deepseek.com/'
    };
  }

  try {
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
      return {
        success: false,
        message: `❌ API 请求失败\n状态码: ${response.status}\n错误信息: ${errorData.error?.message || '未知错误'}`
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    return {
      success: true,
      message: `✅ DeepSeek 连接测试成功！\n\n模型响应: ${content || '无内容'}\n\n可以正常使用 AI 功能。`
    };
  } catch (error) {
    return {
      success: false,
      message: `❌ 连接异常\n错误: ${error.message}\n\n请检查网络连接和 API Key 是否正确。`
    };
  }
}
