<?php
/**
 * Migration script to add thumbnail column to posts table
 * Run this once for existing installations
 */

require __DIR__ . "/config/db.php";

echo "Starting migration: Adding thumbnail column to posts table...\n";

// Check if column already exists
$checkSql = "SHOW COLUMNS FROM posts LIKE 'thumbnail'";
$result = $conn->query($checkSql);

if ($result->num_rows > 0) {
    echo "Column 'thumbnail' already exists. Skipping migration.\n";
} else {
    $alterSql = "ALTER TABLE posts ADD COLUMN thumbnail VARCHAR(255) NULL AFTER duration";
    
    if ($conn->query($alterSql) === TRUE) {
        echo "SUCCESS: Added 'thumbnail' column to posts table.\n";
    } else {
        echo "ERROR: Failed to add column - " . $conn->error . "\n";
    }
}

$conn->close();
echo "Migration completed.\n";
?>
