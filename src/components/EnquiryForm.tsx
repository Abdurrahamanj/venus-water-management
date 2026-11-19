import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  Mail,
  Phone,
  User,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { submitEnquiry } from '../services/enquiryService';
import type { SubmitEnquiryResponse } from '../services/enquiryService';

// Zod Schema for strict client-side validation
const enquirySchema = z.object({
  customer_name: z
    .string()
    .min(2, { message: 'Customer name must be at least 2 characters.' })
    .max(150, { message: 'Customer name cannot exceed 150 characters.' })
    .regex(/^[a-zA-Z\s.'-]+$/, {
      message: 'Name can only contain alphabets, spaces, apostrophes, and hyphens.',
    }),
  email: z
    .string()
    .min(5, { message: 'Email address is required.' })
    .max(255, { message: 'Email cannot exceed 255 characters.' })
    .email({ message: 'Please enter a valid email address (e.g. name@domain.com).' }),
  mobile: z
    .string()
    .min(7, { message: 'Contact mobile number must be at least 7 digits.' })
    .max(25, { message: 'Mobile number cannot exceed 25 characters.' })
    .regex(/^\+?[0-9\s\-()]{7,25}$/, {
      message: 'Please provide a valid phone number (e.g., +1 555-0199 or 9876543210).',
    }),
  message: z
    .string()
    .min(10, { message: 'Enquiry message must be at least 10 characters so we can understand your needs.' })
    .max(3000, { message: 'Enquiry message cannot exceed 3,000 characters.' }),
});

type EnquiryFormData = z.infer<typeof enquirySchema>;

interface EnquiryFormProps {
  initialSubject?: string;
  onSuccess?: (res: SubmitEnquiryResponse) => void;
}

export const EnquiryForm: React.FC<EnquiryFormProps> = ({ initialSubject, onSuccess }) => {
  const [submissionResult, setSubmissionResult] = useState<SubmitEnquiryResponse | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EnquiryFormData>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      customer_name: '',
      email: '',
      mobile: '',
      message: initialSubject ? `Regarding ${initialSubject}: ` : '',
    },
  });

  const onSubmit = async (data: EnquiryFormData) => {
    setServerError(null);
    try {
      const response = await submitEnquiry(data);
      if (response.success) {
        setSubmissionResult(response);
        reset();
        if (onSuccess) {
          onSuccess(response);
        }
      } else {
        setServerError('Unable to process enquiry. Please try again.');
      }
    } catch (err: any) {
      console.error('Enquiry submission caught error:', err);
      setServerError(
        err.message || 'An unexpected error occurred while transmitting your enquiry. Please check your connection and retry.'
      );
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  const handleResetForm = () => {
    setSubmissionResult(null);
    setServerError(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
      {/* Form Header Banner */}
      <div className="bg-gradient-to-r from-[#102B46] to-[#164E78] px-6 py-6 sm:px-8 text-white">
        <div className="flex items-center space-x-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-[#48CAE4]/20 flex items-center justify-center">
            <Mail className="w-4 h-4 text-[#48CAE4]" />
          </div>
          <h3 className="text-xl font-bold font-['Plus_Jakarta_Sans']">
            Submit a Water Management Enquiry
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-300">
          Our engineering & sustainability team reviews each enquiry and triggers confirmation alerts.
        </p>
      </div>

      <div className="p-6 sm:p-8">
        {/* Server Error Alert */}
        {serverError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3 text-red-800 text-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Submission Failed</p>
              <p className="text-red-700 text-xs mt-0.5">{serverError}</p>
            </div>
          </div>
        )}

        {/* Success State View */}
        {submissionResult ? (
          <div className="space-y-6 py-2">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center mx-auto text-emerald-600 shadow-sm animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="text-center space-y-2">
              <h4 className="text-xl font-bold text-[#102B46]">
                Enquiry Successfully Received
              </h4>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                {submissionResult.message}
              </p>
            </div>

            {/* Reference ID and Metadata Card */}
            <div className="bg-[#F4F8FA] rounded-xl border border-slate-200 p-5 space-y-4 text-xs sm:text-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Enquiry Reference ID:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-semibold text-[#102B46] text-xs sm:text-sm bg-white px-2 py-1 rounded border border-slate-200">
                    {submissionResult.enquiry_id}
                  </span>
                  <button
                    onClick={() => copyToClipboard(submissionResult.enquiry_id)}
                    className="p-1.5 text-slate-500 hover:text-[#102B46] hover:bg-slate-200 rounded transition-colors"
                    title="Copy Reference ID"
                  >
                    {copiedId ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Submission Timestamp (UTC):</span>
                <span className="font-mono text-slate-700">
                  {new Date(submissionResult.created_at).toUTCString()}
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Email Dispatch Status:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    submissionResult.email_status === 'SENT'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {submissionResult.email_status}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">SMS Dispatch Status:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    submissionResult.sms_status === 'SENT'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {submissionResult.sms_status}
                </span>
              </div>
            </div>

            {submissionResult.is_demo && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                <strong>Note:</strong> Enquiry stored locally. To persist directly in Supabase and trigger live Resend emails & Twilio SMS, configure <code>VITE_SUPABASE_URL</code> and backend API keys.
              </div>
            )}

            <button
              onClick={handleResetForm}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-[#102B46] text-white hover:bg-[#164E78] rounded-xl font-semibold text-sm transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Submit Another Enquiry</span>
            </button>
          </div>
        ) : (
          /* Active Form View */
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Customer Name */}
            <div>
              <label
                htmlFor="customer_name"
                className="block text-xs sm:text-sm font-semibold text-[#172B3A] mb-1"
              >
                Customer Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="customer_name"
                  type="text"
                  placeholder="e.g. Johnathan Vance"
                  disabled={isSubmitting}
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.customer_name
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-slate-300 focus:border-[#168AAD] focus:ring-[#48CAE4]/20'
                  }`}
                  {...register('customer_name')}
                />
              </div>
              {errors.customer_name && (
                <p className="mt-1 text-xs text-red-600 flex items-center space-x-1">
                  <span>{errors.customer_name.message}</span>
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs sm:text-sm font-semibold text-[#172B3A] mb-1"
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="e.g. j.vance@company.com"
                  disabled={isSubmitting}
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.email
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-slate-300 focus:border-[#168AAD] focus:ring-[#48CAE4]/20'
                  }`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 flex items-center space-x-1">
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label
                htmlFor="mobile"
                className="block text-xs sm:text-sm font-semibold text-[#172B3A] mb-1"
              >
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="mobile"
                  type="tel"
                  placeholder="e.g. +1 555-0144 or 9876543210"
                  disabled={isSubmitting}
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.mobile
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-slate-300 focus:border-[#168AAD] focus:ring-[#48CAE4]/20'
                  }`}
                  {...register('mobile')}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Used to dispatch real-time SMS acknowledgement upon verification.
              </p>
              {errors.mobile && (
                <p className="mt-1 text-xs text-red-600 flex items-center space-x-1">
                  <span>{errors.mobile.message}</span>
                </p>
              )}
            </div>

            {/* Enquiry Message */}
            <div>
              <label
                htmlFor="message"
                className="block text-xs sm:text-sm font-semibold text-[#172B3A] mb-1"
              >
                Enquiry Message <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <textarea
                  id="message"
                  rows={4}
                  placeholder="Describe your water treatment, recycling, industrial or infrastructure requirements..."
                  disabled={isSubmitting}
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.message
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-slate-300 focus:border-[#168AAD] focus:ring-[#48CAE4]/20'
                  }`}
                  {...register('message')}
                />
              </div>
              {errors.message && (
                <p className="mt-1 text-xs text-red-600 flex items-center space-x-1">
                  <span>{errors.message.message}</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white flex items-center justify-center space-x-2 transition-all shadow-md ${
                isSubmitting
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#102B46] via-[#164E78] to-[#168AAD] hover:opacity-95 active:scale-[0.99] shadow-[#164E78]/25'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Validating & Transmitting Enquiry...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Transmit Enquiry to VENUS</span>
                </>
              )}
            </button>

            {/* Privacy and Verification Note */}
            <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>TLS encrypted transmission & parameterized database storage.</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
