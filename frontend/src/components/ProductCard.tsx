import React from 'react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { ShoppingCart, Heart, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();

  const outOfStock = product.stock <= 0;
  const isWishlisted = isInWishlist(product.id || '');

  // Generate mock rating values
  const ratingVal = 4 + ((product.name.length % 10) / 10);
  const starsCount = Math.round(ratingVal);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid opening the modal when clicking Add to Cart
    addToCart(product);
    showToast(`Added "${product.name}" to cart!`, 'success');
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid opening the modal
    toggleWishlist(product);
  };

  return (
    <div className="product-card" onClick={() => onOpenDetails(product)}>
      <div className="product-image-container">
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'}
          alt={product.name}
          className="product-image"
        />
        <span className="product-category-tag">{product.category}</span>
        
        {/* Wishlist Toggle Heart Overlay */}
        <button
          className={`card-wishlist-overlay ${isWishlisted ? 'active' : ''}`}
          onClick={handleHeartClick}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart size={16} fill={isWishlisted ? '#ef4444' : 'none'} />
        </button>
      </div>

      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        
        {/* Rating Row */}
        <div className="card-rating-row">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                fill={i < starsCount ? '#f59e0b' : 'none'}
                color="#f59e0b"
              />
            ))}
          </div>
          <span className="card-rating-num">{ratingVal.toFixed(1)}</span>
        </div>

        <p className="product-description">{product.description}</p>
        
        <div className="product-meta">
          <span className="product-price">${product.price.toFixed(2)}</span>
          <span className={`product-stock ${outOfStock ? 'out' : ''}`}>
            {outOfStock ? 'Out of Stock' : `${product.stock} in stock`}
          </span>
        </div>

        <button
          className="btn-add-to-cart"
          onClick={handleAddToCart}
          disabled={outOfStock}
        >
          <ShoppingCart size={14} />
          {outOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
