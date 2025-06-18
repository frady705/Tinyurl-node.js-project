const Link = require('../Models/Link');
const User = require('../Models/User');

// קליקים לפי מקור
exports.getClicksBySource = async (req, res) => {
  try {
    const agg = await Link.aggregate([
      { $unwind: '$clicks' },
      { $group: {
          _id: '$source',
          clicks: { $sum: 1 }
        }
      },
      { $project: { source: '$_id', clicks: 1, _id: 0 } }
    ]);
    res.json(agg);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// סך כל הקליקים לכל לינק של משתמש
exports.getUserLinksTotalClicks = async (req, res) => {
  try {
    const userId = req.params.userId;
    const links = await Link.find({ owner: userId });
    const result = links.map(link => ({
      link: link.shortUrl || link._id,
      clicks: link.clicks.length
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// קליקים לפי יום בשבוע
exports.getClicksByDay = async (req, res) => {
  try {
    const agg = await Link.aggregate([
      { $unwind: '$clicks' },
      { $addFields: {
          day: { $dayOfWeek: '$clicks.insertedAt' }
        }
      },
      { $group: {
          _id: '$day',
          clicks: { $sum: 1 }
        }
      },
      { $project: { day: '$_id', clicks: 1, _id: 0 } },
      { $sort: { day: 1 } }
    ]);
    // המרת מספר יום לשם בעברית
    const days = ['','ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
    const result = agg.map(row => ({ day: days[row.day], clicks: row.clicks }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
