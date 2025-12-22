
import Message from "../../components/message";
import Loader from "../../components/loader";
import { Link } from "react-router-dom";
import { useGetOrdersQuery, useUpdateOrderStatusMutation, usePayOrderMutation, useUpdateOrderItemStatusMutation } from "../../redux/api/orderApiSlice";
import { FaSearch, FaBell, FaDownload, FaEye, FaEllipsisH, FaUserCircle, FaTruck, FaCheckCircle, FaTimesCircle, FaBoxOpen, FaMapMarkerAlt, FaCreditCard, FaMoneyBillWave, FaCalendarAlt, FaTimes, FaRupeeSign } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import AdminHeader from "./AdminHeader";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const OrderList = () => {
  const { data: orders, isLoading, error, refetch } = useGetOrdersQuery(undefined, { pollingInterval: 0 });
  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const [updateOrderItemStatus] = useUpdateOrderItemStatusMutation();
  const [payOrder] = usePayOrderMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [openActionId, setOpenActionId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenActionId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStatusUpdate = async (orderId, itemId, status) => {
    try {
      await updateOrderItemStatus({ orderId, itemId, status }).unwrap();
      refetch();
      toast.success(`Item updated to ${status} `);
      setOpenActionId(null);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleMarkAsPaid = async (orderId) => {
    try {
      await payOrder({ orderId, details: { status: "COMPLETED" } }).unwrap();
      refetch();
      toast.success("Order marked as Paid");
      setOpenActionId(null);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  // Calculate Stats
  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter(o => o.orderStatus === "Pending" || (!o.isPaid && !o.isDelivered)).length || 0;
  const processingOrders = orders?.filter(o => o.orderStatus === "Processing" || (o.isPaid && !o.isDelivered)).length || 0;
  const completedOrders = orders?.filter(o => o.isDelivered || o.orderStatus === "Completed" || o.orderStatus === "Delivered").length || 0;

  const filteredOrders = orders?.filter(order => {
    const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }).toLowerCase();
    const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.totalPrice.toString().includes(searchTerm) ||
      formattedDate.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All Status" || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    if (!filteredOrders || filteredOrders.length === 0) {
      toast.error("No orders to export");
      return;
    }

    const headers = ["Order ID", "Customer Name", "Customer Email", "Date", "Total Price", "Status", "Payment Method", "Is Paid", "Is Delivered"];

    const csvContent = [
      headers.join(","),
      ...filteredOrders.map(order => {
        const date = new Date(order.createdAt).toLocaleDateString();
        return [
          order._id,
          `"${order.user?.username || 'Guest'}"`,
          `"${order.user?.email || 'N/A'}"`,
          date,
          order.totalPrice,
          order.orderStatus,
          order.paymentMethod,
          order.isPaid ? "Yes" : "No",
          order.isDelivered ? "Yes" : "No"
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900" onClick={() => setOpenActionId(null)}>
      {/* Top Header */}
      {/* Top Header */}
      {/* Top Header */}
      <AdminHeader title="Orders" subtitle="Track and manage customer orders">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-100 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-gray-200 w-64"
          />
        </div>
      </AdminHeader>

      <div className="p-8">
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">{error?.data?.message || error.error}</Message>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatCard title="Total Orders" value={totalOrders} />
              <StatCard title="Pending" value={pendingOrders} />
              <StatCard title="Processing" value={processingOrders} />
              <StatCard title="Completed" value={completedOrders} />
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div className="flex gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-gray-400"
                  />
                </div>
                <select
                  className="bg-white border border-gray-200 rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-gray-400"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option>All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 font-medium shadow-sm transition-colors"
              >
                <FaDownload /> Export
              </button>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden min-h-[500px] animate-fade-in-up">
              <table className="min-w-full divide-y divide-gray-100">
                <thead>
                  <tr className="bg-gradient-to-r from-[#649899] to-[#2D5C5D] text-white">
                    <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider">Product Item</th>
                    <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider">Details</th>
                    <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                    <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider">Date</th>
                    <th className="px-6 py-5 text-right text-xs font-bold uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.flatMap(order =>
                      order.orderItems.map((item, itemIndex) => ({ order, item, itemIndex, key: `${order._id} -${item._id || itemIndex} ` }))
                    ).map(({ order, item, key }) => (
                      <tr
                        key={key}
                        className="hover:bg-teal-50/50 transition-all duration-200 group bg-white"
                      >
                        {/* Product Column */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="max-w-[180px]">
                              <p className="font-bold text-gray-800 text-sm line-clamp-1" title={item.name}>{item.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">Brand: {item.brand || 'N/A'}</p>
                            </div>
                          </div>
                        </td>

                        {/* Order ID */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-xs font-bold text-[#2D5C5D] bg-teal-50 px-2 py-1 rounded-md border border-teal-100 group-hover:bg-teal-100 transition-colors">
                            #{order.orderId || order._id.substring(0, 6).toUpperCase()}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-500 mr-2 shadow-sm border border-indigo-50">
                              <span className="font-bold text-[10px]">{order.user?.username?.charAt(0).toUpperCase() || "G"}</span>
                            </div>
                            <div>
                              <div className="text-xs font-bold text-gray-800">{order.user?.username || "Guest"}</div>
                              <div className="text-[10px] text-gray-400">{order.user?.email || "No email"}</div>
                            </div>
                          </div>
                        </td>

                        {/* Details (Qty/Price) */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900">₹{item.price}</span>
                            <span className="text-xs text-gray-500">Qty: {item.qty} {item.size && `• Size: ${item.size} `}</span>
                          </div>
                        </td>

                        {/* Status (Order Level) */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={item.itemStatus || order.orderStatus} isDelivered={item.isDelivered || order.isDelivered} />
                        </td>

                        {/* Payment */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs">
                          <PaymentBadge isPaid={order.isPaid} method={order.paymentMethod} />
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-medium">
                          {new Date(order.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}
                        </td>

                        {/* Actions (Order Level) */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                          <div className="flex items-center justify-end space-x-3">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="text-gray-400 hover:text-[#AC7D88] hover:bg-pink-50 p-2 rounded-full transition-all"
                              title="View Full Order"
                            >
                              <FaEye size={16} />
                            </button>
                            <div className="relative">
                              <button
                                className={`text - gray - 400 hover: text - gray - 600 p - 2 rounded - full hover: bg - gray - 100 transition - all ${openActionId === `${order._id}-${item._id || item.itemIndex}` ? 'bg-gray-100 text-gray-600' : ''} `} // Unique ID for dropdown toggle per row
                                onClick={(e) => {
                                  e.stopPropagation();


                                  setOpenActionId(openActionId === `${order._id}-${item._id || item.itemIndex}` ? null : `${order._id}-${item._id || item.itemIndex}`);
                                }}
                              >
                                <FaEllipsisH size={16} />
                              </button>
                              {/* Action Modal */}
                              <AnimatePresence>
                                {openActionId === `${order._id}-${item._id || item.itemIndex}` && (
                                  <>
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpenActionId(null)} className="fixed inset-0 bg-black/40 z-[9999] backdrop-blur-sm" />
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.95 }}
                                      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-[10000] w-80 overflow-hidden"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Item Actions</h3>
                                        <button onClick={() => setOpenActionId(null)} className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                                          <FaTimesCircle size={18} />
                                        </button>
                                      </div>
                                      <div className="p-2 flex flex-col gap-1">

                                        {/* Mark Processing */}
                                        <button
                                          onClick={() => handleStatusUpdate(order._id, item._id, 'Processing')}
                                          disabled={(item.itemStatus || order.orderStatus) !== 'Pending'}
                                          className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors ${(item.itemStatus || order.orderStatus) !== 'Pending'
                                            ? "text-gray-300 cursor-not-allowed hidden" // Hide prev steps for cleanliness? Or just disable. User said "flow". disable is clearer context.
                                            : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                            }`}
                                        >
                                          <div className={`p-1.5 rounded-md ${(item.itemStatus || order.orderStatus) !== 'Pending' ? "bg-gray-100" : "bg-blue-100 text-blue-600"}`}>
                                            <FaBoxOpen size={12} />
                                          </div>
                                          Processing
                                        </button>

                                        {/* Mark Shipped */}
                                        <button
                                          onClick={() => handleStatusUpdate(order._id, item._id, 'Shipped')}
                                          disabled={(item.itemStatus || order.orderStatus) !== 'Processing'}
                                          className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors ${(item.itemStatus || order.orderStatus) !== 'Processing'
                                            ? "text-gray-300 cursor-not-allowed"
                                            : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                                            }`}
                                        >
                                          <div className={`p-1.5 rounded-md ${(item.itemStatus || order.orderStatus) !== 'Processing' ? "bg-gray-100" : "bg-purple-100 text-purple-600"}`}>
                                            <FaTruck size={12} />
                                          </div>
                                          Shipped
                                        </button>



                                        {/* Mark Delivered */}
                                        <button
                                          onClick={() => handleStatusUpdate(order._id, item._id, 'Delivered')}
                                          disabled={(item.itemStatus || order.orderStatus) !== 'Shipped'}
                                          className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors ${(item.itemStatus || order.orderStatus) !== 'Shipped'
                                            ? "text-gray-300 cursor-not-allowed"
                                            : "text-gray-700 hover:bg-green-50 hover:text-green-600"
                                            }`}
                                        >
                                          <div className={`p-1.5 rounded-md ${(item.itemStatus || order.orderStatus) !== 'Shipped' ? "bg-gray-100" : "bg-green-100 text-green-600"}`}>
                                            <FaCheckCircle size={12} />
                                          </div>
                                          Delivered
                                        </button>

                                        {/* Mark Paid (COD) - Only after Delivered */}
                                        {order.paymentMethod === "COD" && (
                                          <button
                                            onClick={() => handleMarkAsPaid(order._id)}
                                            // Strict: Only if Item Delivered AND Not Paid
                                            // Note: Payment handles WHOLE order currently. Can we split payment?
                                            // User asked for "product individually update" but implied status logic.
                                            // For now, allow Payment if ITEM is Delivered? Or only if ALL delivered?
                                            // Payment is usually per Order. User didn't ask to split payment.
                                            // Keep Payment check on Order logic, but enable if THIS item is delivered?
                                            // Complexity: If Item A delivered, can I pay whole order? Maybe partially?
                                            // User said "Delivered > Paid COD".
                                            // I will check if (itemStatus == Delivered) to enable Paid button.
                                            disabled={((item.itemStatus || order.orderStatus) !== 'Delivered' || order.isPaid)}
                                            className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors ${((item.itemStatus || order.orderStatus) !== 'Delivered' || order.isPaid)
                                              ? "text-gray-300 cursor-not-allowed"
                                              : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                                              }`}
                                          >
                                            <div className={`p-1.5 rounded-md ${((item.itemStatus || order.orderStatus) !== 'Delivered' || order.isPaid) ? "bg-gray-100" : "bg-emerald-100 text-emerald-600"}`}>
                                              <FaRupeeSign size={12} />
                                            </div>
                                            Mark Paid (COD)
                                          </button>
                                        )}

                                        {/* Mark Completed (Final) - Only after Delivered AND Paid */}
                                        <button
                                          onClick={() => handleStatusUpdate(order._id, item._id, 'Completed')}
                                          disabled={((item.itemStatus || order.orderStatus) !== 'Delivered' || !order.isPaid)}
                                          className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors ${((item.itemStatus || order.orderStatus) !== 'Delivered' || !order.isPaid)
                                            ? "text-gray-300 cursor-not-allowed"
                                            : "text-gray-700 hover:bg-gray-200 hover:text-gray-800"
                                            }`}
                                        >
                                          <div className={`p-1.5 rounded-md ${((item.itemStatus || order.orderStatus) !== 'Delivered' || !order.isPaid) ? "bg-gray-100" : "bg-gray-800 text-white"}`}>
                                            <FaCheckCircle size={12} />
                                          </div>
                                          Item Completed
                                        </button>

                                        <div className="border-t border-gray-100 my-1"></div>

                                        {/* Cancel Item */}
                                        <button
                                          onClick={() => handleStatusUpdate(order._id, item._id, 'Cancelled')}
                                          disabled={(item.itemStatus || order.orderStatus) === 'Completed' || (item.itemStatus || order.orderStatus) === 'Delivered' || (item.itemStatus || order.orderStatus) === 'Cancelled'}
                                          className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors ${((item.itemStatus || order.orderStatus) === 'Completed' || (item.itemStatus || order.orderStatus) === 'Delivered' || (item.itemStatus || order.orderStatus) === 'Cancelled')
                                            ? "text-gray-300 cursor-not-allowed"
                                            : "text-red-600 hover:bg-red-50"
                                            }`}
                                        >
                                          <div className={`p-1.5 rounded-md ${((item.itemStatus || order.orderStatus) === 'Completed' || (item.itemStatus || order.orderStatus) === 'Delivered' || (item.itemStatus || order.orderStatus) === 'Cancelled') ? "bg-gray-100" : "bg-red-100 text-red-600"}`}>
                                            <FaTimesCircle size={12} />
                                          </div>
                                          Cancel Item
                                        </button>
                                      </div>
                                    </motion.div>
                                  </>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-24 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="bg-gray-100 p-4 rounded-full mb-4">
                            <FaSearch className="text-gray-300 text-3xl" />
                          </div>
                          <p className="text-gray-500 text-lg font-medium">No orders found matching your criteria</p>
                          <p className="text-gray-400 text-sm mt-1">Try changing filters or search terms</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Order Details Modal */}
            {selectedOrder && (
              <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
            )}
          </>
        )}
      </div>
    </div >
  );
};

// Helper Components
const StatCard = ({ title, value, change, subtext }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
    <p className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">{title}</p>
    <div className="flex items-end justify-between">
      <h3 className="text-3xl font-serif font-bold text-[#649899]">{value}</h3>
      {change && <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full mb-1">{change}</span>}
      {subtext && <span className="text-xs text-gray-400 mb-1 italic">{subtext}</span>}
    </div>
  </div>
);

const StatusBadge = ({ status, isDelivered }) => {
  let colorClass = "bg-gray-100 text-gray-600 border-gray-200";
  let label = status || "Pending";
  let icon = null;

  const normalizedStatus = headerStatus(status);

  if (normalizedStatus === "Completed") {
    colorClass = "bg-gray-800 text-white border-gray-900"; // Dark for Final/Closed
    label = "Completed";
  } else if (isDelivered || normalizedStatus === "Delivered") {
    colorClass = "bg-green-100 text-green-700 border-green-200";
    label = "Delivered";
  } else if (normalizedStatus === "Processing") {
    colorClass = "bg-blue-100 text-blue-700 border-blue-200";
    label = "Processing";
  } else if (normalizedStatus === "Shipped") {
    colorClass = "bg-purple-100 text-purple-700 border-purple-200";
    label = "Shipped";
  } else if (normalizedStatus === "Cancelled") {
    colorClass = "bg-red-100 text-red-700 border-red-200";
    label = "Cancelled";
  } else {
    // Pending default
    colorClass = "bg-orange-100 text-orange-700 border-orange-200";
    label = "Pending";
  }

  return (
    <span className={`px - 3 py - 1 inline - flex items - center gap - 1.5 text - xs leading - 5 font - bold rounded - full border ${colorClass} `}>
      {label}
    </span>
  );
};

const PaymentBadge = ({ isPaid, method }) => {
  let methodColorClass = "bg-gray-100 text-gray-500 border-gray-200";

  const normalizedMethod = method?.toLowerCase() || "";

  if (normalizedMethod.includes("paypal")) {
    methodColorClass = "bg-blue-50 text-[#003087] border-blue-100"; // PayPal Blue
  } else if (normalizedMethod.includes("cod") || normalizedMethod.includes("cash")) {
    methodColorClass = "bg-orange-50 text-orange-600 border-orange-100"; // COD Warning/Orange
  } else if (normalizedMethod.includes("card") || normalizedMethod.includes("stripe")) {
    methodColorClass = "bg-purple-50 text-purple-600 border-purple-100"; // Card Purple
  }

  return (
    <div className="flex flex-col items-start gap-1">
      {isPaid ? (
        <span className="px-2.5 py-0.5 inline-flex text-[10px] leading-4 font-bold rounded-md bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
          PAID
        </span>
      ) : (
        <span className="px-2.5 py-0.5 inline-flex text-[10px] leading-4 font-bold rounded-md bg-amber-100 text-amber-700 border border-amber-200 uppercase tracking-wide">
          UNPAID
        </span>
      )}
      <span className={`px - 2 py - 0.5 inline - flex text - [10px] leading - 4 font - bold rounded - md border uppercase tracking - wide ${methodColorClass} `}>
        {method || "Unknown"}
      </span>
    </div>
  )
}

const headerStatus = (status) => {
  // Helper to normalize status strings
  if (!status) return "Pending";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

const OrderDetailModal = ({ order, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-serif">Order Details</h2>
            <p className="text-sm text-gray-500">
              ID: <span className="font-mono text-gray-700">#{order.orderId || order._id}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100">
            <FaTimes size={24} />
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Info Column */}
          <div className="md:col-span-2 space-y-8">
            {/* Products List */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaBoxOpen className="text-teal-500" /> Items
              </h3>
              <div className="space-y-4">
                {order.orderItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="h-16 w-16 bg-white rounded-lg flex-shrink-0 border border-gray-200 overflow-hidden">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <Link to={`/ product / ${item.product} `} className="text-sm font-semibold text-gray-900 hover:text-teal-600 line-clamp-1">
                        {item.name}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">Brand: {item.brand || "N/A"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">₹{item.price}</p>
                      <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaMoneyBillWave className="text-teal-500" /> Payment Info
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-500">Payment Method</span>
                  <span className="font-medium text-gray-900">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-500">Items Price</span>
                  <span className="font-medium text-gray-900">₹{order.itemsPrice}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-medium text-gray-900">₹{order.shippingPrice}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-500">Tax</span>
                  <span className="font-medium text-gray-900">₹{order.taxPrice}</span>
                </div>
                <div className="col-span-2 flex justify-between items-center pt-2">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-teal-600 font-serif">₹{order.totalPrice}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info Column */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FaUserCircle /> Customer
              </h4>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                  <FaUserCircle size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{order.user?.username || "Guest"}</p>
                  <p className="text-xs text-gray-500">{order.user?.email}</p>
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FaMapMarkerAlt /> Shipping Address
              </h4>
              <div className="text-sm text-gray-700 leading-relaxed">
                <p className="font-medium">{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>

            {/* Status Info */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FaCalendarAlt /> Status
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Order Status</span>
                  <StatusBadge status={order.orderStatus} isDelivered={order.isDelivered} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Paid</span>
                  <PaymentBadge isPaid={order.isPaid} />
                </div>
                {order.paidAt && (
                  <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                    Paid on {new Date(order.paidAt).toLocaleDateString()}
                  </div>
                )}
                {order.deliveredAt && (
                  <div className="text-xs text-gray-400">
                    Delivered on {new Date(order.deliveredAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
};

export default OrderList;
