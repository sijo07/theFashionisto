import { useState, useEffect } from "react";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useFetchCategoriesQuery,
} from "../../redux/api/categoryApiSlice";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaEdit, FaTrash, FaPlus, FaFolder,
  FaFolderOpen, FaLayerGroup, FaSitemap,
  FaChevronRight, FaTimes
} from "react-icons/fa";
import CategoryForm from "../../components/CategoryForm";
import Modal from "../../components/Modal";
import AdminHeader from "./AdminHeader";
import Loader from "../../components/Loader";

const CategoryList = () => {
  const { data: categories, refetch } = useFetchCategoriesQuery();
  const [name, setName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [updatingName, setUpdatingName] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [parent, setParent] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!name) return toast.error("Category name required");

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
        toast.success(`Category "${result.name}" created.`);
        refetch();
      }
    } catch (error) {
      toast.error("Initialization sequence failed.");
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!updatingName) return toast.error("Name cannot be empty");

    try {
      const result = await updateCategory({
        categoryId: selectedCategory._id,
        updatedCategory: { name: updatingName },
      }).unwrap();

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Category updated.");
        setSelectedCategory(null);
        setUpdatingName("");
        setModalVisible(false);
        refetch();
      }
    } catch (error) {
      toast.error("Update failed.");
    }
  };

  const handleDeleteCategory = async () => {
    if (!window.confirm("Delete selected category and all its items?")) return;
    try {
      const result = await deleteCategory(selectedCategory._id).unwrap();
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Category deleted successfully.");
        setSelectedCategory(null);
        setModalVisible(false);
        refetch();
      }
    } catch (error) {
      toast.error("Purge aborted.");
    }
  };

  const superCategories = categories?.filter((c) => !c.parent) || [];
  const getSubCategories = (parentId) => categories?.filter((c) => c.parent === parentId) || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white pb-20 overflow-x-hidden">
      <AdminHeader title="Collection Structure" subtitle="Organize your catalog across Super, Main, and Sub levels.">
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-full border border-zinc-800">
          <FaSitemap className="text-red-500" size={12} />
          <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Category Tree</span>
        </div>
      </AdminHeader>

      <div className="p-4 md:p-6 lg:p-10 max-w-[1700px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">

        {/* Creation Sidebar */}
        <div className="lg:col-span-4 order-1 lg:order-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-zinc-800 shadow-2xl lg:sticky lg:top-28"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/20">
                <FaPlus size={20} />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight text-white">Create Category</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">New Taxonomy Entry</p>
              </div>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Parent Hierarchy</label>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Parent Hierarchy</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full bg-black/40 border border-zinc-800 rounded-xl px-5 py-4 text-left flex justify-between items-center focus:border-red-600 focus:outline-none transition-colors hover:bg-black/60 group"
                  >
                    <span className={`text-sm font-bold ${parent ? 'text-white' : 'text-zinc-500'}`}>
                      {parent ? (() => {
                        const s = superCategories.find(c => c._id === parent);
                        if (s) return `↳ ${s.name} (Add Main)`;
                        const m = categories.find(c => c._id === parent); // optimization: find in all categories if not super
                        return m ? `  ↳ ${m.name} (Add Sub)` : "ROOT (SUPER CATEGORY)";
                      })() : "ROOT (SUPER CATEGORY)"}
                    </span>
                    <FaChevronRight className={`text-zinc-500 transition-transform duration-300 ${dropdownOpen ? 'rotate-[-90deg]' : 'rotate-90'} group-hover:text-red-500`} size={12} />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 left-0 right-0 top-full mt-2 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl overflow-hidden max-h-[300px] overflow-y-auto custom-scrollbar"
                      >
                        {/* Option: ROOT */}
                        <div
                          onClick={() => { setParent(""); setDropdownOpen(false); }}
                          className="px-5 py-3 hover:bg-red-600 hover:text-white cursor-pointer transition-colors border-b border-zinc-800/50"
                        >
                          <span className="text-sm font-black uppercase tracking-tight">ROOT (SUPER CATEGORY)</span>
                        </div>

                        {/* Options: Hierarchy */}
                        {superCategories.map((s) => (
                          <div key={s._id}>
                            {/* Super Category Item */}
                            <div
                              onClick={() => { setParent(s._id); setDropdownOpen(false); }}
                              className="px-5 py-3 hover:bg-zinc-800 cursor-pointer transition-colors flex items-center gap-2 group/item"
                            >
                              <div className="w-1 h-full bg-red-600 rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity" />
                              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">{s.name}</span>
                              <span className="text-[9px] text-zinc-600 font-bold ml-auto">(Add Main)</span>
                            </div>

                            {/* Sub Categories (Main) Item */}
                            {getSubCategories(s._id).map(m => (
                              <div
                                key={m._id}
                                onClick={() => { setParent(m._id); setDropdownOpen(false); }}
                                className="pl-10 pr-5 py-2 hover:bg-zinc-800 cursor-pointer transition-colors flex items-center gap-2 border-l border-zinc-800 ml-5"
                              >
                                <FaChevronRight size={8} className="text-zinc-600" />
                                <span className="text-xs font-medium text-zinc-400 group-hover:text-white">{m.name}</span>
                                <span className="text-[9px] text-zinc-700 font-bold ml-auto">(Add Sub)</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Click Outside Handler (Transparent Overlay) */}
                  {dropdownOpen && (
                    <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setDropdownOpen(false)} />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Category Name</label>
                <input
                  type="text"
                  className="w-full bg-black/40 border border-zinc-800 rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-red-600 focus:outline-none transition-all placeholder:text-zinc-700"
                  placeholder="e.g. SUMMER COLLECTION"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-white text-black hover:bg-red-600 hover:text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <FaPlus size={10} /> Confirm Creation
              </button>
            </form>
          </motion.div>
        </div>

        {/* Hierarchy Visualization */}
        <div className="lg:col-span-8 space-y-6 order-2 lg:order-none">
          {categories ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {superCategories.map((superCat) => (
                <motion.div
                  key={superCat._id}
                  className="bg-zinc-900/30 backdrop-blur-md rounded-[2.5rem] border border-zinc-800/50 overflow-hidden"
                >
                  {/* Super Category Header */}
                  <div className="p-6 md:p-8 bg-zinc-900/80 border-b border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-zinc-800/50 text-white flex items-center justify-center border border-zinc-700/50 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-zinc-800 to-transparent opacity-50" />
                        <FaLayerGroup size={24} className="relative z-10" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-red-500/10 text-red-500 rounded text-[9px] font-black uppercase tracking-widest border border-red-500/20">Super Category</span>
                        </div>
                        <h3 className="text-2xl font-black text-white tracking-tighter uppercase">{superCat.name}</h3>
                      </div>
                    </div>
                    <button
                      onClick={() => { setSelectedCategory(superCat); setUpdatingName(superCat.name); setModalVisible(true); }}
                      className="self-end sm:self-auto px-4 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
                    >
                      <FaEdit /> Manage
                    </button>
                  </div>

                  {/* Main Categories Grid */}
                  <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 bg-black/20">
                    {getSubCategories(superCat._id).map((mainCat) => (
                      <div key={mainCat._id} className="group relative p-6 rounded-3xl border border-zinc-800 bg-zinc-950/50 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-300">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-zinc-400 flex items-center justify-center border border-zinc-800 group-hover:text-red-500 group-hover:border-red-500/30 transition-colors">
                              <FaFolderOpen />
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider block">Main</span>
                              <h4 className="font-bold text-sm text-white uppercase tracking-tight">{mainCat.name}</h4>
                            </div>
                          </div>
                          <button
                            onClick={() => { setSelectedCategory(mainCat); setUpdatingName(mainCat.name); setModalVisible(true); }}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-800 text-zinc-600 hover:text-white transition-colors"
                          >
                            <FaEdit size={12} />
                          </button>
                        </div>

                        {/* Sub Categories List */}
                        <div className="space-y-1">
                          {getSubCategories(mainCat._id).length === 0 && (
                            <div className="py-4 text-center border-t border-dashed border-zinc-800/50">
                              <span className="text-[10px] font-medium text-zinc-700 uppercase tracking-widest">No Sub-categories</span>
                            </div>
                          )}
                          {getSubCategories(mainCat._id).map(subCat => (
                            <div key={subCat._id} className="group/item flex items-center justify-between py-2 px-3 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all cursor-default">
                              <div className="flex items-center gap-3">
                                <div className="w-1 h-1 rounded-full bg-zinc-700 group-hover/item:bg-red-500 transition-colors" />
                                <span className="text-xs font-medium text-zinc-400 group-hover/item:text-zinc-200 transition-colors uppercase tracking-tight">{subCat.name}</span>
                              </div>
                              <button
                                onClick={() => { setSelectedCategory(subCat); setUpdatingName(subCat.name); setModalVisible(true); }}
                                className="opacity-0 group-hover/item:opacity-100 text-[10px] font-bold text-zinc-500 hover:text-white transition-all uppercase"
                              >
                                Edit
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {getSubCategories(superCat._id).length === 0 && (
                      <div className="col-span-full py-12 flex flex-col items-center justify-center text-center opacity-30 border-2 border-dashed border-zinc-800 rounded-3xl">
                        <FaFolder size={32} className="text-zinc-600 mb-3" />
                        <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">No Main Categories</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : <Loader />}
        </div>
      </div>

      <AnimatePresence>
        {modalVisible && (
          <Modal isOpen={modalVisible} onClose={() => setModalVisible(false)}>
            <div className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <FaEdit size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Edit Information</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active UUID: {selectedCategory?._id?.substring(0, 12)}</p>
                </div>
              </div>

              <CategoryForm
                value={updatingName}
                setValue={(value) => setUpdatingName(value)}
                handleSubmit={handleUpdateCategory}
                buttonText="Deploy Changes"
                handleDelete={handleDeleteCategory}
              />
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoryList;
