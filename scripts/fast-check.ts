async function check(id: string): Promise<boolean> {
  const url = `https://images.unsplash.com/${id}?w=400&auto=format&fit=crop&q=60`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
    clearTimeout(timer);
    return res.status === 200 || res.status === 304;
  } catch {
    return false;
  }
}

// Let's test a broad set of candidate photos from Unsplash for each specific product type
const sareeCandidates = [
  'photo-1610030469983-98e550d6193c',
  'photo-1617627143750-d86bc21e42bb',
  'photo-1609357605129-26f69add5d6e',
  'photo-1614613535308-eb5fbd3d2c17',
  'photo-1605296867304-46d5465a13f1',
  'photo-1604014237800-1c9102c219da',
  'photo-1615886753866-79396abc446e',
  'photo-1621600411688-4be93cd68504',
  'photo-1608748010899-18f300247112',
  'photo-1594633312681-425c7b97ccd1',
  'photo-1602810318383-e386cc2a3ccf',
  'photo-1566174053879-31528523f8ae',
  'photo-1565193566173-7a0ee3dbe261',
  'photo-1611042553365-9b101441c135',
  'photo-1574634534894-89d7576c8259',
  'photo-1583209814683-c023dd293cc6',
  'photo-1518709268805-4e9042af9f23',
  'photo-1584917865442-de89df76afd3',
  'photo-1534528741775-53994a69daeb',
  'photo-1544005313-94ddf0286df2',
  'photo-1524504388940-b1c1722653e1',
  'photo-1494790108377-be9c29b29330',
  'photo-1507003211169-0a1dd7228f2d',
  'photo-1500648767791-00dcc994a43e',
  'photo-1488426862026-3ee34a7d66df',
];

async function main() {
  console.log('Testing saree candidate photos...');
  for (const id of sareeCandidates) {
    const ok = await check(id);
    console.log(`${id}: ${ok ? '✅ VALID' : '❌ INVALID'}`);
  }
}

main();
