import { useState, useEffect } from "react";
import AdminMenu from "./adminMenu";
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

  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [firstLevelCategory, setFirstLevelCategory] = useState("");
  const [secondLevelCategory, setSecondLevelCategory] = useState("");
  const [thirdLevelCategory, setThirdLevelCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [brand, setBrand] = useState("");
  const [cutPrice, setCutPrice] = useState("");
  const [size, setSize] = useState("");
  const [imageUrl, setImageUrl] = useState(null);

  const navigate = useNavigate();
  const { data: categories = [] } = useFetchCategoriesQuery();

  const [uploadProductImage] = useUploadProductImageMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  useEffect(() => {
    if (productData) {
      setDescription(productData.description);
      setPrice(productData.price);
      setFirstLevelCategory(productData.category?.parentCategory?._id || "");
      setSecondLevelCategory(productData.category?.subCategory?._id || "");
      setThirdLevelCategory(productData.category?._id || "");
      setQuantity(productData.quantity);
      setBrand(productData.brand);
      setImageUrl(productData.image);
      setImage(productData.image);
      setSize(productData.size);
      setCutPrice(productData.cutPrice);
    }
  }, [productData]);

  const uploadFileHandler = async (e) => {
    const formData = new FormData();
    formData.append("image", e.target.files[0]);
    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success(res.message);
      setImage(res.image);
      setImageUrl(res.image);
    } catch (err) {
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
      formData.append("cutPrice", cutPrice);
      formData.append("size", size);
      formData.append(
        "category",
        thirdLevelCategory || secondLevelCategory || firstLevelCategory
      );
      formData.append("quantity", quantity);
      formData.append("image", image);

      const { data } = await updateProduct({
        productId: params._id,
        formData,
      });

      if (data?.error) {
        toast.error(data.error);
      } else {
        toast.success("Product successfully updated.");
        navigate("/admin/allProductsList");
        window.location.reload();
      }
    } catch (err) {
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
      window.location.reload();
    } catch (err) {
      toast.error("Delete failed. Try again.");
    }
  };

  const handleFirstLevelChange = (e) => {
    setFirstLevelCategory(e.target.value);
    setSecondLevelCategory("");
    setThirdLevelCategory("");
  };

  const handleSecondLevelChange = (e) => {
    setSecondLevelCategory(e.target.value);
    setThirdLevelCategory("");
  };

  const firstLevelOptions = categories?.map((c) => (
    <option key={c._id} value={c._id}>
      {c.name}
    </option>
  ));

  const secondLevelOptions = categories
    ?.find((c) => c._id === firstLevelCategory)
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
          <div className="w-full max-w-2xl bg-[#649899] shadow-3xl rounded-2xl p-6">
            <h2 className="text-2xl font-bold uppercase text-gray-50 mb-6">
              Update Product
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
                <div>
                  <input
                    type="text"
                    placeholder="Size"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="bg-gray-100 w-[18rem] p-2 border-2 rounded-lg focus:outline-none lining-nums"
                    required
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="bg-gray-100 w-[18rem] p-2 border-2 rounded-lg focus:outline-none lining-nums"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <div className="p-4">
                  <select
                    value={firstLevelCategory}
                    onChange={handleFirstLevelChange}
                    className="bg-gray-100 w-[15rem] p-2 border-2 rounded-lg focus:outline-none text-gray-700"
                    required
                  >
                    <option value="">Select a category</option>
                    {firstLevelOptions}
                  </select>
                </div>
                {firstLevelCategory && (
                  <div className="p-4">
                    <select
                      value={secondLevelCategory}
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
              <div className="flex justify-around">
                <button
                  onClick={handleSubmit}
                  className="bg-teal-800 text-white px-8 py-3 font-bold uppercase rounded-full tracking-wider hover:scale-105 transition-transform duration-200"
                >
                  Update
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-teal-800 text-white px-8 py-3 font-bold uppercase rounded-full tracking-wider hover:scale-105 transition-transform duration-200"
                >
                  Delete
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductUpdate;
