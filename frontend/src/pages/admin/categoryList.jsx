import { useState, useEffect } from "react";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useFetchCategoriesQuery,
} from "../../redux/api/categoryApiSlice";
import { toast } from "react-toastify";
import CategoryForm from "../../components/CategoryForm";
import Modal from "../../components/Modal";
import AdminHeader from "./AdminHeader";
import { FaEdit, FaTrash, FaPlus, FaFolder, FaFolderOpen, FaLayerGroup } from "react-icons/fa";

const CategoryList = () => {
  const { data: categories, refetch } = useFetchCategoriesQuery();
  const [name, setName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [updatingName, setUpdatingName] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  // New state for 3-level hierarchy
  const [parent, setParent] = useState("");

  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!name) {
      toast.error("Category name is required");
      return;
    }

    try {
      const result = await createCategory({
        name,
        parent: parent || null
      }).unwrap();

      if (result.error) {
        toast.error(result.error);
      } else {
        setName("");
        setParent("");
        toast.success(`${result.name} is created.`);
        refetch();
      }
    } catch (error) {
      console.error(error);
      toast.error("Creating category failed, try again.");
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!updatingName) {
      toast.error("Category name is required");
      return;
    }

    try {
      const result = await updateCategory({
        categoryId: selectedCategory._id,
        updatedCategory: {
          name: updatingName,
        },
      }).unwrap();

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${result.name} is updated`);
        setSelectedCategory(null);
        setUpdatingName("");
        setModalVisible(false);
        refetch();
      }
    } catch (error) {
      console.error(error);
      toast.error("Category update failed. Try again.");
    }
  };

  const handleDeleteCategory = async () => {
    try {
      const result = await deleteCategory(selectedCategory._id).unwrap();

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${result.name} is deleted.`);
        setSelectedCategory(null);
        setModalVisible(false);
        refetch();
      }
    } catch (error) {
      console.error(error);
      toast.error("Category deletion failed. Try again.");
    }
  };

  // Helper to filter categories by level
  const superCategories = categories?.filter((c) => !c.parent) || [];

  const getSubCategories = (parentId) => {
    return categories?.filter((c) => c.parent === parentId) || [];
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 font-sans text-gray-900">
      <AdminHeader title="Manage Categories" subtitle="Organize your product hierarchy (Super > Main > Sub)">
        {/* No extra actions needed yet */}
      </AdminHeader>

      <div className="p-8 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* CREATE FORM */}
        <div className="lg:col-span-4 transition-all">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sticky top-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaPlus className="text-gold" /> Create Category
            </h2>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Parent Category (Optional)</label>
                <select
                  className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-gold focus:border-gold block p-2.5"
                  value={parent}
                  onChange={(e) => setParent(e.target.value)}
                >
                  <option value="">None (Super Category)</option>

                  {/* Level 1: Super Categories */}
                  {superCategories.map((superCat) => (
                    <optgroup key={superCat._id} label={superCat.name}>
                      <option value={superCat._id}>-- Create under {superCat.name} (Main) - {superCat.categoryId}</option>

                      {/* Level 2: Main Categories (to create Sub) */}
                      {getSubCategories(superCat._id).map((mainCat) => (
                        <option key={mainCat._id} value={mainCat._id}>
                          &nbsp;&nbsp;&nbsp;&nbsp;---- {mainCat.name} (Sub) - {mainCat.categoryId}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Category Name</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-gold focus:border-gold block p-2.5"
                  placeholder="e.g. Men, Topwear, Shirts"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full text-white bg-gradient-to-r from-gold-dark to-gold hover:from-gold hover:to-gold-light font-bold rounded-lg text-sm px-5 py-2.5 text-center shadow-md transition-all"
              >
                Create Category
              </button>
            </form>
          </div>
        </div>

        {/* CATEGORY TREE / LIST */}
        <div className="lg:col-span-8 space-y-6">
          {/* Loop through Super Categories */}
          {superCategories.map((superCat) => (
            <div key={superCat._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
              {/* Header: Super Category */}
              <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex justify-between items-center group hover:bg-white transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gold/10 text-gold rounded-lg">
                    <FaLayerGroup />
                  </div>
                  <h3 className="font-display font-bold text-lg text-gray-800">
                    {superCat.name}
                    {superCat.categoryId && <span className="ml-2 text-xs font-mono text-gray-400">({superCat.categoryId})</span>}
                  </h3>
                  <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-mono uppercase">Super</span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setModalVisible(true);
                      setSelectedCategory(superCat);
                      setUpdatingName(superCat.name);
                    }}
                    className="p-2 text-gray-400 hover:text-gold transition-colors"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCategory(superCat);
                      setModalVisible(true); // Re-use modal for delete confirmation logic if distinct? Or reuse generic delete logic
                      // For now, modal handles update. Delete button separate?
                      // Let's rely on the Update Modal having a delete button or add direct delete here
                      // Implementing direct delete check is risky without confirm, but handleDeleteCategory uses selectedCategory.
                      // Let's use the modal which usually has both actions in this template.
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    {/* Handled in Modal usually */}
                  </button>
                </div>
              </div>

              {/* Main Categories Grid */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {getSubCategories(superCat._id).map((mainCat) => (
                  <div key={mainCat._id} className="border border-gray-200 rounded-lg p-3 hover:border-gold/30 hover:shadow-sm transition-all bg-gray-50/30">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-gray-700 flex items-center gap-2">
                        <FaFolderOpen className="text-gold-dark/70 text-sm" />
                        {mainCat.name}
                        {mainCat.categoryId && <span className="ml-2 text-[10px] font-mono text-gray-400">({mainCat.categoryId})</span>}
                      </h4>
                      <button
                        onClick={() => {
                          setModalVisible(true);
                          setSelectedCategory(mainCat);
                          setUpdatingName(mainCat.name);
                        }}
                        className="text-gray-400 hover:text-gold text-xs"
                      >
                        <FaEdit />
                      </button>
                    </div>

                    {/* Sub Categories List */}
                    <div className="pl-6 space-y-1">
                      {getSubCategories(mainCat._id).length === 0 && (
                        <p className="text-xs text-gray-400 italic">No sub-categories</p>
                      )}
                      {getSubCategories(mainCat._id).map((subCat) => (
                        <div key={subCat._id} className="flex justify-between items-center group/sub">
                          <span className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                            {subCat.name}
                            {subCat.categoryId && <span className="ml-1 text-[10px] font-mono text-gray-400">({subCat.categoryId})</span>}
                          </span>
                          <button
                            onClick={() => {
                              setModalVisible(true);
                              setSelectedCategory(subCat);
                              setUpdatingName(subCat.name);
                            }}
                            className="text-gray-300 hover:text-gold text-[10px] opacity-0 group-hover/sub:opacity-100 transition-opacity"
                          >
                            Edit
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {getSubCategories(superCat._id).length === 0 && (
                  <div className="col-span-full text-center py-6 text-gray-400 italic">
                    No Main Categories. Create one linked to {superCat.name}.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={modalVisible} onClose={() => setModalVisible(false)}>
        <CategoryForm
          value={updatingName}
          setValue={(value) => setUpdatingName(value)}
          handleSubmit={handleUpdateCategory}
          buttonText="Update"
          handleDelete={handleDeleteCategory}
        />
      </Modal>
    </div>
  );
};

export default CategoryList;
