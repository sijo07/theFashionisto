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

      <div className="p-6 lg:p-10 max-w-[1700px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Creation Sidebar */}
        <div className="lg:col-span-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-zinc-950 rounded-[2.5rem] p-8 border border-zinc-900 shadow-2xl shadow-zinc-900/40 sticky top-28"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/20">
                <FaPlus />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight text-white">Category Creator</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">New Entry</p>
              </div>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Parent Category</label>
                <select
                  className="w-full bg-zinc-900 border-none rounded-2xl px-5 py-4 text-sm font-bold text-white focus:ring-4 focus:ring-red-500/10 cursor-pointer"
                  value={parent}
                  onChange={(e) => setParent(e.target.value)}
                >
                  <option value="">ROOT (NO PARENT)</option>
                  {superCategories.map((s) => (
                    <optgroup key={s._id} label={s.name.toUpperCase()}>
                      <option value={s._id}>-- UNDER {s.name}</option>
                      {getSubCategories(s._id).map(m => (
                        <option key={m._id} value={m._id}>&nbsp;&nbsp;&nbsp;↳ {m.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Category Title</label>
                <input
                  type="text"
                  className="w-full bg-zinc-900 border-none rounded-2xl px-5 py-4 text-sm font-bold text-white focus:ring-4 focus:ring-red-500/10 transition-all placeholder:text-zinc-600"
                  placeholder="e.g. LUXURY_OUTERWEAR"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all hover:-translate-y-1 active:scale-95"
              >
                Confirm Entry
              </button>
            </form>
          </motion.div>
        </div>

        {/* Hierarchy Visualization */}
        <div className="lg:col-span-8 space-y-8">
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
                  className="bg-zinc-950 rounded-[3rem] border border-zinc-900 shadow-2xl shadow-zinc-900/30 overflow-hidden group"
                >
                  {/* Level 1: Main Category */}
                  <div className="p-8 bg-zinc-900/50 border-b border-zinc-900 flex justify-between items-center group-hover:bg-red-500/5 transition-colors">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-zinc-800 text-white flex items-center justify-center shadow-lg border border-zinc-700">
                        <FaLayerGroup size={20} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white tracking-tight uppercase leading-none">{superCat.name}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 bg-zinc-800 text-zinc-500 rounded text-[9px] font-black uppercase tracking-tighter">Main Category</span>
                          <span className="text-[10px] font-mono text-zinc-600">UUID: {superCat.categoryId || superCat._id.substring(0, 8)}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => { setSelectedCategory(superCat); setUpdatingName(superCat.name); setModalVisible(true); }}
                      className="p-3 text-zinc-500 hover:text-red-500 transition-colors bg-zinc-900 rounded-xl border border-zinc-800"
                    >
                      <FaEdit />
                    </button>
                  </div>

                  {/* Level 2: Categories Grid */}
                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-black">
                    {getSubCategories(superCat._id).map((mainCat) => (
                      <div key={mainCat._id} className="p-6 rounded-3xl border border-zinc-900 bg-zinc-900/30 hover:border-red-500/30 hover:bg-zinc-900 hover:shadow-xl hover:shadow-red-500/5 transition-all">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-zinc-800 text-red-500 flex items-center justify-center border border-zinc-700">
                              <FaFolderOpen />
                            </div>
                            <h4 className="font-black text-sm text-white uppercase tracking-tight">{mainCat.name}</h4>
                          </div>
                          <button
                            onClick={() => { setSelectedCategory(mainCat); setUpdatingName(mainCat.name); setModalVisible(true); }}
                            className="text-zinc-600 hover:text-red-500 text-xs"
                          >
                            <FaEdit />
                          </button>
                        </div>

                        {/* Level 3: Sub-categories List */}
                        <div className="space-y-3 pl-4 border-l-2 border-dashed border-zinc-800">
                          {getSubCategories(mainCat._id).length === 0 && <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest italic">No Sub-categories Yet</p>}
                          {getSubCategories(mainCat._id).map(subCat => (
                            <div key={subCat._id} className="flex justify-between items-center py-1 group/sub">
                              <div className="flex items-center gap-3">
                                <FaChevronRight className="text-zinc-700 group-hover/sub:text-red-500 transition-colors" size={8} />
                                <span className="text-xs font-bold text-zinc-500 group-hover/sub:text-zinc-300 transition-colors uppercase tracking-tighter">{subCat.name}</span>
                              </div>
                              <button
                                onClick={() => { setSelectedCategory(subCat); setUpdatingName(subCat.name); setModalVisible(true); }}
                                className="opacity-0 group-hover/sub:opacity-100 text-[10px] font-black text-red-500 uppercase hover:underline"
                              >
                                Edit
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {getSubCategories(superCat._id).length === 0 && (
                      <div className="col-span-full py-10 flex flex-col items-center justify-center text-center opacity-40">
                        <FaFolder size={30} className="text-zinc-700 mb-2" />
                        <p className="text-xs font-black text-zinc-600 uppercase tracking-widest">Main Tier Depleted</p>
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
