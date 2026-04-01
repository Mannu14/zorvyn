const mongoose = require('mongoose');

const VALID_CATEGORIES = [
  'Salary',
  'Rent',
  'Food',
  'Marketing',
  'Utilities',
  'Travel',
  'Healthcare',
  'Entertainment',
  'Education',
  'Other',
];

const transactionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    type: {
      type: String,
      enum: {
        values: ['INCOME', 'EXPENSE'],
        message: 'Type must be INCOME or EXPENSE',
      },
      required: [true, 'Type is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'createdBy is required'],
    },
    // Soft-delete flag — records are never physically removed
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes for common query patterns ───────────────────────────────────────
transactionSchema.index({ isDeleted: 1, date: -1 });
transactionSchema.index({ isDeleted: 1, type: 1 });
transactionSchema.index({ isDeleted: 1, category: 1 });

// ─── Sanitize output ─────────────────────────────────────────────────────────
transactionSchema.set('toJSON', {
  transform: (_, obj) => {
    delete obj.__v;
    return obj;
  },
});

module.exports = mongoose.model('Transaction', transactionSchema);
