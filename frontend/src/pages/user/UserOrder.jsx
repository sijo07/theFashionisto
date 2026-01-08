import Message from "../../components/Message";
import Loader from "../../components/Loader";
import { Link } from "react-router-dom";
import { useGetMyOrdersQuery } from "../../redux/api/orderApiSlice";
import { FaBox, FaShoppingBag, FaArrowRight, FaTimes, FaCheck } from "react-icons/fa";
import { motion } from "framer-motion";

const UserOrder = () => {
  const { data: orders, isLoading, error } = useGetMyOrdersQuery();

  if (isLoading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader /></div>;
  if (error) return <div className="min-h-screen bg-[#050505] pt-24 px-6"><Message variant="danger">{error?.data?.error || error?.error || "Error loading orders"}</Message></div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 font-sans">
      <div className="max-w-[1200px] mx-auto px-6">

        <div className="flex items-end justify-between mb-12 border-b border-zinc-900 pb-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-2">My Orders</h1>
            <p className="text-zinc-500 font-bold text-xs uppercase tracking-[0.2em]">{orders?.length || 0} Transactions</p>
          </div>
          <Link to="/shop" className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-red-500 transition-colors">
            New Order <FaArrowRight />
          </Link>
        </div>

        {orders?.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-zinc-900 rounded-sm">
            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-600">
              <FaShoppingBag size={24} />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-widest text-zinc-300 mb-2">No History</h3>
            <p className="text-zinc-500 text-sm mb-8">You haven't placed any orders yet.</p>
            <Link to="/shop" className="px-8 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all text-xs">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-900/50 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                  <th className="px-6 py-4 rounded-l-lg">Product Asset</th>
                  <th className="px-6 py-4">Reference ID</th>
                  <th className="px-6 py-4">Timeline</th>
                  <th className="px-6 py-4">Value</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Fulfillment</th>
                  <th className="px-6 py-4 rounded-r-lg"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {orders.map((order) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={order._id}
                    className="group hover:bg-zinc-900/40 transition-colors"
                  >
                    <td className="px-6 py-6">
                      <div className="w-16 h-20 bg-zinc-900 overflow-hidden rounded-sm border border-zinc-800">
                        <img
                          src={order.orderItems[0]?.image}
                          alt="item"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-6 font-mono text-xs text-zinc-400">
                      {order._id.substring(0, 10).toUpperCase()}...
                    </td>
                    <td className="px-6 py-6 text-xs font-bold text-zinc-300">
                      {order.createdAt.substring(0, 10)}
                    </td>
                    <td className="px-6 py-6 font-mono text-sm font-bold text-white">
                      ₹{order.totalPrice}
                    </td>
                    <td className="px-6 py-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${order.isPaid ? 'bg-emerald-950/30 text-emerald-500 border border-emerald-900/50' : 'bg-red-950/30 text-red-500 border border-red-900/50'}`}>
                        {order.isPaid ? <FaCheck size={8} /> : <FaTimes size={8} />}
                        {order.isPaid ? 'PAID' : 'PENDING'}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${order.isDelivered ? 'bg-emerald-950/30 text-emerald-500 border border-emerald-900/50' : 'bg-amber-950/30 text-amber-500 border border-amber-900/50'}`}>
                        {order.isDelivered ? <FaCheck size={8} /> : <FaBox size={8} />}
                        {order.isDelivered ? 'DELIVERED' : 'PROCESSING'}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <Link to={`/order/${order._id}`}>
                        <button className="px-4 py-2 bg-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all rounded-sm">
                          Details
                        </button>
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrder;