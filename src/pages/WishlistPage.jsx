import React, { useState } from "react";
import { Link } from "react-router";
import { Heart, ShoppingCart, X, Star } from "lucide-react";
import { formatCurrency } from "../lib/currency";
import { useCart } from "../lib/cart-context";
import { toast } from "sonner";

export default function WishlistPage() {
  const { addItem } = useCart();
  const [wishlistItems, setWishlistItems] = useState([
    {
      id: "1",
      name: "Wireless Bluetooth Headphones",
      slug: "wireless-bluetooth-headphones",
      price: 120.0,
      salePrice: 89.0,
      stock: 15,
      rating: 4.6,
      reviewCount: 42,
      images: [
        "https://images.pexels.com/photos/3945667/pexels-photo-3945667.jpeg?auto=compress&cs=tinysrgb&w=400",
      ],
      category: "electronics",
      brand: "SoundTech",
    },
    {
      id: "2",
      name: "Smart Fitness Watch",
      slug: "smart-fitness-watch",
      price: 199.0,
      stock: 20,
      rating: 4.4,
      reviewCount: 28,
      images: [
        "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=400",
      ],
      category: "electronics",
      brand: "FitTrack",
    },
    {
      id: "3",
      name: "Elegant Summer Dress",
      slug: "elegant-summer-dress",
      price: 55.0,
      salePrice: 42.0,
      stock: 25,
      rating: 4.7,
      reviewCount: 31,
      images: [
        "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400",
      ],
      category: "womens",
      brand: "FashionFlow",
    },
  ]);

  const removeFromWishlist = (id) => {
    setWishlistItems((items) => items.filter((item) => item.id !== id));
    toast.success("Item removed from wishlist");
  };

  const handleAddToCart = (product) => {
    if (product.stock === 0) {
      toast.error("Product is out of stock");
      return;
    }
    addItem(product);
  };

  const moveAllToCart = () => {
    const availableItems = wishlistItems.filter((item) => item.stock > 0);
    availableItems.forEach((item) => addItem(item));
    toast.success(`${availableItems.length} items added to cart`);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6">
          <div className="bg-gray-100 p-8 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
            <Heart className="h-12 w-12 text-gray-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Your wishlist is empty
            </h1>
            <p className="text-gray-600">Save items you love for later</p>
          </div>
          <Link to="/shop" className="btn btn-primary inline-block">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">{wishlistItems.length} items saved</p>
        </div>

        {wishlistItems.length > 0 && (
          <button
            onClick={moveAllToCart}
            className="btn btn-primary flex items-center space-x-2"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Add All to Cart</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map((item) => (
          <div
            key={item.id}
            className="group cursor-pointer overflow-hidden card border-0 shadow-md hover:shadow-xl transition-all duration-300"
          >
            <div className="relative">
              <Link to={`/product/${item.slug}`}>
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </Link>

              {/* Remove from wishlist button */}
              <button
                onClick={() => removeFromWishlist(item.id)}
                className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-colors shadow-md"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>

              {/* Discount Badge */}
              {item.salePrice && (
                <span className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                  -
                  {Math.round(
                    ((item.price - item.salePrice) / item.price) * 100,
                  )}
                  %
                </span>
              )}

              {/* Stock Badge */}
              {item.stock === 0 && (
                <span className="absolute top-3 left-3 bg-gray-500 text-white px-2 py-1 rounded text-sm font-medium">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4 space-y-3">
              {/* Category */}
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {item.category}
              </p>

              {/* Name */}
              <Link to={`/product/${item.slug}`}>
                <h3 className="font-medium text-gray-900 line-clamp-2 min-h-[2.5rem] hover:text-primary-600 transition-colors">
                  {item.name}
                </h3>
              </Link>

              {/* Rating */}
              {item.reviewCount > 0 && (
                <div className="flex items-center space-x-1">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(item.rating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    ({item.reviewCount})
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-gray-900">
                  {formatCurrency(item.salePrice || item.price)}
                </span>
                {item.salePrice && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatCurrency(item.price)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              {item.stock > 0 && item.stock <= 5 && (
                <p className="text-xs text-orange-600">
                  Only {item.stock} left in stock
                </p>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAddToCart(item)}
                  disabled={item.stock === 0}
                  className="flex-1 btn btn-primary py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Add to Cart
                </button>
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="btn btn-outline p-2"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Continue Shopping */}
      <div className="text-center mt-12">
        <Link to="/shop" className="btn btn-outline px-8 py-3">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
