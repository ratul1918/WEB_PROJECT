<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../../config/db.php';

$response = [
    "total_videos" => 0,
    "total_audio" => 0,
    "total_blogs" => 0,
    "active_users" => 0,
    "total_posts" => 0,
    "views_daily" => 0,
    "avg_rating" => 4.8 // Static for now as we don't have a rating system
];

try {
    // Total Videos
    $result = $conn->query("SELECT COUNT(*) as count FROM posts WHERE type='video' AND status='approved'");
    if ($result) $response['total_videos'] = $result->fetch_assoc()['count'];

    // Total Audio
    $result = $conn->query("SELECT COUNT(*) as count FROM posts WHERE type='audio' AND status='approved'");
    if ($result) $response['total_audio'] = $result->fetch_assoc()['count'];

    // Total Blogs
    $result = $conn->query("SELECT COUNT(*) as count FROM posts WHERE type='blog' AND status='approved'");
    if ($result) $response['total_blogs'] = $result->fetch_assoc()['count'];

    // Active Users
    $result = $conn->query("SELECT COUNT(*) as count FROM users");
    if ($result) $response['active_users'] = $result->fetch_assoc()['count'];

    // Total Posts
    $result = $conn->query("SELECT COUNT(*) as count FROM posts WHERE status='approved'");
    if ($result) $response['total_posts'] = $result->fetch_assoc()['count'];

    // Total Views (Simulating 'Daily' by just taking total for now)
    $result = $conn->query("SELECT SUM(views) as count FROM posts");
    if ($result) {
        $row = $result->fetch_assoc();
        $response['views_daily'] = $row['count'] ? $row['count'] : 0;
    }

    echo json_encode($response);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
