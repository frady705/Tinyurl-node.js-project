const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema({
  insertedAt: { type: Date, default: Date.now },
  ipAddress: String,
  targetParamValue: String
});

const targetValueSchema = new mongoose.Schema({
  name: String,
  value: String
});

const linkSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  clicks: [clickSchema],
  targetParamName: { type: String, default: 't' },
  targetValues: [targetValueSchema]
});

module.exports = mongoose.model('Link', linkSchema);
