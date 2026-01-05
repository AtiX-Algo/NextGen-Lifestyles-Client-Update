import { useState, useEffect } from 'react';
import { Ticket, Trash2, Calendar, DollarSign, Percent, Plus } from 'lucide-react';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountPercentage: '',
    minPurchaseAmount: '',
    maxPurchaseAmount: '',
    expirationDate: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  /*FETCH COUPONS*/
  const fetchCoupons = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/coupons');
      const data = await res.json();
      setCoupons(data);
    } catch (err) {
      console.error(err);
    }
  };

  /* 
     EFFECT*/
  useEffect(() => {
    let isMounted = true;

    const loadCoupons = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/coupons');
        const data = await res.json();
        if (isMounted) setCoupons(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadCoupons();

    return () => {
      isMounted = false;
    };
  }, []);

 
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:5000/api/coupons/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage('success');
        fetchCoupons();
        setFormData({
          code: '',
          description: '',
          discountPercentage: '',
          minPurchaseAmount: '',
          maxPurchaseAmount:'',
          expirationDate: '',
        });
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await res.json();
        setMessage(data.message || 'Failed to create coupon');
      }
    } catch {
      setMessage('Network Error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`http://localhost:5000/api/coupons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) fetchCoupons();
      else alert('Delete failed');
    } catch (err) {
      console.error(err);
    }
  };




  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-2xl font-bold text-gray-800">
          Coupon Manager
        </h2>
        <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
          Total Active: {coupons.length}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CREATE COUPON */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 h-fit">
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-6 flex items-center gap-2">
            <Ticket size={16} /> Create New Coupon
          </h3>

          {message && (
            <div
              className={`mb-4 px-4 py-3 rounded-lg text-sm ${
                message === 'success'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {message === 'success'
                ? '✅ Coupon Created Successfully!'
                : `❌ ${message}`}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <input
              type="text"
              name="code"
              placeholder="SAVE10"
              className="w-full border-b py-2 uppercase font-medium"
              value={formData.code}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="description"
              placeholder="Summer Sale"
              className="w-full border-b py-2"
              value={formData.description}
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                name="discountPercentage"
                placeholder="Discount %"
                className="w-full border-b py-2"
                value={formData.discountPercentage}
                onChange={handleChange}
                required
              />

              <input
                type="number"
                name="minPurchaseAmount"
                placeholder="Min Spend"
                className="w-full border-b py-2"
                value={formData.minPurchaseAmount}
                onChange={handleChange}
                required
              />


              <input
                type="number"
                name="maxPurchaseAmount"
                placeholder="MaX Spend"
                className="w-full border-b py-2"
                value={formData.maxPurchaseAmount}
                onChange={handleChange}
                required
              />
            </div>

            <input
              type="date"
              name="expirationDate"
              className="w-full border-b py-2"
              value={formData.expirationDate}
              onChange={handleChange}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-[#D96C46] text-white py-3 rounded-xl flex justify-center items-center gap-2"
            >
              <Plus size={16} />
              {loading ? 'Creating...' : 'Create Coupon'}
            </button>
          </form>
        </div>

        {/* COUPON LIST */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4">Min Spend</th>
                <th className="px-6 py-4">Max Spend</th>
                <th className="px-6 py-4">Expires</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-8 text-gray-400">
                    No coupons found
                  </td>
                </tr>
              ) : (

                
                coupons.map((c) => (
                  <tr key={c._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-[#D96C46]">
                      {c.code}
                    </td>
                    <td className="px-6 py-4">{c.discountPercentage}%</td>
                    <td className="px-6 py-4">${c.minPurchaseAmount}</td>
                    <td className="px-6 py-4">${c.maxPurchaseAmount}</td> 
                    {/* Max  */}
                    <td className="px-6 py-4">
                      {new Date(c.expirationDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-full"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>

                  


                )) 

               
              ) 

              

            }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCoupons;
