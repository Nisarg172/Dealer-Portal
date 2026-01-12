import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { getAdminIdFromAuth } from '../../utils/functions';


const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Create a new dealer
export async function POST(req: NextRequest) {
    const payload = await getAdminIdFromAuth();
    if (!payload || payload?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  try {
    const { name, email, phone, company_name, address, password } = await req.json();

    if (!SUPABASE_SERVICE_ROLE_KEY || !NEXT_PUBLIC_SUPABASE_URL) {
        return NextResponse.json({ error: 'Server configuration error: Supabase service role key or URL not set.' }, { status: 500 });
    }

    // Input validation (simplified, expand as needed)
    if (!name || !password || !company_name) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    if (!email && !phone) {
      return NextResponse.json({ error: 'Either email or phone is required.' }, { status: 400 });
    }

    // Check if email or phone already exists
    
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq(`${email?'email':'phone'}`,`${email || phone}`);

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error checking existing user:', fetchError);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
    
    if (existingUser && existingUser.length > 0) {
        return NextResponse.json({ error: 'User with this email or phone already exists.' }, { status: 409 });
    }

    // Create user in Supabase Auth
    const { data: userData, error: userError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (userError || !userData.user) {
      console.error('Error creating user in Supabase Auth:', userError);
      return NextResponse.json({ error: userError?.message || 'Failed to create user.' }, { status: 400 });
    }

    const userId = userData.user.id;

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
    // Insert into existing public.users table
    const { error: profileError } = await supabase
        .from('users')
        .insert({
            id: userId,
            email,
            phone,
            role: 'dealer',
            password_hash: passwordHash, 
        });

    if (profileError) {
        console.error('Error inserting user profile:', profileError);
        // Rollback auth user creation if profile insert fails
        const adminSupabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        await adminSupabase.auth.admin.deleteUser(userId);
        return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // Then create dealer, linking to the new user
    const { data: newDealer, error: dealerError } = await supabase
      .from('dealers')
      .insert({
        user_id: userId,
        name,
        company_name,
        address,
      })
      .select()
      .single();

    if (dealerError) {
      console.error('Error creating dealer:', dealerError);
      // Rollback user creation if dealer creation fails
      const adminSupabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      await adminSupabase.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: dealerError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, dealer: newDealer }, { status: 201 });
  } catch (err) {
    console.error('Unexpected error creating dealer:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Get all dealers
export async function GET(req: NextRequest) {
    try {

        const payload = await getAdminIdFromAuth();
         if (!payload || payload?.role !== 'admin') {
              return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

        const { data: dealers, error } = await supabase
            .from('dealers')
            .select(
                `
                id,
                name,
                company_name,
                address,
                users ( email, phone, is_active )
            `)
            .is('deleted_at', null); // Only active (not soft-deleted) dealers

        if (error) {
            console.error('Error fetching dealers:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ dealers });
    } catch (err) {
        console.error('Unexpected error fetching dealers:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}