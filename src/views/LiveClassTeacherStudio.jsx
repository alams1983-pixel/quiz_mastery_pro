import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { apiRequest, getToken } from '../services/api.js';

// Clean SVG Icons for Copy, Check, and Show/Hide
function CopyIcon({ size = 15, style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon({ size = 15, style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function EyeIcon({ size = 15, style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ size = 15, style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export function LiveClassTeacherStudio({ classId, onLeave }) {
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  // Chat
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef(null);

  // Hand-Raise Queue
  const [handRaiseQueue, setHandRaiseQueue] = useState([]);
  const [activeSpeaker, setActiveSpeaker] = useState(null);

  // Poll Creator
  const [showPollModal, setShowPollModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['Option A', 'Option B', 'Option C', 'Option D']);
  const [pollCorrectOption, setPollCorrectOption] = useState(0);
  const [activePollStats, setActivePollStats] = useState(null);
  const [pollLeaderboardModal, setPollLeaderboardModal] = useState(null);
  const [isSharingLeaderboard, setIsSharingLeaderboard] = useState(false);

  // Dual Broadcast Mode State: 'browser' (Option A: Direct Webcam/Screen) | 'obs' (Option B: OBS Studio)
  const [studioMode, setStudioMode] = useState('browser');
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Ingest Credentials Copy & Visibility State
  const [copiedRtmp, setCopiedRtmp] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [obsStatus, setObsStatus] = useState(null);
  const [isUploadingRecording, setIsUploadingRecording] = useState(false);

  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const audioElementRef = useRef(null);

  // Browser Camera & Mic System Check State
  const [isMediaTestActive, setIsMediaTestActive] = useState(false);
  const [isBroadcastingBrowser, setIsBroadcastingBrowser] = useState(false);
  const [deviceError, setDeviceError] = useState('');
  const videoPreviewRef = useRef(null);
  const localMediaStreamRef = useRef(null);
  const studentBroadcastPeersRef = useRef(new Map());

  // MediaRecorder for archiving in-browser live stream
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const fallbackCopyText = (text) => {
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', '');
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    } catch (e) {
      console.warn('Fallback copy error:', e);
    }
  };

  const handleCopy = (text, type) => {
    if (!text) return;
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => fallbackCopyText(text));
      } else {
        fallbackCopyText(text);
      }
    } catch {
      fallbackCopyText(text);
    }

    if (type === 'rtmp') {
      setCopiedRtmp(true);
      setTimeout(() => setCopiedRtmp(false), 2000);
    } else if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else if (type === 'all') {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  const startBrowserRecording = (stream) => {
    try {
      recordedChunksRef.current = [];
      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
        ? 'video/webm;codecs=vp8,opus'
        : 'video/webm';
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };
      recorder.start(2000); // 2 second chunks
      mediaRecorderRef.current = recorder;
    } catch (err) {
      console.warn('[RECORDER] MediaRecorder initialization warning:', err);
    }
  };

  const stopBrowserRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const uploadBrowserRecording = async () => {
    if (recordedChunksRef.current.length === 0) return;
    setIsUploadingRecording(true);
    try {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const formData = new FormData();
      formData.append('recording', blob, `live_class_${classId}_replay.webm`);

      const token = getToken();
      await fetch(`/api/live-classes/${classId}/save-browser-recording`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      console.log('[RECORDER] Browser recording successfully uploaded and archived as replay.');
    } catch (err) {
      console.warn('[RECORDER] Failed to upload browser recording:', err.message);
    } finally {
      setIsUploadingRecording(false);
    }
  };

  const handleToggleMediaTest = async () => {
    if (isMediaTestActive) {
      if (localMediaStreamRef.current && !isBroadcastingBrowser) {
        localMediaStreamRef.current.getTracks().forEach((t) => t.stop());
        localMediaStreamRef.current = null;
      }
      setIsMediaTestActive(false);
    } else {
      setDeviceError('');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
        localMediaStreamRef.current = stream;
        setIsMediaTestActive(true);
      } catch (err) {
        console.error('Camera/Mic check error:', err);
        setDeviceError('Could not access camera/mic: ' + err.message + '. Please allow permissions in your browser URL bar.');
      }
    }
  };

  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      // Revert back to webcam
      try {
        const camStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
        const newTrack = camStream.getVideoTracks()[0];
        if (localMediaStreamRef.current) {
          const oldTrack = localMediaStreamRef.current.getVideoTracks()[0];
          if (oldTrack) {
            localMediaStreamRef.current.removeTrack(oldTrack);
            oldTrack.stop();
          }
          localMediaStreamRef.current.addTrack(newTrack);
        }
        studentBroadcastPeersRef.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
          if (sender) sender.replaceTrack(newTrack);
        });
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = localMediaStreamRef.current;
        }
        setIsScreenSharing(false);
      } catch (e) {
        console.error('Error reverting to camera:', e);
      }
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: true,
        });
        const screenTrack = screenStream.getVideoTracks()[0];
        screenTrack.onended = () => {
          setIsScreenSharing(false);
          handleToggleMediaTest();
        };

        if (localMediaStreamRef.current) {
          const oldTrack = localMediaStreamRef.current.getVideoTracks()[0];
          if (oldTrack) {
            localMediaStreamRef.current.removeTrack(oldTrack);
            oldTrack.stop();
          }
          localMediaStreamRef.current.addTrack(screenTrack);
        } else {
          localMediaStreamRef.current = screenStream;
        }

        studentBroadcastPeersRef.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        });

        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = localMediaStreamRef.current;
        }
        setIsScreenSharing(true);
        setIsMediaTestActive(true);
      } catch (err) {
        console.warn('Screen share cancelled or failed:', err);
      }
    }
  };

  const handleToggleBrowserBroadcast = async () => {
    if (isBroadcastingBrowser) {
      setIsBroadcastingBrowser(false);
      stopBrowserRecording();
      socketRef.current?.emit('stop_browser_broadcast', { classId });
      studentBroadcastPeersRef.current.forEach((pc) => pc.close());
      studentBroadcastPeersRef.current.clear();
      // Upload recording in background
      uploadBrowserRecording();
    } else {
      setDeviceError('');
      try {
        let stream = localMediaStreamRef.current;
        if (!stream) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: true,
          });
          localMediaStreamRef.current = stream;
          setIsMediaTestActive(true);
        }

        if (!isLive) {
          await handleStartClass();
        }

        startBrowserRecording(stream);
        setIsBroadcastingBrowser(true);
        socketRef.current?.emit('start_browser_broadcast', { classId });
      } catch (err) {
        console.error('Browser broadcast error:', err);
        setDeviceError('Could not start broadcast: ' + err.message);
      }
    }
  };

  // Poll OBS Stream Signal Status when in OBS mode
  useEffect(() => {
    if (studioMode !== 'obs' || !classId) return;
    const checkObsSignal = async () => {
      try {
        const res = await apiRequest(`/live-classes/${classId}/stream-status`);
        setObsStatus(res);
      } catch (e) {
        // quiet error
      }
    };
    checkObsSignal();
    const interval = setInterval(checkObsSignal, 4000);
    return () => clearInterval(interval);
  }, [studioMode, classId]);

  useEffect(() => {
    if ((isMediaTestActive || isBroadcastingBrowser) && videoPreviewRef.current && localMediaStreamRef.current) {
      videoPreviewRef.current.srcObject = localMediaStreamRef.current;
    }
  }, [isMediaTestActive, isBroadcastingBrowser]);

  // 1. Fetch Class Data
  useEffect(() => {
    async function init() {
      try {
        const res = await apiRequest(`/live-classes/${classId}/join`);
        setClassData(res);
        setIsLive(res.status === 'live');
      } catch (err) {
        alert(err.message || 'Failed to initialize teacher studio');
        onLeave();
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [classId, onLeave]);

  // 2. Connect to Live Socket as Teacher
  useEffect(() => {
    const token = getToken();
    if (!token || !classId) return;

    const socket = io('/live-class', {
      auth: { token },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_room', { classId, isTeacher: true });
    });

    socket.on('new_chat_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    });

    socket.on('hand_raise_queue_update', (queue) => {
      setHandRaiseQueue(queue);
    });

    // When a student requests direct in-browser live broadcast feed
    socket.on('student_requested_feed', async ({ studentSocketId }) => {
      if (!localMediaStreamRef.current) return;

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });
      studentBroadcastPeersRef.current.set(studentSocketId, pc);

      localMediaStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localMediaStreamRef.current);
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('webrtc_signal', {
            targetSocketId: studentSocketId,
            signal: { candidate: event.candidate, isBroadcastFeed: true },
          });
        }
      };

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit('webrtc_signal', {
          targetSocketId: studentSocketId,
          signal: { sdp: pc.localDescription, isBroadcastFeed: true },
        });
      } catch (e) {
        console.error('Failed to create broadcast offer:', e);
      }
    });

    // WebRTC signaling for student doubt audio OR broadcast feed answers
    socket.on('webrtc_signal', async ({ senderSocketId, signal }) => {
      if (signal.isBroadcastFeed) {
        const pc = studentBroadcastPeersRef.current.get(senderSocketId);
        if (pc) {
          if (signal.sdp) {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          } else if (signal.candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
          }
        }
        return;
      }

      if (signal.sdp) {
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });
        peerConnectionRef.current = pc;

        pc.ontrack = (event) => {
          // Play student's audio in teacher's audio output (which mixes into broadcast)
          if (audioElementRef.current && event.streams[0]) {
            audioElementRef.current.srcObject = event.streams[0];
            audioElementRef.current.play().catch(() => {});
          }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('webrtc_signal', {
              targetSocketId: senderSocketId,
              signal: { candidate: event.candidate },
            });
          }
        };

        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('webrtc_signal', {
          targetSocketId: senderSocketId,
          signal: { sdp: pc.localDescription },
        });
      } else if (signal.candidate && peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(signal.candidate));
      }
    });

    socket.on('poll_results_updated', ({ pollId, results }) => {
      setActivePollStats((prev) => ({ ...prev, results }));
    });

    return () => {
      studentBroadcastPeersRef.current.forEach((pc) => pc.close());
      studentBroadcastPeersRef.current.clear();
      if (peerConnectionRef.current) peerConnectionRef.current.close();
      if (localMediaStreamRef.current) {
        localMediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      socket.disconnect();
    };
  }, [classId]);

  // Start Broadcasting
  const handleStartClass = async () => {
    try {
      await apiRequest(`/live-classes/${classId}/start`, { method: 'POST' });
      setIsLive(true);
    } catch (err) {
      alert(err.message || 'Failed to start live class');
    }
  };

  // End Broadcasting & Archive Replay
  const handleEndClass = async () => {
    if (!window.confirm('End this live class? It will automatically be archived under past recorded lectures.')) return;
    try {
      const mode = isBroadcastingBrowser || recordedChunksRef.current.length > 0 ? 'browser' : 'obs';
      if (isBroadcastingBrowser) {
        stopBrowserRecording();
        socketRef.current?.emit('stop_browser_broadcast', { classId });
        setIsBroadcastingBrowser(false);
      }

      await apiRequest(`/live-classes/${classId}/end`, {
        method: 'POST',
        body: JSON.stringify({ broadcastMode: mode }),
      });

      // If recorded chunks exist from in-browser broadcast, upload them to Video Lectures
      if (recordedChunksRef.current.length > 0) {
        await uploadBrowserRecording();
      }

      setIsLive(false);
      alert('Class ended. Replay is now saved and available for enrolled students!');
      onLeave();
    } catch (err) {
      alert(err.message || 'Failed to end live class');
    }
  };

  // Allow Student to Speak
  const handleAllowSpeak = (student) => {
    setActiveSpeaker(student);
    socketRef.current?.emit('permit_speak', {
      classId,
      studentSocketId: student.socketId,
      studentUserId: student.userId,
    });
  };

  // Mute Current Speaker
  const handleMuteSpeaker = () => {
    setActiveSpeaker(null);
    socketRef.current?.emit('mute_speaker', { classId });
    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null;
    }
  };

  // Send Chat
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !socketRef.current) return;
    socketRef.current.emit('send_chat', { classId, message: chatInput.trim() });
    setChatInput('');
  };

  // Launch Poll
  const handleLaunchPoll = async (e) => {
    e.preventDefault();
    if (!pollQuestion.trim()) return;

    try {
      const res = await apiRequest(`/live-classes/${classId}/polls`, {
        method: 'POST',
        body: JSON.stringify({
          question: pollQuestion.trim(),
          options: pollOptions.filter((o) => o.trim()),
          correctOption: pollCorrectOption,
          durationSeconds: 30,
        }),
      });

      socketRef.current?.emit('publish_poll', {
        classId,
        poll: {
          id: res.pollId,
          question: res.question,
          options: res.options,
          durationSeconds: res.durationSeconds,
        },
      });

      setActivePollStats({
        id: res.pollId,
        question: res.question,
        options: res.options,
        correctOption: pollCorrectOption,
        results: [],
      });

      setShowPollModal(false);
      setPollQuestion('');
    } catch (err) {
      alert(err.message || 'Failed to launch poll');
    }
  };

  const handleShareLeaderboard = async () => {
    if (!activePollStats?.id || isSharingLeaderboard) return;
    setIsSharingLeaderboard(true);
    try {
      const res = await apiRequest(`/live-classes/polls/${activePollStats.id}/share-leaderboard`, {
        method: 'POST',
      });
      setPollLeaderboardModal(res);
      setActivePollStats((prev) => (prev ? { ...prev, isClosed: true } : null));
    } catch (err) {
      console.error('Failed to share leaderboard:', err);
      alert(err.message || 'Failed to share leaderboard');
    } finally {
      setIsSharingLeaderboard(false);
    }
  };

  const handleClosePoll = async () => {
    if (!activePollStats?.id) return;
    try {
      await apiRequest(`/live-classes/polls/${activePollStats.id}/close`, {
        method: 'POST',
      });
      setActivePollStats((prev) => (prev ? { ...prev, isClosed: true } : null));
    } catch (err) {
      console.error('Failed to close poll:', err);
      alert(err.message || 'Failed to close poll');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
        Loading Instructor Studio...
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
      {/* Hidden Audio Element for Student Voice Mixing */}
      <audio ref={audioElementRef} autoPlay />

      {/* Top Studio Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 24px',
          backgroundColor: '#0f172a',
          borderBottom: '1px solid #1e293b',
          color: '#fff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span
            style={{
              backgroundColor: isLive ? '#ef4444' : '#64748b',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '4px',
            }}
          >
            {isLive ? '● ON AIR' : 'OFFLINE'}
          </span>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
            {classData?.title} — Instructor Live Studio
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {!isLive ? (
            <button
              onClick={handleStartClass}
              style={{
                backgroundColor: '#16a34a',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              ▶ Start Live Broadcast
            </button>
          ) : (
            <button
              onClick={handleEndClass}
              style={{
                backgroundColor: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              ⏹ End Class & Save Replay
            </button>
          )}

          <button
            onClick={onLeave}
            style={{
              backgroundColor: '#334155',
              color: '#cbd5e1',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 14px',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Leave Studio
          </button>
        </div>
      </div>

      {/* Main Studio Work Area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: Broadcast Setup & Ingest Credentials */}
        <div
          style={{
            flex: 1,
            padding: '24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            backgroundColor: '#0b1120',
          }}
        >
          {/* Dual Mode Switcher Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              backgroundColor: '#1e293b',
              padding: '6px',
              borderRadius: '12px',
              border: '1px solid #334155',
            }}
          >
            <button
              onClick={() => setStudioMode('browser')}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: studioMode === 'browser' ? '#0284c7' : 'transparent',
                color: studioMode === 'browser' ? '#fff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
            >
              <span>🌐</span> Option A: Web Browser Live
            </button>
            <button
              onClick={() => setStudioMode('obs')}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: studioMode === 'obs' ? '#4f46e5' : 'transparent',
                color: studioMode === 'obs' ? '#fff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
            >
              <span>📡</span> Option B: OBS Studio (Pro Mode)
            </button>
          </div>

          {/* Option A: Direct Web Browser Live */}
          {studioMode === 'browser' && (
            <div
              style={{
                backgroundColor: '#1e293b',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #334155',
                color: '#fff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#38bdf8' }}>
                    🌐 Option A: Direct Web Browser Live (No Software Needed)
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                    Broadcast directly from Chrome/Edge using your webcam, mic, or screen share. Zero software to download.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleToggleMediaTest}
                    style={{
                      backgroundColor: isMediaTestActive && !isBroadcastingBrowser ? '#475569' : '#0f172a',
                      color: '#cbd5e1',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '8px 14px',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>📷</span> {isMediaTestActive ? 'Camera On' : 'Preview Cam'}
                  </button>

                  <button
                    onClick={handleToggleScreenShare}
                    style={{
                      backgroundColor: isScreenSharing ? '#7c3aed' : '#0f172a',
                      color: '#fff',
                      border: isScreenSharing ? '1px solid #8b5cf6' : '1px solid #334155',
                      borderRadius: '6px',
                      padding: '8px 14px',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>🖥️</span> {isScreenSharing ? 'Stop Screen Share' : 'Share Screen / PPT'}
                  </button>

                  <button
                    onClick={handleToggleBrowserBroadcast}
                    disabled={isUploadingRecording}
                    style={{
                      backgroundColor: isBroadcastingBrowser ? '#dc2626' : '#16a34a',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 18px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: isUploadingRecording ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: isBroadcastingBrowser ? '0 0 16px rgba(220, 38, 38, 0.6)' : 'none',
                    }}
                  >
                    {isUploadingRecording
                      ? '⏳ Uploading Replay...'
                      : isBroadcastingBrowser
                      ? '⏹ Stop Browser Broadcast'
                      : '🔴 Go Live (Browser Stream)'}
                  </button>
                </div>
              </div>

              {isBroadcastingBrowser && (
                <div
                  style={{
                    backgroundColor: 'rgba(220, 38, 38, 0.15)',
                    border: '1px solid #dc2626',
                    color: '#fca5a5',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    marginBottom: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#dc2626', animation: 'pulse 1.5s infinite' }} />
                    🔴 LIVE ON AIR: In-Browser WebRTC broadcast active & auto-recording for student replay.
                  </div>
                  {isScreenSharing && (
                    <span style={{ backgroundColor: '#7c3aed', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                      🖥️ Screen Sharing Active
                    </span>
                  )}
                </div>
              )}

              {deviceError && (
                <div
                  style={{
                    backgroundColor: '#fee2e2',
                    color: '#b91c1c',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    marginBottom: '12px',
                  }}
                >
                  {deviceError}
                </div>
              )}

              {isMediaTestActive || isBroadcastingBrowser ? (
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap' }}>
                  <div
                    style={{
                      width: '320px',
                      height: '190px',
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid #334155',
                      position: 'relative',
                    }}
                  >
                    <video
                      ref={videoPreviewRef}
                      autoPlay
                      muted
                      playsInline
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '8px',
                        left: '8px',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: '#fff',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                      }}
                    >
                      {isScreenSharing ? '🖥️ Screen Feed' : '📹 Camera Feed'}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#22c55e', marginBottom: '6px' }}>
                      ✅ Camera, Screen & Microphone Operational
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '4px' }}>
                      • Video Stream: High Definition (720p / 1080p WebRTC)
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '4px' }}>
                      • Microphone: Active Audio Signal Connected
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '8px' }}>
                      • Auto-Recording: Enabled (Saved to Video Lectures upon ending)
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      💡 Tip: Click <b>"Share Screen / PPT"</b> to present your slides or PDF notes alongside your audio.
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.82rem', color: '#64748b', padding: '12px', backgroundColor: '#0f172a', borderRadius: '8px' }}>
                  Click <b>"Preview Cam"</b> to verify your webcam/mic or click <b>"Go Live (Browser Stream)"</b> to immediately start teaching students.
                </div>
              )}
            </div>
          )}

          {/* Option B: OBS Studio / RTMP Stream */}
          {studioMode === 'obs' && (
            <div
              style={{
                backgroundColor: '#1e293b',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #334155',
                color: '#fff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#818cf8' }}>
                    📡 Option B: OBS Studio / Hardware Encoder (Pro Classroom Mode)
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                    Broadcast using OBS Studio, vMix, or a digital drawing tablet setup with adaptive bitrate HLS.
                  </p>
                </div>

                <button
                  onClick={() =>
                    handleCopy(
                      `Server: ${classData?.rtmpUrl || ''}\nStream Key: ${classData?.streamKey || ''}`,
                      'all'
                    )
                  }
                  style={{
                    backgroundColor: copiedAll ? '#16a34a' : '#334155',
                    color: '#fff',
                    border: copiedAll ? '1px solid #22c55e' : '1px solid #475569',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s',
                    boxShadow: copiedAll ? '0 0 12px rgba(34, 197, 94, 0.4)' : 'none',
                  }}
                  title="Copy both RTMP Server URL and Stream Key formatted for OBS"
                >
                  {copiedAll ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
                  <span>{copiedAll ? '✓ All Ingest Details Copied!' : 'Copy All Ingest Details'}</span>
                </button>
              </div>

              {/* Real-time OBS Stream Signal Detection Banner */}
              {obsStatus?.isObsActive ? (
                <div
                  style={{
                    backgroundColor: 'rgba(34, 197, 94, 0.15)',
                    border: '1px solid #22c55e',
                    color: '#4ade80',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>🟢</span>
                  <div>
                    OBS Live Stream Signal Active & Broadcasting!
                    <div style={{ fontSize: '0.78rem', fontWeight: 500, color: '#bbf7d0', marginTop: '2px' }}>
                      Live streaming server is actively receiving video frames and delivering HLS to students.
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: 'rgba(234, 179, 8, 0.12)',
                    border: '1px solid #eab308',
                    color: '#fef08a',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.85rem',
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>⏳</span>
                  <div>
                    <span style={{ fontWeight: 700 }}>Waiting for OBS Stream Signal...</span>
                    <div style={{ fontSize: '0.78rem', color: '#fde047', marginTop: '2px' }}>
                      Open OBS Studio, paste the Server and Stream Key below, and click <b>"Start Streaming"</b> in OBS.
                    </div>
                  </div>
                </div>
              )}

              {/* Ingest Credentials with Copy Icons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>RTMP Server URL</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.12)', padding: '1px 6px', borderRadius: '4px' }}>
                        OBS "Server"
                      </span>
                    </label>
                    {copiedRtmp && (
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4ade80' }}>
                        ✓ Copied to clipboard
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      readOnly
                      value={classData?.rtmpUrl || ''}
                      onClick={(e) => {
                        e.target.select();
                        handleCopy(classData?.rtmpUrl || '', 'rtmp');
                      }}
                      title="Click to copy RTMP URL"
                      style={{ ...readOnlyInputStyle, flex: 1, cursor: 'pointer' }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(classData?.rtmpUrl || '', 'rtmp')
                      }
                      style={{
                        backgroundColor: copiedRtmp ? '#16a34a' : '#1e293b',
                        color: copiedRtmp ? '#ffffff' : '#38bdf8',
                        border: copiedRtmp ? '1px solid #22c55e' : '1px solid #38bdf8',
                        borderRadius: '6px',
                        padding: '0 16px',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s',
                        boxShadow: copiedRtmp ? '0 0 12px rgba(34, 197, 94, 0.4)' : 'none',
                      }}
                      title="Copy RTMP Server URL to clipboard"
                    >
                      {copiedRtmp ? <CheckIcon size={15} /> : <CopyIcon size={15} />}
                      <span>{copiedRtmp ? 'Copied!' : 'Copy URL'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Stream Key (Secret)</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#a855f7', backgroundColor: 'rgba(168, 85, 247, 0.12)', padding: '1px 6px', borderRadius: '4px' }}>
                        OBS "Stream Key"
                      </span>
                    </label>
                    {copiedKey && (
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4ade80' }}>
                        ✓ Copied to clipboard
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type={showStreamKey ? 'text' : 'password'}
                      readOnly
                      value={classData?.streamKey || ''}
                      onClick={(e) => {
                        e.target.select();
                        handleCopy(classData?.streamKey || '', 'key');
                      }}
                      title="Click to copy Stream Key"
                      style={{ ...readOnlyInputStyle, flex: 1, cursor: 'pointer' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowStreamKey(!showStreamKey)}
                      style={{
                        backgroundColor: '#0f172a',
                        color: showStreamKey ? '#38bdf8' : '#94a3b8',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        padding: '0 12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        transition: 'all 0.2s',
                      }}
                      title={showStreamKey ? 'Conceal stream key' : 'Reveal stream key'}
                    >
                      {showStreamKey ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                      <span style={{ fontSize: '0.75rem' }}>{showStreamKey ? 'Hide' : 'Show'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(classData?.streamKey || '', 'key')}
                      style={{
                        backgroundColor: copiedKey ? '#16a34a' : '#1e293b',
                        color: copiedKey ? '#ffffff' : '#38bdf8',
                        border: copiedKey ? '1px solid #22c55e' : '1px solid #38bdf8',
                        borderRadius: '6px',
                        padding: '0 16px',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s',
                        boxShadow: copiedKey ? '0 0 12px rgba(34, 197, 94, 0.4)' : 'none',
                      }}
                      title="Copy Secret Stream Key to clipboard"
                    >
                      {copiedKey ? <CheckIcon size={15} /> : <CopyIcon size={15} />}
                      <span>{copiedKey ? 'Copied!' : 'Copy Key'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 3-Step OBS Setup Guide */}
              <div style={{ marginTop: '16px', padding: '12px 14px', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                  ⚡ Quick OBS Studio Setup:
                </div>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                  1. In OBS, go to <b>Settings $\to$ Stream</b> and select Service: <b>Custom...</b><br />
                  2. Paste <b>RTMP Server URL</b> into <i>Server</i> and <b>Stream Key</b> into <i>Stream Key</i>.<br />
                  3. Click <b>"Start Streaming"</b> in OBS. The live stream will automatically broadcast to students.
                </div>
              </div>
            </div>
          )}

          {/* Active Speaker Banner (if a student is allowed to speak) */}
          {activeSpeaker && (
            <div
              style={{
                backgroundColor: '#15803d',
                borderRadius: '10px',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#fff',
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                  🎙️ Student Speaking Live: {activeSpeaker.name} (Roll #{activeSpeaker.rollNo})
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>
                  Student voice is actively playing through your speakers and being mixed into the broadcast.
                </div>
              </div>

              <button
                onClick={handleMuteSpeaker}
                style={{
                  backgroundColor: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Mute Student
              </button>
            </div>
          )}

          {/* Hand-Raise Student Queue */}
          <div
            style={{
              backgroundColor: '#1e293b',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #334155',
              color: '#fff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f59e0b' }}>
                ✋ Student Hand-Raise Audio Queue ({handRaiseQueue.length})
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Click "Allow to Speak" to unmute 1 student's mic
              </span>
            </div>

            {handRaiseQueue.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b', fontSize: '0.85rem' }}>
                No students currently have their hand raised.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {handRaiseQueue.map((student) => (
                  <div
                    key={student.userId}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: '#0f172a',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #334155',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{student.name}</span>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: '8px' }}>
                        Roll #{student.rollNo} • Raised at {student.time}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAllowSpeak(student)}
                      disabled={activeSpeaker?.userId === student.userId}
                      style={{
                        backgroundColor: '#16a34a',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 14px',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      {activeSpeaker?.userId === student.userId ? 'Speaking...' : '🎙️ Allow to Speak'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Poll Live Stats / Creator Launcher */}
          <div
            style={{
              backgroundColor: '#1e293b',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #334155',
              color: '#fff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#a78bfa' }}>
                📊 In-Class Live MCQ Poll
              </h3>
              <button
                onClick={() => setShowPollModal(true)}
                style={{
                  backgroundColor: '#7c3aed',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                ➕ Create & Launch Poll
              </button>
            </div>

            {activePollStats ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                    Active Question: {activePollStats.question}
                  </div>
                  {activePollStats.isClosed ? (
                    <span style={{ fontSize: '0.75rem', backgroundColor: '#47556940', color: '#94a3b8', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      Closed
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', backgroundColor: '#15803d30', color: '#4ade80', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      Voting Open
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {activePollStats.options?.map((opt, idx) => {
                    const totalVotes = activePollStats.results?.reduce((sum, r) => sum + (parseInt(r.vote_count, 10) || 0), 0) || 0;
                    const count = activePollStats.results?.find((r) => r.selected_option === idx)?.vote_count || 0;
                    const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                    const isCorrect = activePollStats.correctOption === idx;

                    return (
                      <div key={idx} style={{ backgroundColor: '#0f172a', padding: '10px 14px', borderRadius: '8px', border: '1px solid #334155' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                          <span style={{ color: isCorrect ? '#4ade80' : '#f1f5f9', fontWeight: isCorrect ? 700 : 500 }}>
                            {String.fromCharCode(65 + idx)}. {opt} {isCorrect ? '✅ (Correct)' : ''}
                          </span>
                          <span style={{ fontWeight: 700, color: '#38bdf8' }}>{pct}% ({count} votes)</span>
                        </div>
                        <div style={{ width: '100%', height: '4px', backgroundColor: '#334155', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: isCorrect ? '#22c55e' : '#38bdf8', transition: 'width 0.3s' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleShareLeaderboard}
                    disabled={isSharingLeaderboard}
                    style={{
                      flex: 1,
                      backgroundColor: '#eab308',
                      color: '#000',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(234, 179, 8, 0.35)',
                    }}
                  >
                    {isSharingLeaderboard ? '⏳ Publishing...' : '🏆 Share Top 10 Leaderboard with Class'}
                  </button>

                  {!activePollStats.isClosed && (
                    <button
                      onClick={handleClosePoll}
                      style={{
                        backgroundColor: '#475569',
                        color: '#f1f5f9',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 16px',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                      }}
                    >
                      ⏹ End Poll
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                No active poll. Launch an MCQ to test student understanding in real-time.
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Chat */}
        <div
          style={{
            width: '360px',
            backgroundColor: '#0f172a',
            borderLeft: '1px solid #1e293b',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #1e293b', fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>
            💬 Classroom Live Chat
          </div>

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
            {messages.map((m) => (
              <div key={m.id} style={{ fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 700, color: '#cbd5e1' }}>{m.name}</span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{m.time}</span>
                </div>
                <div style={{ color: '#f1f5f9', wordBreak: 'break-word' }}>{m.text}</div>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          <form onSubmit={handleSendMessage} style={{ padding: '12px 16px', borderTop: '1px solid #1e293b', display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Send message as instructor..."
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

      {/* Poll Creation Modal */}
      {showPollModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#1e293b',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              border: '1px solid #334155',
              color: '#fff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Create Live In-Class Poll</h3>
              <button
                onClick={() => setShowPollModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLaunchPoll}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                  Question
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., What is the unit of electric current?"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  style={modalInputStyle}
                />
              </div>

              {pollOptions.map((opt, idx) => (
                <div key={idx} style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                    Option {String.fromCharCode(65 + idx)}
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => {
                        const updated = [...pollOptions];
                        updated[idx] = e.target.value;
                        setPollOptions(updated);
                      }}
                      style={modalInputStyle}
                    />
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#cbd5e1', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="correctOpt"
                        checked={pollCorrectOption === idx}
                        onChange={() => setPollCorrectOption(idx)}
                      />
                      Correct
                    </label>
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setShowPollModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #475569',
                    backgroundColor: 'transparent',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#7c3aed',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  🚀 Broadcast Poll Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shared Poll Leaderboard Modal (Teacher Studio View) */}
      {pollLeaderboardModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#0f172a',
              borderRadius: '18px',
              border: '1px solid #eab308',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(234, 179, 8, 0.25)',
              width: '100%',
              maxWidth: '540px',
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              color: '#fff',
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #451a03 0%, #78350f 50%, #1e293b 100%)',
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
                    Top 10 Fastest Correct Answers
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#fde68a', fontWeight: 600 }}>
                    Broadcasted to Student Screens Live
                  </span>
                </div>
              </div>

              <button
                onClick={() => setPollLeaderboardModal(null)}
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

            {/* Question Info */}
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
                  {pollLeaderboardModal.question}
                </div>
                {pollLeaderboardModal.correctOption !== null && pollLeaderboardModal.correctOption !== undefined && (
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
                    <span>✅ Correct Option:</span>
                    <span>
                      Option {String.fromCharCode(65 + pollLeaderboardModal.correctOption)} ({pollLeaderboardModal.options?.[pollLeaderboardModal.correctOption]})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Leaderboard Table */}
            <div style={{ flex: 1, padding: '10px 22px 16px 22px', overflowY: 'auto' }}>
              {pollLeaderboardModal.leaderboard && pollLeaderboardModal.leaderboard.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {pollLeaderboardModal.leaderboard.map((entry) => {
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
                              ? 'rgba(234, 179, 8, 0.15)'
                              : entry.rank === 2
                              ? 'rgba(203, 213, 225, 0.12)'
                              : 'rgba(217, 119, 6, 0.12)'
                            : '#1e293b',
                          border: '1px solid',
                          borderColor: isTop3
                            ? entry.rank === 1
                              ? '#eab308'
                              : entry.rank === 2
                              ? '#94a3b8'
                              : '#d97706'
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
                              Option {String.fromCharCode(65 + entry.selectedOption)}
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: 'rgba(234, 179, 8, 0.15)',
                            color: '#fde047',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            border: '1px solid rgba(234, 179, 8, 0.3)',
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
                  No correct responses were recorded.
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
                onClick={() => setPollLeaderboardModal(null)}
                style={{
                  backgroundColor: '#475569',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 20px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const readOnlyInputStyle = {
  width: '100%',
  backgroundColor: '#0f172a',
  color: '#60a5fa',
  border: '1px solid #334155',
  borderRadius: '6px',
  padding: '8px 12px',
  fontSize: '0.85rem',
  fontFamily: 'monospace',
  boxSizing: 'border-box',
};

const modalInputStyle = {
  width: '100%',
  backgroundColor: '#0f172a',
  color: '#fff',
  border: '1px solid #334155',
  borderRadius: '6px',
  padding: '8px 12px',
  fontSize: '0.85rem',
  boxSizing: 'border-box',
};
