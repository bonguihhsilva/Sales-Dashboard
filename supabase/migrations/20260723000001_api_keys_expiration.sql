-- Task 3 (C-07): expiração opcional de API keys, complementando revoked_at.
-- Nullable, sem default — chaves existentes continuam válidas indefinidamente
-- até que alguém defina expires_at explicitamente (sem UI ainda — fora de escopo).
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS expires_at timestamptz;
