import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef } from 'react';
import io from 'socket.io-client';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  Ticket, 
  RotateCcw, 
  MessageSquare, 
  LogOut, 
  Menu, 
  X,
  Search,
  Bell,
  ChevronDown,
  MoreVertical,
  Plus
} from 'lucide-react';

// Assuming these exist in your project, if not, create placeholder components
import AdminCoupons from './AdminCoupons';
import AdminAnalytics from './AdminAnalytics';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');
  
  const socket = useRef(null);

  // ===============================
  // 1. State Management
  // ===============================
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar toggle

  // Data
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Assignments & Modals
  const [assignments, setAssignments] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);

  const initialFormState = {
    name: '', price: '', category: '', brand: '', stock: '', description: '', image: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  // Support Chat
  const [adminMessages, setAdminMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [customersWithChats, setCustomersWithChats] = useState([]);
  const [chatHistory, setChatHistory] = useState({});

  // ===============================
  // 2. Auth & Socket Logic
  // ===============================
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    if (socket.current) socket.current.disconnect();
    socket.current = io('http://localhost:5000');

    socket.current.on('connect', () => {
      console.log('Admin connected to socket');
      socket.current.emit('join_support_chat', user._id);
    });

    socket.current.on('receive_support_message', (data) => {
      const senderId = data.senderId;
      const isAdminMsg = data.isAdmin;

      if (!isAdminMsg) {
        setCustomersWithChats(prev => prev.includes(senderId) ? prev : [...prev, senderId]);
        if (!activeCustomer) setActiveCustomer(senderId);

        setChatHistory(prev => ({
          ...prev,
          [senderId]: [...(prev[senderId] || []), { ...data, own: false }]
        }));

        if (activeCustomer === senderId) {
          setAdminMessages(prev => [...prev, { ...data, own: false }]);
        }
      } else if (activeCustomer) {
        const msg = { ...data, own: data.senderId === user._id };
        setChatHistory(prev => ({
          ...prev,
          [activeCustomer]: [...(prev[activeCustomer] || []), msg]
        }));
        setAdminMessages(prev => [...prev, msg]);
      }
    });

    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, [user, activeCustomer]);

  // ===============================
  // 3. Fetch Data
  // ===============================
  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      setError(null);
      const headers = { Authorization: `Bearer ${token}` };

      if (users.length === 0 || activeTab === 'users' || activeTab === 'support') {
        const res = await fetch('http://localhost:5000/api/users', { headers });
        if (res.ok) setUsers(await res.json());
      }
      if (activeTab === 'orders' || activeTab === 'overview' || activeTab === 'returns') {
        if (orders.length === 0) setLoading(true);
        const res = await fetch('http://localhost:5000/api/orders', { headers });
        if (res.ok) setOrders(await res.json());
      }
      if (activeTab === 'products' || activeTab === 'overview') {
        if (products.length === 0) setLoading(true);
        const res = await fetch('http://localhost:5000/api/products');
        if (res.ok) setProducts(await res.json());
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [token, activeTab, users.length, orders.length, products.length]); 

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ===============================
  // 4. Action Handlers
  // ===============================
  const handleRoleUpdate = async (userId, newRole) => {
    if(!window.confirm(`Make this user a ${newRole}?`)) return;
    try {
        const res = await fetch(`http://localhost:5000/api/users/${userId}/role`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ role: newRole })
        });
        if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  };

  const handleAssign = async (orderId) => {
    const deliveryManId = assignments[orderId];
    if (!deliveryManId) return alert("Select a delivery man first");
    try {
        const res = await fetch(`http://localhost:5000/api/orders/${orderId}/assign`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ deliveryManId })
        });
        if (res.ok) {
            const newAssignments = { ...assignments };
            delete newAssignments[orderId];
            setAssignments(newAssignments);
            fetchData(); 
        }
    } catch (err) { console.error(err); }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (uploadFile) data.append('image', uploadFile);

    const url = editMode 
      ? `http://localhost:5000/api/products/${currentId}`
      : `http://localhost:5000/api/products`;
    
    try {
      const res = await fetch(url, {
        method: editMode ? 'PUT' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: data
      });
      if (res.ok) {
        setIsModalOpen(false);
        setUploadFile(null);
        fetchData();
        setFormData(initialFormState);
      }
    } catch (err) { console.error(err); }
  };

  const handleAdminReturn = async (id, status) => {
    try {
        const res = await fetch(`http://localhost:5000/api/orders/${id}/return-handle`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ status })
        });
        if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  };

  // Support Chat logic
  const sendReply = (e) => {
    e.preventDefault();
    if (!reply.trim() || !activeCustomer) return;
    const messageData = { adminId: user._id, adminName: user.name || 'Support', message: reply.trim() };
    socket.current.emit('admin_support_message', messageData);
    const newMsg = { senderId: user._id, senderName: user.name, message: reply.trim(), isAdmin: true, own: true, timestamp: new Date() };
    setChatHistory(prev => ({ ...prev, [activeCustomer]: [...(prev[activeCustomer] || []), newMsg] }));
    setAdminMessages(prev => [...prev, newMsg]);
    setReply('');
  };

  const handleSelectCustomer = (customerId) => {
    setActiveCustomer(customerId);
    setAdminMessages(chatHistory[customerId] || []);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (socket.current) socket.current.disconnect();
    navigate('/login');
  };

  // Helpers
  const deliveryMen = users.filter(u => u.role === 'delivery_man');
  const openEdit = (p) => {
    setEditMode(true); setCurrentId(p._id); setUploadFile(null);
    setFormData({ name: p.name, price: p.price, category: p.category, brand: p.brand, stock: p.stock, description: p.description, image: p.images?.[0] || p.image || '' });
    setIsModalOpen(true);
  };
  const openCreate = () => {
    setEditMode(false); setCurrentId(null); setUploadFile(null); setFormData(initialFormState); setIsModalOpen(true);
  };

  if (!user || user.role !== 'admin') return null;

  // ===============================
  // DESIGN COMPONENTS
  // ===============================
  const MenuItem = ({ id, label, icon: Icon }) => (
    <button 
      onClick={() => { setActiveTab(id); setIsSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
      ${activeTab === id 
        ? 'bg-[#D96C46] text-white shadow-md' 
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
    >
      <Icon size={20} />
      {label}
    </button>
  );

  const StatCard = ({ title, value, trend, isMoney }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-gray-500 text-sm font-medium mb-2">{title}</h3>
      <div className="flex items-end justify-between">
        <span className="font-serif text-3xl text-gray-900 font-medium">
          {isMoney ? '$' : ''}{value}
        </span>
        <div className={`text-xs px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#FAF7F5] font-sans text-[#1a1a1a] overflow-hidden">
      
      {/* ================= SIDEBAR ================= */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 rounded-xl bg-[#D96C46] flex items-center justify-center text-white font-serif font-bold text-xl">
              N
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold text-gray-900">NextGen</h1>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            <MenuItem id="overview" label="Dashboard" icon={LayoutDashboard} />
            <MenuItem id="orders" label="Orders" icon={ShoppingBag} />
            <MenuItem id="products" label="Products" icon={Package} />
            <MenuItem id="users" label="Customers" icon={Users} />
            <MenuItem id="analytics" label="Analytics" icon={RotateCcw} /> {/* Using Rotate icon as placeholder */}
            <MenuItem id="coupons" label="Coupons" icon={Ticket} />
            <MenuItem id="returns" label="Returns" icon={RotateCcw} />
            <MenuItem id="support" label="Support" icon={MessageSquare} />
          </nav>

          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg mt-auto">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* HEADER */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-gray-500">
            <Menu size={24} />
          </button>

          <div className="hidden md:flex items-center gap-4 flex-1 max-w-lg">
            <h2 className="font-serif text-2xl font-bold text-gray-800 capitalize">
              {activeTab === 'overview' ? 'Dashboard' : activeTab}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-full text-sm focus:ring-2 focus:ring-[#D96C46] outline-none w-64"
              />
            </div>
            <button className="relative text-gray-500 hover:text-[#D96C46] transition-colors">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                {user.name.charAt(0)}
              </div>
              <span className="hidden md:block text-sm font-medium">{user.name}</span>
            </div>
          </div>
        </header>

        {/* SCROLLABLE CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          
          {/* ================== OVERVIEW TAB ================== */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Total Revenue" 
                  value={orders.reduce((acc, order) => acc + (order.isPaid ? order.totalPrice : 0), 0).toFixed(2)} 
                  trend={20.1} 
                  isMoney={true} 
                />
                <StatCard title="Total Orders" value={orders.length} trend={12.5} />
                <StatCard title="Total Customers" value={users.length} trend={8.2} />
                <StatCard title="Pending Returns" value={orders.filter(o => o.status === 'Return_Requested').length} trend={-0.4} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Analytics Chart Placeholder (Wrapped Component) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-serif text-xl">Sales Overview</h3>
                    <select className="bg-gray-50 border-none text-xs rounded-lg px-3 py-1">
                       <option>Last 7 days</option>
                    </select>
                  </div>
                  {/* Reuse Analytics Component but force styling via container */}
                  <div className="h-[300px] w-full">
                     <AdminAnalytics />
                  </div>
                </div>

                {/* Top Products / Categories */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                   <h3 className="font-serif text-xl mb-6">Top Products</h3>
                   <div className="space-y-4">
                     {products.slice(0, 4).map((p, i) => (
                       <div key={p._id} className="flex items-center gap-4">
                          <span className="w-6 h-6 rounded bg-gray-100 text-gray-500 text-xs flex items-center justify-center font-bold">{i+1}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                            <p className="text-xs text-gray-400">{p.sales || 0} sales</p>
                          </div>
                          <span className="text-sm font-medium text-[#D96C46]">${p.price}</span>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* ================== ORDERS TAB ================== */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                 <h3 className="font-serif text-xl">Recent Orders</h3>
                 <button className="text-xs text-[#D96C46] font-medium">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-6 py-4 font-medium">Order ID</th>
                      <th className="px-6 py-4 font-medium">Customer</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Total</th>
                      <th className="px-6 py-4 font-medium">Delivery</th>
                      <th className="px-6 py-4 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">#{order._id.slice(-6).toUpperCase()}</td>
                        <td className="px-6 py-4 text-gray-600">{users.find(u => u._id === order.user)?.email || 'Guest'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium 
                            ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                              order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                              order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium">${order.totalPrice.toFixed(2)}</td>
                        <td className="px-6 py-4">
                           {order.deliveryMan ? (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">D</div>
                                <span className="text-gray-600">{users.find(u => u._id === order.deliveryMan)?.name}</span>
                              </div>
                           ) : (
                             <select 
                               className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:border-[#D96C46] outline-none"
                               onChange={(e) => setAssignments({ ...assignments, [order._id]: e.target.value })}
                               value={assignments[order._id] || ""}
                               disabled={!order.isPaid}
                             >
                               <option value="" disabled>Assign Driver</option>
                               {deliveryMen.map(man => <option key={man._id} value={man._id}>{man.name}</option>)}
                             </select>
                           )}
                        </td>
                        <td className="px-6 py-4">
                          {!order.deliveryMan && order.isPaid && (
                             <button onClick={() => handleAssign(order._id)} className="text-xs bg-[#D96C46] text-white px-3 py-1 rounded hover:bg-[#b05535]">Ship</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================== PRODUCTS TAB ================== */}
          {activeTab === 'products' && (
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="font-serif text-xl">Product Inventory</h3>
                   <button onClick={openCreate} className="flex items-center gap-2 bg-[#D96C46] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#b05535] transition-colors">
                      <Plus size={16} /> Add Product
                   </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                   {products.map(p => (
                      <div key={p._id} className="border border-gray-100 rounded-xl p-4 hover:shadow-lg transition-all group relative bg-white">
                         <div className="aspect-square bg-[#FAF7F5] rounded-lg mb-4 overflow-hidden flex items-center justify-center relative">
                            <img src={p.images?.[0] || p.image} alt={p.name} className="h-full object-contain" />
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={() => openEdit(p)} className="p-1.5 bg-white shadow rounded-full text-blue-600"><Users size={14}/></button> {/* Icon placeholder for edit */}
                               <button onClick={() => handleDeleteProduct(p._id)} className="p-1.5 bg-white shadow rounded-full text-red-600"><X size={14}/></button>
                            </div>
                         </div>
                         <h4 className="font-medium text-gray-900 truncate">{p.name}</h4>
                         <div className="flex justify-between items-center mt-2">
                            <span className="text-[#D96C46] font-bold">${p.price}</span>
                            <span className="text-xs text-gray-400">{p.stock} in stock</span>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          )}

          {/* ================== USERS TAB ================== */}
          {activeTab === 'users' && (
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100"><h3 className="font-serif text-xl">User Management</h3></div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                         <tr><th className="px-6 py-4">Name</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Action</th></tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                         {users.map(u => (
                            <tr key={u._id} className="hover:bg-gray-50">
                               <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
                               <td className="px-6 py-4 text-gray-500">{u.email}</td>
                               <td className="px-6 py-4">
                                  <span className={`px-2 py-1 rounded text-xs border ${u.role === 'admin' ? 'border-purple-200 bg-purple-50 text-purple-700' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>
                                     {u.role}
                                  </span>
                               </td>
                               <td className="px-6 py-4">
                                  {u._id !== user._id && (
                                     <select 
                                        value={u.role} 
                                        onChange={(e) => handleRoleUpdate(u._id, e.target.value)}
                                        className="text-xs border border-gray-200 rounded px-2 py-1 bg-white outline-none focus:border-[#D96C46]"
                                     >
                                        <option value="customer">Customer</option>
                                        <option value="delivery_man">Delivery Man</option>
                                        <option value="admin">Admin</option>
                                     </select>
                                  )}
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          )}

          {/* ================== OTHER TABS (Placeholders for logic) ================== */}
          {activeTab === 'analytics' && <div className="bg-white p-6 rounded-2xl"><AdminAnalytics /></div>}
          {activeTab === 'coupons' && <div className="bg-white p-6 rounded-2xl"><AdminCoupons /></div>}
          
          {activeTab === 'returns' && (
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100"><h3 className="font-serif text-xl">Return Requests</h3></div>
                <div className="p-6">
                   {orders.filter(o => o.status === 'Return_Requested').length === 0 ? (
                      <div className="text-center text-gray-400 py-10">No pending returns</div>
                   ) : (
                      <div className="space-y-4">
                         {orders.filter(o => o.status === 'Return_Requested').map(o => (
                            <div key={o._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg bg-gray-50">
                               <div>
                                  <p className="font-medium text-gray-900">Order #{o._id.slice(-6)}</p>
                                  <p className="text-sm text-gray-500">Reason: "{o.returnReason}"</p>
                                  <p className="text-xs text-gray-400 mt-1">${o.totalPrice}</p>
                               </div>
                               <div className="flex gap-2">
                                  <button onClick={() => handleAdminReturn(o._id, 'Returned')} className="px-3 py-1 bg-green-600 text-white rounded text-xs">Approve</button>
                                  <button onClick={() => handleAdminReturn(o._id, 'Return_Rejected')} className="px-3 py-1 bg-red-600 text-white rounded text-xs">Reject</button>
                               </div>
                            </div>
                         ))}
                      </div>
                   )}
                </div>
             </div>
          )}

          {/* ================== SUPPORT TAB ================== */}
          {activeTab === 'support' && (
             <div className="h-[600px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex">
                {/* Chat Sidebar */}
                <div className="w-1/3 border-r border-gray-100 flex flex-col">
                   <div className="p-4 border-b border-gray-100 bg-gray-50 font-medium text-gray-700">Inbox</div>
                   <div className="flex-1 overflow-y-auto">
                      {customersWithChats.map(cid => {
                         const c = users.find(u => u._id === cid);
                         return (
                            <button 
                               key={cid} 
                               onClick={() => handleSelectCustomer(cid)}
                               className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${activeCustomer === cid ? 'bg-orange-50 border-orange-100' : ''}`}
                            >
                               <p className="font-medium text-gray-900 text-sm">{c ? c.name : 'Unknown User'}</p>
                               <p className="text-xs text-gray-500 truncate mt-1">Click to view messages</p>
                            </button>
                         )
                      })}
                   </div>
                </div>
                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-[#FAF7F5]">
                   {activeCustomer ? (
                      <>
                         <div className="p-4 bg-white border-b border-gray-100 shadow-sm z-10">
                            <h4 className="font-bold text-gray-800">{users.find(u => u._id === activeCustomer)?.name}</h4>
                         </div>
                         <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {adminMessages.map((m, i) => (
                               <div key={i} className={`flex ${m.own ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl text-sm ${m.own ? 'bg-[#D96C46] text-white rounded-br-none' : 'bg-white text-gray-800 shadow-sm rounded-bl-none'}`}>
                                     {m.message}
                                  </div>
                               </div>
                            ))}
                         </div>
                         <form onSubmit={sendReply} className="p-4 bg-white border-t border-gray-100 flex gap-2">
                            <input 
                               value={reply} 
                               onChange={e => setReply(e.target.value)} 
                               className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#D96C46]" 
                               placeholder="Type a reply..." 
                            />
                            <button type="submit" className="bg-[#D96C46] text-white p-2 rounded-full hover:bg-[#b05535]"><MessageSquare size={18} /></button>
                         </form>
                      </>
                   ) : (
                      <div className="flex-1 flex items-center justify-center text-gray-400">Select a conversation</div>
                   )}
                </div>
             </div>
          )}

        </div>
      </main>

      {/* ================== MODAL ================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#FAF7F5]">
               <h3 className="font-serif text-xl font-bold text-gray-900">{editMode ? 'Edit Product' : 'New Product'}</h3>
               <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900"><X size={20}/></button>
            </div>
            <form onSubmit={handleProductSubmit} className="p-6 grid grid-cols-2 gap-4">
               <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Name</label>
                  <input className="w-full border-b border-gray-200 py-2 focus:border-[#D96C46] focus:outline-none transition-colors" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
               </div>
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Price</label>
                  <input type="number" className="w-full border-b border-gray-200 py-2 focus:border-[#D96C46] focus:outline-none" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
               </div>
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Stock</label>
                  <input type="number" className="w-full border-b border-gray-200 py-2 focus:border-[#D96C46] focus:outline-none" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required />
               </div>
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Category</label>
                  <input className="w-full border-b border-gray-200 py-2 focus:border-[#D96C46] focus:outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
               </div>
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Brand</label>
                  <input className="w-full border-b border-gray-200 py-2 focus:border-[#D96C46] focus:outline-none" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
               </div>
               <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Image</label>
                  <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-[#D96C46] hover:file:bg-orange-100 mt-2" onChange={(e) => setUploadFile(e.target.files[0])} />
               </div>
               <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Description</label>
                  <textarea className="w-full border border-gray-200 rounded-lg p-2 mt-2 focus:border-[#D96C46] focus:outline-none h-24 text-sm" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
               </div>
               <div className="col-span-2 flex justify-end gap-3 mt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-[#D96C46] text-white rounded-lg text-sm hover:bg-[#b05535] shadow-md">{editMode ? 'Save Changes' : 'Create Product'}</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;