import React, { useState, useEffect } from 'react';
import api from '../api';
import type { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Plus, Edit, Trash2, X, ShieldAlert } from 'lucide-react';

const ProductAdmin: React.FC = () => {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  const categories = ['Electronics', 'Fashion', 'Home', 'Books', 'Beauty', 'Sports'];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get<Product[]>('/api/products');
      setProducts(response.data);
    } catch (err: any) {
      console.error(err);
      setError('Could not retrieve catalog. Is the product-service up?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
    }
  }, [isAdmin]);

  const openCreateForm = () => {
    setEditMode(false);
    setSelectedProductId(null);
    setName('');
    setDescription('');
    setPrice('0.00');
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
      fetchProducts();
    } catch (err: any) {
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
      fetchProducts();
    } catch (err: any) {
      console.error(err);
      setError('Failed to delete the product.');
    }
  };

  // Restrict access
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="title-wrapper">
          <ShieldAlert size={28} />
          <h1>Admin Product Management</h1>
        </div>
        <button onClick={openCreateForm} className="btn-add-product">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      {/* Product List Table */}
      {loading ? (
        <div className="status-container">
          <div className="spinner"></div>
          <p>Loading administration data...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod.id}>
                  <td>
                    <img
                      src={prod.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                      alt={prod.name}
                      className="table-img"
                    />
                  </td>
                  <td>
                    <div className="table-product-name">{prod.name}</div>
                    <div className="table-product-desc">{prod.description.substring(0, 50)}...</div>
                  </td>
                  <td><span className="table-badge">{prod.category}</span></td>
                  <td>${prod.price.toFixed(2)}</td>
                  <td>{prod.stock}</td>
                  <td>
                    <div className="table-actions">
                      <button onClick={() => openEditForm(prod)} className="btn-edit" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(prod.id!)} className="btn-delete" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    No products available in the catalog. Add one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Overlay Form Modal */}
      {isFormOpen && (
        <div className="modal-overlay" onClick={() => setIsFormOpen(false)}>
          <div className="modal-content size-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editMode ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="btn-modal-close" onClick={() => setIsFormOpen(false)}>
                <X size={20} />
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
                  placeholder="e.g. Premium Watch"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the product details..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
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

              <div className="form-group">
                <label>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map((cat) => (
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
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <button type="submit" className="btn-form-submit">
                {editMode ? 'Save Changes' : 'Create Product'}
              </button>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductAdmin;
