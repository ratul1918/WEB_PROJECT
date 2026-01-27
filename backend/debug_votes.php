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
        http_response_code(401);
        echo json_encode(["error" => "Unauthorized", "details" => $e->getMessage()]);
        exit();
    }
}

if (!$user_data) {
    http_response_code(401);
    echo json_encode(["error" => "No auth token"]);
    exit();
}

$current_user_id = intval($user_data['user_id']);

// Get all votes by this user
$votesSql = "SELECT v.id, v.user_id, v.post_id, v.created_at, 
                    p.title, p.type, p.status, p.views
             FROM votes v
             LEFT JOIN posts p ON v.post_id = p.id
             WHERE v.user_id = $current_user_id
             ORDER BY v.created_at DESC";

$votesResult = $conn->query($votesSql);
$votes = [];
if ($votesResult) {
    while ($row = $votesResult->fetch_assoc()) {
        $votes[] = $row;
    }
}

// Get summary
$summarySQL = "SELECT 
    COUNT(*) as total_votes,
    COUNT(DISTINCT post_id) as distinct_posts,
    SUM(CASE WHEN p.status IN ('published', 'approved') THEN 1 ELSE 0 END) as approved_posts
FROM votes v
LEFT JOIN posts p ON v.post_id = p.id
WHERE v.user_id = $current_user_id";

$summaryResult = $conn->query($summarySQL);
$summary = $summaryResult->fetch_assoc();

echo json_encode([
    "user_id" => $current_user_id,
    "summary" => $summary,
    "votes" => $votes
], JSON_PRETTY_PRINT);
?>
