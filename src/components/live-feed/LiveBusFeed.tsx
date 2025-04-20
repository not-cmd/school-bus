import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Compass, MapPin, Clock, AlertCircle, Gauge, Video, Navigation } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LocationData {
  latitude: string;
  longitude: string;
  speed: string;
  nextStop: string;
  eta: string;
  lastUpdated: string;
}

const LiveBusFeed: React.FC = () => {
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
      const speedVariation = Math.floor(Math.random() * 10) - 5; // -5 to +5
      const newSpeed = Math.max(0, Math.min(80, 45 + speedVariation));
      
      const etaVariation = Math.floor(Math.random() * 3) - 1; // -1 to +1
      const newEta = Math.max(1, Math.min(15, 8 + etaVariation));
      
      setLocationData(prev => ({
        ...prev,
        speed: `${newSpeed} km/h`,
        eta: `${newEta} minutes`,
        lastUpdated: new Date().toLocaleTimeString()
      }));
    }, 10000);

    return () => clearInterval(updateInterval);
  }, []);

  return (
    <Card className="bg-white shadow-sm border rounded-lg">
      <CardHeader className="border-b flex flex-row items-center justify-between py-3 px-4">
        <CardTitle className="text-base font-medium text-gray-700 flex items-center">
          <Navigation className="mr-2 h-4 w-4 text-blue-500" />
          Live Bus Feed
        </CardTitle>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          LIVE
        </Badge>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Video Feed (can be replaced with a map in a real app) */}
          <div className="md:w-3/5">
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
              <iframe 
                src="http://192.168.1.49:8080/video"
                className="w-full h-full"
                title="Live Bus Feed"
                allowFullScreen
              ></iframe>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="p-2 rounded bg-gray-50">
                <div className="text-xs text-gray-500">Bus Number</div>
                <div className="font-medium">GF-12</div>
              </div>
              <div className="p-2 rounded bg-gray-50">
                <div className="text-xs text-gray-500">Driver</div>
                <div className="font-medium">Rajesh Patel</div>
              </div>
            </div>
          </div>
          
          {/* Location Information */}
          <div className="md:w-2/5 flex flex-col space-y-4">
            <div className="p-3 rounded-lg bg-gray-50">
              <div className="flex items-center mb-1">
                <MapPin className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-sm font-medium">Current Location</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <div className="text-xs text-gray-500">Latitude</div>
                  <div className="font-medium">{locationData.latitude}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Longitude</div>
                  <div className="font-medium">{locationData.longitude}</div>
                </div>
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-gray-50">
              <div className="flex items-center mb-1">
                <Gauge className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-sm font-medium">Current Speed</span>
              </div>
              <div className="text-2xl font-bold">{locationData.speed}</div>
            </div>
            
            <div className="p-3 rounded-lg bg-gray-50">
              <div className="flex items-center mb-1">
                <MapPin className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-sm font-medium">Next Stop</span>
              </div>
              <div className="font-medium">{locationData.nextStop}</div>
            </div>
            
            <div className="p-3 rounded-lg bg-gray-50">
              <div className="flex items-center mb-1">
                <Clock className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-sm font-medium">ETA</span>
              </div>
              <div className="text-2xl font-bold">{locationData.eta}</div>
            </div>
          </div>
        </div>
        <div className="text-right text-xs text-gray-500 mt-4">
          Last updated: {locationData.lastUpdated}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveBusFeed; 