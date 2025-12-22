import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useLogoutMutation, useGetProfileQuery } from "../../redux/api/userApiSlice";
import { logout } from "../../redux/features/auth/authSlice";
import { FaBagShopping, FaStore } from "react-icons/fa6";
import { MdDashboard } from "react-icons/md";
import { FaHome, FaUserAlt, FaUsers } from "react-icons/fa";
import { FcLike } from "react-icons/fc";
import { CartCount, FavoritesCount } from "./../products/index";
import CartPopup from "../CartPopup";
import { motion, AnimatePresence } from "framer-motion";

const Navigation = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data: userProfile } = useGetProfileQuery(undefined, {
    skip: !userInfo,
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [pageScroll, setPageScroll] = useState(false);

  const dropdownRef = useRef(null);
  const cartRef = useRef(null);
  const mobileCartRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const toggleSidebar = () => {
    setShowSidebar((prev) => !prev);
  };

  const closeSidebar = () => {
    setShowSidebar(false);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (location.pathname === "/shop") {
        setPageScroll(false);
      } else {
        setPageScroll(window.scrollY >= 90);
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      // Close Cart Popup if click outside
      // Close Cart Popup if click outside
      if (
        showCart &&
        cartRef.current &&
        !cartRef.current.contains(event.target) &&
        mobileCartRef.current &&
        !mobileCartRef.current.contains(event.target)
      ) {
        setShowCart(false);
      }

      // Close Mobile Menu if click outside
      if (showSidebar && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowSidebar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCart]); // Add showCart dependency

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  }

  // Common class logic
  const getNavLinkClass = (path) => {
    const baseClass = "block items-center cursor-pointer t duration-200 ease-out hover:scale-105 tracking-wider";
    return isActive(path)
      ? `${baseClass} text-[#649899] font-bold`
      : `${baseClass} text-gray-800 hover:text-black`;
  }

  // Use profile data from DB if available, else fallback to userInfo (Redux/LocalStorage)
  const currentUser = userProfile || userInfo;

  return (
    <>
      <div
        className={`w-full z-10 fixed bg-white text-black duration-300 ease-in ${pageScroll && "shadow-lg"
          }`}
      >
        <div className="flex justify-between items-center w-full max-w-screen-xl mx-auto p-4">
          <Link to="/" className="lg:text-4xl font-bold">
            <span className="text-black">THE</span>
            <span className="text-white bg-[#649899] px-2">FASHIONISTO</span>
          </Link>
          <div className="hidden md:flex items-center space-x-10">
            {userInfo && userInfo.isAdmin ? (
              // Admin Navigation
              <div className="flex space-x-8 items-center">
                <Link to="/admin/dashboard" className={`flex flex-col items-center gap-1 hover:text-black hover:scale-105 transition duration-200 group ${isActive('/admin/dashboard') ? 'text-[#649899]' : 'text-gray-800'}`}>
                  <MdDashboard size={20} className="group-hover:text-[#649899]" />
                  <span className="text-[10px] font-bold uppercase group-hover:text-[#649899]">Dashboard</span>
                </Link>
                <Link to="/admin/userList" className={`flex flex-col items-center gap-1 hover:text-black hover:scale-105 transition duration-200 group ${isActive('/admin/userList') ? 'text-[#649899]' : 'text-gray-800'}`}>
                  <FaUsers size={20} className="group-hover:text-[#649899]" />
                  <span className="text-[10px] font-bold uppercase group-hover:text-[#649899]">Users</span>
                </Link>
                <Link to="/admin/categoryList" className={`flex flex-col items-center gap-1 hover:text-black hover:scale-105 transition duration-200 group ${isActive('/admin/categoryList') ? 'text-[#649899]' : 'text-gray-800'}`}>
                  <FaStore size={20} className="group-hover:text-[#649899]" />
                  <span className="text-[10px] font-bold uppercase group-hover:text-[#649899]">Categories</span>
                </Link>
                <Link to="/admin/allProductsList" className={`flex flex-col items-center gap-1 hover:text-black hover:scale-105 transition duration-200 group ${isActive('/admin/allProductsList') ? 'text-[#649899]' : 'text-gray-800'}`}>
                  <FaBagShopping size={20} className="group-hover:text-[#649899]" />
                  <span className="text-[10px] font-bold uppercase group-hover:text-[#649899]">Products</span>
                </Link>
                <Link to="/admin/orderList" className={`flex flex-col items-center gap-1 hover:text-black hover:scale-105 transition duration-200 group ${isActive('/admin/orderList') ? 'text-[#649899]' : 'text-gray-800'}`}>
                  <div className="relative">
                    <FaBagShopping size={20} className="group-hover:text-[#649899]" />
                    {/* Badge if needed later */}
                  </div>
                  <span className="text-[10px] font-bold uppercase group-hover:text-[#649899]">Orders</span>
                </Link>
                <Link to="/admin/inventory" className={`flex flex-col items-center gap-1 hover:text-black hover:scale-105 transition duration-200 group ${isActive('/admin/inventory') ? 'text-[#649899]' : 'text-gray-800'}`}>
                  <FaStore size={20} className="group-hover:text-[#649899]" />
                  <span className="text-[10px] font-bold uppercase group-hover:text-[#649899]">Inventory</span>
                </Link>
              </div>
            ) : (
              // User Navigation
              <>
                <Link
                  to="/"
                  className={`flex flex-col items-center justify-center transition-colors duration-200 group ${isActive("/") ? "text-[#649899]" : "text-gray-800"}`}
                >
                  <FaHome size={20} className="mb-1" />
                  <span className={`text-[10px] font-bold uppercase leading-none ${isActive("/") ? "text-[#649899]" : "group-hover:text-[#649899]"}`}>
                    Home
                  </span>
                </Link>
                <Link
                  to="/shop"
                  className={`flex flex-col items-center justify-center transition-colors duration-200 group ${isActive("/shop") ? "text-[#649899]" : "text-gray-800"}`}
                >
                  <FaStore size={20} className="mb-1" />
                  <span className={`text-[10px] font-bold uppercase leading-none ${isActive("/shop") ? "text-[#649899]" : "group-hover:text-[#649899]"}`}>
                    Shop
                  </span>
                </Link>
                <Link
                  to="/favorite"
                  className={`flex flex-col items-center justify-center transition-colors duration-200 group ${isActive("/favorite") ? "text-[#649899]" : "text-gray-800"}`}
                >
                  <div className="relative">
                    <FcLike size={20} className="mb-1" />
                    <div className="absolute top-[-10px] right-[-16px]">
                      <FavoritesCount />
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase leading-none ${isActive("/favorite") ? "text-[#649899]" : "group-hover:text-[#649899]"}`}>
                    Liked
                  </span>
                </Link>
                <div className="relative" ref={cartRef}>
                  <button
                    onClick={() => setShowCart(!showCart)}
                    className={`flex flex-col items-center justify-center transition-colors duration-200 group ${showCart ? "text-[#649899]" : "text-gray-800"}`}
                  >
                    <div className="relative">
                      <FaBagShopping size={20} className="mb-1 text-[#00a550]" />
                      <div className="absolute top-[-10px] right-[-16px]">
                        <CartCount />
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase leading-none ${showCart ? "text-[#649899]" : "group-hover:text-[#649899]"}`}>
                      Bag
                    </span>
                  </button>
                  <CartPopup isOpen={showCart} onClose={() => setShowCart(false)} />
                </div>
              </>
            )}
            {userInfo ? (
              !userInfo.isAdmin && (
                <div
                  className="relative flex items-center cursor-pointer text-gray-800 hover:text-black transition duration-200 ease-in-out"
                  ref={dropdownRef}
                  onMouseEnter={() => setDropdownOpen(true)}
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="block items-center cursor-pointer text-gray-800 hover:text-black t duration-200 ease-out hover:scale-105 tracking-wider flex flex-col items-center gap-1">
                    {currentUser.image ? (
                      <div className="relative w-8 h-8 rounded-full overflow-hidden border border-blue-200">
                        <img src={currentUser.image} alt={currentUser.username} className="w-full h-full object-cover transform scale-150" />
                      </div>
                    ) : (
                      <img src={`https://ui-avatars.com/api/?name=${currentUser.username}&background=random`} alt={currentUser.username} className="w-8 h-8 rounded-full object-cover border border-gray-300" />
                    )}
                    <span className="text-[10px] font-bold capitalize leading-none">
                      {currentUser.username}
                    </span>
                  </div>
                  {dropdownOpen && (
                    <div className="fixed top-[69px] right-[2rem] w-[18rem] shadow-lg bg-white  p-2">
                      <div className=" relative left-[120px] ml-1 transform-translate-x-1/2 w-14 h-1 bg-red-500 group-hover:bg-red-600 transition-colors duration-300"></div>
                      <div className="p-4 border-b">
                        <p className="font-semibold text-sm">
                          Hello {userInfo.username}
                        </p>
                        <p className="text-xs mt-1">{userInfo.phone}</p>
                      </div>
                      <Link
                        to="/user-orders"
                        className="block px-4 py-2 text-xs hover:text-sm text-gray-500 hover:text-black transition-all duration-300 ease-out tracking-wider cursor-pointer hover:font-semibold"
                        onClick={closeDropdown}
                      >
                        Orders
                      </Link>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-xs hover:text-sm text-gray500 hover:text-black transition-all duration-300 ease-out tracking-wider cursor-pointer hover:font-semibold"
                        onClick={closeDropdown}
                      >
                        Edit Profile
                      </Link>
                      <Link
                        to="/contact"
                        className="block px-4 py-2 text-xs hover:text-sm text-gray-500 hover:text-black transition-all duration-300 ease-out hover:font-semibold tracking-wider cursor-pointer"
                        onClick={closeDropdown}
                      >
                        Contact Us
                      </Link>
                      <button
                        className="block px-4 py-2 text-xs hover:text-sm text-gray-500 hover:text-[#D70040] hover:font-semibold transition-all duration-300 ease-out tracking-wider cursor-pointer"
                        onClick={() => {
                          closeDropdown();
                          logoutHandler();
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )
            ) : (
              <Link
                to="/login"
                className={getNavLinkClass("/login")}
              >
                <FaUserAlt size={14} className="ml-2" />
                <span className="text-xs font-semibold">Login</span>
              </Link>
            )}
          </div>
          <div className="md:hidden flex items-center z-50 relative" ref={mobileMenuRef}>
            {userInfo && (
              <div className="mr-3">
                {currentUser.image ? (
                  <img src={currentUser.image} alt={currentUser.username} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                ) : (
                  <img src={`https://ui-avatars.com/api/?name=${currentUser.username}&background=random`} alt={currentUser.username} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                )}
              </div>
            )}
            <button
              className="flex flex-col justify-center items-center w-8 h-8 space-y-1.5 focus:outline-none ml-2"
              onClick={toggleSidebar}
            >
              <span className={`block w-6 h-0.5 bg-black transition-all duration-300 ease-in-out ${showSidebar ? "rotate-45 translate-y-2" : ""}`}></span>
              <span className={`block w-6 h-0.5 bg-black transition-all duration-300 ease-in-out ${showSidebar ? "opacity-0" : ""}`}></span>
              <span className={`block w-6 h-0.5 bg-black transition-all duration-300 ease-in-out ${showSidebar ? "-rotate-45 -translate-y-2" : ""}`}></span>
            </button>

            {showSidebar && (
              <div className="absolute top-full right-0 mt-2 w-[16rem] bg-white shadow-lg p-2 z-50 animate-fade-in font-sans rounded-none border border-gray-100">
                {/* Red Indicator Line */}
                <div className="absolute -top-1 right-2 w-10 h-1 bg-[#D70040]"></div>

                {userInfo ? (
                  <div className="p-4 border-b border-gray-200 mb-2">
                    <p className="font-semibold text-base text-gray-800 capitalize">Hello {userInfo.username}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{userInfo.email}</p>
                  </div>
                ) : (
                  <div className="p-4 border-b border-gray-200 mb-2">
                    <p className="font-semibold text-base text-gray-800">Hello Guest</p>
                  </div>
                )}

                <div className="flex flex-col gap-0.5">
                  {userInfo ? (
                    <>
                      <Link to="/user-orders" className="block px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors" onClick={closeSidebar}>Orders</Link>
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors" onClick={closeSidebar}>Edit Profile</Link>
                      <Link to="/contact" className="block px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors" onClick={closeSidebar}>Contact Us</Link>
                      <button
                        onClick={() => { closeSidebar(); logoutHandler(); }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-red-500 hover:bg-red-50 transition-colors mt-1"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="block px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors" onClick={closeSidebar}>Login</Link>
                      <Link to="/register" className="block px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors" onClick={closeSidebar}>Register</Link>
                      <Link to="/contact" className="block px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors" onClick={closeSidebar}>Contact Us</Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div >
      </div >

      {/* Bottom Navigation for Mobile */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 md:hidden z-50 flex justify-around items-center py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <Link to="/" className={`flex flex-col items-center gap-1 ${isActive("/") ? "text-[#649899]" : "text-gray-500"}`}>
          <FaHome size={22} />
          <span className="text-[10px] font-medium text-gray-700">Home</span>
        </Link>
        <Link to="/shop" className={`flex flex-col items-center gap-1 ${isActive("/shop") ? "text-[#649899]" : "text-gray-500"}`}>
          <FaStore size={22} />
          <span className="text-[10px] font-medium text-gray-700">Shop</span>
        </Link>
        <Link to="/cart" className={`flex flex-col items-center gap-1 ${isActive("/cart") ? "text-[#649899]" : "text-gray-500"} relative`}>
          <div className="relative">
            <FaBagShopping size={22} className={isActive("/cart") ? "text-[#649899]" : "text-gray-400"} />
            <div className="absolute -top-3 -right-3 transform scale-75">
              <CartCount />
            </div>
          </div>
          <span className="text-[10px] font-medium text-gray-700">Bag</span>
        </Link>
        <Link to="/favorite" className={`flex flex-col items-center gap-1 ${isActive("/favorite") ? "text-[#649899]" : "text-gray-500"} relative`}>
          <div className="relative">
            <FcLike size={22} />
            <div className="absolute -top-3 -right-3 transform scale-75">
              <FavoritesCount />
            </div>
          </div>
          <span className="text-[10px] font-medium text-gray-700">Liked</span>
        </Link>
      </div>

    </>
  );
};

export default Navigation;
