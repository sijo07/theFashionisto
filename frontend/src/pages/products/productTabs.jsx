import { useState } from "react";
import PropTypes from "prop-types";
import StarRating from "./starRating";
import Loader from "../../components/loader";
import Message from "../../components/message";
import { FaEdit, FaFilter, FaSortAmountDown, FaChevronDown, FaChevronUp, FaTrash, FaCheckCircle, FaInfoCircle, FaTimesCircle } from "react-icons/fa";
import { useDeleteReviewMutation } from "../../redux/api/productApiSlice";
import { toast } from "react-toastify";

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
    <div className="w-full mt-10 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Tabs Header */}
      <div className="flex border-b border-gray-100 bg-gray-50/50">
        <button
          className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide transition-all ${activeTab === "reviews"
              ? "border-b-2 border-[#649899] text-[#649899] bg-white"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          onClick={() => handleTabClick("reviews")}
        >
          Reviews ({totalReviews})
        </button>
        <button
          className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide transition-all ${activeTab === "write_review"
              ? "border-b-2 border-[#649899] text-[#649899] bg-white"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          onClick={() => handleTabClick("write_review")}
        >
          Write Review
        </button>
      </div>

      <div className="p-6 md:p-8">
        {activeTab === "reviews" && (
          <div className="flex flex-col lg:flex-row gap-12">

            {/* Left Column: Rating Summary (Sidebar) */}
            <div className="lg:w-1/3 flex-shrink-0">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Rating Overview</h3>
                <div className="text-center">
                  <div className="text-6xl font-black text-[#649899] mb-1">
                    {product.rating > 0 ? product.rating.toFixed(1) : "0.0"}
                  </div>
                  <div className="flex justify-center mb-2">
                    <StarRating value={product.rating} readOnly size={24} />
                  </div>
                  <p className="text-sm text-gray-400 font-medium mb-6">{totalReviews} Ratings</p>

                  <button
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {showBreakdown ? "Hide Breakdown" : "View Breakdown"}
                    {showBreakdown ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                  </button>
                </div>

                <div className={`space-y-3 overflow-hidden transition-all duration-300 ease-in-out ${showBreakdown ? 'max-h-[500px] opacity-100 pt-6 border-t border-gray-100 mt-6' : 'max-h-0 opacity-0'}`}>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = ratingCounts[star];
                    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    return (
                      <button
                        key={star}
                        onClick={() => setFilterRating(filterRating === star ? "all" : star)}
                        className={`w-full flex items-center text-xs gap-3 group px-2 py-1.5 rounded transition-colors ${filterRating === star ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                      >
                        <div className="w-3 font-medium text-gray-500">{star}</div>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${filterRating === star ? 'bg-orange-400' : 'bg-[#649899]'}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="w-8 text-right text-gray-400 font-mono">{count}</div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Reviews List */}
            <div className="lg:w-2/3">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  Customer Reviews
                  <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{sortedReviews.length}</span>
                </h3>

                {/* Filter Dropdown */}
                <div className="relative mt-4 sm:mt-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Filter:</span>
                    <div className="relative">
                      <select
                        value={filterRating}
                        onChange={(e) => setFilterRating(e.target.value === "all" ? "all" : Number(e.target.value))}
                        className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#649899] cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <option value="all">All Stars</option>
                        <option value="5">5 Stars only</option>
                        <option value="4">4 Stars only</option>
                        <option value="3">3 Stars only</option>
                        <option value="2">2 Stars only</option>
                        <option value="1">1 Star only</option>
                      </select>
                      <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={10} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {sortedReviews.length === 0 ? (
                  <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-400 font-medium">
                      {filterRating === "all"
                        ? "No reviews yet. Be the first to share your thoughts!"
                        : `No ${filterRating}-star reviews yet.`}
                    </p>
                    {filterRating !== "all" && (
                      <button
                        onClick={() => setFilterRating("all")}
                        className="mt-4 text-[#649899] text-sm font-bold hover:underline"
                      >
                        Clear Filter
                      </button>
                    )}
                  </div>
                ) : (
                  sortedReviews.map((review) => (
                    <div key={review._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative group">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold text-lg shadow-inner">
                          {review.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-bold text-gray-900">{review.name}</h4>
                              <div className="flex items-center gap-3 mt-1">
                                <StarRating value={review.rating} readOnly size={14} />
                                {review.isVerifiedPurchase ? (
                                  <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                                    <FaCheckCircle size={10} /> Verified Purchase
                                  </span>
                                ) : (
                                  <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded border border-red-100 flex items-center gap-1">
                                    <FaTimesCircle size={10} /> Unverified Purchase
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-xs text-gray-400 font-mono">{new Date(review.createdAt).toLocaleDateString()}</span>

                              {/* Delete Button */}
                              {userInfo && (userInfo._id === review.user || userInfo.isAdmin) && (
                                <button
                                  onClick={() => handleDeleteReview(review._id)}
                                  className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider py-1 px-2 hover:bg-red-50 rounded"
                                  title="Delete this review"
                                >
                                  DELETE
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/** Write Review Tab ... (Same) **/}
        {activeTab === "write_review" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Share Your Experience</h3>

              {userInfo ? (
                hasReviewed ? (
                  <div className="p-8 bg-green-50 text-green-800 rounded-xl text-center border border-green-100">
                    <div className="text-4xl mb-4">✓</div>
                    <h4 className="font-bold text-lg mb-2">Review Submitted!</h4>
                    <p>Thank you for sharing your feedback with us.</p>
                  </div>
                ) : (
                  <form onSubmit={submitHandler} className="animate-fade-in">
                    <div className="mb-8 text-center">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Rate this Product</label>
                      <div className="flex justify-center mb-2">
                        <StarRating
                          value={rating}
                          onChange={(val) => setRating(val)}
                          size={40}
                        />
                      </div>
                      <p className="text-center text-sm font-medium text-[#649899] h-5">
                        {rating === 1 && "Poor"}
                        {rating === 2 && "Fair"}
                        {rating === 3 && "Good"}
                        {rating === 4 && "Very Good"}
                        {rating === 5 && "Excellent"}
                      </p>
                    </div>

                    <div className="mb-6">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Your Review</label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#649899] focus:border-transparent outline-none text-sm min-h-[150px] resize-none bg-gray-50 transition-all font-medium text-gray-700"
                        placeholder="What did you like or dislike? How was the quality?"
                      ></textarea>
                    </div>

                    <div className="flex justify-center">
                      <button
                        type="submit"
                        disabled={loadingProductReview || rating === 0}
                        className={`w-full md:w-auto px-10 py-3 rounded-lg text-white font-bold text-sm transition-all ${loadingProductReview || rating === 0
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-[#649899] hover:bg-[#538283] shadow-lg transform hover:-translate-y-0.5"
                          }`}
                      >
                        {loadingProductReview ? "Submitting..." : "Submit Review"}
                      </button>
                    </div>
                  </form>
                )
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 text-base mb-6">Please log in to write a review.</p>
                  <a href="/login" className="inline-block px-8 py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors shadow-lg">
                    Sign In / Register
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
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