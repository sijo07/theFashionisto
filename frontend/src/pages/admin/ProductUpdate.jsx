import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetProductByIdQuery,
  useUploadProductImageMutation
} from "../../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCloudUploadAlt, FaBoxOpen, FaLayerGroup, FaTags,
  FaRulerCombined, FaMoneyBillWave, FaShoePrints, FaTshirt,
  FaTimes, FaChevronRight, FaStar, FaShieldAlt, FaTrashAlt
} from "react-icons/fa";
import { GiTrousers } from "react-icons/gi";
import AdminHeader from "./AdminHeader";

const ProductUpdate = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { data: productData } = useGetProductByIdQuery(params._id);
  const { data: categoriesData } = useFetchCategoriesQuery();
  const [uploadProductImage] = useUploadProductImageMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [offer, setOffer] = useState("");
  const [quantity, setQuantity] = useState("");
  const [sizeStock, setSizeStock] = useState({});
  const [sizeType, setSizeType] = useState("clothing");
  const [imageUrl, setImageUrl] = useState(null);
  const [selectedSuper, setSelectedSuper] = useState("");
  const [selectedMain, setSelectedMain] = useState("");
  const [selectedSub, setSelectedSub] = useState("");

  const superCategories = categoriesData?.filter(c => !c.parent) || [];
  const mainCategories = categoriesData?.filter(c => c.parent && superCategories.find(s => s._id === (c.parent?._id || c.parent))) || [];
  const subCategories = categoriesData?.filter(c => c.parent && mainCategories.find(m => m._id === (c.parent?._id || c.parent))) || [];

  const sizeMaps = {
    clothing: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
    footwear: ["UK-6", "UK-6.5", "UK-7", "UK-7.5", "UK-8", "UK-8.5", "UK-9", "UK-9.5", "UK-10", "UK-11"],
    jeans: ["28", "30", "32", "34", "36", "38", "40", "42", "44"]
  };

  const activeSizes = sizeMaps[sizeType] || sizeMaps.clothing;

  useEffect(() => {
    if (productData) {
      setName(productData.name || "");
      setBrand(productData.brand || "");
      setDescription(productData.description || "");
      setPrice(productData.price || "");
      setOffer(productData.offer || "");
      setQuantity(productData.quantity || "");
      setImageUrl(productData.image || "");

      const initialStock = {};
      if (productData.sizes && Array.isArray(productData.sizes)) {
        productData.sizes.forEach(item => { initialStock[item.size] = item.stock; });
      }
      setSizeStock(initialStock);

      const firstSize = Object.keys(initialStock)[0];
      if (firstSize?.startsWith("UK")) setSizeType("footwear");
      else if (!isNaN(firstSize) && Number(firstSize) > 20) setSizeType("jeans");
      else setSizeType("clothing");

      if (productData.category) {
        const catId = productData.category._id || productData.category;
        setSelectedSub(catId);
        if (categoriesData) {
          const currentSub = categoriesData.all?.find(c => c._id === catId);
          if (currentSub?.parent) {
            setSelectedMain(currentSub.parent);
            const currentMain = categoriesData.all?.find(c => c._id === currentSub.parent);
            if (currentMain?.parent) setSelectedSuper(currentMain.parent);
          }
        }
      }
    }
  }, [productData, categoriesData]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success("Optic data synchronized.");
      setImageUrl(res.url);
    } catch (err) {
      toast.error("Image upload failed.");
    }
  };

  const toggleSize = (s) => {
    const newStock = { ...sizeStock };
    if (newStock.hasOwnProperty(s)) delete newStock[s];
    else newStock[s] = "";
    setSizeStock(newStock);
  };

  const handleStockChange = (s, value) => {
    if (sizeStock.hasOwnProperty(s)) setSizeStock({ ...sizeStock, [s]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sizesArray = Object.entries(sizeStock).map(([size, stock]) => ({ size, stock: Number(stock) || 0 }));
    if (sizesArray.length === 0) return toast.error("Product requires at least one size variant.");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("brand", brand);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("offer", offer);
      formData.append("category", selectedSub);
      formData.append("sizes", JSON.stringify(sizesArray));
      formData.append("quantity", quantity);
      if (imageUrl) formData.append("image", imageUrl);

      await updateProduct({ productId: params._id, formData }).unwrap();
      toast.success("Product information updated.");
      navigate("/admin/allproductslist");
    } catch (err) {
      toast.error("Update process failed.");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("CRITICAL: Permanent product deletion?")) {
      try {
        await deleteProduct(params._id).unwrap();
        toast.success("Product removed from catalog.");
        navigate("/admin/allproductslist");
      } catch (err) {
        toast.error("Purge operation failed.");
      }
    }
  };

  const inputClass = "w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-4 focus:ring-teal-500/10 placeholder:text-gray-300 transition-all";
  const labelClass = "text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block";

  return (
    <div className="min-h-screen bg-[#FDFEFE] font-sans text-gray-900 pb-20 overflow-x-hidden">
      <AdminHeader title="Update Product Information" subtitle={`Modifying details for Item ID: ${params._id.substring(0, 16)}`} />

      <div className="p-6 lg:p-10 max-w-[1700px] mx-auto">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Tactical Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-gray-200/40 border border-gray-100"
            >
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-500/20"><FaCloudUploadAlt /></div>
                Optic Stream
              </h3>
              <label className="group relative flex flex-col items-center justify-center w-full aspect-[3/4] border-2 border-dashed border-gray-200 rounded-[2.5rem] cursor-pointer hover:border-teal-500 hover:bg-teal-50/10 transition-all overflow-hidden shadow-inner">
                {imageUrl ? (
                  <img src={imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-300 group-hover:text-teal-600 transition-colors">
                    <FaCloudUploadAlt size={48} className="mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Connect Visual Stream</p>
                  </div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="bg-rose-50 p-8 rounded-[3rem] shadow-2xl shadow-rose-200/20 border border-rose-100 space-y-4"
            >
              <h3 className="text-lg font-black text-rose-600 uppercase tracking-tight flex items-center gap-3"><FaTrashAlt /> Danger Zone</h3>
              <p className="text-[10px] font-bold text-rose-600/60 uppercase tracking-widest leading-relaxed">Permanent deletion of this product will cascade through all catalog instances.</p>
              <button type="button" onClick={handleDelete} className="w-full py-4 bg-white border border-rose-200 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-xl shadow-rose-500/5">Execute Deletion</button>
            </motion.div>
          </div>

          {/* Global Config */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-8 space-y-8"
          >
            <div className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-gray-200/40 border border-gray-100 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className={labelClass}>Product Title</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="NAME" required />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Authority ID (Brand)</label>
                  <input value={brand} onChange={(e) => setBrand(e.target.value)} className={inputClass} placeholder="BRAND" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Technical Depth (Description)</label>
                <textarea rows="4" value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} resize-none`} placeholder="Product description..." required />
              </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-gray-200/40 border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className={labelClass}>Department</label>
                <select value={selectedSuper} onChange={(e) => { setSelectedSuper(e.target.value); setSelectedMain(""); setSelectedSub(""); }} className={inputClass}>
                  <option value="">SELECT SUPER</option>
                  {superCategories.map(c => <option key={c._id} value={c._id}>{c.name.toUpperCase()}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Main Category</label>
                <select value={selectedMain} onChange={(e) => { setSelectedMain(e.target.value); setSelectedSub(""); }} disabled={!selectedSuper} className={`${inputClass} disabled:opacity-40`}>
                  <option value="">SELECT MAIN</option>
                  {mainCategories.filter(c => c.parent === selectedSuper || c.parent?._id === selectedSuper).map(c => <option key={c._id} value={c._id}>{c.name.toUpperCase()}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Sector Hub (Sub)</label>
                <select value={selectedSub} onChange={(e) => setSelectedSub(e.target.value)} disabled={!selectedMain} className={`${inputClass} disabled:opacity-40`}>
                  <option value="">SELECT SECTOR</option>
                  {subCategories.filter(c => c.parent === selectedMain || c.parent?._id === selectedMain).map(c => <option key={c._id} value={c._id}>{c.name.toUpperCase()}</option>)}
                </select>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-gray-200/40 border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20"><FaRulerCombined /></div>
                  Proportional Mapping
                </h3>
                <div className="flex bg-gray-50 p-1.5 rounded-2xl gap-1 border border-gray-100">
                  {['clothing', 'footwear', 'jeans'].map(type => (
                    <button key={type} type="button" onClick={() => setSizeType(type)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${sizeType === type ? 'bg-white text-teal-600 shadow-xl' : 'text-gray-400'}`}>{type}</button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {activeSizes.map(s => {
                  const isSelected = sizeStock.hasOwnProperty(s);
                  return (
                    <div key={s} className={`p-5 rounded-[2rem] border transition-all ${isSelected ? 'border-teal-400 bg-teal-50/20 shadow-xl shadow-teal-500/5' : 'border-gray-100 bg-gray-50/50 opacity-60'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-xs font-black ${isSelected ? 'text-teal-700' : 'text-gray-400'}`}>{s}</span>
                        <div onClick={() => toggleSize(s)} className={`w-5 h-5 rounded-full border-2 cursor-pointer flex items-center justify-center ${isSelected ? 'border-teal-500 bg-teal-500' : 'border-gray-200 bg-white'}`}>
                          {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full shadow-lg" />}
                        </div>
                      </div>
                      {isSelected && <input type="number" value={sizeStock[s]} onChange={(e) => handleStockChange(s, e.target.value)} className="w-full bg-white border-none rounded-xl px-3 py-2 text-[10px] font-black text-center shadow-inner" placeholder="QTY" />}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-900 p-8 rounded-[3rem] shadow-2xl border border-white/5 relative overflow-hidden">
              <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Liquid Val (Price)</label>
                  <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white">
                    <span className="text-teal-400 font-black mr-2">₹</span>
                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="bg-transparent border-none p-0 text-xl font-black focus:ring-0 w-full" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Incentive (Offer)</label>
                  <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white">
                    <span className="text-teal-400 font-black mr-2">₹</span>
                    <input type="number" value={offer} onChange={(e) => setOffer(e.target.value)} className="bg-transparent border-none p-0 text-xl font-black focus:ring-0 w-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Order Cap</label>
                  <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xl font-black text-white focus:ring-0" required />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 gap-4">
              <button type="button" onClick={() => navigate("/admin/allproductslist")} className="px-10 py-5 bg-gray-100 hover:bg-gray-200 text-gray-500 font-black text-xs uppercase tracking-widest rounded-[2rem] transition-all">Abort Sync</button>
              <button type="submit" className="px-12 py-5 bg-teal-600 hover:bg-teal-700 text-white font-black text-sm uppercase tracking-widest rounded-[2rem] shadow-2xl shadow-teal-500/40 transform hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-4">
                Commit Sync <FaChevronRight size={10} />
              </button>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default ProductUpdate;