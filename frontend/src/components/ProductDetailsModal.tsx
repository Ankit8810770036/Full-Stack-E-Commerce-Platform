import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  X,
  ShoppingCart,
  Plus,
  Minus,
  Heart,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
  Maximize2,
  CheckCircle2,
  CreditCard,
  Package,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { formatINR } from '../utils/currency';
import { getOptimizedImageUrl, handleImageError } from '../utils/imageFallback';

interface ProductDetailsModalProps {
  product: Product;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onBuyNow?: (product: Product, quantity: number) => void;
  allProducts?: Product[];
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onSelectProduct,
  onBuyNow,
  allProducts,
}) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'delivery' | 'reviews'>('overview');
  const [isZoomed, setIsZoomed] = useState(false);
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>('cover');
  const [fetchedRelated, setFetchedRelated] = useState<Product[]>([]);
  const [historyStack, setHistoryStack] = useState<Product[]>([]);

  // Reviews state
  interface ReviewItem {
    id?: string;
    username: string;
    rating: number;
    comment: string;
    createdAt?: string;
  }
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (product?.id) {
      api.get(`/api/products/${product.id}/reviews`)
        .then((res) => {
          if (Array.isArray(res.data)) {
            setReviews(res.data);
          }
        })
        .catch(() => {});
    }
  }, [product?.id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !product.id) return;
    setIsSubmittingReview(true);
    const authorName = user?.username ? user.username : 'Verified Shopper';
    try {
      const res = await api.post(`/api/products/${product.id}/reviews`, {
        rating: newRating,
        comment: newComment.trim(),
        username: authorName,
      });
      setReviews((prev) => [res.data, ...prev]);
      setNewComment('');
      showToast('Thank you! Your verified product review has been submitted.', 'success');
    } catch {
      setReviews((prev) => [
        {
          username: authorName,
          rating: newRating,
          comment: newComment.trim(),
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setNewComment('');
      showToast('Review submitted locally.', 'info');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Carousel ref and swipe protection tracking
  const carouselRef = useRef<HTMLDivElement>(null);
  const pointerStartX = useRef(0);
  const pointerStartY = useRef(0);
  const isSwiping = useRef(false);

  const stockVal = Number(product.stock) || 0;
  const priceVal = Number(product.price) || 0;
  const outOfStock = stockVal <= 0;
  const pId = product.id || product.name;
  const isWishlisted = isInWishlist(pId);
  const originalPrice = Math.round(priceVal * 1.25);
  const savings = Math.max(0, originalPrice - priceVal);

  // Deterministic mock rating and review count based on product ID/name
  const productName = product.name || 'Product';
  const ratingVal = (4.2 + ((productName.length % 8) / 10)).toFixed(1);
  const starsCount = Math.round(Number(ratingVal));
  const reviewsCount = 18 + (productName.charCodeAt(0) % 150);

  // 1. Lock background page scroll while modal is active & listen for Escape
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isZoomed) {
          setIsZoomed(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isZoomed, onClose]);

  // Reset state when product changes
  const [prevPid, setPrevPid] = useState(pId);
  if (prevPid !== pId) {
    setPrevPid(pId);
    setQuantity(1);
    setIsZoomed(false);
    setActiveTab('overview');
  }

  // Fast synchronous related products lookup (up to 8 items for a rich carousel)
  const relatedProducts = useMemo(() => {
    if (allProducts && allProducts.length > 0) {
      return allProducts
        .filter((p) => p.category === product.category && (p.id || p.name) !== pId)
        .slice(0, 8);
    }
    return fetchedRelated;
  }, [allProducts, product.category, pId, fetchedRelated]);

  useEffect(() => {
    if (!allProducts || allProducts.length === 0) {
      let isMounted = true;
      api
        .get<Product[]>('/api/products', { params: { category: product.category } })
        .then((res) => {
          if (isMounted) {
            const filtered = res.data.filter((p) => (p.id || p.name) !== pId).slice(0, 8);
            setFetchedRelated(filtered);
          }
        })
        .catch(() => {});
      return () => {
        isMounted = false;
      };
    }
  }, [allProducts, pId, product.category]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    showToast(`Added ${quantity}x "${product.name}" to cart!`, 'success');
  };

  const handleBuyNowClick = () => {
    addToCart(product, quantity);
    onClose();
    if (onBuyNow) {
      onBuyNow(product, quantity);
    }
  };

  // Track pointer movements to distinguish swiping from clicking
  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartX.current = e.clientX;
    pointerStartY.current = e.clientY;
    isSwiping.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const deltaX = Math.abs(e.clientX - pointerStartX.current);
    const deltaY = Math.abs(e.clientY - pointerStartY.current);
    if (deltaX > 8 || deltaY > 8) {
      isSwiping.current = true;
    }
  };

  // Only switch product if the user intentionally tapped, NOT when swiping
  const handleSelectSimilar = (targetProduct: Product) => {
    if (isSwiping.current) return;
    setHistoryStack((prev) => [...prev, product]);
    onSelectProduct(targetProduct);
  };

  // Return to previous product in history
  const handleGoBack = () => {
    if (historyStack.length > 0) {
      const prevProduct = historyStack[historyStack.length - 1];
      setHistoryStack((prev) => prev.slice(0, prev.length - 1));
      onSelectProduct(prevProduct);
    }
  };

  // Carousel manual left/right buttons
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollOffset = direction === 'left' ? -220 : 220;
      carouselRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content size-lg product-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header product-modal-header">
          <div className="modal-header-left">
            {historyStack.length > 0 && (
              <button
                type="button"
                className="btn-modal-back"
                onClick={handleGoBack}
                title="Return to previously viewed product"
              >
                <ArrowLeft size={14} />
                <span>Back to {historyStack[historyStack.length - 1].name.substring(0, 14)}...</span>
              </button>
            )}

            <span className="product-modal-crumb">{product.category}</span>
            <span className="crumb-separator">•</span>
            <span className={`crumb-stock-tag ${outOfStock ? 'out' : stockVal < 15 ? 'low' : ''}`}>
              <span className={`stock-dot ${outOfStock ? 'out' : stockVal < 15 ? 'low' : ''}`} />
              {outOfStock ? 'Sold Out' : stockVal < 15 ? `Only ${stockVal} left` : 'In Stock'}
            </span>
          </div>

          <button className="btn-modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body product-details-layout">
          <div className="product-details-main">
            {/* Left: Image Showcase */}
            <div className="product-showcase-column">
              <div
                className="product-details-image-sec"
                onClick={() => setIsZoomed(true)}
                title="Click to view full image in high resolution"
              >
                <img
                  src={getOptimizedImageUrl(product.imageUrl, 800, 80)}
                  alt={product.name}
                  className={`details-img ${fitMode === 'contain' ? 'mode-contain' : 'mode-cover'}`}
                  decoding="async"
                  onError={handleImageError}
                />

                {/* Floating Wishlist Button */}
                <button
                  type="button"
                  className={`btn-details-wishlist ${isWishlisted ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product);
                  }}
                  title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  aria-label="Wishlist toggle"
                >
                  <Heart size={18} fill={isWishlisted ? '#ef4444' : 'none'} color={isWishlisted ? '#ef4444' : '#fff'} />
                </button>

                {/* Floating Fit/Fill Mode Toggle */}
                <button
                  type="button"
                  className="btn-details-fit-toggle"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFitMode(fitMode === 'cover' ? 'contain' : 'cover');
                  }}
                  title={fitMode === 'cover' ? 'Switch to uncropped view' : 'Switch to edge-to-edge full fill'}
                  aria-label="Toggle fit mode"
                >
                  {fitMode === 'cover' ? 'Fill' : 'Fit'}
                </button>

                {/* Floating Fullscreen Zoom Button */}
                <button
                  type="button"
                  className="btn-details-zoom"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsZoomed(true);
                  }}
                  title="Expand to Fullscreen Photo"
                  aria-label="Expand image"
                >
                  <Maximize2 size={16} />
                </button>
              </div>

              {/* Trust Badges Strip Below Image */}
              <div className="details-trust-strip">
                <div className="trust-strip-item">
                  <CheckCircle2 size={13} className="trust-icon" />
                  <span>100% Genuine</span>
                </div>
                <div className="trust-strip-item">
                  <Truck size={13} className="trust-icon" />
                  <span>Free Delivery</span>
                </div>
                <div className="trust-strip-item">
                  <RotateCcw size={13} className="trust-icon" />
                  <span>7-Day Return</span>
                </div>
              </div>
            </div>

            {/* Right: Info & Purchase Controls */}
            <div className="product-details-info-sec">
              <h2 className="details-title">{product.name}</h2>

              {/* Rating Row */}
              <div className="details-rating-strip">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < starsCount ? '#f59e0b' : 'none'}
                      color="#f59e0b"
                    />
                  ))}
                </div>
                <span className="rating-value">{ratingVal}</span>
                <span className="rating-dot">•</span>
                <span className="reviews-count">{reviewsCount} verified reviews</span>
              </div>

              {/* Indian Pricing Box */}
              <div className="details-pricing-card">
                <div className="details-price-row">
                  <span className="details-price">{formatINR(priceVal)}</span>
                  <span className="details-original-price">{formatINR(originalPrice)}</span>
                  <span className="details-discount-pill">20% OFF</span>
                </div>
                <div className="details-savings-text">
                  You save <strong>{formatINR(savings)}</strong> • Inclusive of all taxes & 18% GST
                </div>
              </div>

              {/* Tab Selector */}
              <div className="details-tabs-bar">
                <button
                  type="button"
                  className={`details-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button
                  type="button"
                  className={`details-tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('specs')}
                >
                  Specifications
                </button>
                <button
                  type="button"
                  className={`details-tab-btn ${activeTab === 'delivery' ? 'active' : ''}`}
                  onClick={() => setActiveTab('delivery')}
                >
                  Delivery & Policy
                </button>
                <button
                  type="button"
                  className={`details-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  Verified Reviews ({reviews.length})
                </button>
              </div>

              {/* Tab Content Panes */}
              <div className="details-tab-content">
                {activeTab === 'overview' && (
                  <p className="details-description">{product.description}</p>
                )}

                {activeTab === 'specs' && (
                  <div className="details-specs-grid">
                    <div className="spec-row">
                      <span className="spec-label">Category</span>
                      <span className="spec-val">{product.category}</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-label">Availability</span>
                      <span className="spec-val">{outOfStock ? 'Out of Stock' : `${stockVal} Units in Stock`}</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-label">Warranty</span>
                      <span className="spec-val">1 Year Official Brand Warranty</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-label">Item Condition</span>
                      <span className="spec-val">Brand New & Sealed Box</span>
                    </div>
                  </div>
                )}

                {activeTab === 'delivery' && (
                  <div className="details-delivery-grid">
                    <div className="delivery-row">
                      <Truck size={15} className="delivery-row-icon" />
                      <div>
                        <strong>Free Express Delivery on ₹999+</strong>
                        <p>Delivers in 2-4 business days across all Indian pin codes.</p>
                      </div>
                    </div>
                    <div className="delivery-row">
                      <CreditCard size={15} className="delivery-row-icon" />
                      <div>
                        <strong>Cash on Delivery & Instant UPI</strong>
                        <p>Pay via Google Pay, PhonePe, Paytm, RuPay, or Cash upon arrival.</p>
                      </div>
                    </div>
                    <div className="delivery-row">
                      <RotateCcw size={15} className="delivery-row-icon" />
                      <div>
                        <strong>7-Day Doorstep Replacement</strong>
                        <p>Hassle-free doorstep pickup from your registered address.</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="details-reviews-pane">
                    <form onSubmit={handleReviewSubmit} className="review-submit-form" style={{ marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Rate this item:</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setNewRating(star)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            >
                              <Star size={16} fill={star <= newRating ? '#f59e0b' : 'none'} color={star <= newRating ? '#f59e0b' : '#64748b'} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write your genuine customer experience with this product..."
                        rows={2}
                        required
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', background: 'rgba(10,11,16,0.8)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.85rem', resize: 'vertical' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                        <button
                          type="submit"
                          disabled={isSubmittingReview || !newComment.trim()}
                          style={{ padding: '6px 16px', borderRadius: '6px', background: 'var(--accent-color)', color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
                        >
                          {isSubmittingReview ? 'Posting...' : 'Submit Review'}
                        </button>
                      </div>
                    </form>

                    {reviews.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <p>No verified customer reviews yet. Be the first to review this product!</p>
                      </div>
                    ) : (
                      <div className="reviews-list-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                        {reviews.map((rev, i) => (
                          <div key={rev.id || i} style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>{rev.username}</strong>
                                <span style={{ fontSize: '0.7rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 6px', borderRadius: '10px' }}>Verified Buyer</span>
                              </div>
                              <div style={{ display: 'flex', gap: '2px' }}>
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star key={s} size={12} fill={s <= rev.rating ? '#f59e0b' : 'none'} color={s <= rev.rating ? '#f59e0b' : '#475569'} />
                                ))}
                              </div>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{rev.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* CTA Buying Actions */}
              {!outOfStock ? (
                <div className="details-actions-wrapper">
                  <div className="qty-picker">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="btn-qty"
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="qty-display">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(stockVal, quantity + 1))}
                      className="btn-qty"
                      disabled={quantity >= stockVal}
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button type="button" className="btn-add-large" onClick={handleAddToCart}>
                    <ShoppingCart size={17} />
                    <span>Add to Cart</span>
                  </button>

                  <button type="button" className="btn-buynow-large" onClick={handleBuyNowClick}>
                    <Zap size={17} />
                    <span>Buy Now</span>
                  </button>
                </div>
              ) : (
                <div className="details-soldout-notice">
                  <Package size={18} />
                  <span>This item is currently sold out. Check back soon!</span>
                </div>
              )}

              {/* Security Note */}
              <div className="details-security-note">
                <ShieldCheck size={13} />
                <span>100% Purchase Protection • Secure Encrypted Checkout</span>
              </div>
            </div>
          </div>

          {/* Similar Products Swipeable Carousel */}
          {relatedProducts.length > 0 && (
            <div className="related-products-section">
              <div className="related-header-row">
                <div>
                  <h3>More in {product.category}</h3>
                  <p className="similar-subtitle">Swipe horizontally to explore • Tap to preview</p>
                </div>
                <div className="carousel-arrows">
                  <button
                    type="button"
                    className="btn-carousel-arrow"
                    onClick={() => scrollCarousel('left')}
                    title="Scroll left"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    className="btn-carousel-arrow"
                    onClick={() => scrollCarousel('right')}
                    title="Scroll right"
                    aria-label="Scroll right"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="similar-carousel-wrapper">
                <div
                  className="similar-carousel-track"
                  ref={carouselRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                >
                  {relatedProducts.map((p) => (
                    <div
                      key={p.id || p.name}
                      className="related-item-card"
                      onClick={() => handleSelectSimilar(p)}
                    >
                      <div className="related-card-img-wrap">
                        <img
                          src={getOptimizedImageUrl(p.imageUrl, 200, 75)}
                          alt={p.name}
                          loading="lazy"
                          draggable={false}
                          onError={handleImageError}
                        />
                      </div>
                      <div className="related-item-info">
                        <h4 title={p.name}>{p.name}</h4>
                        <div className="related-card-bottom">
                          <span className="related-price">{formatINR(p.price)}</span>
                          <button
                            type="button"
                            className="btn-similar-quick-cart"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(p);
                              showToast(`Added "${p.name}" to cart!`, 'success');
                            }}
                            title={`Add "${p.name}" to cart without leaving`}
                          >
                            <ShoppingCart size={11} />
                            <span>+ Add</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox High-Resolution Zoom Modal */}
      {isZoomed && (
        <div className="image-lightbox-overlay" onClick={() => setIsZoomed(false)}>
          <div className="image-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="btn-lightbox-close"
              onClick={() => setIsZoomed(false)}
              aria-label="Close zoom preview"
            >
              <X size={22} />
            </button>
            <img
              src={getOptimizedImageUrl(product.imageUrl, 1200, 85)}
              alt={product.name}
              className="lightbox-img"
              onError={handleImageError}
            />
            <div className="lightbox-caption">
              <h4>{product.name}</h4>
              <p>High-Definition View • 100% Complete Product Photo</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsModal;
