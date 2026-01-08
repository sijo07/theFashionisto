import { Link } from "react-router-dom";
import HeartIcon from "./HeartIcon";
import PropTypes from "prop-types";
import { FaShoppingCart, FaPlus } from "react-icons/fa";

const Product = ({ product }) => {
  return (
    <div className="group relative bg-zinc-900 border border-zinc-800 hover:border-red-600/50 transition-colors duration-300">
      {/* Image Container */}
      <Link to={`/product/${product._id}`} className="block relative aspect-[3/4] overflow-hidden">
        <img
          src={product.image?.url || product.image}
          alt={product.name}
          className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
        />

        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
          {/* We can add quick actions here if desired, keeping it clean for now */}
        </div>

        {/* Heart Icon (Top Right) */}
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-black text-white p-2 rounded-sm hover:text-red-500 transition-colors">
            <HeartIcon product={product} />
          </div>
        </div>

        {/* Stock Label */}
        {product?.countInStock === 0 && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black uppercase px-2 py-1 tracking-widest">
            Sold Out
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest block mb-1">{product.brand}</span>
            <Link to={`/product/${product._id}`}>
              <h3 className="text-sm font-bold text-white uppercase leading-tight line-clamp-2 hover:text-zinc-300 transition-colors">
                {product.name}
              </h3>
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 border-t border-zinc-800 pt-3">
          <div className="flex flex-col">
            {product.offer && product.offer < product.price ? (
              <>
                <span className="text-xs text-zinc-500 line-through">₹{product.price}</span>
                <span className="text-lg font-bold text-white">₹{product.offer}</span>
              </>
            ) : (
              <span className="text-lg font-bold text-white">₹{product.price}</span>
            )}
          </div>

          <Link to={`/product/${product._id}`} className="w-8 h-8 flex items-center justify-center bg-white text-black hover:bg-red-600 hover:text-white transition-colors rounded-sm">
            <FaPlus size={10} />
          </Link>
        </div>
      </div>
    </div>
  );
};

Product.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    image: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    name: PropTypes.string,
    brand: PropTypes.string,
    price: PropTypes.number,
    offer: PropTypes.number,
    countInStock: PropTypes.number,
  }).isRequired,
};

export default Product;