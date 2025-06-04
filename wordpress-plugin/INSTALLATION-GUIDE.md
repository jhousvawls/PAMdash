# WordPress Plugin Installation Guide

## Quick Setup for WP Engine

### Step 1: Install WordPress Plugin

1. **Zip the Plugin Folder**:
   - Compress the entire `sales-dashboard` folder into `sales-dashboard.zip`

2. **Upload to WordPress**:
   - Log into your WordPress admin panel
   - Go to **Plugins → Add New → Upload Plugin**
   - Choose the `sales-dashboard.zip` file
   - Click **Install Now** then **Activate**

3. **Verify Installation**:
   - You should see "Sales Dashboard" in your WordPress admin menu
   - Click it to access the admin interface

### Step 2: Configure Plugin Settings

1. **Access Admin Panel**:
   - Go to **WordPress Admin → Sales Dashboard**

2. **Set Metric Weightings** (if different from defaults):
   - Closed Won MRR: 60%
   - Opportunities Passed MRR: 15%
   - Calls: 8%
   - PEM: 10%
   - Opportunities Count: 7%
   - Click **Update Weightings**

### Step 3: Test API Endpoints

Visit these URLs in your browser to verify the plugin is working:

1. **Settings API**:
   ```
   https://your-site.com/wp-json/sales/v1/settings
   ```
   Should return JSON with weightings

2. **Data API**:
   ```
   https://your-site.com/wp-json/sales/v1/data
   ```
   Should return "No sales data found" initially

### Step 4: Update React Dashboard

You'll need to modify your React app to connect to WordPress. The key changes needed:

1. **Add API Configuration**:
   ```javascript
   const WORDPRESS_API_BASE = 'https://your-wordpress-site.com/wp-json/sales/v1';
   ```

2. **Load Data from WordPress**:
   ```javascript
   // Replace sample data loading with API call
   useEffect(() => {
     loadDataFromWordPress();
   }, []);
   ```

3. **Save Uploads to WordPress**:
   ```javascript
   // Modify handleFileUpload to save to WordPress
   const saveToWordPress = async (salesData) => {
     // API call to save data
   };
   ```

## Next Steps

Once the WordPress plugin is installed and working:

1. **Test the Admin Interface**: Upload some test data and verify it appears in WordPress admin
2. **Update React App**: Modify the dashboard to use WordPress APIs instead of sample data
3. **Deploy Both**: Host WordPress on WP Engine and deploy React app
4. **Configure CORS**: If needed for cross-domain requests

## Troubleshooting

### Plugin Not Appearing
- Check if the folder structure is correct: `wp-content/plugins/sales-dashboard/sales-dashboard.php`
- Verify file permissions
- Check WordPress error logs

### API Not Working
- Go to **Settings → Permalinks** and click **Save Changes**
- Test endpoints directly in browser
- Check for plugin conflicts

### Need Help?
The README.md file in the plugin folder contains detailed documentation and troubleshooting steps.
