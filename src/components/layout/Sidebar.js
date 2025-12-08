import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard, Inbox, Boxes, ClipboardList, Warehouse, Ship, LogOut, ChevronLeft, Menu, Sun, Moon, Building2, Package // --- 1. IMPORT NEW ICON ---
} from 'lucide-react';

const getInitials = (name = '') => {
    if (!name) return 'U';
    const words = name.split(' ').filter(Boolean);
    if (words.length > 1) return (words[0][0] + words[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
};

const SidebarItem = ({ to, icon: Icon, children, isCollapsed }) => (
  <NavLink to={to} className={({ isActive }) => `flex items-center h-12 px-3 my-1 rounded-lg text-text-secondary dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-border ${isActive ? 'bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary font-semibold' : ''} ${isCollapsed ? 'justify-center' : ''}`}>
    <Icon size={22} className="flex-shrink-0" />
    <span className={`ml-4 text-sm font-medium whitespace-nowrap ${isCollapsed ? 'hidden' : 'block'}`}>{children}</span>
  </NavLink>
);

const Sidebar = () => {
  // Destructure theme and toggleTheme from our useAuth hook
  const { user, logout, theme, toggleTheme } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, text: "Dashboard", roles: ['admin', 'india-staff'] },
    { to: "/factories", icon: Building2, text: "Factories", roles: ['admin', 'india-staff'] }, // <-- ADD THIS LINE
    { to: "/india-tiles", icon: Boxes, text: "India Tiles", roles: ['admin', 'india-staff'] }, // <-- ADD THIS LINE
    { to: "/restock-requests", icon: Inbox, text: "Incoming Requests", roles: ['admin', 'india-staff'] },
    { to: "/purchase-orders", icon: ClipboardList, text: "Purchase Orders", roles: ['admin', 'india-staff'] },
    { to: "/factory-stock", icon: Warehouse, text: "Factory Stock", roles: ['admin', 'india-staff'] },
    { to: "/loading-plans", icon: Ship, text: "Loading Plans", roles: ['admin', 'india-staff'] },
    { to: "/containers", icon: Package, text: "All Containers", roles: ['admin', 'india-staff'] }, 
];

  return (
    <aside className={`bg-foreground dark:bg-dark-foreground flex-col h-screen sticky top-0 hidden lg:flex transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center h-20 px-4 border-b border-border dark:border-dark-border">
          {!isCollapsed && <Link to="/" className="text-2xl font-bold text-primary dark:text-dark-primary">Mega India</Link>}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-dark-border ml-auto">
            {isCollapsed ? <Menu size={24} /> : <ChevronLeft size={24} />}
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          {navItems.map((item) => (user?.role && item.roles.includes(user.role)) && (
            <SidebarItem key={item.to} to={item.to} icon={item.icon} isCollapsed={isCollapsed}>{item.text}</SidebarItem>
          ))}
        </nav>

        <div className="px-2 py-3 border-t border-border dark:border-dark-border">
          {/* THIS IS THE THEME TOGGLE BUTTON */}
          <button onClick={toggleTheme} className={`w-full flex items-center h-12 px-3 my-1 rounded-lg text-text-secondary dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-border ${isCollapsed ? 'justify-center' : ''}`}>
            {theme === 'light' ? <Sun size={22} /> : <Moon size={22} />}
            {!isCollapsed && <span className="ml-4 text-sm font-medium">Toggle Theme</span>}
          </button>
          
          {user && (
            <div className="relative group">
              <div className="flex items-center mt-2 p-2 rounded-lg cursor-pointer">
                <div className="h-10 w-10 rounded-full bg-primary flex-shrink-0 flex items-center justify-center font-bold text-white">{getInitials(user.username)}</div>
                {!isCollapsed && (
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text dark:text-dark-text truncate">{user.username}</p>
                    <p className="text-xs text-text-secondary dark:text-dark-text-secondary capitalize">{user.role}</p>
                  </div>
                )}
              </div>
              <div className={`absolute bottom-full mb-2 left-0 w-full z-50 w-60 bg-foreground dark:bg-dark-border rounded-lg shadow-xl p-3 transition-all opacity-0 invisible group-hover:opacity-100 group-hover:visible`}>
                <button onClick={logout} className="w-full flex items-center p-2 rounded-md text-red-500 hover:bg-red-500/10">
                  <LogOut size={18} className="mr-2" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
