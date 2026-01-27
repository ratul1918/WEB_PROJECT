<?php
require "config/db.php";
require "api/utils/jwt.php";

header("Content-Type: application/json");

// Verify Token
$auth_data = JWT::get_bearer_token();
$user_data = null;
if ($auth_data) {
    try {
        $user_data = JWT::decode($auth_data);
    } catch (Exception $e) {
        // Continue
    }
}

$current_user_id = $user_data ? intval($user_data['user_id']) : 0;

echo json_encode([
    "auth_status" => $user_data ? "authenticated" : "not authenticated",
    "current_user_id" => $current_user_id,
    "test_endpoint" => "This endpoint confirms your authentication status"
], JSON_PRETTY_PRINT);
?>
