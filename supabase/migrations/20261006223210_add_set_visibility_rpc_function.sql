CREATE OR REPLACE FUNCTION public.set_scale_visibility(
  p_scale_id uuid,
  p_is_public boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF p_is_public IS NULL THEN
    RAISE EXCEPTION 'Visibility must be true or false';
  END IF;

  UPDATE public.scales
  SET is_public = p_is_public
  WHERE id = p_scale_id
    AND owner_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Scale not found or permission denied';
  END IF;
END;
$$;