import React, { useRef } from "react";
import html2canvas from "html2canvas";
import "./ProfileCard.css";

const ProfileCard = React.forwardRef(
  (
    {
      sbtiType,
      sbtiName,
      sbtiTagline,
      mbtiType,
      mbtiName,
      dimensions,
      roast,
      profileDesc,
      matchScore,
      onCapture,
    },
    ref,
  ) => {
    const cardRef = useRef(null);

    // 暴露截图方法给父组件
    React.useImperativeHandle(ref, () => ({
      capture: async () => {
        if (cardRef.current) {
          try {
            const canvas = await html2canvas(cardRef.current, {
              backgroundColor: null,
              scale: 2,
              useCORS: true,
              logging: false,
            });

            return { canvas, dataUrl: canvas.toDataURL("image/png") };
          } catch (error) {
            console.error("截图失败:", error);
            return null;
          }
        }
        return null;
      },
    }));

    // 获取最强的三个维度
    const getTopDimensions = () => {
      return Object.keys(dimensions)
        .filter(
          (key) => dimensions[key] && typeof dimensions[key].score === "number",
        )
        .sort(
          (a, b) =>
            Math.abs(dimensions[b].score) - Math.abs(dimensions[a].score),
        )
        .slice(0, 5)
        .map((key) => {
          const dim = dimensions[key];
          const score = dim.score;
          let code, name;

          switch (key) {
            case "energy":
              code = score > 0 ? "E" : "I";
              name = score > 0 ? "外向" : "内敛";
              break;
            case "information":
              code = score > 0 ? "N" : "S";
              name = score > 0 ? "直觉" : "实感";
              break;
            case "decision":
              code = score > 0 ? "F" : "T";
              name = score > 0 ? "感性" : "理性";
              break;
            case "lifestyle":
              code = score > 0 ? "P" : "J";
              name = score > 0 ? "随性" : "计划";
              break;
            case "selfworth":
              code = score > 0 ? "H" : "L";
              name = score > 0 ? "高自尊" : "低自尊";
              break;
            case "emotion":
              code = score > 0 ? "O" : "R";
              name = score > 0 ? "开放" : "压抑";
              break;
            case "risk":
              code = score > 0 ? "D" : "C";
              name = score > 0 ? "冒险" : "保守";
              break;
            case "control":
              code = score > 0 ? "A" : "G";
              name = score > 0 ? "掌控" : "放松";
              break;
            case "independence":
              code = score > 0 ? "U" : "V";
              name = score > 0 ? "独立" : "依赖";
              break;
            case "outlook":
              code = score > 0 ? "P" : "M";
              name = score > 0 ? "乐观" : "悲观";
              break;
            case "reality":
              code = score > 0 ? "I" : "B";
              name = score > 0 ? "理想" : "务实";
              break;
            case "competition":
              code = score > 0 ? "W" : "K";
              name = score > 0 ? "竞争" : "合作";
              break;
            case "attachment":
              code = score > 0 ? "X" : "S";
              name = score > 0 ? "亲密" : "疏离";
              break;
            case "stability":
              code = score > 0 ? "Z" : "Y";
              name = score > 0 ? "稳定" : "波动";
              break;
            case "creativity":
              code = score > 0 ? "N" : "Q";
              name = score > 0 ? "创新" : "传统";
              break;
            default:
              code = "?";
              name = "未知";
          }

          return { code, name, score: Math.abs(score), key };
        });
    };

    const topDimensions = getTopDimensions();

    // 生成雷达图路径
    const generateRadarPath = () => {
      const centerX = 70;
      const centerY = 70;
      const radius = 50;
      const count = 15;
      const dimKeys = Object.keys(dimensions).filter(
        (k) => dimensions[k] && typeof dimensions[k].score === "number",
      );

      let path = "";
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
        const dimKey = dimKeys[i];
        const value = dimKey ? Math.abs(dimensions[dimKey]?.score || 0) / 2 : 0;
        const x = centerX + Math.cos(angle) * radius * value;
        const y = centerY + Math.sin(angle) * radius * value;
        path += (i === 0 ? "M" : "L") + `${x},${y}`;
      }
      path += "Z";
      return path;
    };

    return (
      <div className="profile-card-wrapper" ref={cardRef}>
        <div className="profile-card">
          {/* 头部 */}
          <div className="profile-header">
            <div className="profile-logo">✦ SBTI</div>
            <div className="profile-watermark">人格画像</div>
          </div>

          {/* 主要内容 */}
          <div className="profile-main">
            {/* 左侧：人格类型 */}
            <div className="profile-types">
              <div className="sbti-section">
                <div className="type-code-large">{sbtiType}</div>
                <div className="type-name">{sbtiName}</div>
                <div className="type-tagline">「{sbtiTagline}」</div>
                <div className="match-badge">{matchScore}% 匹配</div>
              </div>

              <div className="mbti-section">
                <div className="mbti-label">MBTI</div>
                <div className="mbti-type">{mbtiType}</div>
                <div className="mbti-name">{mbtiName}</div>
              </div>
            </div>

            {/* 右侧：雷达图和维度 */}
            <div className="profile-visual">
              <div className="radar-container">
                <svg viewBox="0 0 140 140" className="radar-chart">
                  {/* 背景网格 */}
                  {[0.25, 0.5, 0.75, 1].map((scale, i) => (
                    <polygon
                      key={i}
                      points={Array(15)
                        .fill(0)
                        .map((_, j) => {
                          const angle = (Math.PI * 2 * j) / 15 - Math.PI / 2;
                          const r = 50 * scale;
                          const x = 70 + Math.cos(angle) * r;
                          const y = 70 + Math.sin(angle) * r;
                          return `${x},${y}`;
                        })
                        .join(" ")}
                      fill="none"
                      stroke="#e7e5e4"
                      strokeWidth="0.5"
                    />
                  ))}

                  {/* 轴线 */}
                  {Array(15)
                    .fill(0)
                    .map((_, i) => {
                      const angle = (Math.PI * 2 * i) / 15 - Math.PI / 2;
                      const x = 70 + Math.cos(angle) * 50;
                      const y = 70 + Math.sin(angle) * 50;
                      return (
                        <line
                          key={i}
                          x1="70"
                          y1="70"
                          x2={x}
                          y2={y}
                          stroke="#e7e5e4"
                          strokeWidth="0.5"
                        />
                      );
                    })}

                  {/* 数据区域 */}
                  <path
                    d={generateRadarPath()}
                    fill="rgba(245, 158, 11, 0.3)"
                    stroke="#f59e0b"
                    strokeWidth="2"
                  />
                </svg>
              </div>

              {/* 维度标签 */}
              <div className="dimension-pills">
                {topDimensions.slice(0, 3).map((dim, index) => (
                  <div
                    key={dim.key}
                    className="dim-pill"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <span className="dim-code">{dim.code}</span>
                    <span className="dim-name">{dim.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI毒舌评语 */}
          {roast ? (
            <div className="profile-roast">
              <div className="roast-header">
                <span className="roast-icon">💬</span>
                <span className="roast-title">AI锐评</span>
              </div>
              <p className="roast-content">{roast}</p>
            </div>
          ) : (
            <div className="profile-roast loading">
              <div className="roast-header">
                <span className="roast-icon">🤖</span>
                <span className="roast-title">AI正在思考怎么吐槽你...</span>
              </div>
            </div>
          )}

          {/* 底部 */}
          <div className="profile-footer">
            <div className="profile-desc">{profileDesc}</div>
            <div className="profile-brand">
              SoulBTI · 找到属于你的精准人格画像
            </div>
          </div>
        </div>
      </div>
    );
  },
);

export default ProfileCard;
