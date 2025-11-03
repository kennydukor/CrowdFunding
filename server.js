const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const contributionRoutes = require('./routes/contributionRoutes');
const billRoutes = require('./routes/privateCampaignRoutes');
const socialRoutes = require('./routes/socialRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const enumsRoutes = require('./routes/campaignEnumRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const morgan = require('morgan');
const cors = require('cors');
const { sequelize } = require('./models');
const webhooksRoutes = require('./routes/webhooksRoutes');
const errorHandler = require('./services/error-handler');

// Load environment variables
dotenv.config();

const app = express();

// CORS Middleware
app.use(
 cors({
  origin: '*', // Replace '*' with the specific frontend URL in production for better security
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Body-Signature'], // Allowed headers
 }),
);

// app.use(express.json());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(morgan('dev'));

// Health Check Route
app.get('/', (req, res) => {
 res.status(200).send('Server is healthy');
});

// Route Middleware
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/contributions', contributionRoutes);
app.use('/api/private-campaign', billRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/enums', enumsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/webhooks', webhooksRoutes);

app.all('*', (req, res, next) => {
 return next(new Error('Route not found'));
});

app.use(errorHandler);

// // Connect to MongoDB
// // mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log('MongoDB Connected...'))
//   .catch((err) => console.error('MongoDB Connection Error;', err.message));

if (process.env.NODE_ENV === 'development') {
 (async () => {
  try {
   await sequelize.authenticate();
   console.log('Sequelize DB connection established.');

   //  await sequelize.sync();
   //  console.log('All models synchronized.');

   const PORT = process.env.PORT || 5600;
   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
   console.error('Sequelize error:', err);
   process.exit(1);
  }
 })();
} else {
 module.exports = app;
}
