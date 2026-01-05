import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ShieldCheck, Lock, CreditCard, ArrowLeft, Loader2 } from 'lucide-react';

// PUBLISHABLE KEY
const stripePromise = loadStripe('pk_test_51SD8fNGknryBHSAVAeOmfgy1Tjx3TzHmiJwbQhSveZLdZaZDbNwUKuR2HOSCdkkvRzXaxB7T4IihzvO6dxupSKEB00Wt9SrjAt');

const CheckoutForm = ({ amount, orderId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setMessage(error.message);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      await markOrderAsPaid(paymentIntent.id);
    } else {
      setIsProcessing(false);
    }
  };

  const markOrderAsPaid = async (paymentId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://nextgen-lifestyles-server-update.onrender.com/api/orders/${orderId}/pay`, {
        method: 'PUT',
        headers: { 
           'Content-Type': 'application/json',
           Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
            id: paymentId, 
            status: 'success', 
            update_time: Date.now() 
        })
      });

      if (res.ok) {
        navigate('/dashboard'); 
      } else {
        setMessage("Payment succeeded but failed to update order. Please contact support.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Connection error. Please contact support.");
    }
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="mb-6 p-1">
        <PaymentElement 
          options={{ 
            layout: "tabs",
            wallets: { applePay: 'never', googlePay: 'never' } 
          }} 
        />
      </div>
      
      <button 
        disabled={isProcessing || !stripe || !elements} 
        className="w-full bg-[#1a1a1a] hover:bg-black text-white py-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
      >
        {isProcessing ? (
            <>
                <Loader2 className="animate-spin" size={20} /> Processing...
            </>
        ) : (
            <>
                Pay ${amount.toFixed(2)}
            </>
        )}
      </button>
      
      {message && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100">
              <ShieldCheck size={16} /> {message}
          </div>
      )}
      
      <div className="mt-6 flex justify-center items-center gap-2 text-xs text-gray-400">
         <Lock size={12} /> SSL Encrypted Payment
      </div>
    </form>
  );
};

const PaymentForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { amount, orderId } = location.state || {};
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    if (!amount || !orderId) {
        navigate('/cart');
    }
  }, [amount, orderId, navigate]);

  useEffect(() => {
    if (!amount) return;

    const token = localStorage.getItem('token');
    
    fetch('https://nextgen-lifestyles-server-update.onrender.com/api/payment/create-intent', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ amount }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret))
      .catch((err) => console.error("Error fetching payment intent:", err));
  }, [amount]);

  if (!amount || !orderId) return null;

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] font-sans text-[#1a1a1a] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
         <Link to="/checkout" className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#D96C46] transition-colors mb-8 justify-center sm:justify-start">
             <ArrowLeft size={16} /> Cancel Payment
         </Link>
         
         <div className="text-center mb-8">
             <h1 className="font-serif text-3xl font-bold text-[#1a1a1a]">Secure Checkout</h1>
             <p className="mt-2 text-sm text-gray-500">Complete your purchase securely via Stripe</p>
         </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-100 sm:rounded-3xl sm:px-10 border border-gray-100 relative overflow-hidden">
           
           {/* Top Accent */}
           <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#1a1a1a] to-[#D96C46]"></div>

           {/* Order Summary in Card */}
           <div className="mb-8 p-4 bg-[#FAF9F6] rounded-xl border border-gray-100 flex justify-between items-center">
               <div>
                   <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Total to Pay</p>
                   <p className="text-2xl font-serif font-bold text-[#D96C46]">${amount.toFixed(2)}</p>
               </div>
               <div className="text-right">
                   <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Order ID</p>
                   <p className="font-mono text-sm font-medium">#{orderId.slice(-6).toUpperCase()}</p>
               </div>
           </div>

           {clientSecret ? (
            <Elements options={{ clientSecret, theme: 'stripe', appearance: { theme: 'stripe', variables: { colorPrimary: '#D96C46' } } }} stripe={stripePromise}>
              <CheckoutForm amount={amount} orderId={orderId} />
            </Elements>
           ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <span className="loading loading-spinner loading-lg text-[#D96C46]"></span>
              <p className="text-sm text-gray-400 mt-4">Initializing Secure Payment...</p>
            </div>
           )}
        </div>
        
        <div className="mt-6 text-center">
           <div className="flex justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
               {/* Just visual placeholders for card icons */}
               <CreditCard size={24} />
               <CreditCard size={24} />
               <CreditCard size={24} />
           </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;