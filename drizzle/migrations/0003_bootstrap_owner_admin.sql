-- Bootstrap: the configured owner email gets admin access on signup,
-- and can claim it later if they already signed up.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _owner text;
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id,
          COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
          new.email)
  ON CONFLICT (id) DO NOTHING;

  _owner := (SELECT value FROM public.site_settings WHERE key = 'owner_email');
  IF _owner IS NOT NULL AND lower(new.email) = lower(_owner) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'admin') ON CONFLICT DO NOTHING;
    INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'approver') ON CONFLICT DO NOTHING;
  END IF;
  RETURN new;
END $$;

-- Claim admin access for an account that signed up before ownership was configured.
CREATE OR REPLACE FUNCTION public.ensure_owner_admin()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _email text; _owner text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in first'; END IF;
  _email := (SELECT email FROM auth.users WHERE id = auth.uid());
  _owner := (SELECT value FROM public.site_settings WHERE key = 'owner_email');
  IF _owner IS NULL OR lower(_email) <> lower(_owner) THEN
    RAISE EXCEPTION 'This account is not the registered owner';
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'admin') ON CONFLICT DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'approver') ON CONFLICT DO NOTHING;
END $$;

GRANT EXECUTE ON FUNCTION public.ensure_owner_admin() TO authenticated;
GRANT SELECT ON public.site_settings TO anon;

COMMENT ON FUNCTION public.ensure_owner_admin() IS 'Grants admin to the account matching site_settings owner_email';