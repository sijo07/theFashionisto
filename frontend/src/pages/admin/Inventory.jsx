
import { useState } from "react";
import { FaSearch, FaPlus, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import AdminHeader from "./AdminHeader";
import { Link } from "react-router-dom";
import { useAllProductsQuery, useDeleteProductMutation } from "../../redux/api/productApiSlice";
import EditProductModal from "./EditProductModal";
import Loader from "../../components/loader";

const getStatus = (stock) => {
    if (stock === 0) return "Out of Stock";
    if (stock < 10) return "Low Stock";
    return "In Stock";
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

        const status = getStatus(item.countInStock);
        const matchesFilter = filterStatus === "all" || status === filterStatus;

        return matchesSearch && matchesFilter;
    });

    const handleOpenModal = (product = null) => {
        setSelectedProduct(product); // null for new product
        setIsEditModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setSelectedProduct(null);
        refetch(); // Refresh data after edit/add
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this item? This action cannot be undone.")) {
            try {
                await deleteProduct(id).unwrap();
                toast.success("Item deleted successfully");
                refetch();
            } catch (err) {
                toast.error(err?.data?.message || err.error);
            }
        }
    };

    if (isLoading) return <Loader />;

    return (
        <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-900">
            <AdminHeader title="Inventory" subtitle="Manage your stock levels">
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search inventory..."
                            className="w-full bg-gray-100 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="In Stock">In Stock</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                    </select>
                    {/* Add Button - currently opens edit modal with null product for 'Add' mode if supported, or we can redirect to add product page */}
                    {/* Since EditProductModal is designed for editing, for adding we might need to use the ProductList page or adapt the modal. 
                        For now, let's link to the existing Add Product page or open modal if it supports it. 
                        EditProductModal checks for productId. If null, it might error or show empty. 
                        Let's check EditProductModal logic. It uses productData query. 
                        So it might fail for new products.
                        Re-routing to /admin/productlist (Add Product) is safer for 'Add'. 
                    */}
                    <Link
                        to="/admin/productlist"
                        className="bg-gradient-to-r from-gold to-gold-dark text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:shadow-lg transition-all"
                    >
                        <FaPlus /> Add Item
                    </Link>
                </div>
            </AdminHeader>

            <div className="p-8 max-w-[1600px] mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-bold border-b border-gray-100">
                                <th className="px-6 py-4">Image</th>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Sizes</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredInventory?.map(item => {
                                const status = getStatus(item.countInStock);
                                return (
                                    <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                                        </td>
                                        <td className="px-6 py-4 font-mono text-sm text-gray-500">
                                            <span className="bg-gray-100 text-gray-700 border border-gray-200 px-2 py-1 rounded text-xs font-bold">
                                                {item.productId || item._id.substring(0, 8).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900">{item.name}</p>
                                            <p className="text-xs text-gray-400 truncate w-48">{item.description}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {item.category?.name || "Uncategorized"}
                                            {item.category?.categoryId && <span className="ml-1 text-xs text-gray-400 font-mono">({item.category.categoryId})</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1 max-w-[150px]">
                                                {item.sizes?.slice(0, 3).map((s, idx) => (
                                                    <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full border border-gray-200">
                                                        {s.size}: {s.stock}
                                                    </span>
                                                ))}
                                                {item.sizes?.length > 3 && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full">+{item.sizes.length - 3}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold">{item.countInStock}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${status === 'In Stock' ? 'bg-green-50 text-green-600 border-green-100' :
                                                status === 'Low Stock' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                                                    'bg-red-50 text-red-600 border-red-100'
                                                }`}>
                                                {status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(item)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors">
                                                    <FaEdit />
                                                </button>
                                                <button onClick={() => handleDelete(item._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    {filteredInventory?.length === 0 && (
                        <div className="p-8 text-center text-gray-400">No items found.</div>
                    )}
                </div>
            </div>

            {/* Reusing Edit Product Modal */}
            <EditProductModal
                isOpen={isEditModalOpen}
                onClose={handleCloseModal}
                productId={selectedProduct?._id}
            />
        </div>
    );
};

export default Inventory;
