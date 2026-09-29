CREATE OR REPLACE FUNCTION public.set_scale_favorite(
  p_scale_id uuid,
  p_is_favorite boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF p_is_favorite IS NULL THEN
    RAISE EXCEPTION 'p_is_favorite cannot be NULL'
      USING ERRCODE = '22023';
  END IF;

  IF p_is_favorite THEN
   -- Insert the favorite into table.
   INSERT INTO public.scale_favorites (user_id, scale_id)
   VALUES (auth.uid(), p_scale_id)
   ON CONFLICT (user_id, scale_id) DO NOTHING;
  ELSE
   -- Remove the favorite from table.
   DELETE FROM public.scale_favorites
   WHERE user_id = auth.uid() AND scale_id = p_scale_id;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_scale_favorite(uuid, boolean)
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.set_scale_favorite(uuid, boolean)
TO authenticated;

CREATE POLICY "Users can read their own favorites"
ON public.scale_favorites
FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can favorite accessible scales"
ON public.scale_favorites
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = (SELECT auth.uid())
  AND EXISTS (
    SELECT 1
    FROM public.scales
    WHERE scales.id = scale_favorites.scale_id
  )
);

CREATE POLICY "Users can delete their own favorites"
ON public.scale_favorites
FOR DELETE
TO authenticated
USING (user_id = (SELECT auth.uid()));