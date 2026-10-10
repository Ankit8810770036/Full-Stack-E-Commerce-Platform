import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { WishlistProvider, useWishlist } from './context/WishlistContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';

// Code-split route components for fast initial load & reduced bundle size
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const ProductAdmin = React.lazy(() => import('./pages/ProductAdmin'));
const Orders = React.lazy(() => import('./pages/Orders'));
const Profile = React.lazy(() => import('./pages/Profile'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));
const TermsConditions = React.lazy(() => import('./pages/TermsConditions'));
const Cart = React.lazy(() => import('./pages/Cart'));
import { ErrorBoundary } from './components/ErrorBoundary';
import Modal from './components/Modal';
import CheckoutModal from './components/CheckoutModal';
import type { Product } from './types';
import {
  Heart,
  ArrowRight,
  ShoppingCart,
  Trash2,
  ShoppingBag,
} from 'lucide-react';
import { formatINR } from './utils/currency';



const WishlistSidebarContent: React.FC<{ onCloseWishlist: () => void }> = ({ onCloseWishlist }) => {
  const { wishlist, toggleWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleMoveToCart = (product: Product) => {
    addToCart(product);
    toggleWishlist(product);
    showToast(`Moved "${product.name}" to cart!`, 'success');
  };

  const handleMoveAllToCart = () => {
    wishlist.forEach((p) => addToCart(p));
    clearWishlist();
    showToast(`Moved all ${wishlist.length} items to shopping cart!`, 'success');
    onCloseWishlist();
  };

  return (
    <div className="wishlist-sidebar">
      {wishlist.length === 0 ? (
        <div className="empty-cart-message">
          <div className="empty-icon-bubble">
            <Heart size={42} className="empty-icon" />
          </div>
          <h3>Your wishlist is empty</h3>
          <p>Tap the heart icon on any product to save items for later.</p>
          <button className="btn-start-shopping" onClick={onCloseWishlist}>
            <span>Discover Products</span>
            <ArrowRight size={15} />
          </button>
        </div>
      ) : (
        <>
          <div className="wishlist-actions-bar">
            <span>{wishlist.length} saved {wishlist.length === 1 ? 'item' : 'items'}</span>
            <button className="btn-move-all" onClick={handleMoveAllToCart}>
              Move All to Cart
            </button>
          </div>

          <div className="cart-items-list">
            {wishlist.map((item) => (
              <div key={item.id || item.name} className="cart-item">
                <img
                  src={item.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                  alt={item.name}
                  className="cart-item-img"
                />
                <div className="cart-item-details">
                  <h4>{item.name}</h4>
                  <span className="cart-item-price">{formatINR(item.price)}</span>
                  <button
                    onClick={() => handleMoveToCart(item)}
                    className="btn-move-to-cart"
                  >
                    <ShoppingCart size={13} />
                    <span>Add to Cart</span>
                  </button>
                </div>
                <button
                  onClick={() => toggleWishlist(item)}
                  className="btn-cart-remove"
                  title="Remove from wishlist"
                  aria-label="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const AppContent: React.FC = () => {
  const { addToCart } = useCart();
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleDirectCheckout = (product: Product, quantity: number) => {
    addToCart(product, quantity);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="app-wrapper">
      <Navbar
        onOpenWishlist={() => setIsWishlistOpen(true)}
      />

      <main className="main-content">
        <React.Suspense
          fallback={
            <div className="status-container" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div className="spinner"></div>
              <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading Cartify...</p>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home onDirectCheckout={handleDirectCheckout} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<ProductAdmin />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsConditions />} />
          </Routes>
        </React.Suspense>
      </main>

      {/* Professional Indian E-Commerce Footer */}
      <footer className="site-footer">
        <div className="footer-container">
          <div className="footer-grid">
            {/* Column 1: Brand Info */}
            <div className="footer-col brand-col">
              <div className="footer-logo">
                <ShoppingBag size={22} className="footer-logo-icon" />
                <span className="footer-brand-name">Cartify India</span>
              </div>
              <p className="footer-tagline">
                Curated electronics, fashion, home essentials, and lifestyle products delivered directly to your doorstep across India.
              </p>
              <div className="system-status-pill">
                <span className="status-dot"></span>
                <span>Verified Merchant &bull; Secure Checkout</span>
              </div>
            </div>

            {/* Column 2: Navigation Links */}
            <div className="footer-col">
              <h4>Shop & Explore</h4>
              <ul>
                <li><Link to="/">Catalog Store (50+ Items)</Link></li>
                <li><Link to="/orders">Order Tracking & Returns</Link></li>
                <li><Link to="/profile">My Account & Addresses</Link></li>
                <li><Link to="/admin">Admin Inventory Portal</Link></li>
              </ul>
            </div>

            {/* Column 3: Customer Care */}
            <div className="footer-col">
              <h4>Customer Support</h4>
              <ul>
                <li><a href="#catalog-section">Free Express Delivery on ₹999+</a></li>
                <li><Link to="/orders">7-Day Doorstep Returns & Exchanges</Link></li>
                <li><Link to="/orders">Instant UPI & Bank Refunds</Link></li>
                <li><a href="mailto:support@cartify.in">support@cartify.in</a></li>
              </ul>
            </div>

            {/* Column 4: Legal & Policies */}
            <div className="footer-col">
              <h4>Policies & Legal</h4>
              <ul>
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><Link to="/terms">Terms and Conditions</Link></li>
                <li><Link to="/orders">Return & Refund Policy</Link></li>
                <li><Link to="/privacy">Grievance Redressal</Link></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <div className="copyright-container">
              <p className="copyright-text">
                &copy; {new Date().getFullYear()} <strong>Cartify Online Retail Pvt. Ltd.</strong> All rights reserved.
              </p>
              <div className="footer-legal-inline-links">
                <Link to="/privacy">Privacy Policy</Link>
                <span>&bull;</span>
                <Link to="/terms">Terms & Conditions</Link>
              </div>
            </div>

            <div className="payment-badges-row">
              <span className="pay-badge">UPI</span>
              <span className="pay-badge">Google Pay</span>
              <span className="pay-badge">PhonePe</span>
              <span className="pay-badge">RuPay</span>
              <span className="pay-badge">Visa</span>
              <span className="pay-badge">Mastercard</span>
              <span className="pay-badge">Cash on Delivery</span>
            </div>
          </div>
        </div>
      </footer>


      {/* Wishlist Drawer Modal */}
      <Modal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        title="Saved Wishlist"
        size="sidebar"
      >
        <WishlistSidebarContent
          onCloseWishlist={() => setIsWishlistOpen(false)}
        />
      </Modal>

      {/* Checkout Wizard Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        discount={0}
        promoCode=""
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
};

export default App;
