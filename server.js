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
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }),
    database_status: db ? 'Connected' : 'Disconnected',
    endpoints: {
      'POST /sellers': 'Add new seller',
      'GET /sellers': 'Get all sellers',
      'PUT /sellers/:id': 'Update a seller',
      'DELETE /sellers/:id': 'Delete a seller',
      'POST /buyers': 'Add new buyer',
      'GET /buyers': 'Get all buyers',
      'PUT /buyers/:id': 'Update a buyer',
      'DELETE /buyers/:id': 'Delete a buyer',
      'POST /ledger': 'Add new ledger entry',
      'GET /ledger': 'Get all ledger entries',
      'PUT /ledger/:id': 'Update a ledger entry',
      'DELETE /ledger/:id': 'Delete a ledger entry',
      'POST /seller-ledger': 'Add new seller ledger entry',
      'GET /seller-ledger': 'Get all seller ledger entries',
      'PUT /seller-ledger/:id': 'Update a seller ledger entry',
      'DELETE /seller-ledger/:id': 'Delete a seller ledger entry',
      'POST /buyer-ledger': 'Add new buyer ledger entry',
      'GET /buyer-ledger': 'Get all buyer ledger entries',
      'PUT /buyer-ledger/:id': 'Update a buyer ledger entry',
      'DELETE /buyer-ledger/:id': 'Delete a buyer ledger entry',
      'POST /lorries': 'Add new lorry',
      'GET /lorries': 'Get all lorries',
      'GET /lorries/:id': 'Get a lorry by ID',
      'PUT /lorries/:id': 'Update a lorry',
      'DELETE /lorries/:id': 'Delete a lorry'
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

// Update seller endpoint
app.put('/sellers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid seller ID'
      });
    }
    
    // Prepare update data
    const updateData = {
      ...req.body,
      updated_at: new Date()
    };
    
    // Remove _id from update data if present
    delete updateData._id;
    
    const result = await db.collection('sellers').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Seller not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Seller updated successfully'
    });
  } catch (error) {
    console.error('Error updating seller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update seller',
      message: error.message
    });
  }
});

// Delete seller endpoint
app.delete('/sellers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid seller ID'
      });
    }
    
    const result = await db.collection('sellers').deleteOne({
      _id: new ObjectId(id)
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Seller not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Seller deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting seller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete seller',
      message: error.message
    });
  }
});

// Update buyer endpoint
app.put('/buyers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid buyer ID'
      });
    }
    
    // Prepare update data
    const updateData = {
      ...req.body,
      updated_at: new Date()
    };
    
    // Remove _id from update data if present
    delete updateData._id;
    
    const result = await db.collection('buyers').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Buyer not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Buyer updated successfully'
    });
  } catch (error) {
    console.error('Error updating buyer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update buyer',
      message: error.message
    });
  }
});

// Delete buyer endpoint
app.delete('/buyers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid buyer ID'
      });
    }
    
    const result = await db.collection('buyers').deleteOne({
      _id: new ObjectId(id)
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Buyer not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Buyer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting buyer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete buyer',
      message: error.message
    });
  }
});

// Ledger endpoints
app.post('/ledger', async (req, res) => {
  try {
    const ledgerData = {
      ...req.body,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const result = await db.collection('ledger').insertOne(ledgerData);
    
    res.json({
      success: true,
      message: 'Ledger entry added successfully',
      id: result.insertedId.toString()
    });
  } catch (error) {
    console.error('Error adding ledger entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add ledger entry',
      message: error.message
    });
  }
});

app.get('/ledger', async (req, res) => {
  try {
    const ledgerEntries = await db.collection('ledger')
      .find({})
      .sort({ created_at: -1 })
      .toArray();
    
    const formattedEntries = ledgerEntries.map(entry => ({
      _id: entry._id.toString(),
      sellerName: entry.sellerName,
      buyerName: entry.buyerName,
      loaded: entry.loaded,
      conditionFromDate: entry.conditionFromDate,
      conditionToDate: entry.conditionToDate,
      created_at: entry.created_at?.toISOString() || null,
      updated_at: entry.updated_at?.toISOString() || null
    }));
    
    res.json({
      success: true,
      data: formattedEntries
    });
  } catch (error) {
    console.error('Error fetching ledger entries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ledger entries',
      message: error.message
    });
  }
});

app.put('/ledger/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ledger entry ID'
      });
    }
    
    const updateData = {
      ...req.body,
      updated_at: new Date()
    };
    
    delete updateData._id;
    
    const result = await db.collection('ledger').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Ledger entry not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Ledger entry updated successfully'
    });
  } catch (error) {
    console.error('Error updating ledger entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update ledger entry',
      message: error.message
    });
  }
});

app.delete('/ledger/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ledger entry ID'
      });
    }
    
    const result = await db.collection('ledger').deleteOne({
      _id: new ObjectId(id)
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Ledger entry not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Ledger entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting ledger entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete ledger entry',
      message: error.message
    });
  }
});

// ==================== SELLER LEDGER ENDPOINTS ====================

// Create a new seller ledger entry
app.post('/seller-ledger', async (req, res) => {
  try {
    const ledgerData = {
      ...req.body,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const result = await db.collection('sellerLedger').insertOne(ledgerData);
    
    res.json({
      success: true,
      message: 'Seller ledger entry added successfully',
      id: result.insertedId.toString()
    });
  } catch (error) {
    console.error('Error adding seller ledger entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add seller ledger entry',
      message: error.message
    });
  }
});

// Get all seller ledger entries
app.get('/seller-ledger', async (req, res) => {
  try {
    const ledgerEntries = await db.collection('sellerLedger')
      .find({})
      .sort({ created_at: -1 })
      .toArray();
    
    const formattedEntries = ledgerEntries.map(entry => ({
      _id: entry._id.toString(),
      sellerName: entry.sellerName,
      buyerName: entry.buyerName,
      loaded: entry.loaded,
      conditionFromDate: entry.conditionFromDate,
      conditionToDate: entry.conditionToDate,
      created_at: entry.created_at?.toISOString() || null,
      updated_at: entry.updated_at?.toISOString() || null
    }));
    
    res.json({
      success: true,
      data: formattedEntries
    });
  } catch (error) {
    console.error('Error fetching seller ledger entries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch seller ledger entries',
      message: error.message
    });
  }
});

// Update a seller ledger entry
app.put('/seller-ledger/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid seller ledger entry ID'
      });
    }
    
    const updateData = {
      ...req.body,
      updated_at: new Date()
    };
    
    delete updateData._id;
    
    const result = await db.collection('sellerLedger').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Seller ledger entry not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Seller ledger entry updated successfully'
    });
  } catch (error) {
    console.error('Error updating seller ledger entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update seller ledger entry',
      message: error.message
    });
  }
});

// Delete a seller ledger entry
app.delete('/seller-ledger/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid seller ledger entry ID'
      });
    }
    
    const result = await db.collection('sellerLedger').deleteOne({
      _id: new ObjectId(id)
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Seller ledger entry not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Seller ledger entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting seller ledger entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete seller ledger entry',
      message: error.message
    });
  }
});

// ==================== BUYER LEDGER ENDPOINTS ====================

// Create a new buyer ledger entry
app.post('/buyer-ledger', async (req, res) => {
  try {
    const ledgerData = {
      ...req.body,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const result = await db.collection('buyerLedger').insertOne(ledgerData);
    
    res.json({
      success: true,
      message: 'Buyer ledger entry added successfully',
      id: result.insertedId.toString()
    });
  } catch (error) {
    console.error('Error adding buyer ledger entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add buyer ledger entry',
      message: error.message
    });
  }
});

// Get all buyer ledger entries
app.get('/buyer-ledger', async (req, res) => {
  try {
    const ledgerEntries = await db.collection('buyerLedger')
      .find({})
      .sort({ created_at: -1 })
      .toArray();
    
    const formattedEntries = ledgerEntries.map(entry => ({
      _id: entry._id.toString(),
      sellerName: entry.sellerName,
      buyerName: entry.buyerName,
      loaded: entry.loaded,
      conditionFromDate: entry.conditionFromDate,
      conditionToDate: entry.conditionToDate,
      created_at: entry.created_at?.toISOString() || null,
      updated_at: entry.updated_at?.toISOString() || null
    }));
    
    res.json({
      success: true,
      data: formattedEntries
    });
  } catch (error) {
    console.error('Error fetching buyer ledger entries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch buyer ledger entries',
      message: error.message
    });
  }
});

// Update a buyer ledger entry
app.put('/buyer-ledger/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid buyer ledger entry ID'
      });
    }
    
    const updateData = {
      ...req.body,
      updated_at: new Date()
    };
    
    delete updateData._id;
    
    const result = await db.collection('buyerLedger').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Buyer ledger entry not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Buyer ledger entry updated successfully'
    });
  } catch (error) {
    console.error('Error updating buyer ledger entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update buyer ledger entry',
      message: error.message
    });
  }
});

// Delete a buyer ledger entry
app.delete('/buyer-ledger/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid buyer ledger entry ID'
      });
    }
    
    const result = await db.collection('buyerLedger').deleteOne({
      _id: new ObjectId(id)
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Buyer ledger entry not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Buyer ledger entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting buyer ledger entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete buyer ledger entry',
      message: error.message
    });
  }
});

// ==================== LORRY ENDPOINTS ====================

// Create a new lorry
app.post('/lorries', async (req, res) => {
  try {
    const lorryData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('lorries').insertOne(lorryData);
    
    res.status(201).json({
      success: true,
      data: {
        _id: result.insertedId,
        ...lorryData
      },
      message: 'Lorry created successfully'
    });
  } catch (error) {
    console.error('Error creating lorry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create lorry',
      message: error.message
    });
  }
});

// Get all lorries
app.get('/lorries', async (req, res) => {
  try {
    const lorries = await db.collection('lorries')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({
      success: true,
      data: lorries
    });
  } catch (error) {
    console.error('Error fetching lorries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lorries',
      message: error.message
    });
  }
});

// Get a single lorry by ID
app.get('/lorries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid lorry ID'
      });
    }
    
    const lorry = await db.collection('lorries').findOne({
      _id: new ObjectId(id)
    });
    
    if (!lorry) {
      return res.status(404).json({
        success: false,
        error: 'Lorry not found'
      });
    }
    
    res.json({
      success: true,
      data: lorry
    });
  } catch (error) {
    console.error('Error fetching lorry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lorry',
      message: error.message
    });
  }
});

// Update a lorry
app.put('/lorries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid lorry ID'
      });
    }
    
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    // Remove _id from update data if present
    delete updateData._id;
    
    const result = await db.collection('lorries').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (!result.value) {
      return res.status(404).json({
        success: false,
        error: 'Lorry not found'
      });
    }
    
    res.json({
      success: true,
      data: result.value,
      message: 'Lorry updated successfully'
    });
  } catch (error) {
    console.error('Error updating lorry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update lorry',
      message: error.message
    });
  }
});

// Delete a lorry
app.delete('/lorries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid lorry ID'
      });
    }
    
    const result = await db.collection('lorries').deleteOne({
      _id: new ObjectId(id)
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Lorry not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Lorry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting lorry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete lorry',
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
