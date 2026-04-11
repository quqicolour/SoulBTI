# SoulBTI - 人格画像测试系统

<p align="center">
  <img src="public/logo192.png" width="120" alt="SoulBTI Logo">
</p>

<p align="center">
  ✨ 15维度深度人格分析 | 🎯 SBTI + MBTI 双系统 | 🌌 星空梦幻体验
</p>

---

## 📋 项目概述

**SoulBTI** 是一个基于 Web 的交互式人格测试应用，通过 60/80 道精心设计的题目，结合 SBTI（灵魂绑定人格指标）和 MBTI（迈尔斯-布里格斯类型指标）双系统，为用户提供精准、有趣的人格画像分析。

### 核心特色
- **15维度深度分析**：超越传统 4 维度，覆盖情绪、依恋、竞争等更多人格侧面
- **AI 智能推荐**：集成 DeepSeek AI，提供个性化伴侣推荐
- **星空梦幻 UI**：沉浸式视觉体验，营造宁静测试氛围
- **跨平台适配**：完美支持桌面端和移动端访问

---

## 🏗️ 技术架构

### 前端框架
```
React 18 + React Hooks
├── 组件化架构
├── 函数式组件 + Hooks 状态管理
└── Context-free 设计，Props 单向数据流
```

### 核心技术栈
| 技术 | 用途 |
|------|------|
| React 18 | UI 框架 |
| CSS3 | 样式设计，动画效果 |
| HTML5 Canvas | 雷达图绘制 |
| DeepSeek API | AI 智能推荐 |
| LocalStorage | 本地数据持久化 |
| GitHub Pages | 静态部署 |

### 项目结构
```
SoulBTI/
├── public/                 # 静态资源
│   ├── audio/             # 背景音乐
│   ├── index.html
│   └── ...
├── src/
│   ├── components/        # React 组件
│   │   ├── HomePage.js    # 首页（性别选择、测试模式）
│   │   ├── TestPage.js    # 测试页面
│   │   ├── ResultPage.js  # 结果展示
│   │   ├── ProfileCard.js # 人格画像卡片
│   │   ├── AudioController.js  # 背景音乐
│   │   ├── StarryBackground.js # 星空背景
│   │   └── ...
│   ├── utils/             # 工具函数
│   │   ├── calculator.js  # 人格计算逻辑
│   │   └── deepseek.js    # AI 接口封装
│   ├── data/              # 数据文件
│   │   ├── sbti-questions.json   # 测试题库
│   │   ├── sbti-personalities.json # SBTI人格数据
│   │   └── mbti-data.json # MBTI数据
│   ├── App.js             # 主应用组件
│   └── index.js           # 入口文件
└── package.json
```

---

## 🔄 应用流程

### 1. 用户旅程流程图

```
┌─────────────────┐
│   进入首页      │
│  星空背景动画   │
└────────┬────────┘
         ▼
┌─────────────────┐
│   选择性别      │
│  男生 / 女生    │
└────────┬────────┘
         ▼
┌─────────────────┐
│  选择测试模式   │
│ 60题 / 80题    │
└────────┬────────┘
         ▼
┌─────────────────┐     ┌─────────────────┐
│   答题页面      │────▶│  进度保存       │
│ 逐题作答        │     │  LocalStorage   │
└────────┬────────┘     └─────────────────┘
         ▼
┌─────────────────┐
│   计算结果      │
│ 15维度得分     │
└────────┬────────┘
         ▼
┌─────────────────┐
│   结果展示      │
├─────────────────┤
│ • SBTI人格类型  │
│ • MBTI类型      │
│ • 维度分析      │
│ • 理想伴侣推荐  │
│ • AI伴侣推荐    │
└────────┬────────┘
         ▼
┌─────────────────┐
│   分享/保存     │
│ 生成分享卡片   │
└─────────────────┘
```

### 2. 人格计算流程

```
用户答案 (60/80题)
       │
       ▼
┌─────────────────┐
│  calculateDimensions  │
│  计算15维度得分      │
└────────┬────────┘
         ▼
┌─────────────────┐
│   calculateMBTI       │
│   E/I S/N T/F J/P    │
└────────┬────────┘
         ▼
┌─────────────────┐
│ calculateSBTIMatch    │
│ 匹配27种人格类型      │
└────────┬────────┘
         ▼
┌─────────────────┐
│ calculateIdealPartner │
│ 计算最佳伴侣匹配      │
└─────────────────┘
```

### 3. 数据流架构

```
App (状态管理)
  │
  ├── HomePage
  │     └── 用户选择 → 传递至 App
  │
  ├── TestPage
  │     └── 答题进度 → 完成后传递答案
  │
  └── ResultPage
        ├── 调用 Calculator 计算结果
        ├── 调用 DeepSeek API (可选)
        └── 渲染人格画像
```

---

## 🛠️ 解决的问题

### 1. 抖动问题修复
**问题**：首页元素在状态切换时出现抖动

**原因**：CSS `transition: all` 导致不必要的重绘

**解决方案**：
```css
/* 优化前 - 导致抖动 */
transition: all 0.3s ease;

/* 优化后 - 精确控制 */
transition: border-color 0.3s ease, 
            box-shadow 0.3s ease, 
            background 0.3s ease;
will-change: box-shadow;
```

### 2. 背景适配问题
**问题**：星空背景在滚动时产生跳动

**解决方案**：
```css
.starry-background {
  position: fixed;
  width: 100vw;
  height: 100vh;
}

.sky-gradient {
  position: fixed;
  background-attachment: fixed;
}
```

### 3. 移动端适配
**问题**：桌面端 UI 在手机上显示错乱

**解决方案**：
- 响应式 Grid/Flex 布局
- 媒体查询断点 `@media (max-width: 480px)`
- 移动端专用样式覆盖
- 触摸友好的按钮尺寸 (最小 44px)

### 4. 音频自动播放限制
**问题**：浏览器限制自动播放音频

**解决方案**：
- 默认静音状态
- 用户点击后播放
- 音量记忆功能

### 5. API Key 管理
**问题**：环境变量修改需要重启服务

**解决方案**：
- LocalStorage 本地存储用户 API Key
- 运行时读取，无需重启
- 支持测试连接验证

### 6. 跨域资源共享 (CORS)
**问题**：在线音乐资源跨域加载失败

**解决方案**：
- 使用支持 CORS 的 CDN 资源
- 本地文件作为 fallback
- 错误状态优雅降级

---

## 🚀 快速开始

### 本地开发
```bash
# 克隆项目
git clone https://github.com/quqicolour/SoulBTI.git
cd SoulBTI

# 安装依赖
npm install

# 启动开发服务器
npm start
# 访问 http://localhost:3000
```

### 配置 DeepSeek AI (可选)
1. 访问 [DeepSeek 平台](https://platform.deepseek.com/) 获取 API Key
2. 在应用首页点击 "配置 DeepSeek AI"
3. 输入 API Key 并保存
4. 测试连接成功后即可使用 AI 功能

### 构建生产版本
```bash
npm run build
# 输出到 build/ 目录
```

---

## 📊 核心算法

### 15维度计算公式
```javascript
// 维度得分 = 该维度下所有题目得分的平均值
const dimensionScore = {
  score: sum / count,      // 平均得分 (-2 ~ +2)
  rawScore: sum            // 原始总分
};
```

### SBTI 匹配算法
```javascript
// 匹配度 = Σ(1 - |实际值 - 期望值| / 4) × 权重
matchScore += (1 - Math.min(diff / 4, 1)) * weight;
```

### 理想伴侣计算
- **相似维度**：energy(能量), information(认知), outlook(世界观)
- **互补维度**：decision(决策), control(控制欲), attachment(依恋)

---

## 🎨 UI/UX 设计

### 色彩系统
| 用途 | 颜色 | 色值 |
|------|------|------|
| 主色调 | 梦幻紫 | `#8b5cf6` |
| 强调色 | 樱花粉 | `#ec4899` |
| 背景色 | 夜空蓝 | `#0f0c29` |
| 文字色 | 星空白 | `rgba(255,255,255,0.9)` |

### 动画效果
- 星星闪烁：`animation: twinkle 3s ease-in-out infinite`
- 流星划过：`animation: meteor-fall 4s linear infinite`
- 卡片悬停：`transform: translateY(-4px)`

---

## 📦 部署

### GitHub Pages
```bash
npm run build
# 将 build/ 目录内容推送到 gh-pages 分支
```

### Vercel
```bash
# 连接 GitHub 仓库，自动部署
```

### 自定义部署
将 `build/` 目录内容上传到任意静态文件服务器。

---

## 📝 开源协议

本项目基于 MIT 协议开源。

---

<p align="center">
  Made with 💜 by SoulBTI Team
</p>
