import { useState } from 'react';
import { Map, MoreHorizontal, Trash2, Copy, ExternalLink, Clock } from 'lucide-react';
import { JourneyMap } from '../../lib/types';

interface Props {
  map: JourneyMap;
  onOpen: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const CARD_COLORS = ['#3CBFB0', '#4A90D9', '#E8873A', '#9B59B6', '#E04C4C', '#F5A623'];

export default function MapCard({ map, onOpen, onDelete, onDuplicate }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const colorIndex = map.id.charCodeAt(0) % CARD_COLORS.length;
  const accentColor = CARD_COLORS[colorIndex];

  const formatDate = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      className="bg-white rounded-xl border border-neutral-light hover:border-teal hover:shadow-card-hover transition-all cursor-pointer group overflow-hidden"
      onClick={onOpen}
    >
      <div className="h-24 relative overflow-hidden" style={{ background: `${accentColor}18` }}>
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <Map className="w-16 h-16" style={{ color: accentColor }} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: accentColor }} />
        <div className="absolute top-2 right-2">
          <button
            className="w-7 h-7 rounded-lg bg-white/80 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
            onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          >
            <MoreHorizontal className="w-4 h-4 text-neutral-mid" />
          </button>
          {menuOpen && (
            <div
              className="absolute top-8 right-0 w-40 bg-white rounded-lg shadow-lg border border-neutral-light py-1 z-10"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="w-full px-3 py-2 text-left text-sm text-neutral-dark hover:bg-gray-50 flex items-center gap-2"
                onClick={() => { onOpen(); setMenuOpen(false); }}
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open
              </button>
              <button
                className="w-full px-3 py-2 text-left text-sm text-neutral-dark hover:bg-gray-50 flex items-center gap-2"
                onClick={() => { onDuplicate(); setMenuOpen(false); }}
              >
                <Copy className="w-3.5 h-3.5" /> Duplicate
              </button>
              <div className="border-t border-neutral-light my-1" />
              <button
                className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                onClick={() => { onDelete(); setMenuOpen(false); }}
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm text-neutral-dark truncate">{map.title}</h3>
        {map.description && (
          <p className="text-xs text-neutral-mid mt-0.5 truncate">{map.description}</p>
        )}
        <div className="flex items-center gap-1 mt-2 text-xs text-neutral-mid">
          <Clock className="w-3 h-3" />
          <span>{formatDate(map.updated_at)}</span>
        </div>
        {map.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {map.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-neutral-mid text-xs rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
