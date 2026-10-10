import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Navigate, Link } from 'react-router-dom';
import api from '../api';
import {
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Calendar,
  Receipt,
  FileText,
  RotateCcw,
  RefreshCw,
  Truck,
  CheckCircle,
  Clock,
  CreditCard,
  X,
} from 'lucide-react';
import { formatINR } from '../utils/currency';
import { getOptimizedImageUrl, handleImageError } from '../utils/imageFallback';

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface ReturnRequest {
  itemId: string;
  itemName: string;
  action: 'RETURN' | 'EXCHANGE';
  reason: string;
  refundMethod: 'UPI' | 'WALLET' | 'ORIGINAL';
  upiId?: string;
  pickupDate: string;
  requestDate: string;
  status: 'PENDING_PICKUP' | 'PICKED_UP' | 'INSPECTED' | 'REFUNDED' | 'EXCHANGED';
}

export interface Order {
  orderId: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  promoCode: string | null;
  shippingFee: number;
  tax: number;
  total: number;
  shippingDetails: {
    fullName: string;
    email: string;
    address: string;
    city: string;
    zip: string;
    phone?: string;
  };
  orderStatus?: 'PLACED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
  returnRequest?: ReturnRequest | null;
}

interface BackendOrderResponse {
  orderId: string;
  createdAt?: string;
  items?: OrderItem[];
  totalAmount: number;
  discountAmount?: number;
  promoCode?: string;
  finalAmount: number;
  shippingAddress?: {
    name?: string;
    phone?: string;
    house?: string;
    city?: string;
    pincode?: string;
  };
  paymentMethod: string;
  orderStatus?: 'PLACED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
  returns?: Array<{
    itemId: string;
    resolutionType?: string;
    reason: string;
    requestedAt?: string;
  }>;
}

const Orders: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Return & Exchange Modal State
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<Order | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);
  const [returnAction, setReturnAction] = useState<'RETURN' | 'EXCHANGE'>('RETURN');
  const [returnReason, setReturnReason] = useState<string>('Damaged / Defective piece received');
  const [refundMethod, setRefundMethod] = useState<'UPI' | 'WALLET' | 'ORIGINAL'>('UPI');
  const [upiVpa, setUpiVpa] = useState<string>(`${user ? user.username : 'user'}@okhdfcbank`);
  const [pickupDate, setPickupDate] = useState<string>('Tomorrow, 10:00 AM - 1:00 PM');

  const ordersStorageKey = user ? `orders_${user.username}` : 'orders_guest';

  const [prevUser, setPrevUser] = useState(user);
  if (prevUser !== user) {
    setPrevUser(user);
    if (!user) {
      setOrders([]);
      setExpandedOrder(null);
    }
  }

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const res = await api.get('/api/orders', { params: { username: user.username } });
        if (Array.isArray(res.data) && res.data.length > 0) {
          // Map backend order format to frontend format if needed
          const mapped = res.data.map((o: BackendOrderResponse) => ({
            orderId: o.orderId,
            date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'),
            items: o.items || [],
            subtotal: o.totalAmount,
            discountAmount: o.discountAmount || 0,
            promoCode: o.promoCode || null,
            shippingFee: o.finalAmount > 999 ? 0 : 99,
            tax: Math.round((o.totalAmount || 0) * 0.18),
            total: o.finalAmount,
            shippingDetails: {
              fullName: o.shippingAddress?.name || user.username,
              email: user.email || '',
              phone: o.shippingAddress?.phone || '+91 9876543210',
              address: o.shippingAddress?.house || 'Address on file',
              city: o.shippingAddress?.city || 'Bengaluru',
              zip: o.shippingAddress?.pincode || '560038',
            },
            paymentMethod: o.paymentMethod,
            orderStatus: o.orderStatus,
            returnRequest: o.returns && o.returns.length > 0 ? {
              itemId: o.returns[0].itemId,
              itemName: 'Product',
              action: (o.returns[0].resolutionType === 'EXCHANGE' ? 'EXCHANGE' : 'RETURN') as 'RETURN' | 'EXCHANGE',
              reason: o.returns[0].reason,
              refundMethod: 'UPI' as const,
              pickupDate: 'Within 48 hours',
              requestDate: o.returns[0].requestedAt ? new Date(o.returns[0].requestedAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'),
              status: 'PENDING_PICKUP' as const,
            } : undefined,
          }));
          setOrders(mapped);
          setExpandedOrder(mapped[0].orderId);
          localStorage.setItem(ordersStorageKey, JSON.stringify(mapped));
          return;
        }
      } catch (e) {
        console.warn('Backend order-service fetch note:', e);
      }

      // Local storage fallback
      const stored = localStorage.getItem(ordersStorageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setOrders(parsed);
            if (parsed.length > 0) {
              setExpandedOrder(parsed[0].orderId);
            }
          }
        } catch {
          setOrders([]);
        }
      }
    };

    fetchOrders();
  }, [user, ordersStorageKey]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleOpenReturnModal = (order: Order) => {
    setSelectedOrderForReturn(order);
    setSelectedItemIndex(0);
    setReturnAction('RETURN');
    setReturnReason('Damaged / Defective piece received');
    setRefundMethod('UPI');
    setIsReturnModalOpen(true);
  };

  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForReturn) return;

    const targetItem = selectedOrderForReturn.items[selectedItemIndex];

    const returnDetails: ReturnRequest = {
      itemId: `${selectedOrderForReturn.orderId}-${selectedItemIndex}`,
      itemName: targetItem.name,
      action: returnAction,
      reason: returnReason,
      refundMethod,
      upiId: refundMethod === 'UPI' ? upiVpa : undefined,
      pickupDate,
      requestDate: new Date().toLocaleDateString('en-IN'),
      status: 'PENDING_PICKUP',
    };

    const updatedOrders = orders.map((ord) => {
      if (ord.orderId === selectedOrderForReturn.orderId) {
        return {
          ...ord,
          returnRequest: returnDetails,
        };
      }
      return ord;
    });

    setOrders(updatedOrders);
    localStorage.setItem(ordersStorageKey, JSON.stringify(updatedOrders));
    setIsReturnModalOpen(false);

    // Call backend order-service return endpoint
    api.post(`/api/orders/${selectedOrderForReturn.orderId}/return`, {
      itemId: returnDetails.itemId,
      reason: returnDetails.reason,
      resolutionType: returnDetails.action,
      comments: `Pickup requested on ${pickupDate}. Refund via ${refundMethod}`,
      upiRefundId: upiVpa,
    }).catch((err) => console.warn('Backend return submission note:', err));

    if (returnAction === 'RETURN') {
      showToast(
        `Doorstep return initiated for "${targetItem.name}". Pickup scheduled for ${pickupDate}!`,
        'success'
      );
    } else {
      showToast(
        `Replacement exchange initiated for "${targetItem.name}". Pickup & exchange scheduled for ${pickupDate}!`,
        'success'
      );
    }
  };

  const handleCancelReturn = (orderId: string) => {
    if (window.confirm('Are you sure you want to cancel this return/exchange request?')) {
      const updatedOrders = orders.map((ord) => {
        if (ord.orderId === orderId) {
          return {
            ...ord,
            returnRequest: null,
          };
        }
        return ord;
      });
      setOrders(updatedOrders);
      localStorage.setItem(ordersStorageKey, JSON.stringify(updatedOrders));
      showToast('Return request cancelled.', 'info');
    }
  };

  return (
    <div className="orders-page shop-container">
      <div className="orders-header">
        <div className="title-wrapper">
          <Receipt size={28} className="logo-icon" />
          <h1>My Orders & Returns</h1>
        </div>
        <p>Review doorstep tracking, tax invoices, and initiate 7-day hassle-free returns & refunds.</p>
      </div>

      {orders.length === 0 ? (
        <div className="status-container empty-box orders-empty">
          <ShoppingBag size={54} className="empty-icon" />
          <h2>No orders placed yet</h2>
          <p>Explore our premium 50+ collection and place your first order in Indian Rupees.</p>
          <Link to="/" className="btn-shop-now">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const isExpanded = expandedOrder === order.orderId;
            const totalItems = order.items.reduce((acc, curr) => acc + curr.quantity, 0);
            const hasReturn = Boolean(order.returnRequest);

            return (
              <div
                key={order.orderId}
                className={`order-card ${isExpanded ? 'expanded' : ''} ${hasReturn ? 'order-card-returned' : ''}`}
              >
                {/* Summary Row */}
                <div className="order-summary-row" onClick={() => toggleExpand(order.orderId)}>
                  <div className="order-meta-info">
                    <div className="order-id-group">
                      <span className="order-label">ORDER ID</span>
                      <strong className="order-id">{order.orderId}</strong>
                    </div>
                    <div className="order-meta-item">
                      <Calendar size={14} />
                      <span>{order.date}</span>
                    </div>
                    <div className="order-meta-item">
                      <ShoppingBag size={14} />
                      <span>
                        {totalItems} {totalItems === 1 ? 'item' : 'items'}
                      </span>
                    </div>

                    {/* Order Status Badge */}
                    {hasReturn ? (
                      <span className="order-badge-return">
                        <RotateCcw size={12} />
                        {order.returnRequest?.action === 'RETURN'
                          ? 'Return Requested'
                          : 'Exchange In Progress'}
                      </span>
                    ) : (
                      <span className="order-badge-delivered">
                        <CheckCircle size={12} />
                        Delivered
                      </span>
                    )}
                  </div>

                  <div className="order-price-group">
                    <div className="order-total-block">
                      <span className="order-label">TOTAL PAID</span>
                      <span className="order-total-price">{formatINR(order.total)}</span>
                    </div>
                    <button className="btn-toggle-expand" aria-label="Toggle details">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* Return Tracker Strip (if return was requested) */}
                {hasReturn && order.returnRequest && (
                  <div className="return-tracker-strip">
                    <div className="tracker-header">
                      <div className="tracker-title">
                        <RotateCcw size={16} className="text-amber" />
                        <strong>
                          {order.returnRequest.action === 'RETURN' ? 'Return & Refund' : 'Exchange'} Tracker:
                        </strong>
                        <span>{order.returnRequest.itemName}</span>
                      </div>
                      <button
                        className="btn-cancel-return-sm"
                        onClick={() => handleCancelReturn(order.orderId)}
                      >
                        Cancel Request
                      </button>
                    </div>

                    <div className="tracking-timeline-grid">
                      <div className="timeline-node active">
                        <div className="node-icon check">✓</div>
                        <div className="node-info">
                          <strong>Request Approved</strong>
                          <small>{order.returnRequest.requestDate}</small>
                        </div>
                      </div>
                      <div className="timeline-line active"></div>
                      <div className="timeline-node current">
                        <div className="node-icon truck">
                          <Truck size={14} />
                        </div>
                        <div className="node-info">
                          <strong>Doorstep Pickup</strong>
                          <small>{order.returnRequest.pickupDate}</small>
                        </div>
                      </div>
                      <div className="timeline-line"></div>
                      <div className="timeline-node">
                        <div className="node-icon clock">
                          <Clock size={14} />
                        </div>
                        <div className="node-info">
                          <strong>Quality Check</strong>
                          <small>Hub Inspection</small>
                        </div>
                      </div>
                      <div className="timeline-line"></div>
                      <div className="timeline-node">
                        <div className="node-icon refund">
                          <CreditCard size={14} />
                        </div>
                        <div className="node-info">
                          <strong>
                            {order.returnRequest.action === 'RETURN'
                              ? `Refund (${order.returnRequest.refundMethod})`
                              : 'Exchange Delivered'}
                          </strong>
                          <small>
                            {order.returnRequest.refundMethod === 'UPI'
                              ? 'Instant UPI'
                              : 'Original Method'}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="order-details-panel">
                    <div className="order-details-grid">
                      {/* Left: Items list */}
                      <div className="order-items-sec">
                        <div className="items-header-row">
                          <h4>Purchased Items</h4>
                          {!hasReturn && (
                            <button
                              className="btn-initiate-return"
                              onClick={() => handleOpenReturnModal(order)}
                            >
                              <RotateCcw size={14} />
                              <span>Return / Exchange Items</span>
                            </button>
                          )}
                        </div>

                        <div className="order-items-list-box">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="order-item-row">
                              <img
                                src={getOptimizedImageUrl(item.imageUrl, 100, 75)}
                                alt={item.name}
                                className="order-item-img"
                                loading="lazy"
                                onError={handleImageError}
                              />
                              <div className="order-item-desc">
                                <h5>{item.name}</h5>
                                <span>
                                  Qty: {item.quantity} &times; {formatINR(item.price)}
                                </span>
                              </div>
                              <span className="order-item-subtotal">
                                {formatINR(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Address & Pricing Invoice */}
                      <div className="order-invoice-sec">
                        <div className="invoice-sub-box">
                          <h4>Doorstep Delivery Address</h4>
                          <address className="invoice-address">
                            <strong>{order.shippingDetails.fullName}</strong>
                            <p>{order.shippingDetails.address}</p>
                            <p>
                              {order.shippingDetails.city}, {order.shippingDetails.zip}
                            </p>
                            <p>Contact: {order.shippingDetails.email}</p>
                          </address>
                        </div>

                        <div className="invoice-sub-box">
                          <h4>GST Tax Invoice Receipt</h4>
                          <div className="invoice-summary-lines">
                            <div className="invoice-line">
                              <span>Subtotal</span>
                              <span>{formatINR(order.subtotal)}</span>
                            </div>
                            {order.discountAmount > 0 && (
                              <div className="invoice-line discount">
                                <span>
                                  Promo Discount {order.promoCode ? `(${order.promoCode})` : ''}
                                </span>
                                <span>-{formatINR(order.discountAmount)}</span>
                              </div>
                            )}
                            <div className="invoice-line">
                              <span>Shipping</span>
                              <span>
                                {order.shippingFee === 0 || !order.shippingFee ? (
                                  <strong className="text-emerald">FREE</strong>
                                ) : (
                                  formatINR(order.shippingFee)
                                )}
                              </span>
                            </div>
                            <div className="invoice-line">
                              <span>GST (18%)</span>
                              <span>{formatINR(order.tax)}</span>
                            </div>
                            <div className="invoice-line grand-total">
                              <div className="grand-title">
                                <FileText size={14} /> Total Amount Paid
                              </div>
                              <span>{formatINR(order.total)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Return & Exchange Wizard Modal */}
      {isReturnModalOpen && selectedOrderForReturn && (
        <div className="modal-overlay" onClick={() => setIsReturnModalOpen(false)}>
          <div className="modal-content size-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-title">
                <RotateCcw size={18} className="logo-icon" />
                <span>Doorstep Return & Exchange Request</span>
              </div>
              <button
                className="btn-modal-close"
                onClick={() => setIsReturnModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitReturn} className="modal-body return-modal-form">
              {/* 1. Item Selection */}
              <div className="form-group">
                <label>Select Item to Return / Exchange</label>
                <select
                  value={selectedItemIndex}
                  onChange={(e) => setSelectedItemIndex(Number(e.target.value))}
                >
                  {selectedOrderForReturn.items.map((item, idx) => (
                    <option key={idx} value={idx}>
                      {item.name} &bull; Qty: {item.quantity} ({formatINR(item.price)})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Choose Action */}
              <div className="form-group">
                <label>Desired Action</label>
                <div className="return-action-selector">
                  <label className={`action-choice ${returnAction === 'RETURN' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="returnAction"
                      checked={returnAction === 'RETURN'}
                      onChange={() => setReturnAction('RETURN')}
                    />
                    <RotateCcw size={16} />
                    <div>
                      <strong>Return & Refund</strong>
                      <span>Pickup item & credit refund</span>
                    </div>
                  </label>

                  <label className={`action-choice ${returnAction === 'EXCHANGE' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="returnAction"
                      checked={returnAction === 'EXCHANGE'}
                      onChange={() => setReturnAction('EXCHANGE')}
                    />
                    <RefreshCw size={16} />
                    <div>
                      <strong>Exchange for Replacement</strong>
                      <span>Swap for new unit or size</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* 3. Reason for Return */}
              <div className="form-group">
                <label>Reason for Request</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                >
                  <option value="Damaged / Defective piece received">
                    Damaged / Defective piece received
                  </option>
                  <option value="Quality not as expected">Quality not as expected</option>
                  <option value="Wrong size / Fit issue">Wrong size / Fit issue</option>
                  <option value="Different from pictures / description">
                    Different from pictures / description
                  </option>
                  <option value="Missing accessories / box items">
                    Missing accessories / box items
                  </option>
                  <option value="Better price found elsewhere">Better price found elsewhere</option>
                </select>
              </div>

              {/* 4. Refund Method (if returning) */}
              {returnAction === 'RETURN' && (
                <div className="form-group">
                  <label>Refund Destination</label>
                  <div className="refund-method-options">
                    <label className={`refund-radio ${refundMethod === 'UPI' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="refundMethod"
                        checked={refundMethod === 'UPI'}
                        onChange={() => setRefundMethod('UPI')}
                      />
                      <div>
                        <strong>Instant UPI Transfer</strong>
                        <small>Credited within 2 hours of doorstep pickup</small>
                      </div>
                    </label>

                    <label className={`refund-radio ${refundMethod === 'WALLET' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="refundMethod"
                        checked={refundMethod === 'WALLET'}
                        onChange={() => setRefundMethod('WALLET')}
                      />
                      <div>
                        <strong>Cartify Cash Wallet (+5% Extra Bonus)</strong>
                        <small>Instant credit on pickup</small>
                      </div>
                    </label>

                    <label className={`refund-radio ${refundMethod === 'ORIGINAL' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="refundMethod"
                        checked={refundMethod === 'ORIGINAL'}
                        onChange={() => setRefundMethod('ORIGINAL')}
                      />
                      <div>
                        <strong>Original Payment Method</strong>
                        <small>3-5 business days to original card/bank</small>
                      </div>
                    </label>
                  </div>

                  {refundMethod === 'UPI' && (
                    <div className="form-group mt-3">
                      <label>UPI ID (VPA) for Refund</label>
                      <input
                        type="text"
                        required
                        value={upiVpa}
                        onChange={(e) => setUpiVpa(e.target.value)}
                        placeholder="e.g. yourname@okhdfcbank"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* 5. Pickup Slot */}
              <div className="form-group">
                <label>Doorstep Pickup Slot</label>
                <select
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                >
                  <option value="Tomorrow, 10:00 AM - 1:00 PM">Tomorrow, 10:00 AM - 1:00 PM</option>
                  <option value="Tomorrow, 2:00 PM - 6:00 PM">Tomorrow, 2:00 PM - 6:00 PM</option>
                  <option value="Day after tomorrow, 10:00 AM - 2:00 PM">
                    Day after tomorrow, 10:00 AM - 2:00 PM
                  </option>
                </select>
              </div>

              <div className="modal-actions-bar">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsReturnModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save-primary">
                  {returnAction === 'RETURN' ? 'Submit Return Request' : 'Submit Exchange Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
