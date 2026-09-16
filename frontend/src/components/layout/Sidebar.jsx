import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Home,
  FileText,
  AlertTriangle,
  BookOpen,
  Megaphone,
  Calendar,
  Heart,
  HandHeart,
  BarChart3,
  ShieldAlert,
  Settings,
  UserPlus
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['Super Admin', 'Barangay Captain', 'Barangay Staff', 'Resident'] },
    { name: 'Residents', href: '/residents', icon: Users, roles: ['Super Admin', 'Barangay Captain', 'Barangay Staff'] },
    { name: 'Households', href: '/households', icon: Home, roles: ['Super Admin', 'Barangay Captain', 'Barangay Staff'] },
    { name: 'Certificate Requests', href: '/certificates', icon: FileText, roles: ['Super Admin', 'Barangay Captain', 'Barangay Staff', 'Resident'] },
    { name: 'Complaints', href: '/complaints', icon: AlertTriangle, roles: ['Super Admin', 'Barangay Captain', 'Barangay Staff', 'Resident'] },
    { name: 'Blotter Records', href: '/blotter', icon: BookOpen, roles: ['Super Admin', 'Barangay Captain', 'Barangay Staff'] },
    { name: 'Announcements', href: '/announcements', icon: Megaphone, roles: ['Super Admin', 'Barangay Captain', 'Barangay Staff', 'Resident'] },
    { name: 'Events Calendar', href: '/events', icon: Calendar, roles: ['Super Admin', 'Barangay Captain', 'Barangay Staff', 'Resident'] },
    { name: 'Health Monitoring', href: '/health', icon: Heart, roles: ['Super Admin', 'Barangay Captain', 'Barangay Staff'] },
    { name: 'Emergency Assistance', href: '/assistance', icon: HandHeart, roles: ['Super Admin', 'Barangay Captain', 'Barangay Staff', 'Resident'] },
    { name: 'Reports & Analytics', href: '/reports', icon: BarChart3, roles: ['Super Admin', 'Barangay Captain'] },
    { name: 'User Management', href: '/users', icon: UserPlus, roles: ['Super Admin'] },
    { name: 'Audit Trail', href: '/audit', icon: ShieldAlert, roles: ['Super Admin'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['Super Admin', 'Barangay Captain', 'Barangay Staff', 'Resident'] },
  ];

  const filteredNav = navigation.filter(item => user && item.roles.includes(user.role));

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex h-full flex-col justify-between">
        <div className="px-4 py-6">
          <div className="flex items-center gap-3 px-3 py-2 mb-6">
            <img
              src="/lapaz-logo.png"
              alt="La Paz Logo"
              className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-brand-400/40 shadow-md"
            />
            <div>
              <h1 className="font-bold text-base text-white leading-none">Brgy. La Paz</h1>
              <span className="text-xs text-brand-400 font-medium">Province of Abra</span>
            </div>
          </div>

          <nav className="space-y-1">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Info Badge */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-semibold text-sm border border-brand-500/30">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
              <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md inline-block mt-0.5 border border-emerald-800/40">
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
