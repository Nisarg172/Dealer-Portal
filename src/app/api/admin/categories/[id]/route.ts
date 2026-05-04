import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { supabase } from '@/lib/supabase';
import { randomUUID } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET;

async function getAdminIdFromAuth() {
  const token = cookies().get('auth_token')?.value;
  if (!token || !JWT_SECRET) {
    return null;
  }
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    const userId = payload.id as string;

    const { data: userRole, error: roleError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (roleError || !userRole || userRole.role !== 'admin') {
        console.error('User is not an admin or role not found:', roleError);
        return null;
    }
    return userId; 
  } catch (error) {
    console.error('Error verifying token in admin category API:', error);
    return null;
  }
}

// GET /api/admin/categories/[id] - Fetch details for a single category
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const adminId = await getAdminIdFromAuth();
  if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const categoryId = params.id;

  try {
    const { data: category, error } = await supabase
      .from('categories')
      .select('id, name, image_url')
      .eq('id', categoryId)
      .is('deleted_at', null)
      .single();

    if (error || !category) {
      console.error('Error fetching category:', error);
      return NextResponse.json({ error: 'Category not found or database error.' }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (err) {
    console.error('Unexpected error fetching category:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/admin/categories/[id] - Update details for a single category
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const adminId = await getAdminIdFromAuth();
  if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const categoryId = params.id;

  try {
    const contentType = req.headers.get('content-type') || '';
    let name = '';
    let imageFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      name = ((formData.get('name') as string) || '').trim();
      imageFile = formData.get('category_image') as File | null;
    } else {
      const body = await req.json();
      name = (body?.name || '').trim();
    }

    if (!name) {
      return NextResponse.json({ error: 'Category name is required.' }, { status: 400 });
    }

    const { data: existingCategory, error: existingCategoryError } = await supabase
      .from('categories')
      .select('image_url')
      .eq('id', categoryId)
      .is('deleted_at', null)
      .single();

    if (existingCategoryError || !existingCategory) {
      return NextResponse.json({ error: 'Category not found or database error.' }, { status: 404 });
    }

    let image_url = existingCategory.image_url;

    if (imageFile && imageFile.size > 0) {
      if (image_url) {
        const oldPath = image_url.split('/product-images/')[1];
        if (oldPath) {
          await supabase.storage
            .from('product-images')
            .remove([oldPath]);
        }
      }

      const fileExt = imageFile.name.split('.').pop() || 'jpg';
      const fileName = `categories/${randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, imageFile, {
          contentType: imageFile.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('Error uploading category image:', uploadError);
        return NextResponse.json({ error: 'Image upload failed' }, { status: 500 });
      }

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      image_url = publicUrlData.publicUrl;
    }
    const { data: updatedCategory, error } = await supabase
      .from('categories')
      .update({
        name,
        image_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', categoryId)
      .select()
      .single();

    if (error || !updatedCategory) {
      console.error('Error updating category:', error);
      return NextResponse.json({ error: error?.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, category: updatedCategory }, { status: 200 });
  } catch (err) {
    console.error('Unexpected error updating category:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/admin/categories/[id] - Soft delete a category
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const adminId = await getAdminIdFromAuth();
  if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const categoryId = params.id;

  try {
    // In a real app, you might also want to check if products are linked to this category
    // and prevent deletion or reassign them. For now, a soft delete.
    const { error } = await supabase
      .from('categories')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', categoryId);

    if (error) {
      console.error('Error soft-deleting category:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Category soft-deleted successfully!' });
  } catch (err) {
    console.error('Unexpected error soft-deleting category:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
