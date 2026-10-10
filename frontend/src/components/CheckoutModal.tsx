import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import {
  X,
  CreditCard,
  ChevronRight,
  CheckCircle,
  Truck,
  Landmark,
  Sparkles,
  Printer,
  Receipt,
  ShieldCheck,
  Banknote,
  Smartphone,
  Check,
} from 'lucide-react';
import { formatINR } from '../utils/currency';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  discount: number;
  promoCode: string;
}

const INDIAN_STATES = [
  'Karnataka', 'Delhi', 'Maharashtra', 'Tamil Nadu', 'Uttar Pradesh',
  'Telangana', 'Gujarat', 'Haryana', 'West Bengal', 'Rajasthan', 'Kerala'
];

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  discount,
  promoCode,
}) => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isFlipped, setIsFlipped] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');
  const [paymentTab, setPaymentTab] = useState<'upi' | 'card' | 'cod'>('upi');

  // Shipping Form State (India context)
  const [shipping, setShipping] = useState({
    fullName: user ? user.username : '',
    email: user ? user.email : '',
    address: 'Flat 402, Lotus Grandeur, 100ft Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    zip: '560038',
    phone: '+91 98765 43210',
  });

  // UPI State
  const [upiId, setUpiId] = useState(`${user ? user.username : 'aarav'}@okhdfcbank`);

  // Card Payment Form State
  const [payment, setPayment] = useState({
    cardNumber: '4532 8920 1823 9012',
    cardHolder: user ? user.username.toUpperCase() : 'AARAV SHARMA',
    expiry: '08/28',
    cvv: '849',
  });

  // Preload default address from profile and reset step on modal open
  const [prevOpen, setPrevOpen] = useState(isOpen);
  if (!prevOpen && isOpen) {
    setPrevOpen(isOpen);
    setStep(1);
    if (user && user.username) {
      try {
        const savedAddressesStr = localStorage.getItem(`addresses_${user.username}`);
        if (savedAddressesStr) {
          const savedAddrs = JSON.parse(savedAddressesStr);
          if (Array.isArray(savedAddrs) && savedAddrs.length > 0) {
            const defaultAddr = savedAddrs.find((a: { isDefault?: boolean }) => a.isDefault) || savedAddrs[0];
            setShipping({
              fullName: defaultAddr.name || user.username,
              email: user.email || '',
              address: `${defaultAddr.house}, ${defaultAddr.area}${defaultAddr.landmark ? ', ' + defaultAddr.landmark : ''}`,
              city: defaultAddr.city || 'Bengaluru',
              state: defaultAddr.state || 'Karnataka',
              zip: defaultAddr.pincode || '560038',
              phone: defaultAddr.phone?.startsWith('+91') ? defaultAddr.phone : `+91 ${defaultAddr.phone || '9876543210'}`,
            });
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  } else if (prevOpen && !isOpen) {
    setPrevOpen(isOpen);
  }

  if (!isOpen) return null;

  // Calculation in Indian Rupees
  const discountAmount = Math.round(cartTotal * discount);
  const eligibleSubtotal = Math.max(0, cartTotal - discountAmount);
  const isFreeShipping = eligibleSubtotal >= 999 || cart.length === 0;
  const shippingFee = isFreeShipping ? 0 : 99;
  const taxAmount = Math.round(eligibleSubtotal * 0.18); // 18% GST standard in India
  const finalTotal = eligibleSubtotal + shippingFee + taxAmount;

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

  const handleFillDemoShipping = () => {
    setShipping({
      fullName: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      address: 'Flat 402, Lotus Grandeur, 100ft Road, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      zip: '560038',
      phone: '+91 98765 43210',
    });
    showToast('Demo Indian delivery address auto-filled!', 'info');
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const usernameKey = user && user.username ? user.username : 'guest';
    const paymentMethodStr = paymentTab === 'upi' ? `UPI (${upiId})` : paymentTab === 'card' ? 'RuPay / Credit Card' : 'Cash on Delivery (COD)';

    let genOrderId = `CARTIFY-IN-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    // Backend payload for Order Service
    const orderPayload = {
      username: usernameKey,
      items: cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: Number(item.product.price) || 0,
        quantity: item.quantity,
        imageUrl: item.product.imageUrl,
      })),
      totalAmount: cartTotal,
      discountAmount: discountAmount,
      finalAmount: finalTotal,
      promoCode: promoCode || null,
      paymentMethod: paymentMethodStr,
      shippingAddress: {
        name: shipping.fullName,
        phone: shipping.phone,
        pincode: shipping.zip,
        house: shipping.address,
        area: shipping.city,
        landmark: '',
        city: shipping.city,
        state: shipping.state,
        type: 'HOME',
      },
    };

    try {
      const response = await api.post('/api/orders', orderPayload);
      if (response.data && response.data.orderId) {
        genOrderId = response.data.orderId;
      }
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } }; message?: string };
      console.warn('Backend order-service sync note:', apiErr?.response?.data?.message || apiErr?.message);
    }

    setPlacedOrderId(genOrderId);

    // Save Order locally as well for immediate reactive rendering
    let orders: unknown[] = [];
    try {
      const storedOrders = localStorage.getItem(`orders_${usernameKey}`);
      if (storedOrders) {
        const parsed = JSON.parse(storedOrders);
        if (Array.isArray(parsed)) {
          orders = parsed;
        }
      }
    } catch {
      orders = [];
    }

    const newOrder = {
      orderId: genOrderId,
      date: new Date().toLocaleDateString('en-IN'),
      items: cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: Number(item.product.price) || 0,
        quantity: item.quantity,
        imageUrl: item.product.imageUrl,
      })),
      subtotal: cartTotal,
      discountAmount,
      promoCode: promoCode || null,
      shippingFee,
      tax: taxAmount,
      total: finalTotal,
      shippingDetails: shipping,
      paymentMethod: paymentMethodStr,
      orderStatus: 'PLACED',
    };

    orders.unshift(newOrder);
    localStorage.setItem(`orders_${usernameKey}`, JSON.stringify(orders));

    showToast('Payment verified! Order placed successfully.', 'success');
    clearCart();
    setStep(3);
  };

  const handleGoToOrders = () => {
    onClose();
    navigate('/orders');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content size-md checkout-modal-card">
        <div className="modal-header">
          <div className="modal-header-title">
            <ShieldCheck size={18} className="logo-icon" />
            <span>Secure Cartify India Checkout</span>
          </div>
          {step < 3 && (
            <button className="btn-modal-close" onClick={onClose} aria-label="Close checkout">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Progress Tracker Banner */}
        {step < 3 && (
          <div className="checkout-stepper">
            <div className={`step-node ${step >= 1 ? 'active' : ''}`}>
              <Truck size={14} /> <span>1. Delivery Address</span>
            </div>
            <ChevronRight size={14} className="step-arrow" />
            <div className={`step-node ${step >= 2 ? 'active' : ''}`}>
              <CreditCard size={14} /> <span>2. UPI / Card / COD</span>
            </div>
          </div>
        )}

        <div className="modal-body checkout-modal-body">
          {/* STEP 1: Shipping Address Form */}
          {step === 1 && (
            <form onSubmit={handleShippingSubmit} className="checkout-form">
              <div className="form-header-row">
                <h3>Delivery Destination</h3>
                <button
                  type="button"
                  className="btn-demo-autofill"
                  onClick={handleFillDemoShipping}
                >
                  <Sparkles size={12} /> Auto-fill Bengaluru Address
                </button>
              </div>

              <div className="form-group">
                <label>Receiver's Full Name</label>
                <input
                  type="text"
                  required
                  value={shipping.fullName}
                  onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                  placeholder="e.g. Aarav Sharma"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    required
                    value={shipping.email}
                    onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                    placeholder="e.g. aarav@example.com"
                  />
                </div>
                <div className="form-group">
                  <label>Mobile Number (+91)</label>
                  <input
                    type="tel"
                    required
                    value={shipping.phone}
                    onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Flat, House No., Building, Apartment</label>
                <input
                  type="text"
                  required
                  value={shipping.address}
                  onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                  placeholder="e.g. Flat 402, Lotus Grandeur, 100ft Road"
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
                    placeholder="Bengaluru"
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <select
                    value={shipping.state}
                    onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>PIN Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={shipping.zip}
                    onChange={(e) => setShipping({ ...shipping, zip: e.target.value })}
                    placeholder="560038"
                  />
                </div>
              </div>

              <button type="submit" className="btn-checkout-next">
                <span>Proceed to Payment ({formatINR(finalTotal)})</span>
                <ChevronRight size={16} />
              </button>
            </form>
          )}

          {/* STEP 2: Indian Payment Gateway (UPI, Card, COD) */}
          {step === 2 && (
            <form onSubmit={handlePaymentSubmit} className="checkout-form">
              <div className="payment-options-tabs">
                <button
                  type="button"
                  className={`payment-tab-btn ${paymentTab === 'upi' ? 'active' : ''}`}
                  onClick={() => setPaymentTab('upi')}
                >
                  <Smartphone size={16} />
                  <span>Instant UPI</span>
                </button>
                <button
                  type="button"
                  className={`payment-tab-btn ${paymentTab === 'card' ? 'active' : ''}`}
                  onClick={() => setPaymentTab('card')}
                >
                  <CreditCard size={16} />
                  <span>RuPay / Card</span>
                </button>
                <button
                  type="button"
                  className={`payment-tab-btn ${paymentTab === 'cod' ? 'active' : ''}`}
                  onClick={() => setPaymentTab('cod')}
                >
                  <Banknote size={16} />
                  <span>Cash on Delivery</span>
                </button>
              </div>

              {/* UPI Tab */}
              {paymentTab === 'upi' && (
                <div className="upi-payment-panel">
                  <div className="upi-vpa-box">
                    <label>Enter UPI ID (Google Pay / PhonePe / Paytm / BHIM)</label>
                    <div className="upi-input-styled">
                      <input
                        type="text"
                        required
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@okhdfcbank"
                      />
                      <span className="upi-verified-tick">
                        <Check size={14} /> Verified
                      </span>
                    </div>
                  </div>

                  <div className="upi-apps-icons-row">
                    <span className="app-badge">Google Pay</span>
                    <span className="app-badge">PhonePe</span>
                    <span className="app-badge">Paytm UPI</span>
                    <span className="app-badge">BHIM UPI</span>
                  </div>
                </div>
              )}

              {/* Card Tab */}
              {paymentTab === 'card' && (
                <>
                  <div className="credit-card-wrapper">
                    <div className={`interactive-card ${isFlipped ? 'flipped' : ''}`}>
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

                      <div className="card-face card-back">
                        <div className="magnetic-strip"></div>
                        <div className="card-back-signature-field">
                          <div className="cvv-display">{payment.cvv || '•••'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Cardholder Name</label>
                    <input
                      type="text"
                      required
                      value={payment.cardHolder}
                      onChange={(e) => setPayment({ ...payment, cardHolder: e.target.value.toUpperCase() })}
                      onFocus={() => setIsFlipped(false)}
                      placeholder="AARAV SHARMA"
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
                      placeholder="4532 8920 1823 9012"
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
                      <label>CVV</label>
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
                </>
              )}

              {/* COD Tab */}
              {paymentTab === 'cod' && (
                <div className="cod-panel">
                  <Banknote size={36} className="text-emerald" />
                  <h4>Doorstep Cash or UPI on Delivery</h4>
                  <p>
                    Pay with Cash or scan QR with Google Pay/PhonePe when delivery executive arrives.
                  </p>
                  <div className="cod-security-badge">
                    <ShieldCheck size={14} /> Zero extra COD handling fee!
                  </div>
                </div>
              )}

              {/* Price Breakdown in INR */}
              <div className="checkout-summary-bar">
                <div className="checkout-summary-col">
                  <span>Total Payable Amount</span>
                  <small>{shippingFee === 0 ? 'Includes Free Express Delivery' : 'Includes ₹99 Delivery'}</small>
                </div>
                <strong className="summary-grand-total">{formatINR(finalTotal)}</strong>
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
                  <span>Pay {formatINR(finalTotal)} & Confirm</span>
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
                Your payment of <strong>{formatINR(finalTotal)}</strong> is confirmed.
                Package dispatch initiated with Bluedart / Delhivery Express.
              </p>

              <div className="order-receipt-highlight">
                <div className="receipt-row">
                  <span>Order Identifier:</span>
                  <strong>{placedOrderId}</strong>
                </div>
                <div className="receipt-row">
                  <span>Shipping Address:</span>
                  <span>{shipping.address}, {shipping.city} {shipping.zip}</span>
                </div>
                <div className="receipt-row">
                  <span>Estimated Delivery:</span>
                  <span style={{ color: '#10b981' }}>2-3 Business Days</span>
                </div>
              </div>

              <div className="success-actions-row">
                <button
                  className="btn-receipt-action secondary"
                  onClick={() => window.print()}
                  title="Print GST Invoice"
                >
                  <Printer size={15} />
                  <span>Print GST Receipt</span>
                </button>

                <button
                  className="btn-receipt-action secondary"
                  onClick={handleGoToOrders}
                  title="Go to Orders"
                >
                  <Receipt size={15} />
                  <span>View in Orders</span>
                </button>

                <button
                  className="btn-receipt-action primary"
                  onClick={onClose}
                >
                  <span>Continue Shopping</span>
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
