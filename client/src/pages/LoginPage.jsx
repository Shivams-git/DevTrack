import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { ThemeSelector } from '../components/common/ThemeSelector.jsx';
import {
  Layers,
  Lock,
  Mail,
  User as UserIcon,
  Briefcase,
  Users,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  UserPlus,
  Check,
  X,
  ArrowLeft,
  FlaskConical,
} from 'lucide-react';

const ROLES = [
  { value: 'developer', label: 'Full-Stack Developer' },
  { value: 'tech_lead', label: 'Tech Lead / Architect' },
  { value: 'product_manager', label: 'Product Manager' },
  { value: 'qa_engineer', label: 'QA Engineer' },
  { value: 'admin', label: 'Engineering Director' },
];

export function LoginPage() {
  const {
    user,
    sessions,
    switchAccount,
    logout,
    logoutAll,
    login,
    register,
    demoLogin,
    isAuthenticated,
    enterGuestMode,
  } = useAuth();
  const { activeTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const isAddAccountQuery = searchParams.get('addAccount') === 'true';

  // If sessions exist and user is NOT explicitly requesting ?addAccount=true, show profile chooser
  const [isAddingAccount, setIsAddingAccount] = useState(() => {
    return isAddAccountQuery || sessions.length === 0;
  });

  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'developer',
    team: 'Core Platform Engineering',
    bio: '',
  });

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [demoLoading, setDemoLoading] = useState('');

  // When query parameter changes to addAccount, toggle to adding account
  useEffect(() => {
    if (isAddAccountQuery) {
      setIsAddingAccount(true);
    }
  }, [isAddAccountQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (isSignUp && (!formData.name.trim() || formData.name.trim().length < 2)) {
      setFormError('Please enter your full name (at least 2 characters).');
      return;
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setFormError('Please enter a valid work email address.');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      localStorage.setItem('devtrack_test_mode', 'false');
      if (isSignUp) {
        await register(formData);
      } else {
        await login(formData.email.trim(), formData.password);
      }
      navigate('/');
    } catch (err) {
      setFormError(err.message || 'Authentication failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (email, label) => {
    setDemoLoading(label);
    setFormError('');
    try {
      localStorage.setItem('devtrack_test_mode', 'false');
      await demoLogin(email);
      navigate('/');
    } catch (err) {
      setFormError('Could not sign in with demo account: ' + err.message);
    } finally {
      setDemoLoading('');
    }
  };

  const handleEnterTestMode = () => {
    enterGuestMode(true);
    navigate('/');
  };

  const handleEnterGuest = () => {
    enterGuestMode(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] flex flex-col justify-between transition-colors duration-200">
      {/* Top Navbar */}
      <header className="relative z-50 h-16 px-6 flex items-center justify-between border-b theme-border theme-header backdrop-blur-md">
        <Link to={isAuthenticated ? '/' : '/login'} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl theme-btn-primary flex items-center justify-center text-white shadow-md">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight">DevTrack</span>
            <span className="ml-1.5 text-[9px] uppercase font-bold px-1 py-0.5 rounded theme-subtle-badge">
              PRO
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeSelector />
          <button
            onClick={handleEnterTestMode}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer"
            title="Preview pre-existing issues in demo test mode"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Test Mode</span>
          </button>
          <button
            onClick={handleEnterGuest}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
            title="Enter workspace as guest with clean empty dashboard"
          >
            Guest (Clean) &rarr;
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero / Brand Card */}
          <div className="lg:col-span-5 hidden lg:flex flex-col space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold theme-subtle-badge w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full-Stack Developer Workflow</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight leading-tight">
              Ship software with clarity and precision.
            </h1>

            <p className="text-sm text-[var(--theme-text-muted)] leading-relaxed">
              DevTrack connects backlog planning, dynamic deadline prioritization, and team velocity tracking in a modern developer-first environment.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <strong className="block text-[var(--theme-text)]">MongoDB Atlas Persistence</strong>
                  <span className="text-[var(--theme-text-muted)]">Users and issues stored securely in the cloud.</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <strong className="block text-[var(--theme-text)]">Dynamic Urgency Engine</strong>
                  <span className="text-[var(--theme-text-muted)]">Smart prioritization based on due dates & blockages.</span>
                </div>
              </div>
            </div>

            {/* Quick Demo Logins Box */}
            <div className="p-4 rounded-xl border theme-border theme-surface-alt space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--theme-text-muted)]">
                <span>1-Click Demo Profiles</span>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={Boolean(demoLoading)}
                  onClick={() => handleDemo('alex@devtrack.dev', 'Alex (Lead)')}
                  className="px-2.5 py-1.5 rounded-lg border theme-border hover:theme-subtle-badge text-left transition-all text-xs"
                >
                  <div className="font-semibold truncate">Alex Rivera</div>
                  <div className="text-[10px] text-[var(--theme-text-muted)] truncate">Tech Lead</div>
                </button>
                <button
                  type="button"
                  disabled={Boolean(demoLoading)}
                  onClick={() => handleDemo('sarah@devtrack.dev', 'Sarah (Dev)')}
                  className="px-2.5 py-1.5 rounded-lg border theme-border hover:theme-subtle-badge text-left transition-all text-xs"
                >
                  <div className="font-semibold truncate">Sarah Chen</div>
                  <div className="text-[10px] text-[var(--theme-text-muted)] truncate">Full-Stack Dev</div>
                </button>
                <button
                  type="button"
                  onClick={handleEnterTestMode}
                  className="col-span-2 px-2.5 py-2 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-left transition-all text-xs flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-amber-500 flex-shrink-0 animate-pulse" />
                    <div>
                      <div className="font-semibold leading-tight">Explore in Test Mode</div>
                      <div className="text-[10px] text-amber-600/80 dark:text-amber-400/80">View pre-existing sample sprint tasks</div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Auth Card */}
          <div className="lg:col-span-7">
            <div className="theme-card rounded-2xl border p-6 sm:p-8 shadow-2xl backdrop-blur-md">
              {/* PROFILE SWITCHER VIEW */}
              {!isAddingAccount && sessions.length > 0 ? (
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-xl theme-subtle-badge flex items-center justify-center theme-accent-text">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold tracking-tight">Switch User Profile</h2>
                      <p className="text-xs text-[var(--theme-text-muted)]">
                        Select an active profile to access the workspace, or log in with another account.
                      </p>
                    </div>
                  </div>

                  {/* Profile List */}
                  <div className="space-y-2.5 my-5">
                    {sessions.map((session) => {
                      const isActive =
                        user &&
                        ((user._id && session.user._id && user._id === session.user._id) ||
                          user.email === session.user.email);

                      return (
                        <div
                          key={session.user._id || session.user.email}
                          onClick={() => {
                            switchAccount(session.user._id || session.user.email);
                            navigate('/');
                          }}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group ${
                            isActive
                              ? 'border-indigo-500 bg-indigo-50/15 dark:bg-indigo-950/20 shadow-sm'
                              : 'theme-border hover:theme-surface-alt'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={
                                session.user.avatar ||
                                `https://api.dicebear.com/7.x/bottts/svg?seed=${session.user.email}`
                              }
                              alt={session.user.name}
                              className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 flex-shrink-0"
                            />
                            <div className="min-w-0 text-left">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-[var(--theme-text)] truncate">
                                  {session.user.name}
                                </span>
                                {isActive && (
                                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full theme-btn-primary flex items-center gap-0.5">
                                    <Check className="w-2.5 h-2.5" /> Active
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-[var(--theme-text-muted)] truncate">
                                {session.user.email}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[10px] font-mono capitalize px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[var(--theme-text-muted)]">
                              {session.user.role || 'developer'}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                logout(session.user._id || session.user.email);
                              }}
                              title="Sign out of this profile"
                              className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Switcher Actions */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingAccount(true);
                        setIsSignUp(false);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold theme-btn-primary flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98 transition-all"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Log in to Another Account</span>
                    </button>

                    {isAuthenticated && user && (
                      <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="w-full py-2 px-4 rounded-xl text-xs font-semibold border theme-border hover:theme-surface-alt flex items-center justify-center gap-1.5 transition-colors text-[var(--theme-text)]"
                      >
                        <span>Continue to Workspace as {user.name}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        logoutAll();
                        setIsAddingAccount(true);
                      }}
                      className="w-full py-1.5 text-center text-[11px] text-[var(--theme-text-muted)] hover:text-rose-500 transition-colors"
                    >
                      Sign out of all profiles
                    </button>
                  </div>
                </div>
              ) : (
                /* AUTHENTICATION FORM VIEW */
                <div>
                  {sessions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsAddingAccount(false)}
                      className="inline-flex items-center gap-1.5 text-xs text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] mb-4 font-semibold transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>&larr; Switch Profile ({sessions.length} active sessions)</span>
                    </button>
                  )}

                  {/* Tab Selector */}
                  <div className="flex items-center p-1 rounded-xl theme-surface-alt border theme-border mb-6">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(false);
                        setFormError('');
                      }}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                        !isSignUp
                          ? 'theme-btn-primary shadow-sm'
                          : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
                      }`}
                    >
                      {sessions.length > 0 ? 'Log in Account' : 'Sign In to Workspace'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(true);
                        setFormError('');
                      }}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                        isSignUp
                          ? 'theme-btn-primary shadow-sm'
                          : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
                      }`}
                    >
                      Create New Account
                    </button>
                  </div>

                  {/* Title */}
                  <div className="mb-6">
                    <h2 className="text-xl font-bold tracking-tight">
                      {sessions.length > 0
                        ? isSignUp
                          ? 'Register another account'
                          : 'Sign in to an additional account'
                        : isSignUp
                        ? 'Join your development team'
                        : 'Welcome back, developer'}
                    </h2>
                    <p className="text-xs text-[var(--theme-text-muted)] mt-1">
                      {sessions.length > 0
                        ? 'You can switch between all logged-in profiles anytime from the navigation bar.'
                        : isSignUp
                        ? 'Enter your credentials to register into MongoDB Atlas database.'
                        : 'Log in with your email or pick a 1-click demo account below.'}
                    </p>
                  </div>

              {/* Error Alert */}
              {formError && (
                <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Alex Rivera"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border theme-border theme-surface-alt text-[var(--theme-text)] focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. alex@devtrack.dev"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border theme-border theme-surface-alt text-[var(--theme-text)] focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    {!isSignUp && (
                      <span className="text-[10px] text-[var(--theme-text-muted)]">
                        Demo password: <code className="font-mono">password123</code>
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border theme-border theme-surface-alt text-[var(--theme-text)] focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                {isSignUp && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
                        Team Role
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border theme-border theme-surface-alt text-[var(--theme-text)] focus:outline-none cursor-pointer"
                      >
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
                        Engineering Team
                      </label>
                      <input
                        type="text"
                        value={formData.team}
                        onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                        placeholder="e.g. Frontend Architecture"
                        className="w-full px-3 py-2 text-xs rounded-xl border theme-border theme-surface-alt text-[var(--theme-text)] focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold theme-btn-primary flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{isSignUp ? 'Create Account & Sign In' : 'Sign In to Workspace'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Mobile Quick Demo Links */}
              <div className="mt-6 pt-5 border-t theme-border lg:hidden">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--theme-text-muted)] block mb-2">
                  Or sign in with 1-click demo:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemo('alex@devtrack.dev', 'Alex')}
                    className="p-2 text-xs font-medium rounded-lg border theme-border theme-surface-alt hover:theme-subtle-badge text-center"
                  >
                    Alex Rivera (Lead)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemo('sarah@devtrack.dev', 'Sarah')}
                    className="p-2 text-xs font-medium rounded-lg border theme-border theme-surface-alt hover:theme-subtle-badge text-center"
                  >
                    Sarah Chen (Dev)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-[var(--theme-text-muted)] border-t theme-border theme-header">
        DevTrack Developer Workflow Manager &copy; 2026 &bull; MongoDB Atlas Persistent Cloud Storage
      </footer>
    </div>
  );
}
