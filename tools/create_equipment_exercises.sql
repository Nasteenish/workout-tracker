-- Many-to-many table: equipment_catalog <-> exercises
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS equipment_exercises (
    equipment_id bigint NOT NULL REFERENCES equipment_catalog(id) ON DELETE CASCADE,
    exercise_id  text   NOT NULL,
    created_at   timestamptz DEFAULT now(),
    PRIMARY KEY (equipment_id, exercise_id)
);

-- Enable Row Level Security
ALTER TABLE equipment_exercises ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read (public catalog)
CREATE POLICY "Public read equipment_exercises"
    ON equipment_exercises FOR SELECT USING (true);

-- Allow anyone to insert/delete (this is an admin catalog tool)
CREATE POLICY "Public write equipment_exercises"
    ON equipment_exercises FOR INSERT WITH CHECK (true);

CREATE POLICY "Public delete equipment_exercises"
    ON equipment_exercises FOR DELETE USING (true);
