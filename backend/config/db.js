import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`Successfully Connected to MongoDB`);
  } catch (error) {
    console.Console(`ERROR:${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
