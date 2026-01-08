import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaHeart, FaArrowRight, FaArchive } from "react-icons/fa";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "../products/index";
import { setFavorites } from "../../redux/features/favorites/favoriteSlice";
import { getFavoritesFromLocalStorage } from "../../utils/localStorage";

const Favorites = () => {
  const favorites = useSelector((state) => state.favorites);
  const dispatch = useDispatch();

  useEffect(() => {
    const favoritesFromLocalStorage = getFavoritesFromLocalStorage();
    dispatch(setFavorites(favoritesFromLocalStorage));
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-black text-white pt-24 md:pt-32 pb-20 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6">
        {/* Editorial Header */}
        <header className="mb-20 relative">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 mb-4"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-600">Private Collection</span>
            <div className="h-px w-20 bg-zinc-900" />
          </motion.div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-none"
            >
              The <br />
              <span className="font-fashion italic text-red-600 block md:inline md:ml-4">Wishlist</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col items-start md:items-end"
            >
              <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mb-1">Curation Status</span>
              <span className="text-xl font-black uppercase tracking-widest">{favorites.length} Items Indexed</span>
            </motion.div>
          </div>
        </header>

        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 border border-zinc-900 bg-zinc-950/30"
          >
            <div className="relative mb-10">
              <FaHeart size={80} className="text-zinc-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-2xl opacity-50" />
              <FaArchive size={64} className="text-zinc-800 relative z-10" />
            </div>

            <h2 className="text-2xl font-black uppercase tracking-[0.3em] text-zinc-600 mb-4">The Vault is Empty</h2>
            <p className="text-zinc-500 font-medium text-sm mb-12 max-w-xs text-center leading-relaxed">
              Begin your curation. Explore our latest collections and archive your favorite selections here.
            </p>

            <Link
              to="/shop"
              className="px-12 py-5 bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] hover:bg-red-600 hover:text-white transition-all duration-500 flex items-center gap-4 group shadow-[0_0_30px_rgba(255,255,255,0.05)]"
            >
              Access Catalog <FaArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12"
            >
              {favorites.map((product) => (
                <motion.div
                  key={product._id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <Product product={product} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Aesthetic Side Label */}
      <div className="fixed right-10 top-1/2 -translate-y-1/2 hidden xl:block pointer-events-none">
        <span className="text-[10px] font-black uppercase tracking-[1em] text-zinc-900 vertical-text transform rotate-180">
          Personal Selection // Reserved Catalog
        </span>
      </div>
    </div>
  );
};

export default Favorites;
