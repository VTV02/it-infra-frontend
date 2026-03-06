import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const predefinedAreas = [
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

const emptyForm = { asset: '', customAsset: '', area: '', customArea: '', content: '', date: '' };

export default function MaintenancePage() {
  const { t } = useTranslation();
  const { hasRole } = useAuth();
  const [records, setRecords] = useState([]);
  const [assets, setAssets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchData = async () => {
    const [mRes, aRes] = await Promise.all([api.get('/maintenance'), api.get('/assets')]);
    setRecords(mRes.data.data); setAssets(aRes.data.data);
  };
  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    const hasAsset = form.asset && form.asset !== '__other__';
    const hasCustomAsset = form.asset === '__other__' && form.customAsset.trim();
    if ((!hasAsset && !hasCustomAsset) || !form.content) { setError(t('maintenance.error_required')); return; }
    const payload = { ...form };
    if (form.asset === '__other__') {
      payload.asset = undefined;
      payload.customAsset = form.customAsset.trim();
    } else {
      payload.customAsset = undefined;
    }
    if (form.area === '__other__') {
      payload.area = undefined;
      payload.customArea = form.customArea.trim();
    } else {
      payload.customArea = undefined;
    }
    try {
      if (editId) { await api.put(`/maintenance/${editId}`, payload); }
      else { await api.post('/maintenance', payload); }
      setShowForm(false); setForm(emptyForm); setEditId(null); fetchData();
    } catch (err) { setError(err.response?.data?.message || t('maintenance.error_save')); }
  };

  const handleEdit = (rec) => {
    const areaVal = rec.customArea ? '__other__' : (rec.area || '');
    const assetVal = rec.customAsset ? '__other__' : (rec.asset?._id || '');
    setForm({ asset: assetVal, customAsset: rec.customAsset || '', area: areaVal, customArea: rec.customArea || '', content: rec.content, date: rec.date ? rec.date.split('T')[0] : '' });
    setEditId(rec._id); setShowForm(true);
  };

  const handleDelete = (id) => setConfirmDelete(id);
  const doDelete = async () => {
    if (!confirmDelete) return;
    await api.delete(`/maintenance/${confirmDelete}`);
    setConfirmDelete(null);
    fetchData();
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h1 className="text-lg md:text-2xl font-bold text-gray-800">{t('maintenance.title')}</h1>
        {hasRole('it_staff', 'admin') && (
          <button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}
            className="px-3 py-1.5 md:px-4 md:py-2 bg-primary-600 text-cream-100 rounded-lg hover:bg-primary-700 transition-colors text-sm md:text-base">
            {t('maintenance.new')}
          </button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl md:rounded-xl p-4 md:p-6 w-full md:max-w-lg md:mx-4 max-h-[85vh] overflow-y-auto">
            <h2 className="text-base md:text-xl font-semibold mb-3 md:mb-4">{editId ? t('maintenance.edit_title') : t('maintenance.new_title')}</h2>
            {error && <p className="mb-2 text-xs md:text-sm text-red-600">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t('maintenance.asset')}</label>
                <select value={form.asset} onChange={(e) => setForm({ ...form, asset: e.target.value, customAsset: '' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">{t('maintenance.select_asset')}</option>
                  {assets.map((a) => <option key={a._id} value={a._id}>{a.assetCode} - {a.name}</option>)}
                  <option value="__other__">--- {t('incidents.other')} ---</option>
                </select>
                {form.asset === '__other__' && (
                  <input value={form.customAsset} onChange={(e) => setForm({ ...form, customAsset: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-2"
                    placeholder={t('incidents.custom_asset_placeholder')} />
                )}
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t('incidents.area')}</label>
                <select value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value, customArea: '' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">{t('incidents.select_area')}</option>
                  {predefinedAreas.map((a) => <option key={a} value={a}>{a}</option>)}
                  <option value="__other__">--- {t('incidents.other')} ---</option>
                </select>
                {form.area === '__other__' && (
                  <input value={form.customArea} onChange={(e) => setForm({ ...form, customArea: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-2"
                    placeholder={t('incidents.custom_area_placeholder')} />
                )}
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t('maintenance.content')}</label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder={t('maintenance.content_placeholder')} />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t('maintenance.date')}</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setError(''); }}
                  className="flex-1 md:flex-none px-4 py-2.5 md:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">{t('maintenance.cancel')}</button>
                <button type="submit" className="flex-1 md:flex-none px-4 py-2.5 md:py-2 bg-primary-600 text-cream-100 rounded-lg hover:bg-primary-700 text-sm">
                  {editId ? t('maintenance.update') : t('maintenance.create')}
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
                <th className="text-left px-6 py-3 font-medium text-gray-500">{t('maintenance.asset')}</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">{t('incidents.area')}</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">{t('maintenance.content')}</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">{t('maintenance.performed_by')}</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">{t('maintenance.date')}</th>
                {hasRole('it_staff', 'admin') && <th className="text-left px-6 py-3 font-medium text-gray-500">{t('maintenance.actions')}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((rec) => (
                <tr key={rec._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">
                    {rec.asset ? `${rec.asset.assetCode} - ${rec.asset.name}` : rec.customAsset ? <span className="text-orange-600 italic">{rec.customAsset}</span> : '—'}
                  </td>
                  <td className="px-6 py-4">
                    {rec.area ? rec.area : rec.customArea ? <span className="text-orange-600 italic">{rec.customArea}</span> : '—'}
                  </td>
                  <td className="px-6 py-4">{rec.content}</td>
                  <td className="px-6 py-4">{rec.performedBy?.name}</td>
                  <td className="px-6 py-4 text-gray-500">{new Date(rec.date).toLocaleDateString('vi-VN')}</td>
                  {hasRole('it_staff', 'admin') && (
                    <td className="px-6 py-4">
                      <button onClick={() => handleEdit(rec)} className="text-primary-600 hover:underline mr-3">{t('maintenance.edit')}</button>
                      <button onClick={() => handleDelete(rec._id)} className="text-red-600 hover:underline">{t('maintenance.delete')}</button>
                    </td>
                  )}
                </tr>
              ))}
              {records.length === 0 && (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400">{t('maintenance.no_data')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile card layout */}
      <div className="md:hidden space-y-3">
        {records.map((rec) => (
          <div key={rec._id} className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex-1 min-w-0 mb-2">
              <p className="font-medium text-sm text-gray-800 truncate">
                {rec.asset ? `${rec.asset.assetCode} - ${rec.asset.name}` : rec.customAsset ? <span className="text-orange-600 italic">{rec.customAsset}</span> : '—'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{rec.area || rec.customArea || '—'}</p>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{rec.content}</p>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{rec.performedBy?.name}</span>
              <span>{new Date(rec.date).toLocaleDateString('vi-VN')}</span>
            </div>
            {hasRole('it_staff', 'admin') && (
              <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100">
                <button onClick={() => handleEdit(rec)} className="text-primary-600 text-sm font-medium">{t('maintenance.edit')}</button>
                <button onClick={() => handleDelete(rec._id)} className="text-red-600 text-sm font-medium">{t('maintenance.delete')}</button>
              </div>
            )}
          </div>
        ))}
        {records.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">{t('maintenance.no_data')}</div>
        )}
      </div>
      <ConfirmModal
        open={!!confirmDelete}
        message={t('maintenance.confirm_delete')}
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </Layout>
  );
}
