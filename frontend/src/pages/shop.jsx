import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetFilteredProductsQuery } from "../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../redux/api/categoryApiSlice";
import { Product } from "./products/index";
import { Loader } from "../components/index";
import { FaFilter, FaTimes, FaSearch, FaChevronDown } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Shop = () => {
  const { data: categoriesData, isLoading: categoriesLoading } = useFetchCategoriesQuery();
  const [priceFilter, setPriceFilter] = useState([0, 100000]);
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: filteredProducts, isLoading: productsLoading } = useGetFilteredProductsQuery({
    checked: categoryFilter,
    radio: priceFilter,
  });

  const allCats = Array.isArray(categoriesData) ? categoriesData : [];
  // Use unique deps
  const departments = [...new Set(allCats.filter(c => !c.parent).map(c => JSON.stringify({ _id: c._id, name: c.name })))].map(s => JSON.parse(s));

  const handlePriceChange = (e) => {
    const value = e.target.value;
    let range = [0, 100000];
    if (value === "0-500") range = [0, 500];
    if (value === "501-1000") range = [501, 1000];
    if (value === "1001-5000") range = [1001, 5000];
    if (value === "5001+ ") range = [5001, 100000];
    setPriceFilter(range);
  };

  const handleDepartmentChange = (id) => {
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

  if (productsLoading || categoriesLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader /></div>;

  return (
    <div className="bg-black min-h-screen text-white pt-20">
      <div className="max-w-[1440px] mx-auto px-6 py-10">

        {/* Header & Mobile Filter Toggle */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2">Catalog</h1>
            <p className="text-zinc-500 font-medium">{finalProducts.length} Products Available</p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-sm py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:border-red-600 focus:outline-none transition-colors"
                placeholder="Search products..."
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden p-3 bg-zinc-900 border border-zinc-800 text-white rounded-sm"
            >
              <FaFilter />
            </button>
          </div>
        </div>

        <div className="flex gap-12">
          {/* Sidebar Filters (Desktop) */}
          <div className={`fixed inset-y-0 left-0 bg-black z-50 p-6 w-80 transform transition-transform duration-300 md:relative md:translate-x-0 md:w-64 md:p-0 md:bg-transparent md:block ${showFilters ? 'translate-x-0 border-r border-zinc-800' : '-translate-x-full'}`}>
            <div className="flex justify-between items-center mb-8 md:hidden">
              <span className="text-xl font-bold uppercase">Filters</span>
              <button onClick={() => setShowFilters(false)}><FaTimes /></button>
            </div>

            <div className="space-y-8">
              {/* Departments */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4 pb-2 border-b border-zinc-800">Categories</h3>
                <div className="space-y-2">
                  {departments.map(dept => (
                    <label key={dept._id} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${categoryFilter.includes(dept._id) ? 'bg-red-600 border-red-600' : 'border-zinc-700 group-hover:border-red-500'}`}>
                        {categoryFilter.includes(dept._id) && <FaTimes size={10} />}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={categoryFilter.includes(dept._id)}
                        onChange={() => handleDepartmentChange(dept._id)}
                      />
                      <span className={`text-sm font-medium transition-colors ${categoryFilter.includes(dept._id) ? 'text-white' : 'text-zinc-500 group-hover:text-white'}`}>
                        {dept.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4 pb-2 border-b border-zinc-800">Pr. Range</h3>
                <div className="space-y-2">
                  {["All", "0-500", "501-1000", "1001-5000", "5001+"].map((range) => (
                    <label key={range} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="price"
                        value={range}
                        className="hidden"
                        onChange={handlePriceChange}
                      />
                      <span className="w-3 h-3 rounded-full border border-zinc-700 group-hover:border-red-500 relative flex items-center justify-center">
                        {/* Visually verify radio selection logic if needed, but keeping simple for now */}
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full opacity-0 group-hover:opacity-50" />
                      </span>
                      <span className="text-sm font-medium text-zinc-500 group-hover:text-white transition-colors">{range === "All" ? "Any Price" : `₹${range}`}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {finalProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-sm">
                <p className="text-zinc-500 font-bold uppercase tracking-widest">No products found</p>
                <button onClick={() => { setCategoryFilter([]); setPriceFilter([0, 100000]); setSearchTerm(""); }} className="mt-4 text-red-500 hover:underline text-sm uppercase font-bold">
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {finalProducts.map(product => (
                  <Product key={product._id} product={product} />
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