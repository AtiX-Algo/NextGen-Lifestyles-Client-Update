import { useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const AdminAnalytics = () => {
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Theme Colors: Terracotta, Charcoal, Sage, Soft Orange, Light Grey
  const COLORS = ['#D96C46', '#2C2C2C', '#A68A76', '#F2B8A2', '#E5E5E5'];

  useEffect(() => {
    const fetchAnalytics = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:5000/api/orders/analytics', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        setSalesData(data.salesData);
        setCategoryData(data.categoryData);
        setLoading(false);
      } catch (err) { console.error(err); }
    };

    fetchAnalytics();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner text-[#D96C46]"></span>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* 1. Sales Chart (Area Chart for smooth aesthetic) */}
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="font-serif text-xl font-bold text-gray-900">Sales Overview</h2>
                <p className="text-xs text-gray-400 mt-1">Monthly revenue performance</p>
            </div>
        </div>
        
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D96C46" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#D96C46" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                        dy={10}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        itemStyle={{ color: '#D96C46', fontWeight: 600 }}
                        formatter={(value) => [`$${value}`, 'Revenue']}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#D96C46" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorSales)" 
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Category Distribution (Donut Chart) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-serif text-xl font-bold mb-2 text-gray-900">Sales by Category</h2>
        <p className="text-xs text-gray-400 mb-8">Distribution across inventory</p>
        
        <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60} // Makes it a Donut
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    />
                    <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="circle"
                        formatter={(value) => <span className="text-gray-500 text-xs font-medium ml-1">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text Overlay */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-5 text-center pointer-events-none">
                <span className="block text-2xl font-serif font-bold text-gray-800">
                    {categoryData.reduce((a, b) => a + b.value, 0)}%
                </span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Total</span>
            </div>
        </div>
      </div>

    </div>
  );
};

export default AdminAnalytics;