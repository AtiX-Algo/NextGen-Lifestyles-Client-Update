import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 1. Initialize email from navigation state, or empty string
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 2. Validate inputs before sending
    if (!email || !otp) {
        setError("Please provide both Email and OTP");
        return;
    }
    
    try {
      console.log("Sending Data:", { email, otp }); // Debug Log

      const response = await fetch('http://localhost:5000/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();

      if (response.ok) {
        setSuccess('Verified! Logging you in...');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      setError('Network error: Is the server running?');
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl font-bold mb-4">Verify OTP</h2>
          
          <p className="text-center text-sm text-gray-500 mb-4">
            Enter the verification code sent to your email.
          </p>

          {error && <div className="alert alert-error text-sm py-2 mb-4">{error}</div>}
          {success && <div className="alert alert-success text-sm py-2 mb-4">{success}</div>}

          <form onSubmit={handleSubmit}>
            {/* 3. If email is missing (page refresh), show Input to type it */}
            <div className="form-control w-full mb-2">
                <label className="label"><span className="label-text">Email</span></label>
                <input 
                    type="email" 
                    placeholder="name@example.com" 
                    className="input input-bordered w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    // Disable if we already have the email from signup
                    disabled={!!location.state?.email} 
                />
            </div>

            <div className="form-control w-full">
              <label className="label"><span className="label-text">OTP Code</span></label>
              <input 
                type="text" 
                placeholder="XXXXXX" 
                className="input input-bordered text-center text-2xl tracking-widest" 
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required 
              />
            </div>

            <div className="card-actions justify-center mt-6">
              <button type="submit" className="btn btn-primary w-full">Verify</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;