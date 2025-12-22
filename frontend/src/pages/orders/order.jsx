import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Message, Loader } from "../../components/index";
import {
  useDeliverOrderMutation,
  useGetOrderDetailsQuery,
  usePayOrderMutation,
  useUpdateOrderStatusMutation,
} from "../../redux/api/orderApiSlice";
import { FaBox, FaTruck, FaCheckCircle, FaClipboardList } from "react-icons/fa";
import moment from "moment";

const Order = () => {
  const { id: orderId } = useParams();

  const {
    data: order,
    refetch,
    isLoading,
    error,
  } = useGetOrderDetailsQuery(orderId);

  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();
  const [deliverOrder, { isLoading: loadingDeliver }] = useDeliverOrderMutation();
  const [updateOrderStatus, { isLoading: loadingStatusUpdate }] = useUpdateOrderStatusMutation();

  const { userInfo } = useSelector((state) => state.auth);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (order) {
      setStatus(order.orderStatus || "Processing");
    }
  }, [order]);

  const onApprove = async () => {
    try {
      await payOrder({ orderId, details: { id: "MOCK_PAYMENT_ID", status: "COMPLETED", payer: {} } });
      refetch();
      toast.success("Order is paid");
    } catch (error) {
      toast.error(error?.data?.message || error.message);
    }
  };

  const statusHandler = async () => {
    try {
      await updateOrderStatus({ orderId, status });
      refetch();
      toast.success("Order status updated");
    } catch (error) {
      toast.error(error?.data?.message || error.message);
    }
  };

  const deliverHandler = async () => {
    await deliverOrder(orderId);
    refetch();
  };

  // Status Stepper Logic
  const steps = [
    { name: "Placed", icon: <FaClipboardList />, active: true },
    { name: "Processing", icon: <FaBox />, active: order?.orderStatus === "Processing" || order?.orderStatus === "Shipped" || order?.orderStatus === "Delivered" },
    { name: "Shipped", icon: <FaTruck />, active: order?.orderStatus === "Shipped" || order?.orderStatus === "Delivered" },
    { name: "Delivered", icon: <FaCheckCircle />, active: order?.orderStatus === "Delivered" || order?.isDelivered },
  ];

  return isLoading ? (
    <Loader />
  ) : error ? (
    <Message variant="danger">{error?.data?.message || error?.error || "An error occurred"}</Message>
  ) : (
    <div className="container mx-auto px-4 py-8 font-sans text-gray-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderId || order._id}</h1>
          <p className="text-gray-500 mt-1 text-sm">Placed on {moment(order.createdAt).format("MMMM Do YYYY, h:mm a")}</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${order.isPaid ? "bg-green-100 text-[#00a550]" : "bg-red-100 text-red-600"
            }`}>
            {order.isPaid ? "Paid" : "Unpaid"}
          </span>
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${order.isDelivered ? "bg-green-100 text-[#00a550]" : "bg-blue-100 text-blue-600"
            }`}>
            {order.isDelivered ? "Delivered" : order.orderStatus}
          </span>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="mb-12 w-full px-4 overflow-x-auto">
        <div className="flex items-center justify-between relative min-w-[300px]">
          <div className="absolute left-0 top-[18px] transform w-full h-0.5 bg-gray-200 -z-10"></div>
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center bg-white px-4">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-300 mb-2
                ${step.active
                    ? "border-[#00a550] text-[#00a550] bg-white"
                    : "border-gray-200 text-gray-300 bg-white"}`}
              >
                {step.icon}
              </div>
              <span className={`text-xs font-bold uppercase tracking-wide ${step.active ? "text-[#00a550]" : "text-gray-400"}`}>
                {step.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-white px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Order Items</h2>
            </div>
            <div className="p-6">
              {order.orderItems.length === 0 ? (
                <Message>Order is empty</Message>
              ) : (
                <div className="divide-y divide-gray-50">
                  {order.orderItems.map((item, index) => (
                    <div key={index} className="flex items-start py-6 hover:bg-gray-50 transition-colors -mx-6 px-6">
                      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="ml-6 flex-1">
                        <Link to={`/product/${item.product}`} className="text-sm font-bold text-gray-900 hover:text-[#00a550] transition-colors">
                          {item.name}
                        </Link>
                        <p className="text-xs text-gray-500 mt-1">Brand: {item.brand || "N/A"}</p>
                        <p className="text-xs text-gray-500 mt-2">Qty: {item.qty} x ${item.price}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-gray-900">${(item.qty * item.price).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Actions */}
        <div className="lg:col-span-1 space-y-6">

          {/* Admin Status Control */}
          {userInfo && userInfo.isAdmin && !order.isDelivered && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">Update Status</h2>
              <div className="flex flex-col space-y-3">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#00a550] focus:border-[#00a550] bg-gray-50"
                >
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                </select>
                <button
                  onClick={statusHandler}
                  disabled={loadingStatusUpdate}
                  className="w-full bg-[#00a550] text-white text-sm font-bold py-2.5 rounded-md hover:bg-[#008f45] transition shadow-sm"
                >
                  {loadingStatusUpdate ? "Updating..." : "Update Status"}
                </button>
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-800 mb-6">Order Summary</h2>
            <div className="space-y-4 text-sm font-medium text-gray-600">
              <div className="flex justify-between"><span>Items</span><span className="text-gray-900">${order.itemsPrice}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span className="text-gray-900">${order.shippingPrice}</span></div>
              <div className="flex justify-between"><span>Tax</span><span className="text-gray-900">${order.taxPrice}</span></div>
              <div className="border-t border-gray-100 pt-4 flex justify-between font-bold text-lg text-gray-900">
                <span>Total</span><span>${order.totalPrice}</span>
              </div>
            </div>

            {!order.isPaid && (
              <div className="mt-6">
                {order.paymentMethod === "COD" ? (
                  <div className="bg-blue-50 text-blue-700 p-3 rounded-md text-xs text-center font-bold">
                    Cash on Delivery
                  </div>
                ) : (
                  <button
                    className="w-full bg-[#00a550] text-white font-bold py-3 rounded-md hover:bg-[#008f45] transition shadow-md uppercase text-sm tracking-wide"
                    onClick={onApprove}
                    disabled={loadingPay}
                  >
                    {loadingPay ? "Processing..." : "Pay Now"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Shipping Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-800 mb-4">Shipping Info</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <span className="font-bold text-gray-900 block">Name:</span>
                {order.user?.username || order.user?.name || "N/A"}
              </div>
              <div>
                <span className="font-bold text-gray-900 block">Email:</span>
                {order.user?.email || "N/A"}
              </div>
              <div>
                <span className="font-bold text-gray-900 block">Order ID:</span>
                {order.orderId || order._id}
              </div>
              <div>
                <span className="font-bold text-gray-900 block">Address:</span>
                {order.shippingAddress.address}, {order.shippingAddress.city}<br />
                {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              </div>

              <div className="pt-2 border-t border-gray-50 mt-2">
                {order.isDelivered ? (
                  <span className="flex items-center text-[#00a550] font-bold text-xs uppercase">
                    <FaCheckCircle className="mr-2" /> Delivered on {moment(order.deliveredAt).format("MMM Do YY")}
                  </span>
                ) : (
                  <span className="flex items-center text-orange-500 font-bold text-xs uppercase">
                    <FaTruck className="mr-2" /> Status: {order.orderStatus}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-800 mb-4">Payment Info</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <span className="font-bold text-gray-900 block">Method:</span>
                {order.paymentMethod}
              </div>

              <div className="pt-2 border-t border-gray-50 mt-2">
                {order.isPaid ? (
                  <span className="flex items-center text-[#00a550] font-bold text-xs uppercase">
                    <FaCheckCircle className="mr-2" /> Paid on {moment(order.paidAt).format("MMM Do YY")}
                  </span>
                ) : (
                  <span className="flex items-center text-red-500 font-bold text-xs uppercase">
                    Pending Payment
                  </span>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Order;