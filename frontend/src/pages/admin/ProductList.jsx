import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateProductMutation } from "../../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  FaCloudUploadAlt, FaLayerGroup, FaTags,
  FaChevronRight, FaBox, FaRulerCombined, FaTrash, FaPlus
} from "react-icons/fa";
import AdminHeader from "./AdminHeader";

const ProductList = () => {
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [offer, setOffer] = useState("");
  const [selectedSuper, setSelectedSuper] = useState("");
  const [selectedMain, setSelectedMain] = useState("");
  const [selectedSub, setSelectedSub] = useState("");
  const [sizeStock, setSizeStock] = useState({});
  const [sizeType, setSizeType] = useState("clothing");
  const [quantity, setQuantity] = useState("");
  const [images, setImages] = useState([]);

  const navigate = useNavigate();
  const [createProduct] = useCreateProductMutation();
  const { data: categoriesData } = useFetchCategoriesQuery();

  const superCategories = categoriesData?.filter(c => !c.parent) || [];
  const mainCategories = categoriesData?.filter(c => c.parent && superCategories.find(s => s._id === (c.parent?._id || c.parent))) || [];
  const subCategories = categoriesData?.filter(c => c.parent && mainCategories.find(m => m._id === (c.parent?._id || c.parent))) || [];

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const sizeMaps = {
    clothing: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
    footwear: ["UK-6", "UK-6.5", "UK-7", "UK-7.5", "UK-8", "UK-8.5", "UK-9", "UK-9.5", "UK-10", "UK-11"],
    jeans: ["28", "30", "32", "34", "36", "38", "40", "42", "44"]
  };

  const activeSizes = sizeMaps[sizeType] || sizeMaps.clothing;

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
    if (images.length === 0) return toast.error("At least one product image is required.");
    if (!selectedSub) return toast.error("Please select a sub-category.");
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
      formData.append("image", images[0]); // Main image
      formData.append("images", JSON.stringify(images)); // All images

      await createProduct(formData).unwrap();
      toast.success("New product added to catalog.");
      navigate("/admin/allproductslist");
    } catch (err) {
      toast.error("Process failure.");
    }
  };

  const inputClass = "w-full bg-zinc-900 border border-zinc-800 rounded-sm px-4 py-3 text-sm font-medium text-white placeholder:text-zinc-600 focus:border-red-600 focus:outline-none transition-colors";
  const labelClass = "text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 block";

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white pb-20">
      <AdminHeader title="Create Product" subtitle="Add new inventory item" />

      <div className="p-4 md:p-6 lg:p-10 max-w-[1440px] mx-auto">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">

          {/* Left Column: Image & Basic Info */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-zinc-950 p-6 rounded-sm border border-zinc-800">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
                <FaCloudUploadAlt /> Product Gallery
              </h3>

              <div
                onClick={() => document.getElementById('imageInput').click()}
                className="group relative flex flex-col items-center justify-center w-full aspect-[3/4] border border-dashed border-zinc-800 hover:border-red-600 transition-colors cursor-pointer bg-zinc-900/50 overflow-hidden"
              >
                {images.length > 0 ? (
                  <div className="w-full h-full relative group-hover:opacity-40 transition-opacity">
                    <img src={images[0]} className="w-full h-full object-cover" />
                    {images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-sm backdrop-blur-sm">
                        +{images.length - 1} more
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-zinc-600 group-hover:text-red-500 transition-colors">
                    <FaCloudUploadAlt size={32} className="mb-2" />
                    <span className="text-xs font-bold uppercase">Upload Images</span>
                  </div>
                )}
                <input id="imageInput" type="file" multiple className="hidden" accept="image/*" onChange={handleImageChange} />
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square border border-zinc-800 rounded-sm overflow-hidden group">
                      <img src={img} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(idx)}
                        type="button"
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-500 transition-opacity"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => document.getElementById('imageInput').click()}
                    className="aspect-square border border-dashed border-zinc-800 rounded-sm flex items-center justify-center text-zinc-600 hover:text-white hover:border-zinc-600 transition-all"
                  >
                    <FaPlus />
                  </button>
                </div>
              )}

              <div className="mt-8 space-y-4">
                <div>
                  <label className={labelClass}>Product Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Enter name" required />
                </div>
                <div>
                  <label className={labelClass}>Brand</label>
                  <input value={brand} onChange={(e) => setBrand(e.target.value)} className={inputClass} placeholder="Enter brand" required />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Config */}
          <div className="lg:col-span-8 space-y-8">

            {/* Category Selection */}
            <div className="bg-zinc-950 p-6 rounded-sm border border-zinc-800">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
                <FaLayerGroup /> Categorization
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Super Category</label>
                  <select value={selectedSuper} onChange={(e) => { setSelectedSuper(e.target.value); setSelectedMain(""); setSelectedSub(""); }} className={inputClass}>
                    <option value="">Select...</option>
                    {superCategories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Main Category</label>
                  <select value={selectedMain} onChange={(e) => { setSelectedMain(e.target.value); setSelectedSub(""); }} disabled={!selectedSuper} className={`${inputClass} disabled:opacity-50`}>
                    <option value="">Select...</option>
                    {mainCategories.filter(c => c.parent === selectedSuper || c.parent?._id === selectedSuper).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Sub Category</label>
                  <select value={selectedSub} onChange={(e) => setSelectedSub(e.target.value)} disabled={!selectedMain} className={`${inputClass} disabled:opacity-50`}>
                    <option value="">Select...</option>
                    {subCategories.filter(c => c.parent === selectedMain || c.parent?._id === selectedMain).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Size & Inventory */}
            <div className="bg-zinc-950 p-6 rounded-sm border border-zinc-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <FaRulerCombined /> Size & Stock
                </h3>
                <div className="flex gap-2 bg-zinc-900 p-1 rounded-sm">
                  {['clothing', 'footwear', 'jeans'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSizeType(type)}
                      className={`px-3 py-1 text-[10px] font-bold uppercase transition-colors ${sizeType === type ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {activeSizes.map(s => {
                  const isSelected = sizeStock.hasOwnProperty(s);
                  return (
                    <div key={s} className={`p-3 border rounded-sm transition-all ${isSelected ? 'border-red-600 bg-red-900/10' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-zinc-400'}`}>{s}</span>
                        <div onClick={() => toggleSize(s)} className={`w-3 h-3 rounded-full border cursor-pointer ${isSelected ? 'bg-red-600 border-red-600' : 'border-zinc-600 hover:border-white'}`} />
                      </div>
                      {isSelected && (
                        <input
                          type="number"
                          value={sizeStock[s]}
                          onChange={(e) => handleStockChange(s, e.target.value)}
                          className="w-full bg-black border border-zinc-700 p-1 text-xs text-center text-white focus:border-red-500 focus:outline-none"
                          placeholder="Qty"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pricing & Finish */}
            <div className="bg-zinc-950 p-6 rounded-sm border border-zinc-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className={labelClass}>Price (₹)</label>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} placeholder="0.00" required />
                </div>
                <div>
                  <label className={labelClass}>Offer Price (₹)</label>
                  <input type="number" value={offer} onChange={(e) => setOffer(e.target.value)} className={inputClass} placeholder="0.00" />
                </div>
                <div>
                  <label className={labelClass}>Total Quantity</label>
                  <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className={inputClass} placeholder="0" required />
                </div>
              </div>

              <div className="mb-8">
                <label className={labelClass}>Description</label>
                <textarea rows="4" value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} resize-none`} placeholder="Product details..."></textarea>
              </div>

              <div className="flex justify-end">
                <button type="submit" className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest text-sm flex items-center gap-2 transition-colors">
                  Create Product <FaChevronRight size={12} />
                </button>
              </div>
            </div>

          </div>

        </form>
      </div>
    </div>
  );
};

export default ProductList;