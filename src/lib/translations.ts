export type Language = 'en' | 'am' | 'es';

export interface CategoryTranslation {
  name: string;
  description: string;
}

export interface AppTranslations {
  // Navigation & Header
  openNow: string;
  closed: string;
  table: string;
  wifi: string;
  wifiCopied: string;
  searchPlaceholder: string;
  allCategories: string;
  browseCategories: string;
  nextCategory: string;
  endOfCategory: string;
  viewCategory: string;
  backToTop: string;

  // Filters & Sorting
  filterAll: string;
  filterOnOffer: string;
  filterChefsPick: string;
  filterFasting: string;
  filterVegetarian: string;
  filterVegan: string;
  filterGlutenFree: string;
  filterHalal: string;
  filterSpicy: string;
  sortLabel: string;
  sortFeatured: string;
  sortPriceAsc: string;
  sortPriceDesc: string;
  sortNameAsc: string;

  // Item Cards & Modal
  addToOrder: string;
  soldOut: string;
  chefsPick: string;
  specialOffer: string;
  saveAmount: string;
  customizations: string;
  goesWellWith: string;
  authenticPairing: string;
  spiceLevel: string;
  spiceNone: string;
  dietary: string;
  guestReviews: string;
  guestReviewsSubtitle: string;
  reviewsCount: string;
  rateThisDish: string;
  noReviewsYet: string;
  newDish: string;
  beFirstToReview: string;
  reportReview: string;
  specialInstructions: string;
  specialInstructionsPlaceholder: string;
  pairingTitle: string;
  addPairingBtn: string;
  verifiedDiner: string;

  // Review Modal Flow
  reviewModalTitle: string;
  reviewModalSubtitle: string;
  quickTagsTitle: string;
  quickTagsOptional: string;
  commentLabel: string;
  commentOptional: string;
  commentPlaceholder: string;
  dishPhotoLabel: string;
  dishPhotoOptional: string;
  submitReview: string;
  submittingReview: string;
  thankYouReviewTitle: string;
  thankYouReviewDesc: string;
  done: string;
  alreadyReviewedMsg: string;

  // Review Report Modal
  reportTitle: string;
  reportSubtitle: string;
  reportReasonSpam: string;
  reportReasonAbuse: string;
  reportReasonPii: string;
  reportReasonOther: string;
  cancel: string;
  submitReport: string;
  reportThanks: string;

  // Order Bar & Summary Sheet
  reviewOrder: string;
  myOrder: string;
  itemsSubtotal: string;
  totalSavings: string;
  taxLabel: string;
  taxIncluded: string;
  total: string;
  showToWaiter: string;
  clearAll: string;
  emptyOrder: string;
  emptyOrderHint: string;
  addedToOrder: string;
  freeGiftLabel: string;

  // Service, PWA & Footers
  offlineNotice: string;
  offlineBadge: string;
  comingSoonCalling: string;
  waiterAssistance: string;
  tableQr: string;
  menuQr: string;
  shareMenu: string;
  staffOwnerPortal: string;
  installAppTitle: string;
  installAppDesc: string;
  installAppBtn: string;
  notNowBtn: string;

  // Settings & Preferences Modal
  settingsTitle: string;
  settingsDesc: string;
  languageLabel: string;
  appearanceLabel: string;
  lightMode: string;
  darkMode: string;
  autoMode: string;
  themesLabel: string;
  themeModernMinimal: string;
  themeClassicElegance: string;
  themeBoldDark: string;
  themeWarmRustic: string;
  tableNumberLabel: string;
  guestWifiLabel: string;

  // Star Rating Labels
  starRatingLabels: [string, string, string, string, string, string];

  // Default Review Quick Tags
  defaultReviewTags: string[];

  // Review Photo actions
  removePhoto: string;
  uploadPhoto: string;

  // Empty Filter / Search State
  noActiveOffers: string;
  noActiveOffersHint: string;
  noFavoritesSaved: string;
  noMatchingDishes: string;
  adjustFilterHint: string;
  resetFilters: string;
  resultsCount: string;
  dishesOnOfferCount: string;

  // Service Assistance Modal
  serviceAssistanceTitle: string;
  serviceAssistanceDesc: string;
  callWaiterTitle: string;
  callWaiterDesc: string;
  requestWaterTitle: string;
  requestWaterDesc: string;
  extraCutleryTitle: string;
  extraCutleryDesc: string;
  requestBillTitle: string;
  requestBillDesc: string;

  // Server Summary Card
  serverSummaryTitle: string;
  dineInSeating: string;
  totalItemsLabel: string;
  noteLabel: string;

  // Table / Menu QR Modal
  tableQrTitle: string;
  tableQrDesc: string;
  menuQrTitle: string;
  menuQrDesc: string;
  copyMenuLink: string;
  linkCopied: string;
}

const enTranslations: AppTranslations = {
  openNow: 'Open Now',
    closed: 'Closed',
    table: 'Table',
    wifi: 'WiFi',
    wifiCopied: 'WiFi info copied',
    searchPlaceholder: 'Search dishes, ingredients, dietary tags...',
    allCategories: 'All Categories',
    browseCategories: 'Menu Directory',
    nextCategory: 'Next Category',
    endOfCategory: 'End of',
    viewCategory: 'View Dishes',
    backToTop: 'Back to top',

    filterAll: 'All',
    filterOnOffer: 'Special Offers',
    filterChefsPick: 'Chef Picks',
    filterFasting: 'Fasting (Tsom)',
    filterVegetarian: 'Vegetarian',
    filterVegan: 'Vegan',
    filterGlutenFree: 'Gluten-Free',
    filterHalal: 'Halal',
    filterSpicy: 'Spicy',

    sortLabel: 'Sort',
    sortFeatured: 'Featured & Popular',
    sortPriceAsc: 'Price: Low to High',
    sortPriceDesc: 'Price: High to Low',
    sortNameAsc: 'Name: A to Z',

    addToOrder: 'Add to Order',
    soldOut: 'Sold Out Today',
    chefsPick: "Chef's Pick",
    specialOffer: 'Special Offer',
    saveAmount: 'Saved',
    customizations: 'Customizations & Add-ons',
    goesWellWith: 'Goes well with',
    authenticPairing: 'Authentic Pairing',
    spiceLevel: 'Spice Level',
    spiceNone: 'Mild / None',
    dietary: 'Dietary',
    guestReviews: 'Guest Reviews',
    guestReviewsSubtitle: 'Honest feedback from recent diners',
    reviewsCount: 'verified ratings',
    rateThisDish: 'Rate this dish',
    noReviewsYet: 'No reviews yet for this dish. Be the first to share your thoughts!',
    newDish: 'New Dish',
    beFirstToReview: 'Be the first to review',
    reportReview: 'Report',
    specialInstructions: 'Special Instructions',
    specialInstructionsPlaceholder: 'e.g. Extra napkins, dressing on side...',
    pairingTitle: 'Pairs Well',
    addPairingBtn: '+ Add',
    verifiedDiner: 'Verified Diner',

    reviewModalTitle: 'Quick Dish Review',
    reviewModalSubtitle: 'Fast, honest feedback in under 15 seconds. No account required.',
    quickTagsTitle: 'Quick Tags',
    quickTagsOptional: '(Optional, tap to select)',
    commentLabel: 'Comment',
    commentOptional: '(Optional)',
    commentPlaceholder: 'What made this dish memorable? (Keep it honest and helpful)',
    dishPhotoLabel: 'Dish Photo',
    dishPhotoOptional: '(Optional, max 4MB)',
    submitReview: 'Submit Honest Review',
    submittingReview: 'Submitting...',
    thankYouReviewTitle: 'Thank you for your review!',
    thankYouReviewDesc: 'Your honest feedback helps our culinary team maintain top quality dishes.',
    done: 'Done',
    alreadyReviewedMsg: 'You have already reviewed this dish',

    reportTitle: 'Moderate Review',
    reportSubtitle: 'Why are you reporting this review?',
    reportReasonSpam: 'Spam or advertisement',
    reportReasonAbuse: 'Offensive or abusive language',
    reportReasonPii: 'Personal information (phone, email)',
    reportReasonOther: 'Other reason',
    cancel: 'Cancel',
    submitReport: 'Submit Report',
    reportThanks: 'Thank you for reporting. Our management team will inspect it.',

    reviewOrder: 'Review My Order',
    myOrder: 'My Order',
    itemsSubtotal: 'Items Subtotal',
    totalSavings: 'Total Offer Savings',
    taxLabel: 'Tax (VAT)',
    taxIncluded: 'Included in menu prices',
    total: 'Total to Pay',
    showToWaiter: 'Show Order to Waiter',
    clearAll: 'Clear All',
    emptyOrder: 'Your order is currently empty',
    emptyOrderHint: 'Tap dishes on the menu to add them to your order',
    addedToOrder: 'Added to your order',
    freeGiftLabel: 'Free Gift',

    offlineNotice: "You're offline. Showing cached menu and offline cart",
    offlineBadge: 'Offline Mode',
    comingSoonCalling: 'Digital waiter calling is coming soon. Please let your waiter know in person!',
    waiterAssistance: 'Ask Waiter',
    tableQr: 'Menu QR',
    menuQr: 'Menu QR',
    shareMenu: 'Share Menu',
    staffOwnerPortal: 'Staff & Owner Portal',
    installAppTitle: 'Install Nitsuh Cafe & Restaurant App',
    installAppDesc: 'Instant access & offline dining',
    installAppBtn: 'Install',
    notNowBtn: 'Not now',

    settingsTitle: 'Display & Preferences',
    settingsDesc: 'Customize your digital dining view.',
    languageLabel: 'Language',
    appearanceLabel: 'Appearance',
    lightMode: 'Light',
    darkMode: 'Dark',
    autoMode: 'Auto',
    themesLabel: 'Atmosphere Themes',
    themeModernMinimal: 'Modern Minimal',
    themeClassicElegance: 'Classic Elegance',
    themeBoldDark: 'Bold Dark',
    themeWarmRustic: 'Warm Rustic',
    tableNumberLabel: 'Order Number',
    guestWifiLabel: 'Guest WiFi',

    starRatingLabels: ['', 'Needs Improvement', 'Fair', 'Good', 'Very Good', 'Exceptional!'],
    defaultReviewTags: [
      'Great portion',
      'Would order again',
      'Fresh ingredients',
      'Crispy texture',
      'Perfect spice',
      'Too salty',
      'Could be hotter',
      'Needs more seasoning',
    ],
    removePhoto: 'Remove Photo',
    uploadPhoto: 'Upload a Photo',

    noActiveOffers: 'No active offers right now',
    noActiveOffersHint: 'Check back soon for upcoming happy hours and chef specials',
    noFavoritesSaved: 'No favorites saved yet',
    noMatchingDishes: 'No matching dishes found',
    adjustFilterHint: 'Try adjusting your search or clearing your active filters',
    resetFilters: 'Reset Filters',
    resultsCount: 'Results',
    dishesOnOfferCount: 'Dishes on Offer',

    serviceAssistanceTitle: 'Server Assistance',
    serviceAssistanceDesc: 'Tap a quick request below to alert your server immediately',
    callWaiterTitle: 'Call Waiter',
    callWaiterDesc: 'Need help with recommendations or questions',
    requestWaterTitle: 'Request Water Refill',
    requestWaterDesc: 'Sparkling or still water refill',
    extraCutleryTitle: 'Extra Cutlery / Napkins',
    extraCutleryDesc: 'Fresh forks, knives, spoons, or paper napkins',
    requestBillTitle: 'Request Bill / Check',
    requestBillDesc: 'Ready to complete your dining experience',

    serverSummaryTitle: 'SERVER SUMMARY',
    dineInSeating: 'Order Summary',
    totalItemsLabel: 'Total Items',
    noteLabel: 'Note',

    tableQrTitle: 'Digital Menu QR Code',
    tableQrDesc: 'Scan with any camera to instantly load the digital menu for',
    menuQrTitle: 'Digital Menu QR',
    menuQrDesc: 'Scan with any phone camera to browse the live digital menu for',
    copyMenuLink: 'Copy Direct Menu Link',
    linkCopied: 'Link Copied!',
};

export const TRANSLATIONS: Record<Language, AppTranslations> = {
  en: enTranslations,

  am: {
    openNow: 'ክፍት ነው',
    closed: 'ተዘግቷል',
    table: 'ጠረጴዛ',
    wifi: 'ዋይፋይ',
    wifiCopied: 'የዋይፋይ መረጃ ተቀድቷል',
    searchPlaceholder: 'ምግቦች፣ ግብዓቶች ወይም የጾም ምግቦችን ይፈልጉ...',
    allCategories: 'ሁሉም ምድቦች',
    browseCategories: 'የምግብ ዝርዝር ማውጫ',
    nextCategory: 'ቀጣይ ምድብ',
    endOfCategory: 'የዚህ ምድብ መጨረሻ፦',
    viewCategory: 'ምግቦቹን ይመልከቱ',
    backToTop: 'ወደ ላይ ተመለስ',

    filterAll: 'ሁሉም',
    filterOnOffer: 'ልዩ ቅናሽ',
    filterChefsPick: 'የሼፍ ምርጥ',
    filterFasting: 'የጾም ምግቦች',
    filterVegetarian: 'አትክልት ብቻ',
    filterVegan: 'ቪጋን',
    filterGlutenFree: 'ከግሉተን ነፃ',
    filterHalal: 'ሀላል',
    filterSpicy: 'ቃሪያ / የሚያቃጥል',

    sortLabel: 'አስተካክል',
    sortFeatured: 'ተወዳጅ እና ታዋቂ',
    sortPriceAsc: 'ዋጋ፦ ከዝቅተኛ ወደ ከፍተኛ',
    sortPriceDesc: 'ዋጋ፦ ከከፍተኛ ወደ ዝቅተኛ',
    sortNameAsc: 'በፊደል ተራ፦ ሀ እስከ ፐ',

    addToOrder: 'ወደ ትዕዛዝ አክል',
    soldOut: 'ዛሬ አልቋል',
    chefsPick: 'የሼፍ ምርጥ',
    specialOffer: 'ልዩ ቅናሽ',
    saveAmount: 'ቆጥበዋል',
    customizations: 'ተጨማሪ ምርጫዎች',
    goesWellWith: 'አብሮ የሚሄድ',
    authenticPairing: 'ባህላዊ አጋዥ ጥምረት',
    spiceLevel: 'የማቃጠል መጠን',
    spiceNone: 'የማያቃጥል / አልጫ',
    dietary: 'የአመጋገብ አይነት',
    guestReviews: 'የደንበኞች አስተያየት',
    guestReviewsSubtitle: 'ከቅርብ ጊዜ እንግዶች የተሰጠ አስተያየት',
    reviewsCount: 'የተረጋገጡ ደረጃዎች',
    rateThisDish: 'ለዚህ ምግብ ደረጃ ይስጡ',
    noReviewsYet: 'እስካሁን ምንም አስተያየት አልተሰጠም። ቀዳሚ ሆነው ይገምግሙ!',
    newDish: 'አዲስ ምግብ',
    beFirstToReview: 'ቀዳሚ ሆነው ይገምግሙ',
    reportReview: 'ሪፖርት አድርግ',
    specialInstructions: 'ልዩ ትዕዛዝ',
    specialInstructionsPlaceholder: 'ምሳሌ፦ ተጨማሪ ሶስ፣ ጨው ይቀነስ...',
    pairingTitle: 'አብሮ የሚሄድ',
    addPairingBtn: '+ አክል',
    verifiedDiner: 'የተረጋገጠ ተመጋቢ',

    reviewModalTitle: 'ለዚህ ምግብ ደረጃ ይስጡ',
    reviewModalSubtitle: 'በ15 ሰከንድ ውስጥ ፈጣንና እውነተኛ አስተያየት ይስጡ። መመዝገብ አያስፈልግም።',
    quickTagsTitle: 'ፈጣን መገለጫዎች',
    quickTagsOptional: '(አማራጭ፣ ለመምረጥ ይጫኑ)',
    commentLabel: 'አስተያየት',
    commentOptional: '(አማራጭ)',
    commentPlaceholder: 'ይህንን ምግብ ልዩ ያደረገው ምንድን ነው? (እውነተኛ አስተያየት)',
    dishPhotoLabel: 'የምግብ ፎቶ',
    dishPhotoOptional: '(አማራጭ፣ ቢበዛ 4ሜባ)',
    submitReview: 'አስተያየትን ላክ',
    submittingReview: 'በመላክ ላይ...',
    thankYouReviewTitle: 'ስለ አስተያየትዎ እናመሰግናለን!',
    thankYouReviewDesc: 'የእርስዎ እውነተኛ አስተያየት የሙያተኞቻችንን ጥራት ለማሻሻል ይረዳል።',
    done: 'ተጠናቋል',
    alreadyReviewedMsg: 'ለዚህ ምግብ አስቀድመው አስተያየት ሰጥተዋል',

    reportTitle: 'አስተያየትን ሪፖርት ያድርጉ',
    reportSubtitle: 'ይህንን አስተያየት ለምን ሪፖርት ማድረግ ፈለጉ?',
    reportReasonSpam: 'አላስፈላጊ ማስታወቂያ ወይም ስፓም',
    reportReasonAbuse: 'ስድብ ወይም አፀያፊ ቋንቋ',
    reportReasonPii: 'የግል መረጃ (ስልክ ቁጥር፣ ኢሜይል)',
    reportReasonOther: 'ሌላ ምክንያት',
    cancel: 'ይቅር',
    submitReport: 'ሪፖርት ላክ',
    reportThanks: 'ስለገለጹልን እናመሰግናለን። አስተዳደራችን ይመረምረዋል።',

    reviewOrder: 'ትዕዛዜን ተመልከት',
    myOrder: 'የእኔ ትዕዛዝ',
    itemsSubtotal: 'የምግቦች ድምር',
    totalSavings: 'አጠቃላይ የቅናሽ ቁጠባ',
    taxLabel: 'ግብር (ቫት)',
    taxIncluded: 'በዋጋው ውስጥ ተካቷል',
    total: 'ጠቅላላ ክፍያ',
    showToWaiter: 'ትዕዛዙን ለአስተናጋጅ አሳይ',
    clearAll: 'ሁሉንም አፅዳ',
    emptyOrder: 'ትዕዛዝዎ ባዶ ነው',
    emptyOrderHint: 'ለመምረጥ በምናሌው ላይ ያሉትን ምግቦች ይጫኑ',
    addedToOrder: 'ወደ ትዕዛዝዎ ተጨምሯል',
    freeGiftLabel: 'ነፃ ስጦታ',

    offlineNotice: 'ኢንተርኔት ተቋርጧል፡ የተቀመጠውን ምናሌ እያሳየ ነው',
    offlineBadge: 'ከመስመር ውጭ',
    comingSoonCalling: 'በስልክ አስተናጋጅ መጥራት በቅርቡ ይጀምራል፤ እባክዎ በአካል ያነጋግሩን!',
    waiterAssistance: 'አስተናጋጅ ይጠይቁ',
    tableQr: 'የሜኑ QR',
    menuQr: 'የሜኑ QR',
    shareMenu: 'ምናሌውን ያጋሩ',
    staffOwnerPortal: 'የሰራተኞች እና የባለቤት መግቢያ',
    installAppTitle: 'የአዲስ ካፌቴሪያ አፕ ጫን',
    installAppDesc: 'ቀጥታና ከመስመር ውጭ ለማዘዝ',
    installAppBtn: 'ጫን',
    notNowBtn: 'አሁን አይደለም',

    settingsTitle: 'የማሳያ እና ምርጫዎች',
    settingsDesc: 'የዲጂታል ምናሌ እይታዎን ያስተካክሉ።',
    languageLabel: 'ቋንቋ',
    appearanceLabel: 'መልክ',
    lightMode: 'ቀላል (ብርሃን)',
    darkMode: 'ጨለማ',
    autoMode: 'ራስ-ሰር',
    themesLabel: 'ገጽታዎች',
    themeModernMinimal: 'ዘመናዊ ቀላል',
    themeClassicElegance: 'ክላሲክ ውበት',
    themeBoldDark: 'ደማቅ ጨለማ',
    themeWarmRustic: 'ሞቅ ያለ ባህላዊ',
    tableNumberLabel: 'የትዕዛዝ ቁጥር',
    guestWifiLabel: 'የእንግዳ ዋይፋይ',

    starRatingLabels: ['', 'ማሻሻል ይፈልጋል', 'መካከለኛ', 'ጥሩ', 'በጣም ጥሩ', 'ድንቅ ጣዕም!'],
    defaultReviewTags: [
      'ጥሩ መጠን',
      'እንደገና አዛለሁ',
      'ትኩስ ግብአት',
      'የሚጣፍጥ ቃና',
      'ተመጣጣኝ ቅመም',
      'ጨው በዝቷል',
      'ትኩስ መሆን ነበረበት',
      'ተጨማሪ ቅመም ይፈልጋል',
    ],
    removePhoto: 'ፎቶ አስወግድ',
    uploadPhoto: 'ፎቶ ጫን',

    noActiveOffers: 'በአሁኑ ሰዓት ምንም ንቁ ቅናሽ የለም',
    noActiveOffersHint: 'ለሚመጡ ልዩ ቅናሾች እና የደስታ ሰዓታት በቅርቡ ይመለሱ',
    noFavoritesSaved: 'እስካሁን ምንም የተወደዱ ምግቦች አልተቀመጡም',
    noMatchingDishes: 'ምንም ተዛማጅ ምግብ አልተገኘም',
    adjustFilterHint: 'ፍለጋዎን ይቀይሩ ወይም ማጣሪያዎችን ያጽዱ',
    resetFilters: 'ማጣሪያዎችን አጽዳ',
    resultsCount: 'የፍለጋ ውጤቶች',
    dishesOnOfferCount: 'በቅናሽ ላይ ያሉ ምግቦች',

    serviceAssistanceTitle: 'የአስተናጋጅ ድጋፍ',
    serviceAssistanceDesc: 'አስተናጋጅ ለመጥራት ከታች ካሉት ይምረጡ፦',
    callWaiterTitle: 'አስተናጋጅ ጥራ',
    callWaiterDesc: 'ለጥያቄዎች ወይም ለምክር እገዛ ይፈልጋሉ',
    requestWaterTitle: 'የውሃ መጠጥ ሙላ',
    requestWaterDesc: 'የሚጣፍጥ ንጹህ ውሃ',
    extraCutleryTitle: 'ተጨማሪ ሹካና ማንኪያ / ሶፍት',
    extraCutleryDesc: 'ንጹህ ሹካ፣ ማንኪያ ወይም የወረቀት ሶፍት',
    requestBillTitle: 'ሒሳብ ጥራ',
    requestBillDesc: 'የተመገቡትን ክፍያ ለመፈጸም',

    serverSummaryTitle: 'የአስተናጋጅ ማጠቃለያ',
    dineInSeating: 'የትዕዛዝ ማጠቃለያ',
    totalItemsLabel: 'ጠቅላላ የምግብ ብዛት',
    noteLabel: 'ማስታወሻ',

    tableQrTitle: 'የዲጂታል ሜኑ QR',
    tableQrDesc: 'በስልክዎ ካሜራ በመቃኘት በቀጥታ ዲጂታል ሜኑውን ይክፈቱ፦',
    menuQrTitle: 'የዲጂታል ሜኑ QR',
    menuQrDesc: 'በስልክዎ ካሜራ በመቃኘት በቀጥታ ዲጂታል ሜኑውን ይክፈቱ፦',
    copyMenuLink: 'የሜኑ ሊንክ ገልብጥ',
    linkCopied: 'ሊንኩ ተገልብጧል!',
  },

  es: {
    openNow: 'Abierto ahora • Para comer aquí',
    closed: 'Cerrado',
    table: 'Mesa',
    wifi: 'Wi-Fi',
    wifiCopied: 'Información de Wi-Fi copiada',
    searchPlaceholder: 'Buscar platos, ingredientes o alérgenos...',
    allCategories: 'Todas las categorías',
    browseCategories: 'Directorio del menú',
    nextCategory: 'Siguiente categoría',
    endOfCategory: 'Fin de',
    viewCategory: 'Ver platos',
    backToTop: 'Volver arriba',

    filterAll: 'Todos',
    filterOnOffer: 'En oferta',
    filterChefsPick: 'Selección del chef',
    filterFasting: 'Ayuno (Tsom)',
    filterVegetarian: 'Vegetariano',
    filterVegan: 'Vegano',
    filterGlutenFree: 'Sin gluten',
    filterHalal: 'Halal',
    filterSpicy: 'Picante',

    sortLabel: 'Ordenar',
    sortFeatured: 'Destacados y populares',
    sortPriceAsc: 'Precio: de menor a mayor',
    sortPriceDesc: 'Precio: de mayor a menor',
    sortNameAsc: 'Nombre: A a Z',

    addToOrder: 'Añadir al pedido',
    soldOut: 'Agotado hoy',
    chefsPick: 'Selección del chef',
    specialOffer: 'Oferta especial',
    saveAmount: 'Ahorra',
    customizations: 'Personalizaciones y extras',
    goesWellWith: 'Combina bien con',
    authenticPairing: 'Maridaje auténtico',
    spiceLevel: 'Nivel de picante',
    spiceNone: 'Suave / Ninguno',
    dietary: 'Dietético',
    guestReviews: 'Opiniones de clientes',
    guestReviewsSubtitle: 'Comentarios honestos de comensales recientes',
    reviewsCount: 'calificaciones verificadas',
    rateThisDish: 'Califica este plato',
    noReviewsYet: 'Aún no hay opiniones sobre este plato. ¡Sé el primero!',
    newDish: 'Plato nuevo',
    beFirstToReview: 'Sé el primero en opinar',
    reportReview: 'Reportar',
    specialInstructions: 'Instrucciones especiales',
    specialInstructionsPlaceholder: 'p. ej. Servilletas extras, salsa aparte...',
    pairingTitle: 'Combina bien',
    addPairingBtn: '+ Añadir',
    verifiedDiner: 'Comensal verificado',

    reviewModalTitle: 'Calificación rápida del plato',
    reviewModalSubtitle: 'Opinión honesta en menos de 15 segundos. Sin registrarse.',
    quickTagsTitle: 'Etiquetas rápidas',
    quickTagsOptional: '(Opcional, toca para seleccionar)',
    commentLabel: 'Comentario',
    commentOptional: '(Opcional)',
    commentPlaceholder: '¿Qué hizo memorable este plato? (Sé honesto y útil)',
    dishPhotoLabel: 'Foto del plato',
    dishPhotoOptional: '(Opcional, máx 4MB)',
    submitReview: 'Enviar opinión honesta',
    submittingReview: 'Enviando...',
    thankYouReviewTitle: '¡Gracias por tu opinión!',
    thankYouReviewDesc: 'Tu comentario honesto ayuda a nuestro equipo de cocina a mantener la máxima calidad.',
    done: 'Listo',
    alreadyReviewedMsg: 'Ya has calificado este plato',

    reportTitle: 'Moderar opinión',
    reportSubtitle: '¿Por qué deseas reportar esta opinión?',
    reportReasonSpam: 'Spam o publicidad',
    reportReasonAbuse: 'Lenguaje ofensivo o inapropiado',
    reportReasonPii: 'Información personal (teléfono, correo)',
    reportReasonOther: 'Otro motivo',
    cancel: 'Cancelar',
    submitReport: 'Enviar reporte',
    reportThanks: 'Gracias por reportar. Nuestro equipo revisará el comentario.',

    reviewOrder: 'Revisar mi pedido',
    myOrder: 'Mi pedido',
    itemsSubtotal: 'Subtotal de platos',
    totalSavings: 'Ahorro total en ofertas',
    taxLabel: 'Impuestos (IVA)',
    taxIncluded: 'Incluido en precios del menú',
    total: 'Total a pagar',
    showToWaiter: 'Mostrar pedido al mesero',
    clearAll: 'Borrar todo',
    emptyOrder: 'Tu pedido está vacío',
    emptyOrderHint: 'Toca los platos del menú para añadirlos a tu pedido',
    addedToOrder: 'Añadido a tu pedido',
    freeGiftLabel: 'Regalo gratis',

    offlineNotice: 'Estás sin conexión. Mostrando menú guardado y pedido offline',
    offlineBadge: 'Modo sin conexión',
    comingSoonCalling: 'La llamada digital al mesero estará disponible pronto. ¡Por favor avisa a tu mesero en persona!',
    waiterAssistance: 'Pedir ayuda',
    tableQr: 'QR del menú',
    menuQr: 'QR del menú',
    shareMenu: 'Compartir menú',
    staffOwnerPortal: 'Portal del personal y propietario',
    installAppTitle: 'Instalar App de Nitsuh Cafe & Restaurant',
    installAppDesc: 'Acceso instantáneo y pedidos sin conexión',
    installAppBtn: 'Instalar',
    notNowBtn: 'Ahora no',

    settingsTitle: 'Pantalla y preferencias',
    settingsDesc: 'Personaliza tu vista del menú digital.',
    languageLabel: 'Idioma',
    appearanceLabel: 'Apariencia',
    lightMode: 'Claro',
    darkMode: 'Oscuro',
    autoMode: 'Automático',
    themesLabel: 'Temas de ambiente',
    themeModernMinimal: 'Mínimo moderno',
    themeClassicElegance: 'Elegancia clásica',
    themeBoldDark: 'Oscuro audaz',
    themeWarmRustic: 'Rústico cálido',
    tableNumberLabel: 'Número de pedido',
    guestWifiLabel: 'Wi-Fi de clientes',

    starRatingLabels: ['', 'Necesita mejorar', 'Aceptable', 'Bueno', 'Muy bueno', '¡Excepcional!'],
    defaultReviewTags: [
      'Gran porción',
      'Pediría de nuevo',
      'Ingredientes frescos',
      'Textura crujiente',
      'Picante perfecto',
      'Muy salado',
      'Podría estar más caliente',
      'Falta sazón',
    ],
    removePhoto: 'Eliminar foto',
    uploadPhoto: 'Subir una foto',

    noActiveOffers: 'No hay ofertas activas en este momento',
    noActiveOffersHint: 'Vuelve pronto para consultar próximas promociones',
    noFavoritesSaved: 'Aún no has guardado platos favoritos',
    noMatchingDishes: 'No se encontraron platos que coincidan',
    adjustFilterHint: 'Prueba ajustando tu búsqueda o limpiando los filtros',
    resetFilters: 'Restablecer filtros',
    resultsCount: 'Resultados',
    dishesOnOfferCount: 'Platos en oferta',

    serviceAssistanceTitle: 'Asistencia del Camarero',
    serviceAssistanceDesc: 'Toca una opción para alertar de inmediato a tu camarero',
    callWaiterTitle: 'Llamar Camarero',
    callWaiterDesc: 'Ayuda con recomendaciones o preguntas',
    requestWaterTitle: 'Solicitar Agua',
    requestWaterDesc: 'Agua mineral o natural',
    extraCutleryTitle: 'Cubiertos / Servilletas Extra',
    extraCutleryDesc: 'Tenedores, cuchillos, cucharas o servilletas',
    requestBillTitle: 'Pedir la Cuenta',
    requestBillDesc: 'Listo para pagar tu consumo',

    serverSummaryTitle: 'RESUMEN PARA CAMARERO',
    dineInSeating: 'Resumen del Pedido',
    totalItemsLabel: 'Total de Artículos',
    noteLabel: 'Nota',

    tableQrTitle: 'Código QR del Menú',
    tableQrDesc: 'Escanea con la cámara para cargar el menú digital de',
    menuQrTitle: 'Código QR del Menú Digital',
    menuQrDesc: 'Escanea con cualquier teléfono para ver el menú digital de',
    copyMenuLink: 'Copiar Enlace Directo',
    linkCopied: '¡Enlace copiado!',
  },
};

export const CATEGORY_TRANSLATIONS: Record<string, Partial<Record<Language, CategoryTranslation>>> = {
  'cat-breakfast': {
    en: { name: 'Breakfast (ቁርስ)', description: 'Traditional breakfast platters, foul, fetira, chechebsa, eggs and morning toasts.' },
    am: { name: 'ቁርስ', description: 'ትኩስ ፉል፣ ፈጢራ፣ ጨጨብሳ፣ እንቁላል እና የጠዋት ቶስቶች።' },
  },
  'cat-burger': {
    en: { name: 'Burgers (በርገር)', description: 'Handcrafted gourmet burgers, beef patties, chicken burgers and seasoned fries.' },
    am: { name: 'በርገር', description: 'በጥንቃቄ የተዘጋጁ ድርብ የበሬ ስጋ እና የዶሮ በርገሮች ከፍሬንች ፍራይስ ጋር።' },
  },
  'cat-pizza': {
    en: { name: 'Pizzas (ፒዛ)', description: 'Crispy crust pizzas baked with rich tomato sauce, melted mozzarella and fresh toppings.' },
    am: { name: 'ፒዛ', description: 'በትኩስ የቲማቲም ሶስ፣ ሞዛሬላ ቺዝ እና ምርጥ ቅመሞች የተጋገሩ ፒዛዎች።' },
  },
  'cat-club-sandwich': {
    en: { name: 'Club Sandwich (ክለብ ሳንድዊች)', description: 'Layered triple-decker club sandwiches, chicken, tuna, steak and avocado.' },
    am: { name: 'ክለብ ሳንድዊች', description: 'ባለሶስት ድርብ ክለብ ሳንድዊቾች፡ በዶሮ፣ ቱና፣ ስቴክ እና አቮካዶ።' },
  },
  'cat-wrap': {
    en: { name: 'Wraps (ራፕ)', description: 'Rolled warm tortilla wraps filled with tender meats, cheese and house sauces.' },
    am: { name: 'ራፕ', description: 'በጥንቃቄ የተጠቀለሉ ስስ ቶርቲላ ራፖች በስጋ፣ ቺዝ እና ልዩ ሶስ።' },
  },
  'cat-chicken': {
    en: { name: 'Chicken (ዶሮ)', description: 'Crispy fried chicken legs, golden nuggets, strips, wings and honey BBQ platters.' },
    am: { name: 'ዶሮ', description: 'የተጠበሰ ጥርት ያለ የዶሮ እግር፣ ዊንግስ በሃኒ BBQ፣ ናጌትስ እና ስትሪፕስ።' },
  },
  'cat-salad': {
    en: { name: 'Salad (ሰላጣ)', description: 'Crisp garden salads, tuna, chicken, avocado and fasting dressings.' },
    am: { name: 'ሰላጣ', description: 'ትኩስ የተፈጥሮ ሰላጣዎች፡ ቱና፣ ዶሮ፣ አቮካዶ እና የጾም ድሬሲንግ።' },
  },
  'cat-pasta': {
    en: { name: 'Pasta (ፓስታ)', description: 'Italian style pasta bowls: tomato, Alfredo, creamy chicken, arrabbiata and pesto.' },
    am: { name: 'ፓስታ', description: 'ጣፋጭ ፓስታዎች፡ ቲማቲም፣ አልፍሬዶ፣ ክሬሚ ዶሮ፣ አራቢያታ እና ፔስቶ።' },
  },
  'cat-mojito': {
    en: { name: 'Mojitos (ሞሂቶ)', description: 'Refreshing iced fruit mojitos, mint, lemon, pineapple, watermelon and strawberry.' },
    am: { name: 'ሞሂቶ', description: 'ቀዝቃዛ መንፈስ የሚያድሱ የፍራፍሬ ሞሂቶዎች፡ ሚንት፣ ሎሚ፣ አናናስ፣ ሀብሀብ እና እንጆሪ።' },
  },
  'cat-soft-drinks': {
    en: { name: 'Soft Drinks & Water (ለስላሳ መጠጦች እና ውሃ)', description: 'Chilled bottled and canned soft drinks, Novida, mineral water and Ambo water.' },
    am: { name: 'ለስላሳ መጠጦች እና ውሃ', description: 'ቀዝቃዛ የታሸጉ ለስላሳ መጠጦች፣ ኖቪዳ፣ አምቦ ውሃ እና የታሸገ ውሃ።' },
  },
  'cat-juices': {
    en: { name: 'Fresh Juices (ትኩስ ጭማቂዎች)', description: '100% freshly pressed juices: avocado, mango, papaya, watermelon, strawberry.' },
    am: { name: 'ትኩስ ጭማቂዎች', description: '100% የተፈጥሮ ፍራፍሬ ጭማቂዎች፡ አቮካዶ፣ ማንጎ፣ ፓፓያ፣ ሀብሀብ፣ እንጆሪ እና ስፕሪስ።' },
  },
  'cat-shakes': {
    en: { name: 'Shakes (ሼክ)', description: 'Creamy thick milkshakes: banana, strawberry, mocha, avocado, flaxseed and protein.' },
    am: { name: 'ሼክ', description: 'ወፍራም ጣፋጭ ሼኮች፡ ሙዝ፣ እንጆሪ፣ ሞካ፣ ተልባ እና ፕሮቲን ሼክ።' },
  },
  'cat-hot-drinks': {
    en: { name: 'Hot Drinks (ትኩስ መጠጦች)', description: 'Single-origin Ethiopian coffee, macchiato, espresso, teas, and specialty lattes.' },
    am: { name: 'ትኩስ መጠጦች', description: 'የሀበሻ ቡና፣ ማኪያቶ፣ ኤስፕሬሶ፣ ልዩ ቅመም ሻይ፣ ካራሜል ላቴ እና ትኩስ ቸኮሌት።' },
  },
  'cat-iced-drinks': {
    en: { name: 'Iced Drinks (ቀዝቃዛ መጠጦች)', description: 'Chilled iced latte, iced tea, vanilla, caramel, strawberry and deluxe iced coffee.' },
    am: { name: 'ቀዝቃዛ መጠጦች', description: 'አይስ ላቴ፣ አይስ ሻይ፣ አይስ ቫኒላ፣ አይስ ካራሜል እና አይስ ዲሉክስ።' },
  },
  'cat-desserts': {
    en: { name: 'Desserts & Pastries (ጣፋጮች እና ኬኮች)', description: 'Freshly baked mini cakes, custard vanilla, donuts, croissants and cookies.' },
    am: { name: 'ጣፋጮች እና ኬኮች', description: 'ትኩስ ሚኒ ቫኒላ ኬክ፣ ቸኮሌት ኬክ፣ ታርት፣ ዶናት፣ ክሮሳንት እና ኩኪስ።' },
  },
  'cat-desserts-kg': {
    en: { name: 'Torta & Cakes (Per KG) (ኬክ በኪሎ)', description: 'Celebration tortas and whole cakes sold by the kilogram for events and gatherings.' },
    am: { name: 'ኬክ በኪሎ', description: 'ለልደት እና ልዩ ፕሮግራሞች የሚሆኑ ቶርታ ኬኮች በኪሎ፡ ቫኒላ፣ ቸኮሌት፣ ቲራሚሱ።' },
  },
};
