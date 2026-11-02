-- Migration to enforce minimum scale notes constraint.

BEGIN;

-- Prevent writes while installing and validating the constraint, eg. avoid race conditions where user deletes the last note from the scale.
LOCK TABLE public.scales, public.scale_notes
  IN SHARE ROW EXCLUSIVE MODE;

-- Fail if any existing scales have no notes, otherwise the migration would leave invalid data.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.scales AS s
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.scale_notes AS n
      WHERE n.scale_id = s.id
    )
  ) THEN
    RAISE EXCEPTION
      'Some scales have no notes. Fix them before applying this migration.';
  END IF;
END;
$$;

CREATE FUNCTION public.enforce_minimum_scale_notes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER -- Ensures the function executes with the privileges of its owner, not the caller.
SET search_path = ''
AS $$
DECLARE
  v_scale_id uuid;
BEGIN
  -- Check to see if the trigger is being called on the scales table or the scale_notes table, and determine which scale to validate.
  IF TG_TABLE_NAME = 'scales' THEN
    -- Inserting a scale requires checking its notes.
    v_scale_id := NEW.id; -- rows after INSERT
  ELSE
    -- If scale_notes is calling the trigger, then possibly a note is being deleted. We need to check if the scale still has any notes and remains valid.
    v_scale_id := OLD.scale_id; -- row before DELETE
  END IF;

  -- Serialize checks for the same scale. 
  -- Suppose a scale has two notes, and each note is being deleted concurrently. The UPDATE ensures that the checks are serialized and we don't end up with an empty scale due to race conditions.
  UPDATE public.scales
  SET updated_at = updated_at -- Preserve the existing timestamp, while acquiring a row-level lock to serialize concurrent checks.
  WHERE id = v_scale_id;

  -- FOUND checks if the scale still exists after the UPDATE.
  -- If it doesn't exist, then cancel this check. Why? Because it means the scale was deleted, and DELETE cascaded to scale_notes.
  -- DELETE scale transactiosn are allowed, so we don't need to raise an exception in that case.
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- At this point, we know the scale exists and we need to ensure it has at least one note.
  IF NOT EXISTS (
    SELECT 1
    FROM public.scale_notes
    WHERE scale_id = v_scale_id
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      CONSTRAINT = 'minimum_scale_notes',
      MESSAGE = format(
        'Scale %s must have at least one note.',
        v_scale_id
      );
  END IF;

  RETURN NULL;
END;
$$;

-- Prevents ordinary database roles from invoking this function:
--   anon: unauthenticated API access
--   authenticated: authenticated API access
--   PUBLIC: PostgreSQL's special designation for all roles
REVOKE ALL ON FUNCTION public.enforce_minimum_scale_notes()
  FROM PUBLIC, anon, authenticated;

-- DEFERRABLE INITIALLY DEFERRED: wait until the end of the transaction to check the constraint.
-- By default, the trigger will fire after INSERT into public.scales.
-- However, we need to wait until COMMIT and the atomized RPC function, which inserts scale_notes, completes, to ensure the scale has at least one note.
CREATE CONSTRAINT TRIGGER minimum_scale_notes_on_create
AFTER INSERT ON public.scales
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION public.enforce_minimum_scale_notes();

CREATE CONSTRAINT TRIGGER minimum_scale_notes_on_delete
AFTER DELETE ON public.scale_notes
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION public.enforce_minimum_scale_notes();

-- Prevents moving a note to another scale by raising an exception if an update attempts to change the scale_id.
CREATE FUNCTION public.prevent_scale_note_move()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  RAISE EXCEPTION USING
    ERRCODE = '23514',
    MESSAGE = 'A note cannot be moved to another scale.';
END;
$$;

CREATE TRIGGER prevent_scale_note_move
BEFORE UPDATE OF scale_id ON public.scale_notes
FOR EACH ROW
WHEN (OLD.scale_id IS DISTINCT FROM NEW.scale_id)
EXECUTE FUNCTION public.prevent_scale_note_move();

COMMIT;