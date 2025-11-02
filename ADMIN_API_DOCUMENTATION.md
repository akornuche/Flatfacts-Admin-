# FlatFacts Admin API Documentation

This document outlines the API endpoints available for the FlatFacts admin interface. All admin endpoints require authentication and authorization, meaning only users with `isAdmin: true` can access them.

## 📋 Complete API Endpoint Inventory

### 🔐 Admin Endpoints (Require Admin Authentication)

#### Dashboard & Analytics
- `GET /api/admin/dashboard` - Get dashboard overview metrics
- `GET /api/admin/analytics/engagement` - Review engagement analytics
- `GET /api/admin/analytics/tags` - Tag usage analytics
- `GET /api/admin/analytics/locations` - Location-based engagement analytics
- `GET /api/admin/analytics/user-activity` - DAU/WAU/MAU user activity trends

#### User Management
- `GET /api/admin/users` - Get all users (paginated)
- `GET /api/admin/users/[id]` - Get single user details
- `PATCH /api/admin/users/[id]` - Update user details
- `DELETE /api/admin/users/[id]` - Delete user
- `POST /api/admin/users/[id]/ban` - Ban user
- `DELETE /api/admin/users/[id]/ban` - Unban user

#### Content Moderation
- `GET /api/admin/reviews` - Get all reviews (paginated)
- `GET /api/admin/reviews/[id]` - Get single review details
- `GET /api/admin/comments` - Get all comments (paginated)
- `GET /api/admin/reports` - Get all reports (flagged content)
- `POST /api/admin/reports/[id]/dismiss` - Dismiss report

#### Support & Communication
- `GET /api/admin/support` - Get all support messages
- `POST /api/admin/support/[id]/reply` - Reply to support message
- `POST /api/admin/notifications/send` - Send email notifications

### 🌐 Public Endpoints (General Application)

#### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication handler
- `POST /api/auth/logout` - User logout
- `POST /api/auth/verify-otp` - Verify OTP for authentication

#### Reviews & Content
- `GET /api/reviews` - Get all reviews (public)
- `POST /api/reviews` - Create new review
- `GET /api/reviews/[id]` - Get single review
- `PATCH /api/reviews/[id]` - Update review
- `DELETE /api/reviews/[id]` - Delete review (soft delete)
- `GET /api/reviews/mine` - Get current user's reviews
- `POST /api/reviews/generate-image` - Generate review image

#### Comments & Interactions
- `GET /api/comments` - Get all comments
- `POST /api/comments` - Create new comment
- `GET /api/comments/[id]` - Get single comment
- `PATCH /api/comments/[id]` - Update comment
- `DELETE /api/comments/[id]` - Delete comment
- `POST /api/votes` - Vote on review/comment

#### User Management
- `GET /api/users` - Get all users (public info)
- `GET /api/user/profile` - Get current user profile
- `PATCH /api/user/profile` - Update current user profile

#### Reports & Moderation
- `GET /api/reports` - Get all reports
- `POST /api/reports` - Create new report

#### Settings & Support
- `GET /api/settings` - Get user settings
- `PATCH /api/settings` - Update user settings
- `POST /api/settings/change-password` - Change user password
- `POST /api/settings/support` - Submit support message
- `GET /api/settings/terms` - Get terms and conditions

---

## 📊 API Statistics

- **Total Endpoints**: 35
- **Admin Endpoints**: 18
- **Public Endpoints**: 17
- **Analytics Endpoints**: 5
- **CRUD Operations**: Full Create, Read, Update, Delete coverage
- **Authentication Methods**: NextAuth.js, OTP verification
- **Data Formats**: JSON (request/response)
- **Pagination**: Implemented on list endpoints
- **Filtering**: Advanced filtering on reviews, users, comments
- **Search**: Full-text search capabilities

---

## 1. Dashboard Metrics

### Get Dashboard Overview Metrics
**GET** `/api/admin/dashboard`
**Auth:** Admin Required
**Description:** Fetches key metrics for the admin dashboard overview.
**Response:**
```json
{
  "totalUsers": 100,
  "totalReviews": 50,
  "flaggedReviews": 5,
  "newSignupsLast30Days": 15,
  "monthlySignups": [
    { "month": "Apr 2025", "count": 8 },
    { "month": "May 2025", "count": 12 },
    { "month": "Jun 2025", "count": 10 },
    { "month": "Jul 2025", "count": 15 },
    { "month": "Aug 2025", "count": 20 },
    { "month": "Sep 2025", "count": 18 }
  ],
  "dau": 25, // Daily Active Users (users who logged in within the last 24 hours)
  "wau": 150, // Weekly Active Users (users who logged in within the last 7 days)
  "mau": 500  // Monthly Active Users (users who logged in within the last 30 days)
}
```
**Behavior:**
- Returns counts for total users, total non-soft-deleted reviews, and total reports.
- Provides a count of new signups in the last 30 days.
- Includes monthly signup trends for the last 6 months.
- Calculates DAU/WAU/MAU based on users' `lastLogin` timestamps (users who logged in within the last 24 hours, 7 days, or 30 days respectively).

---

## 2. User Management

### Get All Users
**GET** `/api/admin/users`
**Auth:** Admin Required
**Query Parameters (Optional):**
- `q`: Search keyword (searches `name` and `email`, case-insensitive).
- `page`: Page number for pagination (default: `1`).
- `limit`: Number of items per page (default: `10`).
**Response:**
```json
{
  "users": [
    {
      "id": "user123",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "isAdmin": false,
      "verified": true,
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```
**Behavior:**
- Returns a paginated list of all users.
- Allows searching by user name or email.

### Get Single User Details
**GET** `/api/admin/users/[id]`
**Auth:** Admin Required
**Path Parameters:**
- `id`: The ID of the user to fetch.
**Response:**
```json
{
  "id": "user123",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "isAdmin": false,
  "verified": true,
  "createdAt": "2025-01-15T10:00:00.000Z",
  "reviews": [
    {
      "id": "review456",
      "title": "Great Product",
      "content": "...",
      "createdAt": "2025-02-01T11:00:00.000Z",
      "isAnonymous": false
    }
  ],
  "comments": [
    {
      "id": "comment789",
      "content": "Helpful review!",
      "createdAt": "2025-02-02T12:00:00.000Z",
      "reviewId": "review456",
      "isAnonymous": false
    }
  ]
}
```
**Behavior:**
- Returns a single user's profile along with a list of their submitted reviews and comments.

### Update User Details
**PATCH** `/api/admin/users/[id]`
**Auth:** Admin Required
**Path Parameters:**
- `id`: The ID of the user to update.
**Body (JSON):**
```json
{
  "name": "Updated Name",    // Optional
  "email": "new.email@example.com", // Optional
  "isAdmin": true,           // Optional
  "verified": true           // Optional
}
```
**Response:**
```json
{
  "id": "user123",
  "name": "Updated Name",
  "email": "new.email@example.com",
  "isAdmin": true,
  "verified": true,
  "createdAt": "2025-01-15T10:00:00.000Z"
}
```
**Behavior:**
- Updates the specified fields for the user.
- Returns the updated user object.
- Returns `409 Conflict` if the new email is already in use.

### Delete User
**DELETE** `/api/admin/users/[id]`
**Auth:** Admin Required
**Path Parameters:**
- `id`: The ID of the user to delete.
**Response:**
```json
{ "success": true, "message": "User deleted successfully" }
```
**Behavior:**
- Performs a hard delete of the user from the database.
- **Warning:** This will also delete all associated data (reviews, comments, votes, accounts, sessions) due to Prisma's cascade delete configuration. Use with caution.

---

## 3. Content Moderation

### Get All Reviews
**GET** `/api/admin/reviews`
**Auth:** Admin Required
**Query Parameters (Optional):**
- `q`: Search keyword (searches `title` and `content`, case-insensitive).
- `tag`: Filter by a specific tag (case-insensitive).
- `location`: Filter by location (case-insensitive).
- `rating`: Filter by a specific star rating (e.g., `1`, `2`, `3`).
- `page`: Page number for pagination (default: `1`).
- `limit`: Number of items per page (default: `10`).
**Response:**
```json
{
  "reviews": [
    {
      "id": "review456",
      "title": "Great Product",
      "content": "This is a great product...",
      "tags": "product, tech",
      "location": "New York",
      "star": 3,
      "userName": "John Doe",
      "userAvatar": "/path/to/avatar.png",
      "isAnonymous": false,
      "createdAt": "2025-02-01T11:00:00.000Z",
      "user": {
        "id": "user123",
        "email": "john.doe@example.com",
        "name": "John Doe"
      }
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```
**Behavior:**
- Returns a paginated list of all non-soft-deleted reviews.
- Includes user information for each review.
- Allows filtering by various criteria.

### Get All Reports (Flagged Reviews/Comments)
**GET** `/api/admin/reports`
**Auth:** Admin Required
**Query Parameters (Optional):**
- `page`: Page number for pagination (default: `1`).
- `limit`: Number of items per page (default: `10`).
**Response:**
```json
{
  "reports": [
    {
      "id": "report1",
      "reviewId": "review456",
      "reporterUserId": "user999",
      "reason": "Offensive Content",
      "otherReason": null,
      "createdAt": "2025-03-10T14:30:00.000Z",
      "review": {
        "id": "review456",
        "title": "Offensive Review",
        "content": "...",
        "userName": "Jane Doe",
        "userAvatar": null,
        "isAnonymous": false
      },
      "reporter": {
        "id": "user999",
        "name": "Reporter User",
        "email": "reporter@example.com"
      }
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```
**Behavior:**
- Returns a paginated list of all reports (flagged reviews or comments).
- Includes details of the reported review/comment and the reporter.
- **Note:** Actions like "Dismiss Report" or "Delete Reported Content" are handled by separate API calls (e.g., `DELETE /api/reviews/[id]` for reviews, and a new endpoint for dismissing reports).

### Get All Comments
**GET** `/api/admin/comments`
**Auth:** Admin Required
**Query Parameters (Optional):**
- `q`: Search keyword (searches `content`, case-insensitive).
- `userId`: Filter by the ID of the user who posted the comment.
- `reviewId`: Filter by the ID of the review the comment belongs to.
- `page`: Page number for pagination (default: `1`).
- `limit`: Number of items per page (default: `10`).
**Response:**
```json
{
  "comments": [
    {
      "id": "comment789",
      "content": "This is a comment...",
      "isAnonymous": false,
      "createdAt": "2025-02-02T12:00:00.000Z",
      "review": {
        "id": "review456",
        "title": "Great Product"
      },
      "user": {
        "id": "user123",
        "name": "John Doe",
        "email": "john.doe@example.com"
      }
    }
  ],
  "pagination": {
    "total": 20,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```
**Behavior:**
- Returns a paginated list of all comments.
- Includes associated user and review information.
- Allows filtering by content, user ID, or review ID.

---

## 4. Support & Notifications

### Get All Support Messages
**GET** `/api/admin/support`
**Auth:** Admin Required
**Query Parameters (Optional):**
- `page`: Page number for pagination (default: `1`).
- `limit`: Number of items per page (default: `10`).
**Response:**
```json
{
  "supportMessages": [
    {
      "id": "msg1",
      "userId": "user123",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "message": "I have a question about...",
      "createdAt": "2025-04-01T09:00:00.000Z",
      "user": {
        "id": "user123",
        "name": "John Doe",
        "email": "john.doe@example.com"
      }
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```
**Behavior:**
- Returns a paginated list of all support messages.
- Includes associated user information if the message was submitted by a logged-in user.

### Send Notifications
**POST** `/api/admin/notifications/send`
**Auth:** Admin Required
**Body (JSON):**
```json
{
  "subject": "Important Update!",
  "message": "Hello users, we have a new feature...",
  "audience": "all" // "all", "verified", "unverified", "singleEmail", "byTag"
  // If audience is "singleEmail":
  // "email": "recipient@example.com"
  // If audience is "byTag":
  // "tag": "premium"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Notifications sent (or attempted).",
  "results": [
    { "email": "user1@example.com", "status": "sent" },
    { "email": "user2@example.com", "status": "failed", "error": "..." }
  ]
}
```
**Behavior:**
- Sends email notifications to the specified audience.
- Supports sending to all users, only verified users, only unverified users, or a single email address.
- Returns a summary of sending attempts for each recipient.

---

## 5. User Restrictions

### Ban User
**POST** `/api/admin/users/[id]/ban`
**Auth:** Admin Required
**Path Parameters:**
- `id`: The ID of the user to ban.
**Body (JSON):**
```json
{
  "reason": "Violation of community guidelines"
}
```
**Response:**
```json
{
  "success": true,
  "message": "User banned successfully",
  "user": {
    "id": "user123",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "isBanned": true,
    "banReason": "Violation of community guidelines",
    "bannedAt": "2025-09-04T15:00:00.000Z",
    "bannedBy": "admin456"
  }
}
```
**Behavior:**
- Sets the user's `isBanned` status to `true`
- Records the ban reason, timestamp, and admin who performed the ban
- Returns the updated user information

### Unban User
**DELETE** `/api/admin/users/[id]/ban`
**Auth:** Admin Required
**Path Parameters:**
- `id`: The ID of the user to unban.
**Response:**
```json
{
  "success": true,
  "message": "User unbanned successfully",
  "user": {
    "id": "user123",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "isBanned": false,
    "banReason": null,
    "bannedAt": null,
    "bannedBy": null
  }
}
```
**Behavior:**
- Sets the user's `isBanned` status to `false`
- Clears the ban reason, timestamp, and admin information
- Returns the updated user information

---

## 6. Analytics Deep Dive

### Review Engagement Analytics
**GET** `/api/admin/analytics/engagement`
**Auth:** Admin Required
**Query Parameters (Optional):**
- `period`: Time period for analysis (`7d`, `30d`, `90d`) - default: `30d`
**Response:**
```json
{
  "period": "30d",
  "summary": {
    "totalReviews": 150,
    "totalComments": 450,
    "totalVotes": 320,
    "avgCommentsPerReview": 3.0,
    "avgVotesPerReview": 2.13
  },
  "topEngagedReviews": [
    {
      "id": "review123",
      "title": "Amazing Product Review",
      "createdAt": "2025-09-01T10:00:00.000Z",
      "commentsCount": 25,
      "votesCount": 18,
      "engagementScore": 43
    }
  ],
  "engagementTrends": [
    {
      "date": "2025-09-01",
      "reviews": 5,
      "comments": 15,
      "votes": 12,
      "totalEngagement": 27
    }
  ]
}
```
**Behavior:**
- Provides comprehensive review engagement metrics for the specified time period
- Calculates average engagement per review
- Shows top 10 most engaged reviews based on comments + votes
- Includes daily engagement trends for the entire period

### Tag Analytics
**GET** `/api/admin/analytics/tags`
**Auth:** Admin Required
**Query Parameters (Optional):**
- `period`: Time period for analysis (`7d`, `30d`, `90d`) - default: `30d`
- `limit`: Maximum number of tags to return - default: `20`
**Response:**
```json
{
  "period": "30d",
  "summary": {
    "totalReviews": 150,
    "reviewsWithTags": 120,
    "uniqueTags": 45,
    "avgTagsPerReview": 2.3
  },
  "topTags": [
    {
      "tag": "product",
      "usageCount": 85,
      "avgRating": 4.2,
      "totalComments": 245,
      "totalVotes": 180,
      "avgCommentsPerReview": 2.9,
      "avgVotesPerReview": 2.1,
      "engagementScore": 425
    }
  ]
}
```
**Behavior:**
- Analyzes tag usage patterns across reviews
- Calculates engagement metrics per tag (comments, votes, ratings)
- Shows top tags by usage frequency
- Provides tag adoption statistics and averages

### Location Analytics
**GET** `/api/admin/analytics/locations`
**Auth:** Admin Required
**Query Parameters (Optional):**
- `period`: Time period for analysis (`7d`, `30d`, `90d`) - default: `30d`
- `limit`: Maximum number of locations to return - default: `20`
**Response:**
```json
{
  "period": "30d",
  "summary": {
    "totalReviews": 150,
    "reviewsWithLocation": 120,
    "uniqueLocations": 25,
    "locationUsageRate": 80.0
  },
  "topLocations": [
    {
      "location": "New York",
      "reviewCount": 45,
      "avgRating": 4.1,
      "totalComments": 180,
      "totalVotes": 95,
      "avgCommentsPerReview": 4.0,
      "avgVotesPerReview": 2.1,
      "engagementScore": 275
    }
  ]
}
```
**Behavior:**
- Analyzes engagement patterns by geographic location
- Calculates location-specific metrics (ratings, comments, votes)
- Shows top locations by review volume and engagement
- Provides location adoption statistics and usage rates

### User Activity Analytics (DAU/WAU/MAU Trends)
**GET** `/api/admin/analytics/user-activity`
**Auth:** Admin Required
**Query Parameters (Optional):**
- `period`: Time period for analysis (`30d`, `90d`, `180d`) - default: `90d`
**Response:**
```json
{
  "period": "90d",
  "current": {
    "dau": 45,
    "wau": 180,
    "mau": 450,
    "totalUsers": 1200
  },
  "trends": [
    {
      "date": "2025-09-01",
      "dau": 35,
      "wau": 165,
      "mau": 420,
      "newSignups": 8
    }
  ]
}
```
**Behavior:**
- Calculates Daily Active Users (DAU), Weekly Active Users (WAU), and Monthly Active Users (MAU) based on `lastLogin` timestamps
- Provides historical trends for the specified period
- Includes new user signup data for growth analysis
- Returns current metrics for real-time dashboard display

**Frontend Implementation Notes:**
- Chart visualization can be added using libraries like Recharts, Chart.js, or D3.js
- Data is structured for easy integration with line charts and trend visualizations
- The API provides all necessary data points for comprehensive user activity analysis

---
