require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 8000;

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
const client = new MongoClient(MONGODB_URI);
let db;

// Middleware
const allowedOrigins = [
  'https://frontend-thirumala.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    db = client.db('thirumala_broker');
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Thirumala Broker API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    database_status: db ? 'Connected' : 'Disconnected',
    endpoints: {
      'POST /sellers': 'Add new seller',
      'GET /sellers': 'Get all sellers',
      'POST /buyers': 'Add new buyer',
      'GET /buyers': 'Get all buyers'
    }
  });
});

// Sellers endpoints
app.post('/sellers', async (req, res) => {
  try {
    const sellerData = {
      ...req.body,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const result = await db.collection('sellers').insertOne(sellerData);
    
    res.json({
      success: true,
      message: 'Seller added successfully to MongoDB',
      id: result.insertedId.toString()
    });
  } catch (error) {
    console.error('Error adding seller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add seller',
      message: error.message
    });
  }
});

app.get('/sellers', async (req, res) => {
  try {
    const sellers = await db.collection('sellers')
      .find({})
      .sort({ created_at: -1 })
      .toArray();
    
    // Convert ObjectId to string and format dates
    const formattedSellers = sellers.map(seller => ({
      _id: seller._id.toString(),
      name: seller.name,
      contact: seller.contact,
      address: seller.address,
      city: seller.city,
      gst_number: seller.gst_number,
      created_at: seller.created_at?.toISOString() || null,
      updated_at: seller.updated_at?.toISOString() || null
    }));
    
    res.json({
      success: true,
      data: formattedSellers
    });
  } catch (error) {
    console.error('Error fetching sellers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sellers',
      message: error.message
    });
  }
});

// Buyers endpoints
app.post('/buyers', async (req, res) => {
  try {
    const buyerData = {
      ...req.body,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const result = await db.collection('buyers').insertOne(buyerData);
    
    res.json({
      success: true,
      message: 'Buyer added successfully to MongoDB',
      id: result.insertedId.toString()
    });
  } catch (error) {
    console.error('Error adding buyer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add buyer',
      message: error.message
    });
  }
});

app.get('/buyers', async (req, res) => {
  try {
    const buyers = await db.collection('buyers')
      .find({})
      .sort({ created_at: -1 })
      .toArray();
    
    // Convert ObjectId to string and format dates
    const formattedBuyers = buyers.map(buyer => ({
      _id: buyer._id.toString(),
      name: buyer.name,
      contact: buyer.contact,
      address: buyer.address,
      city: buyer.city,
      gst_number: buyer.gst_number,
      created_at: buyer.created_at?.toISOString() || null,
      updated_at: buyer.updated_at?.toISOString() || null
    }));
    
    res.json({
      success: true,
      data: formattedBuyers
    });
  } catch (error) {
    console.error('Error fetching buyers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch buyers',
      message: error.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⚠️  Shutting down gracefully...');
  await client.close();
  process.exit(0);
});
