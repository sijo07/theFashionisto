import { Link } from "react-router-dom";
import { FaStarHalf } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { removeFromFavorites } from "../../redux/features/favorites/favoriteSlice";
import { toast } from "react-toastify";
import HeartIcon from "./HeartIcon";
import CartIcon from "./CartIcon";

const ProductCard = ({ p }) => {
  const dispatch = useDispatch();

  const addToCartHandler = (product, qty = 1) => {
    dispatch(addToCart({ ...product, qty }));
    dispatch(removeFromFavorites({ _id: product._id }));
    toast.success("Item added to cart");
  };

  return (
    <div className="w-full max-w-xs mx-auto bg-white border border-gray-200 rounded-md shadow-md overflow-hidden">
      <div className="relative group overflow-hidden">
        <Link to={`/product/${p._id}`}>
          <img
            className="w-full h-64 object-cover"
            src={p.image}
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
              {p?.cutPrice && (
                <span className="line-through text-gray-400 ml-2">
                  {p?.cutPrice?.toLocaleString("en-IN", {
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

export default ProductCard;
