require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const userRoutes = require('./Routes/userRoutes');
const linkRoutes = require('./Routes/linkRoutes');
const analyticsRoutes = require('./Routes/analyticsRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Routers
app.use('/api/users', userRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/analytics', analyticsRoutes);

// Redirect Endpoint (TinyUrl style)
const Link = require('./Models/Link');
app.get('/:id', async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link) return res.status(404).json({ message: 'Link not found' });
    // Tracking click
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const targetValue = req.query[link.targetParamName] || '';
    link.clicks.push({
      insertedAt: new Date(),
      ipAddress: ip,
      targetParamValue: targetValue
    });
    await link.save();
    // Redirect
    res.redirect(link.originalUrl);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// MongoDB connect & start server
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI;
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
