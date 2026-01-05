import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Recommendations = ({ currentProductId, category }) => {
  const [recProducts, setRecProducts] = useState([]);

  // Helper to safely get image
  const getProductImage = (prod) => {
    // If the product has an 'image' property or an 'images' array
    if (prod.image) {
      return prod.image.startsWith('http') 
        ? prod.image 
        : `http://localhost:5000${prod.image}`;
    }
    if (prod.images && prod.images[0]) {
      return prod.images[0].startsWith('http') 
        ? prod.images[0] 
        : `http://localhost:5000${prod.images[0]}`;
    }
    // Fallback placeholder
    return "https://placehold.co/400";
  };

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const url = category 
          ? `https://nextgen-lifestyles-server-update.onrender.com/api/products/recommendations?productId=${currentProductId}&category=${category}`
          : `https://nextgen-lifestyles-server-update.onrender.com/api/products/recommendations`;
        
        const res = await fetch(url);
        const data = await res.json();
        setRecProducts(data);
      } catch (err) { 
        console.error(err); 
      }
    };
    fetchRecs();
  }, [currentProductId, category]);

  if (recProducts.length === 0) return null;

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recProducts.map((prod) => (
          <Link 
            to={`/product/${prod._id}`} 
            key={prod._id} 
            className="card bg-white shadow hover:shadow-lg transition-all p-3 border"
            onClick={() => window.scrollTo(0, 0)}
          >
            <figure className="h-32">
              <img 
                src={getProductImage(prod)} 
                alt={prod.name} 
                className="h-full object-contain"
                loading="lazy"
              />
            </figure>
            <div className="mt-2">
              <h3 className="text-sm font-bold truncate">{prod.name}</h3>
              <p className="text-primary font-bold">${prod.price}</p>
              <div className="rating rating-xs">
                {[1, 2, 3, 4, 5].map((star) => (
                  <input 
                    key={star} 
                    type="radio" 
                    className="mask mask-star-2 bg-orange-400" 
                    checked={Math.round(prod.rating) >= star} 
                    readOnly 
                  />
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
