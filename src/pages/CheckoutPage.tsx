import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  Banknote,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Plus,
  AlertCircle,
  Smartphone,
  Building2,
  ChevronRight,
  Check,
  Mail,
  Edit3,
} from 'lucide-react';
import { ShippingAddress } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';
import { useToast } from '../context/ToastContext.js';
import { formatINR } from '../utils/formatters.js';
import api from '../services/api.js';

export const CheckoutPage: React.FC = () => {
  const { user, isAuthenticated, addAddress, updateProfile } = useAuth();
  const { cart, refreshCart } = useCart();
  const { success, error } = useToast();
  const navigate = useNavigate();

  // 3-Step State
  const [currentStep, setCurrentStep] = useState<2 | 3>(2);

  // Email state for legacy/demo replacement
  const [emailInput, setEmailInput] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  // Address states
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<Omit<ShippingAddress, 'id'>>({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: true,
  });

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'cod'>('upi');
  const [upiMethod, setUpiMethod] = useState<'gpay' | 'phonepe' | 'paytm' | 'custom'>('gpay');
  const [upiVpa, setUpiVpa] = useState('user@okhdfcbank');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [cardDetails, setCardDetails] = useState({
    number: '4532 8921 4452 9012',
    name: user?.name || '',
    expiry: '11/29',
    cvv: '824',
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isDemoOrInvalidEmail = !user?.email || user.email === 'user@zylo.com' || !EMAIL_REGEX.test(user.email);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }

    if (user?.addresses && user.addresses.length > 0) {
      const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setSelectedAddressId(defaultAddr.id);
    } else {
      setIsAddingNewAddress(true);
    }

    if (user?.name) {
      setNewAddress(prev => ({
        ...prev,
        fullName: prev.fullName || user.name,
        phone: prev.phone || user.phone || '',
      }));
      setCardDetails(prev => ({
        ...prev,
        name: prev.name || user.name,
      }));
    }
  }, [isAuthenticated, user, navigate]);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = emailInput.trim().toLowerCase();
    if (!EMAIL_REGEX.test(clean)) {
      error('Please enter a valid email address (e.g., name@example.com).');
      return;
    }
    if (clean === 'user@zylo.com') {
      error('Please enter your personal email address.');
      return;
    }

    try {
      setIsUpdatingEmail(true);
      await updateProfile(user?.name, user?.phone, clean);
      success('Email updated successfully! Order confirmations will be sent to your email.');
      setEmailInput('');
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to update email address.');
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white rounded-3xl border border-zinc-200 shadow-sm">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-black text-zinc-900 mb-2">Your Bag is Empty</h2>
        <p className="text-xs text-zinc-500 mb-6">Add items to your bag before proceeding to checkout.</p>
        <Link to="/shop" className="px-6 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold">
          Explore Catalog
        </Link>
      </div>
    );
  }

  const subtotal = cart.subtotal;
  const freeShippingThreshold = 999;
  const shipping = subtotal >= freeShippingThreshold ? 0 : 79;
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isDemoOrInvalidEmail) {
      error('Please enter a valid personal email address to receive your order confirmation.');
      return;
    }

    let shippingAddress: ShippingAddress;

    if (isAddingNewAddress) {
      if (
        !newAddress.fullName ||
        !newAddress.phone ||
        !newAddress.addressLine1 ||
        !newAddress.city ||
        !newAddress.state ||
        !newAddress.postalCode
      ) {
        error('Please complete all required address fields.');
        return;
      }
      shippingAddress = {
        ...newAddress,
        id: `addr_${Date.now()}`,
      };
      if (addAddress) {
        addAddress(shippingAddress);
      }
    } else {
      const found = user?.addresses?.find(a => a.id === selectedAddressId);
      if (!found) {
        error('Please select or add a delivery address.');
        return;
      }
      shippingAddress = found;
    }

    try {
      setIsProcessing(true);

      const orderPayload = {
        items: cart.items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          selectedColor: i.selectedColor,
          selectedSize: i.selectedSize,
          name: i.name,
          price: i.price,
          image: i.image,
          sku: i.sku,
        })),
        shippingAddress,
        paymentMethod,
        paymentDetails: {
          method: paymentMethod,
          upiVpa: paymentMethod === 'upi' ? upiVpa : undefined,
          bank: paymentMethod === 'netbanking' ? selectedBank : undefined,
          cardLast4: paymentMethod === 'card' ? cardDetails.number.slice(-4) : undefined,
        },
      };

      const res = await api.post('/orders', orderPayload);

      if (res.data?.success && res.data.order) {
        const confirmedOrder = res.data.order;
        const targetRef = confirmedOrder.orderNumber || confirmedOrder._id || confirmedOrder.id;
        
        // Refresh cart in background
        refreshCart().catch(console.error);
        
        success('Order placed successfully! Confirmation email dispatched to ' + (confirmedOrder.userEmail || user?.email));
        navigate(`/order-confirmation/${targetRef}`, {
          state: { order: confirmedOrder },
          replace: true,
        });
      } else {
        error(res.data?.message || 'Could not place order. Please try again.');
      }
    } catch (err: any) {
      console.error('Order creation error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to place order.';
      if (err.response?.data?.requiresEmailUpdate) {
        error(err.response.data.message);
      } else {
        error(errMsg);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* 3-Step Visual Progress Stepper */}
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-zinc-200 dark:bg-zinc-800 -z-0" />
          
          {/* Step 1: Bag */}
          <Link to="/cart" className="relative z-10 flex flex-col items-center gap-1.5 group">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shadow-md">
              <Check className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-200">1. Bag</span>
          </Link>

          {/* Step 2: Address */}
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className="relative z-10 flex flex-col items-center gap-1.5"
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shadow-md transition-all ${
                currentStep === 2
                  ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-900 ring-4 ring-zinc-200 dark:ring-zinc-800'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              2
            </div>
            <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-200">2. Address</span>
          </button>

          {/* Step 3: Payment */}
          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            className="relative z-10 flex flex-col items-center gap-1.5"
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shadow-md transition-all ${
                currentStep === 3
                  ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-950'
                  : 'bg-white dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500'
              }`}
            >
              3
            </div>
            <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">3. Payment</span>
          </button>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Interactive Section (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Customer Account & Notification Email Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Customer Account & Order Receipt
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                <CheckCircle2 className="w-3 h-3" /> Auto-populated
              </span>
            </div>

            {isDemoOrInvalidEmail ? (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300">Valid Email Required for Order Confirmation</h4>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                      Your account currently has a placeholder email ({user?.email || 'none'}). Please provide your active email to receive invoice receipts and live BlueDart tracking updates.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    placeholder="Enter your personal email (e.g. name@gmail.com)"
                    className="flex-1 bg-white dark:bg-zinc-800 border border-amber-300 dark:border-amber-700 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white outline-none focus:border-indigo-600 dark:focus:border-indigo-400"
                  />
                  <button
                    type="button"
                    onClick={handleUpdateEmail}
                    disabled={isUpdatingEmail || !emailInput}
                    className="py-2 px-4 bg-zinc-900 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {isUpdatingEmail ? 'Updating...' : 'Save & Link Email'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-black text-zinc-900 dark:text-white">{user?.name}</div>
                  <div className="text-xs font-mono text-indigo-700 dark:text-indigo-400 font-bold flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-500" />
                    {user?.email}
                  </div>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 pt-0.5">
                    Order confirmation and tracking links will be automatically sent to this address.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailInput(user?.email || '')}
                  className="text-xs text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-2 transition-colors"
                  title="Change delivery email"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}

            {emailInput && !isDemoOrInvalidEmail && (
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl flex gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  placeholder="Update email address"
                  className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleUpdateEmail}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setEmailInput('')}
                  className="px-2 py-1.5 text-zinc-400 text-xs hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* STEP 2: Address Section */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Delivery Address
              </h2>
              {user?.addresses && user.addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isAddingNewAddress ? 'Use Saved Address' : 'Add New Address'}
                </button>
              )}
            </div>

            {/* Existing Saved Addresses */}
            {!isAddingNewAddress && user?.addresses && user.addresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {user.addresses.map(addr => (
                  <label
                    key={addr.id}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                      selectedAddressId === addr.id
                        ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <input
                        type="radio"
                        name="shippingAddressRadio"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                      />
                      {addr.isDefault && (
                        <span className="text-[9px] font-black uppercase tracking-wider bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-zinc-900 dark:text-white">{addr.fullName}</h4>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5 line-clamp-2">
                        {addr.addressLine1}, {addr.addressLine2 ? `${addr.addressLine2}, ` : ''}{addr.city}, {addr.state} - {addr.postalCode}
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono mt-1">📞 +91 {addr.phone}</p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              /* New Indian Address Form */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.fullName}
                    onChange={e => setNewAddress({ ...newAddress, fullName: e.target.value })}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white outline-none focus:border-indigo-600 dark:focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Mobile Number (10 digits) *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={newAddress.phone}
                    onChange={e => setNewAddress({ ...newAddress, phone: e.target.value.replace(/\D/g, '') })}
                    placeholder="9876543210"
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-zinc-900 dark:text-white outline-none focus:border-indigo-600 dark:focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Pincode (6 digits) *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={newAddress.postalCode}
                    onChange={e => setNewAddress({ ...newAddress, postalCode: e.target.value.replace(/\D/g, '') })}
                    placeholder="560038"
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-zinc-900 dark:text-white outline-none focus:border-indigo-600 dark:focus:border-indigo-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Flat, House no., Building, Apartment *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.addressLine1}
                    onChange={e => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                    placeholder="e.g. Flat 402, Royal Palms Residency"
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white outline-none focus:border-indigo-600 dark:focus:border-indigo-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Area, Street, Sector, Village (Optional)</label>
                  <input
                    type="text"
                    value={newAddress.addressLine2}
                    onChange={e => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                    placeholder="e.g. MG Road, Indiranagar"
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white outline-none focus:border-indigo-600 dark:focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Town / City *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                    placeholder="Bengaluru"
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white outline-none focus:border-indigo-600 dark:focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.state}
                    onChange={e => setNewAddress({ ...newAddress, state: e.target.value })}
                    placeholder="Karnataka"
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white outline-none focus:border-indigo-600 dark:focus:border-indigo-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: Payment Options Section */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Payment Options
              </h2>
              <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500">100% Encrypted & Safe</span>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'upi', label: 'UPI / QR', icon: Smartphone },
                { id: 'card', label: 'Cards', icon: CreditCard },
                { id: 'netbanking', label: 'Net Banking', icon: Building2 },
                { id: 'cod', label: 'Pay on Delivery', icon: Banknote },
              ].map(m => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === m.id
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 font-black shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${paymentMethod === m.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400'}`} />
                    <span className="text-xs">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Payment Method Detail Inputs */}
            {paymentMethod === 'upi' && (
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-700 space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-zinc-900 dark:text-white">
                  <span>Choose your UPI App:</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['Google Pay', 'PhonePe', 'Paytm'].map(app => (
                    <button
                      key={app}
                      type="button"
                      onClick={() => setUpiVpa(`user@ok${app.toLowerCase().replace(/\s/g, '')}`)}
                      className="py-2 px-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:border-indigo-600 dark:hover:border-indigo-400 transition-colors text-center"
                    >
                      {app}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 block mb-1">Or enter UPI ID / VPA</label>
                  <input
                    type="text"
                    value={upiVpa}
                    onChange={e => setUpiVpa(e.target.value)}
                    placeholder="username@okhdfcbank"
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-zinc-900 dark:text-white outline-none focus:border-indigo-600 dark:focus:border-indigo-400"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-700 space-y-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardDetails.number}
                    onChange={e => setCardDetails({ ...cardDetails, number: e.target.value })}
                    placeholder="4532 •••• •••• 8821"
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-zinc-900 dark:text-white outline-none focus:border-indigo-600 dark:focus:border-indigo-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Valid Thru</label>
                    <input
                      type="text"
                      value={cardDetails.expiry}
                      onChange={e => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      placeholder="MM/YY"
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-zinc-900 dark:text-white outline-none focus:border-indigo-600 dark:focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">CVV</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardDetails.cvv}
                      onChange={e => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                      placeholder="•••"
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-zinc-900 dark:text-white outline-none focus:border-indigo-600 dark:focus:border-indigo-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'netbanking' && (
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-700 space-y-3">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Select Bank</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Other Banks'].map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSelectedBank(b)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center border ${
                        selectedBank === b
                          ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-900 border-zinc-950 dark:border-white'
                          : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {paymentMethod === 'cod' && (
              <div className="p-4 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900 rounded-2xl text-xs space-y-1">
                <h4 className="font-extrabold text-amber-900 dark:text-amber-300">Cash on Delivery Available</h4>
                <p className="text-amber-800 dark:text-amber-400">
                  Pay with Cash, UPI, or QR code directly to the courier executive upon delivery.
                </p>
              </div>
            )}

          </div>

        </div>

        {/* Right Sticky Order Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-5 sticky top-24">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-6 shadow-md space-y-6">
            <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight pb-3 border-b border-zinc-100 dark:border-zinc-800">
              Order Summary ({cart.itemCount} Items)
            </h3>

            {/* Mini Items Preview */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {cart.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  <img
                    src={item.image}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-zinc-900 dark:text-white truncate">{item.name}</h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Qty: {item.quantity} {item.selectedSize ? `• ${item.selectedSize}` : ''}
                    </p>
                  </div>
                  <span className="font-black text-zinc-950 dark:text-white font-mono">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Registered Customer Recipient Indicator */}
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-100 dark:border-zinc-800 text-[11px] space-y-1">
              <div className="text-zinc-500 dark:text-zinc-400">Dispatching Confirmation to:</div>
              <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 font-mono">
                <Mail className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                {user?.email || 'No email registered'}
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-xs pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Subtotal</span>
                <span className="font-bold text-zinc-900 dark:text-white">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Shipping</span>
                {shipping === 0 ? (
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">FREE</span>
                ) : (
                  <span className="font-bold text-zinc-900 dark:text-white">{formatINR(shipping)}</span>
                )}
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Estimated GST (5%)</span>
                <span className="font-bold text-zinc-900 dark:text-white">{formatINR(tax)}</span>
              </div>

              {/* Total */}
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-baseline">
                <span className="text-base font-black text-zinc-900 dark:text-white">Total Payable</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-zinc-950 dark:text-white tracking-tight">
                    {formatINR(total)}
                  </span>
                  <div className="text-[10px] text-zinc-400 dark:text-zinc-500">All Taxes Included</div>
                </div>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <button
              type="submit"
              disabled={isProcessing || isDemoOrInvalidEmail}
              className="w-full py-4 bg-zinc-950 hover:bg-indigo-600 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              <Lock className="w-4 h-4" />
              <span>{isProcessing ? 'Processing Order...' : `Pay ${formatINR(total)}`}</span>
              {!isProcessing && <ArrowRight className="w-4 h-4" />}
            </button>

            {isDemoOrInvalidEmail && (
              <p className="text-[11px] text-red-600 dark:text-red-400 text-center font-bold">
                ⚠️ Please provide a valid email above to proceed with order.
              </p>
            )}

            <div className="text-center text-[10px] text-zinc-400 dark:text-zinc-500">
              By clicking "Pay", you agree to Zylo's Terms of Service & Privacy Policy.
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};
