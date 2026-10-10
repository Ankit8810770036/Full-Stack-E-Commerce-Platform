import React, { useState, useEffect, useCallback, useMemo, useDeferredValue, memo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import type { Product } from '../types';
import ProductCard from '../components/ProductCard';
import ProductDetailsModal from '../components/ProductDetailsModal';
import { useToast } from '../context/ToastContext';
import { handleImageError } from '../utils/imageFallback';
import {
  Search,
  PackageOpen,
  ChevronLeft,
  ChevronRight,
  Tag,
  ArrowRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  Lock,
  LayoutGrid,
  List,
  Check,
  Copy,
  Mail,
  Send,
} from 'lucide-react';

interface BannerSlide {
  title: string;
  subtitle: string;
  promoText: string;
  promoCode: string;
  bgColor: string;
  imageUrl: string;
  categoryLink: string;
}

const BANNER_SLIDES: BannerSlide[] = [
  {
    title: "Flagship Smartphones & Premium Tech",
    subtitle: "Authentic devices with manufacturer warranty, fast dispatch, and secure doorstep delivery across India.",
    promoText: "Verified Hardware Catalog",
    promoCode: "SUPER50",
    bgColor: "#0f172a",
    imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
    categoryLink: "Electronics",
  },
  {
    title: "Studio Audio Gear & Noise-Cancelling Headphones",
    subtitle: "Experience high-fidelity acoustics and wireless listening with verified brand authenticity.",
    promoText: "Pro Audio Collections",
    promoCode: "SPRING20",
    bgColor: "#111827",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    categoryLink: "Electronics",
  },
  {
    title: "Handcrafted Indian Textiles & Modern Apparel",
    subtitle: "Curated hand-spun silks, breathable cottons, and everyday wardrobe essentials.",
    promoText: "Direct Artisan Drops",
    promoCode: "WELCOME10",
    bgColor: "#18181b",
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    categoryLink: "Fashion",
  },
];

const CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Sports', 'Beauty', 'Books'];

// 1. ISOLATED HERO SLIDER (Prevents entire catalog re-renders on slide changes)
const HeroSlider: React.FC<{
  onExploreCategory: (category: string) => void;
  onCopyCode: (code: string) => void;
}> = memo(({ onExploreCategory, onCopyCode }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, 7000);
    return () => clearInterval(slideTimer);
  }, []);

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? BANNER_SLIDES.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
  };

  const slide = BANNER_SLIDES[activeSlide];

  return (
    <section className="hero-slider-section" style={{ backgroundColor: slide.bgColor }}>
      <button className="slider-arrow prev" onClick={handlePrevSlide} aria-label="Previous slide">
        <ChevronLeft size={24} />
      </button>

      <div className="slider-slide-container">
        <div className="slider-content">
          <span className="slider-promo-label">
            <Tag size={13} />
            <span>{slide.promoText}</span>
          </span>

          <h1>{slide.title}</h1>
          <p>{slide.subtitle}</p>

          <div className="slider-action-row">
            <button
              className="slider-code-badge"
              onClick={() => onCopyCode(slide.promoCode)}
              title="Click to copy promo code"
            >
              <span>Code: <strong>{slide.promoCode}</strong></span>
              <Copy size={13} />
            </button>

            <button
              className="btn-hero-explore"
              onClick={() => onExploreCategory(slide.categoryLink)}
            >
              <span>Explore {slide.categoryLink}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        <div className="slider-image-sec">
          <img
            src={slide.imageUrl}
            alt={slide.title}
            loading="eager"
            decoding="async"
            onError={handleImageError}
          />
        </div>
      </div>

      <button className="slider-arrow next" onClick={handleNextSlide} aria-label="Next slide">
        <ChevronRight size={24} />
      </button>

      <div className="slider-dots">
        {BANNER_SLIDES.map((_, idx) => (
          <button
            key={idx}
            className={`slider-dot ${idx === activeSlide ? 'active' : ''}`}
            onClick={() => setActiveSlide(idx)}
            aria-label={`Slide ${idx + 1}`}
          ></button>
        ))}
      </div>
    </section>
  );
});

// 2. ISOLATED PROMOTIONAL BANNER
const FlashDealsBanner: React.FC<{ onCopyCode: (code: string) => void }> = memo(({ onCopyCode }) => {
  return (
    <section id="flash-deals" className="flash-deals-banner">
      <div className="flash-deals-inner">
        <div className="flash-deal-info">
          <div className="flash-title-row">
            <span className="live-pill">
              <Tag size={13} /> Seasonal Promotion
            </span>
            <h3>Storewide Savings with Coupon SUPER50</h3>
          </div>
          <p>Apply coupon <strong>SUPER50</strong> at checkout on eligible orders above ₹999 for verified instant discounts.</p>
        </div>

        <button
          className="btn-claim-deal"
          onClick={() => onCopyCode('SUPER50')}
        >
          <Copy size={14} />
          <span>Copy Coupon Code</span>
        </button>
      </div>
    </section>
  );
});

// 3. ISOLATED NEWSLETTER FORM (Prevents typing keystrokes from re-rendering products)
const NewsletterSection: React.FC = memo(() => {
  const { showToast } = useToast();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribed(true);
    navigator.clipboard.writeText('CARTIFY15');
    showToast('Subscribed! 15% OFF code "CARTIFY15" copied to clipboard!', 'success');
  };

  return (
    <section className="newsletter-section">
      <div className="newsletter-card">
        <div className="newsletter-content">
          <span className="newsletter-eyebrow">
            <Mail size={14} /> EXCLUSIVE VIP CLUB
          </span>
          <h3>Join 50,000+ shoppers & save 15%</h3>
          <p>
            Subscribe for early drops, festive sales, and an instant <strong>15% OFF coupon</strong> delivered straight to your clipboard.
          </p>

          {subscribed ? (
            <div className="subscribed-success-badge">
              <Check size={18} />
              <span>You're in! Use coupon <strong>CARTIFY15</strong> for 15% off at checkout.</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
              <input
                type="email"
                placeholder="Enter your email address..."
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="newsletter-input"
              />
              <button type="submit" className="btn-newsletter-submit">
                <span>Subscribe</span>
                <Send size={14} />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
});

// 4. MAIN HOME STOREFRONT
interface HomeProps {
  onDirectCheckout?: (product: Product, quantity: number) => void;
}

const INITIAL_VISIBLE_COUNT = 20;

const Home: React.FC<HomeProps> = ({ onDirectCheckout }) => {
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Controls
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_VISIBLE_COUNT);

  // Selected Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // React 19 Deferred Value: typing is 0ms instant, filtering runs in non-blocking background
  const deferredSearch = useDeferredValue(search);

  // Sync search param from navbar URL: /?q=...
  const urlQ = new URLSearchParams(location.search).get('q');
  const [prevUrlQ, setPrevUrlQ] = useState(urlQ);
  if (urlQ !== null && urlQ !== prevUrlQ) {
    setPrevUrlQ(urlQ);
    setSearch(urlQ);
  }

  // Reset pagination when search or filters change
  const filterKey = `${deferredSearch}_${selectedCategory}_${priceRange}_${inStockOnly}_${sortBy}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (prevFilterKey !== filterKey) {
    setPrevFilterKey(filterKey);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }

  const fetchProducts = useCallback(async () => {
    setError(null);
    try {
      const response = await api.get<Product[]>('/api/products');
      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (err: unknown) {
      console.error(err);
      setError('Could not retrieve catalog. Make sure backend services are active.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchProducts();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const handleCopyCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
    showToast(`Coupon code "${code}" copied to clipboard!`, 'success');
  }, [showToast]);

  const handleExploreCategory = useCallback((category: string) => {
    setSelectedCategory(category);
    const el = document.getElementById('catalog-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Filtered & Sorted Products Calculation
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (selectedCategory && p.category !== selectedCategory) {
          return false;
        }

        if (deferredSearch.trim()) {
          const q = deferredSearch.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.description?.toLowerCase().includes(q);
          const matchCat = p.category?.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchCat) return false;
        }

        if (inStockOnly && (Number(p.stock) || 0) <= 0) {
          return false;
        }

        const price = Number(p.price) || 0;
        if (priceRange === 'under-1000' && price >= 1000) return false;
        if (priceRange === '1000-5000' && (price < 1000 || price > 5000)) return false;
        if (priceRange === '5000-20000' && (price < 5000 || price > 20000)) return false;
        if (priceRange === 'over-20000' && price <= 20000) return false;

        return true;
      })
      .sort((a, b) => {
        const priceA = Number(a.price) || 0;
        const priceB = Number(b.price) || 0;
        const stockA = Number(a.stock) || 0;
        const stockB = Number(b.stock) || 0;

        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'price-desc') return priceB - priceA;
        if (sortBy === 'stock') return stockB - stockA;
        if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
        return 0;
      });
  }, [products, selectedCategory, deferredSearch, inStockOnly, priceRange, sortBy]);

  // Sliced products for progressive fast rendering
  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: products.length };
    CATEGORIES.forEach((cat) => {
      counts[cat] = products.filter((p) => p.category === cat).length;
    });
    return counts;
  }, [products]);

  const handleOpenDetails = useCallback((p: Product) => {
    setSelectedProduct(p);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  const handleBuyNowFromModal = useCallback((product: Product, quantity: number) => {
    if (onDirectCheckout) {
      onDirectCheckout(product, quantity);
    }
  }, [onDirectCheckout]);

  return (
    <div className="home-page">
      {/* 1. HERO SLIDER BANNER (Isolated component) */}
      <HeroSlider
        onExploreCategory={handleExploreCategory}
        onCopyCode={handleCopyCode}
      />

      {/* 2. VALUE PROPOSITION BAR */}
      <section className="value-props-section">
        <div className="value-props-container">
          <div className="value-prop-card">
            <div className="prop-icon-box">
              <Truck size={22} />
            </div>
            <div className="prop-text-box">
              <h4>Free Express Delivery</h4>
              <p>On all orders above ₹999 across India</p>
            </div>
          </div>

          <div className="value-prop-card">
            <div className="prop-icon-box">
              <ShieldCheck size={22} />
            </div>
            <div className="prop-text-box">
              <h4>100% Genuine Products</h4>
              <p>Verified brands with official warranty</p>
            </div>
          </div>

          <div className="value-prop-card">
            <div className="prop-icon-box">
              <RotateCcw size={22} />
            </div>
            <div className="prop-text-box">
              <h4>7-Day Doorstep Returns</h4>
              <p>Hassle-free exchange & instant UPI refunds</p>
            </div>
          </div>

          <div className="value-prop-card">
            <div className="prop-icon-box">
              <Lock size={22} />
            </div>
            <div className="prop-text-box">
              <h4>UPI & RBI Compliant Pay</h4>
              <p>GPay, PhonePe, Cards & Cash on Delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FLASH DEALS BANNER (Isolated 1-sec countdown timer) */}
      <FlashDealsBanner onCopyCode={handleCopyCode} />

      {/* 4. MAIN STOREFRONT & CATALOG SECTION */}
      <div id="catalog-section" className="shop-container">
        {/* Category Pills Header */}
        <div className="category-pills-bar">
          <button
            className={`cat-pill ${selectedCategory === '' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('')}
          >
            <span>All Products</span>
            <span className="cat-count">{categoryCounts['All'] || 0}</span>
          </button>

          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              <span>{cat}</span>
              <span className="cat-count">{categoryCounts[cat] || 0}</span>
            </button>
          ))}
        </div>

        {/* Search, Filter & View Controls */}
        <div className="controls-bar-advanced">
          {/* Search Box */}
          <div className="search-wrapper">
            <Search className="search-icon" size={17} />
            <input
              type="text"
              placeholder="Search 50+ items by name, category, or features..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            {search && (
              <button
                className="search-clear-btn"
                onClick={() => {
                  setSearch('');
                  navigate('/', { replace: true });
                }}
                title="Clear search"
              >
                &times;
              </button>
            )}
          </div>

          {/* Filters Group */}
          <div className="filter-controls-group">
            <div className="filter-select-wrapper">
              <label>Price:</label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Prices</option>
                <option value="under-1000">Under ₹1,000</option>
                <option value="1000-5000">₹1,000 - ₹5,000</option>
                <option value="5000-20000">₹5,000 - ₹20,000</option>
                <option value="over-20000">Above ₹20,000</option>
              </select>
            </div>

            <div className="filter-select-wrapper">
              <label>Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
                <option value="stock">In Stock First</option>
              </select>
            </div>

            <label className="toggle-instock-label">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              <span>In Stock Only</span>
            </label>

            <div className="view-mode-toggle">
              <button
                className={`btn-view ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
                aria-label="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                className={`btn-view ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
                aria-label="List view"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Results Metadata Line */}
        <div className="results-meta-row">
          <span className="results-count">
            Found <strong>{filteredProducts.length}</strong> items
            {selectedCategory && ` in ${selectedCategory}`}
            {search && ` matching "${search}"`}
          </span>

          {(selectedCategory || search || priceRange !== 'all' || inStockOnly) && (
            <button
              className="btn-clear-filters"
              onClick={() => {
                setSelectedCategory('');
                setSearch('');
                setPriceRange('all');
                setInStockOnly(false);
                navigate('/', { replace: true });
              }}
            >
              Reset All Filters
            </button>
          )}
        </div>

        {/* Products Display */}
        {loading ? (
          <div className="products-grid" aria-label="Loading catalog items">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="skeleton-card">
                <div className="skeleton-shimmer skeleton-image" />
                <div className="skeleton-shimmer skeleton-title" />
                <div className="skeleton-shimmer skeleton-desc" />
                <div className="skeleton-shimmer skeleton-price" />
                <div className="skeleton-shimmer skeleton-btn" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="status-container error-box">
            <p>{error}</p>
            <button className="btn-retry" onClick={fetchProducts}>
              Retry Connection
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="status-container empty-box">
            <PackageOpen size={48} />
            <p>No products match your active search or filter criteria.</p>
            <button
              className="btn-retry"
              onClick={() => {
                setSelectedCategory('');
                setSearch('');
                setPriceRange('all');
                setInStockOnly(false);
                navigate('/', { replace: true });
              }}
            >
              Show All Products
            </button>
          </div>
        ) : (
          <>
            <div className={`products-${viewMode === 'list' ? 'list-layout' : 'grid'}`}>
              {displayedProducts.map((prod) => (
                <ProductCard
                  key={prod.id || prod.name}
                  product={prod}
                  onOpenDetails={handleOpenDetails}
                  viewMode={viewMode}
                />
              ))}
            </div>

            {/* Progressive Loading: Fast 1-click expand */}
            {filteredProducts.length > visibleCount && (
              <div className="load-more-container">
                <button
                  className="btn-load-more"
                  onClick={() => setVisibleCount((prev) => prev + 20)}
                >
                  <span>Load More Products ({filteredProducts.length - visibleCount} remaining)</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 5. VIP NEWSLETTER (Isolated component) */}
      <NewsletterSection />

      {/* Product Details Modal Overlay */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          allProducts={products}
          onClose={handleCloseDetails}
          onSelectProduct={handleOpenDetails}
          onBuyNow={handleBuyNowFromModal}
        />
      )}
    </div>
  );
};

export default Home;
