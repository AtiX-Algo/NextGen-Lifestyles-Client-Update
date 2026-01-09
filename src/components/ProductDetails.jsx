import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Recommendations from "./Recommendations"; 
import { Star, Heart, Share2, ShoppingBag, ArrowRight } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useContext(CartContext);
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  const getProductImage = (prod) => {
    if (prod.images && prod.images[0]) {
      return prod.images[0].startsWith("http") ? prod.images[0] : `https://nextgen-lifestyles-server-update.onrender.com${prod.images[0]}`;
    }
    if (prod.image) {
      return prod.image.startsWith("http") ? prod.image : `https://nextgen-lifestyles-server-update.onrender.com${prod.image}`;
    }
    return "https://placehold.co/600x800"; 
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`https://nextgen-lifestyles-server-update.onrender.com/api/products/${id}`);
        const data = await res.json();
        setProduct(data);
        // Pre-select first option if available for better UX
        if(data.colors?.length > 0) setSelectedColor(data.colors[0]);
        if(data.sizes?.length > 0) setSelectedSize(data.sizes[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      alert("Please select a color");
      return;
    }
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert("Please select a size");
      return;
    }
    addToCart(product, 1, selectedColor, selectedSize);
    alert("Added to Cart!");
  };

  const handleToggleWishlist = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate('/login');

    try {
      const res = await fetch("https://nextgen-lifestyles-server-update.onrender.com/api/users/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product._id }),
      });
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      console.error(err);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');

    setReviewLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `https://nextgen-lifestyles-server-update.onrender.com/api/products/${id}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rating, comment }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setComment("");
        setRating(5);
        const refreshed = await fetch(`https://nextgen-lifestyles-server-update.onrender.com/api/products/${id}`);
        const refreshedData = await refreshed.json();
        setProduct(refreshedData);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <span className="loading loading-spinner loading-lg text-[#D96C46]"></span>
      </div>
    );
  }

  if (!product) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF9F6]">
            <h2 className="font-serif text-2xl text-[#1a1a1a]">Product Not Found</h2>
            <button onClick={() => navigate('/')} className="mt-4 text-[#D96C46] hover:underline">Return Home</button>
        </div>
    );
  }

  return (
    <div className="bg-[#FAF9F6] min-h-screen font-sans text-[#1a1a1a] pb-24">
      
      {/* Product Section */}
      <div className="max-w-7xl mx-auto px-6 pt-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        
        {/* Left: Image */}
        <div className="relative bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 aspect-[4/5] lg:aspect-auto lg:h-[600px] flex items-center justify-center group">
          <img
            src={getProductImage(product)}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <button 
            onClick={handleToggleWishlist}
            className="absolute top-6 right-6 p-3 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:bg-white text-[#1a1a1a] transition-all hover:scale-110"
          >
            <Heart size={20} />
          </button>
        </div>

        {/* Right: Details */}
        <div className="flex flex-col justify-center">
          <div className="mb-2 flex items-center gap-2">
             <div className="flex text-[#D4AF37]">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < Math.round(product.rating || 0) ? "currentColor" : "none"} strokeWidth={i < Math.round(product.rating || 0) ? 0 : 1.5} />
                ))}
             </div>
             <span className="text-xs text-gray-400 font-medium tracking-wide">({product.numReviews} Reviews)</span>
          </div>

          <h1 className="font-serif text-4xl lg:text-5xl font-bold mb-4 leading-tight">{product.name}</h1>
          <p className="text-2xl font-medium text-[#D96C46] mb-6">${product.price}</p>
          <p className="text-gray-500 leading-relaxed mb-8">{product.description}</p>

          <div className="space-y-6 mb-8">
             {/* Colors */}
             {product.colors && product.colors.length > 0 && (
                <div>
                    <label className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3 block">Color</label>
                    <div className="flex flex-wrap gap-3">
                        {product.colors.map(color => (
                            <button 
                                key={color}
                                onClick={() => setSelectedColor(color)}
                                className={`px-4 py-2 rounded-full border text-sm transition-all ${selectedColor === color ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-transparent border-gray-300 text-gray-600 hover:border-gray-400'}`}
                            >
                                {color}
                            </button>
                        ))}
                    </div>
                </div>
             )}

             {/* Sizes */}
             {product.sizes && product.sizes.length > 0 && (
                <div>
                    <label className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3 block">Size</label>
                    <div className="flex flex-wrap gap-3">
                        {product.sizes.map(size => (
                            <button 
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                className={`w-10 h-10 flex items-center justify-center rounded-full border text-sm transition-all ${selectedSize === size ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-transparent border-gray-300 text-gray-600 hover:border-gray-400'}`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
             )}
          </div>

          <div className="flex items-center gap-4 border-t border-gray-200 pt-8">
             <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-[#1a1a1a] text-white h-14 rounded-full font-medium hover:bg-black transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <ShoppingBag size={20} /> 
                {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
             </button>
             <button className="h-14 w-14 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-white hover:border-gray-300 transition-all">
                <Share2 size={20} />
             </button>
          </div>
        </div>
      </div>

      {/* --- Recommendations --- */}
      <div className="max-w-7xl mx-auto px-6 mt-24">
         <h2 className="font-serif text-3xl font-bold mb-8">You May Also Like</h2>
         {product && product.category && (
            <Recommendations currentProductId={product._id} category={product.category} />
         )}
      </div>

      {/* --- Reviews Section --- */}
      <div className="max-w-4xl mx-auto px-6 mt-24">
        <h2 className="font-serif text-3xl font-bold mb-10 text-center">Customer Reviews</h2>
        
        <div className="grid gap-8">
            {(!product.reviews || product.reviews.length === 0) ? (
                <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
                    <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {product.reviews.map((rev) => (
                        <div key={rev._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#FAF9F6] rounded-full flex items-center justify-center font-bold text-[#D96C46]">
                                        {rev.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{rev.name}</p>
                                        <p className="text-xs text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex text-[#D4AF37]">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={12} fill={i < rev.rating ? "currentColor" : "none"} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm ml-13 pl-13">{rev.comment}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Write Review Form */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg mt-8">
                <h3 className="font-serif text-xl font-bold mb-6">Write a Review</h3>
                {user ? (
                    <form onSubmit={submitReview} className="space-y-6">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Rating</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className={`p-1 transition-transform hover:scale-110 ${rating >= star ? 'text-[#D4AF37]' : 'text-gray-300'}`}
                                    >
                                        <Star size={24} fill="currentColor" />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Comment</label>
                            <textarea
                                className="w-full bg-[#FAF9F6] border-none rounded-xl p-4 focus:ring-1 focus:ring-[#D96C46] outline-none text-sm h-32"
                                placeholder="Share your thoughts about the product..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                required
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            disabled={reviewLoading}
                            className="bg-[#1a1a1a] text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-black transition-colors disabled:opacity-70"
                        >
                            {reviewLoading ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                ) : (
                    <div className="text-center py-6">
                        <p className="text-gray-500 mb-4">Please log in to write a review.</p>
                        <button onClick={() => navigate("/login")} className="text-[#D96C46] font-bold hover:underline">Log In</button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;