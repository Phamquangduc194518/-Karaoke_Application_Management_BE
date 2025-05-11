require('dotenv').config();
const express = require('express');
const http = require('http');
const app = express();
const cors = require('cors'); 
const userRoutes = require('./src/routes/userRoutes');
const adminRoutes = require('./src/routes/adminRoute');
const songRoutes = require('./src/routes/songRoute');
const liveStreamRoute = require('./src/routes/liveStreamRoute');
const chatRoute    = require('./src/routes/chatRoute');
const sequelize = require('./src/config/database');
const path = require('path');
const server = http.createServer(app);

// Socket.io setup
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: '*' }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/song',songRoutes);
app.use('/api/liveStream',liveStreamRoute);
app.use('/api/chat',chatRoute);

const registerSocketHandlers = require('./src/socket/chatSocket'); 
registerSocketHandlers(io);

sequelize
  .authenticate()
  .then(() => {
    console.log('Database connected successfully');
    return sequelize.sync(); // Đồng bộ model với database
  })
  .then(() => {
    console.log('Models synced successfully');
    // Khởi động server
    const PORT = process.env.PORT || 8080;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });
