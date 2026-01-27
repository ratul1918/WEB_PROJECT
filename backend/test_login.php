<?php
// Simulate POST request
$_SERVER['REQUEST_METHOD'] = 'POST';
file_put_contents('php://input', json_encode([
    'email' => 'admin@uiu.ac.bd',
    'password' => 'admin123'
]));

// Capture output
ob_start();
try {
    include 'api/auth/login.php';
    $output = ob_get_clean();
    echo $output;
} catch (Exception $e) {
    ob_end_clean();
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString();
}
?>
