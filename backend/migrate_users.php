<?php
header("Content-Type: text/plain");

// Connect to database
require_once __DIR__ . '/config/db.php';
// $conn is created in db.php

echo "Starting migration...\n";

// Check if 'bio' column exists
$result = $conn->query("SHOW COLUMNS FROM users LIKE 'bio'");
if ($result->num_rows == 0) {
    echo "Adding 'bio' column...\n";
    $sql = "ALTER TABLE users ADD COLUMN bio TEXT NULL DEFAULT NULL AFTER avatar";
    if ($conn->query($sql) === TRUE) {
        echo "Success: 'bio' column added.\n";
    } else {
        echo "Error: " . $conn->error . "\n";
    }
} else {
    echo "Skipping: 'bio' column already exists.\n";
}

// Check if 'social_links' column exists
$result = $conn->query("SHOW COLUMNS FROM users LIKE 'social_links'");
if ($result->num_rows == 0) {
    echo "Adding 'social_links' column...\n";
    $sql = "ALTER TABLE users ADD COLUMN social_links JSON NULL DEFAULT NULL AFTER bio";
    if ($conn->query($sql) === TRUE) {
        echo "Success: 'social_links' column added.\n";
    } else {
        echo "Error: " . $conn->error . "\n";
    }
} else {
    echo "Skipping: 'social_links' column already exists.\n";
}

echo "Migration completed.\n";
$conn->close();
?>
