import React, { useEffect, useState, useRef } from 'react';
import { usePlannerStore } from '../store/usePlannerStore';
import { Undo, Redo, Layout, TableProperties, CalendarDays, Lightbulb, Hexagon, Download } from 'lucide-react';
import { TemplateModal } from './TemplateModal';

export const Header = () => {
  const { undo, redo, past, future, viewMode, setViewMode, loadTemplate } = usePlannerStore();
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
    <div className="absolute top-0 left-0 right-0 h-16 bg-black/40 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-between px-3 md:px-6 shadow-2xl">
      
      {/* Brand */}
      <div className="flex items-center">
        <img src="/logo.png" alt="Zaforge" className="h-6 w-auto object-contain filter brightness-0 invert opacity-90 hover:opacity-100 transition-opacity cursor-pointer" />
      </div>

      {/* View Switcher */}
      {/* View Switcher */}
      <div className="flex items-center space-x-1 md:space-x-1 bg-black/60 border border-white/10 p-1 rounded-xl shadow-inner">
        <button 
          onClick={() => setViewMode('canvas')}
          className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${viewMode === 'canvas' ? 'bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.05)]' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
          title="Spatial Canvas"
        >
          <Layout className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline tracking-wide">Spatial Canvas</span>
        </button>
        <button 
          onClick={() => setViewMode('table')}
          className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${viewMode === 'table' ? 'bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.05)]' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
          title="SaaS Table"
        >
          <TableProperties className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline tracking-wide">SaaS Table</span>
        </button>
        <button 
          onClick={() => setViewMode('gantt')}
          className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${viewMode === 'gantt' ? 'bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.05)]' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
          title="Gantt Timeline"
        >
          <CalendarDays className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline tracking-wide">Gantt Timeline</span>
        </button>
      </div>

      {/* Tools */}
      <div className="flex items-center space-x-2 md:space-x-4">
        


        <div className="h-6 w-px bg-white/10 hidden md:block" />

        {/* Install PWA */}
        {deferredPrompt && (
          <button 
            onClick={handleInstallClick}
            className="flex items-center px-3 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 rounded-lg text-sm font-medium transition-all shadow-sm"
            title="Install App"
          >
            <Download className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline tracking-wide">Install Zaforge</span>
          </button>
        )}

        {/* Templates */}
        <div>
          <button 
            onClick={() => setIsTemplateMenuOpen(true)}
            className="flex items-center px-3 py-1.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30 rounded-lg text-sm font-medium transition-all hover:shadow-[0_0_15px_rgba(249,115,22,0.3)]"
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

        <div className="h-6 w-px bg-white/10" />

        {/* Undo/Redo */}
        <div className="flex items-center space-x-1">
          <button 
            onClick={undo}
            disabled={past.length === 0}
            className={`p-2 rounded-lg transition-all ${past.length > 0 ? 'text-gray-400 hover:bg-white/10 hover:text-orange-400' : 'text-gray-700 cursor-not-allowed'}`}
          >
            <Undo className="w-4 h-4" />
          </button>
          <button 
            onClick={redo}
            disabled={future.length === 0}
            className={`p-2 rounded-lg transition-all ${future.length > 0 ? 'text-gray-400 hover:bg-white/10 hover:text-orange-400' : 'text-gray-700 cursor-not-allowed'}`}
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
