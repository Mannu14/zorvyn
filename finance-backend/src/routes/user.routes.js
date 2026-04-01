const express = require('express');
const { body } = require('express-validator');
const {
  listUsers,
  getUser,
  changeRole,
  toggleStatus,
  removeUser,
} = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

// All user management routes require authentication AND ADMIN role
router.use(protect, authorize('ADMIN'));

// ─── Validators ───────────────────────────────────────────────────────────────

const roleValidator = [
  body('role')
    .notEmpty().withMessage('Role is required.')
    .isIn(['VIEWER', 'ANALYST', 'ADMIN']).withMessage('Role must be VIEWER, ANALYST, or ADMIN.'),
];

// ─── Routes ───────────────────────────────────────────────────────────────────

router.get('/', listUsers);
router.get('/:id', getUser);
router.patch('/:id/role', roleValidator, changeRole);
router.patch('/:id/status', toggleStatus);
router.delete('/:id', removeUser);

module.exports = router;
