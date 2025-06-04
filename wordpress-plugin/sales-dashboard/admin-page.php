<?php
// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Handle form submissions
if (isset($_POST['update_weightings']) && wp_verify_nonce($_POST['_wpnonce'], 'update_weightings')) {
    $weightings = array(
        'closed_won' => intval($_POST['closed_won']),
        'opps_passed_mrr' => intval($_POST['opps_passed_mrr']),
        'calls' => intval($_POST['calls']),
        'pem' => intval($_POST['pem']),
        'opps_count' => intval($_POST['opps_count'])
    );
    
    $total = array_sum($weightings);
    if ($total == 100) {
        update_option('sales_dashboard_weightings', $weightings);
        echo '<div class="notice notice-success"><p>Weightings updated successfully!</p></div>';
    } else {
        echo '<div class="notice notice-error"><p>Error: Weightings must add up to 100%. Current total: ' . $total . '%</p></div>';
    }
}

// Get current weightings
$weightings = get_option('sales_dashboard_weightings', array(
    'closed_won' => 60,
    'opps_passed_mrr' => 15,
    'calls' => 8,
    'pem' => 10,
    'opps_count' => 7
));

// Get recent sales data uploads
$recent_uploads = get_posts(array(
    'post_type' => 'sales_data',
    'posts_per_page' => 10,
    'orderby' => 'date',
    'order' => 'DESC',
    'post_status' => 'publish'
));
?>

<div class="wrap">
    <h1>Sales Dashboard Management</h1>
    
    <div style="display: flex; gap: 20px; margin-top: 20px;">
        
        <!-- Settings Panel -->
        <div style="flex: 1; background: white; padding: 20px; border: 1px solid #ccd0d4; border-radius: 4px;">
            <h2>Metric Weightings</h2>
            <p>Adjust the percentage weightings for each sales metric. Total must equal 100%.</p>
            
            <form method="post" action="">
                <?php wp_nonce_field('update_weightings'); ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="closed_won">Closed Won MRR</label>
                        </th>
                        <td>
                            <input type="number" id="closed_won" name="closed_won" value="<?php echo esc_attr($weightings['closed_won']); ?>" min="0" max="100" style="width: 80px;" />
                            <span>%</span>
                            <p class="description">Revenue from closed deals (currently 60%)</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="opps_passed_mrr">Opportunities Passed MRR</label>
                        </th>
                        <td>
                            <input type="number" id="opps_passed_mrr" name="opps_passed_mrr" value="<?php echo esc_attr($weightings['opps_passed_mrr']); ?>" min="0" max="100" style="width: 80px;" />
                            <span>%</span>
                            <p class="description">Pipeline value from passed opportunities (currently 15%)</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="calls">Calls</label>
                        </th>
                        <td>
                            <input type="number" id="calls" name="calls" value="<?php echo esc_attr($weightings['calls']); ?>" min="0" max="100" style="width: 80px;" />
                            <span>%</span>
                            <p class="description">Number of sales calls made (currently 8%)</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="pem">PEM</label>
                        </th>
                        <td>
                            <input type="number" id="pem" name="pem" value="<?php echo esc_attr($weightings['pem']); ?>" min="0" max="100" style="width: 80px;" />
                            <span>%</span>
                            <p class="description">Prospect engagement meetings (currently 10%)</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="opps_count">Opportunities Count</label>
                        </th>
                        <td>
                            <input type="number" id="opps_count" name="opps_count" value="<?php echo esc_attr($weightings['opps_count']); ?>" min="0" max="100" style="width: 80px;" />
                            <span>%</span>
                            <p class="description">Number of opportunities created (currently 7%)</p>
                        </td>
                    </tr>
                </table>
                
                <div style="margin-top: 20px; padding: 15px; background: #f0f0f1; border-radius: 4px;">
                    <strong>Current Total: <span id="total-percentage"><?php echo array_sum($weightings); ?></span>%</strong>
                    <span id="total-status" style="margin-left: 10px;"></span>
                </div>
                
                <p class="submit">
                    <input type="submit" name="update_weightings" class="button-primary" value="Update Weightings" />
                </p>
            </form>
        </div>
        
        <!-- Data Panel -->
        <div style="flex: 1; background: white; padding: 20px; border: 1px solid #ccd0d4; border-radius: 4px;">
            <h2>Recent Data Uploads</h2>
            
            <?php if (empty($recent_uploads)): ?>
                <p>No sales data has been uploaded yet.</p>
                <p><em>Data will appear here when users upload CSV files through the dashboard.</em></p>
            <?php else: ?>
                <table class="wp-list-table widefat fixed striped">
                    <thead>
                        <tr>
                            <th>Upload Date</th>
                            <th>Title</th>
                            <th>Records</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($recent_uploads as $upload): ?>
                            <?php 
                            $record_count = get_post_meta($upload->ID, 'upload_count', true);
                            $sales_data = get_post_meta($upload->ID, 'sales_data', true);
                            ?>
                            <tr>
                                <td><?php echo date('M j, Y g:i A', strtotime($upload->post_date)); ?></td>
                                <td><?php echo esc_html($upload->post_title); ?></td>
                                <td><?php echo $record_count ? $record_count : 'Unknown'; ?> people</td>
                                <td>
                                    <a href="<?php echo admin_url('post.php?post=' . $upload->ID . '&action=edit'); ?>" class="button button-small">View</a>
                                    <a href="<?php echo wp_nonce_url(admin_url('admin-post.php?action=delete_sales_data&post_id=' . $upload->ID), 'delete_sales_data_' . $upload->ID); ?>" 
                                       class="button button-small" 
                                       onclick="return confirm('Are you sure you want to delete this data?')">Delete</a>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>
            
            <div style="margin-top: 20px; padding: 15px; background: #e7f3ff; border: 1px solid #72aee6; border-radius: 4px;">
                <h4 style="margin-top: 0;">API Endpoints</h4>
                <p><strong>Dashboard URL:</strong> <code><?php echo home_url('/your-dashboard-url'); ?></code></p>
                <p><strong>Data API:</strong> <code><?php echo home_url('/wp-json/sales/v1/data'); ?></code></p>
                <p><strong>Settings API:</strong> <code><?php echo home_url('/wp-json/sales/v1/settings'); ?></code></p>
            </div>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input[type="number"]');
    const totalSpan = document.getElementById('total-percentage');
    const statusSpan = document.getElementById('total-status');
    
    function updateTotal() {
        let total = 0;
        inputs.forEach(input => {
            total += parseInt(input.value) || 0;
        });
        
        totalSpan.textContent = total;
        
        if (total === 100) {
            statusSpan.innerHTML = '<span style="color: green;">✓ Perfect!</span>';
            statusSpan.style.color = 'green';
        } else if (total < 100) {
            statusSpan.innerHTML = '<span style="color: orange;">⚠ Need ' + (100 - total) + '% more</span>';
        } else {
            statusSpan.innerHTML = '<span style="color: red;">✗ ' + (total - 100) + '% over limit</span>';
        }
    }
    
    inputs.forEach(input => {
        input.addEventListener('input', updateTotal);
    });
    
    updateTotal(); // Initial calculation
});
</script>

<style>
.form-table th {
    width: 200px;
}
.form-table input[type="number"] {
    text-align: center;
}
.wp-list-table {
    margin-top: 10px;
}
</style>
