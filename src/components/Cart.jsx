import { useContext, useState } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag, Tag } from 'lucide-react';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useContext(CartContext);
  const navigate = useNavigate();

  // ==============================
  // 1. Coupon State & Logic
  // ==============================
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [loading, setLoading] = useState(false);

  const discountAmount = (totalPrice * discount) / 100;
  const finalTotal = totalPrice - discountAmount;

  const applyCoupon = async () => {
    if (!couponCode) return;
    setCouponMsg(''); 
    setLoading(true);

    try {
        const res = await fetch('https://nextgen-lifestyles-server-update.onrender.com/api/coupons/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: couponCode, cartTotal: totalPrice })
        });
        
        const data = await res.json();

        if (res.ok) {
            setDiscount(data.discountPercentage);
            setAppliedCoupon(data.code);
            setCouponMsg('success');
        } else {
            setDiscount(0);
            setAppliedCoupon(null);
            setCouponMsg(data.message);
        }
    } catch (err) {
        console.error(err);
        setCouponMsg('Network Error');
    } finally {
        setLoading(false);
    }
  };

  // ==============================
  // 2. Empty Cart View
  // ==============================
  if (cart.length === 0) return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#FAF9F6] text-[#1a1a1a]">
      <div className="bg-white p-8 rounded-full shadow-sm mb-6">
        <ShoppingBag size={48} strokeWidth={1} className="text-[#D96C46]" />
      </div>
      <h2 className="font-serif text-4xl mb-3">Your Cart is Empty</h2>
      <p className="text-gray-500 mb-8 max-w-md text-center">
        Looks like you haven't added any luxury items to your bag yet.
      </p>
      <Link 
        to="/" 
        className="px-8 py-3 bg-[#1a1a1a] text-white rounded-full hover:bg-black transition-all flex items-center gap-2"
      >
        Start Shopping <ArrowRight size={18} />
      </Link>
    </div>
  );

  // ==============================
  // 3. Main Cart View
  // ==============================
  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-12 pb-24 px-6 md:px-12 font-sans text-[#1a1a1a]">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-serif text-4xl mb-12 text-center md:text-left">Shopping Cart <span className="text-gray-400 font-sans text-lg ml-2">({cart.length} Items)</span></h1>

        <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-start">
          
          {/* Left Side: Cart Items List */}
          <div className="space-y-6">
            {cart.map((item) => (
              <div key={item._id} className="group bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 flex gap-6 items-center transition-all hover:shadow-md">
                
                {/* Product Image */}
                <div className="w-24 h-24 md:w-32 md:h-32 bg-[#F4F1ED] rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center">
                  <img 
                    src={
                        item.images && item.images[0] 
                        ? (item.images[0].startsWith('http') ? item.images[0] : `https://nextgen-lifestyles-server-update.onrender.com${item.images[0]}`) 
                        : "https://placehold.co/150"
                    } 
                    alt={item.name} 
                    className="object-contain h-full w-full p-2 group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="font-serif text-xl text-[#1a1a1a]">{item.name}</h2>
                    <p className="text-gray-500 text-sm">Category: {item.category || 'Luxury'}</p>
                    {/* Optional: Show selected options */}
                    {(item.color || item.size) && (
                        <div className="flex gap-2 text-xs text-gray-400 uppercase tracking-wide mt-1">
                            {item.color && <span>{item.color}</span>}
                            {item.size && <span>| {item.size}</span>}
                        </div>
                    )}
                    <p className="md:hidden font-medium text-[#D96C46] mt-2">${item.price}</p>
                  </div>

                  {/* Controls Wrapper */}
                  <div className="flex items-center justify-between md:gap-12 w-full md:w-auto mt-2 md:mt-0">
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4 bg-[#FAF7F5] rounded-full px-4 py-2">
                        <button 
                            onClick={() => updateQuantity(item._id, Math.max(1, (item.qty || item.quantity) - 1))} 
                            className="text-gray-500 hover:text-[#1a1a1a] transition-colors"
                        >
                            <Minus size={16} />
                        </button>
                        <span className="font-medium w-4 text-center">{item.qty || item.quantity}</span>
                        <button 
                            onClick={() => updateQuantity(item._id, (item.qty || item.quantity) + 1)} 
                            className="text-gray-500 hover:text-[#1a1a1a] transition-colors"
                        >
                            <Plus size={16} />
                        </button>
                    </div>

                    {/* Price Desktop */}
                    <p className="hidden md:block font-medium text-lg">${(item.price * (item.qty || item.quantity)).toFixed(2)}</p>

                    {/* Remove Button */}
                    <button 
                        onClick={() => removeFromCart(item._id)} 
                        className="text-gray-400 hover:text-red-500 transition-colors p-2"
                        title="Remove Item"
                    >
                        <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Side: Order Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sticky top-6">
            <h2 className="font-serif text-2xl mb-6">Order Summary</h2>
            
            <div className="space-y-4 text-sm mb-6 border-b border-gray-100 pb-6">
              <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#1a1a1a]">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                  <span>Shipping Estimate</span>
                  <span className="text-gray-400">Calculated at checkout</span>
              </div>
              {/* Discount Row */}
              {discount > 0 && (
                  <div className="flex justify-between text-[#D96C46] font-medium bg-orange-50 p-2 rounded-lg">
                      <span>Discount ({discount}%)</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                  </div>
              )}
            </div>

            {/* Final Total */}
            <div className="flex justify-between items-end mb-8">
                <span className="font-serif text-lg">Total</span>
                <span className="font-serif text-3xl font-medium text-[#1a1a1a]">${finalTotal.toFixed(2)}</span>
            </div>

            {/* Coupon Input */}
            <div className="mb-8">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block flex items-center gap-2">
                    <Tag size={14} /> Promo Code
                </label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="ENTER CODE" 
                        className="flex-1 bg-[#FAF7F5] border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#D96C46] uppercase placeholder:normal-case outline-none transition-all"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <button 
                        onClick={applyCoupon} 
                        disabled={loading || !couponCode}
                        className="bg-[#D96C46] text-white px-6 rounded-lg text-sm font-medium hover:bg-[#b05535] disabled:opacity-50 transition-colors"
                    >
                        {loading ? '...' : 'Apply'}
                    </button>
                </div>
                {couponMsg && (
                    <p className={`text-xs mt-2 font-medium flex items-center gap-1 ${couponMsg === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                        {couponMsg === 'success' ? '✅ Coupon applied successfully' : `❌ ${couponMsg}`}
                    </p>
                )}
            </div>

            {/* Checkout Button */}
            <button 
                onClick={() => navigate('/checkout')} 
                className="w-full bg-[#1a1a1a] text-white py-4 rounded-full font-medium hover:bg-black transition-all shadow-lg hover:shadow-xl flex justify-center items-center gap-2"
            >
                Proceed to Checkout <ArrowRight size={18} />
            </button>
            
            <p className="text-xs text-gray-400 text-center mt-4">
                Secure Checkout - 30 Day Returns
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;