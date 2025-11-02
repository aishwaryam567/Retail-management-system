# 🧪 Authentication API Testing Guide

## Prerequisites

1. **Organize files first:**
   ```bash
   cd Backend
   .\organize-files.ps1
   ```
   This moves `auth-routes.js` to `routes/auth.js`

2. **Install dependencies:**
   ```bash
   npm install jsonwebtoken bcryptjs cors
   npm install --save-dev nodemon
   ```

3. **Update .env with JWT_SECRET:**
   ```bash
   # Generate a secret
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   
   # Add to .env file
   JWT_SECRET=<your_generated_secret>
   ```

4. **Replace server.js:**
   ```bash
   # Backup original
   copy server.js server-original.js
   
   # Use updated version
   copy server-updated.js server.js
   ```

5. **Start the server:**
   ```bash
   npm run dev
   ```

---

## API Endpoints

### Base URL: `http://localhost:3000`

---

## 1️⃣ Register New User

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "owner@shop.com",
  "full_name": "Shop Owner",
  "password": "securepassword123",
  "role": "owner"
}
```

**Valid Roles:**
- `owner` - Full access
- `admin` - Administrative access
- `cashier` - POS operations
- `stock_manager` - Inventory management

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "uuid-here",
    "email": "owner@shop.com",
    "full_name": "Shop Owner",
    "role": "owner"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400` - Invalid email format or role
- `409` - User already exists

---

## 2️⃣ Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "owner@shop.com",
  "password": "securepassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid-here",
    "email": "owner@shop.com",
    "full_name": "Shop Owner",
    "role": "owner"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response:**
- `401` - Invalid email or password

---

## 3️⃣ Get Current User (Protected)

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "email": "owner@shop.com",
    "full_name": "Shop Owner",
    "role": "owner",
    "created_at": "2025-11-02T19:00:00.000Z",
    "updated_at": "2025-11-02T19:00:00.000Z"
  }
}
```

**Error Responses:**
- `401` - No token provided or invalid token
- `404` - User not found

---

## 4️⃣ Change Password (Protected)

**Endpoint:** `POST /api/auth/change-password`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request Body:**
```json
{
  "old_password": "securepassword123",
  "new_password": "newsecurepassword456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses:**
- `401` - No token provided or invalid token
- `400` - Password too short (min 8 characters)

---

## 5️⃣ Logout (Protected)

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 🧪 Testing with cURL

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@shop.com",
    "full_name": "Shop Owner",
    "password": "securepassword123",
    "role": "owner"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@shop.com",
    "password": "securepassword123"
  }'
```

### Get Current User (use token from login)
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🧪 Testing with Postman

1. **Import Collection:**
   - Create new collection: "Retail Management Auth"
   
2. **Set Environment Variables:**
   - `base_url`: `http://localhost:3000`
   - `token`: (will be set automatically)

3. **Create Requests:**

   **Register:**
   - Method: POST
   - URL: `{{base_url}}/api/auth/register`
   - Body (JSON):
   ```json
   {
     "email": "owner@shop.com",
     "full_name": "Shop Owner",
     "password": "securepassword123",
     "role": "owner"
   }
   ```
   - Tests (to save token):
   ```javascript
   if (pm.response.code === 201) {
     pm.environment.set("token", pm.response.json().token);
   }
   ```

   **Login:**
   - Method: POST
   - URL: `{{base_url}}/api/auth/login`
   - Body (JSON):
   ```json
   {
     "email": "owner@shop.com",
     "password": "securepassword123"
   }
   ```
   - Tests (to save token):
   ```javascript
   if (pm.response.code === 200) {
     pm.environment.set("token", pm.response.json().token);
   }
   ```

   **Get Me:**
   - Method: GET
   - URL: `{{base_url}}/api/auth/me`
   - Headers:
     - `Authorization`: `Bearer {{token}}`

---

## 🧪 Testing with VS Code REST Client

Create file: `test-auth.http`

```http
### Variables
@baseUrl = http://localhost:3000
@email = owner@shop.com
@password = securepassword123

### Register User
POST {{baseUrl}}/api/auth/register
Content-Type: application/json

{
  "email": "{{email}}",
  "full_name": "Shop Owner",
  "password": "{{password}}",
  "role": "owner"
}

### Login
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{
  "email": "{{email}}",
  "password": "{{password}}"
}

### Get Current User (replace TOKEN with actual token from login)
GET {{baseUrl}}/api/auth/me
Authorization: Bearer TOKEN

### Change Password (replace TOKEN)
POST {{baseUrl}}/api/auth/change-password
Content-Type: application/json
Authorization: Bearer TOKEN

{
  "old_password": "{{password}}",
  "new_password": "newsecurepassword456"
}

### Logout (replace TOKEN)
POST {{baseUrl}}/api/auth/logout
Authorization: Bearer TOKEN
```

---

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process if needed (replace PID)
taskkill /PID <PID> /F
```

### "Module not found" errors
```bash
# Reinstall dependencies
cd Backend
rm -rf node_modules package-lock.json
npm install
```

### JWT_SECRET not set
```bash
# Generate and add to .env
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Database errors
- Check Supabase credentials in `.env`
- Verify tables exist in database
- Check internet connection to Supabase

---

## ⚠️ Important Notes

1. **Password Storage:** 
   - Current implementation is simplified for development
   - In production, use Supabase Auth or store hashed passwords in separate table

2. **Token Expiration:**
   - Tokens expire in 7 days
   - Implement refresh token mechanism for production

3. **Security:**
   - Change JWT_SECRET in production
   - Use HTTPS in production
   - Implement rate limiting for auth endpoints

---

## ✅ Success Checklist

- [ ] Server starts without errors
- [ ] Can register new user
- [ ] Can login with registered user
- [ ] Receive JWT token on login
- [ ] Can access `/api/auth/me` with token
- [ ] Receive 401 error without token
- [ ] Can change password
- [ ] Can logout

---

## 🎯 Next Steps

After authentication is working:

1. **Week 2:** Create Product & Category APIs
2. **Week 2:** Create Customer & Supplier APIs  
3. **Week 2:** Create Invoice creation API

See `IMPLEMENTATION_PLAN.md` for detailed roadmap!

---

**Status:** Week 1 (Day 5-7) - Authentication Complete! ✅
