import mongoose from 'mongoose';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';

const formatEvent = (event) => {
  if (!event) return null;

  const plain = event.toObject ? event.toObject() : event;
  return {
    ...plain,
    availableSeats: Math.max(plain.capacity - plain.registeredCount, 0),
    organizerName: plain.organizer && typeof plain.organizer === 'object' ? plain.organizer.name : undefined,
  };
};

const validateEventPayload = (payload) => {
  const required = [
    'title',
    'shortDescription',
    'description',
    'eventDate',
    'eventTime',
    'location',
    'category',
    'imageUrl',
    'capacity',
  ];

  for (const field of required) {
    if (!payload[field] && payload[field] !== 0) {
      return `${field} is required.`;
    }
  }

  if (Number(payload.capacity) <= 0) {
    return 'Capacity must be greater than zero.';
  }

  const eventDate = new Date(payload.eventDate);
  if (Number.isNaN(eventDate.getTime())) {
    return 'Event date is invalid.';
  }

  if (eventDate < new Date(new Date().setHours(0, 0, 0, 0))) {
    return 'Past events cannot be created.';
  }

  try {
    new URL(payload.imageUrl);
  } catch {
    return 'Image URL must be valid.';
  }

  return null;
};

export const listEvents = async (req, res) => {
  try {
    const { keyword, category } = req.query;
    const searchQuery = {};

    if (keyword) {
      searchQuery.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { location: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      searchQuery.category = category;
    }

    const events = await Event.find(searchQuery)
      .populate('organizer', 'name email')
      .sort({ eventDate: 1 });

    return res.status(200).json(events.map(formatEvent));
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load events.' });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    return res.status(200).json(formatEvent(event));
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch event details.' });
  }
};

export const createEvent = async (req, res) => {
  try {
    const payload = req.body;
    const validationMessage = validateEventPayload(payload);

    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    const event = await Event.create({
      ...payload,
      organizer: req.user._id,
      registeredCount: 0,
    });

    const populatedEvent = await Event.findById(event._id).populate('organizer', 'name email');
    return res.status(201).json(formatEvent(populatedEvent));
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create event.' });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const payload = req.body;
    const validationMessage = validateEventPayload(payload);

    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own events.' });
    }

    Object.assign(event, payload);
    await event.save();

    const updatedEvent = await Event.findById(event._id).populate('organizer', 'name email');
    return res.status(200).json(formatEvent(updatedEvent));
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update event.' });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own events.' });
    }

    await Registration.deleteMany({ event: event._id });
    await event.deleteOne();

    return res.status(200).json({ message: 'Event deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete event.' });
  }
};

export const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (new Date(event.eventDate) < new Date()) {
      return res.status(400).json({ message: 'This event has already ended.' });
    }

    const alreadyRegistered = await Registration.findOne({ user: req.user._id, event: event._id });
    if (alreadyRegistered) {
      return res.status(400).json({ message: 'You have already registered for this event.' });
    }

    if (event.capacity - event.registeredCount <= 0) {
      return res.status(400).json({ message: 'This event is already full.' });
    }

    try {
      const session = await mongoose.startSession();
      await session.withTransaction(async () => {
        const currentEvent = await Event.findById(req.params.id).session(session);
        const existing = await Registration.findOne({ user: req.user._id, event: currentEvent._id }).session(session);

        if (existing) {
          throw new Error('ALREADY_REGISTERED');
        }

        if (currentEvent.capacity - currentEvent.registeredCount <= 0) {
          throw new Error('EVENT_FULL');
        }

        await Registration.create([{ user: req.user._id, event: currentEvent._id, registrationDate: new Date() }], { session });
        currentEvent.registeredCount += 1;
        await currentEvent.save({ session });
      });
    } catch (transactionError) {
      if (transactionError.code === 20 || transactionError.name === 'MongoServerError') {
        const existingFallback = await Registration.findOne({ user: req.user._id, event: event._id });
        if (existingFallback) {
          return res.status(400).json({ message: 'You have already registered for this event.' });
        }

        if (event.capacity - event.registeredCount <= 0) {
          return res.status(400).json({ message: 'This event is already full.' });
        }

        await Registration.create({ user: req.user._id, event: event._id, registrationDate: new Date() });
        event.registeredCount += 1;
        await event.save();
      } else {
        throw transactionError;
      }
    }

    return res.status(201).json({ message: 'Registration successful.' });
  } catch (error) {
    if (error.message === 'ALREADY_REGISTERED') {
      return res.status(400).json({ message: 'You have already registered for this event.' });
    }
    if (error.message === 'EVENT_FULL') {
      return res.status(400).json({ message: 'This event is already full.' });
    }
    return res.status(500).json({ message: 'Unable to complete registration.' });
  }
};
