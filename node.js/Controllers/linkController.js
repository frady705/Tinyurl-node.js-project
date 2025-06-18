const Link = require('../Models/Link');
const User = require('../Models/User');

// Create a new short link
exports.createLink = async (req, res) => {
  try {
    const { originalUrl, userId, targetParamName, targetValues } = req.body;
    const link = new Link({ originalUrl });
    if (targetParamName) link.targetParamName = targetParamName;
    if (targetValues) link.targetValues = targetValues;
    await link.save();
    // Add link to user
    if (userId) {
      await User.findByIdAndUpdate(userId, { $push: { links: link._id } });
    }
    res.status(201).json({ message: 'Link created', link });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all links
exports.getAllLinks = async (req, res) => {
  try {
    const links = await Link.find();
    res.json(links);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get link by ID
exports.getLinkById = async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link) return res.status(404).json({ message: 'Link not found' });
    res.json(link);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update link
exports.updateLink = async (req, res) => {
  try {
    const link = await Link.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!link) return res.status(404).json({ message: 'Link not found' });
    res.json({ message: 'Link updated', link });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete link
exports.deleteLink = async (req, res) => {
  try {
    const link = await Link.findByIdAndDelete(req.params.id);
    if (!link) return res.status(404).json({ message: 'Link not found' });
    // Remove link from users
    await User.updateMany({ links: link._id }, { $pull: { links: link._id } });
    res.json({ message: 'Link deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get stats for a link (clicks by target)
exports.getLinkStats = async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link) return res.status(404).json({ message: 'Link not found' });
    const stats = {};
    link.clicks.forEach(click => {
      const key = click.targetParamValue || 'unknown';
      stats[key] = (stats[key] || 0) + 1;
    });
    res.json({ totalClicks: link.clicks.length, byTarget: stats });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
