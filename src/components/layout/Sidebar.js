
// import React, { useState } from 'react';
// import { NavLink, Link } from 'react-router-dom';
// import { useAuth } from '../../hooks/useAuth';
// import {
//   LayoutDashboard, Inbox, Boxes, ClipboardList, Warehouse, Ship, LogOut, 
//   ChevronLeft, Menu, Sun, Moon, Building2, Package, Truck // Added Truck icon
// } from 'lucide-react';

// const getInitials = (name = '') => {
//     if (!name) return 'U';
//     const words = name.split(' ').filter(Boolean);
//     if (words.length > 1) return (words[0][0] + words[1][0]).toUpperCase();
//     return name.substring(0, 2).toUpperCase();
// };

// const SidebarItem = ({ to, icon: Icon, children, isCollapsed }) => (
//   <NavLink 
//     to={to} 
//     className={({ isActive }) => 
//       `flex items-center h-12 px-3 my-1 rounded-lg text-text-secondary dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-border ${
//         isActive ? 'bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary font-semibold' : ''
//       } ${isCollapsed ? 'justify-center' : ''}`
//     }
//   >
//     <Icon size={22} className="flex-shrink-0" />
//     <span className={`ml-4 text-sm font-medium whitespace-nowrap ${isCollapsed ? 'hidden' : 'block'}`}>
//       {children}
//     </span>
//   </NavLink>
// );

// const Sidebar = () => {
//   const { user, logout, theme, toggleTheme } = useAuth();
//   const [isCollapsed, setIsCollapsed] = useState(false);

//   const navItems = [
//     { to: "/dashboard", icon: LayoutDashboard, text: "Dashboard", roles: ['admin', 'india-staff'] },
//     { to: "/factories", icon: Building2, text: "Factories", roles: ['admin', 'india-staff'] },
//     { to: "/india-tiles", icon: Boxes, text: "India Tiles", roles: ['admin', 'india-staff'] },
//     { to: "/restock-requests", icon: Inbox, text: "Incoming Requests", roles: ['admin', 'india-staff'] },
//     { to: "/purchase-orders", icon: ClipboardList, text: "Purchase Orders", roles: ['admin', 'india-staff'] },
//     { to: "/factory-stock", icon: Warehouse, text: "Factory Stock", roles: ['admin', 'india-staff'] },
//     { to: "/loading-plans", icon: Ship, text: "Loading Plans", roles: ['admin', 'india-staff'] },
//     { to: "/containers", icon: Package, text: "All Containers", roles: ['admin', 'india-staff'] },
//     // NEW: Dispatch menu item
//     { to: "/dispatches", icon: Truck, text: "Dispatches", roles: ['admin', 'india-staff'] },
//   ];

//   return (
//     <aside className={`bg-foreground dark:bg-dark-foreground flex-col h-screen sticky top-0 hidden lg:flex transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
//       <div className="flex flex-col h-full">
//         {/* Header */}
//         <div className="flex items-center h-20 px-4 border-b border-border dark:border-dark-border">
//           {!isCollapsed && (
//             <Link to="/" className="text-2xl font-bold text-primary dark:text-dark-primary">
//               Mega India
//             </Link>
//           )}
//           <button 
//             onClick={() => setIsCollapsed(!isCollapsed)} 
//             className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-dark-border ml-auto"
//           >
//             {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
//           </button>
//         </div>

//         {/* Navigation */}
//         <nav className="flex-1 overflow-y-auto p-3">
//           {navItems
//             .filter(item => !item.roles || item.roles.includes(user?.role))
//             .map((item, index) => (
//               <SidebarItem key={index} to={item.to} icon={item.icon} isCollapsed={isCollapsed}>
//                 {item.text}
//               </SidebarItem>
//             ))
//           }
//         </nav>

//         {/* Footer */}
//         <div className="border-t border-border dark:border-dark-border p-3">
//           {/* Theme Toggle */}
//           <button
//             onClick={toggleTheme}
//             className="flex items-center w-full h-12 px-3 mb-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border text-text-secondary dark:text-dark-text-secondary"
//           >
//             {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
//             {!isCollapsed && <span className="ml-4 text-sm font-medium">Toggle Theme</span>}
//           </button>

//           {/* User Info */}
//           {!isCollapsed && (
//             <div className="px-3 py-2 mb-2 rounded-lg bg-background dark:bg-dark-background">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
//                   {getInitials(user?.username)}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-semibold text-text dark:text-dark-text truncate">
//                     {user?.username}
//                   </p>
//                   <p className="text-xs text-text-secondary dark:text-dark-text-secondary truncate">
//                     {user?.role}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Logout */}
//           <button
//             onClick={logout}
//             className="flex items-center w-full h-12 px-3 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
//           >
//             <LogOut size={22} />
//             {!isCollapsed && <span className="ml-4 text-sm font-medium">Logout</span>}
//           </button>
//         </div>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;

// FILE: frontend/src/components/layout/Sidebar.js

import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
    LayoutDashboard, Inbox, Boxes, ClipboardList, Warehouse, Ship, LogOut, 
    ChevronLeft, Menu, Sun, Moon, Building2, Package, Truck, Layers,
    Factory, Send, Settings, Users, BarChart3, FileText
} from 'lucide-react';

// Get user initials for avatar
const getInitials = (name = '') => {
    if (!name) return 'U';
    const words = name.split(' ').filter(Boolean);
    if (words.length > 1) return (words[0][0] + words[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
};

// Sidebar navigation item component
const SidebarItem = ({ to, icon: Icon, children, isCollapsed, badge }) => (
    <NavLink 
        to={to} 
        className={({ isActive }) => `
            flex items-center h-12 px-3 my-1 rounded-lg 
            text-text-secondary dark:text-dark-text-secondary 
            hover:bg-gray-100 dark:hover:bg-dark-border 
            transition-colors
            ${isActive ? 'bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary font-semibold' : ''} 
            ${isCollapsed ? 'justify-center' : ''}
        `}
    >
        <Icon size={22} className="flex-shrink-0" />
        <span className={`ml-4 text-sm font-medium whitespace-nowrap ${isCollapsed ? 'hidden' : 'block'}`}>
            {children}
        </span>
        {badge && !isCollapsed && (
            <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                {badge}
            </span>
        )}
    </NavLink>
);

// Section divider component
const SidebarSection = ({ title, isCollapsed }) => (
    <div className={`mt-4 mb-2 ${isCollapsed ? 'px-2' : 'px-3'}`}>
        {!isCollapsed ? (
            <p className="text-xs font-semibold text-text-secondary/60 dark:text-dark-text-secondary/60 uppercase tracking-wider">
                {title}
            </p>
        ) : (
            <div className="h-px bg-border dark:bg-dark-border" />
        )}
    </div>
);

const Sidebar = () => {
    const { user, logout, theme, toggleTheme } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Define navigation items with roles
    const navItems = [
        // Main
        { 
            section: 'Main',
            items: [
                { to: "/dashboard", icon: LayoutDashboard, text: "Dashboard", roles: ['admin', 'Admin', 'india-staff', 'India Staff'] },
            ]
        },
        // Inventory
        {
            section: 'Inventory',
            items: [
                { to: "/tiles", icon: Layers, text: "Tiles", roles: ['admin', 'Admin', 'india-staff', 'India Staff'] },
                { to: "/factories", icon: Building2, text: "Factories", roles: ['admin', 'Admin', 'india-staff', 'India Staff'] },
                { to: "/factory-stock", icon: Warehouse, text: "Factory Stock", roles: ['admin', 'Admin', 'india-staff', 'India Staff'] },
            ]
        },
        // Orders & Production
        {
            section: 'Production',
            items: [
                { to: "/restock-requests", icon: Inbox, text: "Restock Requests", roles: ['admin', 'Admin', 'india-staff', 'India Staff'] },
                { to: "/purchase-orders", icon: ClipboardList, text: "Purchase Orders", roles: ['admin', 'Admin', 'india-staff', 'India Staff'] },
            ]
        },
        // Logistics
        {
            section: 'Logistics',
            items: [
                { to: "/loading-plans", icon: Ship, text: "Loading Plans", roles: ['admin', 'Admin', 'india-staff', 'India Staff'] },
                { to: "/containers", icon: Package, text: "Containers", roles: ['admin', 'Admin', 'india-staff', 'India Staff'] },
                { to: "/dispatches", icon: Truck, text: "Dispatches", roles: ['admin', 'Admin', 'india-staff', 'India Staff'] },
            ]
        },
        // Reports
        {
            section: 'Reports',
            items: [
                { to: "/reports", icon: BarChart3, text: "Reports Center", roles: ['admin', 'Admin', 'india-staff', 'India Staff'] },
            ]
        },
    ];

    // Check if user has access to item
    const hasAccess = (roles) => {
        if (!user?.role) return false;
        return roles.includes(user.role);
    };

    return (
        <aside className={`
            bg-foreground dark:bg-dark-foreground 
            flex-col h-screen sticky top-0 hidden lg:flex 
            transition-all duration-300 
            border-r border-border dark:border-dark-border
            ${isCollapsed ? 'w-20' : 'w-64'}
        `}>
            <div className="flex flex-col h-full">
                {/* Header / Logo */}
                <div className="flex items-center h-16 px-4 border-b border-border dark:border-dark-border">
                    {!isCollapsed && (
                        <Link to="/dashboard" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary to-indigo-600 rounded-lg flex items-center justify-center">
                                <Factory size={18} className="text-white" />
                            </div>
                            <span className="text-xl font-bold text-text dark:text-dark-text">
                                Mega India
                            </span>
                        </Link>
                    )}
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)} 
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border ml-auto transition-colors"
                        title={isCollapsed ? 'Expand' : 'Collapse'}
                    >
                        {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-2 py-4 overflow-y-auto">
                    {navItems.map((section) => {
                        // Filter items by role
                        const accessibleItems = section.items.filter(item => hasAccess(item.roles));
                        if (accessibleItems.length === 0) return null;
                        
                        return (
                            <div key={section.section}>
                                <SidebarSection title={section.section} isCollapsed={isCollapsed} />
                                {accessibleItems.map((item) => (
                                    <SidebarItem 
                                        key={item.to} 
                                        to={item.to} 
                                        icon={item.icon} 
                                        isCollapsed={isCollapsed}
                                        badge={item.badge}
                                    >
                                        {item.text}
                                    </SidebarItem>
                                ))}
                            </div>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="px-2 py-3 border-t border-border dark:border-dark-border">
                    {/* Theme Toggle */}
                    <button 
                        onClick={toggleTheme} 
                        className={`
                            w-full flex items-center h-12 px-3 my-1 rounded-lg 
                            text-text-secondary dark:text-dark-text-secondary 
                            hover:bg-gray-100 dark:hover:bg-dark-border 
                            transition-colors
                            ${isCollapsed ? 'justify-center' : ''}
                        `}
                        title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                    >
                        {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
                        {!isCollapsed && (
                            <span className="ml-4 text-sm font-medium">
                                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                            </span>
                        )}
                    </button>
                    
                    {/* User Profile */}
                    {user && (
                        <div className="relative group">
                            <div className={`
                                flex items-center mt-2 p-2 rounded-lg cursor-pointer
                                hover:bg-gray-100 dark:hover:bg-dark-border
                                transition-colors
                                ${isCollapsed ? 'justify-center' : ''}
                            `}>
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex-shrink-0 flex items-center justify-center font-bold text-white text-sm">
                                    {getInitials(user.username)}
                                </div>
                                {!isCollapsed && (
                                    <div className="ml-3 flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-text dark:text-dark-text truncate">
                                            {user.username}
                                        </p>
                                        <p className="text-xs text-text-secondary dark:text-dark-text-secondary capitalize">
                                            {user.role?.replace('-', ' ')}
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Logout Dropdown */}
                            <div className={`
                                absolute bottom-full mb-2 left-0 z-50 
                                ${isCollapsed ? 'w-48 left-full ml-2' : 'w-full'}
                                bg-foreground dark:bg-dark-foreground 
                                border border-border dark:border-dark-border
                                rounded-lg shadow-xl p-2 
                                transition-all opacity-0 invisible 
                                group-hover:opacity-100 group-hover:visible
                            `}>
                                <div className="px-3 py-2 border-b border-border dark:border-dark-border mb-2">
                                    <p className="text-sm font-semibold text-text dark:text-dark-text truncate">
                                        {user.username}
                                    </p>
                                    <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
                                        {user.email}
                                    </p>
                                </div>
                                <button 
                                    onClick={logout} 
                                    className="w-full flex items-center p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                                >
                                    <LogOut size={18} className="mr-2" /> 
                                    Logout
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