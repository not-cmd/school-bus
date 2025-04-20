import os
import cv2
import numpy as np
from deepface import DeepFace
import json

def encode_faces(dataset_path="dataset", output_file="encodings.json"):
    """
    Process images in the dataset directory and create face encodings
    Each person should have their own subdirectory with multiple face images
    """
    encodings = {}

    for person in os.listdir(dataset_path):
        person_path = os.path.join(dataset_path, person)
        if not os.path.isdir(person_path):
            continue

        embeddings = []
        for img_name in os.listdir(person_path):
            img_path = os.path.join(person_path, img_name)
            try:
                embedding = DeepFace.represent(img_path=img_path, model_name="Facenet")[0]["embedding"]
                embeddings.append(embedding)
            except Exception as e:
                print(f"Failed to process {img_path}: {e}")

        if embeddings:
            # Average embedding for that person
            encodings[person] = np.mean(embeddings, axis=0).tolist()
            print(f"Successfully encoded {person} with {len(embeddings)} images")
        else:
            print(f"No successful encodings for {person}")

    with open(output_file, "w") as f:
        json.dump(encodings, f)
    print(f"Encodings saved to {output_file}!")
    return encodings

def setup_dataset_structure():
    """Create the dataset directory structure if it doesn't exist"""
    if not os.path.exists("dataset"):
        os.makedirs("dataset")
        print("Created dataset directory")
        
        # Create example person directories
        os.makedirs("dataset/Divyesh")
        os.makedirs("dataset/Karan")
        print("Created example person directories (Divyesh, Karan)")
        print("Please add face images for each person in their respective directories")
    else:
        print("Dataset directory already exists")

if __name__ == "__main__":
    # If run directly, setup the dataset structure and encode faces
    setup_dataset_structure()
    encode_faces() 