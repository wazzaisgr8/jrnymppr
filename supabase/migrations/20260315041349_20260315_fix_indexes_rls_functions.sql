/*
  # Fix security and performance issues

  ## Changes

  ### 1. Covering indexes for unindexed foreign keys
  Adds indexes on all foreign key columns that lack them, preventing slow sequential
  scans on joins and cascading deletes across every related table.

  New indexes:
  - cards: lane_id
  - collections: workspace_id
  - comments: map_id, parent_comment_id, user_id
  - emotion_points: phase_id
  - journey_maps: collection_id, owner_id, persona_id
  - lanes: parent_lane_id
  - personas: workspace_id
  - workspace_members: user_id
  - workspaces: owner_id

  ### 2. Remove unused indexes
  Drops idx_cards_phase_lane and idx_comments_card which have never been used
  and waste write overhead.

  ### 3. RLS policy performance - auth.uid() initialisation plan
  Replaces bare auth.uid() calls with (select auth.uid()) in all affected policies
  so Postgres evaluates the expression once per statement rather than once per row.

  Affected policies:
  - workspaces: ws_insert, ws_update, ws_delete
  - workspace_members: wm_select, wm_insert, wm_update, wm_delete
  - journey_maps: map_insert
  - comments: cmt_insert, cmt_update, cmt_delete

  ### 4. Fix mutable search_path on helper functions
  Recreates all six helper functions with SET search_path = '' so they are immune
  to search_path injection attacks.
*/

-- ─── 1. REMOVE UNUSED INDEXES ────────────────────────────────────────────────
DROP INDEX IF EXISTS idx_cards_phase_lane;
DROP INDEX IF EXISTS idx_comments_card;

-- ─── 2. ADD COVERING INDEXES FOR FOREIGN KEYS ────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_cards_lane_id ON public.cards (lane_id);
CREATE INDEX IF NOT EXISTS idx_collections_workspace_id ON public.collections (workspace_id);
CREATE INDEX IF NOT EXISTS idx_comments_map_id ON public.comments (map_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_comment_id ON public.comments (parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments (user_id);
CREATE INDEX IF NOT EXISTS idx_emotion_points_phase_id ON public.emotion_points (phase_id);
CREATE INDEX IF NOT EXISTS idx_journey_maps_collection_id ON public.journey_maps (collection_id);
CREATE INDEX IF NOT EXISTS idx_journey_maps_owner_id ON public.journey_maps (owner_id);
CREATE INDEX IF NOT EXISTS idx_journey_maps_persona_id ON public.journey_maps (persona_id);
CREATE INDEX IF NOT EXISTS idx_lanes_parent_lane_id ON public.lanes (parent_lane_id);
CREATE INDEX IF NOT EXISTS idx_personas_workspace_id ON public.personas (workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON public.workspace_members (user_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON public.workspaces (owner_id);

-- ─── 3. FIX HELPER FUNCTIONS (immutable search_path) ─────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_workspace_owner(ws_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspaces WHERE id = ws_id AND owner_id = (SELECT auth.uid())
  );
$$;

CREATE OR REPLACE FUNCTION public.has_workspace_view_access(ws_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = ''
AS $$
  SELECT (
    EXISTS (SELECT 1 FROM public.workspaces WHERE id = ws_id AND owner_id = (SELECT auth.uid()))
    OR EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = ws_id AND user_id = (SELECT auth.uid()))
  );
$$;

CREATE OR REPLACE FUNCTION public.has_workspace_edit_access(ws_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = ''
AS $$
  SELECT (
    EXISTS (SELECT 1 FROM public.workspaces WHERE id = ws_id AND owner_id = (SELECT auth.uid()))
    OR EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = ws_id AND user_id = (SELECT auth.uid()) AND role IN ('admin','editor')
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.has_map_view_access(m_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.journey_maps jm
    WHERE jm.id = m_id AND public.has_workspace_view_access(jm.workspace_id)
  );
$$;

CREATE OR REPLACE FUNCTION public.has_map_edit_access(m_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.journey_maps jm
    WHERE jm.id = m_id AND public.has_workspace_edit_access(jm.workspace_id)
  );
$$;

-- ─── 4. FIX RLS POLICIES - use (select auth.uid()) ───────────────────────────

-- WORKSPACES
DROP POLICY IF EXISTS "ws_insert" ON public.workspaces;
DROP POLICY IF EXISTS "ws_update" ON public.workspaces;
DROP POLICY IF EXISTS "ws_delete" ON public.workspaces;

CREATE POLICY "ws_insert" ON public.workspaces FOR INSERT TO authenticated
  WITH CHECK (owner_id = (SELECT auth.uid()));

CREATE POLICY "ws_update" ON public.workspaces FOR UPDATE TO authenticated
  USING (owner_id = (SELECT auth.uid()))
  WITH CHECK (owner_id = (SELECT auth.uid()));

CREATE POLICY "ws_delete" ON public.workspaces FOR DELETE TO authenticated
  USING (owner_id = (SELECT auth.uid()));

-- WORKSPACE MEMBERS
DROP POLICY IF EXISTS "wm_select" ON public.workspace_members;
DROP POLICY IF EXISTS "wm_insert" ON public.workspace_members;
DROP POLICY IF EXISTS "wm_update" ON public.workspace_members;
DROP POLICY IF EXISTS "wm_delete" ON public.workspace_members;

CREATE POLICY "wm_select" ON public.workspace_members FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "wm_insert" ON public.workspace_members FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "wm_update" ON public.workspace_members FOR UPDATE TO authenticated
  USING (public.is_workspace_owner(workspace_id) OR user_id = (SELECT auth.uid()))
  WITH CHECK (public.is_workspace_owner(workspace_id) OR user_id = (SELECT auth.uid()));

CREATE POLICY "wm_delete" ON public.workspace_members FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.is_workspace_owner(workspace_id));

-- JOURNEY MAPS
DROP POLICY IF EXISTS "map_insert" ON public.journey_maps;

CREATE POLICY "map_insert" ON public.journey_maps FOR INSERT TO authenticated
  WITH CHECK (owner_id = (SELECT auth.uid()) AND public.has_workspace_edit_access(workspace_id));

-- COMMENTS
DROP POLICY IF EXISTS "cmt_insert" ON public.comments;
DROP POLICY IF EXISTS "cmt_update" ON public.comments;
DROP POLICY IF EXISTS "cmt_delete" ON public.comments;

CREATE POLICY "cmt_insert" ON public.comments FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()) AND public.has_map_view_access(map_id));

CREATE POLICY "cmt_update" ON public.comments FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "cmt_delete" ON public.comments FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));
