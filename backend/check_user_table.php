<?php
require "config/db.php";

echo "Checking users table structure:\n";
echo "================================\n\n";

$result = $conn->query("DESCRIBE users");

while ($row = $result->fetch_assoc()) {
    echo "{$row['Field']} - {$row['Type']}\n";
}

echo "\n\nSample user data:\n";
echo "==================\n";

$result = $conn->query("SELECT * FROM users WHERE id = 2");
$user = $result->fetch_assoc();

echo json_encode($user, JSON_PRETTY_PRINT);

$conn->close();
?>
