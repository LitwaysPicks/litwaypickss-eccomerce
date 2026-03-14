import React, { useState, useEffect } from "react";
import { X, Upload, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { categories } from "../../data/products";
import { supabase } from "../../lib/supabase";

export default function ProductForm({ product, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    salePrice: "",
    sizes: [], // multiple sizes
    stock: "",
    category: "",
    brand: "",
    keywords: "",
  });

  // Separate state for uploaded images (confirmed) and temporary uploads (in progress)
  const [uploadedImages, setUploadedImages] = useState([]);
  const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
  const [colors, setColors] = useState([]);
  const [colorInput, setColorInput] = useState("");
  const [tempImages, setTempImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        salePrice: product.salePrice?.toString() || "",
        stock: product.stock?.toString() || "",
        category: product.category || "",
        sizes: product?.sizes || [],
        brand: product.brand || "",
        keywords: product.keywords || "",
      });

      // Prefill uploaded images
      setUploadedImages(product.images || []);

      // ✅ Prefill colors input for editing
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

    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
        const filePath = `products/${fileName}`;

        // Add to temp images for loading UI
        setTempImages((prev) => [
          ...prev,
          {
            url: URL.createObjectURL(file),
            name: fileName,
            status: "uploading",
          },
        ]);

        const { error } = await supabase.storage
          .from("product-images")
          .upload(filePath, file);

        if (error) throw error;

        return filePath; // ← store path like "products/abc.jpg"
      });

      const uploadedPaths = await Promise.all(uploadPromises);

      // Add to form state (paths only)
      setUploadedImages((prev) => [...prev, ...uploadedPaths]);
      setTempImages([]);
      toast.success(`${files.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(`Failed to upload images: ${error.message}`);
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

    // Validation
    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("Valid price is required");
      return;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      toast.error("Valid stock quantity is required");
      return;
    }
    if (!formData.category) {
      toast.error("Category is required");
      return;
    }
    if (uploadedImages.length === 0) {
      toast.error("At least one product image is required");
      return;
    }
    if (colors.length === 0) {
      toast.error("At least one color is required");
      return;
    }

    // Slugify the product name
    const slug = formData.name
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");

    const productData = {
      ...formData,
      slug,
      price: parseFloat(formData.price),
      salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
      stock: parseInt(formData.stock),
      images: uploadedImages,
      sizes: formData.sizes,
      keywords: formData.keywords,
      colors: colors.map((c) => c.trim()),
    };

    onSave(productData);
  };

  // Combine uploaded and temp images for display
  const allImages = [
    ...uploadedImages.map((path) => ({
      url: supabase.storage.from("product-images").getPublicUrl(path).data
        .publicUrl,
      status: "uploaded",
    })),
    ...tempImages,
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {product ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Basic Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="input"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="input resize-none"
                placeholder="Enter product description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand *
                </label>
                <input
                  type="text"
                  name="brand"
                  required
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Enter brand name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                  className="input"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {["mens", "womens"].includes(formData.category) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Sizes
              </label>
              <div className="flex flex-wrap gap-2">
                {CLOTHING_SIZES.map((size) => (
                  <label key={size} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.sizes.includes(size)}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          sizes: e.target.checked
                            ? [...prev.sizes, size]
                            : prev.sizes.filter((s) => s !== size),
                        }));
                      }}
                      className="form-checkbox"
                    />
                    <span>{size}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block mb-2 font-medium text-sm text-gray-700">
              Available Colors
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {colors.map((color, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm"
                >
                  {color}
                  <button
                    type="button"
                    onClick={() =>
                      setColors(colors.filter((c, i) => i !== idx))
                    }
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    &times;
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
                  const newColor = colorInput.trim();
                  if (!colors.includes(newColor)) {
                    setColors([...colors, newColor]);
                  }
                  setColorInput("");
                }
              }}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keywords (comma-separated)
            </label>
            <input
              type="text"
              name="keywords"
              value={formData.keywords}
              onChange={handleInputChange}
              className="input"
              placeholder="e.g., trending,men's wear,cotton"
            />
          </div>

          {/* Pricing & Inventory */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Pricing & Inventory
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Regular Price (LRD) *
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sale Price (LRD)
                </label>
                <input
                  type="number"
                  name="salePrice"
                  min="0"
                  step="0.01"
                  value={formData.salePrice}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity *
                </label>
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
          </div>

          {/* Product Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Product Images *
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allImages.map((image, index) => (
                <div key={index} className="relative group h-40">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {image.status === "uploading" ? (
                      <div className="text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-500" />
                        <p className="text-xs mt-2 text-gray-500">
                          Uploading...
                        </p>
                      </div>
                    ) : (
                      <img
                        src={image.url}
                        alt={`Product preview ${index}`}
                        className="w-full h-full object-cover rounded-lg border"
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-red-100 text-red-600"
                    disabled={image.status === "uploading"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <label className="h-40 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                <Upload className="h-6 w-6 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  {uploading ? "Uploading..." : "Add Images"}
                </span>
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
          </div>

          {/* Form Actions */}
          <div className="flex space-x-4 pt-6 border-t">
            <button
              type="submit"
              className="flex-1 btn btn-primary py-3"
              disabled={uploading}
            >
              {product ? "Update Product" : "Add Product"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 btn btn-outline py-3"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
