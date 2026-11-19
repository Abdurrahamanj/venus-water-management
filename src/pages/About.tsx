import React from 'react';
import { Link } from 'react-router-dom';
import {
  Droplets,
  Target,
  Compass,
  ShieldCheck,
  Leaf,
  Recycle,
  Eye,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="pt-24 pb-20">
      {/* Page Header */}
      <section className="bg-gradient-to-b from-[#102B46] to-[#164E78] text-white py-16 sm:py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#48CAE4] text-xs font-bold tracking-wide uppercase border border-white/15">
            <Droplets className="w-3.5 h-3.5" />
            <span>About VENUS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-['Plus_Jakarta_Sans'] tracking-tight">
            Advancing Responsible Water Infrastructure
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Positioned to deliver modern, technologically grounded water management strategies that protect aquatic resources and support sustainable industrial growth.
          </p>
        </div>
      </section>

      {/* Mandatory Positioning Transparency Notice */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start space-x-3 text-xs sm:text-sm text-amber-900 shadow-sm">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Transparent Corporate Positioning Notice:</span>
            <p className="text-amber-800 text-xs mt-0.5">
              The services, methodologies, and technical frameworks outlined herein represent proposed organizational positioning for VENUS Water Management. They are designed to illustrate strategic solutions and architectural capabilities rather than unverified past metrics or historical corporate achievements.
            </p>
          </div>
        </div>
      </div>

      {/* Company Introduction Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs font-bold text-[#168AAD] uppercase tracking-wider block">
                Company Introduction
              </span>
              <h2 className="text-3xl font-extrabold text-[#102B46] font-['Plus_Jakarta_Sans'] leading-tight">
                Addressing Modern Water Challenges with Purpose-Built Engineering
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                VENUS is founded on the conviction that water stewardship is not merely an operational cost center, but the critical baseline for planetary resilience and long-term economic stability.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                As global hydrological systems face mounting pressures from urbanization, climatic extremes, and expanding industrial footprints, VENUS proposes an integrated framework encompassing raw water clarification, advanced industrial recycling, and closed-loop wastewater mitigation.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                We advocate for scientific rigor, data-informed flow governance, and uncompromising safety standards to transition businesses from linear water consumption into circular water conservation.
              </p>
            </div>

            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?q=80&w=1000&auto=format&fit=crop"
                  alt="Industrial water piping and pressure gauges"
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#102B46]/75 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="text-xs font-bold text-[#48CAE4] uppercase tracking-wider block mb-1">
                    Engineering Integrity
                  </span>
                  <p className="text-sm font-semibold">
                    Rigorous hydraulic and chemical analysis designed for real-world environmental protection.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="py-16 bg-[#F4F8FA] border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Vision Card */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#168AAD]/10 text-[#168AAD] flex items-center justify-center">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-[#102B46] font-['Plus_Jakarta_Sans']">
                Our Vision
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                To establish a global paradigm where fresh water is treasured as a circular, perpetual resource—fostering zero-waste industrial operations, pristine aquatic ecosystems, and universal access to verified clean water infrastructure.
              </p>
            </div>

            {/* Mission Card */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#102B46] text-[#48CAE4] flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-[#102B46] font-['Plus_Jakarta_Sans']">
                Our Mission
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                To empower industries, utilities, and communities with reliable water treatment methodologies, advanced recovery technologies, and actionable telemetry that optimize water consumption, eliminate non-compliant discharge, and preserve aquatic biomes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-[#168AAD] uppercase tracking-wider block">
              Guiding Principles
            </span>
            <h2 className="text-3xl font-extrabold text-[#102B46] font-['Plus_Jakarta_Sans']">
              Our Core Values
            </h2>
            <p className="text-slate-600 text-sm">
              The fundamental standards that shape our technological proposals, client engagements, and environmental governance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#F4F8FA] border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#164E78] flex items-center justify-center font-bold">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-[#102B46]">Scientific Precision</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Grounded in empirical water chemistry, hydraulic simulations, and rigorous continuous monitoring.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F4F8FA] border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Leaf className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-[#102B46]">Ecological Stewardship</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Uncompromising dedication to protecting downstream aquifers, wetlands, and aquatic biodiversity.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F4F8FA] border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
                <Recycle className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-[#102B46]">Circular Innovation</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Replacing linear intake-to-waste paths with intelligent reclamation, recycling, and resource recovery.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F4F8FA] border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-[#102B46] flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-[#102B46]">Transparent Governance</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Honest reporting, verified telemetry data, and clear communication regarding operational boundaries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Commitment to Water Sustainability Section */}
      <section className="py-20 bg-[#F4F8FA] border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1527525443983-6e60c75fff46?q=80&w=1000&auto=format&fit=crop"
                  alt="Cascading natural water representing pristine environmental conservation"
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <p className="text-xs text-[#48CAE4] uppercase font-bold tracking-wider mb-1">
                    Conservation Commitment
                  </p>
                  <h4 className="text-base font-bold">
                    Preserving Natural Water Resources for Generations
                  </h4>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                Environmental Stewardship
              </span>
              <h2 className="text-3xl font-extrabold text-[#102B46] font-['Plus_Jakarta_Sans'] leading-tight">
                Our Commitment to Sustainable Water Futures
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                At VENUS, water sustainability is not treated as an afterthought or marketing slogan. We integrate environmental impact assessments into every phase of our proposed designs.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                By targeting energy-efficient pumps, bio-filtration media, and low-waste membrane configurations, our proposed solutions aim to minimize both carbon and water footprints simultaneously.
              </p>

              <div className="pt-2">
                <Link
                  to="/contact"
                  className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-[#102B46] text-white hover:bg-[#164E78] transition-all shadow-md"
                >
                  <span>Connect With Our Sustainability Advisors</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
