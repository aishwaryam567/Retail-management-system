# Backend Setup Instructions - Week 1

## Step 1: Create Folder Structure

Run this in your terminal from the project root:

```bash
cd Backend

# Create directories
mkdir utils
mkdir middleware  
mkdir routes
mkdir services
```

## Step 2: Move Files to Correct Locations

Move the files I created to their correct folders:

### Utils folder (Backend/utils/):
- Move `pricing.js` → `utils/pricing.js`
- Move `invoiceCalculator.js` → `utils/invoiceCalculator.js`

### Middleware folder (Backend/middleware/):
- Move `auth.js` → `middleware/auth.js`
- Move `errorHandler.js` → `middleware/errorHandler.js`
- Move `validator.js` → `middleware/validator.js`

### Models folder (Backend/db/models/):
- Move `categories-model.js` → `db/models/categories.js`
- Move `customers-model.js` → `db/models/customers.js`
- Move `suppliers-model.js` → `db/models/suppliers.js`
- Move `invoices-model.js` → `db/models/invoices.js`
- Move `invoiceItems-model.js` → `db/models/invoiceItems.js`
- Move `purchases-model.js` → `db/models/purchases.js`
- Move `stockMovements-model.js` → `db/models/stockMovements.js`
- Move `auditLogs-model.js` → `db/models/auditLogs.js`

## Step 3: Install Required Dependencies

```bash
npm install jsonwebtoken bcryptjs cors
npm install --save-dev nodemon
```

## Step 4: Update package.json

Add these scripts to your `package.json`:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js",
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

## Step 5: Update .env file

Add JWT_SECRET to your `.env` file:

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_random_secret_key_change_this_to_something_secure
PORT=3000
NODE_ENV=development
```

## Files Created ✅

### Utils (2 files):
- ✅ pricing.js - Price conversion & GST calculations
- ✅ invoiceCalculator.js - Invoice totals calculator

### Middleware (3 files):
- ✅ auth.js - JWT authentication & authorization
- ✅ errorHandler.js - Global error handling
- ✅ validator.js - Input validation helpers

### Models (10 files):
- ✅ users.js (updated)
- ✅ products.js (updated)
- ✅ categories.js
- ✅ customers.js
- ✅ suppliers.js
- ✅ invoices.js
- ✅ invoiceItems.js
- ✅ purchases.js
- ✅ stockMovements.js
- ✅ auditLogs.js

## Next Steps

After organizing files, we'll create:
1. Authentication routes (register, login)
2. Product routes (CRUD)
3. Category routes (CRUD)
4. Customer routes (CRUD)
5. Supplier routes (CRUD)
6. Invoice routes (create, list, get)

## Quick Test

Once you've moved the files, test the server:

```bash
npm run dev
```

Visit: http://localhost:3000/health/db

Should see: `{"ok":true,"db":true}` or similar

---

**Status: Week 1 - Day 1-4 Complete! ✅**

Ready to proceed with authentication routes next!
