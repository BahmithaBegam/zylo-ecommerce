import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Order } from '../types/index.js';
import api from '../services/api.js';

export const OrderTrackingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('number') || '';

  const [query, setQuery] = useState(initialQuery);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const lookupOrder = async (searchNumber: string) => {
    if (!searchNumber.trim()) return;
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.get(`/orders/track/${encodeURIComponent(searchNumber.trim())}`);
      if (res.data?.success) {
        setOrder(res.data.order);
      }
    } catch (err: any) {
      setOrder(null);
      setErrorMsg(err.message || 'Could not find any order with that reference number.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      lookupOrder(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ number: query.trim() });
      lookupOrder(query.trim());
    }
  };

  // Pipeline order states
  const stages = [
    { key: 'Placed', label: 'Order Placed' },
    { key: 'Confirmed', label: 'Confirmed' },
    { key: 'Processing', label: 'Processing' },
    { key: 'Shipped', label: 'In Transit' },
    { key: 'Out for Delivery', label: 'Out for Delivery' },
    { key: 'Delivered', label: 'Delivered' },
  ];

  const getStageIndex = (currentStatus: string) => {
    const idx = stages.findIndex(s => s.key.toLowerCase() === currentStatus.toLowerCase());
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <Truck className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Track Your Zylo Order</h1>
        <p className="text-xs sm:text-sm text-zinc-500">
          Enter your Zylo Order ID (e.g. <strong className="text-zinc-800">ZYLO-2026-8801</strong>) or carrier tracking number.
        </p>

        {/* Quick Sample Order Chips */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-zinc-400">Try sample order:</span>
          {['ZYLO-2026-8801', 'ZYLO-2026-8802', 'ZYLO-2026-8803'].map(id => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setQuery(id);
                setSearchParams({ number: id });
                lookupOrder(id);
              }}
              className="px-2 py-0.5 rounded-lg bg-zinc-100 hover:bg-violet-100 hover:text-violet-700 text-zinc-600 text-xs font-mono font-bold transition-colors"
            >
              {id}
            </button>
          ))}
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-2 pt-2">
          <div className="relative flex-1">
            <input
              type="text"
              required
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="e.g. ZYLO-2026-8801 or TRK-US-9921"
              className="w-full bg-white border border-zinc-200 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-zinc-900 shadow-sm outline-none focus:border-violet-500 font-mono"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-zinc-900 hover:bg-violet-600 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-colors shrink-0 disabled:opacity-50"
          >
            {loading ? 'Tracking...' : 'Track Package'}
          </button>
        </form>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Order Status Display */}
      {order && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-sm space-y-8 animate-in fade-in">
          {/* Status Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-zinc-100 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-zinc-900">{order.orderNumber}</span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    order.orderStatus === 'Delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.orderStatus === 'Cancelled'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}
                >
                  {order.orderStatus}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Carrier: <strong className="text-zinc-700">{order.carrier}</strong> • Tracking: <strong className="text-zinc-700">{order.trackingNumber}</strong>
              </p>
            </div>

            <div className="sm:text-right">
              <span className="text-xs text-zinc-400 uppercase font-semibold">Estimated Arrival</span>
              <div className="text-base font-black text-indigo-600">{order.estimatedDeliveryDate}</div>
            </div>
          </div>

          {/* Visual Timeline Pipeline */}
          <div className="py-4">
            <div className="relative flex items-center justify-between">
              {/* Progress Line */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-zinc-100 -z-0">
                <div
                  className="h-full bg-indigo-600 transition-all duration-700"
                  style={{
                    width: `${(getStageIndex(order.orderStatus) / (stages.length - 1)) * 100}%`,
                  }}
                />
              </div>

              {/* Stage Dots */}
              {stages.map((stage, idx) => {
                const currentIdx = getStageIndex(order.orderStatus);
                const isPassed = idx <= currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div key={stage.key} className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                        isPassed
                          ? 'bg-indigo-600 text-white ring-4 ring-indigo-50'
                          : 'bg-white border-2 border-zinc-200 text-zinc-400'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs font-bold mt-2 text-center whitespace-nowrap ${
                        isCurrent ? 'text-indigo-600' : isPassed ? 'text-zinc-800' : 'text-zinc-400'
                      }`}
                    >
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Logs & Destination Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-100">
            {/* Timestamp History */}
            <div>
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" /> Tracking Updates
              </h4>
              <div className="space-y-4 border-l-2 border-indigo-100 pl-4 ml-2">
                {order.statusHistory?.map((hist, idx) => (
                  <div key={idx} className="relative text-xs space-y-0.5">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-white" />
                    <div className="font-bold text-zinc-900">{hist.status}</div>
                    <p className="text-zinc-600">{hist.note}</p>
                    <span className="text-[10px] text-zinc-400">
                      {new Date(hist.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Destination */}
            <div className="space-y-4">
              <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200 space-y-2 text-xs">
                <h4 className="font-bold text-zinc-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-indigo-600" /> Delivery Address
                </h4>
                <p className="text-zinc-700 font-medium">{order.shippingAddress.fullName}</p>
                <p className="text-zinc-600">{order.shippingAddress.addressLine1} {order.shippingAddress.addressLine2}</p>
                <p className="text-zinc-600">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                <p className="text-zinc-500">Contact: {order.shippingAddress.phone}</p>
              </div>

              {/* Items summary */}
              <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200 space-y-2 text-xs">
                <h4 className="font-bold text-zinc-900 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-indigo-600" /> Package Contents ({order.items.length} items)
                </h4>
                <div className="divide-y divide-zinc-200">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-1.5 flex justify-between items-center text-[11px]">
                      <span className="text-zinc-700 font-medium truncate max-w-[200px]">{item.name}</span>
                      <span className="text-zinc-500">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
