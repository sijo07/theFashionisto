import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import {
    FaBell, FaExclamationCircle, FaClipboardList,
    FaSearch, FaChevronDown, FaSignOutAlt, FaUserShield
} from "react-icons/fa";
import { useGetOrdersQuery } from "../../redux/api/orderApiSlice";
import { useAllProductsQuery } from "../../redux/api/productApiSlice";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useLogoutMutation } from "../../redux/api/userApiSlice";
import { logout } from "../../redux/features/auth/authSlice";

const AdminHeader = ({ title, subtitle, children }) => {
    const { userInfo } = useSelector((state) => state.auth);
    const { data: allOrders } = useGetOrdersQuery();
    const { data: allProducts } = useAllProductsQuery();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [logoutApiCall] = useLogoutMutation();

    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [lastReadCount, setLastReadCount] = useState(
        parseInt(localStorage.getItem("adminNotificationReadCount") || "0")
    );

    const dropdownRef = useRef(null);
    const userMenuRef = useRef(null);

    const pendingOrders = allOrders?.filter((o) => o.orderStatus === "Pending" || (!o.isDelivered && !o.isPaid)).length || 0;
    const lowStockCount = allProducts?.filter((p) => p.countInStock < 10).length || 0;
    const notificationCount = pendingOrders + lowStockCount;
    const hasNew = notificationCount > lastReadCount;

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowNotifications(false);
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const logoutHandler = async () => {
        try {
            await logoutApiCall().unwrap();
            dispatch(logout());
            navigate("/login");
        } catch (error) {
            console.error(error);
        }
    };

    const markAsRead = () => {
        setLastReadCount(notificationCount);
        localStorage.setItem("adminNotificationReadCount", notificationCount);
        setShowNotifications(false);
    };

    const breadcrumbs = location.pathname.split('/').filter(x => x).map(p => p.charAt(0).toUpperCase() + p.slice(1));

    return (
        <header className="sticky top-0 z-50 w-full bg-[#050505] border-b border-zinc-800 flex items-center justify-between px-6 py-4 lg:px-8">
            <div className="flex flex-col">
                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    <span className="hover:text-red-500 cursor-pointer transition-colors">Admin</span>
                    {breadcrumbs.map((b, i) => (
                        <span key={i} className="flex items-center gap-2">
                            <span className="text-zinc-700">/</span>
                            <span className={i === breadcrumbs.length - 1 ? "text-red-500" : "text-zinc-400"}>{b}</span>
                        </span>
                    ))}
                </div>
                <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">{title}</h1>
                {subtitle && <p className="text-xs text-zinc-400 font-medium">{subtitle}</p>}
            </div>

            <div className="flex items-center gap-4 lg:gap-8">
                {/* Search / Contextual Actions */}
                <div className="hidden md:flex items-center gap-4">
                    {children}
                </div>

                <div className="flex items-center gap-4 lg:gap-6 border-l border-zinc-800 pl-4 lg:pl-6">

                    {/* Notification System */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className={`p-2 rounded-md transition-all duration-200 relative
                                ${showNotifications ? 'text-red-500 bg-zinc-900' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
                        >
                            <FaBell />
                            {hasNew && notificationCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full border border-black"></span>
                            )}
                        </button>

                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-4 w-[320px] bg-zinc-900 rounded-md shadow-2xl border border-zinc-800 overflow-hidden"
                                >
                                    <div className="p-4 bg-black/40 border-b border-zinc-800 flex justify-between items-center">
                                        <h3 className="font-bold text-xs uppercase tracking-wider text-white">System Alerts</h3>
                                        <span className="bg-red-900/30 text-red-500 text-[10px] px-2 py-0.5 rounded border border-red-900/50 font-bold">
                                            {notificationCount} New
                                        </span>
                                    </div>

                                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                        {notificationCount === 0 ? (
                                            <div className="p-8 text-center space-y-2">
                                                <FaBell className="mx-auto text-zinc-700" size={20} />
                                                <p className="text-xs text-zinc-400 font-medium">All systems operational</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-zinc-800">
                                                {pendingOrders > 0 && (
                                                    <Link to="/admin/orderList" onClick={markAsRead} className="flex gap-4 p-4 hover:bg-zinc-800 transition-colors group">
                                                        <div className="w-8 h-8 rounded bg-amber-900/20 text-amber-500 flex items-center justify-center shrink-0 border border-amber-900/30">
                                                            <FaClipboardList />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-zinc-200 group-hover:text-amber-500 transition-colors">Pending Orders</p>
                                                            <p className="text-[10px] text-zinc-400 mt-0.5">{pendingOrders} awaiting process</p>
                                                        </div>
                                                    </Link>
                                                )}
                                                {lowStockCount > 0 && (
                                                    <Link to="/admin/allProductsList" onClick={markAsRead} className="flex gap-4 p-4 hover:bg-zinc-800 transition-colors group">
                                                        <div className="w-8 h-8 rounded bg-red-900/20 text-red-500 flex items-center justify-center shrink-0 border border-red-900/30">
                                                            <FaExclamationCircle />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-zinc-200 group-hover:text-red-500 transition-colors">Low Inventory</p>
                                                            <p className="text-[10px] text-zinc-400 mt-0.5">{lowStockCount} items critical</p>
                                                        </div>
                                                    </Link>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {notificationCount > 0 && (
                                        <button onClick={markAsRead} className="w-full py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-zinc-800 border-t border-zinc-800 transition-colors">
                                            Clear All
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* User Profile System */}
                    <div className="relative" ref={userMenuRef}>
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-3 p-1.5 pr-3 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-all border border-zinc-800 group"
                        >
                            <div className="w-8 h-8 rounded-full border border-zinc-700 group-hover:border-red-500 transition-colors overflow-hidden">
                                {userInfo?.image ? (
                                    <img src={userInfo.image} alt={userInfo.username} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-400 font-bold text-xs uppercase">
                                        {userInfo?.username?.charAt(0) || 'A'}
                                    </div>
                                )}
                            </div>
                            <div className="hidden lg:block text-left">
                                <p className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors capitalize">{userInfo?.username || 'Admin'}</p>
                            </div>
                            <FaChevronDown size={10} className={`text-zinc-400 transition-transform duration-300 ml-1 ${showUserMenu ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {showUserMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-4 w-56 bg-zinc-900 rounded-md shadow-2xl border border-zinc-800 overflow-hidden"
                                >
                                    <div className="p-4 bg-black/40 border-b border-zinc-800">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-teal-900/20 text-teal-500 flex items-center justify-center border border-teal-900/30">
                                                <FaUserShield size={14} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold uppercase text-white leading-none">Admin Portal</p>
                                                <p className="text-[10px] text-zinc-400 mt-1">Secure Session</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-2">
                                        <Link to="/profile" className="flex items-center gap-3 p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors text-xs font-bold uppercase tracking-wide">
                                            <FaUserShield /> Profile
                                        </Link>
                                        <button
                                            onClick={logoutHandler}
                                            className="w-full flex items-center gap-3 p-2 text-red-500 hover:bg-zinc-800 rounded transition-colors text-xs font-bold uppercase tracking-wide"
                                        >
                                            <FaSignOutAlt /> Sign Out
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
