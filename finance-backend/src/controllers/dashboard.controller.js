const dashboardService = require('../services/dashboard.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * GET /api/dashboard/summary
 * ANALYST + ADMIN — total income, total expense, net balance
 */
const getSummary = asyncHandler(async (req, res) => {
  const summary = await dashboardService.getSummary();
  return sendSuccess(res, 200, 'Dashboard summary fetched successfully.', summary);
});

/**
 * GET /api/dashboard/by-category
 * ANALYST + ADMIN — totals grouped by category and type
 */
const getByCategory = asyncHandler(async (req, res) => {
  const breakdown = await dashboardService.getByCategory();
  return sendSuccess(res, 200, 'Category breakdown fetched successfully.', breakdown);
});

/**
 * GET /api/dashboard/trends
 * ANALYST + ADMIN — monthly income vs expense for last 6 months
 */
const getTrends = asyncHandler(async (req, res) => {
  const trends = await dashboardService.getTrends();
  return sendSuccess(res, 200, 'Monthly trends fetched successfully.', trends);
});

/**
 * GET /api/dashboard/recent
 * ANALYST + ADMIN — last 10 transactions
 */
const getRecent = asyncHandler(async (req, res) => {
  const recent = await dashboardService.getRecent();
  return sendSuccess(res, 200, 'Recent transactions fetched successfully.', recent);
});

module.exports = { getSummary, getByCategory, getTrends, getRecent };
