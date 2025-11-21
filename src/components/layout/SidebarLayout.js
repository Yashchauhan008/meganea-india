import React from 'react';
import Sidebar from './Sidebar';

const SidebarLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-background dark:bg-dark-background">
      <Sidebar />
      <main className="flex-1">
        <div className="p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default SidebarLayout;
