import { useState, useEffect } from "react";
import {
    useUpdateProductMutation,
    useUploadProductImageMutation,
    useGetProductByIdQuery
} from "../../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaTimes, FaCloudUploadAlt, FaBox, FaTag,
    FaLayerGroup, FaRulerCombined, FaCheckCircle, FaStar
} from "react-icons/fa";

const EditProductModal = ({ isOpen, onClose, productId }) => {
    const { data: productData } = useGetProductByIdQuery(productId, { skip: !productId });
    const { data: categoriesData } = useFetchCategoriesQuery();
    const [uploadProductImage] = useUploadProductImageMutation();
    const [updateProduct] = useUpdateProductMutation();

    const [brand, setBrand] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [offer, setOffer] = useState("");
    const [quantity, setQuantity] = useState("");
    const [sizeStock, setSizeStock] = useState({});
    const [sizeType, setSizeType] = useState("clothing");
    const [image, setImage] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [category, setCategory] = useState("");
    const [mainCategory, setMainCategory] = useState("");
    const [isFeatured, setIsFeatured] = useState(false);

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
            const initialStock = {};
            if (productData.sizes && Array.isArray(productData.sizes)) {
                productData.sizes.forEach(item => { initialStock[item.size] = item.stock; });
            }
            setSizeStock(initialStock);
            const firstSize = Object.keys(initialStock)[0];
            if (firstSize?.startsWith("UK")) setSizeType("footwear");
            else if (!isNaN(firstSize) && Number(firstSize) > 20) setSizeType("jeans");
            else setSizeType("clothing");
            setQuantity(productData.quantity || "");
            setImageUrl(productData.image || "");
            setIsFeatured(productData.isFeatured || false);
            const catId = productData.category?._id || productData.category;
            setCategory(catId || "");
            if (categoriesData && catId) {
                const foundCat = categoriesData.find(c => c._id === catId);
                if (foundCat?.parent) setMainCategory(foundCat.parent);
            }
        }
    }, [productData, categoriesData]);

    const toggleSize = (s) => {
        const newStock = { ...sizeStock };
        if (newStock.hasOwnProperty(s)) delete newStock[s];
        else newStock[s] = "";
        setSizeStock(newStock);
    };

    const handleStockChange = (s, val) => setSizeStock({ ...sizeStock, [s]: val });

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("image", file);
        try {
            const res = await uploadProductImage(formData).unwrap();
            toast.success("Optic data synchronized.");
            setImageUrl(res.url);
        } catch (err) {
            toast.error("Image upload failure.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const sizesArray = Object.entries(sizeStock).map(([size, stock]) => ({ size, stock: Number(stock) || 0 }));
            if (sizesArray.length === 0) return toast.error("Product requires at least one size variant.");
            const totalStock = sizesArray.reduce((acc, item) => acc + item.stock, 0);
            const formData = new FormData();
            formData.append("name", name);
            formData.append("brand", brand);
            formData.append("description", description);
            formData.append("price", price);
            formData.append("offer", offer);
            formData.append("category", category);
            formData.append("isFeatured", isFeatured);
            formData.append("sizes", JSON.stringify(sizesArray));
            formData.append("countInStock", totalStock);
            formData.append("quantity", quantity);
            if (imageUrl) formData.append("image", imageUrl);
            await updateProduct({ productId, formData }).unwrap();
            toast.success("Product information updated.");
            onClose();
        } catch (err) {
            toast.error("Sync sequence failed.");
        }
    };

    if (!isOpen) return null;

    const availableSubCategories = mainCategory ? categoriesData?.filter(c => c.parent === mainCategory) : [];

    const inputClass = "w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-4 focus:ring-teal-500/10 placeholder:text-gray-300 transition-all";
    const labelClass = "text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xl px-4 p-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative border border-white/20"
            >
                <button onClick={onClose} className="absolute top-8 right-8 text-gray-300 hover:text-rose-500 transition-colors z-50 p-4"><FaTimes size={24} /></button>

                {/* Tactical Preview Sidebar */}
                <div className="w-full md:w-2/5 bg-gray-50/50 p-10 lg:p-14 flex flex-col gap-8 border-r border-gray-100 overflow-y-auto">
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Visual Optic</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Digital Product Preview</p>
                    </div>

                    <div className="relative group aspect-[4/5] bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-2xl shadow-gray-200/50 flex items-center justify-center">
                        {imageUrl ? <img src={imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" /> : <FaCloudUploadAlt size={48} className="text-gray-200" />}
                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white font-black uppercase tracking-widest text-[10px] gap-2">
                            <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center shadow-lg mb-2"><FaCloudUploadAlt size={20} /></div>
                            Sync New Optic
                            <input type="file" accept="image/*" onChange={uploadFileHandler} className="hidden" />
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <p className={labelClass}>Liquid Value</p>
                            <div className="flex items-center gap-1 text-teal-600">
                                <span className="text-xs font-black">₹</span>
                                <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-transparent border-none p-0 text-xl font-black focus:ring-0" />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <p className={labelClass}>Order Limit</p>
                            <div className="flex items-center gap-2 text-gray-900 font-black">
                                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full bg-transparent border-none p-0 text-xl font-black focus:ring-0" />
                            </div>
                        </div>
                    </div>

                    <motion.div
                        onClick={() => setIsFeatured(!isFeatured)}
                        className={`p-6 rounded-3xl border transition-all cursor-pointer flex items-center justify-between ${isFeatured ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-lg shadow-amber-500/10' : 'bg-white border-gray-100 text-gray-400'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isFeatured ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-300'}`}><FaStar size={18} /></div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-tight">Elite Catalog</p>
                                <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">Featured Product</p>
                            </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isFeatured ? 'border-amber-500 bg-amber-500' : 'border-gray-200 bg-white'}`}>
                            {isFeatured && <FaCheckCircle className="text-white" size={12} />}
                        </div>
                    </motion.div>
                </div>

                {/* Global Configuration Form */}
                <div className="flex-1 p-10 lg:p-14 overflow-y-auto">
                    <div className="mb-12">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none mb-2">Configure Product</h2>
                        <p className="text-[10px] font-bold text-teal-600 uppercase tracking-[0.3em]">Operational Catalog Update</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className={labelClass}><FaTag className="inline mr-2" />Title</label>
                                <input value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="PRODUCT NAME" required />
                            </div>
                            <div className="space-y-2">
                                <label className={labelClass}><FaCheckCircle className="inline mr-2" />Brand Authority</label>
                                <input value={brand} onChange={e => setBrand(e.target.value)} className={inputClass} placeholder="BRAND_ID" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className={labelClass}><FaBox className="inline mr-2" />Product Description</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className={`${inputClass} resize-none`} placeholder="Detailed technical specifications..." />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className={labelClass}><FaLayerGroup className="inline mr-2" />Main Category</label>
                                <select value={mainCategory} onChange={e => { setMainCategory(e.target.value); setCategory(''); }} className={inputClass}>
                                    <option value="">SELECT PARENT</option>
                                    {categoriesData?.filter(c => c.parent).map(c => <option key={c._id} value={c._id}>{c.name.toUpperCase()}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className={labelClass}><FaLayerGroup className="inline mr-2" />Sub-Category</label>
                                <select value={category} onChange={e => setCategory(e.target.value)} disabled={!mainCategory} className={`${inputClass} disabled:opacity-40`}>
                                    <option value="">SELECT SUB-CATEGORY</option>
                                    {availableSubCategories.map(c => <option key={c._id} value={c._id}>{c.name.toUpperCase()}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                <label className={labelClass}><FaRulerCombined className="inline mr-2" />Proportional Mapping</label>
                                <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1">
                                    {['clothing', 'footwear', 'jeans'].map(type => (
                                        <button key={type} type="button" onClick={() => setSizeType(type)} className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${sizeType === type ? 'bg-white text-teal-600 shadow-lg shadow-teal-500/5' : 'text-gray-400 hover:text-gray-600'}`}>{type}</button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 lg:grid-cols-4 gap-4 max-h-60 overflow-y-auto pr-4 scrollbar-hide">
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
                                            {isSelected && <input type="number" placeholder="QTY" value={sizeStock[s]} onChange={(e) => handleStockChange(s, e.target.value)} className="w-full bg-white border-none rounded-xl px-3 py-2 text-[10px] font-black text-center focus:ring-4 focus:ring-teal-500/5 transition-all shadow-inner" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                            <div className="space-y-2">
                                <label className={labelClass}>Liquid Incentive (Offer %)</label>
                                <input type="number" value={offer} onChange={e => setOffer(e.target.value)} className={inputClass} placeholder="OFFER %" />
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={onClose} className="flex-1 py-4 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors">Abort Sync</button>
                                <button type="submit" className="flex-2 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-teal-500/30 transition-all hover:-translate-y-1">Confirm Sync</button>
                            </div>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default EditProductModal;
