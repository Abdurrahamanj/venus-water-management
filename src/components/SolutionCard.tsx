import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';

export interface SolutionItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  features: string[];
  proposedTag: string;
}

interface SolutionCardProps {
  solution: SolutionItem;
  featured?: boolean;
}

export const SolutionCard: React.FC<SolutionCardProps> = ({ solution, featured = false }) => {
  return (
    <div
      className={`group bg-white rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 ${
        featured
          ? 'border-[#168AAD] shadow-lg ring-1 ring-[#168AAD]/30'
          : 'border-slate-200/80 shadow-sm'
      }`}
    >
      <div>
        {/* Card Image with Proposed Tag overlay */}
        <div className="relative h-52 sm:h-56 overflow-hidden bg-slate-100">
          <ImageWithFallback
            src={solution.image}
            alt={solution.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            fallbackSrc="/images/hero-facility.jpg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#102B46]/80 via-transparent to-black/20" />

          {/* Proposed Badge */}
          <div className="absolute top-3 left-3 bg-[#102B46]/90 backdrop-blur-sm text-[#48CAE4] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#48CAE4]/30 flex items-center space-x-1">
            <Sparkles className="w-3 h-3" />
            <span>Proposed Service Category</span>
          </div>

          <div className="absolute bottom-3 left-3 right-3 text-white">
            <span className="text-xs uppercase font-semibold text-[#48CAE4] tracking-wide block">
              {solution.subtitle}
            </span>
            <h3 className="text-lg font-bold text-white font-['Plus_Jakarta_Sans'] line-clamp-1">
              {solution.title}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-slate-600 text-sm leading-relaxed mb-5">
            {solution.description}
          </p>

          {/* Key Feature Highlights */}
          <div className="space-y-2 mb-6">
            {solution.features.map((feature, idx) => (
              <div key={idx} className="flex items-start space-x-2 text-xs text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#168AAD] shrink-0 mt-0.5" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Button Footer */}
      <div className="p-6 pt-0 border-t border-slate-100 mt-auto">
        <Link
          to={`/contact?service=${encodeURIComponent(solution.title)}`}
          className="w-full mt-4 flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-[#102B46] bg-[#F4F8FA] hover:bg-[#168AAD] hover:text-white border border-slate-200 hover:border-[#168AAD] transition-all group/btn"
        >
          <span>Enquire About {solution.title}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};
