import mongoose from "mongoose";

let gridfsBucket;

const initGridFS = () => {
  if (gridfsBucket) return gridfsBucket; // Already initialized

  const db = mongoose.connection.db;
  if (!db) {
    // console.warn("GridFS: DB not ready yet");
    return;
  }

  gridfsBucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: "uploads",
  });
  console.log("GridFS (Native) initialized successfully");
  return gridfsBucket;
};

const getGridFSBucket = () => {
  if (!gridfsBucket) {
    const bucket = initGridFS();
    if (!bucket) {
      throw new Error("GridFS Bucket not initialized. database not ready?");
    }
    return bucket;
  }
  return gridfsBucket;
}

export { initGridFS, getGridFSBucket };