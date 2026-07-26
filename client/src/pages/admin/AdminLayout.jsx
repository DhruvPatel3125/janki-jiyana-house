import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Store,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Bell,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Categories', path: '/admin/categories', icon: FolderTree },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Users', path: '/admin/users', icon: Users },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center font-bold text-sm">
            JJ
          </div>
          <span className="font-extrabold text-base tracking-tight">Admin Portal</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg bg-slate-800">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-300 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Header */}
          <div className="p-6 border-b border-slate-800 hidden md:flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-teal-400 flex items-center justify-center text-white font-black text-lg shadow-md">
                JJ
              </div>
              <div>
                <span className="font-extrabold text-white text-base block leading-tight">Admin Portal</span>
                <span className="text-[10px] text-teal-400 font-semibold uppercase tracking-wider block">
                  Janki Jiyana House
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 py-2 block">
              Navigation Menu
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Admin Action */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            <Store className="w-4 h-4 text-brand-400" />
            <span>Visit Live Store</span>
          </Link>

          <div className="flex items-center justify-between pt-2 px-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-xs">
                A
              </div>
              <div className="text-left leading-tight">
                <span className="text-xs font-bold text-white block">{user?.name}</span>
                <span className="text-[10px] text-slate-400 block">Administrator</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 hidden md:flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Verified Admin Session Active</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              target="_blank"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Store className="w-4 h-4" /> Open Shop Front
            </Link>

            <div className="h-4 w-px bg-slate-200"></div>

            <span className="text-xs font-bold text-slate-700">
              Welcome, {user?.name}
            </span>
          </div>
        </header>

        {/* Dynamic Admin Route Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
