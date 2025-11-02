'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// --- Data Interfaces ---
interface UserInfo { id: string; email: string; name: string; }
interface ReviewInfo { id: string; title: string; }
interface Comment { id: string; content: string; isAnonymous: boolean; createdAt: string; review: ReviewInfo; user: UserInfo; }
interface Pagination { total: number; page: number; limit: number; totalPages: number; }

// --- Main Page Component ---
export default function AllCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [reviewFilter, setReviewFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    fetchComments();
  }, [searchQuery, userFilter, reviewFilter, currentPage, limit]);

  const fetchComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ q: searchQuery, userId: userFilter, reviewId: reviewFilter, page: currentPage.toString(), limit: limit.toString() });
      const response = await fetch(`/api/admin/comments?${params.toString()}`);
      if (!response.ok) throw new Error((await response.json()).error || 'Failed to fetch comments');
      const data = await response.json();
      setComments(data.comments);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Event Handlers ---
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => { setSearchQuery(e.target.value); setCurrentPage(1); };
  const handleUserFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => { setUserFilter(e.target.value); setCurrentPage(1); };
  const handleReviewFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => { setReviewFilter(e.target.value); setCurrentPage(1); };
  const handlePageChange = (newPage: number) => { if (pagination && newPage >= 1 && newPage <= pagination.totalPages) setCurrentPage(newPage); };
  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => { setLimit(parseInt(e.target.value)); setCurrentPage(1); };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment? This action cannot be undone.')) return;
    setError(null);
    try {
      const response = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error((await response.json()).error || 'Failed to delete comment');
      alert('Comment deleted successfully!');
      fetchComments();
    } catch (err: any) { setError(err.message); }
  };

  // --- Render Logic ---
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
      </div>
    );
  }

  if (error) return <div className="alert alert-danger">Error: {error}</div>;

  return (
    <div className="container-fluid">
      <div className="card shadow">
        <div className="card-header py-3">
          <h6 className="m-0 fw-bold text-primary">All Comments</h6>
        </div>
        <div className="card-body">
          <div className="row g-2 mb-3">
            <div className="col-md-6"><input type="text" placeholder="Search content..." className="form-control" value={searchQuery} onChange={handleSearchChange} /></div>
            <div className="col-md-3"><input type="text" placeholder="Filter by User ID..." className="form-control" value={userFilter} onChange={handleUserFilterChange} /></div>
            <div className="col-md-3"><input type="text" placeholder="Filter by Review ID..." className="form-control" value={reviewFilter} onChange={handleReviewFilterChange} /></div>
          </div>
          {comments.length === 0 ? (
            <p className="text-center text-body-secondary">No comments found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle">
                <thead>
                  <tr>
                    <th>Content</th>
                    <th>User</th>
                    <th>Review</th>
                    <th>Anonymous</th>
                    <th>Created At</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {comments.map((comment) => (
                    <tr key={comment.id}>
                      <td style={{ maxWidth: '250px' }} className="text-truncate">{comment.content}</td>
                      <td><Link href={`/admin/users/${comment.user?.id ?? ""}`} className="text-decoration-none">{comment.user?.name || "N/A"}</Link></td>
                      <td><Link href={`/admin/reviews/${comment.review.id}`} className="text-decoration-none">{comment.review.title}</Link></td>
                      <td>{comment.isAnonymous ? <span className="badge bg-info">Yes</span> : <span className="badge bg-secondary">No</span>}</td>
                      <td>{new Date(comment.createdAt).toLocaleDateString()}</td>
                      <td className="text-end">
                        <button onClick={() => handleDeleteComment(comment.id)} className="btn btn-outline-danger btn-sm">
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {pagination && pagination.totalPages > 1 && (
          <div className="card-footer d-flex justify-content-between align-items-center">
            <div className="col-auto">
              <select className="form-select form-select-sm" value={limit} onChange={handleLimitChange} style={{ width: '120px' }}>
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
              </select>
            </div>
            <div className="d-flex align-items-center">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="btn btn-outline-secondary btn-sm">Previous</button>
              <span className="text-body-secondary small mx-2">Page {currentPage} of {pagination.totalPages}</span>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pagination.totalPages} className="btn btn-outline-secondary btn-sm">Next</button>
            </div>
            <div className="col-auto text-body-secondary small">Total: {pagination.total} comments</div>
          </div>
        )}
      </div>
    </div>
  );
}
