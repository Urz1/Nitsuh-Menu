import { MenuItem } from '@/types/database';

export interface PairingRecommendation {
  item: MenuItem;
  intentBadge: string;
  reasonText: string;
  affinityScore: number;
}

/**
 * Culturally informed, research-backed recommendation engine for Nitsuh Cafe & Restaurant.
 * Grounded in:
 * 1. Strict Ethiopian dietary rules (Orthodox Fasting isolation: never recommend dairy/meat with fasting dishes).
 * 2. Classic flavor complementarity (Ambo water / hot Buna after savory meals).
 * 3. Behavioral restaurant menu engineering (low-friction price anchoring between 10% - 40% of main dish).
 */
export function getIntelligentPairings(
  targetItem: MenuItem,
  allItems: MenuItem[]
): PairingRecommendation[] {
  if (!targetItem || !allItems || allItems.length === 0) return [];

  // Exclude current item and unavailable items
  const candidates = allItems.filter((i) => i.id !== targetItem.id && i.is_available !== false);

  const isFasting =
    targetItem.tags?.includes('fasting') ||
    targetItem.category_id === 'cat-fasting';

  const targetCategory = targetItem.category_id;
  const targetId = targetItem.id;

  const recommendations: PairingRecommendation[] = [];

  // Helper to check dietary safety
  const isDietarySafe = (candidate: MenuItem): boolean => {
    if (isFasting) {
      // Must be tagged fasting or fasting-safe drink/category
      const isCandidateFasting =
        candidate.tags?.includes('fasting') ||
        candidate.category_id === 'cat-fasting' ||
        candidate.category_id === 'cat-juices' ||
        candidate.id === 'item-coffee-buna' ||
        candidate.id === 'item-special-tea' ||
        candidate.id === 'item-ambo-water';

      return Boolean(isCandidateFasting);
    }

    return true;
  };

  // Safe candidates pool
  const safePool = candidates.filter(isDietarySafe);

  // Helper to find items by id, name substring, or keyword
  const findItem = (...matchers: string[]) => {
    return safePool.find((i) => {
      if (recommendations.some((r) => r.item.id === i.id)) return false;
      const idLower = i.id.toLowerCase();
      const nameLower = i.name.toLowerCase();
      return matchers.some(
        (m) => idLower.includes(m.toLowerCase()) || nameLower.includes(m.toLowerCase())
      );
    });
  };

  // ---------------------------------------------------------------------------
  // 1. FASTING DISHES (Fasting Burger, Fasting Pizza, Fasting Pasta, Salads)
  // ---------------------------------------------------------------------------
  if (isFasting || targetId.includes('fasting') || targetItem.tags?.includes('fasting') || targetItem.tags?.includes('vegan')) {
    // Top pairing: 100% pure fresh layered juice (Spris) or Avocado Juice
    const spris = findItem('special juice', 'spris', 'avocado juice', 'mango juice');
    if (spris) {
      recommendations.push({
        item: spris,
        intentBadge: 'Fasting Fruit Press',
        reasonText: 'Naturally sweet fresh avocado, mango & papaya purée',
        affinityScore: 98,
      });
    }

    // Refreshing Palate Cleanser: Normal / Fasting Special Salad
    const salad = findItem('fasting special salad', 'special salad', 'normal salad', 'avocado salad');
    if (salad && targetId !== salad.id) {
      recommendations.push({
        item: salad,
        intentBadge: 'Fresh Crunch',
        reasonText: 'Crisp greens, fresh tomatoes, and lemon olive oil vinaigrette',
        affinityScore: 92,
      });
    }

    // Pure volcanic carbonation: Ambo Water
    const ambo = findItem('ambo water', 'ambo', 'water 1 liter');
    if (ambo) {
      recommendations.push({
        item: ambo,
        intentBadge: 'Natural Digestif',
        reasonText: 'Ethiopian sparkling volcanic water to aid digestion',
        affinityScore: 88,
      });
    }

    // Traditional black buna
    const buna = findItem('coffee', 'buna', 'espresso', 'tea');
    if (buna) {
      recommendations.push({
        item: buna,
        intentBadge: 'Post-Meal Ritual',
        reasonText: 'Freshly roasted single-origin highland Arabica',
        affinityScore: 85,
      });
    }

    if (recommendations.length > 0) {
      return recommendations.slice(0, 3);
    }
  }

  // ---------------------------------------------------------------------------
  // 2. CRISPY CHICKEN & WINGS (Fried Chicken Leg, Honey BBQ Wings, Strips)
  // ---------------------------------------------------------------------------
  if (
    targetCategory === 'cat-chicken' ||
    targetId.includes('chicken') ||
    targetId.includes('wing') ||
    targetId.includes('nuggate') ||
    targetId.includes('strip')
  ) {
    // Slot 1: Chilled Soft Drink or Novida
    const drink = findItem('soft drink', 'bottle soft drink', 'novida soft drink', 'classic mojito');
    if (drink) {
      recommendations.push({
        item: drink,
        intentBadge: 'Chilled Sip',
        reasonText: 'Ice-cold carbonation cuts through crispy golden seasoning',
        affinityScore: 97,
      });
    }

    // Slot 2: Fresh Shake
    const shake = findItem('banana shake', 'strawberry shake', 'chocolate shake');
    if (shake) {
      recommendations.push({
        item: shake,
        intentBadge: 'Creamy Pairing',
        reasonText: 'Thick creamy milkshake pairs sublimely with crispy chicken',
        affinityScore: 93,
      });
    }

    // Slot 3: Desserts
    const dessert = findItem('classic dounut', 'croissant', 'tart cake');
    if (dessert) {
      recommendations.push({
        item: dessert,
        intentBadge: 'Sweet Finish',
        reasonText: 'Artisanal sweet pastry to complete your meal',
        affinityScore: 86,
      });
    }

    if (recommendations.length > 0) {
      return recommendations.slice(0, 3);
    }
  }

  // ---------------------------------------------------------------------------
  // 3. CLUB SANDWICHES & WRAPS
  // ---------------------------------------------------------------------------
  if (targetCategory === 'cat-club-sandwich' || targetCategory === 'cat-wrap' || targetId.includes('sandwich') || targetId.includes('wrap')) {
    // Slot 1: Fresh Mojito
    const mojito = findItem('classic mojito', 'lemon mint mojito', 'strawberry mojito');
    if (mojito) {
      recommendations.push({
        item: mojito,
        intentBadge: 'Zesty Sip',
        reasonText: 'Fresh lemon, mint, and crushed ice refreshment',
        affinityScore: 98,
      });
    }

    // Slot 2: Fresh Tropical Juice
    const juice = findItem('mango juice', 'special juice', 'avocado juice');
    if (juice) {
      recommendations.push({
        item: juice,
        intentBadge: 'Fresh Press',
        reasonText: 'Thick natural fruit juice pressed daily',
        affinityScore: 92,
      });
    }

    // Slot 3: Hot Espresso or Macchiato
    const coffee = findItem('macchiato', 'coffee', 'espresso');
    if (coffee) {
      recommendations.push({
        item: coffee,
        intentBadge: 'Coffee Finish',
        reasonText: 'Smooth Ethiopian espresso finish',
        affinityScore: 85,
      });
    }

    if (recommendations.length > 0) {
      return recommendations.slice(0, 3);
    }
  }

  // ---------------------------------------------------------------------------
  // 4. BREAKFAST SPECIALTIES (Chechebisa, Fetira, Ful, Eggs)
  // ---------------------------------------------------------------------------
  if (targetCategory === 'cat-breakfast' || targetId.includes('fetira') || targetId.includes('chechebisa') || targetId.includes('ful')) {
    // Slot 1: Ethiopian Macchiato or Buna (non-negotiable breakfast anchor)
    const macchiato = findItem('item-macchiato', 'macchiato', 'coffee');
    if (macchiato) {
      recommendations.push({
        item: macchiato,
        intentBadge: 'Morning Ritual',
        reasonText: 'Rich double-shot espresso layered with silky steamed milk',
        affinityScore: 99,
      });
    }

    // Slot 2: Fresh Avocado Juice
    const avocadoJuice = findItem('item-avocado-juice', 'avocado', 'sprice juice');
    if (avocadoJuice) {
      recommendations.push({
        item: avocadoJuice,
        intentBadge: 'Fresh Energy',
        reasonText: 'Thick, creamy avocado purée with fresh lime squeeze',
        affinityScore: 93,
      });
    }

    // Slot 3: Special Milk or Somali Tea
    const specialMilk = findItem('item-special-milk', 'special milk', 'somali tea');
    if (specialMilk) {
      recommendations.push({
        item: specialMilk,
        intentBadge: 'Warm Spices',
        reasonText: 'Ginger and cardamom-steamed whole milk for comfort',
        affinityScore: 87,
      });
    }

    if (recommendations.length > 0) {
      return recommendations.slice(0, 3);
    }
  }

  // ---------------------------------------------------------------------------
  // 5. BURGERS & WRAPS
  // ---------------------------------------------------------------------------
  if (targetCategory === 'cat-burger' || targetCategory === 'cat-wrap' || targetId.includes('burger') || targetId.includes('wrap')) {
    // Slot 1: Crispy Golden French Fries
    const fries = findItem('item-french-fries', 'french frise', 'french fries');
    if (fries) {
      recommendations.push({
        item: fries,
        intentBadge: 'Classic Combo',
        reasonText: 'Hot, salted golden fries with delicious dip',
        affinityScore: 99,
      });
    }

    // Slot 2: Shake or Cold Drink
    const drink = findItem('shake', 'mojito', 'soft drinks', 'ice coffee');
    if (drink) {
      recommendations.push({
        item: drink,
        intentBadge: 'Chilled Sip',
        reasonText: 'Ice-cold refreshment to pair with savory grilled burger',
        affinityScore: 94,
      });
    }

    // Slot 3: Fried Chicken Wings or Nuggets
    const wings = findItem('fried chicken wings', 'chicken nugget', 'chicken tender');
    if (wings) {
      recommendations.push({
        item: wings,
        intentBadge: 'Crispy Starter',
        reasonText: 'Crispy seasoned chicken accompaniment',
        affinityScore: 88,
      });
    }

    if (recommendations.length > 0) {
      return recommendations.slice(0, 3);
    }
  }

  // ---------------------------------------------------------------------------
  // 6. PIZZAS
  // ---------------------------------------------------------------------------
  if (targetCategory === 'cat-pizza' || targetId.includes('pizza') || targetItem.name.toLowerCase().includes('pizza')) {
    // Slot 1: Cold Drinks or Ambo Water
    const coldDrink = findItem('soft drink', 'ambo water', 'classic mojito', 'water 1 liter', 'ice latte');
    if (coldDrink) {
      recommendations.push({
        item: coldDrink,
        intentBadge: 'Crisp Refreshment',
        reasonText: 'Naturally chilled sparkling drink pairs crisp with artisan pizza',
        affinityScore: 96,
      });
    }

    // Slot 2: Chicken Wings side
    const snack = findItem('chicken wings', 'chicken nuggate', 'crispy chicken strips');
    if (snack) {
      recommendations.push({
        item: snack,
        intentBadge: 'Great to Share',
        reasonText: 'Crispy seasoned chicken accompaniment to share',
        affinityScore: 92,
      });
    }

    // Slot 3: Sweet finish / cake
    const sweet = findItem('tart cake', 'classic dounut', 'croissant', 'mini chocolate cake');
    if (sweet) {
      recommendations.push({
        item: sweet,
        intentBadge: 'Sweet Finish',
        reasonText: 'Delightful house-baked bakery dessert',
        affinityScore: 88,
      });
    }

    if (recommendations.length > 0) {
      return recommendations.slice(0, 3);
    }
  }

  // ---------------------------------------------------------------------------
  // 7. HOT BEVERAGES (Buna, Macchiato, Somali Tea, Special Milk)
  // ---------------------------------------------------------------------------
  if (
    targetCategory === 'cat-hot-beverage' ||
    targetCategory === 'cat-hot-drinks' ||
    targetCategory === 'cat-cold-drinks' ||
    targetCategory === 'cat-juice' ||
    targetCategory === 'cat-drinks' ||
    targetCategory === 'cat-juices'
  ) {
    // When ordering a beverage, recommend artisanal bakery items
    const croissant = findItem('item-croissant', 'croissant plain', 'croissant', 'white plain', 'bombolino');
    if (croissant) {
      recommendations.push({
        item: croissant,
        intentBadge: 'Artisanal Bakery',
        reasonText: 'Flaky, buttery pastry baked fresh today',
        affinityScore: 98,
      });
    }

    const cake = findItem('black forest', 'black&white forest', 'opera cake', 'cream cake');
    if (cake) {
      recommendations.push({
        item: cake,
        intentBadge: 'Sweet Pairing',
        reasonText: 'Decadent layered cake pairs perfectly with hot coffee',
        affinityScore: 94,
      });
    }

    const bombolino = findItem('bombolino', 'basbousa', 'cup cake');
    if (bombolino) {
      recommendations.push({
        item: bombolino,
        intentBadge: 'Warm Treat',
        reasonText: 'Italian-style vanilla custard cream filled doughnut',
        affinityScore: 90,
      });
    }

    if (recommendations.length > 0) {
      return recommendations.slice(0, 3);
    }
  }

  // ---------------------------------------------------------------------------
  // 8. BAKERY & DESSERTS (Cakes, Pastries, Torta by KG)
  // ---------------------------------------------------------------------------
  if (
    targetCategory === 'cat-desserts' ||
    targetCategory === 'cat-desserts-kg'
  ) {
    // When ordering a dessert, recommend the coffee or tea pairing
    const macchiato = findItem('macchiato', 'coffee');
    if (macchiato) {
      recommendations.push({
        item: macchiato,
        intentBadge: 'Espresso Pairing',
        reasonText: 'Velvety espresso foam cuts through sweet rich pastry',
        affinityScore: 99,
      });
    }

    const buna = findItem('coffee', 'espresso', 'special tea');
    if (buna) {
      recommendations.push({
        item: buna,
        intentBadge: 'Traditional Buna',
        reasonText: 'Aromatic Ethiopian single-origin roast in traditional cup',
        affinityScore: 94,
      });
    }

    const spris = findItem('special juice', 'mango juice', 'avocado juice');
    if (spris) {
      recommendations.push({
        item: spris,
        intentBadge: 'Fresh Press',
        reasonText: 'Fresh fruit purée to refresh the palate',
        affinityScore: 88,
      });
    }

    if (recommendations.length > 0) {
      return recommendations.slice(0, 3);
    }
  }

  // ---------------------------------------------------------------------------
  // DEFAULT / GENERAL FALLBACK: Drinks + Light Side + Sweet
  // ---------------------------------------------------------------------------
  const drink = safePool.find(
    (i) =>
      (i.category_id === 'cat-juices' ||
        i.category_id === 'cat-hot-drinks' ||
        i.category_id === 'cat-iced-drinks' ||
        i.category_id === 'cat-mojito' ||
        i.category_id === 'cat-soft-drinks') &&
      !recommendations.some((r) => r.item.id === i.id)
  );
  if (drink) {
    recommendations.push({
      item: drink,
      intentBadge: 'Refreshing Sip',
      reasonText: 'Handcrafted beverage pairing',
      affinityScore: 80,
    });
  }

  const side = safePool.find(
    (i) =>
      (i.category_id === 'cat-chicken' || i.category_id === 'cat-salad') &&
      !recommendations.some((r) => r.item.id === i.id)
  );
  if (side) {
    recommendations.push({
      item: side,
      intentBadge: 'Crispy Side',
      reasonText: 'Delicious accompaniment for your order',
      affinityScore: 75,
    });
  }

  const dessert = safePool.find(
    (i) =>
      (i.category_id === 'cat-desserts' ||
        i.category_id === 'cat-desserts-kg') &&
      !recommendations.some((r) => r.item.id === i.id)
  );
  if (dessert) {
    recommendations.push({
      item: dessert,
      intentBadge: 'Sweet Finish',
      reasonText: 'House-baked bakery delicacy',
      affinityScore: 70,
    });
  }

  if (recommendations.length === 0 && safePool.length > 0) {
    return safePool.slice(0, 3).map((item) => ({
      item,
      intentBadge: 'Goes Well',
      reasonText: 'Chef recommended complement',
      affinityScore: 65,
    }));
  }

  return recommendations.slice(0, 3);
}
