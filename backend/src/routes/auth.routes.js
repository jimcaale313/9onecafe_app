const router = require('express').Router();
const { z } = require('zod');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const prisma = require('../services/prisma');
const { signAccess, signRefresh, verifyRefresh } = require('../services/token');

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().min(6).max(20),
  password: z.string().min(4).max(100),
});

const loginSchema = z.object({
  phone: z.string().min(6).max(20),
  password: z.string().min(1),
});

const forgotSchema = z.object({
  phone: z.string().min(6).max(20),
  newPassword: z.string().min(4).max(100),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

router.post('/register', authLimiter, validate(registerSchema), async (req, res, next) => {
  try {
    const { name, phone, password } = req.body;
    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Phone number already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const qrCode = uuidv4();
    const user = await prisma.user.create({
      data: { id: uuidv4(), name, phone, passwordHash, qrCode },
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
    const { phone, password } = req.body;
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found. Please register first.' });
    }
    if (!user.passwordHash) {
      const passwordHash = await bcrypt.hash(password, 12);
      await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    } else {
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ success: false, error: 'Invalid password' });
      }
    }
    const accessToken = signAccess({ userId: user.id });
    const refreshToken = signRefresh({ userId: user.id });
    res.json({
      success: true,
      data: { accessToken, refreshToken, user: { id: user.id, name: user.name, phone: user.phone } },
    });
  } catch (err) { next(err); }
});

router.post('/forgot-password', authLimiter, validate(forgotSchema), async (req, res, next) => {
  try {
    const { phone, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'Phone number not registered' });
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    res.json({ success: true, data: { message: 'Password reset successfully.' } });
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
