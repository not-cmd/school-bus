// Face Recognition API client

// Base URL for the API server
const API_BASE_URL = 'http://localhost:5000/api';

// Interface for attendance record
export interface AttendanceRecord {
  name: string;
  date: string;
  time: string;
  camera: 'entry' | 'exit';
}

// Interface for system status
export interface SystemStatus {
  system_ready: boolean;
  is_processing: boolean;
  known_faces: string[];
  entry_marked: string[];
  exit_marked: string[];
}

/**
 * Get the current status of the face recognition system
 */
export async function getSystemStatus(): Promise<SystemStatus> {
  const response = await fetch(`${API_BASE_URL}/status`);
  if (!response.ok) {
    throw new Error(`Failed to get system status: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Get all attendance records for today
 */
export async function getAttendanceRecords(): Promise<AttendanceRecord[]> {
  const response = await fetch(`${API_BASE_URL}/attendance`);
  if (!response.ok) {
    throw new Error(`Failed to get attendance data: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Start the face recognition system
 * @param cameraType Which camera to use - 'entry', 'exit', or 'both'
 */
export async function startFaceRecognition(cameraType: 'entry' | 'exit' | 'both'): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ camera_type: cameraType }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to start face recognition');
  }

  return response.json();
}

/**
 * Stop the face recognition system
 */
export async function stopFaceRecognition(): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/stop`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to stop face recognition');
  }

  return response.json();
}

/**
 * Trigger encoding of faces from the dataset
 */
export async function encodeFaces(): Promise<{ success: boolean; message: string; encoded_faces: string[] }> {
  const response = await fetch(`${API_BASE_URL}/encode`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to encode faces');
  }

  return response.json();
}

// Export the API client as the default export
const FaceRecognitionAPI = {
  getSystemStatus,
  getAttendanceRecords,
  startFaceRecognition,
  stopFaceRecognition,
  encodeFaces,
};

export default FaceRecognitionAPI; 