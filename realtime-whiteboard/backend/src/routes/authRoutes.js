const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimiter");
const { validate, registerSchema, loginSchema } = require("../validation/schemas");

router.post("/register", authLimiter, validate(registerSchema), authController.register);
router.get("/verify-email", authController.verifyEmail);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", protect, authController.logout);
router.get("/me", protect, authController.getMe);

module.exports = router;
