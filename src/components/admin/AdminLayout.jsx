import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Scale,
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  CreditCard,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  FileSignature,
  Gavel,
  Search,
  Lock
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { path: '/admin/cases', icon: Briefcase, label: 'Cases' },
    { path: '/admin/clients', icon: Users, label: 'Clients' },
    { path: '/admin/documents', icon: FileText, label: 'Documents' },
    { path: '/admin/asset-discovery', icon: Search, label: 'Asset Discovery' },
    { path: '/admin/vaults', icon: Lock, label: 'Digital Vaults' },
    { path: '/admin/signatures', icon: FileSignature, label: 'Signatures' },
    { path: '/admin/payments', icon: CreditCard, label: 'Payments' },
    { path: '/admin/hearings', icon: Gavel, label: 'Hearings' },
    { path: '/admin/messages', icon: MessageSquare, label: 'Messages' },
  ];

  const NavItem = ({ item }) => (
    <NavLink
      to={item.path}
      end={item.end}
      onClick={() => setMobileMenuOpen(false)}
      className={({ isActive }) =>
        `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
          isActive
            ? 'bg-blue-800 text-white'
            : 'text-blue-100 hover:bg-blue-800/50'
        }`
      }
    >
      <item.icon className="h-5 w-5 mr-3" />
      {(sidebarOpen || mobileMenuOpen) && <span>{item.label}</span>}
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-blue-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Scale className="h-6 w-6 mr-2" />
          <span className="font-bold">Admin Panel</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-blue-800"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="w-64 h-full bg-blue-900 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-8 pb-4 border-b border-blue-800">
              <Scale className="h-8 w-8 text-white mr-2" />
              <span className="text-white font-bold text-lg">Admin Panel</span>
            </div>
            <nav className="space-y-2">
              {navItems.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </nav>
            <div className="absolute bottom-4 left-4 right-4">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-blue-100 hover:bg-blue-800/50 rounded-lg"
              >
                <LogOut className="h-5 w-5 mr-3" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 h-full bg-blue-900 transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-blue-800">
          <div className="flex items-center">
            <Scale className="h-8 w-8 text-white" />
            {sidebarOpen && (
              <span className="ml-2 text-white font-bold text-lg">Admin Panel</span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 text-blue-200 hover:text-white rounded"
          >
            <ChevronLeft className={`h-5 w-5 transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-800 text-white'
                    : 'text-blue-100 hover:bg-blue-800/50'
                } ${!sidebarOpen ? 'justify-center' : ''}`
              }
              title={!sidebarOpen ? item.label : undefined}
            >
              <item.icon className={`h-5 w-5 ${sidebarOpen ? 'mr-3' : ''}`} />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-blue-800">
          {sidebarOpen && (
            <div className="mb-3 px-2">
              <p className="text-white text-sm font-medium truncate">{user?.email}</p>
              <p className="text-blue-300 text-xs">Administrator</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`flex items-center w-full px-4 py-3 text-blue-100 hover:bg-blue-800/50 rounded-lg ${
              !sidebarOpen ? 'justify-center' : ''
            }`}
            title={!sidebarOpen ? 'Logout' : undefined}
          >
            <LogOut className={`h-5 w-5 ${sidebarOpen ? 'mr-3' : ''}`} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
