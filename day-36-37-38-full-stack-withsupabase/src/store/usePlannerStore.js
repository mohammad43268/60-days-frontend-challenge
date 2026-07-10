import { create } from 'zustand';

const initialCards = [
  {
    id: 'card-1',
    type: 'note',
    x: 200,
    y: 200,
    width: 250,
    content: 'Welcome to Phase 2.5! I am a polymorphic node.',
    metadata: { font: 'sans', size: 'text-base', align: 'text-left', assignee: 'Alice', budget: 1500, files: 2 }
  },
  {
    id: 'card-2',
    type: 'task',
    x: 600,
    y: 200,
    width: 280,
    content: [
      { id: 't1', text: 'Implement History Stack', done: true },
      { id: 't2', text: 'Build SVG Arrows', done: false },
      { id: 't3', text: 'Create Gantt View', done: false },
    ],
    metadata: { priority: 'Urgent', assignee: 'Bob', startDate: '2024-11-01', endDate: '2024-11-15' }
  },
  {
    id: 'card-3',
    type: 'image',
    x: 400,
    y: 500,
    width: 300,
    content: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&auto=format&fit=crop',
    metadata: { caption: 'Inspiration Board' }
  }
];

const initialConnections = [
  {
    id: 'conn-1',
    source: 'card-1',
    target: 'card-2',
    sourcePort: 'right',
    targetPort: 'left',
    type: 'depends_on',
    label: ''
  }
];

export const usePlannerStore = create((set, get) => {
  const saveHistory = () => {
    const { cards, connections, past } = get();
    const newPast = [...past, { cards, connections }].slice(-50); // Keep last 50 states
    set({ past: newPast, future: [] });
  };

  return {
    cards: initialCards,
    connections: initialConnections,
    past: [],
    future: [],
    
    drawings: [], // array of { id, type: 'pen'|'highlighter', points: [{x,y}], color, width }
    activeDrawingTool: null, // 'pen' | 'highlighter' | 'eraser' | null
    drawingColor: '#FF6B00',
    drawingWidth: 4,


    activePdfUrl: null,

    viewport: { x: 0, y: 0, scale: 1 },
    activeTool: 'cursor', // 'cursor', 'pan', 'text', 'todo', 'image', 'connect', 'delete'
    previousTool: null,
    selectedCardIds: [],
    viewMode: 'canvas', // 'canvas' | 'table' | 'gantt'
    route: 'landing', // 'landing' | 'app'
    theme: 'dark',
    smartShapesEnabled: true,
    isExportModalOpen: false,

    setRoute: (route) => set({ route }),
    toggleSmartShapes: () => set((state) => ({ smartShapesEnabled: !state.smartShapesEnabled })),
    
    openExportModal: () => set({ isExportModalOpen: true }),
    closeExportModal: () => set({ isExportModalOpen: false }),

    undo: () => set((state) => {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, -1);
      return {
        past: newPast,
        future: [{ cards: state.cards, connections: state.connections }, ...state.future],
        cards: previous.cards,
        connections: previous.connections,
      };
    }),

    redo: () => set((state) => {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      return {
        past: [...state.past, { cards: state.cards, connections: state.connections }],
        future: newFuture,
        cards: next.cards,
        connections: next.connections,
      };
    }),

    addCard: (type, x, y) => {
      saveHistory();
      set((state) => {
        const newCard = {
          id: `card-${Date.now()}`,
          type,
          x,
          y,
          width: 250,
          content: type === 'task' ? [] : (type === 'image' ? '' : 'New Node'),
          metadata: {},
          collapsed: false,
          color: 'default'
        };
        return { cards: [...state.cards, newCard] };
      });
    },

    updateCardPosition: (id, x, y) => {
      // Don't save history on every single mouse move, let's just do it directly for performance, 
      // or we can handle it carefully. For simplicity, we just update. (Ideally saveHistory happens onDragStart)
      set((state) => ({
        cards: state.cards.map(c => c.id === id ? { ...c, x, y } : c)
      }));
    },
    
    // Explicitly call this when a drag ENDS to commit the position to history
    commitCardPosition: () => saveHistory(),

    updateCardSize: (id, width, height) => {
      saveHistory();
      set((state) => ({
        cards: state.cards.map(c => c.id === id ? { ...c, width, height } : c)
      }));
    },

    updateCardContent: (id, content) => {
      saveHistory();
      set((state) => ({
        cards: state.cards.map(c => c.id === id ? { ...c, content } : c)
      }));
    },

    changeNodeColor: (id, color) => {
      saveHistory();
      set((state) => ({
        cards: state.cards.map(c => c.id === id ? { ...c, color } : c)
      }));
    },

    updateCardMetadata: (id, metaUpdates) => {
      saveHistory();
      set((state) => ({
        cards: state.cards.map(c => c.id === id ? { ...c, metadata: { ...c.metadata, ...metaUpdates } } : c)
      }));
    },

    toggleCardCollapse: (id) => {
      saveHistory();
      set((state) => ({
        cards: state.cards.map(c => c.id === id ? { ...c, collapsed: !c.collapsed } : c)
      }));
    },

    deleteSelectedCards: () => {
      saveHistory();
      set((state) => {
        const idsToDelete = state.selectedCardIds;
        if (idsToDelete.length === 0) return state;
        
        return {
          cards: state.cards.filter(c => !idsToDelete.includes(c.id)),
          connections: state.connections.filter(conn => !idsToDelete.includes(conn.source) && !idsToDelete.includes(conn.target)),
          selectedCardIds: []
        };
      });
    },

    addConnection: (source, target, sourcePort, targetPort, type = 'related', label = '') => {
      saveHistory();
      set((state) => ({
        connections: [...state.connections, { id: `conn-${Date.now()}`, source, target, sourcePort, targetPort, type, label }]
      }));
    },

    updateConnection: (id, updates) => {
      saveHistory();
      set((state) => ({
        connections: state.connections.map(c => c.id === id ? { ...c, ...updates } : c)
      }));
    },
    
    deleteConnection: (id) => {
      saveHistory();
      set((state) => ({
        connections: state.connections.filter(c => c.id !== id)
      }));
    },

    setActiveTool: (tool) => set({ activeTool: tool, previousTool: null }),
    
    setTemporaryTool: (tool) => set((state) => {
      if (state.activeTool === tool) return state; // Already using this tool
      return { activeTool: tool, previousTool: state.activeTool };
    }),

    revertTool: () => set((state) => {
      if (!state.previousTool) return state;
      return { activeTool: state.previousTool, previousTool: null };
    }),


    setActivePdfUrl: (url) => set({ activePdfUrl: url }),

    setDrawingTool: (tool) => set({ activeDrawingTool: tool }),
    setDrawingColor: (color) => set({ drawingColor: color }),
    setDrawingWidth: (width) => set({ drawingWidth: width }),
    
    addDrawing: (drawing) => {
      saveHistory();
      set((state) => ({ drawings: [...state.drawings, drawing] }));
    },
    
    updateDrawing: (id, updates) => {
      set((state) => ({
        drawings: state.drawings.map(d => d.id === id ? { ...d, ...updates } : d)
      }));
    },
    
    deleteDrawings: (ids) => {
      saveHistory();
      set((state) => ({
        drawings: state.drawings.filter(d => !ids.includes(d.id))
      }));
    },

    generateAIResponse: async (cardId, prompt) => {
      const state = get();
      const card = state.cards.find(c => c.id === cardId);
      if (!card) return;

      // Start loading
      set(state => ({
        cards: state.cards.map(c => c.id === cardId ? { ...c, metadata: { ...c.metadata, isGenerating: true }, content: '' } : c)
      }));

      // Mock streaming
      const mockResponse = `Here is a breakdown of: ${prompt}\n\n1. Concept\n2. Design\n3. Implementation`;
      let currentText = '';
      
      for (let i = 0; i < mockResponse.length; i++) {
        await new Promise(r => setTimeout(r, 20));
        currentText += mockResponse[i];
        set(state => ({
          cards: state.cards.map(c => c.id === cardId ? { ...c, content: currentText } : c)
        }));
      }

      // Finish loading and create child cards optionally
      set(state => {
        const newCards = [...state.cards.map(c => c.id === cardId ? { ...c, metadata: { ...c.metadata, isGenerating: false } } : c)];
        const newConnections = [...state.connections];
        
        // Let's spawn a couple of child notes as an example
        const child1Id = 'ai-child-1-' + Date.now();
        const child2Id = 'ai-child-2-' + Date.now();
        
        newCards.push(
          { id: child1Id, type: 'note', x: card.x - 150, y: card.y + 300, width: 250, height: 250, content: 'Concept Phase\nDetailed notes...', metadata: { title: 'Concept' }, collapsed: false },
          { id: child2Id, type: 'note', x: card.x + 150, y: card.y + 300, width: 250, height: 250, content: 'Implementation Phase\nCode notes...', metadata: { title: 'Implementation' }, collapsed: false }
        );

        newConnections.push(
          { id: `conn-${cardId}-${child1Id}`, source: cardId, target: child1Id, sourcePort: 'bottom', targetPort: 'top', type: 'related', label: '' },
          { id: `conn-${cardId}-${child2Id}`, source: cardId, target: child2Id, sourcePort: 'bottom', targetPort: 'top', type: 'related', label: '' }
        );

        return { cards: newCards, connections: newConnections };
      });
    },

    toggleCardSelection: (id, isMultiSelect = false) => set((state) => {
      if (isMultiSelect) {
        if (state.selectedCardIds.includes(id)) {
          return { selectedCardIds: state.selectedCardIds.filter(selectedId => selectedId !== id) };
        } else {
          return { selectedCardIds: [...state.selectedCardIds, id] };
        }
      } else {
        return { selectedCardIds: [id] };
      }
    }),
    clearSelection: () => set({ selectedCardIds: [] }),
    selectAll: () => set((state) => ({ selectedCardIds: state.cards.map(c => c.id) })),
    updateViewport: (viewport) => set({ viewport }),
    setViewMode: (mode) => set({ viewMode: mode }),
    
    loadTemplate: (preset) => {
      saveHistory();
      // Templates to be injected
      let newCards = [];
      let newConnections = [];
      
      if (preset === 'product') {
        newCards = [
          { id: 'c1', type: 'note', x: 100, y: 100, width: 250, content: 'Product Launch Q4', metadata: {} },
          { id: 'c2', type: 'task', x: 450, y: 100, width: 300, content: [{id:'1', text:'Design UI', done:false}], metadata: { priority: 'Urgent', startDate: '2024-10-01', endDate: '2024-10-15' } },
          { id: 'c3', type: 'task', x: 450, y: 300, width: 300, content: [{id:'2', text:'Backend API', done:false}], metadata: { priority: 'High', startDate: '2024-10-16', endDate: '2024-11-01' } }
        ];
        newConnections = [
          { id: 'con1', source: 'c1', target: 'c2', sourcePort: 'right', targetPort: 'left', type: 'depends_on' },
          { id: 'con2', source: 'c1', target: 'c3', sourcePort: 'right', targetPort: 'left', type: 'depends_on' }
        ];
      } else if (preset === 'ai') {
        newCards = [
          { id: 'c1', type: 'ai', x: 300, y: 200, width: 350, content: 'Generate startup ideas for spatial computing', metadata: {} },
          { id: 'c2', type: 'bookmark', x: 750, y: 200, width: 250, content: 'https://news.ycombinator.com', metadata: {} }
        ];
        newConnections = [
          { id: 'con1', source: 'c1', target: 'c2', sourcePort: 'right', targetPort: 'left', type: 'references' }
        ];
      } else if (preset === 'engineering') {
        newCards = [
          { id: 'c1', type: 'code', x: 200, y: 200, width: 400, content: 'function init() {\n  console.log("System ready");\n}', metadata: {} },
          { id: 'c2', type: 'note', x: 700, y: 200, width: 250, content: 'Core initialization module', metadata: {} }
        ];
        newConnections = [
          { id: 'con1', source: 'c1', target: 'c2', sourcePort: 'right', targetPort: 'left', type: 'blocks' }
        ];
      } else if (preset === 'study') {
        newCards = [
          { id: 'c1', type: 'note', x: 200, y: 150, width: 300, content: 'Master System Design\n- Distributed Systems\n- Caching\n- Load Balancing', metadata: { font: 'serif' } },
          { id: 'c2', type: 'bookmark', x: 600, y: 150, width: 250, content: 'https://bytebytego.com', metadata: { title: 'System Design Course' } },
          { id: 'c3', type: 'task', x: 200, y: 400, width: 300, content: [{id:'1', text:'Read Chapter 1', done:true}, {id:'2', text:'Complete mock interview', done:false}], metadata: { priority: 'High', startDate: '2024-10-01', endDate: '2024-10-15' } }
        ];
        newConnections = [
          { id: 'con1', source: 'c1', target: 'c2', sourcePort: 'right', targetPort: 'left', type: 'references' },
          { id: 'con2', source: 'c3', target: 'c1', sourcePort: 'top', targetPort: 'bottom', type: 'depends_on' }
        ];
      } else if (preset === 'coding') {
        newCards = [
          { id: 'c1', type: 'code', x: 200, y: 200, width: 400, content: 'export const store = create((set) => ({\n  state: {},\n  update: () => set()\n}))', metadata: {} },
          { id: 'c2', type: 'note', x: 700, y: 200, width: 250, content: 'Global state manager initialized here.', metadata: { align: 'text-center' } },
          { id: 'c3', type: 'ai', x: 700, y: 400, width: 250, content: 'Can we use Redux instead?', metadata: {} }
        ];
        newConnections = [
          { id: 'con1', source: 'c1', target: 'c2', sourcePort: 'right', targetPort: 'left', type: 'owned_by' },
          { id: 'con2', source: 'c3', target: 'c1', sourcePort: 'left', targetPort: 'bottom', type: 'references' }
        ];
      } else if (preset === 'planning') {
        newCards = [
          { id: 'c1', type: 'task', x: 200, y: 200, width: 300, content: [{id:'1', text:'Design Phase', done:true}], metadata: { priority: 'High', assignee: 'Alex', startDate: '2024-10-01', endDate: '2024-10-05' } },
          { id: 'c2', type: 'task', x: 600, y: 100, width: 300, content: [{id:'1', text:'Frontend Dev', done:false}], metadata: { priority: 'Urgent', assignee: 'Sam', startDate: '2024-10-06', endDate: '2024-10-20' } },
          { id: 'c3', type: 'task', x: 600, y: 350, width: 300, content: [{id:'1', text:'Backend Dev', done:false}], metadata: { priority: 'High', assignee: 'Jordan', startDate: '2024-10-06', endDate: '2024-10-25' } }
        ];
        newConnections = [
          { id: 'con1', source: 'c1', target: 'c2', sourcePort: 'right', targetPort: 'left', type: 'blocks' },
          { id: 'con2', source: 'c1', target: 'c3', sourcePort: 'right', targetPort: 'left', type: 'blocks' }
        ];
      } else if (preset === 'marketing') {
        newCards = [
          { id: 'm1', type: 'note', x: 100, y: 300, width: 300, color: 'rose', content: 'Holiday Campaign 2026', metadata: { align: 'text-center', fontSize: 24, fontColor: '#fda4af' } },
          { id: 'm2', type: 'task', x: 500, y: 150, width: 300, color: 'orange', content: [{id:'1', text:'Social Media Ads', done:false}], metadata: { assignee: 'Sarah', budget: '$5000' } },
          { id: 'm3', type: 'task', x: 500, y: 450, width: 300, color: 'blue', content: [{id:'1', text:'Email Newsletter', done:false}], metadata: { assignee: 'Tom', budget: '$1200' } },
          { id: 'm4', type: 'image', x: 900, y: 150, width: 300, content: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', metadata: { caption: 'Hero Image Concept' } }
        ];
        newConnections = [
          { id: 'c_m1_m2', source: 'm1', target: 'm2', sourcePort: 'right', targetPort: 'left', type: 'depends_on' },
          { id: 'c_m1_m3', source: 'm1', target: 'm3', sourcePort: 'right', targetPort: 'left', type: 'depends_on' },
          { id: 'c_m2_m4', source: 'm2', target: 'm4', sourcePort: 'right', targetPort: 'left', type: 'references' }
        ];
      } else if (preset === 'mindmap') {
        newCards = [
          { id: 'mm1', type: 'note', x: 500, y: 300, width: 250, color: 'indigo', content: 'AI Strategy', metadata: { align: 'text-center', fontSize: 20 } },
          { id: 'mm2', type: 'note', x: 200, y: 100, width: 200, color: 'teal', content: 'Data Collection', metadata: {} },
          { id: 'mm3', type: 'note', x: 800, y: 100, width: 200, color: 'purple', content: 'Model Training', metadata: {} },
          { id: 'mm4', type: 'note', x: 200, y: 500, width: 200, color: 'emerald', content: 'Evaluation', metadata: {} },
          { id: 'mm5', type: 'note', x: 800, y: 500, width: 200, color: 'rose', content: 'Deployment', metadata: {} }
        ];
        newConnections = [
          { id: 'c_mm1_mm2', source: 'mm1', target: 'mm2', sourcePort: 'top', targetPort: 'bottom', type: 'related' },
          { id: 'c_mm1_mm3', source: 'mm1', target: 'mm3', sourcePort: 'top', targetPort: 'bottom', type: 'related' },
          { id: 'c_mm1_mm4', source: 'mm1', target: 'mm4', sourcePort: 'bottom', targetPort: 'top', type: 'related' },
          { id: 'c_mm1_mm5', source: 'mm1', target: 'mm5', sourcePort: 'bottom', targetPort: 'top', type: 'related' }
        ];
      } else if (preset === 'storyboard') {
        newCards = [
          { id: 'sb1', type: 'image', x: 100, y: 200, width: 300, content: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4', metadata: { caption: 'Scene 1: Introduction' } },
          { id: 'sb2', type: 'image', x: 500, y: 200, width: 300, content: 'https://images.unsplash.com/photo-1516280440502-861f6ebbe402', metadata: { caption: 'Scene 2: Conflict' } },
          { id: 'sb3', type: 'image', x: 900, y: 200, width: 300, content: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1', metadata: { caption: 'Scene 3: Resolution' } }
        ];
        newConnections = [
          { id: 'c_sb1_sb2', source: 'sb1', target: 'sb2', sourcePort: 'right', targetPort: 'left', type: 'related' },
          { id: 'c_sb2_sb3', source: 'sb2', target: 'sb3', sourcePort: 'right', targetPort: 'left', type: 'related' }
        ];
      }
      
      set({ cards: newCards, connections: newConnections, viewport: { x: 0, y: 0, scale: 1 }, selectedCardIds: [] });
    },

    exportWorkspace: () => {
      const { cards, connections, viewport, viewMode } = get();
      const payload = {
        app: "Zaforge OS",
        version: "3.0.0",
        exportedAt: new Date().toISOString(),
        workspace: {
          cards: cards,
          connections: connections,
          viewport: viewport,
          viewMode: viewMode
        }
      };
      
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workspace-${Date.now()}.zaforge`;
      a.click();
      URL.revokeObjectURL(url);
    },

    importWorkspace: (jsonString) => {
      try {
        const data = JSON.parse(jsonString);
        if (data && data.app === "Zaforge OS" && data.workspace && Array.isArray(data.workspace.cards) && Array.isArray(data.workspace.connections)) {
          saveHistory();
          set({
            cards: data.workspace.cards,
            connections: data.workspace.connections,
            viewport: data.workspace.viewport || { x: 0, y: 0, scale: 1 },
            viewMode: data.workspace.viewMode || 'canvas',
            selectedCardIds: []
          });
          return { success: true };
        } else if (data && data.app === "SpatialOS" && data.workspace) {
           // backwards compatibility
           saveHistory();
           set({
             cards: data.workspace.nodes || data.workspace.cards || [],
             connections: data.workspace.connections || [],
             viewport: data.workspace.viewport || { x: 0, y: 0, scale: 1 },
             viewMode: data.workspace.viewMode || 'canvas',
             selectedCardIds: []
           });
           return { success: true };
        } else {
          console.error("Invalid Zaforge workspace file format.");
          alert("Invalid Zaforge workspace file format. Please ensure you are importing a valid .zaforge file.");
          return { success: false, error: "Invalid format" };
        }
      } catch (err) {
        console.error("Failed to parse Zaforge file:", err);
        alert("Failed to parse file. The file may be corrupted.");
        return { success: false, error: err.message };
      }
    }
  };
});

export const getVisibleCards = (cards, connections) => {
  const collapsed = new Set(cards.filter(c => c.collapsed).map(c => c.id));
  if (collapsed.size === 0) return cards;

  let hidden = new Set();
  let changed = true;
  
  while (changed) {
    changed = false;
    for (let card of cards) {
      if (hidden.has(card.id)) continue;
      
      const parents = connections.filter(c => c.target === card.id).map(c => c.source);
      if (parents.length > 0) {
        // If ALL parents are (hidden or collapsed), hide this node
        const allParentsHiddenOrCollapsed = parents.every(p => hidden.has(p) || collapsed.has(p));
        if (allParentsHiddenOrCollapsed) {
          hidden.add(card.id);
          changed = true;
        }
      }
    }
  }
  
  return cards.filter(c => !hidden.has(c.id));
};
