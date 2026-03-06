import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const languages = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'km', label: 'ខ្មែរ', flag: '🇰🇭' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
];

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusField, setFocusField] = useState(null);

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('lang', code);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError(t('login.error_required'));
      return;
    }

    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/welcome');
    } catch (err) {
      setError(err.response?.data?.message || t('login.error_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden" style={{ background: dark ? '#0a0a0a' : '#f8fafc' }}>
      {/* Left side - branding panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[55%] relative items-center justify-center overflow-hidden">
        <img src="/banner.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,54,23,0.92) 0%, rgba(0,104,43,0.85) 100%)' }} />
        <div className="relative z-10 max-w-lg px-12">
          <img src="/logoImg.png" alt="Logo" className="w-32 h-32 rounded-3xl shadow-2xl mb-8 object-contain" />
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">{t('app.title')}</h1>
          <p className="text-white/60 text-lg leading-relaxed">{t('login.footer')}</p>
          <div className="flex gap-4 mt-10">
            <div className="flex items-center gap-2 text-white/50">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <span className="text-sm">Secure</span>
            </div>
            <div className="flex items-center gap-2 text-white/50">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <span className="text-sm">Fast</span>
            </div>
            <div className="flex items-center gap-2 text-white/50">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              </div>
              <span className="text-sm">Reliable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - login form */}
      <div className="flex-1 flex flex-col relative" style={{ background: dark ? '#0f172a' : '#ffffff' }}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 sm:px-8 pt-5 sm:pt-6">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <img src="/logoImg.png" alt="Logo" className="w-9 h-9 rounded-lg object-contain" />
            <span className={`text-sm font-semibold ${dark ? 'text-gray-200' : 'text-gray-800'}`}>{t('app.title')}</span>
          </div>
          <div className="hidden lg:block" />

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${dark ? 'bg-gray-800 text-gray-400 hover:text-gray-200' : 'bg-gray-100 text-gray-500 hover:text-gray-700'}`}
            >
              {dark ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
            <div className={`flex rounded-lg overflow-hidden border ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    i18n.language === lang.code
                      ? dark ? 'bg-primary-600 text-white' : 'bg-primary-600 text-white'
                      : dark ? 'bg-gray-800 text-gray-400 hover:text-gray-200' : 'bg-white text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {lang.flag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Form container */}
        <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-8">
          <div className="w-full max-w-sm">
            {/* Header */}
            <div className="mb-8">
              <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
                {t('login.subtitle')}
              </h2>
              <p className={`mt-2 text-sm ${dark ? 'text-gray-500' : 'text-gray-500'}`}>
                {t('login.forgot_password')}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className={`mb-6 px-4 py-3 rounded-xl text-sm flex items-center gap-3 ${dark ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-100 text-red-600'}`}>
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={`block text-sm font-medium mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('login.email')}
                </label>
                <div className={`relative rounded-xl border-2 transition-colors duration-200 ${
                  focusField === 'email'
                    ? 'border-primary-500 shadow-sm shadow-primary-500/10'
                    : dark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <span className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focusField === 'email' ? 'text-primary-500' : dark ? 'text-gray-600' : 'text-gray-400'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    onFocus={() => setFocusField('email')}
                    onBlur={() => setFocusField(null)}
                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-transparent outline-none text-sm ${dark ? 'text-gray-100 placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'}`}
                    placeholder={t('login.email_placeholder')}
                    style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('login.password')}
                </label>
                <div className={`relative rounded-xl border-2 transition-colors duration-200 ${
                  focusField === 'password'
                    ? 'border-primary-500 shadow-sm shadow-primary-500/10'
                    : dark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <span className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focusField === 'password' ? 'text-primary-500' : dark ? 'text-gray-600' : 'text-gray-400'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    onFocus={() => setFocusField('password')}
                    onBlur={() => setFocusField(null)}
                    className={`w-full pl-12 pr-12 py-3.5 rounded-xl bg-transparent outline-none text-sm ${dark ? 'text-gray-100 placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'}`}
                    placeholder={t('login.password_placeholder')}
                    style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${dark ? 'text-gray-600 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/20 hover:shadow-xl hover:shadow-primary-600/30"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('login.loading')}
                  </span>
                ) : t('login.submit')}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-5 sm:px-8 pb-5 sm:pb-6 text-center ${dark ? 'text-gray-600' : 'text-gray-400'}`}>
          <p className="text-xs">{t('login.footer')}</p>
        </div>
      </div>
    </div>
  );
}
