import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Calendar as CalendarIcon, CheckCircle, XCircle, Info, LogIn, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, isToday } from 'date-fns';
import { Button } from '@/components/ui/button';

// Mock attendance data - Update to current month/year
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();

// Define a more detailed attendance record structure
interface AttendanceDetail {
  date: Date;
  status: 'present' | 'absent';
  morning: {
    entryTime: string | null;
    exitTime: string | null;
  };
  afternoon: {
    entryTime: string | null;
    exitTime: string | null;
  };
}

// Initial attendance data
const getInitialAttendanceData = () => {
  const divyeshData: AttendanceDetail[] = [
    { 
      date: new Date(currentYear, currentMonth, 2), 
      status: 'present', 
      morning: { entryTime: '7:45 AM', exitTime: '8:30 AM' },
      afternoon: { entryTime: '2:30 PM', exitTime: '3:30 PM' }
    },
    { 
      date: new Date(currentYear, currentMonth, 3), 
      status: 'present', 
      morning: { entryTime: '7:43 AM', exitTime: '8:32 AM' },
      afternoon: { entryTime: '2:28 PM', exitTime: '3:32 PM' }
    },
    { 
      date: new Date(currentYear, currentMonth, 4), 
      status: 'absent', 
      morning: { entryTime: null, exitTime: null },
      afternoon: { entryTime: null, exitTime: null }
    },
    { 
      date: new Date(currentYear, currentMonth, 5), 
      status: 'present', 
      morning: { entryTime: '7:50 AM', exitTime: '8:28 AM' },
      afternoon: { entryTime: '2:25 PM', exitTime: '3:28 PM' }
    }
  ];
  
  const karanData: AttendanceDetail[] = [
    { 
      date: new Date(currentYear, currentMonth, 2), 
      status: 'present', 
      morning: { entryTime: '7:48 AM', exitTime: '8:35 AM' },
      afternoon: { entryTime: '2:33 PM', exitTime: '3:35 PM' }
    },
    { 
      date: new Date(currentYear, currentMonth, 3), 
      status: 'absent', 
      morning: { entryTime: null, exitTime: null },
      afternoon: { entryTime: null, exitTime: null }
    },
    { 
      date: new Date(currentYear, currentMonth, 4), 
      status: 'present', 
      morning: { entryTime: '7:42 AM', exitTime: '8:30 AM' },
      afternoon: { entryTime: '2:30 PM', exitTime: '3:28 PM' }
    },
    { 
      date: new Date(currentYear, currentMonth, 5), 
      status: 'present', 
      morning: { entryTime: '7:45 AM', exitTime: '8:32 AM' },
      afternoon: { entryTime: '2:29 PM', exitTime: '3:30 PM' }
    }
  ];
  
  return {
    "Divyesh": divyeshData,
    "Karan": karanData
  };
};

interface Student {
  id: string;
  username: string;
  password: string;
  name: string;
  grade: string;
  section: string;
}

// Student data
const students: Student[] = [
  {
    id: "1",
    username: "60018230067",
    password: "pass@123",
    name: "Divyesh",
    grade: "5th",
    section: "A"
  },
  {
    id: "2",
    username: "60018230012",
    password: "pass@123",
    name: "Karan",
    grade: "6th",
    section: "B"
  }
];

// Attendance summary calculation
const calculateAttendanceSummary = (attendanceData: AttendanceDetail[]) => {
  const total = attendanceData.length;
  const present = attendanceData.filter(day => day.status === 'present').length;
  const absent = total - present;
  const presentPercentage = total > 0 ? (present / total) * 100 : 0;
  
  return {
    total,
    present,
    absent,
    presentPercentage: presentPercentage.toFixed(1)
  };
};

interface DayProps {
  date: Date;
}

const AttendanceCalendar: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceDetail | null>(null);
  const [activeStudent, setActiveStudent] = useState("Divyesh");
  const [attendanceData, setAttendanceData] = useState(getInitialAttendanceData());
  const [studentLogs, setStudentLogs] = useState<{date: Date, type: string, time: string}[]>([]);
  
  const currentStudentData = attendanceData[activeStudent] || [];
  const summary = calculateAttendanceSummary(currentStudentData);

  // Helper function to get attendance data for a date
  const getAttendanceForDate = (date: Date) => {
    if (!date) return null;
    
    return currentStudentData.find(item => 
      item.date.getDate() === date.getDate() && 
      item.date.getMonth() === date.getMonth() && 
      item.date.getFullYear() === date.getFullYear()
    );
  };

  // Function to mark attendance manually
  const markAttendance = (status: 'present' | 'absent') => {
    if (!selectedDate) return;
    
    // Create a new attendance record if it doesn't exist
    const newRecord: AttendanceDetail = {
      date: selectedDate,
      status,
      morning: { 
        entryTime: status === 'present' ? format(new Date(), 'h:mm a') : null, 
        exitTime: null 
      },
      afternoon: { entryTime: null, exitTime: null }
    };
    
    // Update the attendance data
    setAttendanceData(prev => {
      const newData = { ...prev };
      const studentRecords = [...(newData[activeStudent] || [])];
      
      // Remove any existing record for this date
      const existingIndex = studentRecords.findIndex(item => 
        item.date.getDate() === selectedDate.getDate() && 
        item.date.getMonth() === selectedDate.getMonth() && 
        item.date.getFullYear() === selectedDate.getFullYear()
      );
      
      if (existingIndex >= 0) {
        studentRecords[existingIndex] = newRecord;
      } else {
        studentRecords.push(newRecord);
      }
      
      newData[activeStudent] = studentRecords;
      return newData;
    });
    
    // Update selected attendance
    setSelectedAttendance(newRecord);
    
    // Add to student logs
    if (status === 'present') {
      setStudentLogs(prev => [
        {
          date: selectedDate,
          type: 'Morning Entry',
          time: format(new Date(), 'h:mm a')
        },
        ...prev
      ]);
    }
  };

  // Record entry/exit times
  const recordTime = (timeType: 'morning-entry' | 'morning-exit' | 'afternoon-entry' | 'afternoon-exit') => {
    if (!selectedDate || !selectedAttendance) return;
    
    const currentTime = format(new Date(), 'h:mm a');
    
    // Update the attendance data
    setAttendanceData(prev => {
      const newData = { ...prev };
      const studentRecords = [...(newData[activeStudent] || [])];
      
      // Find the record for this date
      const existingIndex = studentRecords.findIndex(item => 
        item.date.getDate() === selectedDate.getDate() && 
        item.date.getMonth() === selectedDate.getMonth() && 
        item.date.getFullYear() === selectedDate.getFullYear()
      );
      
      if (existingIndex >= 0) {
        const updatedRecord = { ...studentRecords[existingIndex] };
        
        // Update the specific time field
        if (timeType === 'morning-entry') {
          updatedRecord.morning.entryTime = currentTime;
        } else if (timeType === 'morning-exit') {
          updatedRecord.morning.exitTime = currentTime;
        } else if (timeType === 'afternoon-entry') {
          updatedRecord.afternoon.entryTime = currentTime;
        } else if (timeType === 'afternoon-exit') {
          updatedRecord.afternoon.exitTime = currentTime;
        }
        
        studentRecords[existingIndex] = updatedRecord;
        setSelectedAttendance(updatedRecord);
      }
      
      newData[activeStudent] = studentRecords;
      return newData;
    });
    
    // Add to student logs
    let logType = '';
    switch(timeType) {
      case 'morning-entry': logType = 'Morning Entry'; break;
      case 'morning-exit': logType = 'Morning Exit'; break;
      case 'afternoon-entry': logType = 'Afternoon Entry'; break;
      case 'afternoon-exit': logType = 'Afternoon Exit'; break;
    }
    
    setStudentLogs(prev => [
      {
        date: selectedDate,
        type: logType,
        time: currentTime
      },
      ...prev
    ]);
  };

  // Custom day renderer for the calendar
  const customDayRender = (day: DayProps) => {
    const attendance = getAttendanceForDate(day.date);
    
    // Ensure we are checking against a valid date object
    if (!day.date || !(day.date instanceof Date)) {
      return <div>Invalid Date</div>;
    }

    // Default day rendering
    const dayOfMonth = day.date.getDate();
    let backgroundClass = 'bg-transparent hover:bg-gray-100';
    let textClass = 'text-gray-800';

    if (attendance) {
      if (attendance.status === 'present') {
        backgroundClass = 'bg-green-100 hover:bg-green-200';
        textClass = 'text-green-800 font-medium';
      } else if (attendance.status === 'absent') {
        backgroundClass = 'bg-red-100 hover:bg-red-200';
        textClass = 'text-red-800 font-medium';
      }
    }

    // Highlight today
    if (isToday(day.date)) {
      backgroundClass = attendance ? backgroundClass : 'bg-blue-50 hover:bg-blue-100';
      textClass = attendance ? textClass : 'text-blue-800 font-medium';
    }

    return (
      <div
        className={`w-full h-full flex justify-center items-center rounded-md text-sm ${backgroundClass} ${textClass}`}
      >
        {dayOfMonth}
      </div>
    );
  };

  // Handle day selection in calendar
  const handleSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    
    setDate(selectedDate);
    setSelectedDate(selectedDate);
    
    const attendance = getAttendanceForDate(selectedDate);
    setSelectedAttendance(attendance || null);
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-screen-xl px-4 py-6">
        <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl font-bold">Attendance Records</h1>
            <p className="text-gray-500">Track student's bus attendance</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Badge 
              className={`cursor-pointer px-3 py-1 ${activeStudent === "Divyesh" 
                ? "bg-blue-100 text-blue-800 hover:bg-blue-200" 
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"}`}
              onClick={() => setActiveStudent("Divyesh")}
            >
              Divyesh
            </Badge>
            <Badge 
              className={`cursor-pointer px-3 py-1 ${activeStudent === "Karan" 
                ? "bg-blue-100 text-blue-800 hover:bg-blue-200" 
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"}`}
              onClick={() => setActiveStudent("Karan")}
            >
              Karan
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="calendar">
          <TabsList className="mb-4">
            <TabsTrigger value="calendar" className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Calendar View
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center">
              <LogIn className="mr-2 h-4 w-4" />
              Student Logs
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Calendar Card */}
              <Card className="bg-white border rounded-lg shadow-sm md:col-span-2">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center text-lg font-semibold">
                    <CalendarIcon className="mr-2 h-5 w-5 text-blue-500" />
                    Attendance Calendar for {activeStudent}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex flex-col">
                    <div className="flex items-center mb-4 space-x-4">
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-sm">Present</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                        <span className="text-sm">Absent</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-blue-200 mr-2"></div>
                        <span className="text-sm">Today</span>
                      </div>
                    </div>
                    
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleSelect}
                      className="rounded-md border"
                      fixedWeeks
                      components={{
                        Day: customDayRender,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Attendance Details Card */}
              <Card className="bg-white border rounded-lg shadow-sm">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center text-lg font-semibold">
                    <Clock className="mr-2 h-5 w-5 text-blue-500" />
                    Attendance Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {selectedDate ? (
                    <div className="space-y-4">
                      <div className="text-center mb-6">
                        <div className="text-lg font-medium">
                          {selectedDate?.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        
                        {selectedAttendance ? (
                          <div className={`flex items-center justify-center mt-2 ${
                            selectedAttendance.status === 'present' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {selectedAttendance.status === 'present' ? (
                              <CheckCircle className="h-8 w-8 mr-2" />
                            ) : (
                              <XCircle className="h-8 w-8 mr-2" />
                            )}
                            <span className="text-xl font-bold capitalize">
                              {selectedAttendance.status}
                            </span>
                          </div>
                        ) : (
                          <div className="mt-4 flex justify-center space-x-2">
                            <Button 
                              variant="outline" 
                              className="border-green-500 text-green-600 hover:bg-green-50"
                              onClick={() => markAttendance('present')}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark Present
                            </Button>
                            <Button 
                              variant="outline" 
                              className="border-red-500 text-red-600 hover:bg-red-50"
                              onClick={() => markAttendance('absent')}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Mark Absent
                            </Button>
                          </div>
                        )}
                      </div>

                      {selectedAttendance && selectedAttendance.status === 'present' && (
                        <div className="space-y-4">
                          <div className="p-3 rounded-lg bg-gray-50">
                            <div className="text-sm font-medium mb-2">Morning</div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <div className="flex items-center mb-1">
                                  <LogIn className="h-3 w-3 mr-1 text-blue-500" />
                                  <span className="text-xs text-gray-500">Entry Time</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="font-medium">{selectedAttendance.morning.entryTime || '-'}</span>
                                  {!selectedAttendance.morning.entryTime && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-xs h-6 ml-2"
                                      onClick={() => recordTime('morning-entry')}
                                    >
                                      Record
                                    </Button>
                                  )}
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center mb-1">
                                  <LogOut className="h-3 w-3 mr-1 text-blue-500" />
                                  <span className="text-xs text-gray-500">Exit Time</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="font-medium">{selectedAttendance.morning.exitTime || '-'}</span>
                                  {!selectedAttendance.morning.exitTime && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-xs h-6 ml-2"
                                      onClick={() => recordTime('morning-exit')}
                                    >
                                      Record
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-3 rounded-lg bg-gray-50">
                            <div className="text-sm font-medium mb-2">Afternoon</div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <div className="flex items-center mb-1">
                                  <LogIn className="h-3 w-3 mr-1 text-blue-500" />
                                  <span className="text-xs text-gray-500">Entry Time</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="font-medium">{selectedAttendance.afternoon.entryTime || '-'}</span>
                                  {!selectedAttendance.afternoon.entryTime && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-xs h-6 ml-2"
                                      onClick={() => recordTime('afternoon-entry')}
                                    >
                                      Record
                                    </Button>
                                  )}
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center mb-1">
                                  <LogOut className="h-3 w-3 mr-1 text-blue-500" />
                                  <span className="text-xs text-gray-500">Exit Time</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="font-medium">{selectedAttendance.afternoon.exitTime || '-'}</span>
                                  {!selectedAttendance.afternoon.exitTime && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-xs h-6 ml-2"
                                      onClick={() => recordTime('afternoon-exit')}
                                    >
                                      Record
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 flex flex-col items-center">
                      <Info className="h-12 w-12 text-gray-300 mb-2" />
                      Select a date to view attendance details
                    </div>
                  )}

                  <div className="mt-8">
                    <h3 className="font-semibold text-base mb-3">Monthly Summary</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-3 rounded bg-gray-50 text-center">
                        <div className="text-xs text-gray-500">Total Days</div>
                        <div className="font-bold text-lg">{summary.total}</div>
                      </div>
                      <div className="p-3 rounded bg-green-50 text-center">
                        <div className="text-xs text-gray-500">Present</div>
                        <div className="font-bold text-lg text-green-700">{summary.present}</div>
                      </div>
                      <div className="p-3 rounded bg-red-50 text-center">
                        <div className="text-xs text-gray-500">Absent</div>
                        <div className="font-bold text-lg text-red-700">{summary.absent}</div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-sm text-gray-700 mb-1 flex justify-between">
                        <span>Attendance Rate</span>
                        <span className="font-medium">{summary.presentPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-green-500 h-2.5 rounded-full" 
                          style={{ width: `${summary.presentPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="list">
            <Card className="bg-white border rounded-lg shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center text-lg font-semibold">
                  <Clock className="mr-2 h-5 w-5 text-blue-500" />
                  Attendance History for {activeStudent}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Morning Entry</TableHead>
                        <TableHead>Morning Exit</TableHead>
                        <TableHead>Afternoon Entry</TableHead>
                        <TableHead>Afternoon Exit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentStudentData.sort((a, b) => b.date.getTime() - a.date.getTime()).map((record, index) => (
                        <TableRow key={index} className={record.status === 'absent' ? 'bg-red-50' : ''}>
                          <TableCell>
                            {format(record.date, 'EEE, MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${
                              record.status === 'present' 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : 'bg-red-100 text-red-800 border-red-200'
                            }`}>
                              {record.status === 'present' ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <XCircle className="h-3 w-3 mr-1" />
                              )}
                              <span className="capitalize">{record.status}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>{record.morning.entryTime || '-'}</TableCell>
                          <TableCell>{record.morning.exitTime || '-'}</TableCell>
                          <TableCell>{record.afternoon.entryTime || '-'}</TableCell>
                          <TableCell>{record.afternoon.exitTime || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="logs">
            <Card className="bg-white border rounded-lg shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center text-lg font-semibold">
                  <LogIn className="mr-2 h-5 w-5 text-blue-500" />
                  Student Entry/Exit Logs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {studentLogs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Activity</TableHead>
                          <TableHead>Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentLogs.map((log, index) => (
                          <TableRow key={index}>
                            <TableCell>{format(log.date, 'MMM d, yyyy')}</TableCell>
                            <TableCell>{activeStudent}</TableCell>
                            <TableCell>
                              <Badge className={`${
                                log.type.includes('Entry') 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {log.type.includes('Entry') ? (
                                  <LogIn className="h-3 w-3 mr-1" />
                                ) : (
                                  <LogOut className="h-3 w-3 mr-1" />
                                )}
                                {log.type}
                              </Badge>
                            </TableCell>
                            <TableCell>{log.time}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    No logs recorded yet. Logs will appear when entry/exit times are recorded.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AttendanceCalendar; 