export const categories = [
  {
    id: "1",
    name: "Men's Fashion",
    slug: "mens",
    image:
      "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop",
    itemCount: "25+",
  },
  {
    id: "2",
    name: "Women's Fashion",
    slug: "womens",
    image:
      "https://images.pexels.com/photos/794064/pexels-photo-794064.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop",
    itemCount: "30+",
  },
  {
    id: "3",
    name: "Electronics",
    slug: "electronics",
    image:
      "https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop",
    itemCount: "20+",
  },
  {
    id: "4",
    name: "Accessories",
    slug: "accessories",
    image:
      "https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop",
    itemCount: "18+",
  },
  {
    id: "5",
    name: "Groceries",
    slug: "groceries",
    image:
      "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop",
    itemCount: "30+",
  },
  {
    id: "6",
    name: "Beauty & Personal Care",
    slug: "beauty",
    image:
      "https://images.pexels.com/photos/2673353/pexels-photo-2673353.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop",
    itemCount: "15+",
  },
  {
    id: "7",
    name: "Sports & Outdoors",
    slug: "sports",
    image:
      "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop",
    itemCount: "16+",
  },
];

export const products = [
  // Men's Fashion (25 products)
  {
    id: "1",
    name: "Premium Cotton T-Shirt",
    slug: "premium-cotton-t-shirt",
    description:
      "High-quality cotton t-shirt perfect for everyday wear. Made from 100% organic cotton with a comfortable fit and durable construction.",
    price: 35.0,
    salePrice: 25.0,
    stock: 50,
    featured: true,
    images: [
      "https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/8532617/pexels-photo-8532617.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "mens",
    brand: "LitwayStyle",
    rating: 4.5,
    reviewCount: 23,
    tags: [
      "cotton",
      "casual",
      "comfortable",
      "organic",
      "everyday",
      "basic",
      "shirt",
    ],
    keywords:
      "mens t-shirt cotton casual comfortable organic everyday basic shirt tee",
  },
  {
    id: "2",
    name: "Classic Denim Jeans",
    slug: "classic-denim-jeans",
    description:
      "Timeless denim jeans with perfect fit and durability. Classic blue wash with comfortable stretch fabric.",
    price: 65.0,
    stock: 30,
    featured: true,
    images: [
      "https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "mens",
    brand: "DenimCraft",
    rating: 4.3,
    reviewCount: 18,
    tags: [
      "denim",
      "jeans",
      "classic",
      "blue",
      "stretch",
      "comfortable",
      "pants",
    ],
    keywords:
      "mens jeans denim classic blue stretch comfortable pants trousers",
  },
  {
    id: "101",
    name: "Formal Business Shirt",
    slug: "formal-business-shirt",
    description:
      "Professional dress shirt perfect for office wear. Wrinkle-resistant fabric with modern slim fit.",
    price: 45.0,
    salePrice: 35.0,
    stock: 40,
    images: [
      "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "mens",
    brand: "Executive",
    rating: 4.6,
    reviewCount: 34,
    tags: [
      "formal",
      "business",
      "office",
      "professional",
      "dress",
      "shirt",
      "slim fit",
    ],
    keywords:
      "mens formal business office professional dress shirt slim fit work",
  },
  {
    id: "102",
    name: "Casual Polo Shirt",
    slug: "casual-polo-shirt",
    description:
      "Comfortable polo shirt for casual occasions. Breathable cotton blend with classic collar design.",
    price: 32.0,
    stock: 45,
    images: [
      "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "mens",
    brand: "CasualWear",
    rating: 4.2,
    reviewCount: 19,
    tags: ["polo", "casual", "comfortable", "cotton", "collar", "breathable"],
    keywords: "mens polo shirt casual comfortable cotton collar breathable",
  },
  {
    id: "103",
    name: "Leather Dress Shoes",
    slug: "leather-dress-shoes",
    description:
      "Elegant leather dress shoes for formal occasions. Handcrafted with premium leather and comfortable sole.",
    price: 120.0,
    salePrice: 95.0,
    stock: 25,
    images: [
      "https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "mens",
    brand: "LeatherCraft",
    rating: 4.7,
    reviewCount: 42,
    tags: [
      "leather",
      "dress",
      "shoes",
      "formal",
      "elegant",
      "handcrafted",
      "premium",
    ],
    keywords:
      "mens leather dress shoes formal elegant handcrafted premium footwear",
  },
  {
    id: "104",
    name: "Casual Sneakers",
    slug: "casual-sneakers",
    description:
      "Comfortable sneakers for everyday wear. Lightweight design with excellent cushioning and style.",
    price: 75.0,
    stock: 35,
    images: [
      "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "mens",
    brand: "SportStyle",
    rating: 4.4,
    reviewCount: 28,
    tags: [
      "sneakers",
      "casual",
      "comfortable",
      "lightweight",
      "cushioning",
      "style",
    ],
    keywords:
      "mens sneakers casual comfortable lightweight cushioning style footwear",
  },
  {
    id: "105",
    name: "Winter Jacket",
    slug: "winter-jacket",
    description:
      "Warm winter jacket with water-resistant exterior. Perfect for cold weather with stylish design.",
    price: 150.0,
    salePrice: 120.0,
    stock: 20,
    images: [
      "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "mens",
    brand: "WinterWear",
    rating: 4.8,
    reviewCount: 56,
    tags: [
      "winter",
      "jacket",
      "warm",
      "water-resistant",
      "cold weather",
      "stylish",
    ],
    keywords:
      "mens winter jacket warm water-resistant cold weather stylish outerwear",
  },

  // Women's Fashion (30 products)
  {
    id: "3",
    name: "Elegant Summer Dress",
    slug: "elegant-summer-dress",
    description:
      "Beautiful floral summer dress perfect for any occasion. Lightweight fabric with elegant design.",
    price: 55.0,
    salePrice: 42.0,
    stock: 25,
    featured: true,
    images: [
      "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/794064/pexels-photo-794064.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "womens",
    brand: "FashionFlow",
    rating: 4.7,
    reviewCount: 31,
    tags: ["dress", "summer", "elegant", "floral", "lightweight", "beautiful"],
    keywords:
      "womens summer dress elegant floral lightweight beautiful fashion",
  },
  {
    id: "4",
    name: "Casual Blouse",
    slug: "casual-blouse",
    description:
      "Comfortable and stylish blouse for work or casual wear. Versatile design that pairs well with any outfit.",
    price: 38.0,
    stock: 40,
    images: [
      "https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "womens",
    brand: "StyleEssentials",
    rating: 4.2,
    reviewCount: 15,
    tags: ["blouse", "casual", "comfortable", "stylish", "versatile", "work"],
    keywords:
      "womens blouse casual comfortable stylish versatile work shirt top",
  },
  {
    id: "201",
    name: "High-Waisted Jeans",
    slug: "high-waisted-jeans",
    description:
      "Trendy high-waisted jeans with perfect fit. Comfortable stretch denim in classic blue wash.",
    price: 68.0,
    salePrice: 52.0,
    stock: 35,
    images: [
      "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "womens",
    brand: "DenimQueen",
    rating: 4.5,
    reviewCount: 67,
    tags: ["jeans", "high-waisted", "trendy", "stretch", "denim", "blue wash"],
    keywords: "womens high-waisted jeans trendy stretch denim blue wash pants",
  },
  {
    id: "202",
    name: "Silk Evening Gown",
    slug: "silk-evening-gown",
    description:
      "Luxurious silk evening gown for special occasions. Elegant design with flowing silhouette.",
    price: 180.0,
    salePrice: 145.0,
    stock: 15,
    images: [
      "https://images.pexels.com/photos/1721558/pexels-photo-1721558.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "womens",
    brand: "Elegance",
    rating: 4.9,
    reviewCount: 23,
    tags: [
      "silk",
      "evening",
      "gown",
      "luxurious",
      "elegant",
      "special occasion",
    ],
    keywords:
      "womens silk evening gown luxurious elegant special occasion dress",
  },
  {
    id: "203",
    name: "Cozy Cardigan",
    slug: "cozy-cardigan",
    description:
      "Soft and warm cardigan perfect for layering. Comfortable knit fabric in versatile neutral color.",
    price: 55.0,
    stock: 30,
    images: [
      "https://images.pexels.com/photos/7679721/pexels-photo-7679721.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "womens",
    brand: "ComfortWear",
    rating: 4.3,
    reviewCount: 41,
    tags: ["cardigan", "cozy", "soft", "warm", "layering", "knit"],
    keywords: "womens cardigan cozy soft warm layering knit sweater",
  },
  {
    id: "204",
    name: "Athletic Leggings",
    slug: "athletic-leggings",
    description:
      "High-performance leggings for workouts and casual wear. Moisture-wicking fabric with compression fit.",
    price: 42.0,
    salePrice: 32.0,
    stock: 50,
    images: [
      "https://images.pexels.com/photos/4498606/pexels-photo-4498606.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "womens",
    brand: "ActiveFit",
    rating: 4.6,
    reviewCount: 89,
    tags: [
      "leggings",
      "athletic",
      "workout",
      "moisture-wicking",
      "compression",
      "activewear",
    ],
    keywords:
      "womens athletic leggings workout moisture-wicking compression activewear fitness",
  },
  {
    id: "205",
    name: "Designer Handbag",
    slug: "designer-handbag",
    description:
      "Stylish designer handbag with premium materials. Perfect size for daily essentials with elegant design.",
    price: 95.0,
    salePrice: 75.0,
    stock: 20,
    images: [
      "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "womens",
    brand: "LuxuryBags",
    rating: 4.8,
    reviewCount: 34,
    tags: [
      "handbag",
      "designer",
      "stylish",
      "premium",
      "elegant",
      "accessories",
    ],
    keywords:
      "womens designer handbag stylish premium elegant accessories bag purse",
  },

  // Electronics (20 products)
  {
    id: "5",
    name: "Wireless Bluetooth Headphones",
    slug: "wireless-bluetooth-headphones",
    description:
      "High-quality wireless headphones with noise cancellation and long battery life. Perfect for music lovers.",
    price: 120.0,
    salePrice: 89.0,
    stock: 15,
    featured: true,
    images: [
      "https://images.pexels.com/photos/3945667/pexels-photo-3945667.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/4968630/pexels-photo-4968630.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "electronics",
    brand: "SoundTech",
    rating: 4.6,
    reviewCount: 42,
    tags: [
      "headphones",
      "wireless",
      "bluetooth",
      "noise cancellation",
      "music",
      "audio",
    ],
    keywords:
      "wireless bluetooth headphones noise cancellation music audio sound quality",
  },
  {
    id: "6",
    name: "Smart Fitness Watch",
    slug: "smart-fitness-watch",
    description:
      "Advanced fitness tracker with heart rate monitoring and GPS. Track your workouts and health metrics.",
    price: 199.0,
    stock: 20,
    featured: true,
    images: [
      "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "electronics",
    brand: "FitTrack",
    rating: 4.4,
    reviewCount: 28,
    tags: ["smartwatch", "fitness", "tracker", "heart rate", "GPS", "health"],
    keywords:
      "smart fitness watch tracker heart rate GPS health monitoring wearable",
  },
  {
    id: "301",
    name: "Smartphone 128GB",
    slug: "smartphone-128gb",
    description:
      "Latest smartphone with 128GB storage, dual camera, and fast processor. Perfect for daily use.",
    price: 450.0,
    salePrice: 399.0,
    stock: 25,
    images: [
      "https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "electronics",
    brand: "TechPro",
    rating: 4.7,
    reviewCount: 156,
    tags: [
      "smartphone",
      "phone",
      "mobile",
      "128GB",
      "dual camera",
      "processor",
    ],
    keywords: "smartphone phone mobile 128GB dual camera processor android ios",
  },
  {
    id: "302",
    name: "Laptop 15.6 inch",
    slug: "laptop-15-6-inch",
    description:
      "Powerful laptop for work and entertainment. Fast processor, ample storage, and crisp display.",
    price: 750.0,
    salePrice: 650.0,
    stock: 12,
    images: [
      "https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "electronics",
    brand: "CompuTech",
    rating: 4.5,
    reviewCount: 78,
    tags: [
      "laptop",
      "computer",
      "work",
      "entertainment",
      "processor",
      "display",
    ],
    keywords:
      "laptop computer work entertainment processor display notebook PC",
  },
  {
    id: "303",
    name: "Wireless Earbuds",
    slug: "wireless-earbuds",
    description:
      "Compact wireless earbuds with excellent sound quality. Perfect for sports and daily commute.",
    price: 85.0,
    salePrice: 65.0,
    stock: 40,
    images: [
      "https://images.pexels.com/photos/8534088/pexels-photo-8534088.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "electronics",
    brand: "AudioMax",
    rating: 4.3,
    reviewCount: 92,
    tags: ["earbuds", "wireless", "compact", "sports", "commute", "audio"],
    keywords:
      "wireless earbuds compact sports commute audio sound quality bluetooth",
  },
  {
    id: "304",
    name: "Tablet 10 inch",
    slug: "tablet-10-inch",
    description:
      "Versatile tablet for work and entertainment. High-resolution display with long battery life.",
    price: 320.0,
    stock: 18,
    images: [
      "https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "electronics",
    brand: "TabletPro",
    rating: 4.4,
    reviewCount: 45,
    tags: [
      "tablet",
      "versatile",
      "work",
      "entertainment",
      "display",
      "battery",
    ],
    keywords:
      "tablet versatile work entertainment display battery touchscreen portable",
  },
  {
    id: "305",
    name: "Bluetooth Speaker",
    slug: "bluetooth-speaker",
    description:
      "Portable Bluetooth speaker with powerful sound. Waterproof design perfect for outdoor activities.",
    price: 65.0,
    salePrice: 48.0,
    stock: 35,
    images: [
      "https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "electronics",
    brand: "SoundWave",
    rating: 4.2,
    reviewCount: 67,
    tags: [
      "speaker",
      "bluetooth",
      "portable",
      "waterproof",
      "outdoor",
      "sound",
    ],
    keywords:
      "bluetooth speaker portable waterproof outdoor sound wireless audio",
  },

  // Accessories (18 products)
  {
    id: "7",
    name: "Leather Wallet",
    slug: "leather-wallet",
    description:
      "Premium leather wallet with multiple card slots and money compartment. Handcrafted with attention to detail.",
    price: 45.0,
    salePrice: 35.0,
    stock: 35,
    images: [
      "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "accessories",
    brand: "LeatherCraft",
    rating: 4.8,
    reviewCount: 56,
    tags: ["wallet", "leather", "premium", "cards", "money", "handcrafted"],
    keywords: "leather wallet premium cards money handcrafted accessories mens",
  },
  {
    id: "8",
    name: "Stylish Sunglasses",
    slug: "stylish-sunglasses",
    description:
      "UV protection sunglasses with modern design. Perfect for sunny days and outdoor activities.",
    price: 28.0,
    stock: 45,
    images: [
      "https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "accessories",
    brand: "VisionStyle",
    rating: 4.1,
    reviewCount: 19,
    tags: [
      "sunglasses",
      "UV protection",
      "stylish",
      "modern",
      "outdoor",
      "eyewear",
    ],
    keywords: "sunglasses UV protection stylish modern outdoor eyewear fashion",
  },
  {
    id: "401",
    name: "Classic Wristwatch",
    slug: "classic-wristwatch",
    description:
      "Elegant wristwatch with leather strap. Timeless design perfect for any occasion.",
    price: 125.0,
    salePrice: 95.0,
    stock: 22,
    images: [
      "https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "accessories",
    brand: "TimeKeeper",
    rating: 4.6,
    reviewCount: 73,
    tags: ["watch", "wristwatch", "elegant", "leather", "timeless", "classic"],
    keywords:
      "wristwatch elegant leather timeless classic watch timepiece accessories",
  },
  {
    id: "402",
    name: "Silk Scarf",
    slug: "silk-scarf",
    description:
      "Luxurious silk scarf with beautiful patterns. Perfect accessory for any outfit.",
    price: 38.0,
    stock: 30,
    images: [
      "https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "accessories",
    brand: "SilkStyle",
    rating: 4.4,
    reviewCount: 26,
    tags: ["scarf", "silk", "luxurious", "patterns", "accessory", "fashion"],
    keywords: "silk scarf luxurious patterns accessory fashion womens style",
  },
  {
    id: "403",
    name: "Baseball Cap",
    slug: "baseball-cap",
    description:
      "Comfortable baseball cap with adjustable strap. Perfect for casual wear and sun protection.",
    price: 22.0,
    salePrice: 18.0,
    stock: 50,
    images: [
      "https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "accessories",
    brand: "CapStyle",
    rating: 4.2,
    reviewCount: 34,
    tags: [
      "cap",
      "baseball",
      "comfortable",
      "adjustable",
      "casual",
      "sun protection",
    ],
    keywords:
      "baseball cap comfortable adjustable casual sun protection hat headwear",
  },
  {
    id: "404",
    name: "Leather Belt",
    slug: "leather-belt",
    description:
      "High-quality leather belt with classic buckle. Essential accessory for formal and casual wear.",
    price: 35.0,
    stock: 40,
    images: [
      "https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "accessories",
    brand: "BeltCraft",
    rating: 4.5,
    reviewCount: 48,
    tags: ["belt", "leather", "quality", "buckle", "formal", "casual"],
    keywords: "leather belt quality buckle formal casual accessories mens",
  },

  // Home & Garden (22 products)
  {
    id: "9",
    name: "Decorative Plant Pot",
    slug: "decorative-plant-pot",
    description:
      "Beautiful ceramic plant pot perfect for indoor plants. Elegant design that complements any home decor.",
    price: 22.0,
    stock: 60,
    images: [
      "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "home-garden",
    brand: "GardenStyle",
    rating: 4.3,
    reviewCount: 12,
    tags: [
      "plant pot",
      "decorative",
      "ceramic",
      "indoor",
      "elegant",
      "home decor",
    ],
    keywords: "plant pot decorative ceramic indoor elegant home decor garden",
  },
  {
    id: "501",
    name: "Throw Pillow Set",
    slug: "throw-pillow-set",
    description:
      "Set of decorative throw pillows for sofa and bed. Soft fabric with beautiful patterns.",
    price: 45.0,
    salePrice: 35.0,
    stock: 25,
    images: [
      "https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "home-garden",
    brand: "HomeComfort",
    rating: 4.5,
    reviewCount: 38,
    tags: ["pillows", "throw", "decorative", "sofa", "bed", "soft"],
    keywords:
      "throw pillows decorative sofa bed soft fabric patterns home comfort",
  },
  {
    id: "502",
    name: "Table Lamp",
    slug: "table-lamp",
    description:
      "Modern table lamp with adjustable brightness. Perfect for reading and ambient lighting.",
    price: 65.0,
    stock: 20,
    images: [
      "https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "home-garden",
    brand: "LightCraft",
    rating: 4.4,
    reviewCount: 29,
    tags: ["lamp", "table", "modern", "adjustable", "reading", "lighting"],
    keywords: "table lamp modern adjustable reading lighting home decor",
  },
  {
    id: "503",
    name: "Wall Art Canvas",
    slug: "wall-art-canvas",
    description:
      "Beautiful canvas wall art to enhance your living space. High-quality print with vibrant colors.",
    price: 55.0,
    salePrice: 42.0,
    stock: 15,
    images: [
      "https://images.pexels.com/photos/1571471/pexels-photo-1571471.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "home-garden",
    brand: "ArtDecor",
    rating: 4.6,
    reviewCount: 22,
    tags: [
      "wall art",
      "canvas",
      "beautiful",
      "living space",
      "print",
      "vibrant",
    ],
    keywords:
      "wall art canvas beautiful living space print vibrant colors decor",
  },
  {
    id: "504",
    name: "Kitchen Utensil Set",
    slug: "kitchen-utensil-set",
    description:
      "Complete kitchen utensil set with wooden handles. Essential tools for cooking and food preparation.",
    price: 38.0,
    stock: 35,
    images: [
      "https://images.pexels.com/photos/1571475/pexels-photo-1571475.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "home-garden",
    brand: "KitchenPro",
    rating: 4.3,
    reviewCount: 45,
    tags: [
      "kitchen",
      "utensils",
      "wooden",
      "cooking",
      "food preparation",
      "tools",
    ],
    keywords:
      "kitchen utensils wooden cooking food preparation tools kitchenware",
  },
  {
    id: "505",
    name: "Garden Tool Set",
    slug: "garden-tool-set",
    description:
      "Essential garden tools for planting and maintenance. Durable construction with comfortable grips.",
    price: 48.0,
    salePrice: 38.0,
    stock: 28,
    images: [
      "https://images.pexels.com/photos/1571478/pexels-photo-1571478.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "home-garden",
    brand: "GardenMaster",
    rating: 4.7,
    reviewCount: 31,
    tags: [
      "garden",
      "tools",
      "planting",
      "maintenance",
      "durable",
      "comfortable",
    ],
    keywords: "garden tools planting maintenance durable comfortable gardening",
  },

  // Beauty & Personal Care (15 products)
  {
    id: "10",
    name: "Moisturizing Face Cream",
    slug: "moisturizing-face-cream",
    description:
      "Hydrating face cream suitable for all skin types. Nourishes and protects your skin daily.",
    price: 32.0,
    salePrice: 24.0,
    stock: 40,
    images: [
      "https://images.pexels.com/photos/2673353/pexels-photo-2673353.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "beauty",
    brand: "SkinCare Plus",
    rating: 4.5,
    reviewCount: 33,
    tags: [
      "face cream",
      "moisturizing",
      "hydrating",
      "skin care",
      "nourishing",
      "daily",
    ],
    keywords:
      "face cream moisturizing hydrating skin care nourishing daily beauty",
  },
  {
    id: "601",
    name: "Vitamin C Serum",
    slug: "vitamin-c-serum",
    description:
      "Brightening vitamin C serum for radiant skin. Reduces dark spots and improves skin texture.",
    price: 45.0,
    salePrice: 35.0,
    stock: 30,
    images: [
      "https://images.pexels.com/photos/2673354/pexels-photo-2673354.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "beauty",
    brand: "GlowSkin",
    rating: 4.7,
    reviewCount: 67,
    tags: [
      "serum",
      "vitamin C",
      "brightening",
      "radiant",
      "dark spots",
      "skin texture",
    ],
    keywords:
      "vitamin C serum brightening radiant dark spots skin texture beauty",
  },
  {
    id: "602",
    name: "Makeup Brush Set",
    slug: "makeup-brush-set",
    description:
      "Professional makeup brush set with soft bristles. Complete collection for all makeup applications.",
    price: 55.0,
    stock: 25,
    images: [
      "https://images.pexels.com/photos/2673355/pexels-photo-2673355.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "beauty",
    brand: "BeautyTools",
    rating: 4.6,
    reviewCount: 89,
    tags: [
      "makeup",
      "brushes",
      "professional",
      "soft bristles",
      "complete",
      "applications",
    ],
    keywords:
      "makeup brushes professional soft bristles complete applications beauty tools",
  },
  {
    id: "603",
    name: "Organic Shampoo",
    slug: "organic-shampoo",
    description:
      "Natural organic shampoo for healthy hair. Sulfate-free formula with nourishing ingredients.",
    price: 28.0,
    stock: 45,
    images: [
      "https://images.pexels.com/photos/2673356/pexels-photo-2673356.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "beauty",
    brand: "NaturalCare",
    rating: 4.4,
    reviewCount: 52,
    tags: [
      "shampoo",
      "organic",
      "natural",
      "healthy hair",
      "sulfate-free",
      "nourishing",
    ],
    keywords:
      "organic shampoo natural healthy hair sulfate-free nourishing beauty",
  },
  {
    id: "604",
    name: "Perfume 50ml",
    slug: "perfume-50ml",
    description:
      "Elegant perfume with long-lasting fragrance. Perfect blend of floral and woody notes.",
    price: 75.0,
    salePrice: 58.0,
    stock: 20,
    images: [
      "https://images.pexels.com/photos/2673357/pexels-photo-2673357.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "beauty",
    brand: "FragranceHouse",
    rating: 4.8,
    reviewCount: 34,
    tags: [
      "perfume",
      "elegant",
      "fragrance",
      "floral",
      "woody",
      "long-lasting",
    ],
    keywords:
      "perfume elegant fragrance floral woody long-lasting beauty scent",
  },

  // Sports & Outdoors (16 products)
  {
    id: "11",
    name: "Yoga Mat",
    slug: "yoga-mat",
    description:
      "Non-slip yoga mat perfect for exercise and meditation. High-quality material for comfort and durability.",
    price: 35.0,
    stock: 25,
    images: [
      "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "sports",
    brand: "FitLife",
    rating: 4.4,
    reviewCount: 21,
    tags: ["yoga", "mat", "exercise", "meditation", "non-slip", "comfort"],
    keywords:
      "yoga mat exercise meditation non-slip comfort durability fitness",
  },
  {
    id: "12",
    name: "Running Shoes",
    slug: "running-shoes",
    description:
      "Comfortable running shoes with excellent cushioning and support. Perfect for daily runs and workouts.",
    price: 85.0,
    salePrice: 68.0,
    stock: 30,
    featured: true,
    images: [
      "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "sports",
    brand: "RunFast",
    rating: 4.6,
    reviewCount: 47,
    tags: [
      "running",
      "shoes",
      "comfortable",
      "cushioning",
      "support",
      "workouts",
    ],
    keywords:
      "running shoes comfortable cushioning support workouts fitness athletic",
  },
  {
    id: "701",
    name: "Dumbbell Set",
    slug: "dumbbell-set",
    description:
      "Adjustable dumbbell set for home workouts. Compact design with multiple weight options.",
    price: 120.0,
    salePrice: 95.0,
    stock: 15,
    images: [
      "https://images.pexels.com/photos/1552243/pexels-photo-1552243.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "sports",
    brand: "FitGear",
    rating: 4.5,
    reviewCount: 38,
    tags: [
      "dumbbells",
      "adjustable",
      "home workouts",
      "compact",
      "weights",
      "fitness",
    ],
    keywords:
      "dumbbells adjustable home workouts compact weights fitness equipment",
  },
  {
    id: "702",
    name: "Basketball",
    slug: "basketball",
    description:
      "Official size basketball with excellent grip. Perfect for outdoor and indoor games.",
    price: 32.0,
    stock: 40,
    images: [
      "https://images.pexels.com/photos/1552244/pexels-photo-1552244.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "sports",
    brand: "SportsPro",
    rating: 4.3,
    reviewCount: 29,
    tags: ["basketball", "official size", "grip", "outdoor", "indoor", "games"],
    keywords: "basketball official size grip outdoor indoor games sports ball",
  },
  {
    id: "703",
    name: "Camping Tent",
    slug: "camping-tent",
    description:
      "Waterproof camping tent for 2-3 people. Easy setup with durable materials for outdoor adventures.",
    price: 150.0,
    salePrice: 125.0,
    stock: 12,
    images: [
      "https://images.pexels.com/photos/1552245/pexels-photo-1552245.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "sports",
    brand: "OutdoorGear",
    rating: 4.7,
    reviewCount: 45,
    tags: ["camping", "tent", "waterproof", "outdoor", "adventures", "durable"],
    keywords: "camping tent waterproof outdoor adventures durable setup hiking",
  },
  {
    id: "704",
    name: "Hiking Backpack",
    slug: "hiking-backpack",
    description:
      "Durable hiking backpack with multiple compartments. Perfect for day hikes and outdoor activities.",
    price: 75.0,
    stock: 22,
    images: [
      "https://images.pexels.com/photos/1552246/pexels-photo-1552246.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "sports",
    brand: "TrailMaster",
    rating: 4.4,
    reviewCount: 33,
    tags: [
      "hiking",
      "backpack",
      "durable",
      "compartments",
      "outdoor",
      "activities",
    ],
    keywords:
      "hiking backpack durable compartments outdoor activities trail adventure",
  },
];

export function getProductsByCategory(category) {
  if (!category) return products;
  return products.filter((product) => product.category === category);
}

export function getFeaturedProducts() {
  return products.filter((product) => product.featured);
}

export function getProductBySlug(slug) {
  return products.find((product) => product.slug === slug);
}

// Enhanced search function with comprehensive matching
export function searchProducts(query) {
  if (!query || query.trim() === "") return products;

  const lowercaseQuery = query.toLowerCase().trim();
  const queryWords = lowercaseQuery
    .split(" ")
    .filter((word) => word.length > 0);

  return products
    .filter((product) => {
      // Create searchable text from all product fields
      const searchableText = [
        product.name,
        product.description,
        product.brand,
        product.category,
        product.keywords || "",
        ...(product.tags || []),
      ]
        .join(" ")
        .toLowerCase();

      // Check if any query word matches
      const hasWordMatch = queryWords.some((word) =>
        searchableText.includes(word)
      );

      // Check for exact phrase match
      const hasExactMatch = searchableText.includes(lowercaseQuery);

      // Check for partial matches in name and brand (more weight)
      const hasNameMatch = product.name.toLowerCase().includes(lowercaseQuery);
      const hasBrandMatch = product.brand
        .toLowerCase()
        .includes(lowercaseQuery);

      // Check category match
      const hasCategoryMatch = product.category
        .toLowerCase()
        .includes(lowercaseQuery);

      return (
        hasWordMatch ||
        hasExactMatch ||
        hasNameMatch ||
        hasBrandMatch ||
        hasCategoryMatch
      );
    })
    .sort((a, b) => {
      // Sort by relevance - exact name matches first, then brand, then others
      const aNameMatch = a.name.toLowerCase().includes(lowercaseQuery);
      const bNameMatch = b.name.toLowerCase().includes(lowercaseQuery);
      const aBrandMatch = a.brand.toLowerCase().includes(lowercaseQuery);
      const bBrandMatch = b.brand.toLowerCase().includes(lowercaseQuery);

      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      if (aBrandMatch && !bBrandMatch) return -1;
      if (!aBrandMatch && bBrandMatch) return 1;

      // If same relevance, sort by featured status, then rating
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;

      return (b.rating || 0) - (a.rating || 0);
    });
}

// Advanced search with filters
export function advancedSearch(query, filters = {}) {
  let results = query ? searchProducts(query) : products;

  // Apply category filter
  if (filters.category) {
    results = results.filter(
      (product) => product.category === filters.category
    );
  }

  // Apply price range filter
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    results = results.filter((product) => {
      const price = product.salePrice || product.price;
      const minPrice = filters.minPrice || 0;
      const maxPrice = filters.maxPrice || Infinity;
      return price >= minPrice && price <= maxPrice;
    });
  }

  // Apply brand filter
  if (filters.brands && filters.brands.length > 0) {
    results = results.filter((product) =>
      filters.brands.includes(product.brand)
    );
  }

  // Apply rating filter
  if (filters.minRating) {
    results = results.filter(
      (product) => (product.rating || 0) >= filters.minRating
    );
  }

  // Apply stock filter
  if (filters.inStock) {
    results = results.filter((product) => product.stock > 0);
  }

  // Apply featured filter
  if (filters.featured) {
    results = results.filter((product) => product.featured);
  }

  return results;
}

// Get search suggestions
export function getSearchSuggestions(query, limit = 5) {
  if (!query || query.trim() === "") return [];

  const lowercaseQuery = query.toLowerCase().trim();
  const suggestions = new Set();

  products.forEach((product) => {
    // Add product names that start with or contain the query
    if (product.name.toLowerCase().includes(lowercaseQuery)) {
      suggestions.add(product.name);
    }

    // Add brand names
    if (product.brand.toLowerCase().includes(lowercaseQuery)) {
      suggestions.add(product.brand);
    }

    // Add category names
    const category = categories.find((c) => c.slug === product.category);
    if (category && category.name.toLowerCase().includes(lowercaseQuery)) {
      suggestions.add(category.name);
    }

    // Add relevant tags
    if (product.tags) {
      product.tags.forEach((tag) => {
        if (tag.toLowerCase().includes(lowercaseQuery)) {
          suggestions.add(tag);
        }
      });
    }
  });

  return Array.from(suggestions).slice(0, limit);
}

// Get popular search terms
export function getPopularSearchTerms() {
  return [
    "headphones",
    "smartphone",
    "dress",
    "jeans",
    "laptop",
    "watch",
    "shoes",
    "bag",
    "makeup",
    "fitness",
  ];
}
