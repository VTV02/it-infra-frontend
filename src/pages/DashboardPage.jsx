import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import Layout from '../components/Layout';
import api from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function DashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then((res) => setStats(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  const barData = {
    labels: stats.incidentsByMonth.labels,
    datasets: [
      {
        label: t('dashboard.chart_incidents'),
        data: stats.incidentsByMonth.data,
        backgroundColor: 'rgba(0, 104, 43, 0.7)',
        borderRadius: 4,
      },
    ],
  };

  const priorityMap = { Low: '#22c55e', Medium: '#eab308', High: '#f97316', Critical: '#ef4444' };
  const priorityData = {
    labels: stats.incidentsByPriority.map((p) => t(`priority.${p._id}`)),
    datasets: [
      {
        data: stats.incidentsByPriority.map((p) => p.count),
        backgroundColor: stats.incidentsByPriority.map((p) => priorityMap[p._id] || '#94a3b8'),
      },
    ],
  };

  const typeColors = ['#00682B', '#8b5cf6', '#ef4444', '#f59e0b', '#10b981'];
  const assetTypeData = {
    labels: stats.assetsByType.map((a) => t(`asset_type.${a._id}`)),
    datasets: [
      {
        data: stats.assetsByType.map((a) => a.count),
        backgroundColor: typeColors.slice(0, stats.assetsByType.length),
      },
    ],
  };

  const statCards = [
    { label: t('dashboard.total_incidents'), value: stats.totalIncidents, color: 'bg-primary-600' },
    { label: t('dashboard.open_incidents'), value: stats.openIncidents, color: 'bg-orange-500' },
    { label: t('dashboard.total_assets'), value: stats.totalAssets, color: 'bg-green-500' },
    { label: t('dashboard.warning_assets'), value: stats.warningAssets, color: 'bg-yellow-500' },
    { label: t('dashboard.broken_assets'), value: stats.brokenAssets, color: 'bg-red-500' },
    { label: t('dashboard.maintenance_records'), value: stats.totalMaintenance, color: 'bg-purple-500' },
  ];

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(156,163,175,0.15)' } },
      y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(156,163,175,0.15)' } },
    },
  };

  return (
    <Layout>
      <h1 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 md:mb-6">{t('dashboard.title')}</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 md:p-6">
            <p className="text-[10px] md:text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
            <div className="flex items-center mt-1 md:mt-2">
              <span className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${card.color} mr-2 md:mr-3`}></span>
              <span className="text-xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{card.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
          <h2 className="text-sm md:text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 md:mb-4">{t('dashboard.incidents_per_month')}</h2>
          <Bar data={barData} options={chartOptions} />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
          <h2 className="text-sm md:text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 md:mb-4">{t('dashboard.incidents_by_priority')}</h2>
          <div className="max-w-[200px] md:max-w-xs mx-auto"><Doughnut data={priorityData} /></div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 lg:col-span-2">
          <h2 className="text-sm md:text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 md:mb-4">{t('dashboard.assets_by_type')}</h2>
          <div className="max-w-[200px] md:max-w-xs mx-auto"><Doughnut data={assetTypeData} /></div>
        </div>
      </div>
    </Layout>
  );
}
