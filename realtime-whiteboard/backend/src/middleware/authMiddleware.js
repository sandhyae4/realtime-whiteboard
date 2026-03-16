const jwt = require("jsonwebtoken");
const env = require("../config/env");
const userRepo = require("../repositories/userRepository");
const logger = require("../utils/logger");

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) return res.status(401).json({ success: false, message: "Not authorized" });

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const user = await userRepo.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: "User not found" });
    if (!user.isVerified) return res.status(403).json({ success: false, message: "Please verify your email" });

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") return res.status(401).json({ success: false, message: "Token expired" });
    if (err.name === "JsonWebTokenError") return res.status(401).json({ success: false, message: "Invalid token" });
    logger.error({ err }, "Auth middleware error");
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES });
  const refreshToken = jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES });
  return { accessToken, refreshToken };
};

// Socket.IO JWT auth middleware
const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];
    if (!token) return next(new Error("Authentication required"));
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const user = await userRepo.findById(decoded.id);
    if (!user) return next(new Error("User not found"));
    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
};

module.exports = { protect, generateTokens, socketAuth };
