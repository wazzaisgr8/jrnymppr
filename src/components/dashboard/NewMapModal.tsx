import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { MAP_TEMPLATES } from '../../lib/templates';

interface Props {
  onClose: () => void;
  onCreate: (templateId: string, title: string) => void;
}

export default function NewMapModal({ onClose, onCreate }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState('blank');
  const [title, setTitle] = useState('');
  const [step, setStep] = useState<'template' | 'details'>('template');

  const template = MAP_TEMPLATES.find(t => t.id === selectedTemplate)!;

  const categoryColors: Record<string, string> = {
    'Retail': '#3CBFB0', 'Technology': '#4A90D9', 'Sales': '#E8873A',
    'Service Design': '#9B59B6', 'HR': '#F5A623', 'General': '#6B7280',
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-light">
          <h2 className="text-base font-semibold text-neutral-dark">
            {step === 'template' ? 'Choose a Template' : 'Map Details'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4 text-neutral-mid" />
          </button>
        </div>

        {step === 'template' ? (
          <>
            <div className="overflow-y-auto flex-1 p-6 grid grid-cols-2 gap-3">
              {MAP_TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    selectedTemplate === t.id
                      ? 'border-teal bg-teal/5'
                      : 'border-neutral-light hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
                      style={{ background: categoryColors[t.category] ?? '#6B7280' }}
                    >
                      {t.category}
                    </span>
                    {selectedTemplate === t.id && (
                      <div className="w-5 h-5 rounded-full bg-teal flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm text-neutral-dark mt-1">{t.name}</h3>
                  <p className="text-xs text-neutral-mid mt-1 leading-relaxed">{t.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {t.phases.slice(0, 4).map(p => (
                      <span key={p} className="text-xs bg-gray-100 text-neutral-mid px-1.5 py-0.5 rounded">
                        {p}
                      </span>
                    ))}
                    {t.phases.length > 4 && (
                      <span className="text-xs text-neutral-mid px-1.5 py-0.5">+{t.phases.length - 4}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-neutral-light flex justify-end gap-3">
              <button onClick={onClose} className="px-4 py-2 text-sm text-neutral-mid hover:text-neutral-dark">
                Cancel
              </button>
              <button
                onClick={() => { setStep('details'); setTitle(template.name); }}
                className="px-5 py-2 bg-teal hover:bg-teal-dark text-white rounded-lg text-sm font-medium transition-all"
              >
                Use Template
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="p-6 flex-1">
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-xs text-neutral-mid mb-1">Template</p>
                <p className="text-sm font-medium text-neutral-dark">{template.name}</p>
                <p className="text-xs text-neutral-mid mt-1">{template.phases.length} phases · {template.lanes.length} lanes</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-mid mb-1.5">Map Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Mobile App Purchase Journey"
                  autoFocus
                  className="w-full px-3 py-2.5 rounded-lg border border-neutral-light text-sm focus:border-teal focus:ring-2 focus:ring-teal/10 transition-all"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-neutral-light flex justify-between items-center">
              <button onClick={() => setStep('template')} className="px-4 py-2 text-sm text-neutral-mid hover:text-neutral-dark">
                Back
              </button>
              <div className="flex gap-3">
                <button onClick={onClose} className="px-4 py-2 text-sm text-neutral-mid hover:text-neutral-dark">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (title.trim()) onCreate(selectedTemplate, title.trim());
                  }}
                  disabled={!title.trim()}
                  className="px-5 py-2 bg-teal hover:bg-teal-dark text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                >
                  Create Map
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
