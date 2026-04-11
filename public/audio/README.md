# 背景音乐文件

## 当前配置

应用使用**单一民谣音乐**，节奏缓慢悠长，营造宁静氛围。

### 默认音乐
- **名称**：悠长民谣
- **来源**：SoundHelix 免版权音乐
- **URL**：https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3
- **风格**：缓慢、悠长、舒缓的民谣

## 如需更换音乐

如需更换为其他音乐，请修改 `src/components/AudioController.js` 中的 `FOLK_MUSIC` 配置：

```javascript
const FOLK_MUSIC = {
  name: '你的音乐名称',
  url: 'https://your-music-url.mp3',
  type: 'folk'
};
```

## 推荐音乐资源

1. **SoundHelix** - https://www.soundhelix.com/
   - 免版权音乐，可直接使用
   
2. **FreePD** - https://freepd.com/
   - 完全免费，无需署名

3. **Free Music Archive** - https://freemusicarchive.org/
   - 大量免版权音乐

## 音乐要求

- **节奏**：60-80 BPM，缓慢悠长
- **风格**：民谣、轻音乐、治愈系
- **时长**：建议 2-5 分钟（会循环播放）
- **音量**：应用内默认 40%

## 注意事项

1. 确保拥有音频文件的使用权或版权
2. 在线音乐需要 CORS 支持
3. 建议使用 HTTPS 链接
