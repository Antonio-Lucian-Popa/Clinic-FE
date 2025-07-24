import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      <div className="lg:ml-64">
        <Header setIsMobileMenuOpen={setIsMobileMenuOpen} isMobileMenuOpen={isMobileMenuOpen} />
        <main className="pt-16 lg:pt-20 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
