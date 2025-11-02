'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface UserInfo {
  id: string;
  email: string;
  name: string;
}

interface SupportMessage {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  user?: UserInfo; // Optional, as userId can be null
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function SupportMessagesPage() {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null); // ID of message being replied to

  useEffect(() => {
    fetchSupportMessages();
  }, [currentPage, limit]);

  const fetchSupportMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });
      const response = await fetch(`/api/admin/support?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch support messages');
      }
      const data = await response.json();
      setMessages(data.supportMessages);
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

  const handleReply = (messageId: string) => {
    setReplyingTo(messageId);
    setReplyMessage(''); // Clear previous reply message
  };

  const sendReply = async (messageId: string, recipientEmail: string) => {
    if (!replyMessage.trim()) {
      alert('Reply message cannot be empty.');
      return;
    }
    setError(null);
    try {
      const response = await fetch(`/api/admin/support/${messageId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ replyContent: replyMessage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send reply');
      }

      const data = await response.json();
      alert(data.message || `Reply sent successfully to ${recipientEmail}!`);
      setReplyingTo(null);
      setReplyMessage('');
    } catch (err: any) {
      setError(err.message);
    }
  };

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
        <strong>Error:</strong> {error}
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="card shadow">
        <div className="card-header py-3 d-flex justify-content-between align-items-center">
          <h6 className="m-0 fw-bold text-primary">Support Messages</h6>
          <div className="col-auto">
            <select className="form-select form-select-sm" value={limit} onChange={handleLimitChange}>
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
            </select>
          </div>
        </div>
        <div className="card-body">
          {messages.length === 0 ? (
            <p className="text-center text-body-secondary">No support messages found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Sender Name</th>
                    <th>Sender Email</th>
                    <th>Message</th>
                    <th>Submitted At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((message) => (
                    <React.Fragment key={message.id}>
                      <tr>
                        <td>
                          {message.userId ? (
                            <Link href={`/admin/users/${message.userId}`} className="text-decoration-none">
                              {message.name}
                            </Link>
                          ) : (
                            message.name
                          )}
                        </td>
                        <td>{message.email}</td>
                        <td style={{ maxWidth: '300px' }} className="text-truncate">{message.message}</td>
                        <td>{new Date(message.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            onClick={() => handleReply(message.id)}
                            className="btn btn-outline-primary btn-sm"
                          >
                            Reply
                          </button>
                        </td>
                      </tr>
                      {replyingTo === message.id && (
                        <tr>
                          <td colSpan={5} className="p-3 bg-body-secondary">
                            <div className="d-flex flex-column gap-2">
                              <textarea
                                className="form-control"
                                rows={3}
                                placeholder={`Reply to ${message.name}...`}
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                              ></textarea>
                              <div className="d-flex justify-content-end gap-2">
                                <button
                                  onClick={() => sendReply(message.id, message.email)}
                                  className="btn btn-success btn-sm"
                                >
                                  Send Reply
                                </button>
                                <button
                                  onClick={() => setReplyingTo(null)}
                                  className="btn btn-secondary btn-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {pagination && pagination.totalPages > 1 && (
          <div className="card-footer d-flex justify-content-between align-items-center">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn btn-outline-secondary btn-sm"
            >
              Previous
            </button>
            <span className="text-body-secondary small">
              Page {currentPage} of {pagination.totalPages} (Total: {pagination.total} messages)
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              className="btn btn-outline-secondary btn-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
