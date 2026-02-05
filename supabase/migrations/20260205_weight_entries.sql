-- Migration: Add weight_entries table for weight tracking
-- Created: 2026-02-05

-- ============================================
-- Table: weight_entries
-- ============================================
CREATE TABLE IF NOT EXISTS weight_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  weight numeric(5,1) NOT NULL,
  unit text NOT NULL CHECK (unit IN ('lbs', 'kg')),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL CHECK (source IN ('manual', 'scale_photo', 'import')),
  image_url text,
  coach_request_id uuid,  -- FK added later if coach_requests table exists
  confidence text CHECK (confidence IN ('high', 'medium', 'low')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add FK constraint only if coach_requests table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'coach_requests') THEN
    ALTER TABLE weight_entries
    ADD CONSTRAINT fk_weight_entries_coach_request
    FOREIGN KEY (coach_request_id) REFERENCES coach_requests(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Index for user queries (most common access pattern)
CREATE INDEX IF NOT EXISTS idx_weight_entries_user_date
  ON weight_entries(user_id, recorded_at DESC);

-- Index for coach request lookups
CREATE INDEX IF NOT EXISTS idx_weight_entries_coach_request
  ON weight_entries(coach_request_id)
  WHERE coach_request_id IS NOT NULL;

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE weight_entries ENABLE ROW LEVEL SECURITY;

-- Users can view their own entries
CREATE POLICY "Users can view own weight entries"
  ON weight_entries FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own entries
CREATE POLICY "Users can insert own weight entries"
  ON weight_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own entries
CREATE POLICY "Users can update own weight entries"
  ON weight_entries FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own entries
CREATE POLICY "Users can delete own weight entries"
  ON weight_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Coach policy (only created if coach tables exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'coach_clients') THEN
    EXECUTE 'CREATE POLICY "Coaches can view shared weight entries"
      ON weight_entries FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM coach_clients cc
          JOIN client_sharing_settings css ON css.client_id = cc.client_id
          WHERE cc.status = ''active''
            AND cc.client_id = weight_entries.user_id
            AND cc.coach_id = auth.uid()
            AND css.share_weight_auto = true
        )
      )';
  END IF;
END $$;

-- ============================================
-- Storage Bucket: weight-photos
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('weight-photos', 'weight-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Users can upload weight photos to their own folder
CREATE POLICY "Users can upload weight photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'weight-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can view their own weight photos
CREATE POLICY "Users can view own weight photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'weight-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Coach storage policy (only created if coach tables exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'coach_clients') THEN
    EXECUTE 'CREATE POLICY "Coaches can view shared weight photos"
      ON storage.objects FOR SELECT
      USING (
        bucket_id = ''weight-photos'' AND
        EXISTS (
          SELECT 1 FROM coach_clients cc
          JOIN client_sharing_settings css ON css.client_id = cc.client_id
          WHERE cc.status = ''active''
            AND cc.client_id = (storage.foldername(name))[1]::uuid
            AND cc.coach_id = auth.uid()
            AND css.share_weight_auto = true
        )
      )';
  END IF;
END $$;
