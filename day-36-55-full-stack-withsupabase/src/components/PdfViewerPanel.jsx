import React from 'react';
import { usePlannerStore } from '../store/usePlannerStore';
import { X, ExternalLink } from 'lucide-react';

export const PdfViewerPanel = () => {
  const { activePdfUrl, setActivePdfUrl } = usePlannerStore();

  if (!activePdfUrl) return null;

  return (
    <div className="h-full w-full bg-white border-l border-gray-200 flex flex-col shadow-2xl relative z-10">
      <div className="flex-1 bg-gray-100 overflow-hidden">
        <iframe src={activePdfUrl} className="w-full h-full border-none" title="PDF Viewer" />
      </div>
    </div>
  );
};
