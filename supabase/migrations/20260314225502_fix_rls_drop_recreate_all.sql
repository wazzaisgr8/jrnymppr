/*
  # Drop all existing policies and recreate without recursion
*/

-- Drop all policies on every table first
DO $$ DECLARE r record; BEGIN
  FOR r IN SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- Drop old helper functions
DROP FUNCTION IF EXISTS is_workspace_owner(uuid);
DROP FUNCTION IF EXISTS has_workspace_view_access(uuid);
DROP FUNCTION IF EXISTS has_workspace_edit_access(uuid);
DROP FUNCTION IF EXISTS has_map_view_access(uuid);
DROP FUNCTION IF EXISTS has_map_edit_access(uuid);

-- Recreate SECURITY DEFINER helpers (these bypass RLS internally, breaking the recursion)
CREATE OR REPLACE FUNCTION is_workspace_owner(ws_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM workspaces WHERE id = ws_id AND owner_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION has_workspace_view_access(ws_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT (
    EXISTS (SELECT 1 FROM workspaces WHERE id = ws_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = ws_id AND user_id = auth.uid())
  );
$$;

CREATE OR REPLACE FUNCTION has_workspace_edit_access(ws_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT (
    EXISTS (SELECT 1 FROM workspaces WHERE id = ws_id AND owner_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = ws_id AND user_id = auth.uid() AND role IN ('admin','editor')
    )
  );
$$;

CREATE OR REPLACE FUNCTION has_map_view_access(m_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM journey_maps jm WHERE jm.id = m_id AND has_workspace_view_access(jm.workspace_id)
  );
$$;

CREATE OR REPLACE FUNCTION has_map_edit_access(m_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM journey_maps jm WHERE jm.id = m_id AND has_workspace_edit_access(jm.workspace_id)
  );
$$;

-- ─── WORKSPACES ──────────────────────────────────────────────────────────────
CREATE POLICY "ws_select" ON workspaces FOR SELECT TO authenticated
  USING (has_workspace_view_access(id));
CREATE POLICY "ws_insert" ON workspaces FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "ws_update" ON workspaces FOR UPDATE TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "ws_delete" ON workspaces FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- ─── WORKSPACE MEMBERS ───────────────────────────────────────────────────────
CREATE POLICY "wm_select" ON workspace_members FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "wm_insert" ON workspace_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "wm_update" ON workspace_members FOR UPDATE TO authenticated
  USING (is_workspace_owner(workspace_id) OR user_id = auth.uid())
  WITH CHECK (is_workspace_owner(workspace_id) OR user_id = auth.uid());
CREATE POLICY "wm_delete" ON workspace_members FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR is_workspace_owner(workspace_id));

-- ─── COLLECTIONS ─────────────────────────────────────────────────────────────
CREATE POLICY "col_select" ON collections FOR SELECT TO authenticated USING (has_workspace_view_access(workspace_id));
CREATE POLICY "col_insert" ON collections FOR INSERT TO authenticated WITH CHECK (has_workspace_edit_access(workspace_id));
CREATE POLICY "col_update" ON collections FOR UPDATE TO authenticated
  USING (has_workspace_edit_access(workspace_id)) WITH CHECK (has_workspace_edit_access(workspace_id));
CREATE POLICY "col_delete" ON collections FOR DELETE TO authenticated USING (has_workspace_edit_access(workspace_id));

-- ─── PERSONAS ────────────────────────────────────────────────────────────────
CREATE POLICY "per_select" ON personas FOR SELECT TO authenticated USING (has_workspace_view_access(workspace_id));
CREATE POLICY "per_insert" ON personas FOR INSERT TO authenticated WITH CHECK (has_workspace_edit_access(workspace_id));
CREATE POLICY "per_update" ON personas FOR UPDATE TO authenticated
  USING (has_workspace_edit_access(workspace_id)) WITH CHECK (has_workspace_edit_access(workspace_id));
CREATE POLICY "per_delete" ON personas FOR DELETE TO authenticated USING (has_workspace_edit_access(workspace_id));

-- ─── JOURNEY MAPS ────────────────────────────────────────────────────────────
CREATE POLICY "map_select" ON journey_maps FOR SELECT TO authenticated USING (has_workspace_view_access(workspace_id));
CREATE POLICY "map_insert" ON journey_maps FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid() AND has_workspace_edit_access(workspace_id));
CREATE POLICY "map_update" ON journey_maps FOR UPDATE TO authenticated
  USING (has_workspace_edit_access(workspace_id)) WITH CHECK (has_workspace_edit_access(workspace_id));
CREATE POLICY "map_delete" ON journey_maps FOR DELETE TO authenticated USING (has_workspace_edit_access(workspace_id));

-- ─── PHASES ──────────────────────────────────────────────────────────────────
CREATE POLICY "phase_select" ON phases FOR SELECT TO authenticated USING (has_map_view_access(map_id));
CREATE POLICY "phase_insert" ON phases FOR INSERT TO authenticated WITH CHECK (has_map_edit_access(map_id));
CREATE POLICY "phase_update" ON phases FOR UPDATE TO authenticated
  USING (has_map_edit_access(map_id)) WITH CHECK (has_map_edit_access(map_id));
CREATE POLICY "phase_delete" ON phases FOR DELETE TO authenticated USING (has_map_edit_access(map_id));

-- ─── LANES ───────────────────────────────────────────────────────────────────
CREATE POLICY "lane_select" ON lanes FOR SELECT TO authenticated USING (has_map_view_access(map_id));
CREATE POLICY "lane_insert" ON lanes FOR INSERT TO authenticated WITH CHECK (has_map_edit_access(map_id));
CREATE POLICY "lane_update" ON lanes FOR UPDATE TO authenticated
  USING (has_map_edit_access(map_id)) WITH CHECK (has_map_edit_access(map_id));
CREATE POLICY "lane_delete" ON lanes FOR DELETE TO authenticated USING (has_map_edit_access(map_id));

-- ─── CARDS ───────────────────────────────────────────────────────────────────
CREATE POLICY "card_select" ON cards FOR SELECT TO authenticated USING (has_map_view_access(map_id));
CREATE POLICY "card_insert" ON cards FOR INSERT TO authenticated WITH CHECK (has_map_edit_access(map_id));
CREATE POLICY "card_update" ON cards FOR UPDATE TO authenticated
  USING (has_map_edit_access(map_id)) WITH CHECK (has_map_edit_access(map_id));
CREATE POLICY "card_delete" ON cards FOR DELETE TO authenticated USING (has_map_edit_access(map_id));

-- ─── EMOTION POINTS ──────────────────────────────────────────────────────────
CREATE POLICY "ep_select" ON emotion_points FOR SELECT TO authenticated USING (has_map_view_access(map_id));
CREATE POLICY "ep_insert" ON emotion_points FOR INSERT TO authenticated WITH CHECK (has_map_edit_access(map_id));
CREATE POLICY "ep_update" ON emotion_points FOR UPDATE TO authenticated
  USING (has_map_edit_access(map_id)) WITH CHECK (has_map_edit_access(map_id));

-- ─── COMMENTS ────────────────────────────────────────────────────────────────
CREATE POLICY "cmt_select" ON comments FOR SELECT TO authenticated USING (has_map_view_access(map_id));
CREATE POLICY "cmt_insert" ON comments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND has_map_view_access(map_id));
CREATE POLICY "cmt_update" ON comments FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "cmt_delete" ON comments FOR DELETE TO authenticated USING (user_id = auth.uid());
