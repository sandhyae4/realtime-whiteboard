const whiteboardService = require("../services/whiteboardService");

const getStrokes = async (req, res, next) => {
  try {
    const strokes = await whiteboardService.getStrokes(req.params.roomId);
    res.json({ success: true, strokes });
  } catch (err) { next(err); }
};

module.exports = { getStrokes };
