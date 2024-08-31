import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import StarRating from "./starRating";
import Ratings from "./ratings";
import Capsule from "./Capsule";
import Loader from "../../components/Loader";
import { useGetTopProductsQuery } from "../../redux/api/productApiSlice";
import { useGetUserReviewedProductsQuery } from "../../redux/api/userApiSlice";

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
  const { data: topProducts, isLoading: isLoadingTopProducts } =
    useGetTopProductsQuery();
  const { data: reviewedProducts, isLoading: isLoadingReviewedProducts } =
    useGetUserReviewedProductsQuery();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(1);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);

  useEffect(() => {
    if (userInfo && reviewedProducts && product) {
      const userReviewed = reviewedProducts.some(
        (reviewedProduct) => reviewedProduct._id === product._id
      );
      setHasUserReviewed(userReviewed);
    }
  }, [userInfo, reviewedProducts, product]);

  if (isLoadingTopProducts || isLoadingReviewedProducts) return <Loader />;

  const handleTabClick = (tabNumber) => {
    setActiveTab(tabNumber);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`, { state: { scrollToProduct: true } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex">
        <div className="w-1/4 border-r-2 pr-6">
          <div className="flex flex-col">
            {[
              { label: "All Reviews", tab: 1 },
              { label: "Write Your Review", tab: 2 },
              { label: "Related Products", tab: 3 },
            ].map(({ label, tab }) => (
              <div
                key={tab}
                className={`py-3 cursor-pointer text-lg ${
                  activeTab === tab
                    ? "font-bold text-[#649899]"
                    : "text-gray-600"
                } border-b-2 ${
                  activeTab === tab ? "border-[#649899]" : "border-transparent"
                }`}
                onClick={() => handleTabClick(tab)}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="w-3/4 pl-6">
          {activeTab === 1 && (
            <div>
              {product && product.reviews.length === 0 ? (
                <p className="text-gray-600">No Reviews</p>
              ) : (
                product &&
                product.reviews.map((review) => (
                  <div key={review._id} className="mb-6 border-b pb-4">
                    <div className="flex justify-between items-center mb-2">
                      <strong className="text-gray-800 capitalize">
                        {review.name}
                      </strong>
                      <p className="text-gray-600 text-sm">
                        {review.createdAt.substring(0, 10)}
                      </p>
                    </div>
                    <p className="mb-1">{review.comment}</p>
                    <Ratings
                      value={review.rating}
                      size="20px"
                      className="custom-class"
                    />
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 2 && (
            <div className="mt-4">
              {userInfo ? (
                hasUserReviewed ? (
                  <p className="text-teal-800 font-semibold">
                    You have already submitted a review for this product.
                  </p>
                ) : (
                  <form
                    onSubmit={submitHandler}
                    className="bg-gray-50 pl-4 rounded-lg shadow-sm w-[30rem]"
                  >
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">
                      Share Your Thoughts
                    </h2>
                    <div className="mb-4">
                      <textarea
                        name="Review"
                        rows="1"
                        placeholder="Type Review!"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="bg-white border-2 rounded-lg p-3 w-full focus:outline-none border-gray-300 resize-none"
                        required
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="mb-4">
                        <StarRating
                          value={rating}
                          text="Your Rating"
                          size="20px"
                          className="custom-class"
                          onChange={(newRating) => setRating(newRating)}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loadingProductReview}
                        className="bg-[#649899] text-white px-6 py-2 rounded-md hover:bg-[#649869] cursor-pointer"
                      >
                        {loadingProductReview ? "Submitting..." : "Submit"}
                      </button>
                    </div>
                  </form>
                )
              ) : (
                <p className="text-gray-600">
                  Please
                  <Link to="/login" className="text-[#649899] hover:underline">
                    sign in
                  </Link>
                  to write a review
                </p>
              )}
            </div>
          )}

          {activeTab === 3 && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topProducts?.map((prod) => (
                <div
                  key={prod._id}
                  className="cursor-pointer"
                  onClick={() => handleProductClick(prod._id)}
                >
                  <Capsule product={prod} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductTabs;
