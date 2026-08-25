const ids = [
  'photo-1610030469983-98e550d6193c',
  'photo-1617627143750-d86bc21e42bb',
  'photo-1614613535308-eb5fbd3d2c17',
  'photo-1609357605129-26f69add5d6e',
  'photo-1605296867304-46d5465a13f1',
  'photo-1604014237800-1c9102c219da',
  'photo-1615886753866-79396abc446e',
  'photo-1621600411688-4be93cd68504',
  'photo-1608748010899-18f300247112',
  'photo-1594633312681-425c7b97ccd1',
  'photo-1566174053879-31528523f8ae',
  'photo-1565193566173-7a0ee3dbe261',
  'photo-1611042553365-9b101441c135',
  'photo-1574634534894-89d7576c8259',
  'photo-1583209814683-c023dd293cc6',
  'photo-1518709268805-4e9042af9f23',
  'photo-1534528741775-53994a69daeb',
  'photo-1544005313-94ddf0286df2',
  'photo-1524504388940-b1c1722653e1',
  'photo-1494790108377-be9c29b29330',
  'photo-1517841905240-472988babdf9',
  'photo-1539571696357-5a69c17a67c6',
  'photo-1507003211169-0a1dd7228f2d',
  'photo-1519085360753-af0119f7cbe7',
  'photo-1506794778202-cad84cf45f1d',
  'photo-1500648767791-00dcc994a43e',
  'photo-1488426862026-3ee34a7d66df',
  'photo-1534528741775-53994a69daeb'
];

async function test() {
  const unique = Array.from(new Set(ids));
  for (const id of unique) {
    try {
      const res = await fetch(`https://images.unsplash.com/${id}?w=200`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      console.log(id, res.status === 200 ? 'OK' : 'FAIL');
    } catch {
      console.log(id, 'ERR');
    }
  }
}
test();
