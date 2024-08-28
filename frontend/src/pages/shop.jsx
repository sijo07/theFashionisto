import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetFilteredProductsQuery } from "../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../redux/api/categoryApiSlice";
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
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false); // New state for filter menu

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
      dispatch(setRadio([])); // Clear the brand filter
    } else {
      dispatch(setRadio([brand])); // Set the radio filter to the selected brand
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
    dispatch(setProducts(filteredProductsData)); // Reset products to unfiltered list
  };

  const topLevelCategories = categories?.filter((cat) => !cat.parentId) || [];
  const secondLevelCategories =
    categories?.filter((cat) => cat.parentId === selectedCategory) || [];

  const toggleFilterMenu = () => {
    setIsFilterMenuOpen((prev) => !prev);
  };

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row">
        {/* Hamburger Button */}
        <button
          onClick={toggleFilterMenu}
          className="md:hidden bg-teal-600 text-white p-2 mt-2 mb-2 rounded"
        >
          {isFilterMenuOpen ? "Close Filters" : "Open Filters"}
        </button>

        {/* Filter Menu */}
        <div
          className={`${
            isFilterMenuOpen ? "block" : "hidden"
          } md:block bg-teal-600 p-3 mt-2 mb-2 transition-all duration-300 ease-in-out`}
        >
          <h2 className="h4 text-center py-2 bg-black text-white rounded-full mb-2">
            Filter by Categories
          </h2>

          <div className="p-5 w-[15rem]">
            {topLevelCategories.map((c) => (
              <div key={c._id} className="mb-2">
                <div className="flex items-center mr-4">
                  <input
                    type="checkbox"
                    id={`category-${c._id}`}
                    onChange={(e) => handleCheck(e.target.checked, c._id)}
                    className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 dark:focus:ring-pink-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    htmlFor={`category-${c._id}`}
                    className={`ml-2 text-sm font-medium ${
                      selectedCategory === c._id
                        ? "text-yellow-300"
                        : "text-white"
                    } dark:text-gray-300 cursor-pointer`}
                    onClick={() => setSelectedCategory(c._id)}
                  >
                    {c.name}
                  </label>
                </div>
                {selectedCategory === c._id && (
                  <div className="pl-4">
                    {secondLevelCategories.map((subCat) => (
                      <div key={subCat._id} className="mb-2">
                        <div className="flex items-center mr-4">
                          <input
                            type="checkbox"
                            id={`subcategory-${subCat._id}`}
                            onChange={(e) =>
                              handleCheck(e.target.checked, subCat._id)
                            }
                            className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 dark:focus:ring-pink-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <label
                            htmlFor={`subcategory-${subCat._id}`}
                            className="ml-2 text-sm font-medium text-white dark:text-gray-300"
                          >
                            {subCat.name}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <h2 className="h4 text-center py-2 bg-black text-white rounded-full mb-2">
            Filter by Brands
          </h2>

          <div className="p-5">
            {uniqueBrands?.map((brand) => (
              <div className="flex items-center mr-4 mb-5" key={brand}>
                <input
                  type="radio"
                  id={`brand-${brand}`}
                  name="brand"
                  checked={radio[0] === brand}
                  onChange={() => handleBrandClick(brand)}
                  className="w-4 h-4 text-pink-400 bg-gray-100 border-gray-300 focus:ring-pink-500 dark:focus:ring-pink-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor={`brand-${brand}`}
                  className="ml-2 text-sm font-medium text-white dark:text-gray-300"
                >
                  {brand}
                </label>
              </div>
            ))}
          </div>

          <h2 className="h4 text-center py-2 bg-black text-white rounded-full mb-2">
            Filter by Price
          </h2>

          <div className="p-5 w-[15rem]">
            <input
              type="text"
              placeholder="Enter Price"
              value={priceFilter}
              onChange={handlePriceChange}
              className="w-full px-3 py-2 placeholder-gray-400 border rounded-lg focus:outline-none focus:ring focus:border-pink-300"
            />
          </div>

          <div className="p-5 pt-0">
            <button className="w-full border my-4" onClick={handleReset}>
              Reset
            </button>
          </div>
        </div>

        {/* Products Section */}
        <div className="p-3">
          <h2 className="h4 text-center mb-2">{products?.length} Products</h2>
          <div className="flex flex-wrap">
            {products.length === 0 ? (
              <Loader />
            ) : (
              products?.map((p) => (
                <div className="p-3" key={p._id}>
                  <ProductCard p={p} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
