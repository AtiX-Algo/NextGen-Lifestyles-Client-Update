import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, CreditCard, ShoppingBag, Truck, CheckCircle, AlertTriangle, Printer, Headphones, Navigation, Clock, RefreshCcw } from 'lucide-react';

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  // Return Feature States
  const [returnReason, setReturnReason] = useState('');
  const [showReturnInput, setShowReturnInput] = useState(false);
  const [processingReturn, setProcessingReturn] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`https://nextgen-lifestyles-server-update.onrender.com/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setOrder(data);
        } else {
          setError(data.message || 'Failed to fetch order');
        }
      } catch (err) {
        console.error(err);
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, token]);

  const handleReturnRequest = async () => {
    if (!returnReason.trim()) {
      alert("Please provide a reason for return");
      return;
    }
    
    setProcessingReturn(true);
    try {
      const res = await fetch(`https://nextgen-lifestyles-server-update.onrender.com/api/orders/${order._id}/return-request`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ reason: returnReason })
      });
      const data = await res.json();
      if (res.ok) {
        setOrder({...order, status: 'Return_Requested', returnReason});
        setShowReturnInput(false);
        setReturnReason('');
      } else {
        alert(data.message || 'Failed to submit return request');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting return request');
    } finally {
      setProcessingReturn(false);
    }
  };

  const getStepClass = (step) => {
    const statusMap = { 
      'Processing': 1, 
      'Shipped': 2, 
      'Out_for_Delivery': 3, 
      'Delivered': 4, 
      'Return_Requested': 4, 
      'Returned': 4,
      'Return_Rejected': 4
    };
    const currentStep = statusMap[order.status] || 1;
    const targetStep = statusMap[step] || 0;
    return currentStep >= targetStep ? "text-[#D96C46]" : "text-gray-300";
  };

  const getStepBg = (step) => {
    const statusMap = { 
      'Processing': 1, 
      'Shipped': 2, 
      'Out_for_Delivery': 3, 
      'Delivered': 4, 
      'Return_Requested': 4, 
      'Returned': 4,
      'Return_Rejected': 4
    };
    const currentStep = statusMap[order.status] || 1;
    const targetStep = statusMap[step] || 0;
    return currentStep >= targetStep ? "bg-[#D96C46] border-[#D96C46] text-white" : "bg-white border-gray-200 text-gray-300";
  };

  if (loading) return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
      <span className="loading loading-spinner loading-lg text-[#D96C46]"></span>
    </div>
  );

  if (error || !order) return (
    <div className="min-h-screen bg-[#FAF9F6] p-6 flex items-center justify-center text-center">
      <div className="bg-white p-10 rounded-3xl shadow-lg border border-gray-100 max-w-md w-full">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
            <AlertTriangle size={32} />
        </div>
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Order Not Found</h2>
        <p className="text-gray-500 mb-8">{error || "The order you're looking for doesn't exist."}</p>
        <Link to="/dashboard" className="btn bg-[#1a1a1a] text-white hover:bg-black rounded-full px-8 w-full">
            Back to Dashboard
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans text-[#1a1a1a] p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Breadcrumb */}
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#D96C46] transition-colors mb-8">
            <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Header */}
          <div className="bg-[#1a1a1a] text-white p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
               <div className="flex items-center gap-3 mb-2">
                   <h1 className="font-serif text-3xl font-bold">Order #{order._id.slice(-6).toUpperCase()}</h1>
                   <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border
                        ${order.status === 'Delivered' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 
                          order.status === 'Shipped' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 
                          'bg-white/10 text-gray-300 border-white/20'}`}>
                        {order.status.replace(/_/g, ' ')}
                   </span>
               </div>
               <p className="text-white/60 text-sm flex items-center gap-2">
                   <Clock size={14} /> Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}
               </p>
            </div>
            <div className="text-right">
                <p className="text-3xl font-serif font-medium text-[#D96C46]">${order.totalPrice.toFixed(2)}</p>
                <p className="text-white/60 text-sm">Total Amount</p>
            </div>
          </div>

          <div className="p-8 md:p-10">
            
            {/* Timeline */}
            <div className="mb-12">
                <h3 className="font-serif text-xl font-bold mb-8">Tracking History</h3>
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-8 md:gap-0">
                    
                    {/* Progress Bar Line (Desktop) */}
                    <div className="hidden md:block absolute top-5 left-0 w-full h-0.5 bg-gray-100 -z-10"></div>
                    
                    {['Processing', 'Shipped', 'Out_for_Delivery', 'Delivered'].map((step, idx) => {
                         const labels = {
                             'Processing': 'Processing',
                             'Shipped': 'Shipped',
                             'Out_for_Delivery': 'Out for Delivery',
                             'Delivered': 'Delivered'
                         };
                         const icons = {
                             'Processing': <Package size={16} />,
                             'Shipped': <Truck size={16} />,
                             'Out_for_Delivery': <Navigation size={16} />,
                             'Delivered': <CheckCircle size={16} />
                         };
                         
                         return (
                             <div key={step} className="flex md:flex-col items-center gap-4 md:gap-2 relative bg-white md:bg-transparent pr-4 md:pr-0">
                                 <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10 ${getStepBg(step)}`}>
                                     {icons[step]}
                                 </div>
                                 <div className="md:text-center">
                                     <p className={`font-medium text-sm ${getStepClass(step)}`}>{labels[step]}</p>
                                     <p className="text-xs text-gray-400">
                                         {order.status === step ? 'Current Status' : idx < ['Processing', 'Shipped', 'Out_for_Delivery', 'Delivered'].indexOf(order.status) ? 'Completed' : 'Pending'}
                                     </p>
                                 </div>
                             </div>
                         );
                    })}
                </div>
            </div>

            <div className="w-full h-px bg-gray-100 mb-12"></div>

            {/* Return Actions */}
            <div className="mb-12">
                {order.status === 'Delivered' && !order.returnReason && (
                    <div className="bg-[#FAF9F6] rounded-2xl p-6 border border-gray-100">
                        {!showReturnInput ? (
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#D96C46] shadow-sm">
                                        <RefreshCcw size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#1a1a1a]">Not satisfied with your order?</h4>
                                        <p className="text-sm text-gray-500">You can request a return within 30 days of delivery.</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowReturnInput(true)}
                                    className="px-6 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-full text-sm font-medium transition-colors"
                                >
                                    Request Return
                                </button>
                            </div>
                        ) : (
                            <div className="max-w-2xl mx-auto space-y-4">
                                <h4 className="font-bold text-[#1a1a1a]">Submit Return Request</h4>
                                <textarea 
                                    className="w-full border border-gray-200 rounded-xl p-4 focus:outline-none focus:border-[#D96C46] bg-white text-sm"
                                    rows="4"
                                    placeholder="Please explain why you want to return this item..."
                                    value={returnReason}
                                    onChange={(e) => setReturnReason(e.target.value)}
                                    maxLength="500"
                                ></textarea>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">{returnReason.length}/500</span>
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => { setShowReturnInput(false); setReturnReason(''); }}
                                            className="px-5 py-2 text-gray-500 hover:text-[#1a1a1a] text-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handleReturnRequest}
                                            disabled={processingReturn || !returnReason.trim()}
                                            className="px-6 py-2 bg-[#D96C46] text-white rounded-full text-sm font-medium hover:bg-[#b05535] disabled:opacity-50 transition-colors"
                                        >
                                            {processingReturn ? 'Submitting...' : 'Submit Request'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Return Status Feedback */}
                {['Return_Requested', 'Returned', 'Return_Rejected'].includes(order.status) && (
                    <div className={`rounded-2xl p-6 border flex items-start gap-4 ${
                        order.status === 'Return_Rejected' ? 'bg-red-50 border-red-100 text-red-800' :
                        order.status === 'Returned' ? 'bg-green-50 border-green-100 text-green-800' :
                        'bg-orange-50 border-orange-100 text-orange-800'
                    }`}>
                        <div className="mt-1">
                            {order.status === 'Return_Rejected' ? <AlertTriangle size={20}/> : <RefreshCcw size={20}/>}
                        </div>
                        <div>
                            <h4 className="font-bold mb-1">
                                {order.status === 'Return_Requested' && 'Return Request Pending'}
                                {order.status === 'Returned' && 'Return Approved & Refunded'}
                                {order.status === 'Return_Rejected' && 'Return Request Rejected'}
                            </h4>
                            <p className="text-sm opacity-80">
                                {order.status === 'Return_Requested' && 'Your request is under review. You will be notified shortly.'}
                                {order.status === 'Returned' && 'Your refund has been processed successfully.'}
                                {order.status === 'Return_Rejected' && 'Your request does not meet our return policy requirements.'}
                            </p>
                            {order.returnReason && (
                                <p className="text-xs mt-2 italic opacity-70">Reason: "{order.returnReason}"</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Order Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                
                {/* Left Col: Info */}
                <div className="space-y-8">
                    {/* Shipping Info */}
                    <div>
                        <h3 className="font-serif text-lg font-bold mb-4 flex items-center gap-2">
                            <MapPin size={18} className="text-[#D96C46]" /> Shipping Details
                        </h3>
                        <div className="bg-[#FAF9F6] p-6 rounded-2xl border border-gray-100 space-y-3 text-sm">
                            <div className="flex justify-between border-b border-gray-200 pb-2">
                                <span className="text-gray-500">Name</span>
                                <span className="font-medium">{order.user?.name}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200 pb-2">
                                <span className="text-gray-500">Phone</span>
                                <span className="font-medium">{order.shippingAddress.phone}</span>
                            </div>
                            <div className="pt-1">
                                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Address</p>
                                <p className="font-medium leading-relaxed">
                                    {order.shippingAddress.address}, {order.shippingAddress.city} <br/>
                                    {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                                </p>
                            </div>
                            
                            {order.shippingAddress.location && (
                                <a 
                                    href={`https://www.openstreetmap.org/?mlat=${order.shippingAddress.location.lat}&mlon=${order.shippingAddress.location.lng}#map=16/${order.shippingAddress.location.lat}/${order.shippingAddress.location.lng}`}
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="mt-4 flex items-center justify-center gap-2 w-full py-2 border border-[#D96C46] text-[#D96C46] rounded-lg hover:bg-orange-50 transition-colors text-xs font-bold uppercase tracking-wide"
                                >
                                    <MapPin size={14} /> View on Map
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div>
                        <h3 className="font-serif text-lg font-bold mb-4 flex items-center gap-2">
                            <CreditCard size={18} className="text-[#D96C46]" /> Payment Info
                        </h3>
                        <div className="bg-[#FAF9F6] p-6 rounded-2xl border border-gray-100 space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Method</span>
                                <span className="font-medium">{order.paymentMethod || 'Credit Card'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Status</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {order.isPaid ? 'Paid' : 'Unpaid'}
                                </span>
                            </div>
                            {order.paidAt && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Date</span>
                                    <span className="font-medium">{new Date(order.paidAt).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Col: Items */}
                <div>
                    <h3 className="font-serif text-lg font-bold mb-4 flex items-center gap-2">
                        <ShoppingBag size={18} className="text-[#D96C46]" /> Order Items
                    </h3>
                    <div className="border border-gray-100 rounded-2xl overflow-hidden mb-6">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#FAF9F6] border-b border-gray-100">
                                <tr>
                                    <th className="px-4 py-3 font-medium text-gray-500">Product</th>
                                    <th className="px-4 py-3 font-medium text-gray-500">Qty</th>
                                    <th className="px-4 py-3 font-medium text-gray-500 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {order.orderItems.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-50 rounded overflow-hidden">
                                                    <img 
                                                        src={item.image?.startsWith('http') ? item.image : `http://localhost:5000${item.image}`} 
                                                        alt={item.name} 
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <span className="font-medium text-[#1a1a1a] line-clamp-1">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">x{item.quantity}</td>
                                        <td className="px-4 py-3 font-bold text-right">${(item.price * item.quantity).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary */}
                    <div className="bg-[#FAF9F6] rounded-2xl p-6 border border-gray-100 space-y-3">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span>${(order.itemsPrice || order.totalPrice).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Shipping</span>
                            <span>${(order.shippingPrice || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Tax</span>
                            <span>${(order.taxPrice || 0).toFixed(2)}</span>
                        </div>
                        <div className="border-t border-gray-200 my-2 pt-2 flex justify-between items-center">
                            <span className="font-serif font-bold text-lg">Total</span>
                            <span className="font-serif font-bold text-xl text-[#D96C46]">${order.totalPrice.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Footer Actions */}
            <div className="mt-12 flex flex-wrap justify-end gap-4 border-t border-gray-100 pt-8">
                <button onClick={() => window.print()} className="px-5 py-2.5 border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 flex items-center gap-2 transition-colors">
                    <Printer size={16} /> Print Invoice
                </button>
                <Link to="/contact" className="px-5 py-2.5 border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 flex items-center gap-2 transition-colors">
                    <Headphones size={16} /> Support
                </Link>
                {order.status !== 'Delivered' && order.status !== 'Returned' && (
                    <button className="px-6 py-2.5 bg-[#1a1a1a] text-white rounded-full text-sm font-medium hover:bg-black flex items-center gap-2 shadow-lg transition-colors">
                        <Navigation size={16} /> Track Package
                    </button>
                )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;