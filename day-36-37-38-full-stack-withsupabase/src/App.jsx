import React, { useEffect, Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { CommandPalette } from './components/CommandPalette';
import { ExportModal } from './components/modals/ExportModal';
import { usePlannerStore } from './store/usePlannerStore';
import { supabase } from './lib/supabase';

// Lazy load heavy views
const LandingPage = lazy(() => import('./components/LandingPage').then(module => ({ default: module.LandingPage })));
const Canvas = lazy(() => import('./components/Canvas').then(module => ({ default: module.Canvas })));
const TableView = lazy(() => import('./components/views/TableView').then(module => ({ default: module.TableView })));
const GanttView = lazy(() => import('./components/views/GanttView').then(module => ({ default: module.GanttView })));
const PdfViewerPanel = lazy(() => import('./components/PdfViewerPanel').then(module => ({ default: module.PdfViewerPanel })));

const SuspenseFallback = () => (
  <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#050505] text-[#F97316]">
    <div className="relative flex items-center justify-center w-20 h-20">
      <div className="absolute inset-0 border-t-2 border-r-2 border-[#F97316] rounded-full animate-spin"></div>
      <div className="absolute inset-2 border-b-2 border-l-2 border-[#F97316]/50 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      <div className="text-[10px] tracking-widest font-bold font-mono">SYS</div>
    </div>
    <div className="mt-8 text-[10px] tracking-[0.3em] uppercase text-white/50 font-mono animate-pulse">
      Loading Assets...
    </div>
  </div>
);

function App() {
  const { route, viewMode, setTemporaryTool, revertTool, activePdfUrl, setUser, setRoute, user, loadWorkspaceData, isHydrated } = usePlannerStore();

  useEffect(() => {
    // Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user && route === 'landing') {
        setRoute('app');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user && route === 'landing') {
        setRoute('app');
      } else if (event === 'SIGNED_OUT' && route === 'app') {
        setRoute('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, route, setRoute]);

  useEffect(() => {
    if (user && route === 'app') {
      loadWorkspaceData(user.id);
    } else if (!user && route === 'app' && !isHydrated) {
      usePlannerStore.getState().setBoardData({});
    }
  }, [user, route, loadWorkspaceData, isHydrated]);

  useEffect(() => {
    if ('launchQueue' in window) {
      window.launchQueue.setConsumer(async (launchParams) => {
        if (!launchParams.files || !launchParams.files.length) return;
        
        for (const fileHandle of launchParams.files) {
          if (fileHandle.name.endsWith('.zaforge')) {
            try {
              const file = await fileHandle.getFile();
              const text = await file.text();
              usePlannerStore.getState().importWorkspace(text);
            } catch (err) {
              console.error("Failed to read .zaforge file from OS launchQueue:", err);
            }
          }
        }
      });
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input, textarea, or contentEditable element
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault(); // prevent scrolling
        setTemporaryTool('pan');
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        revertTool();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setTemporaryTool, revertTool]);

  if (route === 'landing') {
    return (
      <Suspense fallback={<SuspenseFallback />}>
        <LandingPage />
      </Suspense>
    );
  }

  if (route === 'app' && !isHydrated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#050505] text-[#F97316]">
        <div className="relative flex items-center justify-center w-20 h-20 mb-8">
          <div className="absolute inset-0 border-t-2 border-r-2 border-[#F97316] rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-b-2 border-l-2 border-[#F97316]/50 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          <div className="text-[10px] tracking-widest font-bold font-mono">DB</div>
        </div>
        <div className="text-lg tracking-widest font-bold font-mono animate-pulse">
          SYNCING ZAFORGE CORE...
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-canvas text-dark relative flex flex-col">
      <Header />
      
      <div className="flex-1 relative w-full h-full flex">
        <div className={`relative h-full transition-all duration-300 ${activePdfUrl && viewMode === 'canvas' ? 'w-1/2 border-r border-gray-200' : 'w-full'}`}>
          <Suspense fallback={<SuspenseFallback />}>
            {viewMode === 'canvas' && <Canvas />}
            {viewMode === 'table' && <TableView />}
            {viewMode === 'gantt' && <GanttView />}
          </Suspense>
        </div>
        
        {activePdfUrl && viewMode === 'canvas' && (
          <div className="w-1/2 h-full relative flex flex-col z-50">
            <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 shadow-sm z-50">
              <h2 className="font-semibold text-gray-700 text-sm">PDF Split View</h2>
              <button
                onClick={() => usePlannerStore.getState().setActivePdfUrl(null)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Close PDF
              </button>
            </div>
            <div className="flex-1 relative bg-gray-100 z-10">
              <Suspense fallback={<SuspenseFallback />}>
                <PdfViewerPanel />
              </Suspense>
            </div>
          </div>
        )}
      </div>
      
      {viewMode === 'canvas' && <Toolbar />}
      
      <CommandPalette />
      <ExportModal />
    </div>
  );
}

export default App;
