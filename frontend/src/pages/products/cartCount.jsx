import { useSelector } from "react-redux";

const CartCount = () => {
  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;
  const itemCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    itemCount > 0 && (
      <span className="bg-[#00a550] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
        {itemCount}
      </span>
    )
  );
};

export default CartCount;
