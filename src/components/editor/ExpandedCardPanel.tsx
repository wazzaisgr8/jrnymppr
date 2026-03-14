import { useState, useEffect } from 'react';
import { X, Trash2, Plus } from 'lucide-react';
import { Card, STATUS_CONFIG } from '../../lib/types';
import { useMap } from '../../contexts/MapContext';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  card: Card;
  onClose: () => void;
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  user_email?: string;
}

const COLOR_OPTIONS = [
  '#3CBFB0', '#4A90D9', '#E8873A', '#E04C4C',
  '#F5A623', '#9B59B6', '#2ECC71', '#6B7280',
];

export default function ExpandedCardPanel({ card, onClose }: Props) {
  const { updateCard, deleteCard } = useMap();
  const { user } = useAuth();
  const [form, setForm] = useState({ title: card.title, body: card.body, status: card.status, color: card.color, tags: card.tags });
  const [newTag, setNewTag] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({ title: card.title, body: card.body, status: card.status, color: card.color, tags: card.tags });
  }, [card.id]);

  useEffect(() => {
    supabase.from('comments').select('*').eq('card_id', card.id).order('created_at')
      .then(({ data }) => setComments(data ?? []));
  }, [card.id]);

  const save = async () => {
    setSaving(true);
    await updateCard({ ...card, ...form });
    setSaving(false);
  };

  const addTag = () => {
    if (newTag.trim() && !form.tags.includes(newTag.trim())) {
      setForm({ ...form, tags: [...form.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (t: string) => setForm({ ...form, tags: form.tags.filter(x => x !== t) });

  const postComment = async () => {
    if (!newComment.trim() || !user) return;
    const { data } = await supabase.from('comments').insert({
      map_id: card.map_id, card_id: card.id,
      user_id: user.id, content: newComment.trim(),
    }).select().maybeSingle();
    if (data) { setComments(prev => [...prev, data]); setNewComment(''); }
  };

  const handleDelete = () => {
    deleteCard(card.id);
    onClose();
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 w-80 bg-white border-l border-neutral-light shadow-xl flex flex-col panel-slide-in z-30">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-light flex-shrink-0">
        <h3 className="text-sm font-semibold text-neutral-dark">Card Details</h3>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100">
          <X className="w-4 h-4 text-neutral-mid" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div>
          <label className="block text-xs font-medium text-neutral-mid mb-1">Title</label>
          <input
            className="w-full px-3 py-2 border border-neutral-light rounded-lg text-sm font-medium text-neutral-dark focus:border-teal focus:ring-2 focus:ring-teal/10"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-mid mb-1">Description</label>
          <textarea
            className="w-full px-3 py-2 border border-neutral-light rounded-lg text-sm text-neutral-dark focus:border-teal focus:ring-2 focus:ring-teal/10 resize-none"
            rows={4}
            value={form.body}
            onChange={e => setForm({ ...form, body: e.target.value })}
            placeholder="Add details, context, or insights..."
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-mid mb-1.5">Status</label>
          <div className="grid grid-cols-2 gap-1.5">
            {(Object.entries(STATUS_CONFIG) as [Card['status'], typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]][]).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setForm({ ...form, status: key })}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  form.status === key ? 'text-white border-transparent' : 'bg-white border-neutral-light text-neutral-mid hover:border-gray-300'
                }`}
                style={form.status === key ? { background: cfg.bg } : {}}
              >
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-mid mb-1.5">Colour</label>
          <div className="flex gap-2 flex-wrap">
            {COLOR_OPTIONS.map(c => (
              <button
                key={c}
                className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${form.color === c ? 'ring-2 ring-offset-1 ring-neutral-dark' : ''}`}
                style={{ background: c }}
                onClick={() => setForm({ ...form, color: c })}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-mid mb-1.5">Tags</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {form.tags.map(t => (
              <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal/10 text-teal rounded text-xs">
                {t}
                <button onClick={() => removeTag(t)} className="hover:text-red-500">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-1.5">
            <input
              className="flex-1 px-2 py-1.5 border border-neutral-light rounded-lg text-xs focus:border-teal focus:ring-2 focus:ring-teal/10"
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addTag(); }}
              placeholder="Add tag..."
            />
            <button
              onClick={addTag}
              className="px-2 py-1.5 bg-teal text-white rounded-lg text-xs hover:bg-teal-dark transition-all"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="border-t border-neutral-light pt-4">
          <label className="block text-xs font-medium text-neutral-mid mb-3">Comments</label>
          {comments.length === 0 && (
            <p className="text-xs text-neutral-mid text-center py-2">No comments yet</p>
          )}
          <div className="space-y-2 mb-3">
            {comments.map(c => (
              <div key={c.id} className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs text-neutral-dark">{c.content}</p>
                <p className="text-xs text-neutral-mid mt-1">
                  {new Date(c.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
          <div className="flex gap-1.5">
            <input
              className="flex-1 px-2 py-1.5 border border-neutral-light rounded-lg text-xs focus:border-teal focus:ring-2 focus:ring-teal/10"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') postComment(); }}
              placeholder="Add a comment..."
            />
            <button
              onClick={postComment}
              className="px-2 py-1.5 bg-teal text-white rounded-lg text-xs hover:bg-teal-dark transition-all"
            >
              Post
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-light px-4 py-3 flex gap-2 flex-shrink-0">
        <button
          onClick={handleDelete}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-light hover:bg-red-50 hover:border-red-200 text-neutral-mid hover:text-red-500 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="flex-1 py-2 bg-teal hover:bg-teal-dark text-white rounded-lg text-sm font-medium transition-all disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
