#!/usr/bin/env python3
import os
import argparse
import json
import shutil
from datetime import datetime

def setup_data_directory(base_path="data", force=False):
    """
    Set up the data directory structure for the face recognition system.
    
    Args:
        base_path (str): Base path for the data directory
        force (bool): Whether to overwrite existing directories
    """
    # Create base directory if it doesn't exist
    if not os.path.exists(base_path):
        os.makedirs(base_path)
        print(f"[INFO] Created base directory: {base_path}")
    else:
        print(f"[INFO] Base directory already exists: {base_path}")
    
    # Create subdirectories
    subdirs = [
        "faces",           # For face images
        "encodings",       # For face encodings
        "logs",            # For log files
        "attendance"       # For attendance records
    ]
    
    for subdir in subdirs:
        dir_path = os.path.join(base_path, subdir)
        if os.path.exists(dir_path):
            if force:
                # Remove and recreate directory
                shutil.rmtree(dir_path)
                os.makedirs(dir_path)
                print(f"[INFO] Recreated directory: {dir_path}")
            else:
                print(f"[INFO] Directory already exists: {dir_path}")
        else:
            os.makedirs(dir_path)
            print(f"[INFO] Created directory: {dir_path}")
    
    # Create empty attendance file
    attendance_file = os.path.join(base_path, "attendance.json")
    if not os.path.exists(attendance_file) or force:
        empty_attendance = {
            "records": []
        }
        with open(attendance_file, "w") as f:
            json.dump(empty_attendance, f, indent=4)
        print(f"[INFO] Created empty attendance file: {attendance_file}")
    else:
        print(f"[INFO] Attendance file already exists: {attendance_file}")
    
    # Create empty encodings file path (will be populated by utils.py)
    encodings_file = os.path.join(base_path, "face_encodings.pkl")
    print(f"[INFO] Encodings will be stored at: {encodings_file}")
    
    # Create example script to help users add sample faces
    example_script = os.path.join(base_path, "add_sample_faces.sh")
    with open(example_script, "w") as f:
        f.write(f"""#!/bin/bash
# Example script to add sample faces
# First, add some face images to the faces directory
# Each image should be named after the person (e.g., john_doe.jpg)

# Then run the encoding script
python ../face_recognition/utils.py -i {base_path}/faces -o {base_path}/face_encodings.pkl

# To test with a webcam
python ../face_recognition/test_camera.py -c 0

# To run face detection
python ../face_recognition/detect_and_mark.py -e {base_path}/face_encodings.pkl -a {base_path}/attendance.json
""")
    os.chmod(example_script, 0o755)  # Make executable
    print(f"[INFO] Created example script: {example_script}")
    
    # Create a README file
    readme_file = os.path.join(base_path, "README.md")
    with open(readme_file, "w") as f:
        f.write(f"""# Face Recognition Data Directory

This directory contains data for the face recognition system.

## Directory Structure

- `faces/` - Place face images here, named after the person (e.g., john_doe.jpg)
- `encodings/` - Additional encoding files (optional)
- `logs/` - Log files
- `attendance/` - Attendance record files

## Quick Start

1. Add face images to the `faces/` directory
2. Run the encoding script:
   ```
   python ../face_recognition/utils.py -i faces -o face_encodings.pkl
   ```
3. Run the face detection system:
   ```
   python ../face_recognition/detect_and_mark.py -e face_encodings.pkl -a attendance.json
   ```

For more details, see the example script: `add_sample_faces.sh`
""")
    print(f"[INFO] Created README file: {readme_file}")
    
    print(f"\n[SUCCESS] Data directory setup complete at: {base_path}")
    print("[INFO] Next steps:")
    print(f"1. Add face images to {os.path.join(base_path, 'faces')}")
    print(f"2. Run the encoding script: python face_recognition/utils.py -i {os.path.join(base_path, 'faces')} -o {os.path.join(base_path, 'face_encodings.pkl')}")
    print(f"3. Run the API server: python face_recognition/api.py")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Set up data directory for face recognition system")
    parser.add_argument("-d", "--dir", type=str, default="data",
                      help="Base path for the data directory")
    parser.add_argument("-f", "--force", action="store_true",
                      help="Force overwrite of existing directories")
    args = parser.parse_args()
    
    setup_data_directory(args.dir, args.force) 