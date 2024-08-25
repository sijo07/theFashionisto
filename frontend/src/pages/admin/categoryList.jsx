import { useState } from "react";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useFetchCategoriesQuery,
} from "../../redux/api/categoryApiSlice";
import { toast } from "react-toastify";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";

const CategoryList = () => {
  const {
    data: categories = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useFetchCategoriesQuery();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formType, setFormType] = useState("create");
  const [categoryName, setCategoryName] = useState("");
  const [parentId, setParentId] = useState("");

  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setFormType("edit");
    setCategoryName(category.name);
    setParentId(category.parentId || "");
  };

  const handleAddChildClick = (parent) => {
    setSelectedCategory(null);
    setFormType("create");
    setCategoryName("");
    setParentId(parent._id);
  };

  const handleDeleteClick = async (category) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      try {
        await deleteCategory(category._id).unwrap();
        toast.success(`${category.name} has been deleted.`);
        refetch(); // Refetch the categories after deletion
      } catch (error) {
        toast.error(error.data?.message || "Failed to delete category.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName) {
      toast.error("Category name is required.");
      return;
    }

    try {
      if (formType === "create") {
        await createCategory({
          name: categoryName,
          parentId: parentId || null,
        }).unwrap();
        toast.success("Category created successfully.");
      } else if (formType === "edit") {
        await updateCategory({
          categoryId: selectedCategory._id,
          updatedCategory: { name: categoryName, parentId },
        }).unwrap();
        toast.success("Category updated successfully.");
      }
      setCategoryName("");
      setParentId("");
      setSelectedCategory(null);
      refetch(); // Refetch the categories after creation or update
    } catch (error) {
      toast.error(error.data?.message || "Failed to save category.");
    }
  };

  if (isLoading) return <p className="text-center">Loading...</p>;
  if (isError)
    return <p className="text-center text-red-600">{error.message}</p>;

  // Filter out the currently selected category from the options
  const filteredCategories = categories.filter(
    (cat) => cat._id !== selectedCategory?._id
  );

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-6">
        Category Management
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Category Name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
            {formType === "create" && (
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="">Select Parent Category</option>
                {filteredCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
            <button
              type="submit"
              className="bg-teal-600 text-white px-4 py-2 rounded-lg w-full flex items-center justify-center hover:bg-teal-700 transition"
            >
              {formType === "create" ? (
                <FaPlus className="mr-2" />
              ) : (
                <FaEdit className="mr-2" />
              )}
              {formType === "create" ? "Create" : "Update"}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Categories</h2>
          <ul className="space-y-4">
            {categories.map((cat) => (
              <li
                key={cat._id}
                className="border border-gray-200 p-4 rounded-lg bg-gray-50"
              >
                <div className="flex justify-between items-center">
                  <div className="text-lg font-medium">{cat.name}</div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEditClick(cat)}
                      className="text-blue-600 hover:text-blue-700 flex items-center"
                    >
                      <FaEdit className="mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => handleAddChildClick(cat)}
                      className="text-green-600 hover:text-green-700 flex items-center"
                    >
                      <FaPlus className="mr-1" /> Add Sub
                    </button>
                    <button
                      onClick={() => handleDeleteClick(cat)}
                      className="text-red-600 hover:text-red-700 flex items-center"
                    >
                      <FaTrash className="mr-1" /> Delete
                    </button>
                  </div>
                </div>
                {cat.children && cat.children.length > 0 && (
                  <ul className="mt-4 space-y-2 pl-4 border-l border-gray-300">
                    {cat.children.map((child) => (
                      <li key={child._id} className="pl-4">
                        <div className="flex justify-between items-center">
                          <div className="text-sm">{child.name}</div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleEditClick(child)}
                              className="text-blue-600 hover:text-blue-700 flex items-center"
                            >
                              <FaEdit className="mr-1" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(child)}
                              className="text-red-600 hover:text-red-700 flex items-center"
                            >
                              <FaTrash className="mr-1" /> Delete
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">
            Total Categories: {categories.length}
          </h2>
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat._id} className="flex justify-between">
                <strong>{cat.name}</strong>
                <span className="text-gray-600">
                  ({cat.children?.length || 0})
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CategoryList;
