# Guardian Track Connect - Face Recognition Backend

This is the backend component of the Guardian Track Connect system, providing face recognition capabilities for attendance tracking.

## Architecture Overview

The backend consists of several components:

1. **Face Recognition Core** - Located in `face_recognition/` directory, this provides the core functionality for face detection, recognition, and attendance tracking.
2. **API Server** - Provides RESTful endpoints for the frontend to interact with the face recognition system.
3. **Utilities** - Helper scripts for testing, encoding faces, and validating the system.

## Getting Started

### Prerequisites

- Python 3.8 or higher
- OpenCV
- face_recognition library (which requires dlib)
- Flask for the API server
- Other dependencies as listed in requirements.txt

### Installation

1. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up face recognition data:
   ```bash
   mkdir -p data/faces
   # Add face images to data/faces directory
   python face_recognition/utils.py -i data/faces -o data/face_encodings.pkl
   ```

## Running the System

### Testing Camera Access

Before running the full system, test your camera:

```bash
python face_recognition/test_camera.py -c 0  # Test default webcam
```

### Starting the API Server

```bash
python face_recognition/api.py
```

By default, the server runs on port 5000 and is accessible at `http://localhost:5000`.

### Testing the API

Use the test client to verify the API is working correctly:

```bash
# Check API status
python face_recognition/test_api.py --action status

# Start cameras
python face_recognition/test_api.py --action start --entry 0 --exit 1

# Monitor detections for 30 seconds
python face_recognition/test_api.py --action monitor --duration 30
```

## Frontend Integration

The frontend connects to this backend through the REST API. Key integration points:

1. **Status Checking**: The frontend should regularly poll `/api/status` to verify the backend is running.
2. **Camera Control**: The frontend can start and configure cameras using `/api/start_cameras`.
3. **Live Feed**: The frontend can display live detections by polling `/api/latest_detection`.
4. **Attendance Records**: The frontend can retrieve attendance data using `/api/attendance`.

## Development

### Adding New Features

1. Implement the feature in the `face_recognition/` directory.
2. Add appropriate API endpoints in `api.py`.
3. Update tests in `test_api.py`.

### Code Organization

- `face_recognition/utils.py` - Core utilities for face encoding and matching
- `face_recognition/detect_and_mark.py` - Detection and attendance marking logic
- `face_recognition/api.py` - REST API implementation
- `face_recognition/test_*.py` - Testing utilities

## Security Considerations

- The API doesn't implement authentication by default. Add authentication for production use.
- Store face encoding data securely, as it contains biometric information.
- Consider using HTTPS for all API communications in production.

## Troubleshooting

- If face recognition is slow, use the 'hog' method instead of 'cnn'
- If having issues with camera access, run the test_camera.py script
- Ensure all dependencies are correctly installed
- Check the logs for errors and debug information

## License

This project is licensed under the MIT License - see the LICENSE file for details. 