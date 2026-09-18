import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { apiRequest } from '../services/api.js';

/**
 * Secure Video Player Component
 * - Supports HLS Adaptive Bitrate Streaming (.m3u8) via Hls.js
 * - Automatically resumes playback from last saved timestamp
 * - Periodically syncs student watch-progress to backend
 * - Dynamic Anti-Piracy Watermark: Shifts position randomly every 12 seconds
 */
export function SecureVideoPlayer({ videoData, videoId, onClose }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hlsRef = useRef(null);

  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [watermarkPos, setWatermarkPos] = useState({ top: '25%', left: '30%' });
  const [playbackError, setPlaybackError] = useState(null);
  const retryCountRef = useRef(0);

  const { playbackUrl, title, subject, chapter, resumePositionSeconds = 0, watermark } = videoData;

  // 1. Initialize HLS Video Stream
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playbackUrl) return;

    setPlaybackError(null);
    retryCountRef.current = 0;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        manifestLoadingMaxRetry: 1,
      });
      hlsRef.current = hls;

      hls.loadSource(playbackUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setPlaybackError(null);
        if (resumePositionSeconds > 0) {
          video.currentTime = resumePositionSeconds;
        }
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR || data.details === Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT) {
          retryCountRef.current += 1;
          if (retryCountRef.current >= 2) {
            setPlaybackError(
              'This lecture or recorded replay is currently unavailable on the video CDN. If this was a test live class where no video was broadcasted, or if it is still encoding, please check back shortly.'
            );
            if (hlsRef.current) hlsRef.current.destroy();
          } else {
            setTimeout(() => {
              if (hlsRef.current && !playbackError) {
                hlsRef.current.loadSource(playbackUrl);
              }
            }, 3000);
          }
        } else if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              retryCountRef.current += 1;
              if (retryCountRef.current >= 2) {
                setPlaybackError('Network connection to the streaming server failed. Please check your internet or retry later.');
                hls.destroy();
              } else {
                setTimeout(() => hls.startLoad(), 2500);
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setPlaybackError('An unexpected media error occurred while playing this video.');
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Apple Safari HLS support
      video.src = playbackUrl;
      const onLoadedMetadata = () => {
        setPlaybackError(null);
        if (resumePositionSeconds > 0) {
          video.currentTime = resumePositionSeconds;
        }
        video.play().catch(() => {});
      };
      const onError = () => {
        setPlaybackError('This lecture video could not be loaded. It may still be processing or unavailable.');
      };

      video.addEventListener('loadedmetadata', onLoadedMetadata);
      video.addEventListener('error', onError);

      return () => {
        video.removeEventListener('loadedmetadata', onLoadedMetadata);
        video.removeEventListener('error', onError);
      };
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [playbackUrl, resumePositionSeconds]);

  // 2. Watch Progress Heartbeat (Saves progress every 5 seconds of active playback)
  useEffect(() => {
    const interval = setInterval(() => {
      const video = videoRef.current;
      if (video && !video.paused && video.duration > 0 && videoId) {
        apiRequest(`/videos/${videoId}/progress`, {
          method: 'POST',
          body: JSON.stringify({
            positionSeconds: video.currentTime,
            durationSeconds: video.duration,
          }),
        }).catch(() => {});
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [videoId]);

  // 3. Dynamic Moving Watermark: Shifts position randomly every 12 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const randomTop = Math.floor(Math.random() * 65 + 15) + '%';
      const randomLeft = Math.floor(Math.random() * 60 + 10) + '%';
      setWatermarkPos({ top: randomTop, left: randomLeft });
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#090d16',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          backgroundColor: '#0f172a',
          borderBottom: '1px solid #1e293b',
          color: '#f8fafc',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <span style={{ fontSize: '1.25rem' }}>🎬</span>
          <div>
            <h2
              style={{
                fontSize: '1rem',
                fontWeight: 600,
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '500px',
              }}
            >
              {title}
            </h2>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
              {subject} {chapter ? `• Chapter: ${chapter}` : ''}
            </div>
          </div>
        </div>

        {/* Player Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Speed Selector */}
          <div style={{ display: 'flex', gap: '4px', backgroundColor: '#1e293b', padding: '3px', borderRadius: '6px' }}>
            {[0.75, 1, 1.25, 1.5, 2].map((s) => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                style={{
                  background: playbackSpeed === s ? '#4f46e5' : 'transparent',
                  color: playbackSpeed === s ? '#fff' : '#94a3b8',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {s}x
              </button>
            ))}
          </div>

          <button onClick={toggleFullscreen} style={controlBtnStyle}>
            {isFullscreen ? '⤢ Exit' : '⤢ Fullscreen'}
          </button>

          <button
            onClick={onClose}
            style={{
              ...controlBtnStyle,
              backgroundColor: '#ef444420',
              color: '#f87171',
              borderColor: '#ef444440',
              fontWeight: 700,
              marginLeft: '8px',
            }}
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Video Container with Dynamic Watermark */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#000',
          overflow: 'hidden',
        }}
      >
        <video
          ref={videoRef}
          controls
          controlsList="nodownload"
          disablePictureInPicture
          playsInline
          style={{
            width: '100%',
            height: '100%',
            maxHeight: 'calc(100vh - 65px)',
            objectFit: 'contain',
            display: playbackError ? 'none' : 'block',
          }}
        />

        {/* Playback Error Overlay */}
        {playbackError && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(9, 13, 22, 0.96)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px',
              textAlign: 'center',
              zIndex: 30,
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 10px 0' }}>
              Video Lecture Unavailable
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', maxWidth: '460px', lineHeight: 1.6, margin: '0 0 24px 0' }}>
              {playbackError}
            </p>
            <button
              onClick={onClose}
              style={{
                backgroundColor: 'var(--primary, #6366f1)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 24px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              Close Player
            </button>
          </div>
        )}

        {/* Dynamic Anti-Piracy Watermark (Moves randomly) */}
        <div
          style={{
            position: 'absolute',
            top: watermarkPos.top,
            left: watermarkPos.left,
            pointerEvents: 'none',
            zIndex: 10,
            color: 'rgba(255, 255, 255, 0.32)',
            fontFamily: 'monospace',
            fontSize: '13px',
            fontWeight: 700,
            textShadow: '0 1px 2px rgba(0,0,0,0.8)',
            transform: 'rotate(-10deg)',
            transition: 'top 2s ease, left 2s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <div>{watermark?.text || 'STUDENT VERIFIED'}</div>
          <div style={{ fontSize: '11px', opacity: 0.8 }}>{watermark?.subText}</div>
        </div>
      </div>
    </div>
  );
}

const controlBtnStyle = {
  backgroundColor: '#1e293b',
  color: '#cbd5e1',
  border: '1px solid #334155',
  borderRadius: '6px',
  padding: '6px 12px',
  fontSize: '0.85rem',
  cursor: 'pointer',
};
