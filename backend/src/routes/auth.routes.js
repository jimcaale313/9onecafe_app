const router = require('express').Router();
const { z } = require('zod');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const prisma = require('../services/prisma');
const { signAccess, signRefresh, verifyRefresh } = require('../services/token');

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().min(6).max(20),
});

const loginSchema = z.object({
  phone: z.string().min(6).max(20),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

// For simplicity, OTP is simulated — in production integrate an SMS provider
router.post('/register', authLimiter, validate(registerSchema), async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Phone number already registered' });
    }
    const qrCode = uuidv4();
    const user = await prisma.user.create({
      data: { id: uuidv4(), name, phone, qrCode },
    });
    const accessToken = signAccess({ userId: user.id });
    const refreshToken = signRefresh({ userId: user.id });
    res.status(201).json({
      success: true,
      data: { accessToken, refreshToken, user: { id: user.id, name: user.name, phone: user.phone } },
    });
  } catch (err) { next(err); }
});

router.post('/login', authLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { phone } = req.body;
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found. Please register first.' });
    }
    const accessToken = signAccess({ userId: user.id });
    const refreshToken = signRefresh({ userId: user.id });
    res.json({
      success: true,
      data: { accessToken, refreshToken, user: { id: user.id, name: user.name, phone: user.phone } },
    });
  } catch (err) { next(err); }
});

router.post('/refresh', validate(refreshSchema), async (req, res, next) => {
  try {
    const payload = verifyRefresh(req.body.refreshToken);
    const accessToken = signAccess({ userId: payload.userId });
    res.json({ success: true, data: { accessToken } });
  } catch {
    res.status(401).json({ success: false, error: 'Invalid refresh token' });
  }
});

module.exports = router;
