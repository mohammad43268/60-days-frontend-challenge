import React, { useState, useEffect, useLayoutEffect, useRef, memo } from 'react';
import gsap from 'gsap';
import { usePlannerStore } from '../store/usePlannerStore';
import {
  Trash2,
  GripHorizontal,
  Settings,
  MoreHorizontal,
  Copy,
  Check,
  Link2,
  ExternalLink,
  ImagePlus,
  FileText,
  Code,
  Maximize2,
  Minimize2,
  Paperclip,
  DollarSign,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Play,
  UploadCloud,
  Link as LinkIcon,
  Volume2,
  Bold,
  Italic,
  Underline,
  Palette,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from 'lucide-react';

let globalAppLoaded = false;
setTimeout(() => {
  globalAppLoaded = true;
}, 1000);

/**
 * @file Card.jsx
 * @description Represents an individual polymorphic node on the canvas.
 * This component is heavily memoized and handles its own internal rich-text editing,
 * file uploading, and GSAP physics rendering.
 * 
 * @todo Consider extracting inner store subscriptions (cards, connections) into shallow 
 * selectors to optimize re-renders when dragging 100+ nodes.
 */
export const Card = memo(({ card }) => {
  const {
    updateCardContent,
    updateCardMetadata,
    selectedCardIds,
    toggleCardSelection,
    clearSelection,
    activeTool,
    updateCardSize,
    connections,
    cards,
    toggleCardCollapse,
    activeConnectionStart,
  } = usePlannerStore();

  const isSelected = selectedCardIds.includes(card.id);
  const showPorts = activeTool === 'connect' || isSelected;
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const contentRef = useRef(null);

  // Safely update innerHTML without stealing focus
  useEffect(() => {
    if (contentRef.current && document.activeElement !== contentRef.current) {
      if (contentRef.current.innerHTML !== (card.content || '')) {
        contentRef.current.innerHTML = card.content || '';
      }
    }
  }, [card.content]);

  // AI Simulation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiText, setAiText] = useState(card.content || '');

  // Dynamic Google Font Injection
  useEffect(() => {
    const font = card.metadata?.fontFamily;
    if (font && font !== 'sans' && font !== 'serif' && font !== 'mono') {
      const linkId = `google-font-${font.replace(/\s+/g, '-')}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/\s+/g, '+')}:wght@400;500;600;700&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
    }
  }, [card.metadata?.fontFamily]);

  const outgoingConnections = connections.filter((c) => c.source === card.id);
  const hasChildren = outgoingConnections.length > 0;

  useLayoutEffect(() => {
    if (globalAppLoaded) {
      const incomingConn = connections.find((c) => c.target === card.id);
      if (incomingConn) {
        const parentCard = cards.find((c) => c.id === incomingConn.source);
        if (parentCard) {
          const el = document.getElementById(card.id);
          if (el) {
            gsap.fromTo(
              el,
              {
                opacity: 0,
              },
              {
                opacity: 1,
                duration: 0.5,
                ease: 'power2.out',
                clearProps: 'opacity',
              }
            );
          }
        }
      }
    }
  }, []);

  const handlePointerDown = (e) => {
    if (activeTool === 'cursor') {
      e.stopPropagation();
      const isSelectedNow = selectedCardIds.includes(card.id);

      // If we shift-click, toggle selection
      if (e.shiftKey) {
        toggleCardSelection(card.id, true);
      } else {
        // Normal click. If it's already selected, don't clear (might be dragging group).
        // GSAP will handle dragging. If we just click without dragging, maybe it stays selected.
        // Actually, if we click an unselected card, clear and select it.
        if (!isSelectedNow) {
          clearSelection();
          toggleCardSelection(card.id, false);
        }
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateCardContent(card.id, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResizePointerDown = (e) => {
    if (activeTool === 'pan') return;

    e.stopPropagation();
    e.preventDefault();

    const isSelectedNow = selectedCardIds.includes(card.id);
    if (!isSelectedNow) {
      clearSelection();
      toggleCardSelection(card.id, false);
    }

    const startX = e.clientX;
    const startY = e.clientY;
    const node = document.getElementById(card.id);
    if (!node) return;

    const startWidth = parseFloat(node.style.width) || node.offsetWidth || 250;
    const startHeight = parseFloat(node.style.height) || node.offsetHeight || 200;

    const onPointerMove = (moveEvent) => {
      const currentScale = usePlannerStore.getState().viewport.scale || 1;
      const dx = (moveEvent.clientX - startX) / currentScale;
      const dy = (moveEvent.clientY - startY) / currentScale;

      const newWidth = Math.max(250, startWidth + dx);
      const newHeight = Math.max(150, startHeight + dy);

      node.style.width = `${newWidth}px`;
      node.style.height = `${newHeight}px`;
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      const newWidth = parseFloat(node.style.width);
      const newHeight = parseFloat(node.style.height);
      updateCardSize(card.id, newWidth, newHeight);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const updateMeta = (key, val) => {
    updateCardMetadata(card.id, { [key]: val });
  };

  const renderFormattingToolbar = () => {
    if (!isSelected) return null;
    if (card.type !== 'note' && card.type !== 'text') return null;
    const fontFamily = card.metadata?.fontFamily || 'sans';
    const align = card.metadata?.align || 'text-left';
    const fontSize = card.metadata?.fontSize || 14;
    const fontColor = card.metadata?.fontColor || '#FAFAFA'; // off-white default

    const fonts = [
      'sans',
      'serif',
      'mono',
      'Roboto',
      'Inter',
      'Playfair Display',
      'Fira Code',
      'Pacifico',
      'Lato',
      'Montserrat',
      'Oswald',
      'Raleway',
      'Ubuntu',
      'Dancing Script',
      'Caveat',
      'Lobster',
    ];

    return (
      <div
        className="absolute -top-12 left-0 h-10 bg-[#2A2A35]/90 backdrop-blur-md rounded-lg shadow-xl border border-white/10 flex items-center px-2 gap-2 z-50 pointer-events-auto"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Custom Font Picker */}
        <div className="relative">
          <button
            onClick={() => setShowFontPicker(!showFontPicker)}
            className="flex items-center justify-between bg-transparent text-xs text-gray-300 hover:bg-white/5 hover:text-white px-2 py-1 rounded w-32 outline-none transition-colors"
          >
            <span className="truncate">
              {fontFamily === 'sans'
                ? 'Sans-Serif'
                : fontFamily === 'serif'
                  ? 'Serif'
                  : fontFamily === 'mono'
                    ? 'Monospace'
                    : fontFamily}
            </span>
            <svg
              className="w-3 h-3 ml-1 text-gray-500 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showFontPicker && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-[#161618] border border-white/10 rounded-lg shadow-2xl py-1 max-h-64 overflow-y-auto custom-scrollbar z-50">
              {fonts.map((f) => {
                const displayName =
                  f === 'sans'
                    ? 'Sans-Serif'
                    : f === 'serif'
                      ? 'Serif'
                      : f === 'mono'
                        ? 'Monospace'
                        : f;
                const style =
                  f === 'sans' || f === 'serif' || f === 'mono'
                    ? {}
                    : { fontFamily: `"${f}", sans-serif` };
                const className =
                  f === 'sans'
                    ? 'font-sans'
                    : f === 'serif'
                      ? 'font-serif'
                      : f === 'mono'
                        ? 'font-mono'
                        : '';
                return (
                  <button
                    key={f}
                    onClick={() => {
                      updateMeta('fontFamily', f);
                      setShowFontPicker(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${fontFamily === f ? 'bg-orange-500/20 text-orange-400 font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-orange-300'} ${className}`}
                    style={style}
                  >
                    {displayName}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-gray-700 mx-1"></div>

        {/* Font Size */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => updateMeta('fontSize', Math.max(10, fontSize - 2))}
            className="text-gray-500 hover:text-gray-200 px-1 font-bold transition-colors"
          >
            -
          </button>
          <span className="text-xs text-gray-200 w-4 text-center">{fontSize}</span>
          <button
            onClick={() => updateMeta('fontSize', Math.min(200, fontSize + 2))}
            className="text-gray-500 hover:text-gray-200 px-1 font-bold transition-colors"
          >
            +
          </button>
        </div>

        <div className="w-px h-4 bg-gray-700 mx-1"></div>

        {/* Color Picker */}
        <div className="flex items-center">
          <input
            type="color"
            value={fontColor}
            onChange={(e) => updateMeta('fontColor', e.target.value)}
            className="w-5 h-5 rounded cursor-pointer border-none bg-transparent p-0 outline-none overflow-hidden hover:scale-110 transition-transform"
            title="Font Color"
          />
        </div>

        <div className="w-px h-4 bg-gray-700 mx-1"></div>

        {/* Alignment */}
        <button
          onClick={() => updateMeta('align', 'text-left')}
          className={`p-1.5 rounded transition-colors ${align === 'text-left' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => updateMeta('align', 'text-center')}
          className={`p-1.5 rounded transition-colors ${align === 'text-center' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => updateMeta('align', 'text-right')}
          className={`p-1.5 rounded transition-colors ${align === 'text-right' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-gray-700 mx-1"></div>

        {/* Rich Text Format */}
        <button
          onClick={(e) => {
            e.preventDefault();
            document.execCommand('bold', false, null);
          }}
          className="p-1.5 rounded transition-colors text-gray-500 hover:text-white hover:bg-white/5"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            document.execCommand('italic', false, null);
          }}
          className="p-1.5 rounded transition-colors text-gray-500 hover:text-white hover:bg-white/5"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            document.execCommand('underline', false, null);
          }}
          className="p-1.5 rounded transition-colors text-gray-500 hover:text-white hover:bg-white/5"
        >
          <Underline className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const renderFooter = (isMedia = false) => {
    const meta = card.metadata || {};
    if (!meta.assignee && !meta.budget && !meta.files && !meta.comment) return null;

    return (
      <div
        className={`mt-auto pt-3 flex items-center justify-between text-xs z-20 pointer-events-auto ${isMedia ? 'px-4 pb-3 bg-black/60 backdrop-blur-md text-gray-300 border-t border-white/10' : 'border-t border-gray-100 text-gray-500'}`}
      >
        {meta.assignee && (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              {meta.assignee.charAt(0)}
            </div>
            <span>{meta.assignee}</span>
          </div>
        )}
        <div className="flex items-center gap-3 ml-auto">
          {meta.comment && (
            <div
              className="flex items-center gap-1 text-orange-500 font-medium"
              title={meta.comment}
            >
              <MessageSquare className="w-3.5 h-3.5 fill-orange-100" />
            </div>
          )}
          {meta.files > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip className="w-3.5 h-3.5" /> {meta.files}
            </div>
          )}
          {meta.budget > 0 && (
            <div className="flex items-center gap-1 text-green-600 font-medium">
              <DollarSign className="w-3.5 h-3.5" /> {meta.budget}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    const fontFamily = card.metadata?.fontFamily || 'sans';
    const fontSize = card.metadata?.fontSize || 14;
    const fontColor = card.metadata?.fontColor || '#FAFAFA';
    const alignClass = card.metadata?.align || 'text-left';

    // Convert named fonts to valid CSS classes or inline styles
    const fontStyle =
      fontFamily === 'sans' || fontFamily === 'serif' || fontFamily === 'mono'
        ? {}
        : { fontFamily: `"${fontFamily}", sans-serif` };

    const fontClass =
      fontFamily === 'sans'
        ? 'font-sans'
        : fontFamily === 'serif'
          ? 'font-serif'
          : fontFamily === 'mono'
            ? 'font-mono'
            : '';

    switch (card.type) {
      case 'note':
      case 'text':
        return (
          <div className="relative w-full h-full flex flex-col group/text">
            <div
              ref={contentRef}
              className={`w-full h-full overflow-auto bg-transparent outline-none ${fontClass} ${alignClass} p-1 custom-scrollbar leading-relaxed cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-gray-600 empty:before:pointer-events-none empty:before:block empty:before:h-full`}
              style={{
                ...fontStyle,
                fontSize: `${fontSize}px`,
                color: fontColor,
                userSelect: isEditing ? 'text' : 'none',
              }}
              contentEditable={isEditing}
              suppressContentEditableWarning={true}
              data-placeholder="Double-click to start typing..."
              onBlur={(e) => {
                setIsEditing(false);
                updateCardContent(card.id, e.target.innerHTML);
              }}
              onPointerDown={(e) => {
                if (isEditing) e.stopPropagation();
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (!isSelected) {
                  clearSelection();
                  toggleCardSelection(card.id, false);
                }
                setIsEditing(true);
                setTimeout(() => {
                  if (contentRef.current) {
                    contentRef.current.focus();
                    // Place cursor at the end if there's content
                    if (contentRef.current.innerHTML) {
                      const range = document.createRange();
                      range.selectNodeContents(contentRef.current);
                      range.collapse(false);
                      const sel = window.getSelection();
                      sel.removeAllRanges();
                      sel.addRange(range);
                    }
                  }
                }, 50);
              }}
            />
          </div>
        );

      case 'task':
      case 'todo':
        const todos = Array.isArray(card.content) ? card.content : [];
        const completed = todos.filter((t) => t.done).length;
        const progress = todos.length > 0 ? (completed / todos.length) * 100 : 0;

        return (
          <div className="flex flex-col h-full space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <select
                  value={card.metadata?.priority || 'Normal'}
                  onChange={(e) => updateMeta('priority', e.target.value)}
                  onPointerDown={(e) => e.stopPropagation()}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer border outline-none appearance-none transition-colors ${
                    card.metadata?.priority === 'Urgent'
                      ? 'bg-red-500/20 text-red-400 border-red-500/30'
                      : card.metadata?.priority === 'High'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : card.metadata?.priority === 'Low'
                          ? 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                          : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  }`}
                >
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Normal">Normal</option>
                  <option value="Low">Low</option>
                </select>

                <div className="relative flex items-center group/calendar">
                  <div
                    className="flex items-center justify-center w-6 h-6 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors shadow-sm"
                    title="Set Due Date"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <input
                      type="date"
                      value={card.metadata?.endDate || ''}
                      onChange={(e) => updateMeta('endDate', e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>
                  {card.metadata?.endDate && (
                    <span className="text-[10px] font-bold text-gray-400 ml-2 tracking-wide">
                      {new Date(card.metadata.endDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xs font-mono font-medium text-gray-400">
                {completed}/{todos.length}
              </span>
            </div>

            <div className="w-full bg-black/40 border border-white/5 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 shadow-[0_0_10px_currentColor] ${progress === 100 ? 'bg-green-500 text-green-500' : 'bg-orange-500 text-orange-500'}`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {todos.map((todo) => (
                <div key={todo.id} className="flex flex-col space-y-1 group relative">
                  <div className="flex items-center space-x-3 w-full">
                    <button
                      onClick={() => {
                        const newTodos = todos.map((t) =>
                          t.id === todo.id ? { ...t, done: !todo.done } : t
                        );
                        updateCardContent(card.id, newTodos);
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                      className={`flex-shrink-0 w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-300 ${todo.done ? 'bg-orange-500 border-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]' : 'border-gray-500 hover:border-orange-400'}`}
                    >
                      {todo.done && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </button>
                    <input
                      type="text"
                      value={todo.text}
                      onChange={(e) => {
                        const newTodos = todos.map((t) =>
                          t.id === todo.id ? { ...t, text: e.target.value } : t
                        );
                        updateCardContent(card.id, newTodos);
                      }}
                      className={`flex-1 min-w-0 bg-transparent outline-none transition-all duration-300 ${fontClass} ${todo.done ? 'line-through text-gray-600' : 'text-gray-200'}`}
                      style={{ ...fontStyle, fontSize: `${fontSize}px` }}
                      onPointerDown={(e) => e.stopPropagation()}
                    />

                    {/* Hover Action Menu */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity bg-[#161618] shadow-lg rounded-md border border-white/5 px-1 py-0.5">
                      <button
                        onClick={() => {
                          const idx = todos.findIndex((t) => t.id === todo.id);
                          if (idx > 0) {
                            const newTodos = [...todos];
                            [newTodos[idx - 1], newTodos[idx]] = [newTodos[idx], newTodos[idx - 1]];
                            updateCardContent(card.id, newTodos);
                          }
                        }}
                        className="p-1 text-gray-500 hover:text-white transition-colors"
                        onPointerDown={(e) => e.stopPropagation()}
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          const idx = todos.findIndex((t) => t.id === todo.id);
                          if (idx < todos.length - 1) {
                            const newTodos = [...todos];
                            [newTodos[idx], newTodos[idx + 1]] = [newTodos[idx + 1], newTodos[idx]];
                            updateCardContent(card.id, newTodos);
                          }
                        }}
                        className="p-1 text-gray-500 hover:text-white transition-colors"
                        onPointerDown={(e) => e.stopPropagation()}
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          const newTodos = todos.filter((t) => t.id !== todo.id);
                          updateCardContent(card.id, newTodos);
                        }}
                        className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                        onPointerDown={(e) => e.stopPropagation()}
                        title="Delete Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        const newTodos = todos.map((t) =>
                          t.id === todo.id ? { ...t, isExpanded: !t.isExpanded } : t
                        );
                        updateCardContent(card.id, newTodos);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-orange-400 transition-colors ml-1"
                      onPointerDown={(e) => e.stopPropagation()}
                      title="Toggle Subnote"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transform transition-transform ${todo.isExpanded ? 'rotate-180 text-orange-500' : ''}`}
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>
                  </div>

                  {todo.isExpanded && (
                    <div className="pl-6 ml-2 mt-1 relative">
                      <div className="absolute left-0 top-0 bottom-0 w-px bg-white/10 ml-2"></div>
                      <textarea
                        value={todo.subnotes || ''}
                        onChange={(e) => {
                          const newTodos = todos.map((t) =>
                            t.id === todo.id ? { ...t, subnotes: e.target.value } : t
                          );
                          updateCardContent(card.id, newTodos);
                        }}
                        placeholder="Add subnotes here..."
                        className={`w-full bg-black/40 border border-white/5 backdrop-blur-sm resize-none outline-none p-2 text-xs rounded-lg shadow-inner custom-scrollbar text-gray-300 placeholder-gray-600 transition-colors focus:border-orange-500/50 focus:bg-black/60 ${fontClass}`}
                        style={{ ...fontStyle }}
                        onPointerDown={(e) => e.stopPropagation()}
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              ))}

              <div className="flex items-center space-x-3 mt-3 w-full opacity-70 hover:opacity-100 transition-opacity">
                <div className="flex-shrink-0 w-4 h-4 rounded-full border-[1.5px] border-dashed border-gray-600 flex items-center justify-center"></div>
                <input
                  type="text"
                  placeholder="Press Enter to add task..."
                  className={`flex-1 min-w-0 bg-transparent outline-none text-gray-400 placeholder-gray-500 ${fontClass}`}
                  style={{ ...fontStyle, fontSize: `${Math.max(12, fontSize - 2)}px` }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim() !== '') {
                      updateCardContent(card.id, [
                        ...todos,
                        { id: Date.now().toString(), text: e.target.value, done: false },
                      ]);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </div>
          </div>
        );

      case 'image':
      case 'video': {
        const mediaItems = Array.isArray(card.content)
          ? card.content
          : card.content && card.content !== 'New Node'
            ? [card.content]
            : [];

        const renderMediaItem = (url, idx) => {
          const ytRegex =
            /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
          const ytMatch = url.match(ytRegex);

          let mediaElement;

          if (ytMatch && ytMatch[1]) {
            mediaElement = (
              <iframe
                className="w-full h-full object-cover pointer-events-auto border-0"
                src={`https://www.youtube.com/embed/${ytMatch[1]}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onPointerDown={(e) => e.stopPropagation()}
              ></iframe>
            );
          } else if (url.match(/\.(mp4|webm|ogg)$/i) || url.startsWith('data:video/')) {
            mediaElement = (
              <video
                src={url}
                controls
                className="w-full h-full object-cover pointer-events-auto bg-black"
                onPointerDown={(e) => e.stopPropagation()}
              />
            );
          } else {
            mediaElement = (
              <img
                src={url}
                alt={`Media ${idx}`}
                className="w-full h-full object-cover pointer-events-none"
              />
            );
          }

          return (
            <div key={idx} className="relative w-full h-full group/item overflow-hidden">
              {mediaElement}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newMedia = mediaItems.filter((_, i) => i !== idx);
                  updateCardContent(card.id, newMedia);
                }}
                className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-red-500/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity z-10 pointer-events-auto backdrop-blur-sm"
                title="Remove Media"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          );
        };

        const gridClass =
          mediaItems.length === 1
            ? 'grid-cols-1 grid-rows-1'
            : mediaItems.length === 2
              ? 'grid-cols-2 grid-rows-1'
              : 'grid-cols-2 auto-rows-fr';

        return (
          <div className="relative w-full h-full flex flex-col group overflow-hidden bg-transparent rounded-lg">
            {mediaItems.length > 0 ? (
              <div className={`w-full h-full grid ${gridClass} gap-0 pointer-events-auto`}>
                {mediaItems.map((url, idx) => {
                  if (mediaItems.length >= 3 && idx === 0) {
                    return (
                      <div key={idx} className="col-span-2 row-span-1 h-full w-full">
                        {renderMediaItem(url, idx)}
                      </div>
                    );
                  }
                  return (
                    <div key={idx} className="h-full w-full">
                      {renderMediaItem(url, idx)}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-white/5 backdrop-blur-sm border-2 border-dashed border-gray-600 hover:bg-white/10 hover:border-orange-500/50 hover:shadow-[0_0_20px_rgba(249,115,22,0.1)] transition-all">
                <ImagePlus className="w-8 h-8 text-gray-400 mb-3 group-hover:text-orange-400 transition-colors" />

                <div className="flex flex-col gap-2 w-3/4 max-w-[200px]">
                  <label
                    className="flex items-center justify-center gap-2 bg-black/40 border border-gray-600 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-300 cursor-pointer shadow-sm hover:border-orange-500/50 hover:text-orange-400 transition-colors"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <UploadCloud className="w-4 h-4" />
                    Upload File
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>

                  <div className="flex items-center gap-2 my-1">
                    <div className="flex-1 h-px bg-gray-600"></div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      or
                    </span>
                    <div className="flex-1 h-px bg-gray-600"></div>
                  </div>

                  <input
                    type="text"
                    placeholder="Paste URL..."
                    className="bg-black/40 border border-gray-600 rounded-lg px-3 py-1.5 outline-none text-center text-xs w-full shadow-sm text-gray-200 placeholder-gray-500 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                    onPointerDown={(e) => e.stopPropagation()}
                    onBlur={(e) => {
                      if (e.target.value) {
                        updateCardContent(card.id, [...mediaItems, e.target.value]);
                        e.target.value = '';
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value) {
                        updateCardContent(card.id, [...mediaItems, e.target.value]);
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {mediaItems.length > 0 && (
              <div className="absolute bottom-2 right-2 z-20 pointer-events-auto flex justify-end items-end">
                <div className="group/fab relative flex items-center">
                  <div className="absolute right-full mr-2 opacity-0 group-hover/fab:opacity-100 transition-opacity bg-black/70 backdrop-blur rounded-full px-3 py-1.5 border border-white/10 shadow-lg translate-x-4 group-hover/fab:translate-x-0 overflow-hidden w-48">
                    <input
                      type="text"
                      placeholder="Paste Media URL..."
                      className="bg-transparent text-[10px] text-white placeholder-gray-400 outline-none w-full text-center"
                      onPointerDown={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.target.value) {
                          updateCardContent(card.id, [...mediaItems, e.target.value]);
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                  <button className="w-8 h-8 rounded-full bg-orange-500 text-white shadow-lg flex items-center justify-center hover:bg-orange-600 transition-colors">
                    <span className="text-xl leading-none font-light mb-0.5">+</span>
                  </button>
                </div>
              </div>
            )}

            {mediaItems.length > 0 && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 pt-12 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-auto flex items-end">
                <input
                  type="text"
                  placeholder="Add a caption..."
                  value={card.metadata?.caption || ''}
                  onChange={(e) => updateMeta('caption', e.target.value)}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="bg-transparent text-sm font-medium text-white placeholder-gray-300 outline-none w-full drop-shadow-md pr-10"
                />
              </div>
            )}
          </div>
        );
      }

      case 'code':
        return (
          <div className="flex flex-col h-full bg-[#0D0D0E] rounded-lg overflow-hidden border border-white/10 shadow-2xl relative group font-mono transition-colors hover:border-white/20">
            {/* Mac Window Header */}
            <div className="h-9 bg-white/5 backdrop-blur-md border-b border-white/10 flex items-center px-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56] shadow-[0_0_5px_rgba(255,95,86,0.5)]"></div>
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-[0_0_5px_rgba(255,189,46,0.5)]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27C93F] shadow-[0_0_5px_rgba(39,201,63,0.5)]"></div>
              </div>

              <div className="flex items-center ml-auto">
                <select
                  value={card.metadata?.language || 'javascript'}
                  onChange={(e) => updateMeta('language', e.target.value)}
                  className="bg-transparent text-[11px] text-gray-400 font-mono outline-none cursor-pointer hover:text-white transition-colors uppercase tracking-wider"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="sql">SQL</option>
                  <option value="rust">Rust</option>
                  <option value="go">Go</option>
                </select>

                <div className="w-px h-4 bg-white/10 mx-2"></div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(card.content || '');
                    const btn = e.currentTarget;
                    const originalHtml = btn.innerHTML;
                    btn.innerHTML =
                      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="text-green-400"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                    setTimeout(() => {
                      btn.innerHTML = originalHtml;
                    }, 2000);
                  }}
                  className="p-1 text-gray-500 hover:text-white transition-colors"
                  title="Copy Code"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {/* Editor Area */}
            <div className="flex-1 relative flex overflow-hidden">
              {/* Fake line numbers column */}
              <div className="w-10 shrink-0 bg-[#0D0D0E] border-r border-white/5 flex flex-col items-end py-3 px-3 text-[11px] text-gray-600 font-mono select-none overflow-hidden">
                {card.content ? (
                  card.content.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)
                ) : (
                  <div>1</div>
                )}
              </div>
              <textarea
                className="flex-1 h-full bg-transparent resize-none outline-none font-mono text-[13px] leading-relaxed p-3 custom-scrollbar whitespace-pre"
                style={{
                  color:
                    card.metadata?.language === 'python'
                      ? '#A6E22E'
                      : card.metadata?.language === 'html'
                        ? '#E6DB74'
                        : card.metadata?.language === 'css'
                          ? '#66D9EF'
                          : card.metadata?.language === 'sql'
                            ? '#F92672'
                            : '#D4D4D4',
                }}
                value={card.content}
                onChange={(e) => updateCardContent(card.id, e.target.value)}
                onPointerDown={(e) => e.stopPropagation()}
                spellCheck="false"
              />
            </div>
          </div>
        );

      case 'bookmark':
        return card.content && card.content !== 'New Node' ? (
          <div
            className="flex flex-col h-full justify-between bg-[#161618] rounded-lg border border-white/10 p-5 hover:border-white/20 transition-all shadow-xl group"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(249,115,22,0.15)] border border-orange-500/20">
                  <LinkIcon className="w-5 h-5 text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-sm font-bold text-gray-200 truncate tracking-wide">
                    {card.metadata?.title || 'External Reference'}
                  </h3>
                  <p className="text-[11px] text-gray-500 truncate mt-1">{card.content}</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <input
                type="text"
                placeholder="Alert/Message (e.g. Must Read!)"
                value={card.metadata?.alertBadge || ''}
                onChange={(e) => updateMeta('alertBadge', e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 outline-none text-[11px] text-gray-300 shadow-inner focus:border-orange-500/50 focus:bg-black/60 transition-colors placeholder:text-gray-600"
              />
            </div>

            <div className="mt-3 flex items-center text-xs font-bold transition-all">
              <button
                onClick={() => window.open(card.content, '_blank')}
                className="flex items-center text-orange-500 hover:text-orange-400 hover:drop-shadow-[0_0_8px_rgba(249,115,22,0.5)] transition-all"
              >
                Visit Link <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 rounded-lg border-2 border-dashed border-gray-700 hover:border-orange-500/50 hover:bg-white/10 transition-all p-5 text-center group">
            <LinkIcon className="w-8 h-8 text-gray-500 group-hover:text-orange-400 mb-3 transition-colors" />
            <span className="text-[11px] font-bold text-gray-400 group-hover:text-gray-300 mb-4 tracking-widest uppercase">
              Add Bookmark
            </span>
            <input
              type="text"
              placeholder="Paste URL here..."
              className="w-full max-w-[200px] bg-black/40 border border-white/10 rounded-lg px-3 py-2 outline-none text-xs text-center text-gray-200 shadow-inner focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all placeholder:text-gray-600"
              onPointerDown={(e) => e.stopPropagation()}
              onBlur={(e) => e.target.value && updateCardContent(card.id, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value) updateCardContent(card.id, e.target.value);
              }}
            />
          </div>
        );

      case 'audio':
        return (
          <div className="relative w-full h-full flex flex-col group">
            {card.content && card.content !== 'New Node' ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#161618] rounded-xl border border-white/10 px-4 shadow-xl transition-all hover:border-white/20">
                <Volume2 className="w-8 h-8 text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.6)] mb-6" />
                <audio
                  controls
                  src={card.content}
                  className="w-full max-w-[250px] outline-none invert-[0.9] hue-rotate-[180deg] contrast-[1.1] rounded opacity-90 hover:opacity-100 transition-opacity drop-shadow-md"
                  onPointerDown={(e) => e.stopPropagation()}
                />
                <p className="text-[11px] font-bold text-gray-400 truncate mt-5 w-full text-center tracking-wide">
                  {card.metadata?.title || 'Audio File'}
                </p>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 rounded-lg border-2 border-dashed border-gray-700 hover:border-orange-500/50 hover:bg-white/10 transition-all p-5 text-center group">
                <Volume2 className="w-8 h-8 text-gray-500 group-hover:text-orange-400 mb-3 transition-colors" />
                <span className="text-[11px] font-bold text-gray-400 group-hover:text-gray-300 mb-4 tracking-widest uppercase">
                  Add Audio
                </span>

                <div className="flex flex-col gap-3 w-full max-w-[200px]">
                  <label
                    className="flex items-center justify-center gap-2 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[11px] font-bold text-gray-300 cursor-pointer shadow-inner hover:border-orange-500/50 hover:text-orange-400 focus:bg-black/60 transition-all"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Upload Audio
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-white/10"></div>
                    <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                      or
                    </span>
                    <div className="flex-1 h-px bg-white/10"></div>
                  </div>

                  <input
                    type="text"
                    placeholder="Paste URL..."
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 outline-none text-[11px] text-center text-gray-200 shadow-inner focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all placeholder:text-gray-600"
                    onPointerDown={(e) => e.stopPropagation()}
                    onBlur={(e) => e.target.value && updateCardContent(card.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value)
                        updateCardContent(card.id, e.target.value);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 'pdf':
        return (
          <div className="relative w-full h-full flex flex-col group">
            {card.content && card.content !== 'New Node' ? (
              <div className="w-full h-full bg-[#161618] rounded-xl overflow-hidden border border-white/10 flex flex-col shadow-xl transition-colors hover:border-white/20">
                <div className="h-9 bg-white/5 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-3 shrink-0">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="w-3.5 h-3.5 text-red-500 shrink-0 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
                    <span className="text-[11px] font-bold text-gray-300 truncate tracking-wide">
                      {card.metadata?.title || 'Document.pdf'}
                    </span>
                  </div>
                  <button
                    onClick={() => usePlannerStore.getState().setActivePdfUrl(card.content)}
                    className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-1 rounded shadow-sm hover:bg-orange-500/30 hover:border-orange-500/50 transition-all shrink-0"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    Split View
                  </button>
                </div>
                <object
                  data={card.content}
                  type="application/pdf"
                  className="w-full h-full pointer-events-auto bg-[#1A1A1A]"
                >
                  <div className="flex items-center justify-center w-full h-full bg-[#161618] text-xs text-gray-500 p-4 text-center">
                    It appears your browser doesn't support embedded PDFs. <br />
                    <a
                      href={card.content}
                      target="_blank"
                      rel="noreferrer"
                      className="text-orange-500 hover:text-orange-400 transition-colors hover:underline mt-2 inline-block"
                    >
                      Download it here
                    </a>
                  </div>
                </object>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 rounded-lg border-2 border-dashed border-gray-700 hover:border-orange-500/50 hover:bg-white/10 transition-all p-5 text-center group">
                <FileText className="w-8 h-8 text-gray-500 group-hover:text-red-500 mb-3 transition-colors" />
                <span className="text-[11px] font-bold text-gray-400 group-hover:text-gray-300 mb-4 tracking-widest uppercase">
                  Add PDF
                </span>

                <div className="flex flex-col gap-3 w-full max-w-[200px]">
                  <label
                    className="flex items-center justify-center gap-2 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[11px] font-bold text-gray-300 cursor-pointer shadow-inner hover:border-orange-500/50 hover:text-orange-400 focus:bg-black/60 transition-all"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Upload PDF
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-white/10"></div>
                    <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                      or
                    </span>
                    <div className="flex-1 h-px bg-white/10"></div>
                  </div>

                  <input
                    type="text"
                    placeholder="Paste URL..."
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 outline-none text-[11px] text-center text-gray-200 shadow-inner focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all placeholder:text-gray-600"
                    onPointerDown={(e) => e.stopPropagation()}
                    onBlur={(e) => e.target.value && updateCardContent(card.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value)
                        updateCardContent(card.id, e.target.value);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 'ai':
        const handleGenerate = () => {
          if (!aiText.trim() || card.metadata?.isGenerating) return;
          usePlannerStore.getState().generateAIResponse(card.id, aiText);
        };

        return (
          <div className="flex flex-col h-full relative group">
            <div
              className={`flex-1 overflow-y-auto mb-10 custom-scrollbar text-sm font-mono ${card.metadata?.isGenerating ? 'text-amber-500 animate-pulse' : 'text-gray-800'}`}
            >
              {card.content}
            </div>
            <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 bg-white/90 backdrop-blur p-1 rounded-lg border border-orange-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
              <input
                type="text"
                placeholder="Ask AI..."
                value={aiText}
                onChange={(e) => setAiText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGenerate();
                }}
                className="flex-1 bg-transparent outline-none text-sm text-gray-800 px-2"
                onPointerDown={(e) => e.stopPropagation()}
              />
              <button
                onClick={handleGenerate}
                disabled={card.metadata?.isGenerating}
                className="bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white p-1.5 rounded-md transition-all shadow-sm disabled:opacity-50 shrink-0"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        );

      default:
        return <div className="text-gray-500 text-sm">Unknown type</div>;
    }
  };

  const colorClasses = {
    default: 'bg-surface',
    blue: 'bg-[#0f172a]',
    green: 'bg-[#064e3b]',
    emerald: 'bg-[#022c22]',
    yellow: 'bg-[#422006]',
    orange: 'bg-[#431407]',
    rose: 'bg-[#4c0519]',
    purple: 'bg-[#3b0764]',
    indigo: 'bg-[#1e1b4b]',
    teal: 'bg-[#042f2e]',
  };
  const isCustomColor = card.color?.startsWith('#');
  const innerBgClass = isCustomColor
    ? ''
    : colorClasses[card.color || 'default'] || colorClasses.default;
  const customBgStyle = isCustomColor ? { backgroundColor: card.color } : {};

  return (
    <div
      id={card.id}
      className={`card-node absolute ${isSelected ? 'z-10' : 'z-0'} ${activeTool === 'cursor' ? 'cursor-move' : activeTool === 'pan' ? 'pointer-events-none' : ''}`}
      style={{
        width: card.width || 250,
        height: card.height || 200,
        left: 0,
        top: 0,
        transform: `translate(${card.x}px, ${card.y}px)`,
        position: 'absolute',
      }}
      onPointerDown={handlePointerDown}
    >
      <div
        className={`group relative w-full h-full flex flex-col transition-all duration-300 ease-out hover:scale-[1.02] rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.4)] border border-white/5 hover:border-white/20 backdrop-blur-xl ${innerBgClass} ${isSelected ? 'ring-2 ring-orange-500 shadow-orange-500/20' : ''}`}
        style={customBgStyle}
      >
        {renderFormattingToolbar()}

        {/* Header (Drag Handle area) */}
        <div className="h-8 flex items-center justify-between px-3 border-b border-white/5 opacity-40 hover:opacity-100 transition-opacity">
          <GripHorizontal className="w-4 h-4 text-gray-400" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-orange-500">
            {card.type}
          </span>
        </div>

        {/* Main Content Area */}
        <div
          className={`flex-1 overflow-hidden flex flex-col ${card.type === 'image' || card.type === 'video' ? 'p-0 relative' : 'p-4'}`}
        >
          {renderContent()}
          {renderFooter(card.type === 'image' || card.type === 'video')}
        </div>

        {/* Connection Ports (Now Inside Inner Wrapper for physics tracking) */}
        {showPorts &&
          ['top', 'right', 'bottom', 'left'].map((pos) => {
            const portClasses = {
              top: '-top-1.5 left-1/2 -translate-x-1/2',
              right: '-right-1.5 top-1/2 -translate-y-1/2',
              bottom: '-bottom-1.5 left-1/2 -translate-x-1/2',
              left: '-left-1.5 top-1/2 -translate-y-1/2',
            };
            return (
              <div
                key={pos}
                className={`port absolute w-3 h-3 border-2 rounded-full cursor-crosshair hover:scale-[1.8] hover:bg-orange-400 hover:border-white hover:shadow-[0_0_15px_rgba(249,115,22,0.8)] transition-all before:absolute before:-inset-5 before:content-[''] ${portClasses[pos]} z-20 ${
                  activeConnectionStart?.cardId === card.id && activeConnectionStart?.port === pos
                    ? 'scale-[1.8] bg-orange-400 border-white shadow-[0_0_20px_rgba(249,115,22,1)] opacity-100 md:!opacity-100 animate-pulse'
                    : 'bg-white border-orange-400 opacity-100 md:opacity-0 md:group-hover:opacity-100'
                }`}
                data-card-id={card.id}
                data-port={pos}
                title={`Connect ${pos}`}
              />
            );
          })}

        {/* Custom Visual Resize Handle */}
        <div
          data-resize-handle="true"
          onPointerDown={handleResizePointerDown}
          className={`absolute bottom-0 right-0 w-8 h-8 flex items-end justify-end p-1 opacity-50 z-50 pointer-events-auto ${activeTool === 'pan' ? 'cursor-grab active:cursor-grabbing hover:opacity-50' : 'cursor-se-resize hover:opacity-100'}`}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 10 10"
            fill="currentColor"
            className={`text-gray-400 ${activeTool === 'pan' ? 'opacity-0' : ''}`}
          >
            <path d="M10 0v10H0L10 0z" />
          </svg>
        </div>

        {/* Vertical Hover Action Menu */}
        <div
          className={`absolute -right-12 top-0 flex flex-col gap-2 transition-all duration-200 z-40 ${
            isSelected
              ? 'opacity-100 translate-x-0 pointer-events-auto'
              : 'opacity-0 translate-x-[-10px] pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto'
          }`}
        >
          <div className="relative group/btn">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCardCollapse(card.id);
              }}
              className={`w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center transition-colors ${card.collapsed ? 'text-orange-500 border-orange-200 hover:bg-orange-50' : 'text-gray-600 hover:text-orange-500 hover:border-orange-200'}`}
            >
              {card.collapsed ? (
                <Maximize2 className="w-4 h-4" />
              ) : (
                <Minimize2 className="w-4 h-4" />
              )}
            </button>
            <div className="absolute top-1/2 -translate-y-1/2 right-full mr-2 bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-opacity">
              {card.collapsed ? 'Expand Nodes' : 'Collapse Nodes'}
            </div>
          </div>

          <div className="relative group/btn">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
                setShowCommentBox(false);
              }}
              className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 text-gray-600 hover:text-orange-500 hover:border-orange-200 flex items-center justify-center transition-colors"
            >
              <Palette className="w-4 h-4" />
            </button>
            <div className="absolute top-1/2 -translate-y-1/2 right-full mr-2 bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-opacity">
              Color Theme
            </div>
            {showColorPicker && (
              <div className="absolute left-full top-0 ml-2 bg-white rounded-lg shadow-xl border border-gray-100 p-2 grid grid-cols-4 gap-2 z-50 w-36">
                {Object.entries(colorClasses).map(([colorName, colorClass]) => (
                  <button
                    key={colorName}
                    onClick={(e) => {
                      e.stopPropagation();
                      usePlannerStore.getState().changeNodeColor(card.id, colorName);
                      setShowColorPicker(false);
                    }}
                    className={`w-6 h-6 rounded-full border border-gray-200 shadow-sm hover:scale-125 transition-transform ${colorClass}`}
                    title={colorName}
                  />
                ))}
                <div className="col-span-4 w-full h-px bg-gray-200 my-1"></div>
                <label
                  className="col-span-4 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                  title="Custom Hex Color"
                >
                  <div className="w-full h-7 rounded-md border border-gray-200 overflow-hidden relative flex items-center justify-center text-[10px] font-bold text-white shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 opacity-90"></div>
                    <span className="relative z-10 drop-shadow-md tracking-wider">CUSTOM</span>
                    <input
                      type="color"
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      value={card.color?.startsWith('#') ? card.color : '#161618'}
                      onChange={(e) => {
                        usePlannerStore.getState().changeNodeColor(card.id, e.target.value);
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                    />
                  </div>
                </label>
              </div>
            )}
          </div>

          <div className="relative group/btn">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCommentBox(!showCommentBox);
                setShowColorPicker(false);
              }}
              className={`w-8 h-8 rounded-full bg-white shadow-sm border ${card.metadata?.comment ? 'border-orange-300 text-orange-500' : 'border-gray-100 text-gray-600 hover:text-orange-500 hover:border-orange-200'} flex items-center justify-center transition-colors`}
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <div className="absolute top-1/2 -translate-y-1/2 right-full mr-2 bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-opacity">
              Add Comment
            </div>
            {showCommentBox && (
              <div
                className="absolute left-full top-0 ml-2 bg-white rounded-lg shadow-xl border border-gray-100 p-3 w-64 z-50 flex flex-col pointer-events-auto"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <div className="text-xs font-bold text-gray-700 mb-2 flex justify-between items-center">
                  <span>Card Comment</span>
                  <button
                    onClick={() => setShowCommentBox(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <textarea
                  autoFocus
                  placeholder="Type your comment here..."
                  className="w-full h-24 bg-gray-50 border border-gray-200 rounded p-2 text-sm text-gray-700 outline-none focus:ring-1 focus:ring-orange-400 resize-none custom-scrollbar"
                  value={card.metadata?.comment || ''}
                  onChange={(e) => updateCardMetadata(card.id, { comment: e.target.value })}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

Card.displayName = 'Card';
