import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {
  selectFavoriteProduct,
  removeFromFavorites,
} from "../../redux/features/favorites/favoriteSlice";
import HeartIcon from "./HeartIcon";
import CartIcon from "./CartIcon";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { toast } from "react-toastify";

const Favorites = () => {
  const favorites = useSelector(selectFavoriteProduct);
  const dispatch = useDispatch();

  const addToCartHandler = (product, qty = 1) => {
    dispatch(addToCart({ ...product, qty }));
    dispatch(removeFromFavorites({ _id: product._id }));
    toast.success("Item added to cart");
  };

  return (
    <div className="bg-gray-50 py-8 min-h-screen">
      <nav className="container mx-auto px-4 text-sm text-gray-500 py-4 uppercase">
        <Link to="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:underline">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <span className="font-semibold text-gray-700">Favorites</span>
      </nav>

      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center uppercase tracking-wide">
          Your Favorites
        </h1>

        {favorites.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
            {favorites.map((product) => (
              <div
                key={product._id}
                className="w-full max-w-xs mx-auto bg-white border border-gray-200 rounded-md shadow-md overflow-hidden"
              >
                <div className="relative group overflow-hidden">
                  <Link to={`/product/${product._id}`}>
                    <img
                      className="w-full h-64 object-cover"
                      src={product.image?.url || product.image}
                      alt={product.brand}
                    />
                  </Link>
                  <div className="absolute top-[12rem] inset-0 h-20 bg-white flex justify-around opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                    <HeartIcon product={product} />
                    <CartIcon
                      product={product}
                      onClick={() => addToCartHandler(product)}
                    />
                  </div>
                </div>
                <section>
                  <div className="px-4 py-2">
                    <h2 className="text-gray-600 text-sm font-semibold truncate capitalize">
                      {product.brand}
                    </h2>
                    <div className="mt-2 flex justify-between items-center">
                      <p className="text-gray-700 text-sm font-bold flex items-center">
                        {product.price?.toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        })}
                        {product.offer && (
                          <span className="line-through text-gray-400 ml-2">
                            {product.offer?.toLocaleString("en-IN", {
                              style: "currency",
                              currency: "INR",
                            })}
                          </span>
                        )}
                      </p>
                      <p className="text-gray-500 text-sm capitalize">
                        Size: {product.size}
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-xl text-gray-500 mb-4">
              You haven’t added any products to your favorites yet.
            </p>
            <Link
              to="/shop"
              className="text-[#649899] text-sm uppercase hover:underline"
            >
              Browse products to find your favorites.
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;