import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { EnquiryForm } from '../components/EnquiryForm';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Globe2,
} from 'lucide-react';

export const Contact: React.FC = () => {
  const [searchParams] = useSearchParams();
  const requestedService = searchParams.get('service');

  return (
    <div className="pt-24 pb-20">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#102B46] to-[#164E78] text-white py-16 sm:py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#48CAE4] text-xs font-bold tracking-wide uppercase border border-white/15">
            <Mail className="w-3.5 h-3.5" />
            <span>Connect with VENUS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-['Plus_Jakarta_Sans'] tracking-tight">
            Contact & Advisory Desk
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Reach out to our water solutions team. Submitting an enquiry triggers our secure intake workflow, assigning a unique reference ID and automated confirmation.
          </p>
        </div>
      </section>

      {/* Main Form & Information Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Contact Information and Location Notice */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <span className="text-xs font-bold text-[#168AAD] uppercase tracking-wider block">
                  Communication Channels
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#102B46] font-['Plus_Jakarta_Sans']">
                  Direct Inquiries & Technical Consultations
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Whether you are planning an industrial water reclamation retrofit or need compliance-focused wastewater filtration, our specialists are available to review your specifications.
                </p>
              </div>

              {/* Information Cards */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-lg bg-[#168AAD]/10 text-[#168AAD] flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Enquiry Email (Placeholder)
                    </span>
                    <span className="text-sm font-bold text-[#102B46]">
                      contact@venuswater.com
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Monitored during standard business hours.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-lg bg-[#168AAD]/10 text-[#168AAD] flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Helpline Desk (Placeholder)
                    </span>
                    <span className="text-sm font-bold text-[#102B46]">
                      +1 (800) 555-VENUS
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Toll-free advisory line placeholder.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-lg bg-[#168AAD]/10 text-[#168AAD] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Headquarters (Proposed Placement)
                    </span>
                    <span className="text-sm font-bold text-[#102B46]">
                      Global Sustainable Water Hub
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Physical site placeholder pending verified corporate lease disclosure.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-lg bg-[#168AAD]/10 text-[#168AAD] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Intake Response Standard
                    </span>
                    <span className="text-sm font-bold text-[#102B46]">
                      Automated Instant Reference Confirmation
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      All web submissions recorded with UTC timestamps.
                    </p>
                  </div>
                </div>
              </div>

              {/* Geographic Location Placeholder Notice */}
              <div className="p-5 rounded-2xl bg-[#F4F8FA] border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#102B46]">
                  <Globe2 className="w-4 h-4 text-[#168AAD]" />
                  <span>Proposed Global Service Coverage</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Per technical assessment guidelines, interactive map rendering is withheld until a physical corporate headquarter address is verified. VENUS maintains proposed consultative reach for municipal, industrial, and ecological initiatives across regional water basins.
                </p>
              </div>
            </div>

            {/* Right Column: Mandatory Functional Enquiry Form */}
            <div className="lg:col-span-7">
              <EnquiryForm initialSubject={requestedService || undefined} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
