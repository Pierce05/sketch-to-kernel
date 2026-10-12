import http.server
import socket
import socketserver
import sys

PORT = 8000

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and caching headers for smooth slide streaming
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def run_server():
    local_ip = get_local_ip()
    handler = CustomHandler
    
    print("\n" + "=" * 65)
    print("  🚀 S2U / Sketch2Kernel Presentation Server")
    print("  Hacktoberfest 2026 × MUJ Offline Finals")
    print("=" * 65)
    print(f"\n  📽️  PROJECTOR SCREEN (Slide Deck):")
    print(f"      http://localhost:{PORT}/presentation.html")
    print(f"\n  💻  LAPTOP SCREEN (Speaker Notes & Console):")
    print(f"      http://localhost:{PORT}/presenter.html")
    print(f"\n  📱  SMARTPHONE REMOTE (View Notes on your phone):")
    print(f"      http://{local_ip}:{PORT}/presenter.html")
    print("\n" + "=" * 65)
    print("  Press Ctrl+C to terminate the presentation server.")
    print("=" * 65 + "\n")

    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[✓] Presentation server stopped cleanly.")
        sys.exit(0)

if __name__ == "__main__":
    run_server()
