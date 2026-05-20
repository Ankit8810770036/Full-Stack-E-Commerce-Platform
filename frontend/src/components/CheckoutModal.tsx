import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { X, CreditCard, ChevronRight, CheckCircle, Truck, ShoppingBag, Landmark } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  discount: number;
  promoCode: string;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  discount,
  promoCode,
}) => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [isFlipped, setIsFlipped] = useState(false); // For card flip animation

  // Shipping Form State
  const [shipping, setShipping] = useState({
    fullName: user ? user.username : '',
    email: user ? user.email : '',
    address: '',
    city: '',
    zip: '',
    phone: '',
  });

  // Card Payment Form State
  const [payment, setPayment] = useState({
    cardNumber: '',
    cardHolder: user ? user.username.toUpperCase() : '',
    expiry: '',
    cvv: '',
  });

  if (!isOpen) return null;

  // Calculation values
  const discountAmount = cartTotal * discount;
  const taxAmount = (cartTotal - discountAmount) * 0.08;
  const finalTotal = cartTotal - discountAmount + taxAmount;

  // Formatting Card Number: XXXX XXXX XXXX XXXX
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 16) val = val.substring(0, 16);
    const matches = val.match(/.{1,4}/g);
    const formatted = matches ? matches.join(' ') : '';
    setPayment((prev) => ({ ...prev, cardNumber: formatted }));
  };

  // Formatting Card Expiry: MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.substring(0, 4);
    if (val.length > 2) {
      val = val.substring(0, 2) + '/' + val.substring(2);
    }
    setPayment((prev) => ({ ...prev, expiry: val }));
  };

  // Formatting CVV: XXX
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 3) val = val.substring(0, 3);
    setPayment((prev) => ({ ...prev, cvv: val }));
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save Order to LocalStorage for History
    const usernameKey = user ? user.username : 'guest';
    const storedOrders = localStorage.getItem(`orders_${usernameKey}`);
    const orders = storedOrders ? JSON.parse(storedOrders) : [];
    
    const newOrder = {
      orderId: `AURA-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
      date: new Date().toLocaleDateString(),
      items: cart.map((item) => ({
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        imageUrl: item.product.imageUrl,
      })),
      subtotal: cartTotal,
      discountAmount,
      promoCode: promoCode || null,
      tax: taxAmount,
      total: finalTotal,
      shippingDetails: shipping,
    };

    orders.unshift(newOrder); // Newest orders first
    localStorage.setItem(`orders_${usernameKey}`, JSON.stringify(orders));

    // Clear cart and advance
    showToast('Payment verified successfully!', 'success');
    clearCart();
    setStep(3);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content size-md checkout-modal-card">
        <div className="modal-header">
          <h2>Secure Checkout</h2>
          {step < 3 && (
            <button className="btn-modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* Progress Tracker Banner */}
        {step < 3 && (
          <div className="checkout-stepper">
            <div className={`step-node ${step >= 1 ? 'active' : ''}`}>
              <Truck size={14} /> <span>Shipping</span>
            </div>
            <ChevronRight size={14} className="step-arrow" />
            <div className={`step-node ${step >= 2 ? 'active' : ''}`}>
              <CreditCard size={14} /> <span>Payment</span>
            </div>
          </div>
        )}

        <div className="modal-body checkout-modal-body">
          {/* STEP 1: Shipping Address Form */}
          {step === 1 && (
            <form onSubmit={handleShippingSubmit} className="checkout-form">
              <h3>Shipping Information</h3>
              
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  value={shipping.fullName}
                  onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  value={shipping.email}
                  onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                  placeholder="johndoe@example.com"
                />
              </div>

              <div className="form-group">
                <label>Shipping Address</label>
                <input
                  type="text"
                  required
                  value={shipping.address}
                  onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                  placeholder="123 Luxury Avenue"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    required
                    value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                    placeholder="New York"
                  />
                </div>
                <div className="form-group">
                  <label>Postal Code / ZIP</label>
                  <input
                    type="text"
                    required
                    value={shipping.zip}
                    onChange={(e) => setShipping({ ...shipping, zip: e.target.value })}
                    placeholder="10001"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  required
                  value={shipping.phone}
                  onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                  placeholder="+1 (555) 019-2834"
                />
              </div>

              <button type="submit" className="btn-checkout-next">
                Continue to Payment
                <ChevronRight size={16} />
              </button>
            </form>
          )}

          {/* STEP 2: Payment Gateway + Interactive Credit Card */}
          {step === 2 && (
            <form onSubmit={handlePaymentSubmit} className="checkout-form">
              <h3>Payment Details</h3>

              {/* 3D Interactive Card Showcase */}
              <div className="credit-card-wrapper">
                <div className={`interactive-card ${isFlipped ? 'flipped' : ''}`}>
                  {/* Front Side */}
                  <div className="card-face card-front">
                    <div className="card-chip"></div>
                    <Landmark className="card-brand-logo" size={24} />
                    <div className="card-number-display">
                      {payment.cardNumber || '•••• •••• •••• ••••'}
                    </div>
                    <div className="card-bottom-row">
                      <div className="card-holder-display">
                        <label>CARDHOLDER</label>
                        <div>{payment.cardHolder || 'NAME SURNAME'}</div>
                      </div>
                      <div className="card-expiry-display">
                        <label>EXPIRES</label>
                        <div>{payment.expiry || 'MM/YY'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Back Side */}
                  <div className="card-face card-back">
                    <div className="magnetic-strip"></div>
                    <div className="card-back-signature-field">
                      <div className="cvv-display">{payment.cvv || '•••'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Fields */}
              <div className="form-group">
                <label>Cardholder Name</label>
                <input
                  type="text"
                  required
                  value={payment.cardHolder}
                  onChange={(e) => setPayment({ ...payment, cardHolder: e.target.value.toUpperCase() })}
                  onFocus={() => setIsFlipped(false)}
                  placeholder="JOHN DOE"
                />
              </div>

              <div className="form-group">
                <label>Card Number</label>
                <input
                  type="text"
                  required
                  value={payment.cardNumber}
                  onChange={handleCardNumberChange}
                  onFocus={() => setIsFlipped(false)}
                  placeholder="4111 2222 3333 4444"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="text"
                    required
                    value={payment.expiry}
                    onChange={handleExpiryChange}
                    onFocus={() => setIsFlipped(false)}
                    placeholder="MM/YY"
                  />
                </div>
                <div className="form-group">
                  <label>CVV / CVC</label>
                  <input
                    type="password"
                    required
                    value={payment.cvv}
                    onChange={handleCvvChange}
                    onFocus={() => setIsFlipped(true)}
                    onBlur={() => setIsFlipped(false)}
                    placeholder="•••"
                  />
                </div>
              </div>

              <div className="checkout-summary-bar">
                <span>Total Amount Due:</span>
                <strong>${finalTotal.toFixed(2)}</strong>
              </div>

              <div className="payment-actions">
                <button
                  type="button"
                  className="btn-payment-back"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
                <button type="submit" className="btn-payment-submit">
                  Pay Now & Complete Order
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Checkout Success State */}
          {step === 3 && (
            <div className="checkout-success-container">
              <div className="success-icon-badge animate-bounce">
                <CheckCircle size={48} />
              </div>
              <h2>Order Placed Successfully!</h2>
              <p className="success-subtext">
                Your payment of <strong>${finalTotal.toFixed(2)}</strong> has been verified. 
                A confirmation receipt has been sent to your email.
              </p>

              <div className="success-delivery-card">
                <ShoppingBag size={20} />
                <div>
                  <strong>Estimated Delivery:</strong>
                  <span>Standard Shipping (3-5 business days)</span>
                </div>
              </div>

              <div className="success-actions">
                <button className="btn-success-close" onClick={onClose}>
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
