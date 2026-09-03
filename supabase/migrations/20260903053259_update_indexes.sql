-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

DROP INDEX public.scale_notes_scale_id_idx;

CREATE INDEX scales_owner_id_updated_at_idx ON public.scales (owner_id, updated_at DESC);
