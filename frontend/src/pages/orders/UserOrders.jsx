import { useGetMyOrdersQuery } from "../../redux/api/orderApiSlice";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import { Link } from "react-router-dom";
import { FaBox, FaTimes, FaCheck, FaArrowRight, FaClock, FaReceipt } from "react-icons/fa";
import { motion } from "framer-motion";

const UserOrders = () => {
    const { data: orders, isLoading, error } = useGetMyOrdersQuery();

    if (isLoading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader /></div>;
    if (error) return <div className="min-h-screen bg-[#050505] flex items-center justify-center p-10"><Message variant="danger">{error?.data?.error || error.error}</Message></div>;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 font-sans selection:bg-red-900 selection:text-white">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-red-900/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-zinc-800/5 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 border-b border-zinc-900/50 pb-8">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white mb-4 leading-none"
                        >
                            Order<span className="text-red-600">.</span><br />History
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-4"
                        >
                            <span className="w-12 h-[1px] bg-red-600 inline-block"></span>
                            Digital Acquisitions & Invoices
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Link to="/shop" className="group flex items-center gap-4 px-8 py-4 bg-white text-black text-xs font-black uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all duration-500 shadow-2xl shadow-white/5 hover:shadow-red-600/30">
                            Start Shopping <FaArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
                        </Link>
                    </motion.div>
                </div>

                {orders && orders.length > 0 ? (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-6"
                    >
                        {orders.map((order) => (
                            <motion.div
                                key={order._id}
                                variants={itemVariants}
                                className="group relative bg-zinc-950 border border-zinc-900 p-8 hover:border-zinc-700 transition-all duration-500 overflow-hidden"
                            >
                                {/* Hover Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-red-900/0 via-red-900/5 to-red-900/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />

                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative z-10">

                                    {/* Order Identifier & Date */}
                                    <div className="flex items-start gap-8 min-w-[30%]">
                                        <div className="hidden md:flex flex-col items-center justify-center w-16 h-16 bg-zinc-900 border border-zinc-800 text-zinc-600 group-hover:text-white group-hover:border-red-600 transition-colors duration-500">
                                            <span className="text-xl font-black">{order.createdAt.substring(8, 10)}</span>
                                            <span className="text-[9px] font-bold uppercase tracking-wider">{new Date(order.createdAt).toLocaleString('default', { month: 'short' })}</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-red-500 transition-colors duration-300">
                                                    #{order._id.substring(0, 8)}
                                                </h3>
                                                <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border ${order.isDelivered ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10' :
                                                    (order.isPaid ? 'border-amber-500/30 text-amber-500 bg-amber-500/10' : 'border-red-500/30 text-red-500 bg-red-500/10')
                                                    }`}>
                                                    {order.isDelivered ? 'Fulfilled' : (order.isPaid ? 'Processing' : 'Pending')}
                                                </span>
                                            </div>
                                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                                                <FaClock className="text-zinc-700" size={10} />
                                                Placed on {order.createdAt.substring(0, 10)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Key Metrics */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 flex-1 border-t lg:border-t-0 lg:border-l border-zinc-900 pt-6 lg:pt-0 lg:pl-10">
                                        <div>
                                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Amount</p>
                                            <p className="text-xl font-black text-white">₹{order.totalPrice.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Payment</p>
                                            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${order.isPaid ? 'text-white' : 'text-red-500'}`}>
                                                {order.isPaid ? <FaCheck className="text-emerald-500" /> : <FaTimes />}
                                                {order.isPaid ? 'Settled' : 'Unpaid'}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Logistics</p>
                                            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${order.isDelivered ? 'text-white' : 'text-zinc-400'}`}>
                                                <div className={`w-2 h-2 rounded-full ${order.isDelivered ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`} />
                                                {order.isDelivered ? 'Arrived' : 'Transit'}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-end">
                                            <Link to={`/order/${order._id}`} className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 text-zinc-400 hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 group/btn">
                                                View Receipt <FaArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>

                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="min-h-[400px] flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-[2rem] bg-zinc-950/30">
                        <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-700 mb-6">
                            <FaReceipt size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Archive Empty</h2>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-8">Begin your collection today.</p>
                        <Link to="/shop" className="px-10 py-4 bg-red-600 text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-red-700 transition-colors shadow-xl shadow-red-600/20">
                            Browse Catalog
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserOrders;
