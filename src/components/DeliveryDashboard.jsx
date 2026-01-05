import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, MapPin, Phone, User, Package, CheckCircle, LogOut, Navigation, Box } from 'lucide-react';

const DeliveryDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Auth Check on Mount
  useEffect(() => {
    if (!user || user.role !== 'delivery_man') {
        navigate('/dashboard'); 
        return;
    }
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  // 2. Fetch Assigned Tasks
  const fetchTasks = async () => {
    try {
        const res = await fetch('http://localhost:5000/api/orders/delivery/my-tasks', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setTasks(data);
    } catch (err) { 
        console.error(err); 
    } finally {
        setLoading(false);
    }
  };

  // 3. Update Order Status
  const updateStatus = async (id, status) => {
    try {
        const res = await fetch(`http://localhost:5000/api/orders/${id}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ status })
        });
        if (res.ok) {
            fetchTasks(); 
        }
    } catch (err) { console.error(err); }
  };

  // 4. Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans text-[#1a1a1a] p-6 md:p-12">
      
      {/* Header Section */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
            <div className="flex items-center gap-3 mb-2">
                <div className="bg-[#D96C46] text-white p-2 rounded-lg">
                    <Truck size={24} />
                </div>
                <h1 className="font-serif text-3xl md:text-4xl font-bold">Delivery Panel</h1>
            </div>
            <p className="text-gray-500">Welcome back, <span className="font-medium text-[#1a1a1a]">{user?.name}</span>. You have {tasks.filter(t => t.status !== 'Delivered').length} active tasks.</p>
        </div>
        
        <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-red-500 transition-colors text-sm font-medium shadow-sm"
        >
            <LogOut size={16} /> Logout
        </button>
      </div>

      {/* Orders Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
            <div className="flex justify-center py-20">
                <span className="loading loading-spinner text-[#D96C46] loading-lg"></span>
            </div>
        ) : tasks.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <Package size={32} />
                </div>
                <h2 className="font-serif text-2xl text-gray-900 mb-2">No Tasks Assigned</h2>
                <p className="text-gray-500">You are all caught up! Wait for new delivery assignments.</p>
            </div>
        ) : (
            <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {tasks.map(order => (
                    <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                        
                        {/* Top Accent Bar based on Status */}
                        <div className={`h-1.5 w-full absolute top-0 left-0 
                            ${order.status === 'Delivered' ? 'bg-green-500' : 
                              order.status === 'Out_for_Delivery' ? 'bg-[#D96C46]' : 'bg-blue-500'}`} 
                        />

                        <div className="p-6">
                            {/* Card Header: ID & Badge */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Order ID</p>
                                    <h2 className="font-mono text-lg font-bold text-[#1a1a1a]">#{order._id.substring(0, 8).toUpperCase()}</h2>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border
                                    ${order.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-100' : 
                                      order.status === 'Out_for_Delivery' ? 'bg-orange-50 text-orange-700 border-orange-100' : 
                                      'bg-blue-50 text-blue-700 border-blue-100'
                                    }`}>
                                    {order.status.replace(/_/g, ' ')}
                                </span>
                            </div>

                            {/* Customer Details */}
                            <div className="space-y-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <User size={18} className="text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-[#1a1a1a]">{order.user?.name || 'Guest'}</p>
                                        <p className="text-xs text-gray-400">Customer</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-3">
                                    <Phone size={18} className="text-gray-400 mt-0.5" />
                                    <div>
                                        <a href={`tel:${order.shippingAddress.phone}`} className="text-sm font-medium text-[#1a1a1a] hover:text-[#D96C46] transition-colors">
                                            {order.shippingAddress.phone}
                                        </a>
                                        <p className="text-xs text-gray-400">Contact</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <MapPin size={18} className="text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-[#1a1a1a] leading-relaxed">
                                            {order.shippingAddress.address}, {order.shippingAddress.city}
                                        </p>
                                        <p className="text-xs text-gray-400">Delivery Address</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                                    <Box size={18} className="text-gray-400" />
                                    <p className="text-sm font-bold text-[#1a1a1a]">COD Amount: <span className="text-[#D96C46]">${order.totalPrice}</span></p>
                                </div>
                            </div>

                            {/* Actions Wrapper */}
                            <div className="space-y-3">
                                {/* Map Button */}
                                {order.shippingAddress.location && order.shippingAddress.location.lat && (
                                    <a 
                                        href={`https://www.google.com/maps/search/?api=1&query=${order.shippingAddress.location.lat},${order.shippingAddress.location.lng}`}
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium"
                                    >
                                        <Navigation size={16} /> Open Navigation
                                    </a>
                                )}

                                {/* Status Action Buttons */}
                                {order.status === 'Shipped' && (
                                    <button 
                                        onClick={() => updateStatus(order._id, 'Out_for_Delivery')} 
                                        className="w-full py-3 rounded-lg bg-[#1a1a1a] text-white hover:bg-black transition-colors font-medium text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                                    >
                                        <Truck size={18} /> Start Delivery
                                    </button>
                                )}

                                {order.status === 'Out_for_Delivery' && (
                                    <button 
                                        onClick={() => updateStatus(order._id, 'Delivered')} 
                                        className="w-full py-3 rounded-lg bg-[#D96C46] text-white hover:bg-[#b05535] transition-colors font-medium text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                                    >
                                        <CheckCircle size={18} /> Confirm Delivered
                                    </button>
                                )}

                                {order.status === 'Delivered' && (
                                    <div className="w-full py-3 rounded-lg bg-green-50 text-green-700 border border-green-100 font-bold text-sm flex items-center justify-center gap-2">
                                        <CheckCircle size={18} /> Completed
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;