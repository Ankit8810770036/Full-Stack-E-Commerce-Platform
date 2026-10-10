import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import {
  ShoppingCart,
  LogOut,
  User as UserIcon,
  ShieldAlert,
  LogIn,
  ShoppingBag,
  Heart,
  Receipt,
  Tag,
  Copy,
  Check,
  Search,
  ChevronDown,
  Menu,
  X,
  RotateCcw,
} from 'lucide-react';

interface NavbarProps {
  onOpenCart?: () => void;
  onOpenWishlist: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenWishlist }) => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [copiedPromo, setCopiedPromo] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  const [prevPath, setPrevPath] = useState(location.pathname);
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/');
    showToast('Logged out successfully. See you soon!', 'info');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedPromo(true);
    showToast(`Coupon "${code}" copied to clipboard!`, 'success');
    setTimeout(() => setCopiedPromo(false), 2500);
  };

  const handleNavSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/?q=${encodeURIComponent(navSearch.trim())}`);
      const catalogEl = document.getElementById('catalog-section');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const wishlistCount = wishlist.length;
  const userInitials = user?.username ? user.username.substring(0, 2).toUpperCase() : 'U';

  return (
    <header className="site-header">
      {/* 1. Indian Marketplace Announcement Ribbon */}
      <div className="announcement-bar">
        <div className="announcement-content">
          <div className="announcement-left">
            <span className="announcement-badge">
              <Tag size={12} /> SPECIAL OFFER
            </span>
            <span className="announcement-text">
              Flat <strong>50% OFF</strong> with coupon{' '}
              <span className="promo-pill">SUPER50</span> | Free Express Delivery across India on ₹999+
            </span>
          </div>

          <div className="announcement-right">
            <div className="announcement-perk">
              <RotateCcw size={12} />
              <span>Easy 7-Day Doorstep Returns</span>
            </div>
            <button
              className="btn-copy-announcement"
              onClick={() => handleCopyCode('SUPER50')}
              title="Copy promo coupon code"
            >
              {copiedPromo ? <Check size={12} /> : <Copy size={12} />}
              <span>{copiedPromo ? 'Copied' : 'SUPER50'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Professional Navbar */}
      <nav className="navbar">
        <div className="nav-container">
          {/* Mobile Menu Toggle Button */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Brand Logo */}
          <Link to="/" className="nav-logo" title="Cartify - India's Premier Store">
            <div className="logo-badge-icon">
              <ShoppingBag className="logo-icon" size={20} />
            </div>
            <div className="logo-text-group">
              <span className="logo-title">Cartify</span>
              <span className="logo-subtitle">India • Store</span>
            </div>
          </Link>

          {/* Global Header Search Bar */}
          <form className="nav-search-bar" onSubmit={handleNavSearchSubmit}>
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search 50+ products, electronics, fashion, lifestyle..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              aria-label="Search store products"
            />
            {navSearch && (
              <button
                type="button"
                className="btn-clear-search"
                onClick={() => setNavSearch('')}
              >
                &times;
              </button>
            )}
          </form>

          {/* Desktop Navigation Links */}
          <div className="nav-links">
            <Link to="/" className="nav-link">
              Shop
            </Link>
            <a href="#flash-deals" className="nav-link deals-link">
              <Tag size={13} />
              <span>Deals</span>
            </a>
            {isAuthenticated && (
              <Link to="/orders" className="nav-link">
                Orders
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="nav-link admin-link" title="Product Inventory Management">
                <ShieldAlert size={14} />
                <span>Admin</span>
              </Link>
            )}
          </div>

          {/* Action Icons & Profile Menu */}
          <div className="nav-actions">
            {/* Wishlist Button */}
            <button
              className="action-icon-btn"
              onClick={onOpenWishlist}
              title="My Wishlist"
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="action-badge wishlist-badge">{wishlistCount}</span>
              )}
            </button>

            {/* Shopping Cart Button (Full Page) */}
            <Link
              to="/cart"
              className="action-icon-btn cart-btn-accent"
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="action-badge cart-badge">{cartCount}</span>
              )}
            </Link>

            {/* User Account / Profile Menu */}
            {isAuthenticated ? (
              <div className="profile-dropdown-container" ref={dropdownRef}>
                <button
                  className={`btn-profile-trigger ${profileDropdownOpen ? 'active' : ''}`}
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  aria-label="User account menu"
                >
                  <div className="avatar-circle">{userInitials}</div>
                  <span className="user-name-text">{user?.username}</span>
                  <ChevronDown size={14} className={`dropdown-chevron ${profileDropdownOpen ? 'rotate' : ''}`} />
                </button>

                {profileDropdownOpen && (
                  <div className="profile-dropdown-menu">
                    <div className="dropdown-user-header">
                      <div className="dropdown-avatar">{userInitials}</div>
                      <div className="dropdown-info">
                        <strong>{user?.username}</strong>
                        <span>{user?.email || 'Customer Account'}</span>
                        {isAdmin && <span className="admin-tag">Store Administrator</span>}
                      </div>
                    </div>

                    <div className="dropdown-divider"></div>

                    <div className="dropdown-links-list">
                      <Link
                        to="/profile"
                        className="dropdown-item"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <UserIcon size={16} />
                        <span>My Profile & Addresses</span>
                      </Link>

                      <Link
                        to="/orders"
                        className="dropdown-item"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <Receipt size={16} />
                        <span>Orders & Returns</span>
                      </Link>

                      <button
                        className="dropdown-item"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onOpenWishlist();
                        }}
                      >
                        <Heart size={16} />
                        <span>Wishlist ({wishlistCount})</span>
                      </button>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="dropdown-item admin"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <ShieldAlert size={16} />
                          <span>Admin Catalog Portal</span>
                        </Link>
                      )}
                    </div>

                    <div className="dropdown-divider"></div>

                    <button className="dropdown-item logout" onClick={handleLogout}>
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons-group">
                <Link to="/login" className="btn-nav-login">
                  <LogIn size={15} />
                  <span>Sign In</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* 3. Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer">
            <div className="mobile-search-wrapper">
              <form onSubmit={handleNavSearchSubmit}>
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                />
              </form>
            </div>

            <div className="mobile-links-list">
              <Link to="/" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
                Catalog Home
              </Link>
              <a href="#flash-deals" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
                <Tag size={15} /> Flash Deals
              </a>
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
                    <UserIcon size={15} /> My Profile & Addresses
                  </Link>
                  <Link to="/orders" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
                    <Receipt size={15} /> My Orders & Returns
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="mobile-link admin" onClick={() => setMobileMenuOpen(false)}>
                      <ShieldAlert size={15} /> Admin Inventory
                    </Link>
                  )}
                  <button className="mobile-link logout" onClick={handleLogout}>
                    <LogOut size={15} /> Sign Out ({user?.username})
                  </button>
                </>
              ) : (
                <div className="mobile-auth-actions">
                  <Link to="/login" className="btn-mobile-auth primary" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                  <Link to="/register" className="btn-mobile-auth secondary" onClick={() => setMobileMenuOpen(false)}>
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
