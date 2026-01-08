import { Link } from "react-router-dom";
import HeartIcon from "./heartIcon";
import CartIcon from "./cartIcon";
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

const ProductCard = ({ p }) => {
  const [activeView, setActiveView] = useState("caption"); // 'caption' | 'reviews' | 'sizes'
  const dispatch = useDispatch();

  const copyLink = () => {
    const url = `${window.location.origin}/product/${p._id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied", { position: "bottom-center", autoClose: 1500 });
  };

  const handleSizeSelect = (size) => {
    dispatch(addToCart({ ...p, size, qty: 1 }));
    toast.success(`Size ${size} added`, { position: "bottom-center", autoClose: 1000 });
    setActiveView("caption");
  };

  return (
    <div className="bg-black border border-zinc-900 overflow-hidden mb-6 max-w-sm mx-auto font-sans">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[7px] font-black text-white uppercase italic">
            {p.brand?.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black tracking-tight text-white uppercase italic leading-none">{p.brand}</span>
            <span className="text-[7px] text-zinc-600 font-mono tracking-widest uppercase mt-0.5">
              {p.category?.parent ? `${p.category.parent.name}/${p.category.name}` : p.category?.name || "The Collection"}
            </span>
          </div>
        </div>
        <IoEllipsisHorizontal size={14} className="text-zinc-600" />
      </div>

      {/* Media */}
      <Link to={`/product/${p._id}`} className="block relative aspect-square overflow-hidden bg-zinc-950">
        <img
          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
          src={p.image?.url || p.image}
          alt={p.name}
        />
      </Link>

      {/* Interactions */}
      <div className="px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <HeartIcon product={p} size={22} />
          <button
            onClick={() => setActiveView(activeView === 'reviews' ? 'caption' : 'reviews')}
            className={`transition-colors ${activeView === 'reviews' ? 'text-red-500' : 'text-white'}`}
          >
            <IoChatbubbleOutline size={22} className="transform -scale-x-100" />
          </button>
          <button onClick={copyLink} className="text-white">
            <IoPaperPlaneOutline size={22} />
          </button>
        </div>
        <button
          onClick={() => setActiveView(activeView === 'sizes' ? 'caption' : 'sizes')}
          className={`transition-colors ${activeView === 'sizes' ? 'text-red-500' : 'text-white'}`}
        >
          {activeView === 'sizes' ? <IoBookmark size={22} /> : <IoBookmarkOutline size={22} />}
        </button>
      </div>

      {/* Caption Content */}
      <div className="px-3 pb-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-black text-white bg-zinc-900 px-1.5 py-0.5 rounded-sm">
            {p?.price?.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
          </div>

          {activeView === 'sizes' && (
            <div className="flex gap-1 animate-in slide-in-from-right-2">
              {(p.sizes?.length > 0 ? p.sizes : [{ size: 'S', stock: 1 }, { size: 'M', stock: 1 }, { size: 'L', stock: 1 }]).map((s) => (
                <button
                  key={s.size}
                  disabled={s.stock === 0}
                  onClick={() => handleSizeSelect(s.size)}
                  className="w-6 h-6 flex items-center justify-center border border-zinc-800 text-[9px] font-black hover:border-red-600 hover:text-red-500 rounded-full transition-colors disabled:opacity-30"
                >
                  {s.size}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="text-[10px] leading-relaxed min-h-[40px]">
          {activeView === 'caption' && (
            <div className="animate-in fade-in">
              <span className="font-black mr-1 text-white uppercase tracking-tighter italic">{p.brand}</span>
              <span className="text-zinc-300">{p.name}</span>
            </div>
          )}

          {activeView === 'reviews' && (
            <div className="animate-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-black uppercase text-zinc-500">Verified Feed</span>
                  <span className="text-[9px] text-zinc-600 font-bold">({p.numReviews})</span>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex text-red-600 gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <IoStar key={i} size={8} className={i < (p.reviews?.[p.reviews.length - 1]?.rating || 0) ? "text-red-600" : "text-zinc-800"} />
                    ))}
                  </div>
                  <span className="text-[8px] font-black text-white leading-none mt-0.5">{p.rating?.toFixed(1)}</span>
                </div>
              </div>
              {p.reviews?.length > 0 ? (
                <>
                  <p className="text-[9px] text-zinc-400 font-bold leading-tight line-clamp-1">{p.reviews[p.reviews.length - 1].name}</p>
                  <p className="text-[9px] text-zinc-500 italic line-clamp-1">"{p.reviews[p.reviews.length - 1].comment}"</p>
                </>
              ) : (
                <p className="text-[9px] text-zinc-600 italic">No feedback yet.</p>
              )}
            </div>
          )}

          {activeView === 'sizes' && (
            <div className="animate-in slide-in-from-bottom-2">
              <span className="text-[9px] font-black uppercase text-zinc-400">Inventory Reserved</span>
              <p className="text-[9px] text-zinc-600">Select dimension to finalize addition.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  p: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    image: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        url: PropTypes.string,
      }),
    ]).isRequired,
    name: PropTypes.string,
    brand: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.number,
    offer: PropTypes.number,
    size: PropTypes.string,
  }).isRequired,
};

export default ProductCard;
