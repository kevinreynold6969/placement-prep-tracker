const mongoose = require('mongoose');

/**
 * connectDB — Establishes the Mongoose connection to MongoDB Atlas.
 *
 * The caller awaits this connection before opening the HTTP listener.
 * Errors are allowed to propagate so startup can fail clearly without
 * leaving an API process running without its database.
 *
 * MONGOOSE OPTIONS:
 * No extra options needed for Mongoose 7+ — the deprecated options
 * (useNewUrlParser, useUnifiedTopology) have been removed.
 */
const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  return conn;
};

module.exports = connectDB;
