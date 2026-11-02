-- Reject empty note arrays before either scale RPC performs any writes.

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

  if cardinality(p_notes) < 1 then
    raise exception using
      errcode = '22023',
      message = 'Add at least one note before saving.';
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

CREATE OR REPLACE FUNCTION public.update_scale_with_notes (
  p_scale_id uuid,
  p_title    text,
  p_notes    double precision[] DEFAULT ARRAY[]::double precision[]
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
      message = 'Authentication required';
  end if;

  if p_notes is null then
    raise exception using
    errcode = '22023',
    message = 'p_notes must be a double precision array';
  end if;

  if cardinality(p_notes) < 1 then
    raise exception using
      errcode = '22023',
      message = 'Add at least one note before saving.';
  end if;

  -- Lock the parent so concurrent saves of this scale are serialized.
  select *
  into v_scale
  from public.scales
  where id = p_scale_id
    and owner_id = auth.uid()
  for update;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'Scale not found';
  end if;

  update public.scales
  set
    title = coalesce(nullif(btrim(p_title), ''), 'Untitled Scale'),
    updated_at = now()
  where id = p_scale_id
  returning * into v_scale;

  delete from public.scale_notes
  where scale_id = p_scale_id;

  insert into public.scale_notes (scale_id, position, hertz)
  select
    p_scale_id,
    (note.ordinality - 1)::integer,
    note.hertz
  from unnest(p_notes)
    with ordinality as note(hertz, ordinality);

  return v_scale;
end;
$function$;
