import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAdminIdFromAuth } from "../utils/functions";

export async function GET() {
  try {
    const payload = await getAdminIdFromAuth();

    if (!payload?.dealers?.id) {
      return NextResponse.json(
        { error: "dealer id is required" },
        { status: 500 },
      );
    }
    const { data: hidden, error: dealerHiddenCategoriesError } = await supabase
      .from("dealer_hidden_categories")
      .select("category_id")
      .eq("dealer_id", payload?.dealers?.id);
    if (dealerHiddenCategoriesError) {
      console.error("Error fetching categories:", dealerHiddenCategoriesError);
      return NextResponse.json(
        { error: dealerHiddenCategoriesError.message },
        { status: 500 },
      );
    }

    const hiddenIds = hidden.map((h) => h.category_id);

    const { data: categories, error } = await supabase
      .from("categories")
      .select("*")
      .is('deleted_at', null)
      .eq("is_active",true)
      .not("id", "in", `(${hiddenIds.join(",")})`);

    if (error) {
      console.error("Error fetching categories:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ categories });
  } catch (err) {
    console.error("Unexpected error fetching categories:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
