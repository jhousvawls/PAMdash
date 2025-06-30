# PAMdash CSV Upload Issue - Troubleshooting Guide

## Issue Summary
CSV uploads are working locally but not persisting across browsers due to WordPress REST API failures (404 errors, JSON syntax errors).

## Root Cause Analysis
Based on browser console errors, the main issues are:
1. **WordPress REST API endpoints returning 404 errors**
2. **JSON syntax errors** (receiving HTML instead of JSON responses)
3. **Permalink structure conflicts** with REST API routing

## Step-by-Step Fix Instructions

### Step 1: Fix WordPress Permalinks (CRITICAL)

**Current Issue**: Your permalinks are set to "Post name" which can interfere with REST API routing.

**Fix Instructions**:
1. Go to WordPress Admin → Settings → Permalinks
2. **Temporarily** select "Plain" radio button
3. Click "Save Changes"
4. Test CSV upload functionality
5. If it works, you can try "Custom Structure" with: `/%postname%/` or `/index.php/%postname%/`

**Why This Matters**: WordPress REST API endpoints like `/wp-json/sales/v1/upload` can conflict with pretty permalink structures.

### Step 2: Update WordPress Plugin to v1.1.0

**Current Plugin**: Version 1.0.0 (visible in your screenshot)
**New Plugin**: Version 1.1.0 with enhanced error handling and CORS support

**Installation Instructions**:
1. Download the new plugin: `PAMdash/wordpress-plugin/sales-dashboard-v1.1.0.zip`
2. Go to WordPress Admin → Plugins
3. **Deactivate** the current "Sales Dashboard" plugin
4. **Delete** the old plugin
5. Click "Add New" → "Upload Plugin"
6. Upload `sales-dashboard-v1.1.0.zip`
7. **Activate** the new plugin
8. Go to Settings → Permalinks and click "Save Changes" (to flush rewrite rules)

### Step 3: Test the API Endpoints

After fixing permalinks and updating the plugin, test these URLs directly in your browser:

1. **Data Endpoint**: `https://pamdash.wpenginepowered.com/wp-json/sales/v1/data`
   - Should return JSON with sales data or "No sales data found"

2. **History Endpoint**: `https://pamdash.wpenginepowered.com/wp-json/sales/v1/history`
   - Should return JSON with upload history

3. **Debug Endpoint**: `https://pamdash.wpenginepowered.com/wp-admin/admin-ajax.php?action=sales_dashboard_debug`
   - Should return plugin debug information

**Expected Results**: All endpoints should return JSON responses, not HTML 404 pages.

### Step 4: Test CSV Upload

1. Open your dashboard in browser
2. Open Developer Tools (F12) → Network tab
3. Upload a CSV file
4. Watch for:
   - ✅ **Success**: API calls return 200 status with JSON responses
   - ❌ **Failure**: 404 errors or HTML responses instead of JSON

### Step 5: Verify Cross-Browser Functionality

1. Upload CSV in Browser A
2. Open dashboard in Browser B (or incognito mode)
3. Data should be visible in Browser B
4. Upload history should show the upload

## Enhanced Error Messages

The new v1.1.0 plugin provides specific error messages:

- **404 Error**: "WordPress API endpoint not found. Check plugin activation and permalinks."
- **403 Error**: "WordPress API access denied. Check permissions."
- **500 Error**: "WordPress server error. Check plugin configuration."
- **Connection Error**: "Cannot connect to WordPress. Check URL and CORS settings."

## Debugging Tools

### Browser Console Logging
The updated frontend now logs detailed information:
```javascript
console.log('Attempting to save to WordPress:', url);
console.log('WordPress API Response Status:', response.status);
console.log('WordPress API Response Data:', result);
```

### WordPress Debug Endpoint
Access debug information at:
`https://pamdash.wpenginepowered.com/wp-admin/admin-ajax.php?action=sales_dashboard_debug`

This returns:
- Plugin version
- WordPress version
- PHP version
- Permalink structure
- REST API status
- Sales data post count
- Server information

## Common Issues & Solutions

### Issue: Still Getting 404 Errors
**Solution**: 
1. Ensure plugin is activated
2. Check permalinks are set to "Plain"
3. Go to Settings → Permalinks → Save Changes (flush rewrite rules)

### Issue: CORS Errors
**Solution**: The v1.1.0 plugin includes CORS headers. Ensure you're using the new version.

### Issue: Plugin Not Updating
**Solution**: 
1. Deactivate old plugin completely
2. Delete old plugin files
3. Upload and activate new v1.1.0 version

### Issue: Data Still Not Syncing
**Solution**:
1. Check browser console for specific error messages
2. Test API endpoints directly in browser
3. Use debug endpoint to verify plugin status

## Expected Behavior After Fix

✅ **CSV Upload Success**:
- Upload modal shows: "✅ Successfully saved X sales warriors to WordPress!"
- Green notification appears: "Successfully uploaded X sales records! Data is now live for all users."
- No 404 or JSON syntax errors in console

✅ **Cross-Browser Sync**:
- Data visible in all browsers immediately
- Upload history shows all uploads
- No localStorage-only behavior

✅ **Error Handling**:
- Clear error messages if WordPress is unavailable
- Graceful fallback to localStorage
- Specific troubleshooting guidance in error messages

## Quick Verification Checklist

- [ ] WordPress permalinks set to "Plain" (temporarily)
- [ ] Sales Dashboard plugin updated to v1.1.0
- [ ] Plugin activated and rewrite rules flushed
- [ ] API endpoints return JSON (not HTML 404 pages)
- [ ] CSV upload shows success message
- [ ] Data visible across different browsers
- [ ] No 404/JSON errors in browser console

## Support Information

If issues persist after following this guide:

1. **Check Browser Console**: Look for specific error messages
2. **Test API Endpoints**: Verify they return JSON responses
3. **Use Debug Endpoint**: Get detailed plugin status information
4. **Check WordPress Error Logs**: Look for PHP errors in WordPress

The enhanced error handling in v1.1.0 should provide clear guidance on any remaining issues.
