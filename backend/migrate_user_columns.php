<?php
require "config/db.php";

echo "Adding bio and social_links columns to users table...\n";
echo "======================================================\n\n";

// Add bio column
$sql1 = "ALTER TABLE users ADD COLUMN bio TEXT NULL AFTER avatar";
if ($conn->query($sql1) === TRUE) {
    echo "✓ Added bio column successfully\n";
} else {
    if (strpos($conn->error, "Duplicate column") !== false) {
        echo "✓ Bio column already exists\n";
    } else {
        echo "✗ Error adding bio column: " . $conn->error . "\n";
    }
}

// Add social_links column
$sql2 = "ALTER TABLE users ADD COLUMN social_links JSON NULL AFTER bio";
if ($conn->query($sql2) === TRUE) {
    echo "✓ Added social_links column successfully\n";
} else {
    if (strpos($conn->error, "Duplicate column") !== false) {
        echo "✓ Social_links column already exists\n";
    } else {
        echo "✗ Error adding social_links column: " . $conn->error . "\n";
    }
}

echo "\n\nVerifying table structure:\n";
echo "==========================\n";

$result = $conn->query("DESCRIBE users");
while ($row = $result->fetch_assoc()) {
    echo "{$row['Field']} - {$row['Type']}\n";
}

$conn->close();

echo "\n✓ Migration completed successfully!\n";
?>
