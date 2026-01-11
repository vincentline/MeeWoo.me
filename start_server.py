import http.server
import socketserver
import os
import sys

# 配置端口
PORT = 8085

# 如果存在 docs 目录，则将其作为 web 根目录
if os.path.exists("docs"):
    print(f"Found 'docs' directory, using it as web root.")
    os.chdir("docs")
else:
    print(f"Using current directory as web root.")

class CoopCoepHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # 添加启用 SharedArrayBuffer 所必需的头
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
        # 允许跨域访问
        self.send_header("Access-Control-Allow-Origin", "*")
        super().end_headers()

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

print(f"Starting server...")
print("Enabled headers: COOP: same-origin, COEP: require-corp")

# 尝试绑定端口，如果被占用则自动递增
while True:
    try:
        with ReusableTCPServer(("", PORT), CoopCoepHandler) as httpd:
            print(f"Server started at http://localhost:{PORT}")
            print("Press Ctrl+C to stop")
            httpd.serve_forever()
        break
    except KeyboardInterrupt:
        print("\nServer stopped.")
        break
    except OSError as e:
        # 捕获所有绑定错误，强制尝试下一个端口
        # 常见错误码：98, 10048 (Address already in use), 10013 (Permission denied)
        print(f"Port {PORT} bind failed: {e}")
        print(f"Trying next port {PORT + 1}...")
        PORT += 1