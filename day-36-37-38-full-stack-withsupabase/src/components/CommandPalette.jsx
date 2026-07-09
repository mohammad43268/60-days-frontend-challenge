import React, { useState, useEffect, useRef } from 'react';
import { usePlannerStore } from '../store/usePlannerStore';
import { Search, Layout, TableProperties, CalendarDays, Lightbulb, FileText, X } from 'lucide-react';

export const CommandPalette = () => {
  const { cards, setViewMode, loadTemplate, updateViewport, setCards } = usePlannerStore();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Actions
  const actions = [
    { id: 'view-canvas', label: 'Switch to Spatial Canvas', icon: Layout, action: () => setViewMode('canvas') },
    { id: 'view-table', label: 'Switch to SaaS Table', icon: TableProperties, action: () => setViewMode('table') },
    { id: 'view-gantt', label: 'Switch to Gantt Timeline', icon: CalendarDays, action: () => setViewMode('gantt') },
    { id: 'template-study', label: 'Load Study Template', icon: Lightbulb, action: () => loadTemplate('study') },
    { id: 'template-coding', label: 'Load Coding Template', icon: Lightbulb, action: () => loadTemplate('coding') },
    { id: 'template-planning', label: 'Load Planning Template', icon: Lightbulb, action: () => loadTemplate('planning') },
    { id: 'clear-canvas', label: 'Clear All Nodes', icon: X, action: () => setCards([]) },
  ];

  // Filter Cards
  const matchedCards = cards.filter(card => {
    if (!query) return false;
    const title = card.metadata?.title || '';
    const content = typeof card.content === 'string' ? card.content : '';
    const q = query.toLowerCase();
    return title.toLowerCase().includes(q) || content.toLowerCase().includes(q);
  }).map(card => ({
    id: `card-${card.id}`,
    label: card.metadata?.title || `Node: ${card.type.toUpperCase()}`,
    type: 'Card',
    icon: FileText,
    action: () => {
      setViewMode('canvas');
      updateViewport({ x: window.innerWidth / 2 - card.x, y: window.innerHeight / 2 - card.y, scale: 1 });
    }
  }));

  const matchedActions = actions.filter(a => !query || a.label.toLowerCase().includes(query.toLowerCase())).map(a => ({ ...a, type: 'Command' }));

  const results = [...matchedCards, ...matchedActions];

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      results[selectedIndex].action();
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-gray-900/40 backdrop-blur-sm flex items-start justify-center pt-[15vh]">
      <div 
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-gray-100">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-gray-800 text-lg placeholder-gray-400"
            placeholder="Search nodes, run commands... (Ctrl+K to close)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">ESC</div>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">No results found for "{query}"</div>
          ) : (
            <div className="py-2">
              {results.map((res, idx) => {
                const Icon = res.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={res.id}
                    onClick={() => { res.action(); setIsOpen(false); }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center px-4 py-3 text-left transition-colors ${isSelected ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${isSelected ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className={`text-sm font-medium truncate ${isSelected ? 'text-orange-700' : 'text-gray-700'}`}>{res.label}</div>
                      <div className={`text-xs truncate mt-0.5 ${isSelected ? 'text-orange-400' : 'text-gray-400'}`}>{res.type}</div>
                    </div>
                    {isSelected && <div className="text-xs text-orange-500 font-medium">↵ to select</div>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className="absolute inset-0 -z-10" onClick={() => setIsOpen(false)} />
    </div>
  );
};
