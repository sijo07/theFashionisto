import { useState } from "react";
import PropTypes from "prop-types";
import StarRating from "./StarRating";
import Loader from "../../components/Loader";
import { FaEdit, FaFilter, FaChevronDown, FaChevronUp, FaTrash, FaCheckCircle, FaTimesCircle, FaPenFancy } from "react-icons/fa";
import { useDeleteReviewMutation } from "../../redux/api/productApiSlice";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const ProductTabs = ({
  loadingProductReview,
  userInfo,
  submitHandler,
  rating,
  setRating,
  comment,
  setComment,
  product,
  hasReviewed,
}) => {
  const [activeTab, setActiveTab] = useState("reviews");
  const [filterRating, setFilterRating] = useState("all");
  const [showBreakdown, setShowBreakdown] = useState(true);

  const [deleteReview] = useDeleteReviewMutation();

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await deleteReview({ productId: product._id, reviewId }).unwrap();
        toast.success("Review deleted successfully");
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  }

  // Calculate Rating Breakdown
  const totalReviews = product.reviews.length;
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  product.reviews.forEach((review) => {
    ratingCounts[review.rating] = (ratingCounts[review.rating] || 0) + 1;
  });

  // Filter Reviews
  const filteredReviews = filterRating === "all"
    ? product.reviews
    : product.reviews.filter(r => r.rating === Number(filterRating));

  // Sort by date (newest first)
  const sortedReviews = [...filteredReviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="w-full mt-10">

      {/* Tabs Header */}
      <div className="flex border-b border-white/10 mb-8 relative">
        <button
          className={`pb-4 px-6 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === "reviews"
            ? "text-white"
            : "text-zinc-500 hover:text-zinc-300"
            }`}
          onClick={() => handleTabClick("reviews")}
        >
          Reviews <span className="text-xs ml-1 opacity-60">({totalReviews})</span>
          {activeTab === "reviews" && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-[2px] bg-red-600" />
          )}
        </button>
        <button
          className={`pb-4 px-6 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === "write_review"
            ? "text-white"
            : "text-zinc-500 hover:text-zinc-300"
            }`}
          onClick={() => handleTabClick("write_review")}
        >
          Write Review
          {activeTab === "write_review" && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-[2px] bg-red-600" />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "reviews" && (
          <motion.div
            key="reviews"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col lg:flex-row gap-12 lg:gap-20"
          >

            {/* Left Column: Rating Summary (Sidebar) */}
            <div className="lg:w-1/3 flex-shrink-0">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 sticky top-24">
                <h3 className="text-xl font-playfair font-bold text-white mb-6 italic">Rating Overview</h3>
                <div className="text-center">
                  <div className="text-7xl font-black text-white mb-2 tracking-tighter">
                    {product.rating > 0 ? product.rating.toFixed(1) : "0.0"}
                  </div>
                  <div className="flex justify-center mb-4">
                    <StarRating value={product.rating} readOnly size={20} />
                  </div>
                  <p className="text-sm text-zinc-400 font-medium mb-8 uppercase tracking-widest">{totalReviews} Verified Returns</p>

                  <button
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-widest text-zinc-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {showBreakdown ? "Hide Distribution" : "View Distribution"}
                    {showBreakdown ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                  </button>
                </div>

                <div className={`space-y-4 overflow-hidden transition-all duration-300 ease-in-out ${showBreakdown ? 'max-h-[500px] opacity-100 pt-8 border-t border-white/10 mt-6' : 'max-h-0 opacity-0'}`}>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = ratingCounts[star];
                    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    return (
                      <button
                        key={star}
                        onClick={() => setFilterRating(filterRating === star ? "all" : star)}
                        className={`w-full flex items-center text-xs gap-3 group transition-colors px-2 py-1 -mx-2 rounded ${filterRating === star ? 'bg-white/5' : 'hover:bg-white/5'}`}
                      >
                        <div className="w-4 font-bold text-zinc-400">{star}★</div>
                        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${filterRating === star ? 'bg-red-500' : 'bg-white'}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="w-6 text-right text-zinc-500 font-mono">{count}</div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Reviews List */}
            <div className="lg:w-2/3">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-white/10">
                <h3 className="text-xl font-playfair font-bold text-white flex items-center gap-3">
                  Latest Remarks
                  <span className="text-xs font-sans font-bold text-black bg-white px-2 py-0.5 rounded-full">{sortedReviews.length}</span>
                </h3>

                {/* Filter Dropdown */}
                <div className="relative mt-4 sm:mt-0">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest"><FaFilter className="inline mb-[2px]" /> Filter:</span>
                    <div className="relative">
                      <select
                        value={filterRating}
                        onChange={(e) => setFilterRating(e.target.value === "all" ? "all" : Number(e.target.value))}
                        className="appearance-none bg-black border border-white/20 text-zinc-300 py-1.5 pl-3 pr-8 rounded text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-red-600 cursor-pointer hover:border-white transition-colors"
                      >
                        <option value="all">All Stars</option>
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                      </select>
                      <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 pointer-events-none" size={8} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {sortedReviews.length === 0 ? (
                  <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <p className="text-zinc-500 font-medium">
                      {filterRating === "all"
                        ? "No reviews yet. Be the first to start the trend!"
                        : `No ${filterRating}-star reviews yet.`}
                    </p>
                    {filterRating !== "all" && (
                      <button
                        onClick={() => setFilterRating("all")}
                        className="mt-4 text-red-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
                      >
                        Clear Filter
                      </button>
                    )}
                  </div>
                ) : (
                  sortedReviews.map((review) => (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      key={review._id}
                      className="bg-zinc-900/50 p-6 rounded-xl border border-white/5 hover:border-white/20 transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-black border border-white/10 flex items-center justify-center text-white font-bold text-lg">
                          {review.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-bold text-white text-sm uppercase tracking-wide">{review.name}</h4>
                              <div className="flex items-center gap-3 mt-1">
                                <StarRating value={review.rating} readOnly size={12} />
                                {review.isVerifiedPurchase ? (
                                  <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 uppercase tracking-wider">
                                    <FaCheckCircle size={8} /> Verified
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-zinc-500 font-bold bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700 flex items-center gap-1 uppercase tracking-wider">
                                    <FaTimesCircle size={8} /> Unverified
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-[10px] text-zinc-600 font-mono font-bold uppercase">{new Date(review.createdAt).toLocaleDateString()}</span>

                              {/* Delete Button */}
                              {userInfo && (userInfo._id === review.user || userInfo.isAdmin) && (
                                <button
                                  onClick={() => handleDeleteReview(review._id)}
                                  className="text-[10px] font-bold text-zinc-600 hover:text-red-500 transition-colors uppercase tracking-wider group-hover:opacity-100 opacity-0"
                                  title="Delete this review"
                                >
                                  <FaTrash />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-zinc-300 text-sm leading-relaxed mt-3 font-light">
                            "{review.comment}"
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Write Review Tab */}
        {activeTab === "write_review" && (
          <motion.div
            key="write"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white/5 rounded-2xl p-8 md:p-12 border border-white/10 backdrop-blur-md">
              <h3 className="text-2xl font-playfair font-bold text-white mb-8 text-center italic">Share Your Experience</h3>

              {userInfo ? (
                hasReviewed ? (
                  <div className="text-center py-10">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 text-emerald-500">
                      <FaCheckCircle size={32} />
                    </div>
                    <h4 className="font-bold text-xl text-white mb-2">Review Submitted</h4>
                    <p className="text-zinc-400">Thank you for sharing your feedback with the community.</p>
                  </div>
                ) : (
                  <form onSubmit={submitHandler} className="space-y-8">
                    <div className="text-center">
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Rate this Product</label>
                      <div className="flex justify-center mb-3">
                        <StarRating
                          value={rating}
                          onChange={(val) => setRating(val)}
                          size={32}
                        />
                      </div>
                      <p className="text-center text-sm font-bold text-red-500 h-6 uppercase tracking-widest">
                        {rating === 1 && "Poor"}
                        {rating === 2 && "Fair"}
                        {rating === 3 && "Good"}
                        {rating === 4 && "Very Good"}
                        {rating === 5 && "Exceptional"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Your Remarks</label>
                      <div className="relative">
                        <FaPenFancy className="absolute left-4 top-4 text-zinc-600" />
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full p-4 pl-10 border border-white/10 rounded-xl focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none text-sm min-h-[150px] resize-none bg-black/40 text-white placeholder-zinc-700 transition-all font-light"
                          placeholder="How was the quality? The fit? Would you recommend it?"
                        ></textarea>
                      </div>
                    </div>

                    <div className="flex justify-center pt-4">
                      <button
                        type="submit"
                        disabled={loadingProductReview || rating === 0}
                        className={`w-full md:w-auto px-12 py-4 rounded-full text-white font-bold text-xs uppercase tracking-[0.15em] transition-all border ${loadingProductReview || rating === 0
                          ? "bg-zinc-800 border-zinc-700 cursor-not-allowed text-zinc-500"
                          : "bg-red-600 border-red-600 hover:bg-black hover:text-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-none"
                          }`}
                      >
                        {loadingProductReview ? "Submitting..." : "Submit Review"}
                      </button>
                    </div>
                  </form>
                )
              ) : (
                <div className="text-center py-10">
                  <p className="text-zinc-400 text-sm mb-8 font-light">Please log in to leave a review and join the conversation.</p>
                  <a href="/login" className="inline-block px-10 py-3 bg-white text-black font-bold text-xs uppercase tracking-widest rounded-full hover:bg-zinc-200 transition-colors">
                    Sign In / Register
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

ProductTabs.propTypes = {
  loadingProductReview: PropTypes.bool.isRequired,
  userInfo: PropTypes.object,
  submitHandler: PropTypes.func.isRequired,
  rating: PropTypes.number.isRequired,
  setRating: PropTypes.func.isRequired,
  comment: PropTypes.string.isRequired,
  setComment: PropTypes.func.isRequired,
  product: PropTypes.object.isRequired,
  hasReviewed: PropTypes.bool.isRequired,
};

export default ProductTabs;