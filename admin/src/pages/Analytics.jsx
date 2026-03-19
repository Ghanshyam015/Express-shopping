import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCcw,
  Calendar,
  Filter,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import dashboardService from "../services/dashboardService";

const Analytics = ({ token }) => {
  const [stats, setStats] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("6months");
  const [liveData, setLiveData] = useState([]);
  const [realTimeUserCount, setRealTimeUserCount] = useState(Math.floor(Math.random() * 50) + 10);

  // Initial Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, analyticsRes] = await Promise.all([
          dashboardService.getDashboardStats(token),
          dashboardService.getAnalytics(token, period),
        ]);
        if (statsRes.success) setStats(statsRes.stats);
        if (analyticsRes.success) setAnalyticsData(analyticsRes.analytics);
      } catch (err) {
        console.error("Fetch Analytics Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, period]);

  // Simulate Real-time Data
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate live orders or revenue
      const newPoint = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        value: Math.floor(Math.random() * 1000) + 500,
      };
      setLiveData((prev) => [...prev.slice(-14), newPoint]);
      
      // Fluctuating current active users
      setRealTimeUserCount(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(5, prev + delta);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <RefreshCcw className="w-10 h-10 text-indigo-600" />
        </motion.div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${stats?.totalRevenue?.toLocaleString() || "0"}`,
      change: `+${stats?.growth?.revenue || 23}%`,
      trend: "up",
      icon: <DollarSign className="w-6 h-6 text-white" />,
      color: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-200",
    },
    {
      title: "Active Orders",
      value: stats?.totalOrders?.toLocaleString() || "0",
      change: `+${stats?.growth?.orders || 8}%`,
      trend: "up",
      icon: <ShoppingCart className="w-6 h-6 text-white" />,
      color: "from-blue-500 to-indigo-600",
      shadow: "shadow-blue-200",
    },
    {
      title: "Total Customers",
      value: stats?.totalUsers?.toLocaleString() || "0",
      change: `+${stats?.growth?.users || 15}%`,
      trend: "up",
      icon: <Users className="w-6 h-6 text-white" />,
      color: "from-purple-500 to-fuchsia-600",
      shadow: "shadow-purple-200",
    },
    {
      title: "Live Visitors",
      value: realTimeUserCount,
      change: "Live",
      trend: "neutral",
      icon: <Activity className="w-6 h-6 text-white" />,
      color: "from-orange-500 to-rose-600",
      shadow: "shadow-orange-200",
    },
  ];

  const chartData = analyticsData?.monthlyData?.map(item => ({
    name: `${item._id.month}/${item._id.year}`,
    revenue: item.revenue,
    orders: item.orders,
  })) || [];

  return (
    <div className="p-4 md:p-8 space-y-8 bg-slate-50/50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600"
          >
            Analytics Overview
          </motion.h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Monitoring real-time business performance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-sm flex gap-1">
            {["3months", "6months", "1year"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  period === p 
                    ? "bg-slate-900 text-white shadow-md" 
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {p === "3months" ? "3M" : p === "6months" ? "6M" : "1Y"}
              </button>
            ))}
          </div>
          <button className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -5 }}
            className={`relative overflow-hidden glass rounded-3xl p-6 border-0 shadow-2xl transition-all duration-300 ${stat.shadow}/20 hover:${stat.shadow}/40`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 blur-3xl -mr-16 -mt-16`} />
            
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg shadow-indigo-200 animate-float`}>
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 text-sm font-bold ${
                stat.trend === "up" ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"
              } px-2 py-1 rounded-full border border-emerald-100/50`}>
                {stat.trend === "up" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                {stat.change}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-slate-500 font-medium text-sm">{stat.title}</h3>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</span>
                {stat.title === "Live Visitors" && (
                  <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Large Revenue Chart */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="lg:col-span-2 glass rounded-[2.5rem] p-8 border-slate-200/50"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Revenue Performance</h3>
              <p className="text-slate-500 text-sm">Monthly sales vs Target</p>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium">
              <div className="flex items-center gap-2 text-indigo-600 uppercase tracking-widest text-xs">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                Revenue
              </div>
            </div>
          </div>
          
          <div className="h-[400px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#6366f1" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Real-time Activity Feed */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-[2.5rem] p-8 bg-slate-900/5 dark:bg-slate-900 text-white overflow-hidden relative"
        >
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold">Real-time Pulse</h3>
              <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            
            <div className="flex-1 space-y-6">
              <div className="h-[200px] -mx-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={liveData}>
                    <Tooltip 
                      contentStyle={{ display: 'none' }} 
                      position={{ y: 0 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#10b981" 
                      strokeWidth={3} 
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                {stats?.recentOrders?.length > 0 ? (
                  stats.recentOrders.map((order, i) => (
                    <div key={order._id} className={`flex items-center justify-between p-4 ${i === 0 ? 'bg-white/10' : 'bg-white/5'} rounded-2xl backdrop-blur-sm border border-white/10`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${order.status === 'delivered' ? 'bg-emerald-400' : 'bg-indigo-400'} ${i === 0 ? 'animate-pulse' : ''}`} />
                        <span className="text-sm font-medium">Order #{order._id.slice(-4).toUpperCase()}</span>
                      </div>
                      <span className="text-xs text-white/50">{new Date(order.date).toLocaleDateString()}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-white/30 text-sm">No recent activity</div>
                )}
              </div>
            </div>

            <button className="mt-auto w-full py-4 bg-emerald-500 hover:bg-emerald-600 transition-colors rounded-2xl font-bold flex items-center justify-center gap-2">
              <RefreshCcw className="w-4 h-4" />
              Reset Stats
            </button>
          </div>
        </motion.div>
      </div>

      {/* Secondary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
        {/* Order Volume Bar Chart */}
        <div className="glass rounded-[2.5rem] p-8">
           <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Order Volume</h3>
              <p className="text-slate-500 text-sm">Transcation frequency analysis</p>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="orders" radius={[10, 10, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index % 2 === 0 ? "#6366f1" : "#818cf8"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="glass rounded-[2.5rem] p-8 overflow-hidden relative group">
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Distribution Insights</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                {[
                  { label: "Electronics", val: 45, color: "bg-indigo-500" },
                  { label: "Fashion", val: 30, color: "bg-rose-500" },
                  { label: "Home", val: 15, color: "bg-emerald-500" },
                  { label: "Beauty", val: 10, color: "bg-amber-500" },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>{item.label}</span>
                      <span>{item.val}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.val}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full ${item.color}`} 
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center">
                <div className="relative group">
                   <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full group-hover:bg-indigo-500/30 transition-all" />
                   <div className="w-40 h-40 rounded-full border-[12px] border-slate-50 border-t-indigo-500 flex items-center justify-center relative rotate-45 group-hover:rotate-[225deg] transition-all duration-1000">
                      <div className="text-indigo-600 -rotate-45 group-hover:rotate-[-225deg] transition-all duration-1000 text-center">
                        <span className="text-2xl font-black italic">TOP</span>
                        <p className="text-[10px] font-bold uppercase">Seller</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
