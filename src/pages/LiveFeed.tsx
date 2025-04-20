import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video, Navigation, Bus, ImageIcon, FileText } from 'lucide-react';
import LiveFeed from '../components/dashboard/LiveFeed';
import LiveBusFeed from '../components/live-feed/LiveBusFeed';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

// Driver and vehicle information
const driverInfo = {
  name: "Rajesh Patel",
  age: 38,
  experience: "8 years",
  license: "GJ1520210012345",
  phone: "+91 9876543210",
  address: "123 Main Street, Ahmedabad, Gujarat",
  photo: "https://commercialvehicle.in/wp-content/uploads/2018/12/IMG_6073-copy.jpg"
};

const vehicleInfo = {
  number: "GF-12",
  model: "Tata Starbus Ultra 36-Seater",
  registration: "GJ01AB1234",
  year: 2022,
  capacity: "36 seats",
  lastService: "15th Apr 2023",
  nextService: "15th Jul 2023",
  photo: "https://media.istockphoto.com/id/1263670997/photo/a-yellow-school-bus-on-the-road.jpg?s=612x612&w=0&k=20&c=U0KrlqgSJR0EFh1VUz85yoQ-C_xnfXtc4Nref15k9Vg=",
  rc: "https://odishatransport.gov.in/images/home-img/Know_your_rc.jpeg"
};

const LiveFeedPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("cameras");

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Live Tracking</h1>
          <div className="space-x-2">
            {/* Vehicle Info Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <Bus className="h-4 w-4 mr-2" />
                  Vehicle Info
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Vehicle Information</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Bus Number</h3>
                    <p className="text-sm text-gray-500">{vehicleInfo.number}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Registration</h3>
                    <p className="text-sm text-gray-500">{vehicleInfo.registration}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Model</h3>
                    <p className="text-sm text-gray-500">{vehicleInfo.model}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Year</h3>
                    <p className="text-sm text-gray-500">{vehicleInfo.year}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Capacity</h3>
                    <p className="text-sm text-gray-500">{vehicleInfo.capacity}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Last Service</h3>
                    <p className="text-sm text-gray-500">{vehicleInfo.lastService}</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Driver Info Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" /></svg>
                  Driver Info
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Driver Information</DialogTitle>
                </DialogHeader>
                <div className="flex items-center mb-4">
                  <img 
                    src={driverInfo.photo} 
                    alt={driverInfo.name} 
                    className="w-16 h-16 rounded-full mr-4 border"
                  />
                  <div>
                    <h3 className="font-medium text-lg">{driverInfo.name}</h3>
                    <p className="text-sm text-gray-500">Age: {driverInfo.age}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Experience</h3>
                    <p className="text-sm text-gray-500">{driverInfo.experience}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">License</h3>
                    <p className="text-sm text-gray-500">{driverInfo.license}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p className="text-sm text-gray-500">{driverInfo.phone}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Address</h3>
                    <p className="text-sm text-gray-500">{driverInfo.address}</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="cameras" className="flex items-center"><Video className="mr-2 h-4 w-4" />Camera Feeds</TabsTrigger>
            <TabsTrigger value="location" className="flex items-center"><Navigation className="mr-2 h-4 w-4" />GPS Tracking</TabsTrigger>
            <TabsTrigger value="vehicle-docs" className="flex items-center"><FileText className="mr-2 h-4 w-4" />Vehicle Photo & RC</TabsTrigger>
          </TabsList>

          {/* Camera Tab */}
          <TabsContent value="cameras">
            <Card className="bg-white border shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center text-lg font-semibold">
                  <Video className="mr-2 h-5 w-5 text-blue-500" />
                  Live Camera Feeds
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <LiveFeed />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="location">
            <LiveBusFeed />
          </TabsContent>

          {/* Vehicle Docs Tab */}
          <TabsContent value="vehicle-docs">
            <Card className="bg-white border shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center text-lg font-semibold">
                  <FileText className="mr-2 h-5 w-5 text-green-600" />
                  Vehicle Photo & Registration Certificate
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex flex-col md:flex-row gap-6 justify-center items-center">
                <div className="text-center">
                  <h3 className="font-medium mb-2">Vehicle Photo</h3>
                  <Zoom>
                    <img
                      src={vehicleInfo.photo}
                      alt="Vehicle"
                      className="max-h-64 rounded shadow-lg border"
                    />
                  </Zoom>
                </div>
                <div className="text-center">
                  <h3 className="font-medium mb-2">Registration Certificate (RC)</h3>
                  <Zoom>
                    <img
                      src={vehicleInfo.rc}
                      alt="RC"
                      className="max-h-64 rounded shadow-lg border"
                    />
                  </Zoom>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default LiveFeedPage;