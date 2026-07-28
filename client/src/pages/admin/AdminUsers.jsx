import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldCheck, Mail, Phone, Calendar, Ban, CheckCircle, Trash2, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import { useConfirm } from '../../context/ConfirmContext';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { confirm } = useConfirm();

  // Debounced Search Hook (300ms)
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (user) => {
    if (user.role === 'admin') {
      showErrorToast('Cannot block an admin account!');
      return;
    }

    const action = user.isBlocked ? 'unblock' : 'block';
    
    const isConfirmed = await confirm({
      title: `${action === 'block' ? 'Block' : 'Unblock'} User`,
      message: `Are you sure you want to ${action} user "${user.name}"?`,
      confirmText: action === 'block' ? 'Block User' : 'Unblock User',
      isDanger: action === 'block'
    });
    if (!isConfirmed) return;

    try {
      const res = await api.toggleBlockUser(user._id);
      setUsers(users.map((u) => (u._id === user._id ? { ...u, isBlocked: res.isBlocked } : u)));
      showSuccessToast(res.message || `User ${action}ed successfully`);
    } catch (err) {
      showErrorToast(err.message || `Failed to ${action} user`);
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.role === 'admin') {
      showErrorToast('Cannot delete an admin account!');
      return;
    }

    const isConfirmed = await confirm({
      title: 'Delete User Permanently',
      message: `Are you sure you want to PERMANENTLY DELETE user "${user.name}"? This action cannot be undone.`,
      confirmText: 'Delete Permanently',
      isDanger: true
    });
    if (!isConfirmed) return;

    try {
      await api.deleteUser(user._id);
      setUsers(users.filter((u) => u._id !== user._id));
      showSuccessToast(`User "${user.name}" deleted successfully`);
    } catch (err) {
      showErrorToast(err.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      (u.name || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (u.phone || u.address?.phone || '').includes(debouncedSearch)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Manage Registered Users</h1>
          <p className="text-xs text-slate-500 mt-1">
            View customer accounts, manage permissions, block abusive users, or delete inactive profiles.
          </p>
        </div>
        <div className="bg-brand-50 text-brand-700 font-extrabold px-4 py-2 rounded-2xl border border-brand-100 text-xs flex items-center gap-1.5 shrink-0">
          <Users className="w-4 h-4 text-brand-600" /> Total Users: {users.length}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Debounced search by name, email address, or mobile number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs font-semibold bg-transparent focus:outline-none text-slate-800"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">Loading registered users...</div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Customer Name</th>
                    <th className="py-3.5 px-4">Email Address</th>
                    <th className="py-3.5 px-4">Mobile Number</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-extrabold flex items-center justify-center shrink-0 border border-slate-200">
                              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-900">{user.name}</p>
                              <p className="text-[10px] text-slate-400">
                                Joined{' '}
                                {new Date(user.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-slate-800">{user.email || 'No Email'}</td>

                        <td className="py-3.5 px-4 font-bold text-slate-700">
                          {user.phone || user.address?.phone ? (
                            <span>+91 {user.phone || user.address?.phone}</span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Not Provided</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-extrabold ${
                              user.role === 'admin'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-teal-50 text-teal-700 border border-teal-100'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          {user.isBlocked ? (
                            <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 font-extrabold px-2.5 py-0.5 rounded-full text-[10px] border border-rose-200">
                              <ShieldAlert className="w-3 h-3" /> Blocked
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-extrabold px-2.5 py-0.5 rounded-full text-[10px] border border-emerald-200">
                              <CheckCircle className="w-3 h-3" /> Active
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {user.role !== 'admin' ? (
                            <div className="flex items-center justify-end gap-2">
                              {/* Block / Unblock Button */}
                              <button
                                onClick={() => handleToggleBlock(user)}
                                className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] flex items-center gap-1.5 shadow-sm transition-all active:scale-95 ${
                                  user.isBlocked
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                                }`}
                                title={user.isBlocked ? 'Unblock User Account' : 'Block User Account'}
                              >
                                <Ban className="w-3.5 h-3.5" />
                                {user.isBlocked ? 'Unblock' : 'Block'}
                              </button>

                              {/* Delete User Button */}
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                title="Delete User Account"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                              Protected Admin
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No matching user accounts found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div key={user._id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col gap-4 relative">
                    <div className="flex items-start justify-between border-b border-slate-200/60 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 font-extrabold flex items-center justify-center shrink-0 border border-slate-300 shadow-sm text-sm">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 text-sm leading-snug">{user.name}</p>
                          <p className="text-[10px] text-slate-500">
                            Joined {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold whitespace-nowrap ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-teal-100 text-teal-800'
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-700 truncate">{user.email || 'No Email'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold text-slate-700">
                          {user.phone || user.address?.phone ? `+91 ${user.phone || user.address?.phone}` : 'Not Provided'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
                      <div>
                        {user.isBlocked ? (
                          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 font-extrabold px-2 py-0.5 rounded-full text-[10px]">
                            <ShieldAlert className="w-3 h-3 text-rose-600" /> Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full text-[10px]">
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> Active
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {user.role !== 'admin' ? (
                          <>
                            <button
                              onClick={() => handleToggleBlock(user)}
                              className={`px-4 py-2 rounded-xl font-bold text-[11px] flex items-center gap-1.5 shadow-sm transition-all min-h-[36px] ${
                                user.isBlocked
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-amber-500 text-white'
                              }`}
                            >
                              <Ban className="w-3.5 h-3.5" />
                              {user.isBlocked ? 'Unblock' : 'Block'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="p-2 text-slate-500 hover:text-rose-600 bg-white border border-slate-200 rounded-xl min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors shadow-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] font-bold text-purple-600">Admin Account</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">No matching user accounts found.</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
