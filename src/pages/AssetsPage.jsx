import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const statusColors = {
  Good: 'bg-green-100 text-green-800',
  Warning: 'bg-yellow-100 text-yellow-800',
  Broken: 'bg-red-100 text-red-800',
};

const emptyForm = { assetCode: '', name: '', type: 'Router', location: '', status: 'Good', installedDate: '' };

export default function AssetsPage() {
  const { t } = useTranslation();
  const { hasRole } = useAuth();
  const [assets, setAssets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchAssets = async () => { const res = await api.get('/assets'); setAssets(res.data.data); };
  useEffect(() => { fetchAssets(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!form.assetCode || !form.name || !form.location) { setError(t('assets.error_required')); return; }
    try {
      if (editId) { await api.put(`/assets/${editId}`, form); }
      else { await api.post('/assets', form); }
      setShowForm(false); setForm(emptyForm); setEditId(null); fetchAssets();
    } catch (err) { setError(err.response?.data?.message || t('assets.error_save')); }
  };

  const handleEdit = (asset) => {
    setForm({ assetCode: asset.assetCode, name: asset.name, type: asset.type, location: asset.location, status: asset.status, installedDate: asset.installedDate ? asset.installedDate.split('T')[0] : '' });
    setEditId(asset._id); setShowForm(true);
  };

  const handleDelete = (id) => setConfirmDelete(id);
  const doDelete = async () => {
    if (!confirmDelete) return;
    await api.delete(`/assets/${confirmDelete}`);
    setConfirmDelete(null);
    fetchAssets();
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h1 className="text-lg md:text-2xl font-bold text-gray-800">{t('assets.title')}</h1>
        {hasRole('it_staff', 'admin') && (
          <button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}
            className="px-3 py-1.5 md:px-4 md:py-2 bg-primary-600 text-cream-100 rounded-lg hover:bg-primary-700 transition-colors text-sm md:text-base">
            {t('assets.new')}
          </button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl md:rounded-xl p-4 md:p-6 w-full md:max-w-lg md:mx-4 max-h-[85vh] overflow-y-auto">
            <h2 className="text-base md:text-xl font-semibold mb-3 md:mb-4">{editId ? t('assets.edit_title') : t('assets.new_title')}</h2>
            {error && <p className="mb-2 text-xs md:text-sm text-red-600">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t('assets.code')}</label>
                  <input value={form.assetCode} onChange={(e) => setForm({ ...form, assetCode: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="RTR-001" />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t('assets.name')}</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t('assets.type')}</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    {['Router', 'Switch', 'Firewall', 'UPS', 'Camera'].map((tp) => (
                      <option key={tp} value={tp}>{t(`asset_type.${tp}`)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t('assets.status')}</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    {['Good', 'Warning', 'Broken'].map((s) => (
                      <option key={s} value={s}>{t(`status.${s}`)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t('assets.location')}</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t('assets.installed')}</label>
                <input type="date" value={form.installedDate} onChange={(e) => setForm({ ...form, installedDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setError(''); }}
                  className="flex-1 md:flex-none px-4 py-2.5 md:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">{t('assets.cancel')}</button>
                <button type="submit" className="flex-1 md:flex-none px-4 py-2.5 md:py-2 bg-primary-600 text-cream-100 rounded-lg hover:bg-primary-700 text-sm">
                  {editId ? t('assets.update') : t('assets.create')}
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
                <th className="text-left px-6 py-3 font-medium text-gray-500">{t('assets.code')}</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">{t('assets.name')}</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">{t('assets.type')}</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">{t('assets.location')}</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">{t('assets.status')}</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">{t('assets.installed')}</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">{t('assets.last_maintenance')}</th>
                {hasRole('it_staff', 'admin') && <th className="text-left px-6 py-3 font-medium text-gray-500">{t('assets.actions')}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assets.map((asset) => (
                <tr key={asset._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{asset.assetCode}</td>
                  <td className="px-6 py-4">{asset.name}</td>
                  <td className="px-6 py-4">{t(`asset_type.${asset.type}`)}</td>
                  <td className="px-6 py-4">{asset.location}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[asset.status]}`}>
                      {t(`status.${asset.status}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{asset.installedDate ? new Date(asset.installedDate).toLocaleDateString('vi-VN') : '—'}</td>
                  <td className="px-6 py-4 text-gray-500">{asset.lastMaintenance ? new Date(asset.lastMaintenance).toLocaleDateString('vi-VN') : '—'}</td>
                  {hasRole('it_staff', 'admin') && (
                    <td className="px-6 py-4">
                      <button onClick={() => handleEdit(asset)} className="text-primary-600 hover:underline mr-3">{t('assets.edit')}</button>
                      {hasRole('admin') && <button onClick={() => handleDelete(asset._id)} className="text-red-600 hover:underline">{t('assets.delete')}</button>}
                    </td>
                  )}
                </tr>
              ))}
              {assets.length === 0 && (
                <tr><td colSpan="8" className="px-6 py-8 text-center text-gray-400">{t('assets.no_data')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile card layout */}
      <div className="md:hidden space-y-3">
        {assets.map((asset) => (
          <div key={asset._id} className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-800">{asset.assetCode}</p>
                <p className="text-xs text-gray-500 mt-0.5">{asset.name}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ml-2 ${statusColors[asset.status]}`}>
                {t(`status.${asset.status}`)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-500 mb-2">
              <div><span className="text-gray-400">{t('assets.type')}:</span> {t(`asset_type.${asset.type}`)}</div>
              <div><span className="text-gray-400">{t('assets.location')}:</span> {asset.location}</div>
              <div><span className="text-gray-400">{t('assets.installed')}:</span> {asset.installedDate ? new Date(asset.installedDate).toLocaleDateString('vi-VN') : '—'}</div>
              <div><span className="text-gray-400">{t('assets.last_maintenance')}:</span> {asset.lastMaintenance ? new Date(asset.lastMaintenance).toLocaleDateString('vi-VN') : '—'}</div>
            </div>
            {hasRole('it_staff', 'admin') && (
              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button onClick={() => handleEdit(asset)} className="text-primary-600 text-sm font-medium">{t('assets.edit')}</button>
                {hasRole('admin') && <button onClick={() => handleDelete(asset._id)} className="text-red-600 text-sm font-medium">{t('assets.delete')}</button>}
              </div>
            )}
          </div>
        ))}
        {assets.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">{t('assets.no_data')}</div>
        )}
      </div>
      <ConfirmModal
        open={!!confirmDelete}
        message={t('assets.confirm_delete')}
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </Layout>
  );
}
