import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import Layout from '../components/Layout';
import Toast from '../components/Toast';
import api from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

export default function ReportsPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    Promise.all([api.get('/dashboard/stats'), api.get('/incidents')])
      .then(([statsRes, incRes]) => { setStats(statsRes.data.data); setIncidents(incRes.data.data); })
      .catch((err) => setToast({ message: err.message || 'Failed to load report data', type: 'error' }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Layout><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div></Layout>;
  }

  const trendData = {
    labels: stats.incidentsByMonth.labels,
    datasets: [{
      label: t('dashboard.chart_incidents'),
      data: stats.incidentsByMonth.data,
      borderColor: '#00682B', backgroundColor: 'rgba(0, 104, 43, 0.1)', fill: true, tension: 0.3,
    }],
  };

  const statusCount = { New: 0, 'In Progress': 0, Resolved: 0, Closed: 0 };
  incidents.forEach((inc) => { statusCount[inc.status]++; });
  const statusData = {
    labels: Object.keys(statusCount).map((s) => t(`status.${s}`)),
    datasets: [{ data: Object.values(statusCount), backgroundColor: ['#00682B', '#8b5cf6', '#22c55e', '#94a3b8'] }],
  };

  const priorityCount = { Low: 0, Medium: 0, High: 0, Critical: 0 };
  incidents.forEach((inc) => { priorityCount[inc.priority]++; });
  const priorityBar = {
    labels: Object.keys(priorityCount).map((p) => t(`priority.${p}`)),
    datasets: [{ label: t('dashboard.chart_incidents'), data: Object.values(priorityCount), backgroundColor: ['#22c55e', '#eab308', '#f97316', '#ef4444'], borderRadius: 4 }],
  };

  const resolved = incidents.filter((i) => i.resolvedAt && i.createdAt);
  const avgResolutionHours = resolved.length
    ? Math.round(resolved.reduce((sum, i) => sum + (new Date(i.resolvedAt) - new Date(i.createdAt)) / 3600000, 0) / resolved.length)
    : 0;

  const goodAssets = stats.totalAssets - stats.warningAssets - stats.brokenAssets;

  return (
    <Layout>
      <h1 className="text-lg md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">{t('reports.title')}</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="bg-white rounded-xl shadow-sm p-3 md:p-6">
          <p className="text-[10px] md:text-sm text-gray-500">{t('reports.total_incidents')}</p>
          <p className="text-xl md:text-3xl font-bold text-gray-800 mt-1">{stats.totalIncidents}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 md:p-6">
          <p className="text-[10px] md:text-sm text-gray-500">{t('reports.open_incidents')}</p>
          <p className="text-xl md:text-3xl font-bold text-orange-600 mt-1">{stats.openIncidents}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 md:p-6">
          <p className="text-[10px] md:text-sm text-gray-500">{t('reports.resolution_rate')}</p>
          <p className="text-xl md:text-3xl font-bold text-green-600 mt-1">
            {stats.totalIncidents ? Math.round(((stats.totalIncidents - stats.openIncidents) / stats.totalIncidents) * 100) : 0}%
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 md:p-6">
          <p className="text-[10px] md:text-sm text-gray-500">{t('reports.avg_resolution_time')}</p>
          <p className="text-xl md:text-3xl font-bold text-primary-600 mt-1">{avgResolutionHours}h</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <h2 className="text-sm md:text-lg font-semibold text-gray-700 mb-3 md:mb-4">{t('reports.incident_trend')}</h2>
          <Line data={trendData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <h2 className="text-sm md:text-lg font-semibold text-gray-700 mb-3 md:mb-4">{t('reports.incidents_by_status')}</h2>
          <div className="max-w-[200px] md:max-w-xs mx-auto"><Doughnut data={statusData} /></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <h2 className="text-sm md:text-lg font-semibold text-gray-700 mb-3 md:mb-4">{t('reports.incidents_by_priority')}</h2>
          <Bar data={priorityBar} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <h2 className="text-sm md:text-lg font-semibold text-gray-700 mb-3 md:mb-4">{t('reports.asset_health')}</h2>
          <div className="space-y-3 md:space-y-4 mt-4 md:mt-6">
            <div>
              <div className="flex justify-between text-xs md:text-sm mb-1"><span className="text-gray-600">{t('reports.good')}</span><span className="font-medium">{goodAssets}</span></div>
              <div className="h-2 md:h-3 bg-gray-200 rounded-full"><div className="h-2 md:h-3 bg-green-500 rounded-full" style={{ width: `${stats.totalAssets ? (goodAssets / stats.totalAssets) * 100 : 0}%` }}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs md:text-sm mb-1"><span className="text-gray-600">{t('reports.warning')}</span><span className="font-medium">{stats.warningAssets}</span></div>
              <div className="h-2 md:h-3 bg-gray-200 rounded-full"><div className="h-2 md:h-3 bg-yellow-500 rounded-full" style={{ width: `${stats.totalAssets ? (stats.warningAssets / stats.totalAssets) * 100 : 0}%` }}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs md:text-sm mb-1"><span className="text-gray-600">{t('reports.broken')}</span><span className="font-medium">{stats.brokenAssets}</span></div>
              <div className="h-2 md:h-3 bg-gray-200 rounded-full"><div className="h-2 md:h-3 bg-red-500 rounded-full" style={{ width: `${stats.totalAssets ? (stats.brokenAssets / stats.totalAssets) * 100 : 0}%` }}></div></div>
            </div>
          </div>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  );
}
