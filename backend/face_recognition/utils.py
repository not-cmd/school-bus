import face_recognition
import cv2
import pickle
import os
import numpy as np
from pathlib import Path
import glob

def load_encodings(encodings_file):
    """
    Load face encodings from a pickle file.
    If the file doesn't exist, returns an empty dictionary.
    
    Args:
        encodings_file (str): Path to the encodings file
        
    Returns:
        dict: Dictionary with keys 'encodings' and 'names'
    """
    # Check if file exists
    if not os.path.exists(encodings_file):
        return {"encodings": [], "names": []}
    
    # Load encodings from file
    with open(encodings_file, "rb") as f:
        data = pickle.load(f)
    
    return data

def save_encodings(encodings_data, encodings_file):
    """
    Save face encodings to a pickle file.
    
    Args:
        encodings_data (dict): Dictionary with keys 'encodings' and 'names'
        encodings_file (str): Path to save the encodings file
    """
    with open(encodings_file, "wb") as f:
        pickle.dump(encodings_data, f)

def find_matching_face(face_encoding, known_encodings, known_names, tolerance=0.6):
    """
    Find a matching face in the known encodings.
    
    Args:
        face_encoding (numpy.ndarray): Face encoding to match
        known_encodings (list): List of known face encodings
        known_names (list): List of names corresponding to known encodings
        tolerance (float): Matching tolerance (lower is stricter)
        
    Returns:
        tuple: (name, confidence) of the matched face or (None, 0.0) if no match
    """
    # If no known encodings, return None
    if len(known_encodings) == 0:
        return None, 0.0
    
    # Calculate face distances
    face_distances = face_recognition.face_distance(known_encodings, face_encoding)
    
    # Find best match
    best_match_index = np.argmin(face_distances)
    best_match_distance = face_distances[best_match_index]
    
    # Convert distance to confidence (0 to 1, where 1 is perfect match)
    confidence = 1.0 - min(best_match_distance, 1.0)
    
    # Check if match is good enough
    if confidence >= (1.0 - tolerance):
        return known_names[best_match_index], confidence
    else:
        return None, confidence

def encode_faces_from_directory(images_dir, encodings_file=None, detection_method="hog"):
    """
    Create face encodings from all images in a directory.
    
    Args:
        images_dir (str): Path to directory containing face images
        encodings_file (str, optional): Path to save encodings
        detection_method (str): Face detection method ('hog' or 'cnn')
        
    Returns:
        dict: Dictionary with keys 'encodings' and 'names'
    """
    print(f"[INFO] Processing images in {images_dir}")
    
    # Get all image files
    image_paths = []
    for ext in ["jpg", "jpeg", "png"]:
        image_paths.extend(glob.glob(os.path.join(images_dir, f"*.{ext}")))
    
    # Initialize lists
    known_encodings = []
    known_names = []
    
    # Process each image
    for (i, image_path) in enumerate(image_paths):
        # Extract person name from filename
        name = os.path.splitext(os.path.basename(image_path))[0]
        print(f"[INFO] Processing image {i+1}/{len(image_paths)}: {name}")
        
        # Load image and convert to RGB (face_recognition uses RGB)
        image = cv2.imread(image_path)
        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Detect face locations
        boxes = face_recognition.face_locations(rgb, model=detection_method)
        
        # If no faces found, skip this image
        if len(boxes) == 0:
            print(f"[WARNING] No faces found in {image_path}")
            continue
        
        # Compute face encodings
        encodings = face_recognition.face_encodings(rgb, boxes)
        
        # Add encodings and names to lists
        for encoding in encodings:
            known_encodings.append(encoding)
            known_names.append(name)
    
    # Create data dictionary
    data = {
        "encodings": known_encodings,
        "names": known_names
    }
    
    # Save encodings if file path provided
    if encodings_file:
        print(f"[INFO] Saving {len(known_encodings)} encodings to {encodings_file}")
        save_encodings(data, encodings_file)
    
    return data

def add_face_encoding(image, name, encodings_file, detection_method="hog"):
    """
    Add a new face encoding to the existing encodings file.
    
    Args:
        image (numpy.ndarray): Image containing a face
        name (str): Name of the person
        encodings_file (str): Path to the encodings file
        detection_method (str): Face detection method ('hog' or 'cnn')
        
    Returns:
        bool: True if successful, False otherwise
    """
    # Convert to RGB if needed
    if len(image.shape) == 3 and image.shape[2] == 3:
        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    else:
        rgb = image
    
    # Detect face locations
    boxes = face_recognition.face_locations(rgb, model=detection_method)
    
    # If no faces found, return False
    if len(boxes) == 0:
        print(f"[WARNING] No faces found in the provided image")
        return False
    
    # Compute face encodings
    encodings = face_recognition.face_encodings(rgb, boxes)
    
    # Load existing encodings
    data = load_encodings(encodings_file)
    
    # Add new encoding and name
    for encoding in encodings:
        data["encodings"].append(encoding)
        data["names"].append(name)
    
    # Save updated encodings
    save_encodings(data, encodings_file)
    
    return True

# Example usage: Encode faces from a directory
if __name__ == "__main__":
    import argparse
    
    # Parse command-line arguments
    parser = argparse.ArgumentParser()
    parser.add_argument("-i", "--images_dir", required=True, 
                        help="Path to the directory containing face images")
    parser.add_argument("-o", "--output", required=True,
                        help="Path to save the face encodings")
    parser.add_argument("-d", "--detection_method", type=str, default="hog",
                        help="Face detection model: 'hog' or 'cnn'")
    args = parser.parse_args()
    
    # Encode faces
    encode_faces_from_directory(
        args.images_dir, 
        args.output, 
        args.detection_method
    )
    
    print("[INFO] Face encoding completed!") 