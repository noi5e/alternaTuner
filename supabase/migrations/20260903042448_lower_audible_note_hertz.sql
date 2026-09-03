-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

ALTER TABLE public.scale_notes
  DROP CONSTRAINT scale_notes_hertz_check;

ALTER TABLE public.scale_notes
  ADD CONSTRAINT scale_notes_hertz_check CHECK (hertz > 0::double precision AND hertz < 20000::double precision);
