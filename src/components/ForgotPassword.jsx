import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Key, Lock, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: OTP+Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      const res = await fetch('https://nextgen-lifestyles-server-update.onrender.com/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setStep(2); // Move to next step
        setMessage('Recovery code sent to your email.');
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) { 
        setError('Network Error. Please try again.'); 
    } finally {
        setLoading(false);
    }
  };

  // Handle Reset Password
  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('https://nextgen-lifestyles-server-update.onrender.com/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage('Password successfully updated! Redirecting...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) { 
        setError('Network Error. Please try again.'); 
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6 font-sans text-[#1a1a1a]">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        
        <div className="p-8 md:p-10">
            {/* Header Icon */}
            <div className="w-12 h-12 bg-[#FAF9F6] rounded-full flex items-center justify-center mb-6 text-[#D96C46]">
                {step === 1 ? <Key size={24} /> : <Lock size={24} />}
            </div>

            <h2 className="font-serif text-3xl font-bold mb-2 text-[#1a1a1a]">
                {step === 1 ? 'Forgot Password?' : 'Reset Password'}
            </h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                {step === 1 
                    ? "Enter your email address and we'll send you a code to reset your password." 
                    : "Enter the code sent to your email and create a new secure password."}
            </p>

            {/* Alerts */}
            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm flex items-start gap-3">
                    <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}
            {message && (
                <div className="mb-6 p-4 rounded-xl bg-green-50 text-green-700 text-sm flex items-start gap-3">
                    <CheckCircle size={18} className="mt-0.5 flex-shrink-0" />
                    <span>{message}</span>
                </div>
            )}

            {/* Step 1: Email Form */}
            {step === 1 ? (
                <form onSubmit={handleSendOtp} className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-0 top-3 text-gray-400" size={18} />
                            <input 
                                type="email" 
                                className="w-full pl-8 py-2.5 border-b border-gray-200 focus:border-[#D96C46] focus:outline-none transition-colors bg-transparent placeholder-gray-300" 
                                placeholder="name@example.com"
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-[#1a1a1a] text-white py-4 rounded-full font-medium hover:bg-black transition-all shadow-lg hover:shadow-xl flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : 'Send Recovery Code'}
                    </button>
                </form>
            ) : (
                /* Step 2: Reset Form */
                <form onSubmit={handleReset} className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">OTP Code</label>
                        <div className="relative">
                            <Key className="absolute left-0 top-3 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                className="w-full pl-8 py-2.5 border-b border-gray-200 focus:border-[#D96C46] focus:outline-none transition-colors bg-transparent placeholder-gray-300 tracking-widest" 
                                placeholder="123456"
                                value={otp} 
                                onChange={(e) => setOtp(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-0 top-3 text-gray-400" size={18} />
                            <input 
                                type="password" 
                                className="w-full pl-8 py-2.5 border-b border-gray-200 focus:border-[#D96C46] focus:outline-none transition-colors bg-transparent placeholder-gray-300" 
                                placeholder="••••••••"
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-[#1a1a1a] text-white py-4 rounded-full font-medium hover:bg-black transition-all shadow-lg hover:shadow-xl flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : 'Set New Password'}
                    </button>
                </form>
            )}

            {/* Footer */}
            <div className="mt-8 text-center">
                <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a1a1a] transition-colors">
                    <ArrowLeft size={16} /> Back to Login
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;