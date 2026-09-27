-- Existing owner policies allow users to read their own scales. This adds an OR clause to allow reading other users' public scales as well.
CREATE POLICY "Users can read public scales" ON public.scales
  FOR SELECT
  TO authenticated
  USING (is_public);

CREATE POLICY "Users can read notes from public scales" ON public.scale_notes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.scales
      WHERE scales.id = scale_notes.scale_id
        AND scales.is_public
    )
  );