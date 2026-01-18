<?php
require __DIR__ . '/config/db.php';

// Add duration column if it doesn't exist
$sql = "SHOW COLUMNS FROM posts LIKE 'duration'";
$result = $conn->query($sql);

if ($result->num_rows == 0) {
    $sql = "ALTER TABLE posts ADD COLUMN duration VARCHAR(20) DEFAULT '0:00'";
    if ($conn->query($sql) === TRUE) {
        echo "Duration column added successfully";
    } else {
        echo "Error adding column: " . $conn->error;
    }
} else {
    echo "Duration column already exists";
}
?>
