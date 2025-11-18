# 🛒 Retail Management System with GST Billing

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-19.0.0-blue)](https://reactjs.org/)

A comprehensive, production-ready retail management system with GST-compliant invoicing, inventory management, and advanced reporting capabilities. Built with modern web technologies for small to medium retail businesses.

## ✨ Features

### 🏪 Core Business Features
- **📊 Dashboard** - Real-time sales, inventory, and profit analytics
- **👥 User Management** - Role-based access (Owner, Admin, Cashier, Stock Manager)
- **📦 Product Management** - Complete catalog with categories, GST rates, and HSN codes
- **👤 Customer Management** - Customer database with loyalty points system
- **🏢 Supplier Management** - Vendor database and purchase order tracking
- **🧾 GST-Compliant Invoicing** - Automatic GST calculation (CGST/SGST/IGST)
- **📈 Inventory Control** - Automated stock management with low-stock alerts
- **🛒 Point of Sale (POS)** - Fast, intuitive sales interface
- **📋 Purchase Orders** - Supplier ordering and stock replenishment
- **📊 Advanced Reports** - Sales, GST, inventory, and profit reports
- **🔍 Audit Trail** - Complete transaction history and logs

### 🛠️ Technical Features
- **🔐 JWT Authentication** - Secure user sessions
- **📱 Responsive Design** - Works on desktop, tablet, and mobile
- **⚡ Real-time Updates** - Live dashboard statistics
- **🗄️ PostgreSQL Database** - Robust data storage with Supabase
- **🔄 RESTful API** - Well-documented backend endpoints
- **🎨 Modern UI** - Clean, professional interface with Tailwind CSS

## 🏗️ Tech Stack

### Frontend
- **React 19** - Latest React with hooks and concurrent features
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **Context API** - State management

### Backend
- **Node.js 18+** - JavaScript runtime
- **Express.js** - Web framework
- **Supabase** - PostgreSQL database hosting
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Database
- **PostgreSQL** - Relational database
- **Supabase** - Managed PostgreSQL service
- **10 Tables** - Comprehensive data model
- **Materialized Views** - Optimized reporting queries

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Supabase Account** - [Sign up here](https://supabase.com/)
- **Code Editor** (VS Code recommended)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/retail-management-system.git
cd retail-management-system
```

### 2. Environment Setup

#### Backend Configuration
```bash
cd Backend

# Copy environment template
cp .env.example .env

# Edit .env file with your credentials
# Required variables:
# SUPABASE_URL=your_supabase_project_url
# SUPABASE_ANON_KEY=your_supabase_anon_key
# JWT_SECRET=your_jwt_secret_key
# PORT=3000
```

#### Frontend Configuration
```bash
cd ../Frontend

# Copy environment template (if exists)
cp .env.example .env  # If available
```

### 3. Database Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and anon key

2. **Run Database Migrations**
   ```bash
   # From project root
   cd db/migrations
   # Run the SQL file in your Supabase SQL editor
   # File: 001_create_tables.sql
   ```


### 4. Install Dependencies

#### Backend
```bash
cd Backend
npm install
```

#### Frontend
```bash
cd ../Frontend
npm install
```

### 5. Start the Application

#### Option A: Development Mode (Recommended)
```bash
# Terminal 1: Backend
cd Backend
nodeman server-fixed.js

# Terminal 2: Frontend
cd ../Frontend
npm run dev
```

#### Option B: Production Build
```bash
# Backend
cd Backend
nodeman server-fixed.js

# Frontend (build and serve)
cd ../Frontend
npm run build
npm run preview
```

### 6. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Health Check**: http://localhost:3000/health/db

## 📁 Project Structure

```
retail-management-system/
├── Backend/                          # Express.js API Server
│   ├── db/
│   │   ├── models/                   # Database models (10 files)
│   │   │   ├── users.js
│   │   │   ├── products.js
│   │   │   ├── categories.js
│   │   │   ├── customers.js
│   │   │   ├── suppliers.js
│   │   │   ├── invoices.js
│   │   │   ├── invoiceItems.js
│   │   │   ├── purchases.js
│   │   │   ├── stockMovements.js
│   │   │   └── auditLogs.js
│   │   └── supabaseClient.js         # Database connection
│   ├── middleware/
│   │   ├── auth.js                   # JWT authentication
│   │   ├── errorHandler.js           # Error handling
│   │   └── validator.js              # Input validation
│   ├── routes/                       # API route handlers
│   │   ├── auth-routes.js
│   │   ├── products-routes.js
│   │   ├── categories-routes.js
│   │   ├── customers-routes.js
│   │   ├── suppliers-routes.js
│   │   ├── invoices-routes.js
│   │   ├── purchases-routes.js
│   │   ├── stock-routes.js
│   │   ├── reports-routes.js
│   │   └── dashboard-routes.js
│   ├── services/
│   │   └── invoiceService.js         # Business logic
│   ├── utils/
│   │   ├── invoiceCalculator.js      # GST calculations
│   │   └── pricing.js                # Price utilities
│   ├── server-fixed.js               # Main server file
│   ├── package.json
│   └── .env                          # Environment variables
│
├── Frontend/                         # React Application
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/               # Reusable components
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   └── Input.jsx
│   │   │   └── layout/               # Layout components
│   │   │       ├── Layout.jsx
│   │   │       ├── Navbar.jsx
│   │   │       └── Sidebar.jsx
│   │   ├── pages/                    # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── POS.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Categories.jsx
│   │   │   ├── Customers.jsx
│   │   │   ├── Invoices.jsx
│   │   │   ├── Stock.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── Suppliers.jsx
│   │   │   ├── Purchases.jsx
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Authentication context
│   │   ├── services/
│   │   │   ├── api.js                # API client
│   │   │   └── auth.js               # Auth utilities
│   │   ├── utils/
│   │   │   ├── constants.js          # App constants
│   │   │   └── formatters.js         # Data formatters
│   │   ├── App.jsx                   # Main app component
│   │   ├── main.jsx                  # App entry point
│   │   └── index.css                 # Global styles
│   ├── package.json
│   ├── vite.config.js                # Vite configuration
│   ├── tailwind.config.js            # Tailwind configuration
│   └── eslint.config.js              # ESLint configuration
│
├── db/
│   └── migrations/
│       └── 001_create_tables.sql     # Database schema
│
├── docs/                             # Documentation
│   ├── START_HERE.md                 # Quick start guide
│   ├── MASTER_REFERENCE.md           # Complete reference
│   ├── IMPLEMENTATION_PLAN.md        # Development roadmap
│   └── UNUSED_FILES_CLEANUP.md       # Cleanup guide
│
├── .gitignore                        # Git ignore rules
├── README.md                         # This file
└── package.json                      # Root package file
```

## 🔑 API Documentation

### Authentication Endpoints

```http
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET  /api/auth/me
```

### Product Management

```http
GET    /api/products          # List products
POST   /api/products          # Create product
GET    /api/products/:id      # Get product
PUT    /api/products/:id      # Update product
DELETE /api/products/:id      # Delete product
```

### Categories

```http
GET    /api/categories        # List categories
POST   /api/categories        # Create category
GET    /api/categories/:id    # Get category
PUT    /api/categories/:id    # Update category
DELETE /api/categories/:id    # Delete category
```

### Customers

```http
GET    /api/customers         # List customers
POST   /api/customers         # Create customer
GET    /api/customers/:id     # Get customer
PUT    /api/customers/:id     # Update customer
DELETE /api/customers/:id     # Delete customer
```

### Invoices

```http
GET    /api/invoices          # List invoices
POST   /api/invoices          # Create invoice
GET    /api/invoices/:id      # Get invoice
PUT    /api/invoices/:id      # Update invoice
DELETE /api/invoices/:id      # Delete invoice
```

### Stock Management

```http
GET    /api/stock/adjustment  # Get stock adjustments
POST   /api/stock/adjustment  # Create stock adjustment
GET    /api/stock/movements   # Get stock movements
```

### Reports

```http
GET    /api/reports/sales?from_date=2025-01-01&to_date=2025-12-31
GET    /api/reports/gst?from_date=2025-01-01&to_date=2025-12-31
GET    /api/reports/inventory
GET    /api/reports/profit?from_date=2025-01-01&to_date=2025-12-31
```

### Dashboard

```http
GET    /api/dashboard/stats    # Dashboard statistics
GET    /api/dashboard/sales    # Sales chart data
GET    /api/dashboard/top-products  # Top products
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Server Configuration
PORT=3000
NODE_ENV=development

# Optional: Email Configuration (for future features)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3000
```

### Database Schema

The application uses 10 main tables:

1. **users** - User accounts and authentication
2. **categories** - Product categories
3. **products** - Product catalog with GST information
4. **customers** - Customer database
5. **suppliers** - Supplier/vendor information
6. **invoices** - Sales invoices
7. **invoice_items** - Invoice line items
8. **purchases** - Purchase orders
9. **stock_movements** - Inventory movement history
10. **audit_logs** - System audit trail

## 🧪 Testing

### Backend Tests
```bash
cd Backend
npm test
```

### Frontend Tests
```bash
cd Frontend
npm test
```

### Manual Testing
- Use the provided `TEST_LOGIN.html` for basic authentication testing
- Check API endpoints with tools like Postman or Insomnia

## 🔧 Troubleshooting

### Common Issues

**1. Database Connection Error**
```
Error: connect ECONNREFUSED
```
- Check your Supabase URL and anon key in `.env`
- Ensure Supabase project is active
- Verify database migrations are applied

**2. Authentication Issues**
```
Error: Invalid token
```
- Check JWT_SECRET in `.env`
- Ensure token hasn't expired
- Verify user credentials

**3. Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::3000
```
```bash
# Find process using port 3000
netstat -ano | findstr :3000
# Kill the process
taskkill /PID <PID> /F
```

**4. CORS Errors**
```
Access to XMLHttpRequest blocked by CORS policy
```
- Check CORS configuration in `server-fixed.js`
- Ensure frontend is running on correct port

**5. Build Errors**
```bash
cd Frontend
rm -rf node_modules package-lock.json
npm install
```

### Health Checks

- **Database**: `GET /health/db`
- **Server**: `GET /health`
- **Frontend**: Check browser console for errors

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

## 📊 System Requirements

### Minimum Requirements
- **OS**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **RAM**: 4GB
- **Storage**: 500MB free space
- **Network**: Stable internet connection

### Recommended Requirements
- **OS**: Windows 11, macOS 12+, Ubuntu 20.04+
- **RAM**: 8GB
- **Storage**: 1GB free space
- **Network**: High-speed internet

