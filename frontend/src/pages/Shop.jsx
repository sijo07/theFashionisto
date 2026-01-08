import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetFilteredProductsQuery } from "../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../redux/api/categoryApiSlice";
import { Product } from "./products/index";
import { Loader } from "../components/index";
import { FaFilter, FaTimes, FaSearch, FaChevronDown, FaCheck, FaChevronRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Shop = () => {
  const { data: categoriesData, isLoading: categoriesLoading } = useFetchCategoriesQuery();
  const [priceFilter, setPriceFilter] = useState([0, 100000]);
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const { data: filteredProducts, isLoading: productsLoading } = useGetFilteredProductsQuery({
    checked: categoryFilter,
    radio: priceFilter,
  });

  // Organize Categories into Parent-Child Structure
  const allCats = Array.isArray(categoriesData) ? categoriesData : [];
  const parentCategories = allCats.filter(c => !c.parent);

  const getChildCategories = (parentId) => {
    return allCats.filter(c => c.parent === parentId);
  };

  const toggleCategoryExpand = (id) => {
    setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    let range = [0, 100000];
    if (value === "0-500") range = [0, 500];
    if (value === "501-1000") range = [501, 1000];
    if (value === "1001-5000") range = [1001, 5000];
    if (value === "5001+") range = [5001, 100000];
    setPriceFilter(range);
  };

  const handleCategoryChange = (id) => {
    if (categoryFilter.includes(id)) {
      setCategoryFilter(categoryFilter.filter(c => c !== id));
    } else {
      setCategoryFilter([...categoryFilter, id]);
    }
  };

  const finalProducts = filteredProducts?.filter(product => {
    if (!searchTerm) return true;
    return product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.brand.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  // Desktop check
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowFilters(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (productsLoading || categoriesLoading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader /></div>;

  const SidebarContent = () => (
    <div className="space-y-8 pr-2 custom-scrollbar h-full overflow-y-auto">
      {/* Categories Tree */}
      <div>
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">Categories</h3>
        <div className="space-y-1">
          {parentCategories.map(parent => {
            const children = getChildCategories(parent._id);
            const isExpanded = expandedCategories[parent._id];
            return (
              <div key={parent._id} className="mb-2">
                {/* Parent Item */}
                <div className="flex items-center justify-between group cursor-pointer py-1.5" onClick={() => children.length > 0 ? toggleCategoryExpand(parent._id) : handleCategoryChange(parent._id)}>
                  <div className="flex items-center gap-3">
                    {children.length > 0 ? (
                      <FaChevronRight size={10} className={`text-zinc-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    ) : (
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${categoryFilter.includes(parent._id) ? 'border-red-600 bg-red-600' : 'border-zinc-800'}`}>
                        {categoryFilter.includes(parent._id) && <FaCheck size={8} className="text-white" />}
                      </div>
                    )}
                    <span className={`text-base font-medium transition-colors ${categoryFilter.includes(parent._id) ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                      {parent.name}
                    </span>
                  </div>
                </div>

                {/* Children Items */}
                <AnimatePresence>
                  {isExpanded && children.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden ml-6 space-y-1 pt-1 border-l border-white/5 pl-3"
                    >
                      {children.map(child => (
                        <label key={child._id} className="flex items-center gap-3 cursor-pointer group py-1">
                          <div className={`w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center transition-all ${categoryFilter.includes(child._id) ? 'border-red-500 bg-red-500' : 'border-zinc-800 bg-zinc-900 group-hover:border-zinc-600'}`}>
                            {categoryFilter.includes(child._id) && <FaCheck size={8} className="text-white" />}
                          </div>
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={categoryFilter.includes(child._id)}
                            onChange={() => handleCategoryChange(child._id)}
                          />
                          <span className={`text-sm transition-colors ${categoryFilter.includes(child._id) ? 'text-white font-bold' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                            {child.name}
                          </span>
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">Price</h3>
        <div className="space-y-1">
          {["All", "0-500", "501-1000", "1001-5000", "5001+"].map((range) => (
            <label key={range} className="flex items-center gap-3 cursor-pointer group py-1.5">
              <input
                type="radio"
                name="price"
                value={range}
                className="hidden"
                onChange={handlePriceChange}
              />
              <div className="relative w-4 h-4 flex items-center justify-center">
                <div className={`w-4 h-4 rounded-full border transition-all ${priceFilter.toString() === (range === "All" ? "0,100000" : range === "0-500" ? "0,500" : range === "501-1000" ? "501,1000" : range === "1001-5000" ? "1001,5000" : "5001,100000") ? 'border-red-600' : 'border-zinc-700 group-hover:border-zinc-500'}`}></div>
                <div className={`absolute w-2 h-2 bg-red-600 rounded-full transition-all ${priceFilter.toString() === (range === "All" ? "0,100000" : range === "0-500" ? "0,500" : range === "501-1000" ? "501,1000" : range === "1001-5000" ? "501,1000" : "5001,100000") ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
              </div>
              <span className={`text-sm transition-colors ${priceFilter.toString() === (range === "All" ? "0,100000" : range === "0-500" ? "0,500" : range === "501-1000" ? "501,1000" : range === "1001-5000" ? "1001,5000" : "5001,100000") ? 'text-white font-bold' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                {range === "All" ? "Any Price" : `₹${range}`}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#050505] min-h-screen text-white pt-24 font-inter relative">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-red-900/10 to-transparent" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-900/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 pb-20 relative z-10">

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 border-b border-white/5 pb-8"
        >
          <div>
            <h1 className="text-5xl md:text-8xl font-playfair font-black italic tracking-tighter mb-4 bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent pb-2 pr-4">
              Catalog
            </h1>
            <p className="text-zinc-500 font-light tracking-widest uppercase text-xs md:text-sm">
              <span className="text-red-500 font-bold">{finalProducts.length}</span> Pieces Curated For You
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80 group">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-3.5 pl-12 pr-6 text-sm text-white placeholder:text-zinc-600 focus:border-red-500/50 focus:bg-white/10 focus:outline-none transition-all backdrop-blur-sm"
                placeholder="Search collection..."
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden p-3.5 bg-white/5 border border-white/10 text-white rounded-full hover:bg-white/10 transition-colors active:scale-95"
            >
              <FaFilter />
            </button>
          </div>
        </motion.div>

        <div className="flex gap-12 items-start">

          {/* Desktop Sticky Sidebar */}
          <div className="hidden md:block w-72 shrink-0 sticky top-32 h-[calc(100vh-10rem)] border-r border-white/5 pr-4">
            <SidebarContent />
          </div>

          {/* Mobile Filter Drawer */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-y-0 left-0 bg-[#0a0a0a]/95 backdrop-blur-xl z-50 p-8 w-80 shadow-2xl md:hidden"
              >
                <div className="flex justify-between items-center mb-10">
                  <span className="text-2xl font-playfair italic font-bold">Filters.</span>
                  <button onClick={() => setShowFilters(false)} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"><FaTimes /></button>
                </div>
                <SidebarContent />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Product Grid */}
          <div className="flex-1 min-h-[600px]">
            {finalProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-32 border border-dashed border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm"
              >
                <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-zinc-800">
                  <FaSearch className="text-zinc-700 text-2xl" />
                </div>
                <h3 className="text-2xl font-playfair font-bold text-white mb-2">No matches found</h3>
                <p className="text-zinc-500 font-light mb-8 max-w-md text-center">We couldn't find any products matching your specific filters. Try adjusting your search criteria.</p>
                <button onClick={() => { setCategoryFilter([]); setPriceFilter([0, 100000]); setSearchTerm(""); }} className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-[0.2em] rounded-full transition-all shadow-[0_10px_30px_rgba(220,38,38,0.2)] hover:shadow-[0_10px_30px_rgba(220,38,38,0.4)]">
                  Clear All Filters
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 gap-y-12">
                {finalProducts.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.5 }}
                  >
                    <Product product={product} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;