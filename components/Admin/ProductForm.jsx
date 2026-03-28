"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ProductForm({ product, categories = [], onSave, onCancel, isSaving = false }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    salePrice: "",
    sizes: [],
    stock: "",
    category: "",
    brand: "",
    keywords: "",
    featured: false,
  });

  const [uploadedImages, setUploadedImages] = useState([]);
  const [colors, setColors] = useState([]);
  const [colorInput, setColorInput] = useState("");
  const [tempImages, setTempImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        salePrice: product.sale_price?.toString() || "",
        stock: product.stock?.toString() || "",
        category: product.category_slug || "",
        sizes: product?.sizes || [],
        brand: product.brand || "",
        keywords: product.keywords || "",
        featured: product.featured ?? false,
      });
      setUploadedImages(product.images || []);
      setVideoUrl(product.video_url || "");
      setColors(product.colors || []);
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error("Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.");
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

        setTempImages((prev) => [
          ...prev,
          { url: URL.createObjectURL(file), name: fileName, status: "uploading" },
        ]);

        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", uploadPreset);
        fd.append("folder", "litway/products");

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: fd }
        );

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error?.message || "Upload failed");
        }

        const data = await res.json();
        return data.secure_url.replace("/upload/", "/upload/f_auto,q_auto,w_1200/");
      });

      const paths = await Promise.all(uploadPromises);
      setUploadedImages((prev) => [...prev, ...paths]);
      setTempImages([]);
      toast.success(`${files.length} image${files.length > 1 ? "s" : ""} uploaded`);
    } catch (error) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return toast.error("Product name is required");
    if (!formData.price || parseFloat(formData.price) <= 0) return toast.error("Valid price is required");
    if (!formData.stock || parseInt(formData.stock) < 0) return toast.error("Valid stock quantity is required");
    if (!formData.category) return toast.error("Category is required");
    if (uploadedImages.length === 0) return toast.error("At least one product image is required");
    if (colors.length === 0) return toast.error("At least one color is required");

    const slug = formData.name
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");

    onSave({
      ...formData,
      slug,
      price: parseFloat(formData.price),
      salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
      stock: parseInt(formData.stock),
      images: uploadedImages,
      sizes: formData.sizes,
      keywords: formData.keywords,
      colors: colors.map((c) => c.trim()),
      videoUrl: videoUrl.trim() || null,
    });
  };

  const allImages = [
    ...uploadedImages.map((url) => ({ url, status: "uploaded" })),
    ...tempImages,
  ];

  const isClothing = ["mens", "womens"].includes(formData.category);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Glassy backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm bg-black/15"
        onClick={onCancel}
      />

      {/* Drawer panel */}
      <div className="relative z-10 flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-100 px-6">
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900">
              {product ? "Edit product" : "New product"}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <form id="product-form" onSubmit={handleSubmit} className="p-6 space-y-8">

            {/* — Basic info — */}
            <section className="space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Basic information</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block mb-1.5 text-xs font-medium text-gray-600">Product name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="e.g. Classic Oxford Shirt"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-xs font-medium text-gray-600">Brand <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    name="brand"
                    required
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Brand name"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-xs font-medium text-gray-600">Category <span className="text-rose-500">*</span></label>
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="input"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block mb-1.5 text-xs font-medium text-gray-600">Description <span className="text-rose-500">*</span></label>
                  <textarea
                    name="description"
                    required
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="input resize-none"
                    placeholder="Describe the product…"
                  />
                </div>
              </div>
            </section>

            {/* — Pricing & Inventory — */}
            <section className="space-y-4 border-t border-gray-100 pt-6">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Pricing & inventory</p>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1.5 text-xs font-medium text-gray-600">Price (LRD) <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-xs font-medium text-gray-600">Sale price (LRD)</label>
                  <input
                    type="number"
                    name="salePrice"
                    min="0"
                    step="0.01"
                    value={formData.salePrice}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-xs font-medium text-gray-600">Stock <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    name="stock"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="0"
                  />
                </div>
              </div>
            </section>

            {/* — Variants — */}
            <section className="space-y-4 border-t border-gray-100 pt-6">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Variants</p>

              {isClothing && (
                <div>
                  <label className="block mb-2 text-xs font-medium text-gray-600">Sizes</label>
                  <div className="flex flex-wrap gap-2">
                    {CLOTHING_SIZES.map((size) => {
                      const checked = formData.sizes.includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              sizes: checked
                                ? prev.sizes.filter((s) => s !== size)
                                : [...prev.sizes, size],
                            }))
                          }
                          className={`h-8 min-w-[40px] rounded-lg border px-2.5 text-xs font-medium transition-colors ${
                            checked
                              ? "border-primary-500 bg-primary-50 text-primary-700"
                              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block mb-2 text-xs font-medium text-gray-600">Colors <span className="text-rose-500">*</span></label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {colors.map((color, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 pl-1.5 pr-2 py-1 text-xs text-gray-700"
                    >
                      <span
                        className="h-3 w-3 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: color.toLowerCase() }}
                      />
                      {color}
                      <button
                        type="button"
                        onClick={() => setColors(colors.filter((_, i) => i !== idx))}
                        className="text-gray-400 hover:text-gray-600 leading-none ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Type a color and press Enter"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === ",") && colorInput.trim()) {
                      e.preventDefault();
                      const c = colorInput.trim();
                      if (!colors.includes(c)) setColors([...colors, c]);
                      setColorInput("");
                    }
                  }}
                  className="input"
                />
                <p className="mt-1.5 text-[11px] text-gray-400">Press Enter or comma to add each color</p>
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-medium text-gray-600">Keywords</label>
                <input
                  type="text"
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="trending, cotton, slim-fit — comma separated"
                />
              </div>
            </section>

            {/* — Images — */}
            <section className="space-y-4 border-t border-gray-100 pt-6">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Product images <span className="text-rose-500">*</span></p>

              <div className="grid grid-cols-3 gap-3">
                {allImages.map((image, index) => (
                  <div key={index} className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                    {image.status === "uploading" ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        <span className="text-[11px] text-gray-400">Uploading…</span>
                      </div>
                    ) : (
                      <>
                        <img
                          src={image.url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-md bg-white/90 text-gray-600 shadow-sm backdrop-blur-sm hover:bg-white hover:text-rose-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                            Cover
                          </span>
                        )}
                      </>
                    )}
                  </div>
                ))}

                {/* Upload zone */}
                <label className={`relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
                  uploading
                    ? "cursor-wait border-gray-200 bg-gray-50"
                    : "border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50/30"
                }`}>
                  <span className="text-xs font-medium text-gray-500">
                    {uploading ? "Uploading…" : "Add photos"}
                  </span>
                  <span className="mt-0.5 text-[11px] text-gray-400">PNG, JPG, WEBP</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
            </section>

            {/* — Video — */}
            <section className="space-y-3 border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Product video</p>
                <span className="text-[11px] text-gray-400">Optional</span>
              </div>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="input"
                placeholder="YouTube embed URL or direct .mp4 link"
              />
            </section>

          </form>
        </div>

        {/* Footer actions */}
        <div className="shrink-0 border-t border-gray-100 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              type="submit"
              form="product-form"
              disabled={uploading || isSaving}
              className="btn btn-primary flex-1 py-2.5 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {(uploading || isSaving) && <Loader2 className="h-4 w-4 animate-spin" />}
              {uploading ? "Uploading…" : isSaving ? (product ? "Saving…" : "Adding…") : product ? "Save changes" : "Add product"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-outline px-5 py-2.5"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
