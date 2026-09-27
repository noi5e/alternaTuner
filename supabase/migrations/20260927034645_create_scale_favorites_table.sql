-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

CREATE TABLE public.scale_favorites (
  user_id    uuid                     DEFAULT auth.uid() NOT NULL,
  scale_id   uuid                     NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.scale_favorites
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.scale_favorites
  ADD CONSTRAINT scale_favorites_pkey PRIMARY KEY (user_id, scale_id);

ALTER TABLE public.scale_favorites
  ADD CONSTRAINT scale_favorites_scale_id_fkey FOREIGN KEY (scale_id) REFERENCES public.scales(id) ON DELETE CASCADE;

ALTER TABLE public.scale_favorites
  ADD CONSTRAINT scale_favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

GRANT ALL ON public.scale_favorites TO anon;

GRANT ALL ON public.scale_favorites TO authenticated;

GRANT ALL ON public.scale_favorites TO service_role;

CREATE INDEX scale_favorites_scale_id_idx ON public.scale_favorites (scale_id);

ALTER TABLE public.scales
  ADD COLUMN is_public boolean DEFAULT false NOT NULL;
