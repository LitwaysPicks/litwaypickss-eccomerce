"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/session";
import { deleteCloudinaryImages } from "@/lib/cloudinary";

export async function deleteProductAction(productId) {
  try {
    await requireAdmin();

    const supabase = await createClient();

    const { data: product } = await supabase
      .from("products")
      .select("image_urls")
      .eq("id", productId)
      .single();

    await supabase.from("product_tags").delete().eq("product_id", productId);

    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) return { error: error.message };

    if (product?.image_urls?.length > 0) {
      await deleteCloudinaryImages(product.image_urls).catch(() => {});
    }

    return {};
  } catch (err) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
    return { error: err.message || "Failed to delete product." };
  }
}
