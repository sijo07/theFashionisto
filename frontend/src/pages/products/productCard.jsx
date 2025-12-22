import { Link } from "react-router-dom";
import HeartIcon from "./HeartIcon";
import CartIcon from "./CartIcon";
import PropTypes from "prop-types";

const ProductCard = ({ p }) => {
  return (
    <div className="w-64 max-w-xs mx-auto bg-white border border-gray-200 rounded-md shadow-md overflow-hidden">
      <div className="relative group overflow-hidden">
        <Link to={`/product/${p._id}`}>
          <img
            className="w-full h-64 object-cover"
            src={p.image?.url || p.image}
            alt={p.name}
          />
        </Link>
        <div className="absolute top-[12rem] inset-0 h-20 bg-white flex justify-around opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
          <HeartIcon product={p} />
          <CartIcon product={p} />
        </div>
      </div>
      <section>
        <div className="px-4 py-2">
          <h2 className="text-gray-600 text-sm font-semibold truncate capitalize">
            {p.brand}
          </h2>
          <p className="text-gray-500 text-xs truncate capitalize">
            {p.description}
          </p>

          <div className="mt-2 flex justify-between items-center">
            <p className="text-gray-700 text-sm font-bold flex items-center">
              {p?.price?.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
              })}
              {p?.offer && (
                <span className="line-through text-gray-400 ml-2">
                  {p?.offer?.toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                  })}
                </span>
              )}
            </p>
            <p className="text-gray-500 text-sm capitalize">Size: {p.size}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

ProductCard.propTypes = {
  p: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    image: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        url: PropTypes.string,
      }),
    ]).isRequired,
    name: PropTypes.string,
    brand: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.number,
    offer: PropTypes.number,
    size: PropTypes.string,
  }).isRequired,
};

export default ProductCard;