<?php
require "../../config/db.php";
require "../utils/jwt.php";

header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$q = isset($_GET['q']) ? trim($_GET['q']) : '';

if ($q === '') {
    echo json_encode([]);
    exit();
}

// Get authenticated user's role
$authHeaders = getallheaders();
$authHeader = isset($authHeaders['Authorization']) ? $authHeaders['Authorization'] : '';
$requestingUserRole = '';

if (!empty($authHeader) && strpos($authHeader, 'Bearer ') === 0) {
    $token = substr($authHeader, 7);
    $decoded = JWT::decode($token);
    if ($decoded && isset($decoded['role'])) {
        $requestingUserRole = strtolower($decoded['role']);
    } else {
        $requestingUserRole = 'viewer';
    }
} else {
    $requestingUserRole = 'viewer';
}

// Role-based access control
$allowedRoles = [];
if ($requestingUserRole === 'admin') {
    $allowedRoles = ['creator', 'viewer'];
} else {
    $allowedRoles = ['creator'];
}

if (empty($allowedRoles)) {
    echo json_encode([]);
    exit();
}

// Build SQL with role filtering
$placeholders = implode(',', array_fill(0, count($allowedRoles), '?'));
$sql = "SELECT id, name, email, role FROM users WHERE name LIKE ? AND role IN ($placeholders) LIMIT 20";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to prepare search query"]);
    exit();
}

$searchTerm = '%' . $q . '%';
$types = 's' . str_repeat('s', count($allowedRoles));
$params = array_merge([$searchTerm], $allowedRoles);
$stmt->bind_param($types, ...$params);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to execute search"]);
    exit();
}

$result = $stmt->get_result();
$users = [];
while ($row = $result->fetch_assoc()) {
    $users[] = [
        "id" => strval($row['id']),
        "name" => $row['name'],
        "email" => $row['email'],
        "role" => $row['role'],
    ];
}

$stmt->close();

echo json_encode($users);
?>
