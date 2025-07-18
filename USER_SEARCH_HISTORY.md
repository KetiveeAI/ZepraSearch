# User Search History Management

## Overview

The Ketivee Search Engine now includes comprehensive user search history management with automatic data retention, cleanup, and export functionality. This system allows logged-in users to view, manage, and export their search queries while optimizing server storage through automatic cleanup.

## Key Features

### 🔐 User Authentication
- **Required**: All search history operations require user authentication
- **User ID**: Passed via `X-User-ID` header or query parameter
- **Session Tracking**: Optional session ID for enhanced tracking

### 📊 Search History Tracking
- **Automatic Saving**: All search queries are automatically saved for logged-in users
- **Rich Metadata**: Includes query, results count, latency, success status, category
- **Session Info**: Tracks IP address, user agent, and session ID
- **Results Storage**: Stores first 10 search results for reference

### 🗓️ Data Retention Policy
- **15-Day Retention**: Search data is automatically deleted after 15 days
- **Automatic Cleanup**: Runs every 24 hours to remove expired data
- **Manual Cleanup**: Admin can trigger immediate cleanup
- **Storage Optimization**: Reduces server storage costs for free tier users

### 📤 Data Export
- **JSON Format**: Complete search data with metadata
- **CSV Format**: Tabular data for spreadsheet analysis
- **Download**: Direct file download with timestamped filenames
- **Local Storage**: Users can save data to their devices

### 🗑️ Data Management
- **Individual Deletion**: Delete specific search queries
- **Bulk Deletion**: Delete multiple searches with filters
- **Category Filtering**: Delete searches by category
- **Date Range Filtering**: Delete searches within date ranges

## API Endpoints

### Base URL
```
/api/user-search-history
```

### Authentication
All endpoints require user authentication via:
- Header: `X-User-ID: your-user-id`
- Query parameter: `?userId=your-user-id`
- Body parameter: `{ "userId": "your-user-id" }`

### 1. Get Search History
```http
GET /api/user-search-history/history
```

**Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)
- `startDate` (optional): Filter from date (ISO format)
- `endDate` (optional): Filter to date (ISO format)
- `category` (optional): Filter by category
- `query` (optional): Search within queries

**Response:**
```json
{
  "success": true,
  "searches": [
    {
      "_id": "search-id",
      "query": "JavaScript tutorials",
      "originalQuery": "JavaScript tutorials",
      "category": "general",
      "resultsCount": 10,
      "latency": 245,
      "success": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "sessionId": "session-123"
    }
  ],
  "total": 50,
  "page": 1,
  "pages": 3,
  "hasMore": true,
  "realData": true,
  "independent": true
}
```

### 2. Get Search Statistics
```http
GET /api/user-search-history/stats
```

**Parameters:**
- `days` (optional): Period in days (default: 30)

**Response:**
```json
{
  "success": true,
  "stats": {
    "period": "30 days",
    "totalSearches": 150,
    "successfulSearches": 142,
    "successRate": "94.67",
    "totalResults": 1420,
    "avgLatency": 234.5,
    "uniqueQueries": 89,
    "categories": [
      { "_id": "general", "count": 45 },
      { "_id": "educational", "count": 32 }
    ],
    "popularQueries": [
      { "_id": "JavaScript", "count": 15 },
      { "_id": "React", "count": 12 }
    ],
    "realData": true,
    "independent": true
  }
}
```

### 3. Get Search Summary
```http
GET /api/user-search-history/summary
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "recentSearches": [...],
    "totalSearches": 150,
    "successRate": "94.67",
    "avgLatency": 234.5,
    "uniqueQueries": 89,
    "categories": [...],
    "popularQueries": [...],
    "dataRetentionDays": 15,
    "realData": true,
    "independent": true
  }
}
```

### 4. Get Retention Information
```http
GET /api/user-search-history/retention
```

**Response:**
```json
{
  "success": true,
  "retention": {
    "retentionDays": 15,
    "autoDelete": true,
    "lastCleanup": "2024-01-15T10:00:00.000Z",
    "nextCleanup": "2024-01-16T10:00:00.000Z",
    "dataSize": "Calculating...",
    "exportFormats": ["json", "csv"],
    "features": [
      "Automatic cleanup after 15 days",
      "Manual deletion of individual searches",
      "Bulk deletion with filters",
      "Data export in JSON/CSV formats",
      "Search statistics and analytics",
      "Category-based filtering",
      "Date range filtering"
    ],
    "realData": true,
    "independent": true
  }
}
```

### 5. Export Search Data
```http
GET /api/user-search-history/export
```

**Parameters:**
- `format` (optional): Export format - `json` or `csv` (default: json)

**Response:**
- **JSON**: Returns JSON data with download headers
- **CSV**: Returns CSV data with download headers

### 6. Delete Individual Search
```http
DELETE /api/user-search-history/search/:searchId
```

**Response:**
```json
{
  "success": true,
  "message": "Search query deleted successfully",
  "deletedCount": 1,
  "realData": true,
  "independent": true
}
```

### 7. Delete Search History (Bulk)
```http
DELETE /api/user-search-history/history
```

**Body:**
```json
{
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-01-15T23:59:59.999Z",
  "category": "general"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Search history deleted successfully",
  "deletedCount": 25,
  "realData": true,
  "independent": true
}
```

### 8. Manual Cleanup
```http
POST /api/user-search-history/cleanup
```

**Response:**
```json
{
  "success": true,
  "message": "Cleanup completed successfully",
  "deletedCount": 15,
  "realData": true,
  "independent": true
}
```

## Integration with Account System

### Account.ketivee.com Integration
The user search history system is designed to integrate with the account management system at `account.ketivee.com`:

1. **User Authentication**: Uses the same user ID system as the account platform
2. **Data Privacy**: Each user can only access their own search history
3. **Data Export**: Users can download their data for local storage
4. **Account Dashboard**: Search history can be displayed in user account dashboard

### Frontend Integration Example
```javascript
// Get user search history
const getSearchHistory = async (userId, page = 1) => {
  const response = await fetch(`/api/user-search-history/history?page=${page}`, {
    headers: {
      'X-User-ID': userId
    }
  });
  return response.json();
};

// Export user data
const exportUserData = async (userId, format = 'json') => {
  const response = await fetch(`/api/user-search-history/export?format=${format}`, {
    headers: {
      'X-User-ID': userId
    }
  });
  
  if (format === 'csv') {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search-history-${userId}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  } else {
    const data = await response.json();
    // Handle JSON data
  }
};

// Delete search query
const deleteSearch = async (userId, searchId) => {
  const response = await fetch(`/api/user-search-history/search/${searchId}`, {
    method: 'DELETE',
    headers: {
      'X-User-ID': userId
    }
  });
  return response.json();
};
```

## Database Schema

### UserSearchHistory Collection
```javascript
{
  _id: ObjectId,
  userId: String,           // User identifier
  query: String,            // Normalized query
  originalQuery: String,    // Original query as entered
  sessionId: String,        // Session identifier
  ipAddress: String,        // User IP address
  userAgent: String,        // User agent string
  resultsCount: Number,     // Number of results returned
  latency: Number,          // Search latency in ms
  success: Boolean,         // Search success status
  error: String,            // Error message if failed
  category: String,         // Search category
  results: Array,           // First 10 search results
  createdAt: Date,          // Creation timestamp
  updatedAt: Date,          // Last update timestamp
  expiresAt: Date,          // Expiration timestamp (15 days)
  realData: Boolean,        // Real data flag
  independent: Boolean      // Independent system flag
}
```

## Storage Optimization

### Server Storage Benefits
1. **Automatic Cleanup**: 15-day retention reduces storage costs
2. **Limited Results**: Only stores first 10 results per search
3. **Compressed Storage**: Efficient MongoDB storage
4. **User Export**: Users can download and store data locally

### Free Tier Optimization
- **Reduced Storage**: Automatic cleanup keeps storage minimal
- **User Control**: Users can delete their own data
- **Local Storage**: Export functionality allows local data storage
- **Efficient Queries**: Indexed queries for fast retrieval

## Security Features

### Data Privacy
- **User Isolation**: Users can only access their own data
- **Authentication Required**: All operations require user ID
- **Secure Headers**: Uses secure authentication headers
- **Data Validation**: Input validation and sanitization

### Access Control
- **User-Specific Access**: Each user only sees their own searches
- **Session Tracking**: Optional session-based tracking
- **Audit Trail**: All operations are logged
- **Error Handling**: Secure error responses

## Testing

### Test Script
Run the test script to verify functionality:
```bash
node test-user-search-history.js
```

### Test Coverage
- ✅ Search query saving
- ✅ Search history retrieval
- ✅ Search statistics
- ✅ Search summary
- ✅ Retention information
- ✅ Data export (JSON/CSV)
- ✅ Individual search deletion
- ✅ Authentication requirements
- ✅ 15-day automatic cleanup
- ✅ Server storage optimization

## Configuration

### Environment Variables
```bash
# Database connection
MONGODB_URI=mongodb://localhost:27017/ketivee_search

# Retention settings
SEARCH_HISTORY_RETENTION_DAYS=15
CLEANUP_INTERVAL_HOURS=24

# Export settings
MAX_EXPORT_RECORDS=10000
```

### Default Settings
- **Retention Period**: 15 days
- **Cleanup Interval**: 24 hours
- **Max Export Records**: 10,000
- **Results Storage**: First 10 results per search
- **Page Size**: 20 records per page

## Benefits

### For Users
1. **Search History**: View and manage search queries
2. **Data Export**: Download search data for local storage
3. **Privacy Control**: Delete individual or bulk searches
4. **Analytics**: View search statistics and trends
5. **Data Ownership**: Full control over personal search data

### For System
1. **Storage Optimization**: Automatic cleanup reduces costs
2. **Performance**: Efficient indexing and queries
3. **Scalability**: Handles large numbers of users
4. **Compliance**: Data retention and privacy controls
5. **Integration**: Seamless account system integration

### For Free Tier
1. **Cost Reduction**: Minimal server storage usage
2. **User Satisfaction**: Full feature access
3. **Data Portability**: Export functionality
4. **Privacy**: User-controlled data management
5. **Sustainability**: Efficient resource usage

## Future Enhancements

### Planned Features
1. **Search Analytics Dashboard**: Visual analytics for users
2. **Search Recommendations**: Based on history
3. **Data Synchronization**: Cross-device sync
4. **Advanced Filtering**: More filter options
5. **Bulk Operations**: Enhanced bulk management
6. **API Rate Limiting**: Enhanced rate limiting
7. **Data Encryption**: Enhanced security
8. **Backup Integration**: Automated backups

### Integration Roadmap
1. **Account Dashboard**: Full integration with account.ketivee.com
2. **Mobile App**: Mobile search history management
3. **Browser Extension**: Browser-based history sync
4. **Third-party APIs**: External service integration
5. **Analytics Platform**: Advanced analytics integration

## Support

### Documentation
- API Documentation: Available at `/api/user-search-history`
- Health Check: `/health` endpoint
- Database Status: `/api/database/health`

### Troubleshooting
1. **Authentication Issues**: Ensure user ID is provided
2. **Database Connection**: Check MongoDB connection
3. **Export Issues**: Verify format parameter
4. **Cleanup Issues**: Check scheduled cleanup logs
5. **Performance Issues**: Monitor database indexes

### Contact
For support and questions about the user search history system, please refer to the main Ketivee Search Engine documentation or contact the development team. 