<?php
require 'config/db.php';

// Add views column to posts table
$sql = "SHOW COLUMNS FROM posts LIKE 'views'";
$result = $conn->query($sql);

if ($result->num_rows == 0) {
    $sql = "ALTER TABLE posts ADD COLUMN views INT DEFAULT 0";
    if ($conn->query($sql) === TRUE) {
        echo "Views column added successfully\n";
    } else {
        echo "Error adding views column: " . $conn->error . "\n";
    }
} else {
    echo "Views column already exists\n";
}
?>
