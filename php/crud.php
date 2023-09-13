<?php
include 'config.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $action = $_POST['action'];

    switch ($action) {
        case 'create':
            $name = $_POST['name'];
            $createdTime = date('Y-m-d H:i:s');
            $updatedTime = $createdTime;
            $department = $_POST['department'];
            $profile_picture = $_FILES['profile_picture']['name'];

            $stmt = $conn->prepare("INSERT INTO Users (name, created_time, updated_time, department, profile_picture) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$name, $createdTime, $updatedTime, $department, $profile_picture]);

            $id = $conn->lastInsertId();

            foreach ($_FILES['multiple_files']['name'] as $key => $file_name) {
                $stmt = $conn->prepare("INSERT INTO UserFiles (user_id, file_name) VALUES (?, ?)");
                $stmt->execute([$id, $file_name]);
            }

            move_uploaded_file($_FILES['profile_picture']['tmp_name'], 'uploads/' . $profile_picture);

            foreach ($_FILES['multiple_files']['tmp_name'] as $key => $tmp_name) {
                move_uploaded_file($tmp_name, 'uploads/' . $_FILES['multiple_files']['name'][$key]);
            }

            echo json_encode(['statusCode' => 200]);
            break;

        case 'read':
            $stmt = $conn->prepare("SELECT Users.id, Users.name, Users.created_time, Users.updated_time, Users.department, Users.profile_picture, STRING_AGG(UserFiles.file_name, ', ') AS file_names FROM Users LEFT JOIN UserFiles ON Users.id = UserFiles.user_id GROUP BY Users.id, Users.name, Users.created_time, Users.updated_time, Users.department, Users.profile_picture");
            $stmt->execute();
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($data);
            break;
            // $stmt = $conn->prepare("SELECT * FROM Users");
            // $stmt->execute();
            // $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            // echo json_encode($data);
            // break;

        case 'update':
            $id = $_POST['id'];
            $name = $_POST['name'];
            $updatedTime = date('Y-m-d H:i:s');
            $department = $_POST['department'];
            $profile_picture = $_FILES['profile_picture']['name'];

            $stmt = $conn->prepare("UPDATE Users SET name = ?, updated_time = ?, department = ?, profile_picture = ? WHERE id = ?");
            $stmt->execute([$name, $updatedTime, $department, $profile_picture, $id]);

            $stmt = $conn->prepare("DELETE FROM UserFiles WHERE user_id = ?");
            $stmt->execute([$id]);

            foreach ($_FILES['multiple_files']['name'] as $key => $file_name) {
                $stmt = $conn->prepare("INSERT INTO UserFiles (user_id, file_name) VALUES (?, ?)");
                $stmt->execute([$id, $file_name]);
            }

            move_uploaded_file($_FILES['profile_picture']['tmp_name'], 'uploads/' . $profile_picture);

            foreach ($_FILES['multiple_files']['tmp_name'] as $key => $tmp_name) {
                move_uploaded_file($tmp_name, 'uploads/' . $_FILES['multiple_files']['name'][$key]);
            }

            echo json_encode(['statusCode' => 200]);
            break;


        case 'delete':
            $id = $_POST['id'];

            // Delete first from UserFiles
            $stmt = $conn->prepare("DELETE FROM UserFiles WHERE user_id = ?");
            $stmt->execute([$id]);

            // Now delete from Users
            $stmt = $conn->prepare("DELETE FROM Users WHERE id = ?");
            $stmt->execute([$id]);

            ob_clean(); // Clean any previous output buffer
            echo json_encode(['statusCode' => 200]);
            break;

        default:
            echo json_encode(['statusCode' => 400]);
            break;
    }
}
