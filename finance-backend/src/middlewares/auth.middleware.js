const User = require('../models/User');
const { verifyToken } = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');

/**
 * protect — verifies the Bearer token in the Authorization header
 * and attaches the authenticated user to req.user.
 *
 * Responds with 401 when the token is missing, malformed, expired,
 * or the associated user no longer exists / is deactivated.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Extract token from "Authorization: Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Authentication token is missing. Please log in.',
    });
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    const isExpired = err.name === 'TokenExpiredError';
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: isExpired
        ? 'Your session has expired. Please log in again.'
        : 'Invalid authentication token.',
    });
  }

  // Confirm user still exists and is active
  const user = await User.findById(decoded.id).lean();

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'The user belonging to this token no longer exists.',
    });
  }

  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      error: 'ACCOUNT_DISABLED',
      message: 'Your account has been deactivated. Please contact an administrator.',
    });
  }

  req.user = user; // { _id, name, email, role, isActive, ... }
  next();
});

module.exports = { protect };
