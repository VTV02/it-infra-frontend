import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const statusColors = {
  New: 'bg-primary-100 text-primary-800',
  'In Progress': 'bg-purple-100 text-purple-800',
  Resolved: 'bg-green-100 text-green-800',
  Closed: 'bg-gray-200 text-gray-700',
};

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

const emptyForm = { asset: '', customAsset: '', area: '', customArea: '', description: '', status: 'New' };

export default function IncidentsPage() {
  const { t } = useTranslation();
  const { hasRole } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [assets, setAssets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchData = async () => {
    try {
      const [incRes, assetRes] = await Promise.all([api.get('/incidents'), api.get('/assets')]);
      setIncidents(incRes.data.data);
      setAssets(assetRes.data.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const hasAsset = form.asset === '__other__' ? form.customAsset.trim() : form.asset;
    if (!hasAsset || !form.description) { setError(t('incidents.error_required')); return; }

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
      if (editId) { await api.put(`/incidents/${editId}`, payload); }
      else { await api.post('/incidents', payload); }
      setShowForm(false); setForm(emptyForm); setEditId(null); fetchData();
    } catch (err) { setError(err.response?.data?.message || t('incidents.error_save')); }
  };

  const handleEdit = (inc) => {
    const areaVal = inc.customArea ? '__other__' : (inc.area || '');
    setForm({
      asset: inc.asset?._id || (inc.customAsset ? '__other__' : ''),
      customAsset: inc.customAsset || '',
      area: areaVal,
      customArea: inc.customArea || '',
      description: inc.description,
      status: inc.status,
    });
    setEditId(inc._id); setShowForm(true);
  };

  const handleDelete = (id) => setConfirmDelete(id);
  const doDelete = async () => {
    if (!confirmDelete) return;
    await api.delete(`/incidents/${confirmDelete}`);
    setConfirmDelete(null);
    fetchData();
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h1 className="text-lg md:text-2xl font-bold text-gray-800">{t('incidents.title')}</h1>
        <button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}
          className="px-3 py-1.5 md:px-4 md:py-2 bg-primary-600 text-cream-100 rounded-lg hover:bg-primary-700 transition-colors text-sm md:text-base">
          {t('incidents.new')}
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl md:rounded-xl p-4 md:p-6 w-full md:max-w-lg md:mx-4 max-h-[85vh] overflow-y-auto">
            <h2 className="text-base md:text-xl font-semibold mb-3 md:mb-4">{editId ? t('incidents.edit_title') : t('incidents.new_title')}</h2>
            {error && <p className="mb-2 text-xs md:text-sm text-red-600">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t('incidents.asset')}</label>
                <select value={form.asset} onChange={(e) => setForm({ ...form, asset: e.target.value, customAsset: '' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">{t('incidents.select_asset')}</option>
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
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t('incidents.description')}</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              {editId && hasRole('it_staff', 'admin') && (
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t('incidents.status')}</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    {['New', 'In Progress', 'Resolved', 'Closed'].map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
                  </select>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setError(''); }}
                  className="flex-1 md:flex-none px-4 py-2.5 md:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">{t('incidents.cancel')}</button>
                <button type="submit" className="flex-1 md:flex-none px-4 py-2.5 md:py-2 bg-primary-600 text-cream-100 rounded-lg hover:bg-primary-700 text-sm">
                  {editId ? t('incidents.update') : t('incidents.create')}
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
                <th className="text-left px-6 py-3 font-medium text-gray-500">{t('incidents.asset')}</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">{t('incidents.area')}</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">{t('incidents.description')}</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">{t('incidents.status')}</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">{t('incidents.reported_by')}</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">{t('incidents.date')}</th>
                {hasRole('it_staff', 'admin') && <th className="text-left px-6 py-3 font-medium text-gray-500">{t('incidents.actions')}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {incidents.map((inc) => (
                <tr key={inc._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">
                    {inc.asset ? inc.asset.assetCode : <span className="text-orange-600 italic">{inc.customAsset}</span>}
                  </td>
                  <td className="px-6 py-4">
                    {inc.area ? inc.area : inc.customArea ? <span className="text-orange-600 italic">{inc.customArea}</span> : '—'}
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate">{inc.description}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[inc.status]}`}>
                      {t(`status.${inc.status}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4">{inc.reportedBy?.name}</td>
                  <td className="px-6 py-4 text-gray-500">{new Date(inc.createdAt).toLocaleDateString('vi-VN')}</td>
                  {hasRole('it_staff', 'admin') && (
                    <td className="px-6 py-4">
                      <button onClick={() => handleEdit(inc)} className="text-primary-600 hover:underline mr-3">{t('incidents.edit')}</button>
                      <button onClick={() => handleDelete(inc._id)} className="text-red-600 hover:underline">{t('incidents.delete')}</button>
                    </td>
                  )}
                </tr>
              ))}
              {incidents.length === 0 && (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-400">{t('incidents.no_data')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile card layout */}
      <div className="md:hidden space-y-3">
        {incidents.map((inc) => (
          <div key={inc._id} className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-800 truncate">
                  {inc.asset ? inc.asset.assetCode : <span className="text-orange-600 italic">{inc.customAsset}</span>}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{inc.area || inc.customArea || '—'}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ml-2 ${statusColors[inc.status]}`}>
                {t(`status.${inc.status}`)}
              </span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{inc.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{inc.reportedBy?.name}</span>
              <span>{new Date(inc.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
            {hasRole('it_staff', 'admin') && (
              <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100">
                <button onClick={() => handleEdit(inc)} className="text-primary-600 text-sm font-medium">{t('incidents.edit')}</button>
                <button onClick={() => handleDelete(inc._id)} className="text-red-600 text-sm font-medium">{t('incidents.delete')}</button>
              </div>
            )}
          </div>
        ))}
        {incidents.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">{t('incidents.no_data')}</div>
        )}
      </div>
      <ConfirmModal
        open={!!confirmDelete}
        message={t('incidents.confirm_delete')}
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </Layout>
  );
}
