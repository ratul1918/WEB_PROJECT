<?php
require "../../config/db.php";

header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get POST data
$data = json_decode(file_get_contents("php://input"));

if (!isset($data->post_id)) {
    http_response_code(400);
    echo json_encode(["error" => "Post ID is required"]);
    exit();
}

$post_id = $conn->real_escape_string($data->post_id);

// Increment views
$sql = "UPDATE posts SET views = views + 1 WHERE id = '$post_id'";

if ($conn->query($sql) === TRUE) {
    // Get new view count
    $countSql = "SELECT views FROM posts WHERE id = '$post_id'";
    $result = $conn->query($countSql);
    $row = $result->fetch_assoc();
    
    echo json_encode([
        "message" => "View incremented",
        "views" => intval($row['views'])
    ]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Error updating view count: " . $conn->error]);
}
?>
