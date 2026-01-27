<?php
require "../../config/db.php";
require "../utils/jwt.php";

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

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

// Get Input Data
$input = json_decode(file_get_contents("php://input"), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid JSON input"]);
    exit();
}

// Get ID from URL or Input (prefer Input strictly or match)
// Actually standard REST is PUT /api/users/update.php?id=123 or just body.
// Let's assume the client sends the ID in the body or we take it from the token if not specified (self update)
// But wait, the request might be for ANOTHER user if admin.
$target_user_id = isset($input['id']) ? $conn->real_escape_string($input['id']) : $user_data['user_id'];

// Permission Check: Self or Admin
if ($target_user_id != $user_data['user_id'] && $user_data['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["error" => "Forbidden: You can only edit your own profile"]);
    exit();
}

// Fields to update
$updates = [];
$types = "";
$params = [];

if (isset($input['name'])) {
    $updates[] = "name = ?";
    $types .= "s";
    $params[] = $input['name'];
}

if (isset($input['bio'])) {
    $updates[] = "bio = ?";
    $types .= "s";
    $params[] = $input['bio'];
}

if (isset($input['avatar'])) {
    $updates[] = "avatar = ?";
    $types .= "s";
    $params[] = $input['avatar'];
}

if (isset($input['social_links'])) {
    // social_links should be an array/object, we store as JSON string
    $social_links_json = is_string($input['social_links']) ? $input['social_links'] : json_encode($input['social_links']);
    $updates[] = "social_links = ?";
    $types .= "s";
    $params[] = $social_links_json;
}

if (isset($input['password'])) {
    // Hash the new password securely
    $hashed_password = password_hash($input['password'], PASSWORD_DEFAULT);
    $updates[] = "password = ?";
    $types .= "s";
    $params[] = $hashed_password;
}

if (empty($updates)) {
    http_response_code(400);
    echo json_encode(["error" => "No fields to update"]);
    exit();
}

// Add ID for WHERE clause
$types .= "i";
$params[] = $target_user_id;

$sql = "UPDATE users SET " . implode(", ", $updates) . " WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);

if ($stmt->execute()) {
    // Fetch updated user to return
    $fetch_sql = "SELECT id, name, email, role, avatar, bio, social_links, created_at FROM users WHERE id = $target_user_id";
    $result = $conn->query($fetch_sql);
    $updated_user = $result->fetch_assoc();
    
    // Decode social links for response
    if ($updated_user['social_links']) {
        $updated_user['social_links'] = json_decode($updated_user['social_links'], true);
    }
    
    echo json_encode([
        "message" => "Profile updated successfully",
        "user" => $updated_user
    ]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Database update failed: " . $conn->error]);
}
?>
