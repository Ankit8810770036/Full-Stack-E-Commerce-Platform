import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductAdmin from './pages/ProductAdmin';
import Orders from './pages/Orders';
import Modal from './components/Modal';
import CheckoutModal from './components/CheckoutModal';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Tag, Heart } from 'lucide-react';
import { useWishlist } from './context/WishlistContext';

interface CartSidebarContentProps {
  onOpenCheckout: (discount: number, promoCode: string) => void;
}

const CartSidebarContent: React.FC<CartSidebarContentProps> = ({ onOpenCheckout }) => {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const { showToast } = useToast();

  const [promoInput, setPromoInput] = useState('');
  const [appliedCode, setAppliedCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoInput.toUpperCase().trim();
    
    if (code === 'WELCOME10') {
      setDiscount(0.10);
      setAppliedCode('WELCOME10');
      showToast('10% discount applied!', 'success');
    } else if (code === 'SPRING20') {
      setDiscount(0.20);
      setAppliedCode('SPRING20');
      showToast('20% discount applied!', 'success');
    } else if (code === 'SUPER50') {
      setDiscount(0.50);
      setAppliedCode('SUPER50');
      showToast('Super 50% discount applied!', 'success');
    } else {
      showToast('Invalid coupon code.', 'error');
    }
    setPromoInput('');
  };

  const handleRemovePromo = () => {
    setDiscount(0);
    setAppliedCode('');
    showToast('Promo code removed.', 'info');
  };

  const discountAmount = cartTotal * discount;
  const taxAmount = (cartTotal - discountAmount) * 0.08;
  const finalTotal = cartTotal - discountAmount + taxAmount;

  return (
    <div className="cart-sidebar">
      {cart.length === 0 ? (
        <div className="empty-cart-message">
          <ShoppingCart size={48} className="empty-icon" />
          <p>Your shopping cart is empty</p>
        </div>
      ) : (
        <>
          <div className="cart-items-list">
            {cart.map((item) => (
              <div key={item.product.id} className="cart-item">
                <img
                  src={item.product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                  alt={item.product.name}
                  className="cart-item-img"
                />
                <div className="cart-item-details">
                  <h4>{item.product.name}</h4>
                  <span className="cart-item-price">${item.product.price.toFixed(2)}</span>
                  
                  <div className="cart-item-controls">
                    <button
                      onClick={() => updateQuantity(item.product.id!, item.quantity - 1)}
                      className="btn-qty"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id!, item.quantity + 1)}
                      className="btn-qty"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.product.id!)}
                  className="btn-cart-remove"
                  title="Remove from cart"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Coupon Code Panel */}
          <div className="cart-promo-container">
            {appliedCode ? (
              <div className="applied-promo-badge">
                <Tag size={14} />
                <span>Code Applied: <strong>{appliedCode}</strong></span>
                <button className="btn-remove-promo" onClick={handleRemovePromo}>
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyPromo} className="promo-form">
                <input
                  type="text"
                  placeholder="Enter Promo Code (e.g. WELCOME10)"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                />
                <button type="submit">Apply</button>
              </form>
            )}
          </div>

          {/* Invoice Breakdown */}
          <div className="cart-summary">
            <div className="cart-summary-lines">
              <div className="summary-line">
                <span>Subtotal:</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="summary-line discount">
                  <span>Discount ({appliedCode}):</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-line">
                <span>Estimated Tax (8%):</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="cart-summary-row">
              <span>Total Price:</span>
              <span className="total-price">${finalTotal.toFixed(2)}</span>
            </div>
            
            <button
              className="btn-checkout"
              onClick={() => onOpenCheckout(discount, appliedCode)}
            >
              <CreditCard size={16} />
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const WishlistSidebarContent: React.FC = () => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleMoveToCart = (product: any) => {
    addToCart(product);
    toggleWishlist(product); // Remove from wishlist when moving to cart
    showToast(`Moved "${product.name}" to shopping cart!`, 'success');
  };

  return (
    <div className="wishlist-sidebar">
      {wishlist.length === 0 ? (
        <div className="empty-cart-message">
          <Heart size={48} className="empty-icon" />
          <p>Your wishlist is empty</p>
        </div>
      ) : (
        <div className="cart-items-list">
          {wishlist.map((item) => (
            <div key={item.id} className="cart-item">
              <img
                src={item.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                alt={item.name}
                className="cart-item-img"
              />
              <div className="cart-item-details">
                <h4>{item.name}</h4>
                <span className="cart-item-price">${item.price.toFixed(2)}</span>
                <button
                  onClick={() => handleMoveToCart(item)}
                  className="btn-move-to-cart"
                >
                  <ShoppingCart size={12} /> Add to Cart
                </button>
              </div>
              <button
                onClick={() => toggleWishlist(item)}
                className="btn-cart-remove"
                title="Remove from wishlist"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AppContent: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutDiscount, setCheckoutDiscount] = useState(0);
  const [checkoutPromoCode, setCheckoutPromoCode] = useState('');

  const handleOpenCheckout = (discount: number, promoCode: string) => {
    setCheckoutDiscount(discount);
    setCheckoutPromoCode(promoCode);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="app-wrapper">
      <Navbar onOpenCart={() => setIsCartOpen(true)} onOpenWishlist={() => setIsWishlistOpen(true)} />
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<ProductAdmin />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} AURA Premium Goods. All rights reserved.</p>
        </div>
      </footer>

      {/* Cart Sidebar */}
      <Modal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        title="Shopping Cart"
        size="sidebar"
      >
        <CartSidebarContent
          onOpenCheckout={handleOpenCheckout}
        />
      </Modal>

      {/* Wishlist Sidebar */}
      <Modal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        title="My Wishlist"
        size="sidebar"
      >
        <WishlistSidebarContent />
      </Modal>

      {/* Checkout Wizard */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        discount={checkoutDiscount}
        promoCode={checkoutPromoCode}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <WishlistProvider>
          <CartProvider>
            <Router>
              <AppContent />
            </Router>
          </CartProvider>
        </WishlistProvider>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
