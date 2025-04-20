import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, User, Check, AlertCircle, Clock, Maximize2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface FaceDetectionResult {
  username: string;
  name: string;
  confidence: number;
  timestamp: string;
  status: 'boarding' | 'offboarding';
  recorded: boolean;
}

// Mock user data that would come from API in a real app
const users = [
  {
    username: '60018230067',
    name: 'Divyesh',
    grade: '5th',
    section: 'A',
    age: 10,
    faceDescriptor: [/* would contain actual face descriptor data */],
    profilePhoto: '/divyesh.png'
  },
  {
    username: '60018230012',
    name: 'Karan',
    grade: '6th',
    section: 'B',
    age: 11,
    faceDescriptor: [/* would contain actual face descriptor data */],
    profilePhoto: '/karan.png'
  }
];

const LiveFeed: React.FC = () => {
  // State for face recognition results
  const [entryDetection, setEntryDetection] = useState<FaceDetectionResult | null>(null);
  const [exitDetection, setExitDetection] = useState<FaceDetectionResult | null>(null);
  const [entryHistory, setEntryHistory] = useState<FaceDetectionResult[]>([]);
  const [exitHistory, setExitHistory] = useState<FaceDetectionResult[]>([]);
  const [fullscreenFeed, setFullscreenFeed] = useState<'entry' | 'exit' | null>(null);

  // Simulate face recognition updates
  useEffect(() => {
    // Simulate entry camera detection
    const entryInterval = setInterval(() => {
      const detected = Math.random() > 0.3;
      if (detected) {
        const detectedUser = Math.random() > 0.5 ? users[0] : users[1];
        const confidence = Math.floor(85 + Math.random() * 15);
        const timestamp = new Date().toLocaleTimeString();
        const newDetection = {
          username: detectedUser.username,
          name: detectedUser.name,
          confidence,
          timestamp,
          status: 'boarding' as const,
          recorded: confidence > 90
        };
        
        setEntryDetection(newDetection);
        if (newDetection.recorded) {
          setEntryHistory(prev => [newDetection, ...prev].slice(0, 5));
        }
      } else {
        setEntryDetection(null);
      }
    }, 5000);

    // Simulate exit camera detection
    const exitInterval = setInterval(() => {
      const detected = Math.random() > 0.4;
      if (detected) {
        const detectedUser = Math.random() > 0.5 ? users[0] : users[1];
        const confidence = Math.floor(85 + Math.random() * 15);
        const timestamp = new Date().toLocaleTimeString();
        const newDetection = {
          username: detectedUser.username,
          name: detectedUser.name,
          confidence,
          timestamp,
          status: 'offboarding' as const,
          recorded: confidence > 90
        };
        
        setExitDetection(newDetection);
        if (newDetection.recorded) {
          setExitHistory(prev => [newDetection, ...prev].slice(0, 5));
        }
      } else {
        setExitDetection(null);
      }
    }, 7000);

    return () => {
      clearInterval(entryInterval);
      clearInterval(exitInterval);
    };
  }, []);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullscreenFeed) {
        setFullscreenFeed(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenFeed]);

  return (
    <>
      {/* Fullscreen Modal */}
      {fullscreenFeed && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative w-full max-w-6xl mx-auto max-h-screen p-4">
            <Button 
              onClick={() => setFullscreenFeed(null)} 
              variant="outline" 
              size="icon" 
              className="absolute top-4 right-4 bg-white z-10"
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="bg-black h-[80vh] rounded-lg overflow-hidden">
              <iframe 
                src={`http://192.168.1.49:8080/video/${fullscreenFeed}`}
                className="w-full h-full"
                title={`${fullscreenFeed} Camera Feed Fullscreen`}
                allowFullScreen
              ></iframe>
            </div>
            <div className="mt-4 bg-white p-4 rounded-lg">
              <h3 className="font-medium text-lg mb-2">
                {fullscreenFeed === 'entry' ? 'Entry Camera (Bus Boarding)' : 'Exit Camera (Bus Off-boarding)'}
              </h3>
              {fullscreenFeed === 'entry' && entryDetection ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-green-500 mr-2" />
                    <span className="font-medium">{entryDetection.name}</span>
                    {entryDetection.recorded && (
                      <Badge className="ml-2 bg-green-100 text-green-800">Recorded</Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{entryDetection.timestamp}</div>
                </div>
              ) : fullscreenFeed === 'exit' && exitDetection ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-green-500 mr-2" />
                    <span className="font-medium">{exitDetection.name}</span>
                    {exitDetection.recorded && (
                      <Badge className="ml-2 bg-green-100 text-green-800">Recorded</Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{exitDetection.timestamp}</div>
                </div>
              ) : (
                <div className="text-gray-500">Waiting for face detection...</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entry Camera */}
        <Card className="bg-white shadow-sm border rounded-lg">
          <CardHeader className="py-3 px-4 border-b bg-gray-50 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
              <Video className="h-4 w-4 mr-2 text-blue-500" />
              Entry Camera (Bus Boarding)
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                LIVE
              </Badge>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                onClick={() => setFullscreenFeed('entry')}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div 
              className="rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center bg-black h-[240px] w-full cursor-pointer"
              onClick={() => setFullscreenFeed('entry')}
            >
              <iframe 
                src="http://192.168.1.49:8080/video/entry"
                className="w-full h-full"
                title="Entry Camera Feed"
                allowFullScreen
              ></iframe>
            </div>
            
            {entryDetection ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-green-700">{entryDetection.name} detected</span>
                    {entryDetection.recorded && (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 ml-2">
                        <Check className="h-3 w-3 mr-1" /> Recorded
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {entryDetection.timestamp}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Confidence</span>
                    <span>{entryDetection.confidence}%</span>
                  </div>
                  <Progress 
                    value={entryDetection.confidence} 
                    className={`h-2 ${entryDetection.confidence > 90 ? 'bg-green-100' : 'bg-amber-100'}`} 
                  />
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <div className="flex items-center text-gray-500">
                  <AlertCircle className="h-4 w-4 mr-2 text-gray-400" />
                  <span>Waiting for face detection...</span>
                </div>
              </div>
            )}
            
            {entryHistory.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-medium text-gray-500 mb-2">Recent Detections</h4>
                <div className="space-y-2">
                  {entryHistory.map((detection, index) => (
                    <div key={index} className="text-xs flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div className="font-medium">{detection.name}</div>
                      <div className="text-gray-500">{detection.timestamp}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exit Camera */}
        <Card className="bg-white shadow-sm border rounded-lg">
          <CardHeader className="py-3 px-4 border-b bg-gray-50 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
              <Video className="h-4 w-4 mr-2 text-blue-500" />
              Exit Camera (Bus Off-boarding)
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                LIVE
              </Badge>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                onClick={() => setFullscreenFeed('exit')}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div 
              className="rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center bg-black h-[240px] w-full cursor-pointer"
              onClick={() => setFullscreenFeed('exit')}
            >
              <iframe 
                src="http://192.168.1.49:8080/video/exit"
                className="w-full h-full"
                title="Exit Camera Feed"
                allowFullScreen
              ></iframe>
            </div>
            
            {exitDetection ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-green-700">{exitDetection.name} detected</span>
                    {exitDetection.recorded && (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 ml-2">
                        <Check className="h-3 w-3 mr-1" /> Recorded
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {exitDetection.timestamp}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Confidence</span>
                    <span>{exitDetection.confidence}%</span>
                  </div>
                  <Progress 
                    value={exitDetection.confidence} 
                    className={`h-2 ${exitDetection.confidence > 90 ? 'bg-green-100' : 'bg-amber-100'}`} 
                  />
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <div className="flex items-center text-gray-500">
                  <AlertCircle className="h-4 w-4 mr-2 text-gray-400" />
                  <span>Waiting for face detection...</span>
                </div>
              </div>
            )}
            
            {exitHistory.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-medium text-gray-500 mb-2">Recent Detections</h4>
                <div className="space-y-2">
                  {exitHistory.map((detection, index) => (
                    <div key={index} className="text-xs flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div className="font-medium">{detection.name}</div>
                      <div className="text-gray-500">{detection.timestamp}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default LiveFeed;