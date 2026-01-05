import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { User, Lock, Mail, Phone, MapPin, Camera, Save, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const Profile = () => {
  const { user: authUser, login } = useAuth(); 
  const token = localStorage.getItem("token");

  // 1. Local Form State
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    avatar: "", 
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null); // For immediate image preview

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  // 2. Populate Form
  useEffect(() => {
    if (authUser) {
      setUser({
        name: authUser.name || "",
        email: authUser.email || "",
        phone: authUser.phone || "",
        address: authUser.address || "",
        avatar: authUser.avatar || "",
      });
    }
  }, [authUser]);

  // Handle File Selection & Preview
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
        setFile(selected);
        setPreview(URL.createObjectURL(selected));
    }
  };

  // Handle Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("name", user.name);
    formData.append("phone", user.phone);
    formData.append("address", user.address);
    if (file) formData.append("avatar", file);

    try {
      const res = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Profile updated successfully");
        login(data, token); 
        setFile(null);
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/users/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwords),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Password changed successfully");
        setPasswords({ currentPassword: "", newPassword: "" });
      } else {
        setError(data.message || "Failed to update password");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  // Helper for Avatar URL
  const getAvatarUrl = () => {
      if (preview) return preview;
      if (user.avatar) return user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`;
      return null;
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans text-[#1a1a1a] py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 text-center">
            <h1 className="font-serif text-4xl font-bold mb-2">Account Settings</h1>
            <p className="text-gray-500">Manage your personal information and security</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
            <div className="bg-white p-1 rounded-full border border-gray-200 shadow-sm inline-flex">
                <button 
                    onClick={() => { setActiveTab('details'); setMessage(''); setError(''); }}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'details' ? 'bg-[#1a1a1a] text-white shadow-md' : 'text-gray-500 hover:text-[#1a1a1a]'}`}
                >
                    Personal Details
                </button>
                <button 
                    onClick={() => { setActiveTab('security'); setMessage(''); setError(''); }}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'security' ? 'bg-[#1a1a1a] text-white shadow-md' : 'text-gray-500 hover:text-[#1a1a1a]'}`}
                >
                    Security
                </button>
            </div>
        </div>

        {/* Feedback Messages */}
        {(message || error) && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm animate-fade-in ${message ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                {message ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}
                <span>{message || error}</span>
            </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            
            {/* === Tab 1: Personal Details === */}
            {activeTab === 'details' && (
                <div className="p-8 md:p-12">
                    <form onSubmit={handleUpdateProfile} className="flex flex-col md:flex-row gap-12">
                        
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center gap-4 md:w-1/3">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#FAF9F6] shadow-md bg-gray-100 flex items-center justify-center">
                                    {getAvatarUrl() ? (
                                        <img src={getAvatarUrl()} alt="avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl font-serif text-gray-400 font-bold">{user.name?.charAt(0)}</span>
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 bg-[#1a1a1a] text-white p-2 rounded-full cursor-pointer hover:bg-[#D96C46] transition-colors shadow-lg">
                                    <Camera size={16} />
                                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                </label>
                            </div>
                            <div className="text-center">
                                <h3 className="font-serif text-xl font-bold">{user.name}</h3>
                                <p className="text-xs text-gray-400 mt-1">{user.email}</p>
                            </div>
                        </div>

                        {/* Fields Section */}
                        <div className="flex-1 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-0 top-3 text-gray-400" size={18} />
                                        <input 
                                            type="text" 
                                            className="w-full pl-8 py-2.5 border-b border-gray-200 focus:border-[#D96C46] focus:outline-none transition-colors bg-transparent placeholder-gray-300"
                                            value={user.name} 
                                            onChange={(e) => setUser({...user, name: e.target.value})} 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-0 top-3 text-gray-400" size={18} />
                                        <input 
                                            type="email" 
                                            className="w-full pl-8 py-2.5 border-b border-gray-200 text-gray-400 bg-transparent cursor-not-allowed"
                                            value={user.email} 
                                            disabled 
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-0 top-3 text-gray-400" size={18} />
                                    <input 
                                        type="text" 
                                        className="w-full pl-8 py-2.5 border-b border-gray-200 focus:border-[#D96C46] focus:outline-none transition-colors bg-transparent placeholder-gray-300"
                                        placeholder="+1 (555) 000-0000"
                                        value={user.phone} 
                                        onChange={(e) => setUser({...user, phone: e.target.value})} 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-0 top-3 text-gray-400" size={18} />
                                    <textarea 
                                        className="w-full pl-8 py-2 border-b border-gray-200 focus:border-[#D96C46] focus:outline-none transition-colors bg-transparent placeholder-gray-300 min-h-[80px]"
                                        placeholder="Enter your shipping address"
                                        value={user.address} 
                                        onChange={(e) => setUser({...user, address: e.target.value})} 
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="bg-[#1a1a1a] text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-black transition-all shadow-lg flex items-center gap-2 disabled:opacity-70"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* === Tab 2: Security === */}
            {activeTab === 'security' && (
                <div className="p-8 md:p-12 max-w-lg mx-auto">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-orange-50 text-[#D96C46] rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock size={24} />
                        </div>
                        <h3 className="font-serif text-xl font-bold">Change Password</h3>
                        <p className="text-xs text-gray-500 mt-1">Ensure your account uses a strong, unique password.</p>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-6">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Current Password</label>
                            <input 
                                type="password" 
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#D96C46] focus:ring-1 focus:ring-[#D96C46] transition-all bg-[#FAF9F6]"
                                placeholder="••••••••"
                                value={passwords.currentPassword}
                                onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">New Password</label>
                            <input 
                                type="password" 
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#D96C46] focus:ring-1 focus:ring-[#D96C46] transition-all bg-[#FAF9F6]"
                                placeholder="••••••••"
                                value={passwords.newPassword}
                                onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                                required
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-[#D96C46] text-white py-3 rounded-xl font-medium hover:bg-[#b05535] transition-all shadow-md mt-4 disabled:opacity-70"
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default Profile;