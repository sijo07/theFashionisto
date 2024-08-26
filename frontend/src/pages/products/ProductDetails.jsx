import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
} from "../../redux/api/productApiSlice";
import Loader from "../../components/loader";
import Message from "../../components/message";
import HeartIcon from "./HeartIcon";
import ProductTabs from "./ProductTabs";
import { addToCart } from "../../redux/features/cart/cartSlice";

const ProductDetails = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId);

  const { userInfo } = useSelector((state) => state.auth);

  const [createReview, { isLoading: loadingProductReview }] =
    useCreateReviewMutation();

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await createReview({
        productId,
        rating,
        comment,
      }).unwrap();
      refetch();
      toast.success("Review created successfully");
    } catch (error) {
      toast.error(error?.data || error.message);
    }
  };

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty }));
    navigate("/cart");
  };
  return (
    <>
      <div className="mx-auto px-4 sm:px-6 lg:px-8 flex justify-items-center max-w-6xl">
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">
            {error?.data?.message || error.message}
          </Message>
        ) : (
          <>
            <section>
              <div className="text-sm text-gray-500 py-4">
                <Link
                  to="/"
                  className="hover:underline uppercase hover:font-semibold"
                >
                  Home&nbsp;
                </Link>
                <Link
                  to="/shop"
                  className="hover:underline uppercase hover:font-semibold"
                >
                  /&nbsp;Shop&nbsp;
                </Link>
                <Link
                  to={`/product/${product.brand}`}
                  className="hover:underline uppercase hover:font-semibold"
                >
                  /&nbsp;{product.brand}
                </Link>
              </div>
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.brand}
                  className="w-96 h-96 object-cover"
                />
                <span className="absolute top-2 left-3 px-3 py-1">
                  <HeartIcon product={product} />
                </span>
              </div>
            </section>
            <section className="ml-10">
              <div className="py-4"></div>
              <div className="text-sm text-gray-500 py-4 text-start">
                <h2 className="text-3xl font-bold mb-4 uppercase">
                  {product.brand}
                </h2>
                <p className="text-gray-600 mb-4 capitalize">
                  {product.description}
                </p>
                <div className="flex justify-items-center space-x-4 mb-2">
                  <span className="text-xl text-teal-900 font-bold">
                    &#8377;{product.price}
                  </span>
                  <span className="text-gray-500 line-through text-xl">
                    &#8377;{product.cutPrice}
                  </span>
                </div>
                <span className="text-[#649899] font-semibold">
                  inclusive of all taxes
                </span>
                <div className="flex justify-items-center mt-4 w-[12rem] h-10 p-2 border-2 border-gray-200 hover:border-gray-400">
                  <div className="flex justify-items-center">
                    {`${product.rating} Ratings`}
                  </div>
                  <span className="ml-2 text-gray-600">
                    | {`${product.numReviews} Reviews`}
                  </span>
                </div>

                <div className="mb-6 btn-container"></div>
                <button
                  onClick={addToCartHandler}
                  className="w-[10rem] bg-[#649899] text-white py-3 px-6 rounded-md hover:bg-[#649869] cursor-pointer"
                >
                  Add to Bag
                </button>
              </div>
            </section>
          </>
        )}
      </div>
      <div className="mt-10 ml-32  justify-items-center">
        <ProductTabs
          loadingProductReview={loadingProductReview}
          userInfo={userInfo}
          submitHandler={submitHandler}
          rating={rating}
          setRating={setRating}
          comment={comment}
          setComment={setComment}
          product={product}
        />
      </div>
    </>
  );
};
export default ProductDetails;
