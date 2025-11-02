'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Review {
  id: string;
  title: string;
  content: string;
  tags: string;
  location: string;
  star: number;
  userName: string | null;
  userAvatar: string | null;
  isAnonymous: boolean;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  comments: {
    id: string;
    content: string;
    isAnonymous: boolean;
    createdAt: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }[];
}

export default function ReviewDetailsPage() {
  const params = useParams();
  const router = useRouter();

  // Ensure params is not null before accessing id
  const id = params?.id as string;
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchReview();
    }
  }, [id]);

  const fetchReview = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/reviews/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch review details');
      }
      const data: Review = await response.json();
      setReview(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!window.confirm('Are you sure you want to soft-delete this review? It can be restored later.')) {
      return;
    }
    setError(null);
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete review');
      }

      alert('Review soft-deleted successfully!');
      router.push('/admin/reviews'); // Redirect to reviews list after deletion
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading review details...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!review) return <div>Review not found.</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Link href="/admin/reviews" className="text-indigo-600 hover:text-indigo-900">
          ← Back to Reviews
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold">{review.title}</h1>
          <div className="flex space-x-2">
            <button
              onClick={handleDeleteReview}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete Review
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Rating: {review.star} Stars</p>
            <p className="text-sm text-gray-500">Location: {review.location}</p>
            <p className="text-sm text-gray-500">Tags: {review.tags}</p>
            <p className="text-sm text-gray-500">Anonymous: {review.isAnonymous ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">
              Author: {review.isAnonymous ? 'Anonymous' : (
                <Link href={`/admin/users/${review.user.id}`} className="text-indigo-600 hover:text-indigo-900">
                  {review.userName || review.user.name} ({review.user.email})
                </Link>
              )}
            </p>
            <p className="text-sm text-gray-500">Created: {new Date(review.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h2 className="text-xl font-semibold mb-2">Review Content</h2>
          <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
            {review.content}
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Comments ({review.comments.length})</h2>
        {review.comments.length === 0 ? (
          <p className="text-gray-500">No comments on this review yet.</p>
        ) : (
          <div className="space-y-4">
            {review.comments.map((comment) => (
              <div key={comment.id} className="border-b pb-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm text-gray-500">
                    {comment.isAnonymous ? 'Anonymous' : (
                      <Link href={`/admin/users/${comment.user.id}`} className="text-indigo-600 hover:text-indigo-900">
                        {comment.user.name} ({comment.user.email})
                      </Link>
                    )}
                    <span className="ml-4">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  {comment.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
