# Ketivee Search Engine - Database Integration

## Overview

The Ketivee Search Engine now includes comprehensive MongoDB database integration for persistent data storage, user activity tracking, and advanced analytics. All search results, user interactions, and system data are automatically synced to the database in real-time.

## Features

### ✅ Real Data Persistence
- All search results are stored in MongoDB
- User search queries and interactions are tracked
- Crawled web pages are indexed and stored
- User activity and behavior analytics

### ✅ Advanced Analytics
- Search performance metrics
- User behavior analysis
- Trending queries and content
- Educational content detection and tracking

### ✅ User Activity Tracking
- Search queries and results
- Click tracking and position analysis
- Session management
- User preferences and patterns

### ✅ Database Collections

#### 1. `search_results`
Stores all search results with comprehensive metadata:
- URL, title, description, content
- Educational content classification
- Category and source information
- Search and click counts
- Relevance scores and metadata

#### 2. `search_queries`
Tracks all user search queries:
- Query text and normalization
- User and session information
- Search performance metrics
- Query history and trends

#### 3. `crawled_pages`
Stores web crawling data:
- Page content and metadata
- Crawl depth and status
- Links and images extracted
- Response times and status codes

#### 4. `user_activity`
Tracks all user interactions:
- Search activities
- Click events
- Page views
- Session data and analytics

## Database Models

### SearchResult Model
```javascript
{
  _id: ObjectId,
  url: String,
  title: String,
  description: String,
  content: String,
  snippet: String,
  keywords: Array,
  category: String,
  source: String,
  score: Number,
  isEducational: Boolean,
  educationalType: String,
  educationalLevel: String,
  subjects: Array,
  hasExercises: Boolean,
  hasExamples: Boolean,
  domain: String,
  language: String,
  author: String,
  contentLength: Number,
  metadata: Object,
  createdAt: Date,
  updatedAt: Date,
  crawlCount: Number,
  searchCount: Number,
  clickCount: Number,
  realData: Boolean,
  independent: Boolean
}
```

### SearchQuery Model
```javascript
{
  _id: ObjectId,
  query: String,
  originalQuery: String,
  searchCount: Number,
  totalResults: Number,
  totalLatency: Number,
  category: String,
  users: Array,
  userAgents: Array,
  ipAddresses: Array,
  searchHistory: Array,
  firstSearched: Date,
  lastSearched: Date,
  createdAt: Date,
  updatedAt: Date,
  realData: Boolean,
  independent: Boolean
}
```

### CrawledPage Model
```javascript
{
  _id: ObjectId,
  url: String,
  title: String,
  description: String,
  content: String,
  contentType: String,
  language: String,
  domain: String,
  crawlDepth: Number,
  status: String,
  statusCode: Number,
  responseTime: Number,
  contentLength: Number,
  links: Array,
  images: Array,
  metadata: Object,
  headers: Object,
  userAgent: String,
  crawledAt: Date,
  updatedAt: Date,
  crawlCount: Number,
  realData: Boolean,
  independent: Boolean
}
```

### UserActivity Model
```javascript
{
  _id: ObjectId,
  userId: String,
  sessionId: String,
  activityType: String,
  query: String,
  url: String,
  ipAddress: String,
  userAgent: String,
  referrer: String,
  duration: Number,
  success: Boolean,
  error: String,
  metadata: Object,
  timestamp: Date,
  realData: Boolean,
  independent: Boolean
}
```

## API Endpoints

### Search Endpoints (Enhanced)
```
GET /api/search?q=query&page=1&limit=10&type=all
POST /api/search
GET /api/search/suggest?q=query
GET /api/search/trending?limit=10&period=all
POST /api/search/click
GET /api/search/most-clicked?q=query
GET /api/search/stats
GET /api/search/user/:userId/activity
GET /api/search/user/:userId/stats
```

### Database Management Endpoints
```
GET /api/database/health
GET /api/database/stats
GET /api/database/stats/search-results
GET /api/database/stats/search-queries
GET /api/database/stats/crawler
GET /api/database/stats/user-activity
GET /api/database/search?q=query&page=1&limit=10
GET /api/database/trending?limit=10&period=all
GET /api/database/suggestions?q=query&limit=5
GET /api/database/educational?limit=20
GET /api/database/trending-results?limit=10
GET /api/database/collections
GET /api/database/export/:collection?limit=1000&format=json
POST /api/database/cleanup
```

## Usage Examples

### Basic Search with Database Sync
```javascript
// Search with user tracking
const response = await fetch('/api/search?q=javascript tutorial', {
  headers: {
    'X-User-ID': 'user123',
    'X-Session-ID': 'session456'
  }
});

const results = await response.json();
console.log('Database sync:', results.engines.database_sync);
```

### Record Click Activity
```javascript
// Record a click on a search result
await fetch('/api/search/click', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-User-ID': 'user123',
    'X-Session-ID': 'session456'
  },
  body: JSON.stringify({
    query: 'javascript tutorial',
    url: 'https://example.com/tutorial',
    position: 1
  })
});
```

### Get User Activity
```javascript
// Get user's search history
const activity = await fetch('/api/search/user/user123/activity?page=1&limit=20');
const userActivity = await activity.json();
console.log('User activities:', userActivity.activities);
```

### Database Statistics
```javascript
// Get comprehensive database stats
const stats = await fetch('/api/database/stats');
const databaseStats = await stats.json();
console.log('Search results:', databaseStats.searchResults.totalResults);
console.log('Search queries:', databaseStats.searchQueries.totalQueries);
console.log('User activities:', databaseStats.userActivity.activityTypes);
```

## Configuration

### Environment Variables
```bash
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/ketivee_search

# Redis Connection (for caching)
REDIS_URL=redis://localhost:6379

# Database Settings
SEARCH_CACHE_TTL=3600
SUGGESTION_CACHE_TTL=1800
MAX_SEARCH_RESULTS=100
MIN_QUERY_LENGTH=2
```

### Database Indexes
The system automatically creates optimized indexes for:
- Text search on titles, content, and descriptions
- URL uniqueness constraints
- Category and source filtering
- Timestamp-based queries
- User activity tracking
- Educational content detection

## Testing

### Run Database Integration Tests
```bash
cd ketiveeserchengin/backend
node test-database-integration.js
```

### Test Individual Components
```bash
# Test search service with database
node test-real-search.js

# Test database health
curl http://localhost:6329/api/database/health

# Test database statistics
curl http://localhost:6329/api/database/stats
```

## Performance Features

### Real-time Data Sync
- All search results are immediately saved to database
- User activities are tracked in real-time
- Click events update relevance scores
- Trending queries are calculated automatically

### Optimized Queries
- Text search with relevance scoring
- Category and source filtering
- Pagination and result limiting
- Aggregation pipelines for statistics

### Caching Strategy
- Redis caching for frequently accessed data
- Database query result caching
- User session caching
- Trending data caching

## Analytics and Insights

### Search Analytics
- Query performance metrics
- Result relevance analysis
- User satisfaction tracking
- Educational content detection

### User Behavior Analytics
- Search patterns and preferences
- Click-through rates
- Session duration analysis
- User engagement metrics

### System Performance
- Database query performance
- Crawler efficiency metrics
- Response time analysis
- Error rate tracking

## Data Management

### Automatic Cleanup
- Old search results (30 days)
- Expired user activity (90 days)
- Outdated crawled pages (30 days)
- Inactive search queries (90 days)

### Data Export
- JSON and CSV export formats
- Collection-specific exports
- Filtered data exports
- Analytics report generation

### Backup and Recovery
- MongoDB backup strategies
- Data consistency checks
- Index optimization
- Performance monitoring

## Security Features

### Data Privacy
- User data anonymization options
- GDPR compliance features
- Data retention policies
- Access control mechanisms

### Input Validation
- Query sanitization
- URL validation
- Content filtering
- Rate limiting

## Monitoring and Maintenance

### Health Checks
```bash
# Database health
GET /api/database/health

# System health
GET /health

# Collection statistics
GET /api/database/collections
```

### Performance Monitoring
- Query execution times
- Database connection status
- Index usage statistics
- Memory and storage metrics

### Error Handling
- Graceful database failures
- Fallback to in-memory storage
- Error logging and reporting
- Automatic retry mechanisms

## Benefits

### ✅ Complete Data Persistence
- No data loss between restarts
- Historical search data available
- User behavior analysis
- Performance trend tracking

### ✅ Advanced Analytics
- Real-time search insights
- User engagement metrics
- Content performance analysis
- System optimization data

### ✅ Scalability
- Horizontal scaling support
- Database sharding ready
- Load balancing compatible
- Performance optimization

### ✅ User Experience
- Personalized search suggestions
- Trending content discovery
- Educational content filtering
- User preference learning

## Future Enhancements

### Planned Features
- Machine learning integration
- Advanced recommendation engine
- Real-time collaboration features
- Multi-language support
- Advanced analytics dashboard
- API rate limiting and quotas
- Enterprise features and SSO

### Performance Optimizations
- Database query optimization
- Caching strategy improvements
- Index optimization
- Connection pooling enhancements

---

## Quick Start

1. **Install MongoDB and Redis**
2. **Set environment variables**
3. **Start the server**: `node server.js`
4. **Test database integration**: `node test-database-integration.js`
5. **Access API endpoints**: `http://localhost:6329/api/database/health`

The database integration provides a robust foundation for the Ketivee Search Engine, ensuring all data is persisted, analyzed, and optimized for the best user experience. 