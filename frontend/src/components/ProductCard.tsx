import React, { memo } from 'react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { formatINR } from '../utils/currency';
import { getOptimizedImageUrl, handleImageError } from '../utils/imageFallback';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
  viewMode?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetails,
  viewMode = 'grid',
}) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();

  if (!product) return null;

  const stockVal = Number(product.stock) || 0;
  const priceVal = Number(product.price) || 0;
  const outOfStock = stockVal <= 0;
  const pId = product.id || product.name;
  const isWishlisted = isInWishlist(pId);

  const optimizedImgUrl = getOptimizedImageUrl(product.imageUrl, 500, 75);

  // Authentic badge logic based exclusively on actual database inventory
  let badgeText = '';
  let badgeType = '';
  if (outOfStock) {
    badgeText = 'Out of Stock';
    badgeType = 'badge-soldout';
  } else if (stockVal < 10) {
    badgeText = 'Low Stock';
    badgeType = 'badge-limited';
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    showToast(`Added "${product.name}" to cart!`, 'success');
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenDetails(product);
  };

  return (
    <div
      className={`product-card ${viewMode === 'list' ? 'product-card-list' : ''} ${outOfStock ? 'product-card-out' : ''}`}
      onClick={() => onOpenDetails(product)}
    >
      <div className="product-image-container">
        <img
          src={optimizedImgUrl}
          alt={product.name}
          className="product-image"
          loading="lazy"
          decoding="async"
          onError={handleImageError}
        />

        {badgeText && (
          <span className={`product-badge ${badgeType}`}>
            {badgeText}
          </span>
        )}

        <span className="product-category-tag">{product.category}</span>

        {/* Wishlist Toggle Overlay */}
        <button
          className={`card-wishlist-overlay ${isWishlisted ? 'active' : ''}`}
          onClick={handleHeartClick}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          aria-label="Wishlist toggle"
        >
          <Heart size={16} fill={isWishlisted ? '#ef4444' : 'none'} color={isWishlisted ? '#ef4444' : '#fff'} />
        </button>

        {/* Quick View Button on Image Hover */}
        <button
          className="card-quick-view-btn"
          onClick={handleQuickView}
          title="Quick Preview"
        >
          <Eye size={14} />
          <span>Quick View</span>
        </button>
      </div>

      <div className="product-info">
        <h3 className="product-title" title={product.name}>
          {product.name}
        </h3>

        <p className="product-description">{product.description}</p>

        {/* Pricing & Stock Meta in INR */}
        <div className="product-meta">
          <div className="price-block">
            <span className="product-price">{formatINR(priceVal)}</span>
          </div>

          <span className={`product-stock ${outOfStock ? 'out' : stockVal < 15 ? 'low' : ''}`}>
            {outOfStock ? 'Out of Stock' : stockVal < 15 ? `Only ${stockVal} left` : 'In Stock'}
          </span>
        </div>

        {/* Stock Meter Bar */}
        {!outOfStock && (
          <div className="stock-meter-container" title={`${stockVal} units available`}>
            <div
              className={`stock-meter-bar ${stockVal < 15 ? 'low' : ''}`}
              style={{ width: `${Math.min(100, Math.max(15, (stockVal / 40) * 100))}%` }}
            ></div>
          </div>
        )}

        <button
          className="btn-add-to-cart"
          onClick={handleAddToCart}
          disabled={outOfStock}
        >
          <ShoppingCart size={15} />
          <span>{outOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
        </button>
      </div>
    </div>
  );
};

export default memo(ProductCard);
