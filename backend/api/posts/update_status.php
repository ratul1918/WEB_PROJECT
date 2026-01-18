<?php
require "../../config/db.php";
require "../utils/jwt.php";

header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verify Token
$auth_data = JWT::get_bearer_token();
$user_data = null;
if ($auth_data) {
    $user_data = JWT::decode($auth_data);
}

if (!$user_data || $user_data['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["error" => "Forbidden: Admin access required"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id']) || !isset($data['status'])) {
    http_response_code(400);
    echo json_encode(["error" => "Post ID and Status are required"]);
    exit();
}

$post_id = $conn->real_escape_string($data['id']);
$status = $conn->real_escape_string($data['status']);

if (!in_array($status, ['pending', 'approved', 'rejected'])) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid status"]);
    exit();
}

$sql = "UPDATE posts SET status='$status' WHERE id='$post_id'";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["message" => "Post status updated successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Error updating record: " . $conn->error]);
}
?>
