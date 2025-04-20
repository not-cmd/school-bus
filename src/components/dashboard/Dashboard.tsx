import React, { useState, useEffect } from 'react';
import { Bus, Calendar, MapPin, AlertTriangle, ThermometerSun, Activity, Clock, Video, User, Users, Bell, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import LiveFeed from './LiveFeed';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import LiveBusFeed from '../live-feed/LiveBusFeed';

// Mock user data that would come from API in a real app
const users = [
  {
    username: '60018230067',
    name: 'Divyesh',
    age: 10,
    grade: "5th Standard",
    section: "B",
    school: "Greenfield Public School",
    faceDescriptor: [/* would contain actual face descriptor data */],
    profilePhoto: '/divyesh.png'
  },
  {
    username: '60018230012',
    name: 'Karan',
    age: 11,
    grade: "6th Standard",
    section: "A",
    school: "Greenfield Public School",
    faceDescriptor: [/* would contain actual face descriptor data */],
    profilePhoto: '/karan.png'
  }
];

// Current active user (would be determined by login in a real app)
const currentUser = users[0];

// Mock attendance data
interface AttendanceRecord {
  id: string;
  username: string;
  name: string;
  boardingStatus: 'onBoard' | 'offBoard' | 'absent';
  boardingTime?: string;
  offBoardingTime?: string;
  date: string;
}

const mockAttendanceHistory: AttendanceRecord[] = [
  {
    id: '1',
    username: '60018230067',
    name: 'Divyesh',
    boardingStatus: 'onBoard',
    boardingTime: '08:15 AM',
    offBoardingTime: '02:30 PM',
    date: format(new Date(), 'yyyy-MM-dd')
  },
  {
    id: '2',
    username: '60018230012',
    name: 'Karan',
    boardingStatus: 'onBoard',
    boardingTime: '08:10 AM',
    offBoardingTime: '02:25 PM',
    date: format(new Date(), 'yyyy-MM-dd')
  },
  {
    id: '3',
    username: '60018230067',
    name: 'Divyesh',
    boardingStatus: 'onBoard',
    boardingTime: '08:12 AM',
    offBoardingTime: '02:28 PM',
    date: format(new Date(Date.now() - 86400000), 'yyyy-MM-dd') // Yesterday
  },
  {
    id: '4',
    username: '60018230012',
    name: 'Karan',
    boardingStatus: 'absent',
    date: format(new Date(Date.now() - 86400000), 'yyyy-MM-dd') // Yesterday
  },
  {
    id: '5',
    username: '60018230067',
    name: 'Divyesh',
    boardingStatus: 'onBoard',
    boardingTime: '08:20 AM',
    offBoardingTime: '02:35 PM',
    date: format(new Date(Date.now() - 172800000), 'yyyy-MM-dd') // Day before yesterday
  },
  {
    id: '6',
    username: '60018230012',
    name: 'Karan',
    boardingStatus: 'onBoard',
    boardingTime: '08:18 AM',
    offBoardingTime: '02:32 PM',
    date: format(new Date(Date.now() - 172800000), 'yyyy-MM-dd') // Day before yesterday
  }
];

// Function to get today's attendance
const getTodayAttendance = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  return mockAttendanceHistory.filter(record => record.date === today);
};

const busData = {
  "busNumber": "GF-12",
  "busRegistration": "GJ01AB1234",
  "driver": {
    "name": "Rajesh Patel",
    "experience": "8 years"
  }
};
  
const aqiData = {
  "PM2_5": 36,
  "CO2": 620,
  "temperature": 27,
  "humidity": 44,
  "lastUpdated": "2025-04-17T08:55:00"
};

interface FaceDetectionResult {
  username: string;
  name: string;
  confidence: number;
  timestamp: string;
}

const Dashboard: React.FC = () => {
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>(getTodayAttendance());
  const [totalStudents] = useState(2);
  const [liveAttendanceCount, setLiveAttendanceCount] = useState(0);
  const [attendanceTab, setAttendanceTab] = useState('today');

  // State for face recognition results
  const [entryDetection, setEntryDetection] = useState<FaceDetectionResult | null>(null);
  const [exitDetection, setExitDetection] = useState<FaceDetectionResult | null>(null);
  
  // Calculate attendance percentage
  const attendedDays = todayAttendance.filter(day => day.boardingStatus === 'onBoard').length;
  const totalDays = todayAttendance.length;
  const attendancePercentage = (attendedDays / totalDays) * 100;
  
  // ETA calculation (mock - would come from API)
  const etaMinutes = 12;

  // Simulate face recognition updates
  useEffect(() => {
    // Simulate entry camera detection
    const entryInterval = setInterval(() => {
      const detected = Math.random() > 0.3;
      if (detected) {
        const detectedUser = Math.random() > 0.5 ? users[0] : users[1];
        setEntryDetection({
          username: detectedUser.username,
          name: detectedUser.name,
          confidence: Math.floor(85 + Math.random() * 15),
          timestamp: new Date().toLocaleTimeString()
        });
      } else {
        setEntryDetection(null);
      }
    }, 5000);

    // Simulate exit camera detection
    const exitInterval = setInterval(() => {
      const detected = Math.random() > 0.4;
      if (detected) {
        const detectedUser = Math.random() > 0.5 ? users[0] : users[1];
        setExitDetection({
          username: detectedUser.username,
          name: detectedUser.name,
          confidence: Math.floor(85 + Math.random() * 15),
          timestamp: new Date().toLocaleTimeString()
        });
      } else {
        setExitDetection(null);
      }
    }, 7000);

    return () => {
      clearInterval(entryInterval);
      clearInterval(exitInterval);
    };
  }, []);

  // Simulate realtime attendance updates
  useEffect(() => {
    const interval = setInterval(() => {
      const present = todayAttendance.filter(record => record.boardingStatus === 'onBoard').length;
      setLiveAttendanceCount(present);
    }, 3000);

    return () => clearInterval(interval);
  }, [todayAttendance]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Guardian Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white shadow-sm border rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Students</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-gray-500">Registered students</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm border rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Live Attendance</CardTitle>
            <User className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveAttendanceCount}/{totalStudents}</div>
            <p className="text-xs text-gray-500">Students present today</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm border rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Bus Status</CardTitle>
            <Bus className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-gray-500">Connected to system</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm border rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Alerts</CardTitle>
            <Bell className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500">No active alerts</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Live Bus Tracking */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center">
          <Navigation className="h-5 w-5 mr-2 text-blue-500" />
          Live Bus Tracking
        </h2>
        <LiveBusFeed />
      </div>
      
      {/* Attendance History */}
      <Card className="bg-white shadow-sm border rounded-lg">
        <CardHeader className="py-3 px-4 border-b">
          <CardTitle className="text-base font-medium text-gray-700">Attendance Tracking</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Tabs value={attendanceTab} onValueChange={setAttendanceTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="today" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Boarding Time</TableHead>
                    <TableHead>Off-boarding Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayAttendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-mono">{record.username}</TableCell>
                      <TableCell>{record.name}</TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${record.boardingStatus === 'onBoard' ? 'bg-green-100 text-green-800' : 
                            record.boardingStatus === 'offBoard' ? 'bg-blue-100 text-blue-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {record.boardingStatus === 'onBoard' ? 'Present' : 
                            record.boardingStatus === 'offBoard' ? 'Left' : 'Absent'}
                        </div>
                      </TableCell>
                      <TableCell>{record.boardingTime || '-'}</TableCell>
                      <TableCell>{record.offBoardingTime || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="history">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Boarding Time</TableHead>
                    <TableHead>Off-boarding Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAttendanceHistory.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.date}</TableCell>
                      <TableCell className="font-mono">{record.username}</TableCell>
                      <TableCell>{record.name}</TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${record.boardingStatus === 'onBoard' ? 'bg-green-100 text-green-800' : 
                            record.boardingStatus === 'offBoard' ? 'bg-blue-100 text-blue-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {record.boardingStatus === 'onBoard' ? 'Present' : 
                            record.boardingStatus === 'offBoard' ? 'Left' : 'Absent'}
                        </div>
                      </TableCell>
                      <TableCell>{record.boardingTime || '-'}</TableCell>
                      <TableCell>{record.offBoardingTime || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Live Feed Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Live Camera Feeds</h2>
        <LiveFeed />
      </div>
    </div>
  );
};

export default Dashboard; 