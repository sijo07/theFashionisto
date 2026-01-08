import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaBoxOpen, FaClipboardList, FaUsers, FaLayerGroup, FaSignOutAlt, FaTimes, FaBars, FaGem } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { useLogoutMutation } from "../../redux/api/userApiSlice";
import { logout } from "../../redux/features/auth/authSlice";

const AdminMenu = () => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [logoutApiCall] = useLogoutMutation();

    const logoutHandler = async () => {
        try {
            await logoutApiCall().unwrap();
            dispatch(logout());
            navigate("/login");
        } catch (error) {
            console.error(error);
        }
    };

    const toggleSidebar = () => setIsExpanded(!isExpanded);
    const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

    const menuItems = [
        { path: "/admin/dashboard", name: "Dashboard", icon: <FaTachometerAlt /> },
        { path: "/admin/productList", name: "Products", icon: <FaBoxOpen /> },
        { path: "/admin/categoryList", name: "Categories", icon: <FaLayerGroup /> },
        { path: "/admin/orderList", name: "Orders", icon: <FaClipboardList /> },
        { path: "/admin/userList", name: "Users", icon: <FaUsers /> },
        // { path: "/admin/inventory", name: "Inventory", icon: <FaGem /> }, // Example if needed
    ];

    const logoVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    const textVariants = {
        hidden: { width: 0, opacity: 0 },
        visible: { width: "auto", opacity: 1, transition: { duration: 0.5 } }
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-[#050505] border-r border-zinc-900 shadow-2xl relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-96 bg-red-900/5 blur-[80px] pointer-events-none" />

            {/* Logo Section */}
            <div className={`p-8 border-b border-zinc-900/50 flex items-center ${!isExpanded ? 'justify-center' : 'justify-between'}`}>
                <Link to="/" className="group flex flex-col justify-center">
                    <motion.div
                        initial="hidden" animate="visible" variants={logoVariants}
                        className="flex items-center gap-1"
                    >
                        {/* Icon Logo visible only when collapsed */}
                        {!isExpanded && (
                            <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-black text-xl rounded-sm shadow-xl shadow-white/10 group-hover:scale-105 transition-transform duration-300">
                                T
                            </div>
                        )}

                        {isExpanded && (
                            <motion.div variants={textVariants} className="flex flex-col overflow-hidden whitespace-nowrap">
                                <span className="text-[10px] font-black text-white tracking-[0.4em] leading-none font-cinzel mb-1 pl-1">THE</span>
                                <span className="text-2xl font-bold text-red-500 tracking-wider leading-none font-italiana drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">FASHIONISTO</span>
                            </motion.div>
                        )}
                    </motion.div>
                </Link>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto scrollbar-hide">
                <p className={`text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-4 mb-4 ${!isExpanded && 'text-center'}`}>
                    {isExpanded ? 'Management' : '•'}
                </p>
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${isActive
                                ? "bg-zinc-900 text-white shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                                : "text-zinc-500 hover:text-white hover:bg-zinc-900/50"
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-full" />}
                                <span className={`text-lg transition-colors ${isActive ? "text-red-500" : "group-hover:text-red-500"}`}>{item.icon}</span>
                                {isExpanded && (
                                    <span className="text-xs font-bold uppercase tracking-wider">{item.name}</span>
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User / Logout */}
            <div className="p-4 border-t border-zinc-900 bg-zinc-950/50">
                <button
                    onClick={() => navigate("/")}
                    className={`nav-item w-full flex items-center ${isExpanded ? 'gap-4 px-4 justify-start' : 'justify-center'} py-3.5 text-zinc-500 hover:text-red-500 hover:bg-zinc-900/50 rounded-xl transition-all duration-300 group`}
                >
                    <FaSignOutAlt className="text-lg group-hover:rotate-180 transition-transform duration-500" />
                    {isExpanded && <span className="text-xs font-bold uppercase tracking-wider">Exit Panel</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className={`hidden md:flex flex-col h-screen transition-all duration-500 ease-in-out ${isExpanded ? 'w-72' : 'w-24'}`}>
                <SidebarContent />
                {/* Toggle Button */}
                <button
                    onClick={toggleSidebar}
                    className="absolute top-8 left-64 z-50 w-6 h-6 bg-zinc-800 text-zinc-400 rounded-full flex items-center justify-center hover:text-white hover:bg-red-600 transition-all shadow-lg"
                    style={{ left: isExpanded ? '17rem' : '5rem' }}
                >
                    <div className={`w-1.5 h-1.5 bg-current rounded-full transition-all ${isExpanded ? 'scale-100' : 'scale-75'}`} />
                </button>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-black/90 backdrop-blur-lg border-t border-zinc-900 pb-safe">
                <div className="grid grid-cols-6 h-16 w-full">
                    {menuItems.slice(0, 5).map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <span className={`text-lg ${isActive ? 'text-red-500' : ''}`}>{item.icon}</span>
                                    <span className="text-[7px] font-bold uppercase tracking-widest">{item.name}</span>
                                </>
                            )}
                        </NavLink>
                    ))}

                    <button
                        onClick={() => navigate("/")}
                        className="flex flex-col items-center justify-center w-full h-full space-y-1 text-zinc-500 hover:text-red-500"
                    >
                        <span className="text-lg"><FaSignOutAlt /></span>
                        <span className="text-[7px] font-bold uppercase tracking-widest">Exit</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default AdminMenu;
