const User = require('../models/User');
const { signToken } = require('../utils/generateToken');

/**
 * Register a new user.
 * Role defaults to VIEWER unless explicitly provided.
 * Password hashing happens in the User pre-save hook.
 */
const registerUser = async ({ name, email, password }) => {
  // email uniqueness is enforced by the unique index — mongo will throw code 11000
  const user = await User.create({ name, email, password });

  const token = signToken({ id: user._id, role: user.role });

  // Return user without password (select: false covers queries, toJSON covers this object)
  return { user, token };
};

/**
 * Authenticate a user and return a signed JWT.
 * Returns null when credentials are invalid so the controller decides the response.
 */
const loginUser = async ({ email, password }) => {
  // Explicitly select password because it has select:false on the schema
  const user = await User.findOne({ email }).select('+password');

  if (!user) return null;
  if (!user.isActive) {
    const err = new Error('Your account has been deactivated. Please contact an administrator.');
    err.statusCode = 401;
    err.error = 'ACCOUNT_DISABLED';
    throw err;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return null;

  const token = signToken({ id: user._id, role: user.role });

  // Strip password before returning
  user.password = undefined;

  return { user, token };
};

module.exports = { registerUser, loginUser };
