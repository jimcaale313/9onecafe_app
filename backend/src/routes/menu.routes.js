const router = require('express').Router();
const prisma = require('../services/prisma');

router.get('/', async (req, res, next) => {
  try {
    const items = await prisma.menuItem.findMany({
      where: { isAvailable: true },
      orderBy: [{ productCategory: 'asc' }, { category: 'asc' }, { price: 'asc' }],
    });
    const grouped = {};
    for (const item of items) {
      if (!grouped[item.productCategory]) grouped[item.productCategory] = {};
      if (!grouped[item.productCategory][item.category]) grouped[item.productCategory][item.category] = [];
      grouped[item.productCategory][item.category].push({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        category: item.category,
        productCategory: item.productCategory,
        imageUrl: item.imageUrl,
      });
    }
    res.json({ success: true, data: grouped });
  } catch (err) { next(err); }
});

router.get('/:category', async (req, res, next) => {
  try {
    const items = await prisma.menuItem.findMany({
      where: {
        isAvailable: true,
        category: { equals: req.params.category, mode: 'insensitive' },
      },
      orderBy: { price: 'asc' },
    });
    res.json({
      success: true,
      data: items.map(i => ({ id: i.id, name: i.name, price: parseFloat(i.price), category: i.category, imageUrl: i.imageUrl })),
    });
  } catch (err) { next(err); }
});

module.exports = router;
