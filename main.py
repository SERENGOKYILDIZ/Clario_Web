#!/usr/bin/env python3
from flask import Flask, send_from_directory, redirect, url_for
import os, sys
from pathlib import Path

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0  # Disable caching for development

# Set working directory
os.chdir(Path(__file__).parent)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_file(filename):
    return send_from_directory('.', filename)

@app.route('/pages/<path:filename>')
def serve_pages(filename):
    return send_from_directory('pages', filename)

@app.route('/js/<path:filename>')
def serve_js(filename):
    return send_from_directory('js', filename)

@app.route('/images/<path:filename>')
def serve_images(filename):
    return send_from_directory('images', filename)

@app.route('/config/<path:filename>')
def serve_config(filename):
    return send_from_directory('config', filename)

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] in ['--help', '-h', 'help']:
        print("🚀 Clario Flask Server")
        print("Usage: python main.py [port]")
        print("Port range: 1-65535 (default: 8000)")
        print("Features: Auto-reload, Better routing, Development tools")
        sys.exit(0)
    
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    
    if not 1 <= port <= 65535:
        print("❌ Port must be 1-65535")
        sys.exit(1)
    
    print(f"🚀 Clario Flask Server: http://localhost:{port}")
    print(f"📁 Serving from: {os.getcwd()}")
    print(f"🔄 Auto-reload: Enabled")
    print(f"⏹️  Ctrl+C to stop")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=port, debug=True, use_reloader=True)
