import { useState, useEffect, useCallback } from 'react';
import { Plus, Map, FolderOpen, Search, LogOut, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Workspace, Collection, JourneyMap } from '../../lib/types';
import { MAP_TEMPLATES } from '../../lib/templates';
import MapCard from './MapCard';
import NewMapModal from './NewMapModal';

interface Props {
  onOpenMap: (mapId: string) => void;
}

export default function Dashboard({ onOpenMap }: Props) {
  const { user, signOut } = useAuth();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [maps, setMaps] = useState<JourneyMap[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | 'all' | 'uncategorised'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMap, setShowNewMap] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creatingCollection, setCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: wsData } = await supabase
      .from('workspaces').select('*').eq('owner_id', user.id).maybeSingle();

    if (!wsData) {
      const { data: created } = await supabase.from('workspaces').insert({
        name: `${user.user_metadata?.full_name ?? 'My'}'s Workspace`,
        owner_id: user.id,
      }).select().maybeSingle();
      setWorkspace(created);
    } else {
      setWorkspace(wsData);
    }

    const ws = wsData ?? null;
    if (!ws) { setLoading(false); return; }

    const [colRes, mapRes] = await Promise.all([
      supabase.from('collections').select('*').eq('workspace_id', ws.id).order('created_at'),
      supabase.from('journey_maps').select('*').eq('workspace_id', ws.id).order('updated_at', { ascending: false }),
    ]);

    setCollections(colRes.data ?? []);
    setMaps(mapRes.data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const createMap = async (templateId: string, title: string) => {
    if (!workspace || !user) return;
    setShowNewMap(false);

    const template = MAP_TEMPLATES.find(t => t.id === templateId)!;
    const collectionId = selectedCollectionId === 'all' || selectedCollectionId === 'uncategorised'
      ? null : selectedCollectionId;

    const { data: mapData } = await supabase.from('journey_maps').insert({
      workspace_id: workspace.id, title, description: template.description,
      owner_id: user.id, collection_id: collectionId,
    }).select().maybeSingle();

    if (!mapData) return;

    const phaseInserts = template.phases.map((name, i) => ({
      map_id: mapData.id, name, position: i,
    }));
    const { data: phases } = await supabase.from('phases').insert(phaseInserts).select();

    if (!phases) { onOpenMap(mapData.id); return; }

    const laneInserts = template.lanes.map((l, i) => ({
      map_id: mapData.id, name: l.name, lane_type: l.lane_type,
      color_group: l.color_group, position: i,
    }));
    const { data: lanes } = await supabase.from('lanes').insert(laneInserts).select();

    const emotionInserts = phases.map((p, i) => ({
      map_id: mapData.id, phase_id: p.id,
      value: template.emotionValues[i] ?? 0.5,
    }));
    await supabase.from('emotion_points').insert(emotionInserts);

    if (lanes && template.cards.length > 0) {
      const cardInserts = template.cards.map(c => ({
        map_id: mapData.id,
        phase_id: phases[c.phaseIndex]?.id,
        lane_id: lanes[c.laneIndex]?.id,
        title: c.title,
        body: c.body ?? '',
        color: c.color ?? '#3CBFB0',
        status: 'current',
      })).filter(c => c.phase_id && c.lane_id);
      if (cardInserts.length > 0) await supabase.from('cards').insert(cardInserts);
    }

    setMaps(prev => [mapData, ...prev]);
    onOpenMap(mapData.id);
  };

  const deleteMap = async (id: string) => {
    await supabase.from('journey_maps').delete().eq('id', id);
    setMaps(prev => prev.filter(m => m.id !== id));
  };

  const duplicateMap = async (map: JourneyMap) => {
    if (!workspace || !user) return;
    const { data: newMap } = await supabase.from('journey_maps').insert({
      workspace_id: workspace.id, title: `${map.title} (Copy)`,
      description: map.description, owner_id: user.id,
      collection_id: map.collection_id,
    }).select().maybeSingle();
    if (newMap) { setMaps(prev => [newMap, ...prev]); }
  };

  const createCollection = async () => {
    if (!workspace || !newCollectionName.trim()) return;
    const { data } = await supabase.from('collections').insert({
      workspace_id: workspace.id, name: newCollectionName.trim(),
    }).select().maybeSingle();
    if (data) { setCollections(prev => [...prev, data]); }
    setNewCollectionName('');
    setCreatingCollection(false);
  };

  const filteredMaps = maps.filter(m => {
    const matchesSearch = !searchQuery ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCollection =
      selectedCollectionId === 'all' ? true :
      selectedCollectionId === 'uncategorised' ? !m.collection_id :
      m.collection_id === selectedCollectionId;
    return matchesSearch && matchesCollection;
  });

  return (
    <div className="min-h-screen bg-canvas flex">
      <aside className="w-56 bg-white border-r border-neutral-light flex flex-col flex-shrink-0">
        <div className="px-4 py-4 border-b border-neutral-light">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0">
              <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
                <rect width="56" height="56" fill="#3CBFB0"/>
                <path d="M12 36 Q20 20 28 28 Q36 36 44 20" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <circle cx="12" cy="36" r="3" fill="white"/>
                <circle cx="28" cy="28" r="3" fill="white"/>
                <circle cx="44" cy="20" r="3" fill="white"/>
                <path d="M18 44 L38 44" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
              </svg>
            </div>
            <span className="text-sm font-bold tracking-widest text-neutral-dark">JRNYMPPR</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3">
          <div className="mb-1">
            <button
              onClick={() => setSelectedCollectionId('all')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                selectedCollectionId === 'all'
                  ? 'bg-teal/10 text-teal font-medium'
                  : 'text-neutral-mid hover:bg-gray-50 hover:text-neutral-dark'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              All Maps
            </button>
            <button
              onClick={() => setSelectedCollectionId('uncategorised')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                selectedCollectionId === 'uncategorised'
                  ? 'bg-teal/10 text-teal font-medium'
                  : 'text-neutral-mid hover:bg-gray-50 hover:text-neutral-dark'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              Uncategorised
            </button>
          </div>

          {collections.length > 0 && (
            <div className="mt-4">
              <div className="px-3 py-1.5 text-xs font-medium text-neutral-mid uppercase tracking-wider">
                Collections
              </div>
              {collections.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCollectionId(c.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedCollectionId === c.id
                      ? 'bg-teal/10 text-teal font-medium'
                      : 'text-neutral-mid hover:bg-gray-50 hover:text-neutral-dark'
                  }`}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span className="truncate">{c.name}</span>
                </button>
              ))}
            </div>
          )}

          {creatingCollection ? (
            <div className="mt-2 px-2">
              <input
                type="text"
                autoFocus
                value={newCollectionName}
                onChange={e => setNewCollectionName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') createCollection(); if (e.key === 'Escape') setCreatingCollection(false); }}
                placeholder="Collection name"
                className="w-full px-2 py-1.5 text-sm border border-teal rounded-lg focus:ring-2 focus:ring-teal/10"
              />
            </div>
          ) : (
            <button
              onClick={() => setCreatingCollection(true)}
              className="w-full flex items-center gap-2 px-3 py-2 mt-1 rounded-lg text-sm text-neutral-mid hover:bg-gray-50 hover:text-neutral-dark transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              New Collection
            </button>
          )}
        </div>

        <div className="px-3 py-3 border-t border-neutral-light">
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="w-6 h-6 rounded-full bg-teal/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-teal">
                {(user?.user_metadata?.full_name ?? user?.email ?? '?').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-neutral-dark truncate">
                {user?.user_metadata?.full_name ?? 'User'}
              </p>
              <p className="text-xs text-neutral-mid truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-mid hover:bg-gray-50 hover:text-red-500 transition-all mt-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-neutral-light px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-neutral-dark">{workspace?.name ?? 'Workspace'}</h1>
            <p className="text-xs text-neutral-mid mt-0.5">
              {filteredMaps.length} map{filteredMaps.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-mid" />
              <input
                type="text"
                placeholder="Search maps..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-neutral-light rounded-lg focus:border-teal focus:ring-2 focus:ring-teal/10 w-52 transition-all"
              />
            </div>
            <button
              onClick={() => setShowNewMap(true)}
              className="flex items-center gap-2 px-4 py-2 bg-teal hover:bg-teal-dark text-white rounded-lg text-sm font-medium transition-all"
            >
              <Plus className="w-4 h-4" />
              New Map
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 rounded-full border-2 border-teal border-t-transparent animate-spin" />
            </div>
          ) : filteredMaps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-teal/10 flex items-center justify-center mb-4">
                <Map className="w-8 h-8 text-teal" />
              </div>
              <h3 className="text-base font-semibold text-neutral-dark mb-2">
                {searchQuery ? 'No maps found' : 'No maps yet'}
              </h3>
              <p className="text-sm text-neutral-mid mb-6 max-w-xs">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Create your first customer journey map to get started.'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowNewMap(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-teal hover:bg-teal-dark text-white rounded-lg text-sm font-medium transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Create your first map
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMaps.map(m => (
                <MapCard
                  key={m.id}
                  map={m}
                  onOpen={() => onOpenMap(m.id)}
                  onDelete={() => deleteMap(m.id)}
                  onDuplicate={() => duplicateMap(m)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {showNewMap && (
        <NewMapModal
          onClose={() => setShowNewMap(false)}
          onCreate={createMap}
        />
      )}
    </div>
  );
}
