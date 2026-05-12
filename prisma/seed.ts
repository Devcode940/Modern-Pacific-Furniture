import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

const categories = [
  {
    name: 'Living Room',
    slug: 'living-room',
    description: 'Transform your living space with our premium collection of sofas, recliners, and modern seating. Handcrafted with quality materials for lasting comfort and style.',
    image: '/images/categories/living-room.png',
    sortOrder: 1,
  },
  {
    name: 'Bedroom',
    slug: 'bedroom',
    description: 'Create your perfect bedroom retreat with our elegant beds, from classic mahogany to modern platform designs. Quality craftsmanship for restful nights.',
    image: '/images/categories/bedroom.png',
    sortOrder: 2,
  },
  {
    name: 'Dining Tables',
    slug: 'dining-tables',
    description: 'Gather around beautifully crafted dining tables and sets. From 6-seater classics to modern designs, find the perfect centerpiece for your dining room.',
    image: '/images/categories/dining-tables.png',
    sortOrder: 3,
  },
  {
    name: 'TV Stands',
    slug: 'tv-stands',
    description: 'Modern and functional TV stands that complement your living room. Available in various styles to hold screens up to 65 inches with ample storage.',
    image: '/images/categories/tv-stands.png',
    sortOrder: 4,
  },
  {
    name: 'Mattresses',
    slug: 'mattresses',
    description: 'Sleep in comfort with our premium pocket spring mattresses. Available in multiple sizes for the perfect fit and optimal body support.',
    image: '/images/categories/mattresses.png',
    sortOrder: 5,
  },
  {
    name: 'Coffee Tables',
    slug: 'coffee-tables',
    description: 'Complete your living room with our stylish coffee table sets. From elegant white designs to classic wood finishes, find the perfect accent piece.',
    image: '/images/categories/living-room.png',
    sortOrder: 6,
  },
]

const products = [
  // === LIVING ROOM SOFAS ===
  {
    name: 'Modern Blissblend 7-Seater Microfiber Sofa',
    slug: 'modern-blissblend-7seater',
    description: 'Has a sturdy, durable frame to withstand daily use, supportive seats, back and armrests for maximum relaxation. This 7-seater semi recliner sofa features a partitioning design with spring cushion in 3+2+1+1 configuration. The microfiber upholstery is soft to the touch yet incredibly durable, making it perfect for families with children and pets. Available in multiple color options to match any interior decor.',
    price: 150000,
    compareAtPrice: 180000,
    images: JSON.stringify(['/images/products/semi-recliner-sofa.png']),
    specs: JSON.stringify({ material: 'Microfiber Fabric + Hardwood Frame', dimensions: '3.2m W x 1.8m D x 0.9m H', weight: '85 kg', seating: '7-seater (3+2+1+1)', colorOptions: ['Brown', 'Grey', 'Black'], features: ['Semi recliner back', 'Spring cushion', 'Sturdy frame'] }),
    categorySlug: 'living-room',
    stock: 12,
    featured: true,
    rating: 4.7,
    reviewCount: 89,
    tags: JSON.stringify(['best-seller', 'popular']),
    material: 'Microfiber + Hardwood',
    style: 'Modern',
    colors: 'Brown, Grey, Black',
    dimensions: '3.2m W x 1.8m D x 0.9m H',
    weight: '85 kg',
  },
  {
    name: 'Brown Semi Recliner 7-Seater',
    slug: 'brown-recliner-7-seater',
    description: 'Experience ultimate comfort with our Brown Semi Recliner 7-Seater sofa set. Available in 7-seater, 3-seater, 2-seater, and 1-seater configurations. The rich brown upholstery adds warmth and elegance to any living space. Each seat features plush cushioning with semi-recliner functionality, allowing you to find your perfect relaxation angle. Built with a solid hardwood frame for long-lasting durability.',
    price: 145000,
    compareAtPrice: null,
    images: JSON.stringify(['/images/products/brown-recliner-sofa.png']),
    specs: JSON.stringify({ material: 'Premium Fabric + Hardwood Frame', dimensions: '3.0m W x 1.7m D x 0.95m H', weight: '80 kg', seating: '7-seater (also 3+2+1)', colorOptions: ['Brown'], features: ['Semi recliner', 'Plush cushioning', 'Hardwood frame'] }),
    categorySlug: 'living-room',
    stock: 8,
    featured: false,
    rating: 4.5,
    reviewCount: 56,
    tags: JSON.stringify(['popular']),
    material: 'Premium Fabric + Hardwood',
    style: 'Modern',
    colors: 'Brown',
    dimensions: '3.0m W x 1.7m D x 0.95m H',
    weight: '80 kg',
  },
  {
    name: 'Cozy L-Shaped Sectional Sofa',
    slug: 'cozy-l-shaped-sofa',
    description: 'Modern L-Shaped Sectional Sofa with Wooden Side Shelves. Upgrade your living space with this stylish and spacious L-shaped sectional sofa designed for both comfort and elegance. Upholstered in soft, high-quality fabric with built-in wooden side shelves for convenient storage of books, remotes, and decor items. The generous seating accommodates up to 9 people, making it perfect for large families and entertaining guests. The modular design allows flexible room arrangement.',
    price: 200000,
    compareAtPrice: 250000,
    images: JSON.stringify(['/images/products/cozy-sofa.png']),
    specs: JSON.stringify({ material: 'Premium Fabric + Solid Wood', dimensions: '3.5m W x 2.2m D x 0.85m H', weight: '110 kg', seating: '9-seater L-shape', colorOptions: ['Grey', 'Beige', 'Navy'], features: ['Built-in side shelves', 'L-shaped design', 'Modular'] }),
    categorySlug: 'living-room',
    stock: 5,
    featured: true,
    rating: 4.9,
    reviewCount: 134,
    tags: JSON.stringify(['sale', 'popular', 'featured']),
    material: 'Premium Fabric + Solid Wood',
    style: 'Modern',
    colors: 'Grey, Beige, Navy',
    dimensions: '3.5m W x 2.2m D x 0.85m H',
    weight: '110 kg',
  },
  {
    name: 'Benin Sofa Set',
    slug: 'benin-sofa-set',
    description: 'The Benin sofa set is a classic featuring design made of teakwood skirting which provides it with stability and elegance. It is a blend of traditional style with comfort. The handcrafted teakwood frame showcases exceptional craftsmanship, while the plush cushioning ensures a luxurious seating experience. This timeless piece adds character and sophistication to any living room, whether traditional or contemporary.',
    price: 180000,
    compareAtPrice: null,
    images: JSON.stringify(['/images/products/benin-sofa.png']),
    specs: JSON.stringify({ material: 'Teakwood Frame + Premium Fabric', dimensions: '2.8m W x 1.5m D x 0.9m H', weight: '75 kg', seating: '7-seater', colorOptions: ['Brown', 'Burgundy'], features: ['Teakwood skirting', 'Traditional design', 'Handcrafted'] }),
    categorySlug: 'living-room',
    stock: 6,
    featured: false,
    rating: 4.6,
    reviewCount: 45,
    tags: JSON.stringify(['popular']),
    material: 'Teakwood + Fabric',
    style: 'Traditional',
    colors: 'Brown, Burgundy',
    dimensions: '2.8m W x 1.5m D x 0.9m H',
    weight: '75 kg',
  },
  {
    name: 'Juventus Sofa Set',
    slug: 'juventus-sofa-set',
    description: 'Experience comfort and modern elegance with this beautifully crafted modern grey sofa set. Designed with plush cushioning, wide armrests, and a sturdy wooden base, it offers generous seating for the whole family. The premium grey fabric upholstery is both stylish and easy to maintain, while the high-density foam filling provides excellent support for hours of comfortable lounging.',
    price: 110000,
    compareAtPrice: 135000,
    images: JSON.stringify(['/images/products/juventus-sofa.png']),
    specs: JSON.stringify({ material: 'Premium Grey Fabric + Wooden Base', dimensions: '2.6m W x 1.4m D x 0.85m H', weight: '70 kg', seating: '7-seater (also 3+2+1)', colorOptions: ['Grey', 'Dark Grey'], features: ['Wide armrests', 'Wooden base', 'High-density foam'] }),
    categorySlug: 'living-room',
    stock: 10,
    featured: true,
    rating: 4.7,
    reviewCount: 78,
    tags: JSON.stringify(['sale', 'new']),
    material: 'Fabric + Wood',
    style: 'Modern',
    colors: 'Grey, Dark Grey',
    dimensions: '2.6m W x 1.4m D x 0.85m H',
    weight: '70 kg',
  },
  {
    name: 'Mahogany 6-Seater Classic Dining Set',
    slug: 'mahogany-6-seater-classic',
    description: 'This classic Mahogany 6-seater dining set exudes timeless elegance and superior craftsmanship. Crafted from solid mahogany wood with a rich, warm finish, it serves as a stunning centerpiece for your dining room. The set includes a spacious dining table and six beautifully designed chairs with comfortable padded seats. Perfect for family dinners and entertaining guests.',
    price: 170000,
    compareAtPrice: null,
    images: JSON.stringify(['/images/products/mahogany-dining-classic.png']),
    specs: JSON.stringify({ material: 'Solid Mahogany Wood', dimensions: '1.5m W x 0.9m D x 0.76m H (Table)', weight: '95 kg (set)', seating: '6-seater', colorOptions: ['Dark Mahogany', 'Light Mahogany'], features: ['Padded seats', 'Solid wood', 'Classic design'] }),
    categorySlug: 'living-room',
    stock: 7,
    featured: true,
    rating: 4.8,
    reviewCount: 92,
    tags: JSON.stringify(['popular', 'featured']),
    material: 'Solid Mahogany',
    style: 'Classic',
    colors: 'Dark Mahogany, Light Mahogany',
    dimensions: '1.5m W x 0.9m D x 0.76m H',
    weight: '95 kg',
  },
  {
    name: 'Modena Sofa Set',
    slug: 'modena-sofa-set',
    description: 'Comfort meets elegance with the Modena sofa set — the perfect centerpiece for your living room. Where style sits and comfort begins. Turn your living room into a luxury lounge. Designed for comfort, built for style. This premium sofa set features plush cushioning, a sleek silhouette, and premium upholstery that resists wear and staining. Available in multiple configurations including 7-seater, 5-seater, and 3-seater options.',
    price: 260000,
    compareAtPrice: 320000,
    images: JSON.stringify(['/images/products/modena-sofa.png']),
    specs: JSON.stringify({ material: 'Premium Upholstery + Hardwood', dimensions: '3.4m W x 1.8m D x 0.88m H', weight: '100 kg', seating: '7-seater (3+2+1+1)', colorOptions: ['Grey', 'Navy', 'Cream', 'Brown'], features: ['Stain-resistant', 'Premium foam', 'Multiple configs'] }),
    categorySlug: 'living-room',
    stock: 4,
    featured: true,
    rating: 4.9,
    reviewCount: 156,
    tags: JSON.stringify(['sale', 'new', 'popular', 'featured']),
    material: 'Premium Upholstery + Hardwood',
    style: 'Modern Luxury',
    colors: 'Grey, Navy, Cream, Brown',
    dimensions: '3.4m W x 1.8m D x 0.88m H',
    weight: '100 kg',
  },
  {
    name: 'Modern Asmara 7-Seater Corduroy Sofa',
    slug: 'asmara-corduroy-sofa',
    description: 'This sofa offers spacious seating and superior comfort for your living space. Perfect for families and gatherings. The rich corduroy fabric adds texture and warmth to your room while being incredibly soft and durable. Available in 3-seater, 2-seater, and 1-seater configurations. The solid hardwood frame ensures stability and longevity, while the high-density foam cushions provide excellent support.',
    price: 150000,
    compareAtPrice: null,
    images: JSON.stringify(['/images/products/asmara-corduroy-sofa.png']),
    specs: JSON.stringify({ material: 'Corduroy Fabric + Hardwood Frame', dimensions: '3.0m W x 1.6m D x 0.85m H', weight: '82 kg', seating: '7-seater (3+2+1+1)', colorOptions: ['Brown', 'Green', 'Rust'], features: ['Corduroy texture', 'Hardwood frame', 'High-density foam'] }),
    categorySlug: 'living-room',
    stock: 9,
    featured: false,
    rating: 4.6,
    reviewCount: 67,
    tags: JSON.stringify(['new']),
    material: 'Corduroy + Hardwood',
    style: 'Modern',
    colors: 'Brown, Green, Rust',
    dimensions: '3.0m W x 1.6m D x 0.85m H',
    weight: '82 kg',
  },
  {
    name: 'Modern Austic 7-Seater Recliner Sofa',
    slug: 'austic-recliner-sofa',
    description: 'Modern Austic 7-seater microfiber recliner sofa in 3+2+1+1 configuration. This premium recliner set features plush microfiber upholstery that is soft yet durable, with each seat offering individual reclining functionality. The built-in footrests and adjustable back angles allow you to find your perfect comfort position. The sturdy hardwood frame and steel reclining mechanism ensure years of reliable use.',
    price: 260000,
    compareAtPrice: 310000,
    images: JSON.stringify(['/images/products/austic-recliner-sofa.png']),
    specs: JSON.stringify({ material: 'Microfiber + Hardwood + Steel', dimensions: '3.3m W x 1.8m D x 0.95m H', weight: '105 kg', seating: '7-seater (3+2+1+1)', colorOptions: ['Charcoal', 'Brown', 'Black'], features: ['Full recliner', 'Built-in footrests', 'Steel mechanism'] }),
    categorySlug: 'living-room',
    stock: 6,
    featured: true,
    rating: 4.8,
    reviewCount: 112,
    tags: JSON.stringify(['sale', 'popular']),
    material: 'Microfiber + Hardwood',
    style: 'Modern',
    colors: 'Charcoal, Brown, Black',
    dimensions: '3.3m W x 1.8m D x 0.95m H',
    weight: '105 kg',
  },
  {
    name: 'Modern Celine Chester 7-Seater Sofa',
    slug: 'celine-chester-sofa',
    description: 'This classic Celine chester sofa has deep buttoning and high arms that give a sophisticated interior feel. The 7-seater configuration in 3+2+1+1 layout provides ample seating for the whole family. The premium fabric upholstery is both luxurious and practical, while the deep button tufting adds a touch of timeless elegance. Built on a solid hardwood frame with high-resilience foam cushions.',
    price: 150000,
    compareAtPrice: 190000,
    images: JSON.stringify(['/images/products/celine-chester-sofa.png']),
    specs: JSON.stringify({ material: 'Premium Fabric + Hardwood Frame', dimensions: '3.1m W x 1.7m D x 0.9m H', weight: '88 kg', seating: '7-seater (3+2+1+1)', colorOptions: ['Grey', 'Navy', 'Green'], features: ['Deep button tufting', 'High arms', 'Chesterfield style'] }),
    categorySlug: 'living-room',
    stock: 7,
    featured: false,
    rating: 4.7,
    reviewCount: 85,
    tags: JSON.stringify(['sale', 'new']),
    material: 'Premium Fabric + Hardwood',
    style: 'Classic',
    colors: 'Grey, Navy, Green',
    dimensions: '3.1m W x 1.7m D x 0.9m H',
    weight: '88 kg',
  },
  {
    name: 'Modern Copenhagen 7-Seater Corduroy Sofa',
    slug: 'copenhagen-corduroy-sofa',
    description: 'A classic sofa made of premium hardwood frame with a lustrous dark walnut finish and has removable cushions for easy maintenance. The Copenhagen brings Scandinavian elegance to your living room with its clean lines and warm corduroy upholstery. The removable cushion covers make cleaning effortless, while the solid hardwood construction ensures this sofa will be a cherished part of your home for years to come.',
    price: 220000,
    compareAtPrice: null,
    images: JSON.stringify(['/images/products/copenhagen-corduroy-sofa.png']),
    specs: JSON.stringify({ material: 'Corduroy + Premium Hardwood', dimensions: '3.2m W x 1.7m D x 0.88m H', weight: '92 kg', seating: '7-seater (3+2+1+1)', colorOptions: ['Brown', 'Grey', 'Olive'], features: ['Removable cushions', 'Dark walnut finish', 'Scandinavian design'] }),
    categorySlug: 'living-room',
    stock: 5,
    featured: true,
    rating: 4.8,
    reviewCount: 98,
    tags: JSON.stringify(['popular', 'featured']),
    material: 'Corduroy + Hardwood',
    style: 'Scandinavian',
    colors: 'Brown, Grey, Olive',
    dimensions: '3.2m W x 1.7m D x 0.88m H',
    weight: '92 kg',
  },
  {
    name: 'Modern Cuddle Recliner Sofa 6-Seater',
    slug: 'cuddle-recliner-sofa',
    description: 'A 3-seater with 2 end recliners, plus a 2-seater recliner and a console with storage. This set gives you the perfect place for relaxation, extending backward with a simple side lever. The microfiber fabric is exceptionally soft and easy to clean. The built-in storage console between seats is perfect for keeping remotes, magazines, and drinks within reach.',
    price: 190000,
    compareAtPrice: 230000,
    images: JSON.stringify(['/images/products/cuddle-recliner-sofa.png']),
    specs: JSON.stringify({ material: 'Microfiber + Hardwood + Steel', dimensions: '3.0m W x 1.8m D x 0.95m H', weight: '95 kg', seating: '6-seater (3+2+1)', colorOptions: ['Brown', 'Black', 'Grey'], features: ['End recliners', 'Storage console', 'Side lever recline'] }),
    categorySlug: 'living-room',
    stock: 6,
    featured: false,
    rating: 4.7,
    reviewCount: 73,
    tags: JSON.stringify(['sale']),
    material: 'Microfiber + Hardwood',
    style: 'Modern',
    colors: 'Brown, Black, Grey',
    dimensions: '3.0m W x 1.8m D x 0.95m H',
    weight: '95 kg',
  },
  {
    name: 'Modern Bella 7-Seater Corduroy Sofa',
    slug: 'bella-corduroy-sofa',
    description: 'It has a soft spring cushion and a plush back cushion that ensures ample support and ultimate comfort. The silver stripe fabric adds a subtle touch of elegance to the corduroy texture. This 5-seater configuration offers generous seating while maintaining a compact footprint ideal for medium to large living rooms. The solid hardwood frame provides excellent stability and durability.',
    price: 140000,
    compareAtPrice: null,
    images: JSON.stringify(['/images/products/bella-corduroy-sofa.png']),
    specs: JSON.stringify({ material: 'Corduroy Fabric + Hardwood', dimensions: '2.6m W x 1.5m D x 0.85m H', weight: '72 kg', seating: '5-seater', colorOptions: ['Silver Stripe', 'Gold Stripe', 'Plain Brown'], features: ['Spring cushion', 'Plush back', 'Compact design'] }),
    categorySlug: 'living-room',
    stock: 8,
    featured: false,
    rating: 4.5,
    reviewCount: 52,
    tags: JSON.stringify(['new']),
    material: 'Corduroy + Hardwood',
    style: 'Modern',
    colors: 'Silver Stripe, Gold Stripe, Brown',
    dimensions: '2.6m W x 1.5m D x 0.85m H',
    weight: '72 kg',
  },

  // === BEDROOM ===
  {
    name: 'Crown Mahogany Queen Size Bed 5x6',
    slug: 'crown-mahogany-queen-bed',
    description: 'Crown Queen Size Bed crafted from premium mahogany wood with an elegant headboard design. Available in multiple configurations: Full Set (bed with side tables and dresser), Bed with Side Tables, Bed with Dresser, or Bed Only in various sizes (4x6, 5x6, 6x6). The rich mahogany finish adds warmth and sophistication to any bedroom. Sturdy construction with reinforced slats for optimal mattress support.',
    price: 175000,
    compareAtPrice: 210000,
    images: JSON.stringify(['/images/products/crown-mahogany-bed.png']),
    specs: JSON.stringify({ material: 'Solid Mahogany Wood', dimensions: '5ft W x 6ft L (Queen)', weight: '60 kg', sizes: ['4x6', '5x6', '6x6'], colorOptions: ['Dark Mahogany', 'Light Mahogany'], features: ['Elegant headboard', 'Reinforced slats', 'Multiple configs'] }),
    categorySlug: 'bedroom',
    stock: 10,
    featured: true,
    rating: 4.8,
    reviewCount: 145,
    tags: JSON.stringify(['sale', 'popular', 'featured']),
    material: 'Solid Mahogany',
    style: 'Classic',
    colors: 'Dark Mahogany, Light Mahogany',
    dimensions: '5ft W x 6ft L',
    weight: '60 kg',
  },
  {
    name: 'Double Decker Bunk Bed 4x6 by 3.5x6',
    slug: 'double-decker-bunk-bed',
    description: 'Maximize your space with our sturdy and stylish Double Decker bed. The top bunk fits a 3.5x6 mattress, perfect for kids or guests, while the bottom bunk comfortably holds a 4x6 mattress — ideal for adults. Built with a strong metal and wood frame with safety rails on the top bunk and a sturdy ladder. Available in Clear and Walnut finishes to match any room decor.',
    price: 48000,
    compareAtPrice: null,
    images: JSON.stringify(['/images/products/double-decker-bed.png']),
    specs: JSON.stringify({ material: 'Metal Frame + Wood Slats', dimensions: '4ft W x 6ft L x 5.5ft H', weight: '55 kg', sizes: ['4x6 by 3.5x6'], colorOptions: ['Clear', 'Walnut'], features: ['Safety rails', 'Sturdy ladder', 'Space-saving'] }),
    categorySlug: 'bedroom',
    stock: 15,
    featured: false,
    rating: 4.4,
    reviewCount: 67,
    tags: JSON.stringify(['popular']),
    material: 'Metal + Wood',
    style: 'Modern',
    colors: 'Clear, Walnut',
    dimensions: '4ft W x 6ft L x 5.5ft H',
    weight: '55 kg',
  },
  {
    name: 'King Size Mahogany Bed Set 6x6',
    slug: 'king-mahogany-bed-set',
    description: 'King Size Mahogany Bed Set 6x6 — the ultimate in luxury bedroom furniture. Comes complete with 1 x Bed, 1 x Dressing Table, and 2 x Bed Side Tables. Crafted from solid mahogany wood with a rich, warm finish that brings elegance to your bedroom. The king-size proportions provide ample sleeping space, while the matching side tables and dressing table create a cohesive, sophisticated look.',
    price: 190000,
    compareAtPrice: 240000,
    images: JSON.stringify(['/images/products/king-mahogany-bed.png']),
    specs: JSON.stringify({ material: 'Solid Mahogany Wood', dimensions: '6ft W x 6ft L (King)', weight: '120 kg (full set)', sizes: ['6x6'], colorOptions: ['Dark Mahogany'], features: ['Complete set', 'Dressing table', '2 side tables', 'Matching pieces'] }),
    categorySlug: 'bedroom',
    stock: 4,
    featured: true,
    rating: 4.9,
    reviewCount: 89,
    tags: JSON.stringify(['sale', 'featured', 'best-seller']),
    material: 'Solid Mahogany',
    style: 'Classic Luxury',
    colors: 'Dark Mahogany',
    dimensions: '6ft W x 6ft L',
    weight: '120 kg',
  },

  // === DINING TABLES ===
  {
    name: '6-Seater Dining Set',
    slug: '6-seater-dining-set',
    description: 'Elegant 6-Seater Solid Wood Dining Set — upgrade your dining space with this beautifully crafted dining set. The solid wood table top showcases natural grain patterns, while the ergonomically designed chairs provide comfortable seating for extended dinner conversations. The sturdy construction and timeless design make this set a worthy investment for your home.',
    price: 120000,
    compareAtPrice: 150000,
    images: JSON.stringify(['/images/products/dining-set-6seater.png']),
    specs: JSON.stringify({ material: 'Solid Wood', dimensions: '1.5m W x 0.9m D x 0.75m H', weight: '75 kg (set)', seating: '6-seater', colorOptions: ['Natural Wood', 'Dark Wood', 'White'], features: ['Solid wood top', 'Ergonomic chairs', 'Sturdy legs'] }),
    categorySlug: 'dining-tables',
    stock: 10,
    featured: true,
    rating: 4.7,
    reviewCount: 112,
    tags: JSON.stringify(['sale', 'popular', 'featured']),
    material: 'Solid Wood',
    style: 'Modern Classic',
    colors: 'Natural Wood, Dark Wood, White',
    dimensions: '1.5m W x 0.9m D x 0.75m H',
    weight: '75 kg',
  },

  // === TV STANDS ===
  {
    name: 'Modern Black Peachy TV Stand',
    slug: 'black-peachy-tv-stand',
    description: 'Made of premium wood and can hold up to 65-inch screens. This modern TV stand combines sleek design with practical storage. Available in black and white finishes. Features multiple compartments for media devices, gaming consoles, and accessories. The clean lines and contemporary design make it a perfect addition to any modern living room. Cable management slots keep wires tidy and organized.',
    price: 40000,
    compareAtPrice: null,
    images: JSON.stringify(['/images/products/black-tv-stand.png']),
    specs: JSON.stringify({ material: 'Engineered Wood + Metal Legs', dimensions: '1.5m W x 0.4m D x 0.5m H', weight: '25 kg', capacity: 'Up to 65-inch TV', colorOptions: ['Black', 'White'], features: ['Cable management', 'Multiple compartments', 'Metal legs'] }),
    categorySlug: 'tv-stands',
    stock: 18,
    featured: false,
    rating: 4.3,
    reviewCount: 45,
    tags: JSON.stringify(['new']),
    material: 'Engineered Wood + Metal',
    style: 'Modern',
    colors: 'Black, White',
    dimensions: '1.5m W x 0.4m D x 0.5m H',
    weight: '25 kg',
  },

  // === MATTRESSES ===
  {
    name: 'Pacific Pocket Spring Mattress',
    slug: 'pacific-pocket-spring-mattress',
    description: 'Individual Support: Unlike traditional spring mattresses where the springs are all connected, pocket springs are each housed in their own fabric pocket. This allows them to move independently, contouring to your body shape and providing targeted support where you need it most. Available in 3.5x6x10, 4x6x10, and 5x6x10 sizes. The premium quilted top layer adds an extra level of comfort, while the breathable fabric cover ensures cool sleeping throughout the night.',
    price: 37000,
    compareAtPrice: 45000,
    images: JSON.stringify(['/images/products/pocket-spring-mattress.png']),
    specs: JSON.stringify({ material: 'Pocket Springs + High-Density Foam', dimensions: 'Available in 3.5x6, 4x6, 5x6 (all 10-inch)', weight: '20-30 kg', sizes: ['3.5x6', '4x6', '5x6'], colorOptions: ['White'], features: ['Individual pocket springs', 'Quilted top', 'Breathable cover', 'Motion isolation'] }),
    categorySlug: 'mattresses',
    stock: 25,
    featured: true,
    rating: 4.6,
    reviewCount: 98,
    tags: JSON.stringify(['sale', 'new', 'popular']),
    material: 'Pocket Springs + Foam',
    style: 'Modern',
    colors: 'White',
    dimensions: '3.5x6 / 4x6 / 5x6 (10-inch)',
    weight: '25 kg',
  },

  // === COFFEE TABLES ===
  {
    name: 'Elegant Coffee Table Set',
    slug: 'elegant-coffee-table-set',
    description: 'This elegant white coffee table set brings a touch of modern sophistication to your living room. Available as a full set or individual pieces (coffee table only). The clean white finish brightens any space, while the sturdy construction ensures lasting durability. The set includes matching side tables for a cohesive look. Perfect for contemporary and minimalist interiors.',
    price: 40000,
    compareAtPrice: 52000,
    images: JSON.stringify(['/images/products/elegant-coffee-table.png']),
    specs: JSON.stringify({ material: 'Engineered Wood + Metal', dimensions: '1.0m W x 0.6m D x 0.45m H', weight: '15 kg', colorOptions: ['White', 'Oak', 'Walnut'], features: ['Full set or individual', 'Matching side tables', 'Easy assembly'] }),
    categorySlug: 'coffee-tables',
    stock: 14,
    featured: false,
    rating: 4.4,
    reviewCount: 56,
    tags: JSON.stringify(['sale', 'new']),
    material: 'Engineered Wood + Metal',
    style: 'Modern Minimalist',
    colors: 'White, Oak, Walnut',
    dimensions: '1.0m W x 0.6m D x 0.45m H',
    weight: '15 kg',
  },
]

const reviews = [
  { productSlug: 'cozy-l-shaped-sofa', author: 'Wanjiru K.', rating: 5, comment: 'Absolutely love this L-shaped sofa! The built-in shelves are so convenient for keeping my books and remotes. It fits perfectly in my living room and the fabric is easy to clean.', verified: true, helpful: 24 },
  { productSlug: 'cozy-l-shaped-sofa', author: 'James M.', rating: 5, comment: 'Worth every shilling. The quality is outstanding — my whole family fits comfortably. Best furniture purchase I have made.', verified: true, helpful: 18 },
  { productSlug: 'king-mahogany-bed-set', author: 'Grace N.', rating: 5, comment: 'The complete set is stunning! The dressing table and side tables match perfectly. My bedroom looks like a hotel suite now.', verified: true, helpful: 32 },
  { productSlug: 'king-mahogany-bed-set', author: 'Peter O.', rating: 5, comment: 'Solid mahogany at this price is incredible. The bed is sturdy and elegant. Delivery was prompt and the team was professional.', verified: true, helpful: 15 },
  { productSlug: '6-seater-dining-set', author: 'Agnes W.', rating: 5, comment: 'This dining set transformed our dining room. The solid wood is beautiful and the chairs are very comfortable. Every guest compliments it.', verified: true, helpful: 21 },
  { productSlug: '6-seater-dining-set', author: 'Samuel K.', rating: 4, comment: 'Beautiful dining set with incredible quality. Assembly was straightforward. The wood grain is gorgeous.', verified: true, helpful: 9 },
  { productSlug: 'modena-sofa-set', author: 'Lucy M.', rating: 5, comment: 'The Modena sofa is pure luxury. The cushions are so comfortable and the fabric feels premium. It has completely elevated my living room.', verified: true, helpful: 28 },
  { productSlug: 'crown-mahogany-queen-bed', author: 'David N.', rating: 5, comment: 'Excellent bed frame. The mahogany finish is rich and elegant. The headboard is beautifully designed. Sleep like a queen!', verified: true, helpful: 19 },
  { productSlug: 'copenhagen-corduroy-sofa', author: 'Mary W.', rating: 5, comment: 'The removable cushion covers make cleaning so easy. The corduroy fabric is warm and inviting. Scandinavian elegance at its best.', verified: true, helpful: 16 },
  { productSlug: 'modern-blissblend-7seater', author: 'John K.', rating: 4, comment: 'Very comfortable sofa with excellent support. The semi recliner feature is great for movie nights. Good quality for the price.', verified: true, helpful: 11 },
  { productSlug: 'pacific-pocket-spring-mattress', author: 'Faith A.', rating: 5, comment: 'Best mattress I have ever slept on. The pocket springs contour perfectly to my body. No more back pain in the morning!', verified: true, helpful: 25 },
  { productSlug: 'pacific-pocket-spring-mattress', author: 'Martin G.', rating: 5, comment: 'My sleep quality improved dramatically. The motion isolation is excellent — my partner does not feel when I move.', verified: true, helpful: 20 },
  { productSlug: 'austic-recliner-sofa', author: 'Esther M.', rating: 5, comment: 'The full recliner mechanism is smooth and sturdy. Perfect for relaxing after a long day. The charcoal color matches everything.', verified: true, helpful: 14 },
  { productSlug: 'mahogany-6-seater-classic', author: 'Robert K.', rating: 5, comment: 'A true classic. The mahogany is beautiful and the chairs are very comfortable. This set will last for generations.', verified: true, helpful: 17 },
  { productSlug: 'black-peachy-tv-stand', author: 'Kevin O.', rating: 4, comment: 'Sleek and modern TV stand. Holds my 55-inch TV perfectly. Great cable management and storage space.', verified: true, helpful: 8 },
  { productSlug: 'celine-chester-sofa', author: 'Susan N.', rating: 5, comment: 'The chesterfield design is absolutely gorgeous. Deep buttoning gives it a sophisticated look. My living room feels like a luxury hotel.', verified: true, helpful: 22 },
]

const coupons = [
  { code: 'WELCOME10', type: 'percentage', value: 10, minOrder: 0, maxDiscount: 20000, usesLimit: 500, active: true, expiresAt: new Date('2026-12-31') },
  { code: 'SAVE25', type: 'percentage', value: 25, minOrder: 50000, maxDiscount: 50000, usesLimit: 200, active: true, expiresAt: new Date('2026-08-31') },
  { code: 'FLAT5000', type: 'fixed', value: 5000, minOrder: 80000, maxDiscount: null, usesLimit: 100, active: true, expiresAt: new Date('2026-09-30') },
  { code: 'FREESHIP', type: 'fixed', value: 2000, minOrder: 30000, maxDiscount: null, usesLimit: 1000, active: true, expiresAt: new Date('2026-12-31') },
  { code: 'MFP15', type: 'percentage', value: 15, minOrder: 50000, maxDiscount: null, usesLimit: 300, active: true, expiresAt: new Date('2026-12-31') },
  { code: 'NEWHOME', type: 'percentage', value: 20, minOrder: 100000, maxDiscount: 40000, usesLimit: 200, active: true, expiresAt: new Date('2026-12-31') },
  { code: 'FURNITURE10', type: 'percentage', value: 10, minOrder: 30000, maxDiscount: null, usesLimit: 500, active: true, expiresAt: new Date('2026-09-30') },
]

async function seed() {
  console.log('Seeding database...')

  // Clear all data (addresses first due to FK, then users)
  await db.address.deleteMany()
  await db.user.deleteMany()
  await db.blogPost.deleteMany()
  await db.loyaltyTransaction.deleteMany()
  await db.newsletter.deleteMany()
  await db.wishlistItem.deleteMany()
  await db.coupon.deleteMany()
  await db.orderItem.deleteMany()
  await db.review.deleteMany()
  await db.cartItem.deleteMany()
  await db.order.deleteMany()
  await db.product.deleteMany()
  await db.category.deleteMany()

  // Create demo users
  console.log('Creating users...')
  const hashedPassword = await bcrypt.hash('password123', 12)
  const user1 = await db.user.create({
    data: { email: 'wanjiru@example.com', password: hashedPassword, name: 'Wanjiru Kamau', phone: '+254712345678' },
  })
  const user2 = await db.user.create({
    data: { email: 'john@example.com', password: hashedPassword, name: 'John Ochieng', phone: '+254723456789' },
  })
  const user3 = await db.user.create({
    data: { email: 'grace@example.com', password: hashedPassword, name: 'Grace Wambui', phone: '+254734567890' },
  })

  // Create user addresses
  await db.address.createMany({
    data: [
      { userId: user1.id, label: 'Home', street: '123 Kenyatta Ave', city: 'Nairobi', county: 'Nairobi', isDefault: true },
      { userId: user1.id, label: 'Work', street: '456 Moi Avenue', city: 'Nairobi', county: 'Nairobi', isDefault: false },
      { userId: user2.id, label: 'Home', street: '456 Moi Drive', city: 'Mombasa', county: 'Mombasa', isDefault: true },
      { userId: user3.id, label: 'Home', street: '789 Uhuru Gardens', city: 'Nakuru', county: 'Nakuru', isDefault: true },
    ],
  })

  // Create categories
  console.log('Creating categories...')
  const createdCategories: Record<string, string> = {}
  for (const cat of categories) {
    const created = await db.category.create({ data: cat })
    createdCategories[cat.slug] = created.id
  }

  // Create products
  console.log('Creating products...')
  const createdProducts: Record<string, string> = {}
  for (const prod of products) {
    const { categorySlug, ...productData } = prod
    const created = await db.product.create({
      data: {
        ...productData,
        categoryId: createdCategories[categorySlug],
      },
    })
    createdProducts[prod.slug] = created.id
  }

  // Create reviews
  console.log('Creating reviews...')
  for (const review of reviews) {
    const productId = createdProducts[review.productSlug]
    if (productId) {
      await db.review.create({
        data: { productId, author: review.author, rating: review.rating, comment: review.comment, verified: review.verified, helpful: review.helpful },
      })
    }
  }

  // Create coupons
  console.log('Creating coupons...')
  for (const coupon of coupons) {
    await db.coupon.create({ data: coupon })
  }

  // Create sample newsletter
  for (const email of ['wanjiru@example.com', 'john@example.com', 'grace@example.com']) {
    await db.newsletter.create({ data: { email } }).catch(() => {})
  }

  // Create sample loyalty transactions
  await db.loyaltyTransaction.createMany({
    data: [
      { email: 'wanjiru@example.com', points: 500, description: 'Welcome bonus' },
      { email: 'wanjiru@example.com', points: 120, description: 'Earned from order #MFP-10001', orderId: 'demo-order-1' },
      { email: 'john@example.com', points: 500, description: 'Welcome bonus' },
    ],
  })

  // Create sample orders
  const order1 = await db.order.create({
    data: {
      orderNumber: 'MFP-10001',
      email: 'wanjiru@example.com',
      firstName: 'Wanjiru',
      lastName: 'Kamau',
      address: '123 Kenyatta Ave',
      city: 'Nairobi',
      phone: '+254 712 345 678',
      total: 175000,
      status: 'delivered',
      discount: 0,
      pointsEarned: 175,
      userId: user1.id,
      items: {
        create: [
          { productId: createdProducts['crown-mahogany-queen-bed'], name: 'Crown Mahogany Queen Size Bed 5x6', price: 175000, quantity: 1 },
        ],
      },
    },
  })

  const order2 = await db.order.create({
    data: {
      orderNumber: 'MFP-10002',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Ochieng',
      address: '456 Moi Drive',
      city: 'Mombasa',
      phone: '+254 723 456 789',
      total: 148000,
      status: 'shipped',
      discount: 5000,
      couponCode: 'FLAT5000',
      pointsEarned: 148,
      userId: user2.id,
      items: {
        create: [
          { productId: createdProducts['black-peachy-tv-stand'], name: 'Modern Black Peachy TV Stand', price: 40000, quantity: 1 },
          { productId: createdProducts['elegant-coffee-table-set'], name: 'Elegant Coffee Table Set', price: 40000, quantity: 1 },
          { productId: createdProducts['pacific-pocket-spring-mattress'], name: 'Pacific Pocket Spring Mattress', price: 37000, quantity: 2 },
        ],
      },
    },
  })

  const order3 = await db.order.create({
    data: {
      orderNumber: 'MFP-10003',
      email: 'grace@example.com',
      firstName: 'Grace',
      lastName: 'Wambui',
      address: '789 Uhuru Gardens',
      city: 'Nakuru',
      phone: '+254 734 567 890',
      total: 120000,
      status: 'processing',
      discount: 0,
      pointsEarned: 120,
      userId: user3.id,
      items: {
        create: [
          { productId: createdProducts['6-seater-dining-set'], name: '6-Seater Dining Set', price: 120000, quantity: 1 },
        ],
      },
    },
  })

  // Create blog posts
  console.log('Creating blog posts...')
  const blogPosts = [
    {
      title: 'How to Choose the Perfect Sofa for Your Living Room',
      slug: 'choose-perfect-sofa',
      excerpt: 'A comprehensive guide to selecting the ideal sofa that complements your space, lifestyle, and budget.',
      content: 'Choosing the right sofa is one of the most important furniture decisions you will make for your home. Your sofa is the centerpiece of your living room — it is where you relax, entertain guests, and spend quality time with family.\n\n## Consider Your Space\nBefore shopping, measure your living room carefully. Leave at least 60cm of walking space around the sofa. For smaller rooms, consider a 2-seater or a modular L-shaped design that maximizes seating without overwhelming the space.\n\n## Think About Lifestyle\nIf you have children or pets, opt for durable, stain-resistant fabrics like microfiber or leather. For a more formal space, velvet or linen can add elegance. Consider removable, washable cushion covers for easy maintenance.\n\n## Comfort is Key\nTest the sofa in person if possible. Look for high-density foam cushions with spring support. The seat depth should allow you to sit comfortably with your feet flat on the floor. Armrest height should support your arms naturally.\n\n## Style and Color\nNeutral colors like grey, beige, and brown are versatile and timeless. Bold colors can make a statement but may limit your decorating options. Consider your existing decor and choose a sofa that complements it.\n\n## Quality Matters\nInvest in a sofa with a solid hardwood or metal frame. Check the joints — they should be glued, screwed, or dowelled, not just stapled. A quality sofa should last 7-15 years with proper care.\n\nAt Modern Furniture Pacific, we offer a wide range of sofas to suit every taste and budget. Visit our showroom or browse online to find your perfect match.',
      author: 'Modern Furniture Pacific',
      tags: JSON.stringify(['sofa', 'living room', 'guide', 'tips']),
    },
    {
      title: 'Interior Design Trends in Kenya for 2026',
      slug: 'interior-design-trends-kenya-2026',
      excerpt: 'Discover the hottest interior design trends sweeping across Kenyan homes this year.',
      content: "Kenyan interior design is evolving beautifully, blending global trends with local craftsmanship and materials. Here are the top trends transforming homes across the country in 2026.\n\n## Warm Earth Tones\nEarthy color palettes dominated by terracotta, olive green, warm beige, and rich brown are taking center stage. These colors reflect the natural beauty of the Kenyan landscape and create warm, inviting spaces.\n\n## Sustainable Materials\nThere is a growing preference for furniture made from sustainably sourced wood, especially local mahogany and mvule. Woven raffia, sisal, and bamboo accessories add texture while supporting local artisans.\n\n## Indoor-Outdoor Living\nWith Kenya's beautiful climate, the boundary between indoor and outdoor spaces is blurring. Large sliding doors, covered verandas, and weather-resistant furniture create seamless transitions.\n\n## Statement Lighting\nBold pendant lights, woven lampshades, and sculptural floor lamps are being used as focal points. Local craftspeople are creating stunning pieces using recycled materials and traditional techniques.\n\n## Minimalist Luxury\nLess is more. Clean lines, quality over quantity, and carefully curated spaces are preferred over cluttered rooms. Each piece of furniture should earn its place.\n\n## Bold Textiles\nKitenge and kikoy-inspired patterns are being used in upholstery, cushions, and curtains, adding vibrant pops of color and celebrating Kenyan textile heritage.\n\n## Smart Furniture\nTechnology-integrated furniture with built-in charging ports, adjustable heights, and multi-functional designs is gaining popularity, especially among young professionals working from home.\n\nVisit Modern Furniture Pacific to explore our collection that embodies these trends while maintaining timeless appeal.",
      author: 'Modern Furniture Pacific',
      tags: JSON.stringify(['trends', 'design', 'Kenya', '2026']),
    },
    {
      title: 'Small Space? Big Style — Furniture Tips for Apartments',
      slug: 'furniture-tips-small-apartments',
      excerpt: 'Maximize your apartment space with smart furniture choices that look great and serve multiple purposes.',
      content: 'Living in an apartment does not mean sacrificing style or comfort. With the right furniture choices, even the smallest space can feel open, organized, and beautiful.\n\n## Measure Everything\nBefore buying any furniture, measure your space precisely. Create a floor plan to scale. This prevents costly mistakes and ensures everything fits perfectly.\n\n## Multi-Functional Pieces\nInvest in furniture that serves multiple purposes. A storage ottoman can be a coffee table, extra seating, and hidden storage. A sofa bed is perfect for hosting guests. A dining table with drop leaves can expand when needed.\n\n## Go Vertical\nUse your wall space. Floating shelves, wall-mounted TVs, and tall bookcases draw the eye upward, making rooms feel larger. A wall-mounted desk folds away when not in use.\n\n## Choose Light Colors\nLight-colored furniture and walls make spaces feel larger and brighter. Mirrors strategically placed can double the sense of space. Glass or acrylic furniture creates visual lightness.\n\n## Built-In Storage\nCustom built-in cabinets and shelving maximize every inch. Under-bed storage containers make use of wasted space. A bed frame with built-in drawers eliminates the need for a separate dresser.\n\n## Scale Appropriately\nAvoid oversized furniture in small spaces. Choose apartment-scale sofas (2-seaters or loveseats), round dining tables, and compact TV units. Every piece should be proportional to the room.\n\n## Create Zones\nUse furniture arrangement to define different areas — a small rug and two chairs can create a reading nook. A room divider can separate your sleeping area from your living space.\n\nAt Modern Furniture Pacific, we have a dedicated range of apartment-friendly furniture that combines style with smart space-saving design.',
      author: 'Modern Furniture Pacific',
      tags: JSON.stringify(['apartment', 'small space', 'tips', 'storage']),
    },
  ]
  for (const post of blogPosts) {
    await db.blogPost.create({ data: post })
  }
  console.log(`  - ${blogPosts.length} blog posts`)

  console.log('Seeding completed!')
  console.log(`  - ${categories.length} categories`)
  console.log(`  - ${products.length} products`)
  console.log(`  - ${reviews.length} reviews`)
  console.log(`  - ${coupons.length} coupons`)
  console.log(`  - ${blogPosts.length} blog posts`)
  console.log('  - 3 sample orders')
}

seed()
  .catch((e) => {
    console.error('Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
