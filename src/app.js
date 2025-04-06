const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const emailRoutes = require('./routes/emailRoutes');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;