const router = require('express').Router();
const { z } = require('zod');
const { v4: uuidv4 } = require('uuid');
const validate = require('../middleware/validate');
const { requireAdmin } = require('../middleware/auth.middleware');
const prisma = require('../services/prisma');

const submitSchema = z.object({
  customerName: z.string().min(1).max(100),
  visitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  menuItemsOrdered: z.array(z.string()).min(1),
  rating: z.number().int().min(1).max(5),
  feedbackText: z.string().min(1).max(500),
  userId: z.string().uuid().optional(),
});

// Public — submit feedback
router.post('/', validate(submitSchema), async (req, res, next) => {
  try {
    const { customerName, visitDate, menuItemsOrdered, rating, feedbackText, userId } = req.body;
    const feedback = await prisma.feedback.create({
      data: {
        id: uuidv4(),
        customerName,
        visitDate: new Date(visitDate),
        menuItemsOrdered,
        rating,
        feedbackText,
        userId: userId || null,
      },
    });
    res.status(201).json({ success: true, data: { id: feedback.id } });
  } catch (err) { next(err); }
});

// Admin — list feedback
router.get('/admin', requireAdmin, async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const rating = req.query.rating ? parseInt(req.query.rating) : undefined;
    const from   = req.query.from ? new Date(req.query.from) : undefined;
    const to     = req.query.to   ? new Date(req.query.to)   : undefined;

    const where = {
      ...(rating ? { rating } : {}),
      ...(from || to ? { visitDate: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
    };

    const [total, items] = await Promise.all([
      prisma.feedback.count({ where }),
      prisma.feedback.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    res.json({ success: true, data: { items, total, page, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
});

// Admin — stats
router.get('/admin/stats', requireAdmin, async (req, res, next) => {
  try {
    const all = await prisma.feedback.findMany({ select: { rating: true } });
    const total = all.length;
    const avg = total ? (all.reduce((s, f) => s + f.rating, 0) / total).toFixed(1) : '0.0';
    const breakdown = [5, 4, 3, 2, 1].map(r => ({
      stars: r,
      count: all.filter(f => f.rating === r).length,
    }));
    res.json({ success: true, data: { averageRating: parseFloat(avg), totalReviews: total, breakdown } });
  } catch (err) { next(err); }
});

// Admin — delete
router.delete('/admin/:id', requireAdmin, async (req, res, next) => {
  try {
    await prisma.feedback.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Deleted' } });
  } catch (err) { next(err); }
});

module.exports = router;
