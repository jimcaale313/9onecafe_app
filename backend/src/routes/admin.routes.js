const router = require('express').Router();
const bcrypt = require('bcrypt');
const { z } = require('zod');
const { v4: uuidv4 } = require('uuid');
const validate = require('../middleware/validate');
const { requireAdmin } = require('../middleware/auth.middleware');
const prisma = require('../services/prisma');

router.use(requireAdmin);

// Dashboard stats
router.get('/dashboard', async (req, res, next) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalCustomers, stampsToday, redemptionsMonth] = await Promise.all([
      prisma.user.count(),
      prisma.stampEvent.count({ where: { eventType: 'stamp_added', createdAt: { gte: todayStart } } }),
      prisma.stampEvent.count({ where: { eventType: 'redeemed', createdAt: { gte: monthStart } } }),
    ]);

    res.json({ success: true, data: { totalCustomers, stampsToday, redemptionsMonth } });
  } catch (err) { next(err); }
});

// Customers list
router.get('/customers', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const search = req.query.search || '';
    const where = search
      ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { phone: { contains: search } }] }
      : {};
    const [total, customers] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: { id: true, name: true, phone: true, currentStamps: true, totalStamps: true, createdAt: true },
      }),
    ]);
    res.json({ success: true, data: { customers, total, page, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
});

// Single customer detail
router.get('/customers/:id', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        stampEvents: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: { staff: { select: { name: true } } },
        },
      },
    });
    if (!user) return res.status(404).json({ success: false, error: 'Customer not found' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

// Manual stamp adjustment
const adjustSchema = z.object({ currentStamps: z.number().int().min(0).max(6) });
router.patch('/customers/:id/stamps', validate(adjustSchema), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ success: false, error: 'Customer not found' });
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { currentStamps: req.body.currentStamps },
    });
    res.json({ success: true, data: { currentStamps: updated.currentStamps } });
  } catch (err) { next(err); }
});

// Staff list
router.get('/staff', async (req, res, next) => {
  try {
    const staff = await prisma.staff.findMany({
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true, username: true, role: true, isActive: true, createdAt: true },
    });
    res.json({ success: true, data: staff });
  } catch (err) { next(err); }
});

// Create staff
const createStaffSchema = z.object({
  name: z.string().min(1).max(100),
  username: z.string().min(3).max(50),
  password: z.string().min(8),
  role: z.enum(['admin', 'staff']).default('staff'),
});
router.post('/staff', validate(createStaffSchema), async (req, res, next) => {
  try {
    const { name, username, password, role } = req.body;
    const exists = await prisma.staff.findUnique({ where: { username } });
    if (exists) return res.status(409).json({ success: false, error: 'Username already taken' });
    const passwordHash = await bcrypt.hash(password, 12);
    const staff = await prisma.staff.create({
      data: { id: uuidv4(), name, username, passwordHash, role },
      select: { id: true, name: true, username: true, role: true, isActive: true, createdAt: true },
    });
    res.status(201).json({ success: true, data: staff });
  } catch (err) { next(err); }
});

// Update staff
const updateStaffSchema = z.object({
  role: z.enum(['admin', 'staff']).optional(),
  isActive: z.boolean().optional(),
  name: z.string().min(1).max(100).optional(),
});
router.patch('/staff/:id', validate(updateStaffSchema), async (req, res, next) => {
  try {
    const staff = await prisma.staff.update({
      where: { id: req.params.id },
      data: req.body,
      select: { id: true, name: true, username: true, role: true, isActive: true },
    });
    res.json({ success: true, data: staff });
  } catch (err) { next(err); }
});

// Menu management
const menuItemSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  productCategory: z.string().min(1),
  price: z.number().positive(),
});
router.post('/menu', validate(menuItemSchema), async (req, res, next) => {
  try {
    const item = await prisma.menuItem.create({
      data: { id: uuidv4(), ...req.body },
    });
    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
});

const updateMenuSchema = menuItemSchema.partial().extend({ isAvailable: z.boolean().optional() });
router.patch('/menu/:id', validate(updateMenuSchema), async (req, res, next) => {
  try {
    const item = await prisma.menuItem.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
});

router.delete('/menu/:id', async (req, res, next) => {
  try {
    await prisma.menuItem.update({ where: { id: req.params.id }, data: { isAvailable: false } });
    res.json({ success: true, data: { message: 'Item removed from menu' } });
  } catch (err) { next(err); }
});

// Reports — stamp activity by day
router.get('/reports', async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);
    const events = await prisma.stampEvent.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: 'asc' },
    });
    const byDay = {};
    for (const e of events) {
      const day = e.createdAt.toISOString().slice(0, 10);
      if (!byDay[day]) byDay[day] = { date: day, stamps: 0, redemptions: 0 };
      if (e.eventType === 'stamp_added') byDay[day].stamps++;
      else byDay[day].redemptions++;
    }
    res.json({ success: true, data: Object.values(byDay) });
  } catch (err) { next(err); }
});

module.exports = router;
