const authService = require("../services/authService");

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.validatedData);
    res.status(201).json({ success: true, ...result });
  } catch (err) { next(err); }
};

const verifyEmail = async (req, res, next) => {
  try {
    const result = await authService.verifyEmail(req.query.token);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.validatedData);
    // Set httpOnly refresh token cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ success: true, accessToken: result.accessToken, user: result.user });
  } catch (err) { next(err); }
};

const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: "No refresh token" });
    const result = await authService.refreshToken(token);
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ success: true, accessToken: result.accessToken, user: result.user });
  } catch (err) { next(err); }
};

const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user._id);
    res.clearCookie("refreshToken");
    res.json({ success: true, message: "Logged out" });
  } catch (err) { next(err); }
};

const getMe = (req, res) => res.json({ success: true, user: req.user });

module.exports = { register, verifyEmail, login, refresh, logout, getMe };
