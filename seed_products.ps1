$products = @(
    # --- ELECTRONICS (1-10) ---
    @{
        name = "Apple iPhone 15 (128 GB, Black)"
        description = "Dynamic Island, 48MP main camera with 2x Telephoto, durable color-infused glass and aluminum design."
        price = 69900
        category = "Electronics"
        stock = 25
        imageUrl = "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80"
    },
    @{
        name = "OnePlus 12 5G (Flowy Emerald, 16GB RAM, 512GB)"
        description = "Snapdragon 8 Gen 3, 2K 120Hz ProXDR display, 4th Gen Hasselblad camera with 100W SuperVOOC charging."
        price = 64999
        category = "Electronics"
        stock = 18
        imageUrl = "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80"
    },
    @{
        name = "Samsung Galaxy S24 Ultra (Titanium Gray, 256GB)"
        description = "Built-in S Pen, Galaxy AI features, 200MP camera, Snapdragon 8 Gen 3 with titanium frame."
        price = 129999
        category = "Electronics"
        stock = 12
        imageUrl = "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&q=80"
    },
    @{
        name = "Sony WH-1000XM5 Wireless Noise Cancelling Headphones"
        description = "Industry-leading active noise cancellation, 30 hours battery life, 8 mics, ultra-comfortable lightweight design."
        price = 29990
        category = "Electronics"
        stock = 30
        imageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80"
    },
    @{
        name = "Apple MacBook Air M3 (13.6-inch, 8GB, 256GB SSD, Midnight)"
        description = "Liquid Retina display, MagSafe 3 charging, 18 hours battery life, thin and lightweight unibody aluminum."
        price = 104900
        category = "Electronics"
        stock = 15
        imageUrl = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80"
    },
    @{
        name = "boAt Rockerz 550 Over-Ear Wireless Headphones"
        description = "50mm dynamic drivers, 20 hours playback, physical noise isolation, plush ear cushions with bold bass."
        price = 1999
        category = "Electronics"
        stock = 80
        imageUrl = "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80"
    },
    @{
        name = "Noise ColorFit Pulse 3 Smart Watch with 1.96`" Display"
        description = "Bluetooth calling, 550 nits brightness, 100+ sports modes, heart rate and SpO2 health tracking."
        price = 1499
        category = "Electronics"
        stock = 65
        imageUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"
    },
    @{
        name = "Zebronics Juke Bar 9500 Pro Dolby 5.1 Soundbar (525W)"
        description = "Dolby Audio, wireless rear satellite speakers, deep bass subwoofer, optical, HDMI ARC & Bluetooth connectivity."
        price = 11999
        category = "Electronics"
        stock = 22
        imageUrl = "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&q=80"
    },
    @{
        name = "Logitech MX Master 3S Wireless Performance Mouse"
        description = "Quiet clicks, 8K DPI any-surface tracking, MagSpeed electromagnetic scrolling, ergonomic silhouette."
        price = 8995
        category = "Electronics"
        stock = 40
        imageUrl = "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80"
    },
    @{
        name = "Custom Artisan Mechanical Keyboard (Hot-swappable RGB)"
        description = "Gasket mount design, pre-lubed switches, sound-dampening foam, custom PBT keycaps with detachable USB-C."
        price = 4499
        category = "Electronics"
        stock = 35
        imageUrl = "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80"
    },

    # --- FASHION (11-20) ---
    @{
        name = "FabIndia Pure Cotton Lucknowi Chikankari Kurta"
        description = "Handcrafted traditional embroidery, comfortable regular fit, premium breathable cotton, Mandarin collar."
        price = 2499
        category = "Fashion"
        stock = 45
        imageUrl = "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80"
    },
    @{
        name = "Levi's Men's 511 Slim Fit Mid-Rise Denim Jeans"
        description = "Classic authentic stretch denim, slim from hip to ankle, durable 5-pocket styling with zip fly."
        price = 2899
        category = "Fashion"
        stock = 50
        imageUrl = "https://images.unsplash.com/photo-1542272604-780c96856592?w=600&q=80"
    },
    @{
        name = "Peter England Royal Navy Formal Cotton Shirt"
        description = "100% premium combed cotton, semi-cutaway collar, wrinkle-resistant finish ideal for business executives."
        price = 1299
        category = "Fashion"
        stock = 60
        imageUrl = "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80"
    },
    @{
        name = "Ray-Ban Classic Polarized Aviator Sunglasses"
        description = "Timeless gold metal frame with crystal green polarized lenses offering 100% UV protection."
        price = 8590
        category = "Fashion"
        stock = 28
        imageUrl = "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80"
    },
    @{
        name = "Titan Neo Analog Black Dial Men's Watch"
        description = "Stainless steel band with mineral glass, water resistance up to 50m, quartz movement with date display."
        price = 3995
        category = "Fashion"
        stock = 40
        imageUrl = "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&q=80"
    },
    @{
        name = "Biba Women's Floral Anarkali Kurta & Dupatta Set"
        description = "Flared hemline, printed art silk fabric with intricate zari border and matching chiffon dupatta."
        price = 3499
        category = "Fashion"
        stock = 32
        imageUrl = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80"
    },
    @{
        name = "Woodland Camel Leather Heavy-Duty Trekking Boots"
        description = "Nubuck leather upper, rugged grooved rubber lug sole, shock absorption and ankle support for tough terrains."
        price = 4295
        category = "Fashion"
        stock = 25
        imageUrl = "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600&q=80"
    },
    @{
        name = "Puma Smash V2 Unisex Low-Top Suede Sneakers"
        description = "Soft suede leather upper, cushioned SoftFoam+ sockliner, clean vulcanized rubber outsole."
        price = 2749
        category = "Fashion"
        stock = 55
        imageUrl = "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80"
    },
    @{
        name = "Lavie Women's Betula Faux Leather Structured Tote Bag"
        description = "Spacious multi-compartment interior, twin top carry handles, durable water-resistant synthetic leather."
        price = 1699
        category = "Fashion"
        stock = 38
        imageUrl = "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80"
    },
    @{
        name = "Wildcraft 45L Trailblazer Water Resistant Rucksack"
        description = "Ergonomic back support, multi-pocket trekking backpack with rain cover and hiking pole attachment loops."
        price = 2199
        category = "Fashion"
        stock = 45
        imageUrl = "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80"
    },

    # --- HOME & KITCHEN (21-28) ---
    @{
        name = "Philips Digital Air Fryer with Rapid Air Tech (4.1L)"
        description = "Fry with up to 90% less fat, digital touch screen with 7 presets, keep-warm function and quick-clean basket."
        price = 6999
        category = "Home"
        stock = 30
        imageUrl = "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80"
    },
    @{
        name = "Prestige Iris 750 Watt Mixer Grinder with 4 Jars"
        description = "Heavy duty 750W motor, 3 stainless steel multipurpose jars and 1 transparent juicer jar with safety lock."
        price = 3299
        category = "Home"
        stock = 40
        imageUrl = "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&q=80"
    },
    @{
        name = "Milton Thermosteel Flip Lid Insulated Flask (1000ml)"
        description = "24-hour hot & cold retention, 100% rust-proof 304 grade stainless steel with easy-carry fabric pouch."
        price = 1095
        category = "Home"
        stock = 75
        imageUrl = "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80"
    },
    @{
        name = "Bombay Dyeing 100% Cotton King Bedsheet (300 TC)"
        description = "Silky satin weave, breathable pure combed cotton with 2 matching pillow covers, fade-resistant reactive print."
        price = 1899
        category = "Home"
        stock = 50
        imageUrl = "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80"
    },
    @{
        name = "Wipro Garnet 20W Smart LED Batten (RGB + Tunable White)"
        description = "WiFi enabled smart light compatible with Alexa & Google Assistant, music sync, 16 million color options."
        price = 899
        category = "Home"
        stock = 60
        imageUrl = "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80"
    },
    @{
        name = "Hawkins Futura Hard Anodized Deep Fry Pan (2.5L)"
        description = "Extra-thick 3.25mm black hard anodized body, heats evenly, stays looking new for years, wooden handle."
        price = 1650
        category = "Home"
        stock = 35
        imageUrl = "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&q=80"
    },
    @{
        name = "D'Decor Luxe Blackout Window Curtains (Pack of 2)"
        description = "Room darkening thermal insulated fabric, elegant textured jacquard drape with stainless steel eyelets."
        price = 1499
        category = "Home"
        stock = 45
        imageUrl = "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80"
    },
    @{
        name = "Pigeon by Stovekraft Induction Cooktop (1800W)"
        description = "Push button controls with 7 Indian cooking presets, auto shut-off safety sensor, durable crystal glass plate."
        price = 1799
        category = "Home"
        stock = 50
        imageUrl = "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&q=80"
    },

    # --- BEAUTY & PERSONAL CARE (29-36) ---
    @{
        name = "Minimalist 10% Vitamin C Face Serum for Glowing Skin"
        description = "Formulated with pure ethyl ascorbic acid & centella water for dark spot reduction and photoprotection."
        price = 699
        category = "Beauty"
        stock = 65
        imageUrl = "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80"
    },
    @{
        name = "Mamaearth Onion Hair Oil with Redensyl for Hair Fall"
        description = "Rich in sulfur, potassium, and antioxidants to reduce hair loss and accelerate natural hair regrowth."
        price = 599
        category = "Beauty"
        stock = 85
        imageUrl = "https://images.unsplash.com/photo-1608248597359-0a6713912781?w=600&q=80"
    },
    @{
        name = "Forest Essentials Luxury Sugar Soap (Sandalwood & Turmeric)"
        description = "Ayurvedic cold-pressed natural soap infused with raw cane sugar, pure sandalwood oil, and organic ghee."
        price = 795
        category = "Beauty"
        stock = 40
        imageUrl = "https://images.unsplash.com/photo-1607006314640-5e87a556d33a?w=600&q=80"
    },
    @{
        name = "Bombay Shaving Company 6-in-1 Precision Grooming Kit"
        description = "Beard wash, growth oil, butter, beard comb, precision styling shears and organic aloe vera face cream."
        price = 1499
        category = "Beauty"
        stock = 48
        imageUrl = "https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&q=80"
    },
    @{
        name = "Plum Green Tea Alcohol-Free Face Toner (200ml)"
        description = "Tightens enlarged pores, enriched with green tea extracts and glycolic acid for clear acne-free skin."
        price = 395
        category = "Beauty"
        stock = 70
        imageUrl = "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80"
    },
    @{
        name = "The Derma Co 1% Hyaluronic Sunscreen Aqua Gel SPF 50"
        description = "Broad spectrum UVA/UVB blue light protection, non-greasy fragrance-free formula with zero white cast."
        price = 499
        category = "Beauty"
        stock = 90
        imageUrl = "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&q=80"
    },
    @{
        name = "Kama Ayurveda Pure Rose Water Face Mist (200ml)"
        description = "Steam-distilled from high-altitude Kannauj roses, acts as a gentle natural toner and skin revitalizer."
        price = 1450
        category = "Beauty"
        stock = 35
        imageUrl = "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=600&q=80"
    },
    @{
        name = "Philips Multi-Groomer All-In-One Trimmer Series 3000"
        description = "DualCut self-sharpening blades, 9 precision grooming attachments for beard, hair, and body trimming."
        price = 1899
        category = "Beauty"
        stock = 55
        imageUrl = "https://images.unsplash.com/photo-1621607512022-6aecc4fed814?w=600&q=80"
    },

    # --- SPORTS & FITNESS (37-44) ---
    @{
        name = "MuscleBlaze Biozyme Performance Whey (1kg, Chocolate)"
        description = "Enhanced Absorption Formula (EAF) clinically tested to deliver 50% higher protein absorption, 25g protein/scoop."
        price = 2499
        category = "Sports"
        stock = 60
        imageUrl = "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&q=80"
    },
    @{
        name = "Yonex Nanoray Light 18i Graphite Badminton Racket"
        description = "Ultra-lightweight 77g isometric frame, high-tension string support up to 30 lbs, ideal for fast counter-attacks."
        price = 2190
        category = "Sports"
        stock = 45
        imageUrl = "https://images.unsplash.com/photo-1613918108466-292b78a8ef95?w=600&q=80"
    },
    @{
        name = "Boldfit Anti-Skid 6mm Premium Yoga Mat with Strap"
        description = "Eco-friendly non-slip TPE material with alignment marks, high-density joint cushioning for home workouts."
        price = 899
        category = "Sports"
        stock = 80
        imageUrl = "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&q=80"
    },
    @{
        name = "Nivia Storm Rubber Molded Football (Official Size 5)"
        description = "All-weather durable rubber construction, aerodynamic 32-panel design suitable for rough ground surfaces."
        price = 549
        category = "Sports"
        stock = 95
        imageUrl = "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&q=80"
    },
    @{
        name = "Cosco 28-inch Lightweight Pro Tennis Racket with Cover"
        description = "Aluminum-titanium alloy composite frame, large sweet spot, vibration dampener grip for power returns."
        price = 1250
        category = "Sports"
        stock = 40
        imageUrl = "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&q=80"
    },
    @{
        name = "Vector X Heavy Resistance Loop Exercise Bands (Set of 5)"
        description = "100% natural latex bands offering 5 varied resistance tension levels from extra-light to extra-heavy."
        price = 499
        category = "Sports"
        stock = 110
        imageUrl = "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&q=80"
    },
    @{
        name = "Kobo Cast Iron Hex Dumbbell Pair (5kg x 2)"
        description = "Solid cast iron construction with anti-roll hexagonal rubber coated heads and knurled chrome grip handles."
        price = 1899
        category = "Sports"
        stock = 30
        imageUrl = "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80"
    },
    @{
        name = "Strauss Adjustable Hand Grip Strengthener (10kg - 40kg)"
        description = "Heavy-duty stainless steel spring, non-slip ergonomic rubber handles to build forearm and finger power."
        price = 299
        category = "Sports"
        stock = 120
        imageUrl = "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80"
    },

    # --- BOOKS & STATIONERY (45-50) ---
    @{
        name = "Atomic Habits by James Clear (Paperback Best-Seller)"
        description = "An easy and proven way to build good habits and break bad ones. Millions of copies sold worldwide."
        price = 540
        category = "Books"
        stock = 85
        imageUrl = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80"
    },
    @{
        name = "The Psychology of Money by Morgan Housel"
        description = "Timeless lessons on wealth, greed, and happiness. How to make better financial decisions in life."
        price = 399
        category = "Books"
        stock = 90
        imageUrl = "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=600&q=80"
    },
    @{
        name = "Ikigai: The Japanese Secret to a Long and Happy Life"
        description = "International best-seller exploring the longevity secrets of Okinawa's centenarians and life purpose."
        price = 420
        category = "Books"
        stock = 70
        imageUrl = "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80"
    },
    @{
        name = "Classmate Pulse Spiral Notebooks (Pack of 6, 300 Pages)"
        description = "Single line ruled, elemental chlorine-free paper with durable polypropylene waterproof covers."
        price = 450
        category = "Books"
        stock = 100
        imageUrl = "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&q=80"
    },
    @{
        name = "Parker Vector Standard CT Roller Ball Pen (Gift Box)"
        description = "Glossy resin barrel with stainless steel chrome trim, ultra-smooth Quink rollerball black ink flow."
        price = 375
        category = "Books"
        stock = 65
        imageUrl = "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&q=80"
    },
    @{
        name = "Rich Dad Poor Dad by Robert T. Kiyosaki"
        description = "What the rich teach their kids about money that the poor and middle class do not! 25th Anniversary Edition."
        price = 399
        category = "Books"
        stock = 80
        imageUrl = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&q=80"
    }
)

$targetUri = "http://localhost:8082/api/products"
try {
    # Check if direct product-service or gateway is available
    $test = Invoke-WebRequest -Uri "http://localhost:8082/api/products" -Method Get -TimeoutSec 2 -ErrorAction Stop
} catch {
    $targetUri = "http://localhost:8085/api/products"
}

Write-Output "Seeding $($products.Count) authentic marketplace products via $targetUri..."
$count = 0
foreach ($p in $products) {
    $body = $p | ConvertTo-Json
    try {
        Invoke-RestMethod -Uri $targetUri -Method Post -Body $body -ContentType "application/json" | Out-Null
        $count++
    } catch {
        Write-Warning "Failed to seed $($p.name): $($_.Exception.Message)"
    }
}

Write-Output "Successfully seeded $count products into MongoDB!"
