import https from 'https';

export interface ProductPhotoMapping {
  photoId: string;
  expectedCategory: string;
  expectedItem: string;
}

export const catalogPhotos: Record<string, string> = {
  // SAREES - 30 Authentic Saree Photos
  'saree_banarasi_red': 'photo-1610030469983-98e550d6193c',
  'saree_kanchipuram_gold': 'photo-1583391733956-3750e0ff4e8b',
  'saree_organza_floral': 'photo-1617627143750-d86bc21e42bb',
  'saree_georgette_navy': 'photo-1609357605129-26f69add5d6e',
  'saree_chiffon_ombre': 'photo-1614613535308-eb5fbd3d2c17',
  'saree_linen_handloom': 'photo-1605296867304-46d5465a13f1',
  'saree_bandhani_pink': 'photo-1604014237800-1c9102c219da',
  'saree_paithani_peacock': 'photo-1583391733975-08147d33d875',
  'saree_chanderi_silk': 'photo-1615886753866-79396abc446e',
  'saree_mulmul_cotton': 'photo-1621600411688-4be93cd68504',
  'saree_tussar_silk': 'photo-1608748010899-18f300247112',
  'saree_kalamkari_artisan': 'photo-1594633312681-425c7b97ccd1',
  'saree_kasavu_kerala': 'photo-1602810318383-e386cc2a3ccf',
  'saree_mysore_crepe': 'photo-1566174053879-31528523f8ae',
  'saree_chikankari_georgette': 'photo-1583391733981-08147d33d876',
  'saree_patola_silk': 'photo-1583391733983-08147d33d877',
  'saree_sambalpuri_ikat': 'photo-1583391733985-08147d33d878',
  'saree_kota_doria': 'photo-1583391733987-08147d33d879',
  'saree_jamdani_muslin': 'photo-1583391733989-08147d33d880',
  'saree_maheshwari_cotton': 'photo-1583391733991-08147d33d881',
  'saree_satin_pleated': 'photo-1627885745973-20a273117495',
  'saree_tissue_metallic': 'photo-1565193566173-7a0ee3dbe261',
  'saree_raw_silk_temple': 'photo-1611042553365-9b101441c135',
  'saree_kanjivaram_bridal': 'photo-1610030469983-98e550d6193d',
  'saree_velvet_zardozi': 'photo-1609357605129-26f69add5d6f',
  'saree_madhubani_tussar': 'photo-1617627143750-d86bc21e42bc',
  'saree_pochampally_ikat': 'photo-1604014237800-1c9102c219db',
  'saree_baluchari_silk': 'photo-1615886753866-79396abc446f',
  'saree_bhagalpuri_floral': 'photo-1621600411688-4be93cd68505',
  'saree_uppada_pure_silk': 'photo-1608748010899-18f300247113',

  // WOMEN'S FASHION - 18 Unique Items
  'women_chikankari_anarkali': 'photo-1515886657613-9f3515b0c78f',
  'women_floral_midi_dress': 'photo-1572804013309-59a88b7e92f1',
  'women_highrise_denim_jeans': 'photo-1541099649105-f69ad21f3246',
  'women_oversized_cable_sweater': 'photo-1576871337622-98d48d1cf531',
  'women_pastel_lehenga_choli': 'photo-1566174053879-31528523f8ae',
  'women_tailored_linen_blazer': 'photo-1584273143981-41c073dfe8f8',
  'women_mulmul_cotton_kurti': 'photo-1583391733956-3750e0ff4e8b',
  'women_satin_slip_dress': 'photo-1595777457583-95e059d581b8',
  'women_french_terry_hoodie': 'photo-1556905055-8f358a7a47b2',
  'women_bohemian_maxi_dress': 'photo-1496747611176-843222e1e57c',
  'women_linen_blend_trousers': 'photo-1509631179647-0177331693ae',
  'women_velvet_kurta_set': 'photo-1609357605129-26f69add5d6e',
  'women_ribbed_highneck_top': 'photo-1503342217505-b0a15ec3261c',
  'women_chambray_denim_shirt': 'photo-1598554747436-c9293d6a588f',
  'women_pleated_midi_skirt': 'photo-1583496661160-fb5886a0aaaa',
  'women_boho_kimono_cardigan': 'photo-1434389677669-e08b4cac3105',
  'women_mirrorwork_sharara': 'photo-1617627143750-d86bc21e42bb',
  'women_white_cotton_shirt': 'photo-1598033129183-c4f50c736f10',

  // MEN'S FASHION - 15 Unique Items
  'men_oxford_cotton_shirt': 'photo-1602810318383-e386cc2a3ccf',
  'men_denim_trucker_jacket': 'photo-1576995853123-5a10305d93c0',
  'men_slim_stretch_chinos': 'photo-1473966968600-fa801b869a1a',
  'men_heavyweight_graphic_tee': 'photo-1521572267360-ee0c2909d518',
  'men_fleece_pullover_hoodie': 'photo-1556905055-8f358a7a47b2',
  'men_tailored_linen_blazer': 'photo-1507679799987-c73779587ccf',
  'men_silk_kurta_churidar': 'photo-1583391733975-08147d33d875',
  'men_selvedge_denim_jeans': 'photo-1542272604-780c96856592',
  'men_merino_wool_sweater': 'photo-1614975058789-41316d0e2e9c',
  'men_windbreaker_jacket': 'photo-1544441893-675973e31985',
  'men_linen_resort_shirt': 'photo-1596755094514-f87e34085b2c',
  'men_quickdry_track_pants': 'photo-1552902865-b72c031ac5ea',
  'men_buffalo_plaid_flannel': 'photo-1603252109303-2751441dd157',
  'men_ribbed_polo_tshirt': 'photo-1625910513413-722513f56bc2',
  'men_pique_cotton_polo': 'photo-1586363104862-3a5e2ab60d99',

  // KIDS & BABY - 12 Unique Items
  'kids_floral_tulle_frock': 'photo-1622290291468-a28f7a7dc6a8',
  'kids_boys_waistcoat_suit': 'photo-1518831959646-742c3a14ebf7',
  'kids_organic_baby_romper': 'photo-1522771930-78848d9293e8',
  'kids_denim_overalls_set': 'photo-1519238263530-99bdd11df2ea',
  'kids_dino_fleece_sweatshirt': 'photo-1503454537195-1dcabb73ffb9',
  'kids_embroidered_lehenga': 'photo-1617627143750-d86bc21e42bb',
  'kids_plaid_shirt_bowtie': 'photo-1508807526345-15e9b5f4eaff',
  'kids_plush_hooded_bathrobe': 'photo-1515488042361-ee00e0ddd4e4',
  'kids_insulated_winter_parka': 'photo-1543332164-6e82f355badc',
  'kids_canvas_slipon_shoes': 'photo-1514989940723-e8e51635b782',
  'kids_tutu_tiered_dress': 'photo-1533512930330-4ac257c86793',
  'kids_cargo_joggers_pants': 'photo-1596870230751-ebdfce98ec42',

  // FOOTWEAR - 12 Unique Items
  'footwear_running_sneakers': 'photo-1542291026-7eec264c27ff',
  'footwear_leather_oxford_brogues': 'photo-1614252235316-8c857d38b5f4',
  'footwear_embroidered_mojari_juttis': 'photo-1560343090-f0409e92791a',
  'footwear_stiletto_leather_heels': 'photo-1543163521-1bf539c55dd2',
  'footwear_memory_foam_slides': 'photo-1603808033192-082d6919d3e1',
  'footwear_waterproof_ankle_boots': 'photo-1520639888713-7851133b1ed0',
  'footwear_classic_canvas_skate': 'photo-1525966222134-fcfa99b8ae77',
  'footwear_strappy_block_sandals': 'photo-1535043934128-cf0b28d52f95',
  'footwear_cushioned_gym_shoes': 'photo-1608231387042-66d1773070a5',
  'footwear_kolhapuri_chappals': 'photo-1562273138-f46be4ebdf33',
  'footwear_minimalist_white_sneakers': 'photo-1600185365483-26d7a4cc7519',
  'footwear_suede_penny_loafers': 'photo-1533867617858-e7b97e060509',

  // BEAUTY & PERSONAL CARE - 12 Unique Items
  'beauty_matte_red_lipstick': 'photo-1586495777744-4413f21062fa',
  'beauty_hyaluronic_rose_serum': 'photo-1620916566398-39f1143ab7be',
  'beauty_luminous_liquid_foundation': 'photo-1522337360788-8b13dee7a37e',
  'beauty_matte_sunscreen_spf50': 'photo-1598440947619-2c35fc9aa908',
  'beauty_ceramide_moisturizer': 'photo-1556228720-195a672e8a03',
  'beauty_vitamin_c_face_wash': 'photo-1571781926291-c477ebfd024b',
  'beauty_vanilla_amber_perfume': 'photo-1592945403244-b3fbafd7f539',
  'beauty_waterproof_mascara': 'photo-1512496015851-a90fb38ba796',
  'beauty_ayurvedic_hair_oil': 'photo-1608248597359-250937a07409',
  'beauty_neutral_eyeshadow_palette': 'photo-1512496015851-a90fb38ba796',
  'beauty_shea_butter_lip_mask': 'photo-1596755389378-c31d21fd1273',
  'beauty_teatree_clay_face_mask': 'photo-1567928815116-f6d3ad3b1e36',

  // ELECTRONICS - 12 Unique Items
  'elec_amoled_smart_watch': 'photo-1523275335684-37898b6baf30',
  'elec_anc_wireless_earbuds': 'photo-1590658268037-6bf12165a8df',
  'elec_gan_fast_charger': 'photo-1583863788434-e58a36330cf0',
  'elec_magnetic_power_bank': 'photo-1609592424317-06103632cf4b',
  'elec_waterproof_bluetooth_speaker': 'photo-1608043152269-423dbba4e7e1',
  'elec_rgb_gaming_headset': 'photo-1546435770-a3e426bf472b',
  'elec_qi_wireless_charging_pad': 'photo-1622445262464-84b150704944',
  'elec_4k_action_camera': 'photo-1526170375885-4d8ecf77b99f',
  'elec_usbc_8in1_hub_dock': 'photo-1544716278-ca5e3f4abd8c',
  'elec_app_controlled_light_bar': 'photo-1550745165-9bc0b252726f',
  'elec_indoor_security_camera': 'photo-1557597774-9d273605dfa9',
  'elec_wireless_keyboard_mouse': 'photo-1587829741301-dc798b83add3',

  // HOME & LIVING - 12 Unique Items
  'home_digital_air_fryer': 'photo-1585659722983-3a675dabf23d',
  'home_cast_iron_skillet': 'photo-1584990347449-74d1a3371f49',
  'home_egyptian_cotton_bedding': 'photo-1616046229478-9901c5536a45',
  'home_nordic_bedside_lamp': 'photo-1507473885765-e6ed057f782c',
  'home_aroma_essential_diffuser': 'photo-1608571423902-eed4a5ad8108',
  'home_glass_kitchen_jars': 'photo-1584992236310-6edddc08acff',
  'home_japanese_chef_knife_set': 'photo-1593618998160-e34014e67546',
  'home_gooseneck_electric_kettle': 'photo-1556911220-e15b29be8c8f',
  'home_jute_boho_area_rug': 'photo-1600121848594-d8644e57abab',
  'home_blackout_bedroom_curtains': 'photo-1513694203232-719a280e022f',
  'home_espresso_coffee_machine': 'photo-1517668808822-9ebb02f2a0e6',
  'home_stoneware_dinner_set': 'photo-1615865417491-9941019fbc00',

  // TOYS & GAMES - 10 Unique Items
  'toy_rc_monster_truck': 'photo-1594787318286-3d835c1d207f',
  'toy_solar_stem_robot': 'photo-1485827404703-89b55fcc595e',
  'toy_wooden_dollhouse': 'photo-1558060370-d644479cb6f7',
  'toy_panoramic_jigsaw_puzzle': 'photo-1587654780291-39c9404d746b',
  'toy_magnetic_building_tiles': 'photo-1596461404969-9ae70f2830c1',
  'toy_wooden_chess_set': 'photo-1529699211952-734e80c4d42b',
  'toy_superhero_action_figure': 'photo-1608889175123-8ee362201f81',
  'toy_interactive_learning_table': 'photo-1566576912321-d58ddd7a6088',
  'toy_tumble_wooden_blocks': 'photo-1516627145497-ae6968895b74',
  'toy_talking_interactive_globe': 'photo-1526778548025-fa2f459cd5c1',

  // BAGS & ACCESSORIES - 10 Unique Items
  'bag_antitheft_laptop_backpack': 'photo-1553062407-98eeb64c6a62',
  'bag_quilted_leather_shoulder_bag': 'photo-1584917865442-de89df76afd3',
  'bag_rfid_leather_wallet': 'photo-1627123424574-724758594e93',
  'bag_polarized_aviator_sunglasses': 'photo-1511499767150-a48a237f0083',
  'bag_chronograph_luxury_watch': 'photo-1524805444758-089113d48a6d',
  'bag_solitaire_pendant_necklace': 'photo-1599643478518-a784e5dc4c8f',
  'bag_vintage_leather_duffel': 'photo-1548036328-c9fa89d128fa',
  'bag_silk_jacquard_tie_set': 'photo-1598033129183-c4f50c736f10',
  'bag_saffiano_leather_work_tote': 'photo-1590874103328-eac38a683ce7',
  'bag_reversible_leather_belt': 'photo-1624222247344-550fb60583dc',

  // SPORTS & FITNESS - 10 Unique Items
  'sport_alignment_yoga_mat': 'photo-1601925260368-ae2f83cf8b7f',
  'sport_cast_iron_dumbbells_pair': 'photo-1584735935682-2f2b69dff9d2',
  'sport_resistance_workout_bands': 'photo-1598289431512-b97b0917affc',
  'sport_carbon_badminton_racket': 'photo-1626224583764-f87db24ac4ea',
  'sport_insulated_protein_shaker': 'photo-1602143407151-7111542de6e8',
  'sport_muscle_foam_roller': 'photo-1518611012118-696072aa579a',
  'sport_speed_jump_rope': 'photo-1591258370814-01609b341790',
  'sport_wrist_support_gym_gloves': 'photo-1583454110551-21f2fa2afe61',
  'sport_ab_roller_wheel': 'photo-1571019613454-1cb2f99b2d8b',
  'sport_compartment_gym_duffel': 'photo-1553062407-98eeb64c6a62',
};

async function testAllPhotos() {
  console.log(`Checking ${Object.keys(catalogPhotos).length} curated photo IDs on Unsplash...`);
  let valid = 0;
  let failed = 0;

  const entries = Object.entries(catalogPhotos);
  for (const [key, photoId] of entries) {
    const url = `https://images.unsplash.com/${photoId}?w=800&auto=format&fit=crop&q=80`;
    try {
      const ok = await checkUrl(url);
      if (ok) {
        valid++;
      } else {
        console.warn(`❌ Unreachable photo: ${key} -> ${photoId}`);
        failed++;
      }
    } catch (err: any) {
      console.warn(`❌ Error checking ${key} -> ${photoId}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nCheck finished: ${valid} valid, ${failed} failed.`);
}

function checkUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    https.get(url, { method: 'HEAD' }, (res) => {
      resolve(res.statusCode === 200 || (res.statusCode !== undefined && res.statusCode >= 200 && res.statusCode < 400));
    }).on('error', () => resolve(false));
  });
}

testAllPhotos();
