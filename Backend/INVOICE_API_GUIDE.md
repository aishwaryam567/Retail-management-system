# 🧾 Invoice & Sales API Guide

## Overview

The Invoice API is the most complex part of the system. It handles:
- ✅ Automatic GST calculation per item
- ✅ Automatic stock deduction
- ✅ Invoice number generation (INV-YYYYMMDD-####)
- ✅ Loyalty points calculation (1 point per ₹100)
- ✅ Return/refund with stock restoration
- ✅ Multiple line items support
- ✅ Item-level and invoice-level discounts

---

## Setup (2 minutes)

```bash
# Move files to correct folders
move invoiceService.js services\invoiceService.js
move invoices-routes.js routes\invoices.js

# Update server
copy server-week2-invoices.js server.js

# Restart server
npm run dev
```

---

## API Endpoints

### 1️⃣ Create Sale Invoice

**Endpoint:** `POST /api/invoices`

**Description:** Create a sale invoice with automatic GST calculation and stock updates.

**Request Body:**
```json
{
  "customer_id": "uuid-or-null",
  "items": [
    {
      "product_id": "uuid",
      "qty": 2,
      "discount": 100
    },
    {
      "product_id": "uuid",
      "qty": 1
    }
  ],
  "discount": 500
}
```

**Fields:**
- `customer_id` (optional): Customer UUID or null for walk-in
- `items` (required): Array of line items
  - `product_id` (required): Product UUID
  - `qty` (required): Quantity (must be > 0)
  - `discount` (optional): Discount in rupees for this item
- `discount` (optional): Discount in rupees for entire invoice

**What Happens:**
1. ✅ Validates customer exists (if provided)
2. ✅ Validates all products exist and have sufficient stock
3. ✅ Calculates GST per item based on product's GST rate
4. ✅ Applies item-level discounts
5. ✅ Applies invoice-level discount
6. ✅ Generates unique invoice number (INV-20251102-0001)
7. ✅ Creates invoice record
8. ✅ Creates invoice items
9. ✅ Creates stock movements (negative qty)
10. ✅ Updates product stock levels
11. ✅ Awards loyalty points (1 point per ₹100 spent)
12. ✅ Creates audit log

**Success Response (201):**
```json
{
  "success": true,
  "message": "Invoice created successfully",
  "invoice": {
    "id": "uuid",
    "invoice_number": "INV-20251102-0001",
    "type": "sale",
    "customer_id": "uuid",
    "created_by": "uuid",
    "subtotal": 55000,
    "tax_total": 9900,
    "discount": 600,
    "total": 64300,
    "created_at": "2025-11-02T19:00:00.000Z",
    "customers": {
      "name": "John Doe"
    },
    "users": {
      "full_name": "Cashier Name"
    },
    "items": [
      {
        "id": "uuid",
        "product_id": "uuid",
        "qty": 2,
        "unit_price": 55000,
        "gst_rate": 18,
        "gst_amount": 9900,
        "item_total": 64900,
        "products": {
          "name": "Laptop",
          "sku": "LAPTOP001",
          "hsn_code": "8471"
        }
      }
    ]
  }
}
```

**Error Responses:**
- `400` - Validation error (missing fields, invalid qty, etc.)
- `400` - "Customer not found"
- `400` - "Product not found"
- `400` - "Insufficient stock for {product}"

---

### 2️⃣ Quick Sale (Walk-in Customer)

**Endpoint:** `POST /api/invoices/quick-sale`

**Description:** Quick sale without creating a customer record.

**Request Body:**
```json
{
  "items": [
    {
      "product_id": "uuid",
      "qty": 1
    }
  ],
  "discount": 0
}
```

**Note:** Same as regular sale but `customer_id` is automatically set to null.

---

### 3️⃣ Create Return Invoice

**Endpoint:** `POST /api/invoices/return`

**Description:** Create a return invoice for a previous sale. Restores stock and deducts loyalty points.

**Request Body:**
```json
{
  "original_invoice_id": "uuid",
  "items": [
    {
      "product_id": "uuid",
      "qty": 1
    }
  ],
  "reason": "Defective product"
}
```

**Fields:**
- `original_invoice_id` (required): UUID of original sale invoice
- `items` (required): Items being returned
  - `product_id` (required): Must be from original invoice
  - `qty` (required): Cannot exceed original quantity
- `reason` (required): Reason for return

**What Happens:**
1. ✅ Validates original invoice exists and is a sale
2. ✅ Validates return items were in original invoice
3. ✅ Validates return quantities don't exceed original
4. ✅ Uses original prices and GST rates
5. ✅ Creates return invoice
6. ✅ Creates stock movements (positive qty - stock back)
7. ✅ Updates product stock levels (increases)
8. ✅ Deducts loyalty points
9. ✅ Creates audit log

**Success Response (201):**
```json
{
  "success": true,
  "message": "Return invoice created successfully",
  "invoice": {
    "id": "uuid",
    "invoice_number": "INV-20251102-0002",
    "type": "return",
    "total": 55000,
    ...
  }
}
```

---

### 4️⃣ List Invoices

**Endpoint:** `GET /api/invoices`

**Query Parameters:**
- `limit` (optional, default: 50): Number of results
- `offset` (optional, default: 0): Pagination offset
- `type` (optional): Filter by type (`sale` or `return`)
- `customer_id` (optional): Filter by customer UUID
- `from_date` (optional): Filter from date (ISO format)
- `to_date` (optional): Filter to date (ISO format)

**Example:**
```
GET /api/invoices?type=sale&limit=20&from_date=2025-11-01
Authorization: Bearer YOUR_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 15,
  "invoices": [
    {
      "id": "uuid",
      "invoice_number": "INV-20251102-0001",
      "type": "sale",
      "customer_id": "uuid",
      "subtotal": 55000,
      "tax_total": 9900,
      "discount": 0,
      "total": 64900,
      "created_at": "2025-11-02T19:00:00.000Z",
      "customers": {
        "name": "John Doe"
      },
      "users": {
        "full_name": "Cashier Name"
      }
    }
  ]
}
```

---

### 5️⃣ Get Invoice Details

**Endpoint:** `GET /api/invoices/:id`

**Description:** Get complete invoice with all line items.

**Example:**
```
GET /api/invoices/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer YOUR_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "invoice": {
    "id": "uuid",
    "invoice_number": "INV-20251102-0001",
    "type": "sale",
    "customer_id": "uuid",
    "subtotal": 55000,
    "tax_total": 9900,
    "discount": 0,
    "total": 64900,
    "created_at": "2025-11-02T19:00:00.000Z",
    "customers": {
      "name": "John Doe",
      "phone": "9876543210",
      "email": "john@example.com"
    },
    "users": {
      "full_name": "Cashier Name"
    },
    "items": [
      {
        "id": "uuid",
        "product_id": "uuid",
        "qty": 1,
        "unit_price": 55000,
        "gst_rate": 18,
        "gst_amount": 9900,
        "item_total": 64900,
        "products": {
          "name": "Laptop",
          "sku": "LAPTOP001",
          "hsn_code": "8471"
        }
      }
    ]
  }
}
```

---

## Complete Example: Create an Invoice

### Step 1: Get Products
```bash
GET /api/products
Authorization: Bearer YOUR_TOKEN
```

### Step 2: Get Customer (optional)
```bash
GET /api/customers
Authorization: Bearer YOUR_TOKEN
```

### Step 3: Create Invoice
```bash
POST /api/invoices
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "customer_id": "customer-uuid-here",
  "items": [
    {
      "product_id": "laptop-uuid",
      "qty": 1,
      "discount": 0
    },
    {
      "product_id": "mouse-uuid",
      "qty": 2,
      "discount": 50
    }
  ],
  "discount": 500
}
```

### Response:
```json
{
  "success": true,
  "message": "Invoice created successfully",
  "invoice": {
    "invoice_number": "INV-20251102-0001",
    "total": 64300,
    "items": [...]
  }
}
```

---

## Invoice Calculation Logic

### Example Product:
- Name: Laptop
- Selling Price: ₹50,000 (stored as 5000000 paise)
- GST Rate: 18%
- Current Stock: 10

### Creating Invoice:
```json
{
  "items": [
    {
      "product_id": "laptop-uuid",
      "qty": 2,
      "discount": 1000
    }
  ],
  "discount": 500
}
```

### Calculations:
1. **Line Subtotal:** ₹50,000 × 2 = ₹100,000
2. **Item Discount:** ₹1,000 × 2 = ₹2,000
3. **Taxable Amount:** ₹100,000 - ₹2,000 = ₹98,000
4. **GST (18%):** ₹98,000 × 18% = ₹17,640
5. **Line Total:** ₹98,000 + ₹17,640 = ₹115,640
6. **Invoice Subtotal:** ₹100,000
7. **Total GST:** ₹17,640
8. **Total Discount:** ₹2,000 + ₹500 = ₹2,500
9. **Final Total:** ₹100,000 - ₹2,500 + ₹17,640 = ₹115,140

### Stock Update:
- Laptop stock: 10 → 8 (reduced by 2)

### Loyalty Points:
- Points earned: ₹115,140 / 100 = 1,151 points

---

## Business Logic Features

### ✅ Stock Validation
- Checks stock availability before creating invoice
- Returns error if insufficient stock
- Prevents negative stock

### ✅ Automatic Calculations
- GST calculated per item based on product's rate
- Supports mixed GST rates in same invoice
- Item-level and invoice-level discounts
- All calculations in paise for precision

### ✅ Invoice Numbering
- Format: `INV-YYYYMMDD-####`
- Auto-increments daily
- Example: INV-20251102-0001, INV-20251102-0002

### ✅ Stock Movements
- Every sale/return creates stock movement record
- Audit trail of all stock changes
- Links to invoice for traceability

### ✅ Loyalty Points
- 1 point per ₹100 spent
- Auto-credited on sale
- Auto-deducted on return
- Can be redeemed later

### ✅ Return Processing
- Must reference original invoice
- Can't return more than purchased
- Uses original prices
- Restores stock automatically

---

## Testing Scenarios

### Test 1: Simple Sale
```json
POST /api/invoices
{
  "customer_id": null,
  "items": [{ "product_id": "uuid", "qty": 1 }]
}
```

### Test 2: Sale with Discounts
```json
POST /api/invoices
{
  "customer_id": "uuid",
  "items": [
    { "product_id": "uuid1", "qty": 2, "discount": 100 }
  ],
  "discount": 500
}
```

### Test 3: Multiple Items with Different GST
```json
POST /api/invoices
{
  "items": [
    { "product_id": "laptop-uuid", "qty": 1 },
    { "product_id": "book-uuid", "qty": 5 }
  ]
}
```

### Test 4: Return Invoice
```json
POST /api/invoices/return
{
  "original_invoice_id": "invoice-uuid",
  "items": [{ "product_id": "uuid", "qty": 1 }],
  "reason": "Defective"
}
```

---

## Error Handling

### Insufficient Stock
```json
{
  "error": "Insufficient stock for Laptop. Available: 5, Requested: 10"
}
```

### Product Not Found
```json
{
  "error": "Product not found: uuid-here"
}
```

### Invalid Return
```json
{
  "error": "Product uuid was not in original invoice"
}
```

---

## Week 2 Complete! 🎉

**Total APIs Created:** 31 endpoints
- 5 Auth endpoints
- 6 Product endpoints
- 5 Category endpoints
- 7 Customer endpoints
- 6 Supplier endpoints
- 5 Invoice endpoints

**Files Created:** 35+ files
**Lines of Code:** ~18,000 lines

---

## Next Steps (Week 3)

1. Purchase Order API
2. Stock Management API (adjustments)
3. Reports API (sales, GST, profit)
4. Dashboard API (statistics)

**Ready?** Say "Week 3" to continue! 🚀
