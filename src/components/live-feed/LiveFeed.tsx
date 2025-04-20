import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Compass, 
  MapPin, 
  Clock, 
  AlertCircle,
  Gauge,
  Video
} from 'lucide-react';

interface LocationData {
  latitude: string;
  longitude: string;
  speed: string;
  nextStop: string;
  eta: string;
  lastUpdated: string;
}

const LiveFeed: React.FC = () => {
  const [locationData, setLocationData] = useState<LocationData>({
    latitude: '23.0225° N',
    longitude: '72.5714° E',
    speed: '45 km/h',
    nextStop: 'Greenfield School (Main Gate)',
    eta: '8 minutes',
    lastUpdated: new Date().toLocaleTimeString()
  });

  // Simulating location updates
  useEffect(() => {
    const updateInterval = setInterval(() => {
      // In a real app, this would fetch data from an API
      setLocationData(prev => ({
        ...prev,
        lastUpdated: new Date().toLocaleTimeString()
      }));
    }, 30000);

    return () => clearInterval(updateInterval);
  }, []);

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-screen-xl space-y-6">
        <h2 className="text-lg font-bold font-poppins mb-3">Live Tracking</h2>
        
        <Card className="glass-morphism border border-white/20 w-full">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg font-semibold">
              <Video className="mr-2 h-5 w-5 text-guardian-primary" />
              Live Bus Feed
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Video Feed */}
              <div className="lg:w-2/3 flex justify-center">
                <div className="rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center bg-black h-[576px] w-[1024px] max-w-full">
                  <iframe 
                    src="http://192.168.1.49:8080/video"
                    className="w-full h-full"
                    title="Live Bus Feed"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
              
              {/* Location Information */}
              <div className="lg:w-1/3 flex flex-col space-y-4">
                <div className="flex items-center mb-2">
                  <MapPin className="mr-2 h-5 w-5 text-guardian-primary" />
                  <h3 className="font-bold text-lg">Current Location</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-3 w-full">
                  <div className="p-3 rounded-lg bg-guardian-primary/5 w-full">
                    <div className="flex items-center mb-1">
                      <MapPin className="h-4 w-4 text-guardian-primary mr-2" />
                      <span className="text-sm font-medium">GPS Coordinates</span>
                    </div>
                    <div className="flex justify-between">
                      <div className="text-xs text-gray-500">Latitude</div>
                      <div className="text-sm font-semibold">{locationData.latitude}</div>
                    </div>
                    <div className="flex justify-between">
                      <div className="text-xs text-gray-500">Longitude</div>
                      <div className="text-sm font-semibold">{locationData.longitude}</div>
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-guardian-primary/5 w-full">
                    <div className="flex items-center mb-1">
                      <Gauge className="h-4 w-4 text-guardian-primary mr-2" />
                      <span className="text-sm font-medium">Current Speed</span>
                    </div>
                    <div className="text-2xl font-bold">{locationData.speed}</div>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-guardian-primary/5 w-full">
                    <div className="flex items-center mb-1">
                      <AlertCircle className="h-4 w-4 text-guardian-primary mr-2" />
                      <span className="text-sm font-medium">Next Stop</span>
                    </div>
                    <div className="text-sm font-semibold">{locationData.nextStop}</div>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-guardian-primary/5 w-full">
                    <div className="flex items-center mb-1">
                      <Clock className="h-4 w-4 text-guardian-primary mr-2" />
                      <span className="text-sm font-medium">ETA</span>
                    </div>
                    <div className="flex items-center">
                      <div className="eta-ripple mr-2"></div>
                      <div className="text-xl font-bold">{locationData.eta}</div>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mt-auto pt-2">
                  Last updated: {locationData.lastUpdated}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveFeed; 