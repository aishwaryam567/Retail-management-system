# 🛒 Retail Management System with GST Billing

A comprehensive retail management system with GST-compliant invoicing, inventory management, and reporting built with React, Node.js, Express, and PostgreSQL (Supabase).

## 📋 Features

### Core Features (MVP)
- ✅ User Authentication (JWT-based)
- ✅ Role-based Access Control (Owner, Admin, Cashier, Stock Manager)
- 🔄 Product Management with Categories
- 🔄 Customer Management with Loyalty Points
- 🔄 Supplier Management
- 🔄 Invoice Generation with GST Calculation
- 🔄 Automated Stock Management
- 🔄 Purchase Order System
- 🔄 Comprehensive Reports (Sales, GST, Inventory, Profit)
- 🔄 Dashboard with Real-time Statistics

### Advanced Features (Planned)
- Invoice PDF Generation
- Barcode Scanner Integration
- Return/Refund Handling
- Audit Logs
- CSV/Excel Export
- Email Notifications

## 🏗️ Tech Stack

### Frontend
- **React 19** with Vite
- **React Router** for navigation
- UI library (TailwindCSS / Material-UI / Ant Design)
- Axios for API calls

### Backend
- **Node.js** with Express
- **Supabase** (PostgreSQL database)
- **JWT** for authentication
- **bcryptjs** for password hashing

### Database
- **PostgreSQL** (hosted on Supabase)
- 10 tables with proper relations
- Materialized views for reports
- Prices stored in paise (integer) to avoid floating-point errors

## 📊 Database Schema

### Tables
1. **users** - User accounts with roles
2. **categories** - Product categories
3. **products** - Product catalog with GST rates
4. **customers** - Customer database with loyalty points
5. **suppliers** - Supplier information
6. **invoices** - Sales invoices (sale/return)
7. **invoice_items** - Invoice line items
8. **purchases** - Purchase orders
9. **stock_movements** - Stock movement ledger
10. **audit_logs** - Audit trail

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Supabase account
- Git

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd retail-management-with-gst-billing
```

2. **Setup Backend**
```bash
cd Backend

# Install dependencies
npm install

# Organize files (if not done)
.\organize-files.ps1  # Windows
# or follow Backend/SETUP_INSTRUCTIONS.md

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials and JWT_SECRET

# Start development server
npm run dev
```

3. **Setup Frontend**
```bash
cd Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Health Check: http://localhost:3000/health/db

## 📁 Project Structure

```
retail-management-with-gst-billing/
├── Backend/
│   ├── db/
│   │   ├── models/          # Database models (10 files)
│   │   └── supabaseClient.js
│   ├── utils/               # Utilities (pricing, calculations)
│   ├── middleware/          # Auth, validation, error handling
│   ├── routes/              # API routes (to be created)
│   ├── services/            # Business logic (to be created)
│   ├── .env                 # Environment variables
│   ├── package.json
│   └── server.js            # Express server
│
├── Frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API calls
│   │   ├── context/         # React context
│   │   ├── utils/           # Helpers
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── db/
│   └── migrations/          # Database migrations
│
├── IMPLEMENTATION_PLAN.md   # 8-week implementation guide
├── WEEK1_PROGRESS.md        # Week 1 progress tracker
├── QUICK_START.md           # Quick start guide
└── README.md               # This file
```

## 📚 Documentation

- **[Implementation Plan](IMPLEMENTATION_PLAN.md)** - Complete 8-week development roadmap
- **[Week 1 Progress](WEEK1_PROGRESS.md)** - Current progress and checklist
- **[Quick Start](QUICK_START.md)** - Get up and running quickly
- **[Setup Instructions](Backend/SETUP_INSTRUCTIONS.md)** - Backend setup guide

## 🗓️ Development Roadmap

### ✅ Week 1: Backend Foundation (Current)
- [x] Database models (all 10 tables)
- [x] Utilities (pricing, GST calculations)
- [x] Middleware (auth, validation, error handling)
- [ ] Authentication routes
- [ ] File organization

### 🔄 Week 2: Core API Endpoints
- Product & Category APIs
- Customer & Supplier APIs
- Invoice & Sales API

### 📅 Week 3: Purchases, Stock & Reports
- Purchase order system
- Stock management
- Reports API

### 📅 Week 4: Frontend Foundation
- React setup & routing
- Authentication UI
- Dashboard

### 📅 Week 5: Product & Inventory UI
- Product management
- Category management
- Stock movements

### 📅 Week 6: Sales & Invoicing UI
- POS interface
- Invoice creation
- Returns handling

### 📅 Week 7: Customers, Suppliers & Reports UI
- Customer/Supplier management
- Purchase orders UI
- Reports with charts

### 📅 Week 8: Advanced Features & Polish
- PDF generation
- Barcode scanning
- Testing & bug fixes

## 🔑 Key Features Explanation

### GST Calculation
- Supports all GST rates (0%, 5%, 12%, 18%, 28%)
- Automatic CGST/SGST split for intra-state
- IGST for inter-state transactions
- HSN code support

### Price Storage
- All prices stored in **paise** (1 rupee = 100 paise)
- Avoids floating-point arithmetic errors
- Ensures accuracy in calculations

### Stock Management
- Automatic stock updates on sales
- Stock movement ledger (sale, purchase, adjustment, return)
- Low stock alerts
- Reorder level tracking

### Invoice System
- Automatic invoice number generation
- Support for sales and returns
- GST-compliant invoice format
- PDF generation (planned)

## 🔐 Security

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control
- Input validation on all endpoints
- SQL injection prevention (Supabase parameterized queries)
- CORS configuration

## 🧪 Testing

```bash
# Backend
cd Backend
npm test

# Frontend
cd Frontend
npm test
```

## 📝 API Documentation

API endpoints documentation will be available at:
- Postman Collection (to be created)
- Swagger/OpenAPI docs (planned)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Team

- **Developer**: [Your Name]
- **Project Type**: Retail Management System
- **Start Date**: November 2025

## 📞 Support

For issues and questions:
- Check documentation in the `/docs` folder
- Review `IMPLEMENTATION_PLAN.md` for detailed guidance
- Open an issue on GitHub

---

**Current Status**: Week 1 (Days 1-4) Complete ✅  
**Next Steps**: Organize files → Create auth routes → Test API

**Last Updated**: 2025-11-02
