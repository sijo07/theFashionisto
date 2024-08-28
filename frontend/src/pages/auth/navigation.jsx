import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useLogoutMutation } from "../../redux/api/userApiSlice";
import { logout } from "../../redux/features/auth/authSlice";
import { FaBagShopping, FaStore } from "react-icons/fa6";
import { FaHome, FaUserAlt } from "react-icons/fa";
import { FcLike } from "react-icons/fc";
import { FavoritesCount, CartCount } from "./../products/index";

const Navigation = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [pagescroll, setPageScroll] = useState(false);

  const dropdownRef = useRef(null);

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
      setPageScroll(window.scrollY >= 90);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div
        className={`w-full z-10 fixed bg-white text-black duration-300 ease-in ${
          pagescroll && "shadow-lg"
        }`}
      >
        <div className="flex justify-between items-center w-full max-w-screen-xl mx-auto p-4">
          <Link to="/" className="text-4xl font-bold">
            <span className="text-black">THE</span>
            <span className="text-white bg-[#649899] px-2">FASHIONISTO</span>
          </Link>
          <div className="hidden md:flex items-center space-x-10">
            <Link
              to="/"
              className="block items-center cursor-pointer text-gray-800 hover:text-black t duration-200 ease-out hover:scale-105 tracking-wider"
            >
              <FaHome size={14} className="ml-2" />
              <span className="text-xs font-semibold">Home</span>
            </Link>
            <Link
              to="/shop"
              className="block items-center cursor-pointer text-gray-800 hover:text-black t duration-200 ease-out hover:scale-105 tracking-wider"
            >
              <FaStore size={14} className="ml-2" />
              <span className="text-xs font-semibold">Shop</span>
            </Link>
            <Link
              to="/cart"
              className="block items-center cursor-pointer text-gray-800 hover:text-black t duration-200 ease-out hover:scale-105 tracking-wider"
            >
              <FaBagShopping size={14} className="ml-1" />
              <div className="text-xs font-semibold justify-center">
                Bag
                <span>
                  <CartCount />
                </span>
              </div>
            </Link>
            <Link
              to="/favorite"
              className="block items-center cursor-pointer text-gray-800 hover:text-black t duration-200 ease-out hover:scale-105 tracking-wider"
            >
              <FcLike className="ml-2" />
              <div className="text-xs font-semibold justify-center">
                Liked
                <span>
                  <FavoritesCount />
                </span>
              </div>
            </Link>
            {userInfo ? (
              <div
                className="relative flex items-center cursor-pointer text-gray-800 hover:text-black transition duration-200 ease-in-out"
                ref={dropdownRef}
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div className="block items-center cursor-pointer text-gray-800 hover:text-black t duration-200 ease-out hover:scale-105 tracking-wider">
                  <FaUserAlt size={14} className="ml-2" />
                  <span className="text-xs font-semibold capitalize">
                    {userInfo.username}
                  </span>
                </div>
                {dropdownOpen && (
                  <div className="fixed top-14 right-[2rem] w-[18rem] shadow-lg bg-white  p-2">
                    {userInfo.isAdmin && (
                      <>
                        <div className=" relative left-[8rem] ml-1 transform-translate-x-1/2 w-14 h-1 bg-red-500 group-hover:bg-red-600 transition-colors duration-300"></div>
                        <div className="p-4 border-b">
                          <p className="font-semibold text-sm">
                            Hello {userInfo.username}
                          </p>
                          <p className="text-sm mt-1">{userInfo.phone}</p>
                        </div>

                        <Link
                          to="/admin/dashboard"
                          className="block px-4 py-2 text-xs hover:text-sm text-gray-500 hover:text-black transition-all duration-300 ease-out tracking-wider cursor-pointer"
                          onClick={closeDropdown}
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/admin/productList"
                          className="block px-4 py-2 text-xs hover:text-sm text-gray-500 hover:text-black transition-all duration-300 ease-out tracking-wider cursor-pointer"
                          onClick={closeDropdown}
                        >
                          Products
                        </Link>
                        <Link
                          to="/admin/categoryList"
                          className="block px-4 py-2 text-xs hover:text-sm text-gray-500 hover:text-black transition-all duration-300 ease-out tracking-wider cursor-pointer"
                          onClick={closeDropdown}
                        >
                          Category
                        </Link>
                        <Link
                          to="/admin/orderList"
                          className="block px-4 py-2 text-xs hover:text-sm text-gray-500 hover:text-black transition-all duration-300 ease-out tracking-wider cursor-pointer"
                          onClick={closeDropdown}
                        >
                          Orders
                        </Link>
                        <Link
                          to="/admin/userList"
                          className="block px-4 py-2 text-xs hover:text-sm text-gray-500 hover:text-black transition-all duration-300 ease-out tracking-wider cursor-pointer"
                          onClick={closeDropdown}
                        >
                          Users
                        </Link>
                      </>
                    )}
                    <hr className="relative left-[1rem] w-[10rem]" />
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-xs hover:text-sm text-gray500 hover:text-black transition-all duration-300 ease-out tracking-wider cursor-pointer"
                      onClick={closeDropdown}
                    >
                      Edit Profile
                    </Link>
                    <Link
                      to="/contact"
                      className="block px-4 py-2 text-xs hover:text-sm text-gray-500 hover:text-black transition-all duration-300 ease-out tracking-wider cursor-pointer"
                      onClick={closeDropdown}
                    >
                      Contact Us
                    </Link>
                    <button
                      className="block px-4 py-2 text-xs hover:text-sm text-gray-500 hover:text-black transition-all duration-300 ease-out tracking-wider cursor-pointer"
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
            ) : (
              <Link
                to="/login"
                className="block items-center cursor-pointer text-gray-800 hover:text-black t duration-200 ease-out hover:scale-105 tracking-wider"
              >
                <FaUserAlt size={14} className="ml-2" />
                <span className="text-xs font-semibold">Login</span>
              </Link>
            )}
          </div>
          <button
            className="md:hidden text-lg px-4 py-2 bg-[#649899] text-white rounded-xl shadow-md"
            onClick={toggleSidebar}
          >
            Menu
          </button>
        </div>
      </div>

      {/* Sidebar for mobile view */}
      {showSidebar && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-75">
          <div className="absolute top-0 right-0 w-64 h-full bg-white shadow-lg p-6">
            <button
              className="block mb-6 text-lg px-4 py-2 bg-[#649899] text-white rounded-xl shadow-md"
              onClick={closeSidebar}
            >
              Close
            </button>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/"
                  className="block text-gray-800 hover:text-black transition duration-200 ease-in-out"
                  onClick={closeSidebar}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  className="block text-gray-800 hover:text-black transition duration-200 ease-in-out"
                  onClick={closeSidebar}
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="block text-gray-800 hover:text-black transition duration-200 ease-in-out"
                  onClick={closeSidebar}
                >
                  Bag
                </Link>
              </li>
              <li>
                <Link
                  to="/favorite"
                  className="block text-gray-800 hover:text-black transition duration-200 ease-in-out"
                  onClick={closeSidebar}
                >
                  Liked
                </Link>
              </li>
              {userInfo ? (
                <>
                  {userInfo.isAdmin && (
                    <>
                      <li>
                        <Link
                          to="/admin/dashboard"
                          className="block text-gray-800 hover:text-black transition duration-200 ease-in-out"
                          onClick={closeSidebar}
                        >
                          Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/admin/productList"
                          className="block text-gray-800 hover:text-black transition duration-200 ease-in-out"
                          onClick={closeSidebar}
                        >
                          Products
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/admin/categoryList"
                          className="block text-gray-800 hover:text-black transition duration-200 ease-in-out"
                          onClick={closeSidebar}
                        >
                          Category
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/admin/orderList"
                          className="block text-gray-800 hover:text-black transition duration-200 ease-in-out"
                          onClick={closeSidebar}
                        >
                          Orders
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/admin/userList"
                          className="block text-gray-800 hover:text-black transition duration-200 ease-in-out"
                          onClick={closeSidebar}
                        >
                          Users
                        </Link>
                      </li>
                    </>
                  )}
                  <li>
                    <Link
                      to="/profile"
                      className="block text-gray-800 hover:text-black transition duration-200 ease-in-out"
                      onClick={closeSidebar}
                    >
                      Profile
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        closeSidebar();
                        logoutHandler();
                      }}
                      className="block w-full text-gray-800 hover:text-black transition duration-200 ease-in-out"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link
                    to="/login"
                    className="block text-gray-800 hover:text-black transition duration-200 ease-in-out"
                    onClick={closeSidebar}
                  >
                    Login
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
