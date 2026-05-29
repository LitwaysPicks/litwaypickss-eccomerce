"use client";

import { useState, useRef } from "react";
import { Loader2, Plus, Trash2, ImageIcon, Pencil, X, Check } from "lucide-react";
import { toast } from "sonner";
import { useCategories } from "@/hooks/useCategories";

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uploadToCloudinary(file) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) throw new Error("Cloudinary is not configured");

  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", uploadPreset);
  fd.append("folder", "litway/categories");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: fd }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || "Upload failed");
  }

  const data = await res.json();
  return data.secure_url.replace("/upload/", "/upload/f_auto,q_auto,w_800/");
}

function ImageUploader({ preview, uploading, onChange }) {
  return (
    <label className="relative flex flex-col items-center justify-center h-36 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-primary-50/40 transition-colors overflow-hidden">
      {uploading ? (
        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
      ) : preview ? (
        <img src={preview} alt="preview" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="flex flex-col items-center gap-1.5 text-gray-400">
          <ImageIcon className="h-6 w-6" />
          <span className="text-xs">Click to upload</span>
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={onChange}
        className="sr-only"
        disabled={uploading}
      />
    </label>
  );
}

function CategoryForm({ onSave, isSaving }) {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState("");
  const blobRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (blobRef.current) URL.revokeObjectURL(blobRef.current);
    blobRef.current = URL.createObjectURL(file);
    setPreview(blobRef.current);
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setImage(url);
      toast.success("Image uploaded");
    } catch (err) {
      setPreview("");
      setImage("");
      toast.error(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Category name is required");
    if (!image) return toast.error("Category image is required");
    onSave({ name: name.trim(), slug: slugify(name), image });
    setName("");
    setImage("");
    setPreview("");
  };

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-4">
      <h3 className="text-sm font-semibold text-gray-800">New category</h3>

      <div>
        <label className="block mb-1.5 text-xs font-medium text-gray-600">
          Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Footwear"
          className="input w-full"
        />
        {name && (
          <p className="mt-1 text-[11px] text-gray-400">
            Slug: <span className="font-mono">{slugify(name)}</span>
          </p>
        )}
      </div>

      <div>
        <label className="block mb-1.5 text-xs font-medium text-gray-600">
          Image <span className="text-rose-500">*</span>
        </label>
        <ImageUploader preview={preview} uploading={uploading} onChange={handleImageUpload} />
      </div>

      <button
        type="submit"
        disabled={isSaving || uploading}
        className="btn btn-primary w-full"
      >
        {isSaving ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</>
        ) : (
          <><Plus className="h-4 w-4 mr-2" />Add category</>
        )}
      </button>
    </form>
  );
}

function CategoryCard({ category, onEdit, onDelete, isDeleting, isSaving }) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [name, setName] = useState(category.name);
  const [image, setImage] = useState(category.image);
  const [preview, setPreview] = useState(category.image);
  const [uploading, setUploading] = useState(false);
  const blobRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (blobRef.current) URL.revokeObjectURL(blobRef.current);
    blobRef.current = URL.createObjectURL(file);
    setPreview(blobRef.current);
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setImage(url);
      toast.success("Image uploaded");
    } catch (err) {
      setPreview(category.image);
      setImage(category.image);
      toast.error(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSave = () => {
    if (!name.trim()) return toast.error("Category name is required");
    const updates = {};
    if (name.trim() !== category.name) updates.name = name.trim();
    if (image !== category.image) updates.image = image;
    if (Object.keys(updates).length === 0) {
      setEditing(false);
      return;
    }
    onEdit(category.id, updates, () => setEditing(false));
  };

  const handleCancel = () => {
    setName(category.name);
    setImage(category.image);
    setPreview(category.image);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="card overflow-hidden">
        <div className="relative h-36 bg-gray-100">
          <ImageUploader preview={preview} uploading={uploading} onChange={handleImageUpload} />
        </div>

        <div className="p-3 space-y-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input w-full text-sm"
            placeholder="Category name"
            autoFocus
          />
          <p className="text-[11px] text-gray-400 font-mono">{category.slug}</p>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving || uploading}
              className="flex-1 btn btn-primary text-xs py-1.5"
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <><Check className="h-3.5 w-3.5 mr-1" />Save</>
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex-1 btn btn-secondary text-xs py-1.5"
            >
              <X className="h-3.5 w-3.5 mr-1" />Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden group">
      <div className="relative h-36 bg-gray-100">
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-8 w-8 text-gray-300" />
          </div>
        )}
        <button
          onClick={() => setEditing(true)}
          className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm text-gray-600 hover:text-primary-600 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
          title="Edit category"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="p-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">{category.name}</p>
          <p className="text-[11px] text-gray-400 font-mono">{category.slug}</p>
        </div>

        {confirming ? (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 mr-1">Delete?</span>
            <button
              onClick={() => { onDelete(category.id); setConfirming(false); }}
              disabled={isDeleting}
              className="text-xs font-medium text-rose-600 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50"
            >
              Yes
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="text-xs font-medium text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
            title="Delete category"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function CategoriesTab() {
  const { categories, isLoading, addCategory, updateCategory, deleteCategory } = useCategories();

  const handleEdit = (id, updates, onDone) => {
    updateCategory.mutate({ id, updates }, { onSuccess: onDone, onError: onDone });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-baseline gap-3">
        <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
        {!isLoading && (
          <span className="text-sm text-gray-400 tabular-nums">{categories.length}</span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <CategoryForm
            onSave={(data) => addCategory.mutate(data)}
            isSaving={addCategory.isPending}
          />
        </div>

        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="card p-6">
              <p className="text-gray-500 text-sm">Loading categories…</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="card p-10 flex flex-col items-center justify-center text-center">
              <ImageIcon className="h-10 w-10 text-gray-200 mb-3" />
              <p className="text-sm text-gray-500">No categories yet. Add one to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  onEdit={handleEdit}
                  onDelete={(id) => deleteCategory.mutate(id)}
                  isDeleting={deleteCategory.isPending}
                  isSaving={updateCategory.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
