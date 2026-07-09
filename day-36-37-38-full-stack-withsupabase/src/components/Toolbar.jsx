import React, { useState, useRef } from 'react';
import { usePlannerStore } from '../store/usePlannerStore';
import { MousePointer2, Hand, Type, CheckSquare, Image as ImageIcon, Code, Bookmark, Sparkles, Link as LinkIcon, Trash2, Volume2, FileText, Wrench, X, Share, FolderOpen, PenTool, Highlighter, Eraser as EraserIcon } from 'lucide-react';

const tools = [
  { id: 'cursor', icon: MousePointer2, label: 'Select' },
  { id: 'pan', icon: Hand, label: 'Pan Canvas' },
  { id: 'connect', icon: LinkIcon, label: 'Connect' },
  { divider: true },
  { id: 'pen', icon: PenTool, label: 'Draw' },
  { id: 'highlighter', icon: Highlighter, label: 'Highlight' },
  { id: 'eraser', icon: EraserIcon, label: 'Erase' },
  { divider: true },
  { id: 'note', icon: Type, label: 'Add Note' },
  { id: 'task', icon: CheckSquare, label: 'Add Task' },
  { id: 'image', icon: ImageIcon, label: 'Add Media' },
  { id: 'code', icon: Code, label: 'Add Code Block' },
  { id: 'bookmark', icon: Bookmark, label: 'Add Bookmark' },
  { id: 'audio', icon: Volume2, label: 'Add Audio' },
  { id: 'pdf', icon: FileText, label: 'Add PDF' },
  { id: 'ai', icon: Sparkles, label: 'Add AI Node' },
];

export const Toolbar = () => {
  const { activeTool, setActiveTool, selectedCardIds, deleteSelectedCards, openExportModal, importWorkspace, activeDrawingTool, setDrawingTool, drawingColor, setDrawingColor, drawingWidth, setDrawingWidth } = usePlannerStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const fileInputRef = useRef(null);

  const colors = ['#FF6B00', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#1F2937', '#FFFFFF'];
  const widths = [2, 4, 8, 12];

  const handleToolClick = (toolId) => {
    if (['pen', 'highlighter', 'eraser'].includes(toolId)) {
      setDrawingTool(toolId);
      setActiveTool('draw');
    } else {
      setDrawingTool(null);
      setActiveTool(toolId);
    }
    if (window.innerWidth < 768) {
      setMobileOpen(false);
    }
  };

  const handleDelete = () => {
    if (selectedCardIds.length > 0) {
      deleteSelectedCards();
      setActiveTool('cursor');
      if (window.innerWidth < 768) setMobileOpen(false);
    }
  };


  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        importWorkspace(event.target.result);
      };
      reader.readAsText(file);
    }
    // reset input so same file can be selected again
    e.target.value = null;
  };

  return (
    <>
      {/* Mobile Toggle FAB */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-14 h-14 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:bg-orange-600 transition-colors"
        >
          {mobileOpen ? <X size={24} /> : <Wrench size={24} />}
        </button>
      </div>

      {/* Drawing Sub-Toolbar */}
      {activeTool === 'draw' && activeDrawingTool !== 'eraser' && (
        <div className="fixed bottom-[110px] md:bottom-[90px] left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-gray-200 z-50">
          <div className="flex items-center gap-2">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => setDrawingColor(color)}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${drawingColor === color ? 'scale-125 border-gray-400' : 'border-transparent hover:scale-110'}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="w-px h-6 bg-gray-200"></div>
          <div className="flex items-center gap-2">
            {widths.map(w => (
              <button
                key={w}
                onClick={() => setDrawingWidth(w)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${drawingWidth === w ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              >
                <div className="bg-gray-800 rounded-full" style={{ width: w, height: w }}></div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar Container */}
      <div className={`fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 md:translate-x-[-50%] flex-wrap justify-center md:flex-nowrap items-center gap-1.5 md:gap-1.5 bg-white/90 backdrop-blur-md p-3 md:p-2 rounded-2xl md:rounded-2xl shadow-2xl md:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 z-50 transition-all ${mobileOpen ? 'flex w-[90vw] sm:w-[80vw]' : 'hidden md:flex md:w-auto'}`}>
        {tools.map((tool, idx) => {
          if (tool.divider) {
            return <div key={`div-${idx}`} className="hidden md:block w-px h-8 bg-gray-200 mx-2"></div>;
          }
          const Icon = tool.icon;
          const isActive = activeTool === tool.id || (activeTool === 'draw' && activeDrawingTool === tool.id);
          
          // Highlight AI button slightly differently
          const isAI = tool.id === 'ai';
          
          return (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              title={tool.label}
              className={`p-3 md:p-2.5 rounded-xl transition-all duration-200 flex-grow md:flex-grow-0 flex items-center justify-center ${
                isActive 
                  ? (isAI ? 'bg-orange-100 text-orange-600 border border-orange-200 shadow-sm' : 'bg-orange-500 text-white shadow-sm border border-orange-600') 
                  : (isAI ? 'text-orange-500 hover:bg-orange-50 bg-white/50' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 border border-transparent bg-white/50 md:bg-transparent')
              }`}
            >
              <Icon size={18} />
            </button>
          );
        })}
        
        <div className="hidden md:block w-px h-8 bg-gray-200 mx-2"></div>
        
        <button
          onClick={handleDelete}
          title="Delete Selected"
          disabled={selectedCardIds.length === 0}
          className={`p-3 md:p-2.5 rounded-xl transition-all duration-200 flex-grow md:flex-grow-0 flex items-center justify-center ${
            selectedCardIds.length > 0 
              ? 'text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 bg-white/50 md:bg-transparent' 
              : 'text-gray-300 cursor-not-allowed border border-transparent bg-white/50 md:bg-transparent'
          }`}
        >
          <Trash2 size={18} />
        </button>

        <div className="hidden md:block w-px h-8 bg-gray-200 mx-2"></div>

        <button
          onClick={openExportModal}
          title="Export / Share"
          className="p-3 md:p-2.5 rounded-xl transition-all duration-200 flex-grow md:flex-grow-0 flex items-center justify-center text-blue-500 hover:bg-blue-50 border border-transparent hover:border-blue-200 bg-white/50 md:bg-transparent"
        >
          <Share size={18} />
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          title="Open Workspace"
          className="p-3 md:p-2.5 rounded-xl transition-all duration-200 flex-grow md:flex-grow-0 flex items-center justify-center text-green-500 hover:bg-green-50 border border-transparent hover:border-green-200 bg-white/50 md:bg-transparent"
        >
          <FolderOpen size={18} />
        </button>
        
        <input 
          type="file" 
          accept=".spatial,.json" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleImport} 
        />
      </div>
    </>
  );
};
