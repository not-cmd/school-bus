#!/usr/bin/env python3
import cv2
import face_recognition
import numpy as np
import json
import os
import argparse
import time
from datetime import datetime
import threading
from utils import load_encodings, find_matching_face

class FaceDetectionSystem:
    def __init__(self, encodings_file, attendance_file, camera_id=0, camera_name="entry", 
                 detection_method="hog", confidence_threshold=0.5, mark_attendance=True):
        """
        Initialize the face detection system.
        
        Args:
            encodings_file (str): Path to the encodings file
            attendance_file (str): Path to the attendance file
            camera_id (int or str): Camera ID or RTSP URL
            camera_name (str): Name of the camera ('entry' or 'exit')
            detection_method (str): Face detection method ('hog' or 'cnn')
            confidence_threshold (float): Minimum confidence for a valid match
            mark_attendance (bool): Whether to mark attendance or just detect
        """
        self.encodings_file = encodings_file
        self.attendance_file = attendance_file
        self.camera_id = camera_id
        self.camera_name = camera_name
        self.detection_method = detection_method
        self.confidence_threshold = confidence_threshold
        self.mark_attendance = mark_attendance
        
        # Load known face encodings
        self.data = load_encodings(encodings_file)
        
        # Load existing attendance records
        self.attendance_records = self._load_attendance()
        
        # Properties for frame processing
        self.last_frame = None
        self.last_detection_result = None
        self.is_running = False
        self.detection_thread = None
        
        # Time tracking
        self.process_times = []
        self.last_attendance_time = {}
        
        print(f"[INFO] Loaded {len(self.data['encodings'])} face encodings")
        
    def _load_attendance(self):
        """Load attendance records from file if exists, otherwise create empty records."""
        if os.path.exists(self.attendance_file):
            with open(self.attendance_file, "r") as f:
                try:
                    records = json.load(f)
                except json.JSONDecodeError:
                    records = {"records": []}
        else:
            records = {"records": []}
        
        return records
    
    def _save_attendance(self):
        """Save attendance records to file."""
        with open(self.attendance_file, "w") as f:
            json.dump(self.attendance_records, f, indent=4)
    
    def mark_entry_exit(self, person_id, camera_type):
        """
        Mark entry or exit for a person.
        
        Args:
            person_id (str): ID of the person
            camera_type (str): Type of camera ('entry' or 'exit')
        """
        # Don't mark attendance if disabled
        if not self.mark_attendance:
            return
        
        # Get current date and time
        now = datetime.now()
        date_str = now.strftime("%Y-%m-%d")
        time_str = now.strftime("%H:%M:%S")
        
        # Check cooldown for the same person (prevent multiple entries within short time)
        person_key = f"{person_id}_{camera_type}"
        if person_key in self.last_attendance_time:
            last_time = self.last_attendance_time[person_key]
            if (now - last_time).total_seconds() < 60:  # 60 seconds cooldown
                return
        
        # Update last attendance time
        self.last_attendance_time[person_key] = now
        
        # Find or create record for today
        today_record = None
        for record in self.attendance_records["records"]:
            if record["date"] == date_str and record["person_id"] == person_id:
                today_record = record
                break
        
        if today_record is None:
            today_record = {
                "person_id": person_id,
                "date": date_str,
                "entry_time": None,
                "exit_time": None
            }
            self.attendance_records["records"].append(today_record)
        
        # Update entry or exit time
        if camera_type == "entry" and not today_record["entry_time"]:
            today_record["entry_time"] = time_str
            print(f"[INFO] Marked entry for {person_id} at {time_str}")
        elif camera_type == "exit" and today_record["entry_time"]:
            today_record["exit_time"] = time_str
            print(f"[INFO] Marked exit for {person_id} at {time_str}")
        
        # Save attendance records
        self._save_attendance()
    
    def start_detection(self):
        """Start face detection in a separate thread."""
        if self.is_running:
            print("[INFO] Detection is already running")
            return
        
        # Initialize camera
        self.camera = self._initialize_camera()
        if not self.camera or not self.camera.isOpened():
            print(f"[ERROR] Failed to open camera {self.camera_id}")
            return
        
        # Start detection thread
        self.is_running = True
        self.detection_thread = threading.Thread(target=self._detection_loop)
        self.detection_thread.daemon = True
        self.detection_thread.start()
        
        print(f"[INFO] Started detection on camera {self.camera_id} ({self.camera_name})")
    
    def stop_detection(self):
        """Stop face detection."""
        self.is_running = False
        if self.detection_thread:
            self.detection_thread.join(timeout=1.0)
        if hasattr(self, 'camera') and self.camera:
            self.camera.release()
        
        print("[INFO] Detection stopped")
    
    def _initialize_camera(self):
        """Initialize the camera."""
        try:
            # Check if camera_id is a URL (string) or a device index (integer)
            if isinstance(self.camera_id, str) and (
                self.camera_id.startswith("rtsp://") or 
                self.camera_id.startswith("http://") or
                self.camera_id.startswith("https://")
            ):
                camera = cv2.VideoCapture(self.camera_id)
            else:
                camera = cv2.VideoCapture(int(self.camera_id))
            
            # Set camera properties
            camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            
            return camera
        except Exception as e:
            print(f"[ERROR] Failed to initialize camera: {e}")
            return None
    
    def _detection_loop(self):
        """Main detection loop running in a separate thread."""
        frame_count = 0
        processing_time = 0
        
        while self.is_running:
            # Capture frame
            ret, frame = self.camera.read()
            if not ret:
                print("[WARNING] Failed to capture frame")
                time.sleep(1)
                continue
            
            # Store the last frame
            self.last_frame = frame.copy()
            
            # Only process every 5th frame to save CPU
            if frame_count % 5 == 0:
                start_time = time.time()
                detection_result = self.process_frame(frame)
                end_time = time.time()
                
                processing_time = end_time - start_time
                self.process_times.append(processing_time)
                if len(self.process_times) > 30:
                    self.process_times.pop(0)
                
                # Update detection result
                self.last_detection_result = detection_result
                
                # If a face is detected with sufficient confidence, mark attendance
                if detection_result and detection_result["name"] and detection_result["confidence"] >= self.confidence_threshold:
                    self.mark_entry_exit(detection_result["name"], self.camera_name)
            
            frame_count += 1
            
            # Calculate average processing time and adjust sleep to maintain target frame rate
            avg_processing = sum(self.process_times) / max(1, len(self.process_times))
            sleep_time = max(0.05, 0.2 - avg_processing)  # Target ~5 FPS
            time.sleep(sleep_time)
    
    def process_frame(self, frame):
        """
        Process a frame to detect and recognize faces.
        
        Args:
            frame (numpy.ndarray): Frame to process
            
        Returns:
            dict: Detection result with name, confidence, and face location
        """
        # Resize frame for faster processing (keep aspect ratio)
        height, width = frame.shape[:2]
        ratio = 640 / max(width, height)
        if ratio < 1:
            small_frame = cv2.resize(frame, (0, 0), fx=ratio, fy=ratio)
        else:
            small_frame = frame
        
        # Convert to RGB (face_recognition uses RGB)
        rgb_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
        
        # Detect faces
        face_locations = face_recognition.face_locations(rgb_frame, model=self.detection_method)
        
        # If no faces found, return None
        if not face_locations:
            return None
        
        # Get face encodings
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
        
        # Process each detected face (usually just take the first/largest one)
        largest_face_idx = 0
        largest_face_area = 0
        
        # Find the largest face if multiple faces are detected
        for i, (top, right, bottom, left) in enumerate(face_locations):
            face_area = (bottom - top) * (right - left)
            if face_area > largest_face_area:
                largest_face_area = face_area
                largest_face_idx = i
        
        # Get the largest face's encoding and location
        face_encoding = face_encodings[largest_face_idx]
        face_location = face_locations[largest_face_idx]
        
        # Find matching face
        name, confidence = find_matching_face(
            face_encoding, 
            self.data["encodings"], 
            self.data["names"],
            tolerance=0.6
        )
        
        # Adjust the face location coordinates for original frame size
        if ratio < 1:
            top, right, bottom, left = face_location
            top = int(top / ratio)
            right = int(right / ratio)
            bottom = int(bottom / ratio)
            left = int(left / ratio)
            face_location = (top, right, bottom, left)
        
        # Return detection result
        return {
            "name": name,
            "confidence": float(confidence),
            "location": face_location,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    
    def get_last_detection(self):
        """Get the last detection result."""
        return self.last_detection_result
    
    def get_annotated_frame(self):
        """Get the last frame with annotation overlays."""
        if self.last_frame is None:
            return None
        
        frame = self.last_frame.copy()
        
        # If we have a detection result, draw it on the frame
        if self.last_detection_result and "location" in self.last_detection_result:
            top, right, bottom, left = self.last_detection_result["location"]
            name = self.last_detection_result["name"] or "Unknown"
            confidence = self.last_detection_result["confidence"]
            
            # Draw face rectangle
            cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
            
            # Draw name label
            label = f"{name} ({confidence:.2f})"
            cv2.rectangle(frame, (left, bottom - 35), (right, bottom), (0, 255, 0), cv2.FILLED)
            cv2.putText(frame, label, (left + 6, bottom - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        # Draw camera information
        camera_info = f"Camera: {self.camera_name}"
        cv2.putText(frame, camera_info, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        
        # Draw timestamp
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cv2.putText(frame, timestamp, (10, frame.shape[0] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
        
        return frame


def main():
    """Main function to run face detection."""
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description="Face Detection and Attendance System")
    parser.add_argument("-e", "--encodings", required=True,
                        help="Path to the face encodings file")
    parser.add_argument("-a", "--attendance", required=True,
                        help="Path to the attendance file")
    parser.add_argument("-c", "--camera", type=str, default="0",
                        help="Camera ID or RTSP URL")
    parser.add_argument("-t", "--type", type=str, default="entry",
                        choices=["entry", "exit"],
                        help="Camera type (entry or exit)")
    parser.add_argument("-d", "--detection", type=str, default="hog",
                        choices=["hog", "cnn"],
                        help="Face detection model to use")
    args = parser.parse_args()
    
    # Create face detection system
    system = FaceDetectionSystem(
        encodings_file=args.encodings,
        attendance_file=args.attendance,
        camera_id=args.camera,
        camera_name=args.type,
        detection_method=args.detection
    )
    
    # Start detection
    system.start_detection()
    
    try:
        # Display video feed with annotations
        print("[INFO] Press 'q' to quit")
        while True:
            # Get annotated frame
            frame = system.get_annotated_frame()
            if frame is not None:
                # Display frame
                cv2.imshow("Face Detection", frame)
                
                # Check for quit
                key = cv2.waitKey(1) & 0xFF
                if key == ord("q"):
                    break
            else:
                time.sleep(0.1)
    
    finally:
        # Stop detection and clean up
        system.stop_detection()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main() 