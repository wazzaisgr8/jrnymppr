import { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { JourneyMap, Phase, Lane, Card, EmotionPoint, Persona, LaneType } from '../lib/types';

interface MapState {
  map: JourneyMap | null;
  phases: Phase[];
  lanes: Lane[];
  cards: Card[];
  emotionPoints: EmotionPoint[];
  persona: Persona | null;
  selectedCardId: string | null;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  loading: boolean;
}

type MapAction =
  | { type: 'LOAD'; payload: Omit<MapState, 'selectedCardId' | 'saveStatus' | 'loading'> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVE_STATUS'; payload: MapState['saveStatus'] }
  | { type: 'SELECT_CARD'; payload: string | null }
  | { type: 'UPDATE_MAP'; payload: Partial<JourneyMap> }
  | { type: 'ADD_PHASE'; payload: Phase }
  | { type: 'UPDATE_PHASE'; payload: Phase }
  | { type: 'DELETE_PHASE'; payload: string }
  | { type: 'REORDER_PHASES'; payload: Phase[] }
  | { type: 'ADD_LANE'; payload: Lane }
  | { type: 'UPDATE_LANE'; payload: Lane }
  | { type: 'DELETE_LANE'; payload: string }
  | { type: 'TOGGLE_LANE_COLLAPSE'; payload: string }
  | { type: 'ADD_CARD'; payload: Card }
  | { type: 'UPDATE_CARD'; payload: Card }
  | { type: 'DELETE_CARD'; payload: string }
  | { type: 'SET_EMOTION'; payload: { phaseId: string; value: number } }
  | { type: 'SET_PERSONA'; payload: Persona | null };

function mapReducer(state: MapState, action: MapAction): MapState {
  switch (action.type) {
    case 'LOAD':
      return { ...state, ...action.payload, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_SAVE_STATUS':
      return { ...state, saveStatus: action.payload };
    case 'SELECT_CARD':
      return { ...state, selectedCardId: action.payload };
    case 'UPDATE_MAP':
      return { ...state, map: state.map ? { ...state.map, ...action.payload } : null };
    case 'ADD_PHASE':
      return { ...state, phases: [...state.phases, action.payload] };
    case 'UPDATE_PHASE':
      return { ...state, phases: state.phases.map(p => p.id === action.payload.id ? action.payload : p) };
    case 'DELETE_PHASE':
      return {
        ...state,
        phases: state.phases.filter(p => p.id !== action.payload),
        cards: state.cards.filter(c => c.phase_id !== action.payload),
        emotionPoints: state.emotionPoints.filter(e => e.phase_id !== action.payload),
      };
    case 'REORDER_PHASES':
      return { ...state, phases: action.payload };
    case 'ADD_LANE':
      return { ...state, lanes: [...state.lanes, action.payload] };
    case 'UPDATE_LANE':
      return { ...state, lanes: state.lanes.map(l => l.id === action.payload.id ? action.payload : l) };
    case 'DELETE_LANE':
      return {
        ...state,
        lanes: state.lanes.filter(l => l.id !== action.payload),
        cards: state.cards.filter(c => c.lane_id !== action.payload),
      };
    case 'TOGGLE_LANE_COLLAPSE':
      return {
        ...state,
        lanes: state.lanes.map(l => l.id === action.payload ? { ...l, is_collapsed: !l.is_collapsed } : l),
      };
    case 'ADD_CARD':
      return { ...state, cards: [...state.cards, action.payload] };
    case 'UPDATE_CARD':
      return { ...state, cards: state.cards.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'DELETE_CARD':
      return {
        ...state,
        cards: state.cards.filter(c => c.id !== action.payload),
        selectedCardId: state.selectedCardId === action.payload ? null : state.selectedCardId,
      };
    case 'SET_EMOTION':
      return {
        ...state,
        emotionPoints: state.emotionPoints.map(e =>
          e.phase_id === action.payload.phaseId ? { ...e, value: action.payload.value } : e
        ),
      };
    case 'SET_PERSONA':
      return { ...state, persona: action.payload };
    default:
      return state;
  }
}

const initialState: MapState = {
  map: null, phases: [], lanes: [], cards: [], emotionPoints: [],
  persona: null, selectedCardId: null, saveStatus: 'saved', loading: true,
};

interface MapContextValue {
  state: MapState;
  loadMap: (mapId: string) => Promise<void>;
  addPhase: () => Promise<void>;
  updatePhase: (phase: Phase) => Promise<void>;
  deletePhase: (id: string) => Promise<void>;
  addLane: (type: LaneType, name: string) => Promise<void>;
  updateLane: (lane: Lane) => Promise<void>;
  deleteLane: (id: string) => Promise<void>;
  toggleLaneCollapse: (id: string) => Promise<void>;
  addCard: (phaseId: string, laneId: string, title: string) => Promise<void>;
  updateCard: (card: Card) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  setEmotionValue: (phaseId: string, value: number) => Promise<void>;
  selectCard: (id: string | null) => void;
  updateMapTitle: (title: string) => Promise<void>;
  savePersona: (fields: Partial<Persona>) => Promise<void>;
}

const MapContext = createContext<MapContextValue | null>(null);

export function MapProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(mapReducer, initialState);

  const setSaving = () => dispatch({ type: 'SET_SAVE_STATUS', payload: 'saving' });
  const setSaved = () => dispatch({ type: 'SET_SAVE_STATUS', payload: 'saved' });

  const loadMap = useCallback(async (mapId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const [mapRes, phasesRes, lanesRes, cardsRes, emotionRes] = await Promise.all([
      supabase.from('journey_maps').select('*').eq('id', mapId).maybeSingle(),
      supabase.from('phases').select('*').eq('map_id', mapId).order('position'),
      supabase.from('lanes').select('*').eq('map_id', mapId).order('position'),
      supabase.from('cards').select('*').eq('map_id', mapId),
      supabase.from('emotion_points').select('*').eq('map_id', mapId),
    ]);

    let persona = null;
    if (mapRes.data?.persona_id) {
      const { data } = await supabase.from('personas').select('*').eq('id', mapRes.data.persona_id).maybeSingle();
      persona = data;
    }

    dispatch({
      type: 'LOAD',
      payload: {
        map: mapRes.data,
        phases: phasesRes.data ?? [],
        lanes: lanesRes.data ?? [],
        cards: cardsRes.data ?? [],
        emotionPoints: emotionRes.data ?? [],
        persona,
      },
    });
  }, []);

  const addPhase = useCallback(async () => {
    if (!state.map) return;
    setSaving();
    const position = state.phases.length;
    const { data, error } = await supabase.from('phases').insert({
      map_id: state.map.id, name: `Phase ${position + 1}`, position,
    }).select().maybeSingle();
    if (!error && data) {
      dispatch({ type: 'ADD_PHASE', payload: data });
      const { data: ep } = await supabase.from('emotion_points').insert({
        map_id: state.map.id, phase_id: data.id, value: 0.5,
      }).select().maybeSingle();
      if (ep) dispatch({ type: 'SET_EMOTION', payload: { phaseId: ep.phase_id, value: ep.value } });
      else dispatch({ type: 'LOAD', payload: { ...state, emotionPoints: [...state.emotionPoints, { id: crypto.randomUUID(), map_id: state.map.id, phase_id: data.id, value: 0.5 }] } });
    }
    setSaved();
  }, [state]);

  const updatePhase = useCallback(async (phase: Phase) => {
    dispatch({ type: 'UPDATE_PHASE', payload: phase });
    setSaving();
    await supabase.from('phases').update({ name: phase.name, position: phase.position }).eq('id', phase.id);
    setSaved();
  }, []);

  const deletePhase = useCallback(async (id: string) => {
    dispatch({ type: 'DELETE_PHASE', payload: id });
    setSaving();
    await supabase.from('phases').delete().eq('id', id);
    setSaved();
  }, []);

  const addLane = useCallback(async (type: LaneType, name: string) => {
    if (!state.map) return;
    setSaving();
    const position = state.lanes.filter(l => !l.parent_lane_id).length;
    const colorGroup = ['backstage', 'systems', 'kpis'].includes(type) ? 'backstage' :
      type === 'touchpoints' ? 'touchpoints' : 'customer';
    const { data, error } = await supabase.from('lanes').insert({
      map_id: state.map.id, name, lane_type: type, position, color_group: colorGroup,
    }).select().maybeSingle();
    if (!error && data) dispatch({ type: 'ADD_LANE', payload: data });
    setSaved();
  }, [state]);

  const updateLane = useCallback(async (lane: Lane) => {
    dispatch({ type: 'UPDATE_LANE', payload: lane });
    setSaving();
    await supabase.from('lanes').update({ name: lane.name, is_collapsed: lane.is_collapsed }).eq('id', lane.id);
    setSaved();
  }, []);

  const deleteLane = useCallback(async (id: string) => {
    dispatch({ type: 'DELETE_LANE', payload: id });
    setSaving();
    await supabase.from('lanes').delete().eq('id', id);
    setSaved();
  }, []);

  const toggleLaneCollapse = useCallback(async (id: string) => {
    const lane = state.lanes.find(l => l.id === id);
    if (!lane) return;
    dispatch({ type: 'TOGGLE_LANE_COLLAPSE', payload: id });
    await supabase.from('lanes').update({ is_collapsed: !lane.is_collapsed }).eq('id', id);
  }, [state.lanes]);

  const addCard = useCallback(async (phaseId: string, laneId: string, title: string) => {
    if (!state.map) return;
    setSaving();
    const { data, error } = await supabase.from('cards').insert({
      map_id: state.map.id, phase_id: phaseId, lane_id: laneId,
      title, body: '', color: '#3CBFB0', status: 'current',
    }).select().maybeSingle();
    if (!error && data) dispatch({ type: 'ADD_CARD', payload: data });
    setSaved();
  }, [state.map]);

  const updateCard = useCallback(async (card: Card) => {
    dispatch({ type: 'UPDATE_CARD', payload: card });
    setSaving();
    await supabase.from('cards').update({
      title: card.title, body: card.body, color: card.color,
      status: card.status, tags: card.tags, links: card.links,
    }).eq('id', card.id);
    setSaved();
  }, []);

  const deleteCard = useCallback(async (id: string) => {
    dispatch({ type: 'DELETE_CARD', payload: id });
    setSaving();
    await supabase.from('cards').delete().eq('id', id);
    setSaved();
  }, []);

  const setEmotionValue = useCallback(async (phaseId: string, value: number) => {
    if (!state.map) return;
    dispatch({ type: 'SET_EMOTION', payload: { phaseId, value } });
    await supabase.from('emotion_points')
      .upsert({ map_id: state.map.id, phase_id: phaseId, value }, { onConflict: 'map_id,phase_id' });
  }, [state.map]);

  const selectCard = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_CARD', payload: id });
  }, []);

  const updateMapTitle = useCallback(async (title: string) => {
    if (!state.map) return;
    dispatch({ type: 'UPDATE_MAP', payload: { title } });
    setSaving();
    await supabase.from('journey_maps').update({ title }).eq('id', state.map.id);
    setSaved();
  }, [state.map]);

  const savePersona = useCallback(async (fields: Partial<Persona>) => {
    if (!state.map) return;
    setSaving();
    if (state.persona) {
      const { data } = await supabase
        .from('personas')
        .update(fields)
        .eq('id', state.persona.id)
        .select()
        .maybeSingle();
      if (data) dispatch({ type: 'SET_PERSONA', payload: data });
    } else {
      const { data } = await supabase
        .from('personas')
        .insert({ workspace_id: state.map.workspace_id, ...fields })
        .select()
        .maybeSingle();
      if (data) {
        await supabase.from('journey_maps').update({ persona_id: data.id }).eq('id', state.map.id);
        dispatch({ type: 'SET_PERSONA', payload: data });
        dispatch({ type: 'UPDATE_MAP', payload: { persona_id: data.id } });
      }
    }
    setSaved();
  }, [state.map, state.persona]);

  return (
    <MapContext.Provider value={{
      state, loadMap, addPhase, updatePhase, deletePhase,
      addLane, updateLane, deleteLane, toggleLaneCollapse,
      addCard, updateCard, deleteCard, setEmotionValue,
      selectCard, updateMapTitle, savePersona,
    }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error('useMap must be inside MapProvider');
  return ctx;
}
