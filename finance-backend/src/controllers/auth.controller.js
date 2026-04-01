const { validationResult } = require('express-validator');
const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * POST /api/auth/register
 * Public — create a new account (role defaults to VIEWER)
 */
const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'VALIDATION_ERROR', errors.array().map((e) => e.msg).join('; '));
  }

  const { name, email, password } = req.body;
  const { user, token } = await authService.registerUser({ name, email, password });

  return sendSuccess(res, 201, 'Account created successfully.', { user, token });
});

/**
 * POST /api/auth/login
 * Public — authenticate and receive a JWT
 */
const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'VALIDATION_ERROR', errors.array().map((e) => e.msg).join('; '));
  }

  const { email, password } = req.body;
  const result = await authService.loginUser({ email, password });

  if (!result) {
    return sendError(res, 401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
  }

  return sendSuccess(res, 200, 'Logged in successfully.', result);
});

/**
 * GET /api/auth/me
 * Protected — return the currently authenticated user's profile
 */
const getMe = asyncHandler(async (req, res) => {
  // req.user is already populated (without password) by the protect middleware
  return sendSuccess(res, 200, 'Profile fetched successfully.', req.user);
});

module.exports = { register, login, getMe };
