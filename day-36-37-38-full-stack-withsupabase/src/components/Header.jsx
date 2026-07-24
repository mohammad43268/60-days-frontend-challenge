import React, { useEffect, useState, useRef } from 'react';
import { usePlannerStore } from '../store/usePlannerStore';
import { Undo, Redo, Layout, TableProperties, CalendarDays, Lightbulb, Hexagon, Download, LogOut, Home, Sun, Moon } from 'lucide-react';
import { TemplateModal } from './TemplateModal';
import { supabase } from '../lib/supabase';

export const Header = () => {
  const { undo, redo, past, future, viewMode, setViewMode, loadTemplate, setRoute, theme, toggleTheme } = usePlannerStore();
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  const templateMenuRef = useRef(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (templateMenuRef.current && !templateMenuRef.current.contains(e.target)) {
        setIsTemplateMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="absolute top-0 left-0 right-0 p-2 md:p-4 z-50 flex flex-wrap md:flex-nowrap items-start justify-between gap-2 pointer-events-none">
      
      {/* Brand */}
      <div 
        className="flex items-center shrink-0 cursor-pointer group pointer-events-auto bg-[#161618]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1),_0_20px_40px_rgba(0,0,0,0.15)] px-3 md:px-4 h-10 md:h-12 transition-transform hover:scale-105 active:scale-95"
        onClick={() => setRoute('landing')}
        title="Return to Landing Page"
      >
        <img src="/logo.png" alt="Zaforge" className="h-5 w-auto object-contain filter brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* View Switcher */}
      <div className="order-3 md:order-none w-full md:w-auto md:absolute md:left-1/2 md:-translate-x-1/2 flex items-center justify-center space-x-1 pointer-events-auto bg-[#161618]/80 backdrop-blur-xl border border-white/10 p-1 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1),_0_20px_40px_rgba(0,0,0,0.15)] shrink-0 h-10 md:h-12 mt-2 md:mt-0">
        <button 
          onClick={() => setViewMode('canvas')}
          className={`flex items-center px-1.5 md:px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${viewMode === 'canvas' ? 'bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.05)]' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
          title="Spatial Canvas"
        >
          <Layout className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline tracking-wide">Spatial Canvas</span>
        </button>
        <button 
          onClick={() => setViewMode('table')}
          className={`flex items-center px-1.5 md:px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${viewMode === 'table' ? 'bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.05)]' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
          title="SaaS Table"
        >
          <TableProperties className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline tracking-wide">SaaS Table</span>
        </button>
        <button 
          onClick={() => setViewMode('gantt')}
          className={`flex items-center px-1.5 md:px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${viewMode === 'gantt' ? 'bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.05)]' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
          title="Gantt Timeline"
        >
          <CalendarDays className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline tracking-wide">Gantt Timeline</span>
        </button>
      </div>

      {/* Tools */}
      <div className="flex items-center space-x-1 md:space-x-2 shrink-0 pointer-events-auto bg-[#161618]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1),_0_20px_40px_rgba(0,0,0,0.15)] px-2 h-10 md:h-12">
        
        <div className="h-4 md:h-6 w-px bg-white/10 hidden md:block mx-1" />

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-1.5 md:p-2 text-yellow-400/80 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-colors border border-transparent hover:border-yellow-400/20"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Install PWA */}
        {deferredPrompt && (
          <button 
            onClick={handleInstallClick}
            className="flex items-center space-x-2 bg-gradient-to-r from-orange-500/20 to-amber-500/20 hover:from-orange-500/40 hover:to-amber-500/40 border border-orange-500/30 text-orange-400 p-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-all duration-300"
            title="Install App"
          >
            <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden md:inline">Install App</span>
          </button>
        )}

        <button 
          onClick={async () => {
            await supabase.auth.signOut();
            usePlannerStore.getState().setUser(null);
            setRoute('landing');
          }}
          className="p-1.5 md:p-2 text-red-400/70 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-transparent hover:border-red-400/20"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>


        {/* Templates */}
        <div>
          <button 
            onClick={() => setIsTemplateMenuOpen(true)}
            className="flex items-center px-2 md:px-3 py-1.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30 rounded-lg text-sm font-medium transition-all hover:shadow-[0_0_15px_rgba(249,115,22,0.3)]"
            title="Templates"
          >
            <Lightbulb className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline tracking-wide">Templates</span>
          </button>
          
          <TemplateModal 
            isOpen={isTemplateMenuOpen} 
            onClose={() => setIsTemplateMenuOpen(false)} 
          />
        </div>

        <div className="h-6 w-px bg-white/10 hidden sm:block" />

        {/* Undo/Redo */}
        <div className="flex items-center space-x-0.5 md:space-x-1">
          <button 
            onClick={undo}
            disabled={past.length === 0}
            className={`p-1.5 md:p-2 rounded-lg transition-all ${past.length > 0 ? 'text-gray-400 hover:bg-white/10 hover:text-orange-400' : 'text-gray-700 cursor-not-allowed'}`}
          >
            <Undo className="w-4 h-4" />
          </button>
          <button 
            onClick={redo}
            disabled={future.length === 0}
            className={`p-1.5 md:p-2 rounded-lg transition-all ${future.length > 0 ? 'text-gray-400 hover:bg-white/10 hover:text-orange-400' : 'text-gray-700 cursor-not-allowed'}`}
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
