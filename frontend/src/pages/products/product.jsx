import { Link } from "react-router-dom";
import HeartIcon from "./HeartIcon";
import PropTypes from "prop-types";

const Product = ({ product }) => {
  return (
    <div className="group relative w-full h-80 rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 bg-white block">
      <Link to={`/product/${product._id}`} className="block w-full h-full">
        <div className="relative w-full h-full overflow-hidden">
          <img
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
            src={product.image?.url || product.image}
            alt={product.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center px-9 text-center translate-y-[40%] group-hover:translate-y-0 transition-all duration-500">
          <h2 className="text-3xl font-bold text-white uppercase mb-1">
            {product.brand}
          </h2>
          <p className="text-lg font-bold text-white mb-10">
            {product?.price?.toLocaleString("en-IN", {
              style: "currency",
              currency: "INR",
            })}
            {product?.offer && (
              <span className="line-through text-gray-300 text-sm ml-2">
                {product?.offer?.toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                })}
              </span>
            )}
          </p>

          {/* Available Sizes */}
          {product.sizes?.length > 0 && (
            <div className="flex flex-col items-center gap-1 mt-2">
              <p className="text-[10px] text-white/90 uppercase tracking-widest font-bold">Available Sizes</p>
              <div className="flex flex-wrap justify-center gap-1 max-w-[80%]">
                {product.sizes.filter(s => s.stock > 0).slice(0, 4).map((s) => (
                  <span key={s._id || s.size} className="text-[10px] font-bold text-gray-800 bg-white/90 px-1.5 py-0.5 rounded shadow-sm">
                    {s.size}
                  </span>
                ))}
                {product.sizes.filter(s => s.stock > 0).length > 4 && (
                  <span className="text-[10px] text-white font-bold ml-1">+</span>
                )}
              </div>
            </div>
          )}
        </div>
      </Link>
      <div className="absolute bottom-0 inset-x-0 h-14 bg-white flex justify-around items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
        <HeartIcon product={product} />
      </div>
    </div>
  );
};

Product.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    image: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        url: PropTypes.string,
      }),
    ]).isRequired,
    name: PropTypes.string,
    brand: PropTypes.string,
    price: PropTypes.number,
    offer: PropTypes.number,
  }).isRequired,
};

export default Product;