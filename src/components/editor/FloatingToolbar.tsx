import { ZoomIn, ZoomOut, Maximize2, Plus, Filter } from 'lucide-react';
import { useState } from 'react';
import { Card, LANE_TYPE_OPTIONS, LaneType } from '../../lib/types';
import { useMap } from '../../contexts/MapContext';

interface Props {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  statusFilter: Card['status'] | 'all';
  onStatusFilter: (s: Card['status'] | 'all') => void;
}

export default function FloatingToolbar({
  zoom, onZoomIn, onZoomOut, onFit,
  statusFilter, onStatusFilter,
}: Props) {
  const { addPhase, addLane } = useMap();
  const [showLaneMenu, setShowLaneMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const STATUS_OPTIONS = [
    { value: 'all' as const, label: 'All Statuses' },
    { value: 'current' as const, label: 'Current (AS-IS)' },
    { value: 'to_develop' as const, label: 'To Develop (TO-BE)' },
    { value: 'in_progress' as const, label: 'In Progress' },
    { value: 'done' as const, label: 'Done' },
    { value: 'remove' as const, label: 'Remove' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
      <div className="flex items-center gap-1 bg-white rounded-xl border border-neutral-light shadow-lg px-2 py-1.5">
        <button
          onClick={onZoomOut}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-neutral-mid transition-all"
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-xs text-neutral-mid font-medium px-1 min-w-[40px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={onZoomIn}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-neutral-mid transition-all"
          title="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={onFit}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-neutral-mid transition-all"
          title="Fit to screen"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-5 bg-neutral-light mx-1" />

        <button
          onClick={addPhase}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-gray-100 text-neutral-mid hover:text-teal transition-all text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Phase
        </button>

        <div className="relative">
          <button
            onClick={() => { setShowLaneMenu(!showLaneMenu); setShowFilterMenu(false); }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-gray-100 text-neutral-mid hover:text-teal transition-all text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Lane
          </button>
          {showLaneMenu && (
            <div className="absolute bottom-9 left-0 w-52 bg-white rounded-xl shadow-xl border border-neutral-light py-2 z-10">
              <p className="px-3 py-1 text-xs font-medium text-neutral-mid uppercase tracking-wider">Add Lane</p>
              {LANE_TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className="w-full px-3 py-2 text-left text-xs text-neutral-dark hover:bg-gray-50 transition-all"
                  onClick={() => { addLane(opt.value as LaneType, opt.label); setShowLaneMenu(false); }}
                >
                  {opt.label}
                  <span className="text-neutral-light ml-1 text-xs">({opt.group})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-neutral-light mx-1" />

        <div className="relative">
          <button
            onClick={() => { setShowFilterMenu(!showFilterMenu); setShowLaneMenu(false); }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all text-xs ${
              statusFilter !== 'all'
                ? 'bg-teal/10 text-teal font-medium'
                : 'hover:bg-gray-100 text-neutral-mid hover:text-teal'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            {statusFilter === 'all' ? 'Filter' : STATUS_OPTIONS.find(s => s.value === statusFilter)?.label}
          </button>
          {showFilterMenu && (
            <div className="absolute bottom-9 right-0 w-44 bg-white rounded-xl shadow-xl border border-neutral-light py-2 z-10">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-50 transition-all ${
                    statusFilter === opt.value ? 'text-teal font-medium' : 'text-neutral-dark'
                  }`}
                  onClick={() => { onStatusFilter(opt.value); setShowFilterMenu(false); }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
