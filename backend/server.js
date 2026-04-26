/*
GOKA PHỞ & MỲ CAY - FULL BACKEND UPGRADE
Bản này giữ các tài nguyên quan trọng:
- Giữ /order để frontend đặt món.
- Giữ /call-staff để gọi nhân viên.
- Giữ Telegram BOT_TOKEN + CHAT_ID.
- Giữ QR table qua table param từ frontend.
- Thêm menu/category/addon/admin full.
- Không có phần free/donate trên API chính.
- Nếu chưa có menu.json/orders.json/settings.json thì tự tạo, KHÔNG xóa file cũ.

Cài cần có:
npm install express cors
Nếu muốn dùng .env local:
npm install dotenv
*/

try {
  require("dotenv").config();
} catch (e) {
  // Nếu chưa cài dotenv trên Render/local thì bỏ qua, không làm crash server.
}

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { printOrderSafe } = require("./printer");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 5000;

const BOT_TOKEN = process.env.BOT_TOKEN || process.env.TELEGRAM_TOKEN || "";
const CHAT_ID = process.env.CHAT_ID || "";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || process.env.ADMIN_PASSWORD || "123456";

const DATA_DIR = __dirname;
const MENU_FILE = path.join(DATA_DIR, "menu.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

const DEFAULT_SETTINGS = {
  logoTitle: "Goka phở & mỳ cay",
  subtitle_vi: "Đặt món nhanh chóng - giao diện đa ngôn ngữ",
  subtitle_zh: "快速點餐 - 多語言介面",
  subtitle_en: "Fast ordering - multilingual interface"
};

const DEFAULT_MENU_DATA = {
  categories: [
    { id: "spicy_hotpot", vi: "Mỳ cay", zh: "越式部隊鍋", en: "Vietnamese Spicy Hot Pot", sort: 1, sortOrder: 1 },
    { id: "pho", vi: "Phở", zh: "河粉", en: "Pho", sort: 2, sortOrder: 2 },
    { id: "rice_soup_noodle", vi: "Cơm & canh & mỳ xào", zh: "飯・湯・炒麵", en: "Rice, Soup & Stir-fried Noodles", sort:
      3, sortOrder: 3 },
    { id: "fruit_tea", vi: "Trà trái cây", zh: "果茶", en: "Fruit Tea", sort: 4, sortOrder: 4 },
    { id: "drinks", vi: "Đồ uống", zh: "飲品", en: "Drinks", sort: 5, sortOrder: 5 },
    { id: "fried", vi: "Đồ rán", zh: "炸物", en: "Fried Snacks", sort: 6, sortOrder: 6 },
    { id: "vietnamese_fried", vi: "Đồ rán Việt Nam", zh: "越式炸物", en: "Vietnamese Fried Food", sort: 7, sortOrder: 7
      }
  ],
  addons: {
    pho: [
      { id: "extra_pho_noodle", name_vi: "Thêm bánh phở", name_zh: "加河粉", name_en: "Extra pho noodles", price: 20,
        active: true, appliesTo: ["pho"] },
      { id: "extra_beef", name_vi: "Thêm thịt", name_zh: "加肉", name_en: "Extra meat", price: 70, active: true,
        appliesTo: ["pho"] }
    ],
    rice: [
      { id: "extra_rice", name_vi: "Thêm cơm", name_zh: "加飯", name_en: "Extra rice", price: 20, active: true,
        appliesTo: ["rice_soup_noodle"] },
      { id: "extra_egg", name_vi: "Thêm trứng", name_zh: "加蛋", name_en: "Extra egg", price: 20, active: true,
        appliesTo: ["rice_soup_noodle"] }
    ],
    spicy_hotpot: [
      { id: "extra_noodle", name_vi: "Thêm mỳ", name_zh: "加麵", name_en: "Extra noodle", price: 20, active: true,
        appliesTo: ["spicy_hotpot"] },
      { id: "extra_meat", name_vi: "Thêm thịt", name_zh: "加肉", name_en: "Extra meat", price: 70, active: true,
        appliesTo: ["spicy_hotpot"] },
      { id: "extra_shrimp", name_vi: "Thêm tôm", name_zh: "加蝦", name_en: "Extra shrimp", price: 60, active: true,
        appliesTo: ["spicy_hotpot"] }
    ],
    quick: [
      { id: "quick_extra_rice", name_vi: "Thêm cơm", name_zh: "加飯", name_en: "Extra rice", price: 20, active: true,
        appliesTo: ["quick"] },
      { id: "quick_extra_noodle", name_vi: "Thêm mỳ", name_zh: "加麵", name_en: "Extra noodle", price: 20, active:
        true, appliesTo: ["quick"] },
      { id: "quick_extra_meat", name_vi: "Thêm thịt", name_zh: "加肉", name_en: "Extra meat", price: 70, active: true,
        appliesTo: ["quick"] },
      { id: "quick_extra_shrimp", name_vi: "Thêm tôm", name_zh: "加蝦", name_en: "Extra shrimp", price: 60, active:
        true, appliesTo: ["quick"] }
    ]
  },
  items: [
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
  id: "mycay-haisan",
  category: "my-cay",
  name_vi: "Mỳ cay hải sản",
  name_zh: "海鮮部隊鍋",
  name_en: "Seafood Hotpot Noodles",
  price: 170,
  available: true,
  featured: true,
  image: "/images/mycay-haisan.jpg",
  description_vi: "Mực, 2 con tôm, bắp cải tím, xúc xích, cá viên, bò viên, bánh gạo, nấm kim châm, bông cải, kimchi",
  description_zh: "花枝、2隻蝦、紫色甘藍、熱狗、魚丸、貢丸、年糕、金針菇、花椰菜、泡菜",
  description_en: "Squid, 2 shrimp, purple cabbage, sausage, fish ball, beef ball, rice cake, enoki mushroom, broccoli, kimchi",
  sortOrder: 2,
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

    { id: "tea_longan", category: "fruit_tea", name_vi: "Trà nhãn", name_zh: "龍眼果茶", name_en: "Longan Fruit Tea",
      description_vi: "Trà trái cây vị nhãn", description_zh: "龍眼果茶", description_en: "Longan fruit tea", price: 75,
      featured: false, available: true, sortOrder: 30, image: "", optionType: "", addonsPreset: "" },
    { id: "tea_guava", category: "fruit_tea", name_vi: "Trà ổi", name_zh: "芭樂果茶", name_en: "Guava Fruit Tea",
      description_vi: "Trà ổi", description_zh: "芭樂果茶", description_en: "Guava fruit tea", price: 80, featured:
      false, available: true, sortOrder: 31, image: "", optionType: "", addonsPreset: "" },
    { id: "tea_melon", category: "fruit_tea", name_vi: "Trà dưa lưới", name_zh: "哈密瓜果茶", name_en: "Melon Fruit Tea",
      description_vi: "Trà dưa lưới", description_zh: "哈密瓜果茶", description_en: "Melon fruit tea", price: 90,
      featured: false, available: true, sortOrder: 32, image: "", optionType: "", addonsPreset: "" },
    { id: "tea_strawberry", category: "fruit_tea", name_vi: "Trà dâu tây theo mùa", name_zh: "草莓果茶", name_en:
      "Seasonal Strawberry Fruit Tea", description_vi: "Theo mùa", description_zh: "季節限定", description_en:
      "Seasonal", price: 100, featured: false, available: true, sortOrder: 33, image: "", optionType: "",
      addonsPreset: "" },
    { id: "tea_mango_passion", category: "fruit_tea", name_vi: "Trà xoài chanh dây", name_zh: "百香芒芒果茶", name_en:
      "Mango Passion Fruit Tea", description_vi: "Xoài + chanh dây", description_zh: "芒果百香果茶", description_en:
      "Mango and passion fruit tea", price: 75, featured: false, available: true, sortOrder: 34, image: "",
      optionType: "", addonsPreset: "" },
    { id: "tea_peach", category: "fruit_tea", name_vi: "Trà đào", name_zh: "水蜜桃果茶", name_en: "Peach Fruit Tea",
      description_vi: "Trà đào", description_zh: "水蜜桃果茶", description_en: "Peach fruit tea", price: 75, featured:
      false, available: true, sortOrder: 35, image: "", optionType: "", addonsPreset: "" },
    { id: "tea_tropical", category: "fruit_tea", name_vi: "Trà trái cây nhiệt đới", name_zh: "綜合水果茶", name_en:
      "Tropical Mixed Fruit Tea", description_vi: "Trà trái cây tổng hợp", description_zh: "綜合水果茶", description_en:
      "Mixed tropical fruit tea", price: 75, featured: false, available: true, sortOrder: 36, image: "", optionType:
      "", addonsPreset: "" },

    { id: "drink_cocoa_milk", category: "drinks", name_vi: "Ca cao sữa", name_zh: "可可牛奶", name_en: "Cocoa Milk",
      description_vi: "Ca cao sữa", description_zh: "可可牛奶", description_en: "Cocoa milk", price: 65, featured:
      false, available: true, sortOrder: 40, image: "", optionType: "", addonsPreset: "" },
    { id: "drink_taro_milk", category: "drinks", name_vi: "Trà sữa khoai môn", name_zh: "芋香牛奶", name_en: "Taro Milk Tea", description_vi: "Trà sữa khoai môn", description_zh: "芋香牛奶", description_en: "Taro milk tea", price: 65,
  featured: false, available: true, sortOrder: 41, image: "", optionType: "", addonsPreset: "" },
{ id: "drink_americano", category: "drinks", name_vi: "Americano", name_zh: "經典美式", name_en: "Americano",
  description_vi: "Cà phê Americano", description_zh: "經典美式咖啡", description_en: "Classic Americano", price: 50,
  featured: false, available: true, sortOrder: 42, image: "", optionType: "", addonsPreset: "" },
{ id: "drink_black_coffee", category: "drinks", name_vi: "Cà phê nguyên chất", name_zh: "特濃", name_en: "Strong Black Coffee", description_vi: "Cà phê nguyên chất", description_zh: "特濃咖啡", description_en: "Strong coffee",
  price: 50, featured: false, available: true, sortOrder: 43, image: "", optionType: "", addonsPreset: "" },
{ id: "drink_latte", category: "drinks", name_vi: "Latte", name_zh: "拿鐵", name_en: "Latte", description_vi: "Latte", description_zh: "拿鐵", description_en: "Latte", price: 65, featured: false, available: true,
  sortOrder: 44, image: "", optionType: "", addonsPreset: "" },
{ id: "drink_vn_milk_coffee", category: "drinks", name_vi: "Cà phê sữa Việt Nam", name_zh: "越式煉乳咖啡", name_en: "Vietnamese Condensed Milk Coffee", description_vi: "Cà phê sữa", description_zh: "越式煉乳咖啡", description_en: "Vietnamese milk coffee", price: 65, featured: false, available: true, sortOrder: 45, image: "", optionType: "", addonsPreset: "" },
{ id: "drink_salt_coffee", category: "drinks", name_vi: "Cà phê muối", name_zh: "鹹咖啡", name_en: "Salt Coffee",
  description_vi: "Cà phê muối", description_zh: "鹹咖啡", description_en: "Salt coffee", price: 80, featured: false, available: true, sortOrder: 46, image: "", optionType: "", addonsPreset: "" },
 
{ id: "fried_combo", category: "fried", name_vi: "Combo đồ rán", name_zh: "炸物拼盤", name_en: "Fried Combo Platter", description_vi: "Combo đồ rán tổng hợp", description_zh: "炸物拼盤", description_en: "Mixed fried platter", price: 200, featured: false, available: true, sortOrder: 50, image: "", optionType: "", addonsPreset: "" },
{ id: "fried_qq", category: "fried", name_vi: "QQ棒", name_zh: "QQ棒", name_en: "QQ Stick", description_vi: "QQ棒 này ngon nè", description_zh: "QQ棒", description_en: "QQ stick snack", price: 50, featured: false, available: true, sortOrder: 51, image: "", optionType: "", addonsPreset: "" },
{ id: "fried_tempura", category: "fried", name_vi: "Tempura", name_zh: "甜不辣", name_en: "Tempura",
  description_vi: "Tempura chiên", description_zh: "甜不辣", description_en: "Fried tempura", price: 35, featured: false, available: true, sortOrder: 52, image: "", optionType: "", addonsPreset: "" },
{ id: "fried_silver_roll", category: "fried", name_vi: "Ngân ti quyển", name_zh: "銀絲卷", name_en: "Silver Thread Roll", description_vi: "Bánh cuộn chiên", description_zh: "銀絲卷", description_en: "Fried silver thread roll",
  price: 50, featured: false, available: true, sortOrder: 53, image: "", optionType: "", addonsPreset: "" },
{ id: "fried_fries", category: "fried", name_vi: "Khoai tây chiên", name_zh: "黃金薯條", name_en: "French Fries",
  description_vi: "Khoai tây chiên vàng", description_zh: "黃金薯條", description_en: "Golden fries", price: 45,
  featured: false, available: true, sortOrder: 54, image: "", optionType: "", addonsPreset: "" },
{ id: "fried_nuggets", category: "fried", name_vi: "Gà viên", name_zh: "麥克雞塊", name_en: "Chicken Nuggets",
  description_vi: "Gà viên kiểu McNuggets", description_zh: "麥克雞塊", description_en: "Chicken nuggets", price: 45, featured: false, available: true, sortOrder: 55, image: "", optionType: "", addonsPreset: "" },
{ id: "fried_karaage", category: "fried", name_vi: "Gà karaage", name_zh: "唐揚雞", name_en: "Karaage Chicken",
  description_vi: "Gà viên chiên kiểu Nhật", description_zh: "唐揚雞", description_en: "Japanese fried chicken",
  price: 50, featured: false, available: true, sortOrder: 56, image: "", optionType: "", addonsPreset: "" },
{ id: "fried_onion_ring", category: "fried", name_vi: "Hành vòng chiên", name_zh: "洋蔥圈", name_en: "Onion Rings",
  description_vi: "Hành rán", description_zh: "洋蔥圈", description_en: "Fried onion rings", price: 45, featured: false, available: true, sortOrder: 57, image: "", optionType: "", addonsPreset: "" },
 
{ id: "vn_spring_roll", category: "vietnamese_fried", name_vi: "Nem rán Việt Nam (3 cái)", name_zh: "炸春捲（3個）",
  name_en: "Vietnamese Fried Spring Rolls (3 pcs)", description_vi: "Nem rán 3 cái", description_zh: "炸春捲三個",
  description_en: "Three Vietnamese fried spring rolls", price: 120, featured: false, available: true,
  sortOrder: 60, image: "", optionType: "", addonsPreset: "" },
{ id: "vn_skewer", category: "vietnamese_fried", name_vi: "Xiên bẩn", name_zh: "越式炸串", name_en: "Vietnamese Fried Skewers", description_vi: "Xiên ăn vặt Việt Nam", description_zh: "越式炸串", description_en: "Vietnamese street-style fried skewers", price: 100, featured: false, available: true, sortOrder: 61, image: "",
  optionType: "", addonsPreset: "" }
]
};

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) {
      writeJson(file, fallback);
      return fallback;
    }

    const raw = fs.readFileSync(file, "utf-8");
    if (!raw.trim()) {
      writeJson(file, fallback);
      return fallback;
    }

    return JSON.parse(raw);
  } catch (error) {
    console.log("READ JSON ERROR:", file, error.message);
    return fallback;
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

function backupFile(file) {
  try {
    if (!fs.existsSync(file)) return;
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    fs.copyFileSync(file, `${file}.backup-${stamp}`);
  } catch (error) {
    console.log("BACKUP ERROR:", error.message);
  }
}

function getSettings() {
  return readJson(SETTINGS_FILE, DEFAULT_SETTINGS);
}

function saveSettings(settings) {
  writeJson(SETTINGS_FILE, { ...DEFAULT_SETTINGS, ...settings });
}

function getMenuData() {
  const data = readJson(MENU_FILE, DEFAULT_MENU_DATA);

  if (!Array.isArray(data.categories)) data.categories = DEFAULT_MENU_DATA.categories;
  if (!Array.isArray(data.items)) data.items = DEFAULT_MENU_DATA.items;
  if (!data.addons) data.addons = DEFAULT_MENU_DATA.addons;

  return data;
}

function saveMenuData(data) {
  const safe = {
    categories: Array.isArray(data.categories) ? data.categories : DEFAULT_MENU_DATA.categories,
    addons: data.addons || DEFAULT_MENU_DATA.addons,
    items: Array.isArray(data.items) ? data.items : DEFAULT_MENU_DATA.items
  };

  writeJson(MENU_FILE, safe);
  return safe;
}

function flattenAddons(addonsMap) {
  if (Array.isArray(addonsMap)) return addonsMap;
  const arr = [];

  Object.keys(addonsMap || {}).forEach((groupKey) => {
    const group = addonsMap[groupKey];
    if (!Array.isArray(group)) return;

    group.forEach((addon) => {
      arr.push({
        ...addon,
        group: groupKey,
        active: addon.active !== false
      });
    });
  });

  return arr;
}

function normalizeItemForOldFrontend(item) {
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

  return next;
}

function checkAdmin(req, res, next) {
  const auth = req.headers.authorization || "";
  const tokenFromHeader = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const tokenFromQuery = req.query.token || "";
  const tokenFromBody = req.body && req.body.adminToken ? req.body.adminToken : "";
  const token = tokenFromHeader || tokenFromQuery || tokenFromBody;

  if (token !== ADMIN_TOKEN) {
    return res.status(403).json({ success: false, message: "Forbidden: wrong admin token" });
  }

  next();
}

function safeText(value, fallback = "") {
  if (value === undefined || value === null) return fallback;
  return String(value);
}

function getItemNameVI(item) {
  return item.name_vi || item.name || item.vi || "Món";
}

function formatOrderMessage(order) {
  const lines = [];

  lines.push("🍜 GOKA NEW ORDER");
  lines.push(`Bàn/Table: ${safeText(order.table, "-")}`);
  if (order.language) lines.push(`Language: ${order.language}`);
  lines.push("--------------------");

  (order.items || []).forEach((item, index) => {
    const qty = Number(item.qty || 1);
    const name = item.name_vi || item.name || item.name_en || item.name_zh || "Món";
    const price = Number(item.price || 0);

    lines.push(`${index + 1}. ${name} x${qty}`);
    lines.push(`   Giá gốc: ${price} NT$`);

    if (item.optionText) {
      lines.push(`   Option: ${item.optionText}`);
    }

    if (Array.isArray(item.optionLabels) && item.optionLabels.length) {
      item.optionLabels.forEach((o) => {
        lines.push(`   - ${safeText(o.group || "Option")}: ${safeText(o.value)}`);
      });
    }

    if (Array.isArray(item.addons) && item.addons.length) {
      item.addons.forEach((a) => {
        const addonName = a.name_vi || a.name || a.name_en || a.name_zh || "Addon";
        lines.push(`   + ${addonName} x${Number(a.qty || 1)} (${Number(a.price || 0)} NT$)`);
      });
    }

    if (item.note || item.itemNote) {
      lines.push(`   Note món: ${item.note || item.itemNote}`);
    }

    if (item.subtotal || item.lineTotal) {
      lines.push(`   Tạm tính dòng: ${Number(item.subtotal || item.lineTotal)} NT$`);
    }
  });

  lines.push("--------------------");
  lines.push(`Tổng cộng: ${Number(order.total || 0)} NT$`);

  if (order.customerNote) lines.push(`Ghi chú khách: ${order.customerNote}`);
  if (order.note) lines.push(`Ghi chú chung: ${order.note}`);

  if (Array.isArray(order.noIngredients) && order.noIngredients.length) {
    lines.push(`Không dùng: ${order.noIngredients.join(", ")}`);
  }

  return lines.join("\n");
}

async function sendTelegram(text) {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.log("Telegram disabled: missing BOT_TOKEN or CHAT_ID");
    return { ok: false, skipped: true };
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.description || `Telegram HTTP ${response.status}`);
  }

  return data;
}

app.get("/", (req, res) => {
  res.json({
    success: true,
    service: "GOKA backend full upgraded",
    time: new Date().toISOString()
  });
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, ok: true });
});

app.get("/api/config", (req, res) => {
  const menuData = getMenuData();

  res.json({
    success: true,
    settings: getSettings(),
    categories: menuData.categories,
    addons: flattenAddons(menuData.addons),
    addonsMap: menuData.addons
  });
});

app.get("/api/menu", (req, res) => {
  const menuData = getMenuData();
  const items = menuData.items
    .filter((item) => item.deleted !== true)
    .map(normalizeItemForOldFrontend)
    .sort((a, b) => Number(a.sortOrder || a.sort || 999) - Number(b.sortOrder || b.sort || 999));

  res.json(items);
});

app.get("/api/categories", (req, res) => {
  const menuData = getMenuData();
  const categories = [...menuData.categories].sort(
    (a, b) => Number(a.sortOrder || a.sort || 0) - Number(b.sortOrder || b.sort || 0)
  );

  res.json(categories);
});

app.get("/api/addons", (req, res) => {
  const menuData = getMenuData();
  res.json({
    success: true,
    addons: menuData.addons,
    list: flattenAddons(menuData.addons)
  });
});

app.get("/api/menu-full", (req, res) => {
  const menuData = getMenuData();

  res.json({
    ...menuData,
    settings: getSettings()
  });
});

function formatOrderMessage(order) {
  const lines = [];
 
  lines.push(`🧾 Đơn mới bàn ${safeText(order.table, "-")}`);
 
  const items = Array.isArray(order.items) ? order.items : [];
 
  items.forEach((item) => {
    const qty = Number(item.qty || 1);
    const name =
      item.name_vi ||
      item.name ||
      item.name_en ||
      item.name_zh ||
      "Món";
 
    const price = Number(item.price || 0);
    const subtotal = Number(item.subtotal || item.lineTotal || price * qty || 0);
 
    lines.push(`${name} x${qty} - ${subtotal} NT$`);
 
    if (item.optionText) {
      lines.push(`  • Chọn: ${item.optionText}`);
    }
 
    if (item.selectedOptions) {
      if (item.selectedOptions.phoType) {
        lines.push(`  • Phở: ${item.selectedOptions.phoType}`);
      }
      if (item.selectedOptions.riceSpicy) {
        lines.push(`  • Cay: ${item.selectedOptions.riceSpicy}`);
      }
    }
 
    if (Array.isArray(item.optionLabels) && item.optionLabels.length > 0) {
      item.optionLabels.forEach((opt) => {
        const group = opt.group || opt.label || "Option";
        const value = opt.value || opt.name || "";
        lines.push(`  • ${group}: ${value}`);
      });
    }
 
    if (Array.isArray(item.addons) && item.addons.length > 0) {
      item.addons.forEach((addon) => {
        const addonName =
          addon.name_vi ||
          addon.name ||
          addon.name_en ||
          addon.name_zh ||
          "Món thêm";
 
        const addonQty = Number(addon.qty || 1);
        const addonPrice = Number(addon.price || 0);
 
        lines.push(`  + ${addonName} x${addonQty} - ${addonPrice} NT$`);
      });
    }
 
    if (item.note || item.itemNote) {
      lines.push(`  📝 Ghi chú món: ${item.note || item.itemNote}`);
    }
  });
 
  if (Array.isArray(order.noIngredients) && order.noIngredients.length > 0) {
    lines.push("");
    lines.push(`🚫 Không: ${order.noIngredients.join(", ")}`);
  }
 
  if (order.customerNote || order.note) {
    lines.push(`📝 Ghi chú: ${order.customerNote || order.note}`);
  }
 
  lines.push("");
  lines.push(`💰 Tổng: ${Number(order.total || 0)} NT$`);
 
  return lines.join("\n");
}

app.post("/order", async (req, res) => {
  try {
    const body = req.body || {};
    const table = safeText(body.table).trim();
    const items = Array.isArray(body.items) ? body.items : [];

    if (!table) {
      return res.status(400).json({ success: false, message: "Missing table" });
    }

    if (!items.length) {
      return res.status(400).json({ success: false, message: "No items" });
    }

    const total =
      Number(body.total) ||
      items.reduce((sum, item) => {
        const subtotal = Number(item.subtotal || item.lineTotal || 0);
        if (subtotal) return sum + subtotal;
        return sum + Number(item.price || 0) * Number(item.qty || 1);
      }, 0);

    const orderRecord = {
      id: Date.now(),
      table,
      language: body.language || "vi",
      items,
      total,
      customerNote: body.customerNote || "",
      note: body.note || "",
      noIngredients: Array.isArray(body.noIngredients) ? body.noIngredients : [],
      status: "new",
      createdAt: new Date().toISOString()
    };

    const orders = readJson(ORDERS_FILE, []);
    orders.unshift(orderRecord);
    writeJson(ORDERS_FILE, orders);

    try {
      await sendTelegram(buildOrderMessageForTelegram(orderRecord));
    } catch (error) {
      console.log("TELEGRAM ORDER ERROR:", error.message);
    }


    try {
      const printResults = await printOrderSafe(orderRecord);
      console.log("PRINT RESULTS:", printResults);
    } catch (printError) {
      console.log("PRINT ERROR:", printError.message);
    }

    res.json({ success: true, order: orderRecord });
  } catch (error) {
    console.log("ORDER ERROR:", error.message);
    res.status(500).json({ success: false, message: "Order failed" });
  }
});

app.post("/call-staff", async (req, res) => {
  try {
    const table = safeText(req.body.table).trim();
    const message = safeText(req.body.message || "Khách cần hỗ trợ");
    const flags = Array.isArray(req.body.flags) ? req.body.flags : [];

    if (!table) {
      return res.status(400).json({ success: false, message: "Missing table" });
    }

    const lines = [];
    lines.push("🔔 GOKA STAFF REQUEST");
    lines.push(`Bàn/Table: ${table}`);
    lines.push(`Nội dung: ${message}`);
    if (flags.length) lines.push(`Yêu cầu: ${flags.join(", ")}`);

    try {
      await sendTelegram(lines.join("\n"));
    } catch (error) {
      console.log("TELEGRAM STAFF ERROR:", error.message);
    }

    res.json({ success: true });
  } catch (error) {
    console.log("CALL STAFF ERROR:", error.message);
    res.status(500).json({ success: false });
  }
});

app.get("/api/admin/menu-full", checkAdmin, (req, res) => {
  res.json({
    ...getMenuData(),
    settings: getSettings()
  });
});

app.put("/api/admin/menu-full", checkAdmin, (req, res) => {
  try {
    const body = req.body || {};
    const data = {
      categories: Array.isArray(body.categories) ? body.categories : DEFAULT_MENU_DATA.categories,
      addons: body.addons || DEFAULT_MENU_DATA.addons,
      items: Array.isArray(body.items) ? body.items : DEFAULT_MENU_DATA.items
    };

    backupFile(MENU_FILE);
    const saved = saveMenuData(data);

    if (body.settings) {
      backupFile(SETTINGS_FILE);
      saveSettings(body.settings);
    }

    res.json({ success: true, data: saved, settings: getSettings() });
  } catch (error) {
    console.log("ADMIN SAVE MENU ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/admin/orders", checkAdmin, (req, res) => {
  res.json(readJson(ORDERS_FILE, []));
});

app.put("/api/admin/settings", checkAdmin, (req, res) => {
  try {
    backupFile(SETTINGS_FILE);
    saveSettings(req.body || {});
    res.json({ success: true, settings: getSettings() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/admin/category", checkAdmin, (req, res) => {
  const data = getMenuData();
  const category = req.body || {};

  if (!category.id) category.id = `cat_${Date.now()}`;
  data.categories.push(category);
  saveMenuData(data);

  res.json({ success: true, category });
});

app.put("/api/admin/category/:id", checkAdmin, (req, res) => {
  const data = getMenuData();

  data.categories = data.categories.map((category) =>
    category.id === req.params.id ? { ...category, ...req.body, id: req.params.id } : category
  );

  saveMenuData(data);
  res.json({ success: true });
});

app.delete("/api/admin/category/:id", checkAdmin, (req, res) => {
  const data = getMenuData();

  data.categories = data.categories.filter((category) => category.id !== req.params.id);

  saveMenuData(data);
  res.json({ success: true });
});

app.post("/api/admin/item", checkAdmin, (req, res) => {
  const data = getMenuData();
  const item = req.body || {};

  if (!item.id) item.id = `item_${Date.now()}`;
  data.items.push(item);
  saveMenuData(data);

  res.json({ success: true, item });
});

app.put("/api/admin/item/:id", checkAdmin, (req, res) => {
  const data = getMenuData();

  data.items = data.items.map((item) =>
    item.id === req.params.id ? { ...item, ...req.body, id: req.params.id } : item
  );

  saveMenuData(data);
  res.json({ success: true });
});

app.delete("/api/admin/item/:id", checkAdmin, (req, res) => {
  const data = getMenuData();

  data.items = data.items.map((item) =>
    item.id === req.params.id
      ? { ...item, deleted: true, deletedAt: new Date().toISOString() }
      : item
  );

  saveMenuData(data);
  res.json({ success: true, archived: true });
});

app.get("/api/admin/items/trash", checkAdmin, (req, res) => {
  const data = getMenuData();
  const trash = data.items.filter((item) => item.deleted === true);
  res.json({ success: true, items: trash });
});

app.post("/api/admin/item/:id/restore", checkAdmin, (req, res) => {
  const data = getMenuData();
  let restored = false;

  data.items = data.items.map((item) => {
    if (item.id === req.params.id && item.deleted === true) {
      restored = true;
      const next = { ...item, deleted: false };
      delete next.deletedAt;
      return next;
    }
    return item;
  });

  if (!restored) {
    return res.status(404).json({ success: false, message: "Item not found in trash" });
  }

  saveMenuData(data);
  res.json({ success: true, restored: true });
});

app.delete("/api/admin/item/:id/permanent", checkAdmin, (req, res) => {
  const data = getMenuData();
  const before = data.items.length;

  data.items = data.items.filter((item) => item.id !== req.params.id);

  if (data.items.length === before) {
    return res.status(404).json({ success: false, message: "Item not found" });
  }

  saveMenuData(data);
  res.json({ success: true, permanentlyDeleted: true });
});

app.put("/api/admin/addons", checkAdmin, (req, res) => {
  const data = getMenuData();

  data.addons = req.body.addons || req.body || DEFAULT_MENU_DATA.addons;

  saveMenuData(data);
  res.json({ success: true, addons: data.addons });
});

app.post("/api/admin/reset-menu-seed", checkAdmin, (req, res) => {
  backupFile(MENU_FILE);
  saveMenuData(DEFAULT_MENU_DATA);
  res.json({ success: true, data: DEFAULT_MENU_DATA });
});


/* SERVER MAX: admin order status + reprint */
app.put("/api/admin/orders/:id/status", checkAdmin, (req, res) => {
  try {
    const orders = readJson(ORDERS_FILE, []);
    const orderId = String(req.params.id);
    const nextStatus = req.body.status || "new";

    const updated = orders.map((order) => {
      if (String(order.id) === orderId) {
        return {
          ...order,
          status: nextStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return order;
    });

    writeJson(ORDERS_FILE, updated);

    res.json({
      success: true,
      orders: updated
    });
  } catch (error) {
    console.log("ADMIN ORDER STATUS ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/admin/orders/:id/reprint", checkAdmin, async (req, res) => {
  try {
    const orders = readJson(ORDERS_FILE, []);
    const order = orders.find((o) => String(o.id) === String(req.params.id));

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const printResults = await printOrderSafe(order);

    res.json({
      success: true,
      printResults
    });
  } catch (error) {
    console.log("ADMIN REPRINT ERROR:", error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


/*
Giữ mấy endpoint community cũ để nếu frontend/cache cũ gọi vào thì không crash.
Frontend mới đã bỏ phần này.
*/
app.get("/api/community-status", (req, res) => {
  res.json({
    success: true,
    disabled: true,
    message: "Community feature removed from current frontend",
    dailyBase: 0,
    dailyFreeAvailable: 0,
    totalSponsored: 0
  });
});

app.post("/api/community/free", (req, res) => {
  res.json({ success: false, disabled: true, message: "Community feature removed" });
});

app.post("/api/community/sponsor", (req, res) => {
  res.json({ success: false, disabled: true, message: "Community feature removed" });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API not found",
    path: req.path
  });
});

app.listen(PORT, () => {
  console.log(`GOKA backend full upgraded running on port ${PORT}`);
  console.log(`Admin token active: ${ADMIN_TOKEN ? "YES" : "NO"}`);
  console.log(`Telegram active: ${BOT_TOKEN && CHAT_ID ? "YES" : "NO"}`);
});