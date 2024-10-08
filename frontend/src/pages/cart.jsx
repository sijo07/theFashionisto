import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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

const totalMRP = cartItems.reduce(
  (acc, item) => acc + (Number(item.cutPrice) || 0) * (Number(item.qty) || 1), 
  0
);

const totalDiscount = cartItems.reduce(
  (acc, item) =>
    acc +
    (Number(item.cutPrice) - Number(item.price)) * (Number(item.qty) || 1), 
  0
);

const totalAmount = totalMRP - totalDiscount;


  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="text-sm text-gray-600 mb-4">
          <Link to="/" className="hover:underline">
            HOME&nbsp;
          </Link>
          <Link to="/shop" className="hover:underline uppercase">
            /&nbsp;Shop&nbsp;
          </Link>
          /&nbsp;<span className="font-bold">SHOPPING CART</span>
        </div>

        {cartItems.length === 0 ? (
          <div>
            Your cart is empty <Link to="/shop">Go To Shop</Link>
          </div>
        ) : (
          <>
            {cartItems.map((item) => (
              <div key={item._id} className="flex items-start mb-4">
                <img
                  src={item.image}
                  alt={item.brand}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="ml-4 flex-grow">
                  <p className="font-bold">{item.brand}</p>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Qty:
                      </label>
                      <div className="relative inline-block">
                        <select
                          className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 appearance-none text-center leading-6 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200 ease-in-out"
                          value={item.qty}
                          onChange={(e) =>
                            addToCartHandler(item, Number(e.target.value))
                          }
                        >
                          {[
                            ...Array(Math.min(item.countInStock, 10)).keys(),
                          ].map((x) => (
                            <option key={x + 1} value={x + 1}>
                              {x + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center mt-2 space-x-4">
                    <div>
                      <p className="text-lg font-semibold text-teal-500">
                        ₹{item.price}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 line-through">
                        ₹{item.cutPrice}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={() => removeFromCartHandler(item._id)}
                    className="text-sm bg-white text-gray-400 w-[4rem] hover:text-red-600 border-2 border-gray-200 font-semibold capitalize"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <div className="bg-white p-4 rounded-lg shadow mb-4">
              <p className="font-bold mb-2">
                PRICE DETAILS ({cartItems.length}{" "}
                {cartItems.length > 1 ? "Items" : "Item"})
              </p>
              <div className="flex justify-between mb-2">
                <p className="text-sm">Total MRP</p>
                <p className="text-sm font-semibold">₹{totalMRP.toFixed(2)}</p>
              </div>
              <div className="flex justify-between mb-2">
                <p className="text-sm">Discount on MRP</p>
                <p className="text-sm font-semibold text-green-500">
                  - ₹{totalDiscount.toFixed(2)}
                </p>
              </div>
              <div className="flex justify-between font-bold text-lg mb-4">
                <p>Total Amount</p>
                <p>₹{totalAmount.toFixed(2)}</p>
              </div>
              <button
                className="bg-[#649899] hover:bg-green-700 text-white w-full py-2 rounded font-bold uppercase"
                onClick={checkoutHandler}
              >
                Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
