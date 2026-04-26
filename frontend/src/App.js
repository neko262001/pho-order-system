import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "https://pho-order-system.onrender.com";

const UI = {
  vi: {
    table: "Bàn",
    takeaway: "Mang về",
    scanQr: "Vui lòng quét QR tại bàn để đặt món.",
    search: "Tìm món...",
    featured: "Món nổi bật",
    menu: "Thực đơn",
    all: "Tất cả",
    add: "Thêm món",
    soldOut: "Tạm hết",
    cart: "Đơn của bàn",
    empty: "Chưa có món nào",
    total: "Tổng cộng",
    clear: "Xóa giỏ",
    order: "Đặt món",
    checkout: "Thanh toán & yêu cầu",
    note: "Ghi chú cho quán",
    notePlaceholder: "Ví dụ: ít cay, nhiều nước, trẻ em ăn...",
    noCoriander: "Không rau mùi",
    noGreenOnion: "Không hành",
    noPepper: "Không tiêu",
    noOnion: "Không hành tây",
    staffTitle: "Gọi nhân viên",
    staffPlaceholder: "Ví dụ: cho xin thêm chén, muỗng, nước lọc...",
    sendStaff: "Gửi yêu cầu",
    success: "Đặt món thành công!",
    fail: "Lỗi đặt món!",
    backendError: "Không kết nối server!",
    optionPho: "Chọn thịt",
    rare: "Tái",
    wellDone: "Chín",
    rareCooked: "Tái + chín",
    rareBrisket: "Tái + nạm",
    cookedBrisket: "Chín + nạm",
    spicyRice: "Cơm cay?",
    spicyLevel: "Cay hay không cay",
    spicy: "Cay",
    notSpicy: "Không cay",
    addons: "Thêm món kèm",
    quickAdd: "Thêm nhanh gần thanh toán",
    extraRice: "Thêm cơm",
    extraNoodle: "Thêm mỳ",
    extraMeat: "Thêm thịt",
    extraShrimp: "Thêm tôm",
    itemNote: "Ghi chú riêng cho món này",
    confirmAdd: "Thêm vào giỏ",
    cancel: "Hủy",
    qty: "Số lượng"
  },
  zh: {
    table: "桌號",
    takeaway: "外帶",
    scanQr: "請掃描桌上的 QR Code 才能點餐。",
    search: "搜尋餐點...",
    featured: "推薦餐點",
    menu: "菜單",
    all: "全部",
    add: "加入餐點",
    soldOut: "暫時沒有",
    cart: "本桌訂單",
    empty: "尚未選擇餐點",
    total: "總計",
    clear: "清空",
    order: "送出訂單",
    checkout: "結帳與需求",
    note: "給店家的備註",
    notePlaceholder: "例如：小辣、多湯、給小孩吃...",
    noCoriander: "不要香菜",
    noGreenOnion: "不要蔥",
    noPepper: "不要胡椒",
    noOnion: "不要洋蔥",
    staffTitle: "呼叫店員",
    staffPlaceholder: "例如：請給我碗、餐具、水...",
    sendStaff: "送出需求",
    success: "點餐成功！",
    fail: "下單失敗！",
    backendError: "無法連接伺服器！",
    optionPho: "選擇牛肉熟度",
    rare: "生",
    wellDone: "熟",
    rareCooked: "生熟綜合",
    rareBrisket: "生牛肉 + 牛腩",
    cookedBrisket: "熟牛肉 + 牛腩",
    spicyRice: "飯要辣嗎？",
    spicyLevel: "辣或不辣",
    spicy: "辣",
    notSpicy: "不辣",
    addons: "加點",
    quickAdd: "結帳區快速加點",
    extraRice: "加飯",
    extraNoodle: "加麵",
    extraMeat: "加肉",
    extraShrimp: "加蝦",
    itemNote: "此餐點備註",
    confirmAdd: "加入購物車",
    cancel: "取消",
    qty: "數量"
  },
  en: {
    table: "Table",
    takeaway: "Takeaway",
    scanQr: "Please scan the table QR code to order.",
    search: "Search items...",
    featured: "Featured",
    menu: "Menu",
    all: "All",
    add: "Add item",
    soldOut: "Sold out",
    cart: "Table Order",
    empty: "No items yet",
    total: "Total",
    clear: "Clear",
    order: "Place Order",
    checkout: "Checkout & Requests",
    note: "Note for restaurant",
    notePlaceholder: "Example: less spicy, more soup, for kids...",
    noCoriander: "No coriander",
    noGreenOnion: "No green onion",
    noPepper: "No pepper",
    noOnion: "No onion",
    staffTitle: "Call Staff",
    staffPlaceholder: "Example: extra bowl, spoon, water...",
    sendStaff: "Send Request",
    success: "Order placed successfully!",
    fail: "Order failed!",
    backendError: "Cannot connect to server!",
    optionPho: "Choose beef type",
    rare: "Rare",
    wellDone: "Well done",
    rareCooked: "Rare + well done",
    rareBrisket: "Rare + brisket",
    cookedBrisket: "Cooked + brisket",
    spicyRice: "Spicy rice?",
    spicyLevel: "Spicy or not",
    spicy: "Spicy",
    notSpicy: "Not spicy",
    addons: "Add-ons",
    quickAdd: "Quick add-ons near checkout",
    extraRice: "Extra rice",
    extraNoodle: "Extra noodle",
    extraMeat: "Extra meat",
    extraShrimp: "Extra shrimp",
    itemNote: "Note for this item",
    confirmAdd: "Add to cart",
    cancel: "Cancel",
    qty: "Quantity"
  }
};

const FALLBACK_SETTINGS = {
  logoTitle: "Goka phở & mỳ cay",
  subtitle_vi: "Đặt món nhanh chóng - giao diện đa ngôn ngữ",
  subtitle_zh: "快速點餐 - 多語言介面",
  subtitle_en: "Fast ordering - multilingual interface"
};

const FALLBACK_CATEGORIES = [
  { id: "spicy_hotpot", vi: "Mỳ cay", zh: "越式部隊鍋", en: "Vietnamese Spicy Hot Pot", sort: 1, sortOrder: 1 },
  { id: "pho", vi: "Phở", zh: "河粉", en: "Pho", sort: 2, sortOrder: 2 },
  { id: "rice_soup_noodle", vi: "Cơm & canh & mỳ xào", zh: "飯・湯・炒麵", en: "Rice, Soup & Stir-fried Noodles", sort: 3, sortOrder: 3 },
  { id: "fruit_tea", vi: "Trà trái cây", zh: "果茶", en: "Fruit Tea", sort: 4, sortOrder: 4 },
  { id: "drinks", vi: "Đồ uống", zh: "飲品", en: "Drinks", sort: 5, sortOrder: 5 },
  { id: "fried", vi: "Đồ rán", zh: "炸物", en: "Fried Snacks", sort: 6, sortOrder: 6 },
  { id: "vietnamese_fried", vi: "Đồ rán Việt Nam", zh: "越式炸物", en: "Vietnamese Fried Food", sort: 7, sortOrder: 7 }
];

const FALLBACK_ADDONS = {
  pho: [
    { id: "extra_pho_noodle", name_vi: "Thêm bánh phở", name_zh: "加河粉", name_en: "Extra pho noodles", price: 20, active: true },
    { id: "extra_beef", name_vi: "Thêm thịt", name_zh: "加肉", name_en: "Extra meat", price: 70, active: true }
  ],
  rice: [
    { id: "extra_rice", name_vi: "Thêm cơm", name_zh: "加飯", name_en: "Extra rice", price: 20, active: true },
    { id: "extra_egg", name_vi: "Thêm trứng", name_zh: "加蛋", name_en: "Extra egg", price: 20, active: true }
  ],
  spicy_hotpot: [
    { id: "extra_noodle", name_vi: "Thêm mỳ", name_zh: "加麵", name_en: "Extra noodle", price: 20, active: true },
    { id: "extra_meat", name_vi: "Thêm thịt", name_zh: "加肉", name_en: "Extra meat", price: 70, active: true },
    { id: "extra_shrimp", name_vi: "Thêm tôm", name_zh: "加蝦", name_en: "Extra shrimp", price: 60, active: true }
  ],
  quick: [
    { id: "quick_extra_rice", name_vi: "Thêm cơm", name_zh: "加飯", name_en: "Extra rice", price: 20, active: true },
    { id: "quick_extra_noodle", name_vi: "Thêm mỳ", name_zh: "加麵", name_en: "Extra noodle", price: 20, active: true },
    { id: "quick_extra_meat", name_vi: "Thêm thịt", name_zh: "加肉", name_en: "Extra meat", price: 70, active: true },
    { id: "quick_extra_shrimp", name_vi: "Thêm tôm", name_zh: "加蝦", name_en: "Extra shrimp", price: 60, active: true }
  ]
};

const FALLBACK_MENU = [
  {
    id: "spicy_deluxe",
    category: "spicy_hotpot",
    name_vi: "Mỳ cay thập cẩm",
    name_zh: "豪華部隊鍋",
    name_en: "Deluxe Spicy Hot Pot",
    description_vi: "Hải sản + thịt + sò điệp",
    description_zh: "海鮮 + 肉 + 扇貝",
    description_en: "Seafood + meat + scallop",
    price: 210,
    featured: true,
    available: true,
    sortOrder: 1,
    image: "",
    optionType: "spicy",
    addonsPreset: "spicy_hotpot"
  },
  {
    id: "spicy_seafood",
    category: "spicy_hotpot",
    name_vi: "Mỳ cay hải sản",
    name_zh: "海鮮部隊鍋",
    name_en: "Seafood Spicy Hot Pot",
    description_vi: "Mực, 2 con tôm, bắp cải tím, xúc xích, cá viên, bò viên, bánh gạo, nấm kim châm, bông cải, kimchi",
    description_zh: "花枝、2隻蝦、紫色甘藍、熱狗3片、魚丸1、貢丸2-3片、年糕2、金針菇、花椰菜1、泡菜",
    description_en: "Squid, 2 shrimp, purple cabbage, sausage, fish ball, meatballs, rice cakes, enoki mushroom, broccoli, kimchi",
    price: 170,
    featured: true,
    available: true,
    sortOrder: 2,
    image: "",
    optionType: "spicy",
    addonsPreset: "spicy_hotpot"
  },
  {
    id: "spicy_pork",
    category: "spicy_hotpot",
    name_vi: "Mỳ cay heo",
    name_zh: "豬肉部隊鍋",
    name_en: "Pork Spicy Hot Pot",
    description_vi: "Heo lát, bắp cải tím, xúc xích, cá viên, bò viên, bánh gạo, nấm kim châm, bông cải, kimchi",
    description_zh: "豬肉片4、紫色甘藍、熱狗3片、魚丸1、貢丸2-3片、年糕2、金針菇、花椰菜1、泡菜",
    description_en: "Pork slices, purple cabbage, sausage, fish ball, meatballs, rice cakes, enoki mushroom, broccoli, kimchi",
    price: 150,
    featured: false,
    available: true,
    sortOrder: 3,
    image: "",
    optionType: "spicy",
    addonsPreset: "spicy_hotpot"
  },
  {
    id: "spicy_beef",
    category: "spicy_hotpot",
    name_vi: "Mỳ cay bò",
    name_zh: "牛肉部隊鍋",
    name_en: "Beef Spicy Hot Pot",
    description_vi: "Mỳ cay bò kiểu Việt",
    description_zh: "越式牛肉部隊鍋",
    description_en: "Vietnamese-style beef spicy hot pot",
    price: 150,
    featured: false,
    available: true,
    sortOrder: 4,
    image: "",
    optionType: "spicy",
    addonsPreset: "spicy_hotpot"
  },
  {
    id: "pho_beef_rare",
    category: "pho",
    name_vi: "Phở bò tái",
    name_zh: "手沖牛肉河粉",
    name_en: "Rare Beef Pho",
    description_vi: "Phở bò tái nước dùng kiểu Việt",
    description_zh: "越式手沖牛肉河粉",
    description_en: "Vietnamese pho with rare beef",
    price: 150,
    featured: true,
    available: true,
    sortOrder: 10,
    image: "",
    optionType: "pho",
    addonsPreset: "pho"
  },
  {
    id: "pho_chicken",
    category: "pho",
    name_vi: "Phở gà",
    name_zh: "雞肉河粉",
    name_en: "Chicken Pho",
    description_vi: "Phở gà nước dùng thanh",
    description_zh: "雞肉河粉",
    description_en: "Chicken pho",
    price: 150,
    featured: false,
    available: true,
    sortOrder: 11,
    image: "",
    optionType: "",
    addonsPreset: "pho"
  },
  {
    id: "pho_beef_combo",
    category: "pho",
    name_vi: "Phở bò tổng hợp",
    name_zh: "綜合牛肉河粉",
    name_en: "Mixed Beef Pho",
    description_vi: "Phở bò tổng hợp",
    description_zh: "綜合牛肉河粉",
    description_en: "Mixed beef pho",
    price: 200,
    featured: true,
    available: true,
    sortOrder: 12,
    image: "",
    optionType: "pho_combo",
    addonsPreset: "pho"
  },
  {
    id: "pho_beef_brisket",
    category: "pho",
    name_vi: "Phở bò tái + nạm",
    name_zh: "手沖牛肉+牛腩河粉",
    name_en: "Rare Beef & Brisket Pho",
    description_vi: "Phở bò tái kết hợp nạm",
    description_zh: "手沖牛肉加牛腩河粉",
    description_en: "Rare beef pho with brisket",
    price: 150,
    featured: false,
    available: true,
    sortOrder: 13,
    image: "",
    optionType: "pho_brisket",
    addonsPreset: "pho"
  },
  {
    id: "rice_pickle_beef",
    category: "rice_soup_noodle",
    name_vi: "Cơm rang dưa bò",
    name_zh: "酸菜牛肉炒飯",
    name_en: "Beef Pickled Mustard Fried Rice",
    description_vi: "Cơm rang dưa bò",
    description_zh: "酸菜牛肉炒飯",
    description_en: "Fried rice with beef and pickled mustard",
    price: 120,
    featured: false,
    available: true,
    sortOrder: 20,
    image: "",
    optionType: "rice",
    addonsPreset: "rice"
  },
  {
    id: "rice_pork_chop",
    category: "rice_soup_noodle",
    name_vi: "Cơm sườn",
    name_zh: "排骨飯",
    name_en: "Pork Chop Rice",
    description_vi: "Cơm sườn",
    description_zh: "排骨飯",
    description_en: "Rice with pork chop",
    price: 120,
    featured: false,
    available: true,
    sortOrder: 21,
    image: "",
    optionType: "rice",
    addonsPreset: "rice"
  },
  {
    id: "soup_beef_ball",
    category: "rice_soup_noodle",
    name_vi: "Canh bò viên",
    name_zh: "牛肉丸湯",
    name_en: "Beef Ball Soup",
    description_vi: "Canh bò viên",
    description_zh: "牛肉丸湯",
    description_en: "Beef ball soup",
    price: 60,
    featured: false,
    available: true,
    sortOrder: 22,
    image: "",
    optionType: "",
    addonsPreset: ""
  },
  {
    id: "soup_beef_rib",
    category: "rice_soup_noodle",
    name_vi: "Canh sườn bò",
    name_zh: "牛排骨湯",
    name_en: "Beef Rib Soup",
    description_vi: "Canh sườn bò",
    description_zh: "牛排骨湯",
    description_en: "Beef rib soup",
    price: 60,
    featured: false,
    available: true,
    sortOrder: 23,
    image: "",
    optionType: "",
    addonsPreset: ""
  },
  { id: "tea_longan", category: "fruit_tea", name_vi: "Trà nhãn", name_zh: "龍眼果茶", name_en: "Longan Fruit Tea", description_vi: "Trà trái cây vị nhãn", description_zh: "龍眼果茶", description_en: "Longan fruit tea", price: 75, featured: false, available: true, sortOrder: 30, image: "", optionType: "", addonsPreset: "" },
  { id: "tea_guava", category: "fruit_tea", name_vi: "Trà ổi", name_zh: "芭樂果茶", name_en: "Guava Fruit Tea", description_vi: "Trà ổi", description_zh: "芭樂果茶", description_en: "Guava fruit tea", price: 80, featured: false, available: true, sortOrder: 31, image: "", optionType: "", addonsPreset: "" },
  { id: "tea_melon", category: "fruit_tea", name_vi: "Trà dưa lưới", name_zh: "哈密瓜果茶", name_en: "Melon Fruit Tea", description_vi: "Trà dưa lưới", description_zh: "哈密瓜果茶", description_en: "Melon fruit tea", price: 90, featured: false, available: true, sortOrder: 32, image: "", optionType: "", addonsPreset: "" },
  { id: "tea_strawberry", category: "fruit_tea", name_vi: "Trà dâu tây theo mùa", name_zh: "草莓果茶", name_en: "Seasonal Strawberry Fruit Tea", description_vi: "Theo mùa", description_zh: "季節限定", description_en: "Seasonal", price: 100, featured: false, available: true, sortOrder: 33, image: "", optionType: "", addonsPreset: "" },
  { id: "tea_mango_passion", category: "fruit_tea", name_vi: "Trà xoài chanh dây", name_zh: "百香芒芒果茶", name_en: "Mango Passion Fruit Tea", description_vi: "Xoài + chanh dây", description_zh: "芒果百香果茶", description_en: "Mango and passion fruit tea", price: 75, featured: false, available: true, sortOrder: 34, image: "", optionType: "", addonsPreset: "" },
  { id: "tea_peach", category: "fruit_tea", name_vi: "Trà đào", name_zh: "水蜜桃果茶", name_en: "Peach Fruit Tea", description_vi: "Trà đào", description_zh: "水蜜桃果茶", description_en: "Peach fruit tea", price: 75, featured: false, available: true, sortOrder: 35, image: "", optionType: "", addonsPreset: "" },
  { id: "tea_tropical", category: "fruit_tea", name_vi: "Trà trái cây nhiệt đới", name_zh: "綜合水果茶", name_en: "Tropical Mixed Fruit Tea", description_vi: "Trà trái cây tổng hợp", description_zh: "綜合水果茶", description_en: "Mixed tropical fruit tea", price: 75, featured: false, available: true, sortOrder: 36, image: "", optionType: "", addonsPreset: "" },
  { id: "drink_cocoa_milk", category: "drinks", name_vi: "Ca cao sữa", name_zh: "可可牛奶", name_en: "Cocoa Milk", description_vi: "Ca cao sữa", description_zh: "可可牛奶", description_en: "Cocoa milk", price: 65, featured: false, available: true, sortOrder: 40, image: "", optionType: "", addonsPreset: "" },
  { id: "drink_taro_milk", category: "drinks", name_vi: "Trà sữa khoai môn", name_zh: "芋香牛奶", name_en: "Taro Milk Tea", description_vi: "Trà sữa khoai môn", description_zh: "芋香牛奶", description_en: "Taro milk tea", price: 65, featured: false, available: true, sortOrder: 41, image: "", optionType: "", addonsPreset: "" },
  { id: "drink_americano", category: "drinks", name_vi: "Americano", name_zh: "經典美式", name_en: "Americano", description_vi: "Cà phê Americano", description_zh: "經典美式咖啡", description_en: "Classic Americano", price: 50, featured: false, available: true, sortOrder: 42, image: "", optionType: "", addonsPreset: "" },
  { id: "drink_black_coffee", category: "drinks", name_vi: "Cà phê nguyên chất", name_zh: "特濃", name_en: "Strong Black Coffee", description_vi: "Cà phê nguyên chất", description_zh: "特濃咖啡", description_en: "Strong coffee", price: 50, featured: false, available: true, sortOrder: 43, image: "", optionType: "", addonsPreset: "" },
  { id: "drink_latte", category: "drinks", name_vi: "Latte", name_zh: "拿鐵", name_en: "Latte", description_vi: "Latte", description_zh: "拿鐵", description_en: "Latte", price: 65, featured: false, available: true, sortOrder: 44, image: "", optionType: "", addonsPreset: "" },
  { id: "drink_vn_milk_coffee", category: "drinks", name_vi: "Cà phê sữa Việt Nam", name_zh: "越式煉乳咖啡", name_en: "Vietnamese Condensed Milk Coffee", description_vi: "Cà phê sữa", description_zh: "越式煉乳咖啡", description_en: "Vietnamese milk coffee", price: 65, featured: false, available: true, sortOrder: 45, image: "", optionType: "", addonsPreset: "" },
  { id: "drink_salt_coffee", category: "drinks", name_vi: "Cà phê muối", name_zh: "鹹咖啡", name_en: "Salt Coffee", description_vi: "Cà phê muối", description_zh: "鹹咖啡", description_en: "Salt coffee", price: 80, featured: false, available: true, sortOrder: 46, image: "", optionType: "", addonsPreset: "" },
  { id: "fried_combo", category: "fried", name_vi: "Combo đồ rán", name_zh: "炸物拼盤", name_en: "Fried Combo Platter", description_vi: "Combo đồ rán tổng hợp", description_zh: "炸物拼盤", description_en: "Mixed fried platter", price: 200, featured: false, available: true, sortOrder: 50, image: "", optionType: "", addonsPreset: "" },
  { id: "fried_qq", category: "fried", name_vi: "QQ棒", name_zh: "QQ棒", name_en: "QQ Stick", description_vi: "QQ棒 này ngon nè", description_zh: "QQ棒", description_en: "QQ stick snack", price: 50, featured: false, available: true, sortOrder: 51, image: "", optionType: "", addonsPreset: "" },
  { id: "fried_tempura", category: "fried", name_vi: "Tempura", name_zh: "甜不辣", name_en: "Tempura", description_vi: "Tempura chiên", description_zh: "甜不辣", description_en: "Fried tempura", price: 35, featured: false, available: true, sortOrder: 52, image: "", optionType: "", addonsPreset: "" },
  { id: "fried_silver_roll", category: "fried", name_vi: "Ngân ti quyển", name_zh: "銀絲卷", name_en: "Silver Thread Roll", description_vi: "Bánh cuộn chiên", description_zh: "銀絲卷", description_en: "Fried silver thread roll", price: 50, featured: false, available: true, sortOrder: 53, image: "", optionType: "", addonsPreset: "" },
  { id: "fried_fries", category: "fried", name_vi: "Khoai tây chiên", name_zh: "黃金薯條", name_en: "French Fries", description_vi: "Khoai tây chiên vàng", description_zh: "黃金薯條", description_en: "Golden fries", price: 45, featured: false, available: true, sortOrder: 54, image: "", optionType: "", addonsPreset: "" },
  { id: "fried_nuggets", category: "fried", name_vi: "Gà viên", name_zh: "麥克雞塊", name_en: "Chicken Nuggets", description_vi: "Gà viên kiểu McNuggets", description_zh: "麥克雞塊", description_en: "Chicken nuggets", price: 45, featured: false, available: true, sortOrder: 55, image: "", optionType: "", addonsPreset: "" },
  { id: "fried_karaage", category: "fried", name_vi: "Gà karaage", name_zh: "唐揚雞", name_en: "Karaage Chicken", description_vi: "Gà viên chiên kiểu Nhật", description_zh: "唐揚雞", description_en: "Japanese fried chicken", price: 50, featured: false, available: true, sortOrder: 56, image: "", optionType: "", addonsPreset: "" },
  { id: "fried_onion_ring", category: "fried", name_vi: "Hành vòng chiên", name_zh: "洋蔥圈", name_en: "Onion Rings", description_vi: "Hành rán", description_zh: "洋蔥圈", description_en: "Fried onion rings", price: 45, featured: false, available: true, sortOrder: 57, image: "", optionType: "", addonsPreset: "" },
  { id: "vn_spring_roll", category: "vietnamese_fried", name_vi: "Nem rán Việt Nam (3 cái)", name_zh: "炸春捲（3個）", name_en: "Vietnamese Fried Spring Rolls (3 pcs)", description_vi: "Nem rán 3 cái", description_zh: "炸春捲三個", description_en: "Three Vietnamese fried spring rolls", price: 120, featured: false, available: true, sortOrder: 60, image: "", optionType: "", addonsPreset: "" },
  { id: "vn_skewer", category: "vietnamese_fried", name_vi: "Xiên bẩn", name_zh: "越式炸串", name_en: "Vietnamese Fried Skewers", description_vi: "Xiên ăn vặt Việt Nam", description_zh: "越式炸串", description_en: "Vietnamese street-style fried skewers", price: 100, featured: false, available: true, sortOrder: 61, image: "", optionType: "", addonsPreset: "" }
];

function textByLang(obj, lang) {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return obj[`name_${lang}`] || obj[lang] || obj.name_vi || obj.vi || obj.name_en || obj.en || obj.name_zh || obj.zh || "";
}

function descByLang(item, lang) {
  if (!item) return "";
  return item[`description_${lang}`] || item.description_vi || item.description_en || item.description_zh || "";
}

function money(n) {
  return `${Number(n || 0).toLocaleString()} NT$`;
}

function normalizeAddon(addon) {
  if (!addon) return null;
  if (addon.name) {
    return {
      id: addon.id,
      name_vi: addon.name.vi || addon.name_vi || addon.vi || "",
      name_zh: addon.name.zh || addon.name_zh || addon.zh || "",
      name_en: addon.name.en || addon.name_en || addon.en || "",
      price: Number(addon.price || 0),
      active: addon.active !== false,
      appliesTo: addon.appliesTo
    };
  }
  return { ...addon, price: Number(addon.price || 0), active: addon.active !== false };
}

function normalizeAddonData(raw) {
  if (!raw) return FALLBACK_ADDONS;

  if (Array.isArray(raw)) {
    const grouped = { pho: [], rice: [], spicy_hotpot: [], quick: [...FALLBACK_ADDONS.quick] };
    raw.forEach((a) => {
      const addon = normalizeAddon(a);
      if (!addon || addon.active === false) return;
      const applies = Array.isArray(addon.appliesTo) ? addon.appliesTo : [];
      if (applies.includes("pho")) grouped.pho.push(addon);
      if (applies.includes("rice_soup_noodle")) grouped.rice.push(addon);
      if (applies.includes("spicy_hotpot")) grouped.spicy_hotpot.push(addon);
    });
    return {
      pho: grouped.pho.length ? grouped.pho : FALLBACK_ADDONS.pho,
      rice: grouped.rice.length ? grouped.rice : FALLBACK_ADDONS.rice,
      spicy_hotpot: grouped.spicy_hotpot.length ? grouped.spicy_hotpot : FALLBACK_ADDONS.spicy_hotpot,
      quick: grouped.quick
    };
  }

  const grouped = { ...FALLBACK_ADDONS };
  Object.keys(raw).forEach((key) => {
    grouped[key] = Array.isArray(raw[key])
      ? raw[key].map(normalizeAddon).filter(Boolean)
      : grouped[key];
  });
  return grouped;
}

function normalizeItem(item) {
  const next = { ...item };

  if (next.name && typeof next.name === "object") {
    next.name_vi = next.name.vi || next.name_vi || "";
    next.name_zh = next.name.zh || next.name_zh || "";
    next.name_en = next.name.en || next.name_en || "";
  }

  if (next.description && typeof next.description === "object") {
    next.description_vi = next.description.vi || next.description_vi || "";
    next.description_zh = next.description.zh || next.description_zh || "";
    next.description_en = next.description.en || next.description_en || "";
  }

  next.price = Number(next.price || 0);
  next.available = next.available !== false;
  next.sortOrder = Number(next.sortOrder || next.sort || 999);

  if (!next.optionType && next.optionPreset) {
    if (next.optionPreset === "spicy") next.optionType = "spicy";
    if (next.optionPreset === "rice_spicy") next.optionType = "rice";
    if (next.optionPreset === "pho") next.optionType = "pho";
    if (next.optionPreset === "pho_combo") next.optionType = "pho_combo";
    if (next.optionPreset === "pho_brisket") next.optionType = "pho_brisket";
  }

  if (!next.addonsPreset && typeof next.addons === "string") {
    next.addonsPreset = next.addons;
  }

  return next;
}

function getPhoTypeLabel(type, lang, t) {
  if (type === "rare") return t.rare;
  if (type === "wellDone" || type === "cooked") return t.wellDone;
  if (type === "rareCooked") return t.rareCooked;
  if (type === "rareBrisket") return t.rareBrisket;
  if (type === "cookedBrisket") return t.cookedBrisket;
  return type || "";
}

function App() {
  const [lang, setLang] = useState("vi");
  const [table, setTable] = useState("");
  const [hasValidTable, setHasValidTable] = useState(false);

  const [settings, setSettings] = useState(FALLBACK_SETTINGS);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [addons, setAddons] = useState(FALLBACK_ADDONS);
  const [menu, setMenu] = useState(FALLBACK_MENU);

  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);

  const [modalItem, setModalItem] = useState(null);
  const [modalQty, setModalQty] = useState(1);
  const [phoType, setPhoType] = useState("rare");
  const [riceSpicy, setRiceSpicy] = useState("notSpicy");
  const [hotpotSpicy, setHotpotSpicy] = useState("notSpicy");
  const [selectedAddons, setSelectedAddons] = useState({});
  const [itemNote, setItemNote] = useState("");

  const [customerNote, setCustomerNote] = useState("");
  const [staffMessage, setStaffMessage] = useState("");
  const [noFlags, setNoFlags] = useState({
    noCoriander: false,
    noGreenOnion: false,
    noPepper: false,
    noOnion: false
  });

  const t = UI[lang];

  useEffect(() => {
    async function loadAll() {
      try {
        const fullRes = await fetch(`${BACKEND_URL}/api/menu-full`);
        if (fullRes.ok) {
          const full = await fullRes.json();
          if (full.settings) setSettings({ ...FALLBACK_SETTINGS, ...full.settings });
          if (Array.isArray(full.categories) && full.categories.length) setCategories(full.categories);
          if (full.addons) setAddons(normalizeAddonData(full.addons));
          if (Array.isArray(full.items) && full.items.length) setMenu(full.items.map(normalizeItem));
          return;
        }
      } catch {}

      try {
        const configRes = await fetch(`${BACKEND_URL}/api/config`);
        const data = await configRes.json();
        if (data.success) {
          setSettings({ ...FALLBACK_SETTINGS, ...(data.settings || {}) });
          if (Array.isArray(data.categories) && data.categories.length) setCategories(data.categories);
          if (data.addons) setAddons(normalizeAddonData(data.addons));
        }
      } catch {}

      try {
        const menuRes = await fetch(`${BACKEND_URL}/api/menu`);
        const data = await menuRes.json();
        if (Array.isArray(data) && data.length) setMenu(data.map(normalizeItem));
      } catch {}
    }

    loadAll();

    const params = new URLSearchParams(window.location.search);
    const qrTable = params.get("table");
    if (qrTable && qrTable.trim()) {
      setTable(qrTable.trim());
      setHasValidTable(true);
    }
  }, []);

  const visibleCategories = useMemo(() => {
    return [...categories].sort(
      (a, b) => Number(a.sortOrder || a.sort || 0) - Number(b.sortOrder || b.sort || 0)
    );
  }, [categories]);

  const sortedMenu = useMemo(() => {
    return [...menu]
      .filter((item) => item.available !== false)
      .sort((a, b) => Number(a.sortOrder || a.sort || 999) - Number(b.sortOrder || b.sort || 999));
  }, [menu]);

  const filteredMenu = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sortedMenu.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (!q) return true;
      const hay = `${item.name_vi || ""} ${item.name_zh || ""} ${item.name_en || ""} ${item.description_vi || ""} ${item.description_zh || ""} ${item.description_en || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [sortedMenu, category, search]);

  const featuredMenu = useMemo(() => sortedMenu.filter((i) => i.featured), [sortedMenu]);

  const total = useMemo(() => cart.reduce((sum, item) => sum + Number(item.subtotal || 0), 0), [cart]);

  const currentNoFlags = useMemo(() => {
    const arr = [];
    if (noFlags.noCoriander) arr.push(t.noCoriander);
    if (noFlags.noGreenOnion) arr.push(t.noGreenOnion);
    if (noFlags.noPepper) arr.push(t.noPepper);
    if (noFlags.noOnion) arr.push(t.noOnion);
    return arr;
  }, [noFlags, lang, t]);

  const getItemAddons = (item) => {
    if (!item) return [];

    if (Array.isArray(item.addons)) {
      return item.addons.map(normalizeAddon).filter((a) => a && a.active !== false);
    }

    const preset = item.addonsPreset || item.addons;
    if (preset && addons[preset]) return addons[preset].filter((a) => a.active !== false);

    if (item.category === "pho") return addons.pho || [];
    if (item.category === "rice_soup_noodle" && item.optionType === "rice") return addons.rice || [];
    if (item.category === "spicy_hotpot") return addons.spicy_hotpot || [];

    return [];
  };

  const openItem = (item) => {
    if (!item.available) return;

    setModalItem(item);
    setModalQty(1);

    if (item.optionType === "pho_brisket") setPhoType("rareBrisket");
    else setPhoType("rare");

    setRiceSpicy("notSpicy");
    setHotpotSpicy("notSpicy");
    setSelectedAddons({});
    setItemNote("");
  };

  const toggleAddon = (addonId) => {
    setSelectedAddons((prev) => ({ ...prev, [addonId]: !prev[addonId] }));
  };

  const buildOptionText = (item) => {
    const parts = [];

    if (item.optionType === "pho" || item.optionType === "pho_combo" || item.optionType === "pho_brisket") {
      parts.push(getPhoTypeLabel(phoType, lang, t));
    }

    if (item.optionType === "rice") {
      parts.push(riceSpicy === "spicy" ? t.spicy : t.notSpicy);
    }

    if (item.optionType === "spicy") {
      parts.push(hotpotSpicy === "spicy" ? t.spicy : t.notSpicy);
    }

    return parts.filter(Boolean).join(" • ");
  };

  const buildSelectedOptions = (item) => {
    return {
      phoType:
        item.optionType === "pho" || item.optionType === "pho_combo" || item.optionType === "pho_brisket"
          ? phoType
          : null,
      riceSpicy: item.optionType === "rice" ? riceSpicy : null,
      hotpotSpicy: item.optionType === "spicy" ? hotpotSpicy : null
    };
  };

  const makeLineIdentity = (item, optionText, itemAddons, note) => {
    const addText = itemAddons.map((a) => `${a.id}:${a.qty || 1}`).sort().join(",");
    return `${item.id}__${optionText}__${addText}__${note || ""}`;
  };

  const addModalToCart = () => {
    if (!modalItem) return;

    const itemAddons = getItemAddons(modalItem)
      .filter((a) => selectedAddons[a.id])
      .map((a) => ({
        id: a.id,
        name: textByLang(a, lang),
        name_vi: a.name_vi,
        name_zh: a.name_zh,
        name_en: a.name_en,
        price: Number(a.price || 0),
        qty: 1
      }));

    const addonsTotal = itemAddons.reduce((s, a) => s + Number(a.price || 0) * Number(a.qty || 1), 0);
    const optionText = buildOptionText(modalItem);
    const unitTotal = Number(modalItem.price || 0) + addonsTotal;
    const identity = makeLineIdentity(modalItem, optionText, itemAddons, itemNote.trim());

    const cartItem = {
      lineId: `${identity}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
      identity,
      id: modalItem.id,
      name: textByLang(modalItem, lang),
      name_vi: modalItem.name_vi,
      name_zh: modalItem.name_zh,
      name_en: modalItem.name_en,
      category: modalItem.category,
      qty: modalQty,
      price: Number(modalItem.price || 0),
      optionText,
      addons: itemAddons,
      note: itemNote.trim(),
      subtotal: unitTotal * modalQty,
      selectedOptions: buildSelectedOptions(modalItem),
      optionLabels: optionText ? [{ group: "Option", value: optionText }] : []
    };

    setCart((prev) => {
      const found = prev.find((x) => x.identity === identity);
      if (!found) return [...prev, cartItem];

      return prev.map((x) => {
        if (x.identity !== identity) return x;
        const newQty = x.qty + modalQty;
        return {
          ...x,
          qty: newQty,
          subtotal: unitTotal * newQty
        };
      });
    });

    setModalItem(null);
  };

  const addQuickAddon = (type) => {
    const quick = addons.quick || FALLBACK_ADDONS.quick;
    const addon = quick.find((a) => a.id === type);
    if (!addon) return;

    const lineId = `${addon.id}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
    setCart((prev) => [
      ...prev,
      {
        lineId,
        identity: lineId,
        id: addon.id,
        name: textByLang(addon, lang),
        name_vi: addon.name_vi,
        name_zh: addon.name_zh,
        name_en: addon.name_en,
        category: "quick_addon",
        qty: 1,
        price: Number(addon.price || 0),
        optionText: "",
        addons: [],
        note: "",
        subtotal: Number(addon.price || 0),
        selectedOptions: {},
        optionLabels: []
      }
    ]);
  };

  const removeLine = (lineId) => setCart((prev) => prev.filter((i) => i.lineId !== lineId));

  const clearCart = () => setCart([]);

  const placeOrder = async () => {
    if (!hasValidTable) return alert(t.scanQr);
    if (cart.length === 0) return alert(t.empty);

    try {
      const res = await fetch(`${BACKEND_URL}/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table, language: lang, items: cart, total, customerNote, note: customerNote, noIngredients: currentNoFlags })
      });
      const data = await res.json();

      if (data.success) {
        alert(t.success);
        setCart([]);
        setCustomerNote("");
        setStaffMessage("");
        setNoFlags({ noCoriander: false, noGreenOnion: false, noPepper: false, noOnion: false });
      } else {
        alert(data.message || t.fail);
      }
    } catch {
      alert(t.backendError);
    }
  };

  const sendStaff = async () => {
    if (!hasValidTable) return alert(t.scanQr);

    try {
      const res = await fetch(`${BACKEND_URL}/call-staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table, message: staffMessage || "Khách cần hỗ trợ", flags: currentNoFlags })
      });
      const data = await res.json();
      if (data.success) {
        alert(lang === "zh" ? "已送出" : lang === "en" ? "Sent" : "Đã gửi");
        setStaffMessage("");
      } else {
        alert(t.fail);
      }
    } catch {
      alert(t.backendError);
    }
  };

  const renderMenuCard = (item) => (
    <article className="menu-card" key={item.id}>
      {item.image ? <img src={item.image} alt={textByLang(item, lang)} /> : <div className="menu-img-fallback">GOKA</div>}
      <div className="menu-body">
        <h3>{textByLang(item, lang)}</h3>
        <p>{descByLang(item, lang)}</p>
        <div className="price-line">
          <b>{money(item.price)}</b>
          {!item.available && <span>{t.soldOut}</span>}
        </div>
        <button disabled={!item.available} onClick={() => openItem(item)}>
          {item.available ? t.add : t.soldOut}
        </button>
      </div>
    </article>
  );

  const groupedSections = useMemo(() => {
    return visibleCategories
      .map((cat) => ({
        cat,
        items: filteredMenu.filter((item) => item.category === cat.id)
      }))
      .filter((section) => section.items.length > 0);
  }, [visibleCategories, filteredMenu]);

  return (
    <div className="app">
      <header className="brand-hero">
        <div className="brand-logo">
          <div className="logo-mark">G</div>
          <div>
            <h1>{settings.logoTitle || "Goka phở & mỳ cay"}</h1>
            <p>{lang === "vi" ? settings.subtitle_vi : lang === "zh" ? settings.subtitle_zh : settings.subtitle_en}</p>
          </div>
        </div>
        <div className="lang-switch">
          <button className={lang === "vi" ? "active" : ""} onClick={() => setLang("vi")}>VI</button>
          <button className={lang === "zh" ? "active" : ""} onClick={() => setLang("zh")}>中文</button>
          <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>EN</button>
        </div>
      </header>

      <main className="layout">
        <section className="menu-area">
          <div className="table-banner">
            {hasValidTable ? (
              <span>{table === "takeaway" ? t.takeaway : t.table}: <b>{table}</b></span>
            ) : (
              <span>{t.scanQr}</span>
            )}
          </div>

          <input className="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.search} />

          {featuredMenu.length > 0 && (
            <section className="featured">
              <h2>{t.featured}</h2>
              <div className="featured-row">
                {featuredMenu.slice(0, 8).map((item) => (
                  <button key={item.id} className="featured-pill" onClick={() => openItem(item)}>
                    {textByLang(item, lang)} <b>{money(item.price)}</b>
                  </button>
                ))}
              </div>
            </section>
          )}

          <div className="tabs">
            <button className={category === "all" ? "active" : ""} onClick={() => setCategory("all")}>{t.all}</button>
            {visibleCategories.map((cat) => (
              <button key={cat.id} className={category === cat.id ? "active" : ""} onClick={() => setCategory(cat.id)}>
                {textByLang(cat, lang)}
              </button>
            ))}
          </div>

          {category === "all" ? (
            groupedSections.map((section) => (
              <section className="category-section" key={section.cat.id}>
                <h2>{textByLang(section.cat, lang)}</h2>
                <div className="menu-grid">{section.items.map(renderMenuCard)}</div>
              </section>
            ))
          ) : (
            <section className="category-section">
              <h2>{textByLang(visibleCategories.find((c) => c.id === category), lang) || t.menu}</h2>
              <div className="menu-grid">{filteredMenu.map(renderMenuCard)}</div>
            </section>
          )}
        </section>

        <aside className="checkout">
          <h2>{t.checkout}</h2>

          <div className="cart-box">
            <h3>🛒 {t.cart}</h3>
            {cart.length === 0 ? (
              <p className="muted">{t.empty}</p>
            ) : (
              cart.map((line) => (
                <div className="cart-line" key={line.lineId}>
                  <div>
                    <b>{line.name}</b>
                    {line.optionText && <small>{line.optionText}</small>}
                    {line.addons?.map((a) => (
                      <small key={a.id}>+ {textByLang(a, lang)} {money(a.price)}</small>
                    ))}
                    {line.note && <small>Note: {line.note}</small>}
                    <span>x{line.qty} - {money(line.subtotal)}</span>
                  </div>
                  <button onClick={() => removeLine(line.lineId)}>✕</button>
                </div>
              ))
            )}
          </div>

          <div className="quick-add-box">
            <h3>{t.quickAdd}</h3>
            <div className="quick-add-grid">
              <button onClick={() => addQuickAddon("quick_extra_rice")}>{t.extraRice} +20</button>
              <button onClick={() => addQuickAddon("quick_extra_noodle")}>{t.extraNoodle} +20</button>
              <button onClick={() => addQuickAddon("quick_extra_meat")}>{t.extraMeat} +70</button>
              <button onClick={() => addQuickAddon("quick_extra_shrimp")}>{t.extraShrimp} +60</button>
            </div>
          </div>

          <textarea className="note" value={customerNote} onChange={(e) => setCustomerNote(e.target.value)} placeholder={t.notePlaceholder} />

          <div className="flags">
            <label><input type="checkbox" checked={noFlags.noCoriander} onChange={(e) => setNoFlags({ ...noFlags, noCoriander: e.target.checked })} />{t.noCoriander}</label>
            <label><input type="checkbox" checked={noFlags.noGreenOnion} onChange={(e) => setNoFlags({ ...noFlags, noGreenOnion: e.target.checked })} />{t.noGreenOnion}</label>
            <label><input type="checkbox" checked={noFlags.noPepper} onChange={(e) => setNoFlags({ ...noFlags, noPepper: e.target.checked })} />{t.noPepper}</label>
            <label><input type="checkbox" checked={noFlags.noOnion} onChange={(e) => setNoFlags({ ...noFlags, noOnion: e.target.checked })} />{t.noOnion}</label>
          </div>

          <div className="total">
            <span>{t.total}</span>
            <b>{money(total)}</b>
          </div>

          <button className="order-btn" onClick={placeOrder}>{t.order}</button>
          <button className="clear-btn" onClick={clearCart}>{t.clear}</button>

          <div className="staff-box">
            <h3>{t.staffTitle}</h3>
            <textarea value={staffMessage} onChange={(e) => setStaffMessage(e.target.value)} placeholder={t.staffPlaceholder} />
            <button onClick={sendStaff}>{t.sendStaff}</button>
          </div>
        </aside>
      </main>

      {modalItem && (
        <div className="modal-bg" onClick={() => setModalItem(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{textByLang(modalItem, lang)}</h2>
            <p>{descByLang(modalItem, lang)}</p>

            <div className="qty">
              <span>{t.qty}</span>
              <button onClick={() => setModalQty(Math.max(1, modalQty - 1))}>-</button>
              <b>{modalQty}</b>
              <button onClick={() => setModalQty(modalQty + 1)}>+</button>
            </div>

            {(modalItem.optionType === "pho" || modalItem.optionType === "pho_combo" || modalItem.optionType === "pho_brisket") && (
              <div className="option-block">
                <h3>{t.optionPho}</h3>
                {modalItem.optionType !== "pho_brisket" && (
                  <>
                    <button className={phoType === "rare" ? "active" : ""} onClick={() => setPhoType("rare")}>{t.rare}</button>
                    <button className={phoType === "wellDone" ? "active" : ""} onClick={() => setPhoType("wellDone")}>{t.wellDone}</button>
                  </>
                )}
                {modalItem.optionType === "pho_combo" && (
                  <button className={phoType === "rareCooked" ? "active" : ""} onClick={() => setPhoType("rareCooked")}>{t.rareCooked}</button>
                )}
                {modalItem.optionType === "pho_brisket" && (
                  <>
                    <button className={phoType === "rareBrisket" ? "active" : ""} onClick={() => setPhoType("rareBrisket")}>{t.rareBrisket}</button>
                    <button className={phoType === "cookedBrisket" ? "active" : ""} onClick={() => setPhoType("cookedBrisket")}>{t.cookedBrisket}</button>
                  </>
                )}
              </div>
            )}

            {modalItem.optionType === "rice" && (
              <div className="option-block">
                <h3>{t.spicyRice}</h3>
                <button className={riceSpicy === "notSpicy" ? "active" : ""} onClick={() => setRiceSpicy("notSpicy")}>{t.notSpicy}</button>
                <button className={riceSpicy === "spicy" ? "active" : ""} onClick={() => setRiceSpicy("spicy")}>{t.spicy}</button>
              </div>
            )}

            {modalItem.optionType === "spicy" && (
              <div className="option-block">
                <h3>{t.spicyLevel}</h3>
                <button className={hotpotSpicy === "notSpicy" ? "active" : ""} onClick={() => setHotpotSpicy("notSpicy")}>{t.notSpicy}</button>
                <button className={hotpotSpicy === "spicy" ? "active" : ""} onClick={() => setHotpotSpicy("spicy")}>{t.spicy}</button>
              </div>
            )}

            <div className="option-block">
              <h3>{t.addons}</h3>
              {getItemAddons(modalItem).length === 0 && <p className="muted">-</p>}
              {getItemAddons(modalItem).map((a) => (
                <label className="addon" key={a.id}>
                  <input type="checkbox" checked={!!selectedAddons[a.id]} onChange={() => toggleAddon(a.id)} />
                  {textByLang(a, lang)} <b>{money(a.price)}</b>
                </label>
              ))}
            </div>

            <textarea className="note" value={itemNote} onChange={(e) => setItemNote(e.target.value)} placeholder={t.itemNote} />

            <div className="modal-actions">
              <button onClick={() => setModalItem(null)}>{t.cancel}</button>
              <button className="order-btn" onClick={addModalToCart}>{t.confirmAdd}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
