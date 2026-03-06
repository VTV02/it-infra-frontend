import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import Toast from '../components/Toast';
import api from '../utils/api';

const statusColors = {
  New: 'bg-primary-100 text-primary-800',
  'In Progress': 'bg-purple-100 text-purple-800',
  Resolved: 'bg-green-100 text-green-800',
  Closed: 'bg-gray-200 text-gray-700',
};

export default function StaffManagementPage() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedName, setSelectedName] = useState('');
  const [resetModal, setResetModal] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    api.get('/dashboard/staff-overview')
      .then((res) => setData(res.data.data))
      .catch((err) => setToast({ message: err.message || 'Failed to load staff data', type: 'error' }))
      .finally(() => setLoading(false));
  }, []);

  const handleStaffClick = async (member) => {
    if (selectedStaff === member._id) {
      setSelectedStaff(null);
      setIncidents([]);
      return;
    }
    setSelectedStaff(member._id);
    setSelectedName(member.name);
    setDetailLoading(true);
    try {
      const res = await api.get(`/dashboard/staff/${member._id}/incidents`);
      setIncidents(res.data.data.incidents);
    } catch (err) {
      setToast({ message: err.message || 'Failed to load staff incidents', type: 'error' });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setResetMsg(t('staff.password_min'));
      return;
    }
    try {
      await api.put(`/dashboard/staff/${resetModal._id}/reset-password`, { newPassword });
      setResetMsg(t('staff.password_success'));
      setTimeout(() => { setResetModal(null); setNewPassword(''); setResetMsg(''); }, 1500);
    } catch (err) {
      setResetMsg(err.response?.data?.message || t('staff.password_error'));
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-lg md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">{t('staff.title')}</h1>

      {/* Staff cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
        {data.staff.map((member) => (
          <div
            key={member._id}
            className={`bg-white rounded-xl shadow-sm p-4 md:p-6 transition-all hover:shadow-md ${
              selectedStaff === member._id ? 'ring-2 ring-primary-500 shadow-md' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center cursor-pointer min-w-0" onClick={() => handleStaffClick(member)}>
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary-600 text-cream-100 flex items-center justify-center font-bold text-xs md:text-sm mr-3 shrink-0">
                  {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm md:text-base text-gray-800 truncate">{member.name}</p>
                  <p className="text-xs text-gray-500 truncate">{member.email}</p>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setResetModal(member); setNewPassword(''); setResetMsg(''); }}
                className="text-gray-400 hover:text-primary-600 transition-colors shrink-0 ml-2"
                title={t('staff.reset_password')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 md:gap-3 mt-3 md:mt-4 cursor-pointer" onClick={() => handleStaffClick(member)}>
              <div className="bg-primary-50 rounded-lg p-2 md:p-3 text-center">
                <p className="text-[10px] md:text-xs text-gray-500">{t('staff.reported')}</p>
                <p className="text-lg md:text-xl font-bold text-primary-600">{member.reported}</p>
                <p className="text-[10px] md:text-xs text-orange-500">{member.reportedOpen} {t('staff.open')}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-2 md:p-3 text-center">
                <p className="text-[10px] md:text-xs text-gray-500">{t('staff.assigned')}</p>
                <p className="text-lg md:text-xl font-bold text-green-600">{member.assigned}</p>
                <p className="text-[10px] md:text-xs text-orange-500">{member.assignedOpen} {t('staff.open')}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reset password modal */}
      {resetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl md:rounded-xl p-4 md:p-6 w-full md:max-w-sm md:mx-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-1">{t('staff.reset_password')}</h2>
            <p className="text-xs md:text-sm text-gray-500 mb-4">{resetModal.name} ({resetModal.email})</p>
            {resetMsg && (
              <p className={`mb-3 text-xs md:text-sm ${resetMsg === t('staff.password_success') ? 'text-green-600' : 'text-red-600'}`}>{resetMsg}</p>
            )}
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4"
              placeholder={t('staff.new_password_placeholder')}
            />
            <div className="flex gap-2">
              <button onClick={() => { setResetModal(null); setNewPassword(''); setResetMsg(''); }}
                className="flex-1 md:flex-none px-4 py-2.5 md:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">{t('incidents.cancel')}</button>
              <button onClick={handleResetPassword}
                className="flex-1 md:flex-none px-4 py-2.5 md:py-2 bg-primary-600 text-cream-100 rounded-lg hover:bg-primary-700 text-sm">{t('staff.reset_confirm')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Incident list for selected staff */}
      {selectedStaff && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm md:text-lg font-semibold text-gray-700">
              {t('staff.incidents_of')} {selectedName}
            </h2>
            <button onClick={() => { setSelectedStaff(null); setIncidents([]); }}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
          </div>

          {detailLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-6 py-3 font-medium text-gray-500">{t('incidents.asset')}</th>
                      <th className="text-left px-6 py-3 font-medium text-gray-500">{t('incidents.area')}</th>
                      <th className="text-left px-6 py-3 font-medium text-gray-500">{t('incidents.description')}</th>
                      <th className="text-left px-6 py-3 font-medium text-gray-500">{t('incidents.status')}</th>
                      <th className="text-left px-6 py-3 font-medium text-gray-500">{t('incidents.reported_by')}</th>
                      <th className="text-left px-6 py-3 font-medium text-gray-500">{t('staff.assigned_to')}</th>
                      <th className="text-left px-6 py-3 font-medium text-gray-500">{t('incidents.date')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {incidents.map((inc) => (
                      <tr key={inc._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">
                          {inc.asset ? inc.asset.assetCode : <span className="text-orange-600 italic">{inc.customAsset || '—'}</span>}
                        </td>
                        <td className="px-6 py-4">{inc.area || inc.customArea || '—'}</td>
                        <td className="px-6 py-4 max-w-xs truncate">{inc.description}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[inc.status]}`}>
                            {t(`status.${inc.status}`)}
                          </span>
                        </td>
                        <td className="px-6 py-4">{inc.reportedBy?.name}</td>
                        <td className="px-6 py-4">{inc.assignedTo?.name || <span className="text-gray-400">{t('incidents.unassigned')}</span>}</td>
                        <td className="px-6 py-4 text-gray-500">{new Date(inc.createdAt).toLocaleDateString('vi-VN')}</td>
                      </tr>
                    ))}
                    {incidents.length === 0 && (
                      <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-400">{t('incidents.no_data')}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile card layout */}
              <div className="md:hidden p-3 space-y-3">
                {incidents.map((inc) => (
                  <div key={inc._id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium text-sm text-gray-800 truncate flex-1">
                        {inc.asset ? inc.asset.assetCode : <span className="text-orange-600 italic">{inc.customAsset || '—'}</span>}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ml-2 ${statusColors[inc.status]}`}>
                        {t(`status.${inc.status}`)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-1">{inc.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span>{inc.reportedBy?.name}</span>
                      <span>{new Date(inc.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                ))}
                {incidents.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">{t('incidents.no_data')}</div>
                )}
              </div>
            </>
          )}
        </div>
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  );
}
