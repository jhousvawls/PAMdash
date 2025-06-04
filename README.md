# WP Engine Sales Performance Dashboard

A modern, gamified sales performance dashboard with WordPress backend integration. Built with React and featuring WP Engine's official brand guidelines.

![WP Engine Sales Dashboard](https://img.shields.io/badge/WP%20Engine-Sales%20Dashboard-blue)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![WordPress](https://img.shields.io/badge/WordPress-Plugin-blue)

## 🚀 Features

### React Dashboard
- **Gamified Interface** - Quest-themed performance tracking with levels and achievements
- **WP Engine Branding** - Official colors (Navy #002447, Blue #006bd6, Teal #0ECAD4) and typography (Lora + Inter)
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Real-time Calculations** - Dynamic scoring based on configurable weightings
- **CSV Upload** - Easy data import with template download
- **Multiple Views** - Leaderboard and detailed performance overview

### WordPress Backend
- **Data Persistence** - Stores uploaded sales data in WordPress database
- **REST API** - Clean API endpoints for React integration
- **Admin Interface** - WordPress admin panel for settings management
- **Configurable Weightings** - Adjust metric percentages (must total 100%)
- **Upload History** - View and manage all uploaded sales data

## 📊 Sales Metrics

The dashboard tracks 5 key sales metrics with configurable weightings:

- **Closed Won MRR** (60%) - Revenue from closed deals
- **Opportunities Passed MRR** (15%) - Pipeline value from passed opportunities  
- **Calls** (8%) - Number of sales calls made
- **PEM** (10%) - Prospect engagement meetings
- **Opportunities Count** (7%) - Number of opportunities created

## 🏗️ Project Structure

```
sales-dashboard/
├── src/                          # React application
│   ├── App.js                    # Main app component
│   ├── SalesQuestDashboard.js    # Dashboard component
│   ├── index.js                  # React entry point
│   └── *.css                     # Styling files
├── public/                       # Static assets
│   └── index.html                # HTML template with fonts
├── wordpress-plugin/             # WordPress backend
│   ├── sales-dashboard/          # Plugin files
│   │   ├── sales-dashboard.php   # Main plugin file
│   │   ├── admin-page.php        # Admin interface
│   │   └── README.md             # Plugin documentation
│   └── INSTALLATION-GUIDE.md     # Quick setup guide
├── package.json                  # React dependencies
└── README.md                     # This file
```

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/your-username/wp-engine-sales-dashboard.git
cd wp-engine-sales-dashboard
```

### 2. Install React Dependencies
```bash
npm install
```

### 3. Run React Development Server
```bash
npm start
```
The dashboard will open at `http://localhost:3000`

### 4. Install WordPress Plugin
1. Zip the `wordpress-plugin/sales-dashboard` folder
2. Upload to WordPress Admin → Plugins → Add New
3. Activate the "Sales Dashboard" plugin
4. Configure settings at WordPress Admin → Sales Dashboard

## 🔧 Configuration

### WordPress API Integration

Update the React app to connect to your WordPress backend:

```javascript
// In SalesQuestDashboard.js
const WORDPRESS_API_BASE = 'https://your-wordpress-site.com/wp-json/sales/v1';
```

### Metric Weightings

Adjust weightings in WordPress Admin → Sales Dashboard:
- Must total exactly 100%
- Real-time validation
- Affects all score calculations

## 📡 API Endpoints

The WordPress plugin provides these REST API endpoints:

- `GET /wp-json/sales/v1/data` - Get latest sales data
- `POST /wp-json/sales/v1/upload` - Save uploaded sales data  
- `GET /wp-json/sales/v1/settings` - Get metric weightings
- `PUT /wp-json/sales/v1/settings` - Update weightings

## 🎨 Design System

### Colors (WP Engine Brand)
- **Navy**: #002447 (Headers, text, primary buttons)
- **Blue**: #006bd6 (Secondary buttons, interactive elements)
- **Teal**: #0ECAD4 (Accent color, progress indicators, success states)

### Typography
- **Headers**: Lora (serif) - Professional, readable headlines
- **Body**: Inter (sans-serif) - Clean, modern interface text

### Components
- **Quest Cards** - Individual performance tracking
- **Leaderboard** - Competitive ranking view
- **Progress Bars** - Visual completion indicators
- **Modal Upload** - Clean file upload interface

## 📋 CSV Data Format

Upload sales data using this CSV format:

```csv
PAM,Calls Goal,Calls Actual,Calls %,PEM Goal,PEM Actual,PEM %,Opps Goal,Opps Actual,Opps Actual %,Opps Passed Goal,Opps Passed Actual,Opps Passed %,Closed Won Goal,Closed Won Actual,Closed Won %
Sarah Johnson,100,89,89,20,24,120,8,8,100,50000,58000,116,25000,32000,128
```

Download the template from the dashboard for the exact format.

## 🚀 Deployment

### React App
- Build: `npm run build`
- Deploy to any static hosting (Netlify, Vercel, etc.)
- Or host on WP Engine alongside WordPress

### WordPress Plugin
- Upload to WP Engine WordPress installation
- Activate and configure settings
- Ensure REST API is accessible

## 🔒 Security Considerations

- **Upload Permissions**: Currently allows all users (modify in production)
- **Settings Access**: Requires WordPress admin privileges
- **CORS**: May need configuration for cross-domain requests
- **Data Validation**: Server-side validation for all inputs

## 🛠️ Development

### React Development
```bash
npm start          # Development server
npm run build      # Production build
npm test           # Run tests
```

### WordPress Development
- Edit plugin files in `wordpress-plugin/sales-dashboard/`
- Test API endpoints directly in browser
- Use WordPress debug mode for troubleshooting

## 📚 Documentation

- **Plugin README**: `wordpress-plugin/sales-dashboard/README.md`
- **Installation Guide**: `wordpress-plugin/INSTALLATION-GUIDE.md`
- **API Documentation**: See plugin README for detailed endpoint docs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For issues and questions:

1. **React Issues**: Check browser console and React error messages
2. **WordPress Issues**: Check WordPress debug logs and plugin status
3. **API Issues**: Test endpoints directly and verify plugin activation
4. **Styling Issues**: Verify Tailwind CSS and Google Fonts are loading

## 🎯 Roadmap

- [ ] User authentication and role-based access
- [ ] Historical data tracking and trends
- [ ] Email notifications for achievements
- [ ] Advanced reporting and analytics
- [ ] Mobile app version
- [ ] Integration with CRM systems

## 👥 Team

Built for WP Engine sales teams to track performance and achieve excellence.

---

**Made with ❤️ for WP Engine**
