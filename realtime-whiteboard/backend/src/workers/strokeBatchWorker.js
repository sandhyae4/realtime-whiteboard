const { flushBatch } = require("../services/whiteboardService");
const logger = require("../utils/logger");

// Flush stroke batch to DB every 3 seconds
const startStrokeBatchWorker = () => {
  const interval = setInterval(async () => {
    try {
      await flushBatch();
    } catch (err) {
      logger.error({ err }, "Stroke batch worker error");
    }
  }, 3000);

  logger.info("Stroke batch worker started — flushing every 3 seconds");
  return interval;
};

module.exports = { startStrokeBatchWorker };
