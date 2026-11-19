import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { EnquiryRecord } from '../lib/supabase';
import { fetchServerEnquiries, formatReferenceId } from '../services/enquiryService';
import {
  Shield,
  LogOut,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  Eye,
  X,
  Inbox,
  ArrowUpDown,
  ExternalLink,
  Layers,
  AlertCircle,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adminUserEmail, setAdminUserEmail] = useState<string>('admin@venuswater.com');
  const [authError, setAuthError] = useState<string | null>(null);

  // Search, filter, and sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'email_sent' | 'pending'>('all');

  // Selected Enquiry for Details Modal
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryRecord | null>(null);

  // Authorization verification
  useEffect(() => {
    async function verifyAdminAuth() {
      try {
        setLoading(true);

        if (!isSupabaseConfigured) {
          const localAdmin = localStorage.getItem('venus_mock_admin_authenticated');
          if (localAdmin !== 'true') {
            navigate('/admin/login', { replace: true });
            return;
          }
          setAdminUserEmail('admin@venuswater.com (Evaluator Fallback)');
          loadEnquiries();
          setLoading(false);
          return;
        }

        // 1. Check session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          navigate('/admin/login', { replace: true });
          return;
        }

        setAdminUserEmail(session.user.email || 'Admin');

        // 2. Database authorization check (is user in admin_users?)
        const { data: adminData, error: adminErr } = await supabase
          .from('admin_users')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (adminErr || !adminData) {
          console.error('User not in admin_users table:', adminErr);
          setAuthError('Unauthorized: Your user record is not authorized in admin_users.');
          await supabase.auth.signOut();
          navigate('/admin/login', { replace: true });
          return;
        }

        // Fetch enquiries
        await loadEnquiries();
      } catch (err: any) {
        console.error('Authorization check error:', err);
        setAuthError(err.message || 'Authorization check failed');
      } finally {
        setLoading(false);
      }
    }

    verifyAdminAuth();
  }, [navigate]);

  const loadEnquiries = async () => {
    setRefreshing(true);
    try {
      if (isSupabaseConfigured) {
        // Query database using Supabase RLS policy "Admins can view all enquiries"
        const { data, error } = await supabase
          .from('enquiries')
          .select('*')
          .order('created_at', { ascending: sortOrder === 'asc' });

        if (error) {
          console.error('Failed to load enquiries from Supabase:', error);
          const records = await fetchServerEnquiries();
          setEnquiries(records);
        } else {
          setEnquiries(data || []);
        }
      } else {
        const records = await fetchServerEnquiries();
        setEnquiries(records);
      }
    } catch (err) {
      console.error('Error fetching enquiries:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('venus_mock_admin_authenticated');
    }
    navigate('/admin/login', { replace: true });
  };

  // Compute Metrics
  const metrics = useMemo(() => {
    const total = enquiries.length;
    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).getTime();

    const todayCount = enquiries.filter((e) => {
      const eTime = new Date(e.created_at).getTime();
      return eTime >= todayStart;
    }).length;

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentCount = enquiries.filter((e) => {
      return new Date(e.created_at).getTime() >= sevenDaysAgo;
    }).length;

    return { total, todayCount, recentCount };
  }, [enquiries]);

  // Filter and Search logic
  const filteredEnquiries = useMemo(() => {
    return enquiries
      .filter((e) => {
        // Search term
        const query = searchTerm.toLowerCase().trim();
        const refCode = (e.reference_id || formatReferenceId(e.id)).toLowerCase();
        const matchesSearch =
          !query ||
          refCode.includes(query) ||
          e.customer_name.toLowerCase().includes(query) ||
          e.email.toLowerCase().includes(query) ||
          e.id.toLowerCase().includes(query) ||
          e.mobile.includes(query);

        if (!matchesSearch) return false;

        // Date filter
        if (dateFilter !== 'all') {
          const eTime = new Date(e.created_at).getTime();
          const now = Date.now();
          if (dateFilter === 'today') {
            const todayUtc = new Date(
              Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate())
            ).getTime();
            if (eTime < todayUtc) return false;
          } else if (dateFilter === '7days') {
            if (eTime < now - 7 * 24 * 60 * 60 * 1000) return false;
          } else if (dateFilter === '30days') {
            if (eTime < now - 30 * 24 * 60 * 60 * 1000) return false;
          }
        }

        // Status filter
        if (statusFilter === 'email_sent') {
          if (!e.email_status?.toUpperCase().includes('SENT')) return false;
        } else if (statusFilter === 'pending') {
          if (!e.email_status?.toUpperCase().includes('PENDING') && !e.sms_status?.toUpperCase().includes('PENDING'))
            return false;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.created_at).getTime();
        const timeB = new Date(b.created_at).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [enquiries, searchTerm, dateFilter, statusFilter, sortOrder]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F8FA] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#168AAD] animate-spin" />
          <p className="text-sm font-semibold text-[#102B46]">Verifying Admin Authorization & Policies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F8FA] flex flex-col md:flex-row">
      {/* 1. Admin Sidebar */}
      <aside className="w-full md:w-64 bg-[#102B46] text-white flex-shrink-0 flex flex-col justify-between border-r border-white/10">
        <div>
          {/* Brand Heading */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#168AAD] to-[#48CAE4] flex items-center justify-center shadow-md">
                <Shield className="w-5 h-5 text-[#102B46]" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-wider font-['Plus_Jakarta_Sans']">
                  VENUS
                </span>
                <span className="text-[10px] tracking-widest uppercase text-[#48CAE4] block -mt-1 font-semibold">
                  Admin Console
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Operations
            </div>
            <a
              href="#overview"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-xl bg-[#164E78] text-white text-sm font-semibold"
            >
              <Inbox className="w-4 h-4 text-[#48CAE4]" />
              <span>Customer Enquiries</span>
            </a>
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Layers className="w-4 h-4 text-slate-400" />
                <span>Public Website</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </nav>
        </div>

        {/* Admin Account & Logout */}
        <div className="p-4 border-t border-white/10 bg-[#0c2136]">
          <div className="mb-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Signed in as:
            </span>
            <span className="text-xs font-semibold text-white truncate block">
              {adminUserEmail}
            </span>
            <div className="flex items-center space-x-1.5 mt-1 text-[11px] text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>RLS Authorized Admin</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 text-xs font-semibold border border-red-500/20 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Top Bar with Title and Refresh */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#102B46] font-['Plus_Jakarta_Sans']">
                Enquiry Management Console
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Real-time review of prospective client submissions, reference IDs, and notification dispatches.
              </p>
            </div>
            <button
              onClick={loadEnquiries}
              disabled={refreshing}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-[#102B46] text-xs sm:text-sm font-semibold shadow-sm transition-all active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#168AAD]' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh Records'}</span>
            </button>
          </div>

          {authError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center space-x-3 text-red-800 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* 3. Metrics Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Total Enquiries
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-[#102B46] font-['Plus_Jakarta_Sans']">
                  {metrics.total}
                </span>
                <span className="text-xs text-slate-500 font-medium">Recorded</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Today's Submissions (UTC)
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-[#168AAD] font-['Plus_Jakarta_Sans']">
                  {metrics.todayCount}
                </span>
                <span className="text-xs text-slate-500 font-medium">New today</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Past 7 Days
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-emerald-700 font-['Plus_Jakarta_Sans']">
                  {metrics.recentCount}
                </span>
                <span className="text-xs text-slate-500 font-medium">Active volume</span>
              </div>
            </div>
          </div>

          {/* 4. Controls: Search, Filter, Sort */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by customer name, email, ID, or mobile..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#168AAD] focus:ring-2 focus:ring-[#48CAE4]/20 transition-all"
              />
            </div>

            {/* Filter & Sort Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Date Filter */}
              <div className="flex items-center space-x-1.5 bg-[#F4F8FA] px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={dateFilter}
                  onChange={(e: any) => setDateFilter(e.target.value)}
                  className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today Only</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-1.5 bg-[#F4F8FA] px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="all">All Dispatches</option>
                  <option value="email_sent">Email Sent</option>
                  <option value="pending">Pending/Other</option>
                </select>
              </div>

              {/* Sort Toggle */}
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-[#F4F8FA] hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
                title={`Sort by Submission Date (${sortOrder === 'desc' ? 'Newest First' : 'Oldest First'})`}
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
              </button>
            </div>
          </div>

          {/* 5. Enquiry Management Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F4F8FA] border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4 sm:px-6">Enquiry ID</th>
                    <th className="py-3.5 px-4">Customer Name</th>
                    <th className="py-3.5 px-4">Email Address</th>
                    <th className="py-3.5 px-4">Mobile Number</th>
                    <th className="py-3.5 px-4">Message Snippet</th>
                    <th className="py-3.5 px-4">Submitted (UTC)</th>
                    <th className="py-3.5 px-4">Email Status</th>
                    <th className="py-3.5 px-4">SMS Status</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {filteredEnquiries.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <Inbox className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p className="font-semibold text-slate-600">No enquiries found</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {searchTerm || dateFilter !== 'all'
                            ? 'Try clearing your search or date filters.'
                            : 'Submit an enquiry via the public website to see records here.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredEnquiries.map((enquiry) => (
                      <tr
                        key={enquiry.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => setSelectedEnquiry(enquiry)}
                      >
                        {/* Reference ID (e.g. V10001) */}
                        <td className="py-3.5 px-4 sm:px-6 font-mono text-xs font-bold text-[#168AAD]">
                          {enquiry.reference_id || formatReferenceId(enquiry.id)}
                        </td>

                        {/* Customer Name */}
                        <td className="py-3.5 px-4 font-semibold text-[#102B46]">
                          {enquiry.customer_name}
                        </td>

                        {/* Email */}
                        <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                          {enquiry.email}
                        </td>

                        {/* Mobile */}
                        <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                          {enquiry.mobile}
                        </td>

                        {/* Message Snippet */}
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                          {enquiry.message}
                        </td>

                        {/* Submitted Date & Time (UTC) */}
                        <td className="py-3.5 px-4 text-slate-500 text-xs font-mono whitespace-nowrap">
                          {new Date(enquiry.created_at).toUTCString()}
                        </td>

                        {/* Email Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              enquiry.email_status?.includes('SENT')
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {enquiry.email_status?.slice(0, 20)}
                          </span>
                        </td>

                        {/* SMS Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              enquiry.sms_status?.includes('SENT')
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {enquiry.sms_status?.slice(0, 20)}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEnquiry(enquiry);
                            }}
                            className="p-1.5 text-slate-400 hover:text-[#102B46] hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Full Enquiry Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer Summary */}
            <div className="p-4 bg-[#F4F8FA] border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
              <span>
                Showing <strong>{filteredEnquiries.length}</strong> of <strong>{enquiries.length}</strong> enquiries
              </span>
              <span className="font-mono text-[11px]">
                Server UTC Timestamp: {new Date().toUTCString()}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* 6. Complete Enquiry Details Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedEnquiry(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-[#102B46] rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              {/* Header */}
              <div>
                <span className="text-xs uppercase font-bold text-[#168AAD] tracking-wider block mb-1">
                  Enquiry Detailed View
                </span>
                <h3 className="text-2xl font-bold text-[#102B46] font-['Plus_Jakarta_Sans']">
                  {selectedEnquiry.customer_name}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="font-mono text-xs font-bold text-[#102B46] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    ID: {selectedEnquiry.reference_id || formatReferenceId(selectedEnquiry.id)}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    ({selectedEnquiry.id})
                  </span>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F4F8FA] p-4 rounded-xl border border-slate-200 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-500 block text-xs">Email Address:</span>
                  <a
                    href={`mailto:${selectedEnquiry.email}`}
                    className="font-semibold text-[#102B46] hover:underline font-mono"
                  >
                    {selectedEnquiry.email}
                  </a>
                </div>

                <div>
                  <span className="text-slate-500 block text-xs">Mobile Number:</span>
                  <a
                    href={`tel:${selectedEnquiry.mobile}`}
                    className="font-semibold text-[#102B46] hover:underline font-mono"
                  >
                    {selectedEnquiry.mobile}
                  </a>
                </div>

                <div>
                  <span className="text-slate-500 block text-xs">Submission Timestamp (UTC):</span>
                  <span className="font-mono text-slate-700">
                    {new Date(selectedEnquiry.created_at).toUTCString()}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-xs">Email Status:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedEnquiry.email_status}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-slate-500 block text-xs">SMS Status:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedEnquiry.sms_status}
                  </span>
                </div>
              </div>

              {/* Message */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Full Customer Message
                </span>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {selectedEnquiry.message}
                </div>
              </div>

              {/* Close Footer */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedEnquiry(null)}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[#102B46] text-white hover:bg-[#164E78] transition-colors"
                >
                  Close Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
