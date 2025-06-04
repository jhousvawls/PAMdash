<?php
/**
 * Plugin Name: Sales Dashboard
 * Description: Simple data storage and admin controls for WP Engine Sales Performance Dashboard
 * Version: 1.0.0
 * Author: WP Engine
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('SALES_DASHBOARD_VERSION', '1.0.0');
define('SALES_DASHBOARD_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('SALES_DASHBOARD_PLUGIN_URL', plugin_dir_url(__FILE__));

class SalesDashboard {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        register_activation_hook(__FILE__, array($this, 'activate'));
    }
    
    public function init() {
        $this->register_post_types();
    }
    
    public function activate() {
        $this->register_post_types();
        flush_rewrite_rules();
        
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
        // Get latest sales data
        register_rest_route('sales/v1', '/data', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_sales_data'),
            'permission_callback' => '__return_true'
        ));
        
        // Upload new sales data
        register_rest_route('sales/v1', '/upload', array(
            'methods' => 'POST',
            'callback' => array($this, 'upload_sales_data'),
            'permission_callback' => array($this, 'check_upload_permission')
        ));
        
        // Get metric weightings
        register_rest_route('sales/v1', '/settings', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_settings'),
            'permission_callback' => '__return_true'
        ));
        
        // Update metric weightings
        register_rest_route('sales/v1', '/settings', array(
            'methods' => 'PUT',
            'callback' => array($this, 'update_settings'),
            'permission_callback' => array($this, 'check_admin_permission')
        ));
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
}

// Initialize the plugin
new SalesDashboard();
