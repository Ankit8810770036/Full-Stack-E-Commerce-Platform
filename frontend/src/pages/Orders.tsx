import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { ShoppingBag, ChevronDown, ChevronUp, Calendar, Receipt, FileText } from 'lucide-react';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface Order {
  orderId: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  promoCode: string | null;
  tax: number;
  total: number;
  shippingDetails: {
    fullName: string;
    email: string;
    address: string;
    city: string;
    zip: string;
  };
}

const Orders: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`orders_${user.username}`);
      if (stored) {
        setOrders(JSON.parse(stored));
      }
    }
  }, [user]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="orders-page shop-container">
      <div className="orders-header">
        <div className="title-wrapper">
          <Receipt size={28} className="logo-icon" />
          <h1>My Order History</h1>
        </div>
        <p>Review details and tracking information for your premium purchases.</p>
      </div>

      {orders.length === 0 ? (
        <div className="status-container empty-box orders-empty">
          <ShoppingBag size={54} className="empty-icon" />
          <h2>No orders placed yet</h2>
          <p>Explore our premium collections and place your first order.</p>
          <Link to="/" className="btn-shop-now">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const isExpanded = expandedOrder === order.orderId;
            const totalItems = order.items.reduce((acc, curr) => acc + curr.quantity, 0);

            return (
              <div key={order.orderId} className={`order-card ${isExpanded ? 'expanded' : ''}`}>
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
                  </div>

                  <div className="order-price-group">
                    <div className="order-total-block">
                      <span className="order-label">TOTAL PAID</span>
                      <span className="order-total-price">${order.total.toFixed(2)}</span>
                    </div>
                    <button className="btn-toggle-expand">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="order-details-panel">
                    <div className="order-details-grid">
                      {/* Left: Items list */}
                      <div className="order-items-sec">
                        <h4>Purchased Items</h4>
                        <div className="order-items-list-box">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="order-item-row">
                              <img
                                src={item.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                                alt={item.name}
                                className="order-item-img"
                              />
                              <div className="order-item-desc">
                                <h5>{item.name}</h5>
                                <span>
                                  Qty: {item.quantity} &times; ${item.price.toFixed(2)}
                                </span>
                              </div>
                              <span className="order-item-subtotal">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Address & Pricing Invoice */}
                      <div className="order-invoice-sec">
                        <div className="invoice-sub-box">
                          <h4>Shipping Destination</h4>
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
                          <h4>Payment Receipt</h4>
                          <div className="invoice-summary-lines">
                            <div className="invoice-line">
                              <span>Subtotal</span>
                              <span>${order.subtotal.toFixed(2)}</span>
                            </div>
                            {order.discountAmount > 0 && (
                              <div className="invoice-line discount">
                                <span>
                                  Promo Discount{' '}
                                  {order.promoCode ? `(${order.promoCode})` : ''}
                                </span>
                                <span>-${order.discountAmount.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="invoice-line">
                              <span>Sales Tax (8%)</span>
                              <span>${order.tax.toFixed(2)}</span>
                            </div>
                            <div className="invoice-line grand-total">
                              <div className="grand-title">
                                <FileText size={14} /> Total Amount
                              </div>
                              <span>${order.total.toFixed(2)}</span>
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
    </div>
  );
};

export default Orders;
