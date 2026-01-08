import { useState } from "react";
import { FaSearch, FaPlus, FaEdit, FaTrash, FaTimes, FaDolly, FaExclamationTriangle, FaCheckCircle, FaWarehouse } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import AdminHeader from "./AdminHeader";
import { Link } from "react-router-dom";
import { useAllProductsQuery, useDeleteProductMutation } from "../../redux/api/productApiSlice";
import EditProductModal from "./EditProductModal";
import Loader from "../../components/Loader";

const getStatus = (stock) => {
    if (stock === 0) return { label: "Depleted", color: "rose", icon: <FaTimes /> };
    if (stock < 15) return { label: "Low Reserve", color: "amber", icon: <FaExclamationTriangle /> };
    return { label: "Operational", color: "emerald", icon: <FaCheckCircle /> };
};

const Inventory = () => {
    const { data: products, isLoading, refetch } = useAllProductsQuery();
    const [deleteProduct] = useDeleteProductMutation();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    const filteredInventory = products?.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.productId && item.productId.toLowerCase().includes(searchQuery.toLowerCase()));
        const status = getStatus(item.countInStock).label;
        const matchesFilter = filterStatus === "all" || status.toLowerCase().includes(filterStatus.toLowerCase());
        return matchesSearch && matchesFilter;
    }) || [];

    const handleOpenModal = (product = null) => {
        setSelectedProduct(product);
        setIsEditModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setSelectedProduct(null);
        refetch();
    };

    const handleDelete = async (id) => {
        if (window.confirm("CRITICAL: Permanent item decommissioning?")) {
            try {
                await deleteProduct(id).unwrap();
                toast.success("Product removed from catalog.");
                refetch();
            } catch (err) {
                toast.error("Delete failure.");
            }
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader /></div>;

    return (
        <div className="min-h-screen bg-[#FDFEFE] font-sans text-gray-900 pb-20 overflow-x-hidden">
            <AdminHeader title="Stock Management" subtitle={`Managing ${products?.length || 0} unique items in active rotation.`}>
                <div className="flex items-center gap-4">
                    <div className="relative group w-64 hidden lg:block">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search inventory..."
                            className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-4 focus:ring-teal-500/5 transition-all"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        className="bg-gray-50 border-none rounded-2xl px-6 py-3 text-xs font-black uppercase tracking-widest text-gray-700 focus:ring-4 focus:ring-teal-500/5 cursor-pointer"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                    >
                        <option value="all">ALL_STATUS</option>
                        <option value="operational">OPERATIONAL</option>
                        <option value="reserve">LOW_RESERVE</option>
                        <option value="depleted">DEPLETED</option>
                    </select>
                    <Link
                        to="/admin/productlist"
                        className="bg-gray-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <FaPlus size={10} /> Add Product
                    </Link>
                </div>
            </AdminHeader>

            <div className="px-6 lg:px-10 py-10 max-w-[1700px] mx-auto space-y-10">

                {/* Visual Telemetry cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-teal-50 p-8 rounded-[2.5rem] border border-teal-100 flex items-center justify-between shadow-xl shadow-teal-500/5 translate-y-0 hover:-translate-y-1 transition-transform">
                        <div>
                            <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">Total Volume</p>
                            <h4 className="text-3xl font-black text-gray-900">{products?.reduce((a, b) => a + b.countInStock, 0).toLocaleString()} <span className="text-xs font-bold text-gray-400">UNITS</span></h4>
                        </div>
                        <div className="w-14 h-14 rounded-3xl bg-teal-600 text-white flex items-center justify-center shadow-lg"><FaWarehouse size={24} /></div>
                    </div>
                    <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100 flex items-center justify-between shadow-xl shadow-amber-500/5 translate-y-0 hover:-translate-y-1 transition-transform">
                        <div>
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Reserve Critical</p>
                            <h4 className="text-3xl font-black text-gray-900">{products?.filter(p => p.countInStock < 15 && p.countInStock > 0).length} <span className="text-xs font-bold text-gray-400">ITEMS</span></h4>
                        </div>
                        <div className="w-14 h-14 rounded-3xl bg-amber-500 text-white flex items-center justify-center shadow-lg"><FaExclamationTriangle size={24} /></div>
                    </div>
                    <div className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100 flex items-center justify-between shadow-xl shadow-rose-500/5 translate-y-0 hover:-translate-y-1 transition-transform">
                        <div>
                            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Depleted Grid</p>
                            <h4 className="text-3xl font-black text-gray-900">{products?.filter(p => p.countInStock === 0).length} <span className="text-xs font-bold text-gray-400">ITEMS</span></h4>
                        </div>
                        <div className="w-14 h-14 rounded-3xl bg-rose-600 text-white flex items-center justify-center shadow-lg"><FaTrash size={20} /></div>
                    </div>
                </div>

                {/* Stock Table */}
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/30 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                    <th className="px-8 py-6">Product Image</th>
                                    <th className="px-8 py-6">ID Detail</th>
                                    <th className="px-8 py-6">Product Title</th>
                                    <th className="px-8 py-6">Sector</th>
                                    <th className="px-8 py-6">Stock Levels</th>
                                    <th className="px-8 py-6 text-right">Stock Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredInventory.map(item => {
                                    const status = getStatus(item.countInStock);
                                    return (
                                        <motion.tr key={item._id} variants={itemVariants} className="group hover:bg-teal-50/10 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden border border-gray-100 shadow-lg group-hover:scale-110 transition-transform duration-500">
                                                    <img src={item.image} className="w-full h-full object-cover" />
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded-md font-bold uppercase tracking-tighter">
                                                    {item.productId || item._id.substring(0, 10).toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-black text-gray-900 uppercase tracking-tight line-clamp-1">{item.name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-1">{item.brand || "T-FASHIONISTO"}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="px-3 py-1 rounded-full bg-gray-100 text-[9px] font-black text-gray-500 uppercase tracking-widest border border-gray-200">
                                                    {item.category?.name || "UNREGISTERED"}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-wrap gap-2 max-w-[180px]">
                                                    {item.sizes?.map((s, idx) => (
                                                        <div key={idx} className="flex flex-col items-center">
                                                            <span className="text-[9px] font-black text-gray-400 uppercase">{s.size}</span>
                                                            <span className={`text-[10px] font-black ${s.stock < 5 ? 'text-rose-500' : 'text-gray-900'}`}>{s.stock}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border bg-${status.color}-50 border-${status.color}-100`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full bg-${status.color}-500 ${status.label === 'Operational' ? '' : 'animate-pulse'}`}></span>
                                                        <span className={`text-[9px] font-black uppercase tracking-widest text-${status.color}-600`}>{status.label}</span>
                                                    </div>
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => handleOpenModal(item)} className="p-2 text-gray-300 hover:text-blue-600 transition-colors"><FaEdit /></button>
                                                        <button onClick={() => handleDelete(item._id)} className="p-2 text-gray-300 hover:text-rose-600 transition-colors"><FaTrash /></button>
                                                    </div>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            <EditProductModal
                isOpen={isEditModalOpen}
                onClose={handleCloseModal}
                productId={selectedProduct?._id}
            />
        </div >
    );
};

export default Inventory;
