import React, { useState, useEffect } from 'react';
import { Bus, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import '../styles/login/LoginElements.css';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const expectedUsername = '60018230067';
    const expectedPassword = 'pass@123';

    if (username === expectedUsername && password === expectedPassword) {
      toast.success('Login Successful!', {
        description: 'Redirecting to dashboard...',
        icon: <Bus className="animate-bus-roll" />,
      });
      
      // Set authentication and redirect
      localStorage.setItem("isAuthenticated", "true");
      
      // Short delay to show the success toast before redirecting
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } else {
      setIsShaking(true);
      toast.error('Invalid Credentials', {
        description: 'Please check your username and password.',
      });
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div className="login-background min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="scene-container w-full h-full absolute top-0 left-0">
        {/* Animated Sky Background Elements */}
        <div className="clouds-container">
          <div className="cloud cloud1"></div>
          <div className="cloud cloud2"></div>
          <div className="cloud cloud3"></div>
        </div>
        
        {/* City Background */}
        <div className="city-background">
          <div className="city-skyline"></div>
        </div>
        
        {/* Tree (now positioned correctly) */}
        <div className="tree" style={{ left: '3px', zIndex: 3 }}></div>
        
        {/* School Building (now positioned correctly) */}
        <div className="school-building" style={{ right: '5px', zIndex: 3 }}></div>
        
        {/* School Bus Animation */}
        <div className="school-bus" style={{ zIndex: 3 }}></div>
        
        {/* Ground with Grass (now using image) */}
        <div className="ground">
          <div className="grass-row">
            <div className="grass-patch"></div>
            <div className="grass-patch"></div>
            <div className="grass-patch"></div>
            <div className="grass-patch"></div>
            <div className="grass-patch"></div>
            <div className="grass-patch"></div>
            <div className="grass-patch"></div>
            <div className="grass-patch"></div>
          </div>
          <div className="grass-row">
            <div className="grass-patch"></div>
            <div className="grass-patch"></div>
            <div className="grass-patch"></div>
            <div className="grass-patch"></div>
            <div className="grass-patch"></div>
            <div className="grass-patch"></div>
            <div className="grass-patch"></div>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className={`relative z-10 w-full max-w-md bg-white p-8 rounded-xl shadow-lg glass-morphism ${isShaking ? 'animate-shake' : ''}`}>
        <div className="flex justify-center mb-6">
          <img 
            src="/guardiantrack.png" 
            alt="GuardianTrack Logo" 
            className="w-24 h-24 animate-pulse"
          />
        </div>
        <h1 className="text-3xl font-poppins font-bold text-guardian-primary text-center mb-4">
          GuardianTrack
        </h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="username" className="block mb-2 text-sm font-inter text-gray-600">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-guardian-primary" />
              <Input 
                id="username"
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="pl-10"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-inter text-gray-600">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-guardian-primary" />
              <Input 
                id="password"
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="pl-10 pr-10"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-guardian-primary"
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="remember" 
                className="mr-2 text-guardian-primary focus:ring-guardian-primary" 
              />
              <label htmlFor="remember" className="text-sm font-inter text-gray-600">
                Remember Me
              </label>
            </div>
            <a href="#" className="text-sm font-inter text-guardian-primary hover:underline">
              Forgot Password?
            </a>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-guardian-primary hover:bg-guardian-primary/90 text-white font-inter"
          >
            Login
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
