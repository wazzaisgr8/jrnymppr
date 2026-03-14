import { useState } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { useMap } from '../../contexts/MapContext';
import MapGrid from './MapGrid';
import PersonaHeaderBand from './PersonaHeaderBand';

interface Props {
  onClose: () => void;
}

const PHASE_WIDTH = 200;
const LANE_LABEL_WIDTH = 160;

export default function PresentationMode({ onClose }: Props) {
  const { state } = useMap();
  const { map, phases } = state;
  const [zoom, setZoom] = useState(0.85);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between px-6 py-3 bg-black/50 backdrop-blur-sm">
        <div>
          <h1 className="text-white font-semibold text-base">{map?.title}</h1>
          <p className="text-white/50 text-xs">{phases.length} phases</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setZoom(z => Math.max(0.4, z - 0.1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-white/70 text-xs min-w-[40px] text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-white/20" />
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-all"
          >
            <X className="w-4 h-4" />
            Exit
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto" style={{ background: '#0f0f0f' }}>
        <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', transition: 'transform 200ms ease' }}>
          <PersonaHeaderBand
            phaseWidth={PHASE_WIDTH}
            laneWidth={LANE_LABEL_WIDTH}
            phaseCount={phases.length}
          />
          <MapGrid phaseWidth={PHASE_WIDTH} statusFilter="all" />
        </div>
      </div>
    </div>
  );
}
