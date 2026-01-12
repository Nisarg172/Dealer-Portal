import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name, description, is_active')
      .eq('is_active', true) // Only active categories
      .is('deleted_at', null); // Not soft-deleted

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ categories });
  } catch (err) {
    console.error('Unexpected error fetching categories:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


