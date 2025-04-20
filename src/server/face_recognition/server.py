from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import json
from datetime import datetime
import cv2
import threading
import time
from detect_and_mark import FaceRecognitionSystem
from utils import encode_faces

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# Global variables
face_system = None
camera_threads = {}
is_processing = False
attendance_data = []

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get the status of the face recognition system"""
    global face_system, is_processing
    
    return jsonify({
        'system_ready': face_system is not None,
        'is_processing': is_processing,
        'known_faces': list(face_system.known_faces.keys()) if face_system else [],
        'entry_marked': list(face_system.entry_marked) if face_system else [],
        'exit_marked': list(face_system.exit_marked) if face_system else []
    })

@app.route('/api/attendance', methods=['GET'])
def get_attendance():
    """Get the current attendance data"""
    global attendance_data
    
    # Try to load attendance data from today's file
    current_date = datetime.now().strftime("%Y-%m-%d")
    filename = f"attendance_{current_date}.json"
    
    if os.path.exists(filename):
        with open(filename, 'r') as f:
            attendance_data = json.load(f)
    
    return jsonify(attendance_data)

@app.route('/api/start', methods=['POST'])
def start_recognition():
    """Start the face recognition system"""
    global face_system, is_processing, camera_threads
    
    if is_processing:
        return jsonify({'error': 'Face recognition is already running'}), 400
    
    # Initialize the face recognition system if needed
    if not face_system:
        face_system = FaceRecognitionSystem()
    
    # Get camera options from request
    data = request.json
    camera_type = data.get('camera_type', 'both')
    
    try:
        is_processing = True
        
        if camera_type in ['entry', 'both']:
            # Start entry camera in a separate thread
            entry_thread = threading.Thread(
                target=process_camera_headless,
                args=(face_system, 0, 'entry')
            )
            entry_thread.daemon = True
            entry_thread.start()
            camera_threads['entry'] = entry_thread
        
        if camera_type in ['exit', 'both']:
            # Start exit camera in a separate thread
            exit_thread = threading.Thread(
                target=process_camera_headless,
                args=(face_system, 1, 'exit')
            )
            exit_thread.daemon = True
            exit_thread.start()
            camera_threads['exit'] = exit_thread
        
        return jsonify({'success': True, 'message': f'Started {camera_type} camera(s)'})
    
    except Exception as e:
        is_processing = False
        return jsonify({'error': str(e)}), 500

@app.route('/api/stop', methods=['POST'])
def stop_recognition():
    """Stop the face recognition system"""
    global is_processing, camera_threads
    
    if not is_processing:
        return jsonify({'error': 'Face recognition is not running'}), 400
    
    try:
        is_processing = False
        # Let the threads stop gracefully
        time.sleep(1)
        camera_threads = {}
        return jsonify({'success': True, 'message': 'Face recognition stopped'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/encode', methods=['POST'])
def encode_faces_api():
    """Encode faces from the dataset directory"""
    try:
        result = encode_faces()
        return jsonify({
            'success': True, 
            'message': 'Face encodings created successfully',
            'encoded_faces': list(result.keys()) if result else []
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def process_camera_headless(face_system, camera_id, camera_type):
    """Process camera without displaying UI (headless operation)"""
    global is_processing, attendance_data
    
    cap = cv2.VideoCapture(camera_id)
    if not cap.isOpened():
        print(f"Error: Could not open camera {camera_id}")
        return
    
    marked_set = face_system.entry_marked if camera_type == "entry" else face_system.exit_marked
    
    print(f"Starting {camera_type} camera (ID: {camera_id}) in headless mode")
    
    while is_processing:
        ret, frame = cap.read()
        if not ret:
            break
        
        # Detect faces
        results = face_system.detector.detect_faces(frame)
        
        for face in results:
            x, y, w, h = face['box']
            
            # Ensure positive dimensions
            x, y = max(0, x), max(0, y)
            
            # Skip if face is too small
            if w < 50 or h < 50:
                continue
            
            face_crop = frame[y:y+h, x:x+w]
            if face_crop.size == 0:
                continue
            
            try:
                # Get face embedding
                embedding = DeepFace.represent(
                    img_path=face_crop, 
                    model_name="Facenet", 
                    enforce_detection=False
                )[0]["embedding"]
                
                # Find best match
                name, confidence = face_system.find_match(embedding)
                
                # Record attendance if not already marked and it's a known person
                if name != "Unknown" and name not in marked_set:
                    log_entry = face_system.record_attendance(name, camera_type)
                    marked_set.add(name)
                    attendance_data.append(log_entry)
            
            except Exception as e:
                # Just continue if face processing fails
                pass
        
        # Short sleep to reduce CPU usage
        time.sleep(0.1)
    
    cap.release()
    print(f"Stopped {camera_type} camera (ID: {camera_id})")

if __name__ == '__main__':
    # Run the Flask server
    app.run(host='0.0.0.0', port=5000, debug=True) 