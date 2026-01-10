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
import SizeChartModal from "../../components/SizeChartModal";
import { addToCart, removeFromCart } from "../../redux/features/cart/cartSlice";
import {
  addToFavorites,
  removeFromFavorites,
  setFavorites,
} from "../../redux/features/favorites/favoriteSlice";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar, FaHeart, FaRegHeart, FaArrowLeft, FaTruck, FaShieldAlt, FaTimes } from "react-icons/fa";

const ProductDetails = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hasReviewed, setHasReviewed] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [activeImage, setActiveImage] = useState("");
  const [showSizeChart, setShowSizeChart] = useState(false);

  const {
    data: product,
    isLoading,
    error,
    refetch,
  } = useGetProductDetailsQuery(productId);

  const { userInfo } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const favorites = useSelector((state) => state.favorites) || [];

  const [createReview, { isLoading: loadingProductReview }] = useCreateReviewMutation();

  const isProductInCart = cartItems.some(
    (item) => item._id === productId && item.size === selectedSize
  );
  const isFavorite = favorites.some((p) => p._id === product?._id);

  // -- Handlers (Same logic as before, just restyled) --
  const submitHandler = async (e) => {
    e.preventDefault();
    if (hasReviewed) return toast.info("Review already submitted.");
    try {
      await createReview({ productId, rating, comment }).unwrap();
      refetch();
      setHasReviewed(true);
      toast.success("Review verified.");
    } catch (error) {
      toast.error(error?.data?.message || error.message);
    }
  };

  const toggleCart = () => {
    if (isProductInCart) {
      if (!selectedSize) return toast.error("Select size to remove");
      dispatch(removeFromCart({ _id: product._id, size: selectedSize }));
      toast.success("Removed from bag");
    } else {
      if (product.sizes?.length > 0 && !selectedSize) return toast.error("Select a size");
      dispatch(addToCart({ ...product, qty: 1, size: selectedSize }));
      // navigate("/cart"); // Optional: Navigate or just show toast
      toast.success("Added to bag");
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
    if (userInfo && product) {
      const userReview = product.reviews.find((r) => r.user === userInfo._id);
      if (userReview) setHasReviewed(true);
    }
  }, [product, userInfo]);

  useEffect(() => {
    if (!selectedSize && product && cartItems) {
      const cartItem = cartItems.find((item) => item._id === product._id);
      if (cartItem && cartItem.size) setSelectedSize(cartItem.size);
    }
  }, [product, cartItems, selectedSize]);

  if (isLoading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader /></div>;
  if (error || !product) return <Message variant="danger">{error?.data?.message || "Product not found"}</Message>;

  return (
    <div className="bg-[#050505] min-h-screen text-white pt-24 pb-20 relative">
      <AnimatePresence>
        {showSizeChart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setShowSizeChart(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#09090b] border border-zinc-800 w-full max-w-2xl relative overflow-hidden"
            >
              {/* Header */}
              <div className="p-8 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
                <h3 className="text-xl font-playfair font-bold italic text-white">Sizing <span className="text-red-600">Index</span></h3>
                <button onClick={() => setShowSizeChart(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <FaTimes size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-8 lg:p-12">
                <p className="text-zinc-500 text-xs font-mono mb-8 uppercase tracking-widest text-center">Measurements in Inches</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-center">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="pb-4 font-bold text-zinc-400 uppercase tracking-widest text-xs">Size</th>
                        <th className="pb-4 font-bold text-zinc-400 uppercase tracking-widest text-xs">Chest</th>
                        <th className="pb-4 font-bold text-zinc-400 uppercase tracking-widest text-xs">Waist</th>
                        <th className="pb-4 font-bold text-zinc-400 uppercase tracking-widest text-xs">Length</th>
                        <th className="pb-4 font-bold text-zinc-400 uppercase tracking-widest text-xs">Shoulder</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {[
                        { s: "XS", c: "34-36", w: "28-30", l: "27", sh: "16.5" },
                        { s: "S", c: "36-38", w: "30-32", l: "27.5", sh: "17" },
                        { s: "M", c: "38-40", w: "32-34", l: "28", sh: "17.75" },
                        { s: "L", c: "40-42", w: "34-36", l: "28.5", sh: "18.5" },
                        { s: "XL", c: "42-44", w: "36-38", l: "29", sh: "19.25" },
                        { s: "XXL", c: "44-46", w: "38-40", l: "29.5", sh: "20" },
                      ].map((row, i) => (
                        <tr key={i} className="group hover:bg-white/5 transition-colors">
                          <td className="py-4 font-bold text-white uppercase">{row.s}</td>
                          <td className="py-4 text-zinc-400 group-hover:text-zinc-300">{row.c}</td>
                          <td className="py-4 text-zinc-400 group-hover:text-zinc-300">{row.w}</td>
                          <td className="py-4 text-zinc-400 group-hover:text-zinc-300">{row.l}</td>
                          <td className="py-4 text-zinc-400 group-hover:text-zinc-300">{row.sh}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-8 pt-8 border-t border-zinc-900 text-center">
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Fit varies by style and personal preference.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="max-w-[1200px] mx-auto px-6">

        {/* Breadcrumb / Back */}
        <div className="flex items-center gap-4 mb-8 text-sm text-zinc-500 font-medium uppercase tracking-wider">
          <Link to="/shop" className="hover:text-white flex items-center gap-2 transition-colors">
            <FaArrowLeft /> Back to Catalog
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="text-red-600">{product.brand}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Left: Image Gallery */}
          <div className="space-y-4 lg:col-span-5">
            <div className="aspect-[3/4] w-full bg-zinc-900 border border-zinc-800 overflow-hidden relative group">
              <img
                src={activeImage || (product.image?.url || product.image)}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {product.countInStock === 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-3xl font-black uppercase tracking-widest text-red-600 border-4 border-red-600 px-6 py-2 rotation-12">Sold Out</span>
                </div>
              )}
            </div>

            {/* Thumbnail Strip (Mobile Only) */}
            {product.images?.length > 0 && (
              <div className="grid grid-cols-5 gap-2 lg:hidden">
                {[product.image?.url || product.image, ...product.images.filter(img => img !== (product.image?.url || product.image))].map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`aspect-square border overflow-hidden relative transition-all ${(activeImage || (product.image?.url || product.image)) === img
                      ? 'border-zinc-400 opacity-100 ring-1 ring-zinc-400'
                      : 'border-zinc-800 opacity-60 hover:opacity-100 hover:border-zinc-600'
                      }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}


          </div>

          {/* Right: Info */}
          <div className="flex flex-col lg:col-span-7">
            <span className="text-red-500 font-bold uppercase tracking-[0.2em] mb-2">{product.brand}</span>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-none mb-6 text-white">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-end gap-4 mb-8">
              {product.offer && product.offer < product.price ? (
                <>
                  <span className="text-3xl font-bold text-white">₹{product.offer}</span>
                  <span className="text-sm font-medium text-zinc-500 line-through mb-1">₹{product.price}</span>
                  <span className="text-xs font-bold bg-red-600 text-white px-2 py-1 mb-1 uppercase tracking-wider">Sale</span>
                </>
              ) : (
                <span className="text-3xl font-bold text-white">₹{product.price}</span>
              )}
            </div>

            {/* Description */}
            <p className="text-zinc-400 leading-relaxed mb-8 border-b border-zinc-800 pb-8">
              {product.description}
            </p>

            {/* Thumbnail Strip (Desktop Only - Below Description) */}
            {product.images?.length > 0 && (
              <div className="mb-8 hidden lg:block">
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Gallery</h4>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {[product.image?.url || product.image, ...product.images.filter(img => img !== (product.image?.url || product.image))].map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-16 h-16 shrink-0 border overflow-hidden relative transition-all ${(activeImage || (product.image?.url || product.image)) === img
                        ? 'border-white opacity-100 ring-1 ring-white'
                        : 'border-zinc-800 opacity-60 hover:opacity-100 hover:border-zinc-600'
                        }`}
                    >
                      <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {product.sizes?.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between mb-3">
                  <span className="text-sm font-bold uppercase tracking-widest text-white">Select Size</span>
                  <span onClick={() => setShowSizeChart(true)} className="text-xs text-zinc-500 cursor-pointer hover:text-white underline decoration-zinc-800 underline-offset-4 hover:decoration-white transition-all">Size Guide</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((s) => (
                    <button
                      key={s.size}
                      disabled={s.stock === 0}
                      onClick={() => setSelectedSize(s.size)}
                      className={`min-w-[3.5rem] h-12 flex items-center justify-center border text-sm font-bold transition-all relative ${selectedSize === s.size
                        ? 'border-red-600 bg-red-600 text-white'
                        : s.stock === 0 ? 'border-zinc-800 text-zinc-600 cursor-not-allowed bg-zinc-900 line-through' : 'border-zinc-700 text-zinc-300 hover:border-white'
                        }`}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={toggleCart}
                disabled={product.countInStock === 0}
                className={`flex-1 py-4 font-bold uppercase tracking-widest transition-all ${isProductInCart
                  ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                  : 'bg-white text-black hover:bg-red-600 hover:text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isProductInCart ? 'Remove from Bag' : product.countInStock === 0 ? 'Unavailable' : 'Add to Cart'}
              </button>
              <button
                onClick={toggleFavorites}
                className={`w-14 flex items-center justify-center border transition-all ${isFavorite
                  ? 'border-red-600 text-red-600'
                  : 'border-zinc-800 text-zinc-400 hover:border-white hover:text-white'
                  }`}
              >
                {isFavorite ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
              </button>
            </div>

            {/* Thumbnail Strip (Desktop Only - Right Col) */}


            {/* Highlights */}
            <div className="grid grid-cols-2 gap-4 text-xs font-bold uppercase tracking-wider text-zinc-500">
              <div className="flex items-center gap-3">
                <FaTruck size={16} /> <span>Free Shipping</span>
              </div>
              <div className="flex items-center gap-3">
                <FaShieldAlt size={16} /> <span>Secure Checkout</span>
              </div>
            </div>

          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-20 border-t border-zinc-800 pt-10">
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

      </div>
    </div>
  );
};

export default ProductDetails;