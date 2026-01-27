<?php
require "../../config/db.php";

header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$user_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($user_id <= 0) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid user id"]);
    exit();
}

$stmt = $conn->prepare("SELECT id, name, email, role, avatar, bio, social_links, created_at FROM users WHERE id = ? LIMIT 1");
$stmt->bind_param("i", $user_id);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to load creator"]);
    exit();
}

$result = $stmt->get_result();
if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode(["error" => "Creator not found"]);
    exit();
}

$row = $result->fetch_assoc();

$creator = [
    "id" => strval($row['id']),
    "name" => $row['name'],
    "email" => $row['email'],
    "role" => $row['role'],
    "avatar" => $row['avatar'],
    "bio" => $row['bio'],
    "social_links" => $row['social_links'] ? json_decode($row['social_links'], true) : null,
    "joinDate" => isset($row['created_at']) ? $row['created_at'] : null,
];

$stmt->close();

echo json_encode($creator);
?>
