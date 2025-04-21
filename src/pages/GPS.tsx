import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin, Clock, Calendar, TrendingUp, Navigation, Maximize, Minimize } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";

// Mock data for trip history
const tripHistoryData = [
  {
    date: "2023-06-01",
    morningOnboard: "07:45 AM",
    morningOffboard: "08:15 AM",
    eveningOnboard: "03:30 PM",
    eveningOffboard: "04:05 PM",
    present: true,
  },
  {
    date: "2023-06-02",
    morningOnboard: "07:50 AM",
    morningOffboard: "08:20 AM",
    eveningOnboard: "03:35 PM",
    eveningOffboard: "04:10 PM",
    present: true,
  },
  {
    date: "2023-06-03",
    morningOnboard: null,
    morningOffboard: null,
    eveningOnboard: null,
    eveningOffboard: null,
    present: false,
  },
  {
    date: "2023-06-04",
    morningOnboard: "07:40 AM",
    morningOffboard: "08:10 AM",
    eveningOnboard: "03:30 PM",
    eveningOffboard: "04:00 PM",
    present: true,
  },
  {
    date: "2023-06-05",
    morningOnboard: "07:45 AM",
    morningOffboard: "08:15 AM",
    eveningOnboard: "03:30 PM",
    eveningOffboard: "04:05 PM",
    present: true,
  },
  {
    date: "2023-06-06",
    morningOnboard: null,
    morningOffboard: null,
    eveningOnboard: null,
    eveningOffboard: null,
    present: false,
  },
  {
    date: "2023-06-07",
    morningOnboard: "07:40 AM",
    morningOffboard: "08:10 AM",
    eveningOnboard: "03:30 PM",
    eveningOffboard: "04:00 PM",
    present: true,
  },
];

// Mock data for current bus location
const currentBusData = {
  latitude: 40.7128,
  longitude: -74.006,
  speed: "25 mph",
  eta: "10 minutes",
  address: "123 School Avenue, New York, NY",
  lastUpdated: "2:45 PM",
};

// Utility to format dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

// Calculate presence percentage
const calculatePresence = (data: typeof tripHistoryData) => {
  const totalDays = data.length;
  const presentDays = data.filter(day => day.present).length;
  return (presentDays / totalDays) * 100;
};

const GPS = () => {
  const [activeTab, setActiveTab] = useState("map");
  const presencePercentage = calculatePresence(tripHistoryData);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const mapCardRef = useRef<HTMLDivElement>(null);

  const toggleFullScreen = () => {
    if (!mapCardRef.current) return;
    
    if (!isFullScreen) {
      if (mapCardRef.current.requestFullscreen) {
        mapCardRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Listen for fullscreen change events
  React.useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 bg-[#F3F4F6]">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#111827]">GPS & Trip Analytics</h1>
            <p className="text-[#6B7280] mt-1">Parent View - Track your child's bus in real-time</p>
          </div>
          <Badge variant="outline" className="mt-2 md:mt-0 bg-[#FFC107]/10 border-[#FFC107] text-[#0056B6]">
            <Clock className="mr-1 h-3 w-3" /> Live Updates
          </Badge>
        </div>

        <Tabs defaultValue="map" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur-lg border border-[#E5E7EB] rounded-lg mb-6">
            <TabsTrigger 
              value="map" 
              className="text-[#6B7280] data-[state=active]:bg-[#0056B6] data-[state=active]:text-white"
            >
              Live Map
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="text-[#6B7280] data-[state=active]:bg-[#0056B6] data-[state=active]:text-white"
            >
              Trip History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card 
                ref={mapCardRef}
                className={`md:col-span-2 bg-white/85 backdrop-blur-xl shadow-lg border border-[#E5E7EB] ${isFullScreen ? 'w-full h-full' : ''}`}
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center text-[#111827]">
                    <MapPin className="mr-2 h-5 w-5 text-[#0056B6]" />
                    Live Bus Location
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleFullScreen}
                    data-component-name="Button"
                    data-component-content="%7B%22className%22%3A%22w-full%20h-full%22%7D"
                    className="rounded-full h-8 w-8 p-0 text-[#0056B6] hover:bg-[#0056B6]/10"
                  >
                    {isFullScreen ? (
                      <Minimize className="h-4 w-4" />
                    ) : (
                      <Maximize className="h-4 w-4" />
                    )}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className={`relative rounded-lg overflow-hidden ${isFullScreen ? 'h-[calc(100vh-120px)]' : 'h-[400px]'}`}>
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      src={`https://www.google.com/maps/embed/v1/place?key=REPLACE_WITH_YOUR_API_KEY&q=${currentBusData.latitude},${currentBusData.longitude}&zoom=15`}
                    ></iframe>
                  </div>
                </CardContent>
              </Card>

              <Card className={`bg-white/85 backdrop-blur-xl shadow-lg border border-[#E5E7EB] ${isFullScreen ? 'hidden' : ''}`}>
                <CardHeader>
                  <CardTitle className="text-[#111827]">Trip Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB]">
                      <h3 className="text-sm font-medium text-[#6B7280] mb-1">Current Address</h3>
                      <p className="text-[#111827] flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-[#0056B6]" />
                        {currentBusData.address}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB]">
                        <h3 className="text-sm font-medium text-[#6B7280] mb-1">ETA</h3>
                        <p className="text-[#111827] flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-[#FFC107]" />
                          {currentBusData.eta}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB]">
                        <h3 className="text-sm font-medium text-[#6B7280] mb-1">Speed</h3>
                        <p className="text-[#111827] flex items-center">
                          <Navigation className="mr-2 h-4 w-4 text-[#0056B6]" />
                          {currentBusData.speed}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB]">
                      <h3 className="text-sm font-medium text-[#6B7280] mb-1">Last Updated</h3>
                      <p className="text-[#111827]">{currentBusData.lastUpdated}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="md:col-span-2 bg-white/85 backdrop-blur-xl shadow-lg border border-[#E5E7EB]">
                <CardHeader>
                  <CardTitle className="flex items-center text-[#111827]">
                    <Calendar className="mr-2 h-5 w-5 text-[#0056B6]" />
                    Trip History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#E5E7EB]">
                          <TableHead className="text-[#6B7280]">Date</TableHead>
                          <TableHead className="text-[#6B7280]">Morning Onboard</TableHead>
                          <TableHead className="text-[#6B7280]">Morning Offboard</TableHead>
                          <TableHead className="text-[#6B7280]">Evening Onboard</TableHead>
                          <TableHead className="text-[#6B7280]">Evening Offboard</TableHead>
                          <TableHead className="text-[#6B7280]">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tripHistoryData.map((trip, index) => (
                          <TableRow key={index} className="border-[#E5E7EB]">
                            <TableCell className="font-medium text-[#111827]">{formatDate(trip.date)}</TableCell>
                            <TableCell className="text-[#6B7280]">{trip.morningOnboard || "-"}</TableCell>
                            <TableCell className="text-[#6B7280]">{trip.morningOffboard || "-"}</TableCell>
                            <TableCell className="text-[#6B7280]">{trip.eveningOnboard || "-"}</TableCell>
                            <TableCell className="text-[#6B7280]">{trip.eveningOffboard || "-"}</TableCell>
                            <TableCell>
                              {trip.present ? (
                                <Badge className="bg-[#34D399]/20 text-[#34D399] border-[#34D399]/30">Present</Badge>
                              ) : (
                                <Badge variant="destructive" className="bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30">Absent</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/85 backdrop-blur-xl shadow-lg border border-[#E5E7EB]">
                <CardHeader>
                  <CardTitle className="flex items-center text-[#111827]">
                    <TrendingUp className="mr-2 h-5 w-5 text-[#0056B6]" />
                    Attendance Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center p-4">
                      <div className="relative inline-flex items-center justify-center">
                        <svg className="w-32 h-32">
                          <circle
                            className="text-[#F3F4F6]"
                            strokeWidth="8"
                            stroke="currentColor"
                            fill="transparent"
                            r="58"
                            cx="64"
                            cy="64"
                          />
                          <circle
                            className="text-[#34D399]"
                            strokeWidth="8"
                            strokeDasharray={`${presencePercentage * 3.65} 365`}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="58"
                            cx="64"
                            cy="64"
                          />
                        </svg>
                        <span className="absolute text-2xl text-[#111827] font-bold">
                          {Math.round(presencePercentage)}%
                        </span>
                      </div>
                      <p className="mt-2 text-[#6B7280]">7-Day Attendance</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-[#6B7280] mb-3">Daily Attendance</h3>
                      <div className="grid grid-cols-7 gap-1">
                        {tripHistoryData.map((day, index) => (
                          <div key={index} className="flex flex-col items-center">
                            <div 
                              className={`h-12 w-6 rounded ${day.present ? 'bg-[#34D399]/40' : 'bg-[#EF4444]/40'}`}
                            />
                            <span className="text-xs text-[#6B7280] mt-1">
                              {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default GPS; 