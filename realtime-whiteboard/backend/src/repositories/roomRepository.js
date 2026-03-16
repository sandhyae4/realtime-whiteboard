const Room = require("../models/Room");

const create = (data) => Room.create(data);
const findById = (id) => Room.findById(id).populate("owner", "name email").populate("members", "name email");
const findByInviteCode = (code) => Room.findOne({ inviteCode: code });
const findByOwner = (userId) => Room.find({ owner: userId }).sort({ lastActivity: -1 });
const findByMember = (userId) => Room.find({ members: userId }).sort({ lastActivity: -1 });
const updateActivity = (roomId) => Room.findByIdAndUpdate(roomId, { lastActivity: new Date() });
const incrementStrokeCount = (roomId) => Room.findByIdAndUpdate(roomId, { $inc: { strokeCount: 1 } });
const updateActiveUsers = (roomId, count) => Room.findByIdAndUpdate(roomId, { activeUsers: count });
const deleteById = (id) => Room.findByIdAndDelete(id);

// Aggregation: top-N active rooms dashboard
const getTopActiveRooms = (limit = 10) => {
  return Room.aggregate([
    { $match: { lastActivity: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerInfo",
      },
    },
    { $unwind: { path: "$ownerInfo", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        name: 1, inviteCode: 1, isPublic: 1, strokeCount: 1,
        activeUsers: 1, lastActivity: 1,
        memberCount: { $size: "$members" },
        ownerName: "$ownerInfo.name",
      },
    },
    { $sort: { activeUsers: -1, strokeCount: -1, lastActivity: -1 } },
    { $limit: limit },
  ]);
};

module.exports = { create, findById, findByInviteCode, findByOwner, findByMember, updateActivity, incrementStrokeCount, updateActiveUsers, deleteById, getTopActiveRooms };
