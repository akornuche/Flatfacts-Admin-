'use client';

import { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';

// Define the structure of the metrics data
interface DashboardMetrics {
  totalUsers: number;
  totalReviews: number;
  flaggedReviews: number;
  newSignupsLast30Days: number;
  monthlySignups: { month: string; count: number }[];
  dau: number;
  wau: number;
  mau: number;
}

// Props for the component
interface AdminDashboardClientProps {
  userName: string;
}

// A single metric card component for reusability
const MetricCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}) => (
  <div className="col-xl-3 col-md-6 mb-4">
    <div className={`card h-100 border-start-lg border-start-4 border-${color} bg-body-tertiary`}>
      <div className="card-body">
        <div className="row no-gutters align-items-center">
          <div className="col me-2">
            <div
              className={`text-xs fw-bold text-${color} text-uppercase mb-1`}
            >
              {title}
            </div>
            <div className="h5 mb-0 fw-bold text-body-emphasis">{value}</div>
          </div>
          <div className="col-auto">
            <i className={`bi ${icon} fs-2 text-body-tertiary`}></i>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function AdminDashboardClient({ userName }: AdminDashboardClientProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/dashboard');
      if (!response.ok) {
        if (response.status === 401) {
          redirect('/auth/signin?callbackUrl=/admin');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch dashboard metrics');
      }
      const data: DashboardMetrics = await response.json();
      setMetrics(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

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
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Database Connection Error</h4>
        <p>
          The dashboard could not connect to the database. This is likely because the server's IP address is not whitelisted in MongoDB Atlas.
        </p>
        <hr />
        <p className="mb-0">
          Please add the IP address to the Network Access list in your Atlas project settings.
        </p>
        <p>Error details: {error}</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="alert alert-warning" role="alert">
        No metrics data available.
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Page Heading */}
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-body-emphasis">Dashboard Overview</h1>
        <button className="btn btn-primary btn-sm" onClick={fetchMetrics} disabled={loading}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="row">
        <MetricCard
          title="Total Users"
          value={metrics.totalUsers}
          icon="bi-people-fill"
          color="primary"
        />
        <MetricCard
          title="Total Reviews"
          value={metrics.totalReviews}
          icon="bi-star-fill"
          color="success"
        />
        <MetricCard
          title="Flagged Reviews"
          value={metrics.flaggedReviews}
          icon="bi-flag-fill"
          color="warning"
        />
        <MetricCard
          title="New Signups (30 Days)"
          value={metrics.newSignupsLast30Days}
          icon="bi-person-plus-fill"
          color="info"
        />
      </div>

      <div className="row">
        {/* Signups Trend Table */}
        <div className="col-lg-7 mb-4">
          <div className="card shadow">
            <div className="card-header py-3 d-flex justify-content-between align-items-center">
              <h6 className="m-0 fw-bold text-primary">
                New Signups (Last 6 Months)
              </h6>
              <i className="bi bi-graph-up text-primary"></i>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-borderless table-striped">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th className="text-end">New Users</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.monthlySignups.map((data) => (
                      <tr key={data.month}>
                        <td>{data.month}</td>
                        <td className="text-end">{data.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Active Users Table */}
        <div className="col-lg-5 mb-4">
          <div className="card shadow">
            <div className="card-header py-3 d-flex justify-content-between align-items-center">
              <h6 className="m-0 fw-bold text-primary">Active Users</h6>
              <i className="bi bi-activity text-primary"></i>
            </div>
            <div className="card-body p-0">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Daily Active Users (DAU)
                  <span className="fw-bold">{metrics.dau}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Weekly Active Users (WAU)
                  <span className="fw-bold">{metrics.wau}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Monthly Active Users (MAU)
                  <span className="fw-bold">{metrics.mau}</span>
                </li>
              </ul>
            </div>
            <div className="card-footer text-body-secondary small">
              Based on login activity in the last 24h, 7d, and 30d.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
