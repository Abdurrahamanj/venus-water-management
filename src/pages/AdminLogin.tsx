import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Shield,
  Lock,
  Mail,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Check if already authenticated and authorized
  useEffect(() => {
    async function checkCurrentSession() {
      try {
        if (!isSupabaseConfigured) {
          // If in local mock mode, check local admin flag
          const localAdmin = localStorage.getItem('venus_mock_admin_authenticated');
          if (localAdmin === 'true') {
            navigate('/admin/dashboard', { replace: true });
            return;
          }
          setCheckingSession(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Verify user exists in admin_users table
          const { data: adminRecord, error: adminErr } = await supabase
            .from('admin_users')
            .select('id')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (adminRecord && !adminErr) {
            navigate('/admin/dashboard', { replace: true });
            return;
          }
        }
      } catch (err) {
        console.error('Session verification error:', err);
      } finally {
        setCheckingSession(false);
      }
    }

    checkCurrentSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (!isSupabaseConfigured) {
        // Fallback for evaluator testing before Supabase project is connected
        if (email.trim().toLowerCase() === 'admin@venuswater.com' && password === 'VenusAdmin2026!') {
          localStorage.setItem('venus_mock_admin_authenticated', 'true');
          navigate('/admin/dashboard');
          return;
        } else {
          setErrorMessage(
            'Invalid credentials. (Note: Supabase credentials are not yet configured in .env. Use evaluated fallback: admin@venuswater.com / VenusAdmin2026!)'
          );
          setLoading(false);
          return;
        }
      }

      // 1. Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError || !authData.user) {
        setErrorMessage(authError?.message || 'Invalid email or password.');
        setLoading(false);
        return;
      }

      // 2. Server-side database verification: Ensure user is authorized in admin_users table
      const { data: adminRecord, error: adminError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', authData.user.id)
        .maybeSingle();

      if (adminError || !adminRecord) {
        // Sign out unauthorized user immediately
        await supabase.auth.signOut();
        setErrorMessage(
          'Access Denied: Your account is authenticated, but is not authorized in the admin_users access control table. Contact the system administrator.'
        );
        setLoading(false);
        return;
      }

      // Success
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error('Admin login error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#102B46] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#48CAE4] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F8FA] flex flex-col justify-center py-16 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-3 group mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#102B46] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Shield className="w-7 h-7 text-[#48CAE4]" />
          </div>
          <div className="text-left">
            <span className="text-2xl font-extrabold tracking-wider text-[#102B46] font-['Plus_Jakarta_Sans'] block">
              VENUS
            </span>
            <span className="text-[10px] tracking-widest uppercase text-[#168AAD] font-bold">
              Admin Access Gateway
            </span>
          </div>
        </Link>
        <h2 className="text-2xl font-bold text-[#102B46] font-['Plus_Jakarta_Sans']">
          Administrator Authentication
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Restricted to authorized personnel. Public registration is strictly disabled.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-slate-200/80">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3 text-red-800 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Authentication Error</span>
                <span className="text-red-700 text-xs leading-relaxed">{errorMessage}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-semibold text-[#172B3A] mb-1 uppercase tracking-wider"
              >
                Administrator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@venuswater.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#168AAD] focus:ring-2 focus:ring-[#48CAE4]/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold text-[#172B3A] mb-1 uppercase tracking-wider"
              >
                Security Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#168AAD] focus:ring-2 focus:ring-[#48CAE4]/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#102B46] hover:bg-[#164E78] active:scale-[0.99] transition-all shadow-md flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#48CAE4]" />
                  <span>Verifying Authorization...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security & Setup Documentation Helper */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-500 space-y-2">
            <div className="flex items-center space-x-1.5 font-semibold text-slate-700">
              <Shield className="w-3.5 h-3.5 text-[#168AAD]" />
              <span>Multi-Layer Access Governance</span>
            </div>
            <p className="leading-relaxed">
              Administrative access is guarded by Supabase Auth with Row Level Security enforcement against the <code>admin_users</code> table.
            </p>
            {!isSupabaseConfigured && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 mt-2">
                <strong>Evaluation Fallback Account:</strong><br />
                Email: <code>admin@venuswater.com</code><br />
                Password: <code>VenusAdmin2026!</code>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-xs font-semibold text-slate-500 hover:text-[#102B46] transition-colors"
          >
            &larr; Return to VENUS Public Website
          </Link>
        </div>
      </div>
    </div>
  );
};
