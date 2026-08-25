import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Truck,
  RotateCcw,
  XCircle,
  ArrowRight,
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  Receipt,
  Calendar,
  Sparkles,
  Search,
  ShoppingBag,
  X,
  ShieldCheck,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';
import { Order, OrderItem } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';
import { useToast } from '../context/ToastContext.js';
import { EmptyState } from '../components/common/EmptyState.js';
import { formatINR } from '../utils/formatters.js';
import { handleImageError, getCategoryFallback } from '../utils/imageFallbacks.js';
import api from '../services/api.js';

// Order Status Pipeline definition
const STANDARD_STAGES = [
  { key: 'Placed', label: 'Order Placed', desc: 'Order submitted & verified' },
  { key: 'Confirmed', label: 'Confirmed', desc: 'Payment received & confirmed' },
  { key: 'Processing', label: 'Processing', desc: 'Packed at fulfillment hub' },
  { key: 'Shipped', label: 'Shipped', desc: 'Dispatched via air carrier' },
  { key: 'Out for Delivery', label: 'Out for Delivery', desc: 'Assigned to delivery agent' },
  { key: 'Delivered', label: 'Delivered', desc: 'Safely handed over to you' },
];

export const MyOrdersPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { addToCart } = useCart();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'delivered' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Order for Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [copiedTrackingId, setCopiedTrackingId] = useState<string | null>(null);
  const [isReorderingId, setIsReorderingId] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/my-orders');
      if (res.data?.success) {
        // Ensure sorted newest first
        const sorted = (res.data.orders || []).sort(
          (a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sorted);
      }
    } catch (err: any) {
      console.warn('Failed to load user orders:', err);
      error(err.response?.data?.message || 'Could not load your orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const handleCopyTracking = (trackingId: string) => {
    navigator.clipboard.writeText(trackingId);
    setCopiedTrackingId(trackingId);
    success(`Tracking ID ${trackingId} copied to clipboard!`);
    setTimeout(() => setCopiedTrackingId(null), 2500);
  };

  const handleCancelOrder = async (orderId: string, orderNumber: string) => {
    if (!window.confirm(`Are you sure you want to cancel order #${orderNumber}? Any prepaid amount will be refunded.`)) {
      return;
    }

    try {
      setCancellingOrderId(orderId);
      const res = await api.put(`/orders/${orderId}/cancel`);
      if (res.data?.success) {
        success(`Order #${orderNumber} cancelled successfully. Refund initiated.`);
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(res.data.order);
        }
        await fetchOrders();
      } else {
        error(res.data?.message || 'Failed to cancel order.');
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Could not cancel order.');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleBuyAgain = async (items: OrderItem[], orderNumber: string) => {
    try {
      setIsReorderingId(orderNumber);
      let addedCount = 0;
      for (const item of items) {
        try {
          await addToCart(item.productId, item.quantity || 1, item.selectedColor, item.selectedSize);
          addedCount += item.quantity || 1;
        } catch (itemErr: any) {
          console.warn(`Product ${item.name} could not be added:`, itemErr);
        }
      }

      if (addedCount > 0) {
        success(`${addedCount} item(s) from order #${orderNumber} added to your cart!`);
        navigate('/cart');
      } else {
        error('The items in this order are currently out of stock.');
      }
    } catch (err: any) {
      error('Failed to add items to cart. Please try again.');
    } finally {
      setIsReorderingId(null);
    }
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    try {
      setIsDeletingId(orderToDelete._id);
      const res = await api.delete(`/orders/${orderToDelete._id}`);
      if (res.data?.success) {
        success('Order removed from your order history.');
        setOrders(prev =>
          prev.filter(o => o._id !== orderToDelete._id && o.orderNumber !== orderToDelete.orderNumber)
        );
        if (
          selectedOrder &&
          (selectedOrder._id === orderToDelete._id ||
            selectedOrder.orderNumber === orderToDelete.orderNumber)
        ) {
          setSelectedOrder(null);
        }
        setOrderToDelete(null);
      } else {
        error(res.data?.message || 'Failed to remove order.');
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Could not remove order from history.');
    } finally {
      setIsDeletingId(null);
    }
  };

  // Filtered & Searched Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Tab filter
      if (activeTab === 'active') {
        if (['Delivered', 'Cancelled'].includes(order.orderStatus)) return false;
      } else if (activeTab === 'delivered') {
        if (order.orderStatus !== 'Delivered') return false;
      } else if (activeTab === 'cancelled') {
        if (order.orderStatus !== 'Cancelled') return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesNumber = (order.orderNumber || '').toLowerCase().includes(q);
        const matchesTracking = (order.trackingNumber || '').toLowerCase().includes(q);
        const matchesItem = order.items.some(it => (it.name || '').toLowerCase().includes(q));
        return matchesNumber || matchesTracking || matchesItem;
      }

      return true;
    });
  }, [orders, activeTab, searchQuery]);

  const getStatusColorClasses = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Cancelled':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'Shipped':
      case 'Out for Delivery':
        return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'Processing':
      case 'Confirmed':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    }
  };

  const getStageIndex = (currentStatus: string) => {
    const idx = STANDARD_STAGES.findIndex(s => s.key.toLowerCase() === currentStatus.toLowerCase());
    return idx === -1 ? 0 : idx;
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 sm:p-10 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
          <Package className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight mb-2">Please Sign In</h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
          Log in to your Zylo account to access your complete persistent order history, invoices, and live delivery tracking.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center justify-center w-full px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-black uppercase tracking-wider hover:opacity-90 transition-opacity"
        >
          Sign In to Zylo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
              My Orders
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {orders.length} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Track your ongoing shipments, review past invoices, and reorder with ease.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/shop"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'active'
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            In Progress ({orders.filter(o => !['Delivered', 'Cancelled'].includes(o.orderStatus)).length})
          </button>
          <button
            onClick={() => setActiveTab('delivered')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'delivered'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Delivered ({orders.filter(o => o.orderStatus === 'Delivered').length})
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'cancelled'
                ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Cancelled ({orders.filter(o => o.orderStatus === 'Cancelled').length})
          </button>
        </div>

        {/* Search input */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by Order # or Product..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(n => (
            <div
              key={n}
              className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-6 animate-pulse space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-32" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-24" />
              </div>
              <div className="h-16 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State when no orders exist */}
      {!loading && orders.length === 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-12 text-center shadow-sm">
          <EmptyState
            icon={Package}
            title="No orders yet"
            description="You haven't placed any orders yet. Explore our curated collections in Fashion, Electronics, Beauty, and Lifestyle!"
            actionText="Start Shopping"
            actionHref="/shop"
          />
        </div>
      )}

      {/* Empty State when search/filter returns zero */}
      {!loading && orders.length > 0 && filteredOrders.length === 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-12 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-zinc-400 mx-auto" />
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No matching orders found</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            Try adjusting your search query or switching to another filter tab to view your order history.
          </p>
          <button
            onClick={() => {
              setActiveTab('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-bold hover:bg-zinc-200"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Orders List */}
      {!loading && filteredOrders.length > 0 && (
        <div className="space-y-6">
          {filteredOrders.map(order => {
            const canCancel = ['Placed', 'Confirmed'].includes(order.orderStatus);
            const isCancelled = order.orderStatus === 'Cancelled';
            const isDelivered = order.orderStatus === 'Delivered';
            const stageIdx = getStageIndex(order.orderStatus);

            return (
              <div
                key={order._id}
                className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm overflow-hidden transition-all hover:shadow-md"
              >
                {/* Header Bar */}
                <div className="bg-zinc-50/90 dark:bg-zinc-800/40 p-4 sm:p-6 border-b border-zinc-200/70 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-4 sm:gap-6">
                    <div>
                      <span className="text-zinc-400 dark:text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
                        Order Placed
                      </span>
                      <div className="font-bold text-zinc-900 dark:text-white mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>

                    <div>
                      <span className="text-zinc-400 dark:text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
                        Total Amount
                      </span>
                      <div className="font-black text-zinc-900 dark:text-white mt-0.5">
                        {formatINR(order.total)}
                      </div>
                    </div>

                    <div>
                      <span className="text-zinc-400 dark:text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
                        Order #
                      </span>
                      <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                        {order.orderNumber}
                      </div>
                    </div>

                    <div>
                      <span className="text-zinc-400 dark:text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
                        Payment
                      </span>
                      <div className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5 flex items-center gap-1 capitalize">
                        <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                        {order.paymentMethod} •{' '}
                        <span
                          className={
                            order.paymentStatus === 'paid'
                              ? 'text-emerald-600 font-bold'
                              : 'text-amber-600 font-bold'
                          }
                        >
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusColorClasses(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                {/* Progress / Timeline Stepper on Card */}
                <div className="px-4 sm:px-6 pt-5 pb-2">
                  {!isCancelled ? (
                    <div className="relative">
                      {/* Horizontal connecting line */}
                      <div className="hidden sm:block absolute left-0 right-0 top-3 h-0.5 bg-zinc-200 dark:bg-zinc-800 -z-0" />

                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center">
                        {STANDARD_STAGES.map((stg, sIdx) => {
                          const isDone = sIdx <= stageIdx;
                          const isCurrent = sIdx === stageIdx;

                          return (
                            <div key={stg.key} className="flex flex-col items-center relative z-10">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                                  isDone
                                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-50 dark:ring-indigo-950/60'
                                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'
                                }`}
                              >
                                {isDone ? <Check className="w-3 h-3" /> : sIdx + 1}
                              </div>
                              <span
                                className={`text-[11px] font-bold mt-1.5 leading-tight ${
                                  isCurrent
                                    ? 'text-indigo-600 dark:text-indigo-400'
                                    : isDone
                                    ? 'text-zinc-800 dark:text-zinc-200'
                                    : 'text-zinc-400 dark:text-zinc-500'
                                }`}
                              >
                                {stg.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300">
                      <XCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>
                        <strong>Order Cancelled.</strong> Any deducted payment has been initiated for refund back to your original source.
                      </span>
                    </div>
                  )}
                </div>

                {/* Items List */}
                <div className="p-4 sm:p-6 divide-y divide-zinc-100 dark:divide-zinc-800/80">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={item.image || getCategoryFallback('general')}
                          alt={item.name}
                          onError={e => handleImageError(e, 'general')}
                          className="w-16 h-16 rounded-2xl object-cover bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shrink-0"
                        />
                        <div className="space-y-0.5">
                          <Link
                            to={`/product/${item.productId}`}
                            className="font-bold text-zinc-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1 sm:line-clamp-2 text-xs sm:text-sm"
                          >
                            {item.name}
                          </Link>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                            <span>Qty: <strong className="text-zinc-800 dark:text-zinc-200">{item.quantity}</strong></span>
                            {item.selectedColor && (
                              <span>• Color: <strong className="text-zinc-800 dark:text-zinc-200">{item.selectedColor}</strong></span>
                            )}
                            {item.selectedSize && (
                              <span>• Size: <strong className="text-zinc-800 dark:text-zinc-200">{item.selectedSize}</strong></span>
                            )}
                            {item.sku && (
                              <span className="font-mono text-[10px] text-zinc-400">({item.sku})</span>
                            )}
                          </div>
                          <div className="font-bold text-zinc-800 dark:text-zinc-300">
                            {formatINR(item.price)} each
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-black text-zinc-900 dark:text-white text-sm sm:text-base">
                          {formatINR(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Action Footer */}
                <div className="bg-zinc-50/50 dark:bg-zinc-800/20 p-4 sm:p-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs">
                  {/* Tracking & Delivery Estimation */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                      <Truck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span>
                        Courier: <strong className="text-zinc-900 dark:text-white">{order.carrier || 'Zylo Express Air'}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyTracking(order.trackingNumber)}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-500 hover:text-indigo-600 ml-1"
                        title="Copy tracking ID"
                      >
                        <span>({order.trackingNumber})</span>
                        {copiedTrackingId === order.trackingNumber ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      <span>
                        Estimated Delivery: <strong className="text-emerald-700 dark:text-emerald-400">{order.estimatedDeliveryDate}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {canCancel && (
                      <button
                        type="button"
                        disabled={cancellingOrderId === order._id}
                        onClick={() => handleCancelOrder(order._id, order.orderNumber)}
                        className="px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl font-bold transition-colors border border-rose-200 dark:border-rose-800/60 disabled:opacity-50"
                      >
                        {cancellingOrderId === order._id ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={isReorderingId === order.orderNumber}
                      onClick={() => handleBuyAgain(order.items, order.orderNumber)}
                      className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-xl font-bold transition-colors inline-flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      {isReorderingId === order.orderNumber ? 'Adding to Cart...' : 'Buy Again / Reorder'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setOrderToDelete(order)}
                      className="px-3 py-2 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl font-bold transition-colors inline-flex items-center gap-1.5"
                      title="Remove from order history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs hover:opacity-90"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Details
                    </button>

                    <Link
                      to={`/orders/track?number=${order.orderNumber}`}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs"
                    >
                      Track Live <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ORDER DETAILS MODAL                                                       */}
      {/* ========================================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
            
            {/* Modal Header */}
            <div className="p-6 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md z-10">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
                    Order #{selectedOrder.orderNumber}
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusColorClasses(
                      selectedOrder.orderStatus
                    )}`}
                  >
                    {selectedOrder.orderStatus}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 text-xs">
              
              {/* Order Status History Timeline */}
              <div className="bg-zinc-50 dark:bg-zinc-800/40 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-zinc-900 dark:text-white text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Order Status Timeline
                  </h3>
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    Est. Delivery: {selectedOrder.estimatedDeliveryDate}
                  </span>
                </div>

                <div className="relative pl-6 space-y-4 border-l-2 border-indigo-500/30 ml-2">
                  {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 ? (
                    selectedOrder.statusHistory.map((hist, hIdx) => (
                      <div key={hIdx} className="relative">
                        <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-indigo-100 dark:ring-indigo-950/70" />
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-bold text-zinc-900 dark:text-white text-xs">{hist.status}</span>
                          <span className="text-[10px] text-zinc-400">
                            {new Date(hist.timestamp).toLocaleString('en-IN')}
                          </span>
                        </div>
                        {hist.note && (
                          <p className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-0.5">{hist.note}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="relative">
                      <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-indigo-100 dark:ring-indigo-950/70" />
                      <div className="font-bold text-zinc-900 dark:text-white">{selectedOrder.orderStatus}</div>
                      <p className="text-zinc-500 text-[11px]">Order verified by fulfillment hub.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h3 className="font-bold text-zinc-900 dark:text-white text-sm">Ordered Items ({selectedOrder.items.length})</h3>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={item.image || getCategoryFallback('general')}
                          alt={item.name}
                          onError={e => handleImageError(e, 'general')}
                          className="w-14 h-14 rounded-xl object-cover bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                        />
                        <div>
                          <Link
                            to={`/product/${item.productId}`}
                            onClick={() => setSelectedOrder(null)}
                            className="font-bold text-zinc-900 dark:text-white hover:text-indigo-600 transition-colors line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                            Qty: <strong>{item.quantity}</strong>{' '}
                            {item.selectedColor ? `• ${item.selectedColor}` : ''}{' '}
                            {item.selectedSize ? `• ${item.selectedSize}` : ''}
                          </div>
                          <span className="text-zinc-800 dark:text-zinc-300 font-bold">{formatINR(item.price)} each</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-zinc-900 dark:text-white text-sm">
                          {formatINR(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Two Column Grid: Shipping Address & Price Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Shipping & Payment Meta */}
                <div className="bg-zinc-50 dark:bg-zinc-800/40 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-4">
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-white mb-2 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Delivery Address
                    </h4>
                    <div className="text-zinc-600 dark:text-zinc-300 space-y-0.5 leading-relaxed">
                      <div className="font-bold text-zinc-900 dark:text-white">
                        {selectedOrder.shippingAddress?.fullName || selectedOrder.userName}
                      </div>
                      <div>{selectedOrder.shippingAddress?.addressLine1}</div>
                      {selectedOrder.shippingAddress?.addressLine2 && (
                        <div>{selectedOrder.shippingAddress.addressLine2}</div>
                      )}
                      <div>
                        {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}{' '}
                        {selectedOrder.shippingAddress?.postalCode}
                      </div>
                      <div>{selectedOrder.shippingAddress?.country || 'India'}</div>
                      <div className="font-semibold text-zinc-800 dark:text-zinc-200 mt-1">
                        Phone: {selectedOrder.shippingAddress?.phone}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-200/70 dark:border-zinc-800">
                    <h4 className="font-bold text-zinc-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Payment Details
                    </h4>
                    <p className="text-zinc-600 dark:text-zinc-300 capitalize">
                      Method: <strong>{selectedOrder.paymentMethod}</strong> • Status:{' '}
                      <span className="text-emerald-600 font-bold uppercase">{selectedOrder.paymentStatus}</span>
                    </p>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-zinc-50 dark:bg-zinc-800/40 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-3">
                  <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Price Breakdown
                  </h4>
                  
                  <div className="space-y-2 text-zinc-600 dark:text-zinc-300">
                    <div className="flex justify-between">
                      <span>Items Subtotal</span>
                      <span className="font-semibold text-zinc-900 dark:text-white">{formatINR(selectedOrder.subtotal)}</span>
                    </div>

                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                        <span>Coupon / Promo Discount</span>
                        <span>-{formatINR(selectedOrder.discount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>GST (5% Indian Commerce Tax)</span>
                      <span className="font-semibold text-zinc-900 dark:text-white">{formatINR(selectedOrder.tax)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Shipping & Express Handling</span>
                      <span className="font-semibold text-zinc-900 dark:text-white">
                        {selectedOrder.shipping === 0 ? 'FREE' : formatINR(selectedOrder.shipping)}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-zinc-200 dark:border-zinc-700 flex justify-between items-center text-sm font-black text-zinc-900 dark:text-white">
                      <span>Grand Total Paid</span>
                      <span className="text-base text-indigo-600 dark:text-indigo-400">{formatINR(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Actions Footer */}
            <div className="p-6 bg-zinc-50/80 dark:bg-zinc-800/40 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const ord = selectedOrder;
                    setOrderToDelete(ord);
                  }}
                  className="px-3.5 py-2 text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold rounded-xl text-xs transition-colors inline-flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove from History
                </button>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:block">
                  Carrier: <strong>{selectedOrder.carrier}</strong> • Tracking #{' '}
                  <strong className="font-mono text-zinc-800 dark:text-zinc-200">{selectedOrder.trackingNumber}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {['Placed', 'Confirmed'].includes(selectedOrder.orderStatus) && (
                  <button
                    onClick={() => handleCancelOrder(selectedOrder._id, selectedOrder.orderNumber)}
                    className="px-4 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold rounded-xl border border-rose-200 dark:border-rose-800 text-xs transition-colors"
                  >
                    Cancel Order
                  </button>
                )}

                <button
                  onClick={() => handleBuyAgain(selectedOrder.items, selectedOrder.orderNumber)}
                  className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-xl text-xs hover:opacity-90 transition-opacity"
                >
                  Buy Again
                </button>

                <Link
                  to={`/orders/track?number=${selectedOrder.orderNumber}`}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors"
                >
                  Track Package
                </Link>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE ORDER FROM HISTORY CONFIRMATION DIALOG                            */}
      {/* ========================================================================= */}
      {orderToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
                  Remove from History
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Are you sure you want to remove this order from your order history?
                </p>
                <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono mt-1">
                  Order #{orderToDelete.orderNumber}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeletingId === orderToDelete._id}
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingId === orderToDelete._id}
                onClick={confirmDeleteOrder}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {isDeletingId === orderToDelete._id ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
