import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { Package, User, LogOut, Settings, Shield, Truck, ShoppingBag, ChevronRight } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth(); 
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders on load
  useEffect(() => {
    fetchMyOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMyOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('http://localhost:5000/api/orders/myorders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans text-[#1a1a1a] pt-12 pb-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
             <h1 className="font-serif text-4xl mb-2">My Dashboard</h1>
             <p className="text-gray-500">Welcome back, <span className="font-medium text-[#1a1a1a]">{user.name}</span></p>
          </div>
          <div className="flex flex-wrap gap-3">
             {/* Role-based Action Buttons */}
             {user.role === 'admin' && (
                <Link to="/admin-dashboard" className="flex items-center gap-2 bg-[#1a1a1a] text-white px-5 py-2.5 rounded-full text-sm hover:bg-black transition-colors shadow-lg">
                    <Shield size={16} /> Admin Panel
                </Link>
             )}
             {user.role === 'delivery_man' && (
                <Link to="/delivery-dashboard" className="flex items-center gap-2 bg-[#D96C46] text-white px-5 py-2.5 rounded-full text-sm hover:bg-[#b05535] transition-colors shadow-lg">
                    <Truck size={16} /> Delivery Panel
                </Link>
             )}
             <Link to="/profile" className="flex items-center gap-2 border border-gray-200 bg-white text-gray-600 px-5 py-2.5 rounded-full text-sm hover:bg-gray-50 transition-colors">
                <Settings size={16} /> Edit Profile
             </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar / Profile Card */}
          <div className="col-span-1">
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-fit text-center">
                 
                 {/* Avatar */}
                 <div className="w-28 h-28 mx-auto rounded-full p-1 border-2 border-[#D96C46] mb-6">
                    <div className="w-full h-full rounded-full overflow-hidden bg-[#FAF9F6] flex items-center justify-center">
                        <img 
                            src={
                                user.avatar 
                                ? (user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`) 
                                : "https://placehold.co/150"
                            } 
                            alt="avatar" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                 </div>
                 
                 <h2 className="font-serif text-2xl mb-1">{user.name}</h2>
                 <p className="text-sm text-gray-400 mb-8">{user.email}</p>
                 
                 <div className="border-t border-gray-100 py-6 mb-2">
                    <div className="flex items-center justify-center gap-2 text-gray-500 mb-2 uppercase tracking-widest text-xs font-bold">
                        <ShoppingBag size={14} /> Total Orders
                    </div>
                    <p className="font-serif text-3xl text-[#D96C46]">{orders.length}</p>
                 </div>

                 <button 
                     onClick={() => { logout(); navigate('/login'); }} 
                     className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 py-3 rounded-xl transition-colors text-sm font-medium"
                 >
                     <LogOut size={16} /> Logout
                 </button>
             </div>
          </div>

          {/* Main Content / Orders Table */}
          <div className="col-span-1 lg:col-span-3">
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                 <div className="p-8 border-b border-gray-100 flex items-center gap-3">
                     <Package className="text-[#D96C46]" size={24} />
                     <h2 className="font-serif text-2xl">Order History</h2>
                 </div>

                 <div className="p-0">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <span className="loading loading-spinner text-[#D96C46] loading-lg"></span>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-16 px-6">
                            <div className="bg-[#FAF9F6] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShoppingBag className="text-gray-400" size={24} />
                            </div>
                            <h3 className="font-serif text-xl mb-2">No orders yet</h3>
                            <p className="text-gray-500 mb-6">Looks like you haven't made your first luxury purchase yet.</p>
                            <Link to="/" className="inline-flex items-center gap-2 text-[#D96C46] font-medium hover:underline">
                                Start Shopping <ChevronRight size={16} />
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#FAF9F6] border-b border-gray-100">
                                    <tr>
                                        <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                                        <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                                        <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Payment</th>
                                        <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {orders.map((order) => (
                                        <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-8 py-5 font-mono text-sm text-gray-600">#{order._id.slice(-6).toUpperCase()}</td>
                                            <td className="px-8 py-5 text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td className="px-8 py-5 font-medium text-[#1a1a1a]">${order.totalPrice.toFixed(2)}</td>
                                            <td className="px-8 py-5">
                                                {order.isPaid 
                                                    ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Paid</span> 
                                                    : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Unpaid</span>
                                                }
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                    ${order.status === 'Delivered' ? 'bg-green-50 text-green-700 border border-green-100' : 
                                                      order.status === 'Shipped' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 
                                                      order.status === 'Out_for_Delivery' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' : 
                                                      'bg-gray-100 text-gray-600 border border-gray-200'
                                                    }`}>
                                                    {order.status ? order.status.replace(/_/g, ' ') : 'Processing'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <Link 
                                                    to={`/order/${order._id}`} 
                                                    className="text-sm font-medium text-[#D96C46] hover:text-[#b05535] hover:underline"
                                                >
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                 </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;