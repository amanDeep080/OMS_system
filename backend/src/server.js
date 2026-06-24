const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their notification room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    server.listen(PORT, () => {
      console.log(`Spreetail HR API running on port ${PORT}`);
      console.log(`Swagger docs available at http://localhost:${PORT}/api/docs`);
    });

    // Keep the process alive and handle errors
    server.on('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    });

    // Handle signals
    process.on('SIGTERM', () => {
      server.close(() => {
        console.log('Server terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      server.close(() => {
        console.log('Server interrupted');
        process.exit(0);
      });
    });

  } catch (err) {
    console.error('Unable to start server:', err);
    process.exit(1);
  }
}

start();
