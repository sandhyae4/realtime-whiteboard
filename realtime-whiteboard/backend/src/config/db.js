const mongoose = require("mongoose");
const env = require("./env");
const logger = require("../utils/logger");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    logger.info("MongoDB connected: " + conn.connection.host);
    mongoose.connection.on("disconnected", () => logger.warn("MongoDB disconnected"));
    mongoose.connection.on("error", (err) => logger.error({ err }, "MongoDB error"));
  } catch (error) {
    logger.error({ error }, "MongoDB connection failed");
    process.exit(1);
  }
};

module.exports = connectDB;
