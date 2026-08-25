import React, { useState, useEffect } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Truck, Sparkles, MapPin, Download, Check } from 'lucide-react';
import { Order } from '../types/index.js';
import { formatINR } from '../utils/formatters.js';
import api from '../services/api.js';

export const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order && !!id);

  useEffect(() => {
    if (!order && id) {
      api.get(`/orders/${id}`)
        .then(res => {
          if (res.data?.success && res.data.order) {
            setOrder(res.data.order);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id, order]);

  const orderNum = order?.orderNumber || id || `ZYLO-${Date.now().toString().slice(-6)}`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center space-y-8">
      {/* Animated Success Badge */}
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 shadow-xl ring-8 ring-emerald-50">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5" /> Order Placed & Confirmed
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">
          Thank you for your order!
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 max-w-lg mx-auto leading-relaxed">
          We've received your order and our fulfillment hub has begun preparing your package. A confirmation receipt has been sent to your email.
        </p>
      </div>

      {/* Order Reference Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/90 shadow-sm text-left space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-zinc-100 gap-2">
          <div>
            <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">Order Reference</span>
            <div className="text-base font-mono font-black text-zinc-900">{orderNum}</div>
          </div>
          <div className="sm:text-right">
            <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">Estimated Delivery</span>
            <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 mt-0.5">
              🚚 By Tomorrow, 5:00 PM
            </div>
          </div>
        </div>

        {order?.items && (
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">Purchased Items</h4>
            <div className="divide-y divide-zinc-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120'}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover bg-zinc-100 border border-zinc-200"
                    />
                    <div>
                      <div className="font-bold text-zinc-900 line-clamp-1">{item.name}</div>
                      <div className="text-zinc-500 text-[11px]">
                        Qty: {item.quantity} {item.selectedSize ? `• ${item.selectedSize}` : ''}
                      </div>
                    </div>
                  </div>
                  <span className="font-black text-zinc-900 font-mono">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Summary */}
        {order && (
          <div className="pt-4 border-t border-zinc-100 space-y-1.5 text-xs">
            <div className="flex justify-between text-zinc-600">
              <span>Total Paid Amount</span>
              <span className="font-black text-zinc-900 text-sm">{formatINR(order.totalAmount || order.total)}</span>
            </div>
            <div className="flex justify-between text-zinc-500 text-[11px]">
              <span>Payment Mode</span>
              <span className="font-bold uppercase text-zinc-700">{order.paymentMethod}</span>
            </div>
          </div>
        )}

        {order?.shippingAddress && (
          <div className="pt-4 border-t border-zinc-100 flex items-start gap-3 text-xs text-zinc-600">
            <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-zinc-900 block">Shipping Destination:</span>
              <span>
                {order.shippingAddress.fullName} — {order.shippingAddress.addressLine1},{' '}
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          to={`/orders/track?number=${orderNum}`}
          className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
        >
          <Truck className="w-4 h-4" /> Track Order Status
        </Link>
        <Link
          to="/shop"
          className="w-full sm:w-auto px-8 py-3.5 bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2"
        >
          Continue Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
