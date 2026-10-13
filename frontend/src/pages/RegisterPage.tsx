import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Alert } from '@/components/ui/alert';
import { ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await register({
        full_name: fullName,
        email,
        password,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-[#dff1fd] via-[#f3f9fd] to-[#fbfaf8] flex items-center justify-center px-4 py-16 text-slate-900">
      <div className="w-full max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <span className="font-bold text-2xl tracking-tight text-slate-900 font-sans group-hover:opacity-80 transition-opacity">
              ATSCraft
            </span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-semibold tracking-wider">
              ATS
            </span>
          </Link>

          <h1 className="font-serif-editorial text-4xl sm:text-5xl font-normal text-slate-900 tracking-tight leading-tight">
            Create account
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-stone-600 font-sans leading-relaxed">
            Construct single-page, ATS-compliant resumes with verified formatting and keyword scoring.
          </p>
        </div>

        {/* Floating Card */}
        <div className="rounded-3xl bg-white border border-stone-200/90 shadow-xl p-7 sm:p-9 ring-1 ring-black/5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="danger">
                {error}
              </Alert>
            )}

            <div>
              <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-700 block mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Alex Rivera"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full h-10 px-3.5 rounded-lg border border-stone-300 bg-white text-sm text-slate-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-black focus:border-black transition-all"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-700 block mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="alex.rivera@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-10 px-3.5 rounded-lg border border-stone-300 bg-white text-sm text-slate-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-black focus:border-black transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-700">
                  Password
                </label>
                <span className="text-[10px] font-mono text-stone-400">Min 6 characters</span>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-10 px-3.5 rounded-lg border border-stone-300 bg-white text-sm text-slate-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-black focus:border-black transition-all"
              />
            </div>

            <div className="flex items-center gap-2 text-[11px] text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-200">
              <ShieldCheck className="h-4 w-4 text-stone-800 shrink-0" />
              <span>Strict data privacy: Your resume information is never shared or brokered.</span>
            </div>

            {/* Black Rectangular Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black hover:bg-neutral-800 text-white rounded-none py-3 px-6 text-xs font-mono font-medium tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm disabled:opacity-50"
              >
                <span className="text-[10px]">▪</span>
                <span>{loading ? 'Creating Account...' : 'Create Account & Begin'}</span>
                {!loading && <ArrowRight className="h-3.5 w-3.5" />}
              </button>
            </div>
          </form>

          {/* Footer inside card */}
          <div className="mt-6 pt-5 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-600 font-sans">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-black hover:underline inline-flex items-center gap-0.5 ml-1">
                Sign In →
              </Link>
            </p>
          </div>
        </div>

        {/* Feature badge under card */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-stone-500 font-mono">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-stone-800" />
            Greenhouse & Lever Ready
          </span>
          <span className="text-stone-300">•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-stone-800" />
            A4 Vector PDFs
          </span>
        </div>

      </div>
    </div>
  );
}
