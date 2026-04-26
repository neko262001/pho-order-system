import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://pho-order-system.onrender.com";
const ADMIN_TOKEN = process.env.REACT_APP_ADMIN_TOKEN || "0903636778";

const emptyItem = { category: "pho", name_vi: "", name_zh: "", name_en: "", description_vi: "", description_zh: "", description_en: "", price: 0, image: "", available: true, featured: false, optionType: "none" };
const emptyCategory = { id: "", vi: "", zh: "", en: "", sort: 9 };
const emptyAddon = { vi: "", zh: "", en: "", price: 0, appliesTo: [], active: true };

function Admin() {
  if (!window.__ADMIN_OK__) {
    const pass = prompt("Nhập mật khẩu admin:");
    if (pass !== ADMIN_TOKEN) { alert("Sai mật khẩu"); window.location.href = "/"; return null; }
    window.__ADMIN_OK__ = true;
  }

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${ADMIN_TOKEN}` };
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [addons, setAddons] = useState([]);
  const [settings, setSettings] = useState({ logoTitle: "Goka phở & mỳ cay" });
  const [itemForm, setItemForm] = useState(emptyItem);
  const [editingItemId, setEditingItemId] = useState(null);
  const [catForm, setCatForm] = useState(emptyCategory);
  const [addonForm, setAddonForm] = useState(emptyAddon);
  const [editingAddonId, setEditingAddonId] = useState(null);
  const [tab, setTab] = useState("menu");

  const loadAll = () => {
    fetch(`${BACKEND_URL}/api/config`).then(r => r.json()).then(d => { if (d.success) { setCategories(d.categories || []); setAddons(d.addons || []); setSettings(d.settings || {}); } });
    fetch(`${BACKEND_URL}/api/menu`).then(r => r.json()).then(d => setMenu(Array.isArray(d) ? d : []));
  };

  useEffect(() => { loadAll(); }, []);

  const saveSettings = async () => {
    await fetch(`${BACKEND_URL}/api/settings`, { method: "PUT", headers, body: JSON.stringify(settings) });
    alert("Đã lưu settings"); loadAll();
  };

  const saveItem = async () => {
    const method = editingItemId ? "PUT" : "POST";
    const url = editingItemId ? `${BACKEND_URL}/api/menu/${editingItemId}` : `${BACKEND_URL}/api/menu`;
    await fetch(url, { method, headers, body: JSON.stringify(itemForm) });
    setItemForm(emptyItem); setEditingItemId(null); loadAll();
  };

  const editItem = (item) => { setEditingItemId(item.id); setItemForm(item); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const deleteItem = async (id) => { if (!window.confirm("Xóa món này?")) return; await fetch(`${BACKEND_URL}/api/menu/${id}`, { method: "DELETE", headers }); loadAll(); };

  const saveCategory = async () => { await fetch(`${BACKEND_URL}/api/categories`, { method: "POST", headers, body: JSON.stringify(catForm) }); setCatForm(emptyCategory); loadAll(); };
  const deleteCategory = async (id) => { if (!window.confirm("Xóa danh mục?")) return; await fetch(`${BACKEND_URL}/api/categories/${id}`, { method: "DELETE", headers }); loadAll(); };

  const saveAddon = async () => {
    const method = editingAddonId ? "PUT" : "POST";
    const url = editingAddonId ? `${BACKEND_URL}/api/addons/${editingAddonId}` : `${BACKEND_URL}/api/addons`;
    await fetch(url, { method, headers, body: JSON.stringify(addonForm) });
    setAddonForm(emptyAddon); setEditingAddonId(null); loadAll();
  };
  const editAddon = (a) => { setEditingAddonId(a.id); setAddonForm(a); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const deleteAddon = async (id) => { if (!window.confirm("Xóa addon?")) return; await fetch(`${BACKEND_URL}/api/addons/${id}`, { method: "DELETE", headers }); loadAll(); };

  return <div className="app"><header className="brand-hero"><div className="brand-logo"><div className="logo-mark">G</div><div><h1>GOKA ADMIN</h1><p>Quản lý full menu / category / addon</p></div></div><div className="lang-switch"><button onClick={() => setTab("menu")}>Menu</button><button onClick={() => setTab("category")}>Danh mục</button><button onClick={() => setTab("addon")}>Addon</button><button onClick={() => setTab("setting")}>Logo</button></div></header><main className="layout" style={{gridTemplateColumns:"1fr"}}>
    {tab === "setting" && <section className="checkout"><h2>Logo & tiêu đề</h2><input className="search" value={settings.logoTitle || ""} onChange={e => setSettings({...settings, logoTitle:e.target.value})}/><input className="search" value={settings.subtitle_vi || ""} onChange={e => setSettings({...settings, subtitle_vi:e.target.value})} placeholder="Subtitle VI"/><input className="search" value={settings.subtitle_zh || ""} onChange={e => setSettings({...settings, subtitle_zh:e.target.value})} placeholder="Subtitle ZH"/><input className="search" value={settings.subtitle_en || ""} onChange={e => setSettings({...settings, subtitle_en:e.target.value})} placeholder="Subtitle EN"/><button className="order-btn" onClick={saveSettings}>Lưu</button></section>}
    {tab === "menu" && <section className="checkout"><h2>{editingItemId ? "Sửa món" : "Thêm món"}</h2><select className="search" value={itemForm.category} onChange={e=>setItemForm({...itemForm,category:e.target.value})}>{categories.filter(c=>c.id!=="all").map(c=><option key={c.id} value={c.id}>{c.vi} / {c.zh}</option>)}</select>{["name_vi","name_zh","name_en","description_vi","description_zh","description_en","image"].map(k=><input key={k} className="search" value={itemForm[k]||""} onChange={e=>setItemForm({...itemForm,[k]:e.target.value})} placeholder={k}/>) }<input className="search" type="number" value={itemForm.price} onChange={e=>setItemForm({...itemForm,price:Number(e.target.value)})} placeholder="price"/><select className="search" value={itemForm.optionType} onChange={e=>setItemForm({...itemForm,optionType:e.target.value})}><option value="none">Không option</option><option value="pho">Phở: tái/chín</option><option value="rice">Cơm: cay/không cay</option><option value="spicy">Mỳ cay: addon</option></select><label><input type="checkbox" checked={!!itemForm.available} onChange={e=>setItemForm({...itemForm,available:e.target.checked})}/> Đang bán</label><label><input type="checkbox" checked={!!itemForm.featured} onChange={e=>setItemForm({...itemForm,featured:e.target.checked})}/> Món nổi bật</label><button className="order-btn" onClick={saveItem}>{editingItemId ? "Lưu sửa" : "Thêm món"}</button><button className="clear-btn" onClick={()=>{setItemForm(emptyItem);setEditingItemId(null)}}>Reset</button><div className="menu-grid" style={{marginTop:20}}>{menu.map(i=><article className="menu-card" key={i.id}><div className="menu-body"><h3>{i.name_vi}</h3><p>{i.name_zh} / {i.name_en}</p><b>{i.price} NT$</b><p>{i.category} - {i.optionType}</p><button onClick={()=>editItem(i)}>Sửa</button><button className="clear-btn" onClick={()=>deleteItem(i.id)}>Xóa</button></div></article>)}</div></section>}
    {tab === "category" && <section className="checkout"><h2>Danh mục</h2>{["id","vi","zh","en"].map(k=><input key={k} className="search" value={catForm[k]||""} onChange={e=>setCatForm({...catForm,[k]:e.target.value})} placeholder={k}/>) }<input className="search" type="number" value={catForm.sort} onChange={e=>setCatForm({...catForm,sort:Number(e.target.value)})}/><button className="order-btn" onClick={saveCategory}>Thêm danh mục</button>{categories.map(c=><div className="cart-line" key={c.id}><div><b>{c.id}</b><small>{c.vi} / {c.zh} / {c.en}</small></div>{!c.fixed && <button onClick={()=>deleteCategory(c.id)}>Xóa</button>}</div>)}</section>}
    {tab === "addon" && <section className="checkout"><h2>{editingAddonId ? "Sửa addon" : "Thêm addon"}</h2>{["vi","zh","en"].map(k=><input key={k} className="search" value={addonForm[k]||""} onChange={e=>setAddonForm({...addonForm,[k]:e.target.value})} placeholder={k}/>) }<input className="search" type="number" value={addonForm.price} onChange={e=>setAddonForm({...addonForm,price:Number(e.target.value)})}/><p>Áp dụng cho:</p><div className="flags">{categories.filter(c=>c.id!=="all").map(c=><label key={c.id}><input type="checkbox" checked={(addonForm.appliesTo||[]).includes(c.id)} onChange={e=>{const set=new Set(addonForm.appliesTo||[]);e.target.checked?set.add(c.id):set.delete(c.id);setAddonForm({...addonForm,appliesTo:[...set]})}}/>{c.vi}</label>)}</div><label><input type="checkbox" checked={addonForm.active!==false} onChange={e=>setAddonForm({...addonForm,active:e.target.checked})}/> Active</label><button className="order-btn" onClick={saveAddon}>{editingAddonId ? "Lưu sửa" : "Thêm addon"}</button><button className="clear-btn" onClick={()=>{setAddonForm(emptyAddon);setEditingAddonId(null)}}>Reset</button>{addons.map(a=><div className="cart-line" key={a.id}><div><b>{a.vi} - {a.price} NT$</b><small>{a.zh} / {a.en}</small><small>{(a.appliesTo||[]).join(", ")}</small></div><button onClick={()=>editAddon(a)}>Sửa</button><button onClick={()=>deleteAddon(a.id)}>Xóa</button></div>)}</section>}
  </main></div>;
}

export default Admin;