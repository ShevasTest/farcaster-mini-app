-- Predictions table schema
CREATE TABLE Predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Farcaster FID
    coin_id TEXT NOT NULL, -- e.g., 'bitcoin', 'ethereum'
    predicted_direction TEXT NOT NULL CHECK (predicted_direction IN ('up', 'down')),
    prediction_timestamp TIMESTAMPTZ NOT NULL,
    actual_price_at_prediction NUMERIC NOT NULL,
    price_at_resolution NUMERIC,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'correct', 'incorrect')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
