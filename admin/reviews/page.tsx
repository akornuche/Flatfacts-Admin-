'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface UserInfo {
  id: string;
  email: string;
  name: string;
}

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
  user: UserInfo;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AllReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    fetchReviews();
  }, [searchQuery, tagFilter, locationFilter, ratingFilter, currentPage, limit]);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        tag: tagFilter,
        location: locationFilter,
        page: currentPage.toString(),
        limit: limit.toString(),
      });
      if (ratingFilter) {
        params.append('rating', ratingFilter);
      }

      const response = await fetch(`/api/admin/reviews?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch reviews');
      }
      const data = await response.json();
      setReviews(data.reviews);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleTagFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleLocationFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocationFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleRatingFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRatingFilter(e.target.value);
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

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to soft-delete this review? It can be restored later.')) {
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

      alert('Review soft-deleted successfully!');
      fetchReviews(); // Re-fetch reviews to update the list
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading reviews...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">All Reviews</h1>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search title/content..."
          className="p-2 border rounded w-full"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <input
          type="text"
          placeholder="Filter by tag..."
          className="p-2 border rounded w-full"
          value={tagFilter}
          onChange={handleTagFilterChange}
        />
        <input
          type="text"
          placeholder="Filter by location..."
          className="p-2 border rounded w-full"
          value={locationFilter}
          onChange={handleLocationFilterChange}
        />
        <select className="p-2 border rounded w-full" value={ratingFilter} onChange={handleRatingFilterChange}>
          <option value="">All Ratings</option>
          <option value="1">1 Star</option>
          <option value="2">2 Stars</option>
          <option value="3">3 Stars</option>
        </select>
      </div>

      <div className="mb-4 flex justify-end items-center">
        <select className="p-2 border rounded" value={limit} onChange={handleLimitChange}>
          <option value="5">5 per page</option>
          <option value="10">10 per page</option>
          <option value="20">20 per page</option>
        </select>
      </div>

      {reviews.length === 0 ? (
        <p>No reviews found.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Anonymous</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reviews.map((review) => (
                <tr key={review.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{review.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {review.isAnonymous ? 'Anonymous' : review.userName || review.user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{review.star} Stars</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{review.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{review.tags}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{review.isAnonymous ? 'Yes' : 'No'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href={`/admin/reviews/${review.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                      View
                    </Link>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
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
