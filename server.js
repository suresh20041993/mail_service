require('dotenv').config();
const express = require('express');
const cors = require('cors'); // ✅ ADD THIS
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const EmailLog = require('./models/EmailLog');

const app = express();

// ✅ Enable CORS for your frontend
app.use(cors({
  origin: '*', // Allow all domains
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

console.log('🚀 Starting Mail Service...');

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// ✅ SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ✅ Send Mail API
app.post('/send-mail', async (req, res) => {
  const { to, subject, message, name, email, phone, company, serviceType } = req.body;

  try {
    await transporter.sendMail({
      from: `"Mailer Service" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: message,
    });

    // ✅ Log success to DB
    await EmailLog.create({
      to,
      subject,
      message,
      name,
      email,
      phone,
      company,
      serviceType,
      status: 'success',
      response: 'Email sent successfully'
    });

    res.json({ success: true, message: 'Email sent & logged successfully' });
  } catch (err) {
    console.error('❌ Email Error:', err);

    // ✅ Log failure to DB
    await EmailLog.create({
      to,
      subject,
      message,
      name,
      email,
      phone,
      company,
      serviceType,
      status: 'fail',
      error: err.message,
    });

    res.status(500).json({ success: false, error: 'Email failed to send' });
  }
});

// ✅ Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;
