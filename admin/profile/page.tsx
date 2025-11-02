'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// --- Data Interfaces ---
interface User {
  id: string; name: string; email: string; isAdmin: boolean; verified: boolean; createdAt: string;
}

// --- Main Page Component ---
export default function AdminProfilePage() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
  });

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchUser(session.user.id);
    }
    if (status === 'unauthenticated') {
      // Handle case where user is not logged in
      setLoading(false);
      setError('You must be logged in to view this page.');
    }
  }, [status, session]);

  const fetchUser = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${id}`);
      if (!response.ok) throw new Error((await response.json()).error || 'Failed to fetch user details');
      const data: User = await response.json();
      setUser(data);
      setFormData({ ...formData, name: data.name, email: data.email });
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdateUser = async () => {
    if (!user) return;
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email }),
      });
      if (!response.ok) throw new Error((await response.json()).error || 'Failed to update profile');
      await fetchUser(user.id);
      setIsEditing(false);
    } catch (err: any) { setError(err.message); }
  };

  const handleUpdatePassword = async () => {
    if (!user) return;
    setError(null);
    try {
      const response = await fetch(`/api/settings/change-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          }),
        });

      if (!response.ok) throw new Error((await response.json()).error || 'Failed to update password');
      // Optionally reset form and state here
      setFormData({ ...formData, currentPassword: '', newPassword: '' });
      alert('Password updated successfully!');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSaveChanges = async () => {
    await handleUpdateUser();
    if (formData.currentPassword && formData.newPassword) {
      await handleUpdatePassword();
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
      </div>
    );
  }

  if (error) return <div className="alert alert-danger">Error: {error}</div>;
  if (!user) return <div className="alert alert-warning">Could not load user profile.</div>;

  return (
    <div className="container-fluid">
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-body-emphasis">My Profile</h1>
      </div>
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow">
            <div className="card-header py-3">
              <h6 className="m-0 fw-bold text-primary">Profile Details</h6>
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
                  <hr />
                  <div>
                    <label className="form-label">Current Password</label>
                    <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleFormChange} className="form-control" />
                  </div>
                  <div>
                    <label className="form-label">New Password</label>
                    <input type="password" name="newPassword" value={formData.newPassword} onChange={handleFormChange} className="form-control" />
                  </div>
                </div>
              ) : (
                <dl className="row">
                  <dt className="col-sm-3">Name</dt><dd className="col-sm-9">{user.name}</dd>
                  <dt className="col-sm-3">Email</dt><dd className="col-sm-9">{user.email}</dd>
                  <dt className="col-sm-3">Role</dt><dd className="col-sm-9">{user.isAdmin ? <span className="badge bg-primary">Admin</span> : <span className="badge bg-secondary">User</span>}</dd>
                  <dt className="col-sm-3">Status</dt><dd className="col-sm-9">{user.verified ? <span className="badge bg-success">Verified</span> : <span className="badge bg-warning">Not Verified</span>}</dd>
                  <dt className="col-sm-3">Member Since</dt><dd className="col-sm-9">{new Date(user.createdAt).toLocaleDateString()}</dd>
                </dl>
              )}
            </div>
            <div className="card-footer d-flex justify-content-end gap-2">
              {isEditing ? (
                <>
                  <button onClick={() => setIsEditing(false)} className="btn btn-secondary">Cancel</button>
                  <button onClick={handleSaveChanges} className="btn btn-success">Save Changes</button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} className="btn btn-outline-primary btn-sm">Edit Profile</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
