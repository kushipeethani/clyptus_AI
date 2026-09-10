import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050308] text-[#F8F7FF] flex overflow-hidden relative font-['Outfit',sans-serif] selection:bg-purple-500/30">
      {/* 3D Cyber Ambient Background Atmosphere */}
      <div className="fixed inset-0 cyber-grid pointer-events-none opacity-40 z-0" />
      
      {/* Dynamic ambient lighting orbs with soft neon glow */}
      <div 
        className="fixed w-[650px] h-[650px] rounded-full pointer-events-none opacity-[0.18] filter blur-[140px] -top-[200px] -right-[100px] z-0 animate-pulse-glow"
        style={{ background: 'radial-gradient(circle, #9333EA 0%, #7C3AED 40%, transparent 70%)' }} 
      />
      <div 
        className="fixed w-[700px] h-[700px] rounded-full pointer-events-none opacity-[0.14] filter blur-[160px] -bottom-[250px] -left-[150px] z-0 animate-pulse-glow"
        style={{ background: 'radial-gradient(circle, #6B21A8 0%, #3B0764 50%, transparent 75%)', animationDelay: '2s' }} 
      />
      <div 
        className="fixed w-[450px] h-[450px] rounded-full pointer-events-none opacity-[0.08] filter blur-[120px] top-1/3 left-1/2 -translate-x-1/2 z-0"
        style={{ background: 'radial-gradient(circle, #38BDF8 0%, #A855F7 60%, transparent 80%)' }} 
      />

      {/* Main Sidebar Component */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <TopHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
