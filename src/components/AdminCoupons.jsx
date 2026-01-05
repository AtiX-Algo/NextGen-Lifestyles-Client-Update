import { useState, useEffect } from 'react';
import { Ticket, Trash2, Calendar, DollarSign, Percent, Plus } from 'lucide-react';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountPercentage: '',
    minPurchaseAmount: '',
    expirationDate: ''
  });
  const [message, setMessage] = useState('');

  // Fetch Coupons Function
  const fetchCoupons = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/coupons');
      const data = await res.json();
      setCoupons(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:5000/api/coupons/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage('success');
        fetchCoupons();
        setFormData({
          code: '', description: '', discountPercentage: '', minPurchaseAmount: '', expirationDate: ''
        });
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await res.json();
        setMessage(`Error: ${data.message}`);
      }
    } catch {
      setMessage('Network Error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this?')) return;
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`http://localhost:5000/api/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) fetchCoupons();
      else alert('Failed to delete');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-2xl font-bold text-gray-800">Coupon Manager</h2>
        <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
           Total Active: {coupons.length}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                <Ticket size={16} /> Create New Coupon
            </h3>
            
            {message && (
                <div className={`mb-4 px-4 py-3 rounded-lg text-sm flex items-center gap-2 ${message === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message === 'success' ? '✅ Coupon Created Successfully!' : `❌ ${message}`}
                </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Coupon Code</label>
                  <input 
                      type="text" 
                      name="code" 
                      placeholder="e.g. SAVE10" 
                      className="w-full border-b border-gray-200 py-2 text-sm focus:border-[#D96C46] focus:outline-none uppercase font-medium placeholder:normal-case" 
                      value={formData.code} 
                      onChange={handleChange} 
                      required 
                  />
              </div>

              <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Description</label>
                  <input 
                      type="text" 
                      name="description" 
                      placeholder="Summer Sale 2026" 
                      className="w-full border-b border-gray-200 py-2 text-sm focus:border-[#D96C46] focus:outline-none" 
                      value={formData.description} 
                      onChange={handleChange} 
                      required 
                  />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1"><Percent size={12}/> Discount</label>
                    <input 
                        type="number" 
                        name="discountPercentage" 
                        placeholder="10" 
                        className="w-full border-b border-gray-200 py-2 text-sm focus:border-[#D96C46] focus:outline-none" 
                        value={formData.discountPercentage} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1"><DollarSign size={12}/> Min Spend</label>
                    <input 
                        type="number" 
                        name="minPurchaseAmount" 
                        placeholder="50" 
                        className="w-full border-b border-gray-200 py-2 text-sm focus:border-[#D96C46] focus:outline-none" 
                        value={formData.minPurchaseAmount} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
              </div>

              <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1"><Calendar size={12}/> Expiration</label>
                  <input 
                      type="date" 
                      name="expirationDate" 
                      className="w-full border-b border-gray-200 py-2 text-sm focus:border-[#D96C46] focus:outline-none text-gray-600" 
                      value={formData.expirationDate} 
                      onChange={handleChange} 
                      required 
                  />
              </div>

              <button type="submit" className="w-full mt-6 bg-[#D96C46] text-white py-3 rounded-xl text-sm font-medium hover:bg-[#b05535] transition-colors shadow-md flex justify-center items-center gap-2">
                 <Plus size={16} /> Create Coupon
              </button>
            </form>
        </div>

        {/* Coupon List Table */}
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Code</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Discount</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Min Spend</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Expires</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {coupons.length === 0 ? (
                    <tr><td colSpan="5" className="text-center p-8 text-gray-400 italic">No coupons found. Create one to get started.</td></tr>
                    ) : (
                    coupons.map((c) => (
                        <tr key={c._id} className="hover:bg-[#FAF7F5] transition-colors group">
                        <td className="px-6 py-4">
                            <div className="flex flex-col">
                                <span className="font-mono font-bold text-[#D96C46] bg-orange-50 px-2 py-1 rounded w-fit text-sm border border-orange-100">
                                    {c.code}
                                </span>
                                <span className="text-xs text-gray-400 mt-1">{c.description}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className="font-medium text-gray-900">{c.discountPercentage}% OFF</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                            ${c.minPurchaseAmount}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(c.expirationDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button 
                                onClick={() => handleDelete(c._id)} 
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                title="Delete Coupon"
                            >
                                <Trash2 size={16} />
                            </button>
                        </td>
                        </tr>
                    ))
                    )}
                </tbody>
                </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCoupons;