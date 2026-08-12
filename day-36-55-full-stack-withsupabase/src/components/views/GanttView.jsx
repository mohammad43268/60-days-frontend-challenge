import React, { useMemo } from 'react';
import { usePlannerStore } from '../../store/usePlannerStore';
import { CalendarDays, Network, ArrowRight, GitMerge, Link as LinkIcon } from 'lucide-react';

export const GanttView = () => {
  const { cards, connections } = usePlannerStore();

  // Real JS Date Logic for current month
  const { daysInMonth, currentMonth, year, monthName } = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = today.toLocaleString('default', { month: 'long' });
    return { daysInMonth, currentMonth: month, year, monthName };
  }, []);

  const getPositionStyles = (startDateStr, endDateStr) => {
    if (!startDateStr || !endDateStr) return { marginLeft: '0%', width: '10%' }; // Fallback

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    // If not in current month, just show a sliver or clamp it (simplification for demo)
    let startDay = start.getMonth() === currentMonth ? start.getDate() : 1;
    let endDay = end.getMonth() === currentMonth ? end.getDate() : daysInMonth;

    // Safety bounds
    startDay = Math.max(1, startDay);
    endDay = Math.min(daysInMonth, Math.max(startDay + 1, endDay));

    const leftPercent = ((startDay - 1) / daysInMonth) * 100;
    const widthPercent = ((endDay - startDay + 1) / daysInMonth) * 100;

    return { marginLeft: `${leftPercent}%`, width: `${widthPercent}%` };
  };

  return (
    <div className="w-full h-full bg-[#161618] text-gray-200 p-8 pt-24 overflow-auto flex gap-6">
      {/* Main Gantt Area */}
      <div className="flex-1 flex flex-col w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
              Timeline
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {monthName} {year} Schedule
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-orange-400 bg-orange-500/20 px-4 py-2 rounded-full border border-orange-500/30">
            <CalendarDays className="w-4 h-4" />
            Current Month
          </div>
        </div>

        <div className="bg-[#2A2A35]/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex-1 flex flex-col">
          {/* Header row (Days) */}
          <div className="flex border-b border-white/10 bg-black/40">
            <div className="w-48 flex-shrink-0 border-r border-white/10 p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
              Node Details
            </div>
            <div className="flex-grow flex relative">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 border-r border-white/5 last:border-r-0 p-2 text-[10px] font-medium text-gray-500"
                >
                  Day {Math.floor((i / 5) * daysInMonth) + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Rows */}
          <div className="relative flex-1 p-2 space-y-2 overflow-y-auto custom-scrollbar">
            {/* Grid lines */}
            <div className="absolute top-0 bottom-0 left-48 right-0 flex pointer-events-none z-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 border-r border-white/5 border-dashed last:border-r-0"
                />
              ))}
            </div>

            {cards.map((card) => {
              const pos = getPositionStyles(card.metadata?.startDate, card.metadata?.endDate);
              const isTask = card.type === 'task' || card.type === 'todo';

              return (
                <div
                  key={card.id}
                  className="relative flex items-center h-14 bg-white/5 hover:bg-white/10 rounded-lg transition-colors z-10 group border border-transparent hover:border-white/10"
                >
                  <div className="w-48 flex-shrink-0 truncate px-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-200 truncate">
                        {isTask
                          ? card.content.length > 0
                            ? card.content[0].text
                            : 'Task'
                          : card.type.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-gray-500 mt-0.5">
                        {card.metadata?.assignee || 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  <div className="flex-grow relative h-full flex items-center pr-4">
                    <div
                      className={`h-8 rounded-lg flex items-center px-3 text-xs font-bold truncate shadow-sm transition-transform hover:scale-[1.02] cursor-pointer ${
                        card.type === 'task'
                          ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-white border border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.4)]'
                          : 'bg-white/10 text-gray-300 border border-white/20'
                      }`}
                      style={{ marginLeft: pos.marginLeft, width: pos.width }}
                    >
                      {card.metadata?.startDate || card.metadata?.endDate
                        ? `${new Date(card.metadata.startDate).getDate()} - ${new Date(card.metadata.endDate).getDate()} ${monthName.substring(0, 3)}`
                        : 'Unscheduled'}
                    </div>
                  </div>
                </div>
              );
            })}

            {cards.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center text-gray-500 z-10 relative">
                <CalendarDays className="w-10 h-10 text-gray-600 mb-3" />
                <p className="font-medium text-gray-400">Timeline is empty</p>
                <p className="text-sm mt-1">Nodes with dates will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schema / Relations Sidebar */}
      <div className="w-80 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
              Schema
            </h1>
            <p className="text-sm text-gray-400 mt-1">Node Relationships</p>
          </div>
        </div>

        <div className="bg-[#2A2A35]/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-200 pb-2 border-b border-white/10">
            <Network className="w-4 h-4 text-orange-500" />
            Active Connections
          </div>

          {connections.length === 0 ? (
            <div className="text-center py-10 text-sm text-gray-500">
              <LinkIcon className="w-8 h-8 text-gray-700 mx-auto mb-2" />
              No connections established.
            </div>
          ) : (
            connections.map((conn) => {
              const sourceCard = cards.find((c) => c.id === conn.source);
              const targetCard = cards.find((c) => c.id === conn.target);
              if (!sourceCard || !targetCard) return null;

              return (
                <div
                  key={conn.id}
                  className="bg-black/40 rounded-xl p-3 border border-white/5 hover:border-orange-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        conn.type === 'blocks'
                          ? 'bg-red-500/20 text-red-400'
                          : conn.type === 'depends_on'
                            ? 'bg-amber-500/20 text-amber-400'
                            : conn.type === 'owned_by'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {conn.type.replace('_', ' ')}
                    </span>
                    <GitMerge className="w-3.5 h-3.5 text-gray-500" />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mt-2">
                    <div className="flex-1 truncate bg-white/5 border border-white/10 px-2 py-1 rounded">
                      {sourceCard.type.toUpperCase()}
                    </div>
                    <ArrowRight className="w-3 h-3 text-gray-600 shrink-0" />
                    <div className="flex-1 truncate bg-white/5 border border-white/10 px-2 py-1 rounded">
                      {targetCard.type.toUpperCase()}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
