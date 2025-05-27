-- ManagedCoins table schema
CREATE TABLE ManagedCoins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coin_id TEXT UNIQUE NOT NULL, -- e.g., 'bitcoin' from CoinGecko
    symbol TEXT NOT NULL, -- e.g., 'BTC'
    name TEXT NOT NULL, -- e.g., 'Bitcoin'
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to update updated_at timestamp on row modification
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on row modification
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON ManagedCoins
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();
