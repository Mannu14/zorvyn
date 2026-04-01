const { validationResult } = require('express-validator');
const userService = require('../services/user.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * GET /api/users
 * ADMIN — paginated list of all users
 */
const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));

  const { users, pagination } = await userService.getAllUsers(page, limit);

  return sendSuccess(res, 200, 'Users fetched successfully.', users, pagination);
});

/**
 * GET /api/users/:id
 * ADMIN — fetch a single user by ID
 */
const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);

  if (!user) {
    return sendError(res, 404, 'NOT_FOUND', 'User not found.');
  }

  return sendSuccess(res, 200, 'User fetched successfully.', user);
});

/**
 * PATCH /api/users/:id/role
 * ADMIN — update a user's role
 */
const changeRole = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'VALIDATION_ERROR', errors.array().map((e) => e.msg).join('; '));
  }

  // Prevent admin from changing their own role (safeguard)
  if (req.params.id === String(req.user._id)) {
    return sendError(res, 400, 'INVALID_OPERATION', 'You cannot change your own role.');
  }

  const user = await userService.updateUserRole(req.params.id, req.body.role);

  if (!user) {
    return sendError(res, 404, 'NOT_FOUND', 'User not found.');
  }

  return sendSuccess(res, 200, `User role updated to ${user.role}.`, user);
});

/**
 * PATCH /api/users/:id/status
 * ADMIN — toggle user active/inactive
 */
const toggleStatus = asyncHandler(async (req, res) => {
  // Prevent admin from disabling themselves
  if (req.params.id === String(req.user._id)) {
    return sendError(res, 400, 'INVALID_OPERATION', 'You cannot deactivate your own account.');
  }

  const user = await userService.toggleUserStatus(req.params.id);

  if (!user) {
    return sendError(res, 404, 'NOT_FOUND', 'User not found.');
  }

  const statusLabel = user.isActive ? 'activated' : 'deactivated';
  return sendSuccess(res, 200, `User account ${statusLabel} successfully.`, user);
});

/**
 * DELETE /api/users/:id
 * ADMIN — permanently remove a user
 */
const removeUser = asyncHandler(async (req, res) => {
  if (req.params.id === String(req.user._id)) {
    return sendError(res, 400, 'INVALID_OPERATION', 'You cannot delete your own account.');
  }

  const user = await userService.deleteUser(req.params.id);

  if (!user) {
    return sendError(res, 404, 'NOT_FOUND', 'User not found.');
  }

  return sendSuccess(res, 200, 'User deleted successfully.');
});

module.exports = { listUsers, getUser, changeRole, toggleStatus, removeUser };
