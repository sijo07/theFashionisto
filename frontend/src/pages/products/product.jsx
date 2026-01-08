import { Link } from "react-router-dom";
import HeartIcon from "./heartIcon";
import PropTypes from "prop-types";
import {
  IoChatbubbleOutline,
  IoPaperPlaneOutline,
  IoBookmarkOutline,
  IoBookmark,
  IoEllipsisHorizontal,
  IoStar
} from "react-icons/io5";
import { useState } from "react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/features/cart/cartSlice";

const Product = ({ product }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeView, setActiveView] = useState("caption"); // 'caption' | 'reviews' | 'sizes'
  const dispatch = useDispatch();

  const copyLink = () => {
    const url = `${window.location.origin}/product/${product._id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied", { position: "bottom-center", autoClose: 1500 });
  };

  const handleSizeSelect = (size) => {
    dispatch(addToCart({ ...product, size, qty: 1 }));
    toast.success(`Size ${size} added to bag`, { position: "bottom-center" });
    setActiveView("caption");
  };

  return (
    <div className="bg-black border border-zinc-900 overflow-hidden mb-8 max-w-lg mx-auto md:mx-0 font-sans">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-900/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 overflow-hidden">
            <span className="text-[10px] font-black text-white">{product.brand?.charAt(0)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black tracking-tight text-white uppercase italic">
              {product.brand}
            </span>
            <span className="text-[8px] text-zinc-600 font-mono tracking-widest uppercase">
              {product.category?.parent ? `${product.category.parent.name}/${product.category.name}` : product.category?.name || "The Collection"}
            </span>
          </div>
        </div>
        <button className="text-zinc-500 hover:text-white transition-colors">
          <IoEllipsisHorizontal size={18} />
        </button>
      </div>

      {/* Main Visual */}
      <Link to={`/product/${product._id}`} className="block relative aspect-square overflow-hidden bg-zinc-950">
        <img
          src={product.image?.url || product.image}
          alt={product.name}
          className="w-full h-full object-cover grayscale transition-all duration-700 hover:grayscale-0 hover:scale-[1.02]"
        />
        {product?.countInStock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
            <span className="border-2 border-white text-white px-6 py-2 font-black uppercase tracking-[0.4em] text-[10px]">Sold Out</span>
          </div>
        )}
      </Link>

      {/* Action Bar */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <HeartIcon product={product} size={28} />
          <button
            onClick={() => setActiveView(activeView === 'reviews' ? 'caption' : 'reviews')}
            className={`transition-colors ${activeView === 'reviews' ? 'text-red-600' : 'text-white hover:text-zinc-400'}`}
          >
            <IoChatbubbleOutline size={26} className="transform -scale-x-100" />
          </button>
          <button onClick={copyLink} className="text-white hover:text-zinc-400 transition-colors">
            <IoPaperPlaneOutline size={26} />
          </button>
        </div>
        <button
          onClick={() => setActiveView(activeView === 'sizes' ? 'caption' : 'sizes')}
          className={`transition-colors ${activeView === 'sizes' ? 'text-red-600' : 'text-white hover:text-zinc-400'}`}
        >
          {activeView === 'sizes' ? <IoBookmark size={26} /> : <IoBookmarkOutline size={26} />}
        </button>
      </div>

      {/* Content Area */}
      <div className="px-4 pb-4 space-y-3">
        {/* Dynamic Header (Price + Toggles) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-black text-white px-2 py-1 bg-zinc-900 rounded-sm">
              {product.offer && product.offer < product.price ? `₹${product.offer}` : `₹${product.price}`}
            </span>
            {product.offer && product.offer < product.price && (
              <span className="text-[10px] text-zinc-600 line-through">₹{product.price}</span>
            )}
          </div>

          {/* Inline Size Selector if active */}
          {activeView === 'sizes' && (
            <div className="flex items-center gap-2 animate-in slide-in-from-right-2 duration-300">
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mr-1">Select:</span>
              <div className="flex gap-1.5">
                {(product.sizes?.length > 0 ? product.sizes : [{ size: 'S', stock: 1 }, { size: 'M', stock: 1 }, { size: 'L', stock: 1 }]).map((s) => (
                  <button
                    key={s.size}
                    disabled={s.stock === 0}
                    onClick={() => handleSizeSelect(s.size)}
                    className="w-7 h-7 flex items-center justify-center border border-zinc-800 text-[10px] font-black hover:border-red-600 hover:text-red-500 transition-all rounded-full bg-zinc-950 disabled:opacity-30"
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* View Switching */}
        <div className="min-h-[60px]">
          {activeView === 'caption' && (
            <div className="text-xs leading-relaxed animate-in fade-in duration-300">
              <span className="font-black mr-2 text-white uppercase tracking-tight">{product.brand}</span>
              <span className="text-zinc-300 font-medium">{product.name}</span>
              <div className="mt-1 text-zinc-500 italic">
                {isExpanded ? product.description : `${product.description?.substring(0, 60)}...`}
                {product.description?.length > 60 && (
                  <button onClick={() => setIsExpanded(!isExpanded)} className="ml-1 text-zinc-600 font-bold hover:text-white transition-colors">
                    {isExpanded ? " less" : " more"}
                  </button>
                )}
              </div>
            </div>
          )}

          {activeView === 'reviews' && (
            <div className="animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Verified Feedback</span>
                  <span className="text-[10px] text-zinc-600 font-bold">({product.numReviews})</span>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex text-red-600 gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <IoStar key={i} size={10} className={i < (product.reviews?.[product.reviews.length - 1]?.rating || 0) ? "text-red-600" : "text-zinc-800"} />
                    ))}
                  </div>
                  <span className="text-[9px] font-black text-white leading-none mt-1">{product.rating?.toFixed(1)}</span>
                </div>
              </div>
              {product.reviews?.length > 0 ? (
                <>
                  <p className="text-[10px] text-zinc-300 font-bold mb-0.5">{product.reviews[product.reviews.length - 1].name}</p>
                  <p className="text-[10px] text-zinc-500 italic line-clamp-2">"{product.reviews[product.reviews.length - 1].comment}"</p>
                  <Link to={`/product/${product._id}#reviews`} className="block mt-2 text-[9px] font-black text-white hover:text-red-500 uppercase tracking-widest underline">View all {product.numReviews} reviews</Link>
                </>
              ) : (
                <div className="py-2">
                  <p className="text-[10px] text-zinc-600 italic">No reviews yet for this piece.</p>
                  <Link to={`/product/${product._id}#reviews`} className="block mt-1 text-[9px] font-black text-white hover:text-red-500 uppercase tracking-widest underline">Be the first to review</Link>
                </div>
              )}
            </div>
          )}

          {activeView === 'sizes' && (
            <div className="animate-in slide-in-from-bottom-2 duration-300">
              <div className="text-[10px] font-black uppercase tracking-widest text-white mb-1">Pick Your Fit</div>
              <p className="text-[10px] text-zinc-600 leading-tight">Selecting a size will instantly index this piece to your personal bag.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Product.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    image: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    name: PropTypes.string,
    brand: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.number,
    offer: PropTypes.number,
    countInStock: PropTypes.number,
  }).isRequired,
};

export default Product;
