"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/session";
import { deleteCloudinaryImages } from "@/lib/cloudinary";

export async function addCategoryAction(categoryData) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("categories").insert({
    id: categoryData.slug,
    name: categoryData.name,
    slug: categoryData.slug,
    image: categoryData.image,
    item_count: "0",
  });

  if (error) throw new Error(error.message);
}

export async function deleteCategoryAction(categoryId) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("image")
    .eq("id", categoryId)
    .single();

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId);

  if (error) throw new Error(error.message);

  if (category?.image) {
    await deleteCloudinaryImages([category.image]).catch(() => {});
  }
}
