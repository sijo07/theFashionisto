import { useSelector } from "react-redux";

const CartCount = () => {
  const cartItems = useSelector((state) => state.cart.cartItems || []);
  console.log(cartItems);
  const cartCount = cartItems.length;

  return (
    <div className="fixed">
      {cartCount > 0 && (
        <span className="px-1 py-0 ml-1 text-xs text-white bg-[#649899] rounded-xl">
          {cartCount}
        </span>
      )}
    </div>
  );
};

export default CartCount;
