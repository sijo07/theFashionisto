import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import Message from "../../components/message";
import ProgressSteps from "../../components/progressSteps";
import Loader from "../../components/loader";
import { useCreateOrderMutation } from "../../redux/api/orderApiSlice";
import { clearCartItems } from "../../redux/features/cart/cartSlice";

const PlaceOrder = () => {
  const navigate = useNavigate();

  const cart = useSelector((state) => state.cart);

  const [createOrder, { isLoading, error }] = useCreateOrderMutation();

  useEffect(() => {
    if (!cart.shippingAddress.address) {
      navigate("/shipping");
    }
  }, [cart.paymentMethod, cart.shippingAddress.address, navigate]);

  const dispatch = useDispatch();

  const placeOrderHandler = async () => {
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
    } catch (error) {
      toast.error(error);
    }
  };

  // Ensure these are numbers or default to 0
  const itemsPrice = Number(cart.itemsPrice) || 0;
  const shippingPrice = Number(cart.shippingPrice) || 0;
  const taxPrice = Number(cart.taxPrice) || 0;
  const totalPrice = Number(cart.totalPrice) || 0;

  return (
    <>
      <ProgressSteps step1 step2 step3 />

      <div className="container mx-auto mt-8 p-4">
        {cart.cartItems.length === 0 ? (
          <Message>Your cart is empty</Message>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Items */}
            <div className="col-span-2 bg-white p-4 rounded-lg shadow">
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
                        <td className="p-2">${item.price.toFixed(2)}</td>
                        <td className="p-2">
                          $ {(item.qty * item.price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-5">Order Summary</h2>
              <ul className="text-lg mb-4">
                <li className="flex justify-between py-2">
                  <span className="font-semibold">Items:</span> $
                  {itemsPrice.toFixed(2)}
                </li>
                <li className="flex justify-between py-2">
                  <span className="font-semibold">Shipping:</span> $
                  {shippingPrice.toFixed(2)}
                </li>
                <li className="flex justify-between py-2">
                  <span className="font-semibold">Tax:</span> $
                  {taxPrice.toFixed(2)}
                </li>
                <li className="flex justify-between py-2">
                  <span className="font-semibold">Total:</span> $
                  {totalPrice.toFixed(2)}
                </li>
              </ul>

              {error && (
                <Message variant="danger">{error.data.message}</Message>
              )}

              <div className="mb-4">
                <h2 className="text-2xl font-semibold mb-2">Shipping</h2>
                <p>
                  <strong>Address:</strong>
                  {cart.shippingAddress.name},{cart.shippingAddress.phone},
                  {cart.shippingAddress.email},{cart.shippingAddress.address},
                  {cart.shippingAddress.city}
                  {cart.shippingAddress.pinCode},{cart.shippingAddress.state},
                  {cart.shippingAddress.country}
                </p>
              </div>

              <div className="mb-4">
                <h2 className="text-2xl font-semibold mb-2">Payment Method</h2>
                <p>
                  <strong>Method:</strong> {cart.paymentMethod}
                </p>
              </div>

              <button
                type="button"
                className="bg-pink-500 text-white py-2 px-4 rounded-full text-lg w-full mt-4"
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
    </>
  );
};

export default PlaceOrder;
