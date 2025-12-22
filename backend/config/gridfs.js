import mongoose from "mongoose";
import Grid from "gridfs-stream";

let gfs;
let gridfsBucket;

const initGridFS = () => {
  mongoose.connection.once("open", () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads",
    });

    gfs = Grid(mongoose.connection.db, mongoose.mongo);
    gfs.collection("uploads");
  });
};

export { gfs, gridfsBucket, initGridFS };