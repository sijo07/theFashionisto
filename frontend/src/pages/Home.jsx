import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useGetProductsQuery } from "../redux/api/productApiSlice";
import { Loader, Message } from "../components/index";
import { Product } from "./products";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowRight, FaShippingFast, FaUndo, FaShieldAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Home = () => {
  const { keyword } = useParams();
  const { data, isLoading, isError } = useGetProductsQuery({ keyword });
  const [showStory, setShowStory] = useState(false);

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
          <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-9xl font-black text-white tracking-tighter mb-8 leading-none">
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

  const OfferCarousel = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const slides = [
      {
        id: 1,
        title: "Mid-Season",
        highlight: "Madness",
        desc: "Exclusive archival pieces and seasonal favorites at expedited rates.",
        code: "-50%",
        bg: "bg-black",
        img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000&auto=format&fit=crop"
      },
      {
        id: 2,
        title: "Member",
        highlight: "Privileges",
        desc: "Early access to the Fall/Winter 2026 limited drop. Sign in to unlock.",
        code: "VIP",
        bg: "bg-black",
        img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop"
      },
      {
        id: 3,
        title: "Runway",
        highlight: "Edit",
        desc: "Shop the looks straight from the Paris Fashion Week presentation.",
        code: "NEW",
        bg: "bg-black",
        img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop"
      }
    ];

    const [timeLeft, setTimeLeft] = useState({ hours: '12', minutes: '00', seconds: '00' });

    useEffect(() => {
      // Set target to midnight of next day or fixed duration
      const targetDate = new Date();
      targetDate.setHours(24, 0, 0, 0);

      const interval = setInterval(() => {
        const now = new Date();
        const difference = targetDate - now;

        if (difference <= 0) {
          // Reset for demo purposes
          targetDate.setDate(targetDate.getDate() + 1);
        } else {
          const h = Math.floor((difference / (1000 * 60 * 60)) % 24);
          const m = Math.floor((difference / 1000 / 60) % 60);
          const s = Math.floor((difference / 1000) % 60);

          setTimeLeft({
            hours: h < 10 ? `0${h}` : h,
            minutes: m < 10 ? `0${m}` : m,
            seconds: s < 10 ? `0${s}` : s
          });
        }
      }, 1000);

      return () => clearInterval(interval);
    }, []);

    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 6000);
      return () => clearInterval(timer);
    }, [slides.length]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    return (
      <div className="bg-black text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>

        <div className="max-w-[1440px] mx-auto px-6 py-16 md:py-24 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col md:flex-row items-center justify-between gap-12"
            >
              <div className="text-center md:text-left w-full md:w-1/2">
                <span className="inline-block bg-white text-black px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Limited Event</span>
                <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 leading-[0.9]">
                  {slides[currentSlide].title} <br /> <span className="font-playfair italic font-normal">{slides[currentSlide].highlight}</span>
                </h2>
                <p className="text-white/80 font-light max-w-md text-sm md:text-lg mb-10 mx-auto md:mx-0 leading-relaxed border-l-2 border-white/20 pl-6">
                  {slides[currentSlide].desc}
                </p>
                <div className="flex flex-col sm:flex-row gap-8 justify-center md:justify-start items-center">
                  <Link to="/shop" className="group relative px-8 py-4 bg-transparent border border-white/30 hover:border-white transition-colors overflow-hidden">
                    <span className="relative z-10 font-bold uppercase tracking-[0.2em] text-xs group-hover:text-black transition-colors">Explore Now</span>
                    <div className="absolute inset-0 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out origin-left"></div>
                  </Link>

                  {/* Timer */}
                  <div className="flex items-center gap-6 font-mono text-xl">
                    <div className="flex flex-col items-center">
                      <span className="font-bold">{timeLeft.hours}</span>
                      <span className="text-[9px] uppercase tracking-widest text-white/50">Hrs</span>
                    </div>
                    <span className="text-white/30 font-light">:</span>
                    <div className="flex flex-col items-center">
                      <span className="font-bold">{timeLeft.minutes}</span>
                      <span className="text-[9px] uppercase tracking-widest text-white/50">Min</span>
                    </div>
                    <span className="text-white/30 font-light">:</span>
                    <div className="flex flex-col items-center">
                      <span className="font-bold">{timeLeft.seconds}</span>
                      <span className="text-[9px] uppercase tracking-widest text-white/50">Sec</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-1/2 lg:w-1/3 aspect-square relative group">
                <div className="absolute inset-0 border border-white/20 translate-x-4 translate-y-4 transition-transform duration-500 group-hover:translate-x-2 group-hover:translate-y-2"></div>
                <div className="absolute inset-0 border border-white/20 -translate-x-4 -translate-y-4 transition-transform duration-500 group-hover:-translate-x-2 group-hover:-translate-y-2"></div>
                <div className="relative h-full w-full overflow-hidden border border-white/10 bg-black">
                  <motion.img
                    src={slides[currentSlide].img}
                    alt="Offer"
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    initial={{ scale: 1.2, filter: "grayscale(100%)" }}
                    animate={{ scale: 1, filter: "grayscale(100%)" }}
                    whileHover={{ scale: 1.05, filter: "grayscale(0%)" }}
                    transition={{ duration: 1.5 }}
                  />

                  {/* Digital Glitch/Overlay Text */}
                  <div className="absolute bottom-0 left-0 bg-white text-black px-4 py-2">
                    <span className="font-black text-xl tracking-tighter">{slides[currentSlide].code}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 md:left-8 w-10 h-10 flex items-center justify-center bg-black/20 hover:bg-black text-white rounded-full transition-all backdrop-blur-sm z-20">
            <FaChevronLeft size={12} />
          </button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 md:right-8 w-10 h-10 flex items-center justify-center bg-black/20 hover:bg-black text-white rounded-full transition-all backdrop-blur-sm z-20">
            <FaChevronRight size={12} />
          </button>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-white w-8' : 'bg-white/30 hover:bg-white/60'}`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {!keyword ? <Hero /> : <div className="pt-24 pb-10 px-6 max-w-[1440px] mx-auto"><h2 className="text-3xl font-black text-white uppercase">Search Results</h2></div>}

      <div className="bg-[#050505] min-h-screen text-white">
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

            {/* Advanced Offer Carousel */}
            <OfferCarousel />

            {/* Curated Categories */}
            <div className="max-w-[1440px] mx-auto px-6 py-20 border-b border-zinc-900">
              <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                <h2 className="text-3xl font-black uppercase tracking-tight">Curated <span className="font-playfair italic font-normal text-zinc-500">Edits</span></h2>
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest hidden md:block">Fall / Winter 2026</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: "Men's Archive", subtitle: "Structured Layers", img: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1887&auto=format&fit=crop" },
                  { title: "Women's Edit", subtitle: "Fluid Silhouettes", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop" },
                  { title: "Accessories", subtitle: "Finishing Touches", img: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=2070&auto=format&fit=crop" },
                ].map((cat, idx) => (
                  <div key={idx} className="relative h-[600px] group overflow-hidden border border-zinc-900 cursor-pointer">
                    <img src={cat.img} alt={cat.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale" />

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>

                    {/* Content */}
                    <div className="absolute inset-0 p-8 flex flex-col justify-between">
                      <div className="self-end opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <FaArrowRight className="text-2xl text-white -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                      </div>

                      <div>
                        <span className="block text-xs font-bold uppercase tracking-[0.2em] text-red-500 mb-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">{cat.subtitle}</span>
                        <h3 className="text-4xl font-black uppercase tracking-tighter text-white leading-none group-hover:text-stroke-white group-hover:text-transparent transition-all duration-500">
                          {cat.title.split(' ').map((word, wIdx) => <div key={wIdx}>{word}</div>)}
                        </h3>
                      </div>
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
                {data?.products?.slice(0, 4).map((product) => (
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

            {/* Brand Manifesto / Marquee */}
            <div className="bg-white text-black py-4 overflow-hidden border-y border-zinc-200">
              <div className="flex gap-8 animate-marquee whitespace-nowrap">
                {[...Array(10)].map((_, i) => (
                  <span key={i} className="text-xl md:text-2xl font-black uppercase tracking-widest italic flex items-center gap-8">
                    Redefining Modern Luxury <span className="w-2 h-2 bg-red-600 rounded-full inline-block"></span>
                    Artisanal Craftsmanship <span className="w-2 h-2 bg-red-600 rounded-full inline-block"></span>
                  </span>
                ))}
              </div>
            </div>

            {/* The Journal / Editorial */}
            <div className="max-w-[1440px] mx-auto px-6 py-24">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="relative group overflow-hidden border border-zinc-800">
                  <img src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=2073&auto=format&fit=crop" alt="Editorial" className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="border border-white/50 px-8 py-4 backdrop-blur-sm">
                      <span className="text-white font-playfair italic text-2xl">The Atelier</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <span className="text-red-600 font-bold uppercase tracking-[0.2em] text-xs">Editorial</span>
                  <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-white">
                    Voices from <br /> the <span className="text-zinc-600">Void</span>
                  </h2>
                  <p className="text-zinc-400 font-light text-lg leading-relaxed max-w-md">
                    Explore the creative process behind our latest "Noir et Blanc" collection.
                    A conversation with lead designer Adrian V. on the importance of silence in design.
                  </p>
                  <button
                    onClick={() => setShowStory(true)}
                    className="text-white border-b-2 border-white/20 pb-1 hover:border-red-600 hover:text-red-600 transition-all font-bold uppercase tracking-widest text-sm"
                  >
                    Read Story
                  </button>
                </div>
              </div>

              {/* Secondary Editorial Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 border-t border-zinc-900 pt-12">
                {[
                  { category: "Technique", title: "The Art of Deconstruction", date: "Oct 12", img: "https://images.unsplash.com/photo-1550614000-4b9519e0037a?q=80&w=2000&auto=format&fit=crop" },
                  { category: "Archive", title: "Reflections on 1999", date: "Sep 28", img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1976&auto=format&fit=crop" },
                  { category: "Studio", title: "Materials of the Future", date: "Sep 15", img: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2074&auto=format&fit=crop" },
                ].map((story, idx) => (
                  <Link key={idx} to="/shop" className="group cursor-pointer block">
                    <div className="overflow-hidden mb-6 border border-zinc-900">
                      <img src={story.img} alt={story.title} className="w-full aspect-video object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                    </div>
                    <div className="flex justify-between items-baseline border-b border-zinc-900 pb-4 mb-4">
                      <span className="text-red-600 font-bold uppercase tracking-[0.2em] text-[10px]">{story.category}</span>
                      <span className="text-zinc-600 font-mono text-xs">{story.date}</span>
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-white group-hover:text-zinc-400 transition-colors">{story.title}</h3>
                  </Link>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {showStory && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6"
                  onClick={() => setShowStory(false)}
                >
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    className="bg-zinc-950 border border-zinc-800 p-8 md:p-12 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-start mb-8">
                      <span className="text-red-600 font-bold uppercase tracking-[0.2em] text-xs">Editorial Vol. 04</span>
                      <button onClick={() => setShowStory(false)} className="text-zinc-500 hover:text-white"><FaChevronRight className="rotate-45" size={24} /></button>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-8">Voices from the Void</h2>
                    <div className="prose prose-invert prose-lg text-zinc-400 font-light">
                      <p>
                        "Silence is not the absence of sound, but the beginning of listening." <br /><br />
                        This was the guiding principle for Adrian V. when designing the 'Noir et Blanc' collection. In an industry screaming for attention, the decision to strip away color was an act of rebellion.
                      </p>
                      <p>
                        The collection draws inspiration from brutalist architecture—raw concrete, sharp angles, and the interplay of light and shadow. Each piece is constructed not just to be worn, but to inhabit space. Use of heavy wools contrasted with sheer organza creates a dialogue between protection and vulnerability.
                      </p>
                      <p>
                        "We wanted to create clothes that feel like armor for the modern soul," Adrian explains from his Paris atelier. "It's about finding power in the quiet moments."
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Newsletter */}
            <div className="border-t border-zinc-900 bg-zinc-950">
              <div className="max-w-[1440px] mx-auto px-6 py-24 flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="md:w-1/2">
                  <h2 className="text-4xl font-black uppercase tracking-tight text-white mb-4">
                    Join the <span className="text-zinc-500">Inner Circle</span>
                  </h2>
                  <p className="text-zinc-400 font-medium">
                    Secure early access to drops, exclusive archives, and private events.
                  </p>
                </div>
                <div className="w-full md:w-1/2">
                  <form className="flex" onSubmit={(e) => { e.preventDefault(); toast.success("Welcome to the Inner Circle."); }}>
                    <input
                      type="email"
                      placeholder="ENTER YOUR EMAIL"
                      className="w-full bg-transparent border-b border-zinc-700 py-4 text-white placeholder-zinc-600 focus:border-white focus:outline-none uppercase tracking-widest font-bold text-sm"
                    />
                    <button type="submit" className="border-b border-zinc-700 text-white font-black uppercase tracking-widest px-8 hover:text-red-600 hover:border-red-600 transition-colors">
                      Submit
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Home;