-- =============================================================================
-- MIGRATION: csrf_tokens table
-- Tabella per storage sicuro dei token CSRF
-- =============================================================================

-- Crea tabella csrf_tokens
CREATE TABLE IF NOT EXISTS csrf_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    used_at TIMESTAMPTZ,
    created_by TEXT DEFAULT 'system'
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_csrf_tokens_token ON csrf_tokens(token);
CREATE INDEX IF NOT EXISTS idx_csrf_tokens_expires_at ON csrf_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_csrf_tokens_user_id ON csrf_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_csrf_tokens_created_at ON csrf_tokens(created_at);

-- RLS Policy per sicurezza
ALTER TABLE csrf_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Solo service role può inserire/leggere token CSRF
CREATE POLICY "csrf_tokens_service_role_only" ON csrf_tokens
    FOR ALL USING (auth.role() = 'service_role');

-- Policy: Utenti autenticati possono leggere solo i propri token
CREATE POLICY "csrf_tokens_user_read_own" ON csrf_tokens
    FOR SELECT USING (auth.uid() = user_id);

-- Funzione per pulizia automatica token scaduti
CREATE OR REPLACE FUNCTION cleanup_expired_csrf_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM csrf_tokens 
    WHERE expires_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger per pulizia automatica ogni ora
CREATE OR REPLACE FUNCTION trigger_cleanup_csrf_tokens()
RETURNS trigger AS $$
BEGIN
    PERFORM cleanup_expired_csrf_tokens();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Commenti per documentazione
COMMENT ON TABLE csrf_tokens IS 'Storage sicuro per token CSRF con scadenza automatica';
COMMENT ON COLUMN csrf_tokens.token IS 'Token CSRF generato con crypto.randomUUID()';
COMMENT ON COLUMN csrf_tokens.expires_at IS 'Data scadenza token (2 ore dalla creazione)';
COMMENT ON COLUMN csrf_tokens.ip_address IS 'IP address della richiesta per audit';
COMMENT ON COLUMN csrf_tokens.user_id IS 'Utente associato al token (opzionale)';
COMMENT ON COLUMN csrf_tokens.used_at IS 'Timestamp quando il token è stato utilizzato';
