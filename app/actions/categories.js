"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/session";
import { deleteCloudinaryImages } from "@/lib/cloudinary";

export async function addCategoryAction(categoryData) {
  try {
    await requireAdmin();
    const supabase = await createClient();
    const { error } = await supabase.from("categories").insert({
      id: categoryData.slug,
      name: categoryData.name,
      slug: categoryData.slug,
      image: categoryData.image,
      item_count: 0,
    });
    if (error) return { error: error.message };
    return {};
  } catch (err) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
    return { error: err.message || "Failed to add category." };
  }
}

export async function deleteCategoryAction(categoryId) {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { data: category } = await supabase
      .from("categories")
      .select("image")
      .eq("id", categoryId)
      .single();

    const { error } = await supabase.from("categories").delete().eq("id", categoryId);
    if (error) return { error: error.message };

    if (category?.image) {
      await deleteCloudinaryImages([category.image]).catch(() => {});
    }

    return {};
  } catch (err) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
    return { error: err.message || "Failed to delete category." };
  }
}
