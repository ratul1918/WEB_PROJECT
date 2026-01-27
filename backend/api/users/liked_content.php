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
    try {
        $user_data = JWT::decode($auth_data);
    } catch (Exception $e) {
        // Continue without auth for optional viewing
    }
}

$current_user_id = $user_data ? intval($user_data['user_id']) : 0;

// Get target user ID from query parameter
$target_user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : $current_user_id;

error_log("DEBUG liked_content.php: current_user_id=$current_user_id, target_user_id=$target_user_id");

if ($target_user_id <= 0) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid user ID", "received" => $_GET['user_id'] ?? 'none']);
    exit();
}

// Get all posts this user has liked (voted for)
$sql = "SELECT 
    p.id,
    p.title,
    p.type,
    p.user_id as authorId,
    u.name as authorName,
    u.role as authorRole,
    (SELECT COUNT(*) FROM votes WHERE post_id = p.id) as votes,
    p.views,
    p.created_at as uploadDate,
    COALESCE(p.thumbnail, (SELECT file_path FROM media WHERE post_id = p.id LIMIT 1)) as thumbnail
FROM votes v
INNER JOIN posts p ON v.post_id = p.id
INNER JOIN users u ON p.user_id = u.id
WHERE v.user_id = $target_user_id AND (p.status = 'published' OR p.status = 'approved')
ORDER BY v.id DESC";

error_log("DEBUG Main Query: " . $sql);

$result = $conn->query($sql);

if (!$result) {
    error_log("DEBUG: Query failed: " . $conn->error);
    http_response_code(500);
    echo json_encode(["error" => "Database query failed", "details" => $conn->error]);
    exit();
}

error_log("DEBUG: Query succeeded, rows: " . $result->num_rows);

$liked_posts = [];
while ($row = $result->fetch_assoc()) {
    $liked_posts[] = [
        "id" => $row['id'],
        "title" => $row['title'],
        "type" => $row['type'],
        "thumbnail" => $row['thumbnail'],
        "authorId" => $row['authorId'],
        "authorName" => $row['authorName'],
        "authorRole" => $row['authorRole'],
        "votes" => intval($row['votes']),
        "views" => intval($row['views']),
        "uploadDate" => $row['uploadDate'],
        "hasVoted" => true
    ];
}

// Get count of liked posts
$countSql = "SELECT COUNT(*) as liked_count FROM votes WHERE user_id = $target_user_id";
$countResult = $conn->query($countSql);
$countRow = $countResult->fetch_assoc();
$likedCount = intval($countRow['liked_count']);

// Get total views from liked posts
$viewsSql = "SELECT COALESCE(SUM(p.views), 0) as total_views 
             FROM votes v
             INNER JOIN posts p ON v.post_id = p.id
             WHERE v.user_id = $target_user_id AND (p.status = 'published' OR p.status = 'approved')";

error_log("DEBUG Views Query: " . $viewsSql);

$viewsResult = $conn->query($viewsSql);
$viewsRow = $viewsResult->fetch_assoc();
$totalViews = intval($viewsRow['total_views']);

error_log("DEBUG Response: posts=" . count($liked_posts) . ", count=" . $likedCount . ", views=" . $totalViews);

echo json_encode([
    "liked_posts" => $liked_posts,
    "total_likes" => $likedCount,
    "total_items_liked" => $likedCount,
    "total_views_given" => $totalViews
]);
?>
