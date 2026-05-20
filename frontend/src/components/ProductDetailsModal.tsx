import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import api from '../api';
import { X, ShoppingCart, Plus, Minus, Heart, Star, Sparkles } from 'lucide-react';

interface ProductDetailsModalProps {
  product: Product;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onSelectProduct,
}) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  const outOfStock = product.stock <= 0;
  const isWishlisted = isInWishlist(product.id || '');

  // Generate a mock rating and review count based on the product ID/name length
  const ratingVal = 4 + ((product.name.length % 10) / 10);
  const starsCount = Math.round(ratingVal);
  const reviewsCount = 12 + (product.name.charCodeAt(0) % 80);

  // Fetch related products (same category)
  useEffect(() => {
    const fetchRelated = async () => {
      setLoadingRelated(true);
      try {
        const response = await api.get<Product[]>('/api/products', {
          params: { category: product.category },
        });
        // Filter out the current product
        const filtered = response.data.filter((p) => p.id !== product.id).slice(0, 3);
        setRelatedProducts(filtered);
      } catch (err) {
        console.error('Failed to load related products', err);
      } finally {
        setLoadingRelated(false);
      }
    };
    
    setQuantity(1); // Reset quantity when active product changes
    fetchRelated();
  }, [product.id, product.category]);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    showToast(`Added ${quantity}x "${product.name}" to cart!`, 'success');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content size-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-title">
            <Sparkles size={16} className="logo-icon" />
            <span>Product Details</span>
          </div>
          <button className="btn-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body product-details-layout">
          {/* Main Product Section */}
          <div className="product-details-main">
            <div className="product-details-image-sec">
              <img
                src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
                alt={product.name}
                className="details-img"
              />
              <button
                className={`btn-details-wishlist ${isWishlisted ? 'active' : ''}`}
                onClick={() => toggleWishlist(product)}
                title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart size={20} fill={isWishlisted ? '#ef4444' : 'none'} />
              </button>
            </div>

            <div className="product-details-info-sec">
              <span className="details-category-tag">{product.category}</span>
              <h2 className="details-title">{product.name}</h2>
              
              <div className="details-rating">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < starsCount ? '#f59e0b' : 'none'}
                      color="#f59e0b"
                    />
                  ))}
                </div>
                <span className="rating-value">{ratingVal.toFixed(1)}</span>
                <span className="reviews-count">({reviewsCount} customer reviews)</span>
              </div>

              <div className="details-price-row">
                <span className="details-price">${product.price.toFixed(2)}</span>
                <span className={`details-stock-badge ${outOfStock ? 'out' : ''}`}>
                  {outOfStock ? 'Out of Stock' : `${product.stock} units available`}
                </span>
              </div>

              <p className="details-description">{product.description}</p>

              {!outOfStock && (
                <div className="details-actions-wrapper">
                  <div className="qty-picker">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="btn-qty"
                      disabled={quantity <= 1}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="qty-display">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="btn-qty"
                      disabled={quantity >= product.stock}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button className="btn-add-large" onClick={handleAddToCart}>
                    <ShoppingCart size={18} />
                    Add to Cart
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Related Products Section */}
          <div className="related-products-section">
            <h3>Related Products</h3>
            {loadingRelated ? (
              <div className="related-loading">
                <div className="spinner-sm"></div>
                <p>Finding items...</p>
              </div>
            ) : relatedProducts.length === 0 ? (
              <p className="no-related">No similar items found in this category.</p>
            ) : (
              <div className="related-grid">
                {relatedProducts.map((p) => (
                  <div
                    key={p.id}
                    className="related-item-card"
                    onClick={() => onSelectProduct(p)}
                  >
                    <img
                      src={p.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                      alt={p.name}
                    />
                    <div className="related-item-info">
                      <h4>{p.name}</h4>
                      <span>${p.price.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
