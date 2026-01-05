import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // Fetch Wishlist
  const fetchWishlist = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setWishlist(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchWishlist();
  }, [token]);

  // Remove Item
  const removeFromWishlist = async (productId) => {
    try {
      const res = await fetch("http://localhost:5000/api/users/wishlist", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        // Remove from local state immediately
        setWishlist(wishlist.filter(item => item._id !== productId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!token) return <div className="text-center mt-10">Please login to view wishlist.</div>;
  if (loading) return <div className="text-center mt-10"><span className="loading loading-spinner loading-lg"></span></div>;

  return (
    <div className="p-10 min-h-screen bg-base-200">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

      {wishlist.length === 0 ? (
        <div className="text-center">
          <p className="mb-4">Your wishlist is empty.</p>
          <Link to="/" className="btn btn-primary">Continue Shopping</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {wishlist.map((product) => (
            <div key={product._id} className="card bg-base-100 shadow-xl">
              <figure>
                <img src={product.images[0]} alt={product.name} className="h-48 w-full object-cover" />
              </figure>
              <div className="card-body">
                <h2 className="card-title justify-between">
                  {product.name}
                  <div className="badge badge-secondary">${product.price}</div>
                </h2>
                <div className="card-actions justify-end mt-4">
                  <button 
                    className="btn btn-error btn-sm btn-outline"
                    onClick={() => removeFromWishlist(product._id)}
                  >
                    Remove
                  </button>
                  <Link to={`/product/${product._id}`} className="btn btn-primary btn-sm">
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;