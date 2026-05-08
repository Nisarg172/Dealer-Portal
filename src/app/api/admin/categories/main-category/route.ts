import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAdminIdFromAuth } from '../../../utils/functions';

// PUT /api/admin/categories/main-category - Rename a main category for all mapped sub-categories
export async function PUT(req: NextRequest) {
  const payload = await getAdminIdFromAuth();
  if (!payload || payload?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const currentMainCategory = (body?.current_main_category || '').trim();
    const newMainCategory = (body?.new_main_category || '').trim();

    if (!currentMainCategory || !newMainCategory) {
      return NextResponse.json(
        { error: 'Current and new main category are required.' },
        { status: 400 }
      );
    }

    if (currentMainCategory === newMainCategory) {
      return NextResponse.json({ success: true, updatedCount: 0 });
    }

    const { data: existingCategories, error: fetchError } = await supabase
      .from('categories')
      .select('id')
      .eq('main_category', currentMainCategory)
      .is('deleted_at', null);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!existingCategories || existingCategories.length === 0) {
      return NextResponse.json(
        { error: 'Main category not found.' },
        { status: 404 }
      );
    }

    const { error: updateError } = await supabase
      .from('categories')
      .update({
        main_category: newMainCategory,
        updated_at: new Date().toISOString(),
      })
      .eq('main_category', currentMainCategory)
      .is('deleted_at', null);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      updatedCount: existingCategories.length,
    });
  } catch (err) {
    console.error('Unexpected error renaming main category:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
