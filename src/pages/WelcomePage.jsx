import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function WelcomePage() {
  const { t } = useTranslation();
  const { dark } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [installing, setInstalling] = useState(false);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    setShowInstallModal(true);
  };

  const handleConfirmInstall = async () => {
    if (deferredPrompt) {
      setInstalling(true);
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowInstallModal(false);
      }
      setDeferredPrompt(null);
      setInstalling(false);
    }
  };

  const handleGoWeb = () => {
    navigate('/dashboard');
  };

  const cardStyle = {
    background: dark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    borderColor: dark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(255, 255, 255, 0.3)',
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6 relative overflow-hidden" style={{ background: dark ? '#0a0a0a' : '#003617' }}>
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img src="/banner.jpg" alt="" className={`w-full h-full object-cover ${dark ? 'opacity-30' : ''}`} />
        <div className="absolute inset-0" style={{ background: dark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 54, 23, 0.5)' }} />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="/logoImg.png" alt="Logo" className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl shadow-xl object-contain" />
        </div>

        {/* Welcome text */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {t('welcome.hello')}{user?.name ? `, ${user.name}` : ''}!
          </h1>
          <p className="text-white/60 text-sm sm:text-base">{t('welcome.subtitle')}</p>
        </div>

        {/* Choice cards */}
        <div className="space-y-4">
          {/* Download App */}
          <button
            onClick={handleInstallClick}
            disabled={isInstalled}
            className="w-full backdrop-blur-xl rounded-2xl shadow-xl p-5 border text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
            style={cardStyle}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isInstalled ? 'bg-green-500' : 'bg-primary-600'}`}>
                {isInstalled ? (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold text-base ${dark ? 'text-gray-100' : 'text-gray-800'}`}>
                  {isInstalled ? t('welcome.app_installed') : t('welcome.download_app')}
                </h3>
                <p className={`text-sm mt-0.5 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {isInstalled ? t('welcome.app_installed_desc') : t('welcome.download_desc')}
                </p>
              </div>
              {!isInstalled && (
                <svg className={`w-5 h-5 shrink-0 ${dark ? 'text-gray-500' : 'text-gray-400'} group-hover:text-primary-600 transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
            </div>
          </button>

          {/* Go to Web */}
          <button
            onClick={handleGoWeb}
            className="w-full backdrop-blur-xl rounded-2xl shadow-xl p-5 border text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group"
            style={cardStyle}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold text-base ${dark ? 'text-gray-100' : 'text-gray-800'}`}>
                  {t('welcome.go_web')}
                </h3>
                <p className={`text-sm mt-0.5 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('welcome.go_web_desc')}
                </p>
              </div>
              <svg className={`w-5 h-5 shrink-0 ${dark ? 'text-gray-500' : 'text-gray-400'} group-hover:text-primary-600 transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

        <p className="text-center text-xs mt-8 text-white/30">{t('login.footer')}</p>
      </div>

      {/* Install Modal - Bottom Sheet */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowInstallModal(false)} />
          <div
            className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 pb-8 sm:pb-6 animate-slide-up"
            style={{
              background: dark ? '#1f2937' : '#ffffff',
            }}
          >
            {/* Handle bar (mobile) */}
            <div className="flex justify-center mb-4 sm:hidden">
              <div className={`w-10 h-1 rounded-full ${dark ? 'bg-gray-600' : 'bg-gray-300'}`} />
            </div>

            {/* App preview */}
            <div className="flex flex-col items-center text-center mb-6">
              <img src="/logoImg.png" alt="App" className="w-20 h-20 rounded-2xl shadow-lg mb-4 object-contain" />
              <h2 className={`text-lg font-bold ${dark ? 'text-gray-100' : 'text-gray-800'}`}>
                {t('welcome.install_title')}
              </h2>
              <p className={`text-sm mt-2 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('welcome.install_desc')}
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-3 mb-6">
              {['install_benefit_1', 'install_benefit_2', 'install_benefit_3'].map((key) => (
                <div key={key} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-600/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}>{t(`welcome.${key}`)}</span>
                </div>
              ))}
            </div>

            {/* Manual instructions when no native prompt available */}
            {!deferredPrompt && (
              <div className={`rounded-xl p-4 mb-4 ${dark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className={`text-sm font-medium mb-2 ${dark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {isIOS ? t('welcome.ios_title') : t('welcome.chrome_title')}
                </p>
                <div className="space-y-2">
                  {isIOS ? (
                    <>
                      <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                        1. {t('welcome.ios_step1')}
                      </p>
                      <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                        2. {t('welcome.ios_step2')}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                        1. {t('welcome.chrome_step1')}
                      </p>
                      <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                        2. {t('welcome.chrome_step2')}
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowInstallModal(false)}
                className={`flex-1 py-3 rounded-xl font-medium text-sm transition-colors ${dark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {t('welcome.later')}
              </button>
              <button
                onClick={deferredPrompt ? handleConfirmInstall : () => setShowInstallModal(false)}
                disabled={installing}
                className="flex-1 py-3 rounded-xl font-semibold text-sm bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {installing ? t('welcome.installing') : deferredPrompt ? t('welcome.install_now') : t('welcome.understood')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
