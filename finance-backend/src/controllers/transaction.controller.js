const { validationResult } = require('express-validator');
const transactionService = require('../services/transaction.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * POST /api/transactions
 * ADMIN only — create a new financial record
 */
const createTransaction = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'VALIDATION_ERROR', errors.array().map((e) => e.msg).join('; '));
  }

  const { title, amount, type, category, date, description } = req.body;

  const transaction = await transactionService.createTransaction(
    { title, amount, type: type.toUpperCase(), category, date, description },
    req.user._id
  );

  return sendSuccess(res, 201, 'Transaction created successfully.', transaction);
});

/**
 * GET /api/transactions
 * ALL roles — paginated list with optional filters
 * Query params: type, category, from, to, page, limit
 */
const listTransactions = asyncHandler(async (req, res) => {
  const { type, category, from, to } = req.query;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));

  const { transactions, pagination } = await transactionService.getTransactions(
    { type, category, from, to },
    page,
    limit
  );

  return sendSuccess(res, 200, 'Transactions fetched successfully.', transactions, pagination);
});

/**
 * GET /api/transactions/:id
 * ALL roles — fetch a single transaction
 */
const getTransaction = asyncHandler(async (req, res) => {
  const transaction = await transactionService.getTransactionById(req.params.id);

  if (!transaction) {
    return sendError(res, 404, 'NOT_FOUND', 'Transaction not found.');
  }

  return sendSuccess(res, 200, 'Transaction fetched successfully.', transaction);
});

/**
 * PUT /api/transactions/:id
 * ADMIN only — update a transaction
 */
const updateTransaction = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'VALIDATION_ERROR', errors.array().map((e) => e.msg).join('; '));
  }

  const { title, amount, type, category, date, description } = req.body;

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (amount !== undefined) updateData.amount = amount;
  if (type !== undefined) updateData.type = type.toUpperCase();
  if (category !== undefined) updateData.category = category;
  if (date !== undefined) updateData.date = date;
  if (description !== undefined) updateData.description = description;

  const transaction = await transactionService.updateTransaction(req.params.id, updateData);

  if (!transaction) {
    return sendError(res, 404, 'NOT_FOUND', 'Transaction not found or has been deleted.');
  }

  return sendSuccess(res, 200, 'Transaction updated successfully.', transaction);
});

/**
 * DELETE /api/transactions/:id
 * ADMIN only — soft delete (sets isDeleted: true)
 */
const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await transactionService.softDeleteTransaction(req.params.id);

  if (!transaction) {
    return sendError(res, 404, 'NOT_FOUND', 'Transaction not found or already deleted.');
  }

  return sendSuccess(res, 200, 'Transaction deleted successfully.');
});

module.exports = {
  createTransaction,
  listTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
};
