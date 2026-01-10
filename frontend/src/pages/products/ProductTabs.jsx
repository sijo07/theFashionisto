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
  const [showBreakdown, setShowBreakdown] = useState(false);

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
              <div className="bg-[#09090b] p-8 border border-zinc-800 sticky top-24 relative overflow-hidden group">
                {/* Decorative Elements */}
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-red-600/5 rounded-full blur-3xl transform group-hover:scale-150 transition-transform duration-700"></div>

                <h3 className="text-xl font-playfair font-black text-white mb-8 italic flex items-center gap-3">
                  Rating <span className="text-red-600">Index</span>
                </h3>

                <div className="text-center relative z-10">
                  <div className="text-8xl font-black text-white mb-2 tracking-tighter leading-none">
                    {product.rating > 0 ? product.rating.toFixed(1) : "0.0"}
                  </div>
                  <div className="flex justify-center mb-6 scale-110">
                    <StarRating value={product.rating} readOnly size={20} />
                  </div>
                  <p className="text-[10px] text-zinc-500 font-bold mb-10 uppercase tracking-[0.2em]">{totalReviews} Verified Returns</p>

                  <button
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="w-full flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase tracking-[0.25em] text-white border border-zinc-800 bg-black hover:bg-white hover:text-black hover:border-white transition-all"
                  >
                    {showBreakdown ? "Hide Data" : "View Data"}
                    {showBreakdown ? <FaChevronUp size={8} /> : <FaChevronDown size={8} />}
                  </button>
                </div>

                <div className={`space-y-4 overflow-hidden transition-all duration-300 ease-in-out ${showBreakdown ? 'max-h-[500px] opacity-100 pt-10 border-t border-zinc-900 mt-8' : 'max-h-0 opacity-0'}`}>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = ratingCounts[star];
                    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    return (
                      <button
                        key={star}
                        onClick={() => setFilterRating(filterRating === star ? "all" : star)}
                        className={`w-full flex items-center text-xs gap-4 group transition-colors p-2 -mx-2 hover:bg-zinc-900/50 ${filterRating === star ? 'bg-zinc-900' : ''}`}
                      >
                        <div className="w-6 font-bold text-zinc-400 font-mono">{star}★</div>
                        <div className="flex-1 h-1 bg-zinc-900 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${filterRating === star ? 'bg-red-600' : 'bg-zinc-600 group-hover:bg-white'}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="w-8 text-right text-zinc-500 font-mono text-[10px]">{count}</div>
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
                <div className="relative mt-6 sm:mt-0 w-full sm:w-auto">
                  <div className="flex items-center gap-4 bg-zinc-900/50 p-1 border border-zinc-800 w-full sm:w-auto">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-3 flex-shrink-0"><FaFilter className="inline mb-[2px] mr-2" /> Filter</span>
                    <div className="relative flex-1 sm:flex-none">
                      <select
                        value={filterRating}
                        onChange={(e) => setFilterRating(e.target.value === "all" ? "all" : Number(e.target.value))}
                        className="w-full sm:w-auto appearance-none bg-black border-l border-zinc-800 text-white py-2 pl-4 pr-10 text-[10px] font-bold uppercase tracking-widest focus:outline-none cursor-pointer hover:bg-zinc-900 transition-colors rounded-none"
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
                      className="bg-[#09090b] p-6 lg:p-8 border-b border-zinc-900 hover:bg-zinc-900/20 transition-all group last:border-0"
                    >
                      <div className="flex flex-col sm:flex-row items-start gap-6">
                        <div className="w-12 h-12 rounded-none bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white font-black text-xl flex-shrink-0">
                          {review.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 w-full">
                          <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-bold text-white text-xs uppercase tracking-[0.15em]">{review.name}</h4>
                                {review.isVerifiedPurchase && (
                                  <span className="text-[9px] text-emerald-500 font-bold border border-emerald-900/50 bg-emerald-900/10 px-1.5 py-0.5 uppercase tracking-wider">
                                    Verified Patron
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4">
                                <StarRating value={review.rating} readOnly size={10} />
                                <span className="text-[10px] text-zinc-600 font-mono uppercase border-l border-zinc-800 pl-4">{new Date(review.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>

                            {/* Delete Button */}
                            {userInfo && (userInfo._id === review.user || userInfo.isAdmin) && (
                              <button
                                onClick={() => handleDeleteReview(review._id)}
                                className="text-[10px] font-bold text-zinc-700 hover:text-red-500 transition-colors uppercase tracking-wider flex items-center gap-2 mt-2 sm:mt-0"
                                title="Delete this review"
                              >
                                <FaTrash size={10} /> Remove
                              </button>
                            )}
                          </div>

                          <p className="text-zinc-400 text-sm leading-7 font-light border-l-2 border-zinc-800 pl-4">
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
            className="w-full"
          >
            <div className="bg-[#09090b] p-6 md:p-10 lg:p-12 border border-zinc-800 relative group">
              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-1 h-full bg-red-600/50 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>

              <h3 className="text-4xl font-playfair font-black text-white mb-8 lg:mb-12 italic tracking-tighter">
                Share <span className="text-red-600">Experience</span>
              </h3>

              {userInfo ? (
                hasReviewed ? (
                  <div className="text-center py-20 border border-dashed border-zinc-800">
                    <div className="w-20 h-20 bg-emerald-900/20 rounded-none flex items-center justify-center mx-auto mb-6 border border-emerald-900/50 text-emerald-500">
                      <FaCheckCircle size={32} />
                    </div>
                    <h4 className="font-bold text-xl text-white mb-2 uppercase tracking-wider">Review Submitted</h4>
                    <p className="text-zinc-500 font-mono text-xs">Your voice has been recorded in the register.</p>
                  </div>
                ) : (
                  <form onSubmit={submitHandler} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 border-t border-zinc-900 pt-8 lg:pt-10">
                    {/* Left Column: Rating & Submit */}
                    <div className="lg:col-span-5 flex flex-col justify-between space-y-10 border-b border-zinc-900 pb-10 mb-2 lg:border-none lg:pb-0 lg:mb-0">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6">Rate Product</label>
                        <div className="flex justify-start mb-4 group/stars">
                          <StarRating
                            value={rating}
                            onChange={(val) => setRating(val)}
                            size={32}

                          />
                        </div>
                        <div className="h-8 flex items-center">
                          <span className="text-xs font-bold text-white bg-red-600 px-3 py-1 uppercase tracking-widest">
                            {rating === 1 && "Poor"}
                            {rating === 2 && "Fair"}
                            {rating === 3 && "Good"}
                            {rating === 4 && "Very Good"}
                            {rating === 5 && "Exceptional"}
                            {rating === 0 && "Select Rating"}
                          </span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loadingProductReview || rating === 0}
                        className={`hidden lg:block w-full px-8 py-6 text-white font-black text-xs uppercase tracking-[0.25em] transition-all border border-zinc-800 bg-[#121214] hover:bg-white hover:text-black hover:border-white relative overflow-hidden ${loadingProductReview || rating === 0
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                          }`}
                      >
                        <span className="relative z-10">{loadingProductReview ? "Processing..." : "Publish Review"}</span>
                      </button>
                    </div>

                    {/* Right Column: Remarks */}
                    <div className="lg:col-span-7 relative">
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6">Editorial Remarks</label>
                      <div className="relative lg:h-full group/input">
                        <FaPenFancy className="absolute left-6 top-6 text-zinc-700 group-hover/input:text-red-600 transition-colors" />
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full lg:h-full min-h-[150px] p-6 pl-14 bg-zinc-900/30 border border-zinc-800 focus:border-red-600 focus:bg-zinc-900/50 outline-none text-sm text-zinc-300 placeholder-zinc-700 transition-all font-light resize-none leading-relaxed rounded-none"
                          placeholder="Detail your experience with the fit, texture, and overall quality..."
                        ></textarea>
                      </div>

                      {/* Mobile Submit Button (Visible only on Mobile) */}
                      <button
                        type="submit"
                        disabled={loadingProductReview || rating === 0}
                        className={`lg:hidden w-full px-8 py-6 mt-6 md:mt-8 text-white font-black text-xs uppercase tracking-[0.25em] transition-all border border-zinc-800 bg-[#121214] hover:bg-white hover:text-black hover:border-white relative overflow-hidden ${loadingProductReview || rating === 0
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                          }`}
                      >
                        <span className="relative z-10">{loadingProductReview ? "Processing..." : "Publish Review"}</span>
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