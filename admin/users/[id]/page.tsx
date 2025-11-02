'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// --- Data Interfaces ---
interface User {
  id: string; name: string; email: string; isAdmin: boolean; verified: boolean; createdAt: string;
  reviews: { id: string; title: string; content: string; createdAt: string; isAnonymous: boolean }[];
  comments: { id: string; content: string; createdAt: string; reviewId: string; isAnonymous: boolean }[];
}

// --- Main Page Component ---
export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', isAdmin: false, verified: false });

  useEffect(() => { if (id) fetchUser(); }, [id]);

  const fetchUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${id}`);
      if (!response.ok) throw new Error((await response.json()).error || 'Failed to fetch user details');
      const data: User = await response.json();
      setUser(data);
      setFormData({ name: data.name, email: data.email, isAdmin: data.isAdmin, verified: data.verified });
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleUpdateUser = async () => {
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error((await response.json()).error || 'Failed to update user');
      await fetchUser();
      setIsEditing(false);
    } catch (err: any) { setError(err.message); }
  };

  const handleDeleteUser = async () => {
    if (!window.confirm('Are you sure you want to delete this user? This action is permanent.')) return;
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error((await response.json()).error || 'Failed to delete user');
      alert('User deleted successfully!');
      router.push('/admin/users');
    } catch (err: any) { setError(err.message); }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
      </div>
    );
  }

  if (error) return <div className="alert alert-danger">Error: {error}</div>;
  if (!user) return <div className="alert alert-warning">User not found.</div>;

  return (
    <div className="container-fluid">
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-body-emphasis">User Details</h1>
        <Link href="/admin/users" className="btn btn-sm btn-outline-secondary">Back to Directory</Link>
      </div>

      <div className="row">
        {/* Left Column: User Profile & Actions */}
        <div className="col-lg-4">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 fw-bold text-primary">{user.name}</h6>
            </div>
            <div className="card-body">
              {isEditing ? (
                <div className="d-flex flex-column gap-3">
                  <div>
                    <label className="form-label">Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleFormChange} className="form-control" />
                  </div>
                  <div>
                    <label className="form-label">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleFormChange} className="form-control" />
                  </div>
                  <div className="form-check form-switch">
                    <input type="checkbox" name="isAdmin" checked={formData.isAdmin} onChange={handleFormChange} className="form-check-input" id="isAdminCheck" />
                    <label className="form-check-label" htmlFor="isAdminCheck">Is Admin</label>
                  </div>
                  <div className="form-check form-switch">
                    <input type="checkbox" name="verified" checked={formData.verified} onChange={handleFormChange} className="form-check-input" id="isVerifiedCheck" />
                    <label className="form-check-label" htmlFor="isVerifiedCheck">Is Verified</label>
                  </div>
                </div>
              ) : (
                <dl className="row">
                  <dt className="col-sm-4">User ID</dt><dd className="col-sm-8"><small className="text-body-secondary">{user.id}</small></dd>
                  <dt className="col-sm-4">Email</dt><dd className="col-sm-8">{user.email}</dd>
                  <dt className="col-sm-4">Role</dt><dd className="col-sm-8">{user.isAdmin ? <span className="badge bg-primary">Admin</span> : <span className="badge bg-secondary">User</span>}</dd>
                  <dt className="col-sm-4">Status</dt><dd className="col-sm-8">{user.verified ? <span className="badge bg-success">Verified</span> : <span className="badge bg-warning">Not Verified</span>}</dd>
                  <dt className="col-sm-4">Member Since</dt><dd className="col-sm-8">{new Date(user.createdAt).toLocaleDateString()}</dd>
                </dl>
              )}
            </div>
            <div className="card-footer d-flex justify-content-end gap-2">
              {isEditing ? (
                <>
                  <button onClick={() => setIsEditing(false)} className="btn btn-secondary">Cancel</button>
                  <button onClick={handleUpdateUser} className="btn btn-success">Save Changes</button>
                </>
              ) : (
                <>
                  <button onClick={() => setIsEditing(true)} className="btn btn-outline-primary btn-sm">Edit Profile</button>
                  <button onClick={handleDeleteUser} className="btn btn-outline-danger btn-sm">Delete User</button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: User Activity */}
        <div className="col-lg-8">
          <div className="card shadow mb-4">
            <div className="card-header py-3"><h6 className="m-0 fw-bold text-primary">Submitted Reviews ({user.reviews.length})</h6></div>
            <div className="card-body">
              {user.reviews.length === 0 ? (
                <p className="text-body-secondary">No reviews submitted by this user.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {user.reviews.map(review => (
                    <li key={review.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <Link href={`/admin/reviews/${review.id}`} className="text-decoration-none fw-bold">{review.title}</Link>
                        <p className="mb-0 small text-body-secondary text-truncate">{review.content}</p>
                      </div>
                      <span className="badge bg-info-subtle text-info-emphasis">{review.isAnonymous ? 'Anonymous' : 'Public'}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="card shadow mb-4">
            <div className="card-header py-3"><h6 className="m-0 fw-bold text-primary">Posted Comments ({user.comments.length})</h6></div>
            <div className="card-body">
              {user.comments.length === 0 ? (
                <p className="text-body-secondary">No comments posted by this user.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {user.comments.map(comment => (
                    <li key={comment.id} className="list-group-item">
                      <p className="mb-1">{comment.content}</p>
                      <small className="text-body-secondary">
                        On review: <Link href={`/admin/reviews/${comment.reviewId}`} className="text-decoration-none">View Review</Link>
                      </small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
