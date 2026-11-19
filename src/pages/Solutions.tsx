import React, { useState } from 'react';
import { SolutionCard } from '../components/SolutionCard';
import { SOLUTIONS_DATA } from '../data/solutionsData';
import {
  Sparkles,
  AlertCircle,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Solutions: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Proposed Services' },
    { id: 'treatment', label: 'Treatment & Wastewater' },
    { id: 'industrial', label: 'Industrial & Recycling' },
    { id: 'infrastructure', label: 'Conservation & Infrastructure' },
  ];

  const filteredSolutions = SOLUTIONS_DATA.filter((sol) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'treatment') {
      return sol.id === 'water-treatment' || sol.id === 'wastewater-management';
    }
    if (selectedCategory === 'industrial') {
      return sol.id === 'industrial-water-management' || sol.id === 'water-recycling-reuse';
    }
    if (selectedCategory === 'infrastructure') {
      return sol.id === 'water-conservation' || sol.id === 'sustainable-infrastructure';
    }
    return true;
  });

  return (
    <div className="pt-24 pb-20">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#102B46] to-[#164E78] text-white py-16 sm:py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#48CAE4] text-xs font-bold tracking-wide uppercase border border-white/15">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Proposed Service Categories</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-['Plus_Jakarta_Sans'] tracking-tight">
            Proposed Water Solutions Portfolio
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Engineered modular systems and management frameworks designed to advance purity, regulatory compliance, and circular water reuse.
          </p>
        </div>
      </section>

      {/* Mandatory Positioning Transparency Notice */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start space-x-3 text-xs sm:text-sm text-amber-900 shadow-sm">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Required Positioning Clarification:</span>
            <p className="text-amber-800 text-xs mt-0.5">
              These solutions represent proposed service categories and technical architectures for VENUS Water Management. They illustrate proposed website positioning and must not be interpreted as independently verified company capabilities until formal verification is complete.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#102B46] text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Solutions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSolutions.map((solution, idx) => (
              <SolutionCard key={solution.id} solution={solution} featured={idx === 0} />
            ))}
          </div>

          {/* Custom Solutions Consultation Banner */}
          <div className="mt-16 bg-[#F4F8FA] border border-slate-200 rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#168AAD] uppercase tracking-wider">
                <HelpCircle className="w-4 h-4" />
                <span>Custom Engineering Requirements?</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#102B46] font-['Plus_Jakarta_Sans']">
                Need a Custom Water Treatment or Wastewater Scheme?
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Our team can evaluate your water testing profiles, flow rates, and discharge restrictions to recommend customized treatment stages.
              </p>
            </div>
            <Link
              to="/contact"
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-[#102B46] text-white hover:bg-[#164E78] transition-all shadow-md shrink-0 flex items-center space-x-2"
            >
              <span>Submit Custom Enquiry</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
