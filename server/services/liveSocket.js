import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'edutorai_mastery_quiz_secret_key_2026';

let ioInstance = null;

// Track active hand-raise queues per live class: classId -> Map(userId -> { socketId, name, rollNo, time })
const handRaiseQueues = new Map();

// Track current speaking student per live class: classId -> { userId, socketId }
const activeSpeakers = new Map();

// Track in-browser teacher broadcast stream: classId -> teacherSocketId
const activeBrowserBroadcasters = new Map();

export function initLiveSocket(server, corsOptions) {
  const io = new Server(server, {
    cors: corsOptions,
    path: '/socket.io',
    transports: ['websocket', 'polling'],
  });

  ioInstance = io;

  const liveNamespace = io.of('/live-class');

  // Socket Authentication Middleware
  liveNamespace.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication required for live class'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid socket authentication token'));
    }
  });

  liveNamespace.on('connection', (socket) => {
    const user = socket.user;
    let currentClassId = null;

    // 1. Join Room
    socket.on('join_room', ({ classId, isTeacher = false }) => {
      currentClassId = classId;
      const roomName = `class_${classId}`;
      socket.join(roomName);

      // Store teacher socket ID in room data if teacher
      if (isTeacher) {
        socket.join(`teacher_${classId}`);
      } else {
        // If teacher is currently broadcasting in-browser, notify student immediately
        if (activeBrowserBroadcasters.has(classId)) {
          socket.emit('teacher_broadcast_started', {
            teacherSocketId: activeBrowserBroadcasters.get(classId),
          });
        }
      }

      // Initialize queue if needed
      if (!handRaiseQueues.has(classId)) {
        handRaiseQueues.set(classId, new Map());
      }

      // Send initial hand-raise queue state to teacher
      if (isTeacher) {
        const queueList = Array.from(handRaiseQueues.get(classId).values());
        socket.emit('hand_raise_queue_update', queueList);
      }

      // Broadcast user joined notification
      liveNamespace.to(roomName).emit('user_joined', {
        userId: user.id,
        name: user.full_name,
        role: user.role,
        onlineCount: liveNamespace.adapter.rooms.get(roomName)?.size || 1,
      });
    });

    // 2. Real-Time Chat Message
    socket.on('send_chat', ({ classId, message }) => {
      if (!message || !message.trim()) return;

      const chatPayload = {
        id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        userId: user.id,
        name: user.full_name || 'Anonymous',
        role: user.role,
        text: message.trim().substring(0, 500),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      liveNamespace.to(`class_${classId}`).emit('new_chat_message', chatPayload);
    });

    // 3. Hand-Raise (Student requests mic access)
    socket.on('raise_hand', ({ classId }) => {
      const queue = handRaiseQueues.get(classId) || new Map();
      queue.set(user.id, {
        userId: user.id,
        socketId: socket.id,
        name: user.full_name || 'Student',
        rollNo: user.id,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      handRaiseQueues.set(classId, queue);

      // Notify teacher room of updated queue
      const queueList = Array.from(queue.values());
      liveNamespace.to(`teacher_${classId}`).emit('hand_raise_queue_update', queueList);
      socket.emit('hand_raise_status', { isRaised: true });
    });

    // 4. Cancel Hand-Raise (Student cancels request)
    socket.on('lower_hand', ({ classId }) => {
      const queue = handRaiseQueues.get(classId);
      if (queue) {
        queue.delete(user.id);
        const queueList = Array.from(queue.values());
        liveNamespace.to(`teacher_${classId}`).emit('hand_raise_queue_update', queueList);
      }
      socket.emit('hand_raise_status', { isRaised: false });
    });

    // 5. Teacher Grants Mic Permission (One student at a time)
    socket.on('permit_speak', ({ classId, studentSocketId, studentUserId }) => {
      // Remove student from queue
      const queue = handRaiseQueues.get(classId);
      if (queue) {
        queue.delete(studentUserId);
        liveNamespace.to(`teacher_${classId}`).emit('hand_raise_queue_update', Array.from(queue.values()));
      }

      // Record active speaker
      activeSpeakers.set(classId, { userId: studentUserId, socketId: studentSocketId });

      // Notify the specific student that their mic is now permitted
      liveNamespace.to(studentSocketId).emit('mic_granted', {
        classId,
        teacherSocketId: socket.id,
      });

      // Broadcast to whole class that this student is speaking
      liveNamespace.to(`class_${classId}`).emit('speaker_change', {
        userId: studentUserId,
        name: user.full_name,
        isSpeaking: true,
      });
    });

    // 6. Teacher Mutes / Revokes Student Mic
    socket.on('mute_speaker', ({ classId }) => {
      const currentSpeaker = activeSpeakers.get(classId);
      if (currentSpeaker) {
        liveNamespace.to(currentSpeaker.socketId).emit('mic_revoked');
        activeSpeakers.delete(classId);
      }

      liveNamespace.to(`class_${classId}`).emit('speaker_change', {
        isSpeaking: false,
      });
    });

    // 7. WebRTC Audio Signaling (Pass SDP Offer/Answer/ICE between student mic and teacher audio mixer)
    socket.on('webrtc_signal', ({ targetSocketId, signal }) => {
      if (targetSocketId && signal) {
        liveNamespace.to(targetSocketId).emit('webrtc_signal', {
          senderSocketId: socket.id,
          signal,
        });
      }
    });

    // 8. Live Poll Events
    socket.on('publish_poll', ({ classId, poll }) => {
      liveNamespace.to(`class_${classId}`).emit('active_poll_started', poll);
    });

    socket.on('poll_vote_cast', ({ classId, pollId, results }) => {
      liveNamespace.to(`class_${classId}`).emit('poll_results_updated', {
        pollId,
        results,
      });
    });

    socket.on('close_poll', ({ classId, pollId }) => {
      liveNamespace.to(`class_${classId}`).emit('active_poll_closed', { pollId });
    });

    socket.on('share_poll_leaderboard', ({ classId, leaderboardData }) => {
      liveNamespace.to(`class_${classId}`).emit('poll_leaderboard_published', leaderboardData);
      liveNamespace.to(`class_${classId}`).emit('active_poll_closed', { pollId: leaderboardData?.pollId });
    });

    // 9. In-Browser WebRTC Teacher Live Broadcast
    socket.on('start_browser_broadcast', ({ classId }) => {
      activeBrowserBroadcasters.set(classId, socket.id);
      socket.to(`class_${classId}`).emit('teacher_broadcast_started', {
        teacherSocketId: socket.id,
      });
    });

    socket.on('stop_browser_broadcast', ({ classId }) => {
      activeBrowserBroadcasters.delete(classId);
      liveNamespace.to(`class_${classId}`).emit('teacher_broadcast_stopped');
    });

    socket.on('request_broadcast_feed', ({ classId, teacherSocketId }) => {
      const targetId = teacherSocketId || activeBrowserBroadcasters.get(classId);
      if (targetId) {
        liveNamespace.to(targetId).emit('student_requested_feed', {
          studentSocketId: socket.id,
        });
      }
    });

    // Disconnect cleanup
    socket.on('disconnect', () => {
      if (currentClassId) {
        if (activeBrowserBroadcasters.get(currentClassId) === socket.id) {
          activeBrowserBroadcasters.delete(currentClassId);
          liveNamespace.to(`class_${currentClassId}`).emit('teacher_broadcast_stopped');
        }

        const queue = handRaiseQueues.get(currentClassId);
        if (queue && queue.has(user.id)) {
          queue.delete(user.id);
          liveNamespace.to(`teacher_${currentClassId}`).emit('hand_raise_queue_update', Array.from(queue.values()));
        }

        const currentSpeaker = activeSpeakers.get(currentClassId);
        if (currentSpeaker && currentSpeaker.userId === user.id) {
          activeSpeakers.delete(currentClassId);
          liveNamespace.to(`class_${currentClassId}`).emit('speaker_change', { isSpeaking: false });
        }
      }
    });
  });

  console.log('⚡ Live Classrooms Socket.io Service Initialized (/live-class)');
  return io;
}

export function getIO() {
  return ioInstance;
}
