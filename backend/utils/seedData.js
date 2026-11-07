import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import User from '../models/User.js';
import Event from '../models/Event.js';

const eventData = [
  {
    title: 'Tech Pulse 2026',
    shortDescription: 'A day of product demos, AI lightning talks, and startup networking.',
    description: 'Tech Pulse 2026 brings together engineers, founders, and designers for a full day of product storytelling, hands-on demos, and founder conversations around the future of AI and software.',
    eventDate: '2026-12-11',
    eventTime: '09:30 AM',
    location: 'Bengaluru',
    category: 'Technology',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    capacity: 220,
  },
  {
    title: 'Sunset Live Sessions',
    shortDescription: 'An intimate acoustic performance growing into a vibrant community night.',
    description: 'Enjoy a curated live set featuring indie artists, local creators, and collaborative jam sessions in a relaxed rooftop environment designed for connection and discovery.',
    eventDate: '2026-12-15',
    eventTime: '06:00 PM',
    location: 'Mumbai',
    category: 'Music',
    imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
    capacity: 180,
  },
  {
    title: 'Product Design Sprint',
    shortDescription: 'A workshop for turning rough product ideas into polished experiences.',
    description: 'This workshop covers design systems, user flows, prototyping, and rapid validation strategies to help teams bring stronger product experiences to market.',
    eventDate: '2026-12-08',
    eventTime: '10:00 AM',
    location: 'Delhi',
    category: 'Workshops',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    capacity: 120,
  },
  {
    title: 'Future of Learning Summit',
    shortDescription: 'A summit on learning design, edtech, and the next wave of digital education.',
    description: 'Join educators, policy thinkers, and founders for a practical conversation on reinventing classroom experiences and equitable digital access.',
    eventDate: '2026-12-19',
    eventTime: '11:00 AM',
    location: 'Hyderabad',
    category: 'Education',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    capacity: 200,
  },
  {
    title: 'City Run Challenge',
    shortDescription: 'A healthy, social running event built for beginners and seasoned runners alike.',
    description: 'Take part in a timed 5K run through the city, supported by guided stretching, hydration stops, and a community finish zone.',
    eventDate: '2026-12-21',
    eventTime: '07:00 AM',
    location: 'Pune',
    category: 'Sports',
    imageUrl: 'https://images.unsplash.com/photo-1541534401786-2077eed87a74?auto=format&fit=crop&w=1200&q=80',
    capacity: 300,
  },
  {
    title: 'Heritage Nights',
    shortDescription: 'A cultural evening featuring folk performances, local art, and artisan displays.',
    description: 'Heritage Nights celebrates regional music, visual storytelling, and craft traditions through an immersive evening designed around community storytelling.',
    eventDate: '2026-12-27',
    eventTime: '05:30 PM',
    location: 'Jaipur',
    category: 'Cultural Events',
    imageUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80',
    capacity: 160,
  },
  {
    title: 'AI Builders Meetup',
    shortDescription: 'A casual meetup for engineers learning, shipping, and discussing AI products.',
    description: 'Meet other builders working on AI products, discuss deployment challenges, and hear short talks on shipping AI in production environments.',
    eventDate: '2026-12-13',
    eventTime: '06:30 PM',
    location: 'Bengaluru',
    category: 'Technology',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    capacity: 150,
  },
  {
    title: 'Art & Coffee Social',
    shortDescription: 'A creative community session blending sketching, coffee, and conversation.',
    description: 'A relaxed and thoughtful gathering for artists, writers, and curious creatives with live sketches, short prompts, and informal conversation.',
    eventDate: '2026-12-17',
    eventTime: '04:00 PM',
    location: 'Kolkata',
    category: 'Cultural Events',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
    capacity: 90,
  },
  {
    title: 'Startup Story Circle',
    shortDescription: 'Founder stories, peer feedback, and honest lessons from building early-stage teams.',
    description: 'Hear from founders sharing what worked, what failed, and what they learned during early traction, product iterations, and team building.',
    eventDate: '2026-12-22',
    eventTime: '07:30 PM',
    location: 'Chennai',
    category: 'Technology',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    capacity: 180,
  },
  {
    title: 'Weekend Wellness Lab',
    shortDescription: 'A guided event about breathing, movement, and small daily routines that help you reset.',
    description: 'Explore practical wellness habits with guided sessions, mindful movement, and expert-led conversations focused on sustainable energy and mental clarity.',
    eventDate: '2026-12-28',
    eventTime: '08:30 AM',
    location: 'Goa',
    category: 'Workshops',
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
    capacity: 130,
  },
];

const seedSampleEvents = async () => {
  try {
    const existingEvents = await Event.countDocuments();
    if (existingEvents > 0) return;

    const ownerEmail =
      process.env.NODE_ENV === 'production'
        ? 'sample-host@eventhub.invalid'
        : 'demo@eventhub.com';
    let owner = await User.findOne({ email: ownerEmail });
    if (!owner) {
      const password =
        process.env.NODE_ENV === 'production'
          ? randomBytes(32).toString('hex')
          : 'demo123';
      const hashedPassword = await bcrypt.hash(password, 10);
      owner = await User.create({
        name: 'EventHub Demo Host',
        email: ownerEmail,
        password: hashedPassword,
      });
    }

    const events = eventData.map((event) => ({
      ...event,
      organizer: owner._id,
      registeredCount: 0,
    }));

    await Event.insertMany(events);
    console.log('Seeded sample events successfully.');
  } catch (error) {
    console.error('Sample event seeding failed:', error.message);
  }
};

export default seedSampleEvents;
