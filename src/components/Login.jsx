import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Login Successful! Redirecting...');

                // ✅ Save token + user data
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                setTimeout(() => {
                    if (data.user.role === 'admin') {
                        navigate('/admin-dashboard');
                    } else if (data.user.role === 'delivery_man') {
                        navigate('/delivery-dashboard');
                    } else {
                        navigate('/dashboard');
                    }
                }, 800);
            } else {
                setError(data.message || 'Login failed');
                setLoading(false);
            }
        } catch (err) {
            setError('Network error. Is the server running?');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6 font-sans text-[#1a1a1a]">
            
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
                
                {/* Decorative Top Line */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#1a1a1a] to-[#D96C46]"></div>

                <div className="p-8 md:p-12">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="w-12 h-12 bg-[#FAF9F6] rounded-full flex items-center justify-center mx-auto mb-4 text-[#D96C46] font-serif font-bold text-xl">
                            N
                        </div>
                        <h2 className="font-serif text-3xl font-bold mb-2">Welcome Back</h2>
                        <p className="text-gray-500 text-sm">Sign in to access your curated collection</p>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm flex items-start gap-3 border border-red-100 animate-fade-in">
                            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 rounded-xl bg-green-50 text-green-700 text-sm flex items-start gap-3 border border-green-100 animate-fade-in">
                            <CheckCircle size={18} className="mt-0.5 flex-shrink-0" />
                            <span>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Email Input */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-0 top-3 text-gray-400 group-focus-within:text-[#D96C46] transition-colors" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="name@example.com"
                                    className="w-full pl-8 py-2.5 border-b border-gray-200 focus:border-[#D96C46] focus:outline-none transition-colors bg-transparent placeholder-gray-300"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-0 top-3 text-gray-400 group-focus-within:text-[#D96C46] transition-colors" size={18} />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    className="w-full pl-8 py-2.5 border-b border-gray-200 focus:border-[#D96C46] focus:outline-none transition-colors bg-transparent placeholder-gray-300"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="text-right mt-2">
                                <Link
                                    to="/forgot-password"
                                    className="text-xs text-gray-400 hover:text-[#D96C46] transition-colors"
                                >
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#1a1a1a] text-white py-4 rounded-full font-medium hover:bg-black transition-all shadow-lg hover:shadow-xl flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-8"
                        >
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>Sign In <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="text-center mt-8 pt-8 border-t border-gray-50">
                        <p className="text-sm text-gray-500">
                            Don’t have an account?{' '}
                            <Link to="/signup" className="text-[#1a1a1a] font-bold hover:text-[#D96C46] transition-colors">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;