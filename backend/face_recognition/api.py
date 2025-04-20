from flask import Flask, request, jsonify
import cv2
import numpy as np
import base64
import threading
import time
import os
from detect_and_mark import FaceDetectionSystem

# Initialize Flask app
app = Flask(__name__)

# Initialize face detection system
system = FaceDetectionSystem(
    encodings_file="face_encodings.pkl",
    attendance_file="attendance.json"
)

# Global variables for camera streams
cameras = {
    "entry": None,
    "exit": None
}

def decode_image(encoded_data):
    """Decode base64 image data"""
    try:
        # Remove header if present
        if "base64," in encoded_data:
            encoded_data = encoded_data.split("base64,")[1]
        
        # Decode base64 string
        nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        print(f"Error decoding image: {e}")
        return None

def camera_thread(camera_id, camera_type):
    """Thread function for continuous camera processing"""
    global cameras
    
    # Open camera
    cap = cv2.VideoCapture(camera_id)
    if not cap.isOpened():
        print(f"[ERROR] Could not open camera {camera_id}")
        return
    
    cameras[camera_type] = {"cap": cap, "last_frame": None, "last_result": None}
    
    while True:
        # Read frame
        ret, frame = cap.read()
        if not ret:
            print(f"[ERROR] Failed to read frame from {camera_type} camera")
            break
        
        # Process frame
        processed_frame, _ = system.process_frame(frame, camera_type)
        
        # Update last frame and result
        cameras[camera_type]["last_frame"] = processed_frame
        cameras[camera_type]["last_result"] = system.get_api_detection_result(frame, camera_type)
        
        # Sleep to reduce CPU usage
        time.sleep(0.1)

@app.route('/api/status', methods=['GET'])
def status():
    """Check if the API is running"""
    return jsonify({
        "status": "online",
        "cameras": {
            "entry": cameras["entry"] is not None,
            "exit": cameras["exit"] is not None
        }
    })

@app.route('/api/detect', methods=['POST'])
def detect():
    """Detect faces in an image"""
    # Check if JSON data is present
    if not request.json or 'image' not in request.json:
        return jsonify({"error": "No image data provided"}), 400
    
    # Get parameters
    camera_type = request.json.get('camera_type', 'entry')
    if camera_type not in ['entry', 'exit']:
        return jsonify({"error": "Invalid camera type. Must be 'entry' or 'exit'"}), 400
    
    # Decode image
    img = decode_image(request.json['image'])
    if img is None:
        return jsonify({"error": "Invalid image data"}), 400
    
    # Process image
    result = system.get_api_detection_result(img, camera_type)
    
    return jsonify(result)

@app.route('/api/attendance', methods=['GET'])
def get_attendance():
    """Get attendance records"""
    date_filter = request.args.get('date')
    person_filter = request.args.get('person_id')
    
    # Load attendance data
    system.load_attendance()
    records = system.attendance.get("records", [])
    
    # Apply filters
    if date_filter:
        records = [r for r in records if r["date"] == date_filter]
    if person_filter:
        records = [r for r in records if r["person_id"] == person_filter]
    
    # Group records by date and person
    grouped = {}
    for record in records:
        date = record["date"]
        person_id = record["person_id"]
        key = f"{date}_{person_id}"
        
        if key not in grouped:
            grouped[key] = {
                "date": date,
                "person_id": person_id,
                "entry": None,
                "exit": None
            }
        
        if record["type"] == "entry":
            grouped[key]["entry"] = {
                "timestamp": record["timestamp"],
                "confidence": record["confidence"]
            }
        elif record["type"] == "exit":
            grouped[key]["exit"] = {
                "timestamp": record["timestamp"],
                "confidence": record["confidence"]
            }
    
    return jsonify({
        "count": len(grouped),
        "records": list(grouped.values())
    })

@app.route('/api/start_cameras', methods=['POST'])
def start_cameras():
    """Start camera threads"""
    # Check if already running
    if cameras["entry"] is not None or cameras["exit"] is not None:
        return jsonify({"error": "Cameras already running"}), 400
    
    # Get camera IDs
    try:
        entry_camera = request.json.get('entry_camera', 0)
        exit_camera = request.json.get('exit_camera', 1)
    except:
        return jsonify({"error": "Invalid request format"}), 400
    
    # Start camera threads
    threading.Thread(target=camera_thread, args=(entry_camera, "entry"), daemon=True).start()
    threading.Thread(target=camera_thread, args=(exit_camera, "exit"), daemon=True).start()
    
    return jsonify({"status": "Cameras started"})

@app.route('/api/latest_detection', methods=['GET'])
def latest_detection():
    """Get latest detection results"""
    camera_type = request.args.get('camera', 'entry')
    if camera_type not in ['entry', 'exit']:
        return jsonify({"error": "Invalid camera type"}), 400
    
    if cameras[camera_type] is None or cameras[camera_type]["last_result"] is None:
        return jsonify({"error": f"{camera_type.capitalize()} camera not active"}), 404
    
    return jsonify(cameras[camera_type]["last_result"])

if __name__ == '__main__':
    # Check if encodings file exists
    if not os.path.exists(system.attendance_file):
        print("[INFO] Creating new attendance file")
        system.save_attendance()
    
    # Start the Flask app
    app.run(host='0.0.0.0', port=5000, debug=True) 