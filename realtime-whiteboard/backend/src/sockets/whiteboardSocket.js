const { socketAuth } = require("../middleware/authMiddleware");
const { addToBatch, getStrokes } = require("../services/whiteboardService");
const roomRepo = require("../repositories/roomRepository");
const { strokeSchema } = require("../validation/schemas");
const logger = require("../utils/logger");

// Track online users per room: roomId -> Map<socketId, userInfo>
const roomPresence = new Map();

const initWhiteboardSocket = (io) => {
  // JWT auth for all socket connections
  io.use(socketAuth);

  io.on("connection", (socket) => {
    logger.info({ socketId: socket.id, user: socket.user.name }, "Socket connected");

    // ── Join room ───────────────────────────────────────────────
    socket.on("room:join", async ({ roomId }) => {
      try {
        socket.join("room:" + roomId);

        // Track presence
        if (!roomPresence.has(roomId)) roomPresence.set(roomId, new Map());
        roomPresence.get(roomId).set(socket.id, {
          userId: socket.user._id.toString(),
          name: socket.user.name,
        });

        // Update active user count in DB
        const count = getUniqueUserCount(roomId);
        await roomRepo.updateActiveUsers(roomId, count);

        // Broadcast updated presence
        io.to("room:" + roomId).emit("presence:update", {
          roomId,
          users: getPresenceList(roomId),
        });

        // Send existing strokes to the joining user
        const strokes = await getStrokes(roomId);
        socket.emit("strokes:init", { strokes });

        logger.info({ roomId, user: socket.user.name }, "User joined room");
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    // ── Leave room ──────────────────────────────────────────────
    socket.on("room:leave", ({ roomId }) => {
      leaveRoom(socket, roomId, io);
    });

    // ── Draw stroke ─────────────────────────────────────────────
    socket.on("stroke:draw", ({ roomId, stroke }) => {
      // Validate stroke with Zod
      const result = strokeSchema.safeParse(stroke);
      if (!result.success) {
        socket.emit("error", { message: "Invalid stroke data" });
        return;
      }

      const strokeData = {
        ...result.data,
        room: roomId,
        user: socket.user._id,
        userName: socket.user.name,
      };

      // Add to in-memory batch (flushed to DB every 3s by worker)
      addToBatch(roomId, strokeData);

      // Broadcast to ALL other users in room immediately (real-time)
      socket.to("room:" + roomId).emit("stroke:new", { stroke: strokeData });
    });

    // ── Canvas cleared ──────────────────────────────────────────
    socket.on("canvas:clear", ({ roomId }) => {
      socket.to("room:" + roomId).emit("canvas:cleared", {
        clearedBy: socket.user.name,
      });
    });

    // ── Cursor position ─────────────────────────────────────────
    socket.on("cursor:move", ({ roomId, x, y }) => {
      socket.to("room:" + roomId).emit("cursor:update", {
        userId: socket.user._id,
        name: socket.user.name,
        x, y,
      });
    });

    // ── Typing indicator ─────────────────────────────────────────
    socket.on("user:typing", ({ roomId, text }) => {
      socket.to("room:" + roomId).emit("user:typing", {
        userId: socket.user._id,
        name: socket.user.name,
        text,
      });
    });

    // ── Disconnect ───────────────────────────────────────────────
    socket.on("disconnect", async () => {
      for (const [roomId, users] of roomPresence.entries()) {
        if (users.has(socket.id)) {
          users.delete(socket.id);
          const count = getUniqueUserCount(roomId);
          await roomRepo.updateActiveUsers(roomId, count).catch(() => {});
          io.to("room:" + roomId).emit("presence:update", {
            roomId,
            users: getPresenceList(roomId),
          });
          if (users.size === 0) roomPresence.delete(roomId);
        }
      }
      logger.info({ socketId: socket.id }, "Socket disconnected");
    });
  });
};

const leaveRoom = async (socket, roomId, io) => {
  socket.leave("room:" + roomId);
  const users = roomPresence.get(roomId);
  if (users) {
    users.delete(socket.id);
    const count = getUniqueUserCount(roomId);
    await roomRepo.updateActiveUsers(roomId, count).catch(() => {});
    io.to("room:" + roomId).emit("presence:update", {
      roomId,
      users: getPresenceList(roomId),
    });
    if (users.size === 0) roomPresence.delete(roomId);
  }
};

const getPresenceList = (roomId) => {
  const users = roomPresence.get(roomId);
  if (!users) return [];
  const seen = new Set();
  const result = [];
  for (const info of users.values()) {
    if (!seen.has(info.userId)) {
      seen.add(info.userId);
      result.push({ userId: info.userId, name: info.name });
    }
  }
  return result;
};

const getUniqueUserCount = (roomId) => {
  const users = roomPresence.get(roomId);
  if (!users) return 0;
  const seen = new Set();
  for (const info of users.values()) seen.add(info.userId);
  return seen.size;
};

module.exports = { initWhiteboardSocket };
