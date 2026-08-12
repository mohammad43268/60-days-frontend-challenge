import React, { useMemo } from 'react';
import { usePlannerStore } from '../../store/usePlannerStore';
import {
  User,
  Calendar,
  CircleDashed,
  CheckCircle2,
  ArrowRight,
  TableProperties,
} from 'lucide-react';

export const TableView = () => {
  const { cards } = usePlannerStore();

  return (
    <div className="w-full h-full bg-[#161618] text-gray-200 p-8 pt-24 overflow-auto">
      <div className="w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
              Node Directory
            </h1>
            <p className="text-sm text-gray-400 mt-1">Structured view of your spatial data</p>
          </div>
          <div className="text-sm font-medium text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/10 shadow-sm">
            {cards.length} Total Nodes
          </div>
        </div>

        <div className="bg-[#2A2A35]/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 border-b border-white/10 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Node Type</th>
                <th className="px-6 py-4">Content / Progress</th>
                <th className="px-6 py-4">Assignee</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4 text-right">Timeline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {cards.map((card) => {
                let progress = 0;
                let isTask = card.type === 'task' || card.type === 'todo';
                if (isTask && Array.isArray(card.content)) {
                  const completed = card.content.filter((t) => t.done).length;
                  progress = card.content.length > 0 ? (completed / card.content.length) * 100 : 0;
                }

                return (
                  <tr key={card.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-sm">
                        {card.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {isTask ? (
                        <div className="flex flex-col gap-2 max-w-[300px]">
                          <span className="text-sm font-medium text-gray-200 truncate">
                            {card.content.length > 0 ? card.content[0].text : 'Empty Checklist'}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-black/40 border border-white/5 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-orange-500 h-full rounded-full transition-all shadow-[0_0_10px_rgba(249,115,22,0.8)]"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-gray-500">
                              {Math.round(progress)}%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-gray-300 truncate max-w-[300px] block">
                          {typeof card.content === 'string' ? card.content : 'Complex Content'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {card.metadata?.assignee ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center text-xs font-bold shadow-[0_0_10px_rgba(249,115,22,0.5)]">
                            {card.metadata.assignee.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-gray-300">
                            {card.metadata.assignee}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 flex items-center gap-1.5">
                          <User className="w-4 h-4" /> Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {card.metadata?.priority ? (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                            card.metadata.priority === 'Urgent'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : card.metadata.priority === 'High'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-white/5 text-gray-300 border border-white/10'
                          }`}
                        >
                          {card.metadata.priority === 'Urgent' && (
                            <CircleDashed className="w-3.5 h-3.5" />
                          )}
                          {card.metadata.priority === 'High' && (
                            <ArrowRight className="w-3.5 h-3.5" />
                          )}
                          {card.metadata.priority}
                        </span>
                      ) : (
                        <span className="text-gray-600 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {card.metadata?.startDate || card.metadata?.endDate ? (
                        <div className="flex items-center justify-end gap-2 text-sm text-gray-400 font-medium">
                          <Calendar className="w-4 h-4 text-orange-500 drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]" />
                          {card.metadata?.startDate || 'TBD'}{' '}
                          <ArrowRight className="w-3 h-3 text-gray-600" />{' '}
                          {card.metadata?.endDate || 'TBD'}
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
            <div className="py-16 flex flex-col items-center justify-center text-gray-500">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <TableProperties className="w-8 h-8 text-gray-600" />
              </div>
              <p className="font-medium text-gray-400">No nodes exist in the board.</p>
              <p className="text-sm mt-1">Switch to Canvas to add some spatial data!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
