import { useGetTopProductsQuery } from "../redux/api/productApiSlice";
import Loader from "./loader";
import Message from "./message";

const CustomerReviews = () => {
  const { data: products, isLoading, error } = useGetTopProductsQuery();

  if (isLoading) return <Loader />;
  if (error) {
    return (
      <Message variant="danger">
        {error?.data?.message || error.error}
      </Message>
    );
  }

  // Aggregate reviews from top products
  const reviews = products
    ? products.flatMap((product) => product.reviews)
      .sort((a, b) => b.rating - a.rating) // Sort by rating
      .slice(0, 3) // Show top 3
    : [];

  if (reviews.length === 0) {
    return (
      <section className="py-10">
        <div className="max-w-screen-xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
          <p className="text-gray-500">No reviews yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10">
      <div className="max-w-screen-xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Customer Reviews
        </h2>
        <div className="space-y-6">
          {reviews.map((review, index) => (
            <div key={index} className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 flex items-start gap-4 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <img
                src={review.user?.image || review.image || `https://ui-avatars.com/api/?name=${review.name}&background=random&color=fff`}
                alt={review.name}
                className="w-12 h-12 rounded-full object-cover shadow-md border-2 border-white ring-1 ring-gray-100"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-lg font-bold text-gray-800">{review.name}</p>
                  <span className="text-xs text-gray-400">{review.createdAt ? review.createdAt.substring(0, 10) : "Verified Buyer"}</span>
                </div>

                <div className="flex items-center mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="text-gray-600 text-sm italic leading-relaxed">
                  "{review.comment}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
