# Thirumala Broker Backend API

Node.js Express REST API for Thirumala Broker Management System with MongoDB Atlas integration.

## 🚀 Features

- **Node.js & Express** - Fast and reliable backend framework
- **MongoDB Atlas** - Cloud database integration  
- **RESTful API** - Clean JSON-based endpoints
- **CORS** - Configured for cross-origin requests
- **Environment Variables** - Secure configuration management

## 📦 Installation

```bash
npm install
```

## 🔧 Environment Variables

Create a `.env` file with:

```env
NODE_ENV=production
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=your_frontend_url
```

## 🏃 Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## 📡 API Endpoints

### Sellers
- `POST /sellers` - Add new seller
- `GET /sellers` - Get all sellers

### Buyers
- `POST /buyers` - Add new buyer
- `GET /buyers` - Get all buyers

### Health Check
- `GET /` - Server status and info

## 🌐 Deployment

Deployable to Render, Heroku, Railway, or any Node.js hosting platform.

## 📄 License

ISC
