import os
import logging
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Flask App
app = Flask(__name__, static_folder='static')
CORS(app)

@app.route('/')
def index():
    """Serve the frontend entry point"""
    return send_from_directory('static', 'index.html')

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "agen8"})

@app.route('/api/available-actions', methods=['GET'])
def get_available_actions():
    """Return available action blocks (Placeholder for Phase 1)"""
    # This will be populated dynamically from action_blocks.py in Phase 3
    actions = [
        "web_scraper", 
        "ai_processor", 
        "email_sender", 
        "slack_sender", 
        "drive_reader", 
        "data_filter", 
        "github_action"
    ]
    return jsonify({"actions": actions})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=True)
