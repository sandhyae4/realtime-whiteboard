const User = require("../models/User");
const crypto = require("crypto");

const findByEmail = (email) => User.findOne({ email });
const findById = (id) => User.findById(id);
const create = (data) => User.create(data);
const save = (user) => user.save();

const findByVerificationToken = (token) => {
  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  return User.findOne({
    emailVerificationToken: hashed,
    emailVerificationExpires: { $gt: Date.now() },
  }).select("+emailVerificationToken +emailVerificationExpires");
};

const findByRefreshToken = (token) =>
  User.findOne({ refreshToken: token }).select("+refreshToken");

const updateRefreshToken = (userId, token) =>
  User.findByIdAndUpdate(userId, { refreshToken: token });

module.exports = { findByEmail, findById, create, save, findByVerificationToken, findByRefreshToken, updateRefreshToken };
