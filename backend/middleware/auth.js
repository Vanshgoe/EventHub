import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized. Missing token.' });
    }

    const token = authHeader.split(' ')[1];
    const secret =
      process.env.JWT_SECRET ||
      (process.env.NODE_ENV === 'production' ? null : 'eventhub-dev-secret');
    if (!secret) {
      return res.status(500).json({ message: 'Authentication is not configured.' });
    }

    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found for this token.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalid or expired.' });
  }
};

const authorizeEventOwner = async (req, res, next) => {
  try {
    const Event = (await import('../models/Event.js')).default;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You do not own this event.' });
    }

    req.event = event;
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Unable to verify event ownership.' });
  }
};

export { protect, authorizeEventOwner };
