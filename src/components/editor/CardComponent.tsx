import { useState } from 'react';
import { MoreHorizontal, Link, Trash2, Tag } from 'lucide-react';
import { Card, STATUS_CONFIG } from '../../lib/types';
import { useMap } from '../../contexts/MapContext';

interface Props {
  card: Card;
  isSelected: boolean;
  onClick: () => void;
}

const COLOR_OPTIONS = [
  '#3CBFB0', '#4A90D9', '#E8873A', '#E04C4C',
  '#F5A623', '#9B59B6', '#2ECC71', '#6B7280',
];

export default function CardComponent({ card, isSelected, onClick }: Props) {
  const { updateCard, deleteCard } = useMap();
  const [menuOpen, setMenuOpen] = useState(false);
  const [colorPicker, setColorPicker] = useState(false);
  const [inlineEdit, setInlineEdit] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);

  const statusCfg = STATUS_CONFIG[card.status];

  const commitTitle = async () => {
    setInlineEdit(false);
    if (editTitle.trim() !== card.title) {
      await updateCard({ ...card, title: editTitle.trim() || card.title });
    }
  };

  const setStatus = async (status: Card['status']) => {
    await updateCard({ ...card, status });
    setMenuOpen(false);
  };

  const setColor = async (color: string) => {
    await updateCard({ ...card, color });
    setColorPicker(false);
    setMenuOpen(false);
  };

  return (
    <div
      className={`card-item relative bg-white rounded-md border text-left group ${
        isSelected ? 'border-teal shadow-card-hover' : 'border-neutral-light shadow-card'
      }`}
      style={{ borderWidth: isSelected ? 2 : 1 }}
      onClick={() => { if (!menuOpen) onClick(); }}
    >
      <div className="px-2 py-1.5">
        <div className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: card.color }}
          />
          {inlineEdit ? (
            <input
              autoFocus
              className="flex-1 text-xs font-medium text-neutral-dark bg-transparent border-b border-teal focus:outline-none min-w-0"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={e => { if (e.key === 'Enter') commitTitle(); if (e.key === 'Escape') { setInlineEdit(false); setEditTitle(card.title); } }}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span
              className="flex-1 text-xs font-medium text-neutral-dark truncate leading-tight cursor-text"
              title={card.title}
              onDoubleClick={e => { e.stopPropagation(); setEditTitle(card.title); setInlineEdit(true); }}
            >
              {card.title || <span className="text-neutral-light italic">Untitled</span>}
            </span>
          )}
          <button
            className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 flex-shrink-0 transition-all"
            onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen); setColorPicker(false); }}
          >
            <MoreHorizontal className="w-3 h-3 text-neutral-mid" />
          </button>
        </div>

        <div className="flex items-center gap-1 mt-1 justify-end">
          {card.status !== 'current' && (
            <span
              className="inline-flex items-center px-1.5 py-0.5 rounded text-white font-medium"
              style={{ fontSize: 9, background: statusCfg.bg, letterSpacing: '0.3px' }}
            >
              {statusCfg.label.toUpperCase()}
            </span>
          )}
          {card.links.length > 0 && <Link className="w-2.5 h-2.5 text-neutral-mid" />}
          {card.tags.length > 0 && <Tag className="w-2.5 h-2.5 text-neutral-mid" />}
        </div>
      </div>

      {menuOpen && (
        <div
          className="absolute top-0 right-6 w-44 bg-white rounded-lg shadow-lg border border-neutral-light py-1 z-20"
          onClick={e => e.stopPropagation()}
        >
          <button
            className="w-full px-3 py-1.5 text-left text-xs text-neutral-dark hover:bg-gray-50 flex items-center gap-2"
            onClick={() => { setMenuOpen(false); setEditTitle(card.title); setInlineEdit(true); }}
          >
            Edit Title
          </button>
          <div className="border-t border-neutral-light my-1" />
          <div className="px-3 py-1 text-xs text-neutral-mid font-medium">Set Status</div>
          {(Object.entries(STATUS_CONFIG) as [Card['status'], typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]][]).map(([key, cfg]) => (
            <button
              key={key}
              className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 flex items-center gap-2"
              onClick={() => setStatus(key)}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.bg }} />
              <span className={card.status === key ? 'font-medium text-neutral-dark' : 'text-neutral-mid'}>
                {cfg.label}
              </span>
            </button>
          ))}
          <div className="border-t border-neutral-light my-1" />
          <button
            className="w-full px-3 py-1.5 text-left text-xs text-neutral-dark hover:bg-gray-50 flex items-center gap-2"
            onClick={() => { setColorPicker(true); setMenuOpen(false); }}
          >
            Set Colour
          </button>
          <div className="border-t border-neutral-light my-1" />
          <button
            className="w-full px-3 py-1.5 text-left text-xs text-red-500 hover:bg-red-50 flex items-center gap-2"
            onClick={() => { deleteCard(card.id); setMenuOpen(false); }}
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      )}

      {colorPicker && (
        <div
          className="absolute top-0 right-6 bg-white rounded-lg shadow-lg border border-neutral-light p-3 z-20"
          onClick={e => e.stopPropagation()}
        >
          <p className="text-xs font-medium text-neutral-mid mb-2">Card Colour</p>
          <div className="grid grid-cols-4 gap-1.5">
            {COLOR_OPTIONS.map(c => (
              <button
                key={c}
                className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${card.color === c ? 'ring-2 ring-offset-1 ring-neutral-dark' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
          <button
            className="mt-2 text-xs text-neutral-mid hover:text-neutral-dark w-full text-center"
            onClick={() => setColorPicker(false)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
