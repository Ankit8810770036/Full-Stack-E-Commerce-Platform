import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import type { Product } from '../types';
import ProductCard from '../components/ProductCard';
import ProductDetailsModal from '../components/ProductDetailsModal';
import { Search, PackageOpen, ChevronLeft, ChevronRight, Tag, ArrowRight } from 'lucide-react';

interface BannerSlide {
  title: string;
  subtitle: string;
  promoText: string;
  promoCode: string;
  bgGradient: string;
  imageUrl: string;
}

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Banner Slides State
  const [activeSlide, setActiveSlide] = useState(0);

  const bannerSlides: BannerSlide[] = [
    {
      title: "Audio Aesthetics",
      subtitle: "Immersive studio-grade sound and active noise cancellation.",
      promoText: "Get 20% off all sound equipment",
      promoCode: "SPRING20",
      bgGradient: "linear-gradient(135deg, #1e1b4b 0%, #311042 50%, #0c0a0f 100%)",
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
    },
    {
      title: "Chronograph Prestige",
      subtitle: "Timepieces engineered with state-of-the-art quartz mechanics.",
      promoText: "Save 10% on watches & luxury items",
      promoCode: "WELCOME10",
      bgGradient: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #020617 100%)",
      imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
    },
    {
      title: "Active Gear & Fitness",
      subtitle: "Premium products designed to withstand your toughest workouts.",
      promoText: "Flash sale! 50% off select sports gear",
      promoCode: "SUPER50",
      bgGradient: "linear-gradient(135deg, #022c22 0%, #064e3b 50%, #020617 100%)",
      imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&q=80",
    },
  ];

  const categories = ['Electronics', 'Fashion', 'Home', 'Books', 'Beauty', 'Sports'];

  const fetchProducts = useCallback(async (categoryFilter: string, searchKeyword: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Product[]>('/api/products', {
        params: {
          category: categoryFilter || undefined,
          keyword: searchKeyword || undefined,
        },
      });
      setProducts(response.data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch products. Make sure backend services are active.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Slide transition effects
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 6000);
    return () => clearInterval(slideTimer);
  }, [bannerSlides.length]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts(selectedCategory, search);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, selectedCategory, fetchProducts]);

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? bannerSlides.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  return (
    <div className="home-page">
      {/* Hero Banner Carousel */}
      <section className="hero-slider-section" style={{ background: bannerSlides[activeSlide].bgGradient }}>
        <button className="slider-arrow prev" onClick={handlePrevSlide}>
          <ChevronLeft size={24} />
        </button>
        
        <div className="slider-slide-container">
          <div className="slider-content">
            <span className="slider-promo-label">
              <Tag size={12} />
              {bannerSlides[activeSlide].promoText}
            </span>
            <h1>{bannerSlides[activeSlide].title}</h1>
            <p>{bannerSlides[activeSlide].subtitle}</p>
            
            <div className="slider-code-badge">
              <span>Use Code: <strong>{bannerSlides[activeSlide].promoCode}</strong></span>
              <ArrowRight size={14} />
            </div>
          </div>

          <div className="slider-image-sec">
            <img src={bannerSlides[activeSlide].imageUrl} alt="Banner promotion" />
          </div>
        </div>

        <button className="slider-arrow next" onClick={handleNextSlide}>
          <ChevronRight size={24} />
        </button>

        {/* Dots Navigator */}
        <div className="slider-dots">
          {bannerSlides.map((_, idx) => (
            <button
              key={idx}
              className={`slider-dot ${idx === activeSlide ? 'active' : ''}`}
              onClick={() => setActiveSlide(idx)}
            ></button>
          ))}
        </div>
      </section>

      {/* Main Content Area */}
      <div className="shop-container">
        {/* Filters and Search */}
        <div className="controls-bar">
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="category-tabs">
            <button
              className={`category-tab ${selectedCategory === '' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('')}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="status-container">
            <div className="spinner"></div>
            <p>Loading catalog items...</p>
          </div>
        ) : error ? (
          <div className="status-container error-box">
            <p>{error}</p>
            <button className="btn-retry" onClick={() => fetchProducts(selectedCategory, search)}>
              Retry Connection
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="status-container empty-box">
            <PackageOpen size={48} />
            <p>No products found matching your criteria.</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onOpenDetails={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Details Modal Overlay */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSelectProduct={(p) => setSelectedProduct(p)}
        />
      )}
    </div>
  );
};

export default Home;
