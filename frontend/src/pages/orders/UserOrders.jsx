import Message from "../../components/message";
import Loader from "../../components/loader";
import { Link } from "react-router-dom";
import { useGetMyOrdersQuery } from "../../redux/api/orderApiSlice";

const UserOrders = () => {
    const { data: orders, isLoading, error } = useGetMyOrdersQuery();

    return (
        <div className="container mx-auto px-4 py-8 mt-24">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 uppercase tracking-wide border-b pb-4">My Orders</h2>

            {isLoading ? (
                <Loader />
            ) : error ? (
                <Message variant="danger">{error?.data?.error || error.error}</Message>
            ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100/50 text-gray-600 text-xs uppercase tracking-wider">
                                <th className="p-4 font-semibold border-b">Image</th>
                                <th className="p-4 font-semibold border-b">Order ID</th>
                                <th className="p-4 font-semibold border-b">Date</th>
                                <th className="p-4 font-semibold border-b">Total</th>
                                <th className="p-4 font-semibold border-b">Paid</th>
                                <th className="p-4 font-semibold border-b">Delivered</th>
                                <th className="p-4 font-semibold border-b">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50 transition-colors text-sm text-gray-700">
                                    <td className="p-4 border-b">
                                        <img
                                            src={order.orderItems[0].image}
                                            alt={order.user}
                                            className="w-16 h-16 object-cover rounded-md border border-gray-200"
                                        />
                                    </td>
                                    <td className="p-4 border-b font-mono text-xs font-bold text-[#649899]">{order.orderId}</td>
                                    <td className="p-4 border-b">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 border-b font-semibold">₹ {order.totalPrice}</td>
                                    <td className="p-4 border-b">
                                        {order.isPaid ? (
                                            <span className="px-2 py-1 text-xs font-bold text-green-700 bg-green-100 rounded-full">
                                                Completed
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs font-bold text-red-700 bg-red-100 rounded-full">
                                                Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 border-b">
                                        {order.isDelivered ? (
                                            <span className="px-2 py-1 text-xs font-bold text-green-700 bg-green-100 rounded-full">
                                                Delivered
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs font-bold text-yellow-700 bg-yellow-100 rounded-full">
                                                Processing
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 border-b">
                                        <Link to={`/order/${order._id}`}>
                                            <button className="text-xs font-bold text-[#649899] hover:text-[#436e6f] hover:underline uppercase transition-colors">
                                                View Details
                                            </button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {orders.length === 0 && (
                        <div className="p-10 text-center text-gray-500">
                            You have no orders yet.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserOrders;
