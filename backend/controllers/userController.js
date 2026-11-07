import Event from '../models/Event.js';
import Registration from '../models/Registration.js';

export const getProfile = async (req, res) => {
  return res.status(200).json({
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt,
    },
  });
};

export const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id }).sort({ eventDate: 1 });
    return res.status(200).json(events.map((event) => ({
      ...event.toObject(),
      availableSeats: Math.max(event.capacity - event.registeredCount, 0),
    })));
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load your events.' });
  }
};

export const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user._id }).populate({
      path: 'event',
      populate: { path: 'organizer', select: 'name email' },
    });

    const mapped = registrations
      .filter((registration) => registration.event)
      .map((registration) => ({
        _id: registration._id,
        registrationDate: registration.registrationDate,
        event: {
          ...registration.event.toObject(),
          availableSeats: Math.max(registration.event.capacity - registration.event.registeredCount, 0),
        },
      }));

    return res.status(200).json(mapped);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load your registrations.' });
  }
};
