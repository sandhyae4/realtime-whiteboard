require("./config/env");
const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");
const env = require("./config/env");
const logger = require("./utils/logger");
const { initWhiteboardSocket } = require("./sockets/whiteboardSocket");
const { startStrokeBatchWorker } = require("./workers/strokeBatchWorker");

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: env.CLIENT_URL, methods: ["GET", "POST"], credentials: true },
  transports: ["websocket", "polling"],
});

app.set("io", io);

const start = async () => {
  await connectDB();
  initWhiteboardSocket(io);
  startStrokeBatchWorker();

  server.listen(env.PORT, () => {
    logger.info("Server running on http://localhost:" + env.PORT);
    logger.info("Health: http://localhost:" + env.PORT + "/health");
    logger.info("Ready: http://localhost:" + env.PORT + "/health/ready");
  });
};

start().catch((err) => {
  logger.error({ err }, "Startup failed");
  process.exit(1);
});

process.on("SIGTERM", () => server.close(() => process.exit(0)));
process.on("SIGINT", () => server.close(() => process.exit(0)));
