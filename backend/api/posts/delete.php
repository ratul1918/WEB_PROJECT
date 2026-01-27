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

// Gather media files to remove from storage
$mediaFiles = [];
$mediaStmt = $conn->prepare("SELECT file_path FROM media WHERE post_id = ?");
if ($mediaStmt) {
    $mediaStmt->bind_param("i", $id);
    if ($mediaStmt->execute()) {
        $mediaResult = $mediaStmt->get_result();
        while ($row = $mediaResult->fetch_assoc()) {
            $mediaFiles[] = $row['file_path'];
        }
    }
    $mediaStmt->close();
}

// Delete media records first (safety even if cascade exists)
$deleteMediaStmt = $conn->prepare("DELETE FROM media WHERE post_id = ?");
if ($deleteMediaStmt) {
    $deleteMediaStmt->bind_param("i", $id);
    $deleteMediaStmt->execute();
    $deleteMediaStmt->close();
}

// Delete the post
$deletePostStmt = $conn->prepare("DELETE FROM posts WHERE id = ?");
if (!$deletePostStmt) {
    http_response_code(500);
    echo json_encode(["error" => "Error preparing delete statement: " . $conn->error]);
    exit();
}

$deletePostStmt->bind_param("i", $id);
if ($deletePostStmt->execute()) {
    $deletePostStmt->close();

    // Remove associated media files from disk
    $basePath = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR;
    foreach ($mediaFiles as $filePath) {
        if (!$filePath) continue;
        $normalized = str_replace(['/', '\\'], DIRECTORY_SEPARATOR, ltrim($filePath, '/\\'));
        $fullPath = $basePath . $normalized;
        if (file_exists($fullPath)) {
            @unlink($fullPath);
        }
    }

    echo json_encode(["message" => "Post deleted successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Error deleting record: " . $conn->error]);
}
?>
