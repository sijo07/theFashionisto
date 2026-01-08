import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "MISSING_URI";
    console.log(`Attempting connection to: ${mongoUri.substring(0, 15)}...`);
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Successfully Connected to MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    // process.exit(1); // Do not crash on Vercel to allow debugging
  }
};

export default connectDB;