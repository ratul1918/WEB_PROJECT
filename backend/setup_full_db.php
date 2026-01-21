<?php
require "config/db.php";

// 1. Create Users Table
$sql = "CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
if ($conn->query($sql) === TRUE) {
    echo "Users table check/creation successful\n";
} else {
    echo "Error creating users table: " . $conn->error . "\n";
}

// 2. Create Posts Table
$sql = "CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    views INT DEFAULT 0,
    duration VARCHAR(20) DEFAULT '0:00',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)";
if ($conn->query($sql) === TRUE) {
    echo "Posts table check/creation successful\n";
} else {
    echo "Error creating posts table: " . $conn->error . "\n";
}

// 3. Create Media Table
$sql = "CREATE TABLE IF NOT EXISTS media (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
)";
if ($conn->query($sql) === TRUE) {
    echo "Media table check/creation successful\n";
} else {
    echo "Error creating media table: " . $conn->error . "\n";
}

// 4. Create Votes Table
$sql = "CREATE TABLE IF NOT EXISTS votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_vote (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
)";
if ($conn->query($sql) === TRUE) {
    echo "Votes table check/creation successful\n";
} else {
    echo "Error creating votes table: " . $conn->error . "\n";
}

// 5. Insert Admin User
$admin_email = "admin@gmail.com";
$check_admin = $conn->query("SELECT * FROM users WHERE email='$admin_email'");
if ($check_admin->num_rows == 0) {
    $password = password_hash("admin123", PASSWORD_BCRYPT);
    $sql = "INSERT INTO users (name, email, password, role) VALUES ('Admin', '$admin_email', '$password', 'admin')";
    if ($conn->query($sql) === TRUE) {
        echo "Admin user created successfully\n";
    } else {
        echo "Error creating admin user: " . $conn->error . "\n";
    }
} else {
    echo "Admin user already exists\n";
}

// 6. Insert Default Student User
$user_email = "user@gmail.com";
$check_user = $conn->query("SELECT * FROM users WHERE email='$user_email'");
if ($check_user->num_rows == 0) {
    $password = password_hash("user123", PASSWORD_BCRYPT);
    $sql = "INSERT INTO users (name, email, password, role) VALUES ('Student User', '$user_email', '$password', 'student')";
    if ($conn->query($sql) === TRUE) {
        echo "Student user created successfully\n";
    } else {
        echo "Error creating student user: " . $conn->error . "\n";
    }
} else {
    echo "Student user already exists\n";
}

echo "Full Database Setup Completed.\n";
?>
