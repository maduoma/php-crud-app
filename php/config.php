<?php
$servername = "NLNG-L-00287";
$username = "M.Achilefu";
$password = "NLNG@123";
$dbname = "DASHBOARD";

// Establish connection
try {
  $conn = new PDO("sqlsrv:server=$servername;Database=$dbname", $username, $password);
  $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
  echo json_encode(["status" => "error", "message" => "Connection failed: " . $e->getMessage()]);
  exit;
}