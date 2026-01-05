import { useState, useEffect } from 'react';
import { CartContext } from './CartContext';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity, color, size) => {
    const existingItem = cart.find(
      item =>
        item.productId === product._id &&
        item.color === color &&
        item.size === size
    );

    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product._id &&
        item.color === color &&
        item.size === size
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([
        ...cart,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.images[0],
          color,
          size,
          quantity,
          stock: product.stock,
        },
      ]);
    }
  };

  const removeFromCart = (productId, color, size) => {
    setCart(cart.filter(
      item =>
        !(item.productId === productId &&
          item.color === color &&
          item.size === size)
    ));
  };

  const updateQuantity = (productId, color, size, amount) => {
    setCart(cart.map(item => {
      if (
        item.productId === productId &&
        item.color === color &&
        item.size === size
      ) {
        const newQty = item.quantity + amount;
        if (newQty > 0 && newQty <= item.stock) {
          return { ...item, quantity: newQty };
        }
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
