const Transaction = require('../models/Transaction');

/**
 * Overall financial summary: total income, total expense, net balance.
 * Uses an aggregation pipeline to sum amounts grouped by type in one pass.
 */
const getSummary = async () => {
  const results = await Transaction.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
      },
    },
  ]);

  let totalIncome = 0;
  let totalExpense = 0;

  results.forEach((r) => {
    if (r._id === 'INCOME') totalIncome = r.total;
    if (r._id === 'EXPENSE') totalExpense = r.total;
  });

  return {
    totalIncome: parseFloat(totalIncome.toFixed(2)),
    totalExpense: parseFloat(totalExpense.toFixed(2)),
    netBalance: parseFloat((totalIncome - totalExpense).toFixed(2)),
  };
};

/**
 * Category-wise breakdown: total amounts per category per type.
 * Returns an array like: [{ category: 'Rent', type: 'EXPENSE', total: 5000 }, ...]
 */
const getByCategory = async () => {
  const results = await Transaction.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: { category: '$category', type: '$type' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        category: '$_id.category',
        type: '$_id.type',
        total: { $round: ['$total', 2] },
        count: 1,
      },
    },
    { $sort: { category: 1, type: 1 } },
  ]);

  return results;
};

/**
 * Monthly income vs expense trends for the last 6 months.
 * Returns array: [{ year, month, type, total }] sorted chronologically.
 */
const getTrends = async () => {
  // Start of the month 6 months ago
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const results = await Transaction.aggregate([
    {
      $match: {
        isDeleted: false,
        date: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        type: '$_id.type',
        total: { $round: ['$total', 2] },
        count: 1,
      },
    },
    { $sort: { year: 1, month: 1, type: 1 } },
  ]);

  return results;
};

/**
 * Most recent 10 non-deleted transactions.
 * Populates creator name and email for display purposes.
 */
const getRecent = async () => {
  return Transaction.find({ isDeleted: false })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('createdBy', 'name email')
    .lean();
};

module.exports = { getSummary, getByCategory, getTrends, getRecent };
