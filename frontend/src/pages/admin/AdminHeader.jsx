import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { FaSearch, FaBell, FaExclamationCircle, FaBoxOpen, FaClipboardList } from "react-icons/fa";
import { useGetOrdersQuery } from "../../redux/api/orderApiSlice";
import { useAllProductsQuery } from "../../redux/api/productApiSlice";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLogoutMutation } from "../../redux/api/userApiSlice";
import { logout } from "../../redux/features/auth/authSlice";

const AdminHeader = ({ title, subtitle, children }) => {
    const { userInfo } = useSelector((state) => state.auth);
    const { data: allOrders } = useGetOrdersQuery();
    const { data: allProducts } = useAllProductsQuery();

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

    const [showNotifications, setShowNotifications] = useState(false);
    // Use lastReadCount to persist the distinct count of notifications user has seen
    const [lastReadCount, setLastReadCount] = useState(
        parseInt(localStorage.getItem("adminNotificationReadCount") || "0")
    );

    const dropdownRef = useRef(null);

    // Calculate Stats for Notifications
    const pendingOrders = allOrders?.filter((o) => o.orderStatus === "Pending" || (!o.isDelivered && !o.isPaid)).length || 0;
    const lowStockCount = allProducts?.filter((p) => p.countInStock < 10).length || 0;

    const notificationCount = pendingOrders + lowStockCount;
    // Show badge only if we have MORE notifications than what we last read
    const showBadge = notificationCount > lastReadCount;

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAsRead = () => {
        setLastReadCount(notificationCount);
        localStorage.setItem("adminNotificationReadCount", notificationCount);
        setShowNotifications(false);
    };

    return (
        <div className="flex justify-between items-center py-6 px-8 bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
            <div>
                <h1 className="text-3xl font-serif font-bold text-gray-900">{title}</h1>
                {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
            </div>

            <div className="flex items-center gap-6">
                {/* Optional Search / Filters area passed as children if needed */}
                {children && <div className="mr-4 text-gray-600">{children}</div>}

                <div className="relative" ref={dropdownRef}>
                    <button
                        className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <FaBell size={24} />
                        {showBadge && notificationCount > 0 && (
                            <span className="absolute top-1 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all duration-200 origin-top-right">
                            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-bold text-gray-700">Notifications</h3>
                                {showBadge && notificationCount > 0 && (
                                    <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-bold">{notificationCount - lastReadCount > 0 ? 'New' : notificationCount}</span>
                                )}
                            </div>

                            <div className="max-h-96 overflow-y-auto">
                                {notificationCount === 0 || !showBadge ? (
                                    <div className="p-6 text-center text-gray-500 text-sm">
                                        <div className="bg-gray-100 p-3 rounded-full inline-block mb-2">
                                            <FaBell className="text-gray-300 text-xl" />
                                        </div>
                                        <p>No new notifications</p>
                                    </div>
                                ) : (
                                    <>
                                        {pendingOrders > 0 && (
                                            <Link
                                                to="/admin/orderList"
                                                className="block p-4 hover:bg-[#649899]/10 transition-colors border-b border-gray-50"
                                                onClick={() => setShowNotifications(false)}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-[#649899]/20 text-[#649899] rounded-lg mt-1">
                                                        <FaClipboardList />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800 text-sm">Pending Orders</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Ordering processing required for {pendingOrders} orders.
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        )}

                                        {lowStockCount > 0 && (
                                            <Link
                                                to="/admin/allProductsList"
                                                className="block p-4 hover:bg-red-50 transition-colors"
                                                onClick={() => setShowNotifications(false)}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-red-100 text-red-600 rounded-lg mt-1">
                                                        <FaExclamationCircle />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800 text-sm">Low Stock Alert</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {lowStockCount} items are running low on stock. Restock soon.
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>

                            {showBadge && notificationCount > 0 && (
                                <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                                    <button
                                        onClick={markAsRead}
                                        className="text-xs font-semibold text-[#649899] hover:text-[#4A7A7B]"
                                    >
                                        Clear Notifications
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div
                    className="relative min-w-[160px] h-[50px] cursor-pointer"
                    onMouseEnter={() => setShowNotifications(false)} // Optional: close notifications if open
                >
                    <motion.div
                        className="w-full h-full"
                        initial="initial"
                        whileHover="hover"
                    >
                        <div className="relative w-full h-full">
                            {/* User Profile (Default) */}
                            <motion.div
                                className="absolute inset-0 flex items-center gap-3 px-2"
                                variants={{
                                    initial: { opacity: 1, y: 0 },
                                    hover: { opacity: 0, y: -20 }
                                }}
                                transition={{ duration: 0.3 }}
                            >
                                {userInfo?.image ? (
                                    <div className="h-10 w-10 relative rounded-full overflow-hidden border border-gray-200 shadow-md">
                                        <img src={userInfo.image} alt={userInfo.username} className="w-full h-full object-cover transform scale-150" />
                                    </div>
                                ) : (
                                    <div className="h-10 w-10 bg-gradient-to-tr from-[#649899] to-[#4A7A7B] rounded-full flex items-center justify-center text-white font-bold shadow-md uppercase">
                                        {userInfo?.username?.charAt(0) || 'A'}
                                    </div>
                                )}
                                <div className="hidden md:block">
                                    <p className="text-sm font-semibold text-gray-800 capitalize truncate max-w-[100px]">{userInfo?.username || 'Admin'}</p>
                                    <p className="text-xs text-gray-500">
                                        {userInfo?.isSuperAdmin ? "Super Admin" : (userInfo?.isAdmin ? "Administrator" : "User")}
                                    </p>
                                </div>
                            </motion.div>

                            {/* Logout Button (Hover) */}
                            <motion.button
                                onClick={logoutHandler}
                                className="absolute inset-0 flex items-center gap-3 px-2 w-full h-full bg-white"
                                variants={{
                                    initial: { opacity: 0, y: 20, pointerEvents: "none" },
                                    hover: { opacity: 1, y: 0, pointerEvents: "auto" }
                                }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="h-10 w-10 bg-gradient-to-tr from-[#649899] to-[#4A7A7B] rounded-full flex items-center justify-center text-white shadow-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-semibold text-gray-800">Logout</p>
                                    <p className="text-xs text-gray-500">See you later</p>
                                </div>
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AdminHeader;
