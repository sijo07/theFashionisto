import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";

const AdminMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <div className="py-4">
        <button
          className={`fixed p-2 rounded-full bg-teal-900 text-white cursor-pointer${
            isMenuOpen ? "top-2 right-7" : "top-5 right-7 "
          }`}
          onClick={toggleMenu}
        >
          {isMenuOpen ? (
            <FaTimes size={12} />
          ) : (
            <>
              <GiHamburgerMenu size={12} />
            </>
          )}
        </button>
      </div>
      {isMenuOpen && (
        <section className="bg-teal-900 p-4 fixed overflow right-14 rounded-lg shadow-lg">
          <ul className="list-none mt-2">
            <li>
              <NavLink
                exact
                to="/admin/dashboard"
                className="block py-2 px-4 mb-2 text-white rounded-lg"
                style={({ isActive }) => ({
                  backgroundColor: isActive ? "teal" : "",
                })}
              >
                Admin Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                exact
                to="/admin/categoryList"
                className="block py-2 px-4 mb-2 text-white rounded-lg hover:bg-[#649899]"
                style={({ isActive }) => ({
                  backgroundColor: isActive ? "teal" : "",
                })}
              >
                Create Category
              </NavLink>
            </li>
            <li>
              <NavLink
                exact
                className="block py-2 px-4 mb-2 text-white rounded-lg hover:bg-[#649899]"
                to="/admin/productlist"
                style={({ isActive }) => ({
                  backgroundColor: isActive ? "teal" : "",
                })}
              >
                Create Product
              </NavLink>
            </li>
            <li>
              <NavLink
                exact
                className="block py-2 px-4 mb-2 text-white rounded-lg hover:bg-[#649899]"
                to="/admin/allProductsList"
                style={({ isActive }) => ({
                  backgroundColor: isActive ? "teal" : "",
                })}
              >
                All Products
              </NavLink>
            </li>
            <li>
              <NavLink
                exact
                className="block py-2 px-4 mb-2 text-white rounded-lg hover:bg-[#649899]"
                to="/admin/userList"
                style={({ isActive }) => ({
                  backgroundColor: isActive ? "teal" : "",
                })}
              >
                Manage Users
              </NavLink>
            </li>
            <li>
              <NavLink
                exact
                className="block py-2 px-4 mb-2 text-white rounded-lg hover:bg-[#649899]"
                to="/admin/orderList"
                style={({ isActive }) => ({
                  backgroundColor: isActive ? "teal" : "",
                })}
              >
                Manage Orders
              </NavLink>
            </li>
          </ul>
        </section>
      )}
    </>
  );
};

export default AdminMenu;
