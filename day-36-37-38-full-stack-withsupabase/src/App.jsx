import React, { useEffect } from 'react';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { Header } from './components/Header';
import { TableView } from './components/views/TableView';
import { GanttView } from './components/views/GanttView';
import { CommandPalette } from './components/CommandPalette';
import { ExportModal } from './components/modals/ExportModal';
import { PdfViewerPanel } from './components/PdfViewerPanel';
import { LandingPage } from './components/LandingPage';
import { usePlannerStore } from './store/usePlannerStore';

function App() {
  const { route, viewMode, setTemporaryTool, revertTool, activePdfUrl } = usePlannerStore();

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
    return <LandingPage />;
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-canvas text-dark relative flex flex-col">
      <Header />
      
      <div className="flex-1 relative w-full h-full flex">
        <div className={`relative h-full transition-all duration-300 ${activePdfUrl && viewMode === 'canvas' ? 'w-1/2 border-r border-gray-200' : 'w-full'}`}>
          {viewMode === 'canvas' && <Canvas />}
          {viewMode === 'table' && <TableView />}
          {viewMode === 'gantt' && <GanttView />}
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
              <PdfViewerPanel />
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
