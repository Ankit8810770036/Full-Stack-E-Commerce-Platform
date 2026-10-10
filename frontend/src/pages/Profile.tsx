import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Navigate, Link } from 'react-router-dom';
import api from '../api';
import {
  User as UserIcon,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Save,
  Phone,
  Mail,
  Home,
  Briefcase,
  X,
  Receipt,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export interface Address {
  id: string;
  name: string;
  phone: string;
  pincode: string;
  house: string;
  area: string;
  landmark?: string;
  city: string;
  state: string;
  type: 'HOME' | 'WORK' | 'OTHER';
  isDefault: boolean;
}

interface UserProfileData {
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  alternatePhone: string;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Delhi',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal'
];

const Profile: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'personal' | 'addresses'>('personal');

  // Personal Profile State
  const [profile, setProfile] = useState<UserProfileData>({
    fullName: user ? user.username : '',
    email: user ? user.email : '',
    phone: '+91 98765 43210',
    gender: 'Male',
    dob: '1998-05-15',
    alternatePhone: '',
  });

  // Addresses State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const [addressForm, setAddressForm] = useState<Omit<Address, 'id'>>({
    name: user ? user.username : '',
    phone: '9876543210',
    pincode: '560038',
    house: 'Flat 402, Lotus Grandeur',
    area: '100ft Road, Indiranagar',
    landmark: 'Near Metro Station',
    city: 'Bengaluru',
    state: 'Karnataka',
    type: 'HOME',
    isDefault: true,
  });

  // Storage keys isolated per user
  const userProfileKey = user ? `profile_${user.username}` : 'profile_guest';
  const userAddressesKey = user ? `addresses_${user.username}` : 'addresses_guest';

  useEffect(() => {
    if (!user) return;

    const loadProfileData = async () => {
      try {
        const res = await api.get('/api/users/profile');
        if (res.data) {
          const loadedProfile: UserProfileData = {
            fullName: res.data.fullName || user.username,
            email: res.data.email || user.email,
            phone: res.data.phone || '+91 98765 43210',
            gender: res.data.gender || 'Male',
            dob: res.data.dob || '1998-05-15',
            alternatePhone: res.data.alternatePhone || '',
          };
          setProfile(loadedProfile);
          localStorage.setItem(userProfileKey, JSON.stringify(loadedProfile));

          if (Array.isArray(res.data.addresses) && res.data.addresses.length > 0) {
            setAddresses(res.data.addresses);
            localStorage.setItem(userAddressesKey, JSON.stringify(res.data.addresses));
            return;
          }
        }
      } catch (err) {
        console.warn('Backend profile fallback to local storage:', err);
      }

      // Fallback to local storage
      const savedProfile = localStorage.getItem(userProfileKey);
      if (savedProfile) {
        try {
          setProfile(JSON.parse(savedProfile));
        } catch {
          // ignore
        }
      }

      const savedAddresses = localStorage.getItem(userAddressesKey);
      if (savedAddresses) {
        try {
          setAddresses(JSON.parse(savedAddresses));
        } catch {
          // ignore
        }
      } else {
        const defaultAddresses: Address[] = [
          {
            id: 'addr-1',
            name: user.username,
            phone: '9876543210',
            pincode: '560038',
            house: 'Flat 402, Lotus Grandeur, 4th Cross',
            area: 'Indiranagar 100ft Road',
            landmark: 'Opposite Metro Pillar 124',
            city: 'Bengaluru',
            state: 'Karnataka',
            type: 'HOME',
            isDefault: true,
          },
        ];
        setAddresses(defaultAddresses);
        localStorage.setItem(userAddressesKey, JSON.stringify(defaultAddresses));
      }
    };

    loadProfileData();
  }, [user, userProfileKey, userAddressesKey]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/api/users/profile', profile);
    } catch (err) {
      console.warn('Backend profile update note:', err);
    }
    localStorage.setItem(userProfileKey, JSON.stringify(profile));
    showToast('Profile details updated successfully!', 'success');
  };

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      name: profile.fullName || user?.username || '',
      phone: profile.phone.replace(/\D/g, '').slice(-10) || '9876543210',
      pincode: '',
      house: '',
      area: '',
      landmark: '',
      city: '',
      state: 'Karnataka',
      type: 'HOME',
      isDefault: addresses.length === 0,
    });
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: Address) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      name: addr.name,
      phone: addr.phone,
      pincode: addr.pincode,
      house: addr.house,
      area: addr.area,
      landmark: addr.landmark || '',
      city: addr.city,
      state: addr.state,
      type: addr.type,
      isDefault: addr.isDefault,
    });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    let updated: Address[];

    try {
      if (editingAddressId) {
        await api.put(`/api/users/addresses/${editingAddressId}`, addressForm);
      } else {
        await api.post('/api/users/addresses', addressForm);
      }
    } catch (err) {
      console.warn('Backend address sync note:', err);
    }

    if (editingAddressId) {
      updated = addresses.map((a) => {
        if (a.id === editingAddressId) {
          return { ...addressForm, id: editingAddressId };
        }
        return addressForm.isDefault ? { ...a, isDefault: false } : a;
      });
      showToast('Address updated successfully!', 'success');
    } else {
      const newAddress: Address = {
        ...addressForm,
        id: `addr-${Date.now()}`,
      };
      if (addressForm.isDefault) {
        updated = addresses.map((a) => ({ ...a, isDefault: false }));
        updated.unshift(newAddress);
      } else {
        updated = [...addresses, newAddress];
      }
      showToast('New delivery address added!', 'success');
    }

    setAddresses(updated);
    localStorage.setItem(userAddressesKey, JSON.stringify(updated));
    setIsAddressModalOpen(false);
  };

  const handleDeleteAddress = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await api.delete(`/api/users/addresses/${id}`);
      } catch (err) {
        console.warn('Backend address deletion note:', err);
      }
      const updated = addresses.filter((a) => a.id !== id);
      if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
        updated[0].isDefault = true;
      }
      setAddresses(updated);
      localStorage.setItem(userAddressesKey, JSON.stringify(updated));
      showToast('Address removed successfully', 'info');
    }
  };

  const handleSetDefaultAddress = (id: string) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    setAddresses(updated);
    localStorage.setItem(userAddressesKey, JSON.stringify(updated));
    showToast('Default delivery address updated!', 'success');
  };

  const userInitials = user?.username ? user.username.substring(0, 2).toUpperCase() : 'U';

  return (
    <div className="profile-page shop-container">
      {/* 1. Authentic Profile Header */}
      <div className="profile-header-card">
        <div className="profile-header-main">
          <div className="profile-avatar-circle">
            <span>{userInitials}</span>
          </div>

          <div className="profile-header-info">
            <div className="profile-name-row">
              <h2>{profile.fullName || user?.username}</h2>
              <span className="profile-verified-badge">
                <CheckCircle2 size={14} />
                <span>Verified Account</span>
              </span>
            </div>
            <div className="profile-meta-row">
              <span className="profile-meta-item">
                <Mail size={14} />
                <span>{profile.email}</span>
              </span>
              <span className="profile-meta-dot">&bull;</span>
              <span className="profile-meta-item">
                <Phone size={14} />
                <span>{profile.phone}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="profile-header-actions">
          <Link to="/orders" className="btn-profile-orders">
            <Receipt size={16} />
            <span>Orders & Returns</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="profile-layout-grid">
        {/* Navigation Sidebar */}
        <div className="profile-nav-card">
          <div className="profile-nav-title">Account Menu</div>
          <button
            className={`profile-nav-item ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            <UserIcon size={18} />
            <span>Personal Information</span>
          </button>

          <button
            className={`profile-nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
            onClick={() => setActiveTab('addresses')}
          >
            <MapPin size={18} />
            <span>Delivery Addresses</span>
            <span className="nav-count-badge">{addresses.length}</span>
          </button>

          <div className="nav-card-divider"></div>

          <Link to="/orders" className="profile-nav-item">
            <Receipt size={18} />
            <span>My Orders & Invoices</span>
          </Link>
        </div>

        {/* Content Pane */}
        <div className="profile-content-card">
          {/* TAB 1: PERSONAL INFORMATION */}
          {activeTab === 'personal' && (
            <div className="tab-pane">
              <div className="pane-header">
                <div>
                  <h3>Personal Information</h3>
                  <p>Update your personal identity details, contact info, and preferences.</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="profile-form">
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      required
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      placeholder="e.g. Aarav Sharma"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      required
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      placeholder="e.g. aarav@example.com"
                    />
                    <span className="form-field-hint">Used for order receipts and OTP updates</span>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Mobile Number (India)</label>
                    <div className="phone-input-wrapper">
                      <span className="phone-prefix">+91</span>
                      <input
                        type="tel"
                        required
                        value={profile.phone.replace('+91 ', '')}
                        onChange={(e) =>
                          setProfile({ ...profile, phone: `+91 ${e.target.value.replace(/\D/g, '').slice(0, 10)}` })
                        }
                        placeholder="9876543210"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Gender</label>
                    <select
                      value={profile.gender}
                      onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                      className="clean-select"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      value={profile.dob}
                      onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Alternate Mobile Number (Optional)</label>
                    <input
                      type="tel"
                      value={profile.alternatePhone}
                      onChange={(e) => setProfile({ ...profile, alternatePhone: e.target.value })}
                      placeholder="Secondary contact number"
                    />
                  </div>
                </div>

                <div className="profile-form-footer">
                  <button type="submit" className="btn-save-primary">
                    <Save size={16} />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: DELIVERY ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="tab-pane">
              <div className="pane-header">
                <div>
                  <h3>Saved Delivery Addresses</h3>
                  <p>Manage destinations for doorstep delivery across India.</p>
                </div>
                <button className="btn-add-address" onClick={handleOpenAddAddress}>
                  <Plus size={16} />
                  <span>Add New Address</span>
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="empty-addresses-card">
                  <MapPin size={40} className="empty-icon" />
                  <h4>No delivery addresses saved yet</h4>
                  <p>Add your home or office address for fast, 1-click checkout.</p>
                  <button className="btn-primary-action" onClick={handleOpenAddAddress}>
                    <Plus size={16} />
                    <span>Add Delivery Address</span>
                  </button>
                </div>
              ) : (
                <div className="addresses-grid">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`address-card ${addr.isDefault ? 'is-default' : ''}`}
                    >
                      <div className="address-card-top">
                        <div className="address-badges-group">
                          <span className={`address-type-badge ${addr.type.toLowerCase()}`}>
                            {addr.type === 'HOME' ? <Home size={12} /> : <Briefcase size={12} />}
                            <span>{addr.type}</span>
                          </span>
                          {addr.isDefault && (
                            <span className="address-default-badge">
                              <CheckCircle2 size={12} />
                              <span>Default Address</span>
                            </span>
                          )}
                        </div>

                        <div className="address-card-actions">
                          <button
                            type="button"
                            className="btn-card-action"
                            onClick={() => handleOpenEditAddress(addr)}
                            title="Edit Address"
                            aria-label="Edit Address"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn-card-action danger"
                            onClick={() => handleDeleteAddress(addr.id)}
                            title="Delete Address"
                            aria-label="Delete Address"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="address-card-content">
                        <div className="address-recipient-name">{addr.name}</div>
                        <div className="address-text-line">{addr.house}</div>
                        <div className="address-text-line">{addr.area}</div>
                        {addr.landmark && (
                          <div className="address-landmark-text">Landmark: {addr.landmark}</div>
                        )}
                        <div className="address-city-state">
                          {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                        </div>
                        <div className="address-phone-line">
                          <span>Phone:</span> +91 {addr.phone}
                        </div>
                      </div>

                      <div className="address-card-bottom">
                        {addr.isDefault ? (
                          <span className="default-indicator-text">
                            <ShieldCheck size={14} />
                            <span>Primary delivery address</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="btn-set-default"
                            onClick={() => handleSetDefaultAddress(addr.id)}
                          >
                            Set as Default
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Address Add / Edit Modal */}
      {isAddressModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddressModalOpen(false)}>
          <div className="modal-content size-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}</h2>
              <button
                className="btn-modal-close"
                onClick={() => setIsAddressModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="modal-body address-modal-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label>Receiver's Full Name</label>
                  <input
                    type="text"
                    required
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                <div className="form-group">
                  <label>10-Digit Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={addressForm.phone}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        phone: e.target.value.replace(/\D/g, '').slice(0, 10),
                      })
                    }
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>PIN Code (6 digits)</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={addressForm.pincode}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        pincode: e.target.value.replace(/\D/g, '').slice(0, 6),
                      })
                    }
                    placeholder="e.g. 560038"
                  />
                </div>
                <div className="form-group">
                  <label>City / District</label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    placeholder="e.g. Bengaluru"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Flat, House No., Building, Apartment</label>
                <input
                  type="text"
                  required
                  value={addressForm.house}
                  onChange={(e) => setAddressForm({ ...addressForm, house: e.target.value })}
                  placeholder="e.g. Flat 402, Lotus Grandeur, 4th Cross"
                />
              </div>

              <div className="form-group">
                <label>Area, Colony, Sector, Street</label>
                <input
                  type="text"
                  required
                  value={addressForm.area}
                  onChange={(e) => setAddressForm({ ...addressForm, area: e.target.value })}
                  placeholder="e.g. Indiranagar 100ft Road"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Landmark (Optional)</label>
                  <input
                    type="text"
                    value={addressForm.landmark}
                    onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                    placeholder="e.g. Opposite Metro Pillar 124"
                  />
                </div>

                <div className="form-group">
                  <label>State</label>
                  <select
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="clean-select"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Address Type</label>
                <div className="address-type-selector">
                  <label className={`type-btn ${addressForm.type === 'HOME' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="addrType"
                      checked={addressForm.type === 'HOME'}
                      onChange={() => setAddressForm({ ...addressForm, type: 'HOME' })}
                    />
                    <Home size={14} />
                    <span>Home (All-day delivery)</span>
                  </label>
                  <label className={`type-btn ${addressForm.type === 'WORK' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="addrType"
                      checked={addressForm.type === 'WORK'}
                      onChange={() => setAddressForm({ ...addressForm, type: 'WORK' })}
                    />
                    <Briefcase size={14} />
                    <span>Work (10 AM - 6 PM)</span>
                  </label>
                </div>
              </div>

              <div className="checkbox-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  />
                  <span>Make this my default delivery address</span>
                </label>
              </div>

              <div className="modal-actions-bar">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsAddressModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save-primary">
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
