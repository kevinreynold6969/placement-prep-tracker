const mongoose = require('mongoose');

/**
 * DSA_TOPICS — The fixed list of DSA topic categories.
 *
 * WHY AN ENUM:
 * Restricting topics to a fixed list ensures data consistency.
 * Without an enum, users could enter "array", "Array", "arrays",
 * "ARRAYS" — making topic-based queries and analytics unreliable.
 * The enum is enforced at the Mongoose schema level AND in the
 * validator layer, so inconsistent values are rejected before they
 * reach the database.
 */
const DSA_TOPICS = [
  'Arrays',
  'Strings',
  'Hashing',
  'Two Pointers',
  'Sliding Window',
  'Prefix Sum',
  'Binary Search',
  'Sorting',
  'Greedy',
  'Stack',
  'Queue',
  'Linked Lists',
  'Trees',
  'Binary Search Trees',
  'Heaps',
  'Graphs',
  'Backtracking',
  'Dynamic Programming',
];

const PLATFORMS = ['LeetCode', 'Codeforces', 'HackerRank', 'CodeChef', 'GeeksForGeeks', 'Other'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const STATUSES = ['not_attempted', 'attempted', 'solved', 'needs_revision'];

/**
 * Problem Model
 *
 * WHY A SEPARATE COLLECTION (not embedded in User):
 * - Embedding would cause the user document to grow unboundedly.
 * - Pagination of problems would be impossible without loading
 *   the entire user document.
 * - MongoDB has a 16MB document size limit.
 * - Separate collection with userId reference is the standard
 *   approach for one-to-many with high cardinality.
 *
 * OWNERSHIP / DATA ISOLATION:
 * The userId field is the foundation of the ownership model.
 * EVERY query that reads or modifies problems must include
 * { userId: req.user.id } in the filter. This prevents one
 * user from ever accessing another user's data.
 *
 * WHY SCHEMA-LEVEL VALIDATION:
 * Mongoose schema validation is a second line of defence after
 * express-validator. Even if a request bypasses the validator
 * (which shouldn't happen), the schema will reject invalid data.
 */
const problemSchema = new mongoose.Schema(
  {
    // --- Ownership ---
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true, // Index for fast user-scoped queries
    },

    // --- Core Problem Information ---
    title: {
      type: String,
      required: [true, 'Problem title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    platform: {
      type: String,
      required: [true, 'Platform is required'],
      enum: {
        values: PLATFORMS,
        message: 'Platform must be one of: ' + PLATFORMS.join(', '),
      },
    },
    url: {
      type: String,
      trim: true,
      default: null,
      // Validates URL format if provided; allows null/empty
      validate: {
        validator: function (v) {
          if (!v) return true; // Optional field — empty is fine
          try {
            new URL(v);
            return true;
          } catch {
            return false;
          }
        },
        message: 'Please provide a valid URL',
      },
    },

    // --- DSA Categorisation ---
    topic: {
      type: String,
      required: [true, 'DSA topic is required'],
      enum: {
        values: DSA_TOPICS,
        message: 'Invalid DSA topic',
      },
      index: true, // Index for topic-filter queries and analytics aggregations
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: {
        values: DIFFICULTIES,
        message: 'Difficulty must be Easy, Medium, or Hard',
      },
    },

    // --- Attempt Status ---
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: STATUSES,
        message: 'Status must be: not_attempted, attempted, solved, or needs_revision',
      },
      default: 'not_attempted',
      index: true, // Index for status-filter queries
    },
    dateAttempted: {
      type: Date,
      default: null,
    },

    // --- Learning Notes ---
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
      default: null,
    },
    approach: {
      type: String,
      trim: true,
      maxlength: [2000, 'Approach cannot exceed 2000 characters'],
      default: null,
    },
    timeComplexity: {
      type: String,
      trim: true,
      maxlength: [50, 'Time complexity cannot exceed 50 characters'],
      default: null,
    },
    spaceComplexity: {
      type: String,
      trim: true,
      maxlength: [50, 'Space complexity cannot exceed 50 characters'],
      default: null,
    },

    // --- Revision Tracking ---
    needsRevision: {
      type: Boolean,
      default: false,
      index: true, // Index for revision-list queries
    },
    revisedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

/**
 * Compound Indexes
 *
 * WHY COMPOUND INDEXES:
 * Most queries filter by BOTH userId AND another field (topic, status, etc.).
 * A compound index on { userId, topic } is more efficient than separate
 * single-field indexes for these multi-field queries.
 *
 * MongoDB can use the leading field (userId) of a compound index for
 * single-field queries too, so { userId, topic } also accelerates
 * queries that filter by userId alone.
 */
problemSchema.index({ userId: 1, topic: 1 });
problemSchema.index({ userId: 1, status: 1 });
problemSchema.index({ userId: 1, needsRevision: 1 });
problemSchema.index({ userId: 1, createdAt: -1 }); // For sorting by recent activity

// Expose the topic list for use in validators and frontend
problemSchema.statics.DSA_TOPICS = DSA_TOPICS;
problemSchema.statics.PLATFORMS = PLATFORMS;
problemSchema.statics.DIFFICULTIES = DIFFICULTIES;
problemSchema.statics.STATUSES = STATUSES;

const Problem = mongoose.model('Problem', problemSchema);

module.exports = Problem;
