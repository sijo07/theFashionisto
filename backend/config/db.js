import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }
    const mongoUri = process.env.MONGO_URI;
    console.log(`Attempting connection to: ${mongoUri.substring(0, 15)}...`);
    const conn = await mongoose.connect(mongoUri);
    console.log(`Successfully Connected to MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.error(`DB Connection ERROR: ${error.message}`);
    throw error; // Re-throw to be caught by middleware
  }
};

export default connectDB;