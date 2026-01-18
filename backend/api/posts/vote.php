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

$user_id = $user_data['user_id'];

// Check if vote exists
$checkSql = "SELECT id FROM votes WHERE user_id = $user_id AND post_id = $post_id";
$checkResult = $conn->query($checkSql);

if ($checkResult->num_rows > 0) {
    // Unlike (delete vote)
    $deleteSql = "DELETE FROM votes WHERE user_id = $user_id AND post_id = $post_id";
    if ($conn->query($deleteSql) === TRUE) {
        $action = "unvoted";
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Error removing vote"]);
        exit();
    }
} else {
    // Like (insert vote)
    $insertSql = "INSERT INTO votes (user_id, post_id) VALUES ('$user_id', '$post_id')";
    if ($conn->query($insertSql) === TRUE) {
        $action = "voted";
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Error adding vote"]);
        exit();
    }
}

// Get new vote count
$countSql = "SELECT COUNT(*) as vote_count FROM votes WHERE post_id = $post_id";
$countResult = $conn->query($countSql);
$count = 0;
if ($countResult->num_rows > 0) {
    $row = $countResult->fetch_assoc();
    $count = intval($row['vote_count']);
}

echo json_encode(["message" => "Success", "action" => $action, "votes" => $count]);
?>
