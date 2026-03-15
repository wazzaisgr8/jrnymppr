/*
  # Fix Indexes and Security Issues

  ## Summary
  This migration addresses the following security and performance issues:

  1. Unindexed Foreign Keys
     - Add covering index on `cards.phase_id` (cards_phase_id_fkey)
     - Add covering index on `comments.card_id` (comments_card_id_fkey)

  2. Drop Unused Indexes
     - Drop `idx_cards_lane_id` on `cards`
     - Drop `idx_comments_map_id` on `comments`
     - Drop `idx_comments_parent_comment_id` on `comments`
     - Drop `idx_comments_user_id` on `comments`
     - Drop `idx_emotion_points_phase_id` on `emotion_points`
     - Drop `idx_journey_maps_collection_id` on `journey_maps`
     - Drop `idx_journey_maps_owner_id` on `journey_maps`
     - Drop `idx_journey_maps_persona_id` on `journey_maps`
     - Drop `idx_lanes_parent_lane_id` on `lanes`
     - Drop `idx_personas_workspace_id` on `personas`
     - Drop `idx_workspace_members_user_id` on `workspace_members`
     - Drop `idx_workspaces_owner_id` on `workspaces`

  ## Notes
  - Unused indexes waste storage and slow down writes without benefiting reads
  - Foreign key indexes improve JOIN performance and referential integrity checks
*/

-- Add missing foreign key covering indexes
CREATE INDEX IF NOT EXISTS idx_cards_phase_id ON public.cards (phase_id);
CREATE INDEX IF NOT EXISTS idx_comments_card_id ON public.comments (card_id);

-- Drop unused indexes
DROP INDEX IF EXISTS public.idx_cards_lane_id;
DROP INDEX IF EXISTS public.idx_comments_map_id;
DROP INDEX IF EXISTS public.idx_comments_parent_comment_id;
DROP INDEX IF EXISTS public.idx_comments_user_id;
DROP INDEX IF EXISTS public.idx_emotion_points_phase_id;
DROP INDEX IF EXISTS public.idx_journey_maps_collection_id;
DROP INDEX IF EXISTS public.idx_journey_maps_owner_id;
DROP INDEX IF EXISTS public.idx_journey_maps_persona_id;
DROP INDEX IF EXISTS public.idx_lanes_parent_lane_id;
DROP INDEX IF EXISTS public.idx_personas_workspace_id;
DROP INDEX IF EXISTS public.idx_workspace_members_user_id;
DROP INDEX IF EXISTS public.idx_workspaces_owner_id;
