import { useState, useEffect } from "react";

import { useNavigate, useParams } from "react-router-dom";
import {
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetProductByIdQuery,
  useUploadProductImageMutation,
} from "../../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";
import { toast } from "react-toastify";

const ProductUpdate = () => {
  const params = useParams();
  const { data: productData } = useGetProductByIdQuery(params._id);

  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [offer, setOffer] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [category, setCategory] = useState("");
  const [mainCategory, setMainCategory] = useState("");

  const navigate = useNavigate();

  const { data: categoriesData } = useFetchCategoriesQuery();
  const [uploadProductImage] = useUploadProductImageMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  // Separate main categories and subcategories
  const mainCategories = categoriesData?.mainCategories || [];
  const subCategories = categoriesData?.subCategories || [];

  useEffect(() => {
    if (productData) {
      setBrand(productData.brand);
      setDescription(productData.description);
      setPrice(productData.price);
      setOffer(productData.offer);
      setSize(productData.size);
      setQuantity(productData.quantity);
      setImageUrl(productData.image); // This should be the URL

      const catId = productData.category._id || productData.category;
      setCategory(catId);

      // Attempt to set main category if parent exists
      // productData.category might be an object if populated
      if (typeof productData.category === 'object' && productData.category.parent) {
        setMainCategory(productData.category.parent);
      }
    }
  }, [productData]);

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success(res.message);
      setImage(file); // Store the actual file object
      setImageUrl(res.url); // Store the URL for display
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("brand", brand);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("offer", offer);
      formData.append("size", size);
      formData.append("category", category);
      formData.append("quantity", quantity);

      // Send the image URL as a simple string
      if (imageUrl) {
        formData.append("image", imageUrl);
      }

      const { data } = await updateProduct({
        productId: params._id,
        formData,
      });

      if (data?.error) {
        toast.error(data.error);
      } else {
        toast.success("Product successfully updated.");
        navigate("/admin/allProductsList");
      }
    } catch (err) {
      console.error(err);
      toast.error("Product update failed. Try again.");
    }
  };

  const handleDelete = async () => {
    try {
      const answer = window.confirm(
        "Are you sure you want to delete this product?"
      );
      if (!answer) return;

      const { data } = await deleteProduct(params._id);
      toast.success(`"${data.brand}" is deleted`);
      navigate("/admin/allProductsList");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed. Try again.");
    }
  };

  const sizeOptions = [
    "S",
    "M",
    "L",
    "XL",
    "XXL",
    "30",
    "32",
    "34",
    "36",
    "Uk-7",
    "Uk-7.5",
    "Uk-8",
    "Uk-8.5",
    "Uk-9",
  ].map((size) => (
    <option key={size} value={size}>
      {size}
    </option>
  ));

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3 animate-fade-in-down">
        <span className="text-teal-400">#</span>
        Update Product
      </h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Image Preview & Actions */}
        <div className="lg:w-1/3 space-y-6">
          <div className="bg-gray-800/40 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/5">
            <h3 className="text-lg font-bold text-gray-100 mb-4">Product Image</h3>
            <label className="flex flex-col items-center justify-center w-full h-96 border-2 border-dashed border-gray-600 rounded-2xl cursor-pointer hover:bg-gray-700/30 hover:border-teal-500 transition-colors bg-gray-900/20 overflow-hidden relative group">
              {imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt="Product Preview"
                    className="w-full h-full object-contain p-4"
                  />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-medium bg-teal-600/80 px-4 py-2 rounded-lg backdrop-blur-sm shadow-lg">
                      Change Image
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500">
                  <svg
                    className="w-12 h-12 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="mb-2 text-sm font-semibold">Click to upload</p>
                  <p className="text-xs">SVG, PNG, JPG or GIF</p>
                </div>
              )}
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={uploadFileHandler}
                className="hidden"
              />
            </label>
          </div>

          <div className="bg-red-900/10 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-red-500/20">
            <h3 className="text-lg font-bold text-red-400 mb-4">Danger Zone</h3>
            <p className="text-sm text-red-200/70 mb-4">
              Deleting this product will remove it permanently from the store. This action cannot be undone.
            </p>
            <button
              onClick={handleDelete}
              className="w-full py-3 px-4 bg-red-500/10 text-red-400 font-bold rounded-xl border border-red-500/50 hover:bg-red-500 hover:text-white transition-colors"
            >
              Delete Product
            </button>
          </div>
        </div>

        {/* Right Column: details Form */}
        <div className="lg:w-2/3">
          <div className="bg-gray-800/40 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/5">
            <h2 className="text-2xl font-bold text-gray-100 mb-6 border-b border-gray-700 pb-4">
              Product Details
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400">Brand Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Nike"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border-gray-700 text-white focus:bg-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-900 transition-all font-medium placeholder-gray-600"
                    required
                  />
                </div>

                {/* Main Category */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400">Main Category</label>
                  <select
                    value={mainCategory}
                    onChange={(e) => {
                      setMainCategory(e.target.value);
                      setCategory(""); // Reset subcategory
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border-gray-700 text-white focus:bg-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-900 transition-all font-medium appearance-none"
                  >
                    <option value="" className="bg-gray-800">Select Main Category</option>
                    {mainCategories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Sub Category */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400">Sub Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border-gray-700 text-white focus:bg-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-900 transition-all font-medium appearance-none"
                    disabled={!mainCategory}
                    required
                  >
                    <option value="" className="bg-gray-800">Select Sub Category</option>
                    {subCategories
                      .filter(c => c.parent === mainCategory || (c.parent?._id === mainCategory))
                      .map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-400">Description</label>
                <textarea
                  placeholder="Describe your product..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border-gray-700 text-white focus:bg-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-900 transition-all font-medium min-h-[150px] resize-y placeholder-gray-600"
                  required
                />
              </div>

              {/* Row 2: Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400">Price (₹)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border-gray-700 text-white focus:bg-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-900 transition-all font-bold text-lg placeholder-gray-600"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400">Offer Price (₹)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={offer}
                    onChange={(e) => setOffer(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border-gray-700 text-teal-400 focus:bg-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-900 transition-all font-bold text-lg placeholder-gray-600"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400">Stock Quantity</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border-gray-700 text-white focus:bg-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-900 transition-all font-medium placeholder-gray-600"
                    required
                  />
                </div>
              </div>

              {/* Row 3: Size */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-400">Size Variant</label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border-gray-700 text-white focus:bg-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-900 transition-all font-medium"
                >
                  <option value="" className="bg-gray-800">Select Size</option>
                  {sizeOptions}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-gray-700/50 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/admin/allProductsList")}
                  className="px-8 py-3 rounded-xl font-bold text-gray-400 bg-gray-800 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-teal-500 to-teal-600 shadow-lg shadow-teal-500/30 hover:from-teal-400 hover:scale-[1.02] transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductUpdate;