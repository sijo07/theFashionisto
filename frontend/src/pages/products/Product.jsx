import { Link } from "react-router-dom";
import HeartIcon from "./heartIcon";

const Product = ({ product }) => {
  return (
    <>
      <div>
        <div key={product._id} className="bg-white shadow-md">
          <div className="relative px-4 py-3">
            <Link to={`/product/${product._id}`}>
              <img
                className="w-[20rem] h-[20rem] object-cover"
                src={product.image}
                alt={product.brand}
              />
            </Link>
            <HeartIcon product={product} />
          </div>
          <div className="flex justify-between px-4 py-1">
            <h2 className="text-gray-400 font-semibold text-start uppercase text-sm">
              {product.brand}
            </h2>
            <p className="text-xs font-bold text-gray-600">
              &#8377;&nbsp;{product.price}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Product;
