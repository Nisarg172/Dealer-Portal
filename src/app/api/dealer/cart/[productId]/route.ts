import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { supabase } from '@/lib/supabase';

const JWT_SECRET = process.env.JWT_SECRET;

async function getDealerIdFromAuth() {
    const token = cookies().get('auth_token')?.value;
    if (!token || !JWT_SECRET) {
      return null;
    }
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      const userId = payload.id as string;
  
      const { data: dealerData, error: dealerError } = await supabase
        .from('dealers')
        .select('id')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .single();
  
      if (dealerError || !dealerData) {
        console.error('Error fetching dealer data in cart DELETE API:', dealerError);
        return null;
      }
      return dealerData.id; 
    } catch (error) {
      console.error('Error verifying token in cart DELETE API:', error);
      return null;
    }
}

// DELETE /api/dealer/cart/[productId] - Remove a specific product from cart
export async function DELETE(req: NextRequest, { params }: { params: { productId: string } }) {
    const dealerId = await getDealerIdFromAuth();
    if (!dealerId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const productId = params.productId;

    try {
        const { error } = await supabase
            .from('dealer_cart_items')
            .delete()
            .eq('dealer_id', dealerId)
            .eq('product_id', productId);

        if (error) {
            console.error('Error deleting cart item:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Product removed from cart successfully!' });
    } catch (err) {
        console.error('Unexpected error in dealer cart DELETE API:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

