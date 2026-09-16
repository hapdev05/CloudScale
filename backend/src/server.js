const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const os = require('os');
const { initDatabase } = require('./config/database');
const productRoutes = require('./routes/productRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Healthcheck endpoint for ALB and Frontend EC2 Node Badge
app.get('/healthcheck', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    serverInfo: {
      hostname: os.hostname(),
      platform: os.platform(),
      uptime: os.uptime(),
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

// API Routes
app.use('/api/products', productRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🚀 CloudAutoScale Backend API Service is Running',
    hostname: os.hostname(),
    endpoints: {
      healthcheck: '/healthcheck',
      getAllProducts: 'GET /api/products',
      searchProducts: 'GET /api/products/search?name={keyword}',
      createProduct: 'POST /api/products',
    },
  });
});

// Start Server
app.listen(PORT, async () => {
  console.log(`==================================================`);
  console.log(`🚀 CloudAutoScale Backend listening on port ${PORT}`);
  console.log(`🖥️ Hostname: ${os.hostname()}`);
  console.log(`==================================================`);
  await initDatabase();
});
