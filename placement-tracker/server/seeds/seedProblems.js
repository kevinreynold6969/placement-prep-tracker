/**
 * Seed Script — Test Data Only
 *
 * PURPOSE:
 * This script populates the database with sample problem records for
 * development and testing. It is NOT part of the application and should
 * NEVER run automatically on user accounts.
 *
 * USAGE:
 *   node seeds/seedProblems.js <userId>
 *
 * IMPORTANT:
 * - This data is clearly labelled as test data.
 * - It is never inserted automatically.
 * - It is never presented in the UI as real user activity.
 * - Run only in development to populate a test account.
 *
 * To create a test user first, register through the app,
 * then copy the user ID from MongoDB Atlas and pass it here.
 */
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Problem = require('../models/Problem');

const TEST_PROBLEMS = [
  {
    title: 'Two Sum',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/two-sum/',
    topic: 'Hashing',
    difficulty: 'Easy',
    status: 'solved',
    dateAttempted: new Date('2026-11-01'),
    notes: 'Classic hash map problem. Solved in first attempt.',
    approach: 'Store target-current in a hash map. For each element, check if it exists in the map.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    needsRevision: false,
  },
  {
    title: 'Best Time to Buy and Sell Stock',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
    topic: 'Arrays',
    difficulty: 'Easy',
    status: 'solved',
    dateAttempted: new Date('2026-11-02'),
    notes: 'Track minimum price seen so far, calculate profit at each step.',
    approach: 'Single pass. Keep min_price and max_profit variables.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    needsRevision: false,
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    topic: 'Sliding Window',
    difficulty: 'Medium',
    status: 'solved',
    dateAttempted: new Date('2026-11-03'),
    notes: 'Sliding window with a hash set.',
    approach: 'Two pointers. Expand right, shrink left when duplicate found.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(min(n, alphabet))',
    needsRevision: true,
  },
  {
    title: 'Binary Search',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/binary-search/',
    topic: 'Binary Search',
    difficulty: 'Easy',
    status: 'solved',
    dateAttempted: new Date('2026-11-04'),
    notes: 'Basic binary search template.',
    approach: 'while (lo <= hi): mid = lo + (hi - lo) / 2',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    needsRevision: false,
  },
  {
    title: 'Number of Islands',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/number-of-islands/',
    topic: 'Graphs',
    difficulty: 'Medium',
    status: 'attempted',
    dateAttempted: new Date('2026-11-05'),
    notes: 'BFS/DFS grid traversal. Got TLE on first attempt due to not marking visited.',
    approach: 'DFS from each unvisited land cell. Mark cells as visited.',
    timeComplexity: 'O(m*n)',
    spaceComplexity: 'O(m*n)',
    needsRevision: true,
  },
  {
    title: 'Coin Change',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/coin-change/',
    topic: 'Dynamic Programming',
    difficulty: 'Medium',
    status: 'needs_revision',
    dateAttempted: new Date('2026-11-06'),
    notes: 'Classic DP. Need to review the bottom-up tabulation approach.',
    approach: 'dp[i] = min coins to make amount i. dp[0] = 0.',
    timeComplexity: 'O(amount * coins)',
    spaceComplexity: 'O(amount)',
    needsRevision: true,
  },
  {
    title: 'Valid Parentheses',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/valid-parentheses/',
    topic: 'Stack',
    difficulty: 'Easy',
    status: 'solved',
    dateAttempted: new Date('2026-11-07'),
    notes: 'Stack. Push open brackets, pop and check on close brackets.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    needsRevision: false,
  },
  {
    title: 'Merge Two Sorted Lists',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/merge-two-sorted-lists/',
    topic: 'Linked Lists',
    difficulty: 'Easy',
    status: 'solved',
    dateAttempted: new Date('2026-11-08'),
    notes: 'Dummy head node technique.',
    approach: 'Use a dummy head. Advance through both lists picking the smaller.',
    timeComplexity: 'O(n+m)',
    spaceComplexity: 'O(1)',
    needsRevision: false,
  },
  {
    title: 'Climbing Stairs',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/climbing-stairs/',
    topic: 'Dynamic Programming',
    difficulty: 'Easy',
    status: 'solved',
    dateAttempted: new Date('2026-11-09'),
    notes: 'Fibonacci sequence variant.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    needsRevision: false,
  },
  {
    title: 'Maximum Subarray',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/maximum-subarray/',
    topic: 'Arrays',
    difficulty: 'Medium',
    status: 'solved',
    dateAttempted: new Date('2026-11-10'),
    notes: "Kadane's algorithm.",
    approach: 'Track currentSum and maxSum. Reset currentSum to 0 if it goes negative.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    needsRevision: false,
  },
];

const seed = async () => {
  const userId = process.argv[2];

  if (!userId) {
    console.error('❌ Please provide a user ID: node seeds/seedProblems.js <userId>');
    process.exit(1);
  }

  if (!mongoose.isValidObjectId(userId)) {
    console.error('❌ Invalid user ID format');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing problems for this user to avoid duplicates
    const deleted = await Problem.deleteMany({ userId });
    console.log(`🗑  Removed ${deleted.deletedCount} existing test problems`);

    // Insert test problems
    const problems = TEST_PROBLEMS.map((p) => ({ ...p, userId }));
    const inserted = await Problem.insertMany(problems);
    console.log(`✅ Inserted ${inserted.length} test problems for user ${userId}`);

    console.log('\n⚠️  REMINDER: This is test data only. Remove before demonstrating the app.');
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seed();
