import Counter from "../models/counterModel.js";

export const generateId = async (prefix, sequenceName) => {
    try {
        const counter = await Counter.findByIdAndUpdate(
            sequenceName,
            { $inc: { seq: 1 } },
            { new: true, upsert: true } // Create if not exists
        );

        const seqStr = counter.seq.toString().padStart(2, "0"); // 01, 02...
        return `${prefix}${seqStr}`; // FSU01
    } catch (error) {
        throw new Error(`ID Generation Failed for ${sequenceName}: ${error.message}`);
    }
};
