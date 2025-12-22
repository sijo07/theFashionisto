import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateProductMutation } from "../../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";
import { toast } from "react-toastify";
import { FaCloudUploadAlt, FaBoxOpen, FaLayerGroup, FaTags, FaRulerCombined, FaMoneyBillWave, FaShoePrints, FaTshirt } from "react-icons/fa";
import { GiTrousers } from "react-icons/gi";
import AdminHeader from "./AdminHeader";

const ProductList = () => {
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [offer, setOffer] = useState("");

  // Category State
  const [selectedSuper, setSelectedSuper] = useState("");
  const [selectedMain, setSelectedMain] = useState("");
  const [selectedSub, setSelectedSub] = useState("");

  // Size & Stock State
  // Structure: { "S": 10, "M": 5 }
  const [sizeStock, setSizeStock] = useState({});
  const [sizeType, setSizeType] = useState("clothing"); // 'clothing', 'footwear', 'jeans'

  const [quantity, setQuantity] = useState(""); // Limit per order
  const [imageUrl, setImageUrl] = useState(null);

  const navigate = useNavigate();

  const [createProduct] = useCreateProductMutation();
  const { data: categoriesData } = useFetchCategoriesQuery();

  const superCategories = categoriesData?.superCategories || [];
  const mainCategories = categoriesData?.mainCategories || [];
  const subCategories = categoriesData?.subCategories || [];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Pre-defined Size Arrays
  const sizeMaps = {
    clothing: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
    footwear: ["UK-6", "UK-6.5", "UK-7", "UK-7.5", "UK-8", "UK-8.5", "UK-9", "UK-9.5", "UK-10", "UK-11"],
    jeans: ["28", "30", "32", "34", "36", "38", "40", "42", "44"]
  };

  const activeSizes = sizeMaps[sizeType] || sizeMaps.clothing;

  const toggleSize = (s) => {
    const newStock = { ...sizeStock };
    if (newStock.hasOwnProperty(s)) {
      delete newStock[s]; // Deselect
    } else {
      newStock[s] = ""; // Select with empty stock
    }
    setSizeStock(newStock);
  };

  const handleStockChange = (s, value) => {
    // Only allow change if size is selected
    if (sizeStock.hasOwnProperty(s)) {
      setSizeStock({ ...sizeStock, [s]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageUrl) return toast.error("Please upload an image");
    if (!selectedSub) return toast.error("Select a sub-category");

    // Process Sizes
    const sizesArray = Object.entries(sizeStock).map(([size, stock]) => ({
      size,
      stock: Number(stock) || 0
    }));

    if (sizesArray.length === 0) return toast.error("Select at least one size");
    if (sizesArray.some(item => item.stock <= 0)) return toast.error("Please enter valid stock for all selected sizes");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("brand", brand);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("offer", offer);
      formData.append("category", selectedSub);
      formData.append("sizes", JSON.stringify(sizesArray)); // Send Structured Array
      formData.append("quantity", quantity);
      formData.append("image", imageUrl);

      const response = await createProduct(formData);

      if (response?.data?.error) {
        toast.error(response.data.error);
      } else {
        toast.success("Product created successfully");
        navigate("/admin/allproductslist");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.error || "Product creation failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-gray-900 pb-20">
      <AdminHeader title="Create Product" subtitle="Add new inventory to your store" />

      <div className="p-6 max-w-[1600px] mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">

          {/* Left Column: Image & Basic Info */}
          <div className="lg:w-1/3 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaCloudUploadAlt className="text-teal-500" /> Product Image
              </h3>
              <label className="flex flex-col items-center justify-center w-full h-[320px] border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-teal-400 transition-all group overflow-hidden relative">
                {imageUrl ? (
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400 group-hover:text-teal-500 transition-colors">
                    <FaCloudUploadAlt className="w-16 h-16 mb-4" />
                    <p className="mb-2 text-sm font-semibold">Click to upload image</p>
                    <p className="text-xs">JPG, PNG, WEBP</p>
                  </div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name</label>
                <input type="text" placeholder="e.g. Slim Fit Cotton Shirt" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Brand</label>
                <input type="text" placeholder="e.g. Nike, Zara" value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all" required />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:w-2/3 space-y-6">

            {/* Category */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaLayerGroup className="text-amber-500" /> Categorization
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* ... (Same Category Logic) ... */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Super Category</label>
                  <select value={selectedSuper} onChange={(e) => { setSelectedSuper(e.target.value); setSelectedMain(""); setSelectedSub(""); }} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500">
                    <option value="">Select Super...</option>
                    {superCategories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Main Category</label>
                  <select value={selectedMain} onChange={(e) => { setSelectedMain(e.target.value); setSelectedSub(""); }} disabled={!selectedSuper} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50">
                    <option value="">Select Main...</option>
                    {mainCategories.filter(c => c.parent === selectedSuper || c.parent?._id === selectedSuper).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Sub Category</label>
                  <select value={selectedSub} onChange={(e) => setSelectedSub(e.target.value)} disabled={!selectedMain} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50">
                    <option value="">Select Sub...</option>
                    {subCategories.filter(c => c.parent === selectedMain || c.parent?._id === selectedMain).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Price</label>
                  <div className="relative"><span className="absolute left-3 top-3 text-gray-400 font-bold">₹</span><input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full pl-8 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold" required /></div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Offer Price</label>
                  <div className="relative"><span className="absolute left-3 top-3 text-gray-400 font-bold">₹</span><input type="number" value={offer} onChange={(e) => setOffer(e.target.value)} className="w-full pl-8 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold text-teal-600" /></div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Limit Per Order</label>
                  <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500" required />
                </div>
              </div>
            </div>

            {/* Sizes & Stock (New Logic) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaRulerCombined className="text-blue-500" /> Sizes & Stock
              </h3>

              {/* Size Type Switcher */}
              <div className="flex bg-gray-100 p-1 rounded-xl mb-6 w-fit">
                <button type="button" onClick={() => setSizeType('clothing')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${sizeType === 'clothing' ? 'bg-white shadow text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  <FaTshirt /> Clothing
                </button>
                <button type="button" onClick={() => setSizeType('footwear')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${sizeType === 'footwear' ? 'bg-white shadow text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  <FaShoePrints /> Footwear
                </button>
                <button type="button" onClick={() => setSizeType('jeans')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${sizeType === 'jeans' ? 'bg-white shadow text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  <GiTrousers /> Bottoms
                </button>
              </div>

              {/* Size Selection Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {activeSizes.map(s => {
                  const isSelected = sizeStock.hasOwnProperty(s);
                  return (
                    <div key={s} className={`relative p-3 rounded-xl border-2 transition-all ${isSelected ? 'border-teal-500 bg-teal-50' : 'border-gray-100 bg-gray-50 hover:border-gray-300'}`}>

                      {/* Checkbox/Toggle */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-bold ${isSelected ? 'text-teal-700' : 'text-gray-600'}`}>{s}</span>
                        <div onClick={() => toggleSize(s)} className={`w-5 h-5 rounded-full border cursor-pointer flex items-center justify-center transition-all ${isSelected ? 'bg-teal-500 border-teal-500' : 'border-gray-300 bg-white'}`}>
                          {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                      </div>

                      {/* Stock Input (Conditional) */}
                      {isSelected ? (
                        <div>
                          <label className="text-[10px] font-bold text-teal-600 uppercase">Qty</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            autoFocus
                            value={sizeStock[s]}
                            onChange={(e) => handleStockChange(s, e.target.value)}
                            className="w-full mt-1 p-1 px-2 text-sm border border-teal-200 rounded focus:outline-none focus:border-teal-500 bg-white"
                          />
                        </div>
                      ) : (
                        <div className="h-[42px] flex items-center justify-center text-xs text-gray-300 pointer-events-none">
                          Select to add stock
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea rows="4" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"></textarea>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" className="px-10 py-4 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-bold rounded-xl shadow-xl hover:shadow-teal-500/20 transform hover:-translate-y-0.5 transition-all text-lg flex items-center gap-2">
                <FaBoxOpen /> Publish Product
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductList;