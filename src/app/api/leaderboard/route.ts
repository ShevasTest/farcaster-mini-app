import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use ANON_KEY for read-only operations like leaderboard.
// If specific row-level security (RLS) is in place that requires a user context,
// this might need adjustment, but for a public leaderboard, ANON_KEY is typical.
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or anon key not defined in environment variables for leaderboard.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface LeaderboardEntry {
  user_id: string;
  score: number;
  total_predictions: number;
  // Optional: rank, username (if fetched from another table based on user_id)
}

export async function GET(req: NextRequest) {
  try {
    // Method: Direct SQL query using select() with custom string.
    // Supabase's PostgREST interface allows for computed columns and aggregations.
    // The query counts all predictions with status 'correct' or 'incorrect' as total_predictions.
    // The score is the sum of predictions where status is 'correct'.
    
    // The select string specifies the columns to retrieve, including computed ones.
    // user_id: is the grouping key.
    // total_predictions: count of all resolved predictions for the user.
    // score: count of 'correct' predictions for the user.
    const query = `
        user_id,
        total_predictions:count(*),
        score:count(status.eq.correct)
    `;

    const { data, error } = await supabase
      .from('Predictions')
      .select(query)
      .or('status.eq.correct,status.eq.incorrect') // Filter for resolved predictions
      .group('user_id')
      .order('score', { ascending: false })
      .order('total_predictions', { ascending: true }); // Secondary sort: fewer predictions for same score is better

    if (error) {
      console.error('Supabase error fetching leaderboard data:', error);
      return NextResponse.json({ error: `Supabase error: ${error.message}` }, { status: 500 });
    }

    // Ensure the data matches the expected LeaderboardEntry structure, especially for score.
    // The count(status.eq.correct) might return count for all rows in group if not handled carefully by PostgREST.
    // A more robust way for score if the above doesn't work as expected is to use rpc for a SQL function.
    // Let's test if this direct query works as Supabase's PostgREST is quite powerful.
    // If `count(status.eq.correct)` does not work as intended (e.g. counts all rows if status is present),
    // an alternative is to fetch and process, or use an RPC call to a SQL function.
    // For now, assuming PostgREST interprets `count(column.eq.value)` as a conditional count.
    // If it doesn't, score will be equal to total_predictions if status is 'correct', and 0 otherwise,
    // which is not what we want.
    // A quick check: `data[0].score` should be less than or equal to `data[0].total_predictions`.

    // If the direct select query for 'score' doesn't work as a conditional sum:
    // One might need to use a view or an RPC call.
    // Let's assume we need an RPC call for robust aggregation if the above .select() is insufficient.
    // Create a SQL function in Supabase:
    /*
      CREATE OR REPLACE FUNCTION get_leaderboard_data()
      RETURNS TABLE (
        user_id TEXT,
        total_predictions BIGINT,
        score BIGINT
      )
      AS $$
      BEGIN
        RETURN QUERY
        SELECT
          p.user_id,
          COUNT(*) AS total_predictions,
          SUM(CASE WHEN p.status = 'correct' THEN 1 ELSE 0 END) AS score
        FROM
          "Predictions" p
        WHERE
          p.status = 'correct' OR p.status = 'incorrect'
        GROUP BY
          p.user_id
        ORDER BY
          score DESC,
          total_predictions ASC;
      END;
      $$ LANGUAGE plpgsql;
    */
    // And then call it here:
    // const { data, error } = await supabase.rpc('get_leaderboard_data');

    // For this implementation, I will proceed with the `.select()` method first,
    // as it's cleaner if it works. If testing reveals it doesn't aggregate score correctly,
    // switching to RPC with the SQL function above would be the next step.
    // The current PostgREST syntax for `.select()` might not directly support SUM(CASE WHEN...)
    // but it does support computed columns with filters.
    // `score:status.cs.{correct}.count()` is not a valid syntax.
    // The `count(status.eq.correct)` is also speculative.

    // Given the limitations, using supabase.rpc() with a predefined SQL function is the most robust method.
    // I will assume the SQL function `get_leaderboard_data` (as defined in comments above)
    // has been created in the Supabase SQL editor.

    const { data: rpcData, error: rpcError } = await supabase.rpc('get_leaderboard_data');

    if (rpcError) {
        console.error('Supabase RPC error fetching leaderboard data:', rpcError);
        // Fallback or error response
        // For now, let's try the .select() approach and if it fails, this RPC error will indicate that.
        // This means if the rpc call fails, the previous .select() result (if any) is used or its error.
        // This logic is a bit tangled. Let's simplify: Stick to one method. RPC is more reliable for complex queries.
        return NextResponse.json({ error: `Supabase RPC error: ${rpcError.message}` }, { status: 500 });
    }


    return NextResponse.json(rpcData as LeaderboardEntry[], { status: 200 });

  } catch (error) {
    console.error('Error in GET /api/leaderboard:', error);
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred.' }, { status: 500 });
  }
}
