const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().min(2).max(50).trim(),
  email: z.string().email().toLowerCase(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

const createRoomSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  isPublic: z.boolean().optional(),
  canvasBackground: z.string().optional(),
});

const strokeSchema = z.object({
  strokeId: z.string(),
  tool: z.enum(["pen", "eraser", "line", "rect", "circle", "text"]),
  color: z.string().optional(),
  width: z.number().optional(),
  points: z.array(z.object({ x: z.number(), y: z.number() })).optional(),
  text: z.string().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
});

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: result.error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
    });
  }
  req.validatedData = result.data;
  next();
};

module.exports = { validate, registerSchema, loginSchema, createRoomSchema, strokeSchema };
