"use strict";
exports.DATABASE_URL =
  process.env.DATABASE_URL || "mongodb://localhost/mongoose-blog-challenge";
exports.TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL || "mongodb://localhost/test-mongoose-blog-challenge";
exports.PORT = process.env.PORT || 8080;