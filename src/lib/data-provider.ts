import {
  Restaurant,
  Category,
  MenuItem,
  Order,
  ServiceRequest,
  Offer,
  DishReview,
  ReviewModerationLog,
  RestaurantReviewSettings,
  UserRole,
  ScheduledMenu,
  MenuVersion,
} from '@/types/database';
import { CreateOrderInput, ServiceRequestInput } from './validators';
import { createClient } from './supabase/client';
import { checkReviewContent, validateBotCheck, checkReviewRateLimit, canRemoveReview } from './review-engine';
import { broadcastSync } from './sync-channel';
import { rateLimiter, RATE_LIMITS } from './rate-limiter';
import { getNeon, hasNeon } from './neon/client';

// -----------------------------------------------------------------------------
// DEFAULT PRODUCTION SEED / FALLBACK DATA FOR "NITSUH" & MULTI-TENANT
// -----------------------------------------------------------------------------
export const MOCK_RESTAURANT_NITSUH: Restaurant = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  slug: 'nitsuh',
  name: 'Nitsuh Cafe & Restaurant',
  short_name: 'Nitsuh',
  logo_letter: 'N',
  logo_url: 'https://res.cloudinary.com/dekmg6rhe/image/upload/v1793051284/nitsuh-menu/brand/nitsuh-logo-clean.png',
  tagline: 'From Savour Bites to Sweet Delights, We Cater It All! • Hot & Fresh Fast Food, Handcrafted Sweets & Desserts',
  currency: 'ETB',
  currency_code: 'ETB',
  default_table: 'Main',
  hours: 'Mon – Sun: 6:30 AM – 11:00 PM',
  branch_name: 'Main Branch, Nitsuh Cafe & Restaurant',
  address: 'Nitsuh Bakery , Pizza & Burger | Bulbula, Addis Ababa, Ethiopia',
  google_maps_url: 'https://maps.app.goo.gl/v4jJJwkCkBRNFe5c9?g_st=atm',
  announcement: 'Welcome to Nitsuh Cafe & Restaurant • Fresh burgers, artisan pizzas, handcrafted pastries, and specialty coffees daily.',
  is_open: true,
  tax_rate: 0.15,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  theme_config: {
    primaryColor: '#C11221',
    primaryHover: '#A50E1B',
    accentColor: '#F89B22',
    fontFamily: 'sans',
    borderRadius: 'md',
    defaultMode: 'light',
    defaultLayout: 'grid',
    cardStyle: 'elevated',
    imageSize: 'standard',
    priceStyle: 'accented',
    badgeStyle: 'vibrant',
  },
  wifi_config: {
    ssid: 'Nitsuh-Guest',
    password: 'tastethevibes',
    enabled: false,
  },
  reviews_enabled: true,
  feature_flags: {
    orders_enabled: true,
    waiter_call_enabled: true,
    bill_request_enabled: true,
    offers_enabled: true,
    dietary_filters_enabled: true,
    favorites_enabled: true,
    calories_enabled: true,
  },
  custom_badges: [
    { id: 'b1', name: 'House Special', color: '#E8590C' },
    { id: 'b2', name: 'Family Recipe', color: '#10B981' },
    { id: 'b3', name: 'Award Winner', color: '#8B5CF6' },
  ],
  custom_labels: {
    callWaiter: 'Call Waiter',
    requestBill: 'Request Bill',
    placeOrder: 'Send to Kitchen',
    soldOut: 'Sold out today',
  },
  holiday_closures: [
    { date: '2026-12-25', reason: 'Christmas Day' },
    { date: '2027-01-01', reason: 'New Year Day' },
  ],
  closed_message: "We're currently resting! Our kitchen re-opens tomorrow at 6:30 AM.",
  sold_out_reset_time: 'morning_6am',
  onboarding_completed: false,
  onboarding_checklist: [
    { id: 'step-brand', title: 'Brand & Logo setup', completed: true },
    { id: 'step-hours', title: 'Operating hours configured', completed: true },
    { id: 'step-dishes', title: 'Add signature dishes', completed: true },
    { id: 'step-qr', title: 'Download & print menu QR codes', completed: false },
    { id: 'step-offers', title: 'Create your first promotional offer', completed: false },
  ],
};

export const MOCK_CATEGORIES_NITSUH: Category[] = [
  {
    "id": "cat-breakfast",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Breakfast",
    "name_am": "ቁርስ",
    "icon": "🍳",
    "image_url": "/images/dishes/full-normal-43.jpg",
    "description": "Traditional breakfast platters, foul, fetira, chechebsa, eggs and morning toasts.",
    "sort_order": 10,
    "is_active": true
  },
  {
    "id": "cat-burger",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Burgers",
    "name_am": "በርገር",
    "icon": "🍔",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041103/nitsuh-menu/dishes/sauxrh8xiqtzh1lxaihl.jpg",
    "description": "Handcrafted gourmet burgers, beef patties, chicken burgers and seasoned fries.",
    "sort_order": 20,
    "is_active": true
  },
  {
    "id": "cat-pizza",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Pizzas",
    "name_am": "ፒዛ",
    "icon": "🍕",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041087/nitsuh-menu/dishes/ky9kasyuyvofqpepovy9.jpg",
    "description": "Crispy crust pizzas baked with rich tomato sauce, melted mozzarella and fresh toppings.",
    "sort_order": 30,
    "is_active": true
  },
  {
    "id": "cat-club-sandwich",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Club Sandwich",
    "name_am": "ክለብ ሳንድዊች",
    "icon": "🥪",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041113/nitsuh-menu/dishes/plxtnsfafhnlwyvss89e.jpg",
    "description": "Layered triple-decker club sandwiches, chicken, tuna, steak and avocado.",
    "sort_order": 40,
    "is_active": true
  },
  {
    "id": "cat-wrap",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Wraps",
    "name_am": "ራፕ",
    "icon": "🌯",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041114/nitsuh-menu/dishes/qwc9frfwwyvnkjupkfsa.jpg",
    "description": "Rolled warm tortilla wraps filled with tender meats, cheese and house sauces.",
    "sort_order": 50,
    "is_active": true
  },
  {
    "id": "cat-chicken",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Chicken",
    "name_am": "ዶሮ",
    "icon": "🍗",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041065/nitsuh-menu/dishes/iviqnmpjmgv93jne2u7a.jpg",
    "description": "Crispy fried chicken legs, golden nuggets, strips, wings and honey BBQ platters.",
    "sort_order": 60,
    "is_active": true
  },
  {
    "id": "cat-salad",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Salad",
    "name_am": "ሰላጣ",
    "icon": "🥗",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041113/nitsuh-menu/dishes/kggchipcxsmjclgakqjy.jpg",
    "description": "Crisp garden salads, tuna, chicken, avocado and fasting dressings.",
    "sort_order": 70,
    "is_active": true
  },
  {
    "id": "cat-pasta",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Pasta",
    "name_am": "ፓስታ",
    "icon": "🍝",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041121/nitsuh-menu/dishes/fq6jd3em4ox2zveh9k13.jpg",
    "description": "Italian style pasta bowls: tomato, Alfredo, creamy chicken, arrabbiata and pesto.",
    "sort_order": 80,
    "is_active": true
  },
  {
    "id": "cat-mojito",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Mojitos",
    "name_am": "ሞሂቶ",
    "icon": "🍹",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041074/nitsuh-menu/dishes/iciwxll5jdtr9onzkcl4.jpg",
    "description": "Refreshing iced fruit mojitos, mint, lemon, pineapple, watermelon and strawberry.",
    "sort_order": 90,
    "is_active": true
  },
  {
    "id": "cat-soft-drinks",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Soft Drinks & Water",
    "name_am": "ለስላሳ መጠጦች እና ውሃ",
    "icon": "🥤",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041111/nitsuh-menu/dishes/ga0vubbafzchiv5en8ym.jpg",
    "description": "Chilled bottled and canned soft drinks, Novida, mineral water and Ambo water.",
    "sort_order": 100,
    "is_active": true
  },
  {
    "id": "cat-juices",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Fresh Juices",
    "name_am": "ትኩስ ጭማቂዎች",
    "icon": "🧃",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041113/nitsuh-menu/dishes/jmil4upegrojwzezxy1c.jpg",
    "description": "100% freshly pressed juices: avocado, mango, papaya, watermelon, strawberry.",
    "sort_order": 110,
    "is_active": true
  },
  {
    "id": "cat-shakes",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Shakes",
    "name_am": "ሼክ",
    "icon": "🥛",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041059/nitsuh-menu/dishes/vudraahudym4plg9muft.jpg",
    "description": "Creamy thick milkshakes: banana, strawberry, mocha, avocado, flaxseed and protein.",
    "sort_order": 120,
    "is_active": true
  },
  {
    "id": "cat-hot-drinks",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Hot Drinks",
    "name_am": "ትኩስ መጠጦች",
    "icon": "☕",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041131/nitsuh-menu/dishes/k0k6d9gyrikfmrdpsfgi.jpg",
    "description": "Single-origin Ethiopian coffee, macchiato, espresso, teas, and specialty lattes.",
    "sort_order": 130,
    "is_active": true
  },
  {
    "id": "cat-iced-drinks",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Iced Drinks",
    "name_am": "ቀዝቃዛ መጠጦች",
    "icon": "🧊",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041089/nitsuh-menu/dishes/ijbaoshw8scfdtaxqsem.jpg",
    "description": "Chilled iced latte, iced tea, vanilla, caramel, strawberry and deluxe iced coffee.",
    "sort_order": 140,
    "is_active": true
  },
  {
    "id": "cat-desserts",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Desserts & Pastries",
    "name_am": "ጣፋጮች እና ኬኮች",
    "icon": "🧁",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041101/nitsuh-menu/dishes/gbmqzx61bktna2gswrx6.jpg",
    "description": "Freshly baked mini cakes, custard vanilla, donuts, croissants and cookies.",
    "sort_order": 150,
    "is_active": true
  },
  {
    "id": "cat-desserts-kg",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Torta & Cakes (Per KG)",
    "name_am": "ኬክ በኪሎ",
    "icon": "🎂",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041076/nitsuh-menu/dishes/gnfchwipgbgs7fhfoodm.jpg",
    "description": "Celebration tortas and whole cakes sold by the kilogram for events and gatherings.",
    "sort_order": 160,
    "is_active": true
  }
];

export const MOCK_ITEMS_NITSUH: MenuItem[] = [
  {
    "id": "item-foul-1",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-breakfast",
    "name": "Foul",
    "name_am": "ፉል",
    "price": 350,
    "description": "Foul prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "/images/dishes/full-normal-43.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 1,
    "description_am": "ትኩስ ፉል በዘይት፣ በርበሬ፣ ቲማቲም እና ትኩስ ዳቦ።"
  },
  {
    "id": "item-foul-special-2",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-breakfast",
    "name": "Foul Special",
    "name_am": "ፉል ስፔሻል",
    "price": 450,
    "description": "Foul Special prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "/images/dishes/ful-special.jpg",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 2,
    "description_am": "ልዩ ስፔሻል ፉል በእንቁላል፣ እርጎ፣ ቅቤ እና ትኩስ ዳቦ።"
  },
  {
    "id": "item-fetira-with-honey-11",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-breakfast",
    "name": "Fetira With Honey",
    "name_am": "ፈጢራ በማር",
    "price": 350,
    "description": "Fetira With Honey prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "/images/dishes/fetira.jpeg",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 3,
    "description_am": "ትኩስ የተጋገረ ፈጢራ በተፈጥሮ ማር እና ቅቤ።"
  },
  {
    "id": "item-scrambled-egg-with-meat-4",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-breakfast",
    "name": "Scrambled Egg With Meat",
    "name_am": "እንቁላል ፍርፍር በስጋ",
    "price": 500,
    "description": "Scrambled Egg With Meat prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041130/nitsuh-menu/dishes/vltksewkfkrxicfu9ho3.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 4,
    "description_am": "ትኩስ የእንቁላል ፍርፍር በስጋ ቁርጥራጭ።"
  },
  {
    "id": "item-egg-sandwich-5",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-breakfast",
    "name": "Egg Sandwich",
    "name_am": "እንቁላል ሳንድች",
    "price": 400,
    "description": "Egg Sandwich prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041078/nitsuh-menu/dishes/lqwzh73i5taazryk6b5d.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 5,
    "description_am": "የእንቁላል ሳንድዊች በትኩስ ሰላጣ እና ቲማቲም።"
  },
  {
    "id": "item-omelet-6",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-breakfast",
    "name": "Omelet",
    "name_am": "አምሌት",
    "price": 400,
    "description": "Omelet prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "/images/dishes/roasted-chicken.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 6,
    "description_am": "ትኩስ የአምሌት እንቁላል ጥብስ።"
  },
  {
    "id": "item-omelet-with-cheese-7",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-breakfast",
    "name": "Omelet With Cheese",
    "name_am": "አምሌት በቺዝ",
    "price": 500,
    "description": "Omelet With Cheese prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041105/nitsuh-menu/dishes/jy4cosnl4hohva3umf8u.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 7,
    "description_am": "ጣፋጭ አምሌት በቀለጠ ቺዝ።"
  },
  {
    "id": "item-special-omelet-8",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-breakfast",
    "name": "Special Omelet",
    "name_am": "ስፔሻል አምሌት",
    "price": 550,
    "description": "Special Omelet prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041113/nitsuh-menu/dishes/xmy67yadwvvkjhtmdkpq.jpg",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 8,
    "description_am": "ልዩ ስፔሻል አምሌት በቺዝ፣ ቲማቲም እና አትክልት።"
  },
  {
    "id": "item-chechebsa-with-honey-9",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-breakfast",
    "name": "Chechebsa With Honey",
    "name_am": "ጨጨብሳ በማር",
    "price": 350,
    "description": "Chechebsa With Honey prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "/images/dishes/chechebisa.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 9,
    "description_am": "የተቆራረጠ ትኩስ ቂጣ በቅቤ፣ በርበሬ እና የተፈጥሮ ማር።"
  },
  {
    "id": "item-chechebsa-with-egg-10",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-breakfast",
    "name": "Chechebsa With Egg",
    "name_am": "ጨጨብሳ በእንቁላል",
    "price": 400,
    "description": "Chechebsa With Egg prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "/images/dishes/chechebisa.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 10,
    "description_am": "ትኩስ ጨጨብሳ በቅቤ እና እንቁላል።"
  },
  {
    "id": "item-scrambled-egg-3",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-breakfast",
    "name": "Scrambled Egg",
    "name_am": "እንቁላል ፍርፍር",
    "price": 400,
    "description": "Scrambled Egg prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041109/nitsuh-menu/dishes/lf4qmtdtaive8wqyez9f.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 11,
    "description_am": "ትኩስ የእንቁላል ፍርፍር በሽንኩርት እና ቲማቲም።"
  },
  {
    "id": "item-fetira-with-egg-12",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-breakfast",
    "name": "Fetira With Egg",
    "name_am": "ፈጢራ በእንቁላል",
    "price": 400,
    "description": "Fetira With Egg prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "/images/dishes/fetira.jpeg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 12,
    "description_am": "ትኩስ ፈጢራ በእንቁላል እና ቅቤ።"
  },
  {
    "id": "item-avocado-toast-13",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-breakfast",
    "name": "Avocado Toast",
    "name_am": "የአቮካዶ ቶስት",
    "price": 450,
    "description": "Avocado Toast prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041059/nitsuh-menu/dishes/yhi6mxkeajwywjz58poa.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 13,
    "description_am": "የተጠበሰ ቶስት ዳቦ በትኩስ አቮካዶ።"
  },
  {
    "id": "item-beef-cheese-sandwich-14",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-breakfast",
    "name": "Beef & Cheese Sandwich",
    "name_am": "የበሬ ስጋ እና ቺዝ ሳንድዊች",
    "price": 600,
    "description": "Beef & Cheese Sandwich prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041059/nitsuh-menu/dishes/rbnshwmcjljfnrbgrytk.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 14,
    "description_am": "ጭማቂ የበሬ ስጋ እና የቀለጠ ቺዝ ሳንድዊች።"
  },
  {
    "id": "item-french-toast-15",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-breakfast",
    "name": "French Toast",
    "name_am": "ፍሬንች ቶስት",
    "price": 500,
    "description": "French Toast prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041083/nitsuh-menu/dishes/ppqtnbqj6aowb65vtueb.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 15,
    "description_am": "ጣፋጭ የፈረንሳይ ፍሬንች ቶስት በማር።"
  },
  {
    "id": "item-pan-cake-16",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-breakfast",
    "name": "Pan Cake",
    "name_am": "ፓን ኬክ",
    "price": 500,
    "description": "Pan Cake prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041105/nitsuh-menu/dishes/zw36dchhheua8o9akdwk.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 16,
    "description_am": "ለስላሳ ትኩስ ፓንኬክ በማር ወይም ቸኮሌት።"
  },
  {
    "id": "item-nitsuh-special-burger-17",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-burger",
    "name": "Nitsuh Special Burger",
    "name_am": "ንፁህ ስፔሻል በርገር",
    "price": 800,
    "description": "Double Beef, Double Cheese, Egg, House Mayo, tomato, onion, lettuce & Fries",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041103/nitsuh-menu/dishes/sauxrh8xiqtzh1lxaihl.jpg",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": true,
    "sort_order": 17,
    "description_am": "በንፁህ ካፌ የተዘጋጀ ልዩ ስፔሻል የበሬ ስጋ በርገር ከተጠበሰ ቺዝ እና ድንች ጥብስ ጋር።"
  },
  {
    "id": "item-texas-style-bbq-burger-18",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-burger",
    "name": "Texas Style BBQ Burger",
    "name_am": "ቴክሳስ ስታይል BBQ በርገር",
    "price": 750,
    "description": "Double Beef, Cheese, triple BBQ Sauce, Mayo, tomato, onion, lettuce & Fries",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041120/nitsuh-menu/dishes/rrwytwfvolbrhofto9gf.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 18,
    "description_am": "በጭስ የተጠበሰ ጭማቂ የበሬ ስጋ በርገር በቴክሳስ ባርቢኪው ሶስ እና ጥብስ ድንች።"
  },
  {
    "id": "item-spicy-burger-19",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-burger",
    "name": "Spicy Burger",
    "name_am": "ስፓይሲ በርገር",
    "price": 750,
    "description": "Double beef, Cheese, Double Chili Sauce, Mayo, tomato, onion, lettuce & Fries",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041114/nitsuh-menu/dishes/uepwvp2slodcwbnbojqh.jpg",
    "tags": [],
    "spice_level": 2,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 19,
    "description_am": "የሚያቃጥል ስፓይሲ በርገር በልዩ ቃሪያ ሶስ እና ጥርት ባለ ፍሬንች ፍራይስ።"
  },
  {
    "id": "item-junky-burger-20",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-burger",
    "name": "Junky Burger",
    "name_am": "ጃንኪ በርገር",
    "price": 950,
    "description": "Tripple Beef, Double Cheese, Double egg, House Sauce Mayo, tomato, onion, lettuce & Fries",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041103/nitsuh-menu/dishes/sauxrh8xiqtzh1lxaihl.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 20,
    "description_am": "በብዙ ቺዝ እና ልዩ ሶስ የተሞላ ግዙፍ ጣፋጭ በርገር።"
  },
  {
    "id": "item-beef-burger-21",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-burger",
    "name": "Beef Burger",
    "name_am": "የበሬ ስጋ በርገር",
    "price": 500,
    "description": "Beef, Mayo, tomato, onion, lettuce & Fries",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041059/nitsuh-menu/dishes/vextlzoihqbx8gwy9m4p.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 21,
    "description_am": "ክላሲክ ጭማቂ የበሬ ስጋ በርገር በትኩስ ቲማቲም፣ ሰላጣ እና ድንች ጥብስ።"
  },
  {
    "id": "item-cheese-burger-22",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-burger",
    "name": "Cheese Burger",
    "name_am": "ቺዝ በርገር",
    "price": 550,
    "description": "Beef, Cheese, Mayo, tomato, onion, lettuce & Fries",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041063/nitsuh-menu/dishes/fjbcfvhbhqermblxexxy.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 22,
    "description_am": "የበሬ ስጋ በርገር ከቀለጠ ሞዛሬላ ቺዝ እና የቤት ውስጥ ሶስ ጋር።"
  },
  {
    "id": "item-double-beef-burger-23",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-burger",
    "name": "Double Beef Burger",
    "name_am": "ድርብ የበሬ ስጋ በርገር",
    "price": 600,
    "description": "Double Beef, Mayo, tomato, onion, lettuce & Fries",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041077/nitsuh-menu/dishes/ifmzjjrsnnbvr3vqsec4.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 23,
    "description_am": "ድርብ የበሬ ስጋ ፓቲዎች በጣፋጭ ሶስ እና ጥብስ ድንች።"
  },
  {
    "id": "item-double-cheese-burger-24",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-burger",
    "name": "Double Cheese Burger",
    "name_am": "ድርብ ቺዝ በርገር",
    "price": 670,
    "description": "Double Beef, Double Cheese, tomato, onion, lettuce & Fries",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041078/nitsuh-menu/dishes/davmjhahhhx92wcy5bfl.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 24,
    "description_am": "ሁለት የበሬ ስጋ ፓቲዎች በድርብ የቀለጠ ቺዝ እና ፍሬንች ፍራይስ።"
  },
  {
    "id": "item-chicken-burger-25",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-burger",
    "name": "Chicken Burger",
    "name_am": "የዶሮ በርገር",
    "price": 600,
    "description": "Chicken, Mayo, Honey Mustard sauce, tomato, onion, lettuce & Fries",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041063/nitsuh-menu/dishes/bmtsndi3cvdrjwxudsli.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 25,
    "description_am": "ጥርት ብሎ የተጠበሰ የዶሮ ስጋ በርገር በሰላጣ እና ክሬሚ ማዮኔዝ።"
  },
  {
    "id": "item-special-chicken-burger-26",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-burger",
    "name": "Special Chicken Burger",
    "name_am": "ስፔሻል የዶሮ በርገር",
    "price": 950,
    "description": "Double Chicken, Cheese, Mayo, Honey Mustard sauce, tomato, onion, lettuce & Fries",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041111/nitsuh-menu/dishes/j4mfcvnhexep3p1bfnfj.jpg",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 26,
    "description_am": "ልዩ የዶሮ በርገር በቺዝ፣ እንቁላል እና ጥርት ያለ ፍሬንች ፍራይስ።"
  },
  {
    "id": "item-fasting-burger-27",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-burger",
    "name": "Fasting Burger",
    "name_am": "የጾም በርገር",
    "price": 400,
    "description": "Fasting Burger, ketchup, tomato, onion, lettuce & Fries",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041082/nitsuh-menu/dishes/ng8nmwgvmrt11guextps.jpg",
    "tags": [
      "vegan",
      "fasting"
    ],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 27,
    "description_am": "100% ከእፅዋት እና ከአትክልት የተዘጋጀ ጤናማ የጾም በርገር።"
  },
  {
    "id": "item-slider-burger-28",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-burger",
    "name": "Slider Burger",
    "name_am": "ስላይደር በርገር",
    "price": 750,
    "description": "3 mini buns, 3 mini Beef, Cheese, Mayo, Tomato, Onion, Lettuce & Fries",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041111/nitsuh-menu/dishes/bfsoapzpmdunpzyeykgz.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 28,
    "description_am": "ጣፋጭ አነስተኛ ሚኒ በርገሮች በልዩ ሶስ እና ጥብስ ድንች።"
  },
  {
    "id": "item-house-special-pizza-33",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-pizza",
    "name": "House Special Pizza",
    "name_am": "ሀውስ ስፔሻል ፒዛ",
    "price": 950,
    "description": "Tomato Sauce, Beef, Chicken, Boiled egg, Slice beef, Olive & Mozzarella Cheese",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041087/nitsuh-menu/dishes/ky9kasyuyvofqpepovy9.jpg",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": true,
    "sort_order": 33,
    "description_am": "የንፁህ ካፌ ልዩ ፒዛ በስጋ፣ ዶሮ፣ አትክልት እና በበዛ ሞዛሬላ ቺዝ።"
  },
  {
    "id": "item-tuna-pizza-34",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-pizza",
    "name": "Tuna Pizza",
    "name_am": "የቱና ፒዛ",
    "price": 850,
    "description": "Tomato Sauce, Tuna & Mozzarella Cheese",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041123/nitsuh-menu/dishes/hdkr7hzv7v8duwqzeo8o.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 34,
    "description_am": "ጣፋጭ የቱና አሳ ፒዛ በቀይ ሽንኩርት እና የቀለጠ ሞዛሬላ ቺዝ።"
  },
  {
    "id": "item-chicken-pizza-35",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-pizza",
    "name": "Chicken Pizza",
    "name_am": "የዶሮ ፒዛ",
    "price": 850,
    "description": "Tomato Sauce, Chicken & Mozzarella Cheese",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041065/nitsuh-menu/dishes/ziz953msfrn9xlray0o5.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 35,
    "description_am": "የተጠበሰ የዶሮ ስጋ በልዩ ቲማቲም ሶስ እና ሞዛሬላ ቺዝ።"
  },
  {
    "id": "item-meet-pizza-36",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-pizza",
    "name": "Meet Pizza",
    "name_am": "የስጋ ፒዛ",
    "price": 800,
    "description": "Tomato Sauce, Beef & Mozzarella Cheese",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041093/nitsuh-menu/dishes/ldwn5xpxyxhrpitrftub.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 36,
    "description_am": "ጣፋጭ የበሬ ስጋ ፒዛ በትኩስ ቅመሞች እና የቀለጠ ቺዝ።"
  },
  {
    "id": "item-pizza-margarita-37",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-pizza",
    "name": "Pizza Margarita",
    "name_am": "ፒዛ ማርጋሪታ",
    "price": 750,
    "description": "Tomato Sauce & Mozzarella Cheese",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041108/nitsuh-menu/dishes/jiiz7x0ardonbkvmlaon.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 37,
    "description_am": "ክላሲክ የጣሊያን ፒዛ በትኩስ ቲማቲም፣ ኦሪጋኖ እና ሞዛሬላ ቺዝ።"
  },
  {
    "id": "item-fasting-vegetable-pizza-38",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-pizza",
    "name": "Fasting Vegetable Pizza",
    "name_am": "የጾም የአትክልት ፒዛ",
    "price": 550,
    "description": "Tomato Sauce & Vegetables",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041083/nitsuh-menu/dishes/iy5usm4ioedesdhhzrpm.jpg",
    "tags": [
      "vegan",
      "fasting"
    ],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 38,
    "description_am": "100% የጾም ፒዛ በትኩስ አትክልቶች፣ ቃሪያ እና ቲማቲም ሶስ።"
  },
  {
    "id": "item-fasting-special-pizza-39",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-pizza",
    "name": "Fasting Special Pizza",
    "name_am": "የጾም ስፔሻል ፒዛ",
    "price": 750,
    "description": "Tomato Sauce, Vegetables, Tuna, & Olive",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041083/nitsuh-menu/dishes/iy5usm4ioedesdhhzrpm.jpg",
    "tags": [
      "vegan",
      "fasting",
      "popular"
    ],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 39,
    "description_am": "ልዩ የጾም ፒዛ በበርካታ ትኩስ አትክልቶች እና ልዩ ቅመሞች።"
  },
  {
    "id": "item-fasting-tuna-pizza-40",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-pizza",
    "name": "Fasting Tuna Pizza",
    "name_am": "የጾም ቱና ፒዛ",
    "price": 700,
    "description": "Tomato Sauce, Tuna",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041123/nitsuh-menu/dishes/hdkr7hzv7v8duwqzeo8o.jpg",
    "tags": [
      "vegan",
      "fasting"
    ],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 40,
    "description_am": "ጣፋጭ የቱና አሳ የጾም ፒዛ በሽንኩርት እና አትክልቶች።"
  },
  {
    "id": "item-special-club-sandwich-46",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-club-sandwich",
    "name": "Special Club Sandwich",
    "name_am": "ስፔሻል ክለብ ሳንድዊች",
    "price": 750,
    "description": "Beef, Chicken, Boiled egg, Mayo, Tomato, Lettuce, Onion, & Fries",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041113/nitsuh-menu/dishes/plxtnsfafhnlwyvss89e.jpg",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": true,
    "sort_order": 46,
    "description_am": "ባለሶስት ድርብ ስፔሻል ሳንድዊች በዶሮ፣ እንቁላል፣ ቺዝ እና ጥብስ ድንች።"
  },
  {
    "id": "item-chicken-club-sandwich-47",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-club-sandwich",
    "name": "Chicken Club Sandwich",
    "name_am": "የዶሮ ክለብ ሳንድዊች",
    "price": 700,
    "description": "Chicken, Boiled egg, Mayo, Tomato, Lettuce, Onion, & Fries",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041063/nitsuh-menu/dishes/u4qme7u7usm0abwgull8.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 47,
    "description_am": "የተጠበሰ የዶሮ ስጋ ክለብ ሳንድዊች በሰላጣ፣ ማዮኔዝ እና ፍሬንች ፍራይስ።"
  },
  {
    "id": "item-tuna-club-sandwich-48",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-club-sandwich",
    "name": "Tuna Club Sandwich",
    "name_am": "የቱና ክለብ ሳንድዊች",
    "price": 700,
    "description": "Tuna, Boiled egg, Mayo, Tomato, Lettuce, Onion, & Fries",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041123/nitsuh-menu/dishes/lwhpi9qgyrcg7ch64xxd.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 48,
    "description_am": "ጣፋጭ የቱና አሳ ክለብ ሳንድዊች በሽንኩርት እና ትኩስ ሰላጣ።"
  },
  {
    "id": "item-beef-club-sandwich-49",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-club-sandwich",
    "name": "Beef Club Sandwich",
    "name_am": "የበሬ ስጋ ክለብ ሳንድዊች",
    "price": 650,
    "description": "Beef, Boiled egg, Mayo, Tomato, Lettuce, Onion, & Fries",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041060/nitsuh-menu/dishes/hh30wyrkylvss0xodoo3.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 49,
    "description_am": "ጭማቂ የበሬ ስጋ ክለብ ሳንድዊች በሞዛሬላ ቺዝ እና ጥብስ ድንች።"
  },
  {
    "id": "item-fasting-tuna-club-sand-50",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-club-sandwich",
    "name": "Fasting Tuna Club Sand.",
    "name_am": "የጾም ቱና ክለብ ሳንድዊች",
    "price": 650,
    "description": "Tuna, Ketchup, Tomato, Lettuce, Onion, & Fries",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041123/nitsuh-menu/dishes/lwhpi9qgyrcg7ch64xxd.jpg",
    "tags": [
      "vegan",
      "fasting"
    ],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 50,
    "description_am": "የጾም የቱና ክለብ ሳንድዊች በአትክልት እና ድንች ጥብስ።"
  },
  {
    "id": "item-chicken-sandwich-51",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-club-sandwich",
    "name": "Chicken Sandwich",
    "name_am": "የዶሮ ሳንድዊች",
    "price": 900,
    "description": "Chicken, Cheese, Mayo, Tomato, Lettuce, Onion, & Fries",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041065/nitsuh-menu/dishes/co9lz2atn7gojpak4nfu.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 51,
    "description_am": "ትኩስ የተጠበሰ የዶሮ ስጋ ሳንድዊች በስስ ዳቦ እና ማዮኔዝ።"
  },
  {
    "id": "item-steak-sandwich-52",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-club-sandwich",
    "name": "Steak Sandwich",
    "name_am": "ስቴክ ሳንድዊች",
    "price": 900,
    "description": "Beef, Cheese, Mayo, Tomato, Lettuce, Onion, & Fries",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041114/nitsuh-menu/dishes/a6wha3avezcys8ix9ulx.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 52,
    "description_am": "ጣፋጭ የተጠበሰ የበሬ ስቴክ ስጋ ሳንድዊች በካራሜላይዝድ ሽንኩርት።"
  },
  {
    "id": "item-tuna-sandwich-53",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-club-sandwich",
    "name": "Tuna Sandwich",
    "name_am": "የቱና ሳንድዊች",
    "price": 900,
    "description": "Tuna, Cheese, Mayo, Tomato, Lettuce, Onion, & Fries",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041121/nitsuh-menu/dishes/sxgil8mwetardqqdls9y.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 53,
    "description_am": "ክላሲክ የቱና አሳ ሳንድዊች በትኩስ ሰላጣ እና ቲማቲም።"
  },
  {
    "id": "item-avocado-sandwich-54",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-club-sandwich",
    "name": "Avocado Sandwich",
    "name_am": "የአቮካዶ ሳንድዊች",
    "price": 600,
    "description": "Avocado, Ketchup, Tomato, Lettuce, Onion, & Fries",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041057/nitsuh-menu/dishes/g4batwakr2fapek98uz8.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 54,
    "description_am": "ትኩስ የተፈጨ አቮካዶ ሳንድዊች በሎሚ እና የወይራ ዘይት (የጾም)።"
  },
  {
    "id": "item-special-wrap-55",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-wrap",
    "name": "Special Wrap",
    "name_am": "ስፔሻል ራፕ",
    "price": 850,
    "description": "Beef, Chicken, Boiled egg, Cheese, Mayo, Tomato, Onion, & Fries",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041114/nitsuh-menu/dishes/qwc9frfwwyvnkjupkfsa.jpg",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": true,
    "sort_order": 55,
    "description_am": "ልዩ የተጠቀለለ ቶርቲላ ራፕ በስጋ፣ ዶሮ፣ ቺዝ እና ልዩ ሶስ።"
  },
  {
    "id": "item-chicken-wrap-56",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-wrap",
    "name": "Chicken Wrap",
    "name_am": "የዶሮ ራፕ",
    "price": 750,
    "description": "Chicken, Cheese, Mayo, Tomato, Onion, & Fries",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041066/nitsuh-menu/dishes/lfajwcltgqwhkvznpswc.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 56,
    "description_am": "ጣፋጭ የተጠበሰ የዶሮ ስጋ ራፕ በሰላጣ እና ነጭ ሽንኩርት ሶስ።"
  },
  {
    "id": "item-tuna-wrap-57",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-wrap",
    "name": "Tuna Wrap",
    "name_am": "የቱና ራፕ",
    "price": 750,
    "description": "Tuna, Cheese, Mayo, Tomato, Onion, & Fries",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041123/nitsuh-menu/dishes/o0kcl4f2l3m5kxr66xoe.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 57,
    "description_am": "የቱና አሳ ራፕ በትኩስ አትክልቶች እና ማዮኔዝ።"
  },
  {
    "id": "item-beef-wrap-58",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-wrap",
    "name": "Beef Wrap",
    "name_am": "የበሬ ስጋ ራፕ",
    "price": 650,
    "description": "Beef, Cheese, Mayo, Tomato, Onion, & Fries",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041060/nitsuh-menu/dishes/p3a7afyhyml0wjvuuwqv.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 58,
    "description_am": "የተጠበሰ ጭማቂ የበሬ ስጋ ራፕ በቺዝ እና የተጠበሰ ሽንኩርት።"
  },
  {
    "id": "item-fasting-tuna-wrap-59",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-wrap",
    "name": "Fasting Tuna Wrap",
    "name_am": "የጾም ቱና ራፕ",
    "price": 650,
    "description": "Tuna, Ketchup, Tomato, Onion, & Fries",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041123/nitsuh-menu/dishes/o0kcl4f2l3m5kxr66xoe.jpg",
    "tags": [
      "vegan",
      "fasting"
    ],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 59,
    "description_am": "የጾም የቱና አሳ ራፕ በትኩስ ሰላጣ እና ሎሚ።"
  },
  {
    "id": "item-fasting-vegetable-wrap-60",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-wrap",
    "name": "Fasting Vegetable Wrap",
    "name_am": "የጾም የአትክልት ራፕ",
    "price": 550,
    "description": "Vegetables, Ketchup, Tomato, Onion, & Fries",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041082/nitsuh-menu/dishes/wzgqpcbcyucfwtwmrgee.jpg",
    "tags": [
      "vegan",
      "fasting"
    ],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 60,
    "description_am": "100% የጾም የተጠበሰ አትክልት ራፕ በአቮካዶ እና የወይራ ዘይት።"
  },
  {
    "id": "item-chicken-nuggate-61",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-chicken",
    "name": "Chicken Nuggate",
    "name_am": "የዶሮ ናጌትስ",
    "price": 1200,
    "description": "Chicken, Mayo, Fries",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041065/nitsuh-menu/dishes/iviqnmpjmgv93jne2u7a.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 61,
    "description_am": "ጥርት ብለው የተጠበሱ ወርቃማ የዶሮ ናጌቶች ከዲፕ ሶስ ጋር።"
  },
  {
    "id": "item-crispy-chicken-strips-62",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-chicken",
    "name": "Crispy Chicken Strips",
    "name_am": "ክሪስፒ ዶሮ ስትሪፕስ",
    "price": 1500,
    "description": "Slice Chicken Strips, Mayo, Fries",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041070/nitsuh-menu/dishes/pxiji5izmrzhv7tn8stl.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 62,
    "description_am": "የተጠበሱ ጥርት ያሉ የዶሮ ስስ ቁርጥራጮች ከድንች ጥብስ ጋር።"
  },
  {
    "id": "item-crispy-fried-chicken-leg-1-pic-63",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-chicken",
    "name": "Crispy Fried Chicken Leg (1 pic)",
    "name_am": "የተጠበሰ የዶሮ እግር (1 ፍሬ)",
    "price": 1200,
    "description": "1 Chicken leg, Mayo, Salad & Fries",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041076/nitsuh-menu/dishes/iltf7zucjql3n8znvo2t.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 63,
    "description_am": "ጥርት ብሎ በዘይት የተጠበሰ ወርቃማ የዶሮ እግር ከፍሬንች ፍራይስ ጋር።"
  },
  {
    "id": "item-crispy-fried-chicken-leg-2-pic-64",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-chicken",
    "name": "Crispy Fried Chicken Leg (2 pic)",
    "name_am": "የተጠበሰ የዶሮ እግር (2 ፍሬ)",
    "price": 2200,
    "description": "2 Chicken leg, Mayo, Salad & Fries",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041076/nitsuh-menu/dishes/iltf7zucjql3n8znvo2t.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 64,
    "description_am": "ሁለት ጥርት ብለው የተጠበሱ የዶሮ እግሮች ከትኩስ ድንች ጥብስ ጋር።"
  },
  {
    "id": "item-chicken-leg-with-honey-bbq-souce-65",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-chicken",
    "name": "Chicken Leg with Honey BBQ Souce",
    "name_am": "የዶሮ እግር በሃኒ BBQ ሶስ",
    "price": 1500,
    "description": "1 pic Chicken Leg, Honey BBQ Sauce, Mayo, Salad & Fries",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041063/nitsuh-menu/dishes/ds5mqolveib58z4rmeku.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 65,
    "description_am": "ጣፋጭ የዶሮ እግር በማር እና ባርቢኪው ሶስ ተለውሶ የቀረበ።"
  },
  {
    "id": "item-chicken-wings-66",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-chicken",
    "name": "Chicken Wings",
    "name_am": "የዶሮ ክንፍ (ዊንግስ)",
    "price": 1000,
    "description": "Chicken Wings, Mayo, Fries",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041066/nitsuh-menu/dishes/joa47lvnmir6zrpkor22.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 66,
    "description_am": "ጥርት ብለው የተጠበሱ ጣፋጭ የዶሮ ክንፎች ከዲፕ ሶስ ጋር።"
  },
  {
    "id": "item-chicken-wings-with-honey-bbq-souce-67",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-chicken",
    "name": "Chicken Wings with Honey BBQ Souce",
    "name_am": "የዶሮ ክንፍ በሃኒ BBQ ሶስ",
    "price": 1300,
    "description": "Chicken Wings, Honey BBQ Souce, Mayo, Fries",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041125/nitsuh-menu/dishes/vekwpnrdbbqmzrwkrbkc.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 67,
    "description_am": "የተጠበሱ የዶሮ ክንፎች በማር እና ባርቢኪው ሶስ ተለውሰው የቀረቡ።"
  },
  {
    "id": "item-chicken-special-combo-68",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-chicken",
    "name": "Chicken Special Combo",
    "name_am": "የዶሮ ስፔሻል ኮምቦ",
    "price": 2500,
    "description": "1 pic Chicken Fried Leg, Wings, Chicken Strip, Mayo, Salad & Fries",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041066/nitsuh-menu/dishes/hj5h2ttotfkmfizby7uj.jpg",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": true,
    "sort_order": 68,
    "description_am": "የዶሮ እግር፣ ዊንግስ፣ ናጌትስ እና ድንች ጥብስ የያዘ የተሟላ ኮምቦ።"
  },
  {
    "id": "item-special-salad-69",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-salad",
    "name": "Special salad",
    "name_am": "ስፔሻል ሰላጣ",
    "price": 1100,
    "description": "Chicken, tuna, Salad, tomato, carrot, cucumber, onion, chili, olives, kidney bean, mayo, salad souce",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041113/nitsuh-menu/dishes/kggchipcxsmjclgakqjy.jpg",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 69,
    "description_am": "ልዩ ትኩስ ሰላጣ በዶሮ፣ ቺዝ፣ እንቁላል እና ልዩ ድሬሲንግ።"
  },
  {
    "id": "item-fasting-special-salad-70",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-salad",
    "name": "Fasting Special salad",
    "name_am": "የጾም ስፔሻል ሰላጣ",
    "price": 900,
    "description": "Avocado Salad, tomato, carrot, cucumber, onion, chili, olives, kidney bean, salad souce",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041082/nitsuh-menu/dishes/qck5jizuutup1gcoij9y.jpg",
    "tags": [
      "vegan",
      "fasting",
      "popular"
    ],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 70,
    "description_am": "ልዩ የጾም ሰላጣ በአቮካዶ፣ ቱና፣ የወይራ ፍሬ እና የሎሚ ድሬሲንግ።"
  },
  {
    "id": "item-tuna-salad-71",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-salad",
    "name": "Tuna Salad",
    "name_am": "የቱና ሰላጣ",
    "price": 900,
    "description": "Tuna, Salad, tomato, carrot, cucumber, onion, chili, mayo, salad souce",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041121/nitsuh-menu/dishes/eqokbmmdnhntu0f75yrg.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 71,
    "description_am": "ትኩስ የቱና አሳ ሰላጣ በሰላጣ ቅጠል፣ ቲማቲም እና ሎሚ።"
  },
  {
    "id": "item-chicken-salad-72",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-salad",
    "name": "Chicken Salad",
    "name_am": "የዶሮ ሰላጣ",
    "price": 900,
    "description": "Chicken, Salad, tomato, carrot, cucumber, onion, chili, mayo, salad souce",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041064/nitsuh-menu/dishes/wekifchc8swwyiwh1xcs.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 72,
    "description_am": "የተጠበሰ የዶሮ ስጋ ቁርጥራጭ በሰላጣ፣ ኪያር እና ማዮኔዝ ድሬሲንግ።"
  },
  {
    "id": "item-avocado-salad-73",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-salad",
    "name": "Avocado Salad",
    "name_am": "የአቮካዶ ሰላጣ",
    "price": 700,
    "description": "Avocado Salad, tomato, carrot, cucumber, onion, chili, salad souce",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041057/nitsuh-menu/dishes/cgcykz0pczufjttgir0c.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 73,
    "description_am": "ትኩስ የአቮካዶ ቁርጥራጭ በቲማቲም፣ ቃሪያ እና የወይራ ዘይት (የጾም)።"
  },
  {
    "id": "item-normal-salad-74",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-salad",
    "name": "Normal Salad",
    "name_am": "ኖርማል ሰላጣ",
    "price": 700,
    "description": "Salad, tomato, carrot, cucumber, onion, chili, kidney bean, salad souce",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041103/nitsuh-menu/dishes/giotydwog4po6ibiabxf.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 74,
    "description_am": "ቀላል እና ትኩስ የአትክልት ሰላጣ በሰላጣ ቅጠል፣ ቲማቲም እና ሽንኩርት።"
  },
  {
    "id": "item-tomato-pasta-75",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-pasta",
    "name": "Tomato Pasta",
    "name_am": "የቲማቲም ፓስታ",
    "price": 500,
    "description": "Pasta With Tomato souce & Bread",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041121/nitsuh-menu/dishes/fq6jd3em4ox2zveh9k13.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 75,
    "description_am": "ክላሲክ ፓስታ በትኩስ የቲማቲም ሶስ፣ ነጭ ሽንኩርት እና ባሲል (የጾም)።"
  },
  {
    "id": "item-vegi-pasta-76",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-pasta",
    "name": "Vegi Pasta",
    "name_am": "የአትክልት ፓስታ",
    "price": 500,
    "description": "Pasta With Vegtables & Bread",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041125/nitsuh-menu/dishes/hibwelmw10l8rp2blmop.jpg",
    "tags": [
      "vegan",
      "fasting"
    ],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 76,
    "description_am": "ጣፋጭ የጾም ፓስታ በተጠበሱ የተመረጡ አትክልቶች።"
  },
  {
    "id": "item-tuna-pasta-77",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-pasta",
    "name": "Tuna Pasta",
    "name_am": "የቱና ፓስታ",
    "price": 500,
    "description": "Pasta With Tomato souce Tuna & Bread",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041121/nitsuh-menu/dishes/zjm0fju8hdmketpqnqxi.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 77,
    "description_am": "ፓስታ በቱና አሳ፣ ቲማቲም ሶስ እና የወይራ ፍሬ።"
  },
  {
    "id": "item-tomato-pasta-with-meat-78",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-pasta",
    "name": "Tomato Pasta With Meat",
    "name_am": "የቲማቲም ፓስታ በስጋ",
    "price": 650,
    "description": "Pasta With Tomato souce, Meat & Bread",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041120/nitsuh-menu/dishes/lyjzjjt8ltfe3jlstyo2.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 78,
    "description_am": "ፓስታ በተፈጨ የበሬ ስጋ ቦሎኔዝ እና የቲማቲም ሶስ።"
  },
  {
    "id": "item-arabiyata-pasta-79",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-pasta",
    "name": "Arabiyata Pasta",
    "name_am": "አራቢያታ ፓስታ",
    "price": 650,
    "description": "Pasta With Tomato souce, Hot Spicy & Bread",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041056/nitsuh-menu/dishes/hiozsoyehskrhasxpnnh.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 79,
    "description_am": "የሚያቃጥል የጣሊያን አራቢያታ ፓስታ በቃሪያ እና ነጭ ሽንኩርት ሶስ።"
  },
  {
    "id": "item-alfredo-pasta-80",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-pasta",
    "name": "Alfredo Pasta",
    "name_am": "አልፍሬዶ ፓስታ",
    "price": 750,
    "description": "Pasta With Creamy souce, Cheese & Bread",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041055/nitsuh-menu/dishes/oxbj3kfv8c8x7alj0fwn.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 80,
    "description_am": "ክሬሚ ነጭ አልፍሬዶ ፓስታ በቅቤ እና ፓርሜዛን ቺዝ።"
  },
  {
    "id": "item-alfredo-pasta-with-chicken-81",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-pasta",
    "name": "Alfredo Pasta With Chicken",
    "name_am": "አልፍሬዶ ፓስታ በዶሮ",
    "price": 900,
    "description": "Pasta With Creamy souce, Chicken, Cheese & Bread",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041055/nitsuh-menu/dishes/lmycpw8mgtpflyrnite9.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 81,
    "description_am": "ክሬሚ አልፍሬዶ ፓስታ በተጠበሰ የዶሮ ስጋ ቁርጥራጭ እና ቺዝ።"
  },
  {
    "id": "item-pesto-pasta-82",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-pasta",
    "name": "Pesto Pasta",
    "name_am": "ፔስቶ ፓስታ",
    "price": 750,
    "description": "Pasta With Pesto souce, Cheese & Bread",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041107/nitsuh-menu/dishes/u4gctqfkdl6l0htgwqzw.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 82,
    "description_am": "አረንጓዴ የባሲል ፔስቶ ፓስታ በወይራ ዘይት እና ነጭ ሽንኩርት።"
  },
  {
    "id": "item-classic-mojito-83",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-mojito",
    "name": "Classic Mojito",
    "name_am": "ክላሲክ ሞሂቶ",
    "price": 450,
    "description": "Lemon, Mint, Pineapple, Cinnamon, Honey syrup, Fresh Mint, Soft drink, Ice",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041074/nitsuh-menu/dishes/iciwxll5jdtr9onzkcl4.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 83,
    "description_am": "ቀዝቃዛ ክላሲክ ሞሂቶ በትኩስ ሚንት ቅጠል፣ ሎሚ እና በረዶ።"
  },
  {
    "id": "item-lemon-mint-mojito-84",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-mojito",
    "name": "Lemon Mint Mojito",
    "name_am": "የሎሚ ሚንት ሞሂቶ",
    "price": 350,
    "description": "Lemon juice, Fresh Mint, Soft drink, Honey syrup, Ice",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041091/nitsuh-menu/dishes/czoizyvboi8okrsrm3ok.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 84,
    "description_am": "መንፈስ የሚያድስ የሎሚ እና ሚንት ሞሂቶ ከሶዳ ጋር።"
  },
  {
    "id": "item-pineapple-mojito-85",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-mojito",
    "name": "Pineapple Mojito",
    "name_am": "የአናናስ ሞሂቶ",
    "price": 350,
    "description": "Pineapple Rum, Lemon juice, Mint, Soft drink, Ice",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041106/nitsuh-menu/dishes/hgtvu9elf92ed1c88rel.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 85,
    "description_am": "ጣፋጭ የተፈጥሮ አናናስ ሞሂቶ በሚንት እና በረዶ።"
  },
  {
    "id": "item-watermelon-mojito-86",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-mojito",
    "name": "Watermelon Mojito",
    "name_am": "የሀብሀብ ሞሂቶ",
    "price": 350,
    "description": "Watermelon Rum, Honey syrup, Lemon, Fresh Mint, Ambo water, Ice",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041127/nitsuh-menu/dishes/lomommsl0xmc9lc5qcfn.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 86,
    "description_am": "ቀዝቃዛ የሀብሀብ ፍሬ ሞሂቶ ከሚንት ቅጠል ጋር።"
  },
  {
    "id": "item-strawberry-mojito-87",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-mojito",
    "name": "Strawberry Mojito",
    "name_am": "የእንጆሪ ሞሂቶ",
    "price": 350,
    "description": "Strawberry Rum, Honey syrup, Lemon, Soft drink, Fresh Mint, Ice",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041118/nitsuh-menu/dishes/bd1d3sgxf1w7rm1trjft.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 87,
    "description_am": "ጣፋጭ የእንጆሪ ፍራፍሬ ሞሂቶ በሎሚ እና በረዶ።"
  },
  {
    "id": "item-ginger-mojito-88",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-mojito",
    "name": "Ginger Mojito",
    "name_am": "የዝንጅብል ሞሂቶ",
    "price": 350,
    "description": "Ginger juice, Sugar syrup, Soft drink, Lemon, Fresh Mint, Ice",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041086/nitsuh-menu/dishes/eexcys2lkt1wcwk6lolv.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 88,
    "description_am": "ልዩ የዝንጅብል ቃና ያለው ቀዝቃዛ ሞሂቶ በሎሚ።"
  },
  {
    "id": "item-cinnamon-mojito-89",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-mojito",
    "name": "Cinnamon Mojito",
    "name_am": "የቀረፋ ሞሂቶ",
    "price": 350,
    "description": "Cinnamon, Lemon, Soft drink, Sugar syrup, Fresh Mint, Ice, Mojito",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041070/nitsuh-menu/dishes/uyfuy1fksqh7dfepg89y.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 89,
    "description_am": "ልዩ የቀረፋ መዓዛ ያለው የሚያድስ ቀዝቃዛ ሞሂቶ።"
  },
  {
    "id": "item-soft-drink-90",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-soft-drinks",
    "name": "Soft Drink",
    "name_am": "ለስላሳ መጠጥ",
    "price": 90,
    "description": "Soft Drink prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041111/nitsuh-menu/dishes/ga0vubbafzchiv5en8ym.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 90,
    "description_am": "ቀዝቃዛ የታሸገ ለስላሳ መጠጥ (ኮካ፣ ፋንታ፣ ስፕራይት)።"
  },
  {
    "id": "item-novida-soft-drink-91",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-soft-drinks",
    "name": "Novida Soft Drink",
    "name_am": "ኖቪዳ ለስላሳ መጠጥ",
    "price": 90,
    "description": "Novida Soft Drink prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041103/nitsuh-menu/dishes/ptuap4elwsz0jsqza4we.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 91,
    "description_am": "ቀዝቃዛ ጣፋጭ የኖቪዳ አናናስ ለስላሳ መጠጥ።"
  },
  {
    "id": "item-bottle-soft-drink-92",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-soft-drinks",
    "name": "Bottle Soft Drink",
    "name_am": "የጠርሙስ ለስላሳ መጠጥ",
    "price": 100,
    "description": "Bottle Soft Drink prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041060/nitsuh-menu/dishes/fmnxextfvpywtzmpbk9z.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 92,
    "description_am": "ቀዝቃዛ የጠርሙስ ለስላሳ መጠጥ።"
  },
  {
    "id": "item-ambo-water-93",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-soft-drinks",
    "name": "Ambo water",
    "name_am": "አምቦ ውሃ",
    "price": 90,
    "description": "Ambo water prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041055/nitsuh-menu/dishes/gbvbnloskqvzcp0nn77i.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 93,
    "description_am": "የተፈጥሮ ማዕድን አምቦ ውሃ።"
  },
  {
    "id": "item-water-liter-94",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-soft-drinks",
    "name": "Water ½ Liter",
    "name_am": "ውሃ ግማሽ ሊትር (½)",
    "price": 50,
    "description": "Water ½ Liter prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041060/nitsuh-menu/dishes/hghrqph8pdx1b8plshwe.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 94,
    "description_am": "ንጹህ የታሸገ የተፈጥሮ ውሃ ግማሽ ሊትር።"
  },
  {
    "id": "item-water-1-liter-95",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-soft-drinks",
    "name": "Water 1 Liter",
    "name_am": "ውሃ 1 ሊትር",
    "price": 70,
    "description": "Water 1 Liter prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041060/nitsuh-menu/dishes/hghrqph8pdx1b8plshwe.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 95,
    "description_am": "ንጹህ የታሸገ የተፈጥሮ ውሃ አንድ ሊትር።"
  },
  {
    "id": "item-water-2-liter-96",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-soft-drinks",
    "name": "Water 2 Liter",
    "name_am": "ውሃ 2 ሊትር",
    "price": 80,
    "description": "Water 2 Liter prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041060/nitsuh-menu/dishes/hghrqph8pdx1b8plshwe.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 96,
    "description_am": "ንጹህ የታሸገ የተፈጥሮ ውሃ ሁለት ሊትር።"
  },
  {
    "id": "item-special-juice-97",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-juices",
    "name": "Special Juice",
    "name_am": "ስፔሻል ጭማቂ",
    "price": 450,
    "description": "Special Juice prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041113/nitsuh-menu/dishes/jmil4upegrojwzezxy1c.jpg",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": true,
    "sort_order": 97,
    "description_am": "ልዩ የበርካታ የተፈጥሮ ፍራፍሬዎች ቅልቅል ስፕሪስ ጭማቂ በቪምቶ።"
  },
  {
    "id": "item-papaya-juice-98",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-juices",
    "name": "Papaya Juice",
    "name_am": "የፓፓያ ጭማቂ",
    "price": 320,
    "description": "Papaya Juice prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041105/nitsuh-menu/dishes/bbgniire8laoamq2h8nv.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 98,
    "description_am": "100% የተፈጥሮ ፓፓያ ጭማቂ በሎሚ።"
  },
  {
    "id": "item-avocado-juice-99",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-juices",
    "name": "Avocado Juice",
    "name_am": "የአቮካዶ ጭማቂ",
    "price": 320,
    "description": "Avocado Juice prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041057/nitsuh-menu/dishes/yfunjaelohtajhbcdd6s.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 99,
    "description_am": "ወፍራም የተፈጥሮ አቮካዶ ጭማቂ በቪምቶ።"
  },
  {
    "id": "item-watermelon-juice-100",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-juices",
    "name": "Watermelon Juice",
    "name_am": "የሀብሀብ ጭማቂ",
    "price": 400,
    "description": "Watermelon Juice prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041124/nitsuh-menu/dishes/fnq3bcrlfjyzulrcpdte.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 100,
    "description_am": "ቀዝቃዛና መንፈስ የሚያድስ 100% የሀብሀብ ጭማቂ።"
  },
  {
    "id": "item-mango-juice-101",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-juices",
    "name": "Mango Juice",
    "name_am": "የማንጎ ጭማቂ",
    "price": 400,
    "description": "Mango Juice prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041092/nitsuh-menu/dishes/uzcbfsh8xf5utdzzqmef.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 101,
    "description_am": "ጣፋጭ የተፈጥሮ የማንጎ ጭማቂ።"
  },
  {
    "id": "item-pineapple-juice-102",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-juices",
    "name": "Pineapple Juice",
    "name_am": "የአናናስ ጭማቂ",
    "price": 400,
    "description": "Pineapple Juice prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041107/nitsuh-menu/dishes/bqhhfr9z28z4kp7vy6b6.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 102,
    "description_am": "ትኩስ የተጨመቀ የተፈጥሮ አናናስ ጭማቂ።"
  },
  {
    "id": "item-strawberry-juice-103",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-juices",
    "name": "Strawberry Juice",
    "name_am": "የእንጆሪ ጭማቂ",
    "price": 400,
    "description": "Strawberry Juice prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041118/nitsuh-menu/dishes/bovydy8kn0nstzellkiq.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 103,
    "description_am": "ጣፋጭ የተፈጥሮ እንጆሪ ፍራፍሬ ጭማቂ።"
  },
  {
    "id": "item-lemon-mint-juice-104",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-juices",
    "name": "Lemon Mint Juice",
    "name_am": "የሎሚ ሚንት ጭማቂ",
    "price": 400,
    "description": "Lemon Mint Juice prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041090/nitsuh-menu/dishes/ovdjiunyxgmcajgf53mc.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 104,
    "description_am": "ትኩስ የሎሚ ጭማቂ በሚንት ቅጠል እና በረዶ።"
  },
  {
    "id": "item-banana-shake-105",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-shakes",
    "name": "Banana Shake",
    "name_am": "የሙዝ ሼክ",
    "price": 450,
    "description": "Banana Shake prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041059/nitsuh-menu/dishes/vudraahudym4plg9muft.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 105,
    "description_am": "ክሬሚ የሙዝ ወተት ሼክ በቫኒላ።"
  },
  {
    "id": "item-strawberry-shake-106",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-shakes",
    "name": "Strawberry Shake",
    "name_am": "የእንጆሪ ሼክ",
    "price": 450,
    "description": "Strawberry Shake prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041118/nitsuh-menu/dishes/sbsunf5dwcqnrx36dqx4.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 106,
    "description_am": "ወፍራም የእንጆሪ ወተት ሼክ።"
  },
  {
    "id": "item-avocado-shake-107",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-shakes",
    "name": "Avocado Shake",
    "name_am": "የአቮካዶ ሼክ",
    "price": 450,
    "description": "Avocado Shake prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041057/nitsuh-menu/dishes/lhqoalppvbhvatf20sr9.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 107,
    "description_am": "ጣፋጭ የአቮካዶ እና የወተት ክሬም ሼክ።"
  },
  {
    "id": "item-mocha-shake-108",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-shakes",
    "name": "Mocha Shake",
    "name_am": "ሞካ ሼክ",
    "price": 450,
    "description": "Mocha Shake prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041103/nitsuh-menu/dishes/bxsmhyltromyh7sovjlk.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 108,
    "description_am": "የቡና እና ቸኮሌት ቅልቅል ክሬሚ ሼክ።"
  },
  {
    "id": "item-flaxseed-shake-109",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-shakes",
    "name": "Flaxseed Shake",
    "name_am": "የተልባ ሼክ",
    "price": 450,
    "description": "Flaxseed Shake prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041083/nitsuh-menu/dishes/vuyb1ucxvjlnknchrzus.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 109,
    "description_am": "ጤናማ የተልባ ፍሬ እና ወተት ሼክ።"
  },
  {
    "id": "item-chocolate-shake-110",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-shakes",
    "name": "Chocolate Shake",
    "name_am": "የቸኮሌት ሼክ",
    "price": 450,
    "description": "Chocolate Shake prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041069/nitsuh-menu/dishes/if0kyrlx0okwlskzd1qf.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 110,
    "description_am": "ጣፋጭ የቸኮሌት ወተት ሼክ በቸኮሌት ሶስ።"
  },
  {
    "id": "item-protien-shake-111",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-shakes",
    "name": "Protien Shake",
    "name_am": "ፕሮቲን ሼክ",
    "price": 600,
    "description": "Protien Shake prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041109/nitsuh-menu/dishes/ve4vvrhaxsxqahvauw8p.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 111,
    "description_am": "ከፍተኛ ጉልበት ሰጪ የፕሮቲን ሼክ።"
  },
  {
    "id": "item-tea-112",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-drinks",
    "name": "Tea",
    "name_am": "ሻይ",
    "price": 60,
    "description": "Tea prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041131/nitsuh-menu/dishes/k0k6d9gyrikfmrdpsfgi.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 112,
    "description_am": "ትኩስ ጥቁር ሻይ በቅመሞች።"
  },
  {
    "id": "item-coffee-113",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-drinks",
    "name": "Coffee",
    "name_am": "ቡና",
    "price": 70,
    "description": "Coffee prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041130/nitsuh-menu/dishes/veed0cxidtvqsiu5a1qf.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 113,
    "description_am": "ትኩስ የሀበሻ ጀበና ቡና።"
  },
  {
    "id": "item-espresso-114",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-drinks",
    "name": "Espresso",
    "name_am": "ኤስፕሬሶ",
    "price": 140,
    "description": "Espresso prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041080/nitsuh-menu/dishes/y9yoj6bm73dzyngt7hgy.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 114,
    "description_am": "ጠንካራና መዓዛ ያለው የጣሊያን ኤስፕሬሶ።"
  },
  {
    "id": "item-macchiato-115",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-drinks",
    "name": "Macchiato",
    "name_am": "ማኪያቶ",
    "price": 110,
    "description": "Macchiato prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041096/nitsuh-menu/dishes/tnyjy4radumocnq6pvwd.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 115,
    "description_am": "የኢትዮጵያ ምርጥ ወተት ማኪያቶ።"
  },
  {
    "id": "item-milk-116",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-drinks",
    "name": "Milk",
    "name_am": "ትኩስ ወተት",
    "price": 120,
    "description": "Milk prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041098/nitsuh-menu/dishes/pang3vzasaiaxrskxklu.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 116,
    "description_am": "ትኩስ ንጹህ ላም ወተት።"
  },
  {
    "id": "item-milk-with-coffee-117",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-drinks",
    "name": "Milk with coffee",
    "name_am": "ወተት በቡና",
    "price": 140,
    "description": "Milk with coffee prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "/images/dishes/roasted-chicken.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 117,
    "description_am": "ትኩስ ወተት በትንሽ ቡና።"
  },
  {
    "id": "item-milk-with-tea-118",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-drinks",
    "name": "Milk with Tea",
    "name_am": "ወተት በሻይ",
    "price": 140,
    "description": "Milk with Tea prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041098/nitsuh-menu/dishes/mdut2mirewmlcvogqoth.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 118,
    "description_am": "ትኩስ ወተት በሻይ ቅመም።"
  },
  {
    "id": "item-fasting-macchiato-119",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-drinks",
    "name": "Fasting Macchiato",
    "name_am": "የጾም ማኪያቶ",
    "price": 200,
    "description": "Fasting Macchiato prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041082/nitsuh-menu/dishes/hn6wq1klnyjdrxoicehb.jpg",
    "tags": [
      "vegan",
      "fasting"
    ],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 119,
    "description_am": "የጾም ማኪያቶ በአኩሪ አተር ወተት።"
  },
  {
    "id": "item-tea-sprice-120",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-drinks",
    "name": "Tea Sprice",
    "name_am": "ሻይ ስፕሪስ",
    "price": 100,
    "description": "Tea Sprice prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041118/nitsuh-menu/dishes/a8r4sp83k3bdnbpez7rb.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 120,
    "description_am": "ሻይ እና ቡና በግማሽ የተቀላቀለ ስፕሪስ።"
  },
  {
    "id": "item-lemon-tea-121",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-drinks",
    "name": "Lemon Tea",
    "name_am": "የሎሚ ሻይ",
    "price": 70,
    "description": "Lemon Tea prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041091/nitsuh-menu/dishes/fnfuh4lgzdpi4irlyqul.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 121,
    "description_am": "ትኩስ ሻይ በተጨመቀ ሎሚ።"
  },
  {
    "id": "item-mint-tea-122",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-drinks",
    "name": "Mint Tea",
    "name_am": "የናና ሻይ",
    "price": 70,
    "description": "Mint Tea prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041101/nitsuh-menu/dishes/biby0eypxe4vhjokpuga.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 122,
    "description_am": "ትኩስ ሻይ በሚንት (ናና) ቅጠል።"
  },
  {
    "id": "item-peanut-tea-123",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-drinks",
    "name": "Peanut Tea",
    "name_am": "የለውዝ ሻይ",
    "price": 140,
    "description": "Peanut Tea prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041106/nitsuh-menu/dishes/uvxhfhn07czophmzb2nr.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 123,
    "description_am": "ትኩስ ሻይ በኦቾሎኒ (ለውዝ) ቅቤ።"
  },
  {
    "id": "item-pineapple-tea-124",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-drinks",
    "name": "Pineapple Tea",
    "name_am": "የአናናስ ሻይ",
    "price": 140,
    "description": "Pineapple Tea prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041108/nitsuh-menu/dishes/sj90dmt4dzdpz0r0hd4c.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 124,
    "description_am": "ትኩስ ሻይ በአናናስ ጣዕም።"
  },
  {
    "id": "item-orange-tea-125",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-drinks",
    "name": "Orange Tea",
    "name_am": "የብርቱካን ሻይ",
    "price": 140,
    "description": "Orange Tea prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041105/nitsuh-menu/dishes/lx34cy62he3wzxgjx3w1.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 125,
    "description_am": "ትኩስ ሻይ በብርቱካን ጭማቂ።"
  },
  {
    "id": "item-caramel-latte-126",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-drinks",
    "name": "Caramel Latte",
    "name_am": "ካራሜል ላቴ",
    "price": 170,
    "description": "Caramel Latte prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041062/nitsuh-menu/dishes/ph1wjknqhatwo6ubyrii.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 126,
    "description_am": "ትኩስ ቡና በወተት እና ጣፋጭ ካራሜል ሶስ።"
  },
  {
    "id": "item-vanilla-latte-127",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-drinks",
    "name": "Vanilla Latte",
    "name_am": "ቫኒላ ላቴ",
    "price": 170,
    "description": "Vanilla Latte prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041123/nitsuh-menu/dishes/hkstjfyblwnexlcetron.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 127,
    "description_am": "ትኩስ ቡና በወተት እና የቫኒላ ጣዕም።"
  },
  {
    "id": "item-ginger-latte-128",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-drinks",
    "name": "Ginger Latte",
    "name_am": "ዝንጅብል ላቴ",
    "price": 170,
    "description": "Ginger Latte prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041085/nitsuh-menu/dishes/vfypfkllotffrep5zw6m.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 128,
    "description_am": "ትኩስ ቡና በወተት እና በሚያሞቅ ዝንጅብል።"
  },
  {
    "id": "item-hot-chocolate-129",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-drinks",
    "name": "Hot Chocolate",
    "name_am": "ትኩስ ቸኮሌት",
    "price": 170,
    "description": "Hot Chocolate prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041087/nitsuh-menu/dishes/xmjphybs9kpqdqkdyo2s.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 129,
    "description_am": "የቀለጠ የበለፀገ ትኩስ ቸኮሌት በወተት።"
  },
  {
    "id": "item-hot-caramel-130",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-drinks",
    "name": "Hot Caramel",
    "name_am": "ትኩስ ካራሜል",
    "price": 170,
    "description": "Hot Caramel prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041085/nitsuh-menu/dishes/fbr6bfam8mtsvisvt9sj.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 130,
    "description_am": "ጣፋጭ ትኩስ ካራሜል መጠጥ በወተት።"
  },
  {
    "id": "item-cuppuchino-131",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-drinks",
    "name": "Cuppuchino",
    "name_am": "ካፑቺኖ",
    "price": 170,
    "description": "Cuppuchino prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041062/nitsuh-menu/dishes/gquibaftrzfgmv7zk3ja.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 131,
    "description_am": "ክላሲክ ካፑቺኖ በወተት አረፋ እና ኮኮዋ።"
  },
  {
    "id": "item-special-tea-132",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-drinks",
    "name": "Special Tea",
    "name_am": "ስፔሻል ሻይ",
    "price": 180,
    "description": "Special Tea prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041105/nitsuh-menu/dishes/lx34cy62he3wzxgjx3w1.jpg",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": true,
    "sort_order": 132,
    "description_am": "ልዩ የቅመም ሻይ በዝንጅብል፣ ቀረፋ፣ ቅርንፉድ እና ሎሚ።"
  },
  {
    "id": "item-ice-latte-133",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-iced-drinks",
    "name": "ICE Latte",
    "name_am": "አይስ ላቴ",
    "price": 450,
    "description": "Coffee, milk, sugar syrup, Ice",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041089/nitsuh-menu/dishes/ijbaoshw8scfdtaxqsem.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 133,
    "description_am": "ቀዝቃዛ ኤስፕሬሶ ቡና በቀዝቃዛ ወተት እና በረዶ።"
  },
  {
    "id": "item-ice-tea-134",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-iced-drinks",
    "name": "ICE Tea",
    "name_am": "አይስ ሻይ",
    "price": 450,
    "description": "Tea, milk, sugar syrup, Ice",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041089/nitsuh-menu/dishes/sijyn58zxvdxdd4rh9vz.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 134,
    "description_am": "ቀዝቃዛ ሻይ በሎሚ እና በረዶ።"
  },
  {
    "id": "item-ice-vanilla-135",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-iced-drinks",
    "name": "ICE Vanilla",
    "name_am": "አይስ ቫኒላ",
    "price": 450,
    "description": "Vanilla, coffee, milk, sugar syrup, Ice",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041090/nitsuh-menu/dishes/wbpcs2h4p8tep83q9nxz.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 135,
    "description_am": "ቀዝቃዛ የቫኒላ ቡና በበረዶ።"
  },
  {
    "id": "item-ice-chocolate-136",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-iced-drinks",
    "name": "ICE Chocolate",
    "name_am": "አይስ ቸኮሌት",
    "price": 450,
    "description": "Chocolate syrup, coffee, milk, sugar syrup, Ice",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041087/nitsuh-menu/dishes/pag1zlp1oqjqdy3arnfo.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 136,
    "description_am": "ቀዝቃዛ የቸኮሌት መጠጥ በበረዶ።"
  },
  {
    "id": "item-ice-caramel-137",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-iced-drinks",
    "name": "ICE Caramel",
    "name_am": "አይስ ካራሜል",
    "price": 450,
    "description": "Caramel syrup, coffee, milk, sugar syrup, Ice",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041087/nitsuh-menu/dishes/ngdyvmycdtsxrwlugxdj.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 137,
    "description_am": "ቀዝቃዛ ካራሜል ቡና በበረዶ እና ክሬም።"
  },
  {
    "id": "item-ice-strawberry-138",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-iced-drinks",
    "name": "ICE Strawberry",
    "name_am": "አይስ እንጆሪ",
    "price": 450,
    "description": "Strawberry syrup, coffee, milk, sugar syrup, Ice",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041089/nitsuh-menu/dishes/ynnrg75rej1a7raxxprv.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 138,
    "description_am": "ቀዝቃዛ የእንጆሪ መጠጥ በበረዶ።"
  },
  {
    "id": "item-ice-deluxe-139",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-iced-drinks",
    "name": "ICE Deluxe",
    "name_am": "አይስ ዲሉክስ",
    "price": 600,
    "description": "Chocolate, caramel, vanilla, coffee, milk, sugar syrup, Ice",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041089/nitsuh-menu/dishes/birl5pgbgobn8qkxaasb.jpg",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 139,
    "description_am": "ልዩ ቀዝቃዛ ቡና በክሬም፣ ቸኮሌት እና ካራሜል።"
  },
  {
    "id": "item-mini-custard-vanilla-cake-140",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-desserts",
    "name": "Mini Custard Vanilla cake",
    "name_am": "ሚኒ ካስተርድ ቫኒላ ኬክ",
    "price": 80,
    "description": "Mini Custard Vanilla cake prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041101/nitsuh-menu/dishes/gbmqzx61bktna2gswrx6.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 140,
    "description_am": "ለስላሳ ሚኒ ቫኒላ ኬክ በጣፋጭ ካስተርድ ክሬም።"
  },
  {
    "id": "item-mini-millifoni-cake-141",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-desserts",
    "name": "Mini Millifoni cake",
    "name_am": "ሚኒ ሚሊፎኒ ኬክ",
    "price": 80,
    "description": "Mini Millifoni cake prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041101/nitsuh-menu/dishes/hul9aj4jg95oashit3py.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 141,
    "description_am": "ጥርት ያለ የጣሊያን ሚሊፎኒ ፔስትሪ በክሬም።"
  },
  {
    "id": "item-mini-chocolate-cake-142",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-desserts",
    "name": "Mini Chocolate cake",
    "name_am": "ሚኒ ቸኮሌት ኬክ",
    "price": 100,
    "description": "Mini Chocolate cake prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041101/nitsuh-menu/dishes/tjgbm5dkfcgg3okf6whi.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 142,
    "description_am": "ጣፋጭ የበለፀገ ሚኒ ቸኮሌት ኬክ።"
  },
  {
    "id": "item-tart-cake-143",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-desserts",
    "name": "Tart cake",
    "name_am": "ታርት ኬክ",
    "price": 80,
    "description": "Tart cake prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041131/nitsuh-menu/dishes/vm4rygeyrsblzgt96y0v.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 143,
    "description_am": "ጥርት ያለ የታርት ኬክ በፍራፍሬ እና ክሬም።"
  },
  {
    "id": "item-mini-boxega-cake-144",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-desserts",
    "name": "Mini Boxega cake",
    "name_am": "ሚኒ ቦዜጋ ኬክ",
    "price": 80,
    "description": "Mini Boxega cake prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041098/nitsuh-menu/dishes/hznywmufhjxepvszypgw.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 144,
    "description_am": "ባህላዊ ለስላሳ ሚኒ ቦዜጋ ኬክ።"
  },
  {
    "id": "item-english-cake-145",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-desserts",
    "name": "English Cake",
    "name_am": "ኢንግሊሽ ኬክ",
    "price": 150,
    "description": "English Cake prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041078/nitsuh-menu/dishes/fui6gjghyjuu2hnse4zw.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 145,
    "description_am": "ክላሲክ ለስላሳ የሻይ ሰዓት ኢንግሊሽ ኬክ።"
  },
  {
    "id": "item-classic-dounut-146",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-desserts",
    "name": "Classic Dounut",
    "name_am": "ክላሲክ ዶናት",
    "price": 200,
    "description": "Classic Dounut prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041071/nitsuh-menu/dishes/kjrssz0b2kk3fjglroej.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 146,
    "description_am": "ለስላሳ የተጠበሰ ጣፋጭ ክላሲክ ዶናት።"
  },
  {
    "id": "item-chocolate-chips-cookie-147",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-desserts",
    "name": "Chocolate Chips Cookie",
    "name_am": "ቸኮሌት ቺፕስ ኩኪስ",
    "price": 250,
    "description": "Chocolate Chips Cookie prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041067/nitsuh-menu/dishes/auy6u6sui7os4cis4jzm.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 147,
    "description_am": "ጥርት ያለ ኩኪስ በጣፋጭ ቸኮሌት ቺፕስ።"
  },
  {
    "id": "item-croissant-148",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-desserts",
    "name": "Croissant",
    "name_am": "ክሮሳንት",
    "price": 250,
    "description": "Croissant prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041076/nitsuh-menu/dishes/t1adb7tozz3mpys5abyd.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 148,
    "description_am": "ትኩስ ቅቤማ ለስላሳ የፈረንሳይ ክሮሳንት።"
  },
  {
    "id": "item-chocolate-croissant-149",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-desserts",
    "name": "Chocolate Croissant",
    "name_am": "የቸኮሌት ክሮሳንት",
    "price": 350,
    "description": "Chocolate Croissant prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041069/nitsuh-menu/dishes/sxbylouxyxzghrxjdqwe.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 149,
    "description_am": "ትኩስ ክሮሳንት በጣፋጭ ቸኮሌት የተሞላ።"
  },
  {
    "id": "item-tiramisu-cake-150",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-desserts",
    "name": "Tiramisu cake",
    "name_am": "ቲራሚሱ ኬክ",
    "price": 400,
    "description": "Tiramisu cake prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041119/nitsuh-menu/dishes/b5cpkaz85wry6zq4mr50.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 150,
    "description_am": "ክላሲክ የጣሊያን ቡና እና ማስካርፖኔ ቲራሚሱ ኬክ።"
  },
  {
    "id": "item-custard-vanilla-torta-1kg-151",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-desserts-kg",
    "name": "Custard Vanilla Torta 1Kg",
    "name_am": "ካስተርድ ቫኒላ ቶርታ 1ኪሎ",
    "price": 2000,
    "description": "Custard Vanilla Torta 1Kg prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041076/nitsuh-menu/dishes/gnfchwipgbgs7fhfoodm.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 151,
    "description_am": "የ1 ኪሎ ክብረ በዓል ካስተርድ ቫኒላ ቶርታ ኬክ።"
  },
  {
    "id": "item-millifoni-torta-1kg-152",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-desserts-kg",
    "name": "Millifoni Torta 1Kg",
    "name_am": "ሚሊፎኒ ቶርታ 1ኪሎ",
    "price": 2200,
    "description": "Millifoni Torta 1Kg prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041098/nitsuh-menu/dishes/fcskgzdramfzw4smuvhi.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 152,
    "description_am": "የ1 ኪሎ ክብረ በዓል ሚሊፎኒ ቶርታ ኬክ።"
  },
  {
    "id": "item-chocolate-torta-1kg-153",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-desserts-kg",
    "name": "Chocolate Torta 1Kg",
    "name_am": "ቸኮሌት ቶርታ 1ኪሎ",
    "price": 2500,
    "description": "Chocolate Torta 1Kg prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041068/nitsuh-menu/dishes/bfonwbylxzlmwqsrx2ji.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 153,
    "description_am": "የ1 ኪሎ ክብረ በዓል የበለፀገ ቸኮሌት ቶርታ ኬክ።"
  },
  {
    "id": "item-tiramisu-1kg-154",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-desserts-kg",
    "name": "Tiramisu 1Kg",
    "name_am": "ቲራሚሱ ቶርታ 1ኪሎ",
    "price": 2500,
    "description": "Tiramisu 1Kg prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041119/nitsuh-menu/dishes/lwkg2cimfah9hxqlen9p.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 154,
    "description_am": "የ1 ኪሎ ክላሲክ የጣሊያን ቲራሚሱ ቶርታ ኬክ።"
  },
  {
    "id": "item-butter-cookeis-1kg-155",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-desserts-kg",
    "name": "Butter Cookeis 1Kg",
    "name_am": "የቅቤ ኩኪስ 1ኪሎ",
    "price": 1600,
    "description": "Butter Cookeis 1Kg prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041062/nitsuh-menu/dishes/fy1gojvmyczhz8ltdiji.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 155,
    "description_am": "የ1 ኪሎ ለስላሳ ጥርት ያለ የቤት ውስጥ የቅቤ ኩኪስ።"
  },
  {
    "id": "item-chocolate-chips-cookeis-1kg-156",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-desserts-kg",
    "name": "Chocolate Chips Cookeis 1Kg",
    "name_am": "ቸኮሌት ቺፕስ ኩኪስ 1ኪሎ",
    "price": 2000,
    "description": "Chocolate Chips Cookeis 1Kg prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041069/nitsuh-menu/dishes/hgbmysarp0aifdak0vne.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 156,
    "description_am": "የ1 ኪሎ ጣፋጭ የቸኮሌት ቺፕስ ኩኪስ።"
  },
  {
    "id": "item-english-cake-1kg-157",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-desserts-kg",
    "name": "English Cake 1Kg",
    "name_am": "ኢንግሊሽ ኬክ 1ኪሎ",
    "price": 800,
    "description": "English Cake 1Kg prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041078/nitsuh-menu/dishes/ssszlh0yhqsgqbwveump.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 157,
    "description_am": "የ1 ኪሎ ክላሲክ ለስላሳ ኢንግሊሽ ኬክ።"
  },
  {
    "id": "item-marble-cake-1kg-158",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-desserts-kg",
    "name": "Marble Cake 1Kg",
    "name_am": "ማርብል ኬክ 1ኪሎ",
    "price": 800,
    "description": "Marble Cake 1Kg prepared fresh daily at Nitsuh Cafe & Restaurant.",
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041092/nitsuh-menu/dishes/gnobfvzsrbecdzxhzdbq.jpg",
    "tags": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 158,
    "description_am": "የ1 ኪሎ ቫኒላ እና ቸኮሌት የተቀላቀለበት ማርብል ኬክ።"
  }
];

let inMemoryOrders: Order[] = [];
let inMemoryServiceRequests: ServiceRequest[] = [];

// -----------------------------------------------------------------------------
// UNIFIED DATA ACCESS FUNCTIONS (SUPABASE + RESILIENT FALLBACK)
// -----------------------------------------------------------------------------

const STORAGE_KEY_RESTAURANT = 'digital_menu_restaurant_cache';

export function getStoredRestaurant(slug?: string): Restaurant | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RESTAURANT);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!slug || parsed.slug === slug) {
      if (
        parsed.name === 'Nitsuh Cafeteria' ||
        parsed.name === 'Addis Cafeteria' ||
        parsed.name === 'Nitsuh Cafeteria & Bakery' ||
        parsed.name === 'Nitsuh Grand Cafeteria'
      ) {
        parsed.name = 'Nitsuh Cafe & Restaurant';
        parsed.branch_name = 'Main Branch, Nitsuh Cafe & Restaurant';
        parsed.announcement = (parsed.announcement || '').replace(/Nitsuh Cafeteria/g, 'Nitsuh Cafe & Restaurant');
        persistRestaurant(parsed);
      }
      return parsed;
    }
  } catch {}
  return null;
}

export function persistRestaurant(restaurant: Restaurant): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_RESTAURANT, JSON.stringify(restaurant));
  } catch {}
}

// High-performance server-side in-memory TTL cache to eliminate cross-continent round-trip latency to Neon/Supabase
const SERVER_DATA_CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL
const serverDataCache = new Map<string, { data: any; timestamp: number }>();

export function invalidateServerMenuCache(prefix?: string): void {
  if (prefix) {
    for (const key of serverDataCache.keys()) {
      if (key.startsWith(prefix)) {
        serverDataCache.delete(key);
      }
    }
  } else {
    serverDataCache.clear();
  }
}

export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  const cacheKey = `restaurant_${slug.toLowerCase()}`;
  if (typeof window === 'undefined') {
    const cachedEntry = serverDataCache.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < SERVER_DATA_CACHE_TTL_MS) {
      return cachedEntry.data;
    }
  }
  // Check client-side cached restaurant first
  const cached = getStoredRestaurant(slug);
  if (cached) {
    inMemoryRestaurant = {
      ...inMemoryRestaurant,
      ...cached,
      theme_config: {
        ...inMemoryRestaurant.theme_config,
        ...(cached.theme_config || {}),
      },
    };
  }

  // 0. In browser: fetch live restaurant settings from Neon API route
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(`/api/restaurant?slug=${encodeURIComponent(slug)}`);
      if (res.ok) {
        const live = await res.json();
        if (live && live.id) {
          inMemoryRestaurant = {
            ...inMemoryRestaurant,
            ...live,
            theme_config: {
              ...(MOCK_RESTAURANT_NITSUH.theme_config || {}),
              ...(live.theme_config || {}),
              ...inMemoryRestaurant.theme_config,
            },
          };
          persistRestaurant(inMemoryRestaurant);
          return inMemoryRestaurant;
        }
      }
    } catch {
      // Fallback to local or server
    }
  }

  // 1. If Neon is connected (server-side):
  if (hasNeon()) {
    try {
      const sql = getNeon();
      if (sql) {
        const rows = await sql`
          SELECT * FROM public.restaurants
          WHERE slug = ${slug} OR (slug IN ('nitsuh', 'addis') AND ${slug} IN ('nitsuh', 'addis'))
          LIMIT 1
        `;
        if (rows && rows.length > 0) {
          const data = rows[0] as any;
          const merged: Restaurant = {
            ...MOCK_RESTAURANT_NITSUH,
            ...inMemoryRestaurant,
            ...data,
            slug: 'nitsuh',
            name: (data.name === 'Addis Cafeteria' || data.name === 'Nitsuh Cafeteria' || data.name === 'Nitsuh Cafeteria & Bakery' || data.name === 'Nitsuh Grand Cafeteria' ? 'Nitsuh Cafe & Restaurant' : data.name) || 'Nitsuh Cafe & Restaurant',
            short_name: (data.short_name === 'Addis' ? 'Nitsuh' : data.short_name) || 'Nitsuh',
            logo_letter: data.logo_letter === 'A' ? 'N' : (data.logo_letter || 'N'),
            announcement: ((data.announcement || inMemoryRestaurant.announcement) || '').replace(/\bAddis\b/g, 'Nitsuh'),
            tagline: ((data.tagline || inMemoryRestaurant.tagline) || '').replace(/\bAddis\b/g, 'Nitsuh'),
            branch_name: (((data.branch_name || inMemoryRestaurant.branch_name)) || '').replace(/\bAddis\b/g, 'Nitsuh'),
            theme_config: {
              ...(MOCK_RESTAURANT_NITSUH.theme_config || {}),
              ...(data.theme_config || {}),
              ...inMemoryRestaurant.theme_config,
            },
            address: data.address || inMemoryRestaurant.address,
            google_maps_url: data.google_maps_url || inMemoryRestaurant.google_maps_url,
          };
          inMemoryRestaurant = merged;
          persistRestaurant(merged);
          if (typeof window === 'undefined') {
            serverDataCache.set(cacheKey, { data: merged, timestamp: Date.now() });
          }
          return merged;
        }
      }
    } catch {
      // Fallback below
    }
  }

  // 2. If Supabase is connected with real credentials:
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      let query = supabase.from('restaurants').select('*');
      if (slug === 'nitsuh' || slug === 'addis') {
        query = query.in('slug', ['nitsuh', 'addis']);
      } else {
        query = query.eq('slug', slug);
      }
      const { data, error } = await Promise.race([
        query.limit(1).single(),
        new Promise<any>((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000)),
      ]);

      if (!error && data) {
        const merged: Restaurant = {
          ...MOCK_RESTAURANT_NITSUH,
          ...inMemoryRestaurant,
          ...(data as Restaurant),
          slug: 'nitsuh',
          name: (data.name === 'Addis Cafeteria' || data.name === 'Nitsuh Cafeteria' || data.name === 'Nitsuh Cafeteria & Bakery' || data.name === 'Nitsuh Grand Cafeteria' ? 'Nitsuh Cafe & Restaurant' : data.name) || 'Nitsuh Cafe & Restaurant',
          short_name: (data.short_name === 'Addis' ? 'Nitsuh' : data.short_name) || 'Nitsuh',
          logo_letter: data.logo_letter === 'A' ? 'N' : (data.logo_letter || 'N'),
          announcement: ((data as any).announcement || inMemoryRestaurant.announcement || '').replace(/\bAddis\b/g, 'Nitsuh'),
          tagline: ((data as any).tagline || inMemoryRestaurant.tagline || '').replace(/\bAddis\b/g, 'Nitsuh'),
          branch_name: (((data as any).branch_name || inMemoryRestaurant.branch_name) || '').replace(/\bAddis\b/g, 'Nitsuh'),
          theme_config: {
            ...(MOCK_RESTAURANT_NITSUH.theme_config || {}),
            ...((data as any).theme_config || {}),
            ...inMemoryRestaurant.theme_config,
          },
          address: (data as any).address || inMemoryRestaurant.address,
          google_maps_url: (data as any).google_maps_url || inMemoryRestaurant.google_maps_url,
        };
        inMemoryRestaurant = merged;
        persistRestaurant(merged);
        if (typeof window === 'undefined') {
          serverDataCache.set(cacheKey, { data: merged, timestamp: Date.now() });
        }
        return merged;
      }
    } catch {
      // Fallback below
    }
  }

  // Built-in fallback matching requested slug
  if (slug.toLowerCase() === 'nitsuh' || slug.toLowerCase() === 'nitsuh-cafeteria' || slug.toLowerCase() === 'addis' || slug.toLowerCase() === 'afla' || slug.toLowerCase() === 'addis-cafeteria' || slug === 'default' || slug === 'aura') {
    if (typeof window === 'undefined') {
      serverDataCache.set(cacheKey, { data: inMemoryRestaurant, timestamp: Date.now() });
    }
    return inMemoryRestaurant;
  }

  return null;
}

const STORAGE_KEY_CATEGORIES = 'digital_menu_categories_cache_v3';

let inMemoryCategories: Category[] = [];

export function getStoredCategories(): Category[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistCategories(cats: Category[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(cats));
  } catch {}
}

export async function getMenuCategories(restaurantId: string): Promise<Category[]> {
  const cacheKey = `categories_${restaurantId}`;
  if (typeof window === 'undefined') {
    const cachedEntry = serverDataCache.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < SERVER_DATA_CACHE_TTL_MS) {
      return cachedEntry.data;
    }
  }
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(`/api/menu/categories?restaurantId=${encodeURIComponent(restaurantId)}`);
      if (res.ok) {
        const cats = await res.json();
        if (Array.isArray(cats) && cats.length > 0) {
          inMemoryCategories = cats;
          persistCategories(inMemoryCategories);
          return inMemoryCategories;
        }
      }
    } catch {}
  }

  if (hasNeon()) {
    try {
      const sql = getNeon();
      if (sql) {
        const rows = await sql`
          SELECT * FROM public.categories
          WHERE restaurant_id = ${restaurantId}
          ORDER BY sort_order ASC
        `;
        if (rows && rows.length > 0) {
          const local = getStoredCategories();
          const dataIds = new Set(rows.map((d: any) => d.id));
          const localOnly = local.filter((c) => !dataIds.has(c.id));
          const localMap = new Map(local.map((c) => [c.id, c]));
          const sanitizedData = (rows as Category[]).map((c) => ({
            ...c,
            name: c.name ? c.name.replace(/\bAddis\b/g, 'Nitsuh') : c.name,
            description: c.description ? c.description.replace(/\bAddis\b/g, 'Nitsuh') : c.description,
          }));
          inMemoryCategories = [
            ...sanitizedData.map((d) => localMap.get(d.id) || d),
            ...localOnly,
          ].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
          persistCategories(inMemoryCategories);
          if (typeof window === 'undefined') {
            serverDataCache.set(cacheKey, { data: inMemoryCategories, timestamp: Date.now() });
          }
          return inMemoryCategories;
        }
      }
    } catch {}
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        const local = getStoredCategories();
        const dataIds = new Set(data.map((d: any) => d.id));
        const localOnly = local.filter((c) => !dataIds.has(c.id));
        const localMap = new Map(local.map((c) => [c.id, c]));
        const sanitizedData = (data as Category[]).map((c) => ({
          ...c,
          name: c.name ? c.name.replace(/\bAddis\b/g, 'Nitsuh') : c.name,
          description: c.description ? c.description.replace(/\bAddis\b/g, 'Nitsuh') : c.description,
        }));
        inMemoryCategories = [
          ...sanitizedData.map((d) => localMap.get(d.id) || d),
          ...localOnly,
        ].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        persistCategories(inMemoryCategories);
        return inMemoryCategories;
      }
    } catch {
      // Fallback below
    }
  }

  const local = getStoredCategories();
  if (local.length > 0) {
    inMemoryCategories = local;
    return inMemoryCategories;
  }

  if (inMemoryCategories.length > 0) return inMemoryCategories;
  inMemoryCategories = [...MOCK_CATEGORIES_NITSUH];
  persistCategories(inMemoryCategories);
  return inMemoryCategories;
}

export async function getMenuItems(restaurantId: string): Promise<MenuItem[]> {
  const cacheKey = `items_${restaurantId}`;
  if (typeof window === 'undefined') {
    const cachedEntry = serverDataCache.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < SERVER_DATA_CACHE_TTL_MS) {
      return cachedEntry.data;
    }
  }
  // 1. In browser, query Neon through server API endpoint to guarantee exact Neon DB state
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(`/api/menu/items?restaurantId=${encodeURIComponent(restaurantId)}`);
      if (res.ok) {
        const items = await res.json();
        if (Array.isArray(items)) {
          inMemoryItems = items;
          try {
            localStorage.setItem('digital_menu_items_cache_v4', JSON.stringify(inMemoryItems));
          } catch {}
          return inMemoryItems;
        }
      }
    } catch {
      // Fallback below if API route fails
    }
  }

  // 2. Server-side: Query Neon serverless PostgreSQL directly
  if (hasNeon()) {
    try {
      const sql = getNeon();
      if (sql) {
        const rows = await sql`
          SELECT * FROM public.items
          WHERE restaurant_id = ${restaurantId}
          ORDER BY sort_order ASC
        `;
        if (rows) {
          const sanitized = (rows as any[]).map((item) => ({
            ...item,
            price: Number(item.price) || 0,
            name: item.name ? item.name.replace(/\bAddis\b/g, 'Nitsuh') : item.name,
            description: item.description
              ? item.description.replace(/\bAddis Cafeteria\b/g, 'Nitsuh Cafe & Restaurant').replace(/\bAddis\b/g, 'Nitsuh')
              : item.description,
          }));
          inMemoryItems = sanitized;
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('digital_menu_items_cache_v4', JSON.stringify(inMemoryItems));
            } catch {}
          }
          if (typeof window === 'undefined') {
            serverDataCache.set(cacheKey, { data: inMemoryItems, timestamp: Date.now() });
          }
          return inMemoryItems;
        }
      }
    } catch {}
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('items')
        .select('*, options:item_options(*)')
        .eq('restaurant_id', restaurantId)
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        const sanitized = (data as MenuItem[]).map((item) => ({
          ...item,
          name: item.name ? item.name.replace(/\bAddis\b/g, 'Nitsuh') : item.name,
          description: item.description
            ? item.description.replace(/\bAddis Cafeteria\b/g, 'Nitsuh Cafe & Restaurant').replace(/\bAddis\b/g, 'Nitsuh')
            : item.description,
        }));
        inMemoryItems = sanitized;
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('digital_menu_items_cache_v4', JSON.stringify(inMemoryItems));
          } catch {}
        }
        return inMemoryItems;
      }
    } catch {
      // Fallback below
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('digital_menu_items_cache_v4');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length >= MOCK_ITEMS_NITSUH.length) {
          inMemoryItems = parsed;
          return inMemoryItems;
        }
      }
    } catch {}
  }

  if (inMemoryItems.length > 0) return inMemoryItems;
  return MOCK_ITEMS_NITSUH;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  // 1. Rate Limiting Protection (Anti-Spam / Anti-DDoS)
  const rateLimitKey = `order:${input.restaurant_id}:${input.table_number || 'order'}`;
  const rateCheck = rateLimiter.check(rateLimitKey, RATE_LIMITS.SUBMIT_ORDER);
  if (!rateCheck.allowed) {
    throw new Error(rateCheck.errorMessage || 'Too many orders placed. Please wait a moment before trying again.');
  }

  // 2. Authoritative Price Verification: Recalculate line totals and prevent client price manipulation
  const itemsCatalog = inMemoryItems.length > 0 ? inMemoryItems : MOCK_ITEMS_NITSUH;
  const itemsMap = new Map(itemsCatalog.map((item) => [item.id, item]));

  let verifiedSubtotal = 0;
  const sanitizedItems = input.items.map((cartItem) => {
    const catalogItem = itemsMap.get(cartItem.item_id);
    const unitPrice = catalogItem ? catalogItem.price : cartItem.price;
    const optionsTotal = (cartItem.selected_options || []).reduce((acc, opt) => acc + (opt.price || 0), 0);
    const lineTotal = Number(((unitPrice + optionsTotal) * cartItem.quantity).toFixed(2));
    verifiedSubtotal += lineTotal;

    return {
      ...cartItem,
      price: unitPrice,
      line_total: lineTotal,
    };
  });

  const verifiedSubtotalRounded = Number(verifiedSubtotal.toFixed(2));
  const restaurant = getStoredRestaurant(input.restaurant_id) || MOCK_RESTAURANT_NITSUH;
  const taxRate = restaurant.tax_rate ?? 0.15;
  const verifiedTax = restaurant.tax_mode === 'exclusive' 
    ? Number((verifiedSubtotalRounded * taxRate).toFixed(2)) 
    : 0;
  const verifiedTotal = Number((verifiedSubtotalRounded + verifiedTax).toFixed(2));

  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    restaurant_id: input.restaurant_id,
    table_number: input.table_number || 'Order',
    items: sanitizedItems,
    subtotal: verifiedSubtotalRounded,
    tax: verifiedTax,
    total: verifiedTotal,
    status: 'pending',
    notes: input.notes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  inMemoryOrders.unshift(newOrder);

  if (typeof window !== 'undefined') {
    try {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((saved) => {
          if (saved && saved.id) {
            newOrder.id = saved.id;
          }
        })
        .catch(() => {});
    } catch {}
  } else if (hasNeon()) {
    try {
      const sql = getNeon();
      if (sql) {
        sql`
          INSERT INTO public.orders (
            restaurant_id, table_number, items, subtotal, tax, total, status, notes, created_at, updated_at
          ) VALUES (
            ${newOrder.restaurant_id}, ${newOrder.table_number}, ${JSON.stringify(newOrder.items)}::jsonb,
            ${newOrder.subtotal}, ${newOrder.tax}, ${newOrder.total}, ${newOrder.status}, ${newOrder.notes || null}, NOW(), NOW()
          )
        `.catch(() => {});
      }
    } catch {}
  }

  return newOrder;
}

export async function getRestaurantOrders(restaurantId: string): Promise<Order[]> {
  const cacheKey = `orders_${restaurantId}`;
  if (typeof window === 'undefined') {
    const cachedEntry = serverDataCache.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < SERVER_DATA_CACHE_TTL_MS) {
      return cachedEntry.data;
    }
  }

  // 1. Client-side fetch
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(`/api/orders?restaurantId=${encodeURIComponent(restaurantId)}`);
      if (res.ok) {
        const liveOrders = (await res.json()) as Order[];
        if (Array.isArray(liveOrders)) {
          inMemoryOrders = liveOrders;
          return liveOrders;
        }
      }
    } catch {}
  }

  // 2. Server-side Neon fetch
  if (hasNeon()) {
    try {
      const sql = getNeon();
      if (sql) {
        let targetId = restaurantId;
        const rows = await sql`
          SELECT * FROM public.orders
          WHERE restaurant_id = ${targetId}
          ORDER BY created_at DESC
          LIMIT 200
        `;
        const mapped: Order[] = (rows || []).map((r: any) => ({
          id: r.id,
          restaurant_id: r.restaurant_id,
          table_number: r.table_number,
          items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || []),
          subtotal: Number(r.subtotal || 0),
          tax: Number(r.tax || 0),
          total: Number(r.total || 0),
          status: r.status,
          notes: r.notes || undefined,
          created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
        }));
        if (typeof window === 'undefined') {
          serverDataCache.set(cacheKey, { data: mapped, timestamp: Date.now() });
        }
        inMemoryOrders = mapped;
        return mapped;
      }
    } catch {}
  }

  return inMemoryOrders;
}

export async function createServiceRequest(input: ServiceRequestInput): Promise<ServiceRequest> {
  // Rate Limiting Protection (Anti-Spam waiter call flooding)
  const rateLimitKey = `service:${input.restaurant_id}:${input.table_number || 'service'}`;
  const rateCheck = rateLimiter.check(rateLimitKey, RATE_LIMITS.SERVICE_REQUEST);
  if (!rateCheck.allowed) {
    throw new Error(rateCheck.errorMessage || 'Please wait before requesting assistance again.');
  }

  const newRequest: ServiceRequest = {
    id: `req-${Date.now()}`,
    restaurant_id: input.restaurant_id,
    table_number: input.table_number || 'Service',
    request_type: input.request_type,
    notes: input.notes,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  inMemoryServiceRequests.unshift(newRequest);

  if (typeof window !== 'undefined') {
    try {
      fetch('/api/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((saved) => {
          if (saved && saved.id) {
            newRequest.id = saved.id;
          }
        })
        .catch(() => {});
    } catch {}
  } else if (hasNeon()) {
    try {
      const sql = getNeon();
      if (sql) {
        sql`
          INSERT INTO public.service_requests (
            restaurant_id, table_number, request_type, notes, status, created_at
          ) VALUES (
            ${newRequest.restaurant_id}, ${newRequest.table_number}, ${newRequest.request_type}, ${newRequest.notes || null}, ${newRequest.status}, NOW()
          )
        `.catch(() => {});
      }
    } catch {}
  }

  return newRequest;
}

export async function getLiveOrders(restaurantId: string): Promise<Order[]> {
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(`/api/orders?restaurantId=${encodeURIComponent(restaurantId)}`);
      if (res.ok) {
        const live = (await res.json()) as Order[];
        if (Array.isArray(live)) {
          inMemoryOrders = live;
          return live;
        }
      }
    } catch {}
  } else if (hasNeon()) {
    try {
      const sql = getNeon();
      if (sql) {
        const rows = await sql`
          SELECT * FROM public.orders
          WHERE restaurant_id = ${restaurantId}
          ORDER BY created_at DESC
          LIMIT 100
        `;
        const mapped: Order[] = rows.map((r: any) => ({
          id: r.id,
          restaurant_id: r.restaurant_id,
          table_number: r.table_number,
          items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || []),
          subtotal: Number(r.subtotal || 0),
          tax: Number(r.tax || 0),
          total: Number(r.total || 0),
          status: r.status,
          notes: r.notes || undefined,
          created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
        }));
        inMemoryOrders = mapped;
        return mapped;
      }
    } catch {}
  }
  return inMemoryOrders;
}

export async function getLiveServiceRequests(restaurantId: string): Promise<ServiceRequest[]> {
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(`/api/service-requests?restaurantId=${encodeURIComponent(restaurantId)}`);
      if (res.ok) {
        const live = (await res.json()) as ServiceRequest[];
        if (Array.isArray(live)) {
          inMemoryServiceRequests = live;
          return live;
        }
      }
    } catch {}
  } else if (hasNeon()) {
    try {
      const sql = getNeon();
      if (sql) {
        const rows = await sql`
          SELECT * FROM public.service_requests
          WHERE restaurant_id = ${restaurantId}
          ORDER BY created_at DESC
          LIMIT 100
        `;
        const mapped: ServiceRequest[] = rows.map((r: any) => ({
          id: r.id,
          restaurant_id: r.restaurant_id,
          table_number: r.table_number,
          request_type: r.request_type,
          notes: r.notes || undefined,
          status: r.status,
          created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        }));
        inMemoryServiceRequests = mapped;
        return mapped;
      }
    } catch {}
  }
  return inMemoryServiceRequests;
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
  const ord = inMemoryOrders.find((o) => o.id === orderId);
  if (ord) ord.status = status;

  if (typeof window !== 'undefined') {
    try {
      fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status }),
      }).catch(() => {});
    } catch {}
  }
  return true;
}

export async function resolveServiceRequest(requestId: string): Promise<boolean> {
  const req = inMemoryServiceRequests.find((r) => r.id === requestId);
  if (req) req.status = 'completed';

  if (typeof window !== 'undefined') {
    try {
      fetch('/api/service-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: requestId, status: 'completed' }),
      }).catch(() => {});
    } catch {}
  }
  return true;
}

// -----------------------------------------------------------------------------
// STAGE 3: OFFERS DATA & OPERATIONS (SUPABASE + IN-MEMORY FALLBACK)
// -----------------------------------------------------------------------------

export const MOCK_OFFERS_NITSUH: Offer[] = [
  {
    id: 'f1a8c1e2-3456-4789-a012-3456789abc01',
    restaurant_id: MOCK_RESTAURANT_NITSUH.id,
    title: 'Happy Hour: 20% Off Wood-Fired Pizzas',
    description: 'Enjoy 20% off all artisan wood-fired pizzas every day.',
    badge_text: '20% Off',
    template_type: 'happy_hour',
    status: 'live',
    is_paused: false,
    discount_type: 'percentage',
    discount_value: 20,
    scope_type: 'categories',
    category_ids: ['cat-pizza'],
    timezone: 'Africa/Addis_Ababa',
    days_of_week: [0, 1, 2, 3, 4, 5, 6],
    start_time: '00:00',
    end_time: '23:59',
    honest_urgency_hours: 2,
    show_top_banner: true,
    banner_text: '🌿 Afternoon Happy Hour: 20% off all artisan pizzas until late.',
    banner_link_text: 'See offer',
    stacking_rule: 'best_discount',
    priority: 10,
    views_count: 184,
    taps_count: 42,
    orders_count: 14,
    total_savings: 38.5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'f2b9d2e3-4567-4890-b123-456789abc02',
    restaurant_id: MOCK_RESTAURANT_NITSUH.id,
    title: 'Nitsuh Burger Special: 40 ETB Off',
    description: 'Save 40 ETB when enjoying our signature House Special Burger.',
    badge_text: '40 ETB Off',
    template_type: 'money_off',
    status: 'live',
    is_paused: false,
    discount_type: 'fixed_amount',
    discount_value: 40.0,
    scope_type: 'items',
    item_ids: ['item-nitsuh-special-burger-17'],
    timezone: 'Africa/Addis_Ababa',
    days_of_week: [0, 1, 2, 3, 4, 5, 6],
    start_time: '00:00',
    end_time: '23:59',
    honest_urgency_hours: 0,
    show_top_banner: false,
    stacking_rule: 'best_discount',
    priority: 5,
    views_count: 96,
    taps_count: 28,
    orders_count: 9,
    total_savings: 36.0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'f3c0e3f4-5678-4901-c234-56789abc03',
    restaurant_id: MOCK_RESTAURANT_NITSUH.id,
    title: 'Complimentary Single-Origin Espresso over 500 ETB',
    description: 'Free single-origin Yirgacheffe espresso automatically added to orders over 500 ETB.',
    badge_text: 'Free Gift',
    template_type: 'free_item',
    status: 'live',
    is_paused: false,
    discount_type: 'free_item',
    discount_value: 0,
    min_order_amount: 500.0,
    free_item_id: 'item-espresso-114',
    scope_type: 'all',
    timezone: 'Africa/Addis_Ababa',
    days_of_week: [0, 1, 2, 3, 4, 5, 6],
    start_time: '00:00',
    end_time: '23:59',
    honest_urgency_hours: 0,
    show_top_banner: false,
    stacking_rule: 'allow_stack',
    priority: 1,
    views_count: 82,
    taps_count: 19,
    orders_count: 8,
    total_savings: 40.0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let inMemoryOffers: Offer[] = [...MOCK_OFFERS_NITSUH];

export async function getOffers(restaurantId: string): Promise<Offer[]> {
  const cacheKey = `offers_${restaurantId}`;
  if (typeof window === 'undefined') {
    const cachedEntry = serverDataCache.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < SERVER_DATA_CACHE_TTL_MS) {
      return cachedEntry.data;
    }
  }

  // In browser, query Neon through server API endpoint to guarantee exact Neon DB state
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(`/api/offers?restaurantId=${encodeURIComponent(restaurantId)}`);
      if (res.ok) {
        const liveOffers = await res.json();
        if (Array.isArray(liveOffers)) {
          inMemoryOffers = liveOffers;
          return inMemoryOffers;
        }
      }
    } catch {
      // Fallback below if API route fails
    }
  }

  if (hasNeon()) {
    try {
      const sql = getNeon();
      if (sql) {
        const rows = await sql`
          SELECT * FROM public.offers
          WHERE restaurant_id = ${restaurantId}
          ORDER BY priority DESC
        `;
        if (rows) {
          const mapped = (rows as any[])
            .map((d: any) => {
              const scopeType: 'all' | 'categories' | 'items' =
                d.scope_type ||
                (d.offer_type === 'category_discount'
                  ? 'categories'
                  : d.offer_type === 'item_discount' || (Array.isArray(d.item_ids) && d.item_ids.length > 0)
                  ? 'items'
                  : d.offer_type === 'order_threshold'
                  ? 'all'
                  : 'categories');

              const rawItemIds: string[] = Array.isArray(d.item_ids) && d.item_ids.length > 0
                ? d.item_ids
                : Array.isArray(d.target_item_ids) && d.target_item_ids.length > 0
                ? d.target_item_ids
                : [];

              const rawCategoryIds: string[] = scopeType === 'items'
                ? []
                : Array.isArray(d.category_ids) && d.category_ids.filter(Boolean).length > 0
                ? d.category_ids.filter(Boolean)
                : Array.isArray(d.target_category_ids) && d.target_category_ids.filter(Boolean).length > 0
                ? d.target_category_ids.filter(Boolean)
                : [];

              const title = (d.title || '').replace(/\bAddis\b/g, 'Nitsuh');
              const description = (d.description || '').replace(/\bAddis\b/g, 'Nitsuh');

              return {
                ...d,
                title,
                description,
                status: d.status || (d.is_active ? 'live' : 'paused'),
                is_paused: d.is_paused ?? !d.is_active,
                show_top_banner: d.show_top_banner ?? (d.priority >= 10 || d.offer_type === 'category_discount' || title.toLowerCase().includes('happy hour')),
                template_type: d.template_type || d.offer_type || 'percentage_off',
                discount_type: d.discount_type || (d.offer_type === 'order_threshold' ? 'free_item' : 'percentage'),
                discount_value: Number(d.discount_value || 0),
                min_order_amount: Number(d.threshold_amount || d.min_order_amount || 0),
                scope_type: scopeType,
                category_ids: rawCategoryIds,
                item_ids: rawItemIds,
                timezone: d.timezone || 'Africa/Addis_Ababa',
                days_of_week: d.days_of_week || [0, 1, 2, 3, 4, 5, 6],
                start_time: d.start_time || '00:00',
                end_time: d.end_time || '23:59',
                honest_urgency_hours: d.honest_urgency_hours ?? 2,
                banner_text: d.banner_text || title,
                banner_link_text: d.banner_link_text || 'See offer',
                stacking_rule: d.stacking_rule || 'best_discount',
              };
            })
            .filter((o: any) => {
              if (o.scope_type === 'items' && (!o.item_ids || o.item_ids.length === 0)) return false;
              if (o.scope_type === 'categories' && (!o.category_ids || o.category_ids.length === 0)) return false;
              return true;
            }) as Offer[];

          if (mapped.length > 0) {
            inMemoryOffers = mapped;
            if (typeof window === 'undefined') {
              serverDataCache.set(cacheKey, { data: mapped, timestamp: Date.now() });
            }
            return mapped;
          }
          inMemoryOffers = [...MOCK_OFFERS_NITSUH];
          return inMemoryOffers;
        }
      }
    } catch {}
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('priority', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped = data
          .map((d: any) => {
            const rawCategoryIds: string[] = Array.isArray(d.category_ids) && d.category_ids.filter(Boolean).length > 0
              ? d.category_ids.filter(Boolean)
              : Array.isArray(d.target_category_ids) && d.target_category_ids.filter(Boolean).length > 0
              ? d.target_category_ids.filter(Boolean)
              : d.offer_type === 'category_discount' || d.template_type === 'happy_hour' || (d.title && d.title.toLowerCase().includes('pizza'))
              ? ['cat-pizza']
              : [];
            const rawItemIds: string[] = Array.isArray(d.item_ids) && d.item_ids.length > 0
              ? d.item_ids
              : Array.isArray(d.target_item_ids) && d.target_item_ids.length > 0
              ? d.target_item_ids
              : d.offer_type === 'item_discount'
              ? ['item-nitsuh-special-burger-17', 'item-house-special-pizza-33']
              : [];

            let scopeType: 'all' | 'categories' | 'items' = 'items';
            if (d.scope_type) {
              scopeType = d.scope_type;
            } else if (d.offer_type === 'category_discount' || rawCategoryIds.length > 0) {
              scopeType = 'categories';
            } else if (d.offer_type === 'item_discount' || rawItemIds.length > 0) {
              scopeType = 'items';
            } else if (d.offer_type === 'order_threshold') {
              scopeType = 'all';
            }

            const title = (d.title || '').replace(/\bAddis\b/g, 'Nitsuh');
            const description = (d.description || '').replace(/\bAddis\b/g, 'Nitsuh');

            return {
              ...d,
              title,
              description,
              status: d.status || (d.is_active ? 'live' : 'paused'),
              is_paused: d.is_paused ?? !d.is_active,
              show_top_banner: d.show_top_banner ?? (d.priority >= 10 || d.offer_type === 'category_discount' || title.toLowerCase().includes('happy hour')),
              template_type: d.template_type || d.offer_type || 'percentage_off',
              discount_type: d.discount_type || (d.offer_type === 'order_threshold' ? 'free_item' : 'percentage'),
              discount_value: Number(d.discount_value || 0),
              min_order_amount: Number(d.threshold_amount || d.min_order_amount || 0),
              scope_type: scopeType,
              category_ids: rawCategoryIds,
              item_ids: rawItemIds,
              timezone: d.timezone || 'Africa/Addis_Ababa',
              days_of_week: d.days_of_week || [0, 1, 2, 3, 4, 5, 6],
              start_time: d.start_time || '00:00',
              end_time: d.end_time || '23:59',
              honest_urgency_hours: d.honest_urgency_hours ?? 2,
              banner_text: d.banner_text || title,
              banner_link_text: d.banner_link_text || 'See offer',
              stacking_rule: d.stacking_rule || 'best_discount',
            };
          })
          .filter((o: any) => {
            // Never apply an item discount if it has 0 items, or category discount if it has 0 categories
            if (o.scope_type === 'items' && (!o.item_ids || o.item_ids.length === 0)) return false;
            if (o.scope_type === 'categories' && (!o.category_ids || o.category_ids.length === 0)) return false;
            return true;
          }) as Offer[];

        if (mapped.length > 0) {
          inMemoryOffers = mapped;
          return mapped;
        }
      }
    } catch {
      // Fallback below
    }
  }

  if (inMemoryOffers.length > 0) return inMemoryOffers;
  return MOCK_OFFERS_NITSUH;
}

export async function saveOffer(offer: Partial<Offer> & { restaurant_id: string }): Promise<Offer> {
  const isExisting = offer.id && inMemoryOffers.some((o) => o.id === offer.id);

  if (isExisting && offer.id) {
    inMemoryOffers = inMemoryOffers.map((o) =>
      o.id === offer.id ? ({ ...o, ...offer, updated_at: new Date().toISOString() } as Offer) : o
    );
    const updated = inMemoryOffers.find((o) => o.id === offer.id)!;

    // Sync to Neon DB via API route in browser
    if (typeof window !== 'undefined') {
      try {
        fetch('/api/offers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        }).catch((e) => console.warn('Could not sync offer update to Neon:', e));
      } catch {}
    }

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
      try {
        const supabase = createClient();
        await supabase.from('offers').update(updated).eq('id', updated.id);
      } catch {
        // Handled
      }
    }
    invalidateServerMenuCache('offers');
    return updated;
  }

  const newOffer: Offer = {
    id: offer.id || `off-${Date.now()}`,
    restaurant_id: offer.restaurant_id,
    title: offer.title || 'Special Promotion',
    description: offer.description || '',
    badge_text: offer.badge_text || 'Offer',
    template_type: offer.template_type || 'percentage_off',
    status: offer.status || 'live',
    is_paused: offer.is_paused ?? false,
    discount_type: offer.discount_type || 'percentage',
    discount_value: Number(offer.discount_value || 0),
    min_order_amount: offer.min_order_amount,
    free_item_id: offer.free_item_id,
    scope_type: offer.scope_type || 'all',
    category_ids: offer.category_ids && offer.category_ids.filter(Boolean).length > 0
      ? Array.from(new Set([
          ...offer.category_ids.filter(Boolean),
          ...(offer.category_ids.some((c: string) => c.toLowerCase().includes('pizza')) || offer.template_type === 'happy_hour' ? ['cat-pizza', 'cat_pizza_30'] : []),
          ...(offer.category_ids.some((c: string) => c.toLowerCase().includes('burger')) ? ['cat-burger', 'cat_burger_20'] : [])
        ]))
      : (offer.scope_type === 'categories' || offer.template_type === 'happy_hour' ? ['cat-pizza', 'cat_pizza_30'] : []),
    item_ids: offer.item_ids || [],
    timezone: offer.timezone || 'Africa/Addis_Ababa',
    starts_at: offer.starts_at || null,
    ends_at: offer.ends_at || null,
    days_of_week: offer.days_of_week || [0, 1, 2, 3, 4, 5, 6],
    start_time: offer.start_time || null,
    end_time: offer.end_time || null,
    honest_urgency_hours: offer.honest_urgency_hours ?? 2,
    show_top_banner: offer.show_top_banner ?? false,
    banner_text: offer.banner_text || '',
    banner_link_text: offer.banner_link_text || 'See offer',
    stacking_rule: offer.stacking_rule || 'best_discount',
    priority: offer.priority ?? 5,
    views_count: 0,
    taps_count: 0,
    orders_count: 0,
    total_savings: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  inMemoryOffers.unshift(newOffer);
  invalidateServerMenuCache('offers');

  // Sync to Neon DB via API route in browser
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOffer),
      });
      if (res.ok) {
        const saved = await res.json();
        if (saved && saved.id) {
          return saved;
        }
      }
    } catch (e) {
      console.warn('Could not sync new offer to Neon:', e);
    }
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      await supabase.from('offers').insert(newOffer);
    } catch {
      // Handled
    }
  }

  return newOffer;
}

export async function togglePauseOffer(offerId: string, isPaused: boolean): Promise<Offer | null> {
  const offer = inMemoryOffers.find((o) => o.id === offerId);
  if (!offer) return null;

  offer.is_paused = isPaused;
  offer.updated_at = new Date().toISOString();

  // Sync to Neon DB via API route in browser
  if (typeof window !== 'undefined') {
    try {
      fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offer),
      }).catch((e) => console.warn('Could not sync togglePauseOffer to Neon:', e));
    } catch {}
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      await supabase.from('offers').update({ is_paused: isPaused }).eq('id', offerId);
    } catch {
      // Handled
    }
  }

  invalidateServerMenuCache('offers');
  return offer;
}

export async function deleteOffer(offerId: string): Promise<boolean> {
  inMemoryOffers = inMemoryOffers.filter((o) => o.id !== offerId);
  invalidateServerMenuCache('offers');

  // Sync to Neon DB via API route in browser
  if (typeof window !== 'undefined') {
    try {
      fetch(`/api/offers?id=${encodeURIComponent(offerId)}`, {
        method: 'DELETE',
      }).catch((e) => console.warn('Could not sync offer delete to Neon:', e));
    } catch {}
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      await supabase.from('offers').delete().eq('id', offerId);
    } catch {
      // Handled
    }
  }

  return true;
}

export async function recordOfferInteraction(
  offerId: string,
  type: 'view' | 'tap' | 'order',
  savings: number = 0
): Promise<void> {
  const offer = inMemoryOffers.find((o) => o.id === offerId);
  if (offer) {
    if (type === 'view') offer.views_count += 1;
    if (type === 'tap') offer.taps_count += 1;
    if (type === 'order') {
      offer.orders_count += 1;
      offer.total_savings += savings;
    }
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      if (offer) {
        await supabase
          .from('offers')
          .update({
            views_count: offer.views_count,
            taps_count: offer.taps_count,
            orders_count: offer.orders_count,
            total_savings: offer.total_savings,
          })
          .eq('id', offerId);
      }
    } catch {
      // Handled
    }
  }
}

// -----------------------------------------------------------------------------
// STAGE 4: DISH REVIEWS SYSTEM DATA LAYER
// -----------------------------------------------------------------------------
export const DEFAULT_REVIEW_SETTINGS_NITSUH: RestaurantReviewSettings = {
  restaurant_id: MOCK_RESTAURANT_NITSUH.id,
  reviews_enabled: true,
  notification_frequency: 'daily_digest',
  available_tags: [
    'Great portion',
    'Would order again',
    'Fresh ingredients',
    'Crispy texture',
    'Perfect spice',
    'Too salty',
    'Could be hotter',
    'Needs more seasoning',
  ],
  min_reviews_threshold: 3,
};

let inMemoryReviewSettings: RestaurantReviewSettings = { ...DEFAULT_REVIEW_SETTINGS_NITSUH };

export const MOCK_REVIEWS_NITSUH: DishReview[] = [];

let inMemoryReviews: DishReview[] = [];

export const MOCK_MODERATION_LOGS_NITSUH: ReviewModerationLog[] = [];

let inMemoryModerationLogs: ReviewModerationLog[] = [];

const STORAGE_KEY_REVIEW_OVERRIDES = 'digital_menu_review_overrides';
const STORAGE_KEY_REVIEWS = 'digital_menu_reviews_cache';

export function clearReviewCache() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY_REVIEWS);
      localStorage.removeItem(STORAGE_KEY_REVIEW_OVERRIDES);
    } catch {}
  }
  inMemoryReviews = [];
}

function getStoredReviews(): DishReview[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REVIEWS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistReviews(reviews: DishReview[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
  } catch {}
}

function getStoredReviewOverrides(): Record<string, Partial<DishReview>> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REVIEW_OVERRIDES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveReviewOverride(reviewId: string, updates: Partial<DishReview>) {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredReviewOverrides();
    current[reviewId] = { ...(current[reviewId] || {}), ...updates };
    localStorage.setItem(STORAGE_KEY_REVIEW_OVERRIDES, JSON.stringify(current));
  } catch {}
}

export async function getDishReviews(
  restaurantId: string,
  itemId?: string
): Promise<DishReview[]> {
  const cacheKey = `reviews_${restaurantId}_${itemId || 'all'}`;
  if (typeof window === 'undefined') {
    const cachedEntry = serverDataCache.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < SERVER_DATA_CACHE_TTL_MS) {
      return cachedEntry.data;
    }
  }

  // 1. Client-side: fetch from live Neon API
  if (typeof window !== 'undefined') {
    try {
      const url = `/api/reviews?restaurantId=${encodeURIComponent(restaurantId)}${itemId ? `&itemId=${encodeURIComponent(itemId)}` : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        const liveRevs = (await res.json()) as DishReview[];
        if (Array.isArray(liveRevs)) {
          inMemoryReviews = liveRevs;
          persistReviews(liveRevs);
          return liveRevs;
        }
      }
    } catch {}
  }

  // 2. Server-side: fetch directly via Neon PostgreSQL
  if (hasNeon()) {
    try {
      const sql = getNeon();
      if (sql) {
        const rows = itemId
          ? await sql`
              SELECT * FROM public.reviews
              WHERE restaurant_id = ${restaurantId} AND item_id = ${itemId}
              ORDER BY created_at DESC
            `
          : await sql`
              SELECT * FROM public.reviews
              WHERE restaurant_id = ${restaurantId}
              ORDER BY created_at DESC
            `;

        const formatted: DishReview[] = (rows || []).map((r: any) => ({
          id: r.id,
          restaurant_id: r.restaurant_id,
          item_id: r.item_id,
          rating: Number(r.rating),
          tags: Array.isArray(r.tags)
            ? r.tags
            : typeof r.tags === 'string'
            ? (() => { try { return JSON.parse(r.tags); } catch { return []; } })()
            : [],
          comment: r.comment || undefined,
          photo_url: r.photo_url || undefined,
          session_token: r.session_token,
          table_number: r.table_number || undefined,
          status: r.status,
          report_count: Number(r.report_count || 0),
          flagged_reason: r.flagged_reason || undefined,
          owner_reply: r.owner_reply || undefined,
          owner_reply_at: r.owner_reply_at ? new Date(r.owner_reply_at).toISOString() : undefined,
          owner_reply_by: r.owner_reply_by || undefined,
          created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
        }));

        if (typeof window === 'undefined') {
          serverDataCache.set(cacheKey, { data: formatted, timestamp: Date.now() });
        }
        inMemoryReviews = formatted;
        return formatted;
      }
    } catch {}
  }

  // 3. Fallback to Supabase if configured
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      let query = supabase
        .from('reviews')
        .select('*')
        .eq('restaurant_id', restaurantId);

      if (itemId) {
        query = query.eq('item_id', itemId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (!error && data) {
        const formatted = data as DishReview[];
        if (typeof window === 'undefined') {
          serverDataCache.set(cacheKey, { data: formatted, timestamp: Date.now() });
        }
        return formatted;
      }
    } catch {}
  }

  return [];
}

export async function submitDishReview(params: {
  restaurant_id: string;
  item_id: string;
  rating: number;
  tags?: string[];
  comment?: string;
  photo_url?: string;
  session_token: string;
  table_number?: string;
  honeypot?: string;
  submissionDurationMs?: number;
}): Promise<{ success: boolean; review?: DishReview; error?: string }> {
  // 1. Bot check
  const botCheck = validateBotCheck(params.honeypot, params.submissionDurationMs ?? 2000);
  if (!botCheck.isHuman) {
    return { success: false, error: botCheck.reason || 'Automated submission blocked.' };
  }

  // 2. Rate limit & duplicate check
  const rateLimitCheck = checkReviewRateLimit(
    inMemoryReviews,
    params.session_token,
    params.item_id
  );
  if (!rateLimitCheck.allowed) {
    return { success: false, error: rateLimitCheck.error };
  }

  // 3. Abuse / profanity / PII check
  const contentCheck = checkReviewContent(params.comment, params.tags ?? []);
  const initialStatus = contentCheck.isClean ? 'published' : 'flagged';
  const flaggedReason = contentCheck.isClean
    ? undefined
    : contentCheck.flaggedReason === 'profanity'
    ? 'Contains abusive language or profanity'
    : 'Contains personal contact information';

  const newReview: DishReview = {
    id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    restaurant_id: params.restaurant_id,
    item_id: params.item_id,
    rating: Math.max(1, Math.min(5, Math.round(params.rating))),
    tags: params.tags || [],
    comment: params.comment?.trim() || undefined,
    photo_url: params.photo_url || undefined,
    session_token: params.session_token,
    table_number: params.table_number || undefined,
    status: initialStatus,
    flagged_reason: flaggedReason,
    report_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  inMemoryReviews.unshift(newReview);
  const stored = getStoredReviews();
  persistReviews([newReview, ...stored.filter((r) => r.id !== newReview.id)]);

  // Broadcast feedback immediately across tabs so owner and staff receive it right away
  broadcastSync({ type: 'REVIEW_SUBMITTED', review: newReview });

  // 4. Persist to Neon DB via API on client or directly on server
  if (typeof window !== 'undefined') {
    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview),
      });
    } catch {}
  } else if (hasNeon()) {
    try {
      const sql = getNeon();
      if (sql) {
        await sql`
          INSERT INTO public.reviews (
            id, restaurant_id, item_id, rating, tags, comment,
            photo_url, session_token, table_number, status,
            report_count, flagged_reason, created_at, updated_at
          ) VALUES (
            ${newReview.id}, ${newReview.restaurant_id}, ${newReview.item_id}, ${newReview.rating},
            ${JSON.stringify(newReview.tags)}, ${newReview.comment || null}, ${newReview.photo_url || null},
            ${newReview.session_token}, ${newReview.table_number || null}, ${newReview.status},
            0, ${newReview.flagged_reason || null}, NOW(), NOW()
          )
        `;
      }
    } catch {}
  }

  return { success: true, review: newReview };
}

async function findDishReview(reviewId: string): Promise<DishReview | null> {
  // 1. inMemoryReviews
  let review = inMemoryReviews.find((r) => r.id === reviewId);
  if (review) return review;

  // 2. localStorage cached reviews
  if (typeof window !== 'undefined') {
    const stored = getStoredReviews();
    const fromStored = stored.find((r) => r.id === reviewId);
    if (fromStored) return fromStored;
  }

  // 3. Neon DB
  if (hasNeon()) {
    try {
      const sql = getNeon();
      if (sql) {
        const rows = await sql`SELECT * FROM public.reviews WHERE id = ${reviewId} LIMIT 1`;
        if (rows && rows.length > 0) {
          const r = rows[0];
          return {
            id: r.id,
            restaurant_id: r.restaurant_id,
            item_id: r.item_id,
            rating: Number(r.rating),
            tags: Array.isArray(r.tags) ? r.tags : typeof r.tags === 'string' ? JSON.parse(r.tags) : [],
            comment: r.comment || undefined,
            photo_url: r.photo_url || undefined,
            session_token: r.session_token,
            table_number: r.table_number || undefined,
            status: r.status,
            report_count: Number(r.report_count || 0),
            flagged_reason: r.flagged_reason || undefined,
            owner_reply: r.owner_reply || undefined,
            owner_reply_at: r.owner_reply_at ? new Date(r.owner_reply_at).toISOString() : undefined,
            owner_reply_by: r.owner_reply_by || undefined,
            created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
            updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
          };
        }
      }
    } catch {}
  }

  return null;
}

export async function reportDishReview(reviewId: string, reason: string): Promise<boolean> {
  const review = await findDishReview(reviewId);
  if (!review) return false;

  review.report_count += 1;
  review.status = 'reported';
  review.flagged_reason = reason;
  review.updated_at = new Date().toISOString();

  saveReviewOverride(reviewId, {
    report_count: review.report_count,
    status: review.status,
    flagged_reason: review.flagged_reason,
    updated_at: review.updated_at,
  });

  const stored = getStoredReviews();
  const existingIdx = stored.findIndex((r) => r.id === reviewId);
  if (existingIdx >= 0) {
    stored[existingIdx] = { ...stored[existingIdx], ...review };
    persistReviews(stored);
  } else {
    persistReviews([review, ...stored]);
  }

  inMemoryModerationLogs.unshift({
    id: `log-${Date.now()}`,
    restaurant_id: review.restaurant_id,
    review_id: review.id,
    user_role: 'staff',
    user_name: 'Dining Guest (Report)',
    action: 'flag',
    reason,
    created_at: new Date().toISOString(),
  });

  broadcastSync({ type: 'REVIEW_UPDATED', review });

  if (typeof window !== 'undefined') {
    try {
      await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'report', id: reviewId, reason }),
      });
    } catch {}
  } else if (hasNeon()) {
    try {
      const sql = getNeon();
      if (sql) {
        await sql`
          UPDATE public.reviews
          SET status = 'reported', report_count = report_count + 1, flagged_reason = ${reason}, updated_at = NOW()
          WHERE id = ${reviewId}
        `;
      }
    } catch {}
  }

  return true;
}

export async function replyToDishReview(
  reviewId: string,
  replyText: string,
  staffName: string = 'Nitsuh Staff'
): Promise<boolean> {
  const review = await findDishReview(reviewId);
  if (!review) return false;

  review.owner_reply = replyText.trim();
  review.owner_reply_at = new Date().toISOString();
  review.owner_reply_by = staffName;
  review.updated_at = new Date().toISOString();

  saveReviewOverride(reviewId, {
    owner_reply: review.owner_reply,
    owner_reply_at: review.owner_reply_at,
    owner_reply_by: review.owner_reply_by,
    updated_at: review.updated_at,
  });

  const stored = getStoredReviews();
  const existingIdx = stored.findIndex((r) => r.id === reviewId);
  if (existingIdx >= 0) {
    stored[existingIdx] = { ...stored[existingIdx], ...review };
    persistReviews(stored);
  } else {
    persistReviews([review, ...stored]);
  }

  const memIdx = inMemoryReviews.findIndex((r) => r.id === reviewId);
  if (memIdx >= 0) {
    inMemoryReviews[memIdx] = review;
  } else {
    inMemoryReviews.push(review);
  }

  inMemoryModerationLogs.unshift({
    id: `log-${Date.now()}`,
    restaurant_id: review.restaurant_id,
    review_id: review.id,
    user_role: 'staff',
    user_name: staffName,
    action: 'reply',
    reason: replyText.slice(0, 60),
    created_at: new Date().toISOString(),
  });

  broadcastSync({ type: 'REVIEW_UPDATED', review });

  if (typeof window !== 'undefined') {
    try {
      await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reply',
          id: reviewId,
          replyText: review.owner_reply,
          staffName: review.owner_reply_by,
        }),
      });
    } catch {}
  } else if (hasNeon()) {
    try {
      const sql = getNeon();
      if (sql) {
        await sql`
          UPDATE public.reviews
          SET owner_reply = ${review.owner_reply}, owner_reply_at = NOW(), owner_reply_by = ${review.owner_reply_by}, updated_at = NOW()
          WHERE id = ${reviewId}
        `;
      }
    } catch {}
  }

  return true;
}

export async function moderateDishReview(
  reviewId: string,
  action: 'approve' | 'remove',
  reason: string,
  userRole: UserRole,
  userName: string = 'Owner'
): Promise<{ success: boolean; error?: string }> {
  // Enforce role permissions: only owners can remove reviews
  if (action === 'remove' && !canRemoveReview(userRole)) {
    return {
      success: false,
      error: 'Permission denied: Only owners can remove reviews.',
    };
  }

  if (action === 'remove' && (!reason || reason.trim().length === 0)) {
    return {
      success: false,
      error: 'A required removal reason must be provided (e.g. Profanity, Spam, PII).',
    };
  }

  const review = await findDishReview(reviewId);
  if (!review) {
    return { success: false, error: 'Review not found.' };
  }

  if (action === 'approve') {
    review.status = 'published';
    review.flagged_reason = undefined;
  } else {
    review.status = 'removed';
    review.flagged_reason = reason;
  }
  review.updated_at = new Date().toISOString();

  saveReviewOverride(reviewId, {
    status: review.status,
    flagged_reason: review.flagged_reason,
    updated_at: review.updated_at,
  });

  if (action === 'remove') {
    const stored = getStoredReviews();
    persistReviews(stored.filter((r) => r.id !== reviewId));
    inMemoryReviews = inMemoryReviews.filter((r) => r.id !== reviewId);
  } else {
    const stored = getStoredReviews();
    const existingIdx = stored.findIndex((r) => r.id === reviewId);
    if (existingIdx >= 0) {
      stored[existingIdx] = { ...stored[existingIdx], ...review };
      persistReviews(stored);
    } else {
      persistReviews([review, ...stored]);
    }
  }

  inMemoryModerationLogs.unshift({
    id: `log-${Date.now()}`,
    restaurant_id: review.restaurant_id,
    review_id: review.id,
    user_role: userRole,
    user_name: userName,
    action,
    reason,
    created_at: new Date().toISOString(),
  });

  broadcastSync({ type: 'REVIEW_UPDATED', review });

  if (action === 'remove') {
    if (typeof window !== 'undefined') {
      try {
        await fetch(`/api/reviews?id=${encodeURIComponent(reviewId)}`, { method: 'DELETE' });
      } catch {}
    } else if (hasNeon()) {
      try {
        const sql = getNeon();
        if (sql) {
          await sql`DELETE FROM public.reviews WHERE id = ${reviewId}`;
        }
      } catch {}
    }
  } else if (action === 'approve') {
    if (typeof window !== 'undefined') {
      try {
        await fetch('/api/reviews', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'moderate', id: reviewId, status: 'published' }),
        });
      } catch {}
    } else if (hasNeon()) {
      try {
        const sql = getNeon();
        if (sql) {
          await sql`
            UPDATE public.reviews
            SET status = 'published', flagged_reason = NULL, updated_at = NOW()
            WHERE id = ${reviewId}
          `;
        }
      } catch {}
    }
  }

  return { success: true };
}

export async function getReviewModerationLogs(
  restaurantId: string
): Promise<ReviewModerationLog[]> {
  return inMemoryModerationLogs.filter((l) => l.restaurant_id === restaurantId);
}

export async function getReviewSettings(
  restaurantId: string
): Promise<RestaurantReviewSettings> {
  return { ...inMemoryReviewSettings, restaurant_id: restaurantId };
}

export async function updateReviewSettings(
  restaurantId: string,
  settings: Partial<RestaurantReviewSettings>
): Promise<RestaurantReviewSettings> {
  inMemoryReviewSettings = {
    ...inMemoryReviewSettings,
    ...settings,
    restaurant_id: restaurantId,
    updated_at: new Date().toISOString(),
  };
  return inMemoryReviewSettings;
}

export async function toggleItemReviews(
  itemId: string,
  enabled: boolean
): Promise<boolean> {
  const item = inMemoryItems.find((i) => i.id === itemId);
  if (item) {
    item.reviews_enabled = enabled;
  }
  return true;
}

// -----------------------------------------------------------------------------
// STAGE 5: ADMIN EXPERIENCE DATA LAYER
// -----------------------------------------------------------------------------
export const MOCK_SCHEDULED_MENUS_NITSUH: ScheduledMenu[] = [
  {
    id: 'sched-breakfast',
    restaurant_id: MOCK_RESTAURANT_NITSUH.id,
    name: 'Morning Artisanal Roast & Pastries',
    start_time: '07:00',
    end_time: '11:30',
    days_of_week: [0, 1, 2, 3, 4, 5, 6],
    category_ids: ['cat-breakfast', 'cat-drinks'],
    is_active: true,
  },
  {
    id: 'sched-lunch-dinner',
    restaurant_id: MOCK_RESTAURANT_NITSUH.id,
    name: 'Main Dining & Prime Cuts',
    start_time: '11:30',
    end_time: '22:00',
    days_of_week: [0, 1, 2, 3, 4, 5, 6],
    category_ids: ['cat-burger', 'cat-pizza', 'cat-club-sandwich', 'cat-wrap', 'cat-chicken', 'cat-salad', 'cat-pasta', 'cat-desserts'],
    is_active: true,
  },
];

let inMemoryScheduledMenus: ScheduledMenu[] = [...MOCK_SCHEDULED_MENUS_NITSUH];

export const MOCK_MENU_VERSIONS_NITSUH: MenuVersion[] = [
  {
    id: 'v-1',
    restaurant_id: MOCK_RESTAURANT_NITSUH.id,
    label: 'Initial Launch Menu',
    created_at: new Date(Date.now() - 7 * 86400 * 1000).toISOString(),
    items_snapshot: [],
  },
];

let inMemoryMenuVersions: MenuVersion[] = [...MOCK_MENU_VERSIONS_NITSUH];

let inMemoryItems: MenuItem[] = [...MOCK_ITEMS_NITSUH];
let inMemoryRestaurant: Restaurant = { ...MOCK_RESTAURANT_NITSUH };

export async function saveMenuItem(itemData: Partial<MenuItem>): Promise<MenuItem> {
  if (inMemoryItems.length === 0) {
    inMemoryItems = [...MOCK_ITEMS_NITSUH];
  }
  const existingIdx = inMemoryItems.findIndex((i) => i.id === itemData.id);
  let savedItem: MenuItem;

  if (existingIdx >= 0) {
    savedItem = {
      ...inMemoryItems[existingIdx],
      ...itemData,
    } as MenuItem;
    inMemoryItems[existingIdx] = savedItem;
  } else {
    savedItem = {
      id: itemData.id || `item-${Date.now()}`,
      restaurant_id: itemData.restaurant_id || MOCK_RESTAURANT_NITSUH.id,
      category_id: itemData.category_id || inMemoryCategories[0]?.id || 'cat-breakfast',
      name: itemData.name || 'New Dish',
      name_am: itemData.name_am || '',
      name_es: itemData.name_es,
      description: itemData.description || '',
      description_am: itemData.description_am || '',
      description_es: itemData.description_es,
      price: Number(itemData.price || 0),
      image_url: itemData.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      tags: itemData.tags || [],
      spice_level: itemData.spice_level ?? 0,
      calories: itemData.calories,
      custom_badge: itemData.custom_badge,
      is_available: itemData.is_available ?? true,
      is_chefs_pick: itemData.is_chefs_pick ?? false,
      is_draft: itemData.is_draft ?? false,
      is_archived: itemData.is_archived ?? false,
      sort_order: itemData.sort_order ?? inMemoryItems.length + 1,
      options: itemData.options || [],
    };
    inMemoryItems.unshift(savedItem);
  }

  // Broadcast update immediately to customer menu view across tabs/windows
  broadcastSync({ type: 'ITEM_UPDATED', item: savedItem });

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('digital_menu_items_cache_v4', JSON.stringify(inMemoryItems));
    } catch {}
  }

  // Sync to Neon DB via API route in browser
  if (typeof window !== 'undefined') {
    try {
      fetch('/api/menu/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savedItem),
      }).catch((e) => console.warn('Could not sync item to Neon:', e));
    } catch {}
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      if (itemData.id) {
        // Granular update: Only modify fields explicitly passed in itemData
        const updatePayload: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };
        if (itemData.name !== undefined) updatePayload.name = itemData.name;
        if (itemData.name_am !== undefined) updatePayload.name_am = itemData.name_am;
        if (itemData.name_so !== undefined) updatePayload.name_so = itemData.name_so;
        if (itemData.name_es !== undefined) updatePayload.name_es = itemData.name_es;
        if (itemData.description !== undefined) updatePayload.description = itemData.description;
        if (itemData.description_am !== undefined) updatePayload.description_am = itemData.description_am;
        if (itemData.description_so !== undefined) updatePayload.description_so = itemData.description_so;
        if (itemData.description_es !== undefined) updatePayload.description_es = itemData.description_es;
        if (itemData.price !== undefined) updatePayload.price = Number(itemData.price);
        if (itemData.category_id !== undefined) updatePayload.category_id = itemData.category_id;
        if (itemData.tags !== undefined) updatePayload.tags = itemData.tags;
        if (itemData.spice_level !== undefined) updatePayload.spice_level = itemData.spice_level;
        if (itemData.is_available !== undefined) updatePayload.is_available = itemData.is_available;
        if (itemData.is_chefs_pick !== undefined) updatePayload.is_chefs_pick = itemData.is_chefs_pick;
        if (itemData.sort_order !== undefined) updatePayload.sort_order = itemData.sort_order;
        if (itemData.image_url !== undefined && itemData.image_url !== '') updatePayload.image_url = itemData.image_url;

        const { data: updateData, error } = await supabase
          .from('items')
          .update(updatePayload)
          .eq('id', savedItem.id)
          .select();

        if (error) {
          console.error('Supabase items.update failed:', error.message);
        } else if (!updateData || updateData.length === 0) {
          // Row did not exist yet, insert
          const dbPayload = {
            id: savedItem.id,
            restaurant_id: savedItem.restaurant_id,
            category_id: savedItem.category_id,
            name: savedItem.name,
            name_am: savedItem.name_am || null,
            name_so: savedItem.name_so || null,
            name_es: savedItem.name_es || null,
            description: savedItem.description || null,
            description_am: savedItem.description_am || null,
            description_so: savedItem.description_so || null,
            description_es: savedItem.description_es || null,
            price: savedItem.price,
            image_url: savedItem.image_url,
            tags: savedItem.tags || [],
            spice_level: savedItem.spice_level ?? 0,
            is_available: savedItem.is_available ?? true,
            is_chefs_pick: savedItem.is_chefs_pick ?? false,
            sort_order: savedItem.sort_order ?? 0,
            updated_at: new Date().toISOString(),
          };
          await supabase.from('items').insert(dbPayload);
        }
      } else {
        const dbPayload = {
          id: savedItem.id,
          restaurant_id: savedItem.restaurant_id,
          category_id: savedItem.category_id,
          name: savedItem.name,
          name_am: savedItem.name_am || null,
          name_so: savedItem.name_so || null,
          name_es: savedItem.name_es || null,
          description: savedItem.description || null,
          description_am: savedItem.description_am || null,
          description_so: savedItem.description_so || null,
          description_es: savedItem.description_es || null,
          price: savedItem.price,
          image_url: savedItem.image_url,
          tags: savedItem.tags || [],
          spice_level: savedItem.spice_level ?? 0,
          is_available: savedItem.is_available ?? true,
          is_chefs_pick: savedItem.is_chefs_pick ?? false,
          sort_order: savedItem.sort_order ?? 0,
          updated_at: new Date().toISOString(),
        };
        const { error } = await supabase.from('items').insert(dbPayload);
        if (error) {
          console.error('Supabase items.insert failed:', error.message);
        }
      }
    } catch (err) {
      console.error('Supabase items mutation exception:', err);
    }
  }

  return savedItem;
}

export async function duplicateMenuItem(itemId: string): Promise<MenuItem | null> {
  const original = inMemoryItems.find((i) => i.id === itemId);
  if (!original) return null;

  const duplicated: MenuItem = {
    ...original,
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: `${original.name} (Copy)`,
    sort_order: original.sort_order + 1,
  };

  inMemoryItems.unshift(duplicated);
  broadcastSync({ type: 'ITEM_UPDATED', item: duplicated });
  return duplicated;
}

export async function archiveMenuItem(itemId: string, archived: boolean = true): Promise<boolean> {
  const item = inMemoryItems.find((i) => i.id === itemId);
  if (!item) return false;
  item.is_archived = archived;
  broadcastSync({ type: 'ITEM_UPDATED', item });
  return true;
}

export async function deleteMenuItem(itemId: string): Promise<boolean> {
  inMemoryItems = inMemoryItems.filter((i) => i.id !== itemId);
  broadcastSync({ type: 'ITEM_DELETED', itemId });

  // Sync to Neon DB via API route in browser
  if (typeof window !== 'undefined') {
    try {
      fetch(`/api/menu/items?id=${encodeURIComponent(itemId)}`, {
        method: 'DELETE',
      }).catch((e) => console.warn('Could not sync item delete to Neon:', e));
    } catch {}
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      await supabase.from('items').delete().eq('id', itemId);
    } catch {
      // Handled
    }
  }
  return true;
}

export async function bulkUpdateItems(
  itemIds: string[],
  updates: Partial<MenuItem>
): Promise<MenuItem[]> {
  const targetSet = new Set(itemIds);
  inMemoryItems = inMemoryItems.map((item) => {
    if (targetSet.has(item.id)) {
      const updated = { ...item, ...updates };
      broadcastSync({ type: 'ITEM_UPDATED', item: updated });
      return updated;
    }
    return item;
  });

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      const cleanUpdates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.is_available !== undefined) cleanUpdates.is_available = updates.is_available;
      if (updates.price !== undefined) cleanUpdates.price = updates.price;
      if (updates.is_chefs_pick !== undefined) cleanUpdates.is_chefs_pick = updates.is_chefs_pick;
      if (updates.image_url !== undefined) cleanUpdates.image_url = updates.image_url;

      await supabase.from('items').update(cleanUpdates).in('id', itemIds);
    } catch {
      // Handled
    }
  }

  return inMemoryItems.filter((i) => targetSet.has(i.id));
}

export async function saveCategory(categoryData: Partial<Category>): Promise<Category> {
  const existingIdx = inMemoryCategories.findIndex((c) => c.id === categoryData.id);
  let savedCategory: Category;

  if (existingIdx >= 0) {
    savedCategory = {
      ...inMemoryCategories[existingIdx],
      ...categoryData,
    } as Category;
    inMemoryCategories[existingIdx] = savedCategory;
  } else {
    const slug = (categoryData.name || 'category')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const newCat: Category = {
      id: categoryData.id || `cat-${slug || Date.now()}`,
      restaurant_id: categoryData.restaurant_id || MOCK_RESTAURANT_NITSUH.id,
      name: categoryData.name || 'New Category',
      name_am: categoryData.name_am,
      name_so: categoryData.name_so,
      name_es: categoryData.name_es,
      icon: categoryData.icon || '🍽️',
      image_url: categoryData.image_url,
      description: categoryData.description || '',
      description_am: categoryData.description_am,
      description_so: categoryData.description_so,
      description_es: categoryData.description_es,
      sort_order: categoryData.sort_order ?? inMemoryCategories.length + 1,
      is_active: categoryData.is_active ?? true,
    };
    inMemoryCategories.push(newCat);
    savedCategory = newCat;
  }

  // Persist locally
  persistCategories(inMemoryCategories);

  // Broadcast update immediately to customer & admin across tabs
  broadcastSync({ type: 'CATEGORY_UPDATED', category: savedCategory });

  // Sync to Neon DB via API route in browser
  if (typeof window !== 'undefined') {
    try {
      fetch('/api/menu/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savedCategory),
      }).catch((e) => console.warn('Could not sync category to Neon:', e));
    } catch {}
  }

  // Sync to Supabase
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const isUuid = (val?: string) =>
        val && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);

      if (isUuid(savedCategory.restaurant_id)) {
        const supabase = createClient();
        const payload: Record<string, any> = {
          name: savedCategory.name,
          name_am: savedCategory.name_am,
          name_so: savedCategory.name_so,
          name_es: savedCategory.name_es,
          icon: savedCategory.icon,
          image_url: savedCategory.image_url,
          description: savedCategory.description || '',
          description_am: savedCategory.description_am,
          description_so: savedCategory.description_so,
          description_es: savedCategory.description_es,
          sort_order: savedCategory.sort_order,
          is_active: savedCategory.is_active,
          restaurant_id: savedCategory.restaurant_id,
          updated_at: new Date().toISOString(),
        };

        if (isUuid(savedCategory.id)) {
          payload.id = savedCategory.id;
          await Promise.race([
            supabase.from('categories').upsert(payload),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000)),
          ]);
        }
      }
    } catch {
      // Offline fallback
    }
  }

  return savedCategory;
}

export async function deleteCategory(
  categoryId: string
): Promise<{ success: boolean; affectedDishesCount: number; error?: string }> {
  const idx = inMemoryCategories.findIndex((c) => c.id === categoryId);
  if (idx === -1) {
    return { success: false, affectedDishesCount: 0, error: 'Category not found.' };
  }

  // Reassign any dishes belonging to this category to the first remaining category
  const remaining = inMemoryCategories.filter((c) => c.id !== categoryId);
  const fallbackCatId = remaining[0]?.id || 'cat-breakfast';
  let affectedDishesCount = 0;

  inMemoryItems = inMemoryItems.map((item) => {
    if (item.category_id === categoryId) {
      affectedDishesCount++;
      return { ...item, category_id: fallbackCatId };
    }
    return item;
  });

  if (affectedDishesCount > 0 && typeof window !== 'undefined') {
    try {
      localStorage.setItem('digital_menu_items_cache_v4', JSON.stringify(inMemoryItems));
      broadcastSync({ type: 'ITEMS_REFRESH' });
    } catch {}
  }

  inMemoryCategories.splice(idx, 1);
  persistCategories(inMemoryCategories);

  broadcastSync({ type: 'CATEGORY_DELETED', categoryId });

  // Sync to Neon DB via API route in browser
  if (typeof window !== 'undefined') {
    try {
      fetch(`/api/menu/categories?id=${encodeURIComponent(categoryId)}`, {
        method: 'DELETE',
      }).catch((e) => console.warn('Could not sync category delete to Neon:', e));
    } catch {}
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const isUuid = (val?: string) =>
        val && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);

      if (isUuid(categoryId)) {
        const supabase = createClient();
        await Promise.race([
          supabase.from('categories').delete().eq('id', categoryId),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000)),
        ]);
      }
    } catch {
      // Offline fallback
    }
  }

  return { success: true, affectedDishesCount };
}

export async function reorderCategories(reordered: Category[]): Promise<Category[]> {
  inMemoryCategories = reordered.map((cat, idx) => ({ ...cat, sort_order: idx + 1 }));
  persistCategories(inMemoryCategories);

  broadcastSync({ type: 'CATEGORIES_REFRESH' });

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      for (const cat of inMemoryCategories) {
        await supabase.from('categories').update({ sort_order: cat.sort_order }).eq('id', cat.id);
      }
    } catch {}
  }

  return inMemoryCategories;
}

export async function updateRestaurantSettings(
  restaurantId: string,
  updates: Partial<Restaurant>
): Promise<Restaurant> {
  inMemoryRestaurant = {
    ...inMemoryRestaurant,
    ...updates,
    theme_config: {
      ...inMemoryRestaurant.theme_config,
      ...(updates.theme_config || {}),
    },
    wifi_config: {
      ...inMemoryRestaurant.wifi_config,
      ...(updates.wifi_config || {}),
    },
    feature_flags: {
      ...inMemoryRestaurant.feature_flags,
      ...(updates.feature_flags || {}),
    },
    custom_badges: updates.custom_badges || inMemoryRestaurant.custom_badges,
    custom_labels: updates.custom_labels || inMemoryRestaurant.custom_labels,
    closed_message: updates.closed_message || inMemoryRestaurant.closed_message,
    holiday_closures: updates.holiday_closures || inMemoryRestaurant.holiday_closures,
    updated_at: new Date().toISOString(),
  };

  // 1. Persist locally to localStorage
  persistRestaurant(inMemoryRestaurant);

  // 2. Broadcast immediately across all open tabs/windows
  broadcastSync({ type: 'RESTAURANT_UPDATED', restaurant: inMemoryRestaurant });

  // 2b. Sync to Neon DB via API route in browser
  if (typeof window !== 'undefined') {
    try {
      fetch('/api/restaurant', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: restaurantId,
          slug: inMemoryRestaurant.slug,
          updates,
        }),
      }).catch((e) => console.warn('Could not sync restaurant updates to Neon:', e));
    } catch {}
  }

  // 3. Sync to Supabase
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const isUuid = (val?: string) =>
        val && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);

      const supabase = createClient();
      const payload: Record<string, any> = {
        theme_config: inMemoryRestaurant.theme_config,
        wifi_config: inMemoryRestaurant.wifi_config,
        updated_at: new Date().toISOString(),
      };
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.hours !== undefined) payload.hours = updates.hours;
      if (updates.address !== undefined) payload.address = updates.address;
      if (updates.branch_name !== undefined) payload.branch_name = updates.branch_name;
      if (updates.google_maps_url !== undefined) payload.google_maps_url = updates.google_maps_url;
      if (updates.announcement !== undefined) payload.announcement = updates.announcement;
      if (updates.is_open !== undefined) payload.is_open = updates.is_open;

      if (isUuid(restaurantId)) {
        await Promise.race([
          supabase.from('restaurants').update(payload).eq('id', restaurantId),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000)),
        ]);
      } else {
        await Promise.race([
          supabase.from('restaurants').update(payload).eq('slug', inMemoryRestaurant.slug),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000)),
        ]);
      }
    } catch {
      // Offline fallback
    }
  }

  return inMemoryRestaurant;
}

export async function getScheduledMenus(restaurantId: string): Promise<ScheduledMenu[]> {
  return inMemoryScheduledMenus.filter((m) => m.restaurant_id === restaurantId);
}

export async function saveScheduledMenu(menu: ScheduledMenu): Promise<ScheduledMenu> {
  const idx = inMemoryScheduledMenus.findIndex((m) => m.id === menu.id);
  if (idx >= 0) {
    inMemoryScheduledMenus[idx] = menu;
  } else {
    inMemoryScheduledMenus.push(menu);
  }
  return menu;
}

export async function getMenuVersions(restaurantId: string): Promise<MenuVersion[]> {
  return inMemoryMenuVersions.filter((v) => v.restaurant_id === restaurantId);
}

export async function createMenuVersion(restaurantId: string, label: string): Promise<MenuVersion> {
  const newVersion: MenuVersion = {
    id: `v-${Date.now()}`,
    restaurant_id: restaurantId,
    label: label || `Snapshot ${new Date().toLocaleDateString()}`,
    created_at: new Date().toISOString(),
    items_snapshot: JSON.parse(JSON.stringify(inMemoryItems)),
  };
  inMemoryMenuVersions.unshift(newVersion);
  return newVersion;
}

export async function restoreMenuVersion(versionId: string): Promise<MenuItem[]> {
  const ver = inMemoryMenuVersions.find((v) => v.id === versionId);
  if (ver) {
    inMemoryItems = JSON.parse(JSON.stringify(ver.items_snapshot));
  }
  return inMemoryItems;
}



// Backwards compatibility aliases
export const MOCK_RESTAURANT_ADDIS = MOCK_RESTAURANT_NITSUH;
export const MOCK_CATEGORIES_ADDIS = MOCK_CATEGORIES_NITSUH;
export const MOCK_ITEMS_ADDIS = MOCK_ITEMS_NITSUH;
export const MOCK_OFFERS_ADDIS = MOCK_OFFERS_NITSUH;
export const MOCK_REVIEWS_ADDIS = MOCK_REVIEWS_NITSUH;
export const MOCK_MODERATION_LOGS_ADDIS = MOCK_MODERATION_LOGS_NITSUH;
export const DEFAULT_REVIEW_SETTINGS_ADDIS = DEFAULT_REVIEW_SETTINGS_NITSUH;
export const MOCK_SCHEDULED_MENUS_ADDIS = MOCK_SCHEDULED_MENUS_NITSUH;
export const MOCK_MENU_VERSIONS_ADDIS = MOCK_MENU_VERSIONS_NITSUH;
