import { useState } from "react";
import PropTypes from "prop-types";

const CategoryFilter = ({ 
  categoriesData, 
  selectedCategory, 
  onCategoryChange 
}) => {
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  // Separate main categories and subcategories
  const mainCategories = categoriesData?.mainCategories || [];
  const subCategories = categoriesData?.subCategories || [];

  // Toggle category expansion
  const toggleCategory = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Get subcategories for a main category
  const getSubcategories = (parentId) => {
    return subCategories.filter(sub => 
      sub.parent && sub.parent._id === parentId
    );
  };

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    onCategoryChange(categoryId === selectedCategory ? null : categoryId);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Categories</h3>
      <ul className="space-y-2">
        {mainCategories.map((category) => {
          const subcategories = getSubcategories(category._id);
          const isExpanded = expandedCategories.has(category._id);
          
          return (
            <li key={category._id}>
              <div className="flex items-center justify-between">
                <button
                  className={`flex items-center w-full text-left p-2 rounded hover:bg-gray-100 ${
                    selectedCategory === category._id ? "bg-teal-100 font-medium" : ""
                  }`}
                  onClick={() => handleCategorySelect(category._id)}
                >
                  <span>{category.name}</span>
                </button>
                {subcategories.length > 0 && (
                  <button
                    className="p-2 rounded hover:bg-gray-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCategory(category._id);
                    }}
                  >
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                )}
              </div>
              
              {subcategories.length > 0 && isExpanded && (
                <ul className="ml-4 mt-1 space-y-1">
                  {subcategories.map((subCategory) => (
                    <li key={subCategory._id}>
                      <button
                        className={`w-full text-left p-2 rounded hover:bg-gray-100 ${
                          selectedCategory === subCategory._id ? "bg-purple-100 font-medium" : ""
                        }`}
                        onClick={() => handleCategorySelect(subCategory._id)}
                      >
                        <span className="text-sm">{subCategory.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

CategoryFilter.propTypes = {
  categoriesData: PropTypes.shape({
    mainCategories: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
      })
    ),
    subCategories: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        parent: PropTypes.shape({
          _id: PropTypes.string.isRequired,
          name: PropTypes.string.isRequired,
        }),
      })
    ),
  }),
  selectedCategory: PropTypes.string,
  onCategoryChange: PropTypes.func.isRequired,
};

export default CategoryFilter;