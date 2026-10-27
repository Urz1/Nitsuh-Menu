const fs = require('fs');
const path = require('path');
const dns = require('dns');
const { Agent, setGlobalDispatcher } = require('undici');

setGlobalDispatcher(
  new Agent({
    connect: {
      lookup: (h, opt, cb) => dns.lookup(h, { ...opt, family: 4 }, cb),
    },
  })
);

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const { neon } = require('@neondatabase/serverless');
const sql = neon(env.DATABASE_URL);

// Load Cloudinary mapping
const cacheFilePath = path.join(__dirname, 'cloudinary-dishes-map.json');
const cloudinaryMap = fs.existsSync(cacheFilePath)
  ? JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'))
  : {};

// Official Menu Data from user request + PDF specifications
const menuCategories = [
  {
    name: 'Breakfast / ቁርስ',
    name_am: 'ቁርስ',
    icon: 'Coffee',
    items: [
      { name: 'Foul', name_am: 'ፉል', price: 350 },
      { name: 'Foul Special', name_am: 'ፉል ስፔሻል', price: 450 },
      { name: 'Scrambled Egg', name_am: 'እንቁላል ፍርፍር', price: 400 },
      { name: 'Scrambled Egg With Meat', name_am: 'እንቁላል ፍርፍር በስጋ', price: 500 },
      { name: 'Egg Sandwich', name_am: 'እንቁላል ሳንድች', price: 400 },
      { name: 'Omelet', name_am: 'አምሌት', price: 400 },
      { name: 'Omelet With Cheese', name_am: 'አምሌት በቺዝ', price: 500 },
      { name: 'Special Omelet', name_am: 'ስፔሻል አምሌት', price: 550 },
      { name: 'Chechebsa With Honey', name_am: 'ጨጨብሳ በማር', price: 350 },
      { name: 'Chechebsa With Egg', name_am: 'ጨጨብሳ በእንቁላል', price: 400 },
      { name: 'Fetira With Honey', name_am: 'ፈጢራ በማር', price: 350 },
      { name: 'Fetira With Egg', name_am: 'ፈጢራ በእንቁላል', price: 400 },
      { name: 'Avocado Toast', name_am: 'አቮካዶ በቶስት ዳቦ', price: 450 },
      { name: 'Beef & Cheese Sandwich', name_am: 'ቢፍ በቺዝ ሳንድች', price: 600 },
      { name: 'French Toast', name_am: 'ፍሬንች ቶስት', price: 500 },
      { name: 'Pan Cake', name_am: 'ፓን ኬክ', price: 500 },
    ],
  },
  {
    name: 'Burger',
    name_am: 'በርገር',
    icon: 'UtensilsCrossed',
    items: [
      {
        name: 'Nitsuh Special Burger',
        price: 800,
        description: 'Double Beef, Double Cheese, Egg, House Mayo, tomato, onion, lettuce & Fries',
      },
      {
        name: 'Texas Style BBQ Burger',
        price: 750,
        description: 'Double Beef, Cheese, triple BBQ Sauce, Mayo, tomato, onion, lettuce & Fries',
      },
      {
        name: 'Spicy Burger',
        price: 750,
        description: 'Double beef, Cheese, Double Chili Sauce, Mayo, tomato, onion, lettuce & Fries',
      },
      {
        name: 'Junky Burger',
        price: 950,
        description: 'Tripple Beef, Double Cheese, Double egg, House Sauce Mayo, tomato, onion, lettuce & Fries',
      },
      {
        name: 'Beef Burger',
        price: 500,
        description: 'Beef, Mayo, tomato, onion, lettuce & Fries',
      },
      {
        name: 'Cheese Burger',
        price: 550,
        description: 'Beef, Cheese, Mayo, tomato, onion, lettuce & Fries',
      },
      {
        name: 'Double Beef Burger',
        price: 600,
        description: 'Double Beef, Mayo, tomato, onion, lettuce & Fries',
      },
      {
        name: 'Double Cheese Burger',
        price: 670,
        description: 'Double Beef, Double Cheese, tomato, onion, lettuce & Fries',
      },
      {
        name: 'Chicken Burger',
        price: 600,
        description: 'Chicken, Mayo, Honey Mustard sauce, tomato, onion, lettuce & Fries',
      },
      {
        name: 'Special Chicken Burger',
        price: 950,
        description: 'Double Chicken, Cheese, Mayo, Honey Mustard sauce, tomato, onion, lettuce & Fries',
      },
      {
        name: 'Fasting Burger',
        price: 400,
        is_fasting: true,
        description: 'Fasting Burger, ketchup, tomato, onion, lettuce & Fries',
      },
      {
        name: 'Slider Burger',
        price: 750,
        description: '3 mini buns, 3 mini Beef, Cheese, Mayo, Tomato, Onion, Lettuce & Fries',
      },
      // Burger Extra
      { name: 'Fried Egg', price: 60, tags: ['extra'] },
      { name: 'Ketchup', price: 60, tags: ['extra'] },
      { name: 'Mayonnaise', price: 80, tags: ['extra'] },
      { name: 'Slice Cheese', price: 60, tags: ['extra'] },
    ],
  },
  {
    name: 'Pizza',
    name_am: 'ፒዛ',
    icon: 'Flame',
    items: [
      {
        name: 'House Special Pizza',
        price: 950,
        description: 'Tomato Sauce, Beef, Chicken, Boiled egg, Slice beef, Olive & Mozzarella Cheese',
      },
      {
        name: 'Tuna Pizza',
        price: 850,
        description: 'Tomato Sauce, Tuna & Mozzarella Cheese',
      },
      {
        name: 'Chicken Pizza',
        price: 850,
        description: 'Tomato Sauce, Chicken & Mozzarella Cheese',
      },
      {
        name: 'Meet Pizza',
        price: 800,
        description: 'Tomato Sauce, Beef & Mozzarella Cheese',
      },
      {
        name: 'Pizza Margarita',
        price: 750,
        description: 'Tomato Sauce & Mozzarella Cheese',
      },
      {
        name: 'Fasting Vegetable Pizza',
        price: 550,
        is_fasting: true,
        description: 'Tomato Sauce & Vegetables',
      },
      {
        name: 'Fasting Special Pizza',
        price: 750,
        is_fasting: true,
        description: 'Tomato Sauce, Vegetables, Tuna, & Olive',
      },
      {
        name: 'Fasting Tuna Pizza',
        price: 700,
        is_fasting: true,
        description: 'Tomato Sauce, Tuna',
      },
      // Pizza Extra
      { name: 'Boil Egg', price: 60, tags: ['extra'] },
      { name: 'Chili', price: 60, tags: ['extra'] },
      { name: 'Mozzarella Cheese', price: 180, tags: ['extra'] },
      { name: 'Tuna', price: 180, tags: ['extra'] },
      { name: 'Chicken', price: 300, tags: ['extra'] },
    ],
  },
  {
    name: 'Club Sandwich',
    name_am: 'ክለብ ሳንድዊች',
    icon: 'UtensilsCrossed',
    items: [
      {
        name: 'Special Club Sandwich',
        price: 750,
        description: 'Beef, Chicken, Boiled egg, Mayo, Tomato, Lettuce, Onion, & Fries',
      },
      {
        name: 'Chicken Club Sandwich',
        price: 700,
        description: 'Chicken, Boiled egg, Mayo, Tomato, Lettuce, Onion, & Fries',
      },
      {
        name: 'Tuna Club Sandwich',
        price: 700,
        description: 'Tuna, Boiled egg, Mayo, Tomato, Lettuce, Onion, & Fries',
      },
      {
        name: 'Beef Club Sandwich',
        price: 650,
        description: 'Beef, Boiled egg, Mayo, Tomato, Lettuce, Onion, & Fries',
      },
      {
        name: 'Fasting Tuna Club Sand.',
        price: 650,
        is_fasting: true,
        description: 'Tuna, Ketchup, Tomato, Lettuce, Onion, & Fries',
      },
      {
        name: 'Chicken Sandwich',
        price: 900,
        description: 'Chicken, Cheese, Mayo, Tomato, Lettuce, Onion, & Fries',
      },
      {
        name: 'Steak Sandwich',
        price: 900,
        description: 'Beef, Cheese, Mayo, Tomato, Lettuce, Onion, & Fries',
      },
      {
        name: 'Tuna Sandwich',
        price: 900,
        description: 'Tuna, Cheese, Mayo, Tomato, Lettuce, Onion, & Fries',
      },
      {
        name: 'Avocado Sandwich',
        price: 600,
        description: 'Avocado, Ketchup, Tomato, Lettuce, Onion, & Fries',
      },
    ],
  },
  {
    name: 'Wrap',
    name_am: 'ራፕ',
    icon: 'UtensilsCrossed',
    items: [
      {
        name: 'Special Wrap',
        price: 850,
        description: 'Beef, Chicken, Boiled egg, Cheese, Mayo, Tomato, Onion, & Fries',
      },
      {
        name: 'Chicken Wrap',
        price: 750,
        description: 'Chicken, Cheese, Mayo, Tomato, Onion, & Fries',
      },
      {
        name: 'Tuna Wrap',
        price: 750,
        description: 'Tuna, Cheese, Mayo, Tomato, Onion, & Fries',
      },
      {
        name: 'Beef Wrap',
        price: 650,
        description: 'Beef, Cheese, Mayo, Tomato, Onion, & Fries',
      },
      {
        name: 'Fasting Tuna Wrap',
        price: 650,
        is_fasting: true,
        description: 'Tuna, Ketchup, Tomato, Onion, & Fries',
      },
      {
        name: 'Fasting Vegetable Wrap',
        price: 550,
        is_fasting: true,
        description: 'Vegetables, Ketchup, Tomato, Onion, & Fries',
      },
    ],
  },
  {
    name: 'Chicken',
    name_am: 'ዶሮ',
    icon: 'Flame',
    items: [
      {
        name: 'Chicken Nuggate',
        price: 1200,
        description: 'Chicken, Mayo, Fries',
      },
      {
        name: 'Crispy Chicken Strips',
        price: 1500,
        description: 'Slice Chicken Strips, Mayo, Fries',
      },
      {
        name: 'Crispy Fried Chicken Leg (1 pic)',
        price: 1200,
        description: '1 Chicken leg, Mayo, Salad & Fries',
      },
      {
        name: 'Crispy Fried Chicken Leg (2 pic)',
        price: 2200,
        description: '2 Chicken leg, Mayo, Salad & Fries',
      },
      {
        name: 'Chicken Leg with Honey BBQ Souce',
        price: 1500,
        description: '1 pic Chicken Leg, Honey BBQ Sauce, Mayo, Salad & Fries',
      },
      {
        name: 'Chicken Wings',
        price: 1000,
        description: 'Chicken Wings, Mayo, Fries',
      },
      {
        name: 'Chicken Wings with Honey BBQ Souce',
        price: 1300,
        description: 'Chicken Wings, Honey BBQ Souce, Mayo, Fries',
      },
      {
        name: 'Chicken Special Combo',
        price: 2500,
        description: '1 pic Chicken Fried Leg, Wings, Chicken Strip, Mayo, Salad & Fries',
      },
    ],
  },
  {
    name: 'Salad',
    name_am: 'ሰላጣ',
    icon: 'UtensilsCrossed',
    items: [
      {
        name: 'Special salad',
        price: 1100,
        description: 'Chicken, tuna, Salad, tomato, carrot, cucumber, onion, chili, olives, kidney bean, mayo, salad souce',
      },
      {
        name: 'Fasting Special salad',
        price: 900,
        is_fasting: true,
        description: 'Avocado Salad, tomato, carrot, cucumber, onion, chili, olives, kidney bean, salad souce',
      },
      {
        name: 'Tuna Salad',
        price: 900,
        description: 'Tuna, Salad, tomato, carrot, cucumber, onion, chili, mayo, salad souce',
      },
      {
        name: 'Chicken Salad',
        price: 900,
        description: 'Chicken, Salad, tomato, carrot, cucumber, onion, chili, mayo, salad souce',
      },
      {
        name: 'Avocado Salad',
        price: 700,
        description: 'Avocado Salad, tomato, carrot, cucumber, onion, chili, salad souce',
      },
      {
        name: 'Normal Salad',
        price: 700,
        description: 'Salad, tomato, carrot, cucumber, onion, chili, kidney bean, salad souce',
      },
    ],
  },
  {
    name: 'Pasta',
    name_am: 'ፓስታ',
    icon: 'UtensilsCrossed',
    items: [
      {
        name: 'Tomato Pasta',
        price: 500,
        description: 'Pasta With Tomato souce & Bread',
      },
      {
        name: 'Vegi Pasta',
        price: 500,
        is_fasting: true,
        description: 'Pasta With Vegtables & Bread',
      },
      {
        name: 'Tuna Pasta',
        price: 500,
        description: 'Pasta With Tomato souce Tuna & Bread',
      },
      {
        name: 'Tomato Pasta With Meat',
        price: 650,
        description: 'Pasta With Tomato souce, Meat & Bread',
      },
      {
        name: 'Arabiyata Pasta',
        price: 650,
        description: 'Pasta With Tomato souce, Hot Spicy & Bread',
      },
      {
        name: 'Alfredo Pasta',
        price: 750,
        description: 'Pasta With Creamy souce, Cheese & Bread',
      },
      {
        name: 'Alfredo Pasta With Chicken',
        price: 900,
        description: 'Pasta With Creamy souce, Chicken, Cheese & Bread',
      },
      {
        name: 'Pesto Pasta',
        price: 750,
        description: 'Pasta With Pesto souce, Cheese & Bread',
      },
    ],
  },
  {
    name: 'Mojito',
    name_am: 'ሞሂቶ',
    icon: 'Coffee',
    items: [
      {
        name: 'Classic Mojito',
        price: 450,
        description: 'Lemon, Mint, Pineapple, Cinnamon, Honey syrup, Fresh Mint, Soft drink, Ice',
      },
      {
        name: 'Lemon Mint Mojito',
        price: 350,
        description: 'Lemon juice, Fresh Mint, Soft drink, Honey syrup, Ice',
      },
      {
        name: 'Pineapple Mojito',
        price: 350,
        description: 'Pineapple Rum, Lemon juice, Mint, Soft drink, Ice',
      },
      {
        name: 'Watermelon Mojito',
        price: 350,
        description: 'Watermelon Rum, Honey syrup, Lemon, Fresh Mint, Ambo water, Ice',
      },
      {
        name: 'Strawberry Mojito',
        price: 350,
        description: 'Strawberry Rum, Honey syrup, Lemon, Soft drink, Fresh Mint, Ice',
      },
      {
        name: 'Ginger Mojito',
        price: 350,
        description: 'Ginger juice, Sugar syrup, Soft drink, Lemon, Fresh Mint, Ice',
      },
      {
        name: 'Cinnamon Mojito',
        price: 350,
        description: 'Cinnamon, Lemon, Soft drink, Sugar syrup, Fresh Mint, Ice, Mojito',
      },
    ],
  },
  {
    name: 'Soft Drinks',
    name_am: 'ለስላሳ መጠጦች',
    icon: 'Coffee',
    items: [
      { name: 'Soft Drink', price: 90 },
      { name: 'Novida Soft Drink', price: 90 },
      { name: 'Bottle Soft Drink', price: 100 },
      { name: 'Ambo water', price: 90 },
      { name: 'Water ½ Liter', price: 50 },
      { name: 'Water 1 Liter', price: 70 },
      { name: 'Water 2 Liter', price: 80 },
    ],
  },
  {
    name: 'Juices',
    name_am: 'ጁስ',
    icon: 'Coffee',
    items: [
      { name: 'Special Juice', price: 450 },
      { name: 'Papaya Juice', price: 320 },
      { name: 'Avocado Juice', price: 320 },
      { name: 'Watermelon Juice', price: 400 },
      { name: 'Mango Juice', price: 400 },
      { name: 'Pineapple Juice', price: 400 },
      { name: 'Strawberry Juice', price: 400 },
      { name: 'Lemon Mint Juice', price: 400 },
    ],
  },
  {
    name: 'Shakes',
    name_am: 'ሼክ',
    icon: 'Coffee',
    items: [
      { name: 'Banana Shake', price: 450 },
      { name: 'Strawberry Shake', price: 450 },
      { name: 'Avocado Shake', price: 450 },
      { name: 'Mocha Shake', price: 450 },
      { name: 'Flaxseed Shake', price: 450 },
      { name: 'Chocolate Shake', price: 450 },
      { name: 'Protien Shake', price: 600 },
    ],
  },
  {
    name: 'Hot Drinks',
    name_am: 'ትኩስ መጠጦች',
    icon: 'Coffee',
    items: [
      { name: 'Tea', price: 60 },
      { name: 'Coffee', price: 70 },
      { name: 'Espresso', price: 140 },
      { name: 'Macchiato', price: 110 },
      { name: 'Milk', price: 120 },
      { name: 'Milk with coffee', price: 140 },
      { name: 'Milk with Tea', price: 140 },
      { name: 'Fasting Macchiato', price: 200, is_fasting: true },
      { name: 'Tea Sprice', price: 100 },
      { name: 'Lemon Tea', price: 70 },
      { name: 'Mint Tea', price: 70 },
      { name: 'Peanut Tea', price: 140 },
      { name: 'Pineapple Tea', price: 140 },
      { name: 'Orange Tea', price: 140 },
      { name: 'Caramel Latte', price: 170 },
      { name: 'Vanilla Latte', price: 170 },
      { name: 'Ginger Latte', price: 170 },
      { name: 'Hot Chocolate', price: 170 },
      { name: 'Hot Caramel', price: 170 },
      { name: 'Cuppuchino', price: 170 },
      { name: 'Special Tea', price: 180 },
    ],
  },
  {
    name: 'Iced Drink',
    name_am: 'ቀዝቃዛ መጠጦች',
    icon: 'Coffee',
    items: [
      { name: 'ICE Latte', price: 450, description: 'Coffee, milk, sugar syrup, Ice' },
      { name: 'ICE Tea', price: 450, description: 'Tea, milk, sugar syrup, Ice' },
      { name: 'ICE Vanilla', price: 450, description: 'Vanilla, coffee, milk, sugar syrup, Ice' },
      { name: 'ICE Chocolate', price: 450, description: 'Chocolate syrup, coffee, milk, sugar syrup, Ice' },
      { name: 'ICE Caramel', price: 450, description: 'Caramel syrup, coffee, milk, sugar syrup, Ice' },
      { name: 'ICE Strawberry', price: 450, description: 'Strawberry syrup, coffee, milk, sugar syrup, Ice' },
      { name: 'ICE Deluxe', price: 600, description: 'Chocolate, caramel, vanilla, coffee, milk, sugar syrup, Ice' },
    ],
  },
  {
    name: 'Desserts',
    name_am: 'ጣፋጮች',
    icon: 'Flame',
    items: [
      { name: 'Mini Custard Vanilla cake', price: 80 },
      { name: 'Mini Millifoni cake', price: 80 },
      { name: 'Mini Chocolate cake', price: 100 },
      { name: 'Tart cake', price: 80 },
      { name: 'Mini Boxega cake', price: 80 },
      { name: 'English Cake', price: 150 },
      { name: 'Classic Dounut', price: 200 },
      { name: 'Chocolate Chips Cookie', price: 250 },
      { name: 'Croissant', price: 250 },
      { name: 'Chocolate Croissant', price: 350 },
      { name: 'Tiramisu cake', price: 400 },
    ],
  },
  {
    name: 'Desserts / KG',
    name_am: 'ጣፋጮች በኪሎ',
    icon: 'Flame',
    items: [
      { name: 'Custard Vanilla Torta 1Kg', price: 2000 },
      { name: 'Millifoni Torta 1Kg', price: 2200 },
      { name: 'Chocolate Torta 1Kg', price: 2500 },
      { name: 'Tiramisu 1Kg', price: 2500 },
      { name: 'Butter Cookeis 1Kg', price: 1600 },
      { name: 'Chocolate Chips Cookeis 1Kg', price: 2000 },
      { name: 'English Cake 1Kg', price: 800 },
      { name: 'Marble Cake 1Kg', price: 800 },
    ],
  },
];

// Mapping alias for image files
const aliasMap = {
  'Scrambled Egg': 'Scrampled_egg.jpeg',
  'Scrambled Egg With Meat': 'scrampled_egg_with_meat.jpeg',
  'Classic Dounut': 'Classic Donut.jpg',
  'Cuppuchino': 'Cappuccino.jpeg',
  'Protien Shake': 'Protein Shake.jpg',
  'Butter Cookeis 1Kg': 'Butter Cookies.jpeg',
  'Chocolate Chips Cookeis 1Kg': 'Chocolate Chips Cookies 1Kg..jpeg',
  'Chicken Leg with Honey BBQ Souce': 'Chicken Leg with Honey BBQ .jpeg',
  'Chicken Wings with Honey BBQ Souce': 'Wings with Honey BBQ.jpeg',
  'Soft Drink': 'Soft Drink (Can).jpeg',
  'Special Juice': 'Special Juice (Spris).jpeg',
  'Meet Pizza': 'Meat Pizza.jpeg',
  'Coffee': 'buna.jpeg',
  'Boil Egg': 'Extra Boiled Egg.jpeg',
  'Ketchup': 'Extra Ketchup.jpg',
  'Mayonnaise': 'Extra Mayonnaise.jpeg',

  // Multi-dish files explicitly named with backslashes
  'Nitsuh Special Burger': 'Nitsuh Special \\ Junky Burger.jpeg',
  'Junky Burger': 'Nitsuh Special \\ Junky Burger.jpeg',
  'Crispy Fried Chicken Leg (1 pic)': 'Crispy Fried Chicken Leg (1 \\ 2 pcs) .jpeg',
  'Crispy Fried Chicken Leg (2 pic)': 'Crispy Fried Chicken Leg (1 \\ 2 pcs) .jpeg',
  'Water ½ Liter': 'Bottled Water (0.5L \\ 1L \\ 2L)..jpeg',
  'Water 1 Liter': 'Bottled Water (0.5L \\ 1L \\ 2L)..jpeg',
  'Water 2 Liter': 'Bottled Water (0.5L \\ 1L \\ 2L)..jpeg',
  'Tuna Pizza': 'Tuna \\ Fasting Tuna Pizza.jpeg',
  'Fasting Tuna Pizza': 'Tuna \\ Fasting Tuna Pizza.jpeg',
  'Fasting Vegetable Pizza': 'Fasting Vegetable \\ Special Pizza.jpeg',
  'Fasting Special Pizza': 'Fasting Vegetable \\ Special Pizza.jpeg',
  'Tuna Club Sandwich': 'Tuna \\ Fasting Tuna Club.jpeg',
  'Fasting Tuna Club Sand.': 'Tuna \\ Fasting Tuna Club.jpeg',
  'Tuna Wrap': 'Tuna \\ Fasting Tuna Wrap.jpeg',
  'Fasting Tuna Wrap': 'Tuna \\ Fasting Tuna Wrap.jpeg',
  'Orange Tea': 'Orange Tea \\ Special Tea.jpeg',
  'Special Tea': 'Orange Tea \\ Special Tea.jpeg',
  'Omelet With Cheese': 'Omelet_With Cheese.jpeg',
};

const cleanName = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

function resolveImageUrl(itemName) {
  let file = aliasMap[itemName];
  if (!file) {
    const itemClean = cleanName(itemName);
    for (const f of Object.keys(cloudinaryMap)) {
      const base = f.replace(/\.[^.]+$/, '');
      if (cleanName(base) === itemClean) {
        file = f;
        break;
      }
    }
  }

  if (file && cloudinaryMap[file]) {
    return cloudinaryMap[file];
  }
  return null;
}

async function seed() {
  console.log('Seeding Neon database with complete official menu...');

  const restaurants = await sql`SELECT id FROM restaurants LIMIT 1`;
  if (!restaurants.length) {
    throw new Error('No restaurant found in Neon!');
  }
  const restaurantId = restaurants[0].id;
  console.log('Target Restaurant ID:', restaurantId);

  // Clear existing items and categories
  await sql`DELETE FROM items WHERE restaurant_id = ${restaurantId}`;
  await sql`DELETE FROM categories WHERE restaurant_id = ${restaurantId}`;
  console.log('Cleared existing items and categories.');

  const missingImageDishes = [];
  const populatedDishes = [];

  let catSort = 10;
  for (const cat of menuCategories) {
    const firstDishImage = cat.items.map((i) => resolveImageUrl(i.name)).find(Boolean) || null;
    await sql`
      INSERT INTO categories (id, restaurant_id, name, name_am, icon, image_url, sort_order, is_active)
      VALUES (${catId}, ${restaurantId}, ${cat.name}, ${cat.name_am || null}, ${cat.icon || 'UtensilsCrossed'}, ${firstDishImage}, ${catSort}, true)
    `;
    console.log(`\nCreated Category [${catSort}]: ${cat.name}`);

    let itemSort = 10;
    for (const item of cat.items) {
      const imageUrl = resolveImageUrl(item.name);
      const itemId = `item_${cleanName(cat.name).slice(0, 5)}_${cleanName(item.name).slice(0, 15)}_${itemSort}`;

      if (imageUrl) {
        populatedDishes.push({ name: item.name, category: cat.name, url: imageUrl });
      } else {
        missingImageDishes.push({ name: item.name, category: cat.name, price: item.price });
      }

      await sql`
        INSERT INTO items (
          id, restaurant_id, category_id, name, name_am, description, price, image_url,
          is_available, is_fasting, is_draft, is_archived, sort_order, tags, created_at, updated_at
        ) VALUES (
          ${itemId},
          ${restaurantId},
          ${catId},
          ${item.name},
          ${item.name_am || null},
          ${item.description || null},
          ${item.price},
          ${imageUrl},
          true,
          ${Boolean(item.is_fasting)},
          false,
          false,
          ${itemSort},
          ${item.tags ? item.tags : []},
          NOW(),
          NOW()
        )
      `;

      itemSort += 10;
    }
    catSort += 10;
  }

  console.log('\n================ SEED COMPLETE ================');
  console.log(`✓ Total Dishes Inserted: ${populatedDishes.length + missingImageDishes.length}`);
  console.log(`✓ Dishes with Cloudinary Images: ${populatedDishes.length}`);
  console.log(`! Dishes with NO MATCHING Image (image_url set to null): ${missingImageDishes.length}`);

  if (missingImageDishes.length > 0) {
    console.log('\n--- LIST OF DISHES WITH NO MATCHING IMAGE ---');
    missingImageDishes.forEach((d) => {
      console.log(`• [${d.category}] ${d.name} (${d.price} ETB)`);
    });
  }

  // Write detailed report to scratch file for reference
  fs.writeFileSync(
    path.join(__dirname, 'seed-report.json'),
    JSON.stringify({ populatedCount: populatedDishes.length, missingCount: missingImageDishes.length, missingImageDishes }, null, 2)
  );
}

seed().catch(console.error);
