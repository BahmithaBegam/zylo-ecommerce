import React, { useState } from 'react';
import { User as UserIcon, Mail, Phone, MapPin, Plus, Trash2, ShieldCheck, Lock, Package, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { ShippingAddress } from '../types/index.js';

export const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, updateProfile, addAddress, deleteAddress } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'security'>('profile');

  // Edit profile state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Add address state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<Omit<ShippingAddress, 'id'>>({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    isDefault: false,
  });

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white rounded-3xl border border-zinc-200">
        <h2 className="text-xl font-bold text-zinc-900 mb-2">Please Sign In</h2>
        <p className="text-xs text-zinc-500 mb-6">Log in to manage your profile and shipping settings.</p>
        <Link to="/login" className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold">
          Sign In
        </Link>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdatingProfile(true);
      await updateProfile(name, phone);
      success('Profile updated successfully!');
    } catch (err: any) {
      error(err.message || 'Failed to update profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.fullName || !newAddress.addressLine1 || !newAddress.city || !newAddress.state || !newAddress.postalCode) {
      error('Please complete all required address fields.');
      return;
    }
    try {
      await addAddress(newAddress);
      success('Shipping address added successfully!');
      setIsAddingAddress(false);
      setNewAddress({
        fullName: user.name,
        phone: user.phone || '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'United States',
        isDefault: false,
      });
    } catch (err: any) {
      error(err.message || 'Failed to add address.');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await deleteAddress(id);
      success('Address removed.');
    } catch (err: any) {
      error(err.message || 'Failed to remove address.');
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      error('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      error('Passwords do not match.');
      return;
    }
    success('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-black text-3xl flex items-center justify-center shadow-lg">
          {user.name.charAt(0)}
        </div>
        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-black text-zinc-900">{user.name}</h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 capitalize border border-indigo-100">
              {user.role}
            </span>
          </div>
          <p className="text-xs text-zinc-500">{user.email}</p>
          <p className="text-[11px] text-zinc-400">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/orders"
            className="px-4 py-2.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700 flex items-center gap-1.5 transition-colors"
          >
            <Package className="w-4 h-4 text-indigo-600" /> Orders
          </Link>
          <Link
            to="/wishlist"
            className="px-4 py-2.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700 flex items-center gap-1.5 transition-colors"
          >
            <Heart className="w-4 h-4 text-rose-600" /> Wishlist
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 gap-8">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'profile'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          Account Details
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'addresses'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          Saved Addresses ({user.addresses?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'security'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          Security & Password
        </button>
      </div>

      {/* Tab 1: Account Details */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-sm max-w-2xl">
          <h2 className="text-lg font-black text-zinc-900 mb-6">Personal Information</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-zinc-400 mt-1 block">
                Contact support to modify primary account email.
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="px-6 py-2.5 bg-zinc-900 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl transition-colors shadow-md disabled:opacity-50"
              >
                {isUpdatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-zinc-900">Saved Shipping Addresses</h2>
            <button
              onClick={() => setIsAddingAddress(!isAddingAddress)}
              className="px-4 py-2 bg-zinc-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Address
            </button>
          </div>

          {/* Add Address Form */}
          {isAddingAddress && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-md">
              <h3 className="text-base font-bold text-zinc-900 mb-4">Add New Delivery Location</h3>
              <form onSubmit={handleAddAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Recipient Name *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.fullName}
                    onChange={e => setNewAddress({ ...newAddress, fullName: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={newAddress.phone}
                    onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Address Line 1 *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.addressLine1}
                    onChange={e => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    value={newAddress.addressLine2}
                    onChange={e => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={newAddress.state}
                      onChange={e => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">Zip *</label>
                    <input
                      type="text"
                      required
                      value={newAddress.postalCode}
                      onChange={e => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 flex gap-3 pt-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-colors"
                  >
                    Save Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="px-6 py-2.5 bg-zinc-100 text-zinc-700 rounded-xl text-xs font-bold hover:bg-zinc-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Addresses Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {user.addresses?.map(addr => (
              <div
                key={addr.id}
                className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-zinc-900">{addr.fullName}</span>
                    {addr.isDefault && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-600">{addr.addressLine1} {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</p>
                  <p className="text-zinc-600">{addr.city}, {addr.state} {addr.postalCode}</p>
                  <p className="text-zinc-600">{addr.country}</p>
                  <p className="text-zinc-400 font-medium">Phone: {addr.phone}</p>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex justify-end">
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Security */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-sm max-w-2xl space-y-6">
          <h2 className="text-lg font-black text-zinc-900">Account Security</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-indigo-500"
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-zinc-900 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl transition-colors shadow-md"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
