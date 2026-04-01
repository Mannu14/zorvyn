const express = require('express');
const { body } = require('express-validator');
const {
  createTransaction,
  listTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transaction.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

// All transaction routes require a valid token
router.use(protect);

// ─── Validators ───────────────────────────────────────────────────────────────

const createValidators = [
  body('title').trim().notEmpty().withMessage('Title is required.'),
  body('amount')
    .notEmpty().withMessage('Amount is required.')
    .isFloat({ gt: 0 }).withMessage('Amount must be a positive number greater than 0.'),
  body('type')
    .notEmpty().withMessage('Type is required.')
    .toUpperCase()
    .isIn(['INCOME', 'EXPENSE']).withMessage('Type must be INCOME or EXPENSE.'),
  body('category').trim().notEmpty().withMessage('Category is required.'),
  body('date')
    .notEmpty().withMessage('Date is required.')
    .isISO8601().withMessage('Date must be a valid ISO 8601 date (e.g. 2024-03-15).'),
  body('description').optional().trim(),
];

// For updates, all fields are optional but must be valid when provided
const updateValidators = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty.'),
  body('amount')
    .optional()
    .isFloat({ gt: 0 }).withMessage('Amount must be a positive number greater than 0.'),
  body('type')
    .optional()
    .toUpperCase()
    .isIn(['INCOME', 'EXPENSE']).withMessage('Type must be INCOME or EXPENSE.'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty.'),
  body('date')
    .optional()
    .isISO8601().withMessage('Date must be a valid ISO 8601 date.'),
  body('description').optional().trim(),
];

// ─── Routes ───────────────────────────────────────────────────────────────────

// Read — all authenticated roles
router.get('/', listTransactions);
router.get('/:id', getTransaction);

// Write — ADMIN only
router.post('/', authorize('ADMIN'), createValidators, createTransaction);
router.put('/:id', authorize('ADMIN'), updateValidators, updateTransaction);
router.delete('/:id', authorize('ADMIN'), deleteTransaction);

module.exports = router;
