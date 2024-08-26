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
  const [paymentMethod, setPaymentMethod] = useState("PayPal");

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
    <div className="max-w-3xl mx-auto px-3 py-6">
      <ProgressSteps step1 step2 />

      <header className="text-center mb-6">
        <h1 className="text-3xl font-semibold">Billing details</h1>
      </header>

      <form onSubmit={submitHandler} className="space-y-4">
        <div>
          <label htmlFor="full-name" className="block text-base font-medium">
            Full Name*
          </label>
          <input
            type="text"
            id="full-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-1.5 text-sm"
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
            className="mt-1 block w-full border border-gray-300 rounded-md p-1.5 text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-base font-medium">
            Email address*
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-1.5 text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="address" className="block text-base font-medium">
            Street address*
          </label>
          <input
            type="text"
            id="address"
            placeholder="House number and street name"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-1.5 text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="city" className="block text-base font-medium">
            Town / City*
          </label>
          <input
            type="text"
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-1.5 text-sm"
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
            className="mt-1 block w-full border border-gray-300 rounded-md p-1.5 text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="state" className="block text-base font-medium">
            State / Province*
          </label>
          <input
            type="text"
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-1.5 text-sm"
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
            className="mt-1 block w-full border border-gray-300 rounded-md p-1.5 text-sm"
            required
          />
        </div>
        <div className="mt-6 text-right">
          <button
            type="submit"
            className="bg-orange-600 text-white text-lg font-bold py-2 px-4 rounded-md"
          >
            Place Order
          </button>
        </div>
      </form>
    </div>
  );
};

export default Shipping;
