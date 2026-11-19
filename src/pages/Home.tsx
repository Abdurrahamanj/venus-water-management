import React from 'react';
import { Link } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { SolutionCard } from '../components/SolutionCard';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { SOLUTIONS_DATA } from '../data/solutionsData';
import {
  Droplets,
  ShieldAlert,
  Leaf,
  Layers,
  ArrowRight,
  TrendingDown,
  RefreshCw,
  Globe,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const Home: React.FC = () => {
  return (
    <div className="space-y-0">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. About VENUS Introduction */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#168AAD]/10 text-[#168AAD] text-xs font-bold tracking-wide uppercase">
                <Droplets className="w-3.5 h-3.5" />
                <span>About VENUS</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102B46] tracking-tight font-['Plus_Jakarta_Sans'] leading-tight">
                Pioneering Responsible Water Solutions for Modern Industry & Society
              </h2>

              <p className="text-slate-600 leading-relaxed text-base">
                VENUS is positioned as an integrated water management partner committed to resolving complex water challenges. As freshwater scarcity escalates and industrial demands rise, our mission is to deliver forward-thinking frameworks that balance high-throughput operational requirements with rigorous ecological stewardship.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#F4F8FA] border border-slate-200/80">
                  <div className="w-8 h-8 rounded-lg bg-[#168AAD]/10 text-[#168AAD] flex items-center justify-center mb-2">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-[#102B46]">Integrated Architecture</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    End-to-end alignment from intake purification to wastewater reclamation.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#F4F8FA] border border-slate-200/80">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-2">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-[#102B46]">Ecological Balance</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Designed to minimize freshwater withdrawal and prevent environmental runoff.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center space-x-2 text-sm font-bold text-[#168AAD] hover:text-[#102B46] group transition-colors"
                >
                  <span>Read more about our vision and ethical principles</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200">
                <ImageWithFallback
                  src="/images/industrial-clarifier.jpg"
                  alt="Industrial water clarifier basin and treatment tanks"
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#102B46]/70 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white p-4 rounded-xl bg-[#102B46]/80 backdrop-blur-md border border-white/10">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#48CAE4] block mb-1">
                    Proposed Capabilities
                  </span>
                  <p className="text-xs text-slate-200">
                    Precision clarifies, membrane filtration modules, and automated dosing architectures designed to deliver consistent, compliant effluent.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Water Management Solutions Overview */}
      <section className="py-20 bg-[#F4F8FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#168AAD]/10 text-[#168AAD] text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Proposed Service Portfolio</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102B46] font-['Plus_Jakarta_Sans']">
              Engineered Solutions for Modern Water Cycles
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Explore our core proposed categories spanning municipal, industrial, and ecological applications. Each domain represents targeted engineering designed for operational resilience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SOLUTIONS_DATA.slice(0, 6).map((solution, idx) => (
              <SolutionCard key={solution.id} solution={solution} featured={idx === 0} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/solutions"
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-[#102B46] text-white hover:bg-[#164E78] transition-all shadow-md"
            >
              <span>View Detailed Solution Specifications</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Why Water Management Matters */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102B46] font-['Plus_Jakarta_Sans']">
              Why Water Management Matters
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Water is the lifeblood of economic activity, human health, and biological equilibrium. Managing it proactively mitigates severe operational and ecological risks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="p-8 rounded-2xl bg-[#F4F8FA] border border-slate-200 hover:border-[#168AAD] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingDown className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#102B46] mb-2 font-['Plus_Jakarta_Sans']">
                Global Scarcity & Aquifer Depletion
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Over two-thirds of major global aquifers are being depleted faster than natural recharge rates. Without systemic recycling and efficiency audits, industrial continuity faces unprecedented vulnerability.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-8 rounded-2xl bg-[#F4F8FA] border border-slate-200 hover:border-[#168AAD] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#102B46] mb-2 font-['Plus_Jakarta_Sans']">
                Tightening Regulatory Compliance
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Environmental protections and effluent discharge standards are intensifying worldwide. Non-compliant operations risk severe fines, operational moratoria, and lasting reputational damage.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-8 rounded-2xl bg-[#F4F8FA] border border-slate-200 hover:border-[#168AAD] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#168AAD]/10 text-[#168AAD] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#102B46] mb-2 font-['Plus_Jakarta_Sans']">
                Resource Recovery & Economics
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Treated wastewater is an untapped economic asset. Advanced reclamation allows cooling towers and manufacturing plants to reuse effluent, dramatically cutting municipal intake expenses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Our Approach Section */}
      <section className="py-20 bg-gradient-to-br from-[#102B46] via-[#123658] to-[#164E78] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold text-[#48CAE4] uppercase tracking-wider block">
                Methodology & Execution
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-['Plus_Jakarta_Sans'] leading-tight">
                Our Methodical Approach to Water Stewardship
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Sustainable water infrastructure requires more than standalone hardware. VENUS advocates a structured lifecycle methodology that diagnoses, optimizes, deploys, and continually monitors performance.
              </p>
              <div className="pt-2">
                <Link
                  to="/solutions"
                  className="inline-flex items-center space-x-2 text-sm font-semibold text-[#48CAE4] hover:text-white transition-colors"
                >
                  <span>Explore technical design modules</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              {/* Step 1 */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-[#48CAE4]/20 text-[#48CAE4] flex items-center justify-center font-bold text-sm shrink-0">
                  01
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">
                    Holistic Intake & Quality Diagnostic
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Full chemical, biological, and volume profiling of incoming water sources to identify hardness, contaminants, and peak fluctuations.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-[#48CAE4]/20 text-[#48CAE4] flex items-center justify-center font-bold text-sm shrink-0">
                  02
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">
                    Engineered Process Optimization
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Custom configuration of membrane filtration, biological aeration, or chemical precipitation tailored to exact regulatory standards.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-[#48CAE4]/20 text-[#48CAE4] flex items-center justify-center font-bold text-sm shrink-0">
                  03
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">
                    Circular Water Recycling Integration
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Interconnecting post-treatment outputs with non-potable reuse systems to achieve measurable reduction in net water intake.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-[#48CAE4]/20 text-[#48CAE4] flex items-center justify-center font-bold text-sm shrink-0">
                  04
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">
                    Continuous Telemetry & Compliance Auditing
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Sensor-based data logging and telemetry providing real-time visibility into effluent compliance and proactive maintenance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Sustainability-Focused Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200">
                <ImageWithFallback
                  src="/images/pure-water.jpg"
                  alt="Clear pristine water reflecting nature and conservation"
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-[#48CAE4] mb-1">
                    <Globe className="w-4 h-4" />
                    <span>Environmental Guardianship</span>
                  </div>
                  <h4 className="text-base font-bold">Safeguarding Natural Water Bodies</h4>
                  <p className="text-xs text-slate-200 mt-1">
                    Preventing toxic leachate and thermal pollution from degrading aquatic biodiversity.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold tracking-wide uppercase border border-emerald-200">
                <Leaf className="w-3.5 h-3.5" />
                <span>Sustainability Commitment</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102B46] font-['Plus_Jakarta_Sans'] leading-tight">
                Designed to Respect the Earth's Most Finite Essential Asset
              </h2>

              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                True water stewardship requires treating every drop with intentionality. VENUS emphasizes carbon-neutral pumping schemes, chemical reduction, and closed-loop technologies that dramatically shrink ecological footprints.
              </p>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-sm text-[#102B46]">Decarbonized Filtration Circuits</h5>
                    <p className="text-xs text-slate-500">
                      Optimized hydraulic head loss lowering energy consumption per cubic meter treated.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-sm text-[#102B46]">Chemical Minimization Strategies</h5>
                    <p className="text-xs text-slate-500">
                      Employing advanced physical filtration and UV sterilization over heavy coagulants.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-sm text-[#102B46]">Circular Wastewater Valorization</h5>
                    <p className="text-xs text-slate-500">
                      Reclaiming heat and treated effluent for district energy and industrial re-use.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Contact CTA Section */}
      <section className="py-16 bg-[#F4F8FA] border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#102B46] to-[#164E78] rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
              <Droplets className="w-96 h-96 -mr-16 -mb-16 text-[#48CAE4]" />
            </div>

            <div className="relative z-10 max-w-2xl space-y-4">
              <span className="text-xs font-bold text-[#48CAE4] uppercase tracking-wider block">
                Connect With Our Team
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-['Plus_Jakarta_Sans'] leading-tight">
                Ready to Discuss Your Water Infrastructure & Management Needs?
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Submit an enquiry to explore proposed treatment, recycling, and wastewater frameworks. Receive immediate confirmation with a reference ID.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link
                  to="/contact"
                  className="px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#48CAE4] to-[#168AAD] hover:from-[#38b6d0] hover:to-[#12728f] text-[#102B46] shadow-lg shadow-[#48CAE4]/20 transition-all flex items-center space-x-2"
                >
                  <span>Submit an Enquiry</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/solutions"
                  className="px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-200 border border-white/20 hover:bg-white/10 transition-all"
                >
                  <span>Browse Proposed Solutions</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
