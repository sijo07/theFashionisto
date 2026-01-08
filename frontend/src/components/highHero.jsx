import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";

const HighHero = () => {
    return (
        <section className="relative w-full h-[85vh] overflow-hidden bg-black flex items-center">
            {/* Cinematic Background */}
            <div className="absolute inset-0 z-0">
                <motion.div
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.7 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="w-full h-full"
                >
                    <img
                        src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
                        alt="Editorial Fashion"
                        className="w-full h-full object-cover"
                    />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />
            </div>

            {/* Editorial Content */}
            <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 w-full">
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="max-w-2xl"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-[1px] bg-teal-500" />
                        <span className="text-[10px] font-black text-teal-500 uppercase tracking-[0.5em]">Season 2024</span>
                    </div>

                    <h1 className="text-6xl lg:text-8xl font-serif font-black text-white leading-[0.9] mb-8 tracking-tighter italic">
                        The <span className="text-teal-500">Elite</span><br />
                        Movement.
                    </h1>

                    <p className="text-gray-400 text-lg lg:text-xl font-medium mb-12 max-w-lg leading-relaxed">
                        Curated aesthetics for the modern individual. Experience the intersection of high-fashion and tactical utility.
                    </p>

                    <div className="flex flex-wrap items-center gap-6">
                        <Link to="/shop">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-10 py-5 bg-teal-600 hover:bg-teal-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-full shadow-2xl shadow-teal-500/40 flex items-center gap-4 transition-all"
                            >
                                Explore Collection <FaChevronRight size={10} />
                            </motion.button>
                        </Link>

                        <Link to="/discover">
                            <button className="px-10 py-5 border border-white/20 hover:border-white/40 text-white font-black text-xs uppercase tracking-[0.2em] rounded-full backdrop-blur-md transition-all">
                                View Lookbook
                            </button>
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Side Indicator */}
            <div className="absolute right-12 bottom-12 hidden lg:flex flex-col items-center gap-4">
                <span className="text-white text-[10px] font-black uppercase tracking-[0.4em] [writing-mode:vertical-lr]">Scroll Exploration</span>
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-[1px] h-16 bg-gradient-to-b from-teal-500 to-transparent"
                />
            </div>
        </section>
    );
};

export default HighHero;
