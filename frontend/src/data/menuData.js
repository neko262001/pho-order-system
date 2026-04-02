export const menuData = {
  categories: [
    { id: "pho", name: { vn: "Phở", tw: "牛肉粉", en: "Pho" } },
    { id: "rice", name: { vn: "Cơm", tw: "米飯", en: "Rice" } },
    { id: "drink", name: { vn: "Nước", tw: "飲料", en: "Drinks" } },
    { id: "coffee", name: { vn: "Cà phê", tw: "咖啡", en: "Coffee" } }
  ],
  items: [
    { id: 1, name: { vn: "Phở bò tái", tw: "生牛肉粉", en: "Pho Beef Rare" }, price: 60000, category: "pho", img: "https://example.com/pho1.jpg" },
    { id: 2, name: { vn: "Phở gà", tw: "雞肉粉", en: "Pho Chicken" }, price: 55000, category: "pho", img: "https://example.com/pho2.jpg" },
    { id: 3, name: { vn: "Cơm rang Dương Châu", tw: "揚州炒飯", en: "Yangzhou Fried Rice" }, price: 50000, category: "rice", img: "https://example.com/rice1.jpg" },
    { id: 4, name: { vn: "Cà phê sữa đá", tw: "冰奶咖啡", en: "Iced Coffee with Milk" }, price: 20000, category: "coffee", img: "https://example.com/coffee1.jpg" },
    { id: 5, name: { vn: "Trà đào cam sả", tw: "蜜桃香茶", en: "Peach Lemongrass Tea" }, price: 25000, category: "drink", img: "https://example.com/drink1.jpg" },
    // thêm tất cả món VIP ở đây, >1500 dòng với ảnh + đa ngôn ngữ
  ]
};