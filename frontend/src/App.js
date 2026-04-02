import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [table, setTable] = useState("");
  const [cart, setCart] = useState([]);
  const [lang, setLang] = useState("vi");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(false);

  // 👉 ENV backend (fallback nếu thiếu)
  const BACKEND_URL =
    process.env.REACT_APP_API_URL || "https://pho-order-system.onrender.com";

  const menu = [
    { name_vi: "Phở bò", name_zh: "牛肉河粉", name_en: "Beef Pho", price: 60000, category: "pho" },
    { name_vi: "Phở gà", name_zh: "雞肉河粉", name_en: "Chicken Pho", price: 55000, category: "pho" },
    { name_vi: "Cơm rang", name_zh: "炒飯", name_en: "Fried Rice", price: 50000, category: "com" },
    { name_vi: "Cơm sườn", name_zh: "排骨飯", name_en: "Pork Chop Rice", price: 65000, category: "com" },
    { name_vi: "Cà phê sữa", name_zh: "奶咖啡", name_en: "Milk Coffee", price: 20000, category: "coffee" },
    { name_vi: "Trà trái cây", name_zh: "水果茶", name_en: "Fruit Tea", price: 25000, category: "drink" },
    { name_vi: "Nước ngọt", name_zh: "汽水", name_en: "Soft Drink", price: 15000, category: "drink" },
    { name_vi: "Bánh mì", name_zh: "法國麵包", name_en: "Baguette", price: 25000, category: "com" },
    { name_vi: "Sinh tố bơ", name_zh: "牛油果冰沙", name_en: "Avocado Smoothie", price: 30000, category: "drink" },
    { name_vi: "Cà phê đen", name_zh: "黑咖啡", name_en: "Black Coffee", price: 18000, category: "coffee" }
  ];

  const text = {
    banner: { vi: "🍜 Quán Phở VIP PRO", zh: "🍜 高級河粉餐廳", en: "🍜 VIP Pho Restaurant" },
    selectTable: { vi: "Nhập số bàn...", zh: "輸入桌號...", en: "Enter table number..." },
    add: { vi: "Thêm", zh: "加入", en: "Add" },
    cartEmpty: { vi: "Chưa có món", zh: "尚無餐點", en: "No items" },
    placeOrder: { vi: "Đặt món", zh: "下單", en: "Order" },
    alertChoose: { vi: "Chọn bàn và món trước!", zh: "請先選擇桌號和餐點!", en: "Select table and items first!" },
    alertSuccess: { vi: "Đặt món thành công!", zh: "訂單 đã thành công!", en: "Order placed successfully!" },
    alertFail: { vi: "Lỗi gửi đơn!", zh: "送單失敗!", en: "Failed to send order!" },
    alertBackend: { vi: "Không thể kết nối server", zh: "無法連接服務器", en: "Cannot connect to server" }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("table");
    if (t) setTable(t);
  }, []);

  const addToCart = (item) => {
    setCart((prev) => {
      const exist = prev.find((i) => i.name_vi === item.name_vi);
      if (exist) {
        return prev.map((i) =>
          i.name_vi === item.name_vi ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const changeQty = (item, delta) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.name_vi === item.name_vi
            ? { ...i, qty: i.qty + delta }
            : i
        )
        .filter((i) => i.qty > 0)
    );
  };

  const removeFromCart = (item) => {
    setCart((prev) => prev.filter((i) => i.name_vi !== item.name_vi));
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const order = async () => {
    if (!table || cart.length === 0) {
      alert(text.alertChoose[lang]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table, items: cart })
      });

      const data = await res.json();

      if (data.success) {
        alert(text.alertSuccess[lang]);
        setCart([]);
      } else {
        alert(text.alertFail[lang]);
      }
    } catch (err) {
      alert(text.alertBackend[lang]);
      console.log(err);
    }
    setLoading(false);
  };

  const filteredMenu =
    category === "all"
      ? menu
      : menu.filter((i) => i.category === category);

  return (
    <div className="app-container">
      <div className="banner">
        <h1>{text.banner[lang]}</h1>
      </div>

      <div className="lang-select">
        <button onClick={() => setLang("vi")} className={lang === "vi" ? "active" : ""}>VI</button>
        <button onClick={() => setLang("zh")} className={lang === "zh" ? "active" : ""}>繁</button>
        <button onClick={() => setLang("en")} className={lang === "en" ? "active" : ""}>EN</button>
      </div>

      <input
        type="text"
        placeholder={text.selectTable[lang]}
        value={table}
        onChange={(e) => setTable(e.target.value)}
      />

      <div className="category-select">
        {["all","pho","com","drink","coffee"].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={category===cat ? "active" : ""}
          >
            {(() => {
              switch(cat){
                case "all": return lang==="vi"?"Tất cả":lang==="zh"?"全部":"All";
                case "pho": return lang==="vi"?"Phở":lang==="zh"?"河粉":"Pho";
                case "com": return lang==="vi"?"Cơm":lang==="zh"?"飯":"Rice";
                case "drink": return lang==="vi"?"Nước":lang==="zh"?"飲料":"Drink";
                case "coffee": return lang==="vi"?"Cà phê":lang==="zh"?"咖啡":"Coffee";
                default: return cat;
              }
            })()}
          </button>
        ))}
      </div>

      <div className="menu-list">
        {filteredMenu.map((item) => (
          <div key={item.name_vi}>
            <h3>{lang==="vi"?item.name_vi:lang==="zh"?item.name_zh:item.name_en}</h3>
            <p>{item.price.toLocaleString()} đ</p>
            <button onClick={() => addToCart(item)}>
              {text.add[lang]}
            </button>
          </div>
        ))}
      </div>

      <div className="cart">
        <h3>🛒 Cart</h3>
        {cart.length===0 && <p>{text.cartEmpty[lang]}</p>}

        {cart.map((i) => (
          <div key={i.name_vi}>
            <span>
              {lang==="vi"?i.name_vi:lang==="zh"?i.name_zh:i.name_en}
            </span>

            <button onClick={()=>changeQty(i,-1)}>-</button>
            <span>{i.qty}</span>
            <button onClick={()=>changeQty(i,1)}>+</button>

            <button onClick={()=>removeFromCart(i)}>❌</button>
          </div>
        ))}

        {cart.length > 0 && (
          <>
            <h4>💰 Total: {total.toLocaleString()} đ</h4>
            <button onClick={order} disabled={loading}>
              {loading ? "..." : text.placeOrder[lang]}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;