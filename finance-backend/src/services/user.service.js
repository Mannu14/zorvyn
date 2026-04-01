const User = require('../models/User');

/**
 * Fetch a paginated list of all users.
 * @param {number} page
 * @param {number} limit
 */
const getAllUsers = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find().lean().sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(),
  ]);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Find a single user by ID.
 * Returns null when not found.
 */
const getUserById = async (id) => {
  return User.findById(id).lean();
};

/**
 * Change a user's role.
 * Returns the updated user document.
 */
const updateUserRole = async (id, role) => {
  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true }
  ).lean();
  return user;
};

/**
 * Toggle a user's isActive status.
 */
const toggleUserStatus = async (id) => {
  const user = await User.findById(id);
  if (!user) return null;

  user.isActive = !user.isActive;
  await user.save({ validateModifiedOnly: true });

  return user.toJSON();
};

/**
 * Permanently delete a user record.
 */
const deleteUser = async (id) => {
  return User.findByIdAndDelete(id);
};

module.exports = { getAllUsers, getUserById, updateUserRole, toggleUserStatus, deleteUser };
