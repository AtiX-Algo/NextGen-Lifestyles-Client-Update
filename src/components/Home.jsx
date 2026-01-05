import { useEffect, useState, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import Recommendations from './Recommendations';
import { Heart, Search, ShoppingBag, Star, ArrowRight, Menu } from 'lucide-react'; // Assuming you can use lucide-react icons, if not swap with emojis or svgs

// ✨ NextGen Luxury Ecommerce Home Page
// Theme: Soft Beige, Serif Fonts, Minimalist
// Tech: React + TailwindCSS + DaisyUI

const Home = () => {
  const { addToCart } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const priceRange = searchParams.get('price') || '';

  // Mock Categories for the Visual Grid (from Image)
  const visualCategories = [
    { name: 'Women', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800', count: '12 Items' },
    { name: 'Men', img: 'https://images.unsplash.com/photo-1488161628813-99c974c76949?auto=format&fit=crop&q=80&w=800', count: '8 Items' },
    { name: 'Accessories', img: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=800', count: '15 Items' },
    { name: 'Home', img: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=800', count: '24 Items' },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `https://nextgen-lifestyles-server-update.onrender.com/api/products?keyword=${keyword}`;
        if (category) url += `&category=${category}`;
        if (priceRange) {
          if (priceRange === '200+') url += `&minPrice=200`;
          else {
            const [min, max] = priceRange.split('-');
            if (min) url += `&minPrice=${min}`;
            if (max) url += `&maxPrice=${max}`;
          }
        }
        const res = await fetch(url);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
        // Fallback mock data if API fails so UI still looks good for demo
        setProducts([]); 
      } finally {
        setLoading(false);
      }
    };

    const t = setTimeout(fetchProducts, 400);
    return () => clearTimeout(t);
  }, [keyword, category, priceRange]);

  return (
    <div className="bg-[#FAF9F6] text-[#2C2C2C] min-h-screen font-sans">
      
      {/* ================= HERO SECTION ================= */}
      {/* Matching the top image: Soft gradient background with overlay items */}
      <section className="relative w-full pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-[#EFEBE4] to-transparent -z-10 opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in-up">
            <span className="uppercase tracking-[0.2em] text-xs font-semibold text-[#8B7E74]">
              Premium Collection 2026
            </span>
            <h1 className="font-serif text-5xl md:text-7xl leading-[1.1] text-[#1a1a1a]">
              Elevate Your <br />
              <span className="italic text-[#A68A76]">Everyday</span> Style
            </h1>
            <p className="text-[#595959] text-lg max-w-md leading-relaxed">
              Discover curated essentials crafted with premium quality. 
              Timeless fashion designed for modern living.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button className="btn bg-[#2C2C2C] hover:bg-black text-white rounded-full px-8 py-3 h-auto border-none tracking-wide text-sm font-medium transition-all hover:scale-105">
                Shop Collection
              </button>
              <button className="btn btn-outline border-[#2C2C2C] text-[#2C2C2C] hover:bg-[#2C2C2C] hover:text-white rounded-full px-8 py-3 h-auto tracking-wide text-sm font-medium">
                Explore Lookbook
              </button>
            </div>
          </div>

          <div className="relative z-10 hidden lg:block">
            {/* Visual composition mimicking the glasses/watch image */}
            <div className="relative">
               <img 
                 src="https://images.unsplash.com/photo-1614165936126-2ed18e471b10?q=80&w=800&auto=format&fit=crop" 
                 alt="Luxury Watch"
                 className="rounded-[2rem] shadow-2xl rotate-[-6deg] w-[70%] ml-auto object-cover aspect-[4/5]"
               />
               <img 
                 src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop" 
                 alt="Sunglasses"
                 className="absolute bottom-[-40px] left-10 w-[50%] rounded-2xl shadow-xl border-4 border-white object-cover aspect-video"
               />
            </div>
          </div>
        </div>
      </section>

      {/* ================= SHOP BY CATEGORY ================= */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
           <h2 className="font-serif text-3xl md:text-4xl text-[#1a1a1a] mb-3">Shop by Category</h2>
           <p className="text-gray-500 text-sm tracking-wide">Browse our curated selections</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {visualCategories.map((cat, idx) => (
             <div 
               key={idx} 
               onClick={() => {
                 searchParams.set('category', cat.name);
                 setSearchParams(searchParams);
               }}
               className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500"
             >
               <img 
                 src={cat.img} 
                 alt={cat.name} 
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
               />
               <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
               <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                 <h3 className="font-serif text-2xl mb-1">{cat.name}</h3>
                 <div className="flex items-center justify-between">
                   <span className="text-xs uppercase tracking-wider opacity-90">{cat.count}</span>
                   <div className="bg-white/20 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                     <ArrowRight size={16} />
                   </div>
                 </div>
               </div>
             </div>
          ))}
        </div>
      </section>

      {/* ================= MAIN CONTENT (Filter + Products) ================= */}
      <section className="max-w-7xl mx-auto px-6 py-12" id="shop">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-[#e5e5e5] pb-4">
          <div>
            <h2 className="font-serif text-3xl text-[#1a1a1a]">Featured Products</h2>
            <p className="text-gray-500 text-sm mt-1">Hand-picked for the season</p>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
             <span className="text-sm text-gray-500">Sort by:</span>
             <select className="select select-sm select-ghost w-full max-w-xs focus:outline-none text-[#2C2C2C]">
               <option>Newest Arrivals</option>
               <option>Price: Low to High</option>
               <option>Price: High to Low</option>
             </select>
          </div>
        </div>

        <div className="grid lg:grid-cols-[240px_1fr] gap-12">
          
          {/* SIDEBAR FILTERS */}
          <aside className="hidden lg:block space-y-10 sticky top-24 h-fit">
            <div>
              <h3 className="font-medium text-lg mb-5 border-b pb-2">Categories</h3>
              <ul className="space-y-3">
                {['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports'].map(cat => (
                  <li key={cat}>
                    <button
                      onClick={() => {
                         searchParams.set('category', cat);
                         setSearchParams(searchParams);
                      }}
                      className={`text-sm w-full text-left transition-colors hover:text-[#A68A76] ${category === cat ? 'font-bold text-[#A68A76]' : 'text-gray-600'}`}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-5 border-b pb-2">Price Range</h3>
              <div className="space-y-3">
                {['0-50', '50-100', '100-200', '200+'].map(range => (
                  <label key={range} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center ${priceRange === range ? 'border-[#A68A76]' : ''}`}>
                      {priceRange === range && <div className="w-2 h-2 bg-[#A68A76] rounded-full"></div>}
                    </div>
                    <input
                      type="radio"
                      className="hidden"
                      checked={priceRange === range}
                      onChange={() => {
                        searchParams.set('price', range);
                        setSearchParams(searchParams);
                      }}
                    />
                    <span className={`text-sm group-hover:text-[#A68A76] ${priceRange === range ? 'text-[#1a1a1a] font-medium' : 'text-gray-600'}`}>
                      {range === '200+' ? '$200+' : `$${range.replace('-', ' - $')}`}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* PRODUCT GRID */}
          <div className="min-h-[600px]">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg text-[#A68A76]"></span>
              </div>
            ) : products.length === 0 ? (
               <div className="text-center py-20 text-gray-500">
                 <p>No products found matching your criteria.</p>
                 <button onClick={() => setSearchParams({})} className="btn btn-link text-[#A68A76]">Clear Filters</button>
               </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                {products.map((product) => (
                  <div key={product._id} className="group relative">
                    {/* Image Container */}
                    <div className="relative bg-[#F4F1ED] rounded-xl overflow-hidden aspect-[3/4] mb-4">
                      {/* Badge */}
                      <span className="absolute top-3 left-3 bg-white text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-sm shadow-sm z-10">
                        New
                      </span>
                      {/* Wishlist Btn */}
                      <button className="absolute top-3 right-3 bg-white/80 p-2 rounded-full hover:bg-white transition-colors z-10 opacity-0 group-hover:opacity-100">
                        <Heart size={16} />
                      </button>
                      
                      <img
                        src={product.images?.[0] ? `http://localhost:5000${product.images[0]}` : 'https://placehold.co/400x600/e0e0e0/808080?text=Product'}
                        alt={product.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      
                      {/* Add to Cart - Slide Up on Hover */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                         <button 
                           onClick={() => addToCart(product, 1)}
                           className="w-full btn bg-[#1a1a1a] text-white border-none hover:bg-black rounded-lg shadow-lg flex gap-2 items-center justify-center"
                         >
                           <ShoppingBag size={16} /> Add to Cart
                         </button>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-start">
                        <Link to={`/product/${product._id}`} className="font-serif text-lg text-[#1a1a1a] hover:text-[#A68A76] transition-colors line-clamp-1">
                          {product.name}
                        </Link>
                      </div>
                      <div className="flex items-center gap-1 text-[#D4AF37] text-xs">
                        {[1,2,3,4,5].map(s => <Star key={s} size={12} fill="currentColor" />)}
                        <span className="text-gray-400 ml-1">(4.8)</span>
                      </div>
                      <p className="font-semibold text-[#1a1a1a]">${product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= OFFER BANNER ================= */}
      {/* Matches the dark section at the bottom of the image */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden relative bg-[#1E1B18] text-white">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop')] opacity-20 bg-cover bg-center mix-blend-overlay"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-12 md:p-20 gap-10">
            <div className="max-w-xl">
               <span className="bg-white/10 text-white text-xs px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm">Limited Offer</span>
               <h2 className="font-serif text-4xl md:text-5xl mt-6 leading-tight">
                 Get 25% Off Your <br/><span className="italic text-[#C5A289]">First Order</span>
               </h2>
               <p className="mt-4 text-gray-300 text-lg">
                 Join our newsletter to receive exclusive offers and the latest news on our collection. Use code <span className="text-white font-bold bg-white/20 px-2 rounded">WELCOME25</span>
               </p>
            </div>
            <div className="flex flex-col gap-4 w-full md:w-auto">
               <button className="btn bg-white text-[#1E1B18] hover:bg-gray-100 border-none rounded-full px-10 h-12 text-md">
                 Subscribe & Save
               </button>
               <p className="text-xs text-center text-gray-500">No spam, unsubscribe anytime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="max-w-7xl mx-auto px-6 pb-24 text-center">
        <h2 className="font-serif text-3xl mb-12">What Our Customers Say</h2>
        <div className="grid md:grid-cols-3 gap-8">
           {[1, 2, 3].map((item) => (
             <div key={item} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-left">
               <div className="flex text-[#D4AF37] mb-4 gap-1">
                 {[1,2,3,4,5].map(s => <Star key={s} size={14} fill="currentColor" />)}
               </div>
               <p className="text-gray-600 mb-6 italic leading-relaxed">
                 "Absolutely love the quality. The packaging was immaculate and the product exceeded my expectations. Will definitely shop here again."
               </p>
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?img=${item + 20}`} alt="User" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#1a1a1a]">Sarah James</p>
                    <p className="text-xs text-gray-400">Verified Buyer</p>
                  </div>
               </div>
             </div>
           ))}
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-[#1a1a1a] text-white pt-20 pb-10 border-t border-gray-800">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="space-y-4">
               <h4 className="font-serif text-2xl">NextGen.</h4>
               <p className="text-gray-400 text-sm leading-relaxed">
                 Elevating your lifestyle with premium curated goods. Quality, Esthetics, and Comfort in every detail.
               </p>
            </div>
            
            {[
              { title: 'Shop', links: ['New Arrivals', 'Best Sellers', 'Accessories', 'Sale'] },
              { title: 'Help', links: ['Shipping & Delivery', 'Returns', 'Size Guide', 'Contact Us'] },
              { title: 'Company', links: ['Our Story', 'Sustainability', 'Careers', 'Terms & Conditions'] },
            ].map((col, idx) => (
              <div key={idx}>
                <h5 className="font-bold mb-6 tracking-wide">{col.title}</h5>
                <ul className="space-y-3 text-sm text-gray-400">
                  {col.links.map(link => (
                    <li key={link} className="hover:text-white cursor-pointer transition-colors">{link}</li>
                  ))}
                </ul>
              </div>
            ))}
         </div>
         
         <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
            <p>&copy; 2026 NextGen Luxury. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
               <span>Privacy Policy</span>
               <span>Terms of Service</span>
            </div>
         </div>
      </footer>

    </div>
  );
};

export default Home;