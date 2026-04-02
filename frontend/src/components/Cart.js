import React from "react";

export default function Cart({ cart, lang, order, setCart }) {
  const total = cart.reduce((sum,i)=>sum+i.price*i.qty,0);
  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i=>i.id===id?{...i, qty: Math.max(1,i.qty+delta)}:i));
  };
  return (
    <div className="cart">
      <h2>🛒 Giỏ hàng</h2>
      {cart.map(i=>(
        <div key={i.id} className="cart-item">
          <span>{i.name[lang]} x{i.qty}</span>
          <div>
            <button onClick={()=>updateQty(i.id,1)}>+</button>
            <button onClick={()=>updateQty(i.id,-1)}>-</button>
          </div>
        </div>
      ))}
      <h3>Tổng: {total.toLocaleString()} đ</h3>
      <button onClick={order}>Đặt món</button>
    </div>
  );
}