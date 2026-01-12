import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { calculateDealerPrice } from '@/lib/priceCalculator';
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
        console.error('Error fetching dealer data in cart API:', dealerError);
        return null;
      }
      return dealerData.id; 
    } catch (error) {
      console.error('Error verifying token in cart API:', error);
      return null;
    }
}

// GET /api/dealer/cart - Fetch dealer's cart items
export async function GET(req: NextRequest) {
    const dealerId = await getDealerIdFromAuth();
    if (!dealerId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    try {
        const { data: cartItems, error } = await supabase
            .from('dealer_cart_items')
            .select(
                `
                id,
                product_id,
                quantity,
                price_at_addition, 
                products ( id, name, base_price, category_id: categories (id) )
                `
            )
            .eq('dealer_id', dealerId);

        if (error) {
            console.error('Error fetching cart items:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const updatedCartItems = await Promise.all(cartItems.map(async (item) => {
            const productId = item.products?.id;
            const basePrice = item.products?.base_price;
            const categoryId = item.products?.category_id?.id; 

            if (!productId || basePrice === undefined || !categoryId) {
                console.warn(`Missing product details for cart item ${item.id}`);
                return { ...item, current_discounted_price: item.price_at_addition }; 
            }

            const { data: hiddenProduct } = await supabase.from('dealer_hidden_products').select('product_id').eq('dealer_id', dealerId).eq('product_id', productId).single();
            const { data: hiddenCategory } = await supabase.from('dealer_hidden_categories').select('category_id').eq('dealer_id', dealerId).eq('category_id', categoryId).single();

            if (hiddenProduct || hiddenCategory) {
                return null; 
            }

            const currentDiscountedPrice = await calculateDealerPrice({ id: productId, base_price: basePrice, category_id: categoryId }, { dealerId });

            return { ...item, current_discounted_price: currentDiscountedPrice };
        }));

        const filteredCartItems = updatedCartItems.filter(item => item !== null);

        return NextResponse.json({ cartItems: filteredCartItems });
    } catch (err) {
        console.error('Unexpected error fetching cart items:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST /api/dealer/cart - Add or update product in cart
export async function POST(req: NextRequest) {
    const dealerId = await getDealerIdFromAuth();
    if (!dealerId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, quantity } = await req.json();

    if (!productId || quantity === undefined || quantity <= 0) {
        return NextResponse.json({ error: 'Product ID and quantity (must be > 0) are required.' }, { status: 400 });
    }

    try {
        const { data: productData, error: productError } = await supabase
            .from('products')
            .select('id, base_price, is_active, category_id: categories (id)')
            .eq('id', productId)
            .single();

        if (productError || !productData) {
            console.error('Error fetching product for cart:', productError);
            return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
        }

        if (productData.is_active === false) {
            return NextResponse.json({ error: 'Product is inactive and cannot be added to cart.' }, { status: 400 });
        }

        const categoryId = productData.category_id?.id; 

        const { data: hiddenProduct } = await supabase.from('dealer_hidden_products').select('product_id').eq('dealer_id', dealerId).eq('product_id', productId).single();
        const { data: hiddenCategory } = await supabase.from('dealer_hidden_categories').select('category_id').eq('dealer_id', dealerId).eq('category_id', categoryId).single();

        if (hiddenProduct || hiddenCategory) {
            return NextResponse.json({ error: 'Product is not visible to this dealer.' }, { status: 403 });
        }

        const priceAtAddition = await calculateDealerPrice({ id: productId, base_price: productData.base_price, category_id: categoryId || '' }, { dealerId });

        const { data: existingCartItem, error: fetchCartItemError } = await supabase
            .from('dealer_cart_items')
            .select('id')
            .eq('dealer_id', dealerId)
            .eq('product_id', productId)
            .single();

        if (fetchCartItemError && fetchCartItemError.code !== 'PGRST116') {
            console.error('Error checking existing cart item:', fetchCartItemError);
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }

        let upsertError;
        if (existingCartItem) {
            const { error } = await supabase
                .from('dealer_cart_items')
                .update({ quantity: quantity, price_at_addition: priceAtAddition }) 
                .eq('id', existingCartItem.id);
            upsertError = error;
        } else {
            const { error } = await supabase
                .from('dealer_cart_items')
                .insert({
                    dealer_id: dealerId,
                    product_id: productId,
                    quantity,
                    price_at_addition: priceAtAddition,
                });
            upsertError = error;
        }

        if (upsertError) {
            console.error('Error upserting cart item:', upsertError);
            return NextResponse.json({ error: upsertError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Cart updated successfully!' });
    } catch (err) {
        console.error('Unexpected error in dealer cart POST API:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT /api/dealer/cart - Update cart item quantities or remove items
export async function PUT(req: NextRequest) {
    const dealerId = await getDealerIdFromAuth();
    if (!dealerId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { updates } = await req.json(); // Array of { productId, quantity } or { productId, remove: true }

    if (!Array.isArray(updates)) {
        return NextResponse.json({ error: 'Invalid request body. Expected an array of updates.' }, { status: 400 });
    }

    try {
        for (const update of updates) {
            const { productId, quantity, remove } = update;

            if (remove) {
                // Remove item from cart
                const { error: deleteError } = await supabase
                    .from('dealer_cart_items')
                    .delete()
                    .eq('dealer_id', dealerId)
                    .eq('product_id', productId);
                
                if (deleteError) {
                    console.error(`Error removing product ${productId} from cart:`, deleteError);
                    // Continue to process other updates or return error
                }
            } else if (quantity !== undefined && quantity > 0) {
                // Fetch product details to recalculate price (important for security/accuracy)
                const { data: productData, error: productError } = await supabase
                    .from('products')
                    .select('id, base_price, is_active, category_id: categories (id)')
                    .eq('id', productId)
                    .single();

                if (productError || !productData || productData.is_active === false) {
                    console.warn(`Product ${productId} not found or inactive, skipping update.`);
                    continue; // Skip if product is not valid
                }

                const categoryId = productData.category_id?.id;

                // Check visibility
                const { data: hiddenProduct } = await supabase.from('dealer_hidden_products').select('product_id').eq('dealer_id', dealerId).eq('product_id', productId).single();
                const { data: hiddenCategory } = await supabase.from('dealer_hidden_categories').select('category_id').eq('dealer_id', dealerId).eq('category_id', categoryId).single();
                if (hiddenProduct || hiddenCategory) {
                    console.warn(`Product ${productId} is not visible to dealer ${dealerId}, skipping update.`);
                    continue; // Skip if not visible
                }

                const currentDiscountedPrice = await calculateDealerPrice({ id: productId, base_price: productData.base_price, category_id: categoryId || '' }, { dealerId });

                // Update quantity and price
                const { error: updateError } = await supabase
                    .from('dealer_cart_items')
                    .update({ quantity: quantity, price_at_addition: currentDiscountedPrice })
                    .eq('dealer_id', dealerId)
                    .eq('product_id', productId);

                if (updateError) {
                    console.error(`Error updating product ${productId} quantity:`, updateError);
                    // Continue to process other updates or return error
                }
            }
        }

        return NextResponse.json({ success: true, message: 'Cart updated successfully!' });
    } catch (err) {
        console.error('Unexpected error in dealer cart PUT API:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
