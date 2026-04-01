const express = require('express');
const {
  getSummary,
  getByCategory,
  getTrends,
  getRecent,
} = require('../controllers/dashboard.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

// All dashboard routes require login AND at least ANALYST role
router.use(protect, authorize('ANALYST', 'ADMIN'));

router.get('/summary', getSummary);
router.get('/by-category', getByCategory);
router.get('/trends', getTrends);
router.get('/recent', getRecent);

module.exports = router;
