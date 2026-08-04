import React from 'react';
import { usePlannerStore } from '../../store/usePlannerStore';
import { X, FileJson, Table, FileText, Image as ImageIcon, Download } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

export const ExportModal = () => {
  const {
    isExportModalOpen,
    closeExportModal,
    exportWorkspace,
    cards,
    connections,
    viewport,
    viewMode,
  } = usePlannerStore();

  if (!isExportModalOpen) return null;

  const downloadFile = (filename, content, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportZaforge = () => {
    exportWorkspace();
    closeExportModal();
  };

  const exportObsidian = () => {
    const nodes = cards.map((c) => ({
      id: c.id,
      type: 'text',
      text: `${c.metadata?.title || 'Node'}\n\n${typeof c.content === 'string' ? c.content : JSON.stringify(c.content)}`,
      x: c.x,
      y: c.y,
      width: c.width || 300,
      height: c.height || 200,
      color: '1',
    }));

    const edges = connections.map((conn) => ({
      id: conn.id,
      fromNode: conn.source,
      toNode: conn.target,
      label: conn.label || '',
    }));

    const payload = { nodes, edges };
    downloadFile('workspace.canvas', JSON.stringify(payload, null, 2), 'application/json');
    closeExportModal();
  };

  const exportCSV = () => {
    const headers = ['ID', 'Title', 'Type', 'Status', 'Assignee', 'Priority', 'Budget', 'DueDate'];
    const rows = cards.map((c) => {
      const title = c.metadata?.title || `Node ${c.type}`;
      const status = Array.isArray(c.content)
        ? c.content.every((t) => t.done)
          ? 'Done'
          : 'In Progress'
        : 'N/A';
      const assignee = c.metadata?.assignee || 'Unassigned';
      const priority = c.metadata?.priority || 'Normal';
      const budget = c.metadata?.budget || '';
      const dueDate = c.metadata?.endDate || '';

      return [c.id, title, c.type, status, assignee, priority, budget, dueDate]
        .map((field) => `"${String(field).replace(/"/g, '""')}"`)
        .join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    downloadFile('workspace-table.csv', csvContent, 'text/csv');
    closeExportModal();
  };

  const exportMarkdown = () => {
    let md = `# Project Summary\n*Exported on: ${new Date().toLocaleDateString()}*\n\n`;

    const grouped = cards.reduce((acc, card) => {
      acc[card.type] = acc[card.type] || [];
      acc[card.type].push(card);
      return acc;
    }, {});

    for (const [type, typeCards] of Object.entries(grouped)) {
      md += `## ${type.toUpperCase()}S\n\n`;
      typeCards.forEach((c) => {
        const title = c.metadata?.title || `Untitled ${type}`;
        md += `### ${title}\n`;

        if (c.type === 'task' && Array.isArray(c.content)) {
          const assignee = c.metadata?.assignee || 'Unassigned';
          const due = c.metadata?.endDate || 'No Date';
          md += `*Assignee: ${assignee}, Due: ${due}*\n\n`;
          c.content.forEach((task) => {
            md += `- [${task.done ? 'x' : ' '}] ${task.text}\n`;
          });
          md += '\n';
        } else {
          md += `${typeof c.content === 'string' ? c.content : ''}\n\n`;
        }
      });
    }

    if (connections.length > 0) {
      md += `## Relationships\n\n`;
      connections.forEach((conn) => {
        const sourceCard = cards.find((c) => c.id === conn.source);
        const targetCard = cards.find((c) => c.id === conn.target);
        if (sourceCard && targetCard) {
          const sourceTitle = sourceCard.metadata?.title || `Node ${sourceCard.type}`;
          const targetTitle = targetCard.metadata?.title || `Node ${targetCard.type}`;
          md += `* **${sourceTitle}** ${conn.type.replace('_', ' ')} **${targetTitle}**\n`;
        }
      });
    }

    downloadFile('workspace-notes.md', md, 'text/markdown');
    closeExportModal();
  };

  const exportImage = async () => {
    if (viewMode !== 'canvas') {
      alert('Please switch to the Spatial Canvas view to take an image snapshot.');
      return;
    }
    const element = document.querySelector('.canvas-wrapper');
    if (!element) return;

    try {
      const dataUrl = await htmlToImage.toPng(element, { backgroundColor: '#FAFAFA' });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'workspace-snapshot.png';
      a.click();
      closeExportModal();
    } catch (err) {
      console.error('Error capturing image:', err);
      alert('Failed to capture image snapshot.');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">Export Workspace</h2>
          <button
            onClick={closeExportModal}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-500 text-sm mb-6">
            Choose a format to export your active workspace. These universal formats allow you to
            open your Zaforge data in external applications.
          </p>

          <div className="space-y-3">
            {/* Obsidian */}
            <button
              onClick={exportObsidian}
              className="w-full flex items-center px-4 py-3 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-colors group text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <FileJson className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800">Obsidian JSON Canvas</div>
                <div className="text-xs text-gray-500">
                  .canvas - Open in Obsidian or JSON Canvas viewers
                </div>
              </div>
            </button>

            {/* CSV Spreadsheet */}
            <button
              onClick={exportCSV}
              className="w-full flex items-center px-4 py-3 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-colors group text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <Table className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800">Spreadsheet Table</div>
                <div className="text-xs text-gray-500">
                  .csv - Open in Excel, Google Sheets, or Numbers
                </div>
              </div>
            </button>

            {/* Markdown */}
            <button
              onClick={exportMarkdown}
              className="w-full flex items-center px-4 py-3 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors group text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800">Markdown Document</div>
                <div className="text-xs text-gray-500">
                  .md - Open in Notion, VS Code, or Obsidian
                </div>
              </div>
            </button>

            {/* Image Snapshot */}
            <button
              onClick={exportImage}
              className="w-full flex items-center px-4 py-3 border border-gray-200 rounded-xl hover:border-pink-300 hover:bg-pink-50 transition-colors group text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800">Image Snapshot</div>
                <div className="text-xs text-gray-500">
                  .png - High-res transparent capture of the canvas
                </div>
              </div>
            </button>

            {/* Zaforge Native */}
            <button
              onClick={exportZaforge}
              className="w-full flex items-center px-4 py-3 border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-colors group text-left mt-4 bg-gray-50"
            >
              <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-sm">
                <Download className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800">Zaforge Workspace</div>
                <div className="text-xs text-gray-500">
                  .zaforge - Native backup file to load back into Zaforge
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 -z-10" onClick={closeExportModal} />
    </div>
  );
};
