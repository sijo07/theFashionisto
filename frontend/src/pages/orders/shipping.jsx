import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  saveShippingAddress,
  savePaymentMethod,
} from "../../redux/features/cart/cartSlice";
import ProgressSteps from "../../components/progressSteps";

const Shipping = () => {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const [name, setName] = useState(shippingAddress.name || "");
  const [phone, setPhone] = useState(shippingAddress.phone || "");
  const [email, setEmail] = useState(shippingAddress.email || "");
  const [address, setAddress] = useState(shippingAddress.address || "");
  const [city, setCity] = useState(shippingAddress.city || "");
  const [pinCode, setPinCode] = useState(shippingAddress.pinCode || "");
  const [state, setState] = useState(shippingAddress.state || "");
  const [country, setCountry] = useState(shippingAddress.country || "");
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();

    dispatch(
      saveShippingAddress({
        name,
        phone,
        email,
        address,
        city,
        pinCode,
        state,
        country,
      })
    );
    dispatch(savePaymentMethod(paymentMethod));
    navigate("/placeorder");
  };

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate("/shipping");
    }
  }, [navigate, shippingAddress]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 bg-white shadow-lg rounded-md">
      <ProgressSteps step1 step2 />

      <header className="text-center mb-6">
        <h1 className="text-2xl py-3 font-semibold text-gray-800 capitalize">
          shipping Address
        </h1>
      </header>

      <form onSubmit={submitHandler} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="full-name" className="block text-base font-medium">
              Full Name*
            </label>
            <input
              type="text"
              id="full-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-base font-medium">
              Phone*
            </label>
            <input
              type="text"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="email" className="block text-base font-medium">
              Email Address*
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-base font-medium">
              Street Address*
            </label>
            <input
              type="text"
              id="address"
              placeholder="House number and street name"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="city" className="block text-base font-medium">
              Town / City*
            </label>
            <input
              type="text"
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
          <div>
            <label htmlFor="pin-code" className="block text-base font-medium">
              Postal Code / Zip Code*
            </label>
            <input
              type="text"
              id="pin-code"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="state" className="block text-base font-medium">
              State / Province*
            </label>
            <input
              type="text"
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
          <div>
            <label htmlFor="country" className="block text-base font-medium">
              Country*
            </label>
            <input
              type="text"
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
        </div>

        <div className="my-8">
          <label className="block text-lg font-bold mb-4 text-gray-700">Select Payment Method</label>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-colors">
              <input
                type="radio"
                name="paymentMethod"
                value="Credit Card"
                checked={paymentMethod === "Credit Card"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-5 h-5 text-teal-600 focus:ring-teal-500 border-gray-300"
              />
              <span className="text-gray-800 font-medium">Credit Card / Debit Card</span>
            </label>

            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-colors">
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={paymentMethod === "COD"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-5 h-5 text-teal-600 focus:ring-teal-500 border-gray-300"
              />
              <span className="text-gray-800 font-medium">Cash on Delivery (COD)</span>
            </label>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            type="submit"
            className="bg-teal-600 text-white text-lg font-bold py-3 px-4 rounded-md shadow hover:bg-teal-700 transition duration-200"
          >
            Place Order
          </button>
        </div>
      </form>
    </div>
  );
};

export default Shipping;
