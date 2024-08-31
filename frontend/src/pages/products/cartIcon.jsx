import { RiShoppingBag4Fill, RiShoppingBagFill } from "react-icons/ri";
import { useSelector, useDispatch } from "react-redux";
import { addToCart, removeFromCart } from "../../redux/features/cart/cartSlice";

const CartIcon = ({ product }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cartItems) || [];
  const isInCart = cartItems.some((p) => p._id === product?._id);

  const toggleCart = () => {
    if (!product || !product._id) return; 

    if (isInCart) {
      dispatch(removeFromCart(product._id));
    } else {
      dispatch(addToCart({ ...product, qty: 1 }));
    }
  };

  return (
    <div
      className="flex items-center justify-center m-6 border border-gray-300 cursor-pointer w-[5rem] h-[2rem]"
      onClick={toggleCart}
    >
      {isInCart ? (
        <>
          <span className="text-sm mr-1">Added</span>
          <RiShoppingBagFill className="text-[#4caf65] text-lg" />
        </>
      ) : (
        <>
          <span className="text-sm mr-1 text-gray-600">Bag</span>
          <RiShoppingBag4Fill className="text-gray-400 text-lg" />
        </>
      )}
    </div>
  );
};

export default CartIcon;
