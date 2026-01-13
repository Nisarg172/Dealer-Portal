import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req: NextRequest) {
  if (!JWT_SECRET) {
    return NextResponse.json({ error: 'Server configuration error: JWT_SECRET not set.' }, { status: 500 });
  }

  
  try {
    const { identifier, password} = await req.json();
    console.log("===========>")

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    // Sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: identifier,
      // phone: identifier,
      password,
    });

    console.log("==============>",identifier,password)
    console.log("===========>",authData, authError)

    if (authError || !authData.user) {
      console.error('Supabase sign-in error:', authError);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Fetch user role from public.users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, role,dealers(id)')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !userProfile) {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json({ error: 'User profile not found or database error' }, { status: 500 });
    }
    
    // Generate JWT using jose
    const token = await new SignJWT({ id: userProfile.id, role: userProfile.role,dealers: userProfile.dealers })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h') // Token expires in 1 hour
      .sign(new TextEncoder().encode(JWT_SECRET));


    // Set the token as an HTTP-only cookie
    const response = NextResponse.json({ success: true, user: { id: userProfile.id, role: userProfile.role, dealers: userProfile.dealers } });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60, // 1 hour
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } catch (err) {
    console.error('Unexpected error during login:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


