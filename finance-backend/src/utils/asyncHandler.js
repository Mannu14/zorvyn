/**
 * Wraps an async route handler so any rejected promise is forwarded
 * to Express's global error middleware via next(err).
 * This removes the need for try/catch blocks in every controller.
 *
 * @param {Function} fn - Async route handler (req, res, next) => Promise
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
