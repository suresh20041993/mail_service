const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  to: String,
  subject: String,
  message: String,
  name: String,
  email: String,
  phone: String,
  company: String,
  serviceType: String,
  status: { type: String, enum: ['success', 'fail'] },
  response: String,
  error: String,
  sentAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('email_delivery_status', emailLogSchema);
