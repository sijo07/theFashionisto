import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetFilteredProductsQuery } from "../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../redux/api/categoryApiSlice";
import { GiHamburgerMenu } from "react-icons/gi";
import {
  setCategories,
  setProducts,
  setChecked,
  setRadio,
} from "../redux/features/shop/shopSlice";
import Loader from "../components/Loader";
import ProductCard from "./Products/ProductCard";

// Flatten categories function
const flattenCategories = (categories) => {
  let result = [];

  const flatten = (cats) => {
    cats.forEach((cat) => {
      result.push(cat);
      if (cat.children && cat.children.length) {
        flatten(cat.children);
      }
    });
  };

  flatten(categories);
  return result;
};

const Shop = () => {
  const dispatch = useDispatch();
  const { categories, products, checked, radio } = useSelector(
    (state) => state.shop
  );

  const { data: categoriesData, error: categoriesError } =
    useFetchCategoriesQuery();
  const { data: filteredProductsData, error: productsError } =
    useGetFilteredProductsQuery({
      checked,
      radio,
    });

  const [priceFilter, setPriceFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (categoriesError) {
      console.error("Failed to fetch categories:", categoriesError);
      return;
    }

    if (categoriesData) {
      const flattenedCategories = flattenCategories(categoriesData);
      dispatch(setCategories(flattenedCategories));
    }
  }, [categoriesData, categoriesError, dispatch]);

  useEffect(() => {
    if (productsError) {
      console.error("Failed to fetch products:", productsError);
      return;
    }

    if (filteredProductsData) {
      const filteredProducts = filteredProductsData.filter((product) => {
        const categoryMatch = checked.length
          ? checked.includes(product.category)
          : true;
        const brandMatch = radio.length
          ? radio[0] === "All Brands" || product.brand === radio[0]
          : true;
        const priceMatch =
          product.price.toString().includes(priceFilter) ||
          product.price === parseInt(priceFilter, 10);
        return categoryMatch && brandMatch && priceMatch;
      });

      dispatch(setProducts(filteredProducts));
    }
  }, [
    checked,
    radio,
    filteredProductsData,
    productsError,
    dispatch,
    priceFilter,
  ]);

  const handleBrandClick = (brand) => {
    if (brand === "All Brands") {
      dispatch(setRadio([]));
    } else {
      dispatch(setRadio([brand]));
    }
  };

  const handleCheck = (value, id) => {
    const updatedChecked = value
      ? [...checked, id]
      : checked.filter((c) => c !== id);
    dispatch(setChecked(updatedChecked));
  };

  const uniqueBrands = [
    "All Brands",
    ...Array.from(
      new Set(
        filteredProductsData
          ?.map((product) => product.brand)
          .filter((brand) => brand !== undefined)
      )
    ),
  ];

  const handlePriceChange = (e) => {
    setPriceFilter(e.target.value);
  };

  const handleReset = () => {
    setPriceFilter("");
    setSelectedCategory(null);
    dispatch(setChecked([]));
    dispatch(setRadio([]));
    dispatch(setProducts(filteredProductsData));
  };

  const topLevelCategories = categories?.filter((cat) => !cat.parentId) || [];
  const secondLevelCategories =
    categories?.filter((cat) => cat.parentId === selectedCategory) || [];

  const toggleFilter = (filterType) => {
    setActiveFilter((prev) => (prev === filterType ? null : filterType));
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="relative">
  
      <div
        className={`fixed  left-[16rem] w-64 bg-gray-800 text-white transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-40`}
      >
        <div className="p-4">
          <button
            onClick={toggleSidebar}
            className="text-white text-2xl mb-4"
          >
            <GiHamburgerMenu />
          </button>
          <h3 className="text-lg font-semibold mb-2">Filters</h3>
          {/* Sidebar content */}
          <div className="mb-4">
            <h4 className="text-md font-semibold mb-2">Categories</h4>
            {topLevelCategories.map((category) => (
              <div key={category._id}>
                <input
                  type="checkbox"
                  checked={checked.includes(category._id)}
                  onChange={(e) =>
                    handleCheck(e.target.checked, category._id)
                  }
                />
                <label className="ml-2">{category.name}</label>
                {selectedCategory === category._id && secondLevelCategories.length > 0 && (
                  <div className="ml-4">
                    {secondLevelCategories.map((subCategory) => (
                      <div key={subCategory._id}>
                        <input
                          type="checkbox"
                          checked={checked.includes(subCategory._id)}
                          onChange={(e) =>
                            handleCheck(e.target.checked, subCategory._id)
                          }
                        />
                        <label className="ml-2">{subCategory.name}</label>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setSelectedCategory(category._id)}
                  className="text-blue-500 ml-2"
                >
                  {selectedCategory === category._id ? "Collapse" : "Expand"}
                </button>
              </div>
            ))}
          </div>

          <div className="mb-4">
            <h4 className="text-md font-semibold mb-2">Price</h4>
            <input
              type="text"
              value={priceFilter}
              onChange={handlePriceChange}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Filter by price"
            />
          </div>

          <div className="mb-4">
            <h4 className="text-md font-semibold mb-2">Brands</h4>
            {uniqueBrands.map((brand) => (
              <div key={brand}>
                <button
                  onClick={() => handleBrandClick(brand)}
                  className={`text-sm ${
                    radio[0] === brand ? "font-bold" : "font-normal"
                  }`}
                >
                  {brand}
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleReset}
            className="w-full bg-red-500 text-white py-2 rounded"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className={`ml-0 md:ml-64 transition-all duration-300 ease-in-out ${sidebarOpen ? "ml-64" : ""}`}>
        <div className="flex justify-center mb-4">
          <button onClick={toggleSidebar} className="md:hidden text-2xl">
            <GiHamburgerMenu />
          </button>
        </div>

        <div className="flex flex-col md:flex-row">
          <div className="md:w-3/4">
            <h2 className="text-2xl font-bold text-center mb-4">
              {products?.length} Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.length === 0 ? (
                <Loader />
              ) : (
                products?.map((p) => <ProductCard key={p._id} p={p} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
