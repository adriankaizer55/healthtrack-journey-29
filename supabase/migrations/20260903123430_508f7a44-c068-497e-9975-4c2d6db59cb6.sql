CREATE OR REPLACE FUNCTION public.admin_contacts()
RETURNS TABLE (id uuid, name text, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.name, p.avatar_url
  FROM public.profiles p
  JOIN public.user_roles r ON r.user_id = p.id AND r.role = 'admin'
  WHERE p.active
  ORDER BY p.created_at
$$;

REVOKE ALL ON FUNCTION public.admin_contacts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_contacts() TO authenticated;

CREATE OR REPLACE FUNCTION public.send_direct_message(_receiver_id uuid, _message text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _id uuid;
  _sender uuid := auth.uid();
  _sender_name text;
BEGIN
  IF _sender IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF _receiver_id IS NULL OR _receiver_id = _sender THEN
    RAISE EXCEPTION 'invalid receiver';
  END IF;
  IF coalesce(btrim(_message), '') = '' THEN
    RAISE EXCEPTION 'empty message';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = _receiver_id) THEN
    RAISE EXCEPTION 'receiver not found';
  END IF;

  INSERT INTO public.messages (sender_id, receiver_id, message)
  VALUES (_sender, _receiver_id, btrim(_message))
  RETURNING id INTO _id;

  SELECT nullif(btrim(p.name), '') INTO _sender_name FROM public.profiles p WHERE p.id = _sender;

  INSERT INTO public.notifications (user_id, type, title, body, link)
  VALUES (
    _receiver_id,
    'mensagem',
    'Nova mensagem de ' || coalesce(_sender_name, 'HealthTrack'),
    left(btrim(_message), 120),
    CASE WHEN public.has_role(_receiver_id, 'admin') THEN '/admin/mensagens' ELSE '/mensagens' END
  );

  RETURN _id;
END;
$$;

REVOKE ALL ON FUNCTION public.send_direct_message(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.send_direct_message(uuid, text) TO authenticated;