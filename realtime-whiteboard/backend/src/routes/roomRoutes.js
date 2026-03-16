const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const { protect } = require("../middleware/authMiddleware");
const { roomCreateLimiter } = require("../middleware/rateLimiter");
const { validate, createRoomSchema } = require("../validation/schemas");

router.use(protect);

router.get("/", roomController.getMyRooms);
router.post("/", roomCreateLimiter, validate(createRoomSchema), roomController.createRoom);
router.get("/top", roomController.getTopRooms);
router.get("/join/:inviteCode", roomController.joinRoom);
router.get("/:roomId", roomController.getRoom);
router.delete("/:roomId", roomController.deleteRoom);
router.post("/:roomId/clear", roomController.clearCanvas);
router.get("/:roomId/strokes", roomController.getRoomStrokes);
router.get("/:roomId/invite", roomController.getInviteLink);
router.post("/:roomId/invite/send", roomController.sendInvite);

module.exports = router;
