<?php
require __DIR__ . "/../../config/db.php";

// Add 'category' column to 'posts' table if it doesn't exist
$sql = "ALTER TABLE posts ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'General'";

if ($conn->query($sql) === TRUE) {
    echo "Successfully updated 'posts' table schema.\n";
} else {
    echo "Error updating schema: " . $conn->error . "\n";
}

// Verify the column exists
$result = $conn->query("SHOW COLUMNS FROM posts LIKE 'category'");
if ($result && $result->num_rows > 0) {
    echo "Column 'category' exists.\n";
} else {
    echo "Column 'category' MISSING.\n";
}

$conn->close();
?>
