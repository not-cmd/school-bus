#!/usr/bin/env python3
import requests
import json
import base64
import time
import argparse
import cv2
import os
from datetime import datetime

class FaceRecognitionAPIClient:
    """Client for testing the Face Recognition API."""
    
    def __init__(self, base_url="http://localhost:5000"):
        """
        Initialize the API client.
        
        Args:
            base_url (str): Base URL of the API server
        """
        self.base_url = base_url
    
    def check_status(self):
        """
        Check the API status.
        
        Returns:
            dict: Status response
        """
        try:
            response = requests.get(f"{self.base_url}/api/status")
            return response.json()
        except Exception as e:
            return {"error": str(e), "status": "offline"}
    
    def start_cameras(self, entry_camera="0", exit_camera="1"):
        """
        Start the camera threads.
        
        Args:
            entry_camera (str): Entry camera ID or URL
            exit_camera (str): Exit camera ID or URL
            
        Returns:
            dict: Response data
        """
        try:
            data = {
                "entry_camera": entry_camera,
                "exit_camera": exit_camera
            }
            response = requests.post(f"{self.base_url}/api/start_cameras", json=data)
            return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    def get_latest_detection(self, camera_type="entry"):
        """
        Get the latest detection result.
        
        Args:
            camera_type (str): Camera type ('entry' or 'exit')
            
        Returns:
            dict: Latest detection data
        """
        try:
            params = {"camera_type": camera_type}
            response = requests.get(f"{self.base_url}/api/latest_detection", params=params)
            return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    def get_attendance(self, date=None, person_id=None):
        """
        Get attendance records.
        
        Args:
            date (str, optional): Filter by date (YYYY-MM-DD)
            person_id (str, optional): Filter by person ID
            
        Returns:
            dict: Attendance records
        """
        try:
            params = {}
            if date:
                params["date"] = date
            if person_id:
                params["person_id"] = person_id
                
            response = requests.get(f"{self.base_url}/api/attendance", params=params)
            return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    def detect_from_image(self, image_path):
        """
        Submit an image for face detection.
        
        Args:
            image_path (str): Path to the image file
            
        Returns:
            dict: Detection results
        """
        try:
            # Read image and encode as base64
            with open(image_path, "rb") as image_file:
                image_data = base64.b64encode(image_file.read()).decode("utf-8")
            
            # Submit for detection
            data = {
                "image": image_data
            }
            response = requests.post(f"{self.base_url}/api/detect", json=data)
            return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    def detect_from_webcam(self, camera_id=0, num_frames=1):
        """
        Capture frames from webcam and submit for detection.
        
        Args:
            camera_id (int): Camera ID
            num_frames (int): Number of frames to capture and process
            
        Returns:
            list: Detection results for each frame
        """
        try:
            # Initialize camera
            cap = cv2.VideoCapture(camera_id)
            if not cap.isOpened():
                return {"error": f"Could not open camera {camera_id}"}
            
            results = []
            
            # Capture and process frames
            for i in range(num_frames):
                # Capture frame
                ret, frame = cap.read()
                if not ret:
                    break
                
                # Display frame
                cv2.imshow("Frame for Detection", frame)
                cv2.waitKey(500)  # Wait for 500ms
                
                # Convert frame to JPEG and encode as base64
                _, buffer = cv2.imencode('.jpg', frame)
                image_data = base64.b64encode(buffer).decode("utf-8")
                
                # Submit for detection
                data = {
                    "image": image_data
                }
                response = requests.post(f"{self.base_url}/api/detect", json=data)
                results.append(response.json())
                
                print(f"Processed frame {i+1}/{num_frames}")
                time.sleep(1)  # Pause between frames
            
            # Release resources
            cap.release()
            cv2.destroyAllWindows()
            
            return results
        except Exception as e:
            return {"error": str(e)}
    
    def monitor_detections(self, duration=60, interval=2):
        """
        Monitor detection results for a period of time.
        
        Args:
            duration (int): Duration in seconds to monitor
            interval (int): Polling interval in seconds
            
        Returns:
            dict: Summary of detections
        """
        try:
            start_time = time.time()
            end_time = start_time + duration
            
            entry_detections = 0
            exit_detections = 0
            
            print(f"Monitoring detections for {duration} seconds...")
            
            while time.time() < end_time:
                # Get entry camera detection
                entry_result = self.get_latest_detection("entry")
                if entry_result and "name" in entry_result and entry_result["name"]:
                    print(f"Entry detection: {entry_result['name']} ({entry_result['confidence']:.2f})")
                    entry_detections += 1
                
                # Get exit camera detection
                exit_result = self.get_latest_detection("exit")
                if exit_result and "name" in exit_result and exit_result["name"]:
                    print(f"Exit detection: {exit_result['name']} ({exit_result['confidence']:.2f})")
                    exit_detections += 1
                
                # Wait for next poll
                time.sleep(interval)
            
            # Return summary
            return {
                "duration": duration,
                "entry_detections": entry_detections,
                "exit_detections": exit_detections,
                "total_detections": entry_detections + exit_detections
            }
        except Exception as e:
            return {"error": str(e)}


def main():
    """Main function to run API tests."""
    parser = argparse.ArgumentParser(description="Test Face Recognition API")
    parser.add_argument("--url", type=str, default="http://localhost:5000",
                      help="Base URL of the API server")
    parser.add_argument("--action", type=str, required=True,
                      choices=["status", "start", "detect", "monitor", "attendance"],
                      help="Action to perform")
    parser.add_argument("--entry", type=str, default="0",
                      help="Entry camera ID or URL")
    parser.add_argument("--exit", type=str, default="1",
                      help="Exit camera ID or URL")
    parser.add_argument("--image", type=str,
                      help="Path to image file for detection")
    parser.add_argument("--webcam", type=int, default=0,
                      help="Webcam ID for live detection")
    parser.add_argument("--frames", type=int, default=1,
                      help="Number of frames to capture from webcam")
    parser.add_argument("--duration", type=int, default=60,
                      help="Duration in seconds for monitoring")
    parser.add_argument("--interval", type=int, default=2,
                      help="Polling interval in seconds")
    parser.add_argument("--date", type=str,
                      help="Date filter for attendance (YYYY-MM-DD)")
    parser.add_argument("--person", type=str,
                      help="Person ID filter for attendance")
    args = parser.parse_args()
    
    # Create API client
    client = FaceRecognitionAPIClient(args.url)
    
    # Perform requested action
    if args.action == "status":
        result = client.check_status()
        print("API Status:")
        print(json.dumps(result, indent=2))
    
    elif args.action == "start":
        result = client.start_cameras(args.entry, args.exit)
        print("Start Cameras Response:")
        print(json.dumps(result, indent=2))
    
    elif args.action == "detect":
        if args.image:
            # Detect from image file
            result = client.detect_from_image(args.image)
            print("Detection Result:")
            print(json.dumps(result, indent=2))
        else:
            # Detect from webcam
            results = client.detect_from_webcam(args.webcam, args.frames)
            print("Detection Results:")
            for i, result in enumerate(results):
                print(f"\nFrame {i+1}:")
                print(json.dumps(result, indent=2))
    
    elif args.action == "monitor":
        result = client.monitor_detections(args.duration, args.interval)
        print("\nMonitoring Summary:")
        print(json.dumps(result, indent=2))
    
    elif args.action == "attendance":
        result = client.get_attendance(args.date, args.person)
        print("Attendance Records:")
        print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main() 