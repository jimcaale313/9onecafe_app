const router = require('express').Router();
const { z } = require('zod');
const { v4: uuidv4 } = require('uuid');
const validate = require('../middleware/validate');
const { stampsLimiter } = require('../middleware/rateLimiter');
const { requireStaff } = require('../middleware/auth.middleware');
const prisma = require('../services/prisma');

const scanSchema = z.object({ qrCode: z.string().uuid() });
const userIdSchema = z.object({ userId: z.string().uuid() });
const lookupSchema = z.object({ phone: z.string().min(6).max(20) });

function formatCustomer(user) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    currentStamps: user.currentStamps,
    totalStamps: user.totalStamps,
    createdAt: user.createdAt,
    stampsNeeded: Math.max(0, 6 - user.currentStamps),
    canRedeem: user.currentStamps >= 6,
  };
}

router.post('/scan', stampsLimiter, requireStaff, validate(scanSchema), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { qrCode: req.body.qrCode } });
    if (!user) return res.status(404).json({ success: false, error: 'Customer not found' });
    res.json({ success: true, data: formatCustomer(user) });
  } catch (err) { next(err); }
});

router.get('/lookup', stampsLimiter, requireStaff, async (req, res, next) => {
  try {
    const result = lookupSchema.safeParse({ phone: req.query.phone });
    if (!result.success) {
      return res.status(400).json({ success: false, error: 'Valid phone number required' });
    }
    const user = await prisma.user.findUnique({ where: { phone: result.data.phone } });
    if (!user) return res.status(404).json({ success: false, error: 'Customer not found' });
    res.json({ success: true, data: formatCustomer(user) });
  } catch (err) { next(err); }
});

router.post('/add', stampsLimiter, requireStaff, validate(userIdSchema), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.body.userId } });
    if (!user) return res.status(404).json({ success: false, error: 'Customer not found' });
    const before = user.currentStamps;
    const after = before + 1;
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { currentStamps: after, totalStamps: user.totalStamps + 1 },
    });
    await prisma.stampEvent.create({
      data: {
        id: uuidv4(),
        userId: user.id,
        staffId: req.user.staffId,
        eventType: 'stamp_added',
        stampsBefore: before,
        stampsAfter: after,
      },
    });
    res.json({ success: true, data: formatCustomer(updated) });
  } catch (err) { next(err); }
});

router.post('/redeem', stampsLimiter, requireStaff, validate(userIdSchema), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.body.userId } });
    if (!user) return res.status(404).json({ success: false, error: 'Customer not found' });
    if (user.currentStamps < 6) {
      return res.status(400).json({ success: false, error: `Not enough stamps. Has ${user.currentStamps}/6.` });
    }
    const before = user.currentStamps;
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { currentStamps: 0 },
    });
    await prisma.stampEvent.create({
      data: {
        id: uuidv4(),
        userId: user.id,
        staffId: req.user.staffId,
        eventType: 'redeemed',
        stampsBefore: before,
        stampsAfter: 0,
      },
    });
    res.json({ success: true, data: formatCustomer(updated) });
  } catch (err) { next(err); }
});

module.exports = router;
