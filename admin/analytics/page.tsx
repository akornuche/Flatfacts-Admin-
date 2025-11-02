'use client';

import { useState, useEffect } from 'react';

// --- Data Interfaces ---
interface EngagementSummary { totalReviews: number; totalComments: number; totalVotes: number; avgCommentsPerReview: number; avgVotesPerReview: number; }
interface TopEngagedReview { id: string; title: string; createdAt: string; commentsCount: number; votesCount: number; engagementScore: number; }
interface EngagementTrend { date: string; reviews: number; comments: number; votes: number; totalEngagement: number; }
interface EngagementData { period: string; summary: EngagementSummary; topEngagedReviews: TopEngagedReview[]; engagementTrends: EngagementTrend[]; }
interface TagSummary { totalReviews: number; reviewsWithTags: number; uniqueTags: number; avgTagsPerReview: number; }
interface TagAnalytics { tag: string; usageCount: number; avgRating: number; totalComments: number; totalVotes: number; engagementScore: number; }
interface TagData { period: string; summary: TagSummary; topTags: TagAnalytics[]; }
interface LocationSummary { totalReviews: number; reviewsWithLocation: number; uniqueLocations: number; locationUsageRate: number; }
interface LocationAnalytics { location: string; reviewCount: number; avgRating: number; totalComments: number; totalVotes: number; engagementScore: number; }
interface LocationData { period: string; summary: LocationSummary; topLocations: LocationAnalytics[]; }

// --- Main Page Component ---
export default function AnalyticsPage() {
  const [data, setData] = useState<EngagementData | null>(null);
  const [tagData, setTagData] = useState<TagData | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [engagementRes, tagsRes, locationsRes] = await Promise.all([
        fetch(`/api/admin/analytics/engagement?period=${period}`),
        fetch(`/api/admin/analytics/tags?period=${period}&limit=15`),
        fetch(`/api/admin/analytics/locations?period=${period}&limit=15`)
      ]);

      if (!engagementRes.ok) throw new Error((await engagementRes.json()).error || 'Failed to fetch engagement analytics');
      if (!tagsRes.ok) throw new Error((await tagsRes.json()).error || 'Failed to fetch tag analytics');
      if (!locationsRes.ok) throw new Error((await locationsRes.json()).error || 'Failed to fetch location analytics');

      setData(await engagementRes.json());
      setTagData(await tagsRes.json());
      setLocationData(await locationsRes.json());

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
      </div>
    );
  }

  if (error) return <div className="alert alert-danger">Error: {error}</div>;
  if (!data || !tagData || !locationData) return <div className="alert alert-warning">No analytics data available.</div>;

  return (
    <div className="container-fluid">
      {/* Page Header */}
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-body-emphasis">Deep Dive Analytics</h1>
        <div className="col-auto">
          <select className="form-select" value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Engagement Section */}
      <div className="card shadow mb-4">
        <div className="card-header py-3"><h6 className="m-0 fw-bold text-primary">Engagement Analytics</h6></div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col"><div className="card bg-body-tertiary p-2 text-center"><div className="fw-bold">{data.summary.totalReviews}</div><div className="small text-body-secondary">Total Reviews</div></div></div>
            <div className="col"><div className="card bg-body-tertiary p-2 text-center"><div className="fw-bold">{data.summary.totalComments}</div><div className="small text-body-secondary">Total Comments</div></div></div>
            <div className="col"><div className="card bg-body-tertiary p-2 text-center"><div className="fw-bold">{data.summary.totalVotes}</div><div className="small text-body-secondary">Total Votes</div></div></div>
            <div className="col"><div className="card bg-body-tertiary p-2 text-center"><div className="fw-bold">{data.summary.avgCommentsPerReview}</div><div className="small text-body-secondary">Avg Comments/Review</div></div></div>
            <div className="col"><div className="card bg-body-tertiary p-2 text-center"><div className="fw-bold">{data.summary.avgVotesPerReview}</div><div className="small text-body-secondary">Avg Votes/Review</div></div></div>
          </div>
          <div className="table-responsive">
            <table className="table table-sm table-striped table-hover">
              <thead><tr><th>Top Engaged Reviews</th><th className="text-end">Comments</th><th className="text-end">Votes</th><th className="text-end">Score</th></tr></thead>
              <tbody>
                {data.topEngagedReviews.map(review => (
                  <tr key={review.id}><td>{review.title}</td><td className="text-end">{review.commentsCount}</td><td className="text-end">{review.votesCount}</td><td className="text-end">{review.engagementScore}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tags Section */}
      <div className="card shadow mb-4">
        <div className="card-header py-3"><h6 className="m-0 fw-bold text-primary">Tag Analytics</h6></div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col"><div className="card bg-body-tertiary p-2 text-center"><div className="fw-bold">{tagData.summary.uniqueTags}</div><div className="small text-body-secondary">Unique Tags</div></div></div>
            <div className="col"><div className="card bg-body-tertiary p-2 text-center"><div className="fw-bold">{tagData.summary.reviewsWithTags}</div><div className="small text-body-secondary">Reviews w/ Tags</div></div></div>
            <div className="col"><div className="card bg-body-tertiary p-2 text-center"><div className="fw-bold">{tagData.summary.avgTagsPerReview}</div><div className="small text-body-secondary">Avg Tags/Review</div></div></div>
          </div>
          <div className="table-responsive">
            <table className="table table-sm table-striped table-hover">
              <thead><tr><th>Top Tags</th><th className="text-end">Usage</th><th className="text-end">Avg Rating</th><th className="text-end">Comments</th><th className="text-end">Votes</th><th className="text-end">Score</th></tr></thead>
              <tbody>
                {tagData.topTags.map(tag => (
                  <tr key={tag.tag}><td><span className="badge bg-primary bg-opacity-25 text-primary-emphasis">{tag.tag}</span></td><td className="text-end">{tag.usageCount}</td><td className="text-end">{tag.avgRating.toFixed(2)}</td><td className="text-end">{tag.totalComments}</td><td className="text-end">{tag.totalVotes}</td><td className="text-end">{tag.engagementScore}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Locations Section */}
      <div className="card shadow mb-4">
        <div className="card-header py-3"><h6 className="m-0 fw-bold text-primary">Location Analytics</h6></div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col"><div className="card bg-body-tertiary p-2 text-center"><div className="fw-bold">{locationData.summary.uniqueLocations}</div><div className="small text-body-secondary">Unique Locations</div></div></div>
            <div className="col"><div className="card bg-body-tertiary p-2 text-center"><div className="fw-bold">{locationData.summary.reviewsWithLocation}</div><div className="small text-body-secondary">Reviews w/ Location</div></div></div>
            <div className="col"><div className="card bg-body-tertiary p-2 text-center"><div className="fw-bold">{locationData.summary.locationUsageRate}%</div><div className="small text-body-secondary">Usage Rate</div></div></div>
          </div>
          <div className="table-responsive">
            <table className="table table-sm table-striped table-hover">
              <thead><tr><th>Top Locations</th><th className="text-end">Reviews</th><th className="text-end">Avg Rating</th><th className="text-end">Comments</th><th className="text-end">Votes</th><th className="text-end">Score</th></tr></thead>
              <tbody>
                {locationData.topLocations.map(loc => (
                  <tr key={loc.location}><td><span className="badge bg-success bg-opacity-25 text-success-emphasis">{loc.location}</span></td><td className="text-end">{loc.reviewCount}</td><td className="text-end">{loc.avgRating.toFixed(2)}</td><td className="text-end">{loc.totalComments}</td><td className="text-end">{loc.totalVotes}</td><td className="text-end">{loc.engagementScore}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
