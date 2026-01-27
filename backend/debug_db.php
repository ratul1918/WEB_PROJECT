<?php
require "config/db.php";

header("Content-Type: application/json");

// Check what statuses exist in posts table
$statusSQL = "SELECT DISTINCT status, COUNT(*) as count FROM posts GROUP BY status";
$statusResult = $conn->query($statusSQL);
$statuses = [];
if ($statusResult) {
    while ($row = $statusResult->fetch_assoc()) {
        $statuses[] = $row;
    }
}

// Check total votes
$votesSQL = "SELECT COUNT(*) as total_votes FROM votes";
$votesResult = $conn->query($votesSQL);
$votesRow = $votesResult->fetch_assoc();

// Check votes by user ID 8
$userVotesSql = "SELECT COUNT(*) as user_8_votes FROM votes WHERE user_id = 8";
$userVotesResult = $conn->query($userVotesSql);
$userVotesRow = $userVotesResult->fetch_assoc();

// Check tables exist
$tablesSql = "SHOW TABLES LIKE '%votes%'";
$tablesResult = $conn->query($tablesSql);
$tables = [];
if ($tablesResult) {
    while ($row = $tablesResult->fetch_assoc()) {
        $tables[] = $row;
    }
}

echo json_encode([
    "post_statuses" => $statuses,
    "total_votes" => intval($votesRow['total_votes']),
    "votes_by_user_8" => intval($userVotesRow['user_8_votes']),
    "tables" => $tables
], JSON_PRETTY_PRINT);
?>
