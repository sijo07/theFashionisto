import { useGetTopProductsQuery } from "../redux/api/productApiSlice";
import Loader from "./loader";
import { Link } from "react-router-dom";

const Brands = () => {
  const { data, isLoading, error } = useGetTopProductsQuery();

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <h1>ERROR</h1>;
  }

  return (
    <>
      <div className="w-full bg-gray-50">
        <div className="flex items-center justify-start">
          <h1 className="flex items-center m-4 h-10 text-1xl lg:text-2xl text-[#649899] font-bold uppercase tracking-wider">
            featured Brands
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
      </div>
      <div className="flex justify-around">
        <div className="xl:block lg:hidden md:hidden:sm:hidden">
          <div className="grid grid-cols-8">
            {data.map((product) => (
              <div key={product._id} className="w-[10rem] m-1 pt-5">
                <Link to={`/product/${product._id}`}>
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.brand}
                      className="w-[10rem] h-[10rem] object-cover rounded-full"
                    />
                  </div>
                </Link>
                <div className="m-1">
                  <div className="flex justify-around items-center rounded-full bg-teal-800">
                    <h2 className="text-white font-semibold capitalize text-base">
                      {product.brand}
                    </h2>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Brands;
