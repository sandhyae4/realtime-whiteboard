const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 200,
  message: { success: false, message: "Too many requests. Try again in 15 minutes." },
  standardHeaders: true, legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message: { success: false, message: "Too many auth attempts. Try again in 15 minutes." },
  standardHeaders: true, legacyHeaders: false,
});

const roomCreateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 20,
  message: { success: false, message: "Too many rooms created. Try again in 1 hour." },
  standardHeaders: true, legacyHeaders: false,
});

module.exports = { apiLimiter, authLimiter, roomCreateLimiter };
