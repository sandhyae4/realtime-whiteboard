const mongoose = require("mongoose");

const pointSchema = new mongoose.Schema({ x: Number, y: Number }, { _id: false });

const strokeSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userName: { type: String },
  tool: { type: String, enum: ["pen", "eraser", "line", "rect", "circle", "text"], default: "pen" },
  color: { type: String, default: "#000000" },
  width: { type: Number, default: 3 },
  points: [pointSchema],
  text: { type: String },
  x: { type: Number },
  y: { type: Number },
  width2: { type: Number },
  height: { type: Number },
  strokeId: { type: String, unique: true },
}, { timestamps: true });

strokeSchema.index({ room: 1, createdAt: 1 });

module.exports = mongoose.model("Stroke", strokeSchema);
