import { useParams } from "react-router-dom";
import { useGetProductsQuery } from "../redux/api/productApiSlice";
import { Loader, Message, Brands, Hero } from "../components/index";
import Product from "./products/Product";

const Home = () => {
  const { keyword } = useParams();
  const { data, isLoading, isError } = useGetProductsQuery({ keyword });

  return (
    <>
      <Hero />
      {!keyword ? <Brands /> : null}
      {isLoading ? (
        <Loader />
      ) : isError ? (
        <Message variant="danger">
          {isError?.data.message || isError.error}
        </Message>
      ) : (
        <>
          <div className="w-full bg-gray-50">
            <div className="flex items-center justify-start">
              <h1 className="flex items-center m-4 h-10 text-1xl lg:text-2xl text-[#649899] font-bold uppercase tracking-wider">
                featured products{" "}
                <svg
                  className="w-10 h-5 ml-6"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M1 5h12m0 0L9 1m4 4L9 9"
                  />
                </svg>
              </h1>
            </div>
            <div className="max-w-screen-xl mx-auto py-2 flex md:text-left">
              <div className="grid lg:grid-cols-4 gap-10">
                {data.products.map((product) => (
                  <div key={product._id}>
                    <Product product={product} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Home;
