const Transaction = require('../models/Transaction');

/**
 * Create a new transaction record.
 * @param {object} data - Validated transaction fields
 * @param {string} userId - ID of the creating user
 */
const createTransaction = async (data, userId) => {
  const transaction = await Transaction.create({ ...data, createdBy: userId });
  return transaction;
};

/**
 * Paginated list of non-deleted transactions with optional filters.
 * @param {object} filters - { type, category, from, to }
 * @param {number} page
 * @param {number} limit
 */
const getTransactions = async (filters = {}, page = 1, limit = 10) => {
  const query = { isDeleted: false };

  if (filters.type) query.type = filters.type.toUpperCase();
  if (filters.category) query.category = { $regex: filters.category, $options: 'i' };

  // Date range filter
  if (filters.from || filters.to) {
    query.date = {};
    if (filters.from) query.date.$gte = new Date(filters.from);
    if (filters.to) query.date.$lte = new Date(filters.to);
  }

  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    Transaction.find(query)
      .lean()
      .populate('createdBy', 'name email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),
    Transaction.countDocuments(query),
  ]);

  return {
    transactions,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Fetch a single non-deleted transaction by ID.
 */
const getTransactionById = async (id) => {
  return Transaction.findOne({ _id: id, isDeleted: false })
    .lean()
    .populate('createdBy', 'name email');
};

/**
 * Update a transaction by ID.
 * Returns null if transaction doesn't exist or is soft-deleted.
 */
const updateTransaction = async (id, data) => {
  const transaction = await Transaction.findOneAndUpdate(
    { _id: id, isDeleted: false },
    data,
    { new: true, runValidators: true }
  ).lean();
  return transaction;
};

/**
 * Soft-delete a transaction — sets isDeleted: true.
 * Never physically removes the document.
 */
const softDeleteTransaction = async (id) => {
  const transaction = await Transaction.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  ).lean();
  return transaction;
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  softDeleteTransaction,
};
