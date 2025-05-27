import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Using anon key for server-side, consider service_role for admin operations
const adminPassword = process.env.ADMIN_PASSWORD;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or anon key not defined in environment variables.");
}
if (!adminPassword) {
    console.warn("ADMIN_PASSWORD environment variable is not set. Admin API will be unprotected.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Password protection middleware (conceptual)
// Checks for 'Authorization: Bearer <password>' header
function authenticateRequest(req: NextRequest): boolean {
    if (!adminPassword) return true; // No password set, allow access (not recommended for production)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return false;
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' && token === adminPassword;
}

// GET method to fetch all coins
export async function GET(req: NextRequest) {
  if (!authenticateRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from('ManagedCoins')
      .select('*')
      .order('created_at', { ascending: false }); // Fetch all, irrespective of is_active

    if (error) {
      console.error('Supabase error fetching coins:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('API GET error:', error);
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST method to add a new coin
export async function POST(req: NextRequest) {
  if (!authenticateRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { coin_id, symbol, name, image_url, is_active = true } = body; // is_active defaults to true

    // Validate input
    if (!coin_id || !symbol || !name) {
      return NextResponse.json({ error: 'Missing required fields: coin_id, symbol, name' }, { status: 400 });
    }
    if (typeof coin_id !== 'string' || typeof symbol !== 'string' || typeof name !== 'string') {
        return NextResponse.json({ error: 'Invalid data types for coin_id, symbol, or name' }, { status: 400 });
    }
    if (image_url && typeof image_url !== 'string') {
        return NextResponse.json({ error: 'Invalid data type for image_url' }, { status: 400 });
    }
    if (typeof is_active !== 'boolean') {
        return NextResponse.json({ error: 'Invalid data type for is_active' }, { status: 400 });
    }


    const newCoinData = {
      coin_id,
      symbol,
      name,
      image_url: image_url || null, // Ensure null if empty string or undefined
      is_active,
      // created_at and updated_at will be handled by the database
    };

    const { data, error } = await supabase
      .from('ManagedCoins')
      .insert([newCoinData])
      .select()
      .single(); // Expecting a single object back

    if (error) {
      console.error('Supabase error adding coin:', error);
      // Check for unique constraint violation (e.g., duplicate coin_id)
      if (error.code === '23505') { // PostgreSQL unique violation error code
        return NextResponse.json({ error: 'Coin with this coin_id already exists.' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error('API POST error:', error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
