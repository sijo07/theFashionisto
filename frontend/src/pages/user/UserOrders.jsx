import { useGetMyOrdersQuery } from "../../redux/api/orderApiSlice";
import Loader from "../../components/loader";
import Message from "../../components/message";
import { Link } from "react-router-dom";
import { FaBox, FaTimes, FaCheck, FaEye } from "react-icons/fa";

const UserOrders = () => {
    const { data: orders, isLoading, error } = useGetMyOrdersQuery();

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader /></div>;
    if (error) return <Message variant="danger">{error?.data?.error || error.error}</Message>;

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20">
            <div className="max-w-6xl mx-auto px-6">

                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                        <FaBox className="text-red-600" /> My Orders
                    </h1>
                    <Link to="/shop" className="text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider underline">Start Shopping</Link>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-zinc-900 border-b border-zinc-800">
                                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">ID</th>
                                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">Date</th>
                                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">Total</th>
                                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">Paid</th>
                                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-zinc-900/50 transition-colors">
                                        <td className="p-4 text-sm font-bold text-white font-mono">{order._id.substring(0, 10)}...</td>
                                        <td className="p-4 text-sm text-zinc-400">{order.createdAt.substring(0, 10)}</td>
                                        <td className="p-4 text-sm font-bold text-white">₹{order.totalPrice}</td>
                                        <td className="p-4">
                                            {order.isPaid ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-900/20 text-green-500 text-[10px] font-bold uppercase tracking-wider border border-green-900/30">
                                                    <FaCheck size={10} /> Paid
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-900/20 text-red-500 text-[10px] font-bold uppercase tracking-wider border border-red-900/30">
                                                    <FaTimes size={10} /> Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {order.isDelivered ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-900/20 text-blue-500 text-[10px] font-bold uppercase tracking-wider border border-blue-900/30">
                                                    <FaCheck size={10} /> Delivered
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-900/20 text-amber-500 text-[10px] font-bold uppercase tracking-wider border border-amber-900/30">
                                                    Processing
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link to={`/order/${order._id}`} className="inline-flex items-center justify-center p-2 bg-zinc-800 text-zinc-300 hover:bg-white hover:text-black hover:shadow-lg transition-all rounded-sm">
                                                <FaEye size={14} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {orders.length === 0 && (
                        <div className="p-12 text-center text-zinc-500 font-medium">
                            No orders found in transcript.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserOrders;
