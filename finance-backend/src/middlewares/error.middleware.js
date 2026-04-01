/**
 * Global error-handling middleware.
 * Express identifies this as an error handler because it has 4 parameters (err, req, res, next).
 *
 * All errors thrown / forwarded via next(err) from any route or middleware end up here.
 */
const errorMiddleware = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  let statusCode = err.statusCode || 500;
  let error = err.error || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'Something went wrong on the server.';

  // ── Mongoose: invalid ObjectId (e.g. GET /users/not-an-id) ─────────────────
  if (err.name === 'CastError') {
    statusCode = 400;
    error = 'INVALID_ID';
    message = `Invalid value for field '${err.path}'. Expected a valid MongoDB ObjectId.`;
  }

  // ── Mongoose: schema validation failure ─────────────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 400;
    error = 'VALIDATION_ERROR';
    // Collect all field-level messages
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join('; ');
  }

  // ── MongoDB: duplicate key (e.g. duplicate email on register) ───────────────
  if (err.code === 11000) {
    statusCode = 409;
    error = 'DUPLICATE_FIELD';
    const field = Object.keys(err.keyValue)[0];
    message = `An account with this ${field} already exists.`;
  }

  // ── JWT errors are handled in auth.middleware.js; this catches anything missed
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    error = 'UNAUTHORIZED';
    message = 'Invalid authentication token.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    error = 'UNAUTHORIZED';
    message = 'Your session has expired. Please log in again.';
  }

  // Never expose stack traces in production
  const response = { success: false, error, message };
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

module.exports = errorMiddleware;
