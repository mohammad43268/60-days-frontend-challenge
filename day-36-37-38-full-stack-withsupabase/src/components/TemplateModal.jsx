import React from 'react';
import { createPortal } from 'react-dom';
import { usePlannerStore } from '../store/usePlannerStore';
import {
  BookOpen,
  Code2,
  Calendar,
  Rocket,
  BrainCircuit,
  Cog,
  Megaphone,
  Network,
  Film,
  X,
} from 'lucide-react';

export const TemplateModal = ({ isOpen, onClose }) => {
  const { loadTemplate } = usePlannerStore();

  if (!isOpen) return null;

  const templates = [
    {
      id: 'mindmap',
      title: 'Mindmap',
      description: 'Flowing node-based idea generation.',
      icon: Network,
      colorClass: 'text-indigo-400',
      bgClass: 'bg-indigo-400/10 border-indigo-400/20',
    },
    {
      id: 'planning',
      title: 'Sprint Planning',
      description: 'Task prioritization and team sprints.',
      icon: Calendar,
      colorClass: 'text-orange-400',
      bgClass: 'bg-orange-400/10 border-orange-400/20',
    },
    {
      id: 'coding',
      title: 'Coding Architecture',
      description: 'Software mapping and system design.',
      icon: Code2,
      colorClass: 'text-emerald-400',
      bgClass: 'bg-emerald-400/10 border-emerald-400/20',
    },
    {
      id: 'product',
      title: 'Product Launch',
      description: 'Go-to-market strategy & timelines.',
      icon: Rocket,
      colorClass: 'text-blue-400',
      bgClass: 'bg-blue-400/10 border-blue-400/20',
    },
    {
      id: 'marketing',
      title: 'Marketing Campaign',
      description: 'Ads, budgets, and creative assets.',
      icon: Megaphone,
      colorClass: 'text-rose-400',
      bgClass: 'bg-rose-400/10 border-rose-400/20',
    },
    {
      id: 'storyboard',
      title: 'Storyboard',
      description: 'Visual sequence planning with images.',
      icon: Film,
      colorClass: 'text-amber-400',
      bgClass: 'bg-amber-400/10 border-amber-400/20',
    },
    {
      id: 'study',
      title: 'Study Plan',
      description: 'A curriculum timeline for learning.',
      icon: BookOpen,
      colorClass: 'text-cyan-400',
      bgClass: 'bg-cyan-400/10 border-cyan-400/20',
    },
    {
      id: 'ai',
      title: 'AI Ideation',
      description: 'Startup concepts and references.',
      icon: BrainCircuit,
      colorClass: 'text-fuchsia-400',
      bgClass: 'bg-fuchsia-400/10 border-fuchsia-400/20',
    },
    {
      id: 'engineering',
      title: 'Engineering',
      description: 'Technical specs and core modules.',
      icon: Cog,
      colorClass: 'text-gray-400',
      bgClass: 'bg-gray-400/10 border-gray-400/20',
    },
  ];

  const handleSelect = (id) => {
    loadTemplate(id);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto">
      {/* Dark Glass Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-[90vw] max-w-5xl max-h-[85vh] bg-[#161618] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-[#111113] shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-100 tracking-tight">Template Gallery</h2>
            <p className="text-sm text-gray-500 mt-1">
              Start your next spatial workspace with a powerful preset.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Grid Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#0A0A0C] custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {templates.map((tpl) => {
              const Icon = tpl.icon;
              return (
                <div
                  key={tpl.id}
                  onClick={() => handleSelect(tpl.id)}
                  className="group relative bg-[#111113] border border-white/5 rounded-2xl p-5 cursor-pointer overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:bg-[#161618] hover:border-white/10 hover:shadow-2xl"
                >
                  <div className="flex items-start gap-4">
                    {/* Minimal Icon Container */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border ${tpl.bgClass} transition-colors duration-200 shrink-0`}
                    >
                      <Icon className={`w-5 h-5 ${tpl.colorClass}`} />
                    </div>

                    <div>
                      <h3 className="text-[15px] font-bold text-gray-200 mb-1.5 transition-colors group-hover:text-white">
                        {tpl.title}
                      </h3>
                      <p className="text-[13px] text-gray-500 leading-relaxed font-medium">
                        {tpl.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
