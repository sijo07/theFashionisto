import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./backend/models/productModel.js";
import Category from "./backend/models/categoryModel.js";

dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const pageSize = 6;
        const count = await Product.countDocuments({});
        console.log("Product count:", count);

        const products = await Product.find({})
            .populate({
                path: "category",
                select: "name parent",
                populate: { path: "parent", select: "name" }
            })
            .limit(pageSize);

        console.log("Products fetched successfully:", products.length);
        process.exit(0);
    } catch (error) {
        console.error("Error fetching products:", error);
        process.exit(1);
    }
};

test();
