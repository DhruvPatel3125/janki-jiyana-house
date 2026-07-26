import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';
import { api } from '../../services/api';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

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

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.address?.phone || '').includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Manage Registered Users</h1>
        <p className="text-xs text-slate-500 mt-1">View registered customer accounts, contact info, and roles.</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter users by name, email, or phone number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs bg-transparent focus:outline-none text-slate-800"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">Loading registered users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Email Address</th>
                  <th className="py-3.5 px-4">Phone / Address</th>
                  <th className="py-3.5 px-4">Account Role</th>
                  <th className="py-3.5 px-4 text-right">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">{user.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">{user.email}</td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {user.address?.phone || user.address?.city
                          ? `${user.address.phone || ''} ${user.address.city ? `(${user.address.city})` : ''}`
                          : 'Not provided'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold ${
                            user.role === 'admin'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-teal-50 text-teal-700'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-400">
                        {new Date(user.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No matching user accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
