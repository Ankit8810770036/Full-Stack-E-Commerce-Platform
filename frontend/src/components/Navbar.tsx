import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ShoppingCart, LogOut, User as UserIcon, ShieldAlert, LogIn, UserPlus, ShoppingBag, Heart, Receipt } from 'lucide-react';

interface NavbarProps {
  onOpenCart: () => void;
  onOpenWishlist: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenCart, onOpenWishlist }) => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const wishlistCount = wishlist.length;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <ShoppingBag className="logo-icon" />
          <span>AURA</span>
        </Link>

        <div className="nav-links">
          <Link to="/" className="nav-link">Shop</Link>
          {isAdmin && (
            <Link to="/admin" className="nav-link admin-link">
              <ShieldAlert size={16} />
              Admin Portal
            </Link>
          )}
        </div>

        <div className="nav-actions">
          {isAuthenticated ? (
            <div className="user-profile-menu">
              <span className="welcome-text">
                <UserIcon size={14} />
                Hi, <strong>{user?.username}</strong>
              </span>
              <Link to="/orders" className="nav-link orders-nav-link" title="My Orders">
                <Receipt size={16} />
                <span>Orders</span>
              </Link>
              <button onClick={handleLogout} className="btn-logout" title="Log Out">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-auth-login">
                <LogIn size={14} /> Login
              </Link>
              <Link to="/register" className="btn-auth-register">
                <UserPlus size={14} /> Register
              </Link>
            </div>
          )}

          {/* Wishlist Icon Trigger */}
          <button className="cart-badge-btn wishlist-badge-btn" onClick={onOpenWishlist} title="My Wishlist">
            <Heart size={18} />
            {wishlistCount > 0 && <span className="cart-badge wishlist-badge">{wishlistCount}</span>}
          </button>

          {/* Cart Icon Trigger */}
          <button className="cart-badge-btn" onClick={onOpenCart} title="My Cart">
            <ShoppingCart size={18} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
