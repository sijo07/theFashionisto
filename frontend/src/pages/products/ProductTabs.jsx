import { useState } from "react";
import { Link } from "react-router-dom";
import Ratings from "./ratings";
import { useGetTopProductsQuery } from "../../redux/api/productApiSlice";
import Capsule from "./capsule";
import Loader from "../../components/loader";

const ProductTabs = ({
  loadingProductReview,
  userInfo,
  submitHandler,
  rating,
  setRating,
  comment,
  setComment,
  product,
}) => {
  const { data, isLoading } = useGetTopProductsQuery();

  const [activeTab, setActiveTab] = useState(1);

  // Log data to inspect its contents
  console.log("Fetched top products:", data);

  if (isLoading) {
    return <Loader />;
  }

  const handleTabClick = (tabNumber) => {
    setActiveTab(tabNumber);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex">
        <div className="w-1/4 border-r-2 pr-4">
          <div
            className={`py-4 cursor-pointer text-lg ${
              activeTab === 1 ? "font-bold text-[#649899]" : ""
            }`}
            onClick={() => handleTabClick(1)}
          >
            All Reviews
          </div>

          <div
            className={`py-4 cursor-pointer text-lg ${
              activeTab === 2 ? "font-bold text-[#649899]" : ""
            }`}
            onClick={() => handleTabClick(2)}
          >
            Write Your Review
          </div>

          <div
            className={`py-4 cursor-pointer text-lg ${
              activeTab === 3 ? "font-bold text-[#649899]" : ""
            }`}
            onClick={() => handleTabClick(3)}
          >
            Related Products
          </div>
        </div>

        <div className="w-[20rem] pl-4">
          {activeTab === 1 && (
            <div>
              {product && product.reviews.length === 0 ? (
                <p>No Reviews</p>
              ) : (
                product &&
                product.reviews.map((review) => (
                  <div key={review._id} className="mb-4 border-b pb-4">
                    <div className="flex justify-between items-center mb-2">
                      <strong className="text-gray-800 capitalize">
                        {review.name}
                      </strong>
                      <p className="text-gray-600 text-sm">
                        {review.createdAt.substring(0, 10)}
                      </p>
                    </div>
                    <p className="mb-2">{review.comment}</p>
                    <Ratings value={review.rating} />
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 2 && (
            <div className="mt-4">
              {userInfo ? (
                <form onSubmit={submitHandler}>
                  <div className="mb-4">
                    <textarea
                      name="Review"
                      rows="2"
                      placeholder="Say Something!"
                      className="bg-gray-100 w-80 border-2 rounded-lg p-3 flex focus:outline-none border-blur-200 resize-none"
                      required
                    />
                  </div>
                  <div className="flex justify-between">
                    <div className="w-[12rem]">
                      <select
                        id="rating"
                        required
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        className="p-2 border rounded-lg w-full text-black bg-gray-100"
                      >
                        <option value="">Select</option>
                        <option value="1">Inferior</option>
                        <option value="2">Decent</option>
                        <option value="3">Great</option>
                        <option value="4">Excellent</option>
                        <option value="5">Exceptional</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={loadingProductReview}
                      className="text-white px-4 bg-[#649899] rounded-md hover:bg-[#649869] cursor-pointer"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              ) : (
                <p>
                  Please <Link to="/login">sign in</Link> to write a review
                </p>
              )}
            </div>
          )}

          {activeTab === 3 && (
            <div className="flex flex-wrap mt-4">
              {data?.map((product) => (
                <div key={product._id} className="w-1/2 p-2">
                  <Capsule product={product} />
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
