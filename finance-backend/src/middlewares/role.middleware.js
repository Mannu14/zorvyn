/**
 * authorize — role-based access control middleware factory.
 *
 * Usage in routes:
 *   router.post('/transactions', protect, authorize('ADMIN'), createTransaction);
 *   router.get('/dashboard/summary', protect, authorize('ANALYST', 'ADMIN'), getSummary);
 *
 * The middleware relies on req.user being set by the protect middleware first.
 *
 * @param  {...string} roles - Allowed roles (e.g. 'ADMIN', 'ANALYST', 'VIEWER')
 * @returns {Function} Express middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user?.role || 'none'}.`,
      });
    }
    next();
  };
};

module.exports = { authorize };
