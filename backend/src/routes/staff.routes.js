const router = require('express').Router();
const bcrypt = require('bcrypt');
const { z } = require('zod');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const prisma = require('../services/prisma');
const { signAccess, signRefresh, verifyRefresh } = require('../services/token');

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

router.post('/login', authLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const staff = await prisma.staff.findUnique({ where: { username } });
    if (!staff || !staff.isActive) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    const valid = await bcrypt.compare(password, staff.passwordHash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    const payload = { staffId: staff.id, role: staff.role };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh(payload);
    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        staff: { id: staff.id, name: staff.name, username: staff.username, role: staff.role },
      },
    });
  } catch (err) { next(err); }
});

router.post('/refresh', validate(refreshSchema), async (req, res, next) => {
  try {
    const payload = verifyRefresh(req.body.refreshToken);
    const accessToken = signAccess({ staffId: payload.staffId, role: payload.role });
    res.json({ success: true, data: { accessToken } });
  } catch {
    res.status(401).json({ success: false, error: 'Invalid refresh token' });
  }
});

module.exports = router;
