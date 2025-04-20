import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Square, AlertCircle, CheckCircle, RefreshCw, User } from 'lucide-react';
import { Toast } from '@/components/ui/toast';
import FaceRecognitionAPI, { SystemStatus } from '@/lib/face-recognition-api';

interface FaceRecognitionControlsProps {
  onDetection?: (name: string, camera: 'entry' | 'exit') => void;
}

const FaceRecognitionControls: React.FC<FaceRecognitionControlsProps> = ({ 
  onDetection 
}) => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch status when component mounts
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const systemStatus = await FaceRecognitionAPI.getSystemStatus();
        setStatus(systemStatus);
      } catch (err) {
        console.error('Failed to fetch system status:', err);
        setStatus({
          system_ready: false,
          is_processing: false,
          known_faces: [],
          entry_marked: [],
          exit_marked: []
        });
      }
    };

    fetchStatus();
    
    // Poll for status updates
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Poll for attendance records when processing is active
  useEffect(() => {
    if (!status?.is_processing) return;

    const fetchAttendance = async () => {
      try {
        const records = await FaceRecognitionAPI.getAttendanceRecords();
        // Check for new detections and notify parent component
        if (records.length > 0 && onDetection) {
          const lastRecord = records[records.length - 1];
          onDetection(lastRecord.name, lastRecord.camera as 'entry' | 'exit');
        }
      } catch (err) {
        console.error('Failed to fetch attendance records:', err);
      }
    };

    const interval = setInterval(fetchAttendance, 3000);
    return () => clearInterval(interval);
  }, [status?.is_processing, onDetection]);

  // Clear toast after delay
  useEffect(() => {
    if (!toast) return;
    
    const timeout = setTimeout(() => {
      setToast(null);
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, [toast]);

  const handleStartRecognition = async (cameraType: 'entry' | 'exit' | 'both') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await FaceRecognitionAPI.startFaceRecognition(cameraType);
      setToast({
        message: result.message || 'Face recognition started successfully',
        type: 'success'
      });
      
      // Update status
      const newStatus = await FaceRecognitionAPI.getSystemStatus();
      setStatus(newStatus);
    } catch (err) {
      console.error('Failed to start face recognition:', err);
      setError(err instanceof Error ? err.message : 'Failed to start face recognition');
      setToast({
        message: err instanceof Error ? err.message : 'Failed to start face recognition',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopRecognition = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await FaceRecognitionAPI.stopFaceRecognition();
      setToast({
        message: result.message || 'Face recognition stopped successfully',
        type: 'success'
      });
      
      // Update status
      const newStatus = await FaceRecognitionAPI.getSystemStatus();
      setStatus(newStatus);
    } catch (err) {
      console.error('Failed to stop face recognition:', err);
      setError(err instanceof Error ? err.message : 'Failed to stop face recognition');
      setToast({
        message: err instanceof Error ? err.message : 'Failed to stop face recognition',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEncodeFaces = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await FaceRecognitionAPI.encodeFaces();
      setToast({
        message: `Encoded ${result.encoded_faces.length} faces successfully`,
        type: 'success'
      });
      
      // Update status
      const newStatus = await FaceRecognitionAPI.getSystemStatus();
      setStatus(newStatus);
    } catch (err) {
      console.error('Failed to encode faces:', err);
      setError(err instanceof Error ? err.message : 'Failed to encode faces');
      setToast({
        message: err instanceof Error ? err.message : 'Failed to encode faces',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white border rounded-lg shadow-sm">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center text-base font-semibold">
          <User className="h-4 w-4 mr-2 text-blue-500" />
          Face Recognition Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* System Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {status?.system_ready ? (
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
              )}
              <span className="text-sm">
                System Status: {status?.system_ready ? 'Ready' : 'Not Ready'}
              </span>
            </div>
            <div className="flex items-center">
              {status?.is_processing ? (
                <div className="flex items-center">
                  <RefreshCw className="h-4 w-4 text-blue-500 mr-2 animate-spin" />
                  <span className="text-sm text-blue-500">Processing</span>
                </div>
              ) : (
                <span className="text-sm text-gray-500">Idle</span>
              )}
            </div>
          </div>
          
          {/* Recognition Controls */}
          <div className="flex flex-col space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="border-green-500 text-green-600 hover:bg-green-50 disabled:opacity-50"
                onClick={() => handleStartRecognition('entry')}
                disabled={isLoading || status?.is_processing}
              >
                <Play className="h-3 w-3 mr-1" /> Entry Camera
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="border-green-500 text-green-600 hover:bg-green-50 disabled:opacity-50"
                onClick={() => handleStartRecognition('exit')}
                disabled={isLoading || status?.is_processing}
              >
                <Play className="h-3 w-3 mr-1" /> Exit Camera
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="border-green-500 text-green-600 hover:bg-green-50 disabled:opacity-50"
                onClick={() => handleStartRecognition('both')}
                disabled={isLoading || status?.is_processing}
              >
                <Play className="h-3 w-3 mr-1" /> Both Cameras
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              className="border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-50"
              onClick={handleStopRecognition}
              disabled={isLoading || !status?.is_processing}
            >
              <Square className="h-3 w-3 mr-1" /> Stop Recognition
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="mt-2 border-blue-500 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
              onClick={handleEncodeFaces}
              disabled={isLoading}
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Encode Faces
            </Button>
          </div>
          
          {/* Known Faces */}
          {status?.known_faces && status.known_faces.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-medium text-gray-600 mb-2">Known Faces:</h4>
              <div className="flex flex-wrap gap-1">
                {status.known_faces.map((face) => (
                  <span 
                    key={face} 
                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {face}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Marked Students */}
          <Tabs defaultValue="entry" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="entry">Entry ({status?.entry_marked.length || 0})</TabsTrigger>
              <TabsTrigger value="exit">Exit ({status?.exit_marked.length || 0})</TabsTrigger>
            </TabsList>
            <TabsContent value="entry">
              {status?.entry_marked && status.entry_marked.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-2">
                  {status.entry_marked.map((name) => (
                    <span 
                      key={name} 
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 mt-2">No entry detections yet</p>
              )}
            </TabsContent>
            <TabsContent value="exit">
              {status?.exit_marked && status.exit_marked.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-2">
                  {status.exit_marked.map((name) => (
                    <span 
                      key={name} 
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 mt-2">No exit detections yet</p>
              )}
            </TabsContent>
          </Tabs>
          
          {/* Error Message */}
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-md text-xs text-red-600">
              {error}
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-md ${
          toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
          'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {toast.message}
        </div>
      )}
    </Card>
  );
};

export default FaceRecognitionControls; 