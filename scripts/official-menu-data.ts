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
  spice_level?: number;
  is_chefs_pick?: boolean;
  image_url?: string;
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
    "is_chefs_pick": false,
    "image_url": "/images/dishes/full-normal-43.jpg"
  },
  {
    "name": "Foul Special",
    "price": 450,
    "category_id": "cat-breakfast",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "/images/dishes/ful-special.jpg"
  },
  {
    "name": "Scrambled Egg",
    "price": 400,
    "category_id": "cat-breakfast",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041109/nitsuh-menu/dishes/lf4qmtdtaive8wqyez9f.jpg"
  },
  {
    "name": "Scrambled Egg With Meat",
    "price": 500,
    "category_id": "cat-breakfast",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041130/nitsuh-menu/dishes/vltksewkfkrxicfu9ho3.jpg"
  },
  {
    "name": "Egg Sandwich",
    "price": 400,
    "category_id": "cat-breakfast",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041078/nitsuh-menu/dishes/lqwzh73i5taazryk6b5d.jpg"
  },
  {
    "name": "Omelet",
    "price": 400,
    "category_id": "cat-breakfast",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "/images/dishes/roasted-chicken.jpg"
  },
  {
    "name": "Omelet With Cheese",
    "price": 500,
    "category_id": "cat-breakfast",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041105/nitsuh-menu/dishes/jy4cosnl4hohva3umf8u.jpg"
  },
  {
    "name": "Special Omelet",
    "price": 550,
    "category_id": "cat-breakfast",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041113/nitsuh-menu/dishes/xmy67yadwvvkjhtmdkpq.jpg"
  },
  {
    "name": "Chechebsa With Honey",
    "price": 350,
    "category_id": "cat-breakfast",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "/images/dishes/chechebisa.jpg"
  },
  {
    "name": "Chechebsa With Egg",
    "price": 400,
    "category_id": "cat-breakfast",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "/images/dishes/chechebisa.jpg"
  },
  {
    "name": "Fetira With Honey",
    "price": 350,
    "category_id": "cat-breakfast",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "/images/dishes/fetira.jpeg"
  },
  {
    "name": "Fetira With Egg",
    "price": 400,
    "category_id": "cat-breakfast",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "/images/dishes/fetira.jpeg"
  },
  {
    "name": "Avocado Toast",
    "price": 450,
    "category_id": "cat-breakfast",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041059/nitsuh-menu/dishes/yhi6mxkeajwywjz58poa.jpg"
  },
  {
    "name": "Beef & Cheese Sandwich",
    "price": 600,
    "category_id": "cat-breakfast",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041059/nitsuh-menu/dishes/rbnshwmcjljfnrbgrytk.jpg"
  },
  {
    "name": "French Toast",
    "price": 500,
    "category_id": "cat-breakfast",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041083/nitsuh-menu/dishes/ppqtnbqj6aowb65vtueb.jpg"
  },
  {
    "name": "Pan Cake",
    "price": 500,
    "category_id": "cat-breakfast",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041105/nitsuh-menu/dishes/zw36dchhheua8o9akdwk.jpg"
  },
  {
    "name": "Nitsuh Special Burger",
    "price": 800,
    "category_id": "cat-burger",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_chefs_pick": true,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041103/nitsuh-menu/dishes/sauxrh8xiqtzh1lxaihl.jpg"
  },
  {
    "name": "Texas Style BBQ Burger",
    "price": 750,
    "category_id": "cat-burger",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041120/nitsuh-menu/dishes/rrwytwfvolbrhofto9gf.jpg"
  },
  {
    "name": "Spicy Burger",
    "price": 750,
    "category_id": "cat-burger",
    "tags": [],
    "spice_level": 2,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041114/nitsuh-menu/dishes/uepwvp2slodcwbnbojqh.jpg"
  },
  {
    "name": "Junky Burger",
    "price": 950,
    "category_id": "cat-burger",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041103/nitsuh-menu/dishes/sauxrh8xiqtzh1lxaihl.jpg"
  },
  {
    "name": "Beef Burger",
    "price": 500,
    "category_id": "cat-burger",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041059/nitsuh-menu/dishes/vextlzoihqbx8gwy9m4p.jpg"
  },
  {
    "name": "Cheese Burger",
    "price": 550,
    "category_id": "cat-burger",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041063/nitsuh-menu/dishes/fjbcfvhbhqermblxexxy.jpg"
  },
  {
    "name": "Double Beef Burger",
    "price": 600,
    "category_id": "cat-burger",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041077/nitsuh-menu/dishes/ifmzjjrsnnbvr3vqsec4.jpg"
  },
  {
    "name": "Double Cheese Burger",
    "price": 670,
    "category_id": "cat-burger",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041078/nitsuh-menu/dishes/davmjhahhhx92wcy5bfl.jpg"
  },
  {
    "name": "Chicken Burger",
    "price": 600,
    "category_id": "cat-burger",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041063/nitsuh-menu/dishes/bmtsndi3cvdrjwxudsli.jpg"
  },
  {
    "name": "Special Chicken Burger",
    "price": 950,
    "category_id": "cat-burger",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041111/nitsuh-menu/dishes/j4mfcvnhexep3p1bfnfj.jpg"
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
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041082/nitsuh-menu/dishes/ng8nmwgvmrt11guextps.jpg"
  },
  {
    "name": "Slider Burger",
    "price": 750,
    "category_id": "cat-burger",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041111/nitsuh-menu/dishes/bfsoapzpmdunpzyeykgz.jpg"
  },
  {
    "name": "House Special Pizza",
    "price": 950,
    "category_id": "cat-pizza",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_chefs_pick": true,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041087/nitsuh-menu/dishes/ky9kasyuyvofqpepovy9.jpg"
  },
  {
    "name": "Tuna Pizza",
    "price": 850,
    "category_id": "cat-pizza",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041123/nitsuh-menu/dishes/hdkr7hzv7v8duwqzeo8o.jpg"
  },
  {
    "name": "Chicken Pizza",
    "price": 850,
    "category_id": "cat-pizza",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041065/nitsuh-menu/dishes/ziz953msfrn9xlray0o5.jpg"
  },
  {
    "name": "Meet Pizza",
    "price": 800,
    "category_id": "cat-pizza",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041093/nitsuh-menu/dishes/ldwn5xpxyxhrpitrftub.jpg"
  },
  {
    "name": "Pizza Margarita",
    "price": 750,
    "category_id": "cat-pizza",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041108/nitsuh-menu/dishes/jiiz7x0ardonbkvmlaon.jpg"
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
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041083/nitsuh-menu/dishes/iy5usm4ioedesdhhzrpm.jpg"
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
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041083/nitsuh-menu/dishes/iy5usm4ioedesdhhzrpm.jpg"
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
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041123/nitsuh-menu/dishes/hdkr7hzv7v8duwqzeo8o.jpg"
  },
  {
    "name": "Special Club Sandwich",
    "price": 750,
    "category_id": "cat-club-sandwich",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_chefs_pick": true,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041113/nitsuh-menu/dishes/plxtnsfafhnlwyvss89e.jpg"
  },
  {
    "name": "Chicken Club Sandwich",
    "price": 700,
    "category_id": "cat-club-sandwich",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041063/nitsuh-menu/dishes/u4qme7u7usm0abwgull8.jpg"
  },
  {
    "name": "Tuna Club Sandwich",
    "price": 700,
    "category_id": "cat-club-sandwich",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041123/nitsuh-menu/dishes/lwhpi9qgyrcg7ch64xxd.jpg"
  },
  {
    "name": "Beef Club Sandwich",
    "price": 650,
    "category_id": "cat-club-sandwich",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041060/nitsuh-menu/dishes/hh30wyrkylvss0xodoo3.jpg"
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
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041123/nitsuh-menu/dishes/lwhpi9qgyrcg7ch64xxd.jpg"
  },
  {
    "name": "Chicken Sandwich",
    "price": 900,
    "category_id": "cat-club-sandwich",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041065/nitsuh-menu/dishes/co9lz2atn7gojpak4nfu.jpg"
  },
  {
    "name": "Steak Sandwich",
    "price": 900,
    "category_id": "cat-club-sandwich",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041114/nitsuh-menu/dishes/a6wha3avezcys8ix9ulx.jpg"
  },
  {
    "name": "Tuna Sandwich",
    "price": 900,
    "category_id": "cat-club-sandwich",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041121/nitsuh-menu/dishes/sxgil8mwetardqqdls9y.jpg"
  },
  {
    "name": "Avocado Sandwich",
    "price": 600,
    "category_id": "cat-club-sandwich",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041057/nitsuh-menu/dishes/g4batwakr2fapek98uz8.jpg"
  },
  {
    "name": "Special Wrap",
    "price": 850,
    "category_id": "cat-wrap",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_chefs_pick": true,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041114/nitsuh-menu/dishes/qwc9frfwwyvnkjupkfsa.jpg"
  },
  {
    "name": "Chicken Wrap",
    "price": 750,
    "category_id": "cat-wrap",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041066/nitsuh-menu/dishes/lfajwcltgqwhkvznpswc.jpg"
  },
  {
    "name": "Tuna Wrap",
    "price": 750,
    "category_id": "cat-wrap",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041123/nitsuh-menu/dishes/o0kcl4f2l3m5kxr66xoe.jpg"
  },
  {
    "name": "Beef Wrap",
    "price": 650,
    "category_id": "cat-wrap",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041060/nitsuh-menu/dishes/p3a7afyhyml0wjvuuwqv.jpg"
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
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041123/nitsuh-menu/dishes/o0kcl4f2l3m5kxr66xoe.jpg"
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
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041082/nitsuh-menu/dishes/wzgqpcbcyucfwtwmrgee.jpg"
  },
  {
    "name": "Chicken Nuggate",
    "price": 1200,
    "category_id": "cat-chicken",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041065/nitsuh-menu/dishes/iviqnmpjmgv93jne2u7a.jpg"
  },
  {
    "name": "Crispy Chicken Strips",
    "price": 1500,
    "category_id": "cat-chicken",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041070/nitsuh-menu/dishes/pxiji5izmrzhv7tn8stl.jpg"
  },
  {
    "name": "Crispy Fried Chicken Leg (1 pic)",
    "price": 1200,
    "category_id": "cat-chicken",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041076/nitsuh-menu/dishes/iltf7zucjql3n8znvo2t.jpg"
  },
  {
    "name": "Crispy Fried Chicken Leg (2 pic)",
    "price": 2200,
    "category_id": "cat-chicken",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041076/nitsuh-menu/dishes/iltf7zucjql3n8znvo2t.jpg"
  },
  {
    "name": "Chicken Leg with Honey BBQ Souce",
    "price": 1500,
    "category_id": "cat-chicken",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041063/nitsuh-menu/dishes/ds5mqolveib58z4rmeku.jpg"
  },
  {
    "name": "Chicken Wings",
    "price": 1000,
    "category_id": "cat-chicken",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041066/nitsuh-menu/dishes/joa47lvnmir6zrpkor22.jpg"
  },
  {
    "name": "Chicken Wings with Honey BBQ Souce",
    "price": 1300,
    "category_id": "cat-chicken",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041125/nitsuh-menu/dishes/vekwpnrdbbqmzrwkrbkc.jpg"
  },
  {
    "name": "Chicken Special Combo",
    "price": 2500,
    "category_id": "cat-chicken",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_chefs_pick": true,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041066/nitsuh-menu/dishes/hj5h2ttotfkmfizby7uj.jpg"
  },
  {
    "name": "Special salad",
    "price": 1100,
    "category_id": "cat-salad",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041113/nitsuh-menu/dishes/kggchipcxsmjclgakqjy.jpg"
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
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041082/nitsuh-menu/dishes/qck5jizuutup1gcoij9y.jpg"
  },
  {
    "name": "Tuna Salad",
    "price": 900,
    "category_id": "cat-salad",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041121/nitsuh-menu/dishes/eqokbmmdnhntu0f75yrg.jpg"
  },
  {
    "name": "Chicken Salad",
    "price": 900,
    "category_id": "cat-salad",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041064/nitsuh-menu/dishes/wekifchc8swwyiwh1xcs.jpg"
  },
  {
    "name": "Avocado Salad",
    "price": 700,
    "category_id": "cat-salad",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041057/nitsuh-menu/dishes/cgcykz0pczufjttgir0c.jpg"
  },
  {
    "name": "Normal Salad",
    "price": 700,
    "category_id": "cat-salad",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041103/nitsuh-menu/dishes/giotydwog4po6ibiabxf.jpg"
  },
  {
    "name": "Tomato Pasta",
    "price": 500,
    "category_id": "cat-pasta",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041121/nitsuh-menu/dishes/fq6jd3em4ox2zveh9k13.jpg"
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
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041125/nitsuh-menu/dishes/hibwelmw10l8rp2blmop.jpg"
  },
  {
    "name": "Tuna Pasta",
    "price": 500,
    "category_id": "cat-pasta",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041121/nitsuh-menu/dishes/zjm0fju8hdmketpqnqxi.jpg"
  },
  {
    "name": "Tomato Pasta With Meat",
    "price": 650,
    "category_id": "cat-pasta",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041120/nitsuh-menu/dishes/lyjzjjt8ltfe3jlstyo2.jpg"
  },
  {
    "name": "Arabiyata Pasta",
    "price": 650,
    "category_id": "cat-pasta",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041056/nitsuh-menu/dishes/hiozsoyehskrhasxpnnh.jpg"
  },
  {
    "name": "Alfredo Pasta",
    "price": 750,
    "category_id": "cat-pasta",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041055/nitsuh-menu/dishes/oxbj3kfv8c8x7alj0fwn.jpg"
  },
  {
    "name": "Alfredo Pasta With Chicken",
    "price": 900,
    "category_id": "cat-pasta",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041055/nitsuh-menu/dishes/lmycpw8mgtpflyrnite9.jpg"
  },
  {
    "name": "Pesto Pasta",
    "price": 750,
    "category_id": "cat-pasta",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041107/nitsuh-menu/dishes/u4gctqfkdl6l0htgwqzw.jpg"
  },
  {
    "name": "Classic Mojito",
    "price": 450,
    "category_id": "cat-mojito",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041074/nitsuh-menu/dishes/iciwxll5jdtr9onzkcl4.jpg"
  },
  {
    "name": "Lemon Mint Mojito",
    "price": 350,
    "category_id": "cat-mojito",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041091/nitsuh-menu/dishes/czoizyvboi8okrsrm3ok.jpg"
  },
  {
    "name": "Pineapple Mojito",
    "price": 350,
    "category_id": "cat-mojito",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041106/nitsuh-menu/dishes/hgtvu9elf92ed1c88rel.jpg"
  },
  {
    "name": "Watermelon Mojito",
    "price": 350,
    "category_id": "cat-mojito",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041127/nitsuh-menu/dishes/lomommsl0xmc9lc5qcfn.jpg"
  },
  {
    "name": "Strawberry Mojito",
    "price": 350,
    "category_id": "cat-mojito",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041118/nitsuh-menu/dishes/bd1d3sgxf1w7rm1trjft.jpg"
  },
  {
    "name": "Ginger Mojito",
    "price": 350,
    "category_id": "cat-mojito",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041086/nitsuh-menu/dishes/eexcys2lkt1wcwk6lolv.jpg"
  },
  {
    "name": "Cinnamon Mojito",
    "price": 350,
    "category_id": "cat-mojito",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041070/nitsuh-menu/dishes/uyfuy1fksqh7dfepg89y.jpg"
  },
  {
    "name": "Soft Drink",
    "price": 90,
    "category_id": "cat-soft-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041111/nitsuh-menu/dishes/ga0vubbafzchiv5en8ym.jpg"
  },
  {
    "name": "Novida Soft Drink",
    "price": 90,
    "category_id": "cat-soft-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041103/nitsuh-menu/dishes/ptuap4elwsz0jsqza4we.jpg"
  },
  {
    "name": "Bottle Soft Drink",
    "price": 100,
    "category_id": "cat-soft-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041060/nitsuh-menu/dishes/fmnxextfvpywtzmpbk9z.jpg"
  },
  {
    "name": "Ambo water",
    "price": 90,
    "category_id": "cat-soft-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041055/nitsuh-menu/dishes/gbvbnloskqvzcp0nn77i.jpg"
  },
  {
    "name": "Water ½ Liter",
    "price": 50,
    "category_id": "cat-soft-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041060/nitsuh-menu/dishes/hghrqph8pdx1b8plshwe.jpg"
  },
  {
    "name": "Water 1 Liter",
    "price": 70,
    "category_id": "cat-soft-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041060/nitsuh-menu/dishes/hghrqph8pdx1b8plshwe.jpg"
  },
  {
    "name": "Water 2 Liter",
    "price": 80,
    "category_id": "cat-soft-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041060/nitsuh-menu/dishes/hghrqph8pdx1b8plshwe.jpg"
  },
  {
    "name": "Special Juice",
    "price": 450,
    "category_id": "cat-juices",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_chefs_pick": true,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041113/nitsuh-menu/dishes/jmil4upegrojwzezxy1c.jpg"
  },
  {
    "name": "Papaya Juice",
    "price": 320,
    "category_id": "cat-juices",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041105/nitsuh-menu/dishes/bbgniire8laoamq2h8nv.jpg"
  },
  {
    "name": "Avocado Juice",
    "price": 320,
    "category_id": "cat-juices",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041057/nitsuh-menu/dishes/yfunjaelohtajhbcdd6s.jpg"
  },
  {
    "name": "Watermelon Juice",
    "price": 400,
    "category_id": "cat-juices",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041124/nitsuh-menu/dishes/fnq3bcrlfjyzulrcpdte.jpg"
  },
  {
    "name": "Mango Juice",
    "price": 400,
    "category_id": "cat-juices",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041092/nitsuh-menu/dishes/uzcbfsh8xf5utdzzqmef.jpg"
  },
  {
    "name": "Pineapple Juice",
    "price": 400,
    "category_id": "cat-juices",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041107/nitsuh-menu/dishes/bqhhfr9z28z4kp7vy6b6.jpg"
  },
  {
    "name": "Strawberry Juice",
    "price": 400,
    "category_id": "cat-juices",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041118/nitsuh-menu/dishes/bovydy8kn0nstzellkiq.jpg"
  },
  {
    "name": "Lemon Mint Juice",
    "price": 400,
    "category_id": "cat-juices",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041090/nitsuh-menu/dishes/ovdjiunyxgmcajgf53mc.jpg"
  },
  {
    "name": "Banana Shake",
    "price": 450,
    "category_id": "cat-shakes",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041059/nitsuh-menu/dishes/vudraahudym4plg9muft.jpg"
  },
  {
    "name": "Strawberry Shake",
    "price": 450,
    "category_id": "cat-shakes",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041118/nitsuh-menu/dishes/sbsunf5dwcqnrx36dqx4.jpg"
  },
  {
    "name": "Avocado Shake",
    "price": 450,
    "category_id": "cat-shakes",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041057/nitsuh-menu/dishes/lhqoalppvbhvatf20sr9.jpg"
  },
  {
    "name": "Mocha Shake",
    "price": 450,
    "category_id": "cat-shakes",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041103/nitsuh-menu/dishes/bxsmhyltromyh7sovjlk.jpg"
  },
  {
    "name": "Flaxseed Shake",
    "price": 450,
    "category_id": "cat-shakes",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041083/nitsuh-menu/dishes/vuyb1ucxvjlnknchrzus.jpg"
  },
  {
    "name": "Chocolate Shake",
    "price": 450,
    "category_id": "cat-shakes",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041069/nitsuh-menu/dishes/if0kyrlx0okwlskzd1qf.jpg"
  },
  {
    "name": "Protien Shake",
    "price": 600,
    "category_id": "cat-shakes",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041109/nitsuh-menu/dishes/ve4vvrhaxsxqahvauw8p.jpg"
  },
  {
    "name": "Tea",
    "price": 60,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041131/nitsuh-menu/dishes/k0k6d9gyrikfmrdpsfgi.jpg"
  },
  {
    "name": "Coffee",
    "price": 70,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041130/nitsuh-menu/dishes/veed0cxidtvqsiu5a1qf.jpg"
  },
  {
    "name": "Espresso",
    "price": 140,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041080/nitsuh-menu/dishes/y9yoj6bm73dzyngt7hgy.jpg"
  },
  {
    "name": "Macchiato",
    "price": 110,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041096/nitsuh-menu/dishes/tnyjy4radumocnq6pvwd.jpg"
  },
  {
    "name": "Milk",
    "price": 120,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041098/nitsuh-menu/dishes/pang3vzasaiaxrskxklu.jpg"
  },
  {
    "name": "Milk with coffee",
    "price": 140,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "/images/dishes/roasted-chicken.jpg"
  },
  {
    "name": "Milk with Tea",
    "price": 140,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041098/nitsuh-menu/dishes/mdut2mirewmlcvogqoth.jpg"
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
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041082/nitsuh-menu/dishes/hn6wq1klnyjdrxoicehb.jpg"
  },
  {
    "name": "Tea Sprice",
    "price": 100,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041118/nitsuh-menu/dishes/a8r4sp83k3bdnbpez7rb.jpg"
  },
  {
    "name": "Lemon Tea",
    "price": 70,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041091/nitsuh-menu/dishes/fnfuh4lgzdpi4irlyqul.jpg"
  },
  {
    "name": "Mint Tea",
    "price": 70,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041101/nitsuh-menu/dishes/biby0eypxe4vhjokpuga.jpg"
  },
  {
    "name": "Peanut Tea",
    "price": 140,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041106/nitsuh-menu/dishes/uvxhfhn07czophmzb2nr.jpg"
  },
  {
    "name": "Pineapple Tea",
    "price": 140,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041108/nitsuh-menu/dishes/sj90dmt4dzdpz0r0hd4c.jpg"
  },
  {
    "name": "Orange Tea",
    "price": 140,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041105/nitsuh-menu/dishes/lx34cy62he3wzxgjx3w1.jpg"
  },
  {
    "name": "Caramel Latte",
    "price": 170,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041062/nitsuh-menu/dishes/ph1wjknqhatwo6ubyrii.jpg"
  },
  {
    "name": "Vanilla Latte",
    "price": 170,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041123/nitsuh-menu/dishes/hkstjfyblwnexlcetron.jpg"
  },
  {
    "name": "Ginger Latte",
    "price": 170,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041085/nitsuh-menu/dishes/vfypfkllotffrep5zw6m.jpg"
  },
  {
    "name": "Hot Chocolate",
    "price": 170,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041087/nitsuh-menu/dishes/xmjphybs9kpqdqkdyo2s.jpg"
  },
  {
    "name": "Hot Caramel",
    "price": 170,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041085/nitsuh-menu/dishes/fbr6bfam8mtsvisvt9sj.jpg"
  },
  {
    "name": "Cuppuchino",
    "price": 170,
    "category_id": "cat-hot-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041062/nitsuh-menu/dishes/gquibaftrzfgmv7zk3ja.jpg"
  },
  {
    "name": "Special Tea",
    "price": 180,
    "category_id": "cat-hot-drinks",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_chefs_pick": true,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041105/nitsuh-menu/dishes/lx34cy62he3wzxgjx3w1.jpg"
  },
  {
    "name": "ICE Latte",
    "price": 450,
    "category_id": "cat-iced-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041089/nitsuh-menu/dishes/ijbaoshw8scfdtaxqsem.jpg"
  },
  {
    "name": "ICE Tea",
    "price": 450,
    "category_id": "cat-iced-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041089/nitsuh-menu/dishes/sijyn58zxvdxdd4rh9vz.jpg"
  },
  {
    "name": "ICE Vanilla",
    "price": 450,
    "category_id": "cat-iced-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041090/nitsuh-menu/dishes/wbpcs2h4p8tep83q9nxz.jpg"
  },
  {
    "name": "ICE Chocolate",
    "price": 450,
    "category_id": "cat-iced-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041087/nitsuh-menu/dishes/pag1zlp1oqjqdy3arnfo.jpg"
  },
  {
    "name": "ICE Caramel",
    "price": 450,
    "category_id": "cat-iced-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041087/nitsuh-menu/dishes/ngdyvmycdtsxrwlugxdj.jpg"
  },
  {
    "name": "ICE Strawberry",
    "price": 450,
    "category_id": "cat-iced-drinks",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041089/nitsuh-menu/dishes/ynnrg75rej1a7raxxprv.jpg"
  },
  {
    "name": "ICE Deluxe",
    "price": 600,
    "category_id": "cat-iced-drinks",
    "tags": [
      "popular"
    ],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041089/nitsuh-menu/dishes/birl5pgbgobn8qkxaasb.jpg"
  },
  {
    "name": "Mini Custard Vanilla cake",
    "price": 80,
    "category_id": "cat-desserts",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041101/nitsuh-menu/dishes/gbmqzx61bktna2gswrx6.jpg"
  },
  {
    "name": "Mini Millifoni cake",
    "price": 80,
    "category_id": "cat-desserts",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041101/nitsuh-menu/dishes/hul9aj4jg95oashit3py.jpg"
  },
  {
    "name": "Mini Chocolate cake",
    "price": 100,
    "category_id": "cat-desserts",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041101/nitsuh-menu/dishes/tjgbm5dkfcgg3okf6whi.jpg"
  },
  {
    "name": "Tart cake",
    "price": 80,
    "category_id": "cat-desserts",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041131/nitsuh-menu/dishes/vm4rygeyrsblzgt96y0v.jpg"
  },
  {
    "name": "Mini Boxega cake",
    "price": 80,
    "category_id": "cat-desserts",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041098/nitsuh-menu/dishes/hznywmufhjxepvszypgw.jpg"
  },
  {
    "name": "English Cake",
    "price": 150,
    "category_id": "cat-desserts",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041078/nitsuh-menu/dishes/fui6gjghyjuu2hnse4zw.jpg"
  },
  {
    "name": "Classic Dounut",
    "price": 200,
    "category_id": "cat-desserts",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041071/nitsuh-menu/dishes/kjrssz0b2kk3fjglroej.jpg"
  },
  {
    "name": "Chocolate Chips Cookie",
    "price": 250,
    "category_id": "cat-desserts",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041067/nitsuh-menu/dishes/auy6u6sui7os4cis4jzm.jpg"
  },
  {
    "name": "Croissant",
    "price": 250,
    "category_id": "cat-desserts",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041076/nitsuh-menu/dishes/t1adb7tozz3mpys5abyd.jpg"
  },
  {
    "name": "Chocolate Croissant",
    "price": 350,
    "category_id": "cat-desserts",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041069/nitsuh-menu/dishes/sxbylouxyxzghrxjdqwe.jpg"
  },
  {
    "name": "Tiramisu cake",
    "price": 400,
    "category_id": "cat-desserts",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041119/nitsuh-menu/dishes/b5cpkaz85wry6zq4mr50.jpg"
  },
  {
    "name": "Custard Vanilla Torta 1Kg",
    "price": 2000,
    "category_id": "cat-desserts-kg",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041076/nitsuh-menu/dishes/gnfchwipgbgs7fhfoodm.jpg"
  },
  {
    "name": "Millifoni Torta 1Kg",
    "price": 2200,
    "category_id": "cat-desserts-kg",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041098/nitsuh-menu/dishes/fcskgzdramfzw4smuvhi.jpg"
  },
  {
    "name": "Chocolate Torta 1Kg",
    "price": 2500,
    "category_id": "cat-desserts-kg",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041068/nitsuh-menu/dishes/bfonwbylxzlmwqsrx2ji.jpg"
  },
  {
    "name": "Tiramisu 1Kg",
    "price": 2500,
    "category_id": "cat-desserts-kg",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041119/nitsuh-menu/dishes/lwkg2cimfah9hxqlen9p.jpg"
  },
  {
    "name": "Butter Cookeis 1Kg",
    "price": 1600,
    "category_id": "cat-desserts-kg",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041062/nitsuh-menu/dishes/fy1gojvmyczhz8ltdiji.jpg"
  },
  {
    "name": "Chocolate Chips Cookeis 1Kg",
    "price": 2000,
    "category_id": "cat-desserts-kg",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041069/nitsuh-menu/dishes/hgbmysarp0aifdak0vne.jpg"
  },
  {
    "name": "English Cake 1Kg",
    "price": 800,
    "category_id": "cat-desserts-kg",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041078/nitsuh-menu/dishes/ssszlh0yhqsgqbwveump.jpg"
  },
  {
    "name": "Marble Cake 1Kg",
    "price": 800,
    "category_id": "cat-desserts-kg",
    "tags": [],
    "spice_level": 0,
    "is_chefs_pick": false,
    "image_url": "https://res.cloudinary.com/dekmg6rhe/image/upload/v1793041092/nitsuh-menu/dishes/gnobfvzsrbecdzxhzdbq.jpg"
  }
];
