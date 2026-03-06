import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      {/* Main content: full width on mobile, offset by sidebar on desktop */}
      <div className={`flex-1 flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-16'}`}>
        <main className="flex-1 p-4 sm:p-8 pt-[72px] md:pt-8 pb-20 md:pb-8">
          {children}
        </main>
        <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 sm:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700 dark:text-gray-300">{t('footer.department')}</span>
              <span className="hidden sm:inline">|</span>
              <span>{t('footer.company')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{t('footer.developed_by')} <span className="font-medium text-gray-700 dark:text-gray-300">{t('footer.author')}</span></span>
              <span className="hidden sm:inline">–</span>
              <span className="hidden sm:inline">{t('footer.role')}</span>
            </div>
            <div className="text-gray-400 dark:text-gray-500">
              © {new Date().getFullYear()} {t('footer.rights')}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
