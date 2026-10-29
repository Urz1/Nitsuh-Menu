const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

// Read DB URL from .env.local
const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
let dbUrl = '';
for (const line of envFile.split('\n')) {
  if (line.startsWith('DATABASE_URL=') || line.startsWith('NEON_DATABASE_URL=')) {
    dbUrl = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
    if (dbUrl) break;
  }
}

const TRANSLATIONS_MAP = {
  // Breakfast
  "Foul": { name_am: "ፉል", description_am: "ትኩስ ፉል በዘይት፣ በርበሬ፣ ቲማቲም እና ትኩስ ዳቦ።" },
  "Foul Special": { name_am: "ፉል ስፔሻል", description_am: "ልዩ ስፔሻል ፉል በእንቁላል፣ እርጎ፣ ቅቤ እና ትኩስ ዳቦ።" },
  "Fetira With Honey": { name_am: "ፈጢራ በማር", description_am: "ትኩስ የተጋገረ ፈጢራ በተፈጥሮ ማር እና ቅቤ።" },
  "Fetira With Egg": { name_am: "ፈጢራ በእንቁላል", description_am: "ትኩስ ፈጢራ በእንቁላል እና ቅቤ።" },
  "Scrambled Egg With Meat": { name_am: "እንቁላል ፍርፍር በስጋ", description_am: "ትኩስ የእንቁላል ፍርፍር በስጋ ቁርጥራጭ።" },
  "Scrambled Egg": { name_am: "እንቁላል ፍርፍር", description_am: "ትኩስ የእንቁላል ፍርፍር በሽንኩርት እና ቲማቲም።" },
  "Egg Sandwich": { name_am: "እንቁላል ሳንድች", description_am: "የእንቁላል ሳንድዊች በትኩስ ሰላጣ እና ቲማቲም።" },
  "Omelet": { name_am: "አምሌት", description_am: "ትኩስ የአምሌት እንቁላል ጥብስ።" },
  "Omelet With Cheese": { name_am: "አምሌት በቺዝ", description_am: "ጣፋጭ አምሌት በቀለጠ ቺዝ።" },
  "Special Omelet": { name_am: "ስፔሻል አምሌት", description_am: "ልዩ ስፔሻል አምሌት በቺዝ፣ ቲማቲም እና አትክልት።" },
  "Chechebsa With Honey": { name_am: "ጨጨብሳ በማር", description_am: "የተቆራረጠ ትኩስ ቂጣ በቅቤ፣ በርበሬ እና የተፈጥሮ ማር።" },
  "Chechebsa With Egg": { name_am: "ጨጨብሳ በእንቁላል", description_am: "ትኩስ ጨጨብሳ በቅቤ እና እንቁላል።" },
  "Avocado Toast": { name_am: "የአቮካዶ ቶስት", description_am: "የተጠበሰ ቶስት ዳቦ በትኩስ አቮካዶ።" },
  "French Toast": { name_am: "ፍሬንች ቶስት", description_am: "ጣፋጭ የፈረንሳይ ፍሬንች ቶስት በማር።" },
  "Pan Cake": { name_am: "ፓን ኬክ", description_am: "ለስላሳ ትኩስ ፓንኬክ በማር ወይም ቸኮሌት።" },
  "Beef & Cheese Sandwich": { name_am: "የበሬ ስጋ እና ቺዝ ሳንድዊች", description_am: "ጭማቂ የበሬ ስጋ እና የቀለጠ ቺዝ ሳንድዊች።" },

  // Burgers
  "Nitsuh Special Burger": { name_am: "ንፁህ ስፔሻል በርገር", description_am: "በንፁህ ካፌ የተዘጋጀ ልዩ ስፔሻል የበሬ ስጋ በርገር ከተጠበሰ ቺዝ እና ድንች ጥብስ ጋር።" },
  "Texas Style BBQ Burger": { name_am: "ቴክሳስ ስታይል BBQ በርገር", description_am: "በጭስ የተጠበሰ ጭማቂ የበሬ ስጋ በርገር በቴክሳስ ባርቢኪው ሶስ እና ጥብስ ድንች።" },
  "Spicy Burger": { name_am: "ስፓይሲ በርገር", description_am: "የሚያቃጥል ስፓይሲ በርገር በልዩ ቃሪያ ሶስ እና ጥርት ባለ ፍሬንች ፍራይስ።" },
  "Junky Burger": { name_am: "ጃንኪ በርገር", description_am: "በብዙ ቺዝ እና ልዩ ሶስ የተሞላ ግዙፍ ጣፋጭ በርገር።" },
  "Beef Burger": { name_am: "የበሬ ስጋ በርገር", description_am: "ክላሲክ ጭማቂ የበሬ ስጋ በርገር በትኩስ ቲማቲም፣ ሰላጣ እና ድንች ጥብስ።" },
  "Cheese Burger": { name_am: "ቺዝ በርገር", description_am: "የበሬ ስጋ በርገር ከቀለጠ ሞዛሬላ ቺዝ እና የቤት ውስጥ ሶስ ጋር።" },
  "Double Beef Burger": { name_am: "ድርብ የበሬ ስጋ በርገር", description_am: "ድርብ የበሬ ስጋ ፓቲዎች በጣፋጭ ሶስ እና ጥብስ ድንች።" },
  "Double Cheese Burger": { name_am: "ድርብ ቺዝ በርገር", description_am: "ሁለት የበሬ ስጋ ፓቲዎች በድርብ የቀለጠ ቺዝ እና ፍሬንች ፍራይስ።" },
  "Chicken Burger": { name_am: "የዶሮ በርገር", description_am: "ጥርት ብሎ የተጠበሰ የዶሮ ስጋ በርገር በሰላጣ እና ክሬሚ ማዮኔዝ።" },
  "Special Chicken Burger": { name_am: "ስፔሻል የዶሮ በርገር", description_am: "ልዩ የዶሮ በርገር በቺዝ፣ እንቁላል እና ጥርት ያለ ፍሬንች ፍራይስ።" },
  "Fasting Burger": { name_am: "የጾም በርገር", description_am: "100% ከእፅዋት እና ከአትክልት የተዘጋጀ ጤናማ የጾም በርገር።" },
  "Slider Burger": { name_am: "ስላይደር በርገር", description_am: "ጣፋጭ አነስተኛ ሚኒ በርገሮች በልዩ ሶስ እና ጥብስ ድንች።" },

  // Pizzas
  "House Special Pizza": { name_am: "ሀውስ ስፔሻል ፒዛ", description_am: "የንፁህ ካፌ ልዩ ፒዛ በስጋ፣ ዶሮ፣ አትክልት እና በበዛ ሞዛሬላ ቺዝ።" },
  "Tuna Pizza": { name_am: "የቱና ፒዛ", description_am: "ጣፋጭ የቱና አሳ ፒዛ በቀይ ሽንኩርት እና የቀለጠ ሞዛሬላ ቺዝ።" },
  "Chicken Pizza": { name_am: "የዶሮ ፒዛ", description_am: "የተጠበሰ የዶሮ ስጋ በልዩ ቲማቲም ሶስ እና ሞዛሬላ ቺዝ።" },
  "Meet Pizza": { name_am: "የስጋ ፒዛ", description_am: "ጣፋጭ የበሬ ስጋ ፒዛ በትኩስ ቅመሞች እና የቀለጠ ቺዝ።" },
  "Pizza Margarita": { name_am: "ፒዛ ማርጋሪታ", description_am: "ክላሲክ የጣሊያን ፒዛ በትኩስ ቲማቲም፣ ኦሪጋኖ እና ሞዛሬላ ቺዝ።" },
  "Fasting Vegetable Pizza": { name_am: "የጾም የአትክልት ፒዛ", description_am: "100% የጾም ፒዛ በትኩስ አትክልቶች፣ ቃሪያ እና ቲማቲም ሶስ።" },
  "Fasting Special Pizza": { name_am: "የጾም ስፔሻል ፒዛ", description_am: "ልዩ የጾም ፒዛ በበርካታ ትኩስ አትክልቶች እና ልዩ ቅመሞች።" },
  "Fasting Tuna Pizza": { name_am: "የጾም ቱና ፒዛ", description_am: "ጣፋጭ የቱና አሳ የጾም ፒዛ በሽንኩርት እና አትክልቶች።" },

  // Club Sandwiches & Sandwiches
  "Special Club Sandwich": { name_am: "ስፔሻል ክለብ ሳንድዊች", description_am: "ባለሶስት ድርብ ስፔሻል ሳንድዊች በዶሮ፣ እንቁላል፣ ቺዝ እና ጥብስ ድንች።" },
  "Chicken Club Sandwich": { name_am: "የዶሮ ክለብ ሳንድዊች", description_am: "የተጠበሰ የዶሮ ስጋ ክለብ ሳንድዊች በሰላጣ፣ ማዮኔዝ እና ፍሬንች ፍራይስ።" },
  "Tuna Club Sandwich": { name_am: "የቱና ክለብ ሳንድዊች", description_am: "ጣፋጭ የቱና አሳ ክለብ ሳንድዊች በሽንኩርት እና ትኩስ ሰላጣ።" },
  "Beef Club Sandwich": { name_am: "የበሬ ስጋ ክለብ ሳንድዊች", description_am: "ጭማቂ የበሬ ስጋ ክለብ ሳንድዊች በሞዛሬላ ቺዝ እና ጥብስ ድንች።" },
  "Fasting Tuna Club Sand.": { name_am: "የጾም ቱና ክለብ ሳንድዊች", description_am: "የጾም የቱና ክለብ ሳንድዊች በአትክልት እና ድንች ጥብስ።" },
  "Chicken Sandwich": { name_am: "የዶሮ ሳንድዊች", description_am: "ትኩስ የተጠበሰ የዶሮ ስጋ ሳንድዊች በስስ ዳቦ እና ማዮኔዝ።" },
  "Steak Sandwich": { name_am: "ስቴክ ሳንድዊች", description_am: "ጣፋጭ የተጠበሰ የበሬ ስቴክ ስጋ ሳንድዊች በካራሜላይዝድ ሽንኩርት።" },
  "Tuna Sandwich": { name_am: "የቱና ሳንድዊች", description_am: "ክላሲክ የቱና አሳ ሳንድዊች በትኩስ ሰላጣ እና ቲማቲም።" },
  "Avocado Sandwich": { name_am: "የአቮካዶ ሳንድዊች", description_am: "ትኩስ የተፈጨ አቮካዶ ሳንድዊች በሎሚ እና የወይራ ዘይት (የጾም)።" },

  // Wraps
  "Special Wrap": { name_am: "ስፔሻል ራፕ", description_am: "ልዩ የተጠቀለለ ቶርቲላ ራፕ በስጋ፣ ዶሮ፣ ቺዝ እና ልዩ ሶስ።" },
  "Chicken Wrap": { name_am: "የዶሮ ራፕ", description_am: "ጣፋጭ የተጠበሰ የዶሮ ስጋ ራፕ በሰላጣ እና ነጭ ሽንኩርት ሶስ።" },
  "Tuna Wrap": { name_am: "የቱና ራፕ", description_am: "የቱና አሳ ራፕ በትኩስ አትክልቶች እና ማዮኔዝ።" },
  "Beef Wrap": { name_am: "የበሬ ስጋ ራፕ", description_am: "የተጠበሰ ጭማቂ የበሬ ስጋ ራፕ በቺዝ እና የተጠበሰ ሽንኩርት።" },
  "Fasting Tuna Wrap": { name_am: "የጾም ቱና ራፕ", description_am: "የጾም የቱና አሳ ራፕ በትኩስ ሰላጣ እና ሎሚ።" },
  "Fasting Vegetable Wrap": { name_am: "የጾም የአትክልት ራፕ", description_am: "100% የጾም የተጠበሰ አትክልት ራፕ በአቮካዶ እና የወይራ ዘይት።" },

  // Chicken
  "Chicken Nuggate": { name_am: "የዶሮ ናጌትስ", description_am: "ጥርት ብለው የተጠበሱ ወርቃማ የዶሮ ናጌቶች ከዲፕ ሶስ ጋር።" },
  "Crispy Chicken Strips": { name_am: "ክሪስፒ ዶሮ ስትሪፕስ", description_am: "የተጠበሱ ጥርት ያሉ የዶሮ ስስ ቁርጥራጮች ከድንች ጥብስ ጋር።" },
  "Crispy Fried Chicken Leg (1 pic)": { name_am: "የተጠበሰ የዶሮ እግር (1 ፍሬ)", description_am: "ጥርት ብሎ በዘይት የተጠበሰ ወርቃማ የዶሮ እግር ከፍሬንች ፍራይስ ጋር።" },
  "Crispy Fried Chicken Leg (2 pic)": { name_am: "የተጠበሰ የዶሮ እግር (2 ፍሬ)", description_am: "ሁለት ጥርት ብለው የተጠበሱ የዶሮ እግሮች ከትኩስ ድንች ጥብስ ጋር።" },
  "Chicken Leg with Honey BBQ Souce": { name_am: "የዶሮ እግር በሃኒ BBQ ሶስ", description_am: "ጣፋጭ የዶሮ እግር በማር እና ባርቢኪው ሶስ ተለውሶ የቀረበ።" },
  "Chicken Wings": { name_am: "የዶሮ ክንፍ (ዊንግስ)", description_am: "ጥርት ብለው የተጠበሱ ጣፋጭ የዶሮ ክንፎች ከዲፕ ሶስ ጋር።" },
  "Chicken Wings with Honey BBQ Souce": { name_am: "የዶሮ ክንፍ በሃኒ BBQ ሶስ", description_am: "የተጠበሱ የዶሮ ክንፎች በማር እና ባርቢኪው ሶስ ተለውሰው የቀረቡ።" },
  "Chicken Special Combo": { name_am: "የዶሮ ስፔሻል ኮምቦ", description_am: "የዶሮ እግር፣ ዊንግስ፣ ናጌትስ እና ድንች ጥብስ የያዘ የተሟላ ኮምቦ።" },

  // Salads
  "Special salad": { name_am: "ስፔሻል ሰላጣ", description_am: "ልዩ ትኩስ ሰላጣ በዶሮ፣ ቺዝ፣ እንቁላል እና ልዩ ድሬሲንግ።" },
  "Fasting Special salad": { name_am: "የጾም ስፔሻል ሰላጣ", description_am: "ልዩ የጾም ሰላጣ በአቮካዶ፣ ቱና፣ የወይራ ፍሬ እና የሎሚ ድሬሲንግ።" },
  "Tuna Salad": { name_am: "የቱና ሰላጣ", description_am: "ትኩስ የቱና አሳ ሰላጣ በሰላጣ ቅጠል፣ ቲማቲም እና ሎሚ።" },
  "Chicken Salad": { name_am: "የዶሮ ሰላጣ", description_am: "የተጠበሰ የዶሮ ስጋ ቁርጥራጭ በሰላጣ፣ ኪያር እና ማዮኔዝ ድሬሲንግ።" },
  "Avocado Salad": { name_am: "የአቮካዶ ሰላጣ", description_am: "ትኩስ የአቮካዶ ቁርጥራጭ በቲማቲም፣ ቃሪያ እና የወይራ ዘይት (የጾም)።" },
  "Normal Salad": { name_am: "ኖርማል ሰላጣ", description_am: "ቀላል እና ትኩስ የአትክልት ሰላጣ በሰላጣ ቅጠል፣ ቲማቲም እና ሽንኩርት።" },

  // Pasta
  "Tomato Pasta": { name_am: "የቲማቲም ፓስታ", description_am: "ክላሲክ ፓስታ በትኩስ የቲማቲም ሶስ፣ ነጭ ሽንኩርት እና ባሲል (የጾም)።" },
  "Vegi Pasta": { name_am: "የአትክልት ፓስታ", description_am: "ጣፋጭ የጾም ፓስታ በተጠበሱ የተመረጡ አትክልቶች።" },
  "Tuna Pasta": { name_am: "የቱና ፓስታ", description_am: "ፓስታ በቱና አሳ፣ ቲማቲም ሶስ እና የወይራ ፍሬ።" },
  "Tomato Pasta With Meat": { name_am: "የቲማቲም ፓስታ በስጋ", description_am: "ፓስታ በተፈጨ የበሬ ስጋ ቦሎኔዝ እና የቲማቲም ሶስ።" },
  "Arabiyata Pasta": { name_am: "አራቢያታ ፓስታ", description_am: "የሚያቃጥል የጣሊያን አራቢያታ ፓስታ በቃሪያ እና ነጭ ሽንኩርት ሶስ።" },
  "Alfredo Pasta": { name_am: "አልፍሬዶ ፓስታ", description_am: "ክሬሚ ነጭ አልፍሬዶ ፓስታ በቅቤ እና ፓርሜዛን ቺዝ።" },
  "Alfredo Pasta With Chicken": { name_am: "አልፍሬዶ ፓስታ በዶሮ", description_am: "ክሬሚ አልፍሬዶ ፓስታ በተጠበሰ የዶሮ ስጋ ቁርጥራጭ እና ቺዝ።" },
  "Pesto Pasta": { name_am: "ፔስቶ ፓስታ", description_am: "አረንጓዴ የባሲል ፔስቶ ፓስታ በወይራ ዘይት እና ነጭ ሽንኩርት።" },

  // Mojitos
  "Classic Mojito": { name_am: "ክላሲክ ሞሂቶ", description_am: "ቀዝቃዛ ክላሲክ ሞሂቶ በትኩስ ሚንት ቅጠል፣ ሎሚ እና በረዶ።" },
  "Lemon Mint Mojito": { name_am: "የሎሚ ሚንት ሞሂቶ", description_am: "መንፈስ የሚያድስ የሎሚ እና ሚንት ሞሂቶ ከሶዳ ጋር።" },
  "Pineapple Mojito": { name_am: "የአናናስ ሞሂቶ", description_am: "ጣፋጭ የተፈጥሮ አናናስ ሞሂቶ በሚንት እና በረዶ።" },
  "Watermelon Mojito": { name_am: "የሀብሀብ ሞሂቶ", description_am: "ቀዝቃዛ የሀብሀብ ፍሬ ሞሂቶ ከሚንት ቅጠል ጋር።" },
  "Strawberry Mojito": { name_am: "የእንጆሪ ሞሂቶ", description_am: "ጣፋጭ የእንጆሪ ፍራፍሬ ሞሂቶ በሎሚ እና በረዶ።" },
  "Ginger Mojito": { name_am: "የዝንጅብል ሞሂቶ", description_am: "ልዩ የዝንጅብል ቃና ያለው ቀዝቃዛ ሞሂቶ በሎሚ።" },
  "Cinnamon Mojito": { name_am: "የቀረፋ ሞሂቶ", description_am: "ልዩ የቀረፋ መዓዛ ያለው የሚያድስ ቀዝቃዛ ሞሂቶ።" },

  // Soft Drinks & Water
  "Soft Drink": { name_am: "ለስላሳ መጠጥ", description_am: "ቀዝቃዛ የታሸገ ለስላሳ መጠጥ (ኮካ፣ ፋንታ፣ ስፕራይት)።" },
  "Novida Soft Drink": { name_am: "ኖቪዳ ለስላሳ መጠጥ", description_am: "ቀዝቃዛ ጣፋጭ የኖቪዳ አናናስ ለስላሳ መጠጥ።" },
  "Bottle Soft Drink": { name_am: "የጠርሙስ ለስላሳ መጠጥ", description_am: "ቀዝቃዛ የጠርሙስ ለስላሳ መጠጥ።" },
  "Ambo water": { name_am: "አምቦ ውሃ", description_am: "የተፈጥሮ ማዕድን አምቦ ውሃ።" },
  "Water ½ Liter": { name_am: "ውሃ ግማሽ ሊትር (½)", description_am: "ንጹህ የታሸገ የተፈጥሮ ውሃ ግማሽ ሊትር።" },
  "Water 1 Liter": { name_am: "ውሃ 1 ሊትር", description_am: "ንጹህ የታሸገ የተፈጥሮ ውሃ አንድ ሊትር።" },
  "Water 2 Liter": { name_am: "ውሃ 2 ሊትር", description_am: "ንጹህ የታሸገ የተፈጥሮ ውሃ ሁለት ሊትር።" },

  // Fresh Juices
  "Special Juice": { name_am: "ስፔሻል ጭማቂ", description_am: "ልዩ የበርካታ የተፈጥሮ ፍራፍሬዎች ቅልቅል ስፕሪስ ጭማቂ በቪምቶ።" },
  "Papaya Juice": { name_am: "የፓፓያ ጭማቂ", description_am: "100% የተፈጥሮ ፓፓያ ጭማቂ በሎሚ።" },
  "Avocado Juice": { name_am: "የአቮካዶ ጭማቂ", description_am: "ወፍራም የተፈጥሮ አቮካዶ ጭማቂ በቪምቶ።" },
  "Watermelon Juice": { name_am: "የሀብሀብ ጭማቂ", description_am: "ቀዝቃዛና መንፈስ የሚያድስ 100% የሀብሀብ ጭማቂ።" },
  "Mango Juice": { name_am: "የማንጎ ጭማቂ", description_am: "ጣፋጭ የተፈጥሮ የማንጎ ጭማቂ።" },
  "Pineapple Juice": { name_am: "የአናናስ ጭማቂ", description_am: "ትኩስ የተጨመቀ የተፈጥሮ አናናስ ጭማቂ።" },
  "Strawberry Juice": { name_am: "የእንጆሪ ጭማቂ", description_am: "ጣፋጭ የተፈጥሮ እንጆሪ ፍራፍሬ ጭማቂ።" },
  "Lemon Mint Juice": { name_am: "የሎሚ ሚንት ጭማቂ", description_am: "ትኩስ የሎሚ ጭማቂ በሚንት ቅጠል እና በረዶ።" },

  // Shakes
  "Banana Shake": { name_am: "የሙዝ ሼክ", description_am: "ክሬሚ የሙዝ ወተት ሼክ በቫኒላ።" },
  "Strawberry Shake": { name_am: "የእንጆሪ ሼክ", description_am: "ወፍራም የእንጆሪ ወተት ሼክ።" },
  "Avocado Shake": { name_am: "የአቮካዶ ሼክ", description_am: "ጣፋጭ የአቮካዶ እና የወተት ክሬም ሼክ።" },
  "Mocha Shake": { name_am: "ሞካ ሼክ", description_am: "የቡና እና ቸኮሌት ቅልቅል ክሬሚ ሼክ።" },
  "Flaxseed Shake": { name_am: "የተልባ ሼክ", description_am: "ጤናማ የተልባ ፍሬ እና ወተት ሼክ።" },
  "Chocolate Shake": { name_am: "የቸኮሌት ሼክ", description_am: "ጣፋጭ የቸኮሌት ወተት ሼክ በቸኮሌት ሶስ።" },
  "Protien Shake": { name_am: "ፕሮቲን ሼክ", description_am: "ከፍተኛ ጉልበት ሰጪ የፕሮቲን ሼክ።" },

  // Hot Drinks
  "Tea": { name_am: "ሻይ", description_am: "ትኩስ ጥቁር ሻይ በቅመሞች።" },
  "Coffee": { name_am: "ቡና", description_am: "ትኩስ የሀበሻ ጀበና ቡና።" },
  "Espresso": { name_am: "ኤስፕሬሶ", description_am: "ጠንካራና መዓዛ ያለው የጣሊያን ኤስፕሬሶ።" },
  "Macchiato": { name_am: "ማኪያቶ", description_am: "የኢትዮጵያ ምርጥ ወተት ማኪያቶ።" },
  "Milk": { name_am: "ትኩስ ወተት", description_am: "ትኩስ ንጹህ ላም ወተት።" },
  "Milk with coffee": { name_am: "ወተት በቡና", description_am: "ትኩስ ወተት በትንሽ ቡና።" },
  "Milk with Tea": { name_am: "ወተት በሻይ", description_am: "ትኩስ ወተት በሻይ ቅመም።" },
  "Fasting Macchiato": { name_am: "የጾም ማኪያቶ", description_am: "የጾም ማኪያቶ በአኩሪ አተር ወተት።" },
  "Tea Sprice": { name_am: "ሻይ ስፕሪስ", description_am: "ሻይ እና ቡና በግማሽ የተቀላቀለ ስፕሪስ።" },
  "Lemon Tea": { name_am: "የሎሚ ሻይ", description_am: "ትኩስ ሻይ በተጨመቀ ሎሚ።" },
  "Mint Tea": { name_am: "የናና ሻይ", description_am: "ትኩስ ሻይ በሚንት (ናና) ቅጠል።" },
  "Peanut Tea": { name_am: "የለውዝ ሻይ", description_am: "ትኩስ ሻይ በኦቾሎኒ (ለውዝ) ቅቤ።" },
  "Pineapple Tea": { name_am: "የአናናስ ሻይ", description_am: "ትኩስ ሻይ በአናናስ ጣዕም።" },
  "Orange Tea": { name_am: "የብርቱካን ሻይ", description_am: "ትኩስ ሻይ በብርቱካን ጭማቂ።" },
  "Caramel Latte": { name_am: "ካራሜል ላቴ", description_am: "ትኩስ ቡና በወተት እና ጣፋጭ ካራሜል ሶስ።" },
  "Vanilla Latte": { name_am: "ቫኒላ ላቴ", description_am: "ትኩስ ቡና በወተት እና የቫኒላ ጣዕም።" },
  "Ginger Latte": { name_am: "ዝንጅብል ላቴ", description_am: "ትኩስ ቡና በወተት እና በሚያሞቅ ዝንጅብል።" },
  "Hot Chocolate": { name_am: "ትኩስ ቸኮሌት", description_am: "የቀለጠ የበለፀገ ትኩስ ቸኮሌት በወተት።" },
  "Hot Caramel": { name_am: "ትኩስ ካራሜል", description_am: "ጣፋጭ ትኩስ ካራሜል መጠጥ በወተት።" },
  "Cuppuchino": { name_am: "ካፑቺኖ", description_am: "ክላሲክ ካፑቺኖ በወተት አረፋ እና ኮኮዋ።" },
  "Special Tea": { name_am: "ስፔሻል ሻይ", description_am: "ልዩ የቅመም ሻይ በዝንጅብል፣ ቀረፋ፣ ቅርንፉድ እና ሎሚ።" },

  // Iced Drinks
  "ICE Latte": { name_am: "አይስ ላቴ", description_am: "ቀዝቃዛ ኤስፕሬሶ ቡና በቀዝቃዛ ወተት እና በረዶ።" },
  "ICE Tea": { name_am: "አይስ ሻይ", description_am: "ቀዝቃዛ ሻይ በሎሚ እና በረዶ።" },
  "ICE Vanilla": { name_am: "አይስ ቫኒላ", description_am: "ቀዝቃዛ የቫኒላ ቡና በበረዶ።" },
  "ICE Chocolate": { name_am: "አይስ ቸኮሌት", description_am: "ቀዝቃዛ የቸኮሌት መጠጥ በበረዶ።" },
  "ICE Caramel": { name_am: "አይስ ካራሜል", description_am: "ቀዝቃዛ ካራሜል ቡና በበረዶ እና ክሬም።" },
  "ICE Strawberry": { name_am: "አይስ እንጆሪ", description_am: "ቀዝቃዛ የእንጆሪ መጠጥ በበረዶ።" },
  "ICE Deluxe": { name_am: "አይስ ዲሉክስ", description_am: "ልዩ ቀዝቃዛ ቡና በክሬም፣ ቸኮሌት እና ካራሜል።" },

  // Desserts & Pastries
  "Mini Custard Vanilla cake": { name_am: "ሚኒ ካስተርድ ቫኒላ ኬክ", description_am: "ለስላሳ ሚኒ ቫኒላ ኬክ በጣፋጭ ካስተርድ ክሬም።" },
  "Mini Millifoni cake": { name_am: "ሚኒ ሚሊፎኒ ኬክ", description_am: "ጥርት ያለ የጣሊያን ሚሊፎኒ ፔስትሪ በክሬም።" },
  "Mini Chocolate cake": { name_am: "ሚኒ ቸኮሌት ኬክ", description_am: "ጣፋጭ የበለፀገ ሚኒ ቸኮሌት ኬክ።" },
  "Tart cake": { name_am: "ታርት ኬክ", description_am: "ጥርት ያለ የታርት ኬክ በፍራፍሬ እና ክሬም።" },
  "Mini Boxega cake": { name_am: "ሚኒ ቦዜጋ ኬክ", description_am: "ባህላዊ ለስላሳ ሚኒ ቦዜጋ ኬክ።" },
  "English Cake": { name_am: "ኢንግሊሽ ኬክ", description_am: "ክላሲክ ለስላሳ የሻይ ሰዓት ኢንግሊሽ ኬክ።" },
  "Classic Dounut": { name_am: "ክላሲክ ዶናት", description_am: "ለስላሳ የተጠበሰ ጣፋጭ ክላሲክ ዶናት።" },
  "Chocolate Chips Cookie": { name_am: "ቸኮሌት ቺፕስ ኩኪስ", description_am: "ጥርት ያለ ኩኪስ በጣፋጭ ቸኮሌት ቺፕስ።" },
  "Croissant": { name_am: "ክሮሳንት", description_am: "ትኩስ ቅቤማ ለስላሳ የፈረንሳይ ክሮሳንት።" },
  "Chocolate Croissant": { name_am: "የቸኮሌት ክሮሳንት", description_am: "ትኩስ ክሮሳንት በጣፋጭ ቸኮሌት የተሞላ።" },
  "Tiramisu cake": { name_am: "ቲራሚሱ ኬክ", description_am: "ክላሲክ የጣሊያን ቡና እና ማስካርፖኔ ቲራሚሱ ኬክ።" },

  // Torta & Cakes (Per KG)
  "Custard Vanilla Torta 1Kg": { name_am: "ካስተርድ ቫኒላ ቶርታ 1ኪሎ", description_am: "የ1 ኪሎ ክብረ በዓል ካስተርድ ቫኒላ ቶርታ ኬክ።" },
  "Millifoni Torta 1Kg": { name_am: "ሚሊፎኒ ቶርታ 1ኪሎ", description_am: "የ1 ኪሎ ክብረ በዓል ሚሊፎኒ ቶርታ ኬክ።" },
  "Chocolate Torta 1Kg": { name_am: "ቸኮሌት ቶርታ 1ኪሎ", description_am: "የ1 ኪሎ ክብረ በዓል የበለፀገ ቸኮሌት ቶርታ ኬክ።" },
  "Tiramisu 1Kg": { name_am: "ቲራሚሱ ቶርታ 1ኪሎ", description_am: "የ1 ኪሎ ክላሲክ የጣሊያን ቲራሚሱ ቶርታ ኬክ።" },
  "Butter Cookeis 1Kg": { name_am: "የቅቤ ኩኪስ 1ኪሎ", description_am: "የ1 ኪሎ ለስላሳ ጥርት ያለ የቤት ውስጥ የቅቤ ኩኪስ።" },
  "Chocolate Chips Cookeis 1Kg": { name_am: "ቸኮሌት ቺፕስ ኩኪስ 1ኪሎ", description_am: "የ1 ኪሎ ጣፋጭ የቸኮሌት ቺፕስ ኩኪስ።" },
  "English Cake 1Kg": { name_am: "ኢንግሊሽ ኬክ 1ኪሎ", description_am: "የ1 ኪሎ ክላሲክ ለስላሳ ኢንግሊሽ ኬክ።" },
  "Marble Cake 1Kg": { name_am: "ማርብል ኬክ 1ኪሎ", description_am: "የ1 ኪሎ ቫኒላ እና ቸኮሌት የተቀላቀለበት ማርብል ኬክ።" }
};

async function run() {
  console.log('1. Checking translation dictionary coverage...');
  const dictKeys = Object.keys(TRANSLATIONS_MAP);
  console.log(`Dictionary contains ${dictKeys.length} translations.`);

  // Update Neon DB using a single batched UPDATE query
  if (dbUrl) {
    console.log('2. Updating Neon PostgreSQL database in a single batched statement...');
    const sql = neon(dbUrl);

    // Build the VALUES clause safely
    const valuesEntries = Object.entries(TRANSLATIONS_MAP).map(([name, val]) => {
      // Escape single quotes for SQL string literals
      const cleanName = name.replace(/'/g, "''");
      const cleanNameAm = val.name_am.replace(/'/g, "''");
      const cleanDescAm = val.description_am.replace(/'/g, "''");
      return `('${cleanName}', '${cleanNameAm}', '${cleanDescAm}')`;
    });

    const batchSql = `
      UPDATE public.items AS i
      SET name_am = v.name_am,
          description_am = v.description_am
      FROM (VALUES ${valuesEntries.join(', ')}) AS v(name, name_am, description_am)
      WHERE i.name = v.name;
    `;

    const result = await sql.query(batchSql);
    console.log('Successfully executed batched update in Neon PostgreSQL!', result);

    // Verify
    const updatedStats = await sql`
      SELECT count(*) as total,
             count(CASE WHEN name_am IS NOT NULL AND name_am != '' THEN 1 END) as with_am
      FROM public.items
    `;
    console.log('Database verification stats:', updatedStats[0]);
  }

  // Update data-provider.ts MOCK_ITEMS_NITSUH
  console.log('3. Updating src/lib/data-provider.ts MOCK_ITEMS_NITSUH...');
  const dataProviderPath = path.join(__dirname, '../src/lib/data-provider.ts');
  let content = fs.readFileSync(dataProviderPath, 'utf8');

  // Extract MOCK_ITEMS_NITSUH block
  const startMarker = 'export const MOCK_ITEMS_NITSUH: MenuItem[] = [';
  const endMarker = 'export const MOCK_RESTAURANTS';
  const startIndex = content.indexOf(startMarker);
  const endIndex = content.indexOf(endMarker, startIndex);

  if (startIndex !== -1 && endIndex !== -1) {
    const jsonBlock = content.substring(startIndex + startMarker.length - 1, endIndex).trim();
    const cleanJson = jsonBlock.replace(/;\s*$/, '');
    try {
      const items = JSON.parse(cleanJson);
      let updatedItemsCount = 0;
      for (const item of items) {
        const match = TRANSLATIONS_MAP[item.name];
        if (match) {
          item.name_am = match.name_am;
          item.description_am = match.description_am;
          updatedItemsCount++;
        }
      }
      console.log(`Updated ${updatedItemsCount} items in parsed MOCK_ITEMS_NITSUH array.`);
      const newBlock = startMarker.slice(0, -1) + JSON.stringify(items, null, 2) + ';\n\n';
      content = content.substring(0, startIndex) + newBlock + content.substring(endIndex);
      fs.writeFileSync(dataProviderPath, content, 'utf8');
      console.log('Successfully rewrote src/lib/data-provider.ts with full Amharic translations!');
    } catch (e) {
      console.error('Failed to parse MOCK_ITEMS_NITSUH as JSON:', e.message);
    }
  }

  console.log('Done!');
}

module.exports = { TRANSLATIONS_MAP };

if (require.main === module) {
  run().catch(console.error);
}
