import { PrismaClient, StaffRole, ProductType, PublicationStatus, StockMovementType, BookingType, BookingStatus, PaymentMethod, SaleStatus, PurchaseOrderStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting OcuSphere Database Seeding...');

  // 1. Store Settings
  console.log('Seeding Store Settings...');
  await prisma.storeSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      storeName: 'OcuSphere Eyewear Flagship',
      tagline: 'Precision Optics & Luxury Eyewear',
      address: {
        line1: 'Shop 4 & 5, Hill Road Promenade',
        line2: 'Near Bandra Police Station',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400050',
        country: 'India',
      },
      phone: '+91 98200 11223',
      email: 'bandra@ocusphere.in',
      gstin: '27AABCU9603R1ZM',
      openingHours: {
        weekdays: '10:00 AM - 09:00 PM',
        saturday: '10:00 AM - 09:30 PM',
        sunday: '11:00 AM - 08:30 PM',
      },
      bookingCapacityPerHour: 4,
      reservationHoldDays: 3,
      currency: 'INR',
      currencySymbol: '₹',
      taxRatePercent: 12.0,
      receiptHeader: 'OcuSphere Luxury Optical Retail\nGSTIN: 27AABCU9603R1ZM\nTel: +91 98200 11223',
      receiptFooter: 'Thank you for choosing OcuSphere!\nAll prescription lenses carry 1-Year Coating Warranty.\nExchange within 14 days with original receipt.',
      enableSmsNotifications: true,
      enableWhatsappNotifications: true,
      enableEmailNotifications: false,
    },
  });

  // 2. Staff Users
  console.log('Seeding Staff Users...');
  const defaultPasswordHash = await argon2.hash('OcuSphere@2026', { type: argon2.argon2id });

  const staffUsers = [
    {
      employeeCode: 'EMP-001',
      fullName: 'Rajiv Singhal',
      email: 'rajiv.singhal@ocusphere.in',
      phone: '9820011223',
      role: StaffRole.OWNER_ADMIN,
      customPermissions: [
        'pos_access', 'manage_products', 'view_cost_price', 'adjust_inventory',
        'approve_stock_requests', 'manage_suppliers', 'manage_purchase_orders',
        'manage_customers', 'view_prescriptions', 'manage_bookings',
        'manage_offers', 'view_financial_reports', 'manage_staff', 'store_settings'
      ],
    },
    {
      employeeCode: 'EMP-002',
      fullName: 'Kavita Joshi',
      email: 'kavita.joshi@ocusphere.in',
      phone: '9820022334',
      role: StaffRole.STORE_MANAGER,
      customPermissions: [
        'pos_access', 'manage_products', 'view_cost_price', 'adjust_inventory',
        'approve_stock_requests', 'manage_suppliers', 'manage_purchase_orders',
        'manage_customers', 'view_prescriptions', 'manage_bookings',
        'manage_offers', 'view_financial_reports'
      ],
    },
    {
      employeeCode: 'EMP-003',
      fullName: 'Aman Patel',
      email: 'aman.patel@ocusphere.in',
      phone: '9820033445',
      role: StaffRole.CASHIER,
      customPermissions: ['pos_access', 'manage_customers', 'manage_bookings'],
    },
    {
      employeeCode: 'EMP-004',
      fullName: 'Karan Sharma',
      email: 'karan.sharma@ocusphere.in',
      phone: '9820044556',
      role: StaffRole.INVENTORY_STAFF,
      customPermissions: ['manage_products', 'adjust_inventory', 'manage_suppliers', 'manage_purchase_orders'],
    },
    {
      employeeCode: 'EMP-005',
      fullName: 'Simran Walia',
      email: 'simran.walia@ocusphere.in',
      phone: '9820055667',
      role: StaffRole.STORE_ASSISTANT,
      customPermissions: ['manage_customers', 'manage_bookings'],
    },
  ];

  for (const s of staffUsers) {
    await prisma.user.upsert({
      where: { email: s.email },
      update: { role: s.role, customPermissions: s.customPermissions },
      create: {
        employeeCode: s.employeeCode,
        fullName: s.fullName,
        email: s.email,
        phone: s.phone,
        passwordHash: defaultPasswordHash,
        role: s.role,
        customPermissions: s.customPermissions,
        isActive: true,
      },
    });
  }

  // 3. Categories and Brands
  console.log('Seeding Categories & Brands...');
  const categories = [
    { name: 'Men', slug: 'men', description: 'Men eyewear collections' },
    { name: 'Women', slug: 'women', description: 'Women eyewear collections' },
    { name: 'Unisex', slug: 'unisex', description: 'Contemporary universal frames' },
    { name: 'Kids', slug: 'kids', description: 'Durable and flexible frames for children' },
    { name: 'Designer', slug: 'designer', description: 'High-end luxury international frames' },
  ];
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  const brands = [
    { name: 'OcuSphere Signature', slug: 'ocusphere-signature', description: 'In-house luxury eyewear handcrafted from Japanese titanium and Italian acetate' },
    { name: 'Ray-Ban', slug: 'ray-ban', description: 'Timeless American heritage eyewear' },
    { name: 'Oakley', slug: 'oakley', description: 'High-performance athletic and sports eyewear' },
    { name: 'Tom Ford', slug: 'tom-ford', description: 'Iconic modern luxury fashion eyewear' },
    { name: 'Silhouette', slug: 'silhouette', description: 'Austrian screwless rimless minimalism' },
    { name: 'Prada Eyewear', slug: 'prada', description: 'Avant-garde Italian high fashion frames' },
    { name: 'Zeiss Vision', slug: 'zeiss-vision', description: 'German optical precision lenses' },
    { name: 'Essilor', slug: 'essilor', description: 'World leader in ophthalmic lenses' },
  ];
  for (const b of brands) {
    await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: b,
    });
  }

  // 4. Products & Variants (Over 30 products)
  console.log('Seeding Products & Variants (32 items)...');
  const productsData = [
    {
      name: 'AeroLight Titanium Round',
      slug: 'aerolight-titanium-round',
      brand: 'OcuSphere Signature',
      category: 'Unisex',
      productType: ProductType.Eyeglasses,
      description: 'Ultra-lightweight Japanese beta-titanium optical frames featuring screwless precision hinges and hypoallergenic silicone nosepads.',
      modelCode: 'OC-TI-101',
      basePrice: 4999,
      featuredImage: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80',
      variants: [
        { sku: 'OC-TI101-BLK-M', barcode: '890100101001', colorName: 'Matte Onyx Black', colorHex: '#18181b', size: 'Medium (50-19-145)', material: 'Beta-Titanium', sellingPrice: 4999, costPrice: 1950, stock: 18, reserved: 2 },
        { sku: 'OC-TI101-GLD-M', barcode: '890100101002', colorName: 'Champagne Gold', colorHex: '#d4af37', size: 'Medium (50-19-145)', material: 'Beta-Titanium', sellingPrice: 5299, costPrice: 2050, stock: 12, reserved: 1 },
      ],
    },
    {
      name: 'Milanese Acetate Square',
      slug: 'milanese-acetate-square',
      brand: 'OcuSphere Signature',
      category: 'Men',
      productType: ProductType.Eyeglasses,
      description: 'Hand-polished Mazzucchelli acetate frame with custom German wire core and 5-barrel hinges.',
      modelCode: 'OC-AC-202',
      basePrice: 4499,
      featuredImage: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80',
      variants: [
        { sku: 'OC-AC202-TOR-W', barcode: '890100202001', colorName: 'Havana Tortoise', colorHex: '#4a2c11', size: 'Wide (54-18-145)', material: 'Mazzucchelli Acetate', sellingPrice: 4499, costPrice: 1650, stock: 24, reserved: 0 },
        { sku: 'OC-AC202-BLK-W', barcode: '890100202002', colorName: 'Gloss Jet Black', colorHex: '#09090b', size: 'Wide (54-18-145)', material: 'Mazzucchelli Acetate', sellingPrice: 4499, costPrice: 1650, stock: 30, reserved: 2 },
      ],
    },
    {
      name: 'Venetian Cat-Eye Luxe',
      slug: 'venetian-cat-eye-luxe',
      brand: 'OcuSphere Signature',
      category: 'Women',
      productType: ProductType.Eyeglasses,
      description: 'Feminine cat-eye profile sculpted from dual-layer translucent acetate with gold metallic temple accents.',
      modelCode: 'OC-CE-303',
      basePrice: 5499,
      featuredImage: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=600&q=80',
      variants: [
        { sku: 'OC-CE303-ROSE-M', barcode: '890100303001', colorName: 'Rose Crystal / Blush', colorHex: '#f43f5e', size: 'Medium (52-16-140)', material: 'Bio-Acetate', sellingPrice: 5499, costPrice: 2100, stock: 15, reserved: 0 },
        { sku: 'OC-CE303-AMB-M', barcode: '890100303002', colorName: 'Amber Honey Gradient', colorHex: '#d97706', size: 'Medium (52-16-140)', material: 'Bio-Acetate', sellingPrice: 5499, costPrice: 2100, stock: 10, reserved: 1 },
      ],
    },
    {
      name: 'Wayfarer Classic Polarized',
      slug: 'ray-ban-wayfarer-classic',
      brand: 'Ray-Ban',
      category: 'Unisex',
      productType: ProductType.Sunglasses,
      description: 'The legendary Ray-Ban Original Wayfarer with crystal green G-15 polarized lenses and durable acetate chassis.',
      modelCode: 'RB-2140',
      basePrice: 9890,
      featuredImage: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80',
      variants: [
        { sku: 'RB2140-901-58', barcode: '805289126577', colorName: 'Polished Black / G-15', colorHex: '#000000', size: 'Standard (50-22-150)', material: 'Propionate', sellingPrice: 9890, costPrice: 5400, stock: 16, reserved: 3 },
        { sku: 'RB2140-902-58', barcode: '805289126584', colorName: 'Tortoise / Brown Polarized', colorHex: '#582f0e', size: 'Standard (50-22-150)', material: 'Propionate', sellingPrice: 10490, costPrice: 5700, stock: 8, reserved: 0 },
      ],
    },
    {
      name: 'Aviator Large Metal',
      slug: 'ray-ban-aviator-large-metal',
      brand: 'Ray-Ban',
      category: 'Unisex',
      productType: ProductType.Sunglasses,
      description: 'Originally designed in 1937 for US aviators, timeless teardrop frame in tubular gold with teardrop mineral glass lenses.',
      modelCode: 'RB-3025',
      basePrice: 8790,
      featuredImage: 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=600&q=80',
      variants: [
        { sku: 'RB3025-001-58', barcode: '805289600016', colorName: 'Arista Gold / Green', colorHex: '#eab308', size: 'Large (58-14-135)', material: 'Monel Metal', sellingPrice: 8790, costPrice: 4800, stock: 20, reserved: 1 },
      ],
    },
    {
      name: 'Holbrook Prizm Sapphire',
      slug: 'oakley-holbrook-prizm',
      brand: 'Oakley',
      category: 'Men',
      productType: ProductType.Sunglasses,
      description: 'Timeless classic design fused with modern Oakley Prizm lens technology. Lightweight O Matter frame material.',
      modelCode: 'OO-9102',
      basePrice: 11490,
      featuredImage: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&w=600&q=80',
      variants: [
        { sku: 'OO9102-E855', barcode: '888392330124', colorName: 'Matte Black / Prizm Sapphire', colorHex: '#1e3a8a', size: 'Standard (57-18-137)', material: 'O-Matter', sellingPrice: 11490, costPrice: 6200, stock: 14, reserved: 0 },
      ],
    },
    {
      name: 'Flak 2.0 XL Sport',
      slug: 'oakley-flak-2-xl-sport',
      brand: 'Oakley',
      category: 'Men',
      productType: ProductType.Sunglasses,
      description: 'Semi-rimless sports frame offering enhanced lens coverage and Unobtainium earsocks for slip-free grip.',
      modelCode: 'OO-9188',
      basePrice: 12990,
      featuredImage: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80',
      variants: [
        { sku: 'OO9188-05', barcode: '888392110290', colorName: 'Polished White / Prizm Golf', colorHex: '#f8fafc', size: 'XL (59-12-133)', material: 'O-Matter / Unobtainium', sellingPrice: 12990, costPrice: 7100, stock: 9, reserved: 1 },
      ],
    },
    {
      name: 'FT5401 Square Optical',
      slug: 'tom-ford-ft5401-optical',
      brand: 'Tom Ford',
      category: 'Designer',
      productType: ProductType.Eyeglasses,
      description: 'Distinguished square silhouette showcasing Tom Fords signature golden T temple hinge inlay.',
      modelCode: 'FT-5401',
      basePrice: 24500,
      featuredImage: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&w=600&q=80',
      variants: [
        { sku: 'FT5401-001', barcode: '889214012019', colorName: 'Shiny Black / Rose Gold T', colorHex: '#000000', size: 'Medium (51-20-145)', material: 'Premium Acetate', sellingPrice: 24500, costPrice: 13500, stock: 6, reserved: 1 },
      ],
    },
    {
      name: 'TMA The Icon Rimless',
      slug: 'silhouette-tma-icon-rimless',
      brand: 'Silhouette',
      category: 'Unisex',
      productType: ProductType.Eyeglasses,
      description: 'Titan Minimal Art — 1.8 grams of pure Austrian titanium without screws or hinges. Ultimate featherlight comfort.',
      modelCode: 'SIL-TMA-5515',
      basePrice: 21990,
      featuredImage: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80',
      variants: [
        { sku: 'SIL5515-7531', barcode: '900850239101', colorName: 'Cosmopolitan Silver', colorHex: '#e2e8f0', size: 'Customisable (19-140)', material: 'High-Tech Titanium', sellingPrice: 21990, costPrice: 11800, stock: 11, reserved: 0 },
      ],
    },
    {
      name: 'Symbole Geometric Sunglasses',
      slug: 'prada-symbole-geometric',
      brand: 'Prada Eyewear',
      category: 'Designer',
      productType: ProductType.Sunglasses,
      description: 'Bold geometric silhouette featuring three-dimensional temples with an oversized Prada triangular logo plaque.',
      modelCode: 'SPR-17W',
      basePrice: 28900,
      featuredImage: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80',
      variants: [
        { sku: 'SPR17W-1AB-5S0', barcode: '805659762112', colorName: 'Solid Black / Dark Grey', colorHex: '#09090b', size: 'Wide (49-20-145)', material: 'Thick-cut Acetate', sellingPrice: 28900, costPrice: 15800, stock: 5, reserved: 0 },
      ],
    },
    {
      name: 'Junior Flexi-Fit Optical',
      slug: 'ocusphere-junior-flexi-fit',
      brand: 'OcuSphere Signature',
      category: 'Kids',
      productType: ProductType.Eyeglasses,
      description: 'Unbreakable TR-90 medical grade frame with 180-degree flexible spring hinges and adjustable silicone strap.',
      modelCode: 'OC-KID-01',
      basePrice: 2499,
      featuredImage: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80',
      variants: [
        { sku: 'OC-KD01-BLU', barcode: '890100404001', colorName: 'Cobalt Blue / Neon Lime', colorHex: '#2563eb', size: 'Kids (46-16-130)', material: 'Swiss TR-90 Polymer', sellingPrice: 2499, costPrice: 850, stock: 22, reserved: 1 },
      ],
    },
    {
      name: 'Zeiss ClearView Single Vision 1.60',
      slug: 'zeiss-clearview-sv-160',
      brand: 'Zeiss Vision',
      category: 'Unisex',
      productType: ProductType.Prescription_lenses,
      description: 'Freeform-optimised stock single vision lenses offering 3x larger zones of very clear vision with DuraVision Platinum AR coating.',
      modelCode: 'ZS-CV-160-DP',
      basePrice: 4200,
      featuredImage: 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=600&q=80',
      variants: [
        { sku: 'ZS-CV160-PAIR', barcode: '404280911002', colorName: 'Crystal Clear (AR)', colorHex: '#ffffff', size: '75mm Blank', material: 'MR-8 High Index 1.60', sellingPrice: 4200, costPrice: 1800, stock: 40, reserved: 4 },
      ],
    },
    {
      name: 'Zeiss SmartLife Progressive Plus 1.67',
      slug: 'zeiss-smartlife-prog-167',
      brand: 'Zeiss Vision',
      category: 'Unisex',
      productType: ProductType.Prescription_lenses,
      description: 'Custom tailor-made progressive lenses tuned for on-the-move smartphone lifestyle and natural head postures.',
      modelCode: 'ZS-SLP-167',
      basePrice: 16500,
      featuredImage: 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=600&q=80',
      variants: [
        { sku: 'ZS-SLP167-PAIR', barcode: '404280990014', colorName: 'Clear / DuraVision BlueProtect', colorHex: '#eff6ff', size: '70mm Blank', material: 'MR-10 High Index 1.67', sellingPrice: 16500, costPrice: 8200, stock: 15, reserved: 2 },
      ],
    },
    {
      name: 'Crizal Rock 1.56 UV Single Vision',
      slug: 'crizal-rock-156-uv',
      brand: 'Essilor',
      category: 'Unisex',
      productType: ProductType.Prescription_lenses,
      description: 'The most scratch and smudge resistant coating technology with complete front and back UV protection.',
      modelCode: 'ES-CRZ-156',
      basePrice: 3200,
      featuredImage: 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=600&q=80',
      variants: [
        { sku: 'ES-CRZ156-PAIR', barcode: '366228011299', colorName: 'Super Clear AR', colorHex: '#ffffff', size: '70mm Blank', material: 'Orma 1.56 Resin', sellingPrice: 3200, costPrice: 1350, stock: 50, reserved: 5 },
      ],
    },
    {
      name: 'Varilux Comfort Max Progressive',
      slug: 'varilux-comfort-max-prog',
      brand: 'Essilor',
      category: 'Unisex',
      productType: ProductType.Prescription_lenses,
      description: 'FlexOptim technology tailors the progression profile for all-day postural ergonomics and smooth intermediate focus.',
      modelCode: 'ES-VLX-MAX',
      basePrice: 14800,
      featuredImage: 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=600&q=80',
      variants: [
        { sku: 'ES-VLXMAX-PAIR', barcode: '366228099812', colorName: 'Crizal Prevencia (Blue Cut)', colorHex: '#f0f9ff', size: 'Custom Lab Order', material: 'Airwear Polycarbonate 1.59', sellingPrice: 14800, costPrice: 7200, stock: 20, reserved: 1 },
      ],
    },
    {
      name: 'Acuvue Oasys with HydraLuxe Daily (30pk)',
      slug: 'acuvue-oasys-hydraluxe-daily-30',
      brand: 'OcuSphere Signature',
      category: 'Unisex',
      productType: ProductType.Contact_lenses,
      description: 'Premium daily disposable silicone hydrogel contact lenses with tear-infused design for tireless eyes.',
      modelCode: 'JNJ-AO-1DAY',
      basePrice: 2850,
      featuredImage: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=600&q=80',
      variants: [
        { sku: 'JNJ-AO-30PK', barcode: '073390544192', colorName: 'Clear Visibility Tint', colorHex: '#e0f2fe', size: 'BC 8.5 / Dia 14.3', material: 'Senofilcon A (38% Water)', sellingPrice: 2850, costPrice: 1750, stock: 35, reserved: 2 },
      ],
    },
    {
      name: 'Microfiber Optical Cleaning Kit & Defog Spray',
      slug: 'microfiber-optical-cleaning-kit',
      brand: 'OcuSphere Signature',
      category: 'Unisex',
      productType: ProductType.Accessories,
      description: 'Alcohol-free anti-static lens cleaning solution (60ml) bundled with 2 ultra-dense 300GSM microfiber polishing cloths.',
      modelCode: 'OC-ACC-CLN',
      basePrice: 499,
      featuredImage: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80',
      variants: [
        { sku: 'OC-CLN-KIT', barcode: '890100901001', colorName: 'Matte Navy Pouch', colorHex: '#1e3a8a', size: '60ml Spray + 2 Cloths', material: 'Microfiber / Purified Solution', sellingPrice: 499, costPrice: 120, stock: 120, reserved: 0 },
      ],
    },
  ];

  // Generate 15 more realistic frames to ensure catalog has > 30 items
  const frameStyles = ['Aviator', 'Navigator', 'Clubmaster', 'Hexagonal', 'Oval', 'Square', 'Wayfarer', 'Cat-Eye'];
  const materialsList = ['Beta-Titanium', 'Italian Mazzucchelli Acetate', 'Swiss TR-90', 'Stainless Steel'];
  const colorsList = [
    { name: 'Brushed Gunmetal', hex: '#4b5563' },
    { name: 'Rose Gold Metallic', hex: '#fb7185' },
    { name: 'Midnight Tortoise', hex: '#374151' },
    { name: 'Matte Forest Green', hex: '#166534' },
  ];

  for (let i = 1; i <= 15; i++) {
    const style = frameStyles[i % frameStyles.length];
    const mat = materialsList[i % materialsList.length];
    const col = colorsList[i % colorsList.length];
    const price = 3999 + (i * 250);

    productsData.push({
      name: `Atelier ${style} Refined ${100 + i}`,
      slug: `atelier-${style.toLowerCase()}-refined-${100 + i}`,
      brand: i % 2 === 0 ? 'OcuSphere Signature' : 'Ray-Ban',
      category: i % 3 === 0 ? 'Men' : i % 3 === 1 ? 'Women' : 'Unisex',
      productType: i % 4 === 0 ? ProductType.Sunglasses : ProductType.Eyeglasses,
      description: `Contemporary handcrafted ${style.toLowerCase()} frame in ${mat} with precision spring hinges.`,
      modelCode: `AT-${style.substring(0, 3).toUpperCase()}-${100 + i}`,
      basePrice: price,
      featuredImage: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80',
      variants: [
        {
          sku: `AT-${style.substring(0, 3).toUpperCase()}${100 + i}-${col.name.substring(0, 3).toUpperCase()}`,
          barcode: `890999${1000 + i}01`,
          colorName: col.name,
          colorHex: col.hex,
          size: 'Medium (51-19-142)',
          material: mat,
          sellingPrice: price,
          costPrice: Math.round(price * 0.42),
          stock: 10 + (i % 15),
          reserved: i % 3 === 0 ? 1 : 0,
        },
      ],
    });
  }

  for (const p of productsData) {
    const createdProduct = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        brand: p.brand,
        category: p.category,
        productType: p.productType,
        description: p.description,
        modelCode: p.modelCode,
        basePrice: p.basePrice,
        featuredImage: p.featuredImage,
        images: [p.featuredImage],
        status: PublicationStatus.published,
      },
    });

    for (const v of p.variants) {
      await prisma.productVariant.upsert({
        where: { variantSku: v.sku },
        update: { stockOnHand: v.stock, reservedQuantity: v.reserved },
        create: {
          productId: createdProduct.id,
          variantSku: v.sku,
          barcode: v.barcode,
          colorName: v.colorName,
          colorHex: v.colorHex,
          size: v.size,
          material: v.material,
          sellingPrice: v.sellingPrice,
          costPrice: v.costPrice,
          stockOnHand: v.stock,
          reservedQuantity: v.reserved,
          reorderLevel: 5,
          images: [p.featuredImage],
          isAvailable: true,
        },
      });
    }
  }

  // 5. Suppliers
  console.log('Seeding Suppliers...');
  const suppliers = [
    {
      businessName: 'Luxottica India Eyewear Pvt Ltd',
      contactPerson: 'Vikram Merchant',
      phone: '+91 22 6789 0100',
      email: 'orders.india@luxottica.com',
      address: 'DLF Cyber City, Tower B, 7th Floor, Gurugram, Haryana',
      city: 'Gurugram',
      state: 'Haryana',
      taxId: '06AAACL1234F1Z1',
      paymentTerms: 'Net 30',
    },
    {
      businessName: 'Carl Zeiss India (Bangalore) Pvt Ltd',
      contactPerson: 'Ananya Deshmukh',
      phone: '+91 80 4343 8000',
      email: 'lensorders.in@zeiss.com',
      address: 'Plot No. 3, Jigani Link Road, Bommasandra Ind. Area',
      city: 'Bengaluru',
      state: 'Karnataka',
      taxId: '29AAACZ4321E1Z5',
      paymentTerms: 'Net 15',
    },
    {
      businessName: 'Mazzucchelli Craft Acetates Hong Kong Ltd',
      contactPerson: 'Jason Lin',
      phone: '+852 2891 0022',
      email: 'jason.lin@mazzucchelli.hk',
      address: 'Harbour City, Tsim Sha Tsui, Kowloon',
      city: 'Hong Kong',
      state: 'SAR',
      taxId: 'HK-CORP-98821',
      paymentTerms: 'Net 60',
    },
  ];

  for (const s of suppliers) {
    await prisma.supplier.create({
      data: s,
    });
  }

  // 6. Customers with Prescriptions
  console.log('Seeding Customers & Prescriptions...');
  const customers = [
    {
      customerCode: 'CUST-001',
      firstName: 'Aarav',
      lastName: 'Mehta',
      email: 'aarav.mehta@gmail.com',
      phone: '9820123456',
      city: 'Mumbai',
      state: 'Maharashtra',
      prescriptions: [
        {
          optometristName: 'Dr. Neha Kulkarni, M.Optom',
          clinicOrBranch: 'Bandra West Flagship',
          rightSph: '-1.75',
          rightCyl: '-0.50',
          rightAxis: '180',
          rightAdd: undefined,
          leftSph: '-2.00',
          leftCyl: '-0.75',
          leftAxis: '175',
          leftAdd: undefined,
          pupillaryDistance: 63.5,
          notes: 'Subjective refraction confirmed. Mild astigmatism.',
        },
      ],
    },
    {
      customerCode: 'CUST-002',
      firstName: 'Pooja',
      lastName: 'Sharma',
      email: 'pooja.sharma@yahoo.co.in',
      phone: '9819876543',
      city: 'Mumbai',
      state: 'Maharashtra',
      prescriptions: [
        {
          optometristName: 'Dr. Neha Kulkarni, M.Optom',
          clinicOrBranch: 'Bandra West Flagship',
          rightSph: '+1.50',
          rightCyl: '0.00',
          rightAxis: '0',
          rightAdd: '+1.75',
          leftSph: '+1.75',
          leftCyl: '-0.25',
          leftAxis: '90',
          leftAdd: '+1.75',
          pupillaryDistance: 61.0,
          notes: 'Early presbyopia. Recommended progressive lenses with anti-reflective coating.',
        },
      ],
    },
    {
      customerCode: 'CUST-003',
      firstName: 'Rohan',
      lastName: 'Verma',
      email: 'rohan.verma@techcorp.io',
      phone: '9820554433',
      city: 'Pune',
      state: 'Maharashtra',
      prescriptions: [],
    },
  ];

  for (const c of customers) {
    const createdCust = await prisma.customer.upsert({
      where: { phone: c.phone },
      update: {},
      create: {
        customerCode: c.customerCode,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        phone: c.phone,
        street: '12 Hill Road',
        city: c.city,
        state: c.state,
        postalCode: '400050',
        country: 'India',
        totalVisits: 2,
        totalSpent: 9498,
      },
    });

    for (const rx of c.prescriptions) {
      await prisma.opticalPrescription.create({
        data: {
          customerId: createdCust.id,
          optometristName: rx.optometristName,
          clinicOrBranch: rx.clinicOrBranch,
          rightSph: rx.rightSph,
          rightCyl: rx.rightCyl,
          rightAxis: rx.rightAxis,
          rightAdd: rx.rightAdd,
          leftSph: rx.leftSph,
          leftCyl: rx.leftCyl,
          leftAxis: rx.leftAxis,
          leftAdd: rx.leftAdd,
          pupillaryDistance: rx.pupillaryDistance,
          notes: rx.notes,
        },
      });
    }
  }

  // 7. Offers & Coupons
  console.log('Seeding Offers & Coupons...');
  const festiveOffer = await prisma.offer.create({
    data: {
      name: 'Festive Eyewear Celebration',
      description: 'Get 15% flat discount on complete frame and lens pairings.',
      discountType: 'Percentage',
      discountValue: 15.0,
      minimumPurchase: 3000,
      maximumDiscount: 2000,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      usageLimit: 500,
      usedCount: 28,
      isActive: true,
      coupons: {
        create: [
          {
            code: 'FESTIVE15',
            offerName: 'Festive Eyewear Celebration',
            usageLimit: 500,
            perCustomerLimit: 2,
            usedCount: 28,
            expiryDate: new Date('2026-12-31'),
            isActive: true,
          },
        ],
      },
    },
  });

  await prisma.offer.create({
    data: {
      name: 'Welcome In-Store Privilege',
      description: 'Flat ₹500 discount on first in-store purchase above ₹4,000.',
      discountType: 'Fixed_Amount',
      discountValue: 500.0,
      minimumPurchase: 4000,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      usageLimit: 200,
      usedCount: 14,
      isActive: true,
      coupons: {
        create: [
          {
            code: 'WELCOME500',
            offerName: 'Welcome In-Store Privilege',
            usageLimit: 200,
            perCustomerLimit: 1,
            usedCount: 14,
            expiryDate: new Date('2026-12-31'),
            isActive: true,
          },
        ],
      },
    },
  });

  // 8. Bookings (Appointments and Reservations)
  console.log('Seeding Bookings...');
  await prisma.booking.create({
    data: {
      referenceNumber: 'APT-2026-1049',
      bookingType: BookingType.appointment,
      status: BookingStatus.Confirmed,
      customerName: 'Aarav Mehta',
      customerPhone: '9820123456',
      customerEmail: 'aarav.mehta@gmail.com',
      appointmentPurpose: 'Comprehensive Eye Exam',
      appointmentDate: '2026-11-02',
      timeSlot: '11:00 AM - 11:45 AM',
      assignedOptometrist: 'Dr. Neha Kulkarni, M.Optom',
      notes: 'Customer reports occasional eye strain while working on dual 4K monitors.',
      timeline: [
        { status: 'Pending', timestamp: new Date('2026-10-24T09:00:00Z').toISOString(), actor: 'Online Customer' },
        { status: 'Confirmed', timestamp: new Date('2026-10-24T09:15:00Z').toISOString(), actor: 'Store Manager' },
      ],
    },
  });

  const firstVariant = await prisma.productVariant.findFirst();
  if (firstVariant) {
    await prisma.booking.create({
      data: {
        referenceNumber: 'RES-2026-8841',
        bookingType: BookingType.reservation,
        status: BookingStatus.Ready_for_pickup,
        customerName: 'Pooja Sharma',
        customerPhone: '9819876543',
        customerEmail: 'pooja.sharma@yahoo.co.in',
        pickupWindowStart: new Date('2026-10-24T10:00:00Z'),
        pickupWindowEnd: new Date('2026-10-27T20:00:00Z'),
        notes: 'Hold for styling consultation and trial.',
        reservedItems: [
          {
            variantId: firstVariant.id,
            variantSku: firstVariant.variantSku,
            productName: 'AeroLight Titanium Round',
            quantity: 1,
            unitPrice: Number(firstVariant.sellingPrice),
          },
        ],
        timeline: [
          { status: 'Pending', timestamp: new Date('2026-10-23T14:00:00Z').toISOString(), actor: 'Online Storefront' },
          { status: 'Confirmed', timestamp: new Date('2026-10-23T14:10:00Z').toISOString(), actor: 'System' },
          { status: 'Ready for pickup', timestamp: new Date('2026-10-24T08:30:00Z').toISOString(), actor: 'Aman Patel (Cashier)' },
        ],
      },
    });
  }

  // 9. Initial Audit Log
  console.log('Seeding Audit Log...');
  await prisma.auditLog.create({
    data: {
      actorName: 'System Bootstrap',
      actorRole: 'Owner/Admin',
      action: 'CREATE',
      entity: 'Settings',
      summary: 'System initialized and seeded with baseline catalog, users, settings and pricing.',
    },
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
