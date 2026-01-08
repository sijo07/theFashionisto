import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useAllProductsQuery,
  useDeleteProductMutation,
} from "../../redux/api/productApiSlice";
import {
  FaSearch, FaPlus, FaThLarge, FaList,
  FaEdit, FaTrash, FaEye, FaBox
} from "react-icons/fa";
import { toast } from "react-toastify";
import AdminHeader from "./AdminHeader";
import Loader from "../../components/loader";

const AllProducts = () => {
  const { data: products, isLoading, isError, refetch } = useAllProductsQuery();
  const [deleteProduct] = useDeleteProductMutation();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'grid'

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id).unwrap();
        toast.success("Product deleted.");
        refetch();
      } catch (err) {
        toast.error("Delete failed.");
      }
    }
  };

  const filteredProducts = products?.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader /></div>;
  if (isError) return <div className="text-red-500 p-10">Error loading products</div>;

  return (
    <div className="min-h-screen bg-black font-sans text-white pb-20">
      <AdminHeader title="Product Catalog" subtitle={`Total Products: ${products.length}`}>
        <Link to="/admin/productlist" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 rounded-sm transition-all">
          <FaPlus /> Add New
        </Link>
      </AdminHeader>

      <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-zinc-900 border border-zinc-800 p-4 mb-8 gap-4 rounded-sm">
          <div className="relative w-full md:w-96">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black border border-zinc-700 pl-10 pr-4 py-2 text-sm text-white focus:border-red-600 focus:outline-none placeholder:text-zinc-600"
              placeholder="Search by name, brand..."
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-sm transition-colors ${viewMode === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              <FaList />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-sm transition-colors ${viewMode === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              <FaThLarge />
            </button>
          </div>
        </div>

        {/* Content View */}
        {viewMode === "list" ? (
          <div className="overflow-x-auto border border-zinc-800 rounded-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900 text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                  <th className="p-4">Product</th>
                  <th className="p-4">Brand</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 bg-black">
                {filteredProducts?.map((product) => (
                  <tr key={product._id} className="hover:bg-zinc-900/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <img src={product.image} className="w-12 h-16 object-cover bg-zinc-800 border border-zinc-700" />
                        <div className="max-w-[200px]">
                          <p className="text-sm font-bold text-white truncate">{product.name}</p>
                          <p className="text-[10px] text-zinc-400">ID: {product._id.substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-zinc-300">{product.brand}</td>
                    <td className="p-4 text-sm text-zinc-400">
                      <span className="bg-zinc-900 border border-zinc-700 px-2 py-1 rounded text-[10px] font-bold uppercase">
                        {/* Safe access for category */}
                        {product.category?.name || "Unassigned"}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-white">₹{product.price}</td>
                    <td className="p-4">
                      {product.countInStock < 10 ? (
                        <span className="text-red-500 font-bold text-xs flex items-center gap-1"><FaBox /> {product.countInStock} (Low)</span>
                      ) : (
                        <span className="text-emerald-500 font-bold text-xs flex items-center gap-1"><FaBox /> {product.countInStock}</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <Link to={`/admin/product/update/${product._id}`} className="p-2 bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 rounded-sm">
                          <FaEdit size={14} />
                        </Link>
                        <button onClick={() => handleDelete(product._id)} className="p-2 bg-zinc-800 text-red-500 hover:bg-red-900/30 rounded-sm">
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredProducts?.map((product) => (
              <div key={product._id} className="bg-zinc-900 border border-zinc-800 group hover:border-red-600/50 transition-all">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img src={product.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to={`/admin/product/update/${product._id}`} className="p-2 bg-black text-white hover:bg-red-600 transition-colors">
                      <FaEdit size={12} />
                    </Link>
                    <button onClick={() => handleDelete(product._id)} className="p-2 bg-black text-white hover:bg-red-600 transition-colors">
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-[10px] font-bold text-red-600 uppercase mb-1">{product.brand}</p>
                  <h3 className="text-sm font-bold text-white truncate mb-2">{product.name}</h3>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400">Stock: {product.countInStock}</span>
                    <span className="font-bold text-white">₹{product.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllProducts;
