import Event from '../models/Event.js';

// Add event
const addEvent = async (req, res) => {
  const { date, title } = req.body;

  if (!date || !title) {
    return res.status(400).json({ msg: 'Date and title are required' });
  }

  try {
    // Store the date as is, without time component
    const event = new Event({
      date,
      title,
    });
    await event.save();

    res.status(201).json({
      id: event._id,
      title: event.title,
      date: event.date,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to add event' });
  }
};

// Get events for a specific date range
const getEvents = async (req, res) => {
  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).json({ msg: 'Start and end dates are required' });
  }

  try {
    // Find events where date falls between start and end dates
    const events = await Event.find({
      date: {
        $gte: start,
        $lte: end,
      },
    });

    // Format the response
    const formattedEvents = events.map((event) => ({
      id: event._id,
      title: event.title,
      date: event.date,
    }));

    res.status(200).json(formattedEvents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to fetch events' });
  }
};

export { addEvent, getEvents };
