'use client';

import { useState } from 'react';

// --- Main Page Component ---
export default function NotificationsPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('all'); // 'all', 'verified', 'unverified', 'singleEmail', 'byTag'
  const [singleEmail, setSingleEmail] = useState('');
  const [tag, setTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponseMessage(null);
    setError(null);

    if (!subject.trim() || !message.trim()) {
      setError('Subject and message cannot be empty.');
      setLoading(false);
      return;
    }

    try {
      const payload: any = { subject, message, audience };
      if (audience === 'singleEmail') payload.email = singleEmail;
      if (audience === 'byTag') payload.tag = tag;

      const response = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send notifications');

      setResponseMessage(data.message || 'Notifications sent successfully!');
      setSubject('');
      setMessage('');
      setSingleEmail('');
      setAudience('all');
      setTag('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow">
            <div className="card-header py-3">
              <h6 className="m-0 fw-bold text-primary">Send Notifications</h6>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="subject" className="form-label">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    className="form-control"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="message" className="form-label">Message</label>
                  <textarea
                    id="message"
                    className="form-control"
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="audience" className="form-label">Audience</label>
                  <select
                    id="audience"
                    className="form-select"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                  >
                    <option value="all">All Users</option>
                    <option value="verified">Verified Users</option>
                    <option value="unverified">Unverified Users</option>
                    <option value="singleEmail">Single Email</option>
                    <option value="byTag">Users by Tag</option>
                  </select>
                </div>

                {audience === 'singleEmail' && (
                  <div className="mb-3">
                    <label htmlFor="singleEmail" className="form-label">Recipient Email</label>
                    <input
                      type="email"
                      id="singleEmail"
                      className="form-control"
                      value={singleEmail}
                      onChange={(e) => setSingleEmail(e.target.value)}
                      required
                    />
                  </div>
                )}

                {audience === 'byTag' && (
                  <div className="mb-3">
                    <label htmlFor="tag" className="form-label">User Tag</label>
                    <input
                      type="text"
                      id="tag"
                      className="form-control"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      placeholder="e.g., premium, beta, vip"
                      required
                    />
                    <div className="form-text">Users with this tag will receive the notification.</div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...</>
                  ) : (
                    'Send Notifications'
                  )}
                </button>

                {responseMessage && <div className="alert alert-success mt-3">{responseMessage}</div>}
                {error && <div className="alert alert-danger mt-3">Error: {error}</div>}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
