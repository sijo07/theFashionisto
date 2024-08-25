import { Link } from "react-router-dom";
import { FcPlus, FcRating } from "react-icons/fc";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { toast } from "react-toastify";
import HeartIcon from "./HeartIcon";

const ProductCard = ({ p }) => {
  const dispatch = useDispatch();

  const addToCartHandler = (product, qty) => {
    dispatch(addToCart({ ...product, qty }));
    toast.success("Item added successfully");
  };

  return (
    <div className="max-w-screen-xl relative mx-auto text-center md:text-left bg-white">
      <section className="relative">
        <Link to={`/product/${p._id}`}>
          <img
            className="w-72 h-72 object-cover cursor-pointer"
            src={p.image}
            alt={p.name}
          />
          <span className="absolute flex bottom-3 right-3 bg-white text-sm font-medium mr-2 px-2.5 py-0.5 rounded-full oldstyle-nums">
            <FcRating className="m-1" size={14} />
            {p.rating}
          </span>
        </Link>
        <HeartIcon product={p} />
      </section>

      <div className="px-4 py-3">
        <div className="flex justify-between">
          <h2 className="text-gray-400 text-start uppercase text-sm">
            {p.brand}
          </h2>
          <p className="text-xs text-gray-600 font-bold block truncate capitalize text-end lining-nums">
            {p?.price?.toLocaleString("en-in", {
              style: "currency",
              currency: "INR",
            })}
          </p>
        </div>

        <p className="text-gray-600 text-xs pt-1 font-bold block truncate capitalize text-start">
          {p?.description}
        </p>

        <section className="flex justify-between items-center">
          <div className="inline-flex items-center py-2 text-sm font-medium text-center">
            <p className="text-gray-600 text-start capitalize text-sm">
              size - {p.size}
            </p>
          </div>

          <button
            className="p-2 rounded-full"
            onClick={() => addToCartHandler(p, 1)}
          >
            <FcPlus size={20} />
          </button>
        </section>
      </div>
    </div>
  );
};

export default ProductCard;
