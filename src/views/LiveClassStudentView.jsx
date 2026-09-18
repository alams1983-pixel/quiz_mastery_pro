import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Hls from 'hls.js';
import { apiRequest, getToken } from '../services/api.js';

export function LiveClassStudentView({ classId, onLeave }) {
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef(null);

  // Hand-raise & Audio state
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  // Live Poll state
  const [activePoll, setActivePoll] = useState(null);
  const [tempSelectedOption, setTempSelectedOption] = useState(null);
  const [selectedPollOption, setSelectedPollOption] = useState(null);
  const [pollResults, setPollResults] = useState(null);
  const [pollTimer, setPollTimer] = useState(0);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [pollDismissed, setPollDismissed] = useState(false);
  const [pollLeaderboard, setPollLeaderboard] = useState(null);
  const autoDismissTimerRef = useRef(null);

  // Socket & Video refs
  const socketRef = useRef(null);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const broadcastPeerRef = useRef(null);
  const [isStreamOnline, setIsStreamOnline] = useState(false);
  const [isBroadcastingWebRTC, setIsBroadcastingWebRTC] = useState(false);

  // 1. Fetch Class Access Info & Initialize
  useEffect(() => {
    async function init() {
      try {
        const res = await apiRequest(`/live-classes/${classId}/join`);
        setClassData(res);
      } catch (err) {
        alert(err.message || 'Failed to join live class');
        onLeave();
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [classId, onLeave]);

  // 2. Initialize HLS Video Player (for OBS / Hardware RTMP Broadcast)
  useEffect(() => {
    // If receiving direct browser WebRTC broadcast, skip HLS
    if (isBroadcastingWebRTC) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      return;
    }

    if (!classData?.playbackUrl || !videoRef.current || classData.status !== 'live') {
      return;
    }
    const video = videoRef.current;

    const tryAttachHls = () => {
      if (isBroadcastingWebRTC) return;

      if (Hls.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }

        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          liveSyncDurationCount: 2,
          manifestLoadingMaxRetry: 1,
          manifestLoadingRetryDelay: 3000,
        });
        hlsRef.current = hls;

        hls.loadSource(classData.playbackUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsStreamOnline(true);
          video.play().catch(() => {});
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          // If manifest returns 404 or 403, teacher has not pushed RTMP stream yet
          if (
            data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR ||
            data.details === Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT ||
            data.details === Hls.ErrorDetails.MANIFEST_PARSING_ERROR
          ) {
            setIsStreamOnline(false);
            clearTimeout(retryTimeoutRef.current);
            // Polling backoff: 8 seconds (quieter polling so console does not flood)
            retryTimeoutRef.current = setTimeout(() => {
              if (hlsRef.current && classData?.playbackUrl && !isBroadcastingWebRTC) {
                hlsRef.current.loadSource(classData.playbackUrl);
              }
            }, 8000);
          } else if (data.fatal) {
            setIsStreamOnline(false);
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                clearTimeout(retryTimeoutRef.current);
                retryTimeoutRef.current = setTimeout(() => {
                  if (hlsRef.current && !isBroadcastingWebRTC) hlsRef.current.startLoad();
                }, 6000);
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                clearTimeout(retryTimeoutRef.current);
                retryTimeoutRef.current = setTimeout(() => {
                  tryAttachHls();
                }, 8000);
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = classData.playbackUrl;
        const onPlaying = () => setIsStreamOnline(true);
        const onError = () => {
          setIsStreamOnline(false);
          clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = setTimeout(() => {
            if (videoRef.current && classData?.playbackUrl && !isBroadcastingWebRTC) {
              videoRef.current.src = classData.playbackUrl;
            }
          }, 8000);
        };
        video.addEventListener('playing', onPlaying);
        video.addEventListener('error', onError);
      }
    };

    tryAttachHls();

    return () => {
      clearTimeout(retryTimeoutRef.current);
      if (hlsRef.current) hlsRef.current.destroy();
    };
  }, [classData?.playbackUrl, classData?.status, isBroadcastingWebRTC]);

  // 3. Connect to Live Socket.io Room
  useEffect(() => {
    const token = getToken();
    if (!token || !classId) return;

    const socket = io('/live-class', {
      auth: { token },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_room', { classId, isTeacher: false });
    });

    socket.on('new_chat_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    });

    socket.on('hand_raise_status', ({ isRaised }) => {
      setIsHandRaised(isRaised);
    });

    socket.on('class_status_changed', ({ status }) => {
      setClassData((prev) => (prev ? { ...prev, status } : prev));
      if (status === 'live' && hlsRef.current && classData?.playbackUrl) {
        hlsRef.current.loadSource(classData.playbackUrl);
      }
    });

    // Teacher granted mic permission!
    socket.on('mic_granted', async ({ teacherSocketId }) => {
      try {
        setIsSpeaking(true);
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;

        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });
        peerConnectionRef.current = pc;

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('webrtc_signal', {
              targetSocketId: teacherSocketId,
              signal: { candidate: event.candidate },
            });
          }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit('webrtc_signal', {
          targetSocketId: teacherSocketId,
          signal: { sdp: pc.localDescription },
        });
      } catch (err) {
        console.error('Microphone error:', err);
        alert('Could not access microphone: ' + err.message);
        handleLowerHand();
      }
    });

    // In-Browser Teacher Broadcast Events
    socket.on('teacher_broadcast_started', ({ teacherSocketId }) => {
      setIsBroadcastingWebRTC(true);
      socket.emit('request_broadcast_feed', { classId, teacherSocketId });
    });

    socket.on('teacher_broadcast_stopped', () => {
      setIsBroadcastingWebRTC(false);
      if (broadcastPeerRef.current) {
        broadcastPeerRef.current.close();
        broadcastPeerRef.current = null;
      }
      if (videoRef.current && !hlsRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsStreamOnline(false);
    });

    // WebRTC signaling: Handles BOTH incoming teacher camera broadcast AND student doubt audio
    socket.on('webrtc_signal', async ({ senderSocketId, signal }) => {
      // 1. Direct In-Browser Live Video Feed from Teacher
      if (signal.isBroadcastFeed) {
        if (signal.sdp) {
          const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
          });
          broadcastPeerRef.current = pc;

          pc.ontrack = (event) => {
            if (videoRef.current && event.streams[0]) {
              videoRef.current.srcObject = event.streams[0];
              setIsStreamOnline(true);
              videoRef.current.play().catch(() => {});
            }
          };

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              socket.emit('webrtc_signal', {
                targetSocketId: senderSocketId,
                signal: { candidate: event.candidate, isBroadcastFeed: true },
              });
            }
          };

          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socket.emit('webrtc_signal', {
            targetSocketId: senderSocketId,
            signal: { sdp: pc.localDescription, isBroadcastFeed: true },
          });
        } else if (signal.candidate && broadcastPeerRef.current) {
          await broadcastPeerRef.current.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
        return;
      }

      // 2. Student Doubt Mic Feedback
      const pc = peerConnectionRef.current;
      if (!pc) return;

      if (signal.sdp) {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
      } else if (signal.candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
      }
    });

    socket.on('mic_revoked', () => {
      cleanupMic();
      setIsSpeaking(false);
      setIsHandRaised(false);
    });

    // Poll events
    socket.on('active_poll_started', (poll) => {
      setActivePoll(poll);
      setPollDismissed(false);
      setTempSelectedOption(null);
      setSelectedPollOption(null);
      setPollResults(null);
      setPollTimer(poll.durationSeconds || 30);
      if (autoDismissTimerRef.current) {
        clearTimeout(autoDismissTimerRef.current);
        autoDismissTimerRef.current = null;
      }
    });

    socket.on('poll_results_updated', ({ pollId, results }) => {
      if (activePoll && activePoll.id === pollId) {
        setPollResults(results);
      }
    });

    socket.on('active_poll_closed', () => {
      setActivePoll(null);
      setPollDismissed(true);
    });

    socket.on('poll_leaderboard_published', (leaderboardData) => {
      setActivePoll(null);
      setPollDismissed(true);
      setPollLeaderboard(leaderboardData);
    });

    return () => {
      if (autoDismissTimerRef.current) {
        clearTimeout(autoDismissTimerRef.current);
      }
      if (broadcastPeerRef.current) {
        broadcastPeerRef.current.close();
      }
      cleanupMic();
      socket.disconnect();
    };
  }, [classId]);

  // Poll countdown timer & auto-dismiss
  useEffect(() => {
    if (!activePoll || pollDismissed || pollTimer <= 0) return;
    const interval = setInterval(() => {
      setPollTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Poll timer reached 0: automatically dismiss after 5 seconds so it doesn't block video
          if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
          autoDismissTimerRef.current = setTimeout(() => {
            setPollDismissed(true);
          }, 5000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activePoll, pollDismissed, pollTimer]);

  const cleanupMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !socketRef.current) return;
    socketRef.current.emit('send_chat', { classId, message: chatInput.trim() });
    setChatInput('');
  };

  const handleToggleHandRaise = async () => {
    if (!socketRef.current) return;
    if (isHandRaised || isSpeaking) {
      handleLowerHand();
    } else {
      try {
        // Request microphone permission immediately on raise hand so the browser prompts the user
        const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        tempStream.getTracks().forEach((track) => track.stop()); // Stop preview track until admitted
        socketRef.current.emit('raise_hand', { classId });
        setIsHandRaised(true);
      } catch (err) {
        alert('Microphone permission is required to ask audio doubts. Please allow microphone access in your browser: ' + err.message);
      }
    }
  };

  const handleLowerHand = () => {
    cleanupMic();
    setIsSpeaking(false);
    setIsHandRaised(false);
    socketRef.current?.emit('lower_hand', { classId });
  };

  const handleSubmitVote = async () => {
    if (tempSelectedOption === null || !activePoll || isSubmittingVote || selectedPollOption !== null) return;
    setIsSubmittingVote(true);
    try {
      const responseTimeMs = Math.max(300, Math.round(((activePoll.durationSeconds || 30) - pollTimer) * 1000));
      const res = await apiRequest(`/live-classes/polls/${activePoll.id}/vote`, {
        method: 'POST',
        body: JSON.stringify({ 
          selectedOption: tempSelectedOption,
          responseTimeMs,
        }),
      });
      setSelectedPollOption(tempSelectedOption);
      setPollResults(res.counts);
      socketRef.current?.emit('poll_vote_cast', {
        classId,
        pollId: activePoll.id,
        results: res.counts,
      });

      // Answer submitted: auto-dismiss after 5 seconds so student screen remains clean
      if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
      autoDismissTimerRef.current = setTimeout(() => {
        setPollDismissed(true);
      }, 5000);
    } catch (err) {
      console.error('Vote failed:', err);
      alert(err.message || 'Failed to submit vote');
    } finally {
      setIsSubmittingVote(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📡</div>
        Joining live classroom...
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#090d16',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          backgroundColor: '#0f172a',
          borderBottom: '1px solid #1e293b',
          color: '#fff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              backgroundColor: '#ef4444',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '4px',
              letterSpacing: '0.5px',
            }}
          >
            ● LIVE
          </span>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{classData?.title}</h2>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Instructor: {classData?.instructorName}
          </span>
        </div>

        <button
          onClick={onLeave}
          style={{
            backgroundColor: '#334155',
            color: '#f1f5f9',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 14px',
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          Exit Class
        </button>
      </div>

      {/* Main Grid: Live Video (Left) + Chat & Interactivity (Right) */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Live Stream Area */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            backgroundColor: '#000',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            controls
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: isStreamOnline ? 'block' : 'none',
            }}
          />

          {/* Standby / Offline / Completed View */}
          {!isStreamOnline && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: '#090d16',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '24px',
                textAlign: 'center',
                color: '#fff',
                zIndex: 5,
              }}
            >
              {classData?.status === 'completed' ? (
                <div style={{ maxWidth: '420px' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '14px' }}>🏁</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 8px 0', color: '#f8fafc' }}>
                    Live Class Completed
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '20px' }}>
                    This session has finished. The recorded replay will be accessible shortly under the Recorded Lectures tab.
                  </p>
                  <button
                    onClick={onLeave}
                    style={{
                      backgroundColor: 'var(--primary, #6366f1)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '9px 20px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Return to Lobby
                  </button>
                </div>
              ) : (
                <div style={{ maxWidth: '460px' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(56, 189, 248, 0.12)',
                      border: '2px solid rgba(56, 189, 248, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.75rem',
                      margin: '0 auto 16px auto',
                    }}
                  >
                    📡
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 8px 0', color: '#f8fafc' }}>
                    Waiting for Instructor's Broadcast
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '16px' }}>
                    You are in the classroom. Once {classData?.instructorName || 'the instructor'} turns on their browser camera or OBS stream, the live video will appear here automatically. You can chat and raise doubts in the meantime!
                  </p>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: '#1e293b',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '0.78rem',
                      color: '#38bdf8',
                      border: '1px solid #334155',
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#38bdf8',
                      }}
                    />
                    Classroom Connected • Waiting for video signal...
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dynamic Floating Watermark */}
          <div
            style={{
              position: 'absolute',
              top: '20%',
              left: '30%',
              pointerEvents: 'none',
              zIndex: 10,
              color: 'rgba(255, 255, 255, 0.28)',
              fontFamily: 'monospace',
              fontSize: '13px',
              fontWeight: 700,
              transform: 'rotate(-12deg)',
            }}
          >
            <div>{classData?.watermark?.text}</div>
            <div style={{ fontSize: '11px', opacity: 0.8 }}>{classData?.watermark?.subText}</div>
          </div>

          {/* Active Poll Modal Popup over Video */}
          {activePoll && !pollDismissed && (
            <div
              style={{
                position: 'absolute',
                bottom: '24px',
                left: '24px',
                backgroundColor: 'rgba(15, 23, 42, 0.96)',
                backdropFilter: 'blur(12px)',
                borderRadius: '14px',
                padding: '20px',
                maxWidth: '440px',
                width: 'calc(100% - 48px)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                border: '1px solid #334155',
                color: '#fff',
                zIndex: 30,
                animation: 'fadeIn 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📊</span>
                  {selectedPollOption !== null ? 'LIVE POLL RESULTS' : 'IN-CLASS POLL'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      backgroundColor: pollTimer === 0 ? '#47556940' : pollTimer < 5 ? '#ef444420' : '#3b82f620',
                      color: pollTimer === 0 ? '#94a3b8' : pollTimer < 5 ? '#f87171' : '#60a5fa',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      border: '1px solid',
                      borderColor: pollTimer === 0 ? '#47556960' : pollTimer < 5 ? '#ef444440' : '#3b82f640',
                    }}
                  >
                    {pollTimer === 0 ? '⏰ Poll Closed' : `⏱️ ${pollTimer}s remaining`}
                  </span>
                  <button
                    onClick={() => setPollDismissed(true)}
                    title="Dismiss poll card"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      color: '#94a3b8',
                      borderRadius: '4px',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', lineHeight: 1.4, color: '#f8fafc' }}>
                {activePoll.question}
              </div>

              {/* View 1: Results View (Submitted Vote OR Time Up) */}
              {selectedPollOption !== null || pollTimer === 0 ? (
                <div>
                  {selectedPollOption !== null && (
                    <div
                      style={{
                        backgroundColor: '#064e3b',
                        color: '#6ee7b7',
                        border: '1px solid #059669',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>✅</span> Your answer has been submitted!
                      </span>
                      <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>Auto-closing soon</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {activePoll.options?.map((opt, idx) => {
                      const totalVotes = pollResults?.reduce((sum, r) => sum + (parseInt(r.vote_count, 10) || 0), 0) || 0;
                      const count = pollResults?.find((r) => r.selected_option === idx)?.vote_count || 0;
                      const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                      const isMyPick = selectedPollOption === idx;

                      return (
                        <div
                          key={idx}
                          style={{
                            backgroundColor: '#1e293b',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            border: '1px solid',
                            borderColor: isMyPick ? '#6366f1' : '#334155',
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                        >
                          {/* Progress bar background fill */}
                          <div
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              bottom: 0,
                              width: `${pct}%`,
                              backgroundColor: isMyPick ? 'rgba(99, 102, 241, 0.35)' : 'rgba(56, 189, 248, 0.2)',
                              transition: 'width 0.4s ease',
                              zIndex: 0,
                            }}
                          />

                          <div
                            style={{
                              position: 'relative',
                              zIndex: 1,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontSize: '0.85rem',
                            }}
                          >
                            <span style={{ fontWeight: isMyPick ? 700 : 500, color: '#f1f5f9' }}>
                              <span style={{ opacity: 0.6, marginRight: '6px' }}>{String.fromCharCode(65 + idx)}.</span>
                              {opt}
                              {isMyPick && (
                                <span
                                  style={{
                                    marginLeft: '8px',
                                    fontSize: '0.72rem',
                                    backgroundColor: '#4f46e5',
                                    color: '#fff',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    fontWeight: 700,
                                  }}
                                >
                                  Your Choice
                                </span>
                              )}
                            </span>
                            <span style={{ fontWeight: 700, color: isMyPick ? '#a5b4fc' : '#94a3b8', fontSize: '0.85rem' }}>
                              {pct}% ({count})
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <span>👥 Total class votes: {pollResults?.reduce((sum, r) => sum + (parseInt(r.vote_count, 10) || 0), 0) || 0}</span>
                    <button
                      onClick={() => setPollDismissed(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#60a5fa',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        padding: 0,
                      }}
                    >
                      Dismiss Card ✕
                    </button>
                  </div>
                </div>
              ) : (
                /* View 2: Active Voting Form with Selection & Explicit Submit Button */
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                    {activePoll.options?.map((opt, idx) => {
                      const isSelected = tempSelectedOption === idx;
                      return (
                        <div
                          key={idx}
                          onClick={() => setTempSelectedOption(idx)}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid',
                            borderColor: isSelected ? '#6366f1' : '#334155',
                            backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.2)' : '#1e293b',
                            color: '#fff',
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              border: '2px solid',
                              borderColor: isSelected ? '#6366f1' : '#64748b',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              backgroundColor: isSelected ? '#6366f1' : 'transparent',
                            }}
                          >
                            {isSelected && (
                              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#fff' }} />
                            )}
                          </div>
                          <span style={{ fontWeight: isSelected ? 700 : 500, flex: 1 }}>
                            <span style={{ opacity: 0.6, marginRight: '6px' }}>{String.fromCharCode(65 + idx)}.</span>
                            {opt}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explicit Submit Button */}
                  <button
                    onClick={handleSubmitVote}
                    disabled={tempSelectedOption === null || isSubmittingVote}
                    style={{
                      width: '100%',
                      backgroundColor: tempSelectedOption === null ? '#334155' : '#4f46e5',
                      color: tempSelectedOption === null ? '#94a3b8' : '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '11px',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      cursor: tempSelectedOption === null ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: tempSelectedOption !== null ? '0 4px 14px rgba(79, 70, 229, 0.4)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {isSubmittingVote ? '⏳ Submitting Vote...' : '🚀 Submit Answer'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Top 10 Fastest Correct Response Leaderboard Modal */}
          {pollLeaderboard && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 50,
                padding: '20px',
              }}
            >
              <div
                style={{
                  backgroundColor: '#0f172a',
                  borderRadius: '18px',
                  border: '1px solid #3b82f6',
                  boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(59, 130, 246, 0.25)',
                  width: '100%',
                  maxWidth: '520px',
                  maxHeight: '88vh',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                {/* Header with celebratory banner */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e293b 100%)',
                    padding: '18px 22px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.4rem',
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
                      }}
                    >
                      🏆
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
                        Poll Speed Champions
                      </h3>
                      <span style={{ fontSize: '0.78rem', color: '#93c5fd', fontWeight: 600 }}>
                        Top 10 Fastest Correct Responses
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setPollLeaderboard(null)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.12)',
                      border: 'none',
                      color: '#cbd5e1',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* Question & Correct Answer Badge */}
                <div style={{ padding: '14px 22px 6px 22px' }}>
                  <div
                    style={{
                      backgroundColor: '#1e293b',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      border: '1px solid #334155',
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '6px' }}>
                      {pollLeaderboard.question}
                    </div>
                    {pollLeaderboard.correctOption !== null && pollLeaderboard.correctOption !== undefined && (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.78rem',
                          backgroundColor: '#064e3b',
                          color: '#6ee7b7',
                          padding: '3px 10px',
                          borderRadius: '6px',
                          border: '1px solid #059669',
                          fontWeight: 700,
                        }}
                      >
                        <span>✅ Correct Answer:</span>
                        <span>
                          Option {String.fromCharCode(65 + pollLeaderboard.correctOption)} ({pollLeaderboard.options?.[pollLeaderboard.correctOption]})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Leaderboard List */}
                <div style={{ flex: 1, padding: '10px 22px 16px 22px', overflowY: 'auto' }}>
                  {pollLeaderboard.leaderboard && pollLeaderboard.leaderboard.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {pollLeaderboard.leaderboard.map((entry) => {
                        const rankMedals = ['🥇', '🥈', '🥉'];
                        const isTop3 = entry.rank <= 3;
                        return (
                          <div
                            key={entry.userId}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 14px',
                              borderRadius: '10px',
                              backgroundColor: isTop3
                                ? entry.rank === 1
                                  ? 'rgba(234, 179, 8, 0.12)'
                                  : entry.rank === 2
                                  ? 'rgba(203, 213, 225, 0.1)'
                                  : 'rgba(217, 119, 6, 0.1)'
                                : '#1e293b',
                              border: '1px solid',
                              borderColor: isTop3
                                ? entry.rank === 1
                                  ? '#eab30860'
                                  : entry.rank === 2
                                  ? '#94a3b860'
                                  : '#d9770660'
                                : '#334155',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: isTop3 ? '1.25rem' : '0.85rem',
                                  fontWeight: 800,
                                  color: isTop3 ? '#f8fafc' : '#94a3b8',
                                }}
                              >
                                {rankMedals[entry.rank - 1] || `#${entry.rank}`}
                              </div>

                              <div>
                                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f8fafc' }}>
                                  {entry.name}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                  Answered: Option {String.fromCharCode(65 + entry.selectedOption)}
                                </div>
                              </div>
                            </div>

                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                                color: '#38bdf8',
                                padding: '4px 10px',
                                borderRadius: '8px',
                                fontSize: '0.82rem',
                                fontWeight: 800,
                                border: '1px solid rgba(56, 189, 248, 0.3)',
                              }}
                            >
                              <span>⚡</span>
                              {entry.responseTimeSec || (entry.responseTimeMs ? (entry.responseTimeMs / 1000).toFixed(1) + 's' : 'Fast')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎯</div>
                      No correct responses recorded for this poll yet.
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div
                  style={{
                    padding: '12px 22px',
                    borderTop: '1px solid #1e293b',
                    backgroundColor: '#0b1120',
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}
                >
                  <button
                    onClick={() => setPollLeaderboard(null)}
                    style={{
                      backgroundColor: '#3b82f6',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 20px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Close Leaderboard
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Chat, Doubts & Hand-Raise */}
        <div
          style={{
            width: '360px',
            backgroundColor: '#0f172a',
            borderLeft: '1px solid #1e293b',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Hand Raise Status Banner */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: isSpeaking ? '#15803d' : isHandRaised ? '#b45309' : '#1e293b',
              borderBottom: '1px solid #334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#fff',
            }}
          >
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                {isSpeaking
                  ? '🎙️ You are Speaking Live!'
                  : isHandRaised
                  ? '✋ Hand Raised'
                  : 'Raise Hand for Audio Doubt'}
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                {isSpeaking
                  ? 'Teacher and class can hear you.'
                  : isHandRaised
                  ? 'Waiting for teacher to allow mic...'
                  : 'Speak directly with teacher'}
              </div>
            </div>

            <button
              onClick={handleToggleHandRaise}
              style={{
                backgroundColor: isSpeaking ? '#dc2626' : isHandRaised ? '#475569' : '#4f46e5',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {isSpeaking ? 'Mute' : isHandRaised ? 'Lower' : '✋ Raise'}
            </button>
          </div>

          {/* Chat Messages Feed */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem', marginTop: '40px' }}>
                👋 Say hello or ask your doubt in the live chat!
              </div>
            ) : (
              messages.map((m) => {
                const isTeacher = ['institute_admin', 'super_admin', 'admin'].includes(m.role);
                return (
                  <div key={m.id} style={{ fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span style={{ fontWeight: 700, color: isTeacher ? '#60a5fa' : '#cbd5e1' }}>
                        {m.name}
                      </span>
                      {isTeacher && (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            backgroundColor: '#3b82f620',
                            color: '#60a5fa',
                            padding: '1px 5px',
                            borderRadius: '3px',
                            fontWeight: 700,
                          }}
                        >
                          INSTRUCTOR
                        </span>
                      )}
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{m.time}</span>
                    </div>
                    <div style={{ color: '#f1f5f9', wordBreak: 'break-word', lineHeight: 1.4 }}>
                      {m.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: '12px 16px',
              borderTop: '1px solid #1e293b',
              display: 'flex',
              gap: '8px',
            }}
          >
            <input
              type="text"
              placeholder="Ask a question..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              style={{
                flex: 1,
                backgroundColor: '#1e293b',
                color: '#fff',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '0.85rem',
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: '#4f46e5',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 14px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
