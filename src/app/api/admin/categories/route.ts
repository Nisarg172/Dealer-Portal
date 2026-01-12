import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAdminIdFromAuth } from '../../utils/functions';


// GET /api/admin/categories - Fetch all categories
export async function GET(req: NextRequest) {
  const payload = await getAdminIdFromAuth();
  if (!payload || payload?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }


  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name')
      .is('deleted_at', null) // Only active (not soft-deleted) categories
      .order('name', { ascending: true });

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

// POST /api/admin/categories - Create a new category
export async function POST(req: NextRequest) {
  const payload = await getAdminIdFromAuth();
  if (!payload || payload?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await req.json();

  if (!name) {
    return NextResponse.json({ error: 'Category name is required.' }, { status: 400 });
  }

  try {
    const { data: newCategory, error } = await supabase
      .from('categories')
      .insert({ name })
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, category: newCategory }, { status: 201 });
  } catch (err) {
    console.error('Unexpected error creating category:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
