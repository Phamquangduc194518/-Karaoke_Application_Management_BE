// app.js
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors'); 
const userRoutes = require('./src/routes/userRoutes');
const adminRoutes = require('./src/routes/adminRoute');
const songRoutes = require('./src/routes/songRoute');
const liveStreamRoute = require('./src/routes/liveStreamRoute');
const sequelize = require('./src/config/database');
const path = require('path');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', userRoutes);
app.use('/api/admin', adminRoutes);
console.log('Admin routes loaded');
app.use('/api/song',songRoutes);
app.use('/api/liveStream',liveStreamRoute);
sequelize
  .authenticate()
  .then(() => {
    console.log('Database connected successfully');
    return sequelize.sync(); // Đồng bộ model với database
  })
  .then(() => {
    console.log('Models synced successfully');
    // Khởi động server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });
