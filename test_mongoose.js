
import mongoose from "mongoose";

console.log("Mongoose Version:", mongoose.version);
try {
    const p = mongoose.connection.asPromise();
    console.log("asPromise exists and returned:", p);
    p.catch(err => console.log("Promise rejected (expected):", err.message));
} catch (e) {
    console.error("Error accessing asPromise:", e.message);
}
