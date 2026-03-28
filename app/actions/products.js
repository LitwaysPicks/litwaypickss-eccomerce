"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/session";
import { deleteCloudinaryImages } from "@/lib/cloudinary";

/**
 * Delete a product and all its associated data.
 *
 * Order of operations:
 *  1. Re-validate admin session (server-side auth check)
 *  2. Fetch the product's image URLs before deleting
 *  3. Delete product_tags rows (FK constraint)
 *  4. Delete the product row
 *  5. Delete images from Cloudinary storage
 *
 * Cloudinary cleanup runs last so a storage failure never blocks the DB delete.
 */
export async function deleteProductAction(productId) {
  await requireAdmin();

  const supabase = await createClient();

  // Fetch image URLs before the row is gone
  const { data: product } = await supabase
    .from("products")
    .select("image_urls")
    .eq("id", productId)
    .single();

  // Remove tags first (foreign key constraint)
  await supabase.from("product_tags").delete().eq("product_id", productId);

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) throw new Error(error.message);

  // Clean up Cloudinary images — errors are swallowed so the DB delete
  // is always considered successful from the caller's perspective.
  if (product?.image_urls?.length > 0) {
    await deleteCloudinaryImages(product.image_urls).catch(() => {});
  }
}
