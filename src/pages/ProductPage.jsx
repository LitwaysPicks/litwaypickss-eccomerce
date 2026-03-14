import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import {
  Star,
  Heart,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { formatCurrency } from "../lib/currency";
import { useCart } from "../lib/cart-context";
import { toast } from "sonner";
import ProductCard from "../components/products/ProductCard";

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      setLoading(true);

      const { data: productData, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error || !productData) {
        setProduct(null);
        setLoading(false);
        return;
      }

      const { data: imageRecords } = await supabase
        .from("product_images")
        .select("url")
        .eq("product_id", productData.id);

      const imageUrls =
        imageRecords?.map(
          (img) =>
            supabase.storage.from("product-images").getPublicUrl(img.url).data
              .publicUrl,
        ) || [];

      const updatedProduct = { ...productData, images: imageUrls };
      setProduct(updatedProduct);

      // Fix: use category_slug instead of category
      const { data: related, error: relatedError } = await supabase
        .from("products")
        .select("*")
        .eq("category_slug", productData.category_slug)
        .neq("id", productData.id)
        .limit(4);

      if (!relatedError && related?.length > 0) {
        const relatedWithUrls = await Promise.all(
          related.map(async (item) => {
            const { data: relatedImages } = await supabase
              .from("product_images")
              .select("url")
              .eq("product_id", item.id);

            const urls =
              relatedImages?.map(
                (img) =>
                  supabase.storage.from("product-images").getPublicUrl(img.url)
                    .data.publicUrl,
              ) || [];

            return { ...item, images: urls };
          }),
        );

        setRelatedProducts(relatedWithUrls);
      }

      setLoading(false);
    };

    fetchProductAndRelated();
  }, [slug]);

  // Fix: use sale_price instead of salePrice
  const discountPercentage = product?.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast.error("Product is out of stock");
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 rounded-lg" />
            <div className="flex space-x-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-20 h-20 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Product Not Found
        </h1>
        <Link to="/shop" className="btn btn-primary">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
        <Link to="/" className="hover:text-primary-600">
          Home
        </Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-primary-600">
          Shop
        </Link>
        <span>/</span>
        <Link
          to={`/shop/${product.category_slug}`}
          className="hover:text-primary-600 capitalize"
        >
          {product.category_slug}
        </Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
            <img
              src={product.images?.[selectedImage] || "/placeholder.jpg"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discountPercentage > 0 && (
              <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                -{discountPercentage}% OFF
              </span>
            )}
          </div>

          {product.images?.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === i
                      ? "border-primary-600"
                      : "border-gray-200"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">
            {product.brand}
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {product.name}
          </h1>

          {/* Fix: use review_count instead of reviewCount */}
          {product.review_count > 0 && (
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating} ({product.review_count} reviews)
              </span>
            </div>
          )}

          {/* Fix: use sale_price instead of salePrice */}
          <div className="flex items-center space-x-3">
            <span className="text-3xl font-bold text-gray-900">
              {formatCurrency(product.sale_price || product.price)}
            </span>
            {product.sale_price && (
              <span className="text-xl text-gray-500 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          <p className="text-gray-700 leading-relaxed">{product.description}</p>

          <p
            className={`font-medium ${
              product.stock > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {product.stock > 0
              ? `✓ In Stock (${product.stock} available)`
              : "✗ Out of Stock"}
          </p>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="font-medium text-gray-900">Quantity:</label>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 py-2 border-x">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="px-3 py-2 hover:bg-gray-100"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 btn btn-primary py-3 text-lg font-semibold disabled:opacity-50"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </button>
              <button className="btn btn-outline p-3">
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Truck className="h-5 w-5 text-primary-600" />
              <span>Free nationwide delivery</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Shield className="h-5 w-5 text-primary-600" />
              <span>Secure payment & warranty</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <RotateCcw className="h-5 w-5 text-primary-600" />
              <span>30-day return policy</span>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Related Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
