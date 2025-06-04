# Sales Dashboard WordPress Plugin

A simple WordPress plugin to provide data storage and admin controls for the WP Engine Sales Performance Dashboard.

## Features

- **Data Storage**: Stores uploaded sales data in WordPress database
- **REST API**: Provides endpoints for React dashboard integration
- **Admin Interface**: Simple WordPress admin page for managing settings
- **Metric Weightings**: Configurable percentage weightings for sales metrics
- **Data Management**: View and manage uploaded sales data

## Installation

1. **Upload Plugin**:
   - Copy the `sales-dashboard` folder to your WordPress `wp-content/plugins/` directory
   - Or zip the folder and upload via WordPress admin

2. **Activate Plugin**:
   - Go to WordPress Admin → Plugins
   - Find "Sales Dashboard" and click "Activate"

3. **Access Admin Panel**:
   - Go to WordPress Admin → Sales Dashboard
   - Configure metric weightings as needed

## API Endpoints

The plugin provides these REST API endpoints for the React dashboard:

### Get Sales Data
```
GET /wp-json/sales/v1/data
```
Returns the most recently uploaded sales data.

### Upload Sales Data
```
POST /wp-json/sales/v1/upload
Content-Type: application/json

{
  "salesData": [...],
  "title": "Sales Data - January 2025"
}
```

### Get Settings
```
GET /wp-json/sales/v1/settings
```
Returns current metric weightings.

### Update Settings
```
PUT /wp-json/sales/v1/settings
Content-Type: application/json

{
  "weightings": {
    "closed_won": 60,
    "opps_passed_mrr": 15,
    "calls": 8,
    "pem": 10,
    "opps_count": 7
  }
}
```

## Default Metric Weightings

- **Closed Won MRR**: 60%
- **Opportunities Passed MRR**: 15%
- **Calls**: 8%
- **PEM**: 10%
- **Opportunities Count**: 7%

## Admin Interface

The WordPress admin interface provides:

1. **Metric Weightings Management**:
   - Adjust percentage weights for each metric
   - Real-time validation (must total 100%)
   - Save changes with one click

2. **Data Upload History**:
   - View all uploaded sales data
   - See upload dates and record counts
   - Delete old data if needed

3. **API Information**:
   - Display API endpoint URLs
   - Easy reference for React app integration

## React Dashboard Integration

To connect your React dashboard to this WordPress backend:

1. **Update API Base URL**:
   ```javascript
   const API_BASE = 'https://your-wordpress-site.com/wp-json/sales/v1';
   ```

2. **Load Data on Component Mount**:
   ```javascript
   useEffect(() => {
     fetch(`${API_BASE}/data`)
       .then(response => response.json())
       .then(data => {
         if (data.success) {
           setSalesData(data.data);
         }
       });
   }, []);
   ```

3. **Save Data on Upload**:
   ```javascript
   const saveToWordPress = async (salesData) => {
     const response = await fetch(`${API_BASE}/upload`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         salesData: salesData,
         title: `Sales Data - ${new Date().toLocaleDateString()}`
       })
     });
     return response.json();
   };
   ```

## Security

- **Upload Permission**: Currently allows all users to upload data
- **Settings Permission**: Requires WordPress admin privileges
- **Data Access**: Public read access to sales data
- **CORS**: May need configuration for cross-domain requests

## Customization

### Modify Metric Names
Edit the admin page labels in `admin-page.php`:
```php
<label for="closed_won">Your Custom Metric Name</label>
```

### Add New Metrics
1. Update the weightings array structure
2. Modify the admin form
3. Update the React dashboard calculation logic

### Change Permissions
Modify permission callbacks in `sales-dashboard.php`:
```php
public function check_upload_permission($request) {
    return current_user_can('edit_posts'); // Require editor role
}
```

## Troubleshooting

### API Endpoints Not Working
- Check WordPress permalinks (Settings → Permalinks → Save)
- Verify plugin is activated
- Check for plugin conflicts

### CORS Issues
Add to your theme's `functions.php`:
```php
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        return $value;
    });
});
```

### Data Not Persisting
- Check database permissions
- Verify custom post type registration
- Look for PHP errors in WordPress debug log

## Support

For issues or questions:
1. Check WordPress debug logs
2. Verify API endpoints in browser
3. Test with sample data
4. Review React console for errors

## Version History

- **1.0.0**: Initial release with basic data storage and admin interface
