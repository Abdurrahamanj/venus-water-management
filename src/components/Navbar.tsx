import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Droplets, Menu, X, Shield, ArrowRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on page change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Solutions', path: '/solutions' },
    { name: 'Contact Us', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#102B46]/95 backdrop-blur-md shadow-lg py-3'
          : 'bg-[#102B46] py-5 border-b border-white/10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#168AAD] to-[#48CAE4] flex items-center justify-center shadow-md shadow-[#48CAE4]/20 group-hover:scale-105 transition-transform duration-200">
              <Droplets className="w-6 h-6 text-[#102B46]" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold tracking-wider text-white font-['Plus_Jakarta_Sans']">
                VENUS
              </span>
              <span className="text-[10px] tracking-widest uppercase text-[#48CAE4] font-medium -mt-1">
                Water Management
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  isActive(link.path)
                    ? 'text-white bg-[#164E78]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              to="/admin/login"
              className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white border border-white/15 rounded-lg hover:bg-white/5 transition-all"
              title="Admin Portal Access"
            >
              <Shield className="w-3.5 h-3.5 text-[#48CAE4]" />
              <span>Admin Portal</span>
            </Link>
            <Link
              to="/contact"
              className="flex items-center space-x-1.5 px-4 py-2 text-sm font-semibold text-[#102B46] bg-gradient-to-r from-[#48CAE4] to-[#90E0EF] hover:from-[#38b6d0] hover:to-[#7ad7e8] rounded-lg shadow-sm hover:shadow transition-all"
            >
              <span>Get in Touch</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <Link
              to="/admin/login"
              className="p-2 text-slate-300 hover:text-white"
              title="Admin Login"
            >
              <Shield className="w-5 h-5 text-[#48CAE4]" />
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-[#102B46] border-b border-white/10 px-4 pt-2 pb-6 space-y-3">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2.5 rounded-lg text-base font-medium ${
                  isActive(link.path)
                    ? 'text-white bg-[#164E78]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col space-y-2">
            <Link
              to="/contact"
              className="w-full text-center py-2.5 px-4 rounded-lg bg-[#48CAE4] text-[#102B46] font-semibold text-sm shadow hover:bg-[#38b6d0]"
            >
              Contact Us & Request Solution
            </Link>
            <Link
              to="/admin/login"
              className="flex items-center justify-center space-x-2 py-2 px-4 rounded-lg border border-white/20 text-slate-300 text-sm hover:text-white"
            >
              <Shield className="w-4 h-4 text-[#48CAE4]" />
              <span>Admin Dashboard Portal</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
