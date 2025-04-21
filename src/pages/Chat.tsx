import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  SendHorizonal, 
  Bot, 
  User, 
  MapPin, 
  Clock, 
  Bus, 
  User2, 
  AlertCircle, 
  ChevronRight,
  Gauge,
  Route,
  MessageSquare
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";

// Define message types
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Mock data for the bot responses
const mockStudentData = {
  name: "Divyesh",
  boardingTime: "7:42 AM",
  currentLocation: "Satellite Road",
  etaToSchool: "8:20 AM",
  etaToHome: "3:45 PM",
  busStarted: true,
  currentStop: "Stop #3 - Satellite Junction",
  nextStop: "Stop #4 - Central Mall",
  isOnBoard: true,
};

const mockDriverData = {
  name: "Rajesh Patel",
  experience: "8 years",
  contact: "+91 98765 43210",
  rating: "4.8/5",
  photo: "/driver-photo.jpg",
};

const mockBusData = {
  number: "GJ-01-XX-1234",
  model: "Tata Starbus Ultra",
  capacity: "32 seats",
  condition: "Excellent",
  lastMaintenance: "15 days ago",
  speed: "35 km/h",
  onRoute: true,
  routeDeviation: false,
};

// Intent patterns for rule-based matching
const intents = [
  {
    name: 'location',
    patterns: ['where is my child', 'where is the bus', 'bus location', 'current location', 'where', 'student location'],
    response: () => `Your child, ${mockStudentData.name}, boarded the bus at ${mockStudentData.boardingTime}. The bus is currently near ${mockStudentData.currentLocation}. ETA to school: ${mockStudentData.etaToSchool}.`
  },
  {
    name: 'eta',
    patterns: ['eta', 'how long', 'time to reach', 'arrival time', 'when will', 'how much time'],
    response: () => `The bus is expected to reach school at ${mockStudentData.etaToSchool} and back home at ${mockStudentData.etaToHome}.`
  },
  {
    name: 'bus_started',
    patterns: ['has the bus started', 'bus started', 'journey begun', 'beginning journey'],
    response: () => mockStudentData.busStarted ? 
      `Yes, the bus journey has started at ${mockStudentData.boardingTime} and is currently at ${mockStudentData.currentLocation}.` : 
      `The bus hasn't started its journey yet. It's scheduled to start soon.`
  },
  {
    name: 'bus_stop',
    patterns: ['which stop', 'current stop', 'bus stop', 'next stop'],
    response: () => `The bus is currently at ${mockStudentData.currentStop}. The next stop will be ${mockStudentData.nextStop}.`
  },
  {
    name: 'driver_info',
    patterns: ['who is the driver', 'driver today', 'driving the bus', 'bus driver', 'driver details', 'driver info'],
    response: () => `Today's driver is ${mockDriverData.name}, with ${mockDriverData.experience} of experience. Driver rating: ${mockDriverData.rating}.`
  },
  {
    name: 'bus_number',
    patterns: ['bus number', 'vehicle number', 'registration number', 'bus details'],
    response: () => `The bus number is ${mockBusData.number}. It's a ${mockBusData.model} with a capacity of ${mockBusData.capacity}.`
  },
  {
    name: 'bus_condition',
    patterns: ['bus condition', 'vehicle condition', 'how is the bus', 'maintenance', 'safety'],
    response: () => `The bus condition is ${mockBusData.condition}. The last maintenance check was ${mockBusData.lastMaintenance}.`
  },
  {
    name: 'safety_concern',
    patterns: ['is everything alright', 'hope safe', 'safety', 'concern', 'worried', 'alright', 'okay'],
    response: () => `Yes, everything is going well. The bus is operating normally and following the designated route. Your child is safe.`
  },
  {
    name: 'emergency',
    patterns: ['emergency', 'urgent', 'help', 'need assistance', 'critical', 'immediate', 'urgently'],
    response: () => `I've notified the school staff about your concern. Please stay connected — someone will contact you shortly.`
  },
  {
    name: 'speed',
    patterns: ['how fast', 'speed', 'velocity', 'bus speed', 'speeding'],
    response: () => `The current speed of the bus is ${mockBusData.speed}, which is within the safety limits for school buses.`
  },
  {
    name: 'route',
    patterns: ['right route', 'correct path', 'route', 'path', 'way', 'direction'],
    response: () => mockBusData.onRoute ? 
      `Yes, the bus is following the designated route as expected.` : 
      `The bus has a slight deviation from the usual route, likely due to traffic or road work. It's being monitored.`
  },
  {
    name: 'greeting',
    patterns: ['hi', 'hello', 'hey', 'greetings'],
    response: () => `Hello! I'm GuardianBot, here to help you with information about your child's school bus journey. How can I assist you today?`
  },
  {
    name: 'thanks',
    patterns: ['thank you', 'thanks', 'appreciate', 'grateful'],
    response: () => `You're welcome! I'm here to help. Feel free to ask if you need any more information about the school bus journey.`
  },
  {
    name: 'fallback',
    patterns: [],
    response: () => `I'm not sure I understand that query. You can ask about your child's location, bus details, driver information, or use the quick access buttons below.`
  }
];

// Function to detect intent from text
const detectIntent = (text: string) => {
  text = text.toLowerCase();
  
  // Check for emergency intent first (high priority)
  const emergencyIntent = intents.find(intent => intent.name === 'emergency');
  if (emergencyIntent && emergencyIntent.patterns.some(pattern => text.includes(pattern))) {
    return emergencyIntent;
  }
  
  // Check all other intents
  for (const intent of intents) {
    if (intent.patterns.some(pattern => text.includes(pattern))) {
      return intent;
    }
  }
  
  // Default to fallback intent
  return intents.find(intent => intent.name === 'fallback');
};

// Quick access buttons data
const quickAccessButtons = [
  { icon: MapPin, label: 'Location', intent: 'location' },
  { icon: Clock, label: 'ETA', intent: 'eta' },
  { icon: User2, label: 'Driver', intent: 'driver_info' },
  { icon: Bus, label: 'Bus Details', intent: 'bus_number' },
  { icon: Gauge, label: 'Speed', intent: 'speed' },
  { icon: Route, label: 'Route', intent: 'route' }
];

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm GuardianBot, your assistant for real-time bus journey updates. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Generate bot response with a slight delay for realism
    setTimeout(() => {
      const intent = detectIntent(userMessage.text);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: intent.response(),
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  // Handle quick access button click
  const handleQuickAccessClick = (intentName: string) => {
    const intent = intents.find(i => i.name === intentName);
    if (!intent) return;
    
    // Generate bot response
    const botResponse: Message = {
      id: Date.now().toString(),
      text: intent.response(),
      sender: 'bot',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, botResponse]);
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 bg-[#F3F4F6]">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#111827]">Chat Assistant</h1>
            <p className="text-[#6B7280] mt-1">Get real-time updates about your child's bus journey</p>
          </div>
          <Badge variant="outline" className="mt-2 md:mt-0 bg-[#0056B6]/10 border-[#0056B6] text-[#0056B6]">
            <Bot className="mr-1 h-3 w-3" /> GuardianBot
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="md:col-span-3 bg-white/85 backdrop-blur-xl shadow-lg border border-[#E5E7EB] overflow-hidden flex flex-col h-[calc(100vh-240px)]">
            <CardHeader className="border-b bg-white/90 backdrop-blur-xl">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-[#0056B6]" />
                  GuardianBot
                </CardTitle>
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                  Online
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.sender === 'user' ? 'bg-[#0056B6] ml-2' : 'bg-[#FFC107] mr-2'
                        }`}>
                          {message.sender === 'user' ? (
                            <User className="h-4 w-4 text-white" />
                          ) : (
                            <Bot className="h-4 w-4 text-[#111827]" />
                          )}
                        </div>
                        <div className={`p-3 rounded-lg ${
                          message.sender === 'user' 
                            ? 'bg-[#0056B6] text-white rounded-tr-none' 
                            : 'bg-white border border-[#E5E7EB] text-[#111827] rounded-tl-none'
                        }`}>
                          <p className="text-sm">{message.text}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender === 'user' ? 'text-[#E5E7EB]' : 'text-[#6B7280]'
                          }`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-start max-w-[80%]">
                      <div className="w-8 h-8 rounded-full bg-[#FFC107] mr-2 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-[#111827]" />
                      </div>
                      <div className="p-3 rounded-lg bg-white border border-[#E5E7EB] text-[#111827] rounded-tl-none">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 rounded-full bg-[#0056B6] animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 rounded-full bg-[#0056B6] animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 rounded-full bg-[#0056B6] animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
            <div className="bg-white p-4 border-t border-[#E5E7EB]">
              <div className="flex">
                <Input
                  type="text"
                  placeholder="Type your message here..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 focus-visible:ring-[#0056B6]"
                />
                <Button 
                  onClick={handleSendMessage} 
                  className="ml-2 bg-[#0056B6]"
                >
                  <SendHorizonal className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-3">
                <div className="flex flex-wrap gap-2">
                  {quickAccessButtons.map((button, index) => (
                    <Button 
                      key={index} 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center text-xs border-[#E5E7EB] bg-white hover:bg-[#F3F4F6] text-[#6B7280]"
                      onClick={() => handleQuickAccessClick(button.intent)}
                    >
                      <button.icon className="h-3 w-3 mr-1 text-[#0056B6]" />
                      {button.label}
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-white/85 backdrop-blur-xl shadow-lg border border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-lg">Chat Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-[#6B7280] mb-1">About GuardianBot</h3>
                <p className="text-sm text-[#111827]">
                  GuardianBot provides real-time updates about your child's school bus journey, driver details, and more.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#6B7280] mb-1">Ask About</h3>
                <ul className="space-y-2 text-sm text-[#111827]">
                  <li className="flex items-center">
                    <MapPin className="h-3 w-3 mr-2 text-[#0056B6]" />
                    Current bus location
                  </li>
                  <li className="flex items-center">
                    <Clock className="h-3 w-3 mr-2 text-[#0056B6]" />
                    Expected arrival times
                  </li>
                  <li className="flex items-center">
                    <User2 className="h-3 w-3 mr-2 text-[#0056B6]" />
                    Driver information
                  </li>
                  <li className="flex items-center">
                    <Bus className="h-3 w-3 mr-2 text-[#0056B6]" />
                    Bus details and condition
                  </li>
                  <li className="flex items-center">
                    <AlertCircle className="h-3 w-3 mr-2 text-[#0056B6]" />
                    Emergency assistance
                  </li>
                </ul>
              </div>

              <div className="pt-2 border-t border-[#E5E7EB]">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#6B7280]">Also available on</span>
                  <div className="flex space-x-2">
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      WhatsApp
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      SMS
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Chat; 