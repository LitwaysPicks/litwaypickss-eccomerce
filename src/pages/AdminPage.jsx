import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "../lib/currency";
import { toast } from "sonner";
import ProductForm from "../components/Admin/ProductForm";
import ProductList from "../components/Admin/ProductList";
import AdminStats from "../components/Admin/AdminStats";
import { supabase } from "../lib/supabase";
import { useAuth } from "@/lib/auth-context";

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: TrendingUp },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "customers", label: "Customers", icon: Users },
  ];

  useEffect(() => {
    if (!user || user.role !== "admin") return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: categoriesData } = await supabase
          .from("categories")
          .select("*");

        if (categoriesData) setCategories(categoriesData);

        const { data: productsData } = await supabase
          .from("products_with_categories")
          .select("*");

        if (productsData) {
          const { data: imagesData } = await supabase
            .from("product_images")
            .select("product_id, url");

          const productsWithImages = productsData.map((product) => ({
            ...product,
            images:
              imagesData
                ?.filter((img) => img.product_id === product.id)
                ?.map((img) => img.url) || [],
          }));

          setProducts(productsWithImages);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleAddProduct = async (productData) => {
    try {
      const { data: newProduct, error } = await supabase
        .from("products")
        .insert({
          name: productData.name,
          slug: productData.slug,
          description: productData.description,
          price: productData.price,
          sale_price: productData.salePrice,
          stock: productData.stock,
          featured: productData.featured,
          category_slug: productData.category,
          sizes: productData.sizes,
          brand: productData.brand,
          rating: 0,
          review_count: 0,
          keywords: productData.keywords,
          colors: productData.colors,
        })
        .select()
        .single();

      if (error) throw error;

      const imageInserts = productData.images.map((path) => ({
        product_id: newProduct.id,
        url: path,
      }));

      if (imageInserts.length > 0) {
        const { error: imageError } = await supabase
          .from("product_images")
          .insert(imageInserts);

        if (imageError) throw imageError;
      }

      if (productData.tags?.length > 0) {
        const tagInserts = productData.tags.map((tag) => ({
          product_id: newProduct.id,
          tag,
        }));

        const { error: tagError } = await supabase
          .from("product_tags")
          .insert(tagInserts);

        if (tagError) throw tagError;
      }

      const { data: updatedProducts } = await supabase
        .from("products_with_categories")
        .select("*");

      setProducts(updatedProducts);
      setShowProductForm(false);
      toast.success("Product added successfully!");
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
    }
  };

  const handleUpdateProduct = async (productData) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({
          name: productData.name,
          slug: productData.slug,
          description: productData.description,
          price: productData.price,
          sale_price: productData.salePrice,
          stock: productData.stock,
          featured: productData.featured,
          category_slug: productData.category,
          sizes: productData.sizes,
          brand: productData.brand,
          keywords: productData.keywords,
          colors: productData.colors,
        })
        .eq("id", editingProduct.id);

      if (error) throw error;

      const { data: updatedProducts } = await supabase
        .from("products_with_categories")
        .select("*");

      setProducts(updatedProducts);
      setEditingProduct(null);
      setShowProductForm(false);
      toast.success("Product updated successfully!");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await supabase
          .from("product_images")
          .delete()
          .eq("product_id", productId);

        await supabase
          .from("product_tags")
          .delete()
          .eq("product_id", productId);

        const { error } = await supabase
          .from("products")
          .delete()
          .eq("id", productId);

        if (error) throw error;

        const { data: updatedProducts } = await supabase
          .from("products_with_categories")
          .select("*");

        setProducts(updatedProducts);
        toast.success("Product deleted successfully!");
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product");
      }
    }
  };

  const handleEditProduct = async (product) => {
    try {
      const { data: productImages } = await supabase
        .from("product_images")
        .select("url")
        .eq("product_id", product.id);

      const { data: productTags } = await supabase
        .from("product_tags")
        .select("tag")
        .eq("product_id", product.id);

      setEditingProduct({
        ...product,
        images:
          productImages?.map(
            (img) =>
              supabase.storage.from("product-images").getPublicUrl(img.url).data
                .publicUrl,
          ) || [],
        tags: productTags?.map((t) => t.tag) || [],
      });
      setShowProductForm(true);
    } catch (error) {
      console.error("Error fetching product details:", error);
      toast.error("Failed to load product details");
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || product.category_slug === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Auth check AFTER all hooks
  if (!user || user.role !== "admin") {
    return (
      <div className="p-10 text-center text-red-600 font-semibold">
        Unauthorized Access
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">Manage your e-commerce platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, Admin</span>
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <div className="card p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? "bg-primary-50 text-primary-600 border border-primary-200"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <AdminStats products={products} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Recent Products
                    </h3>
                    {loading ? (
                      <p>Loading...</p>
                    ) : (
                      <div className="space-y-3">
                        {products.slice(0, 5).map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center space-x-3"
                          >
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 text-sm">
                                {product.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {formatCurrency(product.price)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Low Stock Alert
                    </h3>
                    {loading ? (
                      <p>Loading...</p>
                    ) : (
                      <div className="space-y-3">
                        {products
                          .filter((p) => p.stock <= 10)
                          .slice(0, 5)
                          .map((product) => (
                            <div
                              key={product.id}
                              className="flex items-center justify-between"
                            >
                              <div>
                                <h4 className="font-medium text-gray-900 text-sm">
                                  {product.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {product.category_name}
                                </p>
                              </div>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  product.stock === 0
                                    ? "bg-red-100 text-red-800"
                                    : "bg-orange-100 text-orange-800"
                                }`}
                              >
                                {product.stock} left
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "products" && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Products
                    </h2>
                    <p className="text-gray-600">
                      {loading
                        ? "Loading..."
                        : `${filteredProducts.length} products found`}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setShowProductForm(true);
                    }}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Product</span>
                  </button>
                </div>

                <div className="card p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search products..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="input pl-10"
                        />
                      </div>
                    </div>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="input w-auto"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category.slug} value={category.slug}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {loading ? (
                  <div className="card p-6">
                    <p>Loading products...</p>
                  </div>
                ) : (
                  <ProductList
                    products={filteredProducts}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                  />
                )}
              </div>
            )}

            {activeTab === "orders" && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Orders
                </h2>
                <p className="text-gray-600">Order management coming soon...</p>
              </div>
            )}

            {activeTab === "customers" && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Customers
                </h2>
                <p className="text-gray-600">
                  Customer management coming soon...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showProductForm && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          onSave={editingProduct ? handleUpdateProduct : handleAddProduct}
          onCancel={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
}
