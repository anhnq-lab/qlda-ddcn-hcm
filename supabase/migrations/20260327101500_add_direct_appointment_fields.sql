-- Add Direct Appointment fields to package_bidders
ALTER TABLE public.package_bidders
  ADD COLUMN IF NOT EXISTS negotiated_price NUMERIC,
  ADD COLUMN IF NOT EXISTS appointment_reason TEXT,
  ADD COLUMN IF NOT EXISTS decision_number VARCHAR(100),
  ADD COLUMN IF NOT EXISTS decision_date DATE,
  ADD COLUMN IF NOT EXISTS decision_agency VARCHAR(255),
  ADD COLUMN IF NOT EXISTS legal_basis VARCHAR(255),
  ADD COLUMN IF NOT EXISTS hsyc_date DATE,
  ADD COLUMN IF NOT EXISTS hsdx_date DATE;
