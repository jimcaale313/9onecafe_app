const router = require('express').Router();
const QRCode = require('qrcode');
const { requireCustomer } = require('../middleware/auth.middleware');
const prisma = require('../services/prisma');

router.get('/me', requireCustomer, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        currentStamps: user.currentStamps,
        totalStamps: user.totalStamps,
        createdAt: user.createdAt,
      },
    });
  } catch (err) { next(err); }
});

router.get('/qr', requireCustomer, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    const qrDataUrl = await QRCode.toDataURL(user.qrCode, { width: 300, margin: 2 });
    res.json({ success: true, data: { qrCode: user.qrCode, qrImage: qrDataUrl } });
  } catch (err) { next(err); }
});

router.get('/history', requireCustomer, async (req, res, next) => {
  try {
    const events = await prisma.stampEvent.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { staff: { select: { name: true } } },
    });
    res.json({
      success: true,
      data: events.map(e => ({
        id: e.id,
        eventType: e.eventType,
        stampsBefore: e.stampsBefore,
        stampsAfter: e.stampsAfter,
        staffName: e.staff.name,
        createdAt: e.createdAt,
      })),
    });
  } catch (err) { next(err); }
});

module.exports = router;
