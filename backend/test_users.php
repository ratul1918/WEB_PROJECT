<?php
require "config/db.php";

$result = $conn->query('SELECT id, name, email, role FROM users LIMIT 10');

echo "Users in database:\n";
echo "==================\n";

if ($result->num_rows === 0) {
    echo "No users found!\n";
} else {
    while($row = $result->fetch_assoc()) {
        echo json_encode($row, JSON_PRETTY_PRINT) . "\n";
    }
}

$conn->close();
?>
