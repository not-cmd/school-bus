import cv2
from mtcnn.mtcnn import MTCNN
from deepface import DeepFace
import numpy as np
import json
from datetime import datetime
import os
import time

class FaceRecognitionSystem:
    def __init__(self, encodings_file="encodings.json", threshold=10):
        self.threshold = threshold
        self.detector = MTCNN()
        self.known_faces = {}
        self.entry_marked = set()  # For entry camera
        self.exit_marked = set()   # For exit camera
        self.attendance_log = []
        
        # Create encodings directory if it doesn't exist
        os.makedirs(os.path.dirname(encodings_file), exist_ok=True)
        
        # Load encodings if file exists
        if os.path.exists(encodings_file):
            with open(encodings_file) as f:
                self.known_faces = json.load(f)
            print(f"Loaded {len(self.known_faces)} known faces")
        else:
            print(f"No encodings file found at {encodings_file}")
    
    def find_match(self, face_embedding):
        """Find the closest matching person for a face embedding"""
        best_match = "Unknown"
        min_distance = float('inf')
        
        for name, embedding in self.known_faces.items():
            distance = np.linalg.norm(np.array(embedding) - np.array(face_embedding))
            if distance < min_distance:
                min_distance = distance
                best_match = name
        
        # Return match only if below threshold
        return best_match if min_distance < self.threshold else "Unknown", min_distance
    
    def record_attendance(self, name, camera_type):
        """Record attendance for a person"""
        current_date = datetime.now().strftime("%Y-%m-%d")
        timestamp = datetime.now().strftime("%H:%M:%S")
        
        log_entry = {
            "name": name,
            "date": current_date,
            "time": timestamp,
            "camera": camera_type
        }
        
        self.attendance_log.append(log_entry)
        
        # Save to JSON file
        with open(f"attendance_{current_date}.json", "w") as f:
            json.dump(self.attendance_log, f, indent=2)
        
        print(f"{name} marked {camera_type} at {timestamp}")
        return log_entry
    
    def process_camera(self, camera_id=0, camera_type="entry"):
        """Process video from a specific camera"""
        cap = cv2.VideoCapture(camera_id)
        if not cap.isOpened():
            print(f"Error: Could not open camera {camera_id}")
            return
        
        marked_set = self.entry_marked if camera_type == "entry" else self.exit_marked
        
        print(f"Starting {camera_type} camera (ID: {camera_id})")
        print("Press 'q' to quit")
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Add overlay text showing camera type
            cv2.putText(frame, f"{camera_type.capitalize()} Camera", 
                       (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 165, 255), 2)
            
            # Detect faces
            results = self.detector.detect_faces(frame)
            
            for face in results:
                x, y, w, h = face['box']
                
                # Ensure positive dimensions (MTCNN can sometimes give negative values)
                x, y = max(0, x), max(0, y)
                
                # Skip if face is too small
                if w < 50 or h < 50:
                    continue
                
                face_crop = frame[y:y+h, x:x+w]
                if face_crop.size == 0:
                    continue
                
                try:
                    # Get face embedding
                    embedding = DeepFace.represent(img_path=face_crop, model_name="Facenet", enforce_detection=False)[0]["embedding"]
                    
                    # Find best match
                    name, confidence = self.find_match(embedding)
                    confidence_text = f"Conf: {100-confidence:.1f}%" if name != "Unknown" else ""
                    
                    # Record attendance if not already marked and it's a known person
                    if name != "Unknown" and name not in marked_set:
                        self.record_attendance(name, camera_type)
                        marked_set.add(name)
                    
                    # Draw rectangle and name
                    color = (0, 255, 0) if name != "Unknown" else (0, 0, 255)
                    cv2.rectangle(frame, (x, y), (x+w, y+h), color, 2)
                    cv2.putText(frame, name, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
                    
                    if confidence_text:
                        cv2.putText(frame, confidence_text, (x, y + h + 20), 
                                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)
                
                except Exception as e:
                    # Just draw the face without recognition
                    cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 0, 255), 2)
            
            # Show the frame
            cv2.imshow(f"Face Recognition - {camera_type.capitalize()} Camera", frame)
            
            # Check for quit
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        
        cap.release()
        cv2.destroyAllWindows()
    
    def process_entry_camera(self, camera_id=0):
        """Process the entry camera feed"""
        self.process_camera(camera_id, "entry")
    
    def process_exit_camera(self, camera_id=1):
        """Process the exit camera feed"""
        self.process_camera(camera_id, "exit")

if __name__ == "__main__":
    # Example usage
    face_system = FaceRecognitionSystem()
    
    # Ask which camera to use
    camera_type = input("Which camera to process? (entry/exit/both): ").lower()
    
    if camera_type == "entry":
        face_system.process_entry_camera()
    elif camera_type == "exit":
        face_system.process_exit_camera()
    elif camera_type == "both":
        import threading
        
        # Use threading to run both cameras simultaneously
        entry_thread = threading.Thread(target=face_system.process_entry_camera, args=(0,))
        exit_thread = threading.Thread(target=face_system.process_exit_camera, args=(1,))
        
        entry_thread.start()
        exit_thread.start()
        
        entry_thread.join()
        exit_thread.join()
    else:
        print("Invalid option. Please choose entry, exit, or both.") 