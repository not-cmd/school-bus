import React, { useState } from 'react';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from '@/components/ui/navigation-menu';
import { Bell, Bus, Calendar, Home, Map, MessageSquare, Settings, Menu, X, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Footer from './Footer';


type DashboardLayoutProps = {
  children: React.ReactNode;
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const handleLogout = () => {
    toast.success('Logging out...', {
      description: 'You will be redirected to login page.',
    });
    
    // Short delay to show the toast before redirecting
    setTimeout(() => {
      localStorage.setItem("isAuthenticated", "false");
      window.location.href = "/login";
    }, 1000);
  };
  
  const menuItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Bus, label: 'Live Feed', href: '/live-feed' },
    { icon: Map, label: 'GPS Tracking', href: '/gps' },
    { icon: Calendar, label: 'Attendance', href: '/attendance' },
    { icon: MessageSquare, label: 'Chat', href: '/chat' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];
  
  return (
    <div className="flex min-h-screen bg-[#F3F4F6] flex-col">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside 
          className={cn(
            "fixed inset-y-0 left-0 z-20 flex flex-col transition-all duration-300 bg-white shadow-lg overflow-y-auto",
            isSidebarOpen ? "w-64" : "w-16"
          )}
        >
          <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB]">
            <div className={cn("flex items-center gap-2", !isSidebarOpen && "hidden")}>
              <img 
                src="/guardiantrack.png" 
                alt="GuardianTrack Logo" 
                className="w-8 h-8" 
              />
              <span className="text-lg font-bold text-[#0056B6]">GuardianTrack</span>
            </div>
            {!isSidebarOpen && (
              <img 
                src="/guardiantrack.png" 
                alt="GuardianTrack Logo" 
                className="w-8 h-8 mx-auto" 
              />
            )}
            <button 
              onClick={toggleSidebar} 
              className="p-1 rounded-full hover:bg-[#F3F4F6]"
            >
              {isSidebarOpen ? <X size={20} className="text-[#6B7280]" /> : <Menu size={20} className="text-[#6B7280]" />}
            </button>
          </div>
          
          <NavigationMenu orientation="vertical" className="w-full">
            <NavigationMenuList className="flex flex-col items-start w-full py-2 space-y-1">
              {menuItems.map((item) => (
                <NavigationMenuItem key={item.label} className="w-full">
                  <Link to={item.href} className="w-full">
                    <div className={cn(
                      "flex items-center px-4 py-2 cursor-pointer rounded-md hover:bg-[#F3F4F6]",
                      "hover:text-[#0056B6] font-inter transition-all duration-200",
                      window.location.pathname === item.href && "bg-[#0056B6]/10 text-[#0056B6] font-medium"
                    )}>
                      <item.icon size={20} className={window.location.pathname === item.href ? "text-[#0056B6]" : "text-[#6B7280]"} />
                      {isSidebarOpen && <span className={cn("ml-3", window.location.pathname === item.href ? "text-[#0056B6]" : "text-[#6B7280]")}>{item.label}</span>}
                    </div>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Logout Button at the bottom */}
          <div className="mt-auto border-t border-[#E5E7EB] p-4">
            <button 
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center px-4 py-2 rounded-md text-[#EF4444] hover:bg-[#EF4444]/10",
                "transition-all duration-200"
              )}
            >
              <LogOut size={20} />
              {isSidebarOpen && <span className="ml-3 font-medium">Logout</span>}
            </button>
          </div>
        </aside>
        
        {/* Main Content */}
        <div className={cn(
          "flex-1 transition-all duration-300",
          isSidebarOpen ? "ml-64" : "ml-16"
        )}>
          {/* Top Navigation Bar */}
          <header className="sticky top-0 z-10 bg-white shadow-sm border-b border-[#E5E7EB]">
            <div className="flex items-center justify-between px-4 py-2">
              <h2 className="text-xl font-semibold font-poppins text-[#111827]">Dashboard</h2>
              <div className="flex items-center space-x-4">
                <button className="relative p-2 rounded-full hover:bg-[#F3F4F6]">
                  <Bell size={20} className="text-[#6B7280]" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full"></span>
                </button>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-[#0056B6] rounded-full flex items-center justify-center text-white font-medium">
                    D
                  </div>
                  <span className="hidden md:block font-inter text-[#6B7280]">Divyesh's Parent</span>
                </div>
              </div>
            </div>
          </header>
          
          {/* Page Content */}
          <main className="px-4 py-6 mb-auto">
            {children}
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
