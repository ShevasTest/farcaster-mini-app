import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Using anon key, consider service_role for admin
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

interface RouteParams {
  params: {
    id: string; // This is the database UUID of the coin
  };
}

// PUT method to update a coin's is_active status
export async function PUT(req: NextRequest, { params }: RouteParams) {
  if (!authenticateRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const body = await req.json();
    const { is_active } = body;

    // Validate input
    if (typeof is_active !== 'boolean') {
      return NextResponse.json({ error: 'Invalid input: is_active must be a boolean' }, { status: 400 });
    }
    if (!id || typeof id !== 'string') {
        return NextResponse.json({ error: 'Invalid or missing coin ID' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('ManagedCoins')
      .update({ 
        is_active: is_active,
        updated_at: new Date().toISOString() // Manually set updated_at, or rely on DB trigger if set up
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating coin:', error);
      if (error.code === 'PGRST204') { // PostgREST code for "No rows found"
        return NextResponse.json({ error: 'Coin not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!data) { // Should be caught by error.code PGRST204, but as a fallback
        return NextResponse.json({ error: 'Coin not found or no change made' }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('API PUT error:', error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE method to remove a coin
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  if (!authenticateRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Invalid or missing coin ID' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('ManagedCoins')
      .delete()
      .eq('id', id)
      .select()
      .single(); // To get the deleted row back, if needed, or check if it existed

    if (error) {
      console.error('Supabase error deleting coin:', error);
      if (error.code === 'PGRST204') { // PostgREST code for "No rows found"
        return NextResponse.json({ error: 'Coin not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) { // If the row did not exist
        return NextResponse.json({ error: 'Coin not found' }, { status: 404 });
    }
    
    // Successfully deleted, can return 204 or the deleted data
    // return new NextResponse(null, { status: 204 }); 
    return NextResponse.json(data, { status: 200 }); // Returning the deleted coin data

  } catch (error) {
    console.error('API DELETE error:', error);
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
