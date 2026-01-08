import mongoose from "mongoose";
import Grid from "gridfs-stream";

let gfs;
let gridfsBucket;

const initGridFS = () => {
  const init = () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads",
    });

    gfs = Grid(mongoose.connection.db, mongoose.mongo);
    gfs.collection("uploads");
    console.log("GridFS initialized successfully");
  };

  if (mongoose.connection.readyState === 1) {
    init();
  } else {
    mongoose.connection.once("open", init);
  }
};

export { gfs, gridfsBucket, initGridFS };