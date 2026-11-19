import React from 'react';
import { Link } from 'react-router-dom';
import { Droplets, Mail, Phone, MapPin, ArrowUpRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#102B46] text-slate-300 border-t border-white/10 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Important Positioning Notice Banner */}
        <div className="mb-12 p-4 rounded-xl bg-white/5 border border-white/10 flex items-start space-x-3 text-xs text-slate-300">
          <AlertCircle className="w-5 h-5 text-[#48CAE4] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white uppercase tracking-wider block mb-0.5">
              Notice of Proposed Positioning
            </span>
            <p className="text-slate-400">
              The services and capabilities showcased on this website represent proposed positioning for VENUS Water Management and are intended for conceptual and technical demonstration purposes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#168AAD] to-[#48CAE4] flex items-center justify-center">
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
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Smarter Water Management. A Sustainable Tomorrow. Dedicated to advancing water treatment, recycling, industrial solutions, and modern conservation infrastructure.
            </p>
            <div className="pt-2 flex items-center space-x-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-[#48CAE4]" />
              <span>Enterprise Grade Security & Data Privacy</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="hover:text-white transition-colors">
                  Proposed Solutions
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact & Enquiry
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-[#48CAE4] transition-colors flex items-center space-x-1">
                  <span>Admin Portal</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Proposed Solutions */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Proposed Services
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/solutions" className="hover:text-white transition-colors">
                  Water Treatment
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="hover:text-white transition-colors">
                  Wastewater Management
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="hover:text-white transition-colors">
                  Industrial Water Systems
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="hover:text-white transition-colors">
                  Recycling & Reuse
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="hover:text-white transition-colors">
                  Sustainable Infrastructure
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details / Placeholders */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Contact Desk
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start space-x-2.5">
                <Mail className="w-4 h-4 text-[#48CAE4] shrink-0 mt-0.5" />
                <span>contact@venuswater.com</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <Phone className="w-4 h-4 text-[#48CAE4] shrink-0 mt-0.5" />
                <span>+1 (800) 555-VENUS</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-[#48CAE4] shrink-0 mt-0.5" />
                <span>Global Solutions Hub (Proposed Headquarters)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 space-y-4 md:space-y-0">
          <p>&copy; {new Date().getFullYear()} VENUS Water Management. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <Link to="/about" className="hover:text-slate-400">Privacy Commitment</Link>
            <Link to="/solutions" className="hover:text-slate-400">Service Terms</Link>
            <Link to="/contact" className="hover:text-slate-400">Support Desk</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
