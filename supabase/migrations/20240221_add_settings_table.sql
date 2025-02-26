-- Create settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL,
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(category, key)
);

-- Create audit log table for settings changes
CREATE TABLE IF NOT EXISTS public.settings_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_id UUID REFERENCES system_settings(id),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_settings_updated_at();

-- Create function to log settings changes
CREATE OR REPLACE FUNCTION log_settings_change()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO settings_audit_log (setting_id, user_id, action, old_value, new_value)
    VALUES (
        NEW.id,
        auth.uid(),
        CASE
            WHEN TG_OP = 'INSERT' THEN 'create'
            WHEN TG_OP = 'UPDATE' THEN 'update'
            WHEN TG_OP = 'DELETE' THEN 'delete'
        END,
        CASE WHEN TG_OP = 'DELETE' THEN OLD.value ELSE NULL END,
        CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE NEW.value END
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for audit log
CREATE TRIGGER log_settings_change
    AFTER INSERT OR UPDATE OR DELETE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION log_settings_change();

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Settings are viewable by admins"
    ON system_settings FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Settings can be updated by admins"
    ON system_settings FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Audit log is viewable by admins"
    ON settings_audit_log FOR SELECT
    TO authenticated
    USING (true);

-- Insert default settings
INSERT INTO system_settings (category, key, value, description) VALUES
    ('pricing', 'verification_methods', '{
        "bankid": 20,
        "mojeid": 15,
        "ocr": 10,
        "facescan": 5,
        "revalidate": 2
    }', 'Ceny jednotlivých metod ověření'),
    
    ('limits', 'api_rate_limits', '{
        "requests_per_minute": 60,
        "requests_per_hour": 1000,
        "requests_per_day": 10000
    }', 'Limity pro API volání'),
    
    ('notifications', 'email_notifications', '{
        "error_alerts": true,
        "daily_summary": true,
        "recipients": []
    }', 'Nastavení emailových notifikací'),
    
    ('services', 'bankid', '{
        "environment": "sandbox",
        "timeout": 30,
        "retry_attempts": 3
    }', 'Nastavení BankID služby'),
    
    ('services', 'mojeid', '{
        "environment": "sandbox",
        "timeout": 30,
        "retry_attempts": 3
    }', 'Nastavení MojeID služby'),
    
    ('services', 'ocr', '{
        "min_confidence": 0.8,
        "max_file_size": 5242880,
        "allowed_formats": ["jpg", "jpeg", "png"]
    }', 'Nastavení OCR služby'),
    
    ('services', 'facescan', '{
        "min_confidence": 0.9,
        "min_face_size": 100,
        "max_faces": 1
    }', 'Nastavení FaceScan služby'),
    
    ('billing', 'company_details', '{
        "name": "Věková verifikace s.r.o.",
        "address": "Příkladová 123, 110 00 Praha 1",
        "ico": "12345678",
        "dic": "CZ12345678",
        "bank_account": "123456789/0100"
    }', 'Fakturační údaje společnosti'),
    
    ('billing', 'invoice_settings', '{
        "number_format": "YYYY/NNNNN",
        "vat_rate": 21,
        "due_days": 14
    }', 'Nastavení fakturace');

