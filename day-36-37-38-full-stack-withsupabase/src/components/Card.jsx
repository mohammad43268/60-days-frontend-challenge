import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { usePlannerStore } from '../store/usePlannerStore';
import { Trash2, GripHorizontal, Settings, MoreHorizontal, Copy, Check, Link2, ExternalLink, ImagePlus, FileText, Code, Maximize2, Minimize2, Paperclip, DollarSign, AlignLeft, AlignCenter, AlignRight, Play, UploadCloud, Link as LinkIcon, Volume2, Bold, Italic, Underline, Palette, MessageSquare } from 'lucide-react';

let globalAppLoaded = false;
setTimeout(() => { globalAppLoaded = true; }, 1000);

export const Card = ({ card }) => {
  const { updateCardContent, updateCardMetadata, selectedCardIds, toggleCardSelection, clearSelection, activeTool, updateCardSize, connections, cards, toggleCardCollapse } = usePlannerStore();
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

  const outgoingConnections = connections.filter(c => c.source === card.id);
  const hasChildren = outgoingConnections.length > 0;

  useLayoutEffect(() => {
    if (globalAppLoaded) {
      const incomingConn = connections.find(c => c.target === card.id);
      if (incomingConn) {
        const parentCard = cards.find(c => c.id === incomingConn.source);
        if (parentCard) {
          const el = document.getElementById(card.id);
          if (el) {
            gsap.fromTo(el, {
              opacity: 0
            }, {
              opacity: 1,
              duration: 0.5,
              ease: "power2.out",
              clearProps: "opacity"
            });
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
    const fontColor = card.metadata?.fontColor || '#1f2937'; // gray-800 default

    const fonts = ['sans', 'serif', 'mono', 'Roboto', 'Inter', 'Playfair Display', 'Fira Code', 'Pacifico', 'Lato', 'Montserrat', 'Oswald', 'Raleway', 'Ubuntu', 'Dancing Script', 'Caveat', 'Lobster'];

    return (
      <div className="absolute -top-12 left-0 h-10 bg-white rounded-lg shadow-xl border border-gray-200 flex items-center px-2 gap-2 z-50 pointer-events-auto" onPointerDown={e => e.stopPropagation()}>
        {/* Custom Font Picker */}
        <div className="relative">
          <button
            onClick={() => setShowFontPicker(!showFontPicker)}
            className="flex items-center justify-between bg-transparent text-xs text-gray-700 hover:bg-gray-50 px-2 py-1 rounded w-32 outline-none"
          >
            <span className="truncate">{fontFamily === 'sans' ? 'Sans-Serif' : fontFamily === 'serif' ? 'Serif' : fontFamily === 'mono' ? 'Monospace' : fontFamily}</span>
            <svg className="w-3 h-3 ml-1 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          {showFontPicker && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-100 rounded-lg shadow-2xl py-1 max-h-64 overflow-y-auto custom-scrollbar z-50">
              {fonts.map(f => {
                const displayName = f === 'sans' ? 'Sans-Serif' : f === 'serif' ? 'Serif' : f === 'mono' ? 'Monospace' : f;
                const style = (f === 'sans' || f === 'serif' || f === 'mono') ? {} : { fontFamily: `"${f}", sans-serif` };
                const className = f === 'sans' ? 'font-sans' : (f === 'serif' ? 'font-serif' : (f === 'mono' ? 'font-mono' : ''));
                return (
                  <button
                    key={f}
                    onClick={() => { updateMeta('fontFamily', f); setShowFontPicker(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-orange-50 hover:text-orange-600 transition-colors ${fontFamily === f ? 'bg-orange-50 text-orange-600 font-bold' : 'text-gray-700'} ${className}`}
                    style={style}
                  >
                    {displayName}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="w-px h-4 bg-gray-200 mx-1"></div>
        
        {/* Font Size */}
        <div className="flex items-center gap-1">
          <button onClick={() => updateMeta('fontSize', Math.max(10, fontSize - 2))} className="text-gray-400 hover:text-gray-700 px-1 font-bold">-</button>
          <span className="text-xs text-gray-600 w-4 text-center">{fontSize}</span>
          <button onClick={() => updateMeta('fontSize', Math.min(200, fontSize + 2))} className="text-gray-400 hover:text-gray-700 px-1 font-bold">+</button>
        </div>

        <div className="w-px h-4 bg-gray-200 mx-1"></div>
        
        {/* Color Picker */}
        <div className="flex items-center">
          <input 
            type="color" 
            value={fontColor} 
            onChange={(e) => updateMeta('fontColor', e.target.value)}
            className="w-5 h-5 rounded cursor-pointer border-none bg-transparent p-0 outline-none overflow-hidden"
            title="Font Color"
          />
        </div>

        <div className="w-px h-4 bg-gray-200 mx-1"></div>

        {/* Alignment */}
        <button onClick={() => updateMeta('align', 'text-left')} className={`p-1.5 rounded ${align === 'text-left' ? 'bg-orange-50 text-orange-600' : 'text-gray-400 hover:text-gray-700'}`}><AlignLeft className="w-4 h-4" /></button>
        <button onClick={() => updateMeta('align', 'text-center')} className={`p-1.5 rounded ${align === 'text-center' ? 'bg-orange-50 text-orange-600' : 'text-gray-400 hover:text-gray-700'}`}><AlignCenter className="w-4 h-4" /></button>
        <button onClick={() => updateMeta('align', 'text-right')} className={`p-1.5 rounded ${align === 'text-right' ? 'bg-orange-50 text-orange-600' : 'text-gray-400 hover:text-gray-700'}`}><AlignRight className="w-4 h-4" /></button>
        
        <div className="w-px h-4 bg-gray-200 mx-1"></div>

        {/* Rich Text Format */}
        <button onClick={(e) => { e.preventDefault(); document.execCommand('bold', false, null); }} className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100"><Bold className="w-4 h-4" /></button>
        <button onClick={(e) => { e.preventDefault(); document.execCommand('italic', false, null); }} className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100"><Italic className="w-4 h-4" /></button>
        <button onClick={(e) => { e.preventDefault(); document.execCommand('underline', false, null); }} className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100"><Underline className="w-4 h-4" /></button>
      </div>
    );
  };

  const renderFooter = () => {
    const meta = card.metadata || {};
    if (!meta.assignee && !meta.budget && !meta.files && !meta.comment) return null;
    
    return (
      <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
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
            <div className="flex items-center gap-1 text-orange-500 font-medium" title={meta.comment}><MessageSquare className="w-3.5 h-3.5 fill-orange-100" /></div>
          )}
          {meta.files > 0 && (
            <div className="flex items-center gap-1"><Paperclip className="w-3.5 h-3.5" /> {meta.files}</div>
          )}
          {meta.budget > 0 && (
            <div className="flex items-center gap-1 text-green-600 font-medium"><DollarSign className="w-3.5 h-3.5" /> {meta.budget}</div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    const fontFamily = card.metadata?.fontFamily || 'sans';
    const fontSize = card.metadata?.fontSize || 14;
    const fontColor = card.metadata?.fontColor || '#1f2937';
    const alignClass = card.metadata?.align || 'text-left';
    
    // Convert named fonts to valid CSS classes or inline styles
    const fontStyle = (fontFamily === 'sans' || fontFamily === 'serif' || fontFamily === 'mono') 
      ? {} 
      : { fontFamily: `"${fontFamily}", sans-serif` };
      
    const fontClass = fontFamily === 'sans' ? 'font-sans' : (fontFamily === 'serif' ? 'font-serif' : (fontFamily === 'mono' ? 'font-mono' : ''));

    switch (card.type) {
      case 'note':
      case 'text':
        return (
          <div className="relative w-full h-full flex flex-col group/text">
            <div
              ref={contentRef}
              className={`w-full h-full overflow-auto bg-transparent outline-none ${fontClass} ${alignClass} p-1 custom-scrollbar empty:before:content-['']`}
              style={{ ...fontStyle, fontSize: `${fontSize}px`, color: fontColor, userSelect: isEditing ? 'text' : 'none' }}
              contentEditable={isEditing}
              suppressContentEditableWarning={true}
              onBlur={(e) => {
                setIsEditing(false);
                updateCardContent(card.id, e.target.innerHTML);
              }}
              onPointerDown={(e) => {
                if (isEditing) e.stopPropagation();
              }}
            />
            
            {!isEditing && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <button 
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    if (!isSelected) {
                      clearSelection();
                      toggleCardSelection(card.id, false);
                    }
                    setIsEditing(true);
                    setTimeout(() => {
                      if (contentRef.current) {
                        contentRef.current.focus();
                        const range = document.createRange();
                        range.selectNodeContents(contentRef.current);
                        range.collapse(false);
                        const sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(range);
                      }
                    }, 50);
                  }}
                  className={`bg-orange-500 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg font-bold hover:bg-orange-600 transition-all transform hover:scale-105 pointer-events-auto ${card.content ? 'opacity-0 group-hover/text:opacity-100' : 'opacity-100'}`}
                >
                  {card.content ? 'Edit Text' : 'Write Text'}
                </button>
              </div>
            )}
          </div>
        );
      
      case 'task':
      case 'todo':
        const todos = Array.isArray(card.content) ? card.content : [];
        const completed = todos.filter(t => t.done).length;
        const progress = todos.length > 0 ? (completed / todos.length) * 100 : 0;
        
        return (
          <div className="flex flex-col h-full space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <select
                  value={card.metadata?.priority || 'Normal'}
                  onChange={(e) => updateMeta('priority', e.target.value)}
                  onPointerDown={(e) => e.stopPropagation()}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer border-none outline-none appearance-none ${
                    card.metadata?.priority === 'Urgent' ? 'bg-red-100 text-red-600' :
                    card.metadata?.priority === 'High' ? 'bg-amber-100 text-amber-600' :
                    card.metadata?.priority === 'Low' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Normal">Normal</option>
                  <option value="Low">Low</option>
                </select>
                
                <div className="relative flex items-center group/calendar">
                  <div className="flex items-center justify-center w-6 h-6 rounded bg-black text-white hover:bg-gray-800 cursor-pointer transition-colors" title="Set Due Date" onPointerDown={e => e.stopPropagation()}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <input 
                      type="date" 
                      value={card.metadata?.endDate || ''}
                      onChange={(e) => updateMeta('endDate', e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>
                  {card.metadata?.endDate && (
                    <span className="text-[10px] font-bold text-gray-500 ml-1.5">{new Date(card.metadata.endDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                  )}
                </div>
              </div>
              <span className="text-xs font-mono text-gray-500">{completed}/{todos.length}</span>
            </div>
            
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-orange-500 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {todos.map((todo) => (
                <div key={todo.id} className="flex flex-col space-y-1 group">
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      checked={todo.done}
                      onChange={(e) => {
                        const newTodos = todos.map(t => t.id === todo.id ? { ...t, done: e.target.checked } : t);
                        updateCardContent(card.id, newTodos);
                      }}
                      className="mt-1 w-3.5 h-3.5 rounded border-gray-300 text-orange-500 bg-white cursor-pointer accent-orange-500"
                      onPointerDown={e => e.stopPropagation()}
                    />
                    <input
                      type="text"
                      value={todo.text}
                      onChange={(e) => {
                        const newTodos = todos.map(t => t.id === todo.id ? { ...t, text: e.target.value } : t);
                        updateCardContent(card.id, newTodos);
                      }}
                      className={`flex-1 bg-transparent outline-none transition-colors ${fontClass} ${todo.done ? 'line-through opacity-50' : ''}`}
                      style={{ ...fontStyle, fontSize: `${fontSize}px`, color: fontColor }}
                      onPointerDown={e => e.stopPropagation()}
                    />
                    <button
                      onClick={() => {
                        const newTodos = todos.map(t => t.id === todo.id ? { ...t, isExpanded: !t.isExpanded } : t);
                        updateCardContent(card.id, newTodos);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-orange-500 transition-opacity"
                      onPointerDown={e => e.stopPropagation()}
                      title="Toggle Subnote"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transform transition-transform ${todo.isExpanded ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                  </div>
                  {todo.isExpanded && (
                    <div className="pl-5.5 ml-2 border-l-2 border-orange-200">
                      <textarea
                        value={todo.subnotes || ''}
                        onChange={(e) => {
                          const newTodos = todos.map(t => t.id === todo.id ? { ...t, subnotes: e.target.value } : t);
                          updateCardContent(card.id, newTodos);
                        }}
                        placeholder="Add subnotes here..."
                        className={`w-full bg-orange-50/50 resize-none outline-none p-2 text-xs rounded shadow-inner custom-scrollbar ${fontClass}`}
                        style={{ ...fontStyle, color: fontColor }}
                        onPointerDown={e => e.stopPropagation()}
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              ))}
              <input
                type="text"
                placeholder="Press Enter to add task..."
                className={`w-full bg-transparent outline-none text-gray-400 placeholder-gray-400 mt-2 ${fontClass}`}
                style={{ ...fontStyle, fontSize: `${Math.max(12, fontSize - 2)}px` }}
                onPointerDown={e => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim() !== '') {
                    updateCardContent(card.id, [...todos, { id: Date.now().toString(), text: e.target.value, done: false }]);
                    e.target.value = '';
                  }
                }}
              />
            </div>
          </div>
        );
      
      case 'image':
      case 'video':
        const mediaItems = Array.isArray(card.content) ? card.content : (card.content && card.content !== 'New Node' ? [card.content] : []);
        
        return (
          <div className="relative w-full h-full flex flex-col group overflow-hidden bg-gray-50 rounded-md">
            {mediaItems.length > 0 ? (
              <div className="w-full h-full overflow-y-auto custom-scrollbar p-1">
                <div className="columns-2 gap-2 space-y-2">
                  {mediaItems.map((url, idx) => (
                    <img key={idx} src={url} alt={`Media ${idx}`} className="w-full h-auto object-cover rounded pointer-events-none shadow-sm" />
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gray-50/80 rounded-md border-2 border-dashed border-gray-200 hover:bg-gray-100 hover:border-orange-300 transition-colors">
                <ImagePlus className="w-8 h-8 text-gray-400 mb-3" />
                
                <div className="flex flex-col gap-2 w-3/4 max-w-[200px]">
                  <label className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 cursor-pointer shadow-sm hover:border-orange-300 hover:text-orange-500 transition-colors" onPointerDown={e => e.stopPropagation()}>
                    <UploadCloud className="w-4 h-4" />
                    Upload File
                    <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                  
                  <div className="flex items-center gap-2 my-1">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">or</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>

                  <input 
                    type="text" 
                    placeholder="Paste Image URL..."
                    className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 outline-none text-center text-xs w-full shadow-sm focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all"
                    onPointerDown={e => e.stopPropagation()}
                    onBlur={e => {
                      if (e.target.value) {
                        updateCardContent(card.id, [...mediaItems, e.target.value]);
                        e.target.value = '';
                      }
                    }}
                    onKeyDown={e => { 
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
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur border border-gray-200 rounded-full px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 shadow-lg z-10 pointer-events-auto">
                <input
                  type="text"
                  placeholder="Add another URL..."
                  className="bg-transparent text-[10px] text-gray-700 placeholder-gray-400 outline-none w-24 text-center"
                  onPointerDown={(e) => e.stopPropagation()}
                  onKeyDown={e => { 
                    if (e.key === 'Enter' && e.target.value) {
                      updateCardContent(card.id, [...mediaItems, e.target.value]);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            )}
            
            {mediaItems.length > 0 && (
              <div className="absolute top-2 left-2 right-2 bg-black/60 backdrop-blur rounded p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-auto">
                <input
                  type="text"
                  placeholder="Add a caption..."
                  value={card.metadata?.caption || ''}
                  onChange={(e) => updateMeta('caption', e.target.value)}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="bg-transparent text-xs text-white placeholder-gray-400 outline-none w-full text-center"
                />
              </div>
            )}
          </div>
        );

      case 'code':
        return (
          <div className="flex flex-col h-full bg-[#1E1E1E] rounded-lg overflow-hidden border border-gray-800 shadow-xl relative group font-mono">
            {/* Mac Window Header */}
            <div className="h-8 bg-[#2D2D2D] border-b border-[#1E1E1E] flex items-center px-3 shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]"></div>
              </div>
              <select
                value={card.metadata?.language || 'javascript'}
                onChange={(e) => updateMeta('language', e.target.value)}
                className="ml-auto bg-transparent text-[10px] text-gray-400 font-mono outline-none cursor-pointer hover:text-white transition-colors"
                onPointerDown={e => e.stopPropagation()}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="sql">SQL</option>
                <option value="rust">Rust</option>
                <option value="go">Go</option>
              </select>
            </div>
            {/* Editor Area */}
            <div className="flex-1 relative flex overflow-hidden">
               {/* Fake line numbers column */}
               <div className="w-10 shrink-0 bg-[#1E1E1E] border-r border-[#2D2D2D] flex flex-col items-end py-3 px-3 text-xs text-gray-500 font-mono select-none overflow-hidden">
                  {card.content ? card.content.split('\n').map((_, i) => <div key={i}>{i + 1}</div>) : <div>1</div>}
               </div>
               <textarea
                 className="flex-1 h-full bg-transparent resize-none outline-none font-mono text-sm leading-relaxed p-3 custom-scrollbar whitespace-pre"
                 style={{ 
                   color: 
                     (card.metadata?.language === 'python' ? '#A6E22E' : 
                      card.metadata?.language === 'html' ? '#E6DB74' : 
                      card.metadata?.language === 'css' ? '#66D9EF' : 
                      card.metadata?.language === 'sql' ? '#F92672' : 
                      '#D4D4D4') 
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
          <div className="flex flex-col h-full justify-between bg-orange-50/50 rounded-lg border border-orange-100 p-4 hover:bg-orange-100 transition-colors" onPointerDown={e => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-orange-200">
                  <LinkIcon className="w-5 h-5 text-orange-500" />
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-sm font-semibold text-gray-800 truncate">{card.metadata?.title || 'External Reference'}</h3>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{card.content}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-2">
              <input
                type="text"
                placeholder="Alert/Message (e.g. Must Read!)"
                value={card.metadata?.alertBadge || ''}
                onChange={e => updateMeta('alertBadge', e.target.value)}
                className="w-full bg-white/60 border border-orange-200 rounded p-1 outline-none text-[10px] font-bold text-orange-700 shadow-sm focus:border-orange-400 placeholder:font-normal placeholder:text-gray-400"
              />
            </div>

            <div className="mt-2 flex items-center text-xs text-orange-500 font-medium">
              <button onClick={() => window.open(card.content, '_blank')} className="flex items-center hover:underline">
                Visit Link <ExternalLink className="w-3 h-3 ml-1" />
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-orange-50/30 rounded-lg border-2 border-dashed border-orange-200 p-4 text-center">
            <LinkIcon className="w-6 h-6 text-orange-400 mb-2" />
            <span className="text-xs font-bold text-orange-800 mb-3">Add Bookmark</span>
            <input 
              type="text" 
              placeholder="Paste URL here..."
              className="w-full bg-white border border-orange-200 rounded p-1.5 outline-none text-xs text-center text-gray-700 shadow-sm focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-colors"
              onPointerDown={e => e.stopPropagation()}
              onBlur={e => e.target.value && updateCardContent(card.id, e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && e.target.value) updateCardContent(card.id, e.target.value) }}
            />
          </div>
        );

      case 'audio':
        return (
          <div className="relative w-full h-full flex flex-col group">
            {card.content && card.content !== 'New Node' ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-md border border-gray-200 px-4">
                <Volume2 className="w-8 h-8 text-orange-400 mb-4" />
                <audio controls src={card.content} className="w-full max-w-[250px] outline-none" onPointerDown={e => e.stopPropagation()} />
                <p className="text-xs text-gray-500 truncate mt-3 w-full text-center">{card.metadata?.title || 'Audio File'}</p>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gray-50/80 rounded-md border-2 border-dashed border-gray-200 hover:bg-gray-100 hover:border-orange-300 transition-colors">
                <Volume2 className="w-8 h-8 text-gray-400 mb-3" />
                
                <div className="flex flex-col gap-2 w-3/4 max-w-[200px]">
                  <label className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 cursor-pointer shadow-sm hover:border-orange-300 hover:text-orange-500 transition-colors" onPointerDown={e => e.stopPropagation()}>
                    <UploadCloud className="w-4 h-4" />
                    Upload Audio
                    <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                  
                  <div className="flex items-center gap-2 my-1">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">or</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>

                  <input 
                    type="text" 
                    placeholder="Paste Audio URL..."
                    className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 outline-none text-center text-xs w-full shadow-sm focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all"
                    onPointerDown={e => e.stopPropagation()}
                    onBlur={e => e.target.value && updateCardContent(card.id, e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && e.target.value) updateCardContent(card.id, e.target.value) }}
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
              <div className="w-full h-full bg-white rounded-md overflow-hidden border border-gray-200 flex flex-col">
                <div className="h-8 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-3 shrink-0">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="text-xs font-semibold text-gray-700 truncate">{card.metadata?.title || 'Document.pdf'}</span>
                  </div>
                  <button
                    onClick={() => usePlannerStore.getState().setActivePdfUrl(card.content)}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-600 px-2 py-1 rounded hover:bg-orange-200 transition-colors shrink-0"
                    onPointerDown={e => e.stopPropagation()}
                  >
                    Split View
                  </button>
                </div>
                <object data={card.content} type="application/pdf" className="w-full h-full pointer-events-auto">
                  <div className="flex items-center justify-center w-full h-full bg-gray-50 text-sm text-gray-500 p-4 text-center">
                    It appears your browser doesn't support embedded PDFs. <br/>
                    <a href={card.content} target="_blank" rel="noreferrer" className="text-orange-500 hover:underline mt-2 inline-block">Download it here</a>
                  </div>
                </object>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gray-50/80 rounded-md border-2 border-dashed border-gray-200 hover:bg-gray-100 hover:border-orange-300 transition-colors">
                <FileText className="w-8 h-8 text-gray-400 mb-3" />
                
                <div className="flex flex-col gap-2 w-3/4 max-w-[200px]">
                  <label className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 cursor-pointer shadow-sm hover:border-orange-300 hover:text-orange-500 transition-colors" onPointerDown={e => e.stopPropagation()}>
                    <UploadCloud className="w-4 h-4" />
                    Upload PDF
                    <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} />
                  </label>
                  
                  <div className="flex items-center gap-2 my-1">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">or</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>

                  <input 
                    type="text" 
                    placeholder="Paste PDF URL..."
                    className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 outline-none text-center text-xs w-full shadow-sm focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all"
                    onPointerDown={e => e.stopPropagation()}
                    onBlur={e => e.target.value && updateCardContent(card.id, e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && e.target.value) updateCardContent(card.id, e.target.value) }}
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
            <div className={`flex-1 overflow-y-auto mb-10 custom-scrollbar text-sm font-mono ${card.metadata?.isGenerating ? 'text-amber-500 animate-pulse' : 'text-gray-800'}`}>
              {card.content}
            </div>
            <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 bg-white/90 backdrop-blur p-1 rounded-lg border border-orange-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
              <input 
                type="text"
                placeholder="Ask AI..."
                value={aiText}
                onChange={e => setAiText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleGenerate(); }}
                className="flex-1 bg-transparent outline-none text-sm text-gray-800 px-2"
                onPointerDown={e => e.stopPropagation()}
              />
              <button 
                onClick={handleGenerate}
                disabled={card.metadata?.isGenerating}
                className="bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white p-1.5 rounded-md transition-all shadow-sm disabled:opacity-50 shrink-0"
                onPointerDown={e => e.stopPropagation()}
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
    default: 'bg-white',
    blue: 'bg-[#EFF6FF]',
    green: 'bg-[#ECFDF5]',
    yellow: 'bg-[#FFFBEB]',
    rose: 'bg-[#FFF1F2]',
  };
  const innerBgClass = colorClasses[card.color || 'default'] || colorClasses.default;

  return (
    <div
      id={card.id}
      className={`card-node absolute ${isSelected ? 'z-10' : 'z-0'} ${activeTool === 'cursor' ? 'cursor-move' : (activeTool === 'pan' ? 'pointer-events-none' : '')}`}
      style={{
        width: card.width || 250,
        height: card.height || 200,
        left: 0,
        top: 0,
        transform: `translate(${card.x}px, ${card.y}px)`,
        position: 'absolute'
      }}
      onPointerDown={handlePointerDown}
    >
      <div className={`group relative w-full h-full flex flex-col transition-transform duration-200 ease-out hover:scale-[1.02] rounded-xl shadow-sm border border-gray-200 ${innerBgClass} ${isSelected ? 'ring-2 ring-orange-500' : ''}`}>
        
        {renderFormattingToolbar()}

        {/* Header (Drag Handle area) */}
        <div className="h-8 flex items-center justify-between px-3 border-b border-gray-100 opacity-40 hover:opacity-100 transition-opacity">
          <GripHorizontal className="w-4 h-4 text-gray-400" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-orange-400">{card.type}</span>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4 overflow-hidden flex flex-col">
          {renderContent()}
          {renderFooter()}
        </div>

        {/* Connection Ports (Now Inside Inner Wrapper for physics tracking) */}
        {showPorts && ['top', 'right', 'bottom', 'left'].map(pos => {
          const portClasses = {
            top: "-top-1.5 left-1/2 -translate-x-1/2",
            right: "-right-1.5 top-1/2 -translate-y-1/2",
            bottom: "-bottom-1.5 left-1/2 -translate-x-1/2",
            left: "-left-1.5 top-1/2 -translate-y-1/2"
          };
          return (
            <div
              key={pos}
              className={`port absolute w-3 h-3 bg-white border-2 border-orange-400 rounded-full cursor-crosshair hover:scale-150 transition-opacity opacity-0 group-hover:opacity-100 ${portClasses[pos]} z-20`}
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
          <svg width="12" height="12" viewBox="0 0 10 10" fill="currentColor" className={`text-gray-400 ${activeTool === 'pan' ? 'opacity-0' : ''}`}>
            <path d="M10 0v10H0L10 0z" />
          </svg>
        </div>

        {/* Vertical Hover Action Menu */}
        <div className={`absolute -right-12 top-0 flex flex-col gap-2 transition-all duration-200 z-40 ${
          isSelected 
            ? 'opacity-100 translate-x-0 pointer-events-auto' 
            : 'opacity-0 translate-x-[-10px] pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto'
        }`}>
          
          <div className="relative group/btn">
            <button 
              onClick={(e) => { e.stopPropagation(); toggleCardCollapse(card.id); }}
              className={`w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center transition-colors ${card.collapsed ? 'text-orange-500 border-orange-200 hover:bg-orange-50' : 'text-gray-600 hover:text-orange-500 hover:border-orange-200'}`}
            >
              {card.collapsed ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <div className="absolute top-1/2 -translate-y-1/2 right-full mr-2 bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-opacity">
              {card.collapsed ? 'Expand Nodes' : 'Collapse Nodes'}
            </div>
          </div>

          <div className="relative group/btn">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowColorPicker(!showColorPicker); setShowCommentBox(false); }}
              className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 text-gray-600 hover:text-orange-500 hover:border-orange-200 flex items-center justify-center transition-colors"
            >
              <Palette className="w-4 h-4" />
            </button>
            <div className="absolute top-1/2 -translate-y-1/2 right-full mr-2 bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-opacity">
              Color Theme
            </div>
            {showColorPicker && (
              <div className="absolute left-full top-0 ml-2 bg-white rounded-lg shadow-xl border border-gray-100 p-2 flex flex-col gap-2 z-50">
                {Object.entries(colorClasses).map(([colorName, colorClass]) => (
                  <button
                    key={colorName}
                    onClick={(e) => {
                      e.stopPropagation();
                      usePlannerStore.getState().changeNodeColor(card.id, colorName);
                      setShowColorPicker(false);
                    }}
                    className={`w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-transform ${colorClass}`}
                    title={colorName}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="relative group/btn">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowCommentBox(!showCommentBox); setShowColorPicker(false); }}
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
                onPointerDown={e => e.stopPropagation()}
              >
                <div className="text-xs font-bold text-gray-700 mb-2 flex justify-between items-center">
                  <span>Card Comment</span>
                  <button onClick={() => setShowCommentBox(false)} className="text-gray-400 hover:text-gray-600">✕</button>
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
};
