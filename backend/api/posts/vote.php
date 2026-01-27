<?php
require "../../config/db.php";
require "../utils/jwt.php";

header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = json_decode(file_get_contents("php://input"), true);
$post_id = isset($input['post_id']) ? intval($input['post_id']) : 0;

if ($post_id <= 0) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid post ID"]);
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

$user_id = intval($user_data['user_id']);
$user_role = $user_data['role'] ?? 'viewer';

// Role check: only viewer or admin can vote
if (!in_array($user_role, ['viewer', 'admin'], true)) {
    http_response_code(403);
    echo json_encode(["error" => "Only viewers or admins can vote"]);
    exit();
}

// Ensure post exists and fetch creator
$postSql = "SELECT user_id FROM posts WHERE id = $post_id LIMIT 1";
$postResult = $conn->query($postSql);
if (!$postResult || $postResult->num_rows === 0) {
    http_response_code(404);
    echo json_encode(["error" => "Post not found"]);
    exit();
}
$postRow = $postResult->fetch_assoc();
$post_owner_id = intval($postRow['user_id']);

// Prevent creator voting on own post
if ($post_owner_id === $user_id) {
    http_response_code(403);
    echo json_encode(["error" => "Creators cannot vote on their own posts"]);
    exit();
}

// Toggle like
$checkSql = "SELECT id FROM votes WHERE user_id = $user_id AND post_id = $post_id";
$checkResult = $conn->query($checkSql);

$liked = false;

if ($checkResult && $checkResult->num_rows > 0) {
    // Unlike
    $deleteSql = "DELETE FROM votes WHERE user_id = $user_id AND post_id = $post_id";
    if ($conn->query($deleteSql) !== TRUE) {
        http_response_code(500);
        echo json_encode(["error" => "Error removing like"]);
        exit();
    }
    $liked = false;
} else {
    // Like
    $insertSql = "INSERT INTO votes (user_id, post_id) VALUES ($user_id, $post_id)";
    if ($conn->query($insertSql) !== TRUE) {
        http_response_code(500);
        echo json_encode(["error" => "Error adding like"]);
        exit();
    }
    $liked = true;
}

// Get new like count
$countSql = "SELECT COUNT(*) as vote_count FROM votes WHERE post_id = $post_id";
$countResult = $conn->query($countSql);
$count = 0;
if ($countResult && $countResult->num_rows > 0) {
    $row = $countResult->fetch_assoc();
    $count = intval($row['vote_count']);
}

echo json_encode([
    "message" => "Success",
    "liked" => $liked,
    "likes" => $count
]);
?>
