import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { usePlannerStore } from '../store/usePlannerStore';
import {
  MousePointer2,
  Hand,
  Type,
  CheckSquare,
  Image as ImageIcon,
  Code,
  Bookmark,
  Sparkles,
  Link as LinkIcon,
  Trash2,
  Volume2,
  FileText,
  Wrench,
  X,
  Share,
  FolderOpen,
  PenTool,
  Highlighter,
  Eraser as EraserIcon,
  Save,
  Wand2,
  Zap,
} from 'lucide-react';

const MagneticButton = ({ children, wrapperClassName = '', ...props }) => {
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);

    gsap.to(el, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: 'power2.out' });
  };

  const handleMouseLeave = () => {
    if (!ref.current) return;
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
  };

  return (
    <div
      className={`relative cursor-pointer z-10 ${wrapperClassName}`}
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <button
        {...props}
        className={`hover:scale-110 active:scale-95 transition-all duration-200 ${props.className || ''}`}
      >
        {children}
      </button>
    </div>
  );
};

const tools = [
  { id: 'cursor', icon: MousePointer2, label: 'Select' },
  { id: 'pan', icon: Hand, label: 'Pan Canvas' },
  { id: 'connect', icon: LinkIcon, label: 'Connect' },
  { divider: true },
  { id: 'pen', icon: PenTool, label: 'Draw' },
  { id: 'neon', icon: Zap, label: 'Neon Pen' },
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
  const {
    activeTool,
    setActiveTool,
    selectedCardIds,
    deleteSelectedCards,
    openExportModal,
    exportWorkspace,
    importWorkspace,
    activeDrawingTool,
    setDrawingTool,
    drawingColor,
    setDrawingColor,
    drawingWidth,
    setDrawingWidth,
    smartShapesEnabled,
    toggleSmartShapes,
  } = usePlannerStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const fileInputRef = useRef(null);
  const toolsContainerRef = useRef(null);
  const pillRef = useRef(null);

  useEffect(() => {
    if (!toolsContainerRef.current || !pillRef.current) return;
    // Delay slightly to let React render the DOM nodes fully
    setTimeout(() => {
      const activeBtn = toolsContainerRef.current.querySelector('.active-tool');
      if (activeBtn) {
        gsap.to(pillRef.current, {
          x: activeBtn.offsetLeft,
          y: activeBtn.offsetTop,
          width: activeBtn.offsetWidth,
          height: activeBtn.offsetHeight,
          duration: 0.4,
          ease: 'back.out(1.2)',
        });
      }
    }, 50);
  }, [activeTool, activeDrawingTool, mobileOpen]);

  const colors = ['#FF6B00', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#1F2937', '#FFFFFF'];
  const widths = [2, 4, 8, 12];

  const handleToolClick = (toolId) => {
    if (['pen', 'highlighter', 'eraser', 'neon'].includes(toolId)) {
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
      {/* Drawing Sub-Toolbar */}
      {activeTool === 'draw' && activeDrawingTool !== 'eraser' && (
        <div
          className={`fixed bottom-[110px] md:bottom-[90px] left-1/2 -translate-x-1/2 flex items-center gap-4 px-4 py-2 rounded-2xl shadow-xl border z-50 transition-colors ${activeDrawingTool === 'neon' ? 'bg-[#161618]/90 border-cyan-900/50 backdrop-blur-xl' : 'bg-white/90 border-gray-200 backdrop-blur-md'}`}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSmartShapes}
              title={`Smart Shapes: ${smartShapesEnabled ? 'ON' : 'OFF'}`}
              className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${smartShapesEnabled ? (activeDrawingTool === 'neon' ? 'bg-cyan-900/50 text-cyan-400' : 'bg-orange-100 text-orange-500') : 'text-gray-400 hover:bg-white/10'}`}
            >
              <Wand2 size={18} />
            </button>
            <div
              className={`w-px h-6 ${activeDrawingTool === 'neon' ? 'bg-gray-700' : 'bg-gray-200'}`}
            ></div>
            {(activeDrawingTool === 'neon'
              ? ['#FF6B00', '#00F0FF', '#FF007F', '#39FF14', '#F600FF', '#FFFF00', '#FFFFFF']
              : colors
            ).map((color) => (
              <button
                key={color}
                onClick={() => setDrawingColor(color)}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${drawingColor === color ? 'scale-125 border-gray-400' : 'border-transparent hover:scale-110'} ${activeDrawingTool === 'neon' && drawingColor === color ? 'shadow-[0_0_10px_currentColor]' : ''}`}
                style={{ backgroundColor: color, color: color }}
              />
            ))}
          </div>
          <div
            className={`w-px h-6 ${activeDrawingTool === 'neon' ? 'bg-gray-700' : 'bg-gray-200'}`}
          ></div>
          <div className="flex items-center gap-2">
            {widths.map((w) => (
              <button
                key={w}
                onClick={() => setDrawingWidth(w)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${drawingWidth === w ? (activeDrawingTool === 'neon' ? 'bg-white/10' : 'bg-gray-200') : 'hover:bg-white/5'}`}
              >
                <div
                  className={`rounded-full ${activeDrawingTool === 'neon' ? 'bg-gray-200' : 'bg-gray-800'}`}
                  style={{ width: w, height: w }}
                ></div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar Container */}
      <div
        ref={toolsContainerRef}
        className="fixed left-1/2 -translate-x-1/2 bottom-4 z-[100] bg-[#161618]/80 backdrop-blur-xl saturate-150 shadow-[0_4px_20px_rgba(0,0,0,0.1),_0_20px_40px_rgba(0,0,0,0.15)] border border-white/10 rounded-2xl px-2 md:px-4 py-2 flex w-max max-w-[95vw] justify-center items-center gap-1 md:gap-2 relative overflow-x-auto custom-scrollbar"
      >
        {/* Sliding Pill */}
        <div
          ref={pillRef}
          className="absolute left-0 top-0 bg-orange-500 rounded-full z-0 shadow-lg shadow-orange-500/20"
        />

        {tools.map((tool, idx) => {
          if (tool.divider) {
            return (
              <div
                key={`div-${idx}`}
                className="hidden md:block w-px h-6 bg-white/10 mx-1 z-10"
              ></div>
            );
          }
          const Icon = tool.icon;
          const isActive =
            activeTool === tool.id || (activeTool === 'draw' && activeDrawingTool === tool.id);
          const isAI = tool.id === 'ai';
          const isNeon = tool.id === 'neon';

          return (
            <MagneticButton
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              title={tool.label}
              wrapperClassName={isActive ? 'active-tool' : ''}
              className={`p-2 rounded-full flex items-center justify-center ${
                isActive && isNeon
                  ? 'text-white'
                  : isActive
                    ? 'text-white'
                    : isAI
                      ? 'text-orange-400 hover:text-orange-300'
                      : isNeon
                        ? 'text-cyan-400 hover:text-cyan-300'
                        : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon size={18} />
            </MagneticButton>
          );
        })}

        <div className="hidden md:block w-px h-6 bg-white/10 mx-1 z-10"></div>

        <MagneticButton
          onClick={handleDelete}
          title="Delete Selected"
          disabled={selectedCardIds.length === 0}
          className={`p-2 rounded-full flex items-center justify-center ${
            selectedCardIds.length > 0
              ? 'text-red-400 hover:text-red-300'
              : 'text-gray-600 cursor-not-allowed'
          }`}
        >
          <Trash2 size={18} />
        </MagneticButton>

        <div className="hidden md:block w-px h-6 bg-white/10 mx-1 z-10"></div>

        <MagneticButton
          onClick={exportWorkspace}
          title="Export .zaforge"
          className="p-2 rounded-full flex items-center justify-center text-purple-400 hover:text-purple-300"
        >
          <Save size={18} />
        </MagneticButton>

        <MagneticButton
          onClick={openExportModal}
          title="Share/Export Image"
          className="p-2 rounded-full flex items-center justify-center text-blue-400 hover:text-blue-300"
        >
          <Share size={18} />
        </MagneticButton>

        <MagneticButton
          onClick={() => fileInputRef.current?.click()}
          title="Import .zaforge"
          className="p-2 rounded-full flex items-center justify-center text-green-400 hover:text-green-300"
        >
          <FolderOpen size={18} />
        </MagneticButton>

        <input
          type="file"
          accept=".zaforge,.spatial,.json"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImport}
        />
      </div>
    </>
  );
};
