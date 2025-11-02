'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// --- Data Interfaces ---
interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  verified: boolean;
  isBanned: boolean;
  createdAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// --- Main Page Component ---
export default function UserDirectoryPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, currentPage, limit]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        page: currentPage.toString(),
        limit: limit.toString(),
      });
      const response = await fetch(`/api/admin/users?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Event Handlers ---
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
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

  const handleBanUser = async (userId: string) => {
    const reason = prompt('Please provide a reason for banning this user:');
    if (!reason || !reason.trim()) {
      alert('Ban reason is required.');
      return;
    }
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) throw new Error((await response.json()).error || 'Failed to ban user');
      alert('User banned successfully!');
      fetchUsers();
    } catch (err: any) { setError(err.message); }
  };

  const handleUnbanUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to unban this user?')) return;
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${userId}/ban`, { method: 'DELETE' });
      if (!response.ok) throw new Error((await response.json()).error || 'Failed to unban user');
      alert('User unbanned successfully!');
      fetchUsers();
    } catch (err: any) { setError(err.message); }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action is permanent.')) return;
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error((await response.json()).error || 'Failed to delete user');
      alert('User deleted successfully!');
      fetchUsers();
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
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="m-0 fw-bold text-primary">User Directory</h6>
            <div className="d-flex gap-2">
              <input
                type="text"
                placeholder="Search by name or email..."
                className="form-control form-control-sm"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <select className="form-select form-select-sm" value={limit} onChange={handleLimitChange} style={{ width: '120px' }}>
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
              </select>
            </div>
          </div>
        </div>
        <div className="card-body">
          {users.length === 0 ? (
            <p className="text-center text-body-secondary">No users found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Verified</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.isAdmin ? <span className="badge bg-primary">Admin</span> : <span className="badge bg-secondary">User</span>}</td>
                      <td>{user.verified ? <i className="bi bi-check-circle-fill text-success"></i> : <i className="bi bi-x-circle-fill text-danger"></i>}</td>
                      <td>
                        {user.isBanned ? (
                          <span className="badge bg-danger">Banned</span>
                        ) : (
                          <span className="badge bg-success">Active</span>
                        )}
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <Link href={`/admin/users/${user.id}`} className="btn btn-outline-secondary">
                            <i className="bi bi-eye"></i>
                          </Link>
                          {user.isBanned ? (
                            <button onClick={() => handleUnbanUser(user.id)} className="btn btn-outline-success">
                              <i className="bi bi-unlock"></i>
                            </button>
                          ) : (
                            <button onClick={() => handleBanUser(user.id)} className="btn btn-outline-warning">
                              <i className="bi bi-slash-circle"></i>
                            </button>
                          )}
                          <button onClick={() => handleDeleteUser(user.id)} className="btn btn-outline-danger">
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
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
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="btn btn-outline-secondary btn-sm">Previous</button>
            <span className="text-body-secondary small">Page {currentPage} of {pagination.totalPages} (Total: {pagination.total} users)</span>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pagination.totalPages} className="btn btn-outline-secondary btn-sm">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
