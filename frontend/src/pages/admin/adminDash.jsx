import { useState } from "react";
import Chart from "react-apexcharts";
import { FaUsers, FaBoxOpen, FaShoppingCart, FaArrowUp, FaArrowRight, FaTimes } from "react-icons/fa";
import { useGetUsersQuery } from "../../redux/api/userApiSlice";
import { useGetTotalSalesQuery, useGetTotalOrdersQuery, useGetOrdersQuery, useGetTotalSalesByDateQuery } from "../../redux/api/orderApiSlice";
import { useAllProductsQuery } from "../../redux/api/productApiSlice";
import AdminHeader from "./AdminHeader";
import { Link } from "react-router-dom";
import moment from "moment";
import Loader from "../../components/loader";

const AdminDash = () => {
  const { data: sales, isLoading: salesLoading } = useGetTotalSalesQuery();
  const { data: customers, isLoading: customersLoading } = useGetUsersQuery();
  const { data: orders, isLoading: ordersLoading } = useGetTotalOrdersQuery();
  const { data: allOrders, isLoading: allOrdersLoading } = useGetOrdersQuery();
  const { data: allProducts, isLoading: allProductsLoading } = useAllProductsQuery();
  const { data: salesDetail } = useGetTotalSalesByDateQuery();

  const [showAnalytics, setShowAnalytics] = useState(false);

  // Helper to calculate percentage change
  const calculateChange = (current, previous) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const percent = ((current - previous) / previous) * 100;
    return `${percent > 0 ? "+" : ""}${percent.toFixed(1)}%`;
  };

  // --- Real Trend Calculations ---
  // 1. Revenue & Orders Trend
  let currentMonthSales = 0;
  let lastMonthSales = 0;
  let currentMonthOrders = 0;
  let lastMonthOrders = 0;

  if (allOrders) {
    const currentMonth_Start = moment().startOf('month');
    const lastMonth_Start = moment().subtract(1, 'month').startOf('month');
    const lastMonth_End = moment().subtract(1, 'month').endOf('month');

    allOrders.forEach(order => {
      const orderDate = moment(order.createdAt);
      if (orderDate.isAfter(currentMonth_Start)) {
        currentMonthSales += order.totalPrice;
        currentMonthOrders += 1;
      } else if (orderDate.isBetween(lastMonth_Start, lastMonth_End)) {
        lastMonthSales += order.totalPrice;
        lastMonthOrders += 1;
      }
    });
  }

  // 2. Customers Trend
  let newCustomersThisMonth = 0;
  let newCustomersLastMonth = 0;
  if (customers) {
    const currentMonth_Start = moment().startOf('month');
    const lastMonth_Start = moment().subtract(1, 'month').startOf('month');
    const lastMonth_End = moment().subtract(1, 'month').endOf('month');

    customers.forEach(user => {
      if (!user.isAdmin) {
        const userDate = moment(user.createdAt);
        if (userDate.isAfter(currentMonth_Start)) {
          newCustomersThisMonth += 1;
        } else if (userDate.isBetween(lastMonth_Start, lastMonth_End)) {
          newCustomersLastMonth += 1;
        }
      }
    });
  }

  // 3. Products Added This Week
  let productsAddedThisWeek = 0;
  if (allProducts) {
    const weekStart = moment().startOf('week');
    productsAddedThisWeek = allProducts.filter(p => moment(p.createdAt).isAfter(weekStart)).length;
  }

  // --- Top Selling Products Calculation ---
  const getTopSellingProducts = () => {
    if (!allOrders || !allProducts) return [];

    const productSales = {}; // { productId: totalQty }

    allOrders.forEach(order => {
      if (order.isPaid) { // Only count paid orders
        order.orderItems.forEach(item => {
          const pId = item.product || item._id; // Handle populated vs unpopulated
          productSales[pId] = (productSales[pId] || 0) + item.qty;
        });
      }
    });

    return Object.entries(productSales)
      .map(([id, qty]) => {
        const product = allProducts.find(p => p._id === id);
        return product ? { ...product, salesCount: qty } : null;
      })
      .filter(p => p !== null)
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 5);
  };

  const topProducts = getTopSellingProducts();
  const recentOrders = allOrders ? [...allOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5) : [];

  const stats = [
    {
      title: "Total Revenue",
      value: salesLoading ? "..." : `₹${sales?.totalSales?.toLocaleString('en-IN')}`,
      trend: `${calculateChange(currentMonthSales, lastMonthSales)} from last month`,
      icon: <span className="text-xl font-bold">₹</span>,
      bg: "bg-yellow-50",
      text: "text-yellow-600",
      trendColor: currentMonthSales >= lastMonthSales ? "text-green-500" : "text-red-500"
    },
    {
      title: "Total Orders",
      value: ordersLoading ? "..." : orders?.totalOrders,
      trend: `${calculateChange(currentMonthOrders, lastMonthOrders)} from last month`,
      icon: <FaShoppingCart />,
      bg: "bg-[#649899]/10",
      text: "text-[#649899]",
      trendColor: currentMonthOrders >= lastMonthOrders ? "text-green-500" : "text-red-500"
    },
    {
      title: "Products",
      value: allProductsLoading ? "..." : allProducts?.length,
      trend: `${productsAddedThisWeek} added this week`,
      icon: <FaBoxOpen />,
      bg: "bg-amber-50",
      text: "text-amber-600",
      trendColor: "text-gray-500"
    },
    {
      title: "Customers",
      value: customersLoading ? "..." : customers?.filter(u => !u.isAdmin).length?.toLocaleString(),
      trend: `+${newCustomersThisMonth} new this month`,
      icon: <FaUsers />,
      bg: "bg-[#649899]/10",
      text: "text-[#649899]",
      trendColor: "text-green-500"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-900">
      <AdminHeader title="Overview" subtitle="Here's what's happening with your store today.">
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-gray-600 border border-gray-100 hidden md:block">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </AdminHeader>

      <div className="p-8 max-w-[1600px] mx-auto space-y-8">

        {/* 1. Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                  <h3 className="text-3xl font-serif font-bold text-gray-900 mb-2">{stat.value}</h3>
                  <p className={`text-xs font-semibold ${stat.trendColor}`}>{stat.trend}</p>
                </div>
                <div className={`p-4 rounded-xl ${stat.bg} ${stat.text} text-xl`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 2. Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/admin/productList" className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#649899] text-white rounded-xl group-hover:bg-[#4A7A7B] transition-colors">
                <FaBoxOpen size={20} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Add Product</h4>
                <p className="text-xs text-gray-500">Create new listing</p>
              </div>
            </div>
            <FaArrowRight className="text-gray-300 group-hover:text-[#649899] transition-colors" />
          </Link>

          <div
            onClick={() => setShowAnalytics(true)}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500 text-white rounded-xl group-hover:bg-amber-600 transition-colors">
                <FaArrowUp size={20} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">View Analytics</h4>
                <p className="text-xs text-gray-500">Sales performance</p>
              </div>
            </div>
            <FaArrowRight className="text-gray-300 group-hover:text-amber-500 transition-colors" />
          </div>

          <Link to="/admin/userlist" className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#D97706] text-white rounded-xl group-hover:bg-[#B45309] transition-colors">
                <FaUsers size={20} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Manage Users</h4>
                <p className="text-xs text-gray-500">User accounts</p>
              </div>
            </div>
            <FaArrowRight className="text-gray-300 group-hover:text-[#D97706] transition-colors" />
          </Link>
        </div>

        {/* 3. Recent Orders & Top Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Recent Orders (2/3 width) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-serif font-bold text-gray-900">Recent Orders</h3>
                <p className="text-sm text-gray-500">Latest transactions from your store</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="text-xs font-bold text-gray-400 uppercase border-b border-gray-100">
                    <th className="px-6 py-4 font-semibold whitespace-nowrap">Order ID</th>
                    <th className="px-6 py-4 font-semibold whitespace-nowrap">Customer</th>
                    <th className="px-6 py-4 font-semibold whitespace-nowrap">Amount</th>
                    <th className="px-6 py-4 font-semibold whitespace-nowrap">Status</th>
                    <th className="px-6 py-4 font-semibold text-right whitespace-nowrap">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {allOrdersLoading ? (
                    <tr><td colSpan="5" className="py-8 text-center"><Loader /></td></tr>
                  ) : recentOrders.length === 0 ? (
                    <tr><td colSpan="5" className="py-8 text-center text-gray-500">No recent orders</td></tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                          {order.orderId || order._id.substring(0, 8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {order.user?.username || "Guest"}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900 whitespace-nowrap">
                          ₹{order.totalPrice.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold
                                              ${order.isPaid
                              ? 'bg-green-50 text-green-600 border border-green-100'
                              : 'bg-[#649899]/10 text-[#649899] border border-[#649899]/20'
                            }`}>
                            {order.isPaid ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 text-right whitespace-nowrap">
                          {moment(order.createdAt).format("MMM D, YYYY")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Products (1/3 width) */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-serif font-bold text-gray-900">Top Products</h3>
                <p className="text-sm text-gray-500">Best selling items (by quantity)</p>
              </div>
            </div>

            <div className="space-y-6">
              {allProductsLoading ? (
                <Loader />
              ) : topProducts.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No sales data yet.</p>
              ) : (
                topProducts.map((product) => (
                  <div key={product._id} className="flex items-center gap-4 group cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors -mx-2">
                    <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-[#649899] transition-colors">{product.name}</h4>
                      <p className="text-xs text-gray-500 font-mono mb-0.5">{product.productId}</p>
                      <p className="text-xs text-gray-400">{product.salesCount} Sold</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-gray-900">₹{product.price.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-400">Price</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <Link to="/admin/allproductslist" className="text-sm font-bold text-[#649899] hover:text-[#4A7A7B] transition-colors inline-flex items-center gap-1">
                View All Products <FaArrowRight size={12} />
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Analytics Modal */}
      {showAnalytics && salesDetail && (
        <AnalyticsModal
          data={salesDetail}
          onClose={() => setShowAnalytics(false)}
        />
      )}
    </div>
  );
};

const AnalyticsModal = ({ data, onClose }) => {
  const options = {
    chart: { type: "area", toolbar: { show: false } },
    colors: ["#F59E0B"],
    stroke: { curve: "smooth", width: 3 },
    dataLabels: { enabled: false },
    xaxis: { categories: data.map((item) => item._id) },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100],
      },
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return "₹" + val.toLocaleString();
        },
      },
    }
  };

  const series = [
    {
      name: "Sales",
      data: data.map((item) => item.totalSales),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in text-gray-900">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden animate-scale-in">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Sales Analytics</h3>
            <p className="text-sm text-gray-500">Visualization of your sales performance over time</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors bg-white p-2 rounded-full shadow-sm hover:shadow-md">
            <FaTimes size={16} />
          </button>
        </div>
        <div className="p-8">
          <Chart options={options} series={series} type="area" height={350} />
        </div>
      </div>
    </div>
  );
};

export default AdminDash;
