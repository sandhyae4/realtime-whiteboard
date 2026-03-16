const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  inviteCode: { type: String, unique: true, default: () => uuidv4().replace(/-/g, "").slice(0, 12) },
  isPublic: { type: Boolean, default: false },
  activeUsers: { type: Number, default: 0 },
  strokeCount: { type: Number, default: 0 },
  lastActivity: { type: Date, default: Date.now },
  canvasBackground: { type: String, default: "#ffffff" },
}, { timestamps: true });

roomSchema.index({ inviteCode: 1 });
roomSchema.index({ lastActivity: -1 });

module.exports = mongoose.model("Room", roomSchema);
