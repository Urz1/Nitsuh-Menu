import { MOCK_ITEMS_NITSUH } from "../src/lib/data-provider";

// Direct Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vekhuxcaqybqkoxfknfk.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_oLod2_N8a7RgMgxmVf8Zvg_qV9kc7OR";
const RESTAURANT_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

export interface RawCategory {
  id: string;
  name: string;
  name_am: string;
  icon: string;
  description: string;
  sort_order: number;
}

export interface RawDish {
  name: string;
  price: number;
  category_id: string;
  tags?: string[];
  allergens?: string[];
  spice_level?: number;
  is_chefs_pick?: boolean;
}

export const CATEGORIES_DATA: RawCategory[] = [
  {
    "id": "cat-breakfast",
    "name": "Breakfast",
    "name_am": "ቁርስ",
    "icon": "🍳",
    "description": "Traditional breakfast platters, foul, fetira, chechebsa, eggs and morning toasts.",
    "sort_order": 10
  },
  {
    "id": "cat-burger",
    "name": "Burgers",
    "name_am": "በርገር",
    "icon": "🍔",
    "description": "Handcrafted gourmet burgers, beef patties, chicken burgers and seasoned fries.",
    "sort_order": 20
  },
  {
    "id": "cat-pizza",
    "name": "Pizzas",
    "name_am": "ፒዛ",
    "icon": "🍕",
    "description": "Crispy crust pizzas baked with rich tomato sauce, melted mozzarella and fresh toppings.",
    "sort_order": 30
  },
  {
    "id": "cat-club-sandwich",
    "name": "Club Sandwich",
    "name_am": "ክለብ ሳንድዊች",
    "icon": "🥪",
    "description": "Layered triple-decker club sandwiches, chicken, tuna, steak and avocado.",
    "sort_order": 40
  },
  {
    "id": "cat-wrap",
    "name": "Wraps",
    "name_am": "ራፕ",
    "icon": "🌯",
    "description": "Rolled warm tortilla wraps filled with tender meats, cheese and house sauces.",
    "sort_order": 50
  },
  {
    "id": "cat-chicken",
    "name": "Chicken",
    "name_am": "ዶሮ",
    "icon": "🍗",
    "description": "Crispy fried chicken legs, golden nuggets, strips, wings and honey BBQ platters.",
    "sort_order": 60
  },
  {
    "id": "cat-salad",
    "name": "Salad",
    "name_am": "ሰላጣ",
    "icon": "🥗",
    "description": "Crisp garden salads, tuna, chicken, avocado and fasting dressings.",
    "sort_order": 70
  },
  {
    "id": "cat-pasta",
    "name": "Pasta",
    "name_am": "ፓስታ",
    "icon": "🍝",
    "description": "Italian style pasta bowls: tomato, Alfredo, creamy chicken, arrabbiata and pesto.",
    "sort_order": 80
  },
  {
    "id": "cat-mojito",
    "name": "Mojitos",
    "name_am": "ሞሂቶ",
    "icon": "🍹",
    "description": "Refreshing iced fruit mojitos, mint, lemon, pineapple, watermelon and strawberry.",
    "sort_order": 90
  },
  {
    "id": "cat-soft-drinks",
    "name": "Soft Drinks & Water",
    "name_am": "ለስላሳ መጠጦች እና ውሃ",
    "icon": "🥤",
    "description": "Chilled bottled and canned soft drinks, Novida, mineral water and Ambo water.",
    "sort_order": 100
  },
  {
    "id": "cat-juices",
    "name": "Fresh Juices",
    "name_am": "ትኩስ ጭማቂዎች",
    "icon": "🧃",
    "description": "100% freshly pressed juices: avocado, mango, papaya, watermelon, strawberry.",
    "sort_order": 110
  },
  {
    "id": "cat-shakes",
    "name": "Shakes",
    "name_am": "ሼክ",
    "icon": "🥛",
    "description": "Creamy thick milkshakes: banana, strawberry, mocha, avocado, flaxseed and protein.",
    "sort_order": 120
  },
  {
    "id": "cat-hot-drinks",
    "name": "Hot Drinks",
    "name_am": "ትኩስ መጠጦች",
    "icon": "☕",
    "description": "Single-origin Ethiopian coffee, macchiato, espresso, teas, and specialty lattes.",
    "sort_order": 130
  },
  {
    "id": "cat-iced-drinks",
    "name": "Iced Drinks",
    "name_am": "ቀዝቃዛ መጠጦች",
    "icon": "🧊",
    "description": "Chilled iced latte, iced tea, vanilla, caramel, strawberry and deluxe iced coffee.",
    "sort_order": 140
  },
  {
    "id": "cat-desserts",
    "name": "Desserts & Pastries",
    "name_am": "ጣፋጮች እና ኬኮች",
    "icon": "🧁",
    "description": "Freshly baked mini cakes, custard vanilla, donuts, croissants and cookies.",
    "sort_order": 150
  },
  {
    "id": "cat-desserts-kg",
    "name": "Torta & Cakes (Per KG)",
    "name_am": "ኬክ በኪሎ",
    "icon": "🎂",
    "description": "Celebration tortas and whole cakes sold by the kilogram for events and gatherings.",
    "sort_order": 160
  }
];

export const DISHES_DATA: RawDish[] = [
  {
    "name": "Foul",
    "price": 350,
    "category_id": "cat-breakfast",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Foul Special",
    "price": 450,
    "category_id": "cat-breakfast",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Scrambled Egg",
    "price": 400,
    "category_id": "cat-breakfast",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Scrambled Egg With Meat",
    "price": 500,
    "category_id": "cat-breakfast",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Egg Sandwich",
    "price": 400,
    "category_id": "cat-breakfast",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Omelet",
    "price": 400,
    "category_id": "cat-breakfast",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Omelet With Cheese",
    "price": 500,
    "category_id": "cat-breakfast",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Special Omelet",
    "price": 550,
    "category_id": "cat-breakfast",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Chechebsa With Honey",
    "price": 350,
    "category_id": "cat-breakfast",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Chechebsa With Egg",
    "price": 400,
    "category_id": "cat-breakfast",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Fetira With Honey",
    "price": 350,
    "category_id": "cat-breakfast",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Fetira With Egg",
    "price": 400,
    "category_id": "cat-breakfast",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Avocado Toast",
    "price": 450,
    "category_id": "cat-breakfast",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Beef & Cheese Sandwich",
    "price": 600,
    "category_id": "cat-breakfast",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "French Toast",
    "price": 500,
    "category_id": "cat-breakfast",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Pan Cake",
    "price": 500,
    "category_id": "cat-breakfast",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Nitsuh Special Burger",
    "price": 800,
    "category_id": "cat-burger",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_chefs_pick": true
  },
  {
    "name": "Texas Style BBQ Burger",
    "price": 750,
    "category_id": "cat-burger",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Spicy Burger",
    "price": 750,
    "category_id": "cat-burger",
    "tags": [],
    "spice_level": 2,
    "is_chefs_pick": false
  },
  {
    "name": "Junky Burger",
    "price": 950,
    "category_id": "cat-burger",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Beef Burger",
    "price": 500,
    "category_id": "cat-burger",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Cheese Burger",
    "price": 550,
    "category_id": "cat-burger",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Double Beef Burger",
    "price": 600,
    "category_id": "cat-burger",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Double Cheese Burger",
    "price": 670,
    "category_id": "cat-burger",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Chicken Burger",
    "price": 600,
    "category_id": "cat-burger",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Special Chicken Burger",
    "price": 950,
    "category_id": "cat-burger",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Fasting Burger",
    "price": 400,
    "category_id": "cat-burger",
    "tags": [
      "vegan",
      "fasting"
    ],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Slider Burger",
    "price": 750,
    "category_id": "cat-burger",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Fried Egg",
    "price": 60,
    "category_id": "cat-burger",
    "tags": [
      "extra"
    ],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Ketchup",
    "price": 60,
    "category_id": "cat-burger",
    "tags": [
      "extra"
    ],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Mayonnaise",
    "price": 80,
    "category_id": "cat-burger",
    "tags": [
      "extra"
    ],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Slice Cheese",
    "price": 60,
    "category_id": "cat-burger",
    "tags": [
      "extra"
    ],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "House Special Pizza",
    "price": 950,
    "category_id": "cat-pizza",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_chefs_pick": true
  },
  {
    "name": "Tuna Pizza",
    "price": 850,
    "category_id": "cat-pizza",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Chicken Pizza",
    "price": 850,
    "category_id": "cat-pizza",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Meet Pizza",
    "price": 800,
    "category_id": "cat-pizza",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Pizza Margarita",
    "price": 750,
    "category_id": "cat-pizza",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Fasting Vegetable Pizza",
    "price": 550,
    "category_id": "cat-pizza",
    "tags": [
      "vegan",
      "fasting"
    ],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Fasting Special Pizza",
    "price": 750,
    "category_id": "cat-pizza",
    "tags": [
      "vegan",
      "fasting",
      "popular"
    ],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Fasting Tuna Pizza",
    "price": 700,
    "category_id": "cat-pizza",
    "tags": [
      "vegan",
      "fasting"
    ],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Boil Egg",
    "price": 60,
    "category_id": "cat-pizza",
    "tags": [
      "extra"
    ],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Chili",
    "price": 60,
    "category_id": "cat-pizza",
    "tags": [
      "extra"
    ],
    "spice_level": 2,
    "is_chefs_pick": false
  },
  {
    "name": "Mozzarella Cheese",
    "price": 180,
    "category_id": "cat-pizza",
    "tags": [
      "extra"
    ],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Tuna",
    "price": 180,
    "category_id": "cat-pizza",
    "tags": [
      "extra"
    ],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Chicken",
    "price": 300,
    "category_id": "cat-pizza",
    "tags": [
      "extra"
    ],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Special Club Sandwich",
    "price": 750,
    "category_id": "cat-club-sandwich",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_chefs_pick": true
  },
  {
    "name": "Chicken Club Sandwich",
    "price": 700,
    "category_id": "cat-club-sandwich",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Tuna Club Sandwich",
    "price": 700,
    "category_id": "cat-club-sandwich",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Beef Club Sandwich",
    "price": 650,
    "category_id": "cat-club-sandwich",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Fasting Tuna Club Sand.",
    "price": 650,
    "category_id": "cat-club-sandwich",
    "tags": [
      "vegan",
      "fasting"
    ],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Chicken Sandwich",
    "price": 900,
    "category_id": "cat-club-sandwich",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Steak Sandwich",
    "price": 900,
    "category_id": "cat-club-sandwich",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Tuna Sandwich",
    "price": 900,
    "category_id": "cat-club-sandwich",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Avocado Sandwich",
    "price": 600,
    "category_id": "cat-club-sandwich",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Special Wrap",
    "price": 850,
    "category_id": "cat-wrap",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_chefs_pick": true
  },
  {
    "name": "Chicken Wrap",
    "price": 750,
    "category_id": "cat-wrap",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Tuna Wrap",
    "price": 750,
    "category_id": "cat-wrap",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Beef Wrap",
    "price": 650,
    "category_id": "cat-wrap",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Fasting Tuna Wrap",
    "price": 650,
    "category_id": "cat-wrap",
    "tags": [
      "vegan",
      "fasting"
    ],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Fasting Vegetable Wrap",
    "price": 550,
    "category_id": "cat-wrap",
    "tags": [
      "vegan",
      "fasting"
    ],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Chicken Nuggate",
    "price": 1200,
    "category_id": "cat-chicken",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Crispy Chicken Strips",
    "price": 1500,
    "category_id": "cat-chicken",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Crispy Fried Chicken Leg (1 pic)",
    "price": 1200,
    "category_id": "cat-chicken",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Crispy Fried Chicken Leg (2 pic)",
    "price": 2200,
    "category_id": "cat-chicken",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Chicken Leg with Honey BBQ Souce",
    "price": 1500,
    "category_id": "cat-chicken",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Chicken Wings",
    "price": 1000,
    "category_id": "cat-chicken",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Chicken Wings with Honey BBQ Souce",
    "price": 1300,
    "category_id": "cat-chicken",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Chicken Special Combo",
    "price": 2500,
    "category_id": "cat-chicken",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_chefs_pick": true
  },
  {
    "name": "Special salad",
    "price": 1100,
    "category_id": "cat-salad",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Fasting Special salad",
    "price": 900,
    "category_id": "cat-salad",
    "tags": [
      "vegan",
      "fasting",
      "popular"
    ],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Tuna Salad",
    "price": 900,
    "category_id": "cat-salad",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Chicken Salad",
    "price": 900,
    "category_id": "cat-salad",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Avocado Salad",
    "price": 700,
    "category_id": "cat-salad",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Normal Salad",
    "price": 700,
    "category_id": "cat-salad",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Tomato Pasta",
    "price": 500,
    "category_id": "cat-pasta",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Vegi Pasta",
    "price": 500,
    "category_id": "cat-pasta",
    "tags": [
      "vegan",
      "fasting"
    ],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Tuna Pasta",
    "price": 500,
    "category_id": "cat-pasta",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Tomato Pasta With Meat",
    "price": 650,
    "category_id": "cat-pasta",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Arabiyata Pasta",
    "price": 650,
    "category_id": "cat-pasta",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Alfredo Pasta",
    "price": 750,
    "category_id": "cat-pasta",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Alfredo Pasta With Chicken",
    "price": 900,
    "category_id": "cat-pasta",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Pesto Pasta",
    "price": 750,
    "category_id": "cat-pasta",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Classic Mojito",
    "price": 450,
    "category_id": "cat-mojito",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Lemon Mint Mojito",
    "price": 350,
    "category_id": "cat-mojito",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Pineapple Mojito",
    "price": 350,
    "category_id": "cat-mojito",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Watermelon Mojito",
    "price": 350,
    "category_id": "cat-mojito",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Strawberry Mojito",
    "price": 350,
    "category_id": "cat-mojito",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Ginger Mojito",
    "price": 350,
    "category_id": "cat-mojito",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Cinnamon Mojito",
    "price": 350,
    "category_id": "cat-mojito",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Soft Drink",
    "price": 90,
    "category_id": "cat-soft-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Novida Soft Drink",
    "price": 90,
    "category_id": "cat-soft-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Bottle Soft Drink",
    "price": 100,
    "category_id": "cat-soft-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Ambo water",
    "price": 90,
    "category_id": "cat-soft-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Water ½ Liter",
    "price": 50,
    "category_id": "cat-soft-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Water 1 Liter",
    "price": 70,
    "category_id": "cat-soft-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Water 2 Liter",
    "price": 80,
    "category_id": "cat-soft-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Special Juice",
    "price": 450,
    "category_id": "cat-juices",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_chefs_pick": true
  },
  {
    "name": "Papaya Juice",
    "price": 320,
    "category_id": "cat-juices",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Avocado Juice",
    "price": 320,
    "category_id": "cat-juices",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Watermelon Juice",
    "price": 400,
    "category_id": "cat-juices",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Mango Juice",
    "price": 400,
    "category_id": "cat-juices",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Pineapple Juice",
    "price": 400,
    "category_id": "cat-juices",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Strawberry Juice",
    "price": 400,
    "category_id": "cat-juices",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Lemon Mint Juice",
    "price": 400,
    "category_id": "cat-juices",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Banana Shake",
    "price": 450,
    "category_id": "cat-shakes",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Strawberry Shake",
    "price": 450,
    "category_id": "cat-shakes",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Avocado Shake",
    "price": 450,
    "category_id": "cat-shakes",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Mocha Shake",
    "price": 450,
    "category_id": "cat-shakes",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Flaxseed Shake",
    "price": 450,
    "category_id": "cat-shakes",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Chocolate Shake",
    "price": 450,
    "category_id": "cat-shakes",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Protien Shake",
    "price": 600,
    "category_id": "cat-shakes",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Tea",
    "price": 60,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Coffee",
    "price": 70,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Espresso",
    "price": 140,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Macchiato",
    "price": 110,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Milk",
    "price": 120,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Milk with coffee",
    "price": 140,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Milk with Tea",
    "price": 140,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Fasting Macchiato",
    "price": 200,
    "category_id": "cat-hot-drinks",
    "tags": [
      "vegan",
      "fasting"
    ],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Tea Sprice",
    "price": 100,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Lemon Tea",
    "price": 70,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Mint Tea",
    "price": 70,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Peanut Tea",
    "price": 140,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Pineapple Tea",
    "price": 140,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Orange Tea",
    "price": 140,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Caramel Latte",
    "price": 170,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Vanilla Latte",
    "price": 170,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Ginger Latte",
    "price": 170,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Hot Chocolate",
    "price": 170,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Hot Caramel",
    "price": 170,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Cuppuchino",
    "price": 170,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Special Tea",
    "price": 180,
    "category_id": "cat-hot-drinks",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_chefs_pick": true
  },
  {
    "name": "ICE Latte",
    "price": 450,
    "category_id": "cat-iced-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "ICE Tea",
    "price": 450,
    "category_id": "cat-iced-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "ICE Vanilla",
    "price": 450,
    "category_id": "cat-iced-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "ICE Chocolate",
    "price": 450,
    "category_id": "cat-iced-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "ICE Caramel",
    "price": 450,
    "category_id": "cat-iced-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "ICE Strawberry",
    "price": 450,
    "category_id": "cat-iced-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "ICE Deluxe",
    "price": 600,
    "category_id": "cat-iced-drinks",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Mini Custard Vanilla cake",
    "price": 80,
    "category_id": "cat-desserts",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Mini Millifoni cake",
    "price": 80,
    "category_id": "cat-desserts",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Mini Chocolate cake",
    "price": 100,
    "category_id": "cat-desserts",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Tart cake",
    "price": 80,
    "category_id": "cat-desserts",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Mini Boxega cake",
    "price": 80,
    "category_id": "cat-desserts",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "English Cake",
    "price": 150,
    "category_id": "cat-desserts",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Classic Dounut",
    "price": 200,
    "category_id": "cat-desserts",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Chocolate Chips Cookie",
    "price": 250,
    "category_id": "cat-desserts",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Croissant",
    "price": 250,
    "category_id": "cat-desserts",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Chocolate Croissant",
    "price": 350,
    "category_id": "cat-desserts",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Tiramisu cake",
    "price": 400,
    "category_id": "cat-desserts",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Custard Vanilla Torta 1Kg",
    "price": 2000,
    "category_id": "cat-desserts-kg",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Millifoni Torta 1Kg",
    "price": 2200,
    "category_id": "cat-desserts-kg",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Chocolate Torta 1Kg",
    "price": 2500,
    "category_id": "cat-desserts-kg",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Tiramisu 1Kg",
    "price": 2500,
    "category_id": "cat-desserts-kg",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Butter Cookeis 1Kg",
    "price": 1600,
    "category_id": "cat-desserts-kg",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Chocolate Chips Cookeis 1Kg",
    "price": 2000,
    "category_id": "cat-desserts-kg",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "English Cake 1Kg",
    "price": 800,
    "category_id": "cat-desserts-kg",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  },
  {
    "name": "Marble Cake 1Kg",
    "price": 800,
    "category_id": "cat-desserts-kg",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false
  }
];
