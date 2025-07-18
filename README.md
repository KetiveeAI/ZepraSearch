# Ketivee Search Engine

🚀 **Independent & Self-Sufficient Search Engine with C++ Bot & AI-Powered Discovery**

A complete search engine solution that operates independently without external dependencies, featuring a high-performance C++ crawler bot, intelligent content analysis, and comprehensive analytics.

## 🌟 Features

### 🔍 **Independent Search**
- **No External Dependencies**: Completely self-sufficient, no reliance on Google, Bing, or other search APIs
- **C++ Bot Integration**: High-performance web crawler built in C++ for maximum speed
- **Internal Indexing**: Own content indexing and search capabilities
- **Educational Content Detection**: Automatically identifies and prioritizes educational content

### 🕷️ **Advanced Crawling**
- **Multi-threaded Crawler**: Efficient parallel processing
- **Smart Content Extraction**: Intelligent HTML parsing and content extraction
- **Category Classification**: Automatic content categorization
- **Quality Scoring**: Advanced relevance and quality algorithms
- **Duplicate Detection**: Prevents indexing of duplicate content

### 📊 **Analytics & Monitoring**
- **Real-time Analytics**: Comprehensive search and performance metrics
- **User Behavior Tracking**: Click tracking and user session analysis
- **System Health Monitoring**: Performance monitoring and error tracking
- **Trending Analysis**: Popular queries and content trends
- **Export Capabilities**: JSON and CSV data export

### 🎨 **Modern Frontend**
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Search**: Instant search results with debouncing
- **Category Filters**: Filter results by content type
- **Educational Badges**: Visual indicators for educational content
- **Search Statistics**: Real-time performance metrics

## 🏗️ Architecture

```
ketiveeserchengin/
├── backend/                 # Node.js Backend Server
│   ├── cpp_crawler/        # C++ Crawler Bot
│   ├── services/           # Business Logic Services
│   ├── routes/             # API Routes
│   ├── config/             # Configuration Files
│   └── data/               # Analytics Data Storage
├── frontend/               # Web Frontend
│   ├── index.html          # Main Search Interface
│   └── server.js           # Frontend Server
└── start-system.bat        # System Startup Script
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **Windows** (for the provided batch script)
- **Internet Connection** (for initial crawling)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ketiveeserchengin
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Start the system**
   ```bash
   # Windows (recommended)
   start-system.bat
   
   # Manual start
   cd backend && node server.js
   cd frontend && node server.js
   ```

4. **Access the system**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:6329
   - **Analytics**: http://localhost:6329/api/analytics/summary

## 📡 API Endpoints

### Search API
- `GET /api/search?q=query` - Perform search
- `GET /api/search/suggest?q=query` - Get search suggestions
- `GET /api/search/trending` - Get trending searches
- `POST /api/search/click` - Record click events

### Analytics API
- `GET /api/analytics/search` - Search analytics
- `GET /api/analytics/performance` - Performance metrics
- `GET /api/analytics/trending` - Trending analytics
- `GET /api/analytics/health` - System health
- `GET /api/analytics/realtime` - Real-time metrics

### Crawler API
- `POST /api/crawler/start` - Start crawling
- `GET /api/crawler/search?q=query` - Search crawled content
- `GET /api/crawler/stats` - Crawler statistics
- `GET /api/crawler/pages` - List crawled pages

### Configuration API
- `GET /api/config` - System configuration
- `GET /api/config/:section` - Specific configuration section
- `PUT /api/config` - Update configuration

## 🔧 Configuration

### Crawler Configuration
Edit `backend/config/crawlerConfig.js` to customize:

- **Seed URLs**: Starting points for crawling
- **Crawling Parameters**: Depth, delays, timeouts
- **Content Filtering**: File types and patterns to include/exclude
- **Domain Restrictions**: Allowed and blocked domains
- **Quality Scoring**: Relevance and quality factors

### Server Configuration
Edit `backend/config.js` to modify:

- **Port Settings**: Backend and frontend ports
- **Database Settings**: MongoDB and Redis connections
- **Security Settings**: Rate limiting and CORS
- **Logging**: Log levels and output

## 📊 Analytics Dashboard

The system includes comprehensive analytics:

### Search Analytics
- Total searches and success rates
- Average response times
- Popular queries
- Category distribution
- Educational content rates

### Performance Analytics
- Operation success rates
- Response time breakdowns
- Error tracking
- System throughput

### User Analytics
- User session tracking
- Click-through rates
- Search patterns
- Content preferences

### System Health
- Real-time system status
- Error rates and trends
- Performance metrics
- Resource utilization

## 🕷️ C++ Crawler Bot

The C++ crawler provides high-performance web crawling:

### Features
- **HTTP Client**: Advanced HTTP client with CURL
- **HTML Parser**: Intelligent content extraction
- **JSON Output**: Structured data output
- **Multi-threading**: Parallel processing capabilities
- **Error Handling**: Robust error recovery

### Building the C++ Bot
```bash
cd backend/cpp_crawler
# Windows
build_enhanced_bot.bat

# Linux/Mac
./build_enhanced_bot.sh
```

## 🔍 Search Features

### Content Types
- **All**: General search across all content
- **Educational**: Tutorials, courses, documentation
- **News**: News articles and media
- **Videos**: Video content and platforms
- **Documents**: Files and documents
- **Shopping**: E-commerce and products

### Advanced Features
- **Educational Detection**: Automatic identification of educational content
- **Category Classification**: Smart content categorization
- **Relevance Scoring**: Advanced ranking algorithms
- **Click Tracking**: User behavior analysis
- **Trending Searches**: Popular query tracking

## 📈 Monitoring & Analytics

### Real-time Metrics
- Searches per hour
- Error rates
- Response times
- Active users
- System status

### Data Export
- **JSON Export**: Complete analytics data
- **CSV Export**: Tabular data for analysis
- **Scheduled Backups**: Automatic data persistence
- **Historical Analysis**: Trend analysis over time

## 🛠️ Development

### Project Structure
```
backend/
├── services/           # Business logic
│   ├── enhancedSearchService.js
│   ├── analyticsService.js
│   ├── trendingService.js
│   └── webCrawlerService.js
├── routes/            # API endpoints
│   ├── search.js
│   ├── analytics.js
│   ├── crawler.js
│   └── config.js
├── cpp_crawler/       # C++ crawler bot
│   ├── enhanced_search_bot.cpp
│   └── build scripts
└── config/           # Configuration files
```

### Adding New Features
1. **Service Layer**: Add business logic in `services/`
2. **API Routes**: Create endpoints in `routes/`
3. **Frontend**: Update UI in `frontend/index.html`
4. **Configuration**: Update config files as needed

## 🔒 Security

### Built-in Security
- **Rate Limiting**: Prevents abuse
- **CORS Protection**: Cross-origin request security
- **Input Validation**: Query sanitization
- **Error Handling**: Secure error responses
- **User Agent Tracking**: Bot detection

### Best Practices
- Regular security updates
- Input validation and sanitization
- Rate limiting and abuse prevention
- Secure configuration management
- Monitoring and alerting

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- **Documentation**: Check the docs folder
- **Issues**: Create an issue on GitHub
- **Analytics**: Use the built-in analytics dashboard

## 🎯 Roadmap

### Planned Features
- [ ] **Machine Learning Integration**: Advanced content analysis
- [ ] **Voice Search**: Speech-to-text capabilities
- [ ] **Mobile App**: Native mobile applications
- [ ] **API Rate Limiting**: Advanced rate limiting
- [ ] **Content Caching**: Intelligent caching system
- [ ] **Multi-language Support**: Internationalization
- [ ] **Advanced Analytics**: Predictive analytics
- [ ] **Real-time Collaboration**: Multi-user features

### Performance Improvements
- [ ] **Database Optimization**: Query optimization
- [ ] **Caching Layer**: Redis integration
- [ ] **CDN Integration**: Content delivery optimization
- [ ] **Load Balancing**: Horizontal scaling
- [ ] **Microservices**: Service decomposition

---

**Built with ❤️ by the Ketivee Team**

*Independent Search Engine for the Modern Web* 