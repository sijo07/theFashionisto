import { Link } from "react-router-dom";

const Capsule = ({ product }) => {
  return (
    <div className="flex text-center">
      <Link to={`/product/${product._id}`}>
        <div className="relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-[5rem] h-[5rem] object-cover rounded-full"
          />
          <h2 className="text-[#649899] font-semibold capitalize text-sm mt-1">
            {product.brand}
          </h2>
        </div>
      </Link>
    </div>
  );
};

export default Capsule;
