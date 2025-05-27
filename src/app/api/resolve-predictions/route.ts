import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getCoinMarketData } from '@/lib/api'; // Attempt to use existing function

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// For server-side operations that modify data, it's best to use the SERVICE_ROLE_KEY
// This key has elevated privileges and should be kept secret.
// Fallback to ANON_KEY if SERVICE_ROLE_KEY is not available, but log a warning.
let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseServiceKey) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY not found. Falling back to NEXT_PUBLIC_SUPABASE_ANON_KEY. This is not recommended for write operations in production.");
    supabaseServiceKey = supabaseAnonKey;
}

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Supabase URL or service/anon key not defined in environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const CRON_SECRET = process.env.CRON_SECRET;

const RESOLUTION_WINDOW_HOURS = 24; // Predictions resolve after 24 hours

interface Prediction {
    id: string;
    user_id: string;
    coin_id: string;
    predicted_direction: 'up' | 'down';
    prediction_timestamp: string; // ISO string
    actual_price_at_prediction: number;
    price_at_resolution?: number | null;
    status: 'pending' | 'correct' | 'incorrect' | 'error_resolving';
    created_at: string;
}

export async function POST(req: NextRequest) {
  // 1. Authentication
  const authHeader = req.headers.get('Authorization');
  if (!CRON_SECRET) {
    console.error('CRON_SECRET not set. Endpoint is disabled.');
    return NextResponse.json({ error: 'Cron secret not configured.' }, { status: 500 });
  }
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let processedCount = 0;
  let updatedCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  try {
    // 3. Fetch Pending Predictions
    const { data: pendingPredictions, error: fetchError } = await supabase
      .from('Predictions')
      .select('*')
      .eq('status', 'pending');

    if (fetchError) {
      console.error('Supabase error fetching pending predictions:', fetchError);
      return NextResponse.json({ error: `Supabase error: ${fetchError.message}` }, { status: 500 });
    }

    if (!pendingPredictions || pendingPredictions.length === 0) {
      return NextResponse.json({ message: 'No pending predictions to process.' }, { status: 200 });
    }

    processedCount = pendingPredictions.length;

    // 4. Iterate and Process
    for (const prediction of pendingPredictions as Prediction[]) {
      const predictionTime = new Date(prediction.prediction_timestamp).getTime();
      const currentTime = Date.now();
      const resolutionTime = predictionTime + (RESOLUTION_WINDOW_HOURS * 60 * 60 * 1000);

      if (currentTime >= resolutionTime) {
        // Time to resolve
        const currentMarketData = await getCoinMarketData(prediction.coin_id);

        if (currentMarketData && typeof currentMarketData.current_price === 'number') {
          const currentPrice = currentMarketData.current_price;
          let newStatus: Prediction['status'] = 'incorrect';

          const priceAtPrediction = prediction.actual_price_at_prediction;

          if (currentPrice > priceAtPrediction && prediction.predicted_direction === 'up') {
            newStatus = 'correct';
          } else if (currentPrice < priceAtPrediction && prediction.predicted_direction === 'down') {
            newStatus = 'correct';
          } else if (currentPrice === priceAtPrediction) {
            // Edge case: Price is exactly the same. Consider this incorrect or a draw.
            // For simplicity, let's count it as incorrect as it didn't go in the predicted direction.
            newStatus = 'incorrect'; 
          }

          const { error: updateError } = await supabase
            .from('Predictions')
            .update({
              status: newStatus,
              price_at_resolution: currentPrice,
            })
            .eq('id', prediction.id);

          if (updateError) {
            console.error(`Error updating prediction ${prediction.id}:`, updateError);
            errors.push(`Failed to update prediction ${prediction.id}: ${updateError.message}`);
            errorCount++;
          } else {
            updatedCount++;
          }
        } else {
          console.warn(`Could not fetch current price for coin_id ${prediction.coin_id} for prediction ${prediction.id}. Leaving as pending.`);
          // Optionally, implement a retry mechanism or mark as 'error_resolving' after several failures.
          // For now, it remains 'pending' and will be picked up in the next run.
          errors.push(`Could not fetch price for ${prediction.coin_id} (prediction ID: ${prediction.id})`);
          errorCount++; // Counting this as an error for this run, though it's a soft error (retry)
        }
      }
    }

    // 5. Response
    return NextResponse.json({
      message: 'Prediction resolution process finished.',
      totalPending: processedCount,
      resolvedInThisRun: updatedCount,
      errorsEncountered: errorCount,
      errorMessages: errors.length > 0 ? errors : undefined,
    }, { status: 200 });

  } catch (error) {
    console.error('Error in resolve-predictions:', error);
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred.' }, { status: 500 });
  }
}
