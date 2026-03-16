const strokeRepo = require("../repositories/strokeRepository");
const roomRepo = require("../repositories/roomRepository");

// In-memory stroke batch queue per room
const strokeBatchQueue = new Map(); // roomId -> stroke[]

const addToBatch = (roomId, stroke) => {
  if (!strokeBatchQueue.has(roomId)) strokeBatchQueue.set(roomId, []);
  strokeBatchQueue.get(roomId).push(stroke);
};

const flushBatch = async () => {
  if (strokeBatchQueue.size === 0) return;

  for (const [roomId, strokes] of strokeBatchQueue.entries()) {
    if (strokes.length === 0) continue;
    try {
      await strokeRepo.insertMany(strokes.map((s) => ({ ...s, room: roomId })));
      await roomRepo.updateActivity(roomId);
      await roomRepo.incrementStrokeCount(roomId);
      strokeBatchQueue.set(roomId, []);
    } catch (err) {
      // Ignore duplicate key errors (strokeId already saved)
      if (err.code !== 11000) console.error("Batch flush error:", err.message);
    }
  }
};

const getStrokes = (roomId) => strokeRepo.findByRoom(roomId);

module.exports = { addToBatch, flushBatch, getStrokes, strokeBatchQueue };
