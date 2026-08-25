import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Truck,
  Edit2,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  FileText,
  MapPin,
} from 'lucide-react';
import { Order } from '../../types/index.js';
import { useToast } from '../../context/ToastContext.js';
import { formatINR } from '../../utils/formatters.js';
import api from '../../services/api.js';

export const AdminOrders: React.FC = () => {
  const { success, error } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Status update modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>('Processing');
  const [trackingNote, setTrackingNote] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/orders');
      if (res.data?.success) {
        setOrders(res.data.orders);
      }
    } catch (err: any) {
      error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setTrackingNote(`Order moved to ${order.orderStatus}`);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      setIsUpdating(true);
      const res = await api.put(`/admin/orders/${selectedOrder._id}/status`, {
        status: newStatus,
        note: trackingNote || `Status updated to ${newStatus}`,
      });

      if (res.data?.success) {
        success(`Order #${selectedOrder.orderNumber} status updated to ${newStatus}`);
        setOrders(orders.map(o => (o._id === selectedOrder._id ? res.data.order : o)));
        setSelectedOrder(null);
      }
    } catch (err: any) {
      error(err.message || 'Failed to update order status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.userName?.toLowerCase().includes(search.toLowerCase()) ||
      o.shippingAddress.fullName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
          Customer Order Fulfillment
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Monitor incoming transactions, update tracking numbers, and progress order pipeline
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by Order # or Customer Name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-zinc-700 outline-none"
          >
            <option value="all">All Fulfillment Stages</option>
            <option value="Placed">Placed</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-400 font-semibold uppercase tracking-wider">
                <th className="py-4 px-6">Order ID</th>
                <th className="py-4 px-4">Customer</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4">Items</th>
                <th className="py-4 px-4">Amount</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredOrders.map(order => (
                <tr key={order._id} className="hover:bg-zinc-50/60 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-zinc-900">
                    {order.orderNumber}
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-zinc-900">{order.shippingAddress.fullName}</div>
                    <div className="text-[11px] text-zinc-400">{order.shippingAddress.city}, {order.shippingAddress.state}</div>
                  </td>
                  <td className="py-4 px-4 text-zinc-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4 font-medium text-zinc-700">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </td>
                  <td className="py-4 px-4 font-black text-zinc-900">
                    {formatINR(order.totalAmount || order.total)}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        order.orderStatus === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.orderStatus === 'Cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleOpenStatusModal(order)}
                      className="px-3 py-1.5 bg-zinc-100 hover:bg-indigo-50 hover:text-indigo-600 text-zinc-700 rounded-xl font-bold text-xs transition-colors"
                    >
                      Update Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Order Status Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-zinc-900 mb-1">
              Update Order Status • {selectedOrder.orderNumber}
            </h3>
            <p className="text-xs text-zinc-500 mb-6">
              Advance this order through the fulfillment pipeline and write tracking update notes.
            </p>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">New Stage</label>
                <select
                  value={newStatus}
                  onChange={e => {
                    setNewStatus(e.target.value);
                    setTrackingNote(`Order marked as ${e.target.value} by warehouse team.`);
                  }}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs outline-none font-bold"
                >
                  <option value="Placed">Placed</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing / Packaged</option>
                  <option value="Shipped">Shipped / In Transit</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Status Activity Note</label>
                <textarea
                  rows={3}
                  value={trackingNote}
                  onChange={e => setTrackingNote(e.target.value)}
                  placeholder="e.g. Package sorted at regional distribution center..."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2.5 bg-zinc-100 text-zinc-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : 'Save Pipeline Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
