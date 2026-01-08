import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowRight, FaSearch } from "react-icons/fa";

const NotFound = () => {
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Abstract Background Element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30vw] font-black text-zinc-900 select-none opacity-20 tracking-tighter italic">
                404
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-4xl flex flex-col md:flex-row items-center gap-12 md:gap-24"
            >
                {/* Left Side: Editorial Typography */}
                <div className="flex-1 text-center md:text-left">
                    <header className="mb-10">
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-600 block mb-6">
                            Index / Out of Bounds
                        </span>
                        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-6">
                            Collection <br />
                            Not <span className="italic text-red-600">Found</span>
                        </h1>
                    </header>

                    <p className="text-zinc-500 font-medium text-sm md:text-base mb-12 max-w-md leading-relaxed">
                        The requested resource is no longer available in our digital catalog.
                        It may have been moved, archived, or temporarily withdrawn from the collection.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center md:justify-start">
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center gap-4 bg-white text-black px-10 py-5 font-black uppercase tracking-[0.3em] text-[10px] hover:bg-red-600 hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                        >
                            Back to Catalog <FaArrowRight />
                        </Link>
                        <Link
                            to="/shop"
                            className="inline-flex items-center justify-center gap-4 bg-transparent border border-zinc-800 text-zinc-400 px-10 py-5 font-black uppercase tracking-[0.3em] text-[10px] hover:text-white hover:border-zinc-400 transition-all"
                        >
                            Search Shop <FaSearch size={10} />
                        </Link>
                    </div>
                </div>

                {/* Right Side: High-Fashion Imagery Decor */}
                <div className="hidden md:block w-72 h-[450px] relative overflow-hidden group">
                    <motion.div
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 1.5 }}
                        className="w-full h-full"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop"
                            alt="Luxury Fashion Not Found"
                            className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                        />
                    </motion.div>
                    <div className="absolute inset-0 border border-zinc-800 m-4 pointer-events-none group-hover:border-red-600/50 transition-colors" />
                    <div className="absolute top-8 left-0 -ml-4 transform -rotate-90">
                        <span className="text-[8px] font-black uppercase tracking-[0.5em] text-zinc-700">T-FASHIONISTO // NULL_PTR</span>
                    </div>
                </div>
            </motion.div>

            {/* Aesthetic Accents */}
            <div className="absolute bottom-10 right-10 opacity-10 hidden md:block">
                <p className="text-[8px] font-black uppercase tracking-[1em] text-zinc-500">
                    ERROR_CODE: 404_PAGE_MISSING
                </p>
            </div>
        </div>
    );
};

export default NotFound;
