import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { useGetUsersQuery } from "../../redux/api/userApiSlice";
import {
  useGetTotalOrdersQuery,
  useGetTotalSalesByDateQuery,
  useGetTotalSalesQuery,
} from "../../redux/api/orderApiSlice";
import { useAllProductsQuery } from "../../redux/api/productApiSlice";
import AdminHeader from "./AdminHeader";
import Loader from "../../components/Loader";
import {
  FaArrowUp, FaArrowDown, FaDollarSign, FaUser, FaBox, FaShoppingCart,
  FaChartLine, FaChartPie, FaChartBar
} from "react-icons/fa";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  const { data: sales, isLoading: loadingSales } = useGetTotalSalesQuery();
  const { data: customers, isLoading: loadingCustomers } = useGetUsersQuery();
  const { data: orders, isLoading: loadingOrders } = useGetTotalOrdersQuery();
  const { data: salesDetail } = useGetTotalSalesByDateQuery();
  const { data: products, isLoading: loadingProducts } = useAllProductsQuery();

  const [state, setState] = useState({
    options: {
      chart: {
        type: "bar",
        toolbar: { show: false },
        foreColor: '#52525b', // zinc-600
        fontFamily: 'Inter, sans-serif',
      },
      tooltip: { theme: "dark" },
      colors: ["#EF4444"], // red-500
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 2 },
      grid: {
        borderColor: "#27272a", // zinc-800
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        padding: { top: 0, right: 0, bottom: 0, left: 10 }
      },
      xaxis: {
        categories: [],
        labels: {
          style: { colors: "#a1a1aa", fontSize: "10px" } // zinc-400
        },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        labels: {
          style: { colors: "#a1a1aa", fontSize: "10px" },
          formatter: (value) => `₹${value}`
        }
      },
      fill: { opacity: 1 }
    },
    series: [{ name: "Sales", data: [] }],
  });

  useEffect(() => {
    if (salesDetail) {
      const formattedSales = salesDetail.map((item) => ({
        x: item._id,
        y: item.totalSales,
      }));

      setState((prevState) => ({
        ...prevState,
        options: {
          ...prevState.options,
          xaxis: {
            categories: formattedSales.map((item) => item.x),
          },
        },
        series: [{ name: "Sales", data: formattedSales.map((item) => item.y) }],
      }));
    }
  }, [salesDetail]);

  const isLoading = loadingSales || loadingCustomers || loadingOrders || loadingProducts;

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader /></div>;

  const StatCard = ({ title, value, icon: Icon, trend, colorClass }) => (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-sm relative overflow-hidden group hover:border-zinc-700 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
          <h3 className="text-2xl font-black text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-full bg-zinc-800 text-zinc-400 group-hover:text-white group-hover:bg-zinc-700 transition-colors`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="text-xs font-medium flex items-center gap-1 text-zinc-400">
        <span className="text-green-500 flex items-center gap-1"><FaArrowUp size={10} /> +12%</span> from last cycle
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white pb-20 font-sans">
      <AdminHeader title="Command Center" subtitle="Real-time System Overwatch" />

      <main className="px-6 lg:px-8 py-8 max-w-[1600px] mx-auto space-y-8">

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={`₹${sales?.totalSales?.toFixed(0)}`}
            icon={FaDollarSign}
          />
          <StatCard
            title="Active Users"
            value={customers?.length}
            icon={FaUser}
          />
          <StatCard
            title="Total Orders"
            value={orders?.totalOrders}
            icon={FaShoppingCart}
          />
          <StatCard
            title="Inventory Size"
            value={products?.length}
            icon={FaBox}
          />
        </section>

        {/* Analytics & Recent Activity */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-6 rounded-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Revenue Analytics</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-zinc-800 text-xs font-bold text-zinc-300 rounded hover:bg-zinc-700 hover:text-white transition-colors">7D</button>
                <button className="px-3 py-1 bg-red-600 text-xs font-bold text-white rounded">1M</button>
                <button className="px-3 py-1 bg-zinc-800 text-xs font-bold text-zinc-300 rounded hover:bg-zinc-700 hover:text-white transition-colors">1Y</button>
              </div>
            </div>
            <Chart
              options={state.options}
              series={state.series}
              type="bar"
              height={350}
              width="100%"
            />
          </div>

          {/* Inventory Status (Minified) */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-sm flex flex-col">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-6">Inventory Health</h3>
            <div className="flex-1 space-y-4">
              {[
                { label: 'In Stock', val: '85%', color: 'bg-emerald-500' },
                { label: 'Low Stock', val: '12%', color: 'bg-amber-500' },
                { label: 'Out of Stock', val: '3%', color: 'bg-red-500' }
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs font-bold text-zinc-400 mb-1">
                    <span>{item.label}</span>
                    <span>{item.val}</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: item.val }}></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-800">
              <h4 className="text-xs font-bold uppercase text-zinc-400 mb-4">Recent Products</h4>
              <div className="space-y-3">
                {products?.slice(0, 3).map(p => (
                  <div key={p._id} className="flex items-center gap-3">
                    <img src={p.image} className="w-10 h-10 rounded object-cover bg-zinc-800" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{p.name}</p>
                      {/* FIX: Safe Access for Category */}
                      <p className="text-[10px] text-zinc-400 truncate">{p.category?.name || "General"}</p>
                    </div>
                    <span className="text-xs font-bold text-white">₹{p.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default AdminDashboard;
