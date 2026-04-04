import React, { useEffect, useMemo, useState } from "react";

const BACKEND_URL = "https://pho-order-system.onrender.com";
const ADMIN_TOKEN = "123456";

const emptyForm = {
  name_vi: "",
  name_zh: "",
  name_en: "",
  price: "",
  category: "spicy",
  image: "",
  description_vi: "",
  description_zh: "",
  description_en: "",
  featured: false,
  available: true,
  options: { spicyLevel: false, phoType: false }
};

function Admin() {
  if (!window.__ADMIN_OK__) {
    const pass = prompt("Nhập mật khẩu admin:");

    if (pass !== "0903636778") {
      alert("Sai mật khẩu");
      window.location.href = "/";
      return null;
    }

    window.__ADMIN_OK__ = true;
  }

  const [menu, setMenu] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalItems: 0, bestSellers: [] });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [uploading, setUploading] = useState(false);

  const adminHeaders = { Authorization: `Bearer ${ADMIN_TOKEN}` };

  const loadMenu = () => {
    fetch(`${BACKEND_URL}/api/menu`).then((res) => res.json()).then((data) => setMenu(Array.isArray(data) ? data : []));
  };

  const loadStats = () => {
    fetch(`${BACKEND_URL}/api/stats`, { headers: adminHeaders }).then((res) => res.json()).then((data) => setStats(data));
  };

  useEffect(() => {
    loadMenu();
    loadStats();
  }, []);

  const filteredMenu = useMemo(() => {
    return menu.filter((item) => {
      const matchCategory = filterCategory === "all" || item.category === filterCategory;
      const keyword = search.trim().toLowerCase();
      const matchSearch = !keyword || item.name_vi.toLowerCase().includes(keyword) || item.name_zh.toLowerCase().includes(keyword) || item.name_en.toLowerCase().includes(keyword);
      return matchCategory && matchSearch;
    });
  }, [menu, search, filterCategory]);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const setOptionField = (field, value) => setForm((prev) => ({ ...prev, options: { ...prev.options, [field]: value } }));
  const resetForm = () => { setForm(emptyForm); setEditingId(null); };

  const handleUploadImage = async (file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    setUploading(true);

    const res = await fetch(`${BACKEND_URL}/api/upload`, { method: "POST", headers: adminHeaders, body: fd });
    const data = await res.json();
    setUploading(false);
    if (data.success) setField("image", data.imageUrl);
    else alert("Upload ảnh thất bại");
  };

  const handleSubmit = async () => {
    if (!form.name_vi || !form.price || !form.category) return alert("Điền đủ tên, giá, danh mục");
    setLoading(true);

    const payload = { ...form, price: Number(form.price) };
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${BACKEND_URL}/api/menu/${editingId}` : `${BACKEND_URL}/api/menu`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", ...adminHeaders },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      alert(editingId ? "Đã cập nhật món" : "Đã thêm món");
      resetForm();
      loadMenu();
      loadStats();
    } else {
      alert("Lỗi admin hoặc token sai");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa món này?")) return;
    const res = await fetch(`${BACKEND_URL}/api/menu/${id}`, { method: "DELETE", headers: adminHeaders });
    const data = await res.json();
    if (data.success) { loadMenu(); loadStats(); } else alert("Không xóa được");
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name_vi: item.name_vi || "",
      name_zh: item.name_zh || "",
      name_en: item.name_en || "",
      price: item.price || "",
      category: item.category || "spicy",
      image: item.image || "",
      description_vi: item.description_vi || "",
      description_zh: item.description_zh || "",
      description_en: item.description_en || "",
      featured: Boolean(item.featured),
      available: item.available !== false,
      options: { spicyLevel: Boolean(item.options?.spicyLevel), phoType: Boolean(item.options?.phoType) }
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const moveItem = async (id, direction) => {
    const currentIndex = menu.findIndex((item) => item.id === id);
    if (currentIndex === -1) return;
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= menu.length) return;

    const nextMenu = [...menu];
    [nextMenu[currentIndex], nextMenu[targetIndex]] = [nextMenu[targetIndex], nextMenu[currentIndex]];
    setMenu(nextMenu);

    const ids = nextMenu.map((item) => item.id);
    await fetch(`${BACKEND_URL}/api/menu/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...adminHeaders },
      body: JSON.stringify({ ids })
    });

    loadMenu();
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Menu VIP</h1>
        <p>Quản lý menu, ảnh món, thứ tự món, thống kê và logic món ngay trên web.</p>
      </div>

      <div className="admin-layout">
        <section className="admin-form-card">
          <h2>{editingId ? "Sửa món" : "Thêm món mới"}</h2>
          <div className="admin-grid">
            <input value={form.name_vi} onChange={(e) => setField("name_vi", e.target.value)} placeholder="Tên tiếng Việt" />
            <input value={form.name_zh} onChange={(e) => setField("name_zh", e.target.value)} placeholder="Tên tiếng Trung" />
            <input value={form.name_en} onChange={(e) => setField("name_en", e.target.value)} placeholder="Tên tiếng Anh" />
            <input value={form.price} onChange={(e) => setField("price", e.target.value)} placeholder="Giá" type="number" />
            <select value={form.category} onChange={(e) => setField("category", e.target.value)}>
              <option value="spicy">Mỳ cay</option><option value="pho">Phở</option><option value="rice">Cơm</option><option value="tea">Trà trái cây</option><option value="fried">Đồ rán</option>
            </select>
            <input value={form.image} onChange={(e) => setField("image", e.target.value)} placeholder="Đường dẫn ảnh hoặc ảnh upload" />
          </div>
          <div style={{ marginTop: 12 }}>
            <input type="file" accept="image/*" onChange={(e) => handleUploadImage(e.target.files?.[0])} />
            {uploading && <p>Đang upload ảnh...</p>}
          </div>
          <textarea value={form.description_vi} onChange={(e) => setField("description_vi", e.target.value)} placeholder="Mô tả tiếng Việt" />
          <textarea value={form.description_zh} onChange={(e) => setField("description_zh", e.target.value)} placeholder="Mô tả tiếng Trung" />
          <textarea value={form.description_en} onChange={(e) => setField("description_en", e.target.value)} placeholder="Mô tả tiếng Anh" />
          <div className="admin-checks">
            <label><input type="checkbox" checked={form.featured} onChange={(e) => setField("featured", e.target.checked)} /> Món nổi bật</label>
            <label><input type="checkbox" checked={form.available} onChange={(e) => setField("available", e.target.checked)} /> Đang bán</label>
            <label><input type="checkbox" checked={form.options.spicyLevel} onChange={(e) => setOptionField("spicyLevel", e.target.checked)} /> Có chọn cấp độ cay</label>
            <label><input type="checkbox" checked={form.options.phoType} onChange={(e) => setOptionField("phoType", e.target.checked)} /> Có chọn tái/chín</label>
          </div>
          <div className="admin-actions">
            <button onClick={handleSubmit} disabled={loading}>{loading ? "Đang lưu..." : editingId ? "Cập nhật món" : "Thêm món"}</button>
            <button className="secondary" onClick={resetForm}>Làm mới</button>
          </div>
        </section>

        <section className="admin-list-card">
          <h2>Tổng quan</h2>
          <div className="admin-grid" style={{ marginBottom: 16 }}>
            <div className="table-box"><strong>Tổng món:</strong> {stats.totalItems}</div>
            <div className="table-box"><strong>Tổng đơn:</strong> {stats.totalOrders}</div>
            <div className="table-box"><strong>Doanh thu:</strong> {stats.totalRevenue} NT$</div>
          </div>

          <h2>Top bán chạy</h2>
          <div className="admin-list" style={{ marginBottom: 16 }}>
            {(stats.bestSellers || []).map((item, idx) => <div className="cart-item" key={idx}><strong>{item.name}</strong><span>{item.qty}</span></div>)}
          </div>

          <h2>Danh sách món</h2>
          <div className="admin-toolbar">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm món..." />
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="all">Tất cả</option><option value="spicy">Mỳ cay</option><option value="pho">Phở</option><option value="rice">Cơm</option><option value="tea">Trà trái cây</option><option value="fried">Đồ rán</option>
            </select>
          </div>

          <div className="admin-list">
            {filteredMenu.map((item) => (
              <div className="admin-item" key={item.id}>
                <img src={item.image} alt={item.name_vi} />
                <div className="admin-item-body">
                  <h3>{item.name_vi}</h3>
                  <p>{item.name_zh}</p>
                  <p>{item.name_en}</p>
                  <p><strong>{item.price} NT$</strong></p>
                  <p>Danh mục: {item.category}</p>
                  <p>Nổi bật: {item.featured ? "Có" : "Không"}</p>
                  <p>Đang bán: {item.available ? "Có" : "Không"}</p>
                  <p>Cay: {item.options?.spicyLevel ? "Có" : "Không"} | Tái/chín: {item.options?.phoType ? "Có" : "Không"}</p>
                  <div className="admin-item-actions">
                    <button onClick={() => moveItem(item.id, "up")}>↑</button>
                    <button onClick={() => moveItem(item.id, "down")}>↓</button>
                    <button onClick={() => handleEdit(item)}>Sửa</button>
                    <button className="danger" onClick={() => handleDelete(item.id)}>Xóa</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Admin;
