import { supabase } from '@/lib/supabase';

interface ProductDetails {
  id: string;
  base_price: number;
  category_id: string;
}

interface DealerContext {
  dealerId: string;
}

export async function calculateDealerPrice(
  product: ProductDetails,
  dealerContext: DealerContext
): Promise<number> {
  let discountedPrice = product.base_price;
  // Fetch category-specific discount for the dealer
  const { data: discount, error: discountError } = await supabase
  .from('dealer_category_discounts')
  .select('discount_percentage')
  .eq('dealer_id', dealerContext.dealerId)
  .eq('category_id', product.category_id)
  .single();
  
  if (discountError && discountError.code !== 'PGRST116') {
    console.error('Error fetching discount for dealer and category:', discountError);
    // In a real application, you might want to throw an error or handle it more gracefully
    // For now, we'll proceed without a discount if there's an error.
  }


  if (discount) {
    const discountAmount = (product.base_price * discount.discount_percentage) / 100;
    discountedPrice = product.base_price - discountAmount;
    console.log(`Applied discount of ${discount.discount_percentage}% for dealer ${dealerContext.dealerId} on product ${product.id} finel price: ${discountedPrice}`);
  }

  return parseFloat(discountedPrice.toFixed(2)); // Round to two decimal places
}



