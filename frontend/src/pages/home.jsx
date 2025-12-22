import { useParams } from "react-router-dom";
import { useGetProductsQuery } from "../redux/api/productApiSlice";
import { Loader, Message, Hero, } from "../components/index";
import { Product } from "./products/index";
import Testimonials from "../components/testimonials";
import CustomerReviews from "../components/customerReview";

const Home = () => {
  const { keyword } = useParams();
  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
    error: productsErrorData,
  } = useGetProductsQuery({ keyword });

  // Loading states
  if (productsLoading) return <Loader />;

  // Error states
  if (productsError) {
    return (
      <Message variant="danger">
        {productsErrorData?.data?.message || productsErrorData?.error || "An error occurred"}
      </Message>
    );
  }

  // Get products from data
  const products = productsData?.products || [];

  return (
    <>
      {!keyword ? <Hero /> : null}
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">

          {/* Featured Products Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-gray-900 uppercase tracking-wide">
              Featured Collection
            </h1>
            <a href="/shop" className="text-[#649899] hover:text-[#4caf65] font-semibold flex items-center gap-2 transition-colors">
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {products.map((product) => (
              <div key={product._id} className="w-full">
                <Product product={product} />
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 py-12">
            <CustomerReviews />
          </div>

          <div className="py-8">
            <Testimonials />
          </div>

        </div>
      </div>
    </>
  );
};

export default Home;