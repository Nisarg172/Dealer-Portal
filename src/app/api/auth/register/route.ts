import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export async function POST(req: NextRequest) {
  const { email, password, role } = await req.json();


  if (!SUPABASE_SERVICE_ROLE_KEY || !NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: 'Server configuration error: Supabase service role key or URL not set.' }, { status: 500 });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const { data: userData, error: userError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (userError) {
    return NextResponse.json(
      { error: userError.message },
      { status: 400 }
    );
  }

  // Insert into existing public.users table
  if (userData.user) {
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: userData.user.id,
        email,
        role: role || 'user',
        password_hash: passwordHash, // Storing the bcrypt hash
      });

    if (profileError) {
      // If profile insertion fails, you might want to consider deleting the auth user as well
      const adminSupabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      await adminSupabase.auth.admin.deleteUser(userData.user.id);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }
  }

  return NextResponse.json(
    { message: 'User registered successfully!' },
    { status: 200 }
  );
}
