import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../api';
import type { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  X,
  ShieldAlert,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Package,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { formatINR } from '../utils/currency';
import { getOptimizedImageUrl, handleImageError } from '../utils/imageFallback';

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Home', 'Books', 'Beauty', 'Sports'];
const FORM_CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Books', 'Beauty', 'Sports'];
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];

const ProductAdmin: React.FC = () => {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [stock, setStock] = useState('10');

  const fetchProducts = useCallback(async () => {
    try {
      const response = await api.get<Product[]>('/api/products');
      setProducts(response.data);
    } catch (err: unknown) {
      console.error(err);
      setError('Could not retrieve catalog. Is the product-service up?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      const timeoutId = setTimeout(() => {
        void fetchProducts();
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [isAdmin, fetchProducts]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setCurrentPage(1);
  };

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchesCategory =
        selectedCategory === 'All' || prod.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredProducts.length);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const openCreateForm = () => {
    setEditMode(false);
    setSelectedProductId(null);
    setName('');
    setDescription('');
    setPrice('999');
    setImageUrl('');
    setCategory('Electronics');
    setStock('10');
    setIsFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    setEditMode(true);
    setSelectedProductId(product.id || null);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price.toString());
    setImageUrl(product.imageUrl);
    setCategory(product.category);
    setStock(product.stock.toString());
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const payload: Product = {
      name,
      description,
      price: parseFloat(price),
      imageUrl,
      category,
      stock: parseInt(stock),
    };

    try {
      if (editMode && selectedProductId) {
        await api.put(`/api/products/${selectedProductId}`, payload);
        setSuccess('Product updated successfully!');
      } else {
        await api.post('/api/products', payload);
        setSuccess('Product added successfully!');
      }
      setIsFormOpen(false);
      void fetchProducts();
    } catch (err: unknown) {
      console.error(err);
      setError('Failed to save product details.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setError(null);
    setSuccess(null);

    try {
      await api.delete(`/api/products/${id}`);
      setSuccess('Product deleted successfully!');
      void fetchProducts();
    } catch (err: unknown) {
      console.error(err);
      setError('Failed to delete the product.');
    }
  };

  // Inventory summary KPIs
  const inventoryStats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => p.stock > 5).length;
    const lowStock = products.filter((p) => p.stock <= 5).length;
    const categoriesCount = new Set(products.map((p) => p.category)).size;
    return { total, inStock, lowStock, categoriesCount };
  }, [products]);

  // Generate visible page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="admin-page shop-container">
      {/* Header */}
      <div className="admin-header">
        <div className="title-wrapper">
          <ShieldAlert size={26} />
          <div>
            <h1>Admin Product Catalog</h1>
            <p className="admin-subtitle">
              Manage inventory, pricing, and stock across all product categories.
            </p>
          </div>
        </div>
        <button onClick={openCreateForm} className="btn-add-product">
          <Plus size={16} />
          <span>Add Product</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="kpi-icon-wrap kpi-blue">
            <Package size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">Total Catalog</span>
            <span className="kpi-value">{inventoryStats.total} Products</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-icon-wrap kpi-green">
            <Layers size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">Healthy Stock</span>
            <span className="kpi-value">{inventoryStats.inStock} Items</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-icon-wrap kpi-amber">
            <AlertTriangle size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">Low Stock (&le;5)</span>
            <span className="kpi-value">{inventoryStats.lowStock} Items</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-icon-wrap kpi-purple">
            <Filter size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">Active Categories</span>
            <span className="kpi-value">{inventoryStats.categoriesCount} Categories</span>
          </div>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      {/* Filter and Search Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by title, category, or description..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="btn-clear-search"
              onClick={() => handleSearchChange('')}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="admin-filter-group">
          <div className="filter-dropdown-wrapper">
            <Filter size={15} className="filter-icon" />
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="admin-select"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          <div className="page-size-selector">
            <span className="page-size-label">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="admin-select select-sm"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Catalog Table */}
      {loading ? (
        <div className="status-container">
          <div className="spinner"></div>
          <p>Loading catalog inventory...</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '70px' }}>Image</th>
                  <th>Product Details</th>
                  <th style={{ width: '130px' }}>Category</th>
                  <th style={{ width: '120px' }}>Price</th>
                  <th style={{ width: '100px' }}>Stock</th>
                  <th style={{ width: '110px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((prod) => (
                  <tr key={prod.id || prod.name}>
                    <td>
                      <img
                        src={getOptimizedImageUrl(prod.imageUrl, 100, 75)}
                        alt={prod.name}
                        className="table-img"
                        loading="lazy"
                        onError={handleImageError}
                      />
                    </td>
                    <td>
                      <div className="table-product-name">{prod.name}</div>
                      <div className="table-product-desc">
                        {prod.description ? prod.description.substring(0, 75) + '...' : ''}
                      </div>
                    </td>
                    <td>
                      <span className="table-badge">{prod.category}</span>
                    </td>
                    <td>
                      <strong className="table-price">{formatINR(prod.price)}</strong>
                    </td>
                    <td>
                      <span className={`stock-indicator ${prod.stock > 5 ? 'in-stock' : 'low-stock'}`}>
                        {prod.stock} units
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions">
                        <button
                          onClick={() => openEditForm(prod)}
                          className="btn-edit"
                          title="Edit Product"
                          aria-label="Edit Product"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id!)}
                          className="btn-delete"
                          title="Delete Product"
                          aria-label="Delete Product"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <div className="admin-empty-state">
                        <p>No products match your search or filter criteria.</p>
                        {(searchQuery || selectedCategory !== 'All') && (
                          <button
                            type="button"
                            className="btn-reset-filters"
                            onClick={handleResetFilters}
                          >
                            Reset Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {filteredProducts.length > 0 && (
            <div className="admin-pagination-bar">
              <div className="pagination-info">
                Showing <strong>{startIndex + 1}</strong> to <strong>{endIndex}</strong> of{' '}
                <strong>{filteredProducts.length}</strong> products
                {filteredProducts.length !== products.length && (
                  <span className="pagination-filtered-total"> (filtered from {products.length} total)</span>
                )}
              </div>

              <div className="pagination-controls">
                <button
                  type="button"
                  className="btn-pagination-nav"
                  onClick={() => {
                    setCurrentPage(1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  title="First Page"
                  aria-label="First page"
                >
                  <ChevronsLeft size={16} />
                </button>

                <button
                  type="button"
                  className="btn-pagination-nav"
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                  title="Previous Page"
                >
                  <ChevronLeft size={16} />
                  <span className="nav-text">Prev</span>
                </button>

                <div className="pagination-numbers">
                  {getPageNumbers().map((pageNum, idx) =>
                    pageNum === '...' ? (
                      <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                        &hellip;
                      </span>
                    ) : (
                      <button
                        key={`page-${pageNum}`}
                        type="button"
                        className={`btn-page-number ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => {
                          setCurrentPage(Number(pageNum));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        aria-label={`Go to page ${pageNum}`}
                        aria-current={currentPage === pageNum ? 'page' : undefined}
                      >
                        {pageNum}
                      </button>
                    )
                  )}
                </div>

                <button
                  type="button"
                  className="btn-pagination-nav"
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                  title="Next Page"
                >
                  <span className="nav-text">Next</span>
                  <ChevronRight size={16} />
                </button>

                <button
                  type="button"
                  className="btn-pagination-nav"
                  onClick={() => {
                    setCurrentPage(totalPages);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === totalPages}
                  title="Last Page"
                  aria-label="Last page"
                >
                  <ChevronsRight size={16} />
                </button>
              </div>

              {totalPages > 3 && (
                <div className="pagination-jump">
                  <span>Go to:</span>
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    defaultValue={currentPage}
                    key={currentPage}
                    className="jump-page-input"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = parseInt((e.target as HTMLInputElement).value, 10);
                        if (!isNaN(val) && val >= 1 && val <= totalPages) {
                          setCurrentPage(val);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }
                    }}
                  />
                  <span className="jump-total">/ {totalPages}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Overlay Form Modal */}
      {isFormOpen && (
        <div className="modal-overlay" onClick={() => setIsFormOpen(false)}>
          <div className="modal-content size-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editMode ? 'Edit Product' : 'Add New Product'}</h2>
              <button
                className="btn-modal-close"
                onClick={() => setIsFormOpen(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. OnePlus 12 5G (Emerald Green, 256GB)"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe key features, specifications, and warranty..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Price (₹ INR)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                      {FORM_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Image URL</label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                </div>

                <div className="modal-actions-bar">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setIsFormOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-form-submit">
                    {editMode ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductAdmin;
