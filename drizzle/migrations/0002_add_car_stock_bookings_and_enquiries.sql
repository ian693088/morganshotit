-- ===== Calzcars Autohub: vehicle stock, bookings, enquiries =====

-- 1. Vehicle stock
CREATE TABLE public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  make text NOT NULL DEFAULT '',
  model text NOT NULL DEFAULT '',
  year int NOT NULL DEFAULT 2024,
  price int NOT NULL,
  deposit int NOT NULL DEFAULT 0,
  mileage_km int NOT NULL DEFAULT 0,
  fuel text NOT NULL DEFAULT 'Petrol',
  transmission text NOT NULL DEFAULT 'Automatic',
  body_type text NOT NULL DEFAULT 'SUV',
  sale_type text NOT NULL DEFAULT 'Cash',
  status text NOT NULL DEFAULT 'available',
  description text NOT NULL DEFAULT '',
  images text[] NOT NULL DEFAULT '{}',
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vehicles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicles TO authenticated;
GRANT ALL ON public.vehicles TO service_role;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY vehicles_public_read ON public.vehicles
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY vehicles_admin_write ON public.vehicles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX vehicles_status_idx ON public.vehicles (status, sale_type);

-- 2. Bookings (customer pays deposit, admin confirms or rejects)
CREATE TABLE public.car_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  deposit int NOT NULL DEFAULT 0,
  mpesa_code text,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.car_bookings TO authenticated;
GRANT ALL ON public.car_bookings TO service_role;
ALTER TABLE public.car_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY car_bookings_owner_read ON public.car_bookings
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY car_bookings_owner_insert ON public.car_bookings
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY car_bookings_admin_all ON public.car_bookings
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX car_bookings_user_idx ON public.car_bookings (user_id, created_at DESC);

-- 3. General enquiries (contact form, works signed out)
CREATE TABLE public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  topic text NOT NULL DEFAULT 'General',
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.inquiries TO anon, authenticated;
GRANT SELECT, UPDATE ON public.inquiries TO authenticated;
GRANT ALL ON public.inquiries TO service_role;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY inquiries_public_insert ON public.inquiries
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY inquiries_owner_read ON public.inquiries
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY inquiries_admin_all ON public.inquiries
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Credit / finance applications
CREATE TABLE public.credit_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  employment text,
  monthly_income int,
  desired_car text,
  deposit_available int,
  loan_term_months int NOT NULL DEFAULT 36,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.credit_applications TO anon, authenticated;
GRANT SELECT, UPDATE ON public.credit_applications TO authenticated;
GRANT ALL ON public.credit_applications TO service_role;
ALTER TABLE public.credit_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY credit_public_insert ON public.credit_applications
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY credit_owner_read ON public.credit_applications
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY credit_admin_all ON public.credit_applications
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Vehicle status follows the booking decision
CREATE OR REPLACE FUNCTION public.sync_vehicle_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.vehicle_id IS NOT NULL AND NEW.status IN ('confirmed','rejected','cancelled') THEN
    UPDATE public.vehicles
       SET status = CASE WHEN NEW.status = 'confirmed' THEN 'reserved' ELSE 'available' END,
           updated_at = now()
     WHERE id = NEW.vehicle_id;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS car_bookings_sync_vehicle ON public.car_bookings;
CREATE TRIGGER car_bookings_sync_vehicle
  AFTER UPDATE OF status ON public.car_bookings
  FOR EACH ROW EXECUTE FUNCTION public.sync_vehicle_status();

COMMENT ON TABLE public.vehicles IS 'Calzcars Autohub showroom stock';
COMMENT ON TABLE public.car_bookings IS 'Deposit-backed car bookings, confirmed or rejected by admin';
COMMENT ON TABLE public.credit_applications IS 'Car credit / hire-purchase applications';