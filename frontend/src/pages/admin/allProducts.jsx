import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { useAllProductsQuery, useDeleteProductMutation, useUpdateProductMutation } from "../../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";
import { FaSearch, FaPlus, FaFilter, FaThLarge, FaList, FaStar, FaEdit, FaTrash, FaEllipsisH } from "react-icons/fa";
import { toast } from "react-toastify";
import AdminHeader from "./AdminHeader";
import EditProductModal from "./EditProductModal";

const AllProducts = () => {
  const { data: products, isLoading: isLoadingProducts, isError, refetch } = useAllProductsQuery();
  const { data: categories, isLoading: isLoadingCategories } = useFetchCategoriesQuery();
  const [deleteProduct] = useDeleteProductMutation();
  const [updateProduct] = useUpdateProductMutation();

  const [view, setView] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");

  // Menu & Modal State
  const [activeMenu, setActiveMenu] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const toggleActionMenu = (id) => {
    setActiveMenu(activeMenu === id ? null : id);
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
    setActiveMenu(null);
  };

  const handleToggleFeatured = async (product) => {
    try {
      const formData = new FormData();
      formData.append("isFeatured", !product.isFeatured);

      formData.append("name", product.name);
      formData.append("brand", product.brand);
      formData.append("description", product.description);
      formData.append("price", product.price);
      formData.append("category", product.category._id || product.category);
      formData.append("sizes", JSON.stringify(product.sizes || []));
      formData.append("quantity", product.countInStock);
      if (product.image) formData.append("image", product.image);

      await updateProduct({
        productId: product._id,
        formData
      }).unwrap();

      toast.success(product.isFeatured ? "Removed from Featured" : "Marked as Featured");
      setActiveMenu(null);
      refetch();
    } catch (err) {
      toast.error("Failed to update status");
      console.error(err);
    }
  };

  // 3-Level Filter State
  const [selectedSuper, setSelectedSuper] = useState("");
  const [selectedMain, setSelectedMain] = useState("");
  const [selectedSub, setSelectedSub] = useState("");

  if (isLoadingProducts || isLoadingCategories) return <div className="text-center p-10 font-display">Loading Catalog...</div>;
  if (isError) return <div className="text-center p-10 text-red-500 font-display">Error loading catalog</div>;

  // --- Category Hierarchy Logic ---
  const superCategories = categories?.filter(c => !c.parent) || [];
  const mainCategories = selectedSuper ? categories?.filter(c => c.parent === selectedSuper) : [];
  const subCategories = selectedMain ? categories?.filter(c => c.parent === selectedMain) : [];

  const getCategoryPath = (catId) => {
    if (!catId) return { super: '', main: '', sub: '' };
    const sub = categories?.find(c => c._id === catId || c._id === catId._id);
    if (!sub) return { super: '', main: '', sub: '' };

    if (!sub.parent) return { super: sub._id, main: '', sub: '' };

    const parent = categories?.find(c => c._id === sub.parent);
    if (!parent) return { super: '', main: '', sub: '' };

    if (!parent.parent) {
      return { super: parent._id, main: sub._id, sub: '' };
    }

    const grandParent = categories?.find(c => c._id === parent.parent);
    return { super: grandParent?._id || '', main: parent._id, sub: sub._id };
  };

  const filteredProducts = products?.filter(product => {
    // 1. Search Filter
    const matchesSearch = product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product?.description?.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Category Filter
    const prodCatId = product.category?._id || product.category;
    const { super: pSuper, main: pMain, sub: pSub } = getCategoryPath(prodCatId);

    let matchesCategory = true;
    if (selectedSuper) {
      matchesCategory = matchesCategory && (pSuper === selectedSuper);
    }
    if (selectedMain) {
      matchesCategory = matchesCategory && (pMain === selectedMain);
    }
    if (selectedSub) {
      matchesCategory = matchesCategory && (pSub === selectedSub);
    }

    return matchesSearch && matchesCategory;
  }) || [];

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id).unwrap();
        toast.success("Product deleted successfully");
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  // Reset dependent filters
  const handleSuperChange = (e) => {
    setSelectedSuper(e.target.value);
    setSelectedMain("");
    setSelectedSub("");
  };
  const handleMainChange = (e) => {
    setSelectedMain(e.target.value);
    setSelectedSub("");
  };

  const baseSelectClass = "pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold cursor-pointer min-w-[140px]";
  const disabledClass = "opacity-50 cursor-not-allowed";

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-gray-900 pb-20">
      <AdminHeader title="Products" subtitle="Manage your product catalog">
        {/* Actions Bar Content passed to Header */}
        <div className="flex flex-col xl:flex-row gap-4 w-full xl:w-auto items-start xl:items-center">
          {/* Search */}
          <div className="relative group w-full md:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gold transition-colors" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* 3-Level Filter Group */}
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            {/* Super Filter */}
            <select
              className={baseSelectClass}
              value={selectedSuper}
              onChange={handleSuperChange}
            >
              <option value="">All Departments</option>
              {superCategories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>

            {/* Main Filter (Conditional) */}
            <select
              className={`${baseSelectClass} transition-opacity ${!selectedSuper ? disabledClass : ''}`}
              value={selectedMain}
              onChange={handleMainChange}
              disabled={!selectedSuper}
            >
              <option value="">All Categories</option>
              {mainCategories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>

            {/* Sub Filter (Conditional) */}
            <select
              className={`${baseSelectClass} transition-opacity ${!selectedMain ? disabledClass : ''}`}
              value={selectedSub}
              onChange={(e) => setSelectedSub(e.target.value)}
              disabled={!selectedMain}
            >
              <option value="">All Sub-Cats</option>
              {subCategories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex bg-white border border-gray-200 rounded-lg p-1 gap-1">
            <button
              onClick={() => setView("grid")}
              className={`p-2 rounded-md transition-all ${view === 'grid' ? 'bg-gold/10 text-gold' : 'text-gray-400 hover:text-gray-600'}`}
              title="Grid View"
            >
              <FaThLarge />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2 rounded-md transition-all ${view === 'list' ? 'bg-gold/10 text-gold' : 'text-gray-400 hover:text-gray-600'}`}
              title="List View"
            >
              <FaList />
            </button>
          </div>

          {/* Add Product Button */}
          <Link
            to="/admin/productlist"
            className="flex items-center gap-2 bg-gradient-to-r from-gold to-gold-dark text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-gold/30 hover:shadow-xl hover:scale-105 transition-all text-sm whitespace-nowrap"
          >
            <FaPlus className="text-xs" /> Add Product
          </Link>
        </div>
      </AdminHeader>

      <div className="p-8 max-w-[1600px] mx-auto">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>No products found matching filters.</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {filteredProducts.map((product, index) => (
              <div
                key={product._id}
                className={`group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gold/5 transition-all duration-300 overflow-visible relative ${view === 'list' ? 'flex items-center gap-6 p-4' : 'flex flex-col'}`}
              >
                {/* Image Area */}
                <div className={`relative overflow-hidden ${view === 'list' ? 'h-24 w-24 rounded-lg flex-shrink-0' : 'h-64 w-full bg-gray-50 rounded-t-xl'}`}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  {view === 'grid' && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}

                  {/* Featured Badge */}
                  <div className="absolute top-3 left-3">
                    {product.isFeatured && (
                      <span className="flex items-center gap-1 bg-gold/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                        <FaStar className="text-[10px]" /> Featured
                      </span>
                    )}
                  </div>
                  {/* Product ID Badge */}
                  <div className="absolute top-3 right-3">
                    {product.productId && (
                      <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-mono px-2 py-1 rounded-md border border-white/10 shadow-sm">
                        {product.productId}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Area */}
                <div className={`flex flex-col ${view === 'list' ? 'flex-1' : 'p-5 flex-1'}`}>
                  <div className="flex justify-between items-start mb-2 relative">
                    <div className="flex-1 pr-6">
                      <h3 className="font-display font-bold text-gray-900 text-lg leading-tight mb-1 group-hover:text-gold-dark transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                      </p>
                    </div>

                    {/* 3-Dot Menu (Details Area) */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleActionMenu(product._id);
                        }}
                        className="p-2 -mr-2 text-gray-400 hover:text-gold hover:bg-gold/10 rounded-full transition-all"
                      >
                        <FaEllipsisH size={14} />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenu === product._id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-40 overflow-hidden animate-scale-in origin-top-right">
                          <button
                            onClick={() => openEditModal(product)}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gold transition-colors flex items-center gap-2"
                          >
                            <FaEdit size={14} /> Edit Product
                          </button>
                          <button
                            onClick={() => handleToggleFeatured(product)}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gold transition-colors flex items-center gap-2"
                          >
                            <FaStar size={14} /> {product.isFeatured ? "Un-feature" : "Mark Featured"}
                          </button>
                          <hr className="border-gray-50" />
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                          >
                            <FaTrash size={14} /> Delete Product
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {view === 'grid' && (
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">
                      {product.description}
                    </p>
                  )}

                  <div className={`flex items-center justify-between ${view === 'grid' ? 'mt-auto pt-4 border-t border-gray-50' : 'mt-2'}`}>
                    <div className="flex items-baseline gap-1">
                      {product.offer > 0 ? (
                        <>
                          <span className="text-lg font-bold text-gray-900">₹{product.offer}</span>
                          <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <FaStar className="text-gold" />
                        <span className="font-semibold text-gray-700">{product.rating || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${product.countInStock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span>{product.countInStock} Stock</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Click outside to close menu handler - simpler implementation: transparent overlay when menu active */}
      {activeMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)}></div>
      )}

      {/* Edit Modal */}
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        productId={selectedProduct?._id}
      />
    </div>
  );
};

export default AllProducts;
