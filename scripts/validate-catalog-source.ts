async function checkPhoto(id: string): Promise<boolean> {
  const url = `https://images.unsplash.com/${id}?w=400&auto=format&fit=crop&q=60`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.status === 200 || res.status === 304;
  } catch {
    return false;
  }
}

export const allProductDefinitions = [
  // ================= SAREES (25 Individually Handcrafted Saree Products) =================
  {
    name: 'Varanasi Royal Banarasi Katan Silk Saree',
    category: 'Sarees',
    subcategory: 'Banarasi',
    brand: 'Varanasi Heritage',
    photoId: 'photo-1610030469983-98e550d6193c', // Red & Gold Zari Pure Banarasi
  },
  {
    name: 'Kanchipuram Pure Mulberry Silk Saree with Temple Border',
    category: 'Sarees',
    subcategory: 'Kanjivaram',
    brand: 'Kanchi Weaves',
    photoId: 'photo-1617627143750-d86bc21e42bb', // South Indian Kanchipuram Drape
  },
  {
    name: 'Floral Pastel Sheer Organza Designer Saree',
    category: 'Sarees',
    subcategory: 'Organza',
    brand: 'Sheer Elegance',
    photoId: 'photo-1614613535308-eb5fbd3d2c17', // Pastel organza sheer floral saree
  },
  {
    name: 'Ombre Dyed Festive Chiffon Saree with Gota Patti',
    category: 'Sarees',
    subcategory: 'Chiffon',
    brand: 'Rangriti Sarees',
    photoId: 'photo-1609357605129-26f69add5d6e', // Festive chiffon drape
  },
  {
    name: 'Midnight Navy Georgette Saree with Sequins Embroidery',
    category: 'Sarees',
    subcategory: 'Georgette',
    brand: 'Zari Sparkle',
    photoId: 'photo-1605296867304-46d5465a13f1', // Rich georgette drape
  },
  {
    name: 'Handloom Pure Linen Saree with Jamdani Zari Pallu',
    category: 'Sarees',
    subcategory: 'Handloom Cotton & Linen',
    brand: 'Bunkar Guild',
    photoId: 'photo-1604014237800-1c9102c219da', // Handloom linen texture saree
  },
  {
    name: 'Traditional Jaipuri Bandhani Silk Saree in Crimson Pink',
    category: 'Sarees',
    subcategory: 'Bandhani',
    brand: 'Rajputana Weaves',
    photoId: 'photo-1615886753866-79396abc446e', // Bandhani dye silk drape
  },
  {
    name: 'Maharashtra Paithani Pure Silk Saree with Peacock Zari',
    category: 'Sarees',
    subcategory: 'Paithani',
    brand: 'Yeola Handlooms',
    photoId: 'photo-1621600411688-4be93cd68504', // Paithani rich silk weave
  },
  {
    name: 'Chanderi Cotton Silk Pastel Saree with Gold Border',
    category: 'Sarees',
    subcategory: 'Chanderi',
    brand: 'Chanderi Craft',
    photoId: 'photo-1608748010899-18f300247112', // Chanderi light silk saree
  },
  {
    name: 'Handblock Printed Bagru Mulmul Cotton Saree',
    category: 'Sarees',
    subcategory: 'Handloom Cotton & Linen',
    brand: 'Bagru Artisans',
    photoId: 'photo-1594633312681-425c7b97ccd1', // Handblock cotton saree
  },
  {
    name: 'Wild Tussar Silk Saree with Kantha Stitch Embroidery',
    category: 'Sarees',
    subcategory: 'Tussar & Raw Silk',
    brand: 'Tribal Handcrafts',
    photoId: 'photo-1566174053879-31528523f8ae', // Tussar silk drape
  },
  {
    name: 'Artisan Handpainted Kalamkari Cotton Saree',
    category: 'Sarees',
    subcategory: 'Handloom Cotton & Linen',
    brand: 'Kalamkari Heritage',
    photoId: 'photo-1565193566173-7a0ee3dbe261', // Handpainted Kalamkari drape
  },
  {
    name: 'Kerala Kasavu Gold Zari Handloom Cotton Saree',
    category: 'Sarees',
    subcategory: 'Handloom Cotton & Linen',
    brand: 'Balaramapuram Weaves',
    photoId: 'photo-1611042553365-9b101441c135', // Kasavu Kerala festive drape
  },
  {
    name: 'Pure Mysore Crepe Silk Saree with Antique Gold Border',
    category: 'Sarees',
    subcategory: 'Mysore Silk',
    brand: 'Mysore Silk Guild',
    photoId: 'photo-1574634534894-89d7576c8259', // Mysore crepe silk
  },
  {
    name: 'Lucknowi Chikankari Hand Embroidered Georgette Saree',
    category: 'Sarees',
    subcategory: 'Georgette',
    brand: 'Awadh Artisans',
    photoId: 'photo-1583209814683-c023dd293cc6', // Chikankari embroidered drape
  },
  {
    name: 'Double Ikat Sambalpuri Handwoven Silk Saree',
    category: 'Sarees',
    subcategory: 'Handloom Cotton & Linen',
    brand: 'Odisha Weaves',
    photoId: 'photo-1518709268805-4e9042af9f23', // Handwoven ikat drape
  },
  {
    name: 'Rajasthani Kota Doria Zari Border Lightweight Saree',
    category: 'Sarees',
    subcategory: 'Handloom Cotton & Linen',
    brand: 'Kota Looms',
    photoId: 'photo-1534528741775-53994a69daeb', // Kota doria sheer weave
  },
  {
    name: 'Pre-Stitched Ready-to-Wear Pleated Lycra Saree',
    category: 'Sarees',
    subcategory: 'Designer Drape',
    brand: 'Zylo Glamour',
    photoId: 'photo-1544005313-94ddf0286df2', // Ready-to-wear modern drape
  },
  {
    name: 'Bridal Kanjivaram Brocade Silk Saree with Heavy Pallu',
    category: 'Sarees',
    subcategory: 'Kanjivaram',
    brand: 'Kanchi Royal',
    photoId: 'photo-1524504388940-b1c1722653e1', // Heavy bridal drape
  },
  {
    name: 'Tissue Metallic Silk Party Saree in Rose Gold',
    category: 'Sarees',
    subcategory: 'Party Wear',
    brand: 'Luxe Drape',
    photoId: 'photo-1494790108377-be9c29b29330', // Metallic party drape
  },

  // ================= WOMEN'S FASHION (15 Unique Items) =================
  {
    name: 'Chikankari Hand Embroidered Pure Cotton Anarkali Kurta',
    category: 'Women',
    subcategory: 'Kurtas & Suits',
    brand: 'Awadh Weaves',
    photoId: 'photo-1515886657613-9f3515b0c78f', // Elegant kurta outfit
  },
  {
    name: 'Floral Print Tiered Cotton A-Line Midi Dress',
    category: 'Women',
    subcategory: 'Dresses',
    brand: 'Aura Lifestyle',
    photoId: 'photo-1572804013309-59a88b7e92f1', // Floral dress
  },
  {
    name: 'High-Rise Vintage Wide-Leg Denim Jeans',
    category: 'Women',
    subcategory: 'Jeans & Trousers',
    brand: 'Denim Co.',
    photoId: 'photo-1541099649105-f69ad21f3246', // Denim jeans
  },
  {
    name: 'Oversized Cable-Knit Wool Blend Pullover Sweater',
    category: 'Women',
    subcategory: 'Sweaters & Cardigans',
    brand: 'Nordic Knit',
    photoId: 'photo-1576871337622-98d48d1cf531', // Knitted sweater
  },
  {
    name: 'Tailored Single-Breasted Linen Blazer Jacket',
    category: 'Women',
    subcategory: 'Blazers & Jackets',
    brand: 'Urban Mode',
    photoId: 'photo-1584273143981-41c073dfe8f8', // Tailored blazer
  },
  {
    name: 'Silk Satin Cowl-Neck Slip Midi Party Dress',
    category: 'Women',
    subcategory: 'Dresses',
    brand: 'Glamour Silk',
    photoId: 'photo-1595777457583-95e059d581b8', // Satin slip dress
  },
  {
    name: 'French Terry Relaxed Cropped Pullover Hoodie',
    category: 'Women',
    subcategory: 'Tops & Tees',
    brand: 'Zylo Athleisure',
    photoId: 'photo-1556905055-8f358a7a47b2', // Hoodie
  },
  {
    name: 'Bohemian Tiered Linen Floral Maxi Sundress',
    category: 'Women',
    subcategory: 'Dresses',
    brand: 'Boho Spirit',
    photoId: 'photo-1496747611176-843222e1e57c', // Sundress
  },
  {
    name: 'High-Waisted Straight Cut Linen Blend Trousers',
    category: 'Women',
    subcategory: 'Jeans & Trousers',
    brand: 'Studio 21',
    photoId: 'photo-1509631179647-0177331693ae', // Trousers
  },
  {
    name: 'Ribbed Knit High-Neck Longline Fitted Top',
    category: 'Women',
    subcategory: 'Tops & Tees',
    brand: 'Aura Basics',
    photoId: 'photo-1503342217505-b0a15ec3261c', // Ribbed top
  },
  {
    name: 'Relaxed Fit Lightweight Chambray Denim Shirt',
    category: 'Women',
    subcategory: 'Shirts',
    brand: 'Denim Atelier',
    photoId: 'photo-1598554747436-c9293d6a588f', // Denim shirt
  },
  {
    name: 'Pleated High-Waist Formal Midi Skirt with Belt',
    category: 'Women',
    subcategory: 'Skirts',
    brand: 'Vogue Lines',
    photoId: 'photo-1583496661160-fb5886a0aaaa', // Skirt
  },
  {
    name: 'Bohemian Open-Front Kimono Cardigan Wrap',
    category: 'Women',
    subcategory: 'Sweaters & Cardigans',
    brand: 'Boho Chic',
    photoId: 'photo-1434389677669-e08b4cac3105', // Cardigan
  },
  {
    name: 'Classic Crisp White 100% Cotton Button-Down Shirt',
    category: 'Women',
    subcategory: 'Shirts',
    brand: 'Monochrome Luxe',
    photoId: 'photo-1598033129183-c4f50c736f10', // Crisp shirt
  },

  // ================= MEN'S FASHION (14 Unique Items) =================
  {
    name: '100% Organic Oxford Cotton Button-Down Dress Shirt',
    category: 'Men',
    subcategory: 'Shirts',
    brand: 'Oxford Classic',
    photoId: 'photo-1602810318383-e386cc2a3ccf', // Oxford dress shirt
  },
  {
    name: 'Vintage Washed Heavyweight Denim Trucker Jacket',
    category: 'Men',
    subcategory: 'Jackets & Coats',
    brand: 'Rough & Tough',
    photoId: 'photo-1576995853123-5a10305d93c0', // Denim jacket
  },
  {
    name: 'Slim-Fit Stretch Cotton Chino Trousers',
    category: 'Men',
    subcategory: 'Trousers & Chinos',
    brand: 'Urban Gentleman',
    photoId: 'photo-1473966968600-fa801b869a1a', // Chino pants
  },
  {
    name: 'Heavyweight 240 GSM Premium Graphic Cotton T-Shirt',
    category: 'Men',
    subcategory: 'T-Shirts',
    brand: 'Street Craft',
    photoId: 'photo-1521572267360-ee0c2909d518', // Graphic tee
  },
  {
    name: 'Tailored Slim Fit Italian Wool Blend Blazer',
    category: 'Men',
    subcategory: 'Suits & Blazers',
    brand: 'Milan Sartorial',
    photoId: 'photo-1507679799987-c73779587ccf', // Mens blazer
  },
  {
    name: 'Merino Wool Crewneck Cable Knit Winter Sweater',
    category: 'Men',
    subcategory: 'Sweaters',
    brand: 'Highland Knits',
    photoId: 'photo-1614975058789-41316d0e2e9c', // Mens sweater
  },
  {
    name: 'Water-Resistant Breathable Outdoor Windbreaker Jacket',
    category: 'Men',
    subcategory: 'Jackets & Coats',
    brand: 'Summit Ridge',
    photoId: 'photo-1544441893-675973e31985', // Windbreaker
  },
  {
    name: 'Relaxed Pure Linen Resort Cuban Collar Shirt',
    category: 'Men',
    subcategory: 'Shirts',
    brand: 'Riviera Linen',
    photoId: 'photo-1596755094514-f87e34085b2c', // Linen shirt
  },
  {
    name: 'Quick-Dry Breathable Athletic Running Track Pants',
    category: 'Men',
    subcategory: 'Activewear',
    brand: 'Veloce Pro',
    photoId: 'photo-1552902865-b72c031ac5ea', // Track pants
  },
  {
    name: 'Brushed Cotton Heavy Buffalo Plaid Flannel Shirt',
    category: 'Men',
    subcategory: 'Shirts',
    brand: 'Timberland Spirit',
    photoId: 'photo-1603252109303-2751441dd157', // Flannel
  },
  {
    name: 'Classic Pique Cotton Ribbed Collar Polo T-Shirt',
    category: 'Men',
    subcategory: 'Polos',
    brand: 'Heritage Club',
    photoId: 'photo-1586363104862-3a5e2ab60d99', // Mens polo
  },

  // ================= KIDS & BABY (10 Unique Items) =================
  {
    name: 'Girls Pastel Floral Tulle Embroidered Princess Party Frock',
    category: 'Kids',
    subcategory: 'Girls Clothing',
    brand: 'Little Blossoms',
    photoId: 'photo-1622290291468-a28f7a7dc6a8', // Girls dress
  },
  {
    name: 'Boys Tailored 3-Piece Formal Waistcoat Suit Set',
    category: 'Kids',
    subcategory: 'Boys Clothing',
    brand: 'Gentleman Jr.',
    photoId: 'photo-1518831959646-742c3a14ebf7', // Boys suit
  },
  {
    name: '100% Organic Cotton Soft Baby Snap Romper 3-Pack',
    category: 'Kids',
    subcategory: 'Baby Wear',
    brand: 'Pure Nest Baby',
    photoId: 'photo-1522771930-78848d9293e8', // Baby romper
  },
  {
    name: 'Kids Classic Adjustable Denim Dungarees Overalls',
    category: 'Kids',
    subcategory: 'Unisex Kids',
    brand: 'Mini Jeans',
    photoId: 'photo-1519238263530-99bdd11df2ea', // Overalls
  },
  {
    name: 'Toddler Fleece Dinosaur Print Cozy Pullover Sweatshirt',
    category: 'Kids',
    subcategory: 'Boys Clothing',
    brand: 'Dino World',
    photoId: 'photo-1503454537195-1dcabb73ffb9', // Toddler sweatshirt
  },
  {
    name: 'Boys Crisp Woven Plaid Cotton Shirt with Bowtie',
    category: 'Kids',
    subcategory: 'Boys Clothing',
    brand: 'Oxford Jr.',
    photoId: 'photo-1508807526345-15e9b5f4eaff', // Plaid shirt
  },
  {
    name: 'Plush Microfiber Animal Ears Hooded Kids Bathrobe',
    category: 'Kids',
    subcategory: 'Baby Wear',
    brand: 'Snuggle Time',
    photoId: 'photo-1515488042361-ee00e0ddd4e4', // Kids plush
  },
  {
    name: 'Kids Waterproof Puffer Insulated Winter Parka Jacket',
    category: 'Kids',
    subcategory: 'Winter Wear',
    brand: 'Arctic Kids',
    photoId: 'photo-1543332164-6e82f355badc', // Kids jacket
  },
  {
    name: 'Toddler Breathable Slip-On Canvas Walking Shoes',
    category: 'Kids',
    subcategory: 'Kids Footwear',
    brand: 'First Steps',
    photoId: 'photo-1514989940723-e8e51635b782', // Kids shoes
  },
  {
    name: 'Girls Tutu Layered Ruffle Birthday Party Dress',
    category: 'Kids',
    subcategory: 'Girls Clothing',
    brand: 'Sparkle Fairy',
    photoId: 'photo-1533512930330-4ac257c86793', // Girls dress
  },

  // ================= FOOTWEAR (10 Unique Items) =================
  {
    name: 'Pro Cushion Breathable Mesh Road Running Sneakers',
    category: 'Footwear',
    subcategory: 'Sneakers',
    brand: 'AeroPulse',
    photoId: 'photo-1542291026-7eec264c27ff', // Red running sneakers
  },
  {
    name: 'Handcrafted Full-Grain Leather Oxford Dress Brogues',
    category: 'Footwear',
    subcategory: 'Formal Shoes',
    brand: 'Royal Cobblers',
    photoId: 'photo-1614252235316-8c857d38b5f4', // Oxford brogues
  },
  {
    name: 'Hand Embroidered Punjabi Mojari Velvet Juttis',
    category: 'Footwear',
    subcategory: 'Ethnic Footwear',
    brand: 'Desi Royal',
    photoId: 'photo-1560343090-f0409e92791a', // Mojari juttis
  },
  {
    name: 'Pointed Toe Classic Stiletto Patent Leather High Heels',
    category: 'Footwear',
    subcategory: 'Heels',
    brand: 'Stiletto Muse',
    photoId: 'photo-1543163521-1bf539c55dd2', // High heels
  },
  {
    name: 'Memory Foam Cushioned Anti-Skid Slide Sandals',
    category: 'Footwear',
    subcategory: 'Sandals & Slides',
    brand: 'CloudWalk',
    photoId: 'photo-1603808033192-082d6919d3e1', // Slide sandals
  },
  {
    name: 'Rugged Waterproof Genuine Leather Chelsea Ankle Boots',
    category: 'Footwear',
    subcategory: 'Boots',
    brand: 'TimberPeak',
    photoId: 'photo-1520639888713-7851133b1ed0', // Leather boots
  },
  {
    name: 'Low-Top Vulcanized Skate Canvas Street Shoes',
    category: 'Footwear',
    subcategory: 'Casual Shoes',
    brand: 'Urban Tread',
    photoId: 'photo-1525966222134-fcfa99b8ae77', // Canvas shoes
  },
  {
    name: 'Ankle Strap Chunky Block Heel Evening Sandals',
    category: 'Footwear',
    subcategory: 'Heels',
    brand: 'Elegance Steps',
    photoId: 'photo-1535043934128-cf0b28d52f95', // Block sandals
  },
  {
    name: 'Lightweight Responsive HIIT & Cross-Training Gym Shoes',
    category: 'Footwear',
    subcategory: 'Sports Shoes',
    brand: 'FlexFit Athletics',
    photoId: 'photo-1608231387042-66d1773070a5', // Gym shoes
  },
  {
    name: 'Handmade Genuine Leather Kolhapuri Chappals',
    category: 'Footwear',
    subcategory: 'Ethnic Footwear',
    brand: 'Kolhapur Craft',
    photoId: 'photo-1562273138-f46be4ebdf33', // Kolhapuri chappals
  },

  // ================= BEAUTY & PERSONAL CARE (10 Unique Items) =================
  {
    name: 'Velvet Matte Long-Wear Ultra-Pigmented Red Lipstick',
    category: 'Beauty',
    subcategory: 'Makeup',
    brand: 'Luxe Cosmetics',
    photoId: 'photo-1586495777744-4413f21062fa', // Red lipstick
  },
  {
    name: 'Hyaluronic Acid & Bulgarian Rose Glow Face Serum Bottle',
    category: 'Beauty',
    subcategory: 'Skincare',
    brand: 'Botanica Lab',
    photoId: 'photo-1620916566398-39f1143ab7be', // Face serum bottle
  },
  {
    name: 'All-Day Luminous Breathable Liquid Foundation (30ml)',
    category: 'Beauty',
    subcategory: 'Makeup',
    brand: 'Flawless Base',
    photoId: 'photo-1522337360788-8b13dee7a37e', // Liquid foundation
  },
  {
    name: 'Broad Spectrum Matte Gel Sunscreen SPF 50 PA++++',
    category: 'Beauty',
    subcategory: 'Skincare',
    brand: 'Solar Shield',
    photoId: 'photo-1598440947619-2c35fc9aa908', // Sunscreen bottle
  },
  {
    name: 'Deep Hydrating 5-Ceramide Barrier Repair Moisturizer Cream',
    category: 'Beauty',
    subcategory: 'Skincare',
    brand: 'Derma Restore',
    photoId: 'photo-1556228720-195a672e8a03', // Cream jar
  },
  {
    name: 'Gentle Foaming Vitamin C Brightening Face Cleanser',
    category: 'Beauty',
    subcategory: 'Skincare',
    brand: 'Citrus Glow',
    photoId: 'photo-1571781926291-c477ebfd024b', // Face wash
  },
  {
    name: 'French Madagascar Vanilla & Warm Amber Eau de Parfum (100ml)',
    category: 'Beauty',
    subcategory: 'Fragrances',
    brand: 'Maison Luxe',
    photoId: 'photo-1592945403244-b3fbafd7f539', // Perfume bottle
  },
  {
    name: 'Volumizing & Lengthening Waterproof Silk Lash Mascara',
    category: 'Beauty',
    subcategory: 'Makeup',
    brand: 'Lash Sculpt',
    photoId: 'photo-1512496015851-a90fb38ba796', // Mascara/makeup
  },
  {
    name: 'Ayurvedic 21-Herb Cold Pressed Hair Growth Oil',
    category: 'Beauty',
    subcategory: 'Hair Care',
    brand: 'Veda Roots',
    photoId: 'photo-1608248597359-250937a07409', // Botanical bottle
  },
  {
    name: 'Deep Purifying Australian Tea Tree Clay Detox Face Mask',
    category: 'Beauty',
    subcategory: 'Skincare',
    brand: 'Earth Botanical',
    photoId: 'photo-1567928815116-f6d3ad3b1e36', // Clay mask jar
  },

  // ================= ELECTRONICS (10 Unique Items) =================
  {
    name: 'Ultra HD 1.43-Inch AMOLED Display Smart Watch with Bluetooth Calling',
    category: 'Electronics',
    subcategory: 'Wearables',
    brand: 'Titan Chrono',
    photoId: 'photo-1523275335684-37898b6baf30', // Smartwatch
  },
  {
    name: 'Active Noise Cancelling (ANC) True Wireless Bluetooth Earbuds',
    category: 'Electronics',
    subcategory: 'Audio',
    brand: 'SoundAura Pro',
    photoId: 'photo-1590658268037-6bf12165a8df', // Wireless earbuds
  },
  {
    name: '65W GaN Fast Dual USB-C Wall Charger Power Adapter',
    category: 'Electronics',
    subcategory: 'Accessories',
    brand: 'VoltCharge',
    photoId: 'photo-1583863788434-e58a36330cf0', // Charger adapter
  },
  {
    name: '20,000mAh Magnetic Wireless Fast Power Bank with LED Display',
    category: 'Electronics',
    subcategory: 'Accessories',
    brand: 'PowerMatrix',
    photoId: 'photo-1609592424317-06103632cf4b', // Power bank
  },
  {
    name: 'IPX7 Rugged Waterproof Portable Bluetooth Speaker with Bass Boost',
    category: 'Electronics',
    subcategory: 'Audio',
    brand: 'BoomPulse',
    photoId: 'photo-1608043152269-423dbba4e7e1', // Bluetooth speaker
  },
  {
    name: '7.1 Surround Sound Over-Ear RGB Gaming Headset with Mic',
    category: 'Electronics',
    subcategory: 'Gaming',
    brand: 'Apex Gaming',
    photoId: 'photo-1546435770-a3e426bf472b', // Gaming headset
  },
  {
    name: '15W Fast Qi-Certified Slim Aluminum Wireless Charging Pad',
    category: 'Electronics',
    subcategory: 'Accessories',
    brand: 'AeroCharge',
    photoId: 'photo-1622445262464-84b150704944', // Wireless charger
  },
  {
    name: '4K 60FPS Waterproof Ultra HD Action Camera with EIS Stabilizer',
    category: 'Electronics',
    subcategory: 'Cameras',
    brand: 'ProCam Extreme',
    photoId: 'photo-1526170375885-4d8ecf77b99f', // Action camera
  },
  {
    name: '8-in-1 High-Speed USB-C Aluminum Hub Adapter with 4K HDMI',
    category: 'Electronics',
    subcategory: 'Accessories',
    brand: 'PortMax',
    photoId: 'photo-1544716278-ca5e3f4abd8c', // USB Hub dock
  },
  {
    name: 'Smart App-Controlled Sync LED Ambient Desk Light Bar',
    category: 'Electronics',
    subcategory: 'Smart Home',
    brand: 'LumiGlow',
    photoId: 'photo-1550745165-9bc0b252726f', // LED light
  },

  // ================= HOME & LIVING (10 Unique Items) =================
  {
    name: '5.8L Digital Rapid Air Fryer with 8 One-Touch Cooking Presets',
    category: 'Home & Living',
    subcategory: 'Kitchen Appliances',
    brand: 'ChefCraft Pro',
    photoId: 'photo-1585659722983-3a675dabf23d', // Digital air fryer
  },
  {
    name: 'Pre-Seasoned Heavy Duty Cast Iron Skillet Cookware (10.25 Inch)',
    category: 'Home & Living',
    subcategory: 'Cookware',
    brand: 'Lodge Foundry',
    photoId: 'photo-1584990347449-74d1a3371f49', // Cast iron skillet
  },
  {
    name: '400 Thread Count 100% Egyptian Cotton Luxury Bedding Sheet Set',
    category: 'Home & Living',
    subcategory: 'Bedding',
    brand: 'Loom & Nest',
    photoId: 'photo-1616046229478-9901c5536a45', // Cotton bedding set
  },
  {
    name: 'Minimalist Scandinavian Nordic Wooden Bedside Desk Lamp',
    category: 'Home & Living',
    subcategory: 'Lighting & Decor',
    brand: 'Nordic Living',
    photoId: 'photo-1507473885765-e6ed057f782c', // Bedside lamp
  },
  {
    name: 'Ultrasonic Essential Oil Aroma Diffuser with 7 Mood Ambient Lights',
    category: 'Home & Living',
    subcategory: 'Home Fragrance',
    brand: 'Aura Mist',
    photoId: 'photo-1608571423902-eed4a5ad8108', // Aroma diffuser
  },
  {
    name: 'Airtight Borosilicate Glass Kitchen Food Storage Jars (6-Piece Set)',
    category: 'Home & Living',
    subcategory: 'Kitchen Storage',
    brand: 'EcoPantry',
    photoId: 'photo-1584992236310-6edddc08acff', // Glass jars
  },
  {
    name: '8-Piece High-Carbon Japanese Steel Chef Knife Block Set',
    category: 'Home & Living',
    subcategory: 'Cutlery',
    brand: 'Katana Cutlery',
    photoId: 'photo-1593618998160-e34014e67546', // Chef knives
  },
  {
    name: 'Precision Temperature-Control Stainless Steel Gooseneck Electric Kettle',
    category: 'Home & Living',
    subcategory: 'Kitchen Appliances',
    brand: 'Barista Craft',
    photoId: 'photo-1556911220-e15b29be8c8f', // Gooseneck kettle
  },
  {
    name: 'Handwoven Natural Bohemian Jute Area Rug (4x6 ft)',
    category: 'Home & Living',
    subcategory: 'Home Decor',
    brand: 'Earth Weaves',
    photoId: 'photo-1600121848594-d8644e57abab', // Jute rug
  },
  {
    name: '15-Bar High-Pressure Professional Espresso & Cappuccino Machine',
    category: 'Home & Living',
    subcategory: 'Coffee Machines',
    brand: 'Espresso Artisans',
    photoId: 'photo-1517668808822-9ebb02f2a0e6', // Espresso machine
  },

  // ================= TOYS & GAMES (8 Unique Items) =================
  {
    name: '1:14 Scale High-Speed 4WD RC Monster Truck Off-Road Buggy',
    category: 'Toys & Games',
    subcategory: 'Remote Control Toys',
    brand: 'TurboTork',
    photoId: 'photo-1594787318286-3d835c1d207f', // RC toy car
  },
  {
    name: '12-in-1 Solar Powered DIY STEM Educational Robotics Kit',
    category: 'Toys & Games',
    subcategory: 'STEM Toys',
    brand: 'RoboMind',
    photoId: 'photo-1485827404703-89b55fcc595e', // STEM robot
  },
  {
    name: 'Deluxe Handcrafted 3-Story Wooden Miniature Dollhouse with Furniture',
    category: 'Toys & Games',
    subcategory: 'Dolls & Playsets',
    brand: 'WonderPlay',
    photoId: 'photo-1558060370-d644479cb6f7', // Wooden dollhouse
  },
  {
    name: '1000-Piece Panoramic Alpine Forest Landscape Jigsaw Puzzle',
    category: 'Toys & Games',
    subcategory: 'Puzzles',
    brand: 'PuzzleCraft',
    photoId: 'photo-1587654780291-39c9404d746b', // Jigsaw puzzle
  },
  {
    name: '100-Piece 3D Magnetic Geometric Construction Building Tiles',
    category: 'Toys & Games',
    subcategory: 'Building Blocks',
    brand: 'MagnaBuilder',
    photoId: 'photo-1596461404969-9ae70f2830c1', // Magnetic building tiles
  },
  {
    name: 'Hand-Carved Staunton Tournament Wooden Chess Set with Storage Box',
    category: 'Toys & Games',
    subcategory: 'Board Games',
    brand: 'Grandmaster Classic',
    photoId: 'photo-1529699211952-734e80c4d42b', // Wooden chess set
  },
  {
    name: 'Interactive Musical Learning Activity Table for Toddlers',
    category: 'Toys & Games',
    subcategory: 'Toddler Toys',
    brand: 'TinyTots Academy',
    photoId: 'photo-1566576912321-d58ddd7a6088', // Kids activity table
  },
  {
    name: 'Precision Solid Pine Wood Tumbling Stacking Tower Blocks',
    category: 'Toys & Games',
    subcategory: 'Party Games',
    brand: 'TowerTumble',
    photoId: 'photo-1516627145497-ae6968895b74', // Tumbling blocks
  },

  // ================= BAGS & ACCESSORIES (8 Unique Items) =================
  {
    name: 'Anti-Theft Water-Resistant TSA Laptop Business Travel Backpack',
    category: 'Bags & Accessories',
    subcategory: 'Backpacks',
    brand: 'Apex Gear',
    photoId: 'photo-1553062407-98eeb64c6a62', // Laptop backpack
  },
  {
    name: 'Quilted Lambskin Leather Chain Crossbody Shoulder Bag',
    category: 'Bags & Accessories',
    subcategory: 'Handbags',
    brand: 'Maison Luxe',
    photoId: 'photo-1584917865442-de89df76afd3', // Leather shoulder bag
  },
  {
    name: 'Genuine Full-Grain Leather RFID-Blocking Bifold Wallet',
    category: 'Bags & Accessories',
    subcategory: 'Wallets',
    brand: 'Heritage Tanner',
    photoId: 'photo-1627123424574-724758594e93', // Leather wallet
  },
  {
    name: 'Polarized Metal Frame Classic UV400 Aviator Sunglasses',
    category: 'Bags & Accessories',
    subcategory: 'Eyewear',
    brand: 'SkyOptics',
    photoId: 'photo-1511499767150-a48a237f0083', // Aviator sunglasses
  },
  {
    name: 'Chronograph Stainless Steel Luxury Quartz Wristwatch',
    category: 'Bags & Accessories',
    subcategory: 'Watches',
    brand: 'Geneva Timepiece',
    photoId: 'photo-1524805444758-089113d48a6d', // Chronograph watch
  },
  {
    name: 'Solitaire Brilliant Cut Cubic Zirconia Pendant Choker Necklace',
    category: 'Bags & Accessories',
    subcategory: 'Jewelry',
    brand: 'Aura Jewels',
    photoId: 'photo-1599643478518-a784e5dc4c8f', // Choker necklace
  },
  {
    name: 'Vintage Genuine Buffalo Leather Weekend Duffel Travel Bag',
    category: 'Bags & Accessories',
    subcategory: 'Luggage & Duffels',
    brand: 'Wilderness Luggage',
    photoId: 'photo-1548036328-c9fa89d128fa', // Duffel bag
  },
  {
    name: 'Structured Saffiano Leather Professional Work Laptop Tote Bag',
    category: 'Bags & Accessories',
    subcategory: 'Handbags',
    brand: 'Milano Leather',
    photoId: 'photo-1590874103328-eac38a683ce7', // Leather tote bag
  },

  // ================= SPORTS & FITNESS (8 Unique Items) =================
  {
    name: '6mm Eco-Friendly High-Density Non-Slip Alignment Yoga Mat',
    category: 'Sports & Fitness',
    subcategory: 'Yoga & Pilates',
    brand: 'ZenFlow Pro',
    photoId: 'photo-1601925260368-ae2f83cf8b7f', // Yoga mat
  },
  {
    name: 'Hexagonal Cast Iron Neoprene Anti-Roll Dumbbells Pair (5kg x 2)',
    category: 'Sports & Fitness',
    subcategory: 'Weight Training',
    brand: 'IronGrip Pro',
    photoId: 'photo-1584735935682-2f2b69dff9d2', // Dumbbells pair
  },
  {
    name: '5-Level Heavy-Duty Natural Latex Resistance Workout Bands Set',
    category: 'Sports & Fitness',
    subcategory: 'Resistance Training',
    brand: 'PowerBands',
    photoId: 'photo-1598289431512-b97b0917affc', // Resistance bands
  },
  {
    name: 'High-Modulus Carbon Fiber Lightweight Pro Badminton Racket',
    category: 'Sports & Fitness',
    subcategory: 'Racquet Sports',
    brand: 'SmashPro',
    photoId: 'photo-1626224583764-f87db24ac4ea', // Badminton racket
  },
  {
    name: '32oz Vacuum Insulated Stainless Steel Protein Shaker Bottle',
    category: 'Sports & Fitness',
    subcategory: 'Fitness Accessories',
    brand: 'HydroFit',
    photoId: 'photo-1602143407151-7111542de6e8', // Shaker bottle
  },
  {
    name: 'High-Density Grid Trigger Point Muscle Recovery Foam Roller',
    category: 'Sports & Fitness',
    subcategory: 'Recovery & Mobility',
    brand: 'TheraFlex',
    photoId: 'photo-1518611012118-696072aa579a', // Foam roller
  },
  {
    name: 'High-Speed 360-Degree Ball-Bearing Steel Wire Jump Rope',
    category: 'Sports & Fitness',
    subcategory: 'Cardio',
    brand: 'SpeedRope Pro',
    photoId: 'photo-1591258370814-01609b341790', // Jump rope
  },
  {
    name: 'Breathable Padded Microfiber Palm Wrist Support Weightlifting Gloves',
    category: 'Sports & Fitness',
    subcategory: 'Fitness Accessories',
    brand: 'GripPro Athletics',
    photoId: 'photo-1583454110551-21f2fa2afe61', // Gym gloves
  },
];

async function verifyAll() {
  console.log(`Checking ${allProductDefinitions.length} distinct products...`);
  const usedPhotos = new Set<string>();
  let duplicates = 0;
  let invalidUrls = 0;

  for (let i = 0; i < allProductDefinitions.length; i++) {
    const item = allProductDefinitions[i];
    if (usedPhotos.has(item.photoId)) {
      console.error(`❌ DUPLICATE PHOTO ID used for "${item.name}": ${item.photoId}`);
      duplicates++;
    }
    usedPhotos.add(item.photoId);

    const valid = await checkPhoto(item.photoId);
    if (!valid) {
      console.error(`❌ UNREACHABLE PHOTO for "${item.name}" (${item.category}): ${item.photoId}`);
      invalidUrls++;
    } else {
      console.log(`[${i + 1}/${allProductDefinitions.length}] ✅ "${item.name}" -> ${item.category}`);
    }
  }

  console.log(`\n========================================`);
  console.log(`Total Products: ${allProductDefinitions.length}`);
  console.log(`Unique Photos:  ${usedPhotos.size}`);
  console.log(`Duplicates:     ${duplicates}`);
  console.log(`Invalid URLs:   ${invalidUrls}`);
  console.log(`========================================`);
}

verifyAll();
