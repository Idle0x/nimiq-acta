-- Acta migration v6: AI pre-screen verdicts on venture submissions
ALTER TABLE venture_submissions ADD COLUMN IF NOT EXISTS recommendation TEXT;
ALTER TABLE venture_submissions ADD COLUMN IF NOT EXISTS confidence INTEGER;
ALTER TABLE venture_submissions ADD COLUMN IF NOT EXISTS reason TEXT;
