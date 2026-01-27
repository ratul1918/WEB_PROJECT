<?php
require "../../config/db.php";
require "../utils/jwt.php";

// Disable error display to prevent HTML in JSON response
ini_set('display_errors', 0);
header("Content-Type: application/json");

// Enable error logging
ini_set('log_errors', 1);
ini_set('error_log', dirname(__DIR__, 2) . '/debug_log.txt');
error_reporting(E_ALL);

function debug_log($message) {
    file_put_contents(dirname(__DIR__, 2) . '/debug_log.txt', date('[Y-m-d H:i:s] ') . print_r($message, true) . "\n", FILE_APPEND);
}

debug_log("----------------------------------------");
debug_log("Request received: " . $_SERVER['REQUEST_METHOD']);
debug_log("POST data: " . print_r($_POST, true));
debug_log("FILES data: " . print_r($_FILES, true));

// Check if the request size exceeds post_max_size
if (empty($_POST) && empty($_FILES) && isset($_SERVER['CONTENT_LENGTH']) && $_SERVER['CONTENT_LENGTH'] > 0) {
    debug_log("Error: Payload Too Large");
    http_response_code(413); // Payload Too Large
    echo json_encode([
        "error" => "File upload exceeds server limit. Please try a smaller file or contact support.",
        "diagnostics" => [
            "post_max_size" => ini_get('post_max_size'),
            "upload_max_filesize" => ini_get('upload_max_filesize'),
            "content_length" => $_SERVER['CONTENT_LENGTH']
        ]
    ]);
    exit();
}

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

// Handle File Upload & Post Creation
$title = isset($_POST['title']) ? $conn->real_escape_string($_POST['title']) : "";
$description = isset($_POST['description']) ? $conn->real_escape_string($_POST['description']) : "";
$type = isset($_POST['type']) ? $conn->real_escape_string(strtolower($_POST['type'])) : "blog";
$category = isset($_POST['category']) ? $conn->real_escape_string($_POST['category']) : "General";
$user_id = $user_data['user_id'];

if (empty($title) || empty($type)) {
    http_response_code(400);
    echo json_encode(["error" => "Title and Type are required"]);
    exit();
}

$duration = isset($_POST['duration']) ? $conn->real_escape_string($_POST['duration']) : "0:00";

// Define file size limits (in bytes)
$fileSizeLimits = [
    'video' => 500 * 1024 * 1024, // 500 MB
    'audio' => 100 * 1024 * 1024, // 100 MB
    'blog' => 50 * 1024 * 1024,   // 50 MB
];

$maxFileSize = isset($fileSizeLimits[$type]) ? $fileSizeLimits[$type] : 50 * 1024 * 1024;

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    $upload_errors = [
        UPLOAD_ERR_INI_SIZE => "File exceeds PHP upload_max_filesize limit (" . ini_get('upload_max_filesize') . "). Required: " . ($maxFileSize / (1024 * 1024)) . " MB for " . $type . " files.",
        UPLOAD_ERR_FORM_SIZE => "File exceeds PHP post_max_size limit (" . ini_get('post_max_size') . "). Required: " . ($maxFileSize / (1024 * 1024)) . " MB for " . $type . " files.",
        UPLOAD_ERR_PARTIAL => "Uploaded file was only partially received. Please try again.",
        UPLOAD_ERR_NO_FILE => "No file was uploaded.",
        UPLOAD_ERR_NO_TMP_DIR => "Missing temporary folder for upload. Contact administrator.",
        UPLOAD_ERR_CANT_WRITE => "Failed to write uploaded file to disk. Check server permissions.",
        UPLOAD_ERR_EXTENSION => "File upload stopped by a PHP extension."
    ];
    $error_code = isset($_FILES['file']) ? $_FILES['file']['error'] : UPLOAD_ERR_NO_FILE;
    $message = $upload_errors[$error_code] ?? "File upload failed.";
    
    // Add detailed diagnostics to help identify the issue
    $diagnostics = [
        "error_code" => $error_code,
        "message" => $message,
        "php_limits" => [
            "upload_max_filesize" => ini_get('upload_max_filesize'),
            "post_max_size" => ini_get('post_max_size'),
            "memory_limit" => ini_get('memory_limit'),
        ],
        "required_limit" => ($maxFileSize / (1024 * 1024)) . " MB",
        "file_size" => isset($_FILES['file']['size']) ? round($_FILES['file']['size'] / (1024 * 1024), 2) . " MB" : "unknown"
    ];
    
    http_response_code(400);
    echo json_encode(["error" => $message, "diagnostics" => $diagnostics]);
    exit();
}

// Validate file size based on type
if (isset($_FILES['file']['size']) && $_FILES['file']['size'] > $maxFileSize) {
    http_response_code(400);
    $sizeMB = round($maxFileSize / (1024 * 1024));
    $actualSizeMB = round($_FILES['file']['size'] / (1024 * 1024), 2);
    echo json_encode([
        "error" => "File size exceeds limit for " . $type . " files. Maximum allowed: " . $sizeMB . " MB. Your file: " . $actualSizeMB . " MB."
    ]);
    exit();
}

// Validate file type based on content type
$allowedTypes = [
    'video' => ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-matroska'],
    'audio' => ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/aac', 'audio/x-m4a'],
    'blog' => ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'text/plain']
];

if (isset($allowedTypes[$type]) && isset($_FILES['file']['type'])) {
    $fileType = strtolower($_FILES['file']['type']);
    // Some browsers send different MIME types, be flexible
    $isValidType = false;
    foreach ($allowedTypes[$type] as $allowed) {
        if (strpos($fileType, $allowed) !== false || strpos($allowed, $fileType) !== false) {
            $isValidType = true;
            break;
        }
    }
    
    if (!$isValidType) {
        http_response_code(400);
        echo json_encode([
            "error" => "Invalid file type for " . $type . ". Please upload a valid " . $type . " file."
        ]);
        exit();
    }
}

// Handle Thumbnail Upload for Video/Audio/Blog
$thumbnail_url = "";
if (isset($_FILES['thumbnail']) && $_FILES['thumbnail']['error'] === UPLOAD_ERR_OK) {
    $thumbnail_dir = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . "uploads" . DIRECTORY_SEPARATOR . "thumbnails" . DIRECTORY_SEPARATOR;
    
    // Create thumbnails directory if it doesn't exist
    if (!file_exists($thumbnail_dir)) {
        if (!mkdir($thumbnail_dir, 0777, true)) {
            http_response_code(500);
            echo json_encode(["error" => "Failed to create thumbnails directory."]);
            exit();
        }
    }
    
    // Validate thumbnail is an image
    $allowed_thumb_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    $thumb_type = strtolower($_FILES['thumbnail']['type']);
    if (!in_array($thumb_type, $allowed_thumb_types)) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid thumbnail format. Please upload a JPG, PNG, or WEBP image."]);
        exit();
    }
    
    // Validate thumbnail size (max 10MB)
    if ($_FILES['thumbnail']['size'] > 10 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(["error" => "Thumbnail size exceeds 10MB limit."]);
        exit();
    }
    
    $thumb_original_name = $_FILES['thumbnail']['name'];
    $thumb_extension = strtolower(pathinfo($thumb_original_name, PATHINFO_EXTENSION));
    $thumb_base_name = pathinfo($thumb_original_name, PATHINFO_FILENAME);
    $thumb_base_name = preg_replace('/[^A-Za-z0-9_-]+/', '_', $thumb_base_name);
    $thumb_base_name = trim($thumb_base_name, '_');
    if ($thumb_base_name === '') {
        $thumb_base_name = 'thumbnail';
    }
    $thumb_file_name = time() . "_thumb_" . $thumb_base_name . "." . $thumb_extension;
    $thumb_target_file = $thumbnail_dir . $thumb_file_name;
    
    if (move_uploaded_file($_FILES['thumbnail']['tmp_name'], $thumb_target_file)) {
        $thumbnail_url = "uploads/thumbnails/" . $thumb_file_name;
    }
}

// Insert Post
$sql = "INSERT INTO posts (user_id, title, description, type, category, status, duration, thumbnail) VALUES ('$user_id', '$title', '$description', '$type', '$category', 'pending', '$duration', '$thumbnail_url')";

if ($conn->query($sql) === TRUE) {
    $post_id = $conn->insert_id;
    
    // Handle File Upload if exists
    $file_url = "";
    $target_dir = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . "uploads" . DIRECTORY_SEPARATOR;
    
    // Check if upload directory exists and is writable
    if (!file_exists($target_dir)) {
        if (!mkdir($target_dir, 0777, true)) {
            http_response_code(500);
            echo json_encode(["error" => "Failed to create upload directory. Contact administrator."]);
            exit();
        }
    }
    
    if (!is_writable($target_dir)) {
        http_response_code(500);
        echo json_encode(["error" => "Upload directory is not writable. Contact administrator."]);
        exit();
    }

    $original_name = $_FILES["file"]["name"];
    $extension = strtolower(pathinfo($original_name, PATHINFO_EXTENSION));
    $base_name = pathinfo($original_name, PATHINFO_FILENAME);
    $base_name = preg_replace('/[^A-Za-z0-9_-]+/', '_', $base_name);
    $base_name = trim($base_name, '_');
    if ($base_name === '') {
        $base_name = 'file';
    }
    $file_name = time() . "_" . $base_name . ($extension ? "." . $extension : "");
    $target_file = $target_dir . $file_name;
    $file_type = $extension;

    if (!move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to store uploaded file. Please check server permissions and available disk space."]);
        exit();
    }

    // Save relative path for the frontend URL builder
    $file_url = "uploads/" . $file_name;

    $mediaSql = "INSERT INTO media (post_id, file_path, file_type, file_size) VALUES ('$post_id', '$file_url', '$file_type', " . $_FILES["file"]["size"] . ")";
    $conn->query($mediaSql);

    // Use uploaded thumbnail or fall back to file_url for blogs
    $final_thumbnail = !empty($thumbnail_url) ? $thumbnail_url : $file_url; 

    http_response_code(201);
    echo json_encode([
        "message" => "Post created successfully",
        "post" => [
            "id" => strval($post_id),
            "title" => $title,
            "type" => $type,
            "thumbnail" => $final_thumbnail
        ]
    ]);

} else {
    debug_log("SQL Error: " . $conn->error);
    http_response_code(500);
    echo json_encode(["error" => "Database error: Failed to create post. " . $conn->error]);
}
?>