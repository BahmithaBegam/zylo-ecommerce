import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldCheck, User as UserIcon, CheckCircle2, XCircle } from 'lucide-react';
import { User } from '../../types/index.js';
import { useToast } from '../../context/ToastContext.js';
import api from '../../services/api.js';

export const AdminUsers: React.FC = () => {
  const { success, error } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      if (res.data?.success) {
        setUsers(res.data.users);
      }
    } catch (err: any) {
      error('Failed to load user roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    if (!window.confirm(`Change this user's role to ${newRole}?`)) return;

    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data?.success) {
        success(`User role updated to ${newRole}`);
        setUsers(users.map(u => (u._id === userId ? { ...u, role: newRole as any } : u)));
      }
    } catch (err: any) {
      error(err.message || 'Failed to update user role.');
    }
  };

  const filteredUsers = users.filter(
    u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
          User & Customer Directory
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Manage registered buyers, role permissions (Admin vs Customer), and profile details
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex items-center max-w-md">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-400 font-semibold uppercase tracking-wider">
                <th className="py-4 px-6">User</th>
                <th className="py-4 px-4">Email</th>
                <th className="py-4 px-4">Joined</th>
                <th className="py-4 px-4">Role</th>
                <th className="py-4 px-6 text-right">Role Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredUsers.map(u => (
                <tr key={u._id} className="hover:bg-zinc-50/60 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-zinc-900">{u.name}</div>
                        <div className="text-[11px] text-zinc-400">{u.phone || 'No phone'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-medium text-zinc-700">{u.email}</td>
                  <td className="py-4 px-4 text-zinc-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleRoleChange(u._id, u.role)}
                      className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl font-bold text-xs transition-colors"
                    >
                      {u.role === 'admin' ? 'Demote to Customer' : 'Promote to Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
