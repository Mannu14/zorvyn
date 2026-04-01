/**
 * Seed script — populates the database with:
 *   - 3 users (ADMIN, ANALYST, VIEWER)
 *   - 25 randomized transactions spread across the last 6 months
 *
 * Usage: node seed/seed.js
 *
 * WARNING: This will clear existing users and transactions before seeding.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Transaction = require('../src/models/Transaction');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/finance_db';

// ─── Seed Data ────────────────────────────────────────────────────────────────

const USERS = [
  {
    name: 'Admin User',
    email: 'admin@finance.com',
    password: 'Admin@123',
    role: 'ADMIN',
  },
  {
    name: 'Analyst User',
    email: 'analyst@finance.com',
    password: 'Analyst@123',
    role: 'ANALYST',
  },
  {
    name: 'Viewer User',
    email: 'viewer@finance.com',
    password: 'Viewer@123',
    role: 'VIEWER',
  },
];

const CATEGORIES = ['Salary', 'Rent', 'Food', 'Marketing', 'Utilities', 'Travel'];

const TRANSACTION_TEMPLATES = [
  { title: 'Monthly Salary', type: 'INCOME', category: 'Salary', baseAmount: 75000 },
  { title: 'Freelance Payment', type: 'INCOME', category: 'Salary', baseAmount: 25000 },
  { title: 'Office Rent', type: 'EXPENSE', category: 'Rent', baseAmount: 30000 },
  { title: 'Team Lunch', type: 'EXPENSE', category: 'Food', baseAmount: 2500 },
  { title: 'Grocery Supplies', type: 'EXPENSE', category: 'Food', baseAmount: 3500 },
  { title: 'Google Ads Campaign', type: 'EXPENSE', category: 'Marketing', baseAmount: 15000 },
  { title: 'Social Media Promotion', type: 'EXPENSE', category: 'Marketing', baseAmount: 8000 },
  { title: 'Electricity Bill', type: 'EXPENSE', category: 'Utilities', baseAmount: 4500 },
  { title: 'Internet & Hosting', type: 'EXPENSE', category: 'Utilities', baseAmount: 2800 },
  { title: 'Client Site Visit', type: 'EXPENSE', category: 'Travel', baseAmount: 6000 },
  { title: 'Conference Travel', type: 'EXPENSE', category: 'Travel', baseAmount: 18000 },
  { title: 'Product Sale Revenue', type: 'INCOME', category: 'Marketing', baseAmount: 45000 },
  { title: 'Consulting Fee', type: 'INCOME', category: 'Salary', baseAmount: 35000 },
  { title: 'Server Infrastructure', type: 'EXPENSE', category: 'Utilities', baseAmount: 9500 },
  { title: 'Office Supplies', type: 'EXPENSE', category: 'Rent', baseAmount: 1800 },
  { title: 'Team Dinner', type: 'EXPENSE', category: 'Food', baseAmount: 4200 },
  { title: 'Software Licenses', type: 'EXPENSE', category: 'Utilities', baseAmount: 12000 },
  { title: 'Quarterly Bonus', type: 'INCOME', category: 'Salary', baseAmount: 20000 },
  { title: 'Airport Transfer', type: 'EXPENSE', category: 'Travel', baseAmount: 2200 },
  { title: 'Newsletter Subscription Revenue', type: 'INCOME', category: 'Marketing', baseAmount: 8500 },
  { title: 'Water & Maintenance', type: 'EXPENSE', category: 'Utilities', baseAmount: 1500 },
  { title: 'Weekend Workshop Expenses', type: 'EXPENSE', category: 'Travel', baseAmount: 5500 },
  { title: 'Partnership Revenue', type: 'INCOME', category: 'Marketing', baseAmount: 60000 },
  { title: 'Fuel Reimbursement', type: 'EXPENSE', category: 'Travel', baseAmount: 3200 },
  { title: 'Canteen & Refreshments', type: 'EXPENSE', category: 'Food', baseAmount: 1900 },
];

/**
 * Generate a random date within the last `months` months.
 */
const randomDateWithinMonths = (months = 6) => {
  const now = new Date();
  const past = new Date();
  past.setMonth(past.getMonth() - months);
  const diff = now.getTime() - past.getTime();
  return new Date(past.getTime() + Math.random() * diff);
};

/**
 * Slightly randomize an amount (±15%) to make data look realistic.
 */
const fuzz = (base) => {
  const factor = 0.85 + Math.random() * 0.3; // 0.85 – 1.15
  return parseFloat((base * factor).toFixed(2));
};

// ─── Main Seed Function ───────────────────────────────────────────────────────

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // Clear existing data
    await User.deleteMany({});
    await Transaction.deleteMany({});
    console.log('Cleared existing users and transactions.');

    // Create users with hashed passwords
    const hashedUsers = await Promise.all(
      USERS.map(async (u) => ({
        ...u,
        password: await bcrypt.hash(u.password, 12),
      }))
    );

    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`Created ${createdUsers.length} users.`);

    const adminUser = createdUsers.find((u) => u.role === 'ADMIN');

    // Build 25 transaction documents
    const transactions = TRANSACTION_TEMPLATES.map((t) => ({
      title: t.title,
      amount: fuzz(t.baseAmount),
      type: t.type,
      category: t.category,
      date: randomDateWithinMonths(6),
      description: `Auto-generated seed entry for ${t.category.toLowerCase()} category.`,
      createdBy: adminUser._id,
      isDeleted: false,
    }));

    await Transaction.insertMany(transactions);
    console.log(`Created ${transactions.length} transactions.`);

    console.log('\n── Seed Complete ──────────────────────────────────────');
    console.log('Credentials for testing:');
    console.log('  ADMIN    → admin@finance.com    / Admin@123');
    console.log('  ANALYST  → analyst@finance.com  / Analyst@123');
    console.log('  VIEWER   → viewer@finance.com   / Viewer@123');
    console.log('───────────────────────────────────────────────────────\n');

    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
