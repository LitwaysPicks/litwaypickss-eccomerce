-- Enable pg_crypto extension for UUID generation (we'll keep this for other tables)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create categories table with TEXT id
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  image TEXT NOT NULL,
  item_count TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table with TEXT id
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  sale_price NUMERIC(10, 2),
  stock INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  category_slug TEXT REFERENCES categories(slug) ON DELETE SET NULL,
  brand TEXT NOT NULL,
  rating NUMERIC(2, 1),
  review_count INTEGER DEFAULT 0,
  keywords TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_images table with UUID id
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_tags table with UUID id
CREATE TABLE product_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (product_id, tag)
);

-- Now insert categories data with TEXT ids
INSERT INTO categories (id, name, slug, image, item_count) VALUES
('1', 'Men''s Fashion', 'mens', 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop', '25+'),
('2', 'Women''s Fashion', 'womens', 'https://images.pexels.com/photos/794064/pexels-photo-794064.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop', '30+'),
('3', 'Electronics', 'electronics', 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop', '20+'),
('4', 'Accessories', 'accessories', 'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop', '18+'),
('5', 'Home & Garden', 'home-garden', 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop', '22+'),
('6', 'Beauty & Personal Care', 'beauty', 'https://images.pexels.com/photos/2673353/pexels-photo-2673353.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop', '15+'),
('7', 'Sports & Outdoors', 'sports', 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop', '16+');

-- Continue with the rest of your SQL (products, images, tags) using the same TEXT IDs
-- [Rest of your SQL remains the same, just make sure product IDs match what you have in your original data]
-- Insert products data (men's fashion)
INSERT INTO products (id, name, slug, description, price, sale_price, stock, featured, category_slug, brand, rating, review_count, keywords) VALUES
('1', 'Premium Cotton T-Shirt', 'premium-cotton-t-shirt', 'High-quality cotton t-shirt perfect for everyday wear. Made from 100% organic cotton with a comfortable fit and durable construction.', 35.00, 25.00, 50, TRUE, 'mens', 'LitwayStyle', 4.5, 23, 'mens t-shirt cotton casual comfortable organic everyday basic shirt tee'),
('2', 'Classic Denim Jeans', 'classic-denim-jeans', 'Timeless denim jeans with perfect fit and durability. Classic blue wash with comfortable stretch fabric.', 65.00, NULL, 30, TRUE, 'mens', 'DenimCraft', 4.3, 18, 'mens jeans denim classic blue stretch comfortable pants trousers'),
('101', 'Formal Business Shirt', 'formal-business-shirt', 'Professional dress shirt perfect for office wear. Wrinkle-resistant fabric with modern slim fit.', 45.00, 35.00, 40, FALSE, 'mens', 'Executive', 4.6, 34, 'mens formal business office professional dress shirt slim fit work'),
('102', 'Casual Polo Shirt', 'casual-polo-shirt', 'Comfortable polo shirt for casual occasions. Breathable cotton blend with classic collar design.', 32.00, NULL, 45, FALSE, 'mens', 'CasualWear', 4.2, 19, 'mens polo shirt casual comfortable cotton collar breathable'),
('103', 'Leather Dress Shoes', 'leather-dress-shoes', 'Elegant leather dress shoes for formal occasions. Handcrafted with premium leather and comfortable sole.', 120.00, 95.00, 25, FALSE, 'mens', 'LeatherCraft', 4.7, 42, 'mens leather dress shoes formal elegant handcrafted premium footwear'),
('104', 'Casual Sneakers', 'casual-sneakers', 'Comfortable sneakers for everyday wear. Lightweight design with excellent cushioning and style.', 75.00, NULL, 35, FALSE, 'mens', 'SportStyle', 4.4, 28, 'mens sneakers casual comfortable lightweight cushioning style footwear'),
('105', 'Winter Jacket', 'winter-jacket', 'Warm winter jacket with water-resistant exterior. Perfect for cold weather with stylish design.', 150.00, 120.00, 20, FALSE, 'mens', 'WinterWear', 4.8, 56, 'mens winter jacket warm water-resistant cold weather stylish outerwear');

-- Insert product images (men's fashion)
INSERT INTO product_images (product_id, url) VALUES
('1', 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=800'),
('1', 'https://images.pexels.com/photos/8532617/pexels-photo-8532617.jpeg?auto=compress&cs=tinysrgb&w=800'),
('2', 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=800'),
('101', 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800'),
('102', 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=800'),
('103', 'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=800'),
('104', 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800'),
('105', 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800');

-- Insert product tags (men's fashion)
INSERT INTO product_tags (product_id, tag) VALUES
('1', 'cotton'), ('1', 'casual'), ('1', 'comfortable'), ('1', 'organic'), ('1', 'everyday'), ('1', 'basic'), ('1', 'shirt'),
('2', 'denim'), ('2', 'jeans'), ('2', 'classic'), ('2', 'blue'), ('2', 'stretch'), ('2', 'comfortable'), ('2', 'pants'),
('101', 'formal'), ('101', 'business'), ('101', 'office'), ('101', 'professional'), ('101', 'dress'), ('101', 'shirt'), ('101', 'slim fit'),
('102', 'polo'), ('102', 'casual'), ('102', 'comfortable'), ('102', 'cotton'), ('102', 'collar'), ('102', 'breathable'),
('103', 'leather'), ('103', 'dress'), ('103', 'shoes'), ('103', 'formal'), ('103', 'elegant'), ('103', 'handcrafted'), ('103', 'premium'),
('104', 'sneakers'), ('104', 'casual'), ('104', 'comfortable'), ('104', 'lightweight'), ('104', 'cushioning'), ('104', 'style'),
('105', 'winter'), ('105', 'jacket'), ('105', 'warm'), ('105', 'water-resistant'), ('105', 'cold weather'), ('105', 'stylish');

-- Insert products data (women's fashion)
INSERT INTO products (id, name, slug, description, price, sale_price, stock, featured, category_slug, brand, rating, review_count, keywords) VALUES
('3', 'Elegant Summer Dress', 'elegant-summer-dress', 'Beautiful floral summer dress perfect for any occasion. Lightweight fabric with elegant design.', 55.00, 42.00, 25, TRUE, 'womens', 'FashionFlow', 4.7, 31, 'womens summer dress elegant floral lightweight beautiful fashion'),
('4', 'Casual Blouse', 'casual-blouse', 'Comfortable and stylish blouse for work or casual wear. Versatile design that pairs well with any outfit.', 38.00, NULL, 40, FALSE, 'womens', 'StyleEssentials', 4.2, 15, 'womens blouse casual comfortable stylish versatile work shirt top'),
('201', 'High-Waisted Jeans', 'high-waisted-jeans', 'Trendy high-waisted jeans with perfect fit. Comfortable stretch denim in classic blue wash.', 68.00, 52.00, 35, FALSE, 'womens', 'DenimQueen', 4.5, 67, 'womens high-waisted jeans trendy stretch denim blue wash pants'),
('202', 'Silk Evening Gown', 'silk-evening-gown', 'Luxurious silk evening gown for special occasions. Elegant design with flowing silhouette.', 180.00, 145.00, 15, FALSE, 'womens', 'Elegance', 4.9, 23, 'womens silk evening gown luxurious elegant special occasion dress'),
('203', 'Cozy Cardigan', 'cozy-cardigan', 'Soft and warm cardigan perfect for layering. Comfortable knit fabric in versatile neutral color.', 55.00, NULL, 30, FALSE, 'womens', 'ComfortWear', 4.3, 41, 'womens cardigan cozy soft warm layering knit sweater'),
('204', 'Athletic Leggings', 'athletic-leggings', 'High-performance leggings for workouts and casual wear. Moisture-wicking fabric with compression fit.', 42.00, 32.00, 50, FALSE, 'womens', 'ActiveFit', 4.6, 89, 'womens athletic leggings workout moisture-wicking compression activewear fitness'),
('205', 'Designer Handbag', 'designer-handbag', 'Stylish designer handbag with premium materials. Perfect size for daily essentials with elegant design.', 95.00, 75.00, 20, FALSE, 'womens', 'LuxuryBags', 4.8, 34, 'womens designer handbag stylish premium elegant accessories bag purse');

-- Insert product images (women's fashion)
INSERT INTO product_images (product_id, url) VALUES
('3', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800'),
('3', 'https://images.pexels.com/photos/794064/pexels-photo-794064.jpeg?auto=compress&cs=tinysrgb&w=800'),
('4', 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=800'),
('201', 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800'),
('202', 'https://images.pexels.com/photos/1721558/pexels-photo-1721558.jpeg?auto=compress&cs=tinysrgb&w=800'),
('203', 'https://images.pexels.com/photos/7679721/pexels-photo-7679721.jpeg?auto=compress&cs=tinysrgb&w=800'),
('204', 'https://images.pexels.com/photos/4498606/pexels-photo-4498606.jpeg?auto=compress&cs=tinysrgb&w=800'),
('205', 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=800');

-- Insert product tags (women's fashion)
INSERT INTO product_tags (product_id, tag) VALUES
('3', 'dress'), ('3', 'summer'), ('3', 'elegant'), ('3', 'floral'), ('3', 'lightweight'), ('3', 'beautiful'),
('4', 'blouse'), ('4', 'casual'), ('4', 'comfortable'), ('4', 'stylish'), ('4', 'versatile'), ('4', 'work'),
('201', 'jeans'), ('201', 'high-waisted'), ('201', 'trendy'), ('201', 'stretch'), ('201', 'denim'), ('201', 'blue wash'),
('202', 'silk'), ('202', 'evening'), ('202', 'gown'), ('202', 'luxurious'), ('202', 'elegant'), ('202', 'special occasion'),
('203', 'cardigan'), ('203', 'cozy'), ('203', 'soft'), ('203', 'warm'), ('203', 'layering'), ('203', 'knit'),
('204', 'leggings'), ('204', 'athletic'), ('204', 'workout'), ('204', 'moisture-wicking'), ('204', 'compression'), ('204', 'activewear'),
('205', 'handbag'), ('205', 'designer'), ('205', 'stylish'), ('205', 'premium'), ('205', 'elegant'), ('205', 'accessories');

-- Insert products data (electronics)
INSERT INTO products (id, name, slug, description, price, sale_price, stock, featured, category_slug, brand, rating, review_count, keywords) VALUES
('5', 'Wireless Bluetooth Headphones', 'wireless-bluetooth-headphones', 'High-quality wireless headphones with noise cancellation and long battery life. Perfect for music lovers.', 120.00, 89.00, 15, TRUE, 'electronics', 'SoundTech', 4.6, 42, 'wireless bluetooth headphones noise cancellation music audio sound quality'),
('6', 'Smart Fitness Watch', 'smart-fitness-watch', 'Advanced fitness tracker with heart rate monitoring and GPS. Track your workouts and health metrics.', 199.00, NULL, 20, TRUE, 'electronics', 'FitTrack', 4.4, 28, 'smart fitness watch tracker heart rate GPS health monitoring wearable'),
('301', 'Smartphone 128GB', 'smartphone-128gb', 'Latest smartphone with 128GB storage, dual camera, and fast processor. Perfect for daily use.', 450.00, 399.00, 25, FALSE, 'electronics', 'TechPro', 4.7, 156, 'smartphone phone mobile 128GB dual camera processor android ios'),
('302', 'Laptop 15.6 inch', 'laptop-15-6-inch', 'Powerful laptop for work and entertainment. Fast processor, ample storage, and crisp display.', 750.00, 650.00, 12, FALSE, 'electronics', 'CompuTech', 4.5, 78, 'laptop computer work entertainment processor display notebook PC'),
('303', 'Wireless Earbuds', 'wireless-earbuds', 'Compact wireless earbuds with excellent sound quality. Perfect for sports and daily commute.', 85.00, 65.00, 40, FALSE, 'electronics', 'AudioMax', 4.3, 92, 'wireless earbuds compact sports commute audio sound quality bluetooth'),
('304', 'Tablet 10 inch', 'tablet-10-inch', 'Versatile tablet for work and entertainment. High-resolution display with long battery life.', 320.00, NULL, 18, FALSE, 'electronics', 'TabletPro', 4.4, 45, 'tablet versatile work entertainment display battery touchscreen portable'),
('305', 'Bluetooth Speaker', 'bluetooth-speaker', 'Portable Bluetooth speaker with powerful sound. Waterproof design perfect for outdoor activities.', 65.00, 48.00, 35, FALSE, 'electronics', 'SoundWave', 4.2, 67, 'bluetooth speaker portable waterproof outdoor sound wireless audio');

-- Insert product images (electronics)
INSERT INTO product_images (product_id, url) VALUES
('5', 'https://images.pexels.com/photos/3945667/pexels-photo-3945667.jpeg?auto=compress&cs=tinysrgb&w=800'),
('5', 'https://images.pexels.com/photos/4968630/pexels-photo-4968630.jpeg?auto=compress&cs=tinysrgb&w=800'),
('6', 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800'),
('301', 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=800'),
('302', 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800'),
('303', 'https://images.pexels.com/photos/8534088/pexels-photo-8534088.jpeg?auto=compress&cs=tinysrgb&w=800'),
('304', 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=800'),
('305', 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=800');

-- Insert product tags (electronics)
INSERT INTO product_tags (product_id, tag) VALUES
('5', 'headphones'), ('5', 'wireless'), ('5', 'bluetooth'), ('5', 'noise cancellation'), ('5', 'music'), ('5', 'audio'),
('6', 'smartwatch'), ('6', 'fitness'), ('6', 'tracker'), ('6', 'heart rate'), ('6', 'GPS'), ('6', 'health'),
('301', 'smartphone'), ('301', 'phone'), ('301', 'mobile'), ('301', '128GB'), ('301', 'dual camera'), ('301', 'processor'),
('302', 'laptop'), ('302', 'computer'), ('302', 'work'), ('302', 'entertainment'), ('302', 'processor'), ('302', 'display'),
('303', 'earbuds'), ('303', 'wireless'), ('303', 'compact'), ('303', 'sports'), ('303', 'commute'), ('303', 'audio'),
('304', 'tablet'), ('304', 'versatile'), ('304', 'work'), ('304', 'entertainment'), ('304', 'display'), ('304', 'battery'),
('305', 'speaker'), ('305', 'bluetooth'), ('305', 'portable'), ('305', 'waterproof'), ('305', 'outdoor'), ('305', 'sound');

-- Insert products data (accessories)
INSERT INTO products (id, name, slug, description, price, sale_price, stock, featured, category_slug, brand, rating, review_count, keywords) VALUES
('7', 'Leather Wallet', 'leather-wallet', 'Premium leather wallet with multiple card slots and money compartment. Handcrafted with attention to detail.', 45.00, 35.00, 35, FALSE, 'accessories', 'LeatherCraft', 4.8, 56, 'leather wallet premium cards money handcrafted accessories mens'),
('8', 'Stylish Sunglasses', 'stylish-sunglasses', 'UV protection sunglasses with modern design. Perfect for sunny days and outdoor activities.', 28.00, NULL, 45, FALSE, 'accessories', 'VisionStyle', 4.1, 19, 'sunglasses UV protection stylish modern outdoor eyewear fashion'),
('401', 'Classic Wristwatch', 'classic-wristwatch', 'Elegant wristwatch with leather strap. Timeless design perfect for any occasion.', 125.00, 95.00, 22, FALSE, 'accessories', 'TimeKeeper', 4.6, 73, 'wristwatch elegant leather timeless classic watch timepiece accessories'),
('402', 'Silk Scarf', 'silk-scarf', 'Luxurious silk scarf with beautiful patterns. Perfect accessory for any outfit.', 38.00, NULL, 30, FALSE, 'accessories', 'SilkStyle', 4.4, 26, 'silk scarf luxurious patterns accessory fashion womens style'),
('403', 'Baseball Cap', 'baseball-cap', 'Comfortable baseball cap with adjustable strap. Perfect for casual wear and sun protection.', 22.00, 18.00, 50, FALSE, 'accessories', 'CapStyle', 4.2, 34, 'baseball cap comfortable adjustable casual sun protection hat headwear'),
('404', 'Leather Belt', 'leather-belt', 'High-quality leather belt with classic buckle. Essential accessory for formal and casual wear.', 35.00, NULL, 40, FALSE, 'accessories', 'BeltCraft', 4.5, 48, 'leather belt quality buckle formal casual accessories mens');

-- Insert product images (accessories)
INSERT INTO product_images (product_id, url) VALUES
('7', 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=800'),
('8', 'https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?auto=compress&cs=tinysrgb&w=800'),
('401', 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=800'),
('402', 'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=800'),
('403', 'https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg?auto=compress&cs=tinysrgb&w=800'),
('404', 'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=800');

-- Insert product tags (accessories)
INSERT INTO product_tags (product_id, tag) VALUES
('7', 'wallet'), ('7', 'leather'), ('7', 'premium'), ('7', 'cards'), ('7', 'money'), ('7', 'handcrafted'),
('8', 'sunglasses'), ('8', 'UV protection'), ('8', 'stylish'), ('8', 'modern'), ('8', 'outdoor'), ('8', 'eyewear'),
('401', 'watch'), ('401', 'wristwatch'), ('401', 'elegant'), ('401', 'leather'), ('401', 'timeless'), ('401', 'classic'),
('402', 'scarf'), ('402', 'silk'), ('402', 'luxurious'), ('402', 'patterns'), ('402', 'accessory'), ('402', 'fashion'),
('403', 'cap'), ('403', 'baseball'), ('403', 'comfortable'), ('403', 'adjustable'), ('403', 'casual'), ('403', 'sun protection'),
('404', 'belt'), ('404', 'leather'), ('404', 'quality'), ('404', 'buckle'), ('404', 'formal'), ('404', 'casual');

-- Insert products data (home & garden)
INSERT INTO products (id, name, slug, description, price, sale_price, stock, featured, category_slug, brand, rating, review_count, keywords) VALUES
('9', 'Decorative Plant Pot', 'decorative-plant-pot', 'Beautiful ceramic plant pot perfect for indoor plants. Elegant design that complements any home decor.', 22.00, NULL, 60, FALSE, 'home-garden', 'GardenStyle', 4.3, 12, 'plant pot decorative ceramic indoor elegant home decor garden'),
('501', 'Throw Pillow Set', 'throw-pillow-set', 'Set of decorative throw pillows for sofa and bed. Soft fabric with beautiful patterns.', 45.00, 35.00, 25, FALSE, 'home-garden', 'HomeComfort', 4.5, 38, 'throw pillows decorative sofa bed soft fabric patterns home comfort'),
('502', 'Table Lamp', 'table-lamp', 'Modern table lamp with adjustable brightness. Perfect for reading and ambient lighting.', 65.00, NULL, 20, FALSE, 'home-garden', 'LightCraft', 4.4, 29, 'table lamp modern adjustable reading lighting home decor'),
('503', 'Wall Art Canvas', 'wall-art-canvas', 'Beautiful canvas wall art to enhance your living space. High-quality print with vibrant colors.', 55.00, 42.00, 15, FALSE, 'home-garden', 'ArtDecor', 4.6, 22, 'wall art canvas beautiful living space print vibrant colors decor'),
('504', 'Kitchen Utensil Set', 'kitchen-utensil-set', 'Complete kitchen utensil set with wooden handles. Essential tools for cooking and food preparation.', 38.00, NULL, 35, FALSE, 'home-garden', 'KitchenPro', 4.3, 45, 'kitchen utensils wooden cooking food preparation tools kitchenware'),
('505', 'Garden Tool Set', 'garden-tool-set', 'Essential garden tools for planting and maintenance. Durable construction with comfortable grips.', 48.00, 38.00, 28, FALSE, 'home-garden', 'GardenMaster', 4.7, 31, 'garden tools planting maintenance durable comfortable gardening');

-- Insert product images (home & garden)
INSERT INTO product_images (product_id, url) VALUES
('9', 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800'),
('501', 'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=800'),
('502', 'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=800'),
('503', 'https://images.pexels.com/photos/1571471/pexels-photo-1571471.jpeg?auto=compress&cs=tinysrgb&w=800'),
('504', 'https://images.pexels.com/photos/1571475/pexels-photo-1571475.jpeg?auto=compress&cs=tinysrgb&w=800'),
('505', 'https://images.pexels.com/photos/1571478/pexels-photo-1571478.jpeg?auto=compress&cs=tinysrgb&w=800');

-- Insert product tags (home & garden)
INSERT INTO product_tags (product_id, tag) VALUES
('9', 'plant pot'), ('9', 'decorative'), ('9', 'ceramic'), ('9', 'indoor'), ('9', 'elegant'), ('9', 'home decor'),
('501', 'pillows'), ('501', 'throw'), ('501', 'decorative'), ('501', 'sofa'), ('501', 'bed'), ('501', 'soft'),
('502', 'lamp'), ('502', 'table'), ('502', 'modern'), ('502', 'adjustable'), ('502', 'reading'), ('502', 'lighting'),
('503', 'wall art'), ('503', 'canvas'), ('503', 'beautiful'), ('503', 'living space'), ('503', 'print'), ('503', 'vibrant'),
('504', 'kitchen'), ('504', 'utensils'), ('504', 'wooden'), ('504', 'cooking'), ('504', 'food preparation'), ('504', 'tools'),
('505', 'garden'), ('505', 'tools'), ('505', 'planting'), ('505', 'maintenance'), ('505', 'durable'), ('505', 'comfortable');

-- Insert products data (beauty & personal care)
INSERT INTO products (id, name, slug, description, price, sale_price, stock, featured, category_slug, brand, rating, review_count, keywords) VALUES
('10', 'Moisturizing Face Cream', 'moisturizing-face-cream', 'Hydrating face cream suitable for all skin types. Nourishes and protects your skin daily.', 32.00, 24.00, 40, FALSE, 'beauty', 'SkinCare Plus', 4.5, 33, 'face cream moisturizing hydrating skin care nourishing daily beauty'),
('601', 'Vitamin C Serum', 'vitamin-c-serum', 'Brightening vitamin C serum for radiant skin. Reduces dark spots and improves skin texture.', 45.00, 35.00, 30, FALSE, 'beauty', 'GlowSkin', 4.7, 67, 'vitamin C serum brightening radiant dark spots skin texture beauty'),
('602', 'Makeup Brush Set', 'makeup-brush-set', 'Professional makeup brush set with soft bristles. Complete collection for all makeup applications.', 55.00, NULL, 25, FALSE, 'beauty', 'BeautyTools', 4.6, 89, 'makeup brushes professional soft bristles complete applications beauty tools'),
('603', 'Organic Shampoo', 'organic-shampoo', 'Natural organic shampoo for healthy hair. Sulfate-free formula with nourishing ingredients.', 28.00, NULL, 45, FALSE, 'beauty', 'NaturalCare', 4.4, 52, 'organic shampoo natural healthy hair sulfate-free nourishing beauty'),
('604', 'Perfume 50ml', 'perfume-50ml', 'Elegant perfume with long-lasting fragrance. Perfect blend of floral and woody notes.', 75.00, 58.00, 20, FALSE, 'beauty', 'FragranceHouse', 4.8, 34, 'perfume elegant fragrance floral woody long-lasting beauty scent');

-- Insert product images (beauty & personal care)
INSERT INTO product_images (product_id, url) VALUES
('10', 'https://images.pexels.com/photos/2673353/pexels-photo-2673353.jpeg?auto=compress&cs=tinysrgb&w=800'),
('601', 'https://images.pexels.com/photos/2673354/pexels-photo-2673354.jpeg?auto=compress&cs=tinysrgb&w=800'),
('602', 'https://images.pexels.com/photos/2673355/pexels-photo-2673355.jpeg?auto=compress&cs=tinysrgb&w=800'),
('603', 'https://images.pexels.com/photos/2673356/pexels-photo-2673356.jpeg?auto=compress&cs=tinysrgb&w=800'),
('604', 'https://images.pexels.com/photos/2673357/pexels-photo-2673357.jpeg?auto=compress&cs=tinysrgb&w=800');

-- Insert product tags (beauty & personal care)
INSERT INTO product_tags (product_id, tag) VALUES
('10', 'face cream'), ('10', 'moisturizing'), ('10', 'hydrating'), ('10', 'skin care'), ('10', 'nourishing'), ('10', 'daily'),
('601', 'serum'), ('601', 'vitamin C'), ('601', 'brightening'), ('601', 'radiant'), ('601', 'dark spots'), ('601', 'skin texture'),
('602', 'makeup'), ('602', 'brushes'), ('602', 'professional'), ('602', 'soft bristles'), ('602', 'complete'), ('602', 'applications'),
('603', 'shampoo'), ('603', 'organic'), ('603', 'natural'), ('603', 'healthy hair'), ('603', 'sulfate-free'), ('603', 'nourishing'),
('604', 'perfume'), ('604', 'elegant'), ('604', 'fragrance'), ('604', 'floral'), ('604', 'woody'), ('604', 'long-lasting');

-- Insert products data (sports & outdoors)
INSERT INTO products (id, name, slug, description, price, sale_price, stock, featured, category_slug, brand, rating, review_count, keywords) VALUES
('11', 'Yoga Mat', 'yoga-mat', 'Non-slip yoga mat perfect for exercise and meditation. High-quality material for comfort and durability.', 35.00, NULL, 25, FALSE, 'sports', 'FitLife', 4.4, 21, 'yoga mat exercise meditation non-slip comfort durability fitness'),
('12', 'Running Shoes', 'running-shoes', 'Comfortable running shoes with excellent cushioning and support. Perfect for daily runs and workouts.', 85.00, 68.00, 30, TRUE, 'sports', 'RunFast', 4.6, 47, 'running shoes comfortable cushioning support workouts fitness athletic'),
('701', 'Dumbbell Set', 'dumbbell-set', 'Adjustable dumbbell set for home workouts. Compact design with multiple weight options.', 120.00, 95.00, 15, FALSE, 'sports', 'FitGear', 4.5, 38, 'dumbbells adjustable home workouts compact weights fitness equipment'),
('702', 'Basketball', 'basketball', 'Official size basketball with excellent grip. Perfect for outdoor and indoor games.', 32.00, NULL, 40, FALSE, 'sports', 'SportsPro', 4.3, 29, 'basketball official size grip outdoor indoor games sports ball'),
('703', 'Camping Tent', 'camping-tent', 'Waterproof camping tent for 2-3 people. Easy setup with durable materials for outdoor adventures.', 150.00, 125.00, 12, FALSE, 'sports', 'OutdoorGear', 4.7, 45, 'camping tent waterproof outdoor adventures durable setup hiking'),
('704', 'Hiking Backpack', 'hiking-backpack', 'Durable hiking backpack with multiple compartments. Perfect for day hikes and outdoor activities.', 75.00, NULL, 22, FALSE, 'sports', 'TrailMaster', 4.4, 33, 'hiking backpack durable compartments outdoor activities trail adventure');

-- Insert product images (sports & outdoors)
INSERT INTO product_images (product_id, url) VALUES
('11', 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800'),
('12', 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800'),
('701', 'https://images.pexels.com/photos/1552243/pexels-photo-1552243.jpeg?auto=compress&cs=tinysrgb&w=800'),
('702', 'https://images.pexels.com/photos/1552244/pexels-photo-1552244.jpeg?auto=compress&cs=tinysrgb&w=800'),
('703', 'https://images.pexels.com/photos/1552245/pexels-photo-1552245.jpeg?auto=compress&cs=tinysrgb&w=800'),
('704', 'https://images.pexels.com/photos/1552246/pexels-photo-1552246.jpeg?auto=compress&cs=tinysrgb&w=800');

-- Insert product tags (sports & outdoors)
INSERT INTO product_tags (product_id, tag) VALUES
('11', 'yoga'), ('11', 'mat'), ('11', 'exercise'), ('11', 'meditation'), ('11', 'non-slip'), ('11', 'comfort'),
('12', 'running'), ('12', 'shoes'), ('12', 'comfortable'), ('12', 'cushioning'), ('12', 'support'), ('12', 'workouts'),
('701', 'dumbbells'), ('701', 'adjustable'), ('701', 'home workouts'), ('701', 'compact'), ('701', 'weights'), ('701', 'fitness'),
('702', 'basketball'), ('702', 'official size'), ('702', 'grip'), ('702', 'outdoor'), ('702', 'indoor'), ('702', 'games'),
('703', 'camping'), ('703', 'tent'), ('703', 'waterproof'), ('703', 'outdoor'), ('703', 'adventures'), ('703', 'durable'),
('704', 'hiking'), ('704', 'backpack'), ('704', 'durable'), ('704', 'compartments'), ('704', 'outdoor'), ('704', 'activities');

-- Create view for featured products
CREATE OR REPLACE VIEW featured_products AS
SELECT p.*, c.name AS category_name, c.image AS category_image
FROM products p
JOIN categories c ON p.category_slug = c.slug
WHERE p.featured = TRUE;

-- Create view for products with categories
CREATE OR REPLACE VIEW products_with_categories AS
SELECT p.*, c.name AS category_name, c.image AS category_image
FROM products p
JOIN categories c ON p.category_slug = c.slug;

-- Create function to search products
-- Create function to search products (returns multiple rows)
CREATE OR REPLACE FUNCTION search_products(search_term TEXT)
RETURNS SETOF products_with_categories AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM products_with_categories
  WHERE 
    name ILIKE '%' || search_term || '%' OR
    description ILIKE '%' || search_term || '%' OR
    brand ILIKE '%' || search_term || '%' OR
    category_name ILIKE '%' || search_term || '%' OR
    EXISTS (
      SELECT 1 FROM product_tags pt 
      WHERE pt.product_id = products_with_categories.id 
      AND pt.tag ILIKE '%' || search_term || '%'
    );
END;
$$ LANGUAGE plpgsql;

-- Create function to get products by category (returns multiple rows)
CREATE OR REPLACE FUNCTION get_products_by_category(category_slug_param TEXT)
RETURNS SETOF products_with_categories AS $$
BEGIN
  IF category_slug_param IS NULL THEN
    RETURN QUERY SELECT * FROM products_with_categories;
  ELSE
    RETURN QUERY SELECT * FROM products_with_categories WHERE category_slug = category_slug_param;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to get product by slug (returns single row)
CREATE OR REPLACE FUNCTION get_product_by_slug(product_slug TEXT)
RETURNS products_with_categories AS $$
DECLARE
  result products_with_categories;
BEGIN
  SELECT * INTO result FROM products_with_categories
  WHERE slug = product_slug
  LIMIT 1;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
CREATE POLICY "Enable public read access for categories" 
ON categories FOR SELECT USING (true);

-- Create policies for products
CREATE POLICY "Enable public read access for products" 
ON products FOR SELECT USING (true);

-- Create policies for product_images
CREATE POLICY "Enable public read access for product_images" 
ON product_images FOR SELECT USING (true);

-- Create policies for product_tags
CREATE POLICY "Enable public read access for product_tags" 
ON product_tags FOR SELECT USING (true);

-- Create admin policies for all tables (if you have admin users)
CREATE POLICY "Enable all access for admin users on categories" 
ON categories TO authenticated USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for admin users on products" 
ON products TO authenticated USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for admin users on product_images" 
ON product_images TO authenticated USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for admin users on product_tags" 
ON product_tags TO authenticated USING (auth.role() = 'authenticated');