import { useTranslation } from 'react-i18next';

export default function ConfirmModal({ open, message, onConfirm, onCancel, danger = true }) {
  const { t } = useTranslation();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 bg-white dark:bg-gray-800 shadow-xl animate-slide-up">
        <div className="flex justify-center mb-4 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        <div className="flex items-start gap-3 mb-5">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${danger ? 'bg-red-100 dark:bg-red-500/15' : 'bg-primary-100 dark:bg-primary-500/15'}`}>
            {danger ? (
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm sm:text-base">{t('confirm.title')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{message}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {t('confirm.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            {t('confirm.ok')}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.25s ease-out; }
      `}</style>
    </div>
  );
}
