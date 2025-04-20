# Face Recognition System for GuardianTrack

This directory contains a Python-based face recognition system for student attendance tracking. The system uses computer vision to detect, recognize faces, and automatically mark attendance for entry and exit events.

## Features

- Face detection using MTCNN
- Face recognition using DeepFace and Facenet
- Attendance tracking for both entry and exit events
- API integration with the GuardianTrack web application
- Real-time processing of camera feeds

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- pip package manager
- Webcams configured for entry and exit locations

### Installation

1. Install required Python packages:

```bash
cd src/server/face_recognition
pip install -r requirements.txt
```

2. Prepare the dataset:

```bash
python utils.py
```

This will create a dataset directory structure with folders for Divyesh and Karan.

3. Add face images:

For each student, add at least 5 clear face images to their respective folders:
- `dataset/Divyesh/` - Add Divyesh's face images here
- `dataset/Karan/` - Add Karan's face images here

Image requirements:
- Clear frontal face images
- Good lighting conditions
- Different expressions and angles for better recognition
- File formats: jpg, jpeg, or png

4. Generate face encodings:

```bash
python -c "from utils import encode_faces; encode_faces()"
```

This will create an `encodings.json` file containing face embeddings for all the students.

### Running the Face Recognition System

#### Standalone Mode

You can run the face recognition system as a standalone application:

```bash
python detect_and_mark.py
```

This will prompt you to select which camera to use (entry, exit, or both).

#### Web API Mode

To integrate with the GuardianTrack web application, run the Flask API server:

```bash
python server.py
```

This will start the API server on port 5000.

## Integration with GuardianTrack

The face recognition system is integrated with the GuardianTrack web application via the API server. The frontend communicates with the API to:

1. Start/stop face recognition
2. Retrieve attendance records
3. Get system status
4. Trigger face encoding

## Troubleshooting

Common issues and solutions:

1. **Camera not found**: Ensure your webcams are properly connected and permissions are correctly set.

2. **Face detection failures**: Improve lighting conditions and ensure faces are clearly visible to the camera.

3. **Poor recognition accuracy**: 
   - Add more training images from different angles
   - Make sure the face is well-lit in both the training and testing environments
   - Run the encoding process again after adding more images

4. **API connection issues**:
   - Ensure the Flask server is running
   - Check for any firewall or network restrictions
   - Verify the API_BASE_URL in the frontend configuration matches your server address

## Adding New Students

To add new students to the system:

1. Create a folder with the student's name in the `dataset` directory
2. Add at least 5 clear face images of the student to their folder
3. Run the encoding process again:
   ```bash
   python -c "from utils import encode_faces; encode_faces()"
   ```
4. Restart the face recognition system or API server

## License

This software is proprietary and for use only within the GuardianTrack application. 