# Face Recognition System

A robust face recognition system for attendance tracking with entry and exit camera support.

## Features

- Face detection and recognition using the face_recognition library
- Dual camera support for entry and exit monitoring
- REST API for integration with web and mobile applications
- Attendance tracking with timestamps
- Support for both webcams and RTSP/HTTP camera streams

## Setup

### Prerequisites

- Python 3.8 or higher
- pip package manager
- Camera devices (webcams or IP cameras with RTSP streams)

### Installation

1. Install the required dependencies:

```bash
pip install -r requirements.txt
```

This will install all necessary packages including Flask, OpenCV, face_recognition, and other dependencies.

### Creating Face Encodings

Before using the system, you need to create encodings for known faces:

1. Create a directory to store face images:

```bash
mkdir -p data/faces
```

2. Add face images to this directory. Each image should:
   - Contain one clear face
   - Be named after the person (e.g., `john_doe.jpg`)
   - Be in JPG, JPEG, or PNG format

3. Generate face encodings:

```bash
python utils.py -i data/faces -o data/face_encodings.pkl
```

## Usage

### Running the Face Detection System

To run the face detection system directly with camera visualization:

```bash
python detect_and_mark.py -e data/face_encodings.pkl -a data/attendance.json -c 0 -t entry
```

Parameters:
- `-e`, `--encodings`: Path to the face encodings file
- `-a`, `--attendance`: Path to the attendance file
- `-c`, `--camera`: Camera ID (0 for default webcam) or RTSP URL
- `-t`, `--type`: Camera type (entry or exit)
- `-d`, `--detection`: Face detection model (hog or cnn)

### Running the API Server

To start the REST API server:

```bash
python api.py
```

By default, the server runs on port 5000. You can access the API at `http://localhost:5000/`.

## API Endpoints

The following endpoints are available:

- `GET /api/status`: Check the API and camera status
- `POST /api/detect`: Upload an image for face detection
- `GET /api/attendance`: Get attendance records
- `POST /api/start_cameras`: Start camera threads
- `GET /api/latest_detection`: Get the latest detection results

## Integrating with Frontend

The API can be easily integrated with frontend applications. Key points:

1. Use the `/api/status` endpoint to verify connectivity
2. Start cameras using the `/api/start_cameras` endpoint
3. Poll `/api/latest_detection` to get real-time detection results
4. Retrieve attendance records using the `/api/attendance` endpoint

## Security Considerations

- The API doesn't implement authentication by default. For production, add proper authentication mechanisms.
- Consider using HTTPS for secure communication.
- Face encoding files contain biometric data. Ensure they're stored securely.

## Troubleshooting

- If face detection is slow, consider using the 'hog' method instead of 'cnn'
- For Raspberry Pi or low-power devices, reduce frame processing frequency
- Check camera permissions if the system can't access webcams 