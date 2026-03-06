import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';

const languages = [
  { code: 'vi', label: 'Tieng Viet', flag: '🇻🇳' },
  { code: 'km', label: 'ភាសាខ្មែរ', flag: '🇰🇭' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

const navItems = [
  { path: '/dashboard', key: 'dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4', roles: null },
  { path: '/incidents', key: 'incidents', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z', roles: null },
  { path: '/assets', key: 'assets', icon: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2', roles: ['it_staff', 'admin'] },
  { path: '/maintenance', key: 'maintenance', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', roles: ['it_staff', 'admin'] },
  { path: '/reports', key: 'reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', roles: ['manager', 'admin'] },
  { path: '/deployment-plans', key: 'deployment', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', roles: ['it_staff', 'admin'] },
  { path: '/staff', key: 'staff', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', roles: ['admin'] },
];

// Sun icon for light mode
const SunIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

// Moon icon for dark mode
const MoonIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

export default function Sidebar({ open, onToggle }) {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('lang', code);
  };

  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role)
  );

  const mobileMainItems = visibleItems.slice(0, 4);
  const mobileMoreItems = visibleItems.slice(4);
  const hasMore = mobileMoreItems.length > 0;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden md:flex fixed inset-y-0 left-0 bg-primary-900 text-white flex-col transition-all duration-300 z-20 ${open ? 'w-64' : 'w-16'}`}>
        <button
          onClick={onToggle}
          className="absolute -right-3 top-7 w-6 h-6 bg-primary-600 hover:bg-primary-500 text-cream-100 rounded-full flex items-center justify-center shadow-md transition-colors z-30"
        >
          <svg className={`w-4 h-4 transition-transform duration-300 ${open ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="p-6 border-b border-primary-700 overflow-hidden">
          {open ? (
            <>
              <h1 className="text-lg font-bold leading-tight text-cream-100 whitespace-nowrap">{t('app.title')}</h1>
              <p className="text-sm text-cream-100/60 mt-1 whitespace-nowrap">{user?.name}</p>
              {user?.role === 'admin' && (
                <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded bg-primary-600 text-cream-100">
                  {t(`roles.${user?.role}`)}
                </span>
              )}
            </>
          ) : (
            <div className="flex justify-center -mx-2">
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-cream-100 text-sm font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={!open ? t(`sidebar.${item.key}`) : undefined}
              className={({ isActive }) =>
                `flex items-center ${open ? 'px-4' : 'justify-center px-2'} py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-primary-600 text-cream-100' : 'text-cream-100/70 hover:bg-primary-800'
                }`
              }
            >
              <svg className={`w-5 h-5 shrink-0 ${open ? 'mr-3' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {open && <span className="whitespace-nowrap">{t(`sidebar.${item.key}`)}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Dark mode toggle */}
        <div className={`px-2 py-2 border-t border-primary-700 ${open ? '' : 'flex justify-center'}`}>
          <button
            onClick={toggleTheme}
            title={dark ? 'Light mode' : 'Dark mode'}
            className={`flex items-center ${open ? 'w-full px-4' : 'justify-center px-2'} py-2.5 rounded-lg text-cream-100/70 hover:bg-primary-800 transition-colors`}
          >
            {dark ? <SunIcon /> : <MoonIcon />}
            {open && <span className="ml-3 text-sm whitespace-nowrap">{dark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
        </div>

        {/* Language switcher */}
        {open && (
          <div className="px-4 py-3 border-t border-primary-700">
            <p className="text-xs text-cream-100/40 uppercase mb-2 px-2">{t('sidebar.language')}</p>
            <div className="flex gap-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                    i18n.language === lang.code
                      ? 'bg-primary-600 text-cream-100'
                      : 'text-cream-100/50 hover:bg-primary-800'
                  }`}
                  title={lang.label}
                >
                  {lang.flag} {lang.code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-2 border-t border-primary-700">
          <button
            onClick={handleLogout}
            title={!open ? t('sidebar.logout') : undefined}
            className={`w-full flex items-center ${open ? 'px-4' : 'justify-center px-2'} py-3 text-cream-100/70 hover:bg-primary-800 rounded-lg transition-colors`}
          >
            <svg className={`w-5 h-5 shrink-0 ${open ? 'mr-3' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {open && <span className="whitespace-nowrap">{t('sidebar.logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Mobile top header bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-primary-900 dark:bg-gray-900 text-white flex items-center justify-between px-4 z-30">
        <h1 className="text-sm font-bold text-cream-100 truncate">{t('app.title')}</h1>
        <div className="flex items-center gap-2">
          {/* Dark mode toggle */}
          <button onClick={toggleTheme} className="w-8 h-8 rounded-lg flex items-center justify-center text-cream-100/70 hover:bg-primary-800">
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
          {/* Language quick switch */}
          <div className="flex gap-0.5">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-7 h-7 rounded flex items-center justify-center text-xs ${
                  i18n.language === lang.code ? 'bg-primary-600' : 'text-cream-100/50'
                }`}
              >
                {lang.flag}
              </button>
            ))}
          </div>
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-cream-100 text-xs font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-30 safe-bottom">
        <div className="flex items-stretch">
          {mobileMainItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex-1 flex flex-col items-center justify-center py-2 ${
                  isActive ? 'text-primary-600' : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className="text-[10px] mt-0.5 leading-tight">{t(`sidebar.${item.key}`)}</span>
              </NavLink>
            );
          })}
          {hasMore ? (
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`flex-1 flex flex-col items-center justify-center py-2 ${
                showMobileMenu || mobileMoreItems.some(i => location.pathname === i.path) ? 'text-primary-600' : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="text-[10px] mt-0.5 leading-tight">Menu</span>
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="flex-1 flex flex-col items-center justify-center py-2 text-gray-400 dark:text-gray-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-[10px] mt-0.5 leading-tight">{t('sidebar.logout')}</span>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile "More" menu overlay */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setShowMobileMenu(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute bottom-16 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl shadow-xl p-4 space-y-1" onClick={(e) => e.stopPropagation()}>
            {mobileMoreItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center px-4 py-3 rounded-lg ${
                    isActive ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600' : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <span className="text-sm font-medium">{t(`sidebar.${item.key}`)}</span>
                </NavLink>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-3 rounded-lg text-red-500 w-full"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm font-medium">{t('sidebar.logout')}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
