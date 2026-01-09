import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("FATAL: MONGO_URI is missing in environment variables.");
      throw new Error("MONGO_URI is not defined");
    }

    const mongoUri = process.env.MONGO_URI;
    // Log masked URI for debugging
    console.log(`Attempting connection to MongoDB... (URI starts with: ${mongoUri.substring(0, 15)})`);

    const conn = await mongoose.connect(mongoUri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Log full error for debugging
    console.error("Full DB Error:", error);
    // process.exit(1); // Keep this commented out or handle gracefully based on preference
    throw error;
  }
};

export default connectDB;