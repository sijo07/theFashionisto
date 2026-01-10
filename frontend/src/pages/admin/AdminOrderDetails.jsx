import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
    FaUserCircle, FaMapMarkerAlt, FaCreditCard, FaMoneyBillWave,
    FaBoxOpen, FaTruck, FaCheckCircle, FaTimes, FaArrowLeft, FaEye
} from "react-icons/fa";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import {
    useGetOrderDetailsQuery,
    usePayOrderMutation,
    useUpdateOrderItemStatusMutation,

} from "../../redux/api/orderApiSlice";
import moment from "moment";

const AdminOrderDetails = () => {
    const { id: orderId } = useParams();
    const { data: order, refetch, isLoading, error } = useGetOrderDetailsQuery(orderId);
    const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();
    const [updateOrderItemStatus] = useUpdateOrderItemStatusMutation();

    const handleStatusUpdate = async (itemId, status) => {
        try {
            await updateOrderItemStatus({ orderId, itemId, status }).unwrap();
            refetch();
            toast.success(`Item status updated to ${status}`);
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };







    const handleMarkAsPaid = async () => {
        try {
            await payOrder({ orderId, details: { status: "COMPLETED" } }).unwrap();
            refetch();
            toast.success("Order marked as paid");
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    if (isLoading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader /></div>;
    if (error) return <Message variant="danger">{error?.data?.message || error.error}</Message>;

    return (
        <div className="min-h-screen bg-[#050505] font-sans text-white pb-20 overflow-x-hidden">
            {/* Header / Nav */}
            <div className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-zinc-900 px-4 lg:px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/admin/orderList" className="p-3 rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all">
                        <FaArrowLeft />
                    </Link>
                    <div>
                        <h1 className="text-lg lg:text-xl font-black uppercase tracking-tight text-white mb-0.5">Order Manifest</h1>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Ref: {order._id}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`px-3 lg:px-4 py-2 rounded-xl border flex items-center gap-2 ${order.isPaid ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        <div className={`w-1.5 lg:w-2 h-1.5 lg:h-2 rounded-full ${order.isPaid ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                        <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest">{order.isPaid ? 'Settled' : 'Payment Due'}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 lg:p-10 space-y-6 lg:space-y-10">

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">

                    {/* Left Column - Products & Status */}
                    <div className="lg:col-span-2 space-y-6 lg:space-y-8">

                        {/* Product List */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2"><FaBoxOpen /> Order Items</h3>
                            {order.orderItems.map((item, index) => (
                                <div key={index} className="bg-zinc-900/40 backdrop-blur-sm rounded-[2rem] border border-zinc-800/50 p-5 lg:p-6 flex flex-col md:flex-row gap-6 group hover:bg-zinc-900 hover:border-zinc-700 transition-all duration-300">

                                    {/* Product Image */}
                                    <div className="w-20 h-24 lg:w-28 lg:h-28 rounded-2xl bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700/50 shadow-lg relative self-start">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    </div>

                                    {/* Content Wrapper */}
                                    <div className="flex-1 w-full min-w-0 flex flex-col justify-between">

                                        {/* Header Info */}
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center md:block mb-1">
                                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Ref: {item._id.substring(0, 8)}</p>

                                                    {/* Mobile Qty/Price inline */}
                                                    <div className="md:hidden flex items-center gap-3">
                                                        <span className="text-[10px] text-zinc-500 font-bold uppercase">Qty: {item.qty}</span>
                                                        <span className="text-sm font-black text-white">₹{item.price.toLocaleString()}</span>
                                                    </div>
                                                </div>

                                                <Link to={`/product/${item.product}`} className="text-sm md:text-lg font-black text-white uppercase tracking-tight hover:text-teal-400 transition-colors line-clamp-2 leading-tight md:leading-normal">
                                                    {item.name}
                                                </Link>

                                                {/* Mobile Size */}
                                                {item.size && <p className="md:hidden text-[9px] font-bold text-zinc-600 uppercase mt-1">Size: {item.size}</p>}
                                            </div>

                                            {/* Desktop Price/Qty Column */}
                                            <div className="hidden md:block text-right shrink-0">
                                                <p className="text-xl font-black text-white">₹{item.price.toLocaleString()}</p>
                                                <p className="text-xs text-zinc-500 font-bold uppercase mt-1">Qty: {item.qty} {item.size && `• ${item.size}`}</p>
                                            </div>
                                        </div>

                                        {/* Status Control Strip - Always Visible */}
                                        <div className="pt-4 border-t border-zinc-800 flex flex-col gap-3 mt-auto">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor] 
                                            ${(item.itemStatus || order.orderStatus) === 'Pending' ? 'bg-amber-500 text-amber-500' :
                                                        (item.itemStatus || order.orderStatus) === 'Processing' ? 'bg-blue-500 text-blue-500' :
                                                            (item.itemStatus || order.orderStatus) === 'Shipped' ? 'bg-purple-500 text-purple-500' :
                                                                (item.itemStatus || order.orderStatus) === 'Delivered' ? 'bg-emerald-500 text-emerald-500' : 'bg-zinc-500 text-zinc-500'}`}
                                                />
                                                <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">{item.itemStatus || order.orderStatus}</span>
                                            </div>

                                            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar touch-pan-x">
                                                {['Processing', 'Packed', 'Shipped', 'Out for delivery', 'Delivered'].map((step, sIndex, arr) => {
                                                    const currentStatus = item.itemStatus || order.orderStatus || 'Pending';
                                                    const currentStatusIndex = arr.indexOf(currentStatus);
                                                    const isCompleted = currentStatusIndex >= sIndex;
                                                    const isNext = currentStatusIndex === sIndex - 1;
                                                    const effectiveIsNext = (currentStatus === 'Pending' && sIndex === 0) || isNext;

                                                    return (
                                                        <button
                                                            key={step}
                                                            onClick={() => handleStatusUpdate(item._id, step)}
                                                            disabled={isCompleted || !effectiveIsNext}
                                                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border flex items-center gap-2 ${isCompleted
                                                                ? 'bg-zinc-800 text-zinc-500 border-zinc-800 cursor-not-allowed'
                                                                : effectiveIsNext
                                                                    ? 'bg-zinc-800/50 hover:bg-zinc-700 text-white border-zinc-700 hover:border-zinc-500 shadow-lg'
                                                                    : 'bg-zinc-900 text-zinc-700 border-zinc-800/50 opacity-40 cursor-not-allowed'
                                                                }`}
                                                        >
                                                            <span>{step}</span>
                                                            {isCompleted && <FaCheckCircle className="text-emerald-500" />}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Billing Summary */}
                        <div className="bg-[#0B0F19] rounded-[2.5rem] p-6 lg:p-10 text-white shadow-2xl relative overflow-hidden ring-1 ring-white/5">
                            <h4 className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-6 lg:mb-8 flex items-center gap-2">
                                <FaMoneyBillWave /> Billing Summary
                            </h4>
                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between items-center text-xs lg:text-sm font-bold text-zinc-500">
                                    <span>Subtotal</span>
                                    <span className="text-zinc-300">₹{order.itemsPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs lg:text-sm font-bold text-zinc-500">
                                    <span>Shipping & Handling</span>
                                    <span className="text-zinc-300">₹{order.shippingPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs lg:text-sm font-bold text-zinc-500">
                                    <span>Estimated Tax</span>
                                    <span className="text-zinc-300">₹{order.taxPrice.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-end relative z-10">
                                <span className="text-lg lg:text-2xl font-black text-teal-400 uppercase tracking-tighter">Total Amount</span>
                                <span className="text-2xl lg:text-3xl font-black text-white tracking-tight">₹{order.totalPrice.toLocaleString()}</span>
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none"></div>
                        </div>

                    </div>

                    {/* Right Column - Customer Info */}
                    <div className="space-y-6">

                        {/* User Card */}
                        <div className="bg-zinc-900/50 backdrop-blur-sm p-6 lg:p-8 rounded-[2.5rem] border border-zinc-800 text-center relative overflow-hidden group">
                            <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto rounded-full bg-zinc-800 border-4 border-zinc-900 shadow-xl mb-4 flex items-center justify-center text-xl lg:text-2xl font-black text-zinc-600 relative z-10">
                                {order.user?.username?.charAt(0) || "G"}
                            </div>
                            <h4 className="text-base lg:text-lg font-black text-white uppercase tracking-tight relative z-10">{order.user?.username || "Guest User"}</h4>
                            <p className="text-[10px] lg:text-xs text-zinc-500 font-bold mt-1 relative z-10">{order.user?.email || "No email linked"}</p>

                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-900/80 pointer-events-none"></div>
                        </div>

                        {/* Shipping Info */}
                        <div className="bg-zinc-900/30 p-6 lg:p-8 rounded-[2.5rem] border border-zinc-800/50">
                            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2"><FaMapMarkerAlt /> Shipping Destination</h4>
                            <div className="space-y-1.5">
                                <p className="text-xs lg:text-sm font-black text-zinc-200 uppercase leading-snug">{order.shippingAddress.address}</p>
                                <p className="text-[10px] lg:text-xs font-bold text-zinc-500 uppercase">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                                <p className="text-[10px] lg:text-xs font-bold text-zinc-500 uppercase">{order.shippingAddress.country}</p>
                            </div>
                        </div>

                        {/* Payment Card */}
                        <div className="bg-teal-900/20 p-6 lg:p-8 rounded-[2.5rem] border border-teal-500/20 text-white shadow-xl relative overflow-hidden group">
                            <h4 className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10"><FaCreditCard /> Payment Details</h4>
                            <h3 className="text-xl lg:text-2xl font-black uppercase tracking-tight relative z-10 text-white">{order.paymentMethod}</h3>

                            <div className="mt-6 relative z-10">
                                {order.isPaid ? (
                                    <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500/20 border border-teal-500/30 rounded-xl text-teal-400 shadow-lg backdrop-blur-md">
                                        <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Payment Received</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleMarkAsPaid}
                                        disabled={loadingPay}
                                        className="w-full py-4 bg-teal-500 text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-400 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        {loadingPay ? <Loader /> : 'Mark as Paid'}
                                    </button>
                                )}
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-teal-500/20 rounded-full blur-[60px] pointer-events-none"></div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetails;
