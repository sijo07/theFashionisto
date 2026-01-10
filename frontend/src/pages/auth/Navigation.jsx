import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useLogoutMutation, useGetProfileQuery } from "../../redux/api/userApiSlice";
import { logout } from "../../redux/features/auth/authSlice";
import { FaBagShopping, FaStore } from "react-icons/fa6";
import { FaHome, FaUserAlt, FaBars, FaTimes, FaTachometerAlt } from "react-icons/fa";
import { FcLike } from "react-icons/fc";
import { MdFavoriteBorder } from "react-icons/md";
import { FavoritesCount, CartCount } from "./../products/index";
import { motion, AnimatePresence } from "framer-motion";

const Navigation = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const favorites = useSelector((state) => state.favorites);
  const { data: userProfile } = useGetProfileQuery(undefined, { skip: !userInfo });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [pagescroll, setPageScroll] = useState(false);

  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutApiCall] = useLogoutMutation();

  const toggleSidebar = () => setShowSidebar((prev) => !prev);
  const closeSidebar = () => setShowSidebar(false);
  const closeDropdown = () => setDropdownOpen(false);

  const currentUser = userProfile || userInfo;

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setPageScroll(window.scrollY >= 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const location = useLocation();
  if (location.pathname.startsWith("/admin")) return null;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b ${pagescroll
          ? "bg-black border-zinc-800 py-4 shadow-lg"
          : "bg-black/50 backdrop-blur-md border-transparent py-6"
          }`}
      >
        <div className="max-w-screen-xl mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-black tracking-tighter text-white group flex items-center gap-0">
            <motion.div
              initial="initial"
              animate="animate"
              className="flex items-center overflow-hidden"
            >
              <div className="flex font-fashion font-black italic tracking-tighter mr-1 text-white">
                {["T", "H", "E"].map((char, i) => (
                  <motion.span
                    key={i}
                    variants={{
                      initial: { y: 20, opacity: 0 },
                      animate: { y: 0, opacity: 1 }
                    }}
                    transition={{ duration: 0.5, delay: i * 0.1, ease: [0.33, 1, 0.68, 1] }}
                  >
                    {char}
                  </motion.span>
                ))}
              </div>
              <motion.span
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-red-500 flex font-fashion font-black italic tracking-tighter"
              >
                {["F", "A", "S", "H", "I", "O", "N", "I", "S", "T", "O"].map((char, i) => (
                  <motion.span
                    key={i}
                    variants={{
                      initial: { x: 10, opacity: 0 },
                      animate: { x: 0, opacity: 1 }
                    }}
                    transition={{ duration: 0.4, delay: 0.6 + i * 0.05 }}
                    className="drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]"
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.span>
            </motion.div>
          </Link>

          {/* Center Navigation (Desktop) - Vertical Layout Preserved */}
          <div className="hidden md:flex flex-1 justify-center items-start space-x-8">
            <Link
              to="/"
              className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-wider group min-w-[3rem]"
            >
              <FaHome size={20} />
              <span>Home</span>
            </Link>
            <Link
              to="/shop"
              className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-wider group min-w-[3rem]"
            >
              <FaStore size={20} />
              <span>Shop</span>
            </Link>
            <Link
              to="/cart"
              className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-wider group min-w-[3rem] relative"
            >
              <FaBagShopping size={20} />
              <span>Bag</span>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                {cartItems.length > 0 && (
                  <span className="bg-green-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md leading-none pt-[1px]">
                    {cartItems.reduce((a, c) => a + c.qty, 0)}
                  </span>
                )}
              </div>
            </Link>
            <Link
              to="/favorite"
              className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-wider group min-w-[3rem] relative"
            >
              <MdFavoriteBorder size={20} />
              <span>Liked</span>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                {favorites.length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md leading-none pt-[1px]">
                    {favorites.length}
                  </span>
                )}
              </div>
            </Link>
          </div>

          {/* Right User Navigation */}
          {/* Right User Navigation */}
          <div className="flex items-center space-x-6">
            {userInfo ? (
              <div
                className="relative"
                ref={dropdownRef}
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div className="flex items-center gap-3 cursor-pointer group">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-red-500 uppercase tracking-wider">
                      {userInfo.username}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-zinc-700 overflow-hidden group-hover:border-red-500 transition-all">
                    <img
                      src={currentUser?.image || `https://ui-avatars.com/api/?name=${userInfo.username}&background=EF4444&color=fff`}
                      className="w-full h-full object-cover"
                      alt="Profile"
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 md:right-[-3rem] mt-4 w-60 md:w-[18rem] bg-zinc-900 border border-zinc-800 rounded-md shadow-xl overflow-hidden p-2"
                    >
                      <button
                        onClick={() => setDropdownOpen(false)}
                        className="absolute top-3 right-3 text-zinc-500 hover:text-red-500 transition-colors"
                      >
                        <FaTimes size={14} />
                      </button>
                      <div className="flex justify-center mb-1">
                        <div className="w-14 h-1 bg-red-500 rounded-full"></div>
                      </div>
                      <div className="px-4 py-3 border-b border-zinc-800 mb-2 text-center">
                        <p className="font-bold text-sm text-white uppercase tracking-wider">
                          Hello <span className="text-red-500">{userInfo.username}</span>
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">{userInfo.phone}</p>
                      </div>

                      <div className="my-2 border-t border-zinc-800 mx-4" />

                      {userInfo.isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          className="block px-4 py-2 text-xs text-red-500 font-bold hover:bg-zinc-800 transition-colors uppercase tracking-wider rounded-sm"
                          onClick={closeDropdown}
                        >
                          Command Center
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors uppercase tracking-wider rounded-sm"
                        onClick={closeDropdown}
                      >
                        Edit Profile
                      </Link>
                      <Link
                        to="/contact"
                        className="block px-4 py-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors uppercase tracking-wider rounded-sm"
                        onClick={closeDropdown}
                      >
                        Contact Us
                      </Link>
                      <button
                        onClick={() => {
                          closeDropdown();
                          logoutHandler();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-zinc-800 transition-colors uppercase tracking-wider mt-1 rounded-sm"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 text-white hover:text-red-500 transition-colors text-xs font-semibold uppercase tracking-wider"
              >
                <FaUserAlt size={14} />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-black/90 backdrop-blur-lg border-t border-zinc-900 pb-safe">
        <div className="flex justify-around items-center h-16">
          <Link to="/" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <FaHome size={20} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Home</span>
          </Link>

          <Link to="/shop" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/shop' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <FaStore size={20} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Shop</span>
          </Link>

          <Link to="/cart" className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/cart' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <div className="relative">
              <FaBagShopping size={20} />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full leading-none">
                  {cartItems.reduce((a, c) => a + c.qty, 0)}
                </span>
              )}
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest">Bag</span>
          </Link>

          <Link to="/favorite" className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/favorite' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <div className="relative">
              <MdFavoriteBorder size={20} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full leading-none">
                  {favorites.length}
                </span>
              )}
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest">Liked</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navigation;
