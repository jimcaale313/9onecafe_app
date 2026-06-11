require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const customerRoutes = require('./routes/customer.routes');
const staffRoutes = require('./routes/staff.routes');
const stampsRoutes = require('./routes/stamps.routes');
const menuRoutes = require('./routes/menu.routes');
const adminRoutes = require('./routes/admin.routes');
const feedbackRoutes = require('./routes/feedback.routes');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/stamps', stampsRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`9ONE Café API running on port ${PORT}`));
