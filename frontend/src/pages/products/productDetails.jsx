import { useState, useRef, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
  useGetFilteredProductsQuery,
} from "../../redux/api/productApiSlice";
import {
  addFavoriteToLocalStorage,
  getFavoritesFromLocalStorage,
  removeFavoriteFromLocalStorage,
} from "../../utils/localStorage";
import Loader from "../../components/loader";
import Message from "../../components/message";
import ProductTabs from "./ProductTabs";
import { addToCart, removeFromCart } from "../../redux/features/cart/cartSlice";
import {
  addToFavorites,
  removeFromFavorites,
  setFavorites,
} from "../../redux/features/favorites/favoriteSlice";

const ProductDetails = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const productRef = useRef(null);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isHoveringCart, setIsHoveringCart] = useState(false);
  const [isHoveringFavorites, setIsHoveringFavorites] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");

  const {
    data: product,
    isLoading,
    error,
    refetch,
  } = useGetProductDetailsQuery(productId);

  const { userInfo } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const favorites = useSelector((state) => state.favorites) || [];

  const [createReview, { isLoading: loadingProductReview }] =
    useCreateReviewMutation();

  const { data: similarProductsData } = useGetFilteredProductsQuery({
    checked: product?.category ? [product.category] : [],
    radio: [],
  }, {
    skip: !product?.category, // Skip if category not yet loaded
  });

  const similarProducts = similarProductsData?.filter(p => p._id !== productId).slice(0, 4) || [];

  const isProductInCart = cartItems.some(
    (item) => item._id === productId && item.size === selectedSize
  );
  const isFavorite = favorites.some((p) => p._id === product?._id);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (hasReviewed) {
      toast.info("You have already submitted a review for this product.");
      return;
    }

    try {
      await createReview({ productId, rating, comment }).unwrap();
      refetch();
      setHasReviewed(true);
      toast.success("Review created successfully");
    } catch (error) {
      toast.error(error?.data?.message || error.message);
    }
  };

  const toggleCart = () => {
    if (isProductInCart) {
      if (!selectedSize) {
        toast.error("Please select a size to remove");
        return;
      }
      dispatch(removeFromCart({ _id: product._id, size: selectedSize }));
      toast.success("Product removed from bag");
    } else {
      if (product.sizes?.length > 0 && !selectedSize) {
        toast.error("Please select a size");
        return;
      }
      dispatch(addToCart({ ...product, qty: 1, size: selectedSize }));
      if (isFavorite) {
        dispatch(removeFromFavorites(product));
        removeFavoriteFromLocalStorage(product._id);
      }
      navigate("/cart");
      toast.success("Product added to bag");
    }
  };

  const toggleFavorites = () => {
    if (isFavorite) {
      dispatch(removeFromFavorites(product));
      removeFavoriteFromLocalStorage(product._id);
    } else {
      dispatch(addToFavorites(product));
      addFavoriteToLocalStorage(product);
    }
  };

  useEffect(() => {
    const favoritesFromLocalStorage = getFavoritesFromLocalStorage();
    dispatch(setFavorites(favoritesFromLocalStorage));
  }, [dispatch]);

  useEffect(() => {
    if (location.state?.scrollToProduct) {
      productRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.state]);

  useEffect(() => {
    if (userInfo) {
      const userReview = product?.reviews?.find(
        (review) => review.user === userInfo._id
      );
      if (userReview) {
        setHasReviewed(true);
      }
    }
  }, [product?.reviews, userInfo]);

  // Pre-select size if item is already in cart
  useEffect(() => {
    if (!selectedSize && product && cartItems) {
      const cartItem = cartItems.find((item) => item._id === product._id);
      if (cartItem && cartItem.size) {
        setSelectedSize(cartItem.size);
      }
    }
  }, [product, cartItems, selectedSize]);

  if (isLoading) return <Loader />;
  if (error)
    return (
      <Message variant="danger">
        {error?.data?.message || error.message}
      </Message>
    );
  if (!product) return <Message variant="danger">Product not found</Message>;

  return (
    <>
      <div ref={productRef} className="mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-sm text-gray-500 py-4">
          <Link
            to="/"
            className="hover:underline uppercase hover:font-semibold"
          >
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link
            to="/shop"
            className="hover:underline uppercase hover:font-semibold"
          >
            Shop
          </Link>
          <span className="mx-2">/</span>
          <Link
            to={`/product/${product.brand}`}
            className="underline uppercase font-bold"
          >
            {product.brand}
          </Link>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="relative">
            <img
              src={product.image.url || product.image}
              alt={product.brand}
              className="w-[25rem] h-[35rem] object-cover"
            />
          </div>

          <div className="flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-4 uppercase">
              {product.brand}
            </h2>
            <p className="text-gray-600 mb-4 capitalize">
              {product.description}
            </p>
            {product.productId && (
              <p className="text-xs text-gray-400 font-mono mb-4">
                ID: {product.productId}
              </p>
            )}
            <div className="flex space-x-4 mb-2">
              <span className="text-xl text-teal-900 font-bold">
                &#8377;{product.price}
              </span>
              <span className="text-gray-500 line-through text-xl">
                &#8377;{product.offer}
              </span>
            </div>
            <span className="text-[#649899] font-semibold">
              inclusive of all taxes
            </span>

            {/* Ratings and reviews */}
            <div className="flex items-center mt-4 w-[12rem] h-10 p-2 border-2 border-gray-200 hover:border-gray-400">
              <div className="flex items-center">{`${product.rating} Ratings`}</div>
              <span className="ml-2 text-gray-600">
                | {`${product.numReviews} Reviews`}
              </span>
            </div>

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Select Size</h3>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((sizeObj) => (
                    <button
                      key={sizeObj.size || sizeObj}
                      onClick={() => sizeObj.stock > 0 && setSelectedSize(sizeObj.size || sizeObj)}
                      disabled={sizeObj.stock === 0}
                      className={`
                        min-w-[3rem] px-3 py-2 border rounded-md text-sm font-bold transition-all
                        ${selectedSize === (sizeObj.size || sizeObj)
                          ? "bg-black text-white border-black"
                          : sizeObj.stock === 0
                            ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed decoration-slice line-through"
                            : "bg-white text-gray-700 border-gray-300 hover:border-black hover:text-black"
                        }
                      `}
                    >
                      {sizeObj.size || sizeObj}
                    </button>
                  ))}
                </div>
                {selectedSize && (
                  <p className="mt-2 text-xs text-green-600 font-medium">
                    {product.sizes.find(s => s.size === selectedSize)?.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </p>
                )}
              </div>
            )}

            <div className="my-5 btn-container flex space-x-2">
              <button
                onClick={toggleCart}
                onMouseEnter={() => setIsHoveringCart(true)}
                onMouseLeave={() => setIsHoveringCart(false)}
                className={`w-[10rem] py-3 px-6 rounded-md cursor-pointer ${isProductInCart
                  ? isHoveringCart
                    ? "bg-[#D70040] text-white"
                    : "bg-[#4caf65] text-white hover:bg-[#649899]"
                  : "bg-[#649899] text-white hover:bg-[#4caf65]"
                  }`}
              >
                {isProductInCart
                  ? isHoveringCart
                    ? "Remove"
                    : "Packed"
                  : "Add to bag"}
              </button>

              <button
                onClick={toggleFavorites}
                onMouseEnter={() => setIsHoveringFavorites(true)}
                onMouseLeave={() => setIsHoveringFavorites(false)}
                className={`w-[10rem] py-3 px-6 rounded-md cursor-pointer ${isFavorite
                  ? isHoveringFavorites
                    ? "bg-[#D70040] text-white"
                    : "bg-[#D70040] text-white hover:bg-[#649899]"
                  : "bg-[#649899] text-white hover:bg-[#D70040]"
                  }`}
              >
                {isFavorite
                  ? isHoveringFavorites
                    ? "Remove"
                    : "Liked"
                  : "Add to Liked"}
              </button>
            </div>
          </div>
        </section>

        <section className="mt-10 flex justify-center items-center">
          <div className="w-full h-[15rem] bg-cover bg-center relative overflow-hidden shadow-md rounded-lg">
            <img
              src="/assets/unsplash-2.jpg"
              alt="Special Offer"
              className="w-full h-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center">
              <h2 className="text-white text-3xl font-bold uppercase mb-2">
                Special Offer
              </h2>
              <p className="text-white text-lg">
                Up to 50% off on selected items
              </p>
              <Link
                to="/shop"
                className="mt-4 bg-white text-[#649899] px-4 py-2 rounded-md font-semibold hover:bg-[#649869] hover:text-white"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </section>

        {/* Similar Products Section */}
        {similarProducts.length > 0 && (
          <section className="mt-10">
            <h3 className="text-xl font-bold text-gray-900 uppercase mb-4 text-center">Similar Products</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similarProducts.map((p) => (
                <Link to={`/product/${p._id}`} key={p._id} className="group block bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative h-40 overflow-hidden">
                    <img src={p.image?.url || p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-3">
                    <h4 className="font-bold text-sm text-gray-800 truncate mb-1">{p.name}</h4>
                    <p className="text-xs text-gray-500 mb-2 truncate">{p.brand}</p>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-teal-600 text-sm">₹{p.offer && p.offer < p.price ? p.offer : p.price}</span>
                      {p.offer && p.offer < p.price && (
                        <span className="text-xs text-gray-400 line-through">₹{p.price}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="mt-10">
        {userInfo && hasReviewed && (
          <Message variant="info">
            You have already reviewed this product.
          </Message>
        )}
        <ProductTabs
          loadingProductReview={loadingProductReview}
          userInfo={userInfo}
          submitHandler={submitHandler}
          rating={rating}
          setRating={setRating}
          comment={comment}
          setComment={setComment}
          product={product}
          hasReviewed={hasReviewed}
        />
      </div>
    </>
  );
};

export default ProductDetails;