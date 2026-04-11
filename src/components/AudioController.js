/**
 * 背景音乐控制器 - 点击触发版
 * 提供背景音乐的播放/暂停控制
 */

import React, { useState, useEffect, useRef } from 'react';
import './AudioController.css';

// 星空深邃音乐 - 氛围感、缓慢、空灵
const COSMIC_MUSIC = {
  name: '星空深邃',
  url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  type: 'ambient'
};

function AudioController() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [showControls, setShowControls] = useState(false);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef(null);
  const panelRef = useRef(null);

  // 初始化音频（默认不播放）
  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.volume = volume;
    audio.src = COSMIC_MUSIC.url;
    audioRef.current = audio;

    audio.addEventListener('error', () => {
      setHasError(true);
      setIsPlaying(false);
    });

    audio.addEventListener('ended', () => {
      if (audio.loop) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 更新音量
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // 点击外部关闭控制面板
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setShowControls(false);
      }
    };

    if (showControls) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showControls]);

  // 切换播放/暂停
  const togglePlay = async () => {
    if (!audioRef.current || hasError) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.log('音频播放需要用户交互');
      setHasError(true);
    }
  };

  // 切换静音
  const toggleMute = () => {
    if (!audioRef.current) return;
    
    const newMuted = !isMuted;
    audioRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  // 调整音量
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
      if (audioRef.current) audioRef.current.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.muted = false;
    }
  };

  // 切换控制面板
  const toggleControls = () => {
    setShowControls(!showControls);
  };

  if (hasError) {
    return (
      <div className="audio-controller error" title="音乐加载失败">
        <button className="audio-btn" disabled>
          ⚠️
        </button>
      </div>
    );
  }

  return (
    <div className="audio-wrapper" ref={panelRef}>
      <div className={`audio-controller ${isPlaying ? 'playing' : ''}`}>
        <button 
          className="audio-btn"
          onClick={togglePlay}
          title={isPlaying ? '暂停音乐' : '播放音乐'}
        >
          {isPlaying ? '🔔' : '🔕'}
        </button>
        
        <button 
          className="settings-icon-btn"
          onClick={toggleControls}
          title="音量设置"
        >
          ⚙️
        </button>
      </div>
      
      {showControls && (
        <div className="audio-panel">
          <div className="audio-header">
            <span className="music-name">✨ {COSMIC_MUSIC.name}</span>
            <button className="close-btn" onClick={() => setShowControls(false)}>✕</button>
          </div>
          
          <div className="audio-controls">
            <button 
              className="control-btn mute-btn"
              onClick={toggleMute}
              title={isMuted ? '取消静音' : '静音'}
            >
              {isMuted || volume === 0 ? '🔇' : '🔊'}
            </button>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="volume-slider"
              title="音量"
            />
            
            <span className="volume-value">{Math.round(volume * 100)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default AudioController;
