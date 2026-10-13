import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  BarChart2, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  User as UserIcon,
  ChevronDown,
  Sparkles,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setAccountMenuOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/90 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <span className="font-bold text-xl tracking-tight text-slate-900 font-sans hover:opacity-90 transition-opacity">
            ATSCraft
          </span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 font-semibold tracking-wider">
            ATS
          </span>
        </Link>

        {/* Desktop Nav Links */}
        {user ? (
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/dashboard"
              className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                isActive('/dashboard')
                  ? 'bg-stone-100 text-stone-900 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/analysis"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                isActive('/analysis')
                  ? 'bg-stone-100 text-stone-900 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <BarChart2 className="h-3.5 w-3.5 text-stone-700" />
              ATS Scorer
            </Link>
            <Link
              to="/settings"
              className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                isActive('/settings')
                  ? 'bg-stone-100 text-stone-900 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              Settings
            </Link>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-7">
            <Link to="/#features" className="text-sm font-medium text-stone-700 hover:text-black">
              Product
            </Link>
            <Link to="/#journal" className="text-sm font-medium text-stone-700 hover:text-black">
              Journal
            </Link>
            <Link to="/#about" className="text-sm font-medium text-stone-700 hover:text-black">
              About
            </Link>
            <Link to="/#careers" className="text-sm font-medium text-stone-700 hover:text-black">
              Careers
            </Link>
          </nav>
        )}

        {/* Right Area: Account Details Dropdown Menu or Sign In */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="relative" ref={accountMenuRef}>
              {/* Account Pill Trigger */}
              <button
                type="button"
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-full border border-stone-200 hover:border-stone-400 bg-white hover:bg-stone-50 transition-all cursor-pointer shadow-2xs"
                title="Account Details and Settings"
              >
                {/* Profile Picture / Avatar */}
                <div className="w-8 h-8 rounded-full overflow-hidden bg-stone-100 border border-stone-300 flex items-center justify-center shrink-0">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-mono text-xs font-bold text-stone-800">
                      {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  )}
                </div>

                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-900 line-clamp-1 max-w-[110px]">
                    {user.full_name || 'My Account'}
                  </span>
                  <span className="text-[10px] font-mono text-stone-500 -mt-0.5">
                    Pro Candidate
                  </span>
                </div>

                <ChevronDown className={`h-3.5 w-3.5 text-stone-500 transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Account Details Dropdown Menu */}
              {accountMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-stone-200/90 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/5">
                  {/* Dropdown Header */}
                  <div className="p-3 border-b border-stone-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-stone-100 border border-stone-300 flex items-center justify-center shrink-0">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-mono text-sm font-bold text-stone-800">
                          {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {user.full_name || 'Candidate'}
                      </div>
                      <div className="text-[11px] font-mono text-stone-500 truncate">
                        {user.email}
                      </div>
                      <span className="mt-1 inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        <CheckCircle className="h-2.5 w-2.5 text-emerald-700" />
                        ATS Certified
                      </span>
                    </div>
                  </div>

                  {/* Menu Options */}
                  <div className="py-1.5 space-y-0.5 text-xs font-mono">
                    <Link
                      to="/settings"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-stone-700 hover:text-black hover:bg-stone-100 transition-colors"
                    >
                      <UserIcon className="h-3.5 w-3.5 text-stone-600" />
                      <span>Account Details & Avatar</span>
                    </Link>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-stone-700 hover:text-black hover:bg-stone-100 transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5 text-stone-600" />
                      <span>My Resumes Workspace</span>
                    </Link>
                    <Link
                      to="/analysis"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-stone-700 hover:text-black hover:bg-stone-100 transition-colors"
                    >
                      <BarChart2 className="h-3.5 w-3.5 text-stone-600" />
                      <span>ATS Matcher & Scorer</span>
                    </Link>
                  </div>

                  {/* Sign Out Option */}
                  <div className="pt-1.5 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="h-3.5 w-3.5 text-rose-600" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-stone-700 hover:text-black">
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold text-black hover:opacity-80 transition-opacity flex items-center gap-1"
              >
                Get started →
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu hamburger button */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md p-2 text-stone-700 hover:bg-stone-100 focus:outline-hidden"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-stone-200 bg-white px-4 py-4 md:hidden">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-stone-100 border border-stone-300 flex items-center justify-center shrink-0">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-mono text-sm font-bold text-stone-800">
                      {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-medium text-slate-900 text-sm">{user.full_name}</div>
                  <div className="text-xs text-stone-500 font-mono">{user.email}</div>
                </div>
              </div>
              <div className="space-y-1 text-xs font-mono">
                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-stone-700 hover:bg-stone-100"
                >
                  <UserIcon className="h-4 w-4" />
                  Account Details & Avatar
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-stone-700 hover:bg-stone-100"
                >
                  <FileText className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  to="/analysis"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-stone-700 hover:bg-stone-100"
                >
                  <BarChart2 className="h-4 w-4" />
                  ATS Scorer & Matcher
                </Link>
              </div>
              <div className="pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-mono text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2 text-center text-sm font-medium text-stone-700 hover:bg-stone-100 rounded-md"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2 text-center text-sm font-semibold bg-black text-white rounded-none"
              >
                Get started →
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
