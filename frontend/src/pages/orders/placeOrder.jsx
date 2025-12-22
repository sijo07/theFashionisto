import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import ProgressSteps from "../../components/progressSteps";
import { Message, Loader } from "../../components/index";
import { useCreateOrderMutation } from "../../redux/api/orderApiSlice";
import { clearCartItems } from "../../redux/features/cart/cartSlice";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);
  const [createOrder, { isLoading, error }] = useCreateOrderMutation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!cart.shippingAddress.address) {
      navigate("/shipping");
    }
  }, [cart.shippingAddress.address, navigate]);

  const placeOrderHandler = async () => {
    if (cart.cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      const res = await createOrder({
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
      }).unwrap();
      dispatch(clearCartItems());
      navigate(`/order/${res._id}`);
    } catch (err) {
      toast.error(
        err?.data?.message || err.message || "Failed to create order"
      );
    }
  };

  const itemsPrice = Number(cart.itemsPrice) || 0;
  const shippingPrice = Number(cart.shippingPrice) || 0;
  const taxPrice = Number(cart.taxPrice) || 0;
  const totalPrice = Number(cart.totalPrice) || 0;

  return (
    <div className="py-10">
      <ProgressSteps step1 step2 step3 />
      <div className="container mx-auto p-4">
        {cart.cartItems.length === 0 ? (
          <Message>Your cart is empty</Message>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Items */}
            <div className="col-span-2 bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-5">Review Items</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left">Image</th>
                      <th className="px-4 py-2 text-left">Product</th>
                      <th className="px-4 py-2 text-left">Quantity</th>
                      <th className="px-4 py-2 text-left">Price</th>
                      <th className="px-4 py-2 text-left">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.cartItems.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">
                          <img
                            src={item.image}
                            alt={item.brand}
                            className="w-16 h-16 object-cover"
                          />
                        </td>
                        <td className="p-2">
                          <Link
                            to={`/product/${item.product}`}
                            className="text-blue-500 hover:underline"
                          >
                            {item.brand}
                          </Link>
                        </td>
                        <td className="p-2">{item.qty}</td>
                        <td className="p-2">&#x20b9;{item.price.toFixed(2)}</td>
                        <td className="p-2">
                          &#x20b9;{(item.qty * item.price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white p-3 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-3">Order Summary</h2>
              <ul className="text-base mb-4">
                <li className="flex justify-between py-1">
                  <span className="font-semibold">Items:</span> &#x20b9;
                  {itemsPrice.toFixed(2)}
                </li>
                <li className="flex justify-between py-1">
                  <span className="font-semibold">Shipping:</span> &#x20b9;
                  {shippingPrice.toFixed(2)}
                </li>
                <li className="flex justify-between py-1">
                  <span className="font-semibold">Tax:</span> &#x20b9;
                  {taxPrice.toFixed(2)}
                </li>
                <li className="flex justify-between py-1 font-bold">
                  <span>Total:</span> &#x20b9;{totalPrice.toFixed(2)}
                </li>
              </ul>

              {error && (
                <Message variant="danger">{error?.data?.message || error?.error || "An error occurred"}</Message>
              )}

              <div className="mb-3 border border-gray-300 rounded-lg p-2 bg-gray-50 font-semibold text-sm">
                <h2 className="capitalize font-bold mb-1">
                  Shipping Address
                </h2>
                <p className="mb-1 text-xs capitalize">
                  {cart.shippingAddress.name}
                </p>
                <p className="mb-1 text-xs">{cart.shippingAddress.phone}</p>
                <p className="mb-1 text-xs">{cart.shippingAddress.email}</p>
                <p className="mb-1 text-xs capitalize">
                  {cart.shippingAddress.address}&nbsp;
                  {cart.shippingAddress.city}&nbsp;
                  {cart.shippingAddress.state}&nbsp;
                  {cart.shippingAddress.country}&nbsp;
                  {cart.shippingAddress.pinCode}
                </p>
              </div>

              <div className="mb-3">
                <h2 className="text-xl font-semibold mb-1">Payment Method</h2>
                <p className="text-sm">
                  <strong>Method: </strong>
                  <span className="font-semibold">{cart.paymentMethod}</span>
                </p>
              </div>

              <button
                type="button"
                className="bg-teal-600 hover:bg-green-600 font-semibold text-white py-2 px-4 rounded-full text-lg w-full mt-4"
                disabled={cart.cartItems.length === 0}
                onClick={placeOrderHandler}
              >
                Place Order
              </button>

              {isLoading && <Loader />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceOrder;