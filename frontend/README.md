# Ketivee Search Frontend

A professional, modern search engine frontend built with React and Tailwind CSS.

## Features

### 🎯 **Professional Design**
- Clean, modern interface with professional styling
- Responsive design that works on all devices
- Smooth animations and transitions
- Professional color scheme and typography

### 🔍 **Search Functionality**
- Real-time search with AI-powered results
- Voice search capability
- Visual search support
- Quick search suggestions
- Advanced filtering and categorization

### 👤 **User Experience**
- **Guest Users**: Can search freely without any restrictions
- **Login Suggestion**: Subtle popup appears after 3 seconds suggesting login
- **Account Integration**: Seamless integration with account.ketivee.com
- **Professional Navigation**: Clean header with dropdown menus

### 🎨 **UI Components**

#### Header Component
- Professional navigation bar
- User menu with login/signup options
- Mobile-responsive hamburger menu
- Search button for quick access

#### Search Section
- Large, prominent search box
- Voice and visual search buttons
- Quick search suggestions
- Professional loading states

#### Login Suggestion Popup
- Appears on the right side after 3 seconds
- Non-intrusive design
- Highlights benefits of creating an account
- Easy to dismiss

#### Search Results
- Clean, card-based layout
- Tabbed navigation for different content types
- Pagination support
- Professional result formatting

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd ketiveeserchengin/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── Header.jsx              # Professional navigation header
│   ├── SearchSection.jsx       # Main search interface
│   ├── SearchResults.jsx       # Search results display
│   ├── TabNavigation.jsx       # Content type tabs
│   ├── LoginSuggestion.jsx     # Login suggestion popup
│   ├── CrawlerStatus.jsx       # Web crawler status
│   ├── Trending.jsx           # Trending searches
│   └── VoiceSearch.jsx        # Voice search component
├── App.jsx                     # Main application component
├── App.css                     # Professional styling
└── index.jsx                   # Application entry point
```

## Key Features

### 🔐 **Authentication Flow**
- Users can search without logging in
- Login suggestion appears after 3 seconds
- Redirects to account.ketivee.com for authentication
- Seamless integration with backend user system

### 🎨 **Design System**
- **Colors**: Professional blue and purple gradient theme
- **Typography**: Clean, readable fonts
- **Spacing**: Consistent padding and margins
- **Shadows**: Professional depth and elevation
- **Animations**: Smooth, subtle transitions

### 📱 **Responsive Design**
- Mobile-first approach
- Tablet and desktop optimizations
- Touch-friendly interface
- Adaptive navigation

### ⚡ **Performance**
- Optimized bundle size
- Lazy loading for components
- Efficient state management
- Fast search response times

## API Integration

The frontend integrates with the Ketivee Search backend API:

- **Search**: `/api/search`
- **Trending**: `/api/trending`
- **Analytics**: `/api/analytics`
- **User History**: `/api/user-search-history`

## Customization

### Styling
The app uses Tailwind CSS with custom professional styles. Key customization points:

- **Colors**: Modify the gradient colors in `App.css`
- **Components**: Update component styles in individual files
- **Animations**: Custom animations defined in `App.css`

### Configuration
- API endpoints can be configured in `App.jsx`
- Login/signup URLs can be updated in the handler functions
- Search suggestions can be modified in `SearchSection.jsx`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Ketivee Search Engine suite.

---

**Built with ❤️ by the Ketivee Team** 