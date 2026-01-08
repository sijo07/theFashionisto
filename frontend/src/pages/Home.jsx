import { Link, useParams } from "react-router-dom";
import { useGetProductsQuery } from "../redux/api/productApiSlice";
import { Loader, Message } from "../components/index";
import { Product } from "./products";
import { motion } from "framer-motion";
import { FaArrowRight, FaShippingFast, FaUndo, FaShieldAlt } from "react-icons/fa";

const Home = () => {
  const { keyword } = useParams();
  const { data, isLoading, isError } = useGetProductsQuery({ keyword });

  // Hero Section
  const Hero = () => (
    <div className="relative h-[80vh] w-full bg-black overflow-hidden flex items-center justify-center">
      {/* Background Image/Video Placeholder */}
      <div className="absolute inset-0 z-0 opacity-40">
        <img
          src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2074&auto=format&fit=crop"
          // fallback to a gradient if image fails
          onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.style.background = 'linear-gradient(45deg, #111, #000)'; }}
          className="w-full h-full object-cover"
          alt="Fashion Hero"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60"></div>
      </div>

      <div className="relative z-10 text-center px-8 max-w-5xl mx-auto pt-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-red-500 font-black uppercase tracking-[0.4em] text-base md:text-lg mb-6 block drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
            New Collection <span className="text-white">/</span> 2026
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-black text-white tracking-tighter mb-8 leading-none">
            UNCOMPROMISED<br /><span className="text-stroke-white text-transparent">AESTHETIC</span>
          </h1>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12">
            <Link
              to="/shop"
              className="px-8 py-4 bg-red-600 text-white font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300 min-w-[200px]"
            >
              Shop Now
            </Link>
            <Link
              to="/shop"
              className="px-8 py-4 border border-white text-white font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300 min-w-[200px]"
            >
              View Lookbook
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );

  return (
    <>
      {!keyword ? <Hero /> : <div className="pt-24 pb-10 px-6 max-w-[1440px] mx-auto"><h2 className="text-3xl font-black text-white uppercase">Search Results</h2></div>}

      <div className="bg-black min-h-screen text-white">
        {isLoading ? (
          <Loader />
        ) : isError ? (
          <Message variant="danger">{isError?.data?.message || isError.error}</Message>
        ) : (
          <>
            {/* Features Banner */}
            <div className="border-y border-zinc-900 bg-zinc-950/50">
              <div className="max-w-[1440px] mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { icon: FaShippingFast, title: "Fast Shipping", desc: "Expedited shipping worldwide" },
                  { icon: FaUndo, title: "Easy Returns", desc: "30-day seamless returns" },
                  { icon: FaShieldAlt, title: "Secure Payment", desc: "Encrypted payment gateways" },
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                      <feature.icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider">{feature.title}</h4>
                      <p className="text-xs text-zinc-500 font-medium">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            <div className="max-w-[1440px] mx-auto px-6 py-20">
              <div className="flex justify-between items-end mb-12">
                <div>
                  <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-2">
                    Latest <span className="text-red-600">Drops</span>
                  </h2>
                  <p className="text-zinc-500 font-medium max-w-md">
                    Curated essentials for the modern avant-garde. Strict quantities.
                  </p>
                </div>
                <Link to="/shop" className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-red-500 transition-colors">
                  Full Catalog <FaArrowRight />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {data?.products?.map((product) => (
                  <div key={product._id} className="group">
                    <Product product={product} />
                  </div>
                ))}
              </div>

              <div className="mt-16 text-center md:hidden">
                <Link to="/shop" className="inline-flex items-center gap-2 px-8 py-4 border border-zinc-800 text-sm font-bold uppercase tracking-widest hover:border-red-600 hover:text-red-600 transition-colors">
                  View All Products <FaArrowRight />
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Home;