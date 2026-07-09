import React, { useEffect, useState, useRef } from 'react';
import { usePlannerStore } from '../store/usePlannerStore';
import { Undo, Redo, Layout, TableProperties, CalendarDays, Lightbulb, Hexagon } from 'lucide-react';

export const Header = () => {
  const { undo, redo, past, future, viewMode, setViewMode, loadTemplate } = usePlannerStore();
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  const templateMenuRef = useRef(null);

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
    <div className="absolute top-0 left-0 right-0 h-14 bg-surface/80 backdrop-blur-md border-b border-border z-50 flex items-center justify-between px-3 md:px-6 shadow-sm">
      
      {/* Brand */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white shadow-inner">
          <Hexagon className="w-5 h-5 fill-white" />
        </div>
        <span className="font-bold text-lg text-dark tracking-tight hidden md:block">Kortex</span>
      </div>

      {/* View Switcher */}
      <div className="flex items-center space-x-1 md:space-x-2 bg-gray-100 p-1 rounded-lg">
        <button 
          onClick={() => setViewMode('canvas')}
          className={`flex items-center px-2.5 md:px-3 py-1.5 rounded-md text-sm transition-colors ${viewMode === 'canvas' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          title="Spatial Canvas"
        >
          <Layout className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">Spatial Canvas</span>
        </button>
        <button 
          onClick={() => setViewMode('table')}
          className={`flex items-center px-2.5 md:px-3 py-1.5 rounded-md text-sm transition-colors ${viewMode === 'table' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          title="SaaS Table"
        >
          <TableProperties className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">SaaS Table</span>
        </button>
        <button 
          onClick={() => setViewMode('gantt')}
          className={`flex items-center px-2.5 md:px-3 py-1.5 rounded-md text-sm transition-colors ${viewMode === 'gantt' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          title="Gantt Timeline"
        >
          <CalendarDays className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">Gantt Timeline</span>
        </button>
      </div>

      {/* Tools */}
      <div className="flex items-center space-x-2 md:space-x-4">
        


        <div className="h-4 w-px bg-gray-300 hidden md:block" />

        {/* Templates */}
        <div className="relative" ref={templateMenuRef}>
          <button 
            onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
            className="flex items-center px-2 md:px-3 py-1.5 bg-orange-100 text-orange-600 hover:bg-orange-200 rounded-lg text-sm font-medium transition-colors shadow-[inset_2px_2px_5px_rgba(255,255,255,0.5),3px_3px_6px_rgba(0,0,0,0.05)]"
            title="Templates"
          >
            <Lightbulb className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Templates</span>
          </button>
          
          {isTemplateMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50">
              <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50 border-b border-gray-100">Presets</div>
              <button onClick={() => { loadTemplate('study'); setIsTemplateMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">📚 Study Plan</button>
              <button onClick={() => { loadTemplate('coding'); setIsTemplateMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">💻 Coding Architecture</button>
              <button onClick={() => { loadTemplate('planning'); setIsTemplateMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">🗓️ Project Planning</button>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-gray-300" />

        {/* Undo/Redo */}
        <div className="flex items-center space-x-1">
          <button 
            onClick={undo}
            disabled={past.length === 0}
            className={`p-2 rounded-lg transition-colors ${past.length > 0 ? 'text-gray-600 hover:bg-gray-100 hover:text-orange-600' : 'text-gray-300 cursor-not-allowed'}`}
          >
            <Undo className="w-4 h-4" />
          </button>
          <button 
            onClick={redo}
            disabled={future.length === 0}
            className={`p-2 rounded-lg transition-colors ${future.length > 0 ? 'text-gray-600 hover:bg-gray-100 hover:text-orange-600' : 'text-gray-300 cursor-not-allowed'}`}
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
