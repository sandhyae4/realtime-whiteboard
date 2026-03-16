const Stroke = require("../models/Stroke");

const findByRoom = (roomId) => Stroke.find({ room: roomId }).sort({ createdAt: 1 });
const insertMany = (strokes) => Stroke.insertMany(strokes, { ordered: false });
const deleteByRoom = (roomId) => Stroke.deleteMany({ room: roomId });
const countByRoom = (roomId) => Stroke.countDocuments({ room: roomId });

module.exports = { findByRoom, insertMany, deleteByRoom, countByRoom };
