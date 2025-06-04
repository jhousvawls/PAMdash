# PAMdash Setup Guide - Your Specific Installation

## 🎯 Your WordPress Installation
- **WordPress URL**: https://pamdash.wpenginepowered.com/
- **WordPress Admin**: https://pamdash.wpenginepowered.com/wp-admin/
- **API Base URL**: https://pamdash.wpenginepowered.com/wp-json/sales/v1/

## 📋 Step-by-Step Setup for Your Site

### Step 1: Install the WordPress Plugin

1. **Create Plugin Zip**:
   ```bash
   cd wordpress-plugin
   zip -r sales-dashboard.zip sales-dashboard/
   ```

2. **Upload to Your WordPress**:
   - Go to: https://pamdash.wpenginepowered.com/wp-admin/
   - Navigate to: **Plugins → Add New → Upload Plugin**
   - Choose `sales-dashboard.zip`
   - Click **Install Now** then **Activate**

3. **Verify Installation**:
   - You should see "Sales Dashboard" in your WordPress admin menu
   - Go to: https://pamdash.wpenginepowered.com/wp-admin/admin.php?page=sales-dashboard

### Step 2: Test API Endpoints

Verify your plugin is working by testing these URLs in your browser:

1. **Settings API**:
   ```
   https://pamdash.wpenginepowered.com/wp-json/sales/v1/settings
   ```
   Should return JSON with metric weightings

2. **Data API**:
   ```
   https://pamdash.wpenginepowered.com/wp-json/sales/v1/data
   ```
   Should return "No sales data found" initially

### Step 3: Update React App Configuration

Update your React dashboard to connect to your WordPress site:

1. **Edit `src/SalesQuestDashboard.js`**:
   ```javascript
   // Add this at the top of the component
   const WORDPRESS_API_BASE = 'https://pamdash.wpenginepowered.com/wp-json/sales/v1';
   ```

2. **Replace Sample Data Loading**:
   ```javascript
   useEffect(() => {
     // Load data from WordPress instead of using sample data
     loadDataFromWordPress();
   }, []);

   const loadDataFromWordPress = async () => {
     try {
       const response = await fetch(`${WORDPRESS_API_BASE}/data`);
       const result = await response.json();
       if (result.success && result.data.length > 0) {
         setSalesData(result.data);
       } else {
         // Use sample data if no WordPress data exists
         const processedData = sampleData.map(person => ({
           ...person,
           ...calculateQuestMetrics(person)
         }));
         setSalesData(processedData);
       }
     } catch (error) {
       console.error('Error loading data from WordPress:', error);
       // Fallback to sample data
       const processedData = sampleData.map(person => ({
         ...person,
         ...calculateQuestMetrics(person)
       }));
       setSalesData(processedData);
     }
   };
   ```

3. **Update Upload Function**:
   ```javascript
   const saveToWordPress = async (salesData) => {
     try {
       const response = await fetch(`${WORDPRESS_API_BASE}/upload`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           salesData: salesData,
           title: `Sales Data - ${new Date().toLocaleDateString()}`
         })
       });
       const result = await response.json();
       if (result.success) {
         setUploadMessage(`✅ Successfully saved ${result.count} sales warriors to WordPress!`);
         // Reload data from WordPress
         loadDataFromWordPress();
       } else {
         setUploadMessage('❌ Error saving to WordPress: ' + result.message);
       }
     } catch (error) {
       setUploadMessage('❌ Error connecting to WordPress: ' + error.message);
     }
   };
   ```

### Step 4: Deploy React Dashboard

**Option A: Host on WP Engine (Recommended)**
1. **Build React App**:
   ```bash
   npm run build
   ```

2. **Upload to WP Engine**:
   - Use WP Engine File Manager or SFTP
   - Upload contents of `build/` folder to `/dashboard/` directory
   - Access at: https://pamdash.wpenginepowered.com/dashboard/

**Option B: External Hosting**
- Deploy to Netlify, Vercel, or similar
- Update CORS settings if needed

### Step 5: Configure WordPress Settings

1. **Access Admin Panel**:
   - Go to: https://pamdash.wpenginepowered.com/wp-admin/admin.php?page=sales-dashboard

2. **Adjust Metric Weightings** (if needed):
   - Closed Won MRR: 60%
   - Opportunities Passed MRR: 15%
   - Calls: 8%
   - PEM: 10%
   - Opportunities Count: 7%
   - Click **Update Weightings**

3. **Test Permalinks**:
   - Go to: **Settings → Permalinks**
   - Ensure it's set to "Post name" or custom structure
   - Click **Save Changes**

## 🔗 Your Complete URL Structure

After setup, your URLs will be:
- **WordPress Admin**: https://pamdash.wpenginepowered.com/wp-admin/
- **Dashboard Settings**: https://pamdash.wpenginepowered.com/wp-admin/admin.php?page=sales-dashboard
- **React Dashboard**: https://pamdash.wpenginepowered.com/dashboard/ (if hosted on WP Engine)
- **API Endpoints**: https://pamdash.wpenginepowered.com/wp-json/sales/v1/

## 🧪 Testing Your Setup

1. **Test Plugin Installation**:
   - Visit: https://pamdash.wpenginepowered.com/wp-json/sales/v1/settings
   - Should return JSON with weightings

2. **Test React Dashboard**:
   - Upload a CSV file
   - Refresh the page
   - Data should persist (not disappear)

3. **Test WordPress Admin**:
   - Check WordPress Admin → Sales Dashboard
   - Should show uploaded data

## 🔧 Troubleshooting Your Site

### API Not Working
- Check: https://pamdash.wpenginepowered.com/wp-admin/options-permalink.php
- Save permalinks settings
- Verify plugin is activated

### CORS Issues (if hosting React externally)
Add to your WordPress theme's `functions.php`:
```php
add_action('rest_api_init', function() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
});
```

### Data Not Saving
- Check WordPress debug logs
- Verify file permissions
- Test API endpoints directly

## 🎉 Success Checklist

- [ ] WordPress plugin installed and activated
- [ ] API endpoints responding at pamdash.wpenginepowered.com
- [ ] React app configured with correct API URL
- [ ] Dashboard deployed and accessible
- [ ] CSV upload saves data to WordPress
- [ ] Data persists after page refresh
- [ ] WordPress admin shows uploaded data

Your PAMdash is now fully operational with persistent data storage! 🚀
