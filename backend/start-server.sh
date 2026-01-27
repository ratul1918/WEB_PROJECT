#!/bin/bash

# UIU Talent Showcase - Start Backend Server with Increased Upload Limits
echo "========================================"
echo "UIU Talent Showcase - Backend Server"
echo "========================================"
echo ""

# Navigate to script directory
cd "$(dirname "$0")"

echo "Starting PHP server with increased upload limits..."
echo ""
echo "Configuration:"
echo "  - Max Upload Size: 500 MB"
echo "  - Max Post Size: 500 MB"
echo "  - Memory Limit: 512 MB"
echo "  - Max Execution Time: 600 seconds"
echo ""
echo "File Size Limits by Type:"
echo "  - Video: 500 MB"
echo "  - Audio: 100 MB"
echo "  - Blog Images: 50 MB"
echo ""
echo "Server URL: http://localhost:8000"
echo "Press Ctrl+C to stop the server"
echo ""

# Start PHP server with custom configuration
php -S localhost:8000 \
    -d upload_max_filesize=500M \
    -d post_max_size=550M \
    -d memory_limit=1024M \
    -d max_execution_time=600 \
    -d max_input_time=600 \
    -d file_uploads=On \
    -d max_file_uploads=20
