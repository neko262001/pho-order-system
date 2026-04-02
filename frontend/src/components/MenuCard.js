import React from "react";

export default function MenuCard({ items, lang, addToCart }) {
  return (
    <div className="menu-cards">
      {items.map(item => (
        <div key={item.id} className="menu-card">
          <img src={item.img} alt={item.name[lang]} />
          <h3>{item.name[lang]}</h3>
          <p>{item.price.toLocaleString()} đ</p>
          <button onClick={() => addToCart(item)}>Thêm</button>
        </div>
      ))}
    </div>
  );
}