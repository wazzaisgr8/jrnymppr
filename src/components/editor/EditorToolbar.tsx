import { useState } from 'react';
import { ArrowLeft, Share2, Play, MoreHorizontal, Check, Loader2 } from 'lucide-react';
import { useMap } from '../../contexts/MapContext';

interface Props {
  onBack: () => void;
  onPresent: () => void;
}

export default function EditorToolbar({ onBack, onPresent }: Props) {
  const { state, updateMapTitle } = useMap();
  const { map, saveStatus } = state;
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');

  const startEdit = () => {
    setTitleValue(map?.title ?? '');
    setEditingTitle(true);
  };

  const commitTitle = () => {
    if (titleValue.trim() && titleValue !== map?.title) {
      updateMapTitle(titleValue.trim());
    }
    setEditingTitle(false);
  };

  return (
    <div
      className="h-12 bg-white border-b border-neutral-light flex items-center px-4 gap-3 flex-shrink-0"
      style={{ zIndex: 40 }}
    >
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-neutral-mid hover:text-neutral-dark text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs">Back</span>
      </button>

      <div className="w-px h-5 bg-neutral-light" />

      <div className="flex-1 flex items-center gap-3 min-w-0">
        {editingTitle ? (
          <input
            autoFocus
            type="text"
            value={titleValue}
            onChange={e => setTitleValue(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={e => { if (e.key === 'Enter') commitTitle(); if (e.key === 'Escape') setEditingTitle(false); }}
            className="text-sm font-semibold text-neutral-dark bg-transparent border-b-2 border-teal focus:outline-none max-w-xs"
          />
        ) : (
          <button
            onClick={startEdit}
            className="text-sm font-semibold text-neutral-dark hover:text-teal transition-colors truncate max-w-xs"
            title="Click to rename"
          >
            {map?.title ?? 'Loading...'}
          </button>
        )}

        <div className="flex items-center gap-1.5 text-xs text-neutral-mid flex-shrink-0">
          {saveStatus === 'saving' ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Saving...</span>
            </>
          ) : saveStatus === 'saved' ? (
            <>
              <Check className="w-3 h-3 text-teal" />
              <span>Saved</span>
            </>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onPresent}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-light hover:border-teal text-neutral-dark hover:text-teal rounded-lg text-xs font-medium transition-all"
        >
          <Play className="w-3.5 h-3.5" />
          Present
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-teal hover:bg-teal-dark text-white rounded-lg text-xs font-medium transition-all">
          <Share2 className="w-3.5 h-3.5" />
          Share
        </button>
        <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all">
          <MoreHorizontal className="w-4 h-4 text-neutral-mid" />
        </button>
      </div>
    </div>
  );
}
