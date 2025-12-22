import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Successfully Connected to MongoDB`);
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    process.exit(1);
  }
};

export default connectDB;