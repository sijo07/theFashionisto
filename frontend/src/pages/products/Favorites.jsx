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
      {/* Breadcrumb Navigation */}
      <nav className="container mx-auto px-4 text-sm text-gray-500 py-4">
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
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <div className="relative group">
                  <Link to={`/product/${product.id}`}>
                    <img
                      className="w-full h-48 object-cover transition-transform duration-300 ease-in-out transform group-hover:scale-105"
                      src={product.image}
                      alt={product.name}
                    />
                  </Link>
                  <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <HeartIcon product={product} />
                    <CartIcon
                      product={product}
                      onClick={() => addToCartHandler(product)}
                    />
                  </div>
                </div>
                <div className="p-4">
                  <h2 className="text-gray-900 font-semibold text-lg truncate">
                    {product.name}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1 truncate capitalize">
                    {product.brand}
                  </p>
                  <div className="mt-4 flex justify-between items-center">
                    <p className="text-gray-900 font-bold text-lg">
                      {product.price?.toLocaleString("en-IN", {
                        style: "currency",
                        currency: "INR",
                      })}
                    </p>
                    {product.cutPrice && (
                      <p className="text-gray-400 text-sm line-through">
                        {product.cutPrice?.toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        })}
                      </p>
                    )}
                  </div>
                </div>
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
