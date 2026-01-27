<?php
require "../../config/db.php";

header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$type = isset($_GET['type']) ? $conn->real_escape_string($_GET['type']) : null;
$status = isset($_GET['status']) ? $conn->real_escape_string($_GET['status']) : null;
$author_id = isset($_GET['author_id']) ? intval($_GET['author_id']) : null;
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 50;
$mine = isset($_GET['mine']);


// Get user ID from token if present (for has_voted check)
require "../utils/jwt.php";
$auth_token = JWT::get_bearer_token();
$current_user_id = null;
if ($auth_token) {
    $user_data = JWT::decode($auth_token);
    if ($user_data) {
        $current_user_id = $user_data['user_id'];
    }
}

// If "mine" is requested, force author_id to the authenticated user and require auth
if ($mine) {
    if (!$current_user_id) {
        http_response_code(401);
        echo json_encode(["error" => "Unauthorized"]);
        exit();
    }
    $author_id = $current_user_id;
}

$sql = "SELECT p.*, u.name as author_name, u.role as author_role,
    (SELECT COUNT(*) FROM votes v WHERE v.post_id = p.id) as vote_count";

if ($current_user_id) {
    $sql .= ", (SELECT COUNT(*) FROM votes v WHERE v.post_id = p.id AND v.user_id = $current_user_id) as has_voted";
} else {
    $sql .= ", 0 as has_voted";
}

$sql .= " FROM posts p 
        JOIN users u ON p.user_id = u.id";

$whereClauses = [];
if ($type) {
    $whereClauses[] = "p.type = '$type'";
}
if ($status) {
    $whereClauses[] = "p.status = '$status'";
}
if ($author_id) {
    $whereClauses[] = "p.user_id = $author_id";
}

if (!empty($whereClauses)) {
    $sql .= " WHERE " . implode(" AND ", $whereClauses);
}

$sql .= " ORDER BY p.created_at DESC LIMIT $limit";

$result = $conn->query($sql);

if (!$result) {
    http_response_code(500);
    echo json_encode(["error" => $conn->error]);
    exit();
}

$posts = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        // Fetch media for each post
        $post_id = $row['id'];
        $mediaSql = "SELECT * FROM media WHERE post_id = $post_id";
        $mediaResult = $conn->query($mediaSql);
        $media = [];
        while($m = $mediaResult->fetch_assoc()) {
            $media[] = $m;
        }

        // Structure similar to frontend Post type
        $voteCount = intval($row['vote_count']);
        $voteScore = $voteCount * 10;

        $post = [
            "id" => strval($row['id']),
            "title" => $row['title'],
            "description" => $row['description'],
            "authorId" => strval($row['user_id']),
            "authorName" => $row['author_name'],
            "authorRole" => $row['author_role'],
            "type" => $row['type'],
            "category" => $row['category'],
            "uploadDate" => $row['created_at'],
            "status" => $row['status'],
            "views" => intval($row['views']),
            "rating" => $voteCount, // rating reflects like count for cards
            "votes" => $voteCount,
            "voteScore" => $voteScore,
            "hasVoted" => intval($row['has_voted']) > 0,
            // Use custom thumbnail from posts table, fallback to first media only if it is an image
            "thumbnail" => !empty($row['thumbnail']) ? $row['thumbnail'] : (
                (isset($media[0]) && preg_match('/\.(jpg|jpeg|png|gif|webp)$/i', $media[0]['file_path'])) 
                ? $media[0]['file_path'] 
                : ""
            ), 
            "media" => $media,
            "duration" => $row['duration'] ?? "0:00"
        ];
        $posts[] = $post;
    }
}

echo json_encode($posts);
?>
