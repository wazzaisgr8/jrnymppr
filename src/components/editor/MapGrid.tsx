import { useState } from 'react';
import { Plus, ChevronDown, ChevronRight, MoreHorizontal, Trash2, CreditCard as Edit2 } from 'lucide-react';
import { Phase, Lane, Card, LANE_COLORS } from '../../lib/types';
import { useMap } from '../../contexts/MapContext';
import CardComponent from './CardComponent';
import EmotionCurve from './EmotionCurve';

interface Props {
  phaseWidth: number;
  statusFilter: Card['status'] | 'all';
}

const LANE_HEIGHT = 100;
const EMOTION_LANE_HEIGHT = 100;
const PHASE_HEADER_HEIGHT = 44;
const LANE_LABEL_WIDTH = 160;

export default function MapGrid({ phaseWidth, statusFilter }: Props) {
  const { state, addCard, updatePhase, deletePhase, updateLane, deleteLane, toggleLaneCollapse, selectCard } = useMap();
  const { phases, lanes, cards, emotionPoints, selectedCardId } = state;

  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null);
  const [editingPhaseValue, setEditingPhaseValue] = useState('');
  const [editingLaneId, setEditingLaneId] = useState<string | null>(null);
  const [editingLaneValue, setEditingLaneValue] = useState('');
  const [addingCard, setAddingCard] = useState<{ phaseId: string; laneId: string } | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [phaseMenu, setPhaseMenu] = useState<string | null>(null);
  const [laneMenu, setLaneMenu] = useState<string | null>(null);

  const topLanes = lanes.filter(l => !l.parent_lane_id).sort((a, b) => a.position - b.position);
  const totalWidth = LANE_LABEL_WIDTH + phases.length * phaseWidth;

  const filteredCards = statusFilter === 'all' ? cards : cards.filter(c => c.status === statusFilter);

  const getCardsAt = (phaseId: string, laneId: string) =>
    filteredCards.filter(c => c.phase_id === phaseId && c.lane_id === laneId);

  const commitPhaseEdit = (phase: Phase) => {
    if (editingPhaseValue.trim()) updatePhase({ ...phase, name: editingPhaseValue.trim() });
    setEditingPhaseId(null);
  };

  const commitLaneEdit = (lane: Lane) => {
    if (editingLaneValue.trim()) updateLane({ ...lane, name: editingLaneValue.trim() });
    setEditingLaneId(null);
  };

  const commitAddCard = async () => {
    if (addingCard && newCardTitle.trim()) {
      await addCard(addingCard.phaseId, addingCard.laneId, newCardTitle.trim());
    }
    setAddingCard(null);
    setNewCardTitle('');
  };

  const laneColors = (lane: Lane) => LANE_COLORS[lane.lane_type] ?? LANE_COLORS.custom;
  const subLanesOf = (id: string) => lanes.filter(l => l.parent_lane_id === id).sort((a, b) => a.position - b.position);

  const renderLaneRow = (lane: Lane, isSubLane = false) => {
    const colors = laneColors(lane);
    const isEmotion = lane.lane_type === 'emotion';
    const subs = subLanesOf(lane.id);
    const laneHeight = isEmotion ? EMOTION_LANE_HEIGHT : LANE_HEIGHT;

    return (
      <div key={lane.id}>
        <div className="flex" style={{ minHeight: laneHeight, background: colors.bg }}>
          <div
            className="sticky-lane flex items-center border-r border-neutral-light border-b"
            style={{
              width: LANE_LABEL_WIDTH,
              minWidth: LANE_LABEL_WIDTH,
              background: colors.bg,
              paddingLeft: isSubLane ? 20 : 4,
              borderBottom: '1px solid #E5E7EB',
            }}
          >
            <div className="w-1 self-stretch flex-shrink-0 rounded-sm mr-2" style={{ background: colors.accent }} />
            {subs.length > 0 && (
              <button
                className="w-4 h-4 flex items-center justify-center text-neutral-mid hover:text-neutral-dark flex-shrink-0 mr-1"
                onClick={() => toggleLaneCollapse(lane.id)}
              >
                {lane.is_collapsed
                  ? <ChevronRight className="w-3 h-3" />
                  : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
            <div className="flex-1 min-w-0 flex items-center justify-end pr-2 group/lane">
              {editingLaneId === lane.id ? (
                <input
                  autoFocus
                  className="w-full text-right text-xs border-b border-teal bg-transparent focus:outline-none"
                  value={editingLaneValue}
                  onChange={e => setEditingLaneValue(e.target.value)}
                  onBlur={() => commitLaneEdit(lane)}
                  onKeyDown={e => { if (e.key === 'Enter') commitLaneEdit(lane); if (e.key === 'Escape') setEditingLaneId(null); }}
                />
              ) : (
                <span
                  className={`text-right truncate cursor-text ${isSubLane ? 'text-xs italic text-neutral-mid' : 'text-xs font-medium text-gray-600'}`}
                  onDoubleClick={() => { setEditingLaneId(lane.id); setEditingLaneValue(lane.name); }}
                  title={lane.name}
                >
                  {lane.name}
                </span>
              )}
              <button
                className="ml-1 opacity-0 group-hover/lane:opacity-100 w-4 h-4 flex items-center justify-center"
                onClick={() => setLaneMenu(laneMenu === lane.id ? null : lane.id)}
              >
                <MoreHorizontal className="w-3 h-3 text-neutral-mid" />
              </button>
              {laneMenu === lane.id && (
                <div className="absolute right-2 bg-white rounded-lg shadow-lg border border-neutral-light py-1 z-20 w-32">
                  <button
                    className="w-full px-3 py-1.5 text-left text-xs text-neutral-dark hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => { setEditingLaneId(lane.id); setEditingLaneValue(lane.name); setLaneMenu(null); }}
                  >
                    <Edit2 className="w-3 h-3" /> Rename
                  </button>
                  <button
                    className="w-full px-3 py-1.5 text-left text-xs text-red-500 hover:bg-red-50 flex items-center gap-2"
                    onClick={() => { deleteLane(lane.id); setLaneMenu(null); }}
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {isEmotion ? (
            <div className="flex-1 border-b border-neutral-light overflow-hidden" style={{ minWidth: phases.length * phaseWidth }}>
              <EmotionCurve
                phases={phases}
                emotionPoints={emotionPoints}
                phaseWidth={phaseWidth}
                laneWidth={LANE_LABEL_WIDTH}
              />
            </div>
          ) : (
            phases.map((phase, pi) => {
              const cellCards = getCardsAt(phase.id, lane.id);
              const isOdd = pi % 2 === 0;
              return (
                <div
                  key={phase.id}
                  className="border-r border-b border-neutral-light p-1.5 group/cell relative"
                  style={{
                    width: phaseWidth, minWidth: phaseWidth,
                    background: isOdd ? colors.bg : `${colors.bg}cc`,
                    minHeight: laneHeight,
                  }}
                >
                  <div className="space-y-1">
                    {cellCards.map(card => (
                      <CardComponent
                        key={card.id}
                        card={card}
                        isSelected={selectedCardId === card.id}
                        onClick={() => selectCard(selectedCardId === card.id ? null : card.id)}
                      />
                    ))}
                    {addingCard?.phaseId === phase.id && addingCard?.laneId === lane.id ? (
                      <div className="bg-white rounded-md border-2 border-teal p-1.5">
                        <input
                          autoFocus
                          className="w-full text-xs text-neutral-dark bg-transparent focus:outline-none"
                          value={newCardTitle}
                          onChange={e => setNewCardTitle(e.target.value)}
                          onBlur={commitAddCard}
                          onKeyDown={e => { if (e.key === 'Enter') commitAddCard(); if (e.key === 'Escape') { setAddingCard(null); setNewCardTitle(''); } }}
                          placeholder="Card title..."
                        />
                      </div>
                    ) : (
                      <button
                        className="opacity-0 group-hover/cell:opacity-100 w-full flex items-center justify-center h-7 rounded-md border border-dashed border-neutral-light text-neutral-mid hover:border-teal hover:text-teal transition-all"
                        onClick={() => { setAddingCard({ phaseId: phase.id, laneId: lane.id }); setNewCardTitle(''); }}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {!lane.is_collapsed && subs.map(sub => renderLaneRow(sub, true))}
      </div>
    );
  };

  return (
    <div className="flex flex-col" style={{ minWidth: totalWidth }}>
      <div className="flex sticky-phase bg-white border-b border-neutral-light" style={{ height: PHASE_HEADER_HEIGHT }}>
        <div
          className="sticky-corner bg-white border-r border-b border-neutral-light flex items-center px-3"
          style={{ width: LANE_LABEL_WIDTH, minWidth: LANE_LABEL_WIDTH, height: PHASE_HEADER_HEIGHT }}
        >
          <span className="text-xs font-medium text-neutral-mid">Phases</span>
        </div>
        {phases.map((phase, i) => (
          <div
            key={phase.id}
            className="border-r border-b border-neutral-light flex items-center justify-center relative group/phase"
            style={{ width: phaseWidth, minWidth: phaseWidth, background: i % 2 === 0 ? '#fff' : '#F8F8F6' }}
          >
            {editingPhaseId === phase.id ? (
              <input
                autoFocus
                className="text-xs font-semibold uppercase tracking-wide text-neutral-dark bg-transparent border-b border-teal focus:outline-none text-center w-full px-2"
                value={editingPhaseValue}
                onChange={e => setEditingPhaseValue(e.target.value)}
                onBlur={() => commitPhaseEdit(phase)}
                onKeyDown={e => { if (e.key === 'Enter') commitPhaseEdit(phase); if (e.key === 'Escape') setEditingPhaseId(null); }}
              />
            ) : (
              <span
                className="text-xs font-semibold uppercase tracking-wide text-neutral-dark cursor-text select-none truncate px-2 text-center"
                style={{ letterSpacing: '0.5px' }}
                onDoubleClick={() => { setEditingPhaseId(phase.id); setEditingPhaseValue(phase.name); }}
              >
                {phase.name}
              </span>
            )}
            <div className="absolute right-1 opacity-0 group-hover/phase:opacity-100 flex gap-0.5">
              <button
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100"
                onClick={() => { setPhaseMenu(phaseMenu === phase.id ? null : phase.id); }}
              >
                <MoreHorizontal className="w-3 h-3 text-neutral-mid" />
              </button>
              {phaseMenu === phase.id && (
                <div className="absolute top-5 right-0 w-32 bg-white rounded-lg shadow-lg border border-neutral-light py-1 z-20">
                  <button
                    className="w-full px-3 py-1.5 text-left text-xs text-neutral-dark hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => { setEditingPhaseId(phase.id); setEditingPhaseValue(phase.name); setPhaseMenu(null); }}
                  >
                    <Edit2 className="w-3 h-3" /> Rename
                  </button>
                  <button
                    className="w-full px-3 py-1.5 text-left text-xs text-red-500 hover:bg-red-50 flex items-center gap-2"
                    onClick={() => { deletePhase(phase.id); setPhaseMenu(null); }}
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        <div
          className="border-b border-neutral-light flex items-center px-2"
          style={{ minWidth: 56, background: '#F8F8F6' }}
        />
      </div>

      {topLanes.map(lane => renderLaneRow(lane))}

      {topLanes.length === 0 && (
        <div className="flex items-center justify-center py-16 text-center" style={{ minWidth: totalWidth }}>
          <div>
            <p className="text-sm text-neutral-mid mb-2">No lanes yet</p>
            <p className="text-xs text-neutral-mid">Use the toolbar below to add a lane</p>
          </div>
        </div>
      )}
    </div>
  );
}
