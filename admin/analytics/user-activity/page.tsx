'use client';

import { useState, useEffect } from 'react';

// --- Data Interfaces ---
interface CurrentMetrics {
  dau: number;
  wau: number;
  mau: number;
  totalUsers: number;
}

interface ActivityTrend {
  date: string;
  dau: number;
  wau: number;
  mau: number;
  newSignups: number;
}

interface UserActivityData {
  period: string;
  current: CurrentMetrics;
  trends: ActivityTrend[];
}

// --- Reusable Metric Card Component ---
const MetricCard = ({
  title,
  value,
  icon,
  color,
  note,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  note: string;
}) => (
  <div className="col-xl col-md-6 mb-4">
    <div className={`card h-100 border-start-lg border-start-4 border-${color} bg-body-tertiary`}>
      <div className="card-body">
        <div className="row no-gutters align-items-center">
          <div className="col me-2">
            <div className={`text-xs fw-bold text-${color} text-uppercase mb-1`}>{title}</div>
            <div className="h5 mb-0 fw-bold text-body-emphasis">{value}</div>
            <div className="text-xs text-body-secondary mt-1">{note}</div>
          </div>
          <div className="col-auto">
            <i className={`bi ${icon} fs-2 text-body-tertiary`}></i>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- Main Page Component ---
export default function UserActivityAnalyticsPage() {
  const [data, setData] = useState<UserActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('90d');

  useEffect(() => {
    fetchUserActivityData();
  }, [period]);

  const fetchUserActivityData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/analytics/user-activity?period=${period}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user activity data');
      }
      const activityData: UserActivityData = await response.json();
      setData(activityData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Render Logic ---
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">Error: {error}</div>;
  }

  if (!data) {
    return <div className="alert alert-warning">No user activity data available.</div>;
  }

  return (
    <div className="container-fluid">
      {/* Page Header */}
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-body-emphasis">User Activity Analytics</h1>
        <div className="col-auto">
          <select className="form-select" value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="180d">Last 180 Days</option>
          </select>
        </div>
      </div>

      {/* Current Metrics Cards */}
      <div className="row">
        <MetricCard title="Daily Active Users" value={data.current.dau} icon="bi-person-check" color="primary" note="Last 24 hours" />
        <MetricCard title="Weekly Active Users" value={data.current.wau} icon="bi-calendar-week" color="success" note="Last 7 days" />
        <MetricCard title="Monthly Active Users" value={data.current.mau} icon="bi-calendar-month" color="info" note="Last 30 days" />
        <MetricCard title="Total Users" value={data.current.totalUsers} icon="bi-people" color="secondary" note="All registered users" />
        <MetricCard
          title="Engagement Rate"
          value={`${data.current.totalUsers > 0 ? Math.round((data.current.mau / data.current.totalUsers) * 100) : 0}%`}
          icon="bi-reception-4"
          color="warning"
          note="MAU / Total Users"
        />
      </div>

      {/* Activity Trends Chart Placeholder */}
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 fw-bold text-primary">User Activity Trends</h6>
        </div>
        <div className="card-body text-center py-5">
          <i className="bi bi-bar-chart-line fs-1 text-body-tertiary"></i>
          <p className="text-body-secondary mt-2">Interactive charts would be displayed here.</p>
          <p className="small text-body-secondary">
            Chart visualization components would render DAU, WAU, MAU, and signup trends over time.
          </p>
        </div>
      </div>

      {/* Trends Data Table */}
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 fw-bold text-primary">Daily Activity Breakdown</h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>DAU</th>
                  <th>WAU</th>
                  <th>MAU</th>
                  <th>New Signups</th>
                </tr>
              </thead>
              <tbody>
                {data.trends.slice(-30).map((trend) => (
                  <tr key={trend.date}>
                    <td>{new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td>{trend.dau}</td>
                    <td>{trend.wau}</td>
                    <td>{trend.mau}</td>
                    <td>{trend.newSignups}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Implementation Notes */}
      <div className="alert alert-info" role="alert">
        <h4 className="alert-heading">Implementation Notes</h4>
        <p><strong>Chart Integration:</strong> To add interactive charts, you can integrate libraries like Recharts, Chart.js, or D3.js.</p>
        <hr />
        <p className="mb-0"><strong>Data Processing:</strong> The API provides all necessary data points for creating line charts, bar charts, and trend visualizations.</p>
      </div>
    </div>
  );
}
