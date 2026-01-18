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

if (!$user_data) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit();
}

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid ID"]);
    exit();
}

// Check Ownership or Admin
$user_id = $user_data['user_id'];
$role = $user_data['role'];

$checkSql = "SELECT user_id FROM posts WHERE id = $id";
$result = $conn->query($checkSql);

if ($result->num_rows == 0) {
    http_response_code(404);
    echo json_encode(["error" => "Post not found"]);
    exit();
}

$post = $result->fetch_assoc();

if ($post['user_id'] != $user_id && $role !== 'admin') {
    http_response_code(403);
    echo json_encode(["error" => "Forbidden"]);
    exit();
}

// Delete (Cascade delete should handle media if set up in DB, but good to be explicit/safe)
// DB Schema has ON DELETE CASCADE, so deleting post is enough.

$sql = "DELETE FROM posts WHERE id = $id";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["message" => "Post deleted successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Error deleting record: " . $conn->error]);
}
?>
