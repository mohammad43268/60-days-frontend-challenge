import React, { useMemo } from 'react';
import { usePlannerStore } from '../../store/usePlannerStore';
import { User, Calendar, CircleDashed, CheckCircle2, ArrowRight, TableProperties } from 'lucide-react';

export const TableView = () => {
  const { cards } = usePlannerStore();

  return (
    <div className="w-full h-full bg-[#FAFAFA] text-gray-800 p-8 pt-24 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Node Directory</h1>
            <p className="text-sm text-gray-500 mt-1">Structured view of your spatial data</p>
          </div>
          <div className="text-sm font-medium text-gray-400 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
            {cards.length} Total Nodes
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Node Type</th>
                <th className="px-6 py-4">Content / Progress</th>
                <th className="px-6 py-4">Assignee</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4 text-right">Timeline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cards.map(card => {
                let progress = 0;
                let isTask = card.type === 'task' || card.type === 'todo';
                if (isTask && Array.isArray(card.content)) {
                  const completed = card.content.filter(t => t.done).length;
                  progress = card.content.length > 0 ? (completed / card.content.length) * 100 : 0;
                }

                return (
                  <tr key={card.id} className="hover:bg-orange-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-600 border border-orange-200/50 shadow-sm">
                        {card.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {isTask ? (
                        <div className="flex flex-col gap-2 max-w-[300px]">
                          <span className="text-sm font-medium text-gray-800 truncate">
                            {card.content.length > 0 ? card.content[0].text : 'Empty Checklist'}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-orange-500 h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-400">{Math.round(progress)}%</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-gray-700 truncate max-w-[300px] block">
                          {typeof card.content === 'string' ? card.content : 'Complex Content'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {card.metadata?.assignee ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                            {card.metadata.assignee.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-gray-700">{card.metadata.assignee}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 flex items-center gap-1.5"><User className="w-4 h-4" /> Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {card.metadata?.priority ? (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                          card.metadata.priority === 'Urgent' ? 'bg-red-50 text-red-600 border border-red-100' :
                          card.metadata.priority === 'High' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          'bg-gray-50 text-gray-600 border border-gray-200'
                        }`}>
                          {card.metadata.priority === 'Urgent' && <CircleDashed className="w-3.5 h-3.5" />}
                          {card.metadata.priority === 'High' && <ArrowRight className="w-3.5 h-3.5" />}
                          {card.metadata.priority}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {(card.metadata?.startDate || card.metadata?.endDate) ? (
                        <div className="flex items-center justify-end gap-2 text-sm text-gray-600 font-medium">
                          <Calendar className="w-4 h-4 text-orange-400" />
                          {card.metadata?.startDate || 'TBD'} <ArrowRight className="w-3 h-3 text-gray-300" /> {card.metadata?.endDate || 'TBD'}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {cards.length === 0 && (
            <div className="py-16 flex flex-col items-center justify-center text-gray-400">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <TableProperties className="w-8 h-8 text-gray-300" />
              </div>
              <p className="font-medium">No nodes exist in the board.</p>
              <p className="text-sm mt-1">Switch to Canvas to add some spatial data!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
