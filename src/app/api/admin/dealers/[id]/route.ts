import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { getAdminIdFromAuth } from '@/app/api/utils/functions';

// GET /api/admin/dealers/[id] - Fetch details for a single dealer
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = await getAdminIdFromAuth();
  if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dealerId = params.id; // This 'id' is the user_id linked to the dealer

  try {
    const { data: dealerData, error: dealerError } = await supabase
      .from('dealers')
      .select(
        `
        id,
        name,
        company_name,
        address,
        users ( id, email, phone, is_active )
        `
      )
      .eq('id', dealerId) // Assuming dealerId from params is the user_id
      .is('deleted_at', null) // Only active dealers
      .single();
    if (dealerError || !dealerData) {
      console.error('Error fetching dealer:', dealerError);
      return NextResponse.json({ error: 'Dealer not found or database error.' }, { status: 404 });
    }


    return NextResponse.json({ dealer: dealerData });
  } catch (err) {
    console.error('Unexpected error fetching dealer:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/admin/dealers/[id] - Update details for a single dealer
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const payload = await getAdminIdFromAuth();
    if (!payload) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dealerId = params.id; // This 'id' is the user_id linked to the the dealer
    const { name, email, phone, company_name, address, password, is_active } = await req.json();

    console.log('Updating dealer with data:', { name, email, phone, company_name, address, is_active });
    try {
        // Update user (email, phone, is_active, password if provided)
        const updateUserData: any = {};
        if (email) updateUserData.email = email;
        if (phone) updateUserData.phone = phone;
        if (is_active !== undefined) updateUserData.is_active = is_active;

        if (password) {
            // Hash new password if provided
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            updateUserData.password_hash = passwordHash;
        }

        const { error: userUpdateError } = await supabase
            .from('users')
            .update(updateUserData)
            .eq('id', dealerId);

        if (userUpdateError) {
            console.error('Error updating user details:', userUpdateError);
            return NextResponse.json({ error: userUpdateError.message }, { status: 500 });
        }

        // Update dealer (name, company_name, address)
        const updateDealerData: any = {};
        if (name) updateDealerData.name = name;
        if (company_name) updateDealerData.company_name = company_name;
        if (address) updateDealerData.address = address;

        
        const { error: dealerUpdateError } = await supabase
            .from('dealers')
            .update(updateDealerData)
            .eq('id', dealerId);

        if (dealerUpdateError) {
            console.error('Error updating dealer details:', dealerUpdateError);
            return NextResponse.json({ error: dealerUpdateError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Dealer updated successfully!' });
    } catch (err) {
        console.error('Unexpected error updating dealer:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
