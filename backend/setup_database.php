<?php
// Connect to MySQL server without selecting a database
$host = "127.0.0.1";
$user = "root";
$password = "";

$conn = new mysqli($host, $user, $password);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "Connected to MySQL server successfully.\n";

// Read and execute SQL file
$sqlFile = __DIR__ . '/../uiu_talent_show.sql';
$sql = file_get_contents($sqlFile);

// Remove SQL comments
$sql = preg_replace('/--.*$/m', '', $sql);
$sql = preg_replace('/\/\*.*?\*\//s', '', $sql);

// Split into individual statements and clean
$statements = explode(';', $sql);

foreach ($statements as $statement) {
    $statement = trim($statement);
    if (!empty($statement)) {
        if ($conn->query($statement) === TRUE) {
            // Success - continue
        } else {
            if (strpos($statement, 'DROP DATABASE') === false) {
                echo "Warning: " . $conn->error . "\n";
            }
        }
        
        // Clear any results
        while ($conn->more_results()) {
            $conn->next_result();
            if ($res = $conn->store_result()) {
                $res->free();
            }
        }
    }
}

echo "Database setup completed successfully!\n";

$conn->close();
?>
