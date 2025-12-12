# Start a simple HTTP server for static files

Write-Output "Start static server..."
Write-Output "URL: http://localhost:8080/index.html"
Write-Output ""
Write-Output "Press Ctrl+C to stop"
Write-Output ""

# Use Python simple HTTP server
cd docs
python -m http.server 8080
