import { Link } from "react-router-dom";
import HeartIcon from "./heartIcon";

const Product = ({ product }) => {
  return (
    <div className="w-full max-w-xs mx-auto bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
      <div className="relative group overflow-hidden">
        <Link to={`/product/${product._id}`}>
          <img
            className="w-full h-64 object-cover transition-transform duration-300 ease-in-out transform group-hover:scale-105"
            src={product.image}
            alt={product.name}
          />
        </Link>
        <div className="absolute bottom-0 inset-x-0 h-14 bg-white flex justify-around items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
          <HeartIcon product={product} />
        </div>
      </div>
      <div className="p-4">
        <h2 className="text-gray-800 text-md font-semibold truncate capitalize">
          {product.brand}
        </h2>
        <p className="text-gray-600 text-sm truncate mt-1">{product.name}</p>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-lg font-bold text-gray-900">
            {product?.price?.toLocaleString("en-IN", {
              style: "currency",
              currency: "INR",
            })}
            {product?.cutPrice && (
              <span className="line-through text-gray-500 text-sm ml-2">
                {product?.cutPrice?.toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                })}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Product;
