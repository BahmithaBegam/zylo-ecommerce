import https from 'https';

export async function checkPhoto(photoId: string): Promise<boolean> {
  const url = `https://images.unsplash.com/${photoId}?w=800&auto=format&fit=crop&q=80`;
  return new Promise((resolve) => {
    const req = https.request(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Range': 'bytes=0-100',
      },
      timeout: 4000,
    }, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 206);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

// Let's test candidate photo IDs across Indian ethnic sarees and categories
const candidatePhotos = [
  // Saree & Indian Ethnic Photos
  'photo-1610030469983-98e550d6193c', // Banarasi red silk
  'photo-1583391733956-3750e0ff4e8b', // Indian traditional saree
  'photo-1617627143750-d86bc21e42bb', // Organza/festive saree
  'photo-1609357605129-26f69add5d6e', // Georgette saree
  'photo-1614613535308-eb5fbd3d2c17', // Colorful ethnic fabric/saree
  'photo-1605296867304-46d5465a13f1', // Handloom fabric/saree
  'photo-1604014237800-1c9102c219da', // Ethnic wear
  'photo-1615886753866-79396abc446e', // Pastel drape
  'photo-1621600411688-4be93cd68504', // Block print
  'photo-1608748010899-18f300247112', // Tussar silk
  'photo-1594633312681-425c7b97ccd1', // Ethnic outfit
  'photo-1602810318383-e386cc2a3ccf', // Gold drape / shirt
  'photo-1566174053879-31528523f8ae', // Traditional Indian festive
  'photo-1565193566173-7a0ee3dbe261', // Traditional silk
  'photo-1611042553365-9b101441c135', // Elegant black drape
  'photo-1515886657613-9f3515b0c78f', // High fashion yellow
  'photo-1572804013309-59a88b7e92f1', // Dress
  'photo-1541099649105-f69ad21f3246', // Jeans
  'photo-1576871337622-98d48d1cf531', // Sweater
  'photo-1584273143981-41c073dfe8f8', // Blazer
  'photo-1595777457583-95e059d581b8', // Dress
  'photo-1556905055-8f358a7a47b2', // Hoodie
  'photo-1496747611176-843222e1e57c', // Sundress
  'photo-1509631179647-0177331693ae', // Trousers
  'photo-1503342217505-b0a15ec3261c', // Ribbed top
  'photo-1598554747436-c9293d6a588f', // Denim shirt
  'photo-1583496661160-fb5886a0aaaa', // Skirt
  'photo-1434389677669-e08b4cac3105', // Kimono/cardigan
  'photo-1598033129183-c4f50c736f10', // White shirt
  'photo-1576995853123-5a10305d93c0', // Men jacket
  'photo-1473966968600-fa801b869a1a', // Men chinos
  'photo-1521572267360-ee0c2909d518', // Men tee
  'photo-1507679799987-c73779587ccf', // Men suit blazer
  'photo-1614975058789-41316d0e2e9c', // Men sweater
  'photo-1544441893-675973e31985', // Men jacket
  'photo-1596755094514-f87e34085b2c', // Men shirt
  'photo-1552902865-b72c031ac5ea', // Track pants
  'photo-1603252109303-2751441dd157', // Flannel
  'photo-1586363104862-3a5e2ab60d99', // Polo
  'photo-1622290291468-a28f7a7dc6a8', // Kids frock
  'photo-1518831959646-742c3a14ebf7', // Kids boy
  'photo-1522771930-78848d9293e8', // Baby romper
  'photo-1519238263530-99bdd11df2ea', // Kids overalls
  'photo-1503454537195-1dcabb73ffb9', // Kids dino
  'photo-1508807526345-15e9b5f4eaff', // Kids shirt
  'photo-1515488042361-ee00e0ddd4e4', // Kids plush
  'photo-1543332164-6e82f355badc', // Kids jacket
  'photo-1514989940723-e8e51635b782', // Kids shoes
  'photo-1533512930330-4ac257c86793', // Kids dress
  'photo-1596870230751-ebdfce98ec42', // Kids joggers
  'photo-1542291026-7eec264c27ff', // Sneakers
  'photo-1614252235316-8c857d38b5f4', // Brogues
  'photo-1560343090-f0409e92791a', // Juttis/shoes
  'photo-1543163521-1bf539c55dd2', // Heels
  'photo-1603808033192-082d6919d3e1', // Slides
  'photo-1520639888713-7851133b1ed0', // Boots
  'photo-1525966222134-fcfa99b8ae77', // Canvas shoes
  'photo-1535043934128-cf0b28d52f95', // Block sandals
  'photo-1608231387042-66d1773070a5', // Gym shoes
  'photo-1562273138-f46be4ebdf33', // Chappals
  'photo-1600185365483-26d7a4cc7519', // White sneakers
  'photo-1533867617858-e7b97e060509', // Loafers
  'photo-1586495777744-4413f21062fa', // Lipstick
  'photo-1620916566398-39f1143ab7be', // Serum
  'photo-1522337360788-8b13dee7a37e', // Foundation
  'photo-1598440947619-2c35fc9aa908', // Sunscreen
  'photo-1556228720-195a672e8a03', // Moisturizer
  'photo-1571781926291-c477ebfd024b', // Cleanser
  'photo-1592945403244-b3fbafd7f539', // Perfume
  'photo-1512496015851-a90fb38ba796', // Mascara/Eyeshadow
  'photo-1608248597359-250937a07409', // Hair oil
  'photo-1596755389378-c31d21fd1273', // Lip mask
  'photo-1567928815116-f6d3ad3b1e36', // Clay mask
  'photo-1523275335684-37898b6baf30', // Watch
  'photo-1590658268037-6bf12165a8df', // Earbuds
  'photo-1583863788434-e58a36330cf0', // Charger
  'photo-1609592424317-06103632cf4b', // Power bank
  'photo-1608043152269-423dbba4e7e1', // Bluetooth speaker
  'photo-1546435770-a3e426bf472b', // Gaming headset
  'photo-1622445262464-84b150704944', // Wireless charger
  'photo-1526170375885-4d8ecf77b99f', // Action camera
  'photo-1544716278-ca5e3f4abd8c', // USB Hub
  'photo-1550745165-9bc0b252726f', // LED light
  'photo-1557597774-9d273605dfa9', // Security camera
  'photo-1587829741301-dc798b83add3', // Keyboard
  'photo-1585659722983-3a675dabf23d', // Air fryer
  'photo-1584990347449-74d1a3371f49', // Cast iron
  'photo-1616046229478-9901c5536a45', // Bedding
  'photo-1507473885765-e6ed057f782c', // Bedside lamp
  'photo-1608571423902-eed4a5ad8108', // Diffuser
  'photo-1584992236310-6edddc08acff', // Glass jars
  'photo-1593618998160-e34014e67546', // Chef knife set
  'photo-1556911220-e15b29be8c8f', // Kettle
  'photo-1600121848594-d8644e57abab', // Jute rug
  'photo-1513694203232-719a280e022f', // Bedroom / curtains
  'photo-1517668808822-9ebb02f2a0e6', // Espresso machine
  'photo-1615865417491-9941019fbc00', // Dinner set
  'photo-1594787318286-3d835c1d207f', // RC truck
  'photo-1485827404703-89b55fcc595e', // Robot
  'photo-1558060370-d644479cb6f7', // Dollhouse
  'photo-1587654780291-39c9404d746b', // Puzzle
  'photo-1596461404969-9ae70f2830c1', // Building blocks
  'photo-1529699211952-734e80c4d42b', // Chess
  'photo-1608889175123-8ee362201f81', // Action figure
  'photo-1566576912321-d58ddd7a6088', // Learning table
  'photo-1516627145497-ae6968895b74', // Wooden blocks
  'photo-1526778548025-fa2f459cd5c1', // Globe
  'photo-1553062407-98eeb64c6a62', // Laptop backpack
  'photo-1584917865442-de89df76afd3', // Handbag
  'photo-1627123424574-724758594e93', // Wallet
  'photo-1511499767150-a48a237f0083', // Sunglasses
  'photo-1524805444758-089113d48a6d', // Watch
  'photo-1599643478518-a784e5dc4c8f', // Necklace
  'photo-1548036328-c9fa89d128fa', // Duffel
  'photo-1590874103328-eac38a683ce7', // Tote bag
  'photo-1624222247344-550fb60583dc', // Belt
  'photo-1601925260368-ae2f83cf8b7f', // Yoga mat
  'photo-1584735935682-2f2b69dff9d2', // Dumbbells
  'photo-1598289431512-b97b0917affc', // Resistance bands
  'photo-1626224583764-f87db24ac4ea', // Badminton
  'photo-1602143407151-7111542de6e8', // Shaker bottle
  'photo-1518611012118-696072aa579a', // Foam roller
  'photo-1591258370814-01609b341790', // Jump rope
  'photo-1583454110551-21f2fa2afe61', // Gloves
  'photo-1571019613454-1cb2f99b2d8b', // Ab roller
];

async function run() {
  console.log(`Testing ${candidatePhotos.length} candidate photos...`);
  const validPhotos: string[] = [];
  const invalidPhotos: string[] = [];

  for (const id of candidatePhotos) {
    const ok = await checkPhoto(id);
    if (ok) {
      validPhotos.push(id);
    } else {
      invalidPhotos.push(id);
      console.log('INVALID:', id);
    }
  }

  console.log(`\nResults: ${validPhotos.length} valid, ${invalidPhotos.length} invalid.`);
}

run();
