import http.server
import socketserver
import json
import os

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        if self.path == '/get-config':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            config_path = os.path.join(DIRECTORY, 'config.json')
            config_data = {
                "firebase_project_id": "department-of-ece-2b5d7",
                "firebase_api_key": "AIzaSyBGPOKYAMZObNcinVIgm4ehUew1L9XY11s",
                "supabase_url": "https://jbzogspalrrahkrthvmh.supabase.co",
                "supabase_key": ""
            }
            if os.path.exists(config_path):
                try:
                    with open(config_path, 'r', encoding='utf-8') as f:
                        loaded = json.load(f)
                        config_data.update(loaded)
                except Exception:
                    pass
            self.wfile.write(json.dumps(config_data).encode('utf-8'))
            return
            
        return super().do_GET()

    def do_POST(self):
        if self.path == '/save-html':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                html_content = data.get('html')
                
                if html_content:
                    index_path = os.path.join(DIRECTORY, 'index.html')
                    with open(index_path, 'w', encoding='utf-8') as f:
                        f.write(html_content)
                    
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({"status": "success", "message": "index.html updated successfully"}).encode('utf-8'))
                    return
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode('utf-8'))
                return

        elif self.path == '/save-config':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                fb_project_id = data.get('firebase_project_id', 'vsb-ece-dept')
                fb_api_key = data.get('firebase_api_key', '')
                url = data.get('supabase_url', '')
                key = data.get('supabase_key', '')
                
                config_path = os.path.join(DIRECTORY, 'config.json')
                save_payload = {
                    "firebase_project_id": fb_project_id,
                    "firebase_api_key": fb_api_key,
                    "supabase_url": url,
                    "supabase_key": key
                }
                with open(config_path, 'w', encoding='utf-8') as f:
                    json.dump(save_payload, f, indent=2)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "success", "message": "config.json updated successfully"}).encode('utf-8'))
                return
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode('utf-8'))
                return
        
        self.send_error(404, "File not found")

    def do_OPTIONS(self):
        # Support CORS preflight
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

# Allow port reuse to prevent address already in use errors
socketserver.TCPServer.allow_reuse_address = True

with socketserver.TCPServer(("", PORT), MyHandler) as httpd:
    print(f"Serving VSB ECE website on http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        httpd.server_close()
