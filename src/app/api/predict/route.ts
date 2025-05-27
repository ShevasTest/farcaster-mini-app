import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or anon key not defined in environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, coinId, predictedDirection, actualPriceAtPrediction } = body;

    // Validate input
    if (!userId || !coinId || !predictedDirection || actualPriceAtPrediction === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (predictedDirection !== 'up' && predictedDirection !== 'down') {
      return NextResponse.json({ error: 'Invalid predictedDirection' }, { status: 400 });
    }

    if (typeof actualPriceAtPrediction !== 'number') {
        return NextResponse.json({ error: 'actualPriceAtPrediction must be a number' }, { status: 400 });
    }

    const predictionData = {
      user_id: userId,
      coin_id: coinId,
      predicted_direction: predictedDirection,
      actual_price_at_prediction: actualPriceAtPrediction,
      prediction_timestamp: new Date().toISOString(),
      // status will default to 'pending' in the database
    };

    const { data, error } = await supabase
      .from('Predictions')
      .insert([predictionData])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ? data[0] : null, { status: 201 });

  } catch (error) {
    console.error('API error:', error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
