import { useEffect, useState } from "react";
import { MdExpandMore } from "react-icons/md";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useLogoutMutation } from "../../redux/api/userApiSlice";
import { logout } from "../../redux/features/auth/authSlice";
import { FaBagShopping, FaStore } from "react-icons/fa6";
import { FaHome, FaUserAlt } from "react-icons/fa";
import { FcLike } from "react-icons/fc";
import FavoritesCount from "./../products/FavoritesCount";

const Navigation = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [pagescroll, setPageScroll] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const toggleSidebar = () => {
    setShowSidebar((prev) => !prev);
  };

  const closeSidebar = () => {
    setShowSidebar(false);
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

  return (
    <>
      <div
        className={`w-full z-10 fixed bg-white text-black duration-300 ease-in ${
          pagescroll && "shadow-lg"
        }`}
      >
        <div className="flex justify-between items-center w-full max-w-screen-xl mx-auto p-4">
          <Link to="/">
            <img
              src="../assets/logo.png"
              alt="The Fashionisto"
              className="w-auto h-5 lg:w-auto lg:h-10"
            />
          </Link>
          <div>
            <ul className="hidden md:flex items-center">
              <li className="ml-10 cursor-pointer block font-bold duration-200 ease-out hover:scale-105 tracking-wider capitalize hover:border-b-2 border-black">
                <Link to="/">
                  <FaHome size={14} className="ml-3" />
                  <div className="text-xs">home</div>
                </Link>
              </li>
              <li className="ml-10 cursor-pointer block font-bold duration-200 ease-out hover:scale-105 tracking-wider capitalize hover:border-b-2 border-black">
                <Link to="/shop">
                  <FaStore size={14} className="ml-2" />
                  <div className="text-xs">shop</div>
                </Link>
              </li>
              <li className="ml-10 cursor-pointer block font-bold duration-200 ease-out hover:scale-105 tracking-wider capitalize hover:border-b-2 border-black">
                <Link to="/cart">
                  <FaBagShopping size={14} className="ml-1" />
                  <div className="text-xs">Bag</div>
                </Link>
              </li>

              <li className="ml-10 cursor-pointer block font-bold duration-200 ease-out hover:scale-105 tracking-wider capitalize text-center hover:border-b-2 border-black">
                <Link to="/favorite">
                  <FcLike className="ml-2" />
                  <div className="text-xs flex justify-center lining-nums">
                    liked{" "}
                    <span className="rounded-full">
                      <FavoritesCount />
                    </span>
                  </div>
                </Link>
              </li>
              {userInfo && (
                <div className="relative block ml-10 mt-2 capitalize text-xs duration-200 ease-out hover:scale-105 tracking-wider hover:border-b-2 border-black">
                  <FaUserAlt size={12} className="ml-2" />
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center text-black focus:outline-none capitalize font-bold"
                  >
                    <span className="flex">
                      {userInfo.username}{" "}
                      <MdExpandMore
                        size={20}
                        className={`transition-transform ${
                          dropdownOpen
                            ? "lg:-rotate-90 duration-100 ease-in"
                            : ""
                        }`}
                      />
                    </span>
                  </button>
                  {dropdownOpen && (
                    <ul className="absolute right-0 mt-6 w-36 bg-white shadow-xl rounded-xl text-black ">
                      {userInfo.isAdmin && (
                        <>
                          <li>
                            <Link
                              to="/admin/dashboard"
                              className="block w-full text-center px-4 py-2 hover:bg-teal-800 hover:text-white text-sm uppercase hover:font-bold"
                              onClick={toggleDropdown}
                            >
                              Dashboard
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/admin/productlist"
                              className="block w-full text-center px-4 py-2 hover:bg-teal-800 hover:text-white text-sm uppercase hover:font-bold"
                              onClick={toggleDropdown}
                            >
                              Products
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/admin/categorylist"
                              className="block w-full text-center px-4 py-2 hover:bg-teal-800 hover:text-white text-sm uppercase hover:font-bold"
                              onClick={toggleDropdown}
                            >
                              Category
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/admin/orderlist"
                              className="block w-full text-center px-4 py-2 hover:bg-teal-800 hover:text-white text-sm uppercase hover:font-bold"
                              onClick={toggleDropdown}
                            >
                              Orders
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/admin/userlist"
                              className="block w-full text-center px-4 py-2 hover:bg-teal-800 hover:text-white text-sm uppercase hover:font-bold"
                              onClick={toggleDropdown}
                            >
                              Users
                            </Link>
                          </li>
                        </>
                      )}
                      <li>
                        <Link
                          to="/profile"
                          className="block w-full text-center px-4 py-3 hover:bg-teal-800 hover:text-white text-sm uppercase hover:font-bold"
                          onClick={toggleDropdown}
                        >
                          Profile
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={logoutHandler}
                          className="block w-full text-center px-4 py-2 hover:bg-teal-800 hover:text-white text-sm uppercase hover:font-bold"
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              )}
              {!userInfo && (
                <>
                  <li className="ml-10 pt-1 cursor-pointer block capitalize text-xs font-bold duration-200 ease-out hover:scale-105 tracking-wider">
                    <FaUserAlt size={14} className="ml-3" />
                    <Link to="/login">
                      {" "}
                      <div className="text-xs">profile</div>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
          <button
            className="text-3xl md:hidden cursor-pointer"
            onClick={toggleSidebar}
          >
            &#9776;
          </button>
        </div>
      </div>
      {showSidebar && (
        <div
          className="md:hidden fixed left-0 top-0 w-full h-full bg-black/70 backdrop-blur"
          onClick={closeSidebar}
        >
          <div className="fixed left-0 top-0 w-full max-w-sm h-full bg-white p-6 ease-in duration-500 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <Link to="/" onClick={closeSidebar}>
                <img
                  src="../assets/logo.png"
                  alt="The Fashionisto"
                  className="w-auto h-5 tracking-wider cursor-pointer"
                />
              </Link>
              <button
                onClick={closeSidebar}
                className="text-4xl cursor-pointer focus:outline-none"
              >
                &times;
              </button>
            </div>
            <ul className="flex-1 flex flex-col items-start space-y-4">
              <li onClick={closeSidebar} className="cursor-pointer">
                <Link to="/" className="text-2xl">
                  Home
                </Link>
              </li>
              <li onClick={closeSidebar} className="cursor-pointer">
                <Link to="/shop" className="text-2xl">
                  Shop
                </Link>
              </li>
              <li onClick={closeSidebar} className="cursor-pointer">
                <Link to="/cart" className="text-2xl">
                  Cart
                </Link>
              </li>
              <li onClick={closeSidebar} className="cursor-pointer">
                <Link to="/favorite" className="text-2xl">
                  Favorites
                </Link>
              </li>
              {!userInfo && (
                <>
                  <li onClick={closeSidebar} className="cursor-pointer">
                    <Link to="/login" className="text-2xl">
                      Login
                    </Link>
                  </li>
                  <li onClick={closeSidebar} className="cursor-pointer">
                    <Link to="/register" className="text-2xl">
                      Register
                    </Link>
                  </li>
                </>
              )}
              {userInfo && (
                <>
                  <li onClick={closeSidebar} className="cursor-pointer">
                    <Link to="/profile" className="text-2xl">
                      Profile
                    </Link>
                  </li>
                  <li onClick={closeSidebar} className="cursor-pointer">
                    <button onClick={logoutHandler} className="text-2xl">
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
