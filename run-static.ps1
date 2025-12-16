# Start a HTTP server with SharedArrayBuffer support for FFmpeg.wasm

Write-Output "Starting server with SharedArrayBuffer support..."
Write-Output "URL: http://localhost:8081/index.html"
Write-Output ""
Write-Output "Note: This server enables Cross-Origin-Opener-Policy headers"
Write-Output "      required by FFmpeg.wasm and other WASM libraries."
Write-Output ""
Write-Output "Press Ctrl+C to stop"
Write-Output ""

# Use custom Python server with COOP/COEP headers
cd docs
python run-server.py
