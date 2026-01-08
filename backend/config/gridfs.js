import mongoose from "mongoose";

let gridfsBucket;

const initGridFS = () => {
  const init = () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads",
    });
    console.log("GridFS (Native) initialized successfully");
  };

  if (mongoose.connection.readyState === 1) {
    init();
  } else {
    mongoose.connection.once("open", init);
  }
};

export { gridfsBucket, initGridFS };