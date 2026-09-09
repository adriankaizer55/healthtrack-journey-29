CREATE OR REPLACE FUNCTION public.create_ai_workout(
  _name text,
  _description text,
  _duration_min integer,
  _level text,
  _exercises jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _wid uuid;
  _ex jsonb;
  _pos integer := 0;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF coalesce(btrim(_name), '') = '' THEN
    RAISE EXCEPTION 'nome invalido';
  END IF;

  INSERT INTO public.workouts (name, description, category, duration_min, level, active, created_by)
  VALUES (
    left(btrim(_name), 120),
    nullif(btrim(coalesce(_description, '')), ''),
    'ia-coach',
    greatest(5, least(coalesce(_duration_min, 30), 240)),
    coalesce(nullif(btrim(coalesce(_level, '')), ''), 'iniciante'),
    true,
    _uid
  )
  RETURNING id INTO _wid;

  IF _exercises IS NOT NULL AND jsonb_typeof(_exercises) = 'array' THEN
    FOR _ex IN SELECT * FROM jsonb_array_elements(_exercises) LOOP
      IF coalesce(btrim(coalesce(_ex->>'name', '')), '') <> '' THEN
        INSERT INTO public.workout_exercises (workout_id, name, sets, reps, load, rest_seconds, notes, position)
        VALUES (
          _wid,
          left(btrim(_ex->>'name'), 120),
          greatest(1, least(coalesce((_ex->>'sets')::int, 3), 20)),
          coalesce(nullif(btrim(coalesce(_ex->>'reps', '')), ''), '10'),
          nullif(btrim(coalesce(_ex->>'load', '')), ''),
          greatest(0, least(coalesce((_ex->>'rest_seconds')::int, 60), 600)),
          nullif(btrim(coalesce(_ex->>'notes', '')), ''),
          _pos
        );
        _pos := _pos + 1;
      END IF;
    END LOOP;
  END IF;

  INSERT INTO public.workout_assignments (workout_id, user_id, scheduled_date, active)
  VALUES (_wid, _uid, CURRENT_DATE, true);

  INSERT INTO public.notifications (user_id, type, title, body, link)
  VALUES (_uid, 'treino', 'Novo treino do IA Coach', left(btrim(_name), 120), '/treinos');

  RETURN _wid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_ai_workout(text, text, integer, text, jsonb) TO authenticated;