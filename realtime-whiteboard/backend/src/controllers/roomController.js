const roomService = require("../services/roomService");

const createRoom = async (req, res, next) => {
  try {
    const room = await roomService.createRoom(req.validatedData, req.user._id);
    res.status(201).json({ success: true, room });
  } catch (err) { next(err); }
};

const getRoom = async (req, res, next) => {
  try {
    const room = await roomService.getRoomById(req.params.roomId, req.user._id);
    res.json({ success: true, room });
  } catch (err) { next(err); }
};

const joinRoom = async (req, res, next) => {
  try {
    const room = await roomService.joinByInviteCode(req.params.inviteCode, req.user._id);
    res.json({ success: true, room });
  } catch (err) { next(err); }
};

const getMyRooms = async (req, res, next) => {
  try {
    const rooms = await roomService.getMyRooms(req.user._id);
    res.json({ success: true, rooms });
  } catch (err) { next(err); }
};

const getRoomStrokes = async (req, res, next) => {
  try {
    const strokes = await roomService.getRoomStrokes(req.params.roomId);
    res.json({ success: true, strokes });
  } catch (err) { next(err); }
};

const deleteRoom = async (req, res, next) => {
  try {
    await roomService.deleteRoom(req.params.roomId, req.user._id);
    res.json({ success: true, message: "Room deleted" });
  } catch (err) { next(err); }
};

const clearCanvas = async (req, res, next) => {
  try {
    await roomService.clearCanvas(req.params.roomId, req.user._id);
    const io = req.app.get("io");
    io.to("room:" + req.params.roomId).emit("canvas:cleared", { clearedBy: req.user.name });
    res.json({ success: true, message: "Canvas cleared" });
  } catch (err) { next(err); }
};

const getTopRooms = async (req, res, next) => {
  try {
    const rooms = await roomService.getTopRooms();
    res.json({ success: true, rooms });
  } catch (err) { next(err); }
};

const getInviteLink = (req, res) => {
  const { inviteCode } = req.params;
  const link = roomService.getInviteLink(inviteCode);
  res.json({ success: true, link, inviteCode });
};

// Returns invite link — no email sent
const sendInvite = async (req, res, next) => {
  try {
    const room = await roomService.getRoomById(req.params.roomId, req.user._id);
    const link = roomService.getInviteLink(room.inviteCode);
    res.json({
      success: true,
      message: "Copy and share this invite link manually",
      link,
      inviteCode: room.inviteCode,
    });
  } catch (err) { next(err); }
};

module.exports = {
  createRoom, getRoom, joinRoom, getMyRooms,
  getRoomStrokes, deleteRoom, clearCanvas,
  getTopRooms, getInviteLink, sendInvite,
};