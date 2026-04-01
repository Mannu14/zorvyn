/**
 * Standardized API response helpers.
 * Using dedicated helpers keeps response shape consistent across every controller.
 */

/**
 * Send a success response.
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Human-readable message
 * @param {any}    data - Payload to return (object or array)
 * @param {object} [pagination] - Optional pagination metadata
 */
const sendSuccess = (res, statusCode, message, data = null, pagination = null) => {
  const response = { success: true, message };

  if (data !== null) response.data = data;
  if (pagination !== null) response.pagination = pagination;

  return res.status(statusCode).json(response);
};

/**
 * Send an error response.
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} error - Machine-readable error code (e.g. 'VALIDATION_ERROR')
 * @param {string} message - Human-readable error description
 */
const sendError = (res, statusCode, error, message) => {
  return res.status(statusCode).json({ success: false, error, message });
};

module.exports = { sendSuccess, sendError };
