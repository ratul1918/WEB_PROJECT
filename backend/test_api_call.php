<?php
// Quick test of the user endpoint using file_get_contents
$context = stream_context_create([
    'http' => [
        'ignore_errors' => true
    ]
]);

$response = file_get_contents("http://localhost:8000/api/users/get.php?id=2", false, $context);
$httpCode = $http_response_header[0] ?? 'Unknown';

echo "HTTP Response: $httpCode\n";
echo "Response Body:\n$response\n";
?>
