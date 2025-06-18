
import React from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-slate-800 text-white text-center p-4 text-sm">
        © {new Date().getFullYear()} TinyLinker מאת פראדי פייג. כל הזכויות שמורות.
      </footer>
    </div>
  );
};

export default Layout;