import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/currency';
import { getOptimizedImageUrl, handleImageError } from '../utils/imageFallback';
import CheckoutModal from '../components/CheckoutModal';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Truck,
  Tag,
  ShieldCheck,
  RotateCcw,
  Check,
  ShoppingBag,
} from 'lucide-react';

const FREE_SHIPPING_THRESHOLD = 999;

const VALID_COUPONS: Record<string, number> = {
  WELCOME10: 0.10,
  CARTIFY15: 0.15,
  SUPER50: 0.50,
};

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const { showToast } = useToast();

  const [promoInput, setPromoInput] = useState('');
  const [appliedCode, setAppliedCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const applyPromo = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (VALID_COUPONS[cleanCode]) {
      setAppliedCode(cleanCode);
      setDiscount(VALID_COUPONS[cleanCode]);
      showToast(`Coupon "${cleanCode}" applied! ${Math.round(VALID_COUPONS[cleanCode] * 100)}% discount added.`, 'success');
    } else {
      showToast('Invalid coupon code. Try WELCOME10, CARTIFY15, or SUPER50.', 'error');
    }
  };

  const handleApplyPromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    applyPromo(promoInput);
    setPromoInput('');
  };

  const handleRemovePromo = () => {
    setDiscount(0);
    setAppliedCode('');
    showToast('Coupon code removed.', 'info');
  };

  const discountAmount = Math.round(cartTotal * discount);
  const eligibleSubtotal = Math.max(0, cartTotal - discountAmount);
  const isFreeShipping = eligibleSubtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = cart.length === 0 || isFreeShipping ? 0 : 99;
  const taxAmount = Math.round(eligibleSubtotal * 0.18);
  const finalTotal = eligibleSubtotal + shippingFee + taxAmount;

  const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD - eligibleSubtotal);
  const progressPercent = Math.min(100, Math.round((eligibleSubtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="cart-page-container shop-container">
      {/* Top Breadcrumb Navigation */}
      <div className="cart-breadcrumb">
        <Link to="/" className="breadcrumb-link">
          <ArrowLeft size={15} />
          <span>Continue Shopping</span>
        </Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">Shopping Cart ({totalItemsCount} items)</span>
      </div>

      <div className="cart-header-title">
        <h1>Shopping Cart</h1>
        {cart.length > 0 && (
          <button
            type="button"
            className="btn-clear-cart"
            onClick={() => {
              if (window.confirm('Are you sure you want to clear your cart?')) {
                clearCart();
                showToast('Cart cleared', 'info');
              }
            }}
          >
            <Trash2 size={14} />
            <span>Clear Cart</span>
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart-card">
          <div className="empty-cart-icon-wrapper">
            <ShoppingCart size={48} />
          </div>
          <h2>Your shopping cart is empty</h2>
          <p>Explore our catalog for genuine electronics, fashion, and lifestyle essentials.</p>
          <Link to="/" className="btn-explore-catalog">
            <ShoppingBag size={18} />
            <span>Discover Products</span>
          </Link>
        </div>
      ) : (
        <div className="cart-layout-grid">
          {/* Left Column: Cart Items List */}
          <div className="cart-items-column">
            {/* Free Shipping Progress Ribbon */}
            <div className="cart-shipping-banner">
              <div className="shipping-banner-top">
                <Truck size={16} />
                {isFreeShipping ? (
                  <span className="shipping-unlocked-text">
                    <Check size={14} /> FREE Express Delivery across India unlocked!
                  </span>
                ) : (
                  <span className="shipping-progress-text">
                    Add <strong>{formatINR(amountNeeded)}</strong> more to get <strong>FREE Express Delivery</strong>
                  </span>
                )}
              </div>
              <div className="shipping-progress-track">
                <div
                  className={`shipping-progress-fill ${isFreeShipping ? 'complete' : ''}`}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Items Table / Cards */}
            <div className="cart-products-list">
              <div className="cart-table-header">
                <span className="col-product">Product</span>
                <span className="col-price">Price</span>
                <span className="col-qty">Quantity</span>
                <span className="col-total">Subtotal</span>
                <span className="col-action"></span>
              </div>

              {cart.map((item) => {
                const itemPrice = Number(item.product.price) || 0;
                const itemId = item.product.id || item.product.name;
                const itemSubtotal = itemPrice * item.quantity;

                return (
                  <div key={itemId} className="cart-product-row">
                    <div className="cart-product-info">
                      <img
                        src={getOptimizedImageUrl(item.product.imageUrl, 120, 75)}
                        alt={item.product.name}
                        className="cart-product-thumb"
                        loading="lazy"
                        onError={handleImageError}
                      />
                      <div className="cart-product-details">
                        <span className="cart-product-category">{item.product.category}</span>
                        <h3 className="cart-product-name">{item.product.name}</h3>
                        <span className="cart-product-unit-price-mobile">{formatINR(itemPrice)} each</span>
                      </div>
                    </div>

                    <div className="cart-product-price-cell">
                      <span>{formatINR(itemPrice)}</span>
                    </div>

                    <div className="cart-product-qty-cell">
                      <div className="cart-qty-stepper">
                        <button
                          type="button"
                          className="btn-stepper"
                          onClick={() => updateQuantity(itemId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="stepper-value">{item.quantity}</span>
                        <button
                          type="button"
                          className="btn-stepper"
                          onClick={() => updateQuantity(itemId, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="cart-product-total-cell">
                      <strong>{formatINR(itemSubtotal)}</strong>
                    </div>

                    <div className="cart-product-action-cell">
                      <button
                        type="button"
                        className="btn-remove-cart-item"
                        onClick={() => removeFromCart(itemId)}
                        title="Remove product from cart"
                        aria-label="Remove product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions Row */}
            <div className="cart-bottom-actions">
              <Link to="/" className="btn-back-to-shop">
                <ArrowLeft size={15} />
                <span>Add More Products</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Order Summary Card */}
          <div className="cart-summary-column">
            <div className="order-summary-card">
              <h2>Order Summary</h2>

              {/* Promo Coupon Section */}
              <div className="summary-promo-section">
                <label htmlFor="coupon-input" className="promo-label">
                  <Tag size={14} />
                  <span>Have a promo coupon?</span>
                </label>

                {appliedCode ? (
                  <div className="active-coupon-badge">
                    <div className="coupon-badge-info">
                      <strong>{appliedCode}</strong>
                      <span>({Math.round(discount * 100)}% applied discount)</span>
                    </div>
                    <button
                      type="button"
                      className="btn-coupon-remove"
                      onClick={handleRemovePromo}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <form onSubmit={handleApplyPromoSubmit} className="summary-promo-form">
                      <input
                        id="coupon-input"
                        type="text"
                        placeholder="e.g. WELCOME10"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        className="promo-text-input"
                      />
                      <button type="submit" className="btn-promo-apply">
                        Apply
                      </button>
                    </form>
                    <div className="quick-coupons-row">
                      <span className="quick-coupons-label">Try:</span>
                      {Object.keys(VALID_COUPONS).map((code) => (
                        <button
                          key={code}
                          type="button"
                          className="btn-quick-coupon"
                          onClick={() => applyPromo(code)}
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Calculation Breakdown */}
              <div className="summary-breakdown">
                <div className="summary-row">
                  <span>Subtotal ({totalItemsCount} items)</span>
                  <span>{formatINR(cartTotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="summary-row discount-row">
                    <span>Coupon Discount</span>
                    <span>-{formatINR(discountAmount)}</span>
                  </div>
                )}

                <div className="summary-row">
                  <span>Estimated Delivery</span>
                  <span>{isFreeShipping ? <strong className="text-emerald">FREE</strong> : formatINR(shippingFee)}</span>
                </div>

                <div className="summary-row">
                  <span>Applicable GST (18%)</span>
                  <span>{formatINR(taxAmount)}</span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row total-row">
                  <span>Grand Total</span>
                  <span className="total-amount">{formatINR(finalTotal)}</span>
                </div>
              </div>

              {/* Checkout Action */}
              <button
                type="button"
                className="btn-checkout-primary"
                onClick={() => setIsCheckoutOpen(true)}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>

              {/* Trust Badges */}
              <div className="cart-trust-features">
                <div className="trust-item">
                  <ShieldCheck size={16} />
                  <span>256-bit Secure Checkout</span>
                </div>
                <div className="trust-item">
                  <RotateCcw size={16} />
                  <span>7-Day Doorstep Returns</span>
                </div>
                <div className="trust-item">
                  <Truck size={16} />
                  <span>Express Courier Tracking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal when user proceeds */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        discount={discount}
        promoCode={appliedCode}
      />
    </div>
  );
};

export default Cart;
