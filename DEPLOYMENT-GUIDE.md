# PAMdash Deployment Guide

## 🏗️ What's Included vs. What You Need to Set Up

### ✅ **Included in This Repository**
- **React Dashboard** - Complete frontend application
- **WordPress Plugin** - Backend data storage and API
- **Documentation** - Setup and usage guides

### 🔧 **What You Need to Set Up**

#### 1. WordPress Installation on WP Engine
You need to create a **new WordPress site** on your WP Engine account:

1. **Log into WP Engine Portal**
2. **Create New WordPress Installation**:
   - Site Name: `pamdash` (or your preferred name)
   - Choose your preferred data center
   - Complete the WordPress setup

3. **Access WordPress Admin**:
   - Go to `https://your-site.wpengine.com/wp-admin`
   - Complete WordPress initial setup

#### 2. Install the Sales Dashboard Plugin
Once WordPress is running:

1. **Zip the Plugin**:
   ```bash
   cd wordpress-plugin
   zip -r sales-dashboard.zip sales-dashboard/
   ```

2. **Upload to WordPress**:
   - WordPress Admin → Plugins → Add New → Upload Plugin
   - Choose `sales-dashboard.zip`
   - Click "Install Now" then "Activate"

3. **Configure Settings**:
   - Go to WordPress Admin → Sales Dashboard
   - Adjust metric weightings if needed

#### 3. Deploy React Dashboard
You have several options for hosting the React app:

**Option A: Host on WP Engine (Recommended)**
- Build the React app: `npm run build`
- Upload the `build` folder contents to a subdirectory on your WP Engine site
- Access at: `https://your-site.wpengine.com/dashboard/`

**Option B: Separate Hosting (Netlify, Vercel, etc.)**
- Deploy React app to external hosting
- Update CORS settings in WordPress if needed

## 🔗 **Complete Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    WP Engine Server                        │
├─────────────────────────────────────────────────────────────┤
│  WordPress Installation                                     │
│  ├── Sales Dashboard Plugin (API endpoints)                │
│  ├── Admin Interface (metric settings)                     │
│  └── Database (sales data storage)                         │
│                                                             │
│  React Dashboard (optional - can host elsewhere)           │
│  ├── Built files in /dashboard/ subdirectory               │
│  └── Connects to WordPress API                             │
└─────────────────────────────────────────────────────────────┘
```

## 📋 **Step-by-Step Deployment**

### Phase 1: WordPress Setup (15 minutes)
1. Create new WordPress site on WP Engine
2. Complete WordPress initial setup
3. Install and activate Sales Dashboard plugin
4. Test API endpoints: `https://your-site.wpengine.com/wp-json/sales/v1/settings`

### Phase 2: React App Configuration (10 minutes)
1. Update API base URL in React app:
   ```javascript
   const WORDPRESS_API_BASE = 'https://your-site.wpengine.com/wp-json/sales/v1';
   ```
2. Build React app: `npm run build`
3. Upload to WP Engine or deploy to external hosting

### Phase 3: Testing (5 minutes)
1. Access React dashboard
2. Upload test CSV data
3. Verify data persists after page refresh
4. Check WordPress admin for uploaded data

## 🔧 **WordPress Configuration**

### Required WordPress Settings
- **Permalinks**: Must be set to "Post name" or custom structure
- **REST API**: Enabled by default in modern WordPress
- **File Permissions**: Plugin folder needs write permissions

### Optional Enhancements
- **SSL Certificate**: WP Engine provides free SSL
- **Custom Domain**: Point your domain to the WP Engine site
- **Backup**: WP Engine handles automatic backups

## 🌐 **URL Structure Examples**

After deployment, your URLs will be:
- **WordPress Admin**: `https://your-site.wpengine.com/wp-admin`
- **Dashboard Settings**: `https://your-site.wpengine.com/wp-admin/admin.php?page=sales-dashboard`
- **React Dashboard**: `https://your-site.wpengine.com/dashboard/` (if hosted on WP Engine)
- **API Endpoints**: `https://your-site.wpengine.com/wp-json/sales/v1/`

## 🔒 **Security Considerations**

### Production Recommendations
1. **Restrict Upload Permissions**: Modify plugin to require authentication
2. **HTTPS Only**: Ensure all API calls use HTTPS
3. **Regular Updates**: Keep WordPress and plugins updated
4. **Access Control**: Limit WordPress admin access

### Plugin Security Settings
Edit `wordpress-plugin/sales-dashboard/sales-dashboard.php`:
```php
public function check_upload_permission($request) {
    return current_user_can('edit_posts'); // Require editor role
}
```

## 🚀 **Quick Start Commands**

```bash
# 1. Build React app
npm run build

# 2. Create plugin zip
cd wordpress-plugin
zip -r sales-dashboard.zip sales-dashboard/

# 3. Upload both to WP Engine
# - Plugin zip → WordPress Admin → Plugins
# - Build folder → File Manager or FTP
```

## 📞 **Support**

### WP Engine Support
- **WordPress Issues**: Contact WP Engine support
- **Plugin Installation**: Use WordPress admin interface
- **File Upload**: Use WP Engine File Manager or SFTP

### Development Support
- **React Issues**: Check browser console
- **API Issues**: Test endpoints directly
- **Plugin Issues**: Check WordPress debug logs

## 🎯 **Next Steps**

1. **Create WordPress site on WP Engine**
2. **Install the plugin from this repository**
3. **Deploy React dashboard**
4. **Test the complete system**
5. **Configure production settings**

Your PAMdash will then be fully operational with persistent data storage! 🎉
