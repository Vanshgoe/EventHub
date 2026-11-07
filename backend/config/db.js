import mongoose from 'mongoose';

let mongoMemoryServer;

const connectDB = async () => {
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB connected successfully via MONGO_URI');
      return;
    }

    if (process.env.NODE_ENV === 'production') {
      throw new Error('MONGO_URI must be configured in production.');
    }

    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoMemoryServer = await MongoMemoryServer.create({
      replSet: { count: 1 },
    });
    const mongoUri = mongoMemoryServer.getUri();
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected using in-memory MongoDB');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
};

export { connectDB, mongoMemoryServer };
