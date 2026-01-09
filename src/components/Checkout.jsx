import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext"; 
import MapSelector from "./MapSelector"; 
import { MapPin, Smartphone, Home, CreditCard, ArrowRight, CheckCircle, Package } from "lucide-react";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart } = useContext(CartContext);
  
  // Safe user parsing
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');

  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState('Dhaka');
  const [location, setLocation] = useState(user?.location || null);
  const [paymentMethod, setPaymentMethod] = useState('Stripe');
  
  // Loading state
  const [loading, setLoading] = useState(false);

  // Calculations
  const shippingPrice = totalPrice > 500 ? 0 : 60; 
  const taxPrice = totalPrice * 0.05; 
  const finalTotal = totalPrice + shippingPrice + taxPrice;

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!address || !phone) {
        alert("Please fill in address and phone number.");
        return;
    }

    setLoading(true);

    const formattedOrderItems = cart.map((item) => {
        const productId = item._id || item.id || item.productId || item.product;
        if (!productId) return null; 
        return {
            product: productId, 
            name: item.name,
            quantity: item.qty || item.quantity || 1,
            image: item.images && item.images.length > 0 ? item.images[0] : (item.image || ''),
            price: item.price
        };
    }).filter(item => item !== null);

    if (formattedOrderItems.length === 0) {
        setLoading(false);
        return;
    }

    const orderData = {
      orderItems: formattedOrderItems,
      shippingAddress: { address, city, phone, location }, 
      paymentMethod,
      itemsPrice: Number(totalPrice),
      shippingPrice: Number(shippingPrice),
      taxPrice: Number(taxPrice),
      totalPrice: Number(finalTotal)
    };

    try {
      // 1. Create Order
      const res = await fetch('https://nextgen-lifestyles-server-update.onrender.com/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });
      
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Server Error creating order");
      }

      // 2. SUCCESS: Navigate FIRST, then Clear Cart
      navigate('/payment', { 
        state: { 
            amount: finalTotal, 
            orderId: data._id 
        } 
      });

      // Clear the cart AFTER initiating navigation
      setTimeout(() => {
          clearCart();
      }, 500);

    } catch (err) {
      console.error("Order Error:", err);
      alert("Order Failed: " + err.message);
      setLoading(false); 
    }
  };

  // Only show "Empty Cart" if we are NOT loading.
  if (cart.length === 0 && !loading) return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#FAF9F6] text-[#1a1a1a]">
        <div className="bg-white p-6 rounded-full shadow-sm mb-4">
            <Package size={48} className="text-gray-300" />
        </div>
        <h2 className="font-serif text-3xl font-bold mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-6">Add some items to proceed to checkout.</p>
        <button onClick={() => navigate('/')} className="bg-[#1a1a1a] text-white px-8 py-3 rounded-full hover:bg-black transition-colors">
            Go Shopping
        </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-12 pb-24 px-6 md:px-12 font-sans text-[#1a1a1a]">
      <div className="max-w-6xl mx-auto">
        {/* Steps / Header */}
        <div className="text-center mb-12">
            <h1 className="font-serif text-4xl mb-4">Secure Checkout</h1>
            <div className="flex justify-center items-center gap-4 text-sm font-medium text-gray-500">
                <span className="text-[#D96C46] flex items-center gap-1"><CheckCircle size={14}/> Cart</span>
                <span className="w-12 h-[1px] bg-gray-300"></span>
                <span className="text-[#1a1a1a] flex items-center gap-1"><CreditCard size={14}/> Details & Payment</span>
                <span className="w-12 h-[1px] bg-gray-300"></span>
                <span className="text-gray-300">Confirmation</span>
            </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Left: Shipping Info */}
          <div className="flex-1 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                    <MapPin className="text-[#D96C46]" />
                    <h2 className="font-serif text-xl">Shipping Address</h2>
                </div>
                
                <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                                <Home size={14} /> Address
                            </label>
                            <input 
                                type="text" 
                                className="w-full border-b border-gray-200 py-3 focus:border-[#D96C46] focus:outline-none transition-colors bg-transparent"
                                placeholder="Street Address, Apt, Suite"
                                value={address} 
                                onChange={e => setAddress(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">City</label>
                            <input 
                                type="text" 
                                className="w-full border-b border-gray-200 py-3 focus:border-[#D96C46] focus:outline-none transition-colors bg-transparent"
                                value={city} 
                                onChange={e => setCity(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                            <Smartphone size={14} /> Phone Number
                        </label>
                        <input 
                            type="text" 
                            className="w-full border-b border-gray-200 py-3 focus:border-[#D96C46] focus:outline-none transition-colors bg-transparent"
                            placeholder="+880 1XXX-XXXXXX"
                            value={phone} 
                            onChange={e => setPhone(e.target.value)} 
                            required 
                        />
                    </div>
                    
                    <div className="pt-4">
                        <h3 className="text-sm font-bold text-gray-900 mb-3">Pinpoint Delivery Location</h3>
                        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                            <MapSelector location={location} setLocation={setLocation} />
                        </div>
                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                            <MapPin size={12} /> Drag marker to exact building entrance
                        </p>
                    </div>
                </form>
            </div>
            
            {/* Payment Method Preview (Static for now as Stripe is next step) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 opacity-50 cursor-not-allowed">
                <div className="flex items-center gap-3 mb-4">
                    <CreditCard className="text-gray-400" />
                    <h2 className="font-serif text-xl text-gray-400">Payment Method</h2>
                </div>
                <p className="text-sm text-gray-400">Secure payment details will be entered on the next step via Stripe.</p>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sticky top-6">
                <h2 className="font-serif text-2xl mb-6">Order Summary</h2>
                
                {/* Order Items Preview (Collapsible or Limited List) */}
                <div className="mb-6 space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {cart.map(item => (
                        <div key={item._id} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#FAF9F6] rounded-md overflow-hidden flex items-center justify-center">
                                     <img 
                                        src={item.images?.[0] ? (item.images[0].startsWith('http') ? item.images[0] : `https://nextgen-lifestyles-server-update.onrender.com${item.images[0]}`) : ''} 
                                        alt="" 
                                        className="w-full h-full object-contain"
                                     />
                                </div>
                                <span className="text-gray-600 truncate max-w-[120px]">{item.name}</span>
                                <span className="text-xs text-gray-400">x{item.qty || item.quantity}</span>
                            </div>
                            <span className="font-medium">${(item.price * (item.qty || item.quantity)).toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                <div className="border-t border-gray-100 my-4"></div>

                <div className="space-y-3 text-sm mb-6">
                    <div className="flex justify-between text-gray-600">
                        <span>Items Subtotal</span>
                        <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                        {shippingPrice === 0 ? (
                            <span className="text-green-600 font-medium">Free</span>
                        ) : (
                            <span>${shippingPrice.toFixed(2)}</span>
                        )}
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Tax (5%)</span>
                        <span>${taxPrice.toFixed(2)}</span>
                    </div>
                </div>

                <div className="flex justify-between items-end mb-8 pt-4 border-t border-gray-100">
                    <span className="font-serif text-lg">Total</span>
                    <span className="font-serif text-3xl font-medium text-[#1a1a1a]">${finalTotal.toFixed(2)}</span>
                </div>

                <button 
                    onClick={handlePlaceOrder} 
                    disabled={loading}
                    className="w-full bg-[#1a1a1a] text-white py-4 rounded-full font-medium hover:bg-black transition-all shadow-lg hover:shadow-xl flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>Processing...</>
                    ) : (
                        <>Place Order & Pay <ArrowRight size={18} /></>
                    )}
                </button>
                
                <p className="text-xs text-gray-400 text-center mt-4 flex items-center justify-center gap-1">
                    <CreditCard size={12}/> Encrypted & Secure Payment
                </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;