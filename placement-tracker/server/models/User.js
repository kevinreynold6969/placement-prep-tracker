const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Model
 *
 * WHY THIS SCHEMA:
 * Stores one document per registered account. Only the minimum
 * fields needed for authentication are stored here. All user-specific
 * application data (problems) lives in a separate collection with
 * a userId reference — not embedded here.
 *
 * FIELDS:
 *   name     — Display name shown in the dashboard header
 *   email    — Login identifier; unique index enforces no duplicate accounts
 *   password — bcryptjs hash; NEVER the plaintext password
 *
 * PRE-SAVE HOOK:
 * We hash the password in a Mongoose pre-save hook rather than in the
 * controller/service. This ensures the password is always hashed
 * regardless of which code path creates or updates a User document.
 * It also centralises the hashing logic in one place.
 *
 * COMPARE PASSWORD METHOD:
 * An instance method on each User document. Called during login to
 * compare a submitted plaintext password against the stored hash.
 * bcryptjs.compare() handles the salt extraction and rehashing internally.
 *
 * SELECT: false on password:
 * By default, queries that return users will NOT include the password
 * field. We must explicitly add .select('+password') in the login query
 * where we need it. This prevents accidentally leaking the hash in API
 * responses even if someone forgets to call .select('-password').
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,  // Always stored lowercase — prevents case-sensitive duplicate accounts
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never returned in queries unless explicitly requested
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

/**
 * Pre-save hook — Hash password before saving to the database.
 *
 * In modern Mongoose (v6+), async pre-save hooks return a promise
 * rather than taking a `next` callback.
 */
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Instance method — Compare a submitted plaintext password to the hash.
 *
 * Returns true if the passwords match, false otherwise.
 * bcrypt.compare() extracts the salt from the stored hash, hashes
 * the submitted password with the same salt, and compares results.
 * No decryption happens — bcrypt hashes are one-way.
 */
userSchema.methods.comparePassword = async function (submittedPassword) {
  return await bcrypt.compare(submittedPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
