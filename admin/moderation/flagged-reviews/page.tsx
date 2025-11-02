'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ReviewInfo {
  id: string;
  title: string;
  content: string;
  userName: string | null;
  userAvatar: string | null;
  isAnonymous: boolean;
}

interface ReporterInfo {
  id: string;
  name: string;
  email: string;
}

interface Report {
  id: string;
  reviewId: string;
  reporterUserId: string;
  reason: string;
  otherReason: string | null;
  createdAt: string;
  review: ReviewInfo;
  reporter: ReporterInfo;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function FlaggedReviewsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    fetchReports();
  }, [currentPage, limit]);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });
      const response = await fetch(`/api/admin/reports?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch reports');
      }
      const data = await response.json();
      setReports(data.reports);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (pagination && newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to soft-delete this reported review?')) {
      return;
    }
    setError(null);
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, { // Using existing /api/reviews/[id] DELETE endpoint
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete review');
      }

      alert('Reported review soft-deleted successfully!');
      fetchReports(); // Re-fetch reports to update the list
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDismissReport = async (reportId: string) => {
    if (!window.confirm('Are you sure you want to dismiss this report? This will remove it from the list.')) {
      return;
    }
    setError(null);
    try {
      const response = await fetch(`/api/admin/reports/${reportId}/dismiss`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to dismiss report');
      }

      const data = await response.json();
      alert(data.message || 'Report dismissed successfully!');
      fetchReports(); // Re-fetch reports to update the list
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading flagged reviews...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Flagged Reviews</h1>

      <div className="mb-4 flex justify-end items-center">
        <select className="p-2 border rounded" value={limit} onChange={handleLimitChange}>
          <option value="5">5 per page</option>
          <option value="10">10 per page</option>
          <option value="20">20 per page</option>
        </select>
      </div>

      {reports.length === 0 ? (
        <p>No flagged reviews found.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Link href={`/admin/reviews/${report.reviewId}`} className="text-indigo-600 hover:text-indigo-900">
                      {report.review.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.reason} {report.otherReason && `(${report.otherReason})`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Link href={`/admin/users/${report.reporter.id}`} className="text-indigo-600 hover:text-indigo-900">
                      {report.reporter.name || report.reporter.email}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(report.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDeleteReview(report.reviewId)}
                      className="text-red-600 hover:text-red-900 mr-4"
                    >
                      Delete Review
                    </button>
                    <button
                      onClick={() => handleDismissReport(report.id)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Dismiss Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <nav className="flex justify-between items-center mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {pagination.totalPages} (Total: {pagination.total})
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.totalPages}
            className="px-4 py-2 border rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}
