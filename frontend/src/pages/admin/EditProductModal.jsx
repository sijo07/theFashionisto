import { useState, useEffect } from "react";
import {
    useUpdateProductMutation,
    useUploadProductImageMutation,
    useGetProductByIdQuery,
} from "../../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";
import { toast } from "react-toastify";
import { FaTimes, FaCloudUploadAlt } from "react-icons/fa";

const EditProductModal = ({ isOpen, onClose, productId }) => {
    // Always call hooks at the top level, conditions handling inside usage or by passing skipToken if needed
    // However, for simplicity in modals, we usually render it only when isOpen is true to reset state, 
    // OR we use useEffect to reset state when productId changes.

    const { data: productData } = useGetProductByIdQuery(productId, {
        skip: !productId,
    });

    const [brand, setBrand] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [offer, setOffer] = useState("");
    const [quantity, setQuantity] = useState(""); // Limit per order
    const [sizeStock, setSizeStock] = useState({});
    const [sizeType, setSizeType] = useState("clothing"); // 'clothing', 'footwear', 'jeans'

    const sizeMaps = {
        clothing: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
        footwear: ["UK-6", "UK-6.5", "UK-7", "UK-7.5", "UK-8", "UK-8.5", "UK-9", "UK-9.5", "UK-10", "UK-11"],
        jeans: ["28", "30", "32", "34", "36", "38", "40", "42", "44"]
    };

    const activeSizes = sizeMaps[sizeType] || sizeMaps.clothing;

    const toggleSize = (s) => {
        const newStock = { ...sizeStock };
        if (newStock.hasOwnProperty(s)) {
            delete newStock[s];
        } else {
            newStock[s] = ""; // Select with empty stock
        }
        setSizeStock(newStock);
    };

    const handleStockChange = (s, value) => {
        if (sizeStock.hasOwnProperty(s)) {
            setSizeStock({ ...sizeStock, [s]: value });
        }
    };
    const [image, setImage] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [category, setCategory] = useState("");
    const [mainCategory, setMainCategory] = useState("");
    const [isFeatured, setIsFeatured] = useState(false);

    const { data: categoriesData } = useFetchCategoriesQuery();
    const [uploadProductImage] = useUploadProductImageMutation();
    const [updateProduct] = useUpdateProductMutation();

    // Load product data
    useEffect(() => {
        if (productData) {
            setName(productData.name || "");
            setBrand(productData.brand || "");
            setDescription(productData.description || "");
            setPrice(productData.price || "");
            setOffer(productData.offer || "");

            // Initialize Size Stock from array
            // productData.sizes = [{ size: "M", stock: 10 }]
            const initialStock = {};
            if (productData.sizes && Array.isArray(productData.sizes)) {
                productData.sizes.forEach(item => {
                    initialStock[item.size] = item.stock;
                });
            } else if (productData.size) {
                // Legacy fallback
                initialStock[productData.size] = productData.countInStock || productData.quantity || 0;
            }
            setSizeStock(initialStock);

            // Attempt to guess size type based on existing sizes?
            // Simple heuristic: check first key
            const firstSize = Object.keys(initialStock)[0];
            if (firstSize.startsWith("UK")) setSizeType("footwear");
            else if (!isNaN(firstSize) && Number(firstSize) > 20) setSizeType("jeans");
            else setSizeType("clothing");


            setQuantity(productData.quantity || ""); // Limit per order
            setImageUrl(productData.image || "");
            setIsFeatured(productData.isFeatured || false);

            const catId = productData.category?._id || productData.category;
            setCategory(catId || "");

            // Provide best guess for main category if populated
            if (productData.category && typeof productData.category === 'object' && productData.category.parent) {
                setMainCategory(productData.category.parent);
            } else {
                // If flat category ID, we'd need to lookup in categoriesData to find parent
                // For now, leave mainCategory empty or try to find it
                if (categoriesData && catId) {
                    const foundCat = categoriesData.find(c => c._id === catId);
                    if (foundCat?.parent) setMainCategory(foundCat.parent);
                }
            }
        }
    }, [productData, categoriesData]);

    // Derived category lists
    const allCategories = categoriesData || [];
    // Assuming flattened list from API now? Or object? 
    // Previous fix made listCategory return array.
    // So we filter manually.
    const parentCategories = allCategories.filter(c => !c.parent); // Super
    // This logic depends on hierarchy. 
    // Let's assume Main Categories are those with a parent that is a Super.
    // We'll simplify: just filter by selected Main if we can identify it.

    // Actually, let's use the same logic as AllProducts or ProductUpdate
    // ProductUpdate assumed `categoriesData.mainCategories` which was from the OLD controller.
    // The NEW controller returns a flat array `all`.
    // So we must filter manually.

    // Super Categories (Roots)
    const superCats = allCategories.filter(c => !c.parent);

    // Main Categories (Children of Super)
    // We don't have a "selected super" here easily unless we add it. 
    // For editing, let's just show relevant Main categories if we know the parent, or all Main categories?
    // Let's try to infer hierarchy:
    // Level 1 (Roots) -> Level 2 (Main) -> Level 3 (Sub)
    // We likely want to select a Sub-category (Level 3) for the product.
    // So we need to select Level 2 then Level 3.
    // Or Level 1 -> Level 2 -> Level 3.
    // To keep it simple for this modal, let's just show "Main Category" (Parent) and "Sub Category" (Child).

    // Filter all categories that HAVE a parent (Main or Sub) to populate options?
    // Or just filter by the selected MainCategory.
    const availableSubCategories = mainCategory
        ? allCategories.filter(c => c.parent === mainCategory)
        : [];

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("image", file);
        try {
            const res = await uploadProductImage(formData).unwrap();
            toast.success("Image uploaded");
            setImage(file);
            setImageUrl(res.url);
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const sizesArray = Object.entries(sizeStock).map(([size, stock]) => ({
                size,
                stock: Number(stock) || 0
            }));

            if (sizesArray.length === 0) return toast.error("Select at least one size");

            // Calculate total stock
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
            // countInStock is total inventory (derived from sizes)
            formData.append("countInStock", totalStock);
            // quantity is limit per order
            formData.append("quantity", quantity);

            if (imageUrl) formData.append("image", imageUrl);

            const { data } = await updateProduct({
                productId: productId,
                formData,
            });

            if (data?.error) {
                toast.error(data.error);
            } else {
                toast.success("Product updated!");
                onClose();
            }
        } catch (err) {
            console.error(err);
            toast.error("Update failed");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row relative animate-fade-in-up">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors z-10"
                >
                    <FaTimes size={24} />
                </button>

                {/* Left Col: Image & Key Info */}
                <div className="w-full md:w-1/3 bg-gray-50 p-6 flex flex-col gap-4 border-r border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">Preview</h3>
                    <div className="relative group aspect-[3/4] bg-white rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center">
                        {imageUrl ? (
                            <img src={imageUrl} alt="Priview" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-gray-400 text-sm">No Image</span>
                        )}
                        <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-medium">
                            <FaCloudUploadAlt size={32} className="mb-2" />
                            <span>Change Image</span>
                            <input type="file" accept="image/*" onChange={uploadFileHandler} className="hidden" />
                        </label>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                            <label className="text-xs font-bold text-gray-400 uppercase">Stock & Price</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Price"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-1/2 p-2 bg-gray-50 rounded border border-gray-200 text-sm font-bold text-gray-800"
                                />
                                <input
                                    type="number"
                                    placeholder="Qty"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="w-1/2 p-2 bg-gray-50 rounded border border-gray-200 text-sm font-bold text-gray-800"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-gold/5 border border-gold/20 rounded-lg cursor-pointer" onClick={() => setIsFeatured(!isFeatured)}>
                            <input
                                type="checkbox"
                                checked={isFeatured}
                                onChange={(e) => setIsFeatured(e.target.checked)}
                                className="w-4 h-4 text-gold rounded border-gray-300 focus:ring-gold"
                            />
                            <span className="text-sm font-semibold text-gold-dark select-none">Mark as Featured</span>
                        </div>
                    </div>
                </div>

                {/* Right Col: Form Fields */}
                <div className="w-full md:w-2/3 p-6 space-y-4">
                    <h2 className="text-2xl font-bold font-display text-gray-900 border-b border-gray-100 pb-2 mb-4">Edit Product</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Product Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full p-2 rounded-lg border border-gray-300 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Brand</label>
                                <input
                                    type="text"
                                    value={brand}
                                    onChange={e => setBrand(e.target.value)}
                                    className="w-full p-2 rounded-lg border border-gray-300 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={3}
                                className="w-full p-2 rounded-lg border border-gray-300 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Parent Category</label>
                                <select
                                    value={mainCategory}
                                    onChange={e => { setMainCategory(e.target.value); setCategory(''); }}
                                    className="w-full p-2 rounded-lg border border-gray-300 focus:border-gold outline-none"
                                >
                                    <option value="">Select Parent</option>
                                    {/* We show all categories that have children or are mainly used as parents? 
                                Simplest: Show all, or show only Level 2 (Main) */}
                                    {allCategories.filter(c => c.parent).map(c => (
                                        <option key={c._id} value={c._id}>{c.name} {c.categoryId ? `(${c.categoryId})` : ''}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Sub Category</label>
                                <select
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    disabled={!mainCategory}
                                    className="w-full p-2 rounded-lg border border-gray-300 focus:border-gold outline-none disabled:bg-gray-100"
                                >
                                    <option value="">Select Sub-Category</option>
                                    {availableSubCategories.map(c => (
                                        <option key={c._id} value={c._id}>{c.name} {c.categoryId ? `(${c.categoryId})` : ''}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 mb-2">Sizes & Stock</label>

                            {/* Size Type Switcher */}
                            <div className="flex bg-gray-100 p-1 rounded-lg mb-3 w-fit">
                                {['clothing', 'footwear', 'jeans'].map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setSizeType(type)}
                                        className={`px-3 py-1 rounded-md text-xs font-bold capitalize transition-all ${sizeType === type ? 'bg-white shadow text-gold' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>

                            {/* Size Grid */}
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                {activeSizes.map(s => {
                                    const isSelected = sizeStock.hasOwnProperty(s);
                                    return (
                                        <div key={s} className={`p-2 rounded-lg border transition-all ${isSelected ? 'border-gold bg-gold/5' : 'border-gray-200 bg-gray-50'}`}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`text-xs font-bold ${isSelected ? 'text-gold-dark' : 'text-gray-500'}`}>{s}</span>
                                                <div
                                                    onClick={() => toggleSize(s)}
                                                    className={`w-4 h-4 rounded-full border cursor-pointer flex items-center justify-center ${isSelected ? 'bg-gold border-gold' : 'border-gray-300 bg-white'}`}
                                                >
                                                    {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <input
                                                    type="number"
                                                    placeholder="Qty"
                                                    value={sizeStock[s]}
                                                    onChange={(e) => handleStockChange(s, e.target.value)}
                                                    className="w-full p-1 text-xs border border-gold/30 rounded focus:outline-none focus:border-gold bg-white"
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Offer Price</label>
                                <input
                                    type="number"
                                    value={offer}
                                    onChange={e => setOffer(e.target.value)}
                                    className="w-full p-2 rounded-lg border border-gray-300 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
                                />
                            </div>
                        </div>


                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2 rounded-lg font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 rounded-lg font-bold text-white bg-gold hover:bg-gold-dark shadow-lg shadow-gold/20 transition-all transform hover:-translate-y-0.5"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div >
        </div >
    );
};

export default EditProductModal;
