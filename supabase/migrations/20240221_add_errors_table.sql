-- Create errors table
CREATE TABLE IF NOT EXISTS public.errors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    verification_id UUID REFERENCES verifications(id) ON DELETE SET NULL,
    source TEXT NOT NULL CHECK (source IN ('bankid', 'mojeid', 'ocr', 'facescan', 'system')),
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    error_details JSONB,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved')),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id),
    resolution_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_errors_shop_id ON errors(shop_id);
CREATE INDEX IF NOT EXISTS idx_errors_verification_id ON errors(verification_id);
CREATE INDEX IF NOT EXISTS idx_errors_source ON errors(source);
CREATE INDEX IF NOT EXISTS idx_errors_status ON errors(status);
CREATE INDEX IF NOT EXISTS idx_errors_created_at ON errors(created_at);

-- Enable RLS
ALTER TABLE errors ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Errors are viewable by admins"
    ON errors FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Errors can be updated by admins"
    ON errors FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create function to update resolved_at timestamp
CREATE OR REPLACE FUNCTION update_error_resolved_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
        NEW.resolved_at = NOW();
    ELSIF NEW.status != 'resolved' THEN
        NEW.resolved_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_error_resolved_at_trigger
    BEFORE UPDATE ON errors
    FOR EACH ROW
    EXECUTE FUNCTION update_error_resolved_at();

