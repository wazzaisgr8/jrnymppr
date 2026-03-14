import { useState, useRef } from 'react';
import { CreditCard as Edit2, User, Camera, X } from 'lucide-react';
import { useMap } from '../../contexts/MapContext';
import { supabase } from '../../lib/supabase';
import { PersonaAttribute } from '../../lib/types';

interface Props {
  phaseWidth: number;
  laneWidth: number;
  phaseCount: number;
}

export default function PersonaHeaderBand({ phaseWidth, laneWidth, phaseCount }: Props) {
  const { state, savePersona } = useMap();
  const { persona } = state;
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: '', role: '', quote: '', photo_url: '',
    attributes: [] as PersonaAttribute[],
  });

  const totalWidth = laneWidth + phaseCount * phaseWidth;

  const startEdit = () => {
    setPhotoPreview(null);
    setForm({
      name: persona?.name ?? '',
      role: persona?.role ?? '',
      quote: persona?.quote ?? '',
      photo_url: persona?.photo_url ?? '',
      attributes: persona?.attributes?.length
        ? persona.attributes
        : [
            { label: 'Age', value: '' },
            { label: 'Goal', value: '' },
            { label: 'Frustration', value: '' },
            { label: 'Device', value: '' },
          ],
    });
    setEditing(true);
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setPhotoPreview(preview);
    setUploading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploading(false); return; }

    const ext = file.name.split('.').pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('persona-photos').upload(path, file, { upsert: true });

    if (!error) {
      const { data: urlData } = supabase.storage.from('persona-photos').getPublicUrl(path);
      setForm(f => ({ ...f, photo_url: urlData.publicUrl }));
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await savePersona(form);
    setSaving(false);
    setEditing(false);
    setPhotoPreview(null);
  };

  const defaultAttrs: PersonaAttribute[] = [
    { label: 'Age', value: '—' },
    { label: 'Goal', value: '—' },
    { label: 'Frustration', value: '—' },
    { label: 'Device', value: '—' },
  ];

  const attrs = persona?.attributes?.length ? persona.attributes : defaultAttrs;
  const currentPhoto = photoPreview || form.photo_url || persona?.photo_url;

  return (
    <>
      <div
        className="bg-white border-b border-neutral-light flex items-stretch flex-shrink-0 relative"
        style={{ minWidth: totalWidth, height: 88 }}
      >
        <div
          className="sticky left-0 z-10 bg-white border-r border-neutral-light flex items-center px-4 gap-3"
          style={{ width: laneWidth, minWidth: laneWidth }}
        >
          <button
            onClick={startEdit}
            className="relative group flex-shrink-0 focus:outline-none"
            title="Edit persona"
          >
            {persona?.photo_url ? (
              <img
                src={persona.photo_url}
                alt={persona.name}
                className="w-12 h-12 rounded-full object-cover border-2 transition-opacity group-hover:opacity-80"
                style={{ borderColor: '#3CBFB0' }}
              />
            ) : (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center border-2 transition-opacity group-hover:opacity-80"
                style={{ background: '#E8F8F6', borderColor: '#3CBFB0' }}
              >
                <User className="w-6 h-6" style={{ color: '#3CBFB0' }} />
              </div>
            )}
            <span className="absolute inset-0 rounded-full flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all">
              <Edit2 className="w-3.5 h-3.5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
          </button>

          <button onClick={startEdit} className="min-w-0 text-left focus:outline-none group">
            <p className="text-sm font-bold text-neutral-dark truncate leading-tight group-hover:text-teal transition-colors" style={{ '--tw-text-opacity': 1 } as React.CSSProperties}>
              {persona?.name || 'Add Persona'}
            </p>
            <p className="text-xs text-neutral-mid truncate">{persona?.role || 'Click to edit'}</p>
          </button>
        </div>

        <div className="flex-1 flex items-center px-6 gap-2 min-w-0">
          <div className="relative flex-1 min-w-0">
            <span
              className="absolute -left-2 -top-2 text-5xl font-bold leading-none select-none"
              style={{ color: '#3CBFB0', opacity: 0.12 }}
            >
              "
            </span>
            <p className="text-sm italic text-gray-600 pl-4 truncate">
              {persona?.quote || 'Add a key persona quote...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4">
          {attrs.slice(0, 4).map((attr, i) => (
            <div
              key={i}
              className="rounded-full border border-neutral-light px-3 py-1 text-xs whitespace-nowrap"
            >
              <span className="text-neutral-mid">{attr.label}:</span>{' '}
              <span className="text-neutral-dark font-medium">{attr.value || '—'}</span>
            </div>
          ))}
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-neutral-light flex items-center justify-between">
              <h2 className="text-base font-semibold text-neutral-dark">Edit Persona</h2>
              <button
                onClick={() => { setEditing(false); setPhotoPreview(null); }}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-neutral-mid text-lg leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
              <div className="flex gap-4 items-start">
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="relative group w-20 h-20 rounded-full overflow-hidden border-2 focus:outline-none"
                    style={{ borderColor: '#3CBFB0' }}
                    title="Upload photo"
                  >
                    {currentPhoto ? (
                      <img src={currentPhoto} alt="Persona" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: '#E8F8F6' }}>
                        <User className="w-8 h-8" style={{ color: '#3CBFB0' }} />
                      </div>
                    )}
                    <span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                      {uploading ? (
                        <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                      ) : (
                        <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </span>
                  </button>
                  {currentPhoto && (
                    <button
                      onClick={() => { setPhotoPreview(null); setForm(f => ({ ...f, photo_url: '' })); }}
                      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600"
                    >
                      <X className="w-3 h-3" /> Remove
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </div>

                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-mid mb-1">Name</label>
                    <input
                      autoFocus
                      className="w-full px-3 py-2 border border-neutral-light rounded-lg text-sm focus:border-teal focus:ring-2 focus:ring-teal/10"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Alex Chen"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-mid mb-1">Role</label>
                    <input
                      className="w-full px-3 py-2 border border-neutral-light rounded-lg text-sm focus:border-teal focus:ring-2 focus:ring-teal/10"
                      value={form.role}
                      onChange={e => setForm({ ...form, role: e.target.value })}
                      placeholder="Marketing Manager"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-mid mb-1">Key Quote</label>
                <input
                  className="w-full px-3 py-2 border border-neutral-light rounded-lg text-sm focus:border-teal focus:ring-2 focus:ring-teal/10"
                  value={form.quote}
                  onChange={e => setForm({ ...form, quote: e.target.value })}
                  placeholder="I just want it to be easy..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-neutral-mid">Attributes</label>
                  <button
                    className="text-xs text-teal hover:underline"
                    onClick={() => setForm({
                      ...form,
                      attributes: [...form.attributes, { label: '', value: '' }],
                    })}
                  >
                    + Add
                  </button>
                </div>
                <div className="space-y-2">
                  {form.attributes.map((attr, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        className="w-28 px-2 py-1.5 border border-neutral-light rounded-lg text-xs focus:border-teal focus:ring-2 focus:ring-teal/10"
                        value={attr.label}
                        onChange={e => {
                          const attrs = [...form.attributes];
                          attrs[i] = { ...attrs[i], label: e.target.value };
                          setForm({ ...form, attributes: attrs });
                        }}
                        placeholder="Label"
                      />
                      <input
                        className="flex-1 px-2 py-1.5 border border-neutral-light rounded-lg text-xs focus:border-teal focus:ring-2 focus:ring-teal/10"
                        value={attr.value}
                        onChange={e => {
                          const attrs = [...form.attributes];
                          attrs[i] = { ...attrs[i], value: e.target.value };
                          setForm({ ...form, attributes: attrs });
                        }}
                        placeholder="Value"
                      />
                      <button
                        className="text-neutral-mid hover:text-red-500 text-lg leading-none flex-shrink-0"
                        onClick={() => setForm({
                          ...form,
                          attributes: form.attributes.filter((_, j) => j !== i),
                        })}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-neutral-light flex justify-end gap-3">
              <button
                onClick={() => { setEditing(false); setPhotoPreview(null); }}
                className="px-4 py-2 text-sm text-neutral-mid hover:text-neutral-dark"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || uploading}
                className="px-5 py-2 bg-teal hover:bg-teal-dark text-white rounded-lg text-sm font-medium transition-all disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Persona'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
