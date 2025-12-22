import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetFilteredProductsQuery } from "../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../redux/api/categoryApiSlice";
import { Product } from "./products/index";
import { Loader, Message } from "../components/index";
import { FaSearch, FaTh, FaList } from "react-icons/fa";

const Shop = () => {
  const dispatch = useDispatch();
  const { data: categoriesData, isLoading: categoriesLoading } = useFetchCategoriesQuery();
  const [priceFilter, setPriceFilter] = useState([0, 100000]);
  const [categoryFilter, setCategoryFilter] = useState([]);

  // UI Selection State
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [isGridView, setIsGridView] = useState(true);

  const [pageScroll, setPageScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.location.pathname === "/shop") {
        setPageScroll(window.scrollY >= 50);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Fetch filtered products
  const { data: filteredProducts, isLoading: productsLoading, isError, error } = useGetFilteredProductsQuery({
    checked: categoryFilter,
    radio: priceFilter,
  });

  const handlePriceChange = (e) => {
    const value = e.target.value;
    let range = [0, 100000];
    if (value === "0-500") range = [0, 500];
    if (value === "501-1000") range = [501, 1000];
    if (value === "1001-5000") range = [1001, 5000];
    if (value === "5001-10000") range = [5001, 10000];
    if (value === "10000+") range = [10000, 1000000];
    setPriceFilter(range);
  };

  const handleReset = () => {
    setCategoryFilter([]);
    setPriceFilter([0, 100000]);
    setSelectedDepartment("");
    setSelectedCategory("");
    setSelectedSubCategory("");
    setSearchTerm("");
    const selects = document.querySelectorAll("select");
    selects.forEach(select => select.value = "");
  }

  // Helper: Get derived lists
  const allCats = Array.isArray(categoriesData) ? categoriesData : [];
  const departments = allCats.filter(c => !c.parent || c.categoryId?.startsWith('FSG'));

  // Options
  const categoriesOptions = selectedDepartment
    ? allCats.filter(c => c.parent === selectedDepartment)
    : allCats.filter(c => c.categoryId?.startsWith('FSC'));

  const subCategoriesOptions = selectedCategory
    ? allCats.filter(c => c.parent === selectedCategory)
    : [];

  const handleDepartmentChange = (e) => {
    const deptId = e.target.value;
    setSelectedDepartment(deptId);
    setSelectedCategory("");
    setSelectedSubCategory("");

    if (!deptId) {
      setCategoryFilter([]);
      return;
    }

    const relatedMains = allCats.filter(c => c.parent === deptId).map(c => c._id);
    const relatedSubs = allCats.filter(s => relatedMains.includes(s.parent) || s.parent === deptId).map(s => s._id);
    setCategoryFilter([...new Set([deptId, ...relatedMains, ...relatedSubs])]);
  };

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    setSelectedCategory(catId);
    setSelectedSubCategory("");

    if (!catId) {
      if (selectedDepartment) {
        const relatedMains = allCats.filter(c => c.parent === selectedDepartment).map(c => c._id);
        const relatedSubs = allCats.filter(s => relatedMains.includes(s.parent) || s.parent === selectedDepartment).map(s => s._id);
        setCategoryFilter([...new Set([selectedDepartment, ...relatedMains, ...relatedSubs])]);
      } else {
        setCategoryFilter([]);
      }
      return;
    }

    const relatedSubs = allCats.filter(s => s.parent === catId).map(s => s._id);
    setCategoryFilter([...new Set([catId, ...relatedSubs])]);
  };

  const handleSubCategoryChange = (e) => {
    const subId = e.target.value;
    setSelectedSubCategory(subId);

    if (!subId) {
      if (selectedCategory) {
        const relatedSubs = allCats.filter(s => s.parent === selectedCategory).map(s => s._id);
        setCategoryFilter([...new Set([selectedCategory, ...relatedSubs])]);
      } else {
        setCategoryFilter([]);
      }
      return;
    }
    setCategoryFilter([subId]);
  }

  // Client Side Filtering for Search
  const finalProducts = filteredProducts?.filter(product => {
    if (!searchTerm) return true;
    return product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  if (productsLoading || categoriesLoading) return <Loader />;

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Top Filter Bar (Full Width, Sticky) */}
      <div
        className={`sticky top-[72px] z-[9] bg-white border-gray-100 mb-6 transition-all duration-300 ease-in ${pageScroll ? "shadow-lg border-b-0" : "border-b shadow-sm"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col xl:flex-row items-center justify-between gap-4">

            {/* Search Bar */}
            <div className="relative w-full md:w-56 lg:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#649899] bg-gray-50"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto flex-1 justify-center xl:justify-start">

              {/* Department */}
              <select
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#649899] min-w-[130px] cursor-pointer hover:bg-gray-50 transition-colors"
                value={selectedDepartment}
                onChange={handleDepartmentChange}
              >
                <option value="">All Departments</option>
                {departments.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>

              {/* Category */}
              <select
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#649899] min-w-[130px] cursor-pointer hover:bg-gray-50 transition-colors"
                value={selectedCategory}
                onChange={handleCategoryChange}
                disabled={!categoriesOptions.length && !selectedDepartment}
              >
                <option value="">All Categories</option>
                {categoriesOptions.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>

              {/* Sub-Category */}
              <select
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#649899] min-w-[130px] cursor-pointer hover:bg-gray-50 transition-colors"
                value={selectedSubCategory}
                onChange={handleSubCategoryChange}
                disabled={!subCategoriesOptions.length && !selectedCategory}
              >
                <option value="">All Sub-Cats</option>
                {subCategoriesOptions.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>

              {/* Price Filter */}
              <select
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#649899] min-w-[120px] cursor-pointer hover:bg-gray-50 transition-colors"
                onChange={handlePriceChange}
              >
                <option value="">All Prices</option>
                <option value="0-500">Under ₹500</option>
                <option value="501-1000">₹501 - ₹1000</option>
                <option value="1001-5000">₹1001 - ₹5000</option>
                <option value="5001-10000">₹5001 - ₹10000</option>
                <option value="10000+">Above ₹10000</option>
              </select>

              {/* Reset Button */}
              <button onClick={handleReset} className="text-xs font-bold text-[#649899] hover:text-[#4caf65] uppercase px-2 transition-colors">
                Reset
              </button>
            </div>

            {/* Right Side: Count + Toggle */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-500 hidden sm:block">
                {finalProducts.length} Products
              </span>

              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setIsGridView(true)}
                  className={`p-1.5 rounded-md transition-all ${isGridView ? 'bg-white shadow-sm text-[#649899]' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <FaTh size={14} />
                </button>
                <button
                  onClick={() => setIsGridView(false)}
                  className={`p-1.5 rounded-md transition-all ${!isGridView ? 'bg-white shadow-sm text-[#649899]' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <FaList size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="w-full">
          {finalProducts.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm mt-8">
              <div className="text-gray-300 mb-4 text-4xl">☹</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your filters.</p>
            </div>
          ) : (
            // View Mode
            <div className={isGridView ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
              {finalProducts.map((product) => (
                isGridView ? (
                  <Product key={product._id} product={product} />
                ) : (
                  // List Item
                  <div key={product._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 items-center transition-shadow hover:shadow-md">
                    <div className="relative w-full sm:w-48 h-48 sm:h-32 flex-shrink-0">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                    </div>
                    <div className="flex-1 w-full text-center sm:text-left">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{product.name}</h3>
                      <p className="text-gray-500 text-sm mb-2 uppercase tracking-wide">{product.brand}</p>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">{product.description?.substring(0, 100)}...</p>
                      <div className="font-bold text-xl text-[#649899]">₹{product.price}</div>
                    </div>
                    <div className="ml-auto flex-shrink-0">
                      <a href={`/product/${product._id}`} className="inline-block px-6 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors shadow-sm hover:shadow">
                        View Details
                      </a>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;