import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Droplets, ShieldCheck, Activity, Sparkles } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-b from-[#102B46] via-[#123658] to-[#164E78] text-white overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#48CAE4_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-[#48CAE4]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -left-20 w-96 h-96 bg-[#168AAD]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Pill Tag */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-[#48CAE4] font-medium backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Generation Water Infrastructure</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#48CAE4]" />
              <span className="text-white/80">Proposed Positioning</span>
            </div>

            {/* Exact Required Hero Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white font-['Plus_Jakarta_Sans'] leading-[1.12]">
              Smarter Water Management.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#48CAE4] via-[#90E0EF] to-[#168AAD]">
                A Sustainable Tomorrow.
              </span>
            </h1>

            {/* Exact Required Supporting Text */}
            <p className="text-base sm:text-lg md:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Explore responsible water management approaches designed to support efficient water usage, treatment, and sustainable infrastructure.
            </p>

            {/* Hero CTA Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to="/solutions"
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#48CAE4] to-[#168AAD] hover:from-[#38b6d0] hover:to-[#12728f] text-[#102B46] shadow-lg shadow-[#48CAE4]/20 hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 active:scale-95"
              >
                <span>Explore Our Solutions</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-sm text-white border border-white/25 hover:bg-white/10 hover:border-white/40 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Contact Us</span>
              </Link>
            </div>

            {/* Key Value Metric Indicators */}
            <div className="pt-8 border-t border-white/10 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-left">
              <div>
                <div className="flex items-center space-x-1.5 text-xs text-[#48CAE4] font-semibold uppercase tracking-wider mb-1">
                  <Droplets className="w-3.5 h-3.5" />
                  <span>Conservation</span>
                </div>
                <p className="text-xs text-slate-300 leading-tight">
                  High-efficiency closed-loop reuse concepts
                </p>
              </div>

              <div>
                <div className="flex items-center space-x-1.5 text-xs text-[#48CAE4] font-semibold uppercase tracking-wider mb-1">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Telemetry</span>
                </div>
                <p className="text-xs text-slate-300 leading-tight">
                  Continuous water quality & flow diagnostics
                </p>
              </div>

              <div>
                <div className="flex items-center space-x-1.5 text-xs text-[#48CAE4] font-semibold uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Resilience</span>
                </div>
                <p className="text-xs text-slate-300 leading-tight">
                  Compliance-aligned treatment engineering
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Imagery & Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Image Frame */}
              <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl shadow-black/40 group">
                <img
                  src="https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?q=80&w=1000&auto=format&fit=crop"
                  alt="Modern water treatment facility and control piping"
                  className="w-full h-80 sm:h-96 object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#102B46] via-[#102B46]/30 to-transparent" />

                {/* Overlay Badge */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-[#102B46]/85 backdrop-blur-md border border-white/10 text-white">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#48CAE4] uppercase tracking-wide">
                      Proposed Positioning
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-sm font-semibold">
                    Advanced Modular Water Treatment Architectures
                  </p>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Engineered for industrial reliability and environmental compliance.
                  </p>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 bg-white text-[#102B46] p-4 rounded-2xl shadow-xl border border-slate-200 hidden sm:flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#168AAD]/10 flex items-center justify-center text-[#168AAD]">
                  <Droplets className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                    Core Focus
                  </div>
                  <div className="text-sm font-extrabold text-[#102B46]">
                    Circular Water Systems
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
