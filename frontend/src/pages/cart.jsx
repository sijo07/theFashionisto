import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaTimes } from "react-icons/fa";
import { addToCart, removeFromCart } from "../redux/features/cart/cartSlice";

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const addToCartHandler = (product, qty) => {
    if (qty > 0 && qty <= product.countInStock) {
      dispatch(addToCart({ ...product, qty }));
    }
  };

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    navigate("/login?redirect=/shipping");
  };
  return (
    <>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-sm text-gray-500 py-4">
          <a href="#" className="hover:underline">
            HOME
          </a>
          /
          <a href="#" className="hover:underline">
            SHOP
          </a>
          /
          <a href="#" className="hover:underline uppercase">
            Cart
          </a>
        </div>
        {cartItems.length === 0 ? (
          <div>
            Your cart is empty <Link to="/shop">Go To Shop</Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-row items-center justify-items-center"
                >
                  <div className="w-full h-full">
                    <img
                      src={item.image}
                      alt={item.brand}
                      className="w-72 h-80 object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <h2 className="text-3xl font-bold mb-4 uppercase">
                        {item.brand}
                      </h2>
                      <button onClick={() => removeFromCartHandler(item._id)}>
                        <FaTimes size={22} className="mb-3 text-red-700" />
                      </button>
                    </div>
                    <div className="flex items-center space-x-4 mb-6">
                      <span className="text-gray-500 line-through text-xl ml-1">
                        &#8377;{item.cutPrice}
                      </span>
                      <span className="text-xl text-teal-600 font-bold">
                        &#8377;{item.price}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-6">{item.description}</p>
                    <div className="mb-6">
                      <select
                        className="block w-full py-3 px-4 border border-gray-300 rounded-md focus:ring focus:ring-opacity-50"
                        value={item.qty}
                        onChange={(e) =>
                          addToCartHandler(item, Number(e.target.value))
                        }
                      >
                        {[...Array(item.countInStock).keys()].map((x) => (
                          <option key={x + 1} value={x + 1}>
                            {x + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mt-6">
                      <p>
                        <strong>Qty:</strong>
                        {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                      </p>
                      <p>
                        <strong>Total:</strong>{" "}
                        {cartItems
                          .reduce((acc, item) => acc + item.qty * item.price, 0)
                          .toFixed(2)}
                      </p>
                    </div>
                    <div className="mt-4">
                      <button
                        className="w-full bg-teal-800 text-white py-3 px-6 rounded-md hover:bg-teal-600 capitalize"
                        disabled={cartItems.length === 0}
                        onClick={checkoutHandler}
                      >
                        Checkout
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};
export default Cart;
