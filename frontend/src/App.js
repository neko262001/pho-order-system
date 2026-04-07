import React, { useEffect, useMemo, useState } from "react";

const BACKEND_URL = "https://pho-order-system.onrender.com";

const TEXT = {
  vi: {
    title: "Huy Siu Nhân",
    subtitle: "Đặt món nhanh chóng - giao diện đa ngôn ngữ",
    tableLabel: "Bàn số",
    qrOnlyWarning: "Vui lòng quét mã QR tại bàn để đặt món.",
    categories: { all: "Tất cả", spicy: "Mỳ cay", pho: "Phở", rice: "Cơm", tea: "Trà trái cây", fried: "Đồ rán" },
    featured: "Món nổi bật",
    add: "Thêm",
    soldOut: "Tạm hết",
    cart: "Giỏ hàng",
    emptyCart: "Chưa có món nào",
    total: "Tổng cộng",
    clear: "Xóa giỏ",
    order: "Đặt món",
    qrToOrder: "Quét QR để đặt món",
    chooseItemsFirst: "Vui lòng chọn món trước.",
    success: "Đặt món thành công!",
    fail: "Lỗi đặt món!",
    backendError: "Không kết nối server!",
    spicyLevelTitle: "Chọn cấp độ cay",
    phoTypeTitle: "Chọn loại thịt",
    rare: "Tái",
    wellDone: "Chín",
    rareWellDone: "Tái + Chín",
    confirmAdd: "Xác nhận thêm món",
    cancel: "Hủy",
    callStaff: "Gọi nhân viên",
    messageStaff: "Nhắn nhân viên",
    staffPlaceholder: "Ví dụ: Cho xin thêm chén, muỗng, nước lọc...",
    sendMessage: "Gửi yêu cầu",
    quickActionsTitle: "Yêu cầu nhanh",
    quickBowl: "Cho xin thêm chén",
    quickSpoon: "Cho xin thêm muỗng đũa",
    quickWater: "Cho xin thêm nước",
    quickBill: "Cho xin tính tiền",
    staffSent: "Đã gửi yêu cầu cho nhân viên!",
    staffNeedQR: "Vui lòng quét QR tại bàn trước khi gọi nhân viên.",
    loading: "Đang gửi..."
  },
  zh: {
    title: "GOKA",
    subtitle: "快速點餐 - 多語言介面",
    tableLabel: "桌號",
    qrOnlyWarning: "請掃描桌上的 QR Code 才能點餐。",
    categories: { all: "全部", spicy: "部隊鍋", pho: "河粉", rice: "飯", tea: "果茶", fried: "炸物" },
    featured: "推薦餐點",
    add: "加入",
    soldOut: "暫時沒有",
    cart: "購物車",
    emptyCart: "尚未選擇餐點",
    total: "總計",
    clear: "清空購物車",
    order: "下單",
    qrToOrder: "掃描 QR 才能點餐",
    chooseItemsFirst: "請先選擇餐點。",
    success: "點餐成功！",
    fail: "下單失敗！",
    backendError: "無法連接伺服器！",
    spicyLevelTitle: "選擇辣度",
    phoTypeTitle: "選擇牛肉熟度",
    rare: "生",
    wellDone: "熟",
    rareWellDone: "生 + 熟",
    confirmAdd: "確認加入餐點",
    cancel: "取消",
    callStaff: "呼叫店員",
    messageStaff: "傳訊息給店員",
    staffPlaceholder: "例如：請給我多一個碗、湯匙、水...",
    sendMessage: "送出請求",
    quickActionsTitle: "快速需求",
    quickBowl: "請再給我一個碗",
    quickSpoon: "請再給我餐具",
    quickWater: "請再給我水",
    quickBill: "請幫我結帳",
    staffSent: "已傳送給店員！",
    staffNeedQR: "請先掃描桌上的 QR Code。",
    loading: "傳送中..."
  },
  en: {
    title: "Goka",
    subtitle: "Fast ordering - multilingual interface",
    tableLabel: "Table",
    qrOnlyWarning: "Please scan the table QR code to place an order.",
    categories: { all: "All", spicy: "Spicy Pot", pho: "Pho", rice: "Rice", tea: "Fruit Tea", fried: "Fried Snacks" },
    featured: "Featured Dishes",
    add: "Add",
    soldOut: "Sold Out",
    cart: "Cart",
    emptyCart: "No items yet",
    total: "Total",
    clear: "Clear Cart",
    order: "Place Order",
    qrToOrder: "Scan QR to order",
    chooseItemsFirst: "Please choose items first.",
    success: "Order placed successfully!",
    fail: "Order failed!",
    backendError: "Cannot connect to server!",
    spicyLevelTitle: "Choose spicy level",
    phoTypeTitle: "Choose beef type",
    rare: "Rare",
    wellDone: "Well done",
    rareWellDone: "Rare + Well done",
    confirmAdd: "Confirm add",
    cancel: "Cancel",
    callStaff: "Call staff",
    messageStaff: "Message staff",
    staffPlaceholder: "Example: Please bring more bowls, spoons, water...",
    sendMessage: "Send request",
    quickActionsTitle: "Quick requests",
    quickBowl: "Need an extra bowl",
    quickSpoon: "Need extra utensils",
    quickWater: "Need more water",
    quickBill: "Please bring the bill",
    staffSent: "Request sent to staff!",
    staffNeedQR: "Please scan the table QR code first.",
    loading: "Sending..."
  }
};

function App() {
  const [lang, setLang] = useState("vi");
  const [table, setTable] = useState("");
  const [hasValidTable, setHasValidTable] = useState(false);
  const [category, setCategory] = useState("all");
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [optionModalOpen, setOptionModalOpen] = useState(false);
  const [communityStatus, setCommunityStatus] = useState({
  dailyBase: 10,
  dailyFreeAvailable: 10,
  totalSponsored: 0,
  lastResetDate: ""
});
const [communityLoading, setCommunityLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSpicyLevel, setSelectedSpicyLevel] = useState(1);
  const [selectedPhoType, setSelectedPhoType] = useState("");
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [staffMessage, setStaffMessage] = useState("");
  const [sendingStaffMessage, setSendingStaffMessage] = useState(false);

  const t = TEXT[lang];

const communityText = {
  freeTitle: lang === "vi" ? "Phở miễn phí hôm nay"
    : lang === "zh" ? "今日免費牛肉河粉"
    : "Today's Free Pho",

  freeDesc: lang === "vi" ? "Dành cho người cần giúp đỡ"
    : lang === "zh" ? "提供給需要的人"
    : "For people in need",

  freeRemaining: lang === "vi" ? "Còn lại:"
    : lang === "zh" ? "剩餘："
    : "Remaining:",

  freeButton: lang === "vi" ? "Nhận miễn phí"
    : lang === "zh" ? "免費領取"
    : "Get Free",

  freeSoldOut: lang === "vi" ? "Hết suất"
    : lang === "zh" ? "已送完"
    : "Sold out",

  sponsorTitle: lang === "vi" ? "Mời một tô phở"
    : lang === "zh" ? "請一碗河粉"
    : "Sponsor a Bowl",

  sponsorDesc: lang === "vi" ? "Đóng góp cho cộng đồng"
    : lang === "zh" ? "支持社區"
    : "Support community",

  sponsorTotal: lang === "vi" ? "Đã mời:"
    : lang === "zh" ? "已請："
    : "Total:",

  sponsorButton: lang === "vi" ? "Mời ngay"
    : lang === "zh" ? "立即請"
    : "Sponsor",

  sponsorConfirm: lang === "vi" ? "Bạn có chắc muốn mời phở?"
    : lang === "zh" ? "確定要請客嗎？"
    : "Are you sure to sponsor pho?",

  freeConfirm: lang === "vi" ? "Bạn có chắc muốn nhận suất miễn phí?"
    : lang === "zh" ? "確定要領取免費河粉嗎？"
    : "Are you sure to claim free pho?",

  priceUnit: lang === "vi" ? "tô"
    : lang === "zh" ? "碗"
    : "bowl"
};
const loadCommunityStatus = () => {
  fetch(`${BACKEND_URL}/api/community-status`)
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        setCommunityStatus({
          dailyBase: data.dailyBase,
          dailyFreeAvailable: data.dailyFreeAvailable,
          totalSponsored: data.totalSponsored,
          lastResetDate: data.lastResetDate
        });
      }
    })
    .catch(() => {
      setCommunityStatus({
        dailyBase: 10,
        dailyFreeAvailable: 10,
        totalSponsored: 0,
        lastResetDate: ""
      });
    });
};

const orderCommunityFreePho = async () => {
  if (!hasValidTable) {
    alert(t.qrOnlyWarning);
    return;
  }

  const ok = window.confirm(communityText.freeConfirm);
  if (!ok) return;

  try {
    setCommunityLoading(true);

    const res = await fetch(`${BACKEND_URL}/api/community/free`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        table,
        qty: 1
      })
    });

    const data = await res.json();
    setCommunityLoading(false);

    if (data.success) {
      alert(data.message || "OK");
      loadCommunityStatus();
    } else {
      alert(data.message || "Fail");
    }
  } catch (error) {
    setCommunityLoading(false);
    alert(t.backendError);
  }
};

const sponsorCommunityPho = async () => {
  if (!hasValidTable) {
    alert(t.qrOnlyWarning);
    return;
  }

  const ok = window.confirm(communityText.sponsorConfirm);
  if (!ok) return;

  try {
    setCommunityLoading(true);

    const res = await fetch(`${BACKEND_URL}/api/community/sponsor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        table,
        qty: 1,
        pricePerBowl: 150
      })
    });

    const data = await res.json();
    setCommunityLoading(false);

    if (data.success) {
      alert(data.message || "OK");
      loadCommunityStatus();
    } else {
      alert(data.message || "Fail");
    }
  } catch (error) {
    setCommunityLoading(false);
    alert(t.backendError);
  }
};

  useEffect(() => {
    loadCommunityStatus();
    fetch(`${BACKEND_URL}/api/menu`)
      .then((res) => res.json())
      .then((data) => setMenu(Array.isArray(data) ? data : []))
      .catch(() => setMenu([]));

    const params = new URLSearchParams(window.location.search);
    const qrTable = params.get("table");
    if (qrTable && qrTable.trim() !== "") {
      setTable(qrTable.trim());
      setHasValidTable(true);
    } else {
      setTable("");
      setHasValidTable(false);
    }
  }, []);

  const featuredMenu = useMemo(() => menu.filter((item) => item.featured), [menu]);
  const filteredMenu = useMemo(() => {
    if (category === "all") return menu;
    return menu.filter((item) => item.category === category);
  }, [category, menu]);

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.qty, 0), [cart]);

  const getItemName = (item) => (lang === "vi" ? item.name_vi : lang === "zh" ? item.name_zh : item.name_en);
  const getItemDesc = (item) => (lang === "vi" ? item.description_vi : lang === "zh" ? item.description_zh : item.description_en);

  const getOptionLabel = (item) => {
    if (!item.selectedOptions) return "";
    const parts = [];
    if (item.selectedOptions.spicyLevel) {
      if (lang === "vi") parts.push(`Cay ${item.selectedOptions.spicyLevel}`);
      if (lang === "zh") parts.push(`辣度 ${item.selectedOptions.spicyLevel}`);
      if (lang === "en") parts.push(`Spicy ${item.selectedOptions.spicyLevel}`);
    }
    if (item.selectedOptions.phoType) {
      if (item.selectedOptions.phoType === "tai") parts.push(t.rare);
      if (item.selectedOptions.phoType === "chin") parts.push(t.wellDone);
      if (item.selectedOptions.phoType === "taichin") parts.push(t.rareWellDone);
    }
    return parts.join(" • ");
  };

  const getCartIdentity = (item, options) => {
    const spicy = options?.spicyLevel ? `spicy-${options.spicyLevel}` : "spicy-none";
    const pho = options?.phoType ? `pho-${options.phoType}` : "pho-none";
    return `${item.id}-${spicy}-${pho}`;
  };

  const openOptionModal = (item) => {
    if (!item.available) return;
    setSelectedItem(item);
    setSelectedSpicyLevel(1);
    setSelectedPhoType(item.options?.phoType ? "tai" : "");
    if (item.options?.spicyLevel || item.options?.phoType) {
      setOptionModalOpen(true);
    } else {
      addToCartWithOptions(item, { spicyLevel: null, phoType: null });
    }
  };

  const closeOptionModal = () => {
    setOptionModalOpen(false);
    setSelectedItem(null);
    setSelectedSpicyLevel(1);
    setSelectedPhoType("");
  };

  const addToCartWithOptions = (item, options) => {
    const identity = getCartIdentity(item, options);
    setCart((prev) => {
      const exist = prev.find((i) => i.identity === identity);
      if (exist) {
        return prev.map((i) => (i.identity === identity ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...item, identity, name: item.name_vi, qty: 1, selectedOptions: options }];
    });
  };

  const confirmAddWithOptions = () => {
    if (!selectedItem) return;
    addToCartWithOptions(selectedItem, {
      spicyLevel: selectedItem.options?.spicyLevel ? selectedSpicyLevel : null,
      phoType: selectedItem.options?.phoType ? selectedPhoType : null
    });
    closeOptionModal();
  };

  const decreaseItem = (item) => {
    setCart((prev) => {
      const exist = prev.find((i) => i.identity === item.identity);
      if (!exist) return prev;
      if (exist.qty === 1) return prev.filter((i) => i.identity !== item.identity);
      return prev.map((i) => (i.identity === item.identity ? { ...i, qty: i.qty - 1 } : i));
    });
  };

  const increaseItem = (item) => {
    setCart((prev) => prev.map((i) => (i.identity === item.identity ? { ...i, qty: i.qty + 1 } : i)));
  };

  const removeFromCart = (item) => {
    setCart((prev) => prev.filter((i) => i.identity !== item.identity));
  };

  const clearCart = () => setCart([]);

  const buildVietnameseOrderName = (item) => {
    let suffix = "";
    if (item.selectedOptions?.spicyLevel) suffix += ` (Cay ${item.selectedOptions.spicyLevel})`;
    if (item.selectedOptions?.phoType === "tai") suffix += " (Tái)";
    if (item.selectedOptions?.phoType === "chin") suffix += " (Chín)";
    if (item.selectedOptions?.phoType === "taichin") suffix += " (Tái + Chín)";
    return `${item.name_vi}${suffix}`;
  };

  const order = async () => {
    if (!hasValidTable) return alert(t.qrOnlyWarning);
    if (cart.length === 0) return alert(t.chooseItemsFirst);

    const itemsForBackend = cart.map((item) => ({
      name: buildVietnameseOrderName(item),
      qty: item.qty,
      price: item.price
    }));

    try {
      const res = await fetch(`${BACKEND_URL}/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table, items: itemsForBackend })
      });
      const data = await res.json();
      if (data.success) {
        alert(t.success);
        setCart([]);
      } else {
        alert(t.fail);
      }
    } catch {
      alert(t.backendError);
    }
  };

  const openStaffModal = (preset = "") => {
    if (!hasValidTable) return alert(t.staffNeedQR);
    setStaffMessage(preset);
    setStaffModalOpen(true);
  };

  const closeStaffModal = () => {
    setStaffModalOpen(false);
    setStaffMessage("");
    setSendingStaffMessage(false);
  };

  const sendStaffRequest = async () => {
    if (!hasValidTable) return alert(t.staffNeedQR);
    if (!staffMessage.trim()) return;

    try {
      setSendingStaffMessage(true);
      const res = await fetch(`${BACKEND_URL}/call-staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table, message: staffMessage.trim() })
      });
      const data = await res.json();
      if (data.success) {
        alert(t.staffSent);
        closeStaffModal();
      } else {
        alert(t.fail);
        setSendingStaffMessage(false);
      }
    } catch {
      alert(t.backendError);
      setSendingStaffMessage(false);
    }
  };

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-overlay">
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
      </header>

      <main className="main-layout">
        <section className="content">
          <div className="top-bar">
            <div className="language-box">
              <button className={lang === "vi" ? "lang-btn active" : "lang-btn"} onClick={() => setLang("vi")}>VI</button>
              <button className={lang === "zh" ? "lang-btn active" : "lang-btn"} onClick={() => setLang("zh")}>繁</button>
              <button className={lang === "en" ? "lang-btn active" : "lang-btn"} onClick={() => setLang("en")}>EN</button>
            </div>
            <div className="table-box">
              {hasValidTable ? <div className="table-fixed"><strong>{t.tableLabel}:</strong> {table}</div> : <div className="table-warning">{t.qrOnlyWarning}</div>}
            </div>
          </div>

          <section className="staff-tools">
            <div className="staff-card">
              <h3>{t.callStaff}</h3>
              <p>{lang === "vi" ? "Cần thêm chén, muỗng, nước hoặc tính tiền?" : lang === "zh" ? "需要碗、餐具、水或結帳？" : "Need bowls, utensils, water, or the bill?"}</p>
              <div className="quick-actions">
                <button onClick={() => openStaffModal(t.quickBowl)}>{t.quickBowl}</button>
                <button onClick={() => openStaffModal(t.quickSpoon)}>{t.quickSpoon}</button>
                <button onClick={() => openStaffModal(t.quickWater)}>{t.quickWater}</button>
                <button onClick={() => openStaffModal(t.quickBill)}>{t.quickBill}</button>
              </div>
              <button className="staff-main-btn" onClick={() => openStaffModal("")}>{t.messageStaff}</button>
            </div>
          </section>

          <section className="featured-section">
            <h2>{t.featured}</h2>
            <div className="featured-grid">
              {featuredMenu.map((item) => (
                <div className="featured-card" key={`featured-${item.id}`}>
                  <img src={item.image} alt={getItemName(item)} />
                  <div className="featured-card-body">
                    <h3>{getItemName(item)}</h3>
                    <p className="featured-price">{item.price.toLocaleString()} NT$</p>
                    <small>{getItemDesc(item)}</small>
                    <button disabled={!item.available} className={!item.available ? "disabled-btn" : ""} onClick={() => openOptionModal(item)}>{item.available ? t.add : t.soldOut}</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="category-tabs">
            {Object.keys(t.categories).map((cat) => (
              <button key={cat} className={category === cat ? "tab active" : "tab"} onClick={() => setCategory(cat)}>{t.categories[cat]}</button>
            ))}
          </div>

<section className="community-section">
  <div className="community-grid">
    <div className="community-card free-card">
      <h3>{communityText.freeTitle}</h3>
      <p>{communityText.freeDesc}</p>
      <div className="community-count">
        {communityText.freeRemaining} {communityStatus.dailyFreeAvailable}
      </div>
      <button
        className="community-btn"
        onClick={orderCommunityFreePho}
        disabled={communityLoading || communityStatus.dailyFreeAvailable <= 0}
      >
        {communityStatus.dailyFreeAvailable > 0
          ? communityText.freeButton
          : communityText.freeSoldOut}
      </button>
    </div>

    <div className="community-card sponsor-card">
      <h3>{communityText.sponsorTitle}</h3>
      <p>{communityText.sponsorDesc}</p>
      <div className="community-count">
        {communityText.sponsorTotal} {communityStatus.totalSponsored}
      </div>
      <div className="community-price">150 NT$ / {communityText.priceUnit}</div>
      <button
        className="community-btn"
        onClick={sponsorCommunityPho}
        disabled={communityLoading}
      >
        {communityText.sponsorButton}
      </button>
    </div>
  </div>
</section>

          <section className="menu-grid">
            {filteredMenu.map((item) => {
              const cartCount = cart.filter((i) => i.id === item.id).reduce((sum, i) => sum + i.qty, 0);
              return (
                <div className="menu-card" key={item.id}>
                  <img src={item.image} alt={getItemName(item)} />
                  <div className="menu-card-body">
                    <h3>{getItemName(item)}</h3>
                    <p className="price">{item.price.toLocaleString()} NT$</p>
                    <small className="desc">{getItemDesc(item)}</small>
                    {item.options?.spicyLevel && <div className="option-hint">🌶 1 - 7</div>}
                    {item.options?.phoType && <div className="option-hint">🥩 {t.rare} / {t.wellDone} / {t.rareWellDone}</div>}
                    {item.available ? (
                      <div className="card-actions">
                        <button className="open-options-btn" onClick={() => openOptionModal(item)}>{t.add}</button>
                        <span className="qty-badge total-badge">{cartCount}</span>
                      </div>
                    ) : <div className="sold-out-badge">{t.soldOut}</div>}
                  </div>
                </div>
              );
            })}
          </section>
        </section>

        <aside className="cart-panel">
          <div className="cart-box">
            <h2>🛒 {t.cart}</h2>
            {cart.length === 0 ? <p className="empty-cart">{t.emptyCart}</p> : (
              <>
                <div className="cart-list">
                  {cart.map((item) => (
                    <div className="cart-item" key={item.identity}>
                      <div className="cart-item-info">
                        <strong>{getItemName(item)}</strong>
                        {getOptionLabel(item) && <small className="cart-option-line">{getOptionLabel(item)}</small>}
                        <span>{item.qty} x {item.price.toLocaleString()} NT$</span>
                      </div>
                      <div className="cart-item-actions">
                        <button onClick={() => decreaseItem(item)}>−</button>
                        <button onClick={() => increaseItem(item)}>+</button>
                        <button onClick={() => removeFromCart(item)}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-footer">
                  <div className="total-line"><span>{t.total}</span><strong>{total.toLocaleString()} NT$</strong></div>
                  <button className="clear-btn" onClick={clearCart}>{t.clear}</button>
                  <button className="order-btn" onClick={order} disabled={!hasValidTable}>{hasValidTable ? t.order : t.qrToOrder}</button>
                </div>
              </>
            )}
          </div>
        </aside>
      </main>

      {optionModalOpen && selectedItem && (
        <div className="modal-overlay" onClick={closeOptionModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>{getItemName(selectedItem)}</h2>
            <p className="modal-desc">{getItemDesc(selectedItem)}</p>
            {selectedItem.options?.spicyLevel && (
              <div className="modal-section">
                <h3>{t.spicyLevelTitle}</h3>
                <div className="level-grid">
                  {[1,2,3,4,5,6,7].map((level) => (
                    <button key={level} className={selectedSpicyLevel === level ? "level-btn active" : "level-btn"} onClick={() => setSelectedSpicyLevel(level)}>{level}</button>
                  ))}
                </div>
              </div>
            )}
            {selectedItem.options?.phoType && (
              <div className="modal-section">
                <h3>{t.phoTypeTitle}</h3>
                <div className="pho-type-grid">
                  <button className={selectedPhoType === "tai" ? "pho-type-btn active" : "pho-type-btn"} onClick={() => setSelectedPhoType("tai")}>{t.rare}</button>
                  <button className={selectedPhoType === "chin" ? "pho-type-btn active" : "pho-type-btn"} onClick={() => setSelectedPhoType("chin")}>{t.wellDone}</button>
                  <button className={selectedPhoType === "taichin" ? "pho-type-btn active" : "pho-type-btn"} onClick={() => setSelectedPhoType("taichin")}>{t.rareWellDone}</button>
                </div>
              </div>
            )}
            <div className="modal-actions">
              <button className="cancel-btn" onClick={closeOptionModal}>{t.cancel}</button>
              <button className="confirm-btn" onClick={confirmAddWithOptions}>{t.confirmAdd}</button>
            </div>
          </div>
        </div>
      )}

      {staffModalOpen && (
        <div className="modal-overlay" onClick={closeStaffModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>{t.messageStaff}</h2>
            <div className="modal-section">
              <h3>{t.quickActionsTitle}</h3>
              <div className="quick-actions">
                <button onClick={() => setStaffMessage(t.quickBowl)}>{t.quickBowl}</button>
                <button onClick={() => setStaffMessage(t.quickSpoon)}>{t.quickSpoon}</button>
                <button onClick={() => setStaffMessage(t.quickWater)}>{t.quickWater}</button>
                <button onClick={() => setStaffMessage(t.quickBill)}>{t.quickBill}</button>
              </div>
            </div>
            <textarea className="staff-textarea" placeholder={t.staffPlaceholder} value={staffMessage} onChange={(e) => setStaffMessage(e.target.value)} />
            <div className="modal-actions">
              <button className="cancel-btn" onClick={closeStaffModal}>{t.cancel}</button>
              <button className="confirm-btn" onClick={sendStaffRequest} disabled={sendingStaffMessage}>{sendingStaffMessage ? t.loading : t.sendMessage}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
