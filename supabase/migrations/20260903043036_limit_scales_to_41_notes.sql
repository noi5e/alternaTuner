-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

SET check_function_bodies = false;

CREATE OR REPLACE FUNCTION public.create_scale_with_notes (
  p_title text,
  p_notes double precision[] DEFAULT ARRAY[]::double precision[]
)
  RETURNS public.scales
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare
  v_scale public.scales;
begin
  if auth.uid() is null then
    raise exception using
      errcode = '42501',
      message = 'Authentication required.';
  end if;

  if p_notes is null then
    raise exception using
      errcode = '22023',
      message = 'p_notes must be a double precision array.';
  end if;

  if cardinality(p_notes) > 41 then
    raise exception using
      errcode = '22023',
      message = 'p_notes cannot contain more than 41 notes.';
  end if;

    insert into public.scales (owner_id, title)
  values (
    auth.uid(),
    coalesce(nullif(btrim(p_title), ''), 'Untitled Scale')
  )
  returning * into v_scale;

  insert into public.scale_notes (scale_id, position, hertz)
  select
    v_scale.id,
    (note.ordinality - 1)::integer,
    note.hertz
  from unnest(p_notes)
    with ordinality as note(hertz, ordinality);

  return v_scale;
end;
$function$;
