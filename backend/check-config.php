<?php
header("Content-Type: application/json");

$config = [
    "php_version" => PHP_VERSION,
    "loaded_ini" => php_ini_loaded_file(),
    "additional_ini" => php_ini_scanned_files(),
    "current_settings" => [
        "upload_max_filesize" => ini_get('upload_max_filesize'),
        "post_max_size" => ini_get('post_max_size'),
        "memory_limit" => ini_get('memory_limit'),
        "max_execution_time" => ini_get('max_execution_time'),
        "max_input_time" => ini_get('max_input_time'),
        "file_uploads" => ini_get('file_uploads') ? 'Enabled' : 'Disabled',
        "upload_tmp_dir" => ini_get('upload_tmp_dir') ?: sys_get_temp_dir(),
        "max_file_uploads" => ini_get('max_file_uploads'),
    ],
    "upload_tmp_dir_writable" => is_writable(ini_get('upload_tmp_dir') ?: sys_get_temp_dir()),
    "uploads_dir_path" => __DIR__ . DIRECTORY_SEPARATOR . "uploads",
    "uploads_dir_exists" => file_exists(__DIR__ . DIRECTORY_SEPARATOR . "uploads"),
    "uploads_dir_writable" => is_writable(__DIR__ . DIRECTORY_SEPARATOR . "uploads"),
];

echo json_encode($config, JSON_PRETTY_PRINT);
?>
