import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const predefinedLocations = [
  'XN CHUỐI BP1', 'XN CHUỐI BP2', 'XN CHUỐI BP3', 'XN CHUỐI BP4',
  'XN CHUỐI ER1', 'XN CHUỐI ER2',
  'XN CN BÒ & C.A.T BSA',
  'NÔNG TRƯỜNG SẦU RIÊNG',
  'XN CAO SU',
  'NM SX VẬT TƯ CƠ KHÍ',
  'NM SX VẬT TƯ NÔNG NGHIỆP',
  'NM NƯỚC SINH HOẠT',
  'TRẠI NUÔI CÁ',
  'TRẠI NUÔI CHIM YẾN',
  'VP55',
];

const statusColors = {
  Planned: 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-yellow-100 text-yellow-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const statusMap = { Planned: 'Đã lên kế hoạch', 'In Progress': 'Đang triển khai', Completed: 'Hoàn thành', Cancelled: 'Đã hủy' };

const today = () => new Date().toISOString().split('T')[0];
const emptyForm = { title: '', description: '', location: '', customLocation: '', scheduledDate: today(), status: 'Planned' };

function getWeekRange(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const start = new Date(d);
  start.setDate(d.getDate() + diffToMon);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function getMonthRange(date) {
  const d = new Date(date);
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

function filterPlans(plans, range) {
  return plans.filter((p) => {
    const d = new Date(p.scheduledDate);
    return d >= range.start && d <= range.end;
  });
}

function exportToExcel(data, filename, t) {
  const rows = data.map((p, i) => ({
    [t('deployment.stt')]: i + 1,
    [t('deployment.deploy_title')]: p.title,
    [t('deployment.description')]: p.description || '',
    [t('deployment.location')]: p.location || p.customLocation || '',
    [t('deployment.scheduled_date')]: new Date(p.scheduledDate).toLocaleDateString('vi-VN'),
    [t('deployment.status')]: statusMap[p.status] || p.status,
    [t('deployment.created_by')]: p.createdBy?.name || '',
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const colWidths = [5, 30, 40, 25, 15, 18, 20];
  ws['!cols'] = colWidths.map((w) => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Deployment Plans');
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), filename);
}

export default function DeploymentPlanPage() {
  const { t } = useTranslation();
  const { hasRole } = useAuth();
  const [plans, setPlans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const [exportType, setExportType] = useState('week');
  const [exportDate, setExportDate] = useState(today());

  const fetchData = async () => {
    const res = await api.get('/deployment-plans');
    setPlans(res.data.data);
  };
  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    const location = form.location === '__other__' ? form.customLocation.trim() : form.location;
    if (!form.title || !location || !form.scheduledDate) {
      setError(t('deployment.error_required'));
      return;
    }
    const payload = {
      title: form.title,
      description: form.description,
      location: form.location === '__other__' ? '' : form.location,
      customLocation: form.location === '__other__' ? form.customLocation.trim() : '',
      scheduledDate: form.scheduledDate,
      status: form.status,
    };
    try {
      if (editId) { await api.put(`/deployment-plans/${editId}`, payload); }
      else { await api.post('/deployment-plans', payload); }
      setShowForm(false); setForm(emptyForm); setEditId(null); fetchData();
    } catch (err) { setError(err.response?.data?.message || t('deployment.error_save')); }
  };

  const handleEdit = (plan) => {
    const locationVal = plan.customLocation ? '__other__' : (plan.location || '');
    setForm({
      title: plan.title,
      description: plan.description || '',
      location: locationVal,
      customLocation: plan.customLocation || '',
      scheduledDate: plan.scheduledDate ? plan.scheduledDate.split('T')[0] : '',
      status: plan.status,
    });
    setEditId(plan._id); setShowForm(true);
  };

  const handleDelete = (id) => setConfirmDelete(id);
  const doDelete = async () => {
    if (!confirmDelete) return;
    await api.delete(`/deployment-plans/${confirmDelete}`);
    setConfirmDelete(null);
    fetchData();
  };

  const handleExport = () => {
    const range = exportType === 'week' ? getWeekRange(exportDate) : getMonthRange(exportDate);
    const filtered = filterPlans(plans, range);
    const rangeLabel = exportType === 'week'
      ? `${range.start.toLocaleDateString('vi-VN')}_${range.end.toLocaleDateString('vi-VN')}`
      : `Thang_${new Date(exportDate).getMonth() + 1}_${new Date(exportDate).getFullYear()}`;
    const filename = `KH_TrienKhai_${rangeLabel}.xlsx`;
    exportToExcel(filtered, filename, t);
    setShowExport(false);
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4 md:mb-6 gap-2">
        <h1 className="text-lg md:text-2xl font-bold text-gray-800 truncate">{t('deployment.title')}</h1>
        <div className="flex gap-1.5 md:gap-2 shrink-0">
          <button onClick={() => { setExportDate(today()); setShowExport(true); }}
            className="px-2.5 md:px-4 py-1.5 md:py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors flex items-center gap-1.5 text-xs md:text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden md:inline">{t('deployment.export')}</span>
          </button>
          {hasRole('it_staff', 'admin') && (
            <button onClick={() => { setForm({ ...emptyForm, scheduledDate: today() }); setEditId(null); setShowForm(true); }}
              className="px-2.5 md:px-4 py-1.5 md:py-2 bg-primary-600 text-cream-100 rounded-lg hover:bg-primary-700 transition-colors text-xs md:text-sm whitespace-nowrap">
              {t('deployment.new')}
            </button>
          )}
        </div>
      </div>

      {/* Export modal */}
      {showExport && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl md:rounded-xl p-4 md:p-6 w-full md:max-w-sm md:mx-4">
            <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4">{t('deployment.export_title')}</h2>
            <div className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t('deployment.export_type')}</label>
                <div className="flex gap-2">
                  <button onClick={() => setExportType('week')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${exportType === 'week' ? 'bg-primary-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                    {t('deployment.export_week')}
                  </button>
                  <button onClick={() => setExportType('month')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${exportType === 'month' ? 'bg-primary-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                    {t('deployment.export_month')}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  {exportType === 'week' ? t('deployment.export_select_week') : t('deployment.export_select_month')}
                </label>
                {exportType === 'week' ? (
                  <input type="date" value={exportDate} onChange={(e) => setExportDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                ) : (
                  <input type="month" value={exportDate.substring(0, 7)} onChange={(e) => setExportDate(e.target.value + '-01')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                )}
                {exportType === 'week' && exportDate && (
                  <p className="text-xs text-gray-400 mt-1">
                    {(() => { const r = getWeekRange(exportDate); return `${r.start.toLocaleDateString('vi-VN')} - ${r.end.toLocaleDateString('vi-VN')}`; })()}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  {t('deployment.export_count')}: <strong>{filterPlans(plans, exportType === 'week' ? getWeekRange(exportDate) : getMonthRange(exportDate)).length}</strong>
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowExport(false)}
                  className="flex-1 md:flex-none px-4 py-2.5 md:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">{t('deployment.cancel')}</button>
                <button onClick={handleExport}
                  className="flex-1 md:flex-none px-4 py-2.5 md:py-2 bg-primary-600 text-cream-100 rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {t('deployment.export_download')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl md:rounded-xl p-4 md:p-6 w-full md:max-w-lg md:mx-4 max-h-[85vh] overflow-y-auto">
            <h2 className="text-base md:text-xl font-semibold mb-3 md:mb-4">{editId ? t('deployment.edit_title') : t('deployment.new_title')}</h2>
            {error && <p className="mb-2 text-xs md:text-sm text-red-600">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t('deployment.deploy_title')}</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder={t('deployment.title_placeholder')} />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t('deployment.description')}</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder={t('deployment.description_placeholder')} />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t('deployment.location')}</label>
                <select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value, customLocation: '' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">{t('deployment.select_location')}</option>
                  {predefinedLocations.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                  <option value="__other__">--- {t('incidents.other')} ---</option>
                </select>
                {form.location === '__other__' && (
                  <input value={form.customLocation} onChange={(e) => setForm({ ...form, customLocation: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-2"
                    placeholder={t('deployment.custom_location_placeholder')} />
                )}
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t('deployment.scheduled_date')}</label>
                <input type="date" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              {editId && (
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t('deployment.status')}</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option value="Planned">{t('deployment_status.Planned')}</option>
                    <option value="In Progress">{t('deployment_status.In Progress')}</option>
                    <option value="Completed">{t('deployment_status.Completed')}</option>
                    <option value="Cancelled">{t('deployment_status.Cancelled')}</option>
                  </select>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setError(''); }}
                  className="flex-1 md:flex-none px-4 py-2.5 md:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">{t('deployment.cancel')}</button>
                <button type="submit" className="flex-1 md:flex-none px-4 py-2.5 md:py-2 bg-primary-600 text-cream-100 rounded-lg hover:bg-primary-700 text-sm">
                  {editId ? t('deployment.update') : t('deployment.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-500">{t('deployment.deploy_title')}</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">{t('deployment.location')}</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">{t('deployment.scheduled_date')}</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">{t('deployment.status')}</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">{t('deployment.created_by')}</th>
                {hasRole('it_staff', 'admin') && <th className="text-left px-6 py-3 font-medium text-gray-500">{t('deployment.actions')}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {plans.map((plan) => (
                <tr key={plan._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">
                    <div>{plan.title}</div>
                    {plan.description && <div className="text-xs text-gray-400 mt-0.5">{plan.description}</div>}
                  </td>
                  <td className="px-6 py-4">
                    {plan.location || (plan.customLocation ? <span className="text-orange-600 italic">{plan.customLocation}</span> : '—')}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{new Date(plan.scheduledDate).toLocaleDateString('vi-VN')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[plan.status] || ''}`}>
                      {t(`deployment_status.${plan.status}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{plan.createdBy?.name}</td>
                  {hasRole('it_staff', 'admin') && (
                    <td className="px-6 py-4">
                      <button onClick={() => handleEdit(plan)} className="text-primary-600 hover:underline mr-3">{t('deployment.edit')}</button>
                      <button onClick={() => handleDelete(plan._id)} className="text-red-600 hover:underline">{t('deployment.delete')}</button>
                    </td>
                  )}
                </tr>
              ))}
              {plans.length === 0 && (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400">{t('deployment.no_data')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile card layout */}
      <div className="md:hidden space-y-3">
        {plans.map((plan) => (
          <div key={plan._id} className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-800">{plan.title}</p>
                {plan.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{plan.description}</p>}
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ml-2 ${statusColors[plan.status] || ''}`}>
                {t(`deployment_status.${plan.status}`)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-500 mb-2">
              <div><span className="text-gray-400">{t('deployment.location')}:</span> {plan.location || plan.customLocation || '—'}</div>
              <div><span className="text-gray-400">{t('deployment.scheduled_date')}:</span> {new Date(plan.scheduledDate).toLocaleDateString('vi-VN')}</div>
            </div>
            <div className="text-xs text-gray-400">{plan.createdBy?.name}</div>
            {hasRole('it_staff', 'admin') && (
              <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100">
                <button onClick={() => handleEdit(plan)} className="text-primary-600 text-sm font-medium">{t('deployment.edit')}</button>
                <button onClick={() => handleDelete(plan._id)} className="text-red-600 text-sm font-medium">{t('deployment.delete')}</button>
              </div>
            )}
          </div>
        ))}
        {plans.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">{t('deployment.no_data')}</div>
        )}
      </div>
      <ConfirmModal
        open={!!confirmDelete}
        message={t('deployment.confirm_delete')}
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </Layout>
  );
}
