#!/usr/bin/env python3
import cv2
import argparse
import time

def test_camera(camera_id=0, display_time=30):
    """
    Test camera access and display the video feed.
    
    Args:
        camera_id (int or str): Camera ID or RTSP URL.
        display_time (int): Time in seconds to display the feed (0 for indefinite).
    """
    print(f"[INFO] Attempting to access camera: {camera_id}")
    
    try:
        # Initialize camera
        if isinstance(camera_id, str) and (
            camera_id.startswith("rtsp://") or 
            camera_id.startswith("http://") or
            camera_id.startswith("https://")
        ):
            cap = cv2.VideoCapture(camera_id)
        else:
            cap = cv2.VideoCapture(int(camera_id))
        
        # Check if camera opened successfully
        if not cap.isOpened():
            print(f"[ERROR] Could not open camera {camera_id}")
            return False
        
        print("[INFO] Camera opened successfully!")
        print(f"[INFO] Press 'q' to quit or wait {display_time} seconds")
        
        # Get camera properties
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        
        print(f"[INFO] Camera Resolution: {width}x{height}, FPS: {fps}")
        
        # Set start time
        start_time = time.time()
        frame_count = 0
        
        # Read and display frames
        while True:
            # Capture frame-by-frame
            ret, frame = cap.read()
            
            # If frame is read correctly ret is True
            if not ret:
                print("[ERROR] Can't receive frame. Exiting...")
                break
            
            # Count frames for FPS calculation
            frame_count += 1
            elapsed_time = time.time() - start_time
            
            # Calculate actual FPS every second
            if elapsed_time >= 1:
                actual_fps = frame_count / elapsed_time
                print(f"[INFO] Actual FPS: {actual_fps:.2f}")
                frame_count = 0
                start_time = time.time()
            
            # Add timestamp to frame
            timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
            cv2.putText(frame, timestamp, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 
                       0.8, (0, 255, 0), 2)
            
            # Display the resulting frame
            cv2.imshow('Camera Test', frame)
            
            # Exit if 'q' is pressed or time is up
            if cv2.waitKey(1) == ord('q') or (display_time > 0 and elapsed_time > display_time):
                break
        
        # Release the capture and close windows
        cap.release()
        cv2.destroyAllWindows()
        print("[INFO] Camera test completed successfully")
        return True
    
    except Exception as e:
        print(f"[ERROR] Camera test failed: {e}")
        return False

if __name__ == "__main__":
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description="Test camera access and display video feed")
    parser.add_argument("-c", "--camera", type=str, default="0",
                       help="Camera ID (0, 1, etc.) or RTSP URL")
    parser.add_argument("-t", "--time", type=int, default=0,
                       help="Time in seconds to display feed (0 for indefinite)")
    args = parser.parse_args()
    
    # Try to convert camera_id to int if it's a number
    camera_id = args.camera
    if camera_id.isdigit():
        camera_id = int(camera_id)
    
    # Test camera
    test_camera(camera_id, args.time) 