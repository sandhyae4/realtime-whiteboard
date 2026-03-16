const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  logger.error({ err, url: req.url, method: req.method }, "Unhandled error");
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json({ success: false, message: field + " already exists" });
  }
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
};

module.exports = errorHandler;
