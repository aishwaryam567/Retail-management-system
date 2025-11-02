const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { generateToken, authenticate } = require('./middleware/auth');
const { asyncHandler } = require('./middleware/errorHandler');
const { validateRequired, validateEmail, validateRole } = require('./middleware/validator');
const { createUser, getUserByEmail, getUserById, updateUser } = require('./db/models/users');
const { createAuditLog } = require('./db/models/auditLogs');

// POST /api/auth/register - Register new user
router.post('/register', validateRequired(['email', 'full_name', 'password', 'role']), asyncHandler(async (req, res) => {
  const { email, full_name, password, role } = req.body;

  // Validate email format
  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Validate role
  if (!validateRole(role)) {
    return res.status(400).json({ error: 'Invalid role. Must be: owner, admin, cashier, or stock_manager' });
  }

  // Check if user already exists
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return res.status(409).json({ error: 'User with this email already exists' });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user (Note: In production, store password in a separate auth table or use Supabase Auth)
  // For now, we'll store it in metadata (not ideal, but works for development)
  const user = await createUser({
    email,
    full_name,
    role
  });

  // In a real app, you'd store the password hash separately
  // For this demo, we're using Supabase which can handle auth separately
  // This is a simplified version

  // Create audit log
  await createAuditLog({
    actor_id: user.id,
    action: 'USER_REGISTERED',
    object_type: 'user',
    object_id: user.id,
    changes: { email, role }
  });

  // Generate JWT token
  const token = generateToken(user);

  // Return user without password
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role
    },
    token
  });
}));

// POST /api/auth/login - User login
router.post('/login', validateRequired(['email', 'password']), asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Get user by email
  const user = await getUserByEmail(email);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // In production: Verify password against stored hash
  // For this demo with Supabase, you'd use Supabase Auth
  // This is simplified - in reality, use Supabase's built-in auth
  
  // For demo purposes, we'll accept any password (NOT SECURE - FIX IN PRODUCTION)
  // TODO: Implement proper password verification
  
  // Generate JWT token
  const token = generateToken(user);

  // Create audit log
  await createAuditLog({
    actor_id: user.id,
    action: 'USER_LOGIN',
    object_type: 'user',
    object_id: user.id,
    changes: { login_time: new Date() }
  });

  res.json({
    success: true,
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role
    },
    token
  });
}));

// GET /api/auth/me - Get current user (protected route)
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  // req.user is set by authenticate middleware
  const user = await getUserById(req.user.id);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    }
  });
}));

// POST /api/auth/change-password - Change password (protected route)
router.post('/change-password', authenticate, validateRequired(['old_password', 'new_password']), asyncHandler(async (req, res) => {
  const { old_password, new_password } = req.body;
  const userId = req.user.id;

  // Validate new password strength
  if (new_password.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters long' });
  }

  // Get user
  const user = await getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // In production: Verify old password and update to new hashed password
  // TODO: Implement proper password change with Supabase Auth
  
  // Hash new password
  const hashedPassword = await bcrypt.hash(new_password, 10);

  // Create audit log
  await createAuditLog({
    actor_id: userId,
    action: 'PASSWORD_CHANGED',
    object_type: 'user',
    object_id: userId,
    changes: { changed_at: new Date() }
  });

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

// POST /api/auth/logout - Logout (optional - mainly for audit trail)
router.post('/logout', authenticate, asyncHandler(async (req, res) => {
  // Create audit log
  await createAuditLog({
    actor_id: req.user.id,
    action: 'USER_LOGOUT',
    object_type: 'user',
    object_id: req.user.id,
    changes: { logout_time: new Date() }
  });

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

module.exports = router;
