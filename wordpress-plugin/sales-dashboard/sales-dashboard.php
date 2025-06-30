<?php
/**
 * Plugin Name: Sales Dashboard
 * Description: Simple data storage and admin controls for WP Engine Sales Performance Dashboard
 * Version: 1.2.0
 * Author: John Housholder
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('SALES_DASHBOARD_VERSION', '1.2.0');
define('SALES_DASHBOARD_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('SALES_DASHBOARD_PLUGIN_URL', plugin_dir_url(__FILE__));

class SalesDashboard {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_filter('rest_pre_serve_request', array($this, 'add_cors_headers'), 10, 4);
        register_activation_hook(__FILE__, array($this, 'activate'));
        
        // Add debug logging capability
        add_action('wp_ajax_sales_dashboard_debug', array($this, 'debug_info'));
        add_action('wp_ajax_nopriv_sales_dashboard_debug', array($this, 'debug_info'));
        
        // Add AJAX handlers as backup to REST API
        add_action('wp_ajax_sales_dashboard_upload', array($this, 'ajax_upload_sales_data'));
        add_action('wp_ajax_nopriv_sales_dashboard_upload', array($this, 'ajax_upload_sales_data'));
        add_action('wp_ajax_sales_dashboard_data', array($this, 'ajax_get_sales_data'));
        add_action('wp_ajax_nopriv_sales_dashboard_data', array($this, 'ajax_get_sales_data'));
        add_action('wp_ajax_sales_dashboard_history', array($this, 'ajax_get_upload_history'));
        add_action('wp_ajax_nopriv_sales_dashboard_history', array($this, 'ajax_get_upload_history'));
    }
    
    public function init() {
        $this->register_post_types();
    }
    
    public function activate() {
        $this->register_post_types();
        
        // Force REST API route registration
        add_action('rest_api_init', array($this, 'register_rest_routes'), 10);
        
        // Flush rewrite rules twice to ensure REST API routes are registered
        flush_rewrite_rules();
        wp_cache_flush();
        
        // Set default metric weightings
        if (!get_option('sales_dashboard_weightings')) {
            update_option('sales_dashboard_weightings', array(
                'closed_won' => 60,
                'opps_passed_mrr' => 15,
                'calls' => 8,
                'pem' => 10,
                'opps_count' => 7
            ));
        }
        
        // Log activation for debugging
        error_log('Sales Dashboard Plugin v1.2.0 activated successfully');
    }
    
    public function register_post_types() {
        register_post_type('sales_data', array(
            'labels' => array(
                'name' => 'Sales Data',
                'singular_name' => 'Sales Data Entry',
                'add_new' => 'Add New Data',
                'add_new_item' => 'Add New Sales Data',
                'edit_item' => 'Edit Sales Data',
                'new_item' => 'New Sales Data',
                'view_item' => 'View Sales Data',
                'search_items' => 'Search Sales Data',
                'not_found' => 'No sales data found',
                'not_found_in_trash' => 'No sales data found in trash'
            ),
            'public' => false,
            'show_ui' => true,
            'show_in_menu' => false,
            'capability_type' => 'post',
            'supports' => array('title', 'custom-fields'),
            'show_in_rest' => true,
            'rest_base' => 'sales-data'
        ));
    }
    
    public function register_rest_routes() {
        // Log route registration for debugging
        error_log('Sales Dashboard: Registering REST API routes');
        
        // Get latest sales data
        $data_route = register_rest_route('sales/v1', '/data', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_sales_data'),
            'permission_callback' => '__return_true'
        ));
        
        // Upload new sales data
        $upload_route = register_rest_route('sales/v1', '/upload', array(
            'methods' => 'POST',
            'callback' => array($this, 'upload_sales_data'),
            'permission_callback' => array($this, 'check_upload_permission')
        ));
        
        // Get metric weightings
        $settings_get_route = register_rest_route('sales/v1', '/settings', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_settings'),
            'permission_callback' => '__return_true'
        ));
        
        // Update metric weightings
        $settings_put_route = register_rest_route('sales/v1', '/settings', array(
            'methods' => 'PUT',
            'callback' => array($this, 'update_settings'),
            'permission_callback' => array($this, 'check_admin_permission')
        ));
        
        // Get upload history
        $history_route = register_rest_route('sales/v1', '/history', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_upload_history'),
            'permission_callback' => '__return_true'
        ));
        
        // Log registration results
        error_log('Sales Dashboard: Route registration results - Data: ' . ($data_route ? 'SUCCESS' : 'FAILED'));
        error_log('Sales Dashboard: Route registration results - Upload: ' . ($upload_route ? 'SUCCESS' : 'FAILED'));
        error_log('Sales Dashboard: Route registration results - Settings GET: ' . ($settings_get_route ? 'SUCCESS' : 'FAILED'));
        error_log('Sales Dashboard: Route registration results - Settings PUT: ' . ($settings_put_route ? 'SUCCESS' : 'FAILED'));
        error_log('Sales Dashboard: Route registration results - History: ' . ($history_route ? 'SUCCESS' : 'FAILED'));
    }
    
    public function get_sales_data($request) {
        $posts = get_posts(array(
            'post_type' => 'sales_data',
            'posts_per_page' => 1,
            'orderby' => 'date',
            'order' => 'DESC',
            'post_status' => 'publish'
        ));
        
        if (empty($posts)) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'No sales data found',
                'data' => array()
            ), 200);
        }
        
        $post = $posts[0];
        $sales_data = get_post_meta($post->ID, 'sales_data', true);
        
        if (empty($sales_data)) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'No sales data found',
                'data' => array()
            ), 200);
        }
        
        return new WP_REST_Response(array(
            'success' => true,
            'data' => json_decode($sales_data, true),
            'uploaded_date' => $post->post_date,
            'title' => $post->post_title
        ), 200);
    }
    
    public function upload_sales_data($request) {
        $data = $request->get_json_params();
        
        if (empty($data['salesData'])) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'No sales data provided'
            ), 400);
        }
        
        $title = isset($data['title']) ? $data['title'] : 'Sales Data - ' . date('F Y');
        
        $post_id = wp_insert_post(array(
            'post_title' => $title,
            'post_type' => 'sales_data',
            'post_status' => 'publish',
            'post_content' => 'Sales data uploaded on ' . date('Y-m-d H:i:s')
        ));
        
        if (is_wp_error($post_id)) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Failed to save sales data'
            ), 500);
        }
        
        update_post_meta($post_id, 'sales_data', json_encode($data['salesData']));
        update_post_meta($post_id, 'upload_count', count($data['salesData']));
        
        return new WP_REST_Response(array(
            'success' => true,
            'message' => 'Sales data saved successfully',
            'post_id' => $post_id,
            'count' => count($data['salesData'])
        ), 200);
    }
    
    public function get_settings($request) {
        $weightings = get_option('sales_dashboard_weightings', array(
            'closed_won' => 60,
            'opps_passed_mrr' => 15,
            'calls' => 8,
            'pem' => 10,
            'opps_count' => 7
        ));
        
        return new WP_REST_Response(array(
            'success' => true,
            'weightings' => $weightings
        ), 200);
    }
    
    public function update_settings($request) {
        $data = $request->get_json_params();
        
        if (empty($data['weightings'])) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'No weightings provided'
            ), 400);
        }
        
        $weightings = $data['weightings'];
        
        // Validate weightings add up to 100
        $total = array_sum($weightings);
        if ($total != 100) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Weightings must add up to 100%. Current total: ' . $total . '%'
            ), 400);
        }
        
        update_option('sales_dashboard_weightings', $weightings);
        
        return new WP_REST_Response(array(
            'success' => true,
            'message' => 'Settings updated successfully',
            'weightings' => $weightings
        ), 200);
    }
    
    public function get_upload_history($request) {
        $posts = get_posts(array(
            'post_type' => 'sales_data',
            'posts_per_page' => 20, // Get last 20 uploads
            'orderby' => 'date',
            'order' => 'DESC',
            'post_status' => 'publish'
        ));
        
        if (empty($posts)) {
            return new WP_REST_Response(array(
                'success' => true,
                'data' => array(),
                'message' => 'No upload history found'
            ), 200);
        }
        
        $history = array();
        foreach ($posts as $post) {
            $upload_count = get_post_meta($post->ID, 'upload_count', true);
            $history[] = array(
                'title' => $post->post_title,
                'date' => date('M j, Y g:i A', strtotime($post->post_date)),
                'recordCount' => $upload_count ? intval($upload_count) : 0,
                'uploader' => get_the_author_meta('display_name', $post->post_author),
                'status' => 'success'
            );
        }
        
        return new WP_REST_Response(array(
            'success' => true,
            'data' => $history
        ), 200);
    }
    
    public function check_upload_permission($request) {
        // For now, allow anyone to upload. In production, you might want to restrict this
        return true;
    }
    
    public function check_admin_permission($request) {
        return current_user_can('manage_options');
    }
    
    public function add_admin_menu() {
        add_menu_page(
            'Sales Dashboard',
            'Sales Dashboard',
            'manage_options',
            'sales-dashboard',
            array($this, 'admin_page'),
            'dashicons-chart-line',
            30
        );
    }
    
    public function admin_page() {
        include SALES_DASHBOARD_PLUGIN_DIR . 'admin-page.php';
    }
    
    /**
     * Add CORS headers for cross-origin requests
     */
    public function add_cors_headers($served, $result, $request, $server) {
        // Only add CORS headers for our API endpoints
        if (strpos($request->get_route(), '/sales/v1/') !== false) {
            header('Access-Control-Allow-Origin: *');
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization, X-WP-Nonce');
            header('Access-Control-Allow-Credentials: true');
            
            // Handle preflight OPTIONS requests
            if ($request->get_method() === 'OPTIONS') {
                header('HTTP/1.1 200 OK');
                exit;
            }
        }
        return $served;
    }
    
    /**
     * Debug information endpoint
     */
    public function debug_info() {
        $debug_data = array(
            'plugin_version' => SALES_DASHBOARD_VERSION,
            'wordpress_version' => get_bloginfo('version'),
            'php_version' => PHP_VERSION,
            'permalink_structure' => get_option('permalink_structure'),
            'rest_api_enabled' => function_exists('rest_get_server'),
            'sales_data_posts' => wp_count_posts('sales_data'),
            'rest_url' => rest_url('sales/v1/'),
            'site_url' => site_url(),
            'current_user_can_upload' => $this->check_upload_permission(null),
            'current_user_can_admin' => $this->check_admin_permission(null),
            'rewrite_rules_flushed' => get_option('rewrite_rules') ? 'Yes' : 'No',
            'server_info' => array(
                'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
                'request_method' => $_SERVER['REQUEST_METHOD'] ?? 'Unknown',
                'http_host' => $_SERVER['HTTP_HOST'] ?? 'Unknown'
            )
        );
        
        wp_send_json_success($debug_data);
    }
    
    /**
     * AJAX handler for uploading sales data (backup to REST API)
     */
    public function ajax_upload_sales_data() {
        // Add CORS headers
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: POST');
        header('Access-Control-Allow-Headers: Content-Type');
        
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        if (empty($data['salesData'])) {
            wp_send_json_error(array('message' => 'No sales data provided'));
            return;
        }
        
        $title = isset($data['title']) ? $data['title'] : 'Sales Data - ' . date('F Y');
        
        $post_id = wp_insert_post(array(
            'post_title' => $title,
            'post_type' => 'sales_data',
            'post_status' => 'publish',
            'post_content' => 'Sales data uploaded on ' . date('Y-m-d H:i:s')
        ));
        
        if (is_wp_error($post_id)) {
            wp_send_json_error(array('message' => 'Failed to save sales data'));
            return;
        }
        
        update_post_meta($post_id, 'sales_data', json_encode($data['salesData']));
        update_post_meta($post_id, 'upload_count', count($data['salesData']));
        
        wp_send_json_success(array(
            'message' => 'Sales data saved successfully',
            'post_id' => $post_id,
            'count' => count($data['salesData'])
        ));
    }
    
    /**
     * AJAX handler for getting sales data (backup to REST API)
     */
    public function ajax_get_sales_data() {
        // Add CORS headers
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET');
        header('Access-Control-Allow-Headers: Content-Type');
        
        $posts = get_posts(array(
            'post_type' => 'sales_data',
            'posts_per_page' => 1,
            'orderby' => 'date',
            'order' => 'DESC',
            'post_status' => 'publish'
        ));
        
        if (empty($posts)) {
            wp_send_json_success(array(
                'success' => false,
                'message' => 'No sales data found',
                'data' => array()
            ));
            return;
        }
        
        $post = $posts[0];
        $sales_data = get_post_meta($post->ID, 'sales_data', true);
        
        if (empty($sales_data)) {
            wp_send_json_success(array(
                'success' => false,
                'message' => 'No sales data found',
                'data' => array()
            ));
            return;
        }
        
        wp_send_json_success(array(
            'success' => true,
            'data' => json_decode($sales_data, true),
            'uploaded_date' => $post->post_date,
            'title' => $post->post_title
        ));
    }
    
    /**
     * AJAX handler for getting upload history (backup to REST API)
     */
    public function ajax_get_upload_history() {
        // Add CORS headers
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET');
        header('Access-Control-Allow-Headers: Content-Type');
        
        $posts = get_posts(array(
            'post_type' => 'sales_data',
            'posts_per_page' => 20,
            'orderby' => 'date',
            'order' => 'DESC',
            'post_status' => 'publish'
        ));
        
        if (empty($posts)) {
            wp_send_json_success(array(
                'success' => true,
                'data' => array(),
                'message' => 'No upload history found'
            ));
            return;
        }
        
        $history = array();
        foreach ($posts as $post) {
            $upload_count = get_post_meta($post->ID, 'upload_count', true);
            $history[] = array(
                'title' => $post->post_title,
                'date' => date('M j, Y g:i A', strtotime($post->post_date)),
                'recordCount' => $upload_count ? intval($upload_count) : 0,
                'uploader' => get_the_author_meta('display_name', $post->post_author),
                'status' => 'success'
            );
        }
        
        wp_send_json_success(array(
            'success' => true,
            'data' => $history
        ));
    }
    
    /**
     * Enhanced error logging
     */
    private function log_error($message, $data = null) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Sales Dashboard Plugin: ' . $message);
            if ($data) {
                error_log('Sales Dashboard Plugin Data: ' . print_r($data, true));
            }
        }
    }
}

// Initialize the plugin
new SalesDashboard();
