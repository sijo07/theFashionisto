import { useState, useRef, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
} from "../../redux/api/productApiSlice";
import {
  addFavoriteToLocalStorage,
  getFavoritesFromLocalStorage,
  removeFavoriteFromLocalStorage,
} from "../../utils/localStorage";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import ProductTabs from "./ProductTabs";
import { addToCart } from "../../redux/features/cart/cartSlice";
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

  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hasReviewed, setHasReviewed] = useState(false);

  const {
    data: product,
    isLoading,
    error,
    refetch,
  } = useGetProductDetailsQuery(productId);

  const { userInfo } = useSelector((state) => state.auth);

  const [createReview, { isLoading: loadingProductReview }] =
    useCreateReviewMutation();

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

  const favorites = useSelector((state) => state.favorites) || [];
  const isFavorite = favorites.some((p) => p._id === product?._id);

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty }));
    navigate("/cart");
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

  const toggleFavorites = () => {
    if (isFavorite) {
      dispatch(removeFromFavorites(product));
      removeFavoriteFromLocalStorage(product._id);
    } else {
      dispatch(addToFavorites(product));
      addFavoriteToLocalStorage(product);
    }
  };

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
              src={product.image}
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
            <div className="flex space-x-4 mb-2">
              <span className="text-xl text-teal-900 font-bold">
                &#8377;{product.price}
              </span>
              <span className="text-gray-500 line-through text-xl">
                &#8377;{product.cutPrice}
              </span>
            </div>
            <span className="text-[#649899] font-semibold">
              inclusive of all taxes
            </span>
            <div className="flex items-center mt-4 w-[12rem] h-10 p-2 border-2 border-gray-200 hover:border-gray-400">
              <div className="flex items-center">{`${product.rating} Ratings`}</div>
              <span className="ml-2 text-gray-600">
                | {`${product.numReviews} Reviews`}
              </span>
            </div>

            <div className="my-5 btn-container flex">
              <div>
                <button
                  onClick={addToCartHandler}
                  className="w-[10rem] bg-[#649899] text-white py-3 px-6 rounded-md hover:bg-[#4caf65] cursor-pointer"
                >
                  Add to Bag
                </button>
              </div>
              <div className="ml-2">
                <button
                  onClick={toggleFavorites}
                  className={`w-[10rem] py-3 px-6 rounded-md cursor-pointer ${
                    isFavorite
                      ? "bg-[#D70040] text-white hover:bg-[#649899]"
                      : "bg-[#649899] text-white hover:bg-[#D70040]"
                  }`}
                >
                  {isFavorite ? "Liked" : "Add to Liked"}
                </button>
              </div>
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
