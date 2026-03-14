import { useEffect, useState, useRef } from 'react';
import { MapProvider, useMap } from '../../contexts/MapContext';
import EditorToolbar from './EditorToolbar';
import PersonaHeaderBand from './PersonaHeaderBand';
import MapGrid from './MapGrid';
import ExpandedCardPanel from './ExpandedCardPanel';
import FloatingToolbar from './FloatingToolbar';
import PresentationMode from './PresentationMode';
import { Card } from '../../lib/types';

interface EditorInnerProps {
  mapId: string;
  onBack: () => void;
}

function EditorInner({ mapId, onBack }: EditorInnerProps) {
  const { state, loadMap, selectCard } = useMap();
  const { phases, loading, selectedCardId, cards } = state;
  const [zoom, setZoom] = useState(1);
  const [statusFilter, setStatusFilter] = useState<Card['status'] | 'all'>('all');
  const [presenting, setPresenting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const PHASE_WIDTH = Math.round(200 * zoom);
  const LANE_LABEL_WIDTH = 160;

  useEffect(() => {
    loadMap(mapId);
  }, [mapId]);

  const selectedCard = selectedCardId ? cards.find(c => c.id === selectedCardId) ?? null : null;

  const handleZoomIn = () => setZoom(z => Math.min(1.5, +(z + 0.1).toFixed(1)));
  const handleZoomOut = () => setZoom(z => Math.max(0.5, +(z - 0.1).toFixed(1)));
  const handleFit = () => {
    if (!scrollRef.current) return;
    const containerWidth = scrollRef.current.clientWidth;
    const contentWidth = LANE_LABEL_WIDTH + phases.length * 200;
    const fitZoom = Math.min(1, (containerWidth - 32) / contentWidth);
    setZoom(+Math.max(0.5, fitZoom).toFixed(2));
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-teal border-t-transparent animate-spin" />
          <p className="text-sm text-neutral-mid">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-canvas overflow-hidden">
      <EditorToolbar onBack={onBack} onPresent={() => setPresenting(true)} />

      <div
        ref={scrollRef}
        className="flex-1 overflow-auto relative"
        style={{ background: '#F0F0ED' }}
      >
        <div style={{ minWidth: LANE_LABEL_WIDTH + phases.length * PHASE_WIDTH + 56 }}>
          <PersonaHeaderBand
            phaseWidth={PHASE_WIDTH}
            laneWidth={LANE_LABEL_WIDTH}
            phaseCount={phases.length}
          />
          <MapGrid phaseWidth={PHASE_WIDTH} statusFilter={statusFilter} />
        </div>

        {phases.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center bg-white rounded-2xl p-10 shadow-sm border border-neutral-light max-w-sm pointer-events-auto">
              <div className="w-14 h-14 rounded-xl bg-teal/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-neutral-dark mb-2">Start mapping</h3>
              <p className="text-sm text-neutral-mid mb-4 leading-relaxed">
                Add your first phase using the toolbar below, then start adding lanes and cards.
              </p>
            </div>
          </div>
        )}
      </div>

      {selectedCard && (
        <ExpandedCardPanel
          card={selectedCard}
          onClose={() => selectCard(null)}
        />
      )}

      <FloatingToolbar
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFit={handleFit}
        statusFilter={statusFilter}
        onStatusFilter={setStatusFilter}
      />

      {presenting && (
        <PresentationMode onClose={() => setPresenting(false)} />
      )}
    </div>
  );
}

interface Props {
  mapId: string;
  onBack: () => void;
}

export default function MapEditor({ mapId, onBack }: Props) {
  return (
    <MapProvider>
      <EditorInner mapId={mapId} onBack={onBack} />
    </MapProvider>
  );
}
