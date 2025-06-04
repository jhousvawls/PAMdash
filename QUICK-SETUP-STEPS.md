# Quick Setup Steps for PAMdash

## 🚨 Current Issue
The API endpoint https://pamdash.wpenginepowered.com/wp-json/sales/v1/settings is showing a blog post instead of JSON data. This means the WordPress plugin hasn't been installed yet.

## ✅ Step-by-Step Fix

### Step 1: Create Plugin Zip File
```bash
cd wordpress-plugin
zip -r sales-dashboard.zip sales-dashboard/
```

### Step 2: Install WordPress Plugin
1. **Go to WordPress Admin**: https://pamdash.wpenginepowered.com/wp-admin/
2. **Navigate to Plugins**: Plugins → Add New → Upload Plugin
3. **Upload the Zip**: Choose `sales-dashboard.zip` 
4. **Install & Activate**: Click "Install Now" then "Activate"

### Step 3: Verify Installation
After activation, you should see:
- **"Sales Dashboard" menu item** in WordPress admin sidebar
- **API endpoint working**: https://pamdash.wpenginepowered.com/wp-json/sales/v1/settings should return JSON like:
  ```json
  {
    "success": true,
    "weightings": {
      "closed_won": 60,
      "opps_passed_mrr": 15,
      "calls": 8,
      "pem": 10,
      "opps_count": 7
    }
  }
  ```

### Step 4: Fix Permalinks (If Needed)
If the API still doesn't work after plugin activation:
1. **Go to**: https://pamdash.wpenginepowered.com/wp-admin/options-permalink.php
2. **Click "Save Changes"** (even if you don't change anything)
3. **Test API again**: https://pamdash.wpenginepowered.com/wp-json/sales/v1/settings

## 🔧 Troubleshooting

### If Plugin Upload Fails
- Check file size limits
- Try uploading via FTP to `/wp-content/plugins/` directory
- Ensure proper file permissions

### If API Still Shows Blog Post
- Verify plugin is activated
- Check WordPress error logs
- Ensure permalinks are set to "Post name" structure

### If You See "Plugin Not Found"
- Check that the zip file contains the correct folder structure:
  ```
  sales-dashboard.zip
  └── sales-dashboard/
      ├── sales-dashboard.php
      ├── admin-page.php
      └── README.md
  ```

## 🎯 Expected Results After Setup

1. **WordPress Admin Menu**: "Sales Dashboard" appears in sidebar
2. **API Endpoints Work**: 
   - https://pamdash.wpenginepowered.com/wp-json/sales/v1/settings
   - https://pamdash.wpenginepowered.com/wp-json/sales/v1/data
3. **Admin Interface**: https://pamdash.wpenginepowered.com/wp-admin/admin.php?page=sales-dashboard

## 📞 Need Help?
If you're still having issues:
1. Check WordPress admin for any error messages
2. Verify the plugin files uploaded correctly
3. Try deactivating and reactivating the plugin
4. Check WordPress debug logs for errors

Once the plugin is installed and activated, the React dashboard will be able to connect to WordPress and save/load data properly! 🚀
