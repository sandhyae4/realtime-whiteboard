const userRepo = require("../repositories/userRepository");
const { generateTokens } = require("../middleware/authMiddleware");
const logger = require("../utils/logger");

const register = async ({ name, email, password }) => {
  const existing = await userRepo.findByEmail(email);
  if (existing) throw Object.assign(new Error("Email already registered"), { status: 409 });

  // Auto-verify — no email verification needed
  const user = await userRepo.create({ name, email, password, isVerified: true });

  const tokens = generateTokens(user._id);
  await userRepo.updateRefreshToken(user._id, tokens.refreshToken);

  return {
    message: "Account created successfully!",
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: { id: user._id, name: user.name, email: user.email },
  };
};

const verifyEmail = async (token) => {
  // Disabled — kept as stub
  return { message: "Email verification is disabled." };
};

const login = async ({ email, password }) => {
  const found = await require("../models/User").findOne({ email }).select("+password");
  if (!found || !(await found.comparePassword(password))) {
    throw Object.assign(new Error("Invalid email or password"), { status: 401 });
  }

  const tokens = generateTokens(found._id);
  await userRepo.updateRefreshToken(found._id, tokens.refreshToken);

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: { id: found._id, name: found.name, email: found.email },
  };
};

const refreshToken = async (token) => {
  const jwt = require("jsonwebtoken");
  const env = require("../config/env");

  try {
    jwt.verify(token, env.JWT_REFRESH_SECRET);
  } catch {
    throw Object.assign(new Error("Invalid refresh token"), { status: 401 });
  }

  const user = await userRepo.findByRefreshToken(token);
  if (!user) throw Object.assign(new Error("Refresh token not found"), { status: 401 });

  const tokens = generateTokens(user._id);
  await userRepo.updateRefreshToken(user._id, tokens.refreshToken);

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: { id: user._id, name: user.name, email: user.email },
  };
};

const logout = async (userId) => {
  await userRepo.updateRefreshToken(userId, null);
};

module.exports = { register, verifyEmail, login, refreshToken, logout };