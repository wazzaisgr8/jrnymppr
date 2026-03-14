/*
  # Customer Journey Mapping — Initial Schema

  Creates all tables first, then applies RLS policies (avoiding forward-reference issues).
*/

-- ─── TABLES ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS workspaces (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  owner_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workspace_members (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role          text NOT NULL DEFAULT 'editor',
  created_at    timestamptz DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

CREATE TABLE IF NOT EXISTS collections (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name          text NOT NULL,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS personas (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name          text NOT NULL DEFAULT '',
  role          text DEFAULT '',
  quote         text DEFAULT '',
  photo_url     text DEFAULT '',
  attributes    jsonb DEFAULT '[]',
  goals         text DEFAULT '',
  frustrations  text DEFAULT '',
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS journey_maps (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  collection_id   uuid REFERENCES collections(id) ON DELETE SET NULL,
  persona_id      uuid REFERENCES personas(id) ON DELETE SET NULL,
  title           text NOT NULL DEFAULT 'Untitled Map',
  description     text DEFAULT '',
  tags            text[] DEFAULT '{}',
  owner_id        uuid NOT NULL REFERENCES auth.users(id),
  phase_width     integer DEFAULT 200,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS phases (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id      uuid NOT NULL REFERENCES journey_maps(id) ON DELETE CASCADE,
  name        text NOT NULL DEFAULT 'Phase',
  position    integer NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lanes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id          uuid NOT NULL REFERENCES journey_maps(id) ON DELETE CASCADE,
  parent_lane_id  uuid REFERENCES lanes(id) ON DELETE CASCADE,
  name            text NOT NULL DEFAULT 'Lane',
  lane_type       text NOT NULL DEFAULT 'custom',
  position        integer NOT NULL DEFAULT 0,
  color_group     text DEFAULT 'customer',
  is_collapsed    boolean DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cards (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id          uuid NOT NULL REFERENCES journey_maps(id) ON DELETE CASCADE,
  phase_id        uuid NOT NULL REFERENCES phases(id) ON DELETE CASCADE,
  lane_id         uuid NOT NULL REFERENCES lanes(id) ON DELETE CASCADE,
  title           text NOT NULL DEFAULT '',
  body            text DEFAULT '',
  color           text DEFAULT '#3CBFB0',
  status          text NOT NULL DEFAULT 'current',
  tags            text[] DEFAULT '{}',
  links           jsonb DEFAULT '[]',
  position        integer DEFAULT 0,
  is_ai_generated boolean DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS emotion_points (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id      uuid NOT NULL REFERENCES journey_maps(id) ON DELETE CASCADE,
  phase_id    uuid NOT NULL REFERENCES phases(id) ON DELETE CASCADE,
  value       numeric NOT NULL DEFAULT 0.5,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(map_id, phase_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id              uuid NOT NULL REFERENCES journey_maps(id) ON DELETE CASCADE,
  card_id             uuid REFERENCES cards(id) ON DELETE CASCADE,
  user_id             uuid NOT NULL REFERENCES auth.users(id),
  content             text NOT NULL,
  parent_comment_id   uuid REFERENCES comments(id) ON DELETE CASCADE,
  created_at          timestamptz DEFAULT now()
);

-- ─── TRIGGERS ────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'journey_maps_updated_at') THEN
    CREATE TRIGGER journey_maps_updated_at
      BEFORE UPDATE ON journey_maps
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'cards_updated_at') THEN
    CREATE TRIGGER cards_updated_at
      BEFORE UPDATE ON cards
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- ─── INDEXES ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_journey_maps_workspace ON journey_maps(workspace_id);
CREATE INDEX IF NOT EXISTS idx_phases_map ON phases(map_id, position);
CREATE INDEX IF NOT EXISTS idx_lanes_map ON lanes(map_id, position);
CREATE INDEX IF NOT EXISTS idx_cards_map ON cards(map_id);
CREATE INDEX IF NOT EXISTS idx_cards_phase_lane ON cards(phase_id, lane_id);
CREATE INDEX IF NOT EXISTS idx_emotion_points_map ON emotion_points(map_id);
CREATE INDEX IF NOT EXISTS idx_comments_card ON comments(card_id);

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE lanes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotion_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- workspaces policies
CREATE POLICY "Workspace owner or member can view" ON workspaces FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = id AND wm.user_id = auth.uid()));

CREATE POLICY "Authenticated can create workspace" ON workspaces FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owner can update workspace" ON workspaces FOR UPDATE TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owner can delete workspace" ON workspaces FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- workspace_members policies
CREATE POLICY "Members can view own workspace members" ON workspace_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid()));

CREATE POLICY "Owner or self can insert member" ON workspace_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid()));

CREATE POLICY "Owner can update member" ON workspace_members FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid()));

CREATE POLICY "Owner or self can delete member" ON workspace_members FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid()));

-- Helper: user has edit access to workspace
CREATE OR REPLACE FUNCTION has_workspace_edit_access(ws_id uuid) RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM workspaces w
    LEFT JOIN workspace_members wm ON wm.workspace_id = w.id AND wm.user_id = auth.uid()
    WHERE w.id = ws_id AND (w.owner_id = auth.uid() OR wm.role IN ('admin','editor'))
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION has_workspace_view_access(ws_id uuid) RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM workspaces w
    LEFT JOIN workspace_members wm ON wm.workspace_id = w.id AND wm.user_id = auth.uid()
    WHERE w.id = ws_id AND (w.owner_id = auth.uid() OR wm.user_id IS NOT NULL)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- collections
CREATE POLICY "Members can view collections" ON collections FOR SELECT TO authenticated
  USING (has_workspace_view_access(workspace_id));
CREATE POLICY "Editors can insert collections" ON collections FOR INSERT TO authenticated
  WITH CHECK (has_workspace_edit_access(workspace_id));
CREATE POLICY "Editors can update collections" ON collections FOR UPDATE TO authenticated
  USING (has_workspace_edit_access(workspace_id)) WITH CHECK (has_workspace_edit_access(workspace_id));
CREATE POLICY "Editors can delete collections" ON collections FOR DELETE TO authenticated
  USING (has_workspace_edit_access(workspace_id));

-- personas
CREATE POLICY "Members can view personas" ON personas FOR SELECT TO authenticated
  USING (has_workspace_view_access(workspace_id));
CREATE POLICY "Editors can insert personas" ON personas FOR INSERT TO authenticated
  WITH CHECK (has_workspace_edit_access(workspace_id));
CREATE POLICY "Editors can update personas" ON personas FOR UPDATE TO authenticated
  USING (has_workspace_edit_access(workspace_id)) WITH CHECK (has_workspace_edit_access(workspace_id));
CREATE POLICY "Editors can delete personas" ON personas FOR DELETE TO authenticated
  USING (has_workspace_edit_access(workspace_id));

-- journey_maps
CREATE POLICY "Members can view maps" ON journey_maps FOR SELECT TO authenticated
  USING (has_workspace_view_access(workspace_id));
CREATE POLICY "Editors can insert maps" ON journey_maps FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid() AND has_workspace_edit_access(workspace_id));
CREATE POLICY "Editors can update maps" ON journey_maps FOR UPDATE TO authenticated
  USING (has_workspace_edit_access(workspace_id)) WITH CHECK (has_workspace_edit_access(workspace_id));
CREATE POLICY "Editors can delete maps" ON journey_maps FOR DELETE TO authenticated
  USING (has_workspace_edit_access(workspace_id));

-- Helper: user has edit access via map_id
CREATE OR REPLACE FUNCTION has_map_edit_access(m_id uuid) RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM journey_maps jm
    WHERE jm.id = m_id AND has_workspace_edit_access(jm.workspace_id)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION has_map_view_access(m_id uuid) RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM journey_maps jm
    WHERE jm.id = m_id AND has_workspace_view_access(jm.workspace_id)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- phases
CREATE POLICY "Members can view phases" ON phases FOR SELECT TO authenticated USING (has_map_view_access(map_id));
CREATE POLICY "Editors can insert phases" ON phases FOR INSERT TO authenticated WITH CHECK (has_map_edit_access(map_id));
CREATE POLICY "Editors can update phases" ON phases FOR UPDATE TO authenticated USING (has_map_edit_access(map_id)) WITH CHECK (has_map_edit_access(map_id));
CREATE POLICY "Editors can delete phases" ON phases FOR DELETE TO authenticated USING (has_map_edit_access(map_id));

-- lanes
CREATE POLICY "Members can view lanes" ON lanes FOR SELECT TO authenticated USING (has_map_view_access(map_id));
CREATE POLICY "Editors can insert lanes" ON lanes FOR INSERT TO authenticated WITH CHECK (has_map_edit_access(map_id));
CREATE POLICY "Editors can update lanes" ON lanes FOR UPDATE TO authenticated USING (has_map_edit_access(map_id)) WITH CHECK (has_map_edit_access(map_id));
CREATE POLICY "Editors can delete lanes" ON lanes FOR DELETE TO authenticated USING (has_map_edit_access(map_id));

-- cards
CREATE POLICY "Members can view cards" ON cards FOR SELECT TO authenticated USING (has_map_view_access(map_id));
CREATE POLICY "Editors can insert cards" ON cards FOR INSERT TO authenticated WITH CHECK (has_map_edit_access(map_id));
CREATE POLICY "Editors can update cards" ON cards FOR UPDATE TO authenticated USING (has_map_edit_access(map_id)) WITH CHECK (has_map_edit_access(map_id));
CREATE POLICY "Editors can delete cards" ON cards FOR DELETE TO authenticated USING (has_map_edit_access(map_id));

-- emotion_points
CREATE POLICY "Members can view emotion points" ON emotion_points FOR SELECT TO authenticated USING (has_map_view_access(map_id));
CREATE POLICY "Editors can insert emotion points" ON emotion_points FOR INSERT TO authenticated WITH CHECK (has_map_edit_access(map_id));
CREATE POLICY "Editors can update emotion points" ON emotion_points FOR UPDATE TO authenticated USING (has_map_edit_access(map_id)) WITH CHECK (has_map_edit_access(map_id));

-- comments
CREATE POLICY "Members can view comments" ON comments FOR SELECT TO authenticated USING (has_map_view_access(map_id));
CREATE POLICY "Commenters can insert comments" ON comments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND has_map_view_access(map_id));
CREATE POLICY "Comment owner can update" ON comments FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Comment owner can delete" ON comments FOR DELETE TO authenticated
  USING (user_id = auth.uid());
