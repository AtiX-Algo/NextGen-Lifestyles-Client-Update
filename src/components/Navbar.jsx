import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Search, ShoppingBag, User, Menu, X, LogOut, Shield, Truck, Heart } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const { totalItems } = useContext(CartContext);
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/?keyword=${keyword}`);
      setIsMobileMenuOpen(false);
    } else {
      navigate('/');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
        
        {/* 1. Mobile Menu Toggle */}
        <button 
          className="lg:hidden text-[#1a1a1a]"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* 2. Logo */}
        <div className="flex-1 lg:flex-none flex justify-center lg:justify-start">
          <Link to="/" className="text-2xl font-serif font-bold text-[#1a1a1a] tracking-tight">
            NextGen LiyeStyle<span className="text-[#D96C46]">.</span>
          </Link>
        </div>

        {/* 3. Desktop Search Bar */}
        <div className="hidden lg:flex flex-1 max-w-lg mx-auto">
          <form onSubmit={handleSearch} className="relative w-full group">
            <input 
              type="text" 
              placeholder="Search essentials..." 
              className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F6] border-none rounded-full text-sm focus:ring-1 focus:ring-[#D96C46] outline-none transition-all placeholder-gray-400 text-[#1a1a1a]" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#D96C46] transition-colors" size={18} />
          </form>
        </div>

        {/* 4. Right Side Actions */}
        <div className="flex items-center gap-4 md:gap-6">
          
          {/* Cart Icon */}
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="relative cursor-pointer group p-1">
              <ShoppingBag size={24} className="text-[#1a1a1a] group-hover:text-[#D96C46] transition-colors" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#D96C46] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {totalItems}
                </span>
              )}
            </label>
            <div tabIndex={0} className="mt-4 z-[1] card card-compact dropdown-content w-64 bg-white shadow-xl border border-gray-100 rounded-2xl">
              <div className="card-body">
                <span className="font-serif font-bold text-lg text-[#1a1a1a]">{totalItems} Items in Bag</span>
                <div className="card-actions mt-2">
                  <Link to="/cart" className="w-full py-3 bg-[#1a1a1a] text-white rounded-full text-center text-sm font-medium hover:bg-black transition-colors">
                    View Cart
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* User Menu */}
          {user ? (
            <div className="dropdown dropdown-end hidden lg:block">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar placeholder">
                <div className="bg-[#FAF9F6] text-[#D96C46] rounded-full w-10 h-10 flex items-center justify-center border border-gray-100 hover:border-[#D96C46] transition-colors">
                  {user.avatar ? (
                     <img src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`} alt="avatar" />
                  ) : (
                     <span className="text-lg font-serif font-bold">{user.name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </label>
              <ul tabIndex={0} className="mt-4 z-[1] p-2 shadow-xl border border-gray-100 menu menu-sm dropdown-content bg-white rounded-2xl w-56">
                <li className="menu-title px-4 py-2 text-xs uppercase tracking-widest text-gray-400">Account</li>
                <li><Link to="/dashboard" className="py-2 hover:bg-[#FAF9F6] rounded-lg">Dashboard</Link></li>
                <li><Link to="/profile" className="py-2 hover:bg-[#FAF9F6] rounded-lg">Profile</Link></li>
                <li><Link to="/wishlist" className="py-2 hover:bg-[#FAF9F6] rounded-lg">Wishlist</Link></li>
                
                {(user.role === 'admin' || user.role === 'delivery_man') && (
                  <>
                    <div className="divider my-1"></div>
                    <li className="menu-title px-4 py-2 text-xs uppercase tracking-widest text-gray-400">Management</li>
                  </>
                )}
                
                {user.role === 'admin' && (
                  <li><Link to="/admin-dashboard" className="py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium">Admin Panel</Link></li>
                )}
                {user.role === 'delivery_man' && (
                  <li><Link to="/delivery-dashboard" className="py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium">Delivery Panel</Link></li>
                )}

                <div className="divider my-1"></div>
                <li><button onClick={handleLogout} className="py-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg">Logout</button></li>
              </ul>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-[#1a1a1a] transition-colors">Login</Link>
              <Link to="/signup" className="px-5 py-2 bg-[#1a1a1a] text-white rounded-full text-sm font-medium hover:bg-black transition-colors shadow-md">Sign Up</Link>
            </div>
          )}
        </div>
      </div>

      {/* 5. Mobile Search Bar (Below Header) */}
      <div className="lg:hidden px-6 pb-4 border-b border-gray-50">
        <form onSubmit={handleSearch} className="relative w-full">
           <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F6] border-none rounded-xl text-sm focus:ring-1 focus:ring-[#D96C46] outline-none text-[#1a1a1a]" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </form>
      </div>

      {/* 6. Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-[100%] left-0 w-full bg-white shadow-xl border-t border-gray-100 p-6 flex flex-col gap-2 animate-fade-in-down">
           {user ? (
             <>
               <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-50">
                  <div className="w-12 h-12 bg-[#FAF9F6] rounded-full flex items-center justify-center text-[#D96C46] font-serif font-bold text-xl border border-gray-100">
                    {user.avatar ? (
                       <img src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`} alt="avatar" className="w-full h-full object-cover rounded-full" />
                    ) : (
                       user.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-[#1a1a1a]">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
               </div>
               
               <Link to="/dashboard" className="flex items-center gap-3 p-3 hover:bg-[#FAF9F6] rounded-xl text-gray-600 font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                  <User size={18} /> Dashboard
               </Link>
               <Link to="/wishlist" className="flex items-center gap-3 p-3 hover:bg-[#FAF9F6] rounded-xl text-gray-600 font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                  <Heart size={18} /> Wishlist
               </Link>

               {user.role === 'admin' && (
                 <Link to="/admin-dashboard" className="flex items-center gap-3 p-3 bg-red-50 text-red-600 rounded-xl font-medium mt-2" onClick={() => setIsMobileMenuOpen(false)}>
                    <Shield size={18} /> Admin Panel
                 </Link>
               )}
               {user.role === 'delivery_man' && (
                 <Link to="/delivery-dashboard" className="flex items-center gap-3 p-3 bg-blue-50 text-blue-600 rounded-xl font-medium mt-2" onClick={() => setIsMobileMenuOpen(false)}>
                    <Truck size={18} /> Delivery Panel
                 </Link>
               )}

               <button onClick={handleLogout} className="flex items-center gap-3 p-3 hover:bg-red-50 text-red-500 rounded-xl font-medium mt-2 w-full text-left">
                  <LogOut size={18} /> Logout
               </button>
             </>
           ) : (
             <div className="flex flex-col gap-3">
               <Link to="/login" className="w-full py-3 border border-gray-200 text-center rounded-xl font-medium text-gray-600" onClick={() => setIsMobileMenuOpen(false)}>
                 Log In
               </Link>
               <Link to="/signup" className="w-full py-3 bg-[#1a1a1a] text-white text-center rounded-xl font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                 Create Account
               </Link>
             </div>
           )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;