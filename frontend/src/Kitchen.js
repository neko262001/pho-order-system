import React, { useEffect, useState } from "react";

const BACKEND_URL = "https://pho-order-system.onrender.com";
const ADMIN_TOKEN = "123456";

function Kitchen() {
  const [orders, setOrders] = useState([]);

  const loadOrders = () => {
    fetch(`${BACKEND_URL}/api/orders`, { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } })
      .then((res) => res.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []));
  };

  useEffect(() => {
    loadOrders();
    const timer = setInterval(loadOrders, 5000);
    return () => clearInterval(timer);
  }, []);

  const updateStatus = async (id, status) => {
    await fetch(`${BACKEND_URL}/api/orders/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${ADMIN_TOKEN}` },
      body: JSON.stringify({ status })
    });
    loadOrders();
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Màn hình bếp</h1>
        <p>Tự động tải lại mỗi 5 giây.</p>
      </div>
      <div className="admin-list-card" style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div className="admin-list">
          {orders.map((order) => (
            <div className="cart-item" key={order.id}>
              <h3>Bàn {order.table}</h3>
              <p>Trạng thái: <strong>{order.status}</strong></p>
              <p>Thời gian: {new Date(order.createdAt).toLocaleString()}</p>
              <div>{(order.items || []).map((item, idx) => <div key={idx}>{item.name} x{item.qty}</div>)}</div>
              <div className="admin-item-actions" style={{ marginTop: 12 }}>
                <button onClick={() => updateStatus(order.id, "new")}>Mới</button>
                <button onClick={() => updateStatus(order.id, "cooking")}>Đang làm</button>
                <button onClick={() => updateStatus(order.id, "done")}>Xong</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Kitchen;
