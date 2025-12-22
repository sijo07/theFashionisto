import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart, recalculatePrice } from "../redux/features/cart/cartSlice";
import { addToFavorites } from "../redux/features/favorites/favoriteSlice";
import { useState, useEffect } from "react";
import { FaTimes, FaChevronDown } from "react-icons/fa";

const CartPopup = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const cart = useSelector((state) => state.cart);
    const { cartItems } = cart;

    const [qtyModalOpen, setQtyModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [tempQty, setTempQty] = useState(1);

    const addToCartHandler = (product, qty) => {
        if (qty > 0 && qty <= product.countInStock) {
            dispatch(addToCart({ ...product, qty }));
        }
    };

    const handleRemove = (item) => {
        dispatch(removeFromCart({ _id: item._id, size: item.size }));
    };

    const checkoutHandler = () => {
        onClose();
        navigate("/login?redirect=/shipping");
    };

    const openQtySelector = (item) => {
        setEditingItem(item);
        setTempQty(item.qty);
        setQtyModalOpen(true);
    };

    const handleQtyConfirm = () => {
        if (editingItem) {
            addToCartHandler(editingItem, tempQty);
            setQtyModalOpen(false);
            setEditingItem(null);
        }
    };

    useEffect(() => {
        dispatch(recalculatePrice());
    }, [cartItems, dispatch]);

    const totalMRP = cartItems.reduce(
        (acc, item) => {
            const price = Number(item.price);
            const offer = Number(item.offer) || 0;
            const higher = Math.max(price, offer || 0);
            return acc + higher * (Number(item.qty) || 1);
        },
        0
    );

    const totalAmount = cartItems.reduce((acc, item) => {
        const price = Number(item.price);
        const offer = Number(item.offer) || 0;
        const lower = (offer && offer < price) ? offer : price;
        return acc + lower * (Number(item.qty) || 1);
    }, 0);

    const totalDiscount = totalMRP - totalAmount;

    if (!isOpen) return null;

    return (
        <div className="absolute top-full right-[-2rem] sm:right-[-6rem] mt-4 w-[90vw] sm:w-[400px] bg-white border border-gray-200 rounded-lg shadow-2xl z-50 overflow-hidden font-sans">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Shopping Cart ({cartItems.reduce((acc, item) => acc + item.qty, 0)})</h3>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
                {cartItems.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-400 mb-4 capitalize">Your cart is empty</p>
                        <Link
                            to="/shop"
                            className="text-[#00a550] font-bold hover:underline"
                            onClick={onClose}
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {cartItems.map((item) => (
                            <div key={`${item._id}-${item.size}`} className="flex gap-4 relative group">
                                {/* Image */}
                                <div className="w-20 h-24 flex-shrink-0">
                                    <img
                                        src={item.image?.url || item.image}
                                        alt={item.brand}
                                        className="w-full h-full object-cover rounded shadow-sm border border-gray-100"
                                    />
                                </div>

                                {/* Details */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{item.brand}</h4>
                                        <button
                                            onClick={() => handleRemove(item)}
                                            className="text-gray-400 hover:text-red-500 text-xs font-semibold px-2 py-1 rounded bg-gray-50 hover:bg-red-50 transition-colors border border-gray-200"
                                        >
                                            Remove
                                        </button>
                                    </div>

                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                                    <p className="text-xs font-bold text-gray-400 mt-1">Size: <span className="text-black">{item.size}</span></p>

                                    <div className="flex justify-between items-end mt-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500 font-semibold">Qty:</span>
                                            <button
                                                onClick={() => openQtySelector(item)}
                                                className="flex items-center gap-1 text-xs border border-gray-300 rounded px-2 py-1 bg-gray-50 hover:border-[#00a550] transition-colors"
                                            >
                                                <span className="font-bold">{item.qty}</span>
                                                <FaChevronDown size={8} className="text-gray-500" />
                                            </button>
                                        </div>

                                        <div className="text-right">
                                            <span className="block font-bold text-[#649899]">
                                                ₹{(item.offer && Number(item.offer) < Number(item.price)) ? item.offer : item.price}
                                            </span>
                                            {Math.max(Number(item.price), Number(item.offer) || 0) > ((item.offer && Number(item.offer) < Number(item.price)) ? Number(item.offer) : Number(item.price)) && (
                                                <span className="text-xs text-gray-400 line-through">
                                                    ₹{Math.max(Number(item.price), Number(item.offer) || 0)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {cartItems.length > 0 && (
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 mb-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Price Details</h4>
                        <div className="flex justify-between text-sm mb-1 text-gray-600">
                            <span>Total MRP</span>
                            <span>₹{totalMRP.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2 text-green-600">
                            <span>Discount</span>
                            <span>- ₹{totalDiscount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-base border-t border-dashed border-gray-200 pt-2 text-gray-900">
                            <span>Total Amount</span>
                            <span>₹{totalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        onClick={checkoutHandler}
                        className="w-full bg-[#00a550] hover:bg-[#008f45] text-white py-3 rounded-lg font-bold text-sm tracking-wide uppercase transition-all shadow-md hover:shadow-lg transform active:scale-95"
                    >
                        Checkout
                    </button>
                    <button onClick={onClose} className="w-full text-center text-xs text-gray-500 mt-2 hover:underline">
                        Continue Shopping
                    </button>
                </div>
            )}

            {/* Quantity Selector Modal - Moved Inside and Positioned Absolute */}
            {qtyModalOpen && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/10 backdrop-blur-[1px]" onClick={() => setQtyModalOpen(false)}>
                    <div className="bg-white rounded-lg shadow-2xl p-6 w-[280px] border border-gray-100 animate-scale-in" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="font-bold text-gray-800 text-md">Select Quantity</h4>
                            <button onClick={() => setQtyModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <FaTimes size={16} />
                            </button>
                        </div>

                        <div className="grid grid-cols-5 gap-3 mb-6">
                            {[...Array(10).keys()].map(x => (
                                <button
                                    key={x + 1}
                                    disabled={(x + 1) > (editingItem?.countInStock || 10)}
                                    onClick={() => setTempQty(x + 1)}
                                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all border
                    ${(x + 1) === tempQty
                                            ? "border-[#00a550] text-[#00a550] border-2 bg-white"
                                            : (x + 1) > (editingItem?.countInStock || 10)
                                                ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                                                : "bg-white border-gray-300 text-gray-600 hover:border-[#00a550]"}
                  `}
                                >
                                    {x + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleQtyConfirm}
                            className="w-full bg-[#649899] hover:bg-[#538283] text-white py-3 rounded font-bold uppercase tracking-wide transition-colors"
                        >
                            DONE
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPopup;
