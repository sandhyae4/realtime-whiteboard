const roomRepo = require("../repositories/roomRepository");
const strokeRepo = require("../repositories/strokeRepository");
const env = require("../config/env");

const createRoom = async ({ name, isPublic, canvasBackground }, userId) => {
  const room = await roomRepo.create({ name, isPublic: isPublic || false, canvasBackground, owner: userId, members: [userId] });
  return room;
};

const getRoomById = async (roomId, userId) => {
  const room = await roomRepo.findById(roomId);
  if (!room) throw Object.assign(new Error("Room not found"), { status: 404 });
  const isMember = room.members.some((m) => m._id.toString() === userId.toString());
  const isOwner = room.owner._id.toString() === userId.toString();
  if (!room.isPublic && !isMember && !isOwner) {
    throw Object.assign(new Error("Access denied. Use invite link to join."), { status: 403 });
  }
  return room;
};

const joinByInviteCode = async (inviteCode, userId) => {
  const room = await roomRepo.findByInviteCode(inviteCode);
  if (!room) throw Object.assign(new Error("Invalid invite code"), { status: 404 });

  const alreadyMember = room.members.some((m) => m.toString() === userId.toString());
  if (!alreadyMember) {
    room.members.push(userId);
    await room.save();
  }
  return room;
};

const getMyRooms = async (userId) => {
  const owned = await roomRepo.findByOwner(userId);
  const member = await roomRepo.findByMember(userId);
  const all = [...owned, ...member.filter((r) => r.owner.toString() !== userId.toString())];
  return all;
};

const getRoomStrokes = async (roomId) => {
  return strokeRepo.findByRoom(roomId);
};

const deleteRoom = async (roomId, userId) => {
  const room = await roomRepo.findById(roomId);
  if (!room) throw Object.assign(new Error("Room not found"), { status: 404 });
  if (room.owner._id.toString() !== userId.toString()) {
    throw Object.assign(new Error("Only room owner can delete"), { status: 403 });
  }
  await strokeRepo.deleteByRoom(roomId);
  await roomRepo.deleteById(roomId);
};

const clearCanvas = async (roomId, userId) => {
  const room = await roomRepo.findById(roomId);
  if (!room) throw Object.assign(new Error("Room not found"), { status: 404 });
  if (room.owner._id.toString() !== userId.toString()) {
    throw Object.assign(new Error("Only room owner can clear canvas"), { status: 403 });
  }
  await strokeRepo.deleteByRoom(roomId);
  room.strokeCount = 0;
  await room.save();
};

const getTopRooms = () => roomRepo.getTopActiveRooms(10);

const getInviteLink = (inviteCode) => env.CLIENT_URL + "/join/" + inviteCode;

module.exports = { createRoom, getRoomById, joinByInviteCode, getMyRooms, getRoomStrokes, deleteRoom, clearCanvas, getTopRooms, getInviteLink };
