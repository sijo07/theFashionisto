import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCreateProductMutation,
  useUploadProductImageMutation,
} from "../../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";
import { toast } from "react-toastify";
import "../../index.css";
import AdminMenu from "./adminMenu";

const ProductList = () => {
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [cutPrice, setCutPrice] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [stock, setStock] = useState(0); // Added state for stock quantity
  const navigate = useNavigate();

  const [uploadProductImage] = useUploadProductImageMutation();
  const [createProduct] = useCreateProductMutation();
  const { data: categories = [], refetch } = useFetchCategoriesQuery();

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const productData = new FormData();
      productData.append("image", image);
      productData.append("cutPrice", cutPrice);
      productData.append("subCategory", subCategory);
      productData.append("description", description);
      productData.append("price", price);
      productData.append("category", category);
      productData.append("quantity", quantity);
      productData.append("brand", brand);
      productData.append("countInStock", stock); // Include stock quantity

      const { data } = await createProduct(productData);

      if (data.error) {
        toast.error("Product creation failed. Try Again.");
      } else {
        toast.success(`${data.name} is created`);
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      toast.error("Product creation failed. Try Again.");
    }
  };

  const uploadFileHandler = async (e) => {
    const formData = new FormData();
    formData.append("image", e.target.files[0]);
    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success(res.message);
      setImage(res.image);
      setImageUrl(res.image);
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };

  const handleFirstLevelChange = (e) => {
    setCategory(e.target.value);
    setSubCategory("");
  };

  const handleSecondLevelChange = (e) => {
    setSubCategory(e.target.value);
  };

  const firstLevelOptions = categories.map((c) => (
    <option key={c._id} value={c._id}>
      {c.name}
    </option>
  ));

  const secondLevelOptions = categories
    .find((c) => c._id === category)
    ?.children?.map((sub) => (
      <option key={sub._id} value={sub._id}>
        {sub.name}
      </option>
    ));

  return (
    <>
      <div className="w-full bg-gray-50">
        <AdminMenu />
        <div className="flex justify-center mt-8">
          <div className="w-full max-w-2xl bg-gray-600 shadow-3xl rounded-2xl p-6">
            <h2 className="text-2xl font-bold uppercase text-gray-50 mb-6">
              Create Product
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center">
                <label className="block bg-gray-100 p-5 text-black w-[10rem] border-gray-700 border-2 rounded-lg focus:outline-none cursor-pointer">
                  {image ? image.name : "Upload Image"}
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={uploadFileHandler}
                    className="hidden"
                  />
                  {imageUrl && (
                    <div className="flex flex-col items-center">
                      <img
                        src={imageUrl}
                        alt="product"
                        className="w-[10rem] h-[10rem] object-cover"
                      />
                    </div>
                  )}
                </label>
              </div>
              <div className="flex justify-between">
                <div>
                  <input
                    type="text"
                    placeholder="Brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="bg-gray-100 w-[13rem] p-2 border-2 rounded-lg focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="bg-gray-100 w-[12rem] p-2 border-2 rounded-lg focus:outline-none lining-nums"
                    required
                  />
                </div>
                <div>
                  <del>
                    <input
                      type="number"
                      placeholder="Cut Price"
                      value={cutPrice}
                      onChange={(e) => setCutPrice(e.target.value)}
                      className="bg-gray-100 w-[11rem] p-2 border-2 rounded-lg focus:outline-none lining-nums"
                      required
                    />
                  </del>
                </div>
              </div>
              <div>
                <textarea
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-gray-100 w-full p-1 border-2 rounded-lg focus:outline-none resize-none"
                  required
                />
              </div>
              <div className="flex justify-between">
                <div className="p-4">
                  <select
                    value={category}
                    onChange={handleFirstLevelChange}
                    className="bg-gray-100 w-[15rem] p-2 border-2 rounded-lg focus:outline-none text-gray-700"
                    required
                  >
                    <option value="">Select a category</option>
                    {firstLevelOptions}
                  </select>
                </div>
                {category && (
                  <div className="p-4">
                    <select
                      value={subCategory}
                      onChange={handleSecondLevelChange}
                      className="bg-gray-100 w-[15rem] p-2 border-2 rounded-lg focus:outline-none text-gray-700"
                      required
                    >
                      <option value="">Select a sub-category</option>
                      {secondLevelOptions}
                    </select>
                  </div>
                )}
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="bg-gray-100 w-full p-2 border-2 rounded-lg focus:outline-none"
                  required
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Stock Quantity"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="bg-gray-100 w-full p-2 border-2 rounded-lg focus:outline-none"
                  required
                />
              </div>
              <div className="flex justify-around">
                <button
                  type="submit"
                  className="bg-teal-800 text-white px-8 py-3 font-bold uppercase rounded-full tracking-wider hover:scale-105 transition-transform duration-200"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductList;
