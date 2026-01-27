<?php
// Test the get.php endpoint directly
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Simulate the GET request
$_GET['id'] = '2';
$_SERVER['REQUEST_METHOD'] = 'GET';

echo "Testing get.php with id=2\n";
echo "==========================\n\n";

try {
    require "api/users/get.php";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
?>
