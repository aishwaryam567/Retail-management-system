# 🎨 Week 4 - Frontend Setup Guide

## Overview

Week 4 focuses on setting up the React frontend with:
- ✅ React + Vite setup
- ✅ React Router for navigation
- ✅ Tailwind CSS for styling
- ✅ Authentication UI (Login/Register)
- ✅ Protected routes
- ✅ Dashboard layout
- ✅ API integration

---

## Step 1: Initialize React App (5 minutes)

### Option A: Manual Setup (Recommended)

```bash
cd Frontend
npm create vite@latest . -- --template react
```

When prompted:
- Project name: **.** (current directory)
- Select framework: **React**
- Select variant: **JavaScript**

Then:
```bash
npm install
```

### Option B: If Frontend folder doesn't exist

```bash
npm create vite@latest Frontend -- --template react
cd Frontend
npm install
```

---

## Step 2: Install Dependencies (3 minutes)

```bash
cd Frontend
npm install react-router-dom axios
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Dependencies:**
- `react-router-dom` - Routing
- `axios` - API calls
- `tailwindcss` - Styling
- `postcss` & `autoprefixer` - CSS processing

---

## Step 3: Configure Tailwind CSS (2 minutes)

**Edit `tailwind.config.js`:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**Edit `src/index.css`:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Step 4: Project Structure

Create this folder structure in `Frontend/src`:

```
Frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Layout.jsx
│   │   └── common/
│   │       ├── Button.jsx
│   │       ├── Input.jsx
│   │       └── Card.jsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Products.jsx
│   │   ├── Customers.jsx
│   │   ├── Invoices.jsx
│   │   └── Reports.jsx
│   ├── services/
│   │   ├── api.js
│   │   └── auth.js
│   ├── utils/
│   │   ├── formatters.js
│   │   └── constants.js
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── App.jsx
│   └── main.jsx
```

Create folders:
```bash
cd Frontend/src
mkdir components pages services utils context
mkdir components/layout components/common
mkdir pages/auth
```

---

## Step 5: API Service Setup

**File: `src/services/api.js`**
```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

**File: `src/services/auth.js`**
```javascript
import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken() {
    return localStorage.getItem('token');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  setAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
};
```

---

## Step 6: Environment Variables

**File: `Frontend/.env`**
```env
VITE_API_URL=http://localhost:3000/api
```

---

## Step 7: Auth Context

**File: `src/context/AuthContext.jsx`**
```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = authService.getToken();
    const savedUser = authService.getUser();
    
    if (token && savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    authService.setAuth(data.token, data.user);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    authService.setAuth(data.token, data.user);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## Step 8: Router Setup

**File: `src/App.jsx`**
```javascript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Layout from './components/layout/Layout';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            {/* More routes will be added */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

---

## Step 9: Test the Setup

```bash
cd Frontend
npm run dev
```

Open browser at: `http://localhost:5173`

You should see the Vite + React welcome screen.

---

## What's Next

After setup is complete, say **"create login page"** and I'll create:
1. Login page with form
2. Register page
3. Dashboard layout
4. Sidebar navigation
5. Protected routes

---

## Common Issues

### Port already in use
```bash
# Edit vite.config.js
export default {
  server: {
    port: 5174 // Change port
  }
}
```

### Module not found errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Tailwind not working
Make sure you added the directives to `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Progress Checklist

- [ ] React app initialized with Vite
- [ ] Dependencies installed
- [ ] Tailwind CSS configured
- [ ] Folder structure created
- [ ] API service setup
- [ ] Auth context created
- [ ] Router configured
- [ ] .env file created
- [ ] Server running on port 5173

---

**Once setup is complete, let me know and I'll create the UI components!** 🎨
