const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const multer = require("multer");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

const PORT = process.env.PORT || 5000;
const TELEGRAM_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "123456";

const DATA_DIR = __dirname;
const MENU_FILE = path.join(DATA_DIR, "menu.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

if (!fs.existsSync(MENU_FILE)) {
  fs.writeFileSync(MENU_FILE, "[]", "utf-8");
}

if (!fs.existsSync(ORDERS_FILE)) {
  fs.writeFileSync(ORDERS_FILE, "[]", "utf-8");
}

app.use("/uploads", express.static(UPLOAD_DIR));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname || ".jpg");
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const upload = multer({ storage });

function readJson(file, fallback) {
  try {
    const raw = fs.readFileSync(file, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

function checkAdmin(req, res, next) {
  const token = req.headers.authorization;
  if (token !== `Bearer ${ADMIN_TOKEN}`) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  next();
}

app.get("/", (req, res) => {
  res.send("Backend OK");
});

app.get("/api/menu", (req, res) => {
  const menu = readJson(MENU_FILE, []);
  const sorted = [...menu].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  res.json(sorted);
});

app.post("/api/upload", checkAdmin, upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

    res.json({ success: true, imageUrl });
  } catch (error) {
    console.log("UPLOAD ERROR:", error.message);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

app.post("/api/menu", checkAdmin, (req, res) => {
  try {
    const menu = readJson(MENU_FILE, []);
    const nextSortOrder = menu.length
      ? Math.max(...menu.map((i) => i.sortOrder || 0)) + 1
      : 1;

    const newItem = {
      id: Date.now(),
      category: req.body.category || "other",
      featured: Boolean(req.body.featured),
      available: req.body.available !== false,
      sortOrder: nextSortOrder,
      name_vi: req.body.name_vi || "",
      name_zh: req.body.name_zh || "",
      name_en: req.body.name_en || "",
      price: Number(req.body.price) || 0,
      image: req.body.image || "",
      description_vi: req.body.description_vi || "",
      description_zh: req.body.description_zh || "",
      description_en: req.body.description_en || "",
      options: {
        spicyLevel: Boolean(req.body.options?.spicyLevel),
        phoType: Boolean(req.body.options?.phoType)
      }
    };

    menu.push(newItem);
    writeJson(MENU_FILE, menu);

    res.json({ success: true, item: newItem });
  } catch (error) {
    console.log("POST /api/menu ERROR:", error.message);
    res.status(500).json({ success: false, message: "Cannot save menu item" });
  }
});

app.put("/api/menu/:id", checkAdmin, (req, res) => {
  try {
    const menu = readJson(MENU_FILE, []);
    const id = Number(req.params.id);
    const index = menu.findIndex((item) => item.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    menu[index] = {
      ...menu[index],
      category: req.body.category ?? menu[index].category,
      featured: req.body.featured ?? menu[index].featured,
      available: req.body.available ?? menu[index].available,
      sortOrder: req.body.sortOrder ?? menu[index].sortOrder,
      name_vi: req.body.name_vi ?? menu[index].name_vi,
      name_zh: req.body.name_zh ?? menu[index].name_zh,
      name_en: req.body.name_en ?? menu[index].name_en,
      price: req.body.price !== undefined ? Number(req.body.price) : menu[index].price,
      image: req.body.image ?? menu[index].image,
      description_vi: req.body.description_vi ?? menu[index].description_vi,
      description_zh: req.body.description_zh ?? menu[index].description_zh,
      description_en: req.body.description_en ?? menu[index].description_en,
      options: {
        spicyLevel: Boolean(req.body.options?.spicyLevel),
        phoType: Boolean(req.body.options?.phoType)
      }
    };

    writeJson(MENU_FILE, menu);
    res.json({ success: true, item: menu[index] });
  } catch (error) {
    console.log("PUT /api/menu/:id ERROR:", error.message);
    res.status(500).json({ success: false, message: "Cannot update menu item" });
  }
});

app.delete("/api/menu/:id", checkAdmin, (req, res) => {
  try {
    const menu = readJson(MENU_FILE, []);
    const id = Number(req.params.id);
    const nextMenu = menu.filter((item) => item.id !== id);

    writeJson(MENU_FILE, nextMenu);
    res.json({ success: true });
  } catch (error) {
    console.log("DELETE /api/menu/:id ERROR:", error.message);
    res.status(500).json({ success: false, message: "Cannot delete menu item" });
  }
});

app.post("/api/menu/reorder", checkAdmin, (req, res) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids.map(Number) : [];
    const menu = readJson(MENU_FILE, []);

    const updated = menu.map((item) => {
      const index = ids.indexOf(item.id);
      return {
        ...item,
        sortOrder: index >= 0 ? index + 1 : item.sortOrder || 9999
      };
    });

    writeJson(MENU_FILE, updated);
    res.json({ success: true });
  } catch (error) {
    console.log("POST /api/menu/reorder ERROR:", error.message);
    res.status(500).json({ success: false, message: "Cannot reorder menu" });
  }
});

app.post("/order", async (req, res) => {
  try {
    const { table, items } = req.body;

    if (!table || !Array.isArray(items) || items.length === 0) {
      return res.json({ success: false, message: "Invalid order data" });
    }

    let message = `🧾 Đơn mới bàn ${table}\n`;
    let total = 0;

    items.forEach((item) => {
      const qty = Number(item.qty) || 1;
      const price = Number(item.price) || 0;
      total += qty * price;

      const itemName =
        item.name_vi ||
        item.name ||
        item.name_en ||
        item.name_zh ||
        "Món không xác định";

      message += `${itemName} x${qty}`;
      if (price > 0) {
        message += ` - ${price} NT$`;
      }
      message += `\n`;
    });

    message += `\n💰 Tổng: ${total} NT$`;

    const orders = readJson(ORDERS_FILE, []);
    const orderRecord = {
      id: Date.now(),
      table,
      items,
      total,
      status: "new",
      createdAt: new Date().toISOString()
    };

    orders.unshift(orderRecord);
    writeJson(ORDERS_FILE, orders);

    if (TELEGRAM_TOKEN && CHAT_ID) {
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        chat_id: CHAT_ID,
        text: message
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.log("POST /order ERROR:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Order failed" });
  }
});

app.post("/call-staff", async (req, res) => {
  try {
    const { table, message } = req.body;

    if (!table || !message) {
      return res.json({ success: false, message: "Invalid staff request" });
    }

    const staffMessage = `🔔 Yêu cầu nhân viên\nBàn ${table}\n${message}`;

    if (TELEGRAM_TOKEN && CHAT_ID) {
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        chat_id: CHAT_ID,
        text: staffMessage
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.log("POST /call-staff ERROR:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Staff request failed" });
  }
});

app.get("/api/orders", checkAdmin, (req, res) => {
  try {
    const orders = readJson(ORDERS_FILE, []);
    res.json(orders);
  } catch (error) {
    console.log("GET /api/orders ERROR:", error.message);
    res.status(500).json([]);
  }
});

app.put("/api/orders/:id/status", checkAdmin, (req, res) => {
  try {
    const id = Number(req.params.id);
    const status = req.body.status || "new";
    const orders = readJson(ORDERS_FILE, []);
    const index = orders.findIndex((item) => item.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false });
    }

    orders[index].status = status;
    writeJson(ORDERS_FILE, orders);

    res.json({ success: true, order: orders[index] });
  } catch (error) {
    console.log("PUT /api/orders/:id/status ERROR:", error.message);
    res.status(500).json({ success: false });
  }
});

app.get("/api/stats", checkAdmin, (req, res) => {
  try {
    const orders = readJson(ORDERS_FILE, []);
    const menu = readJson(MENU_FILE, []);

    const totalRevenue = orders.reduce(
      (sum, order) => sum + (Number(order.total) || 0),
      0
    );

    const totalOrders = orders.length;
    const totalItems = menu.length;

    const itemCounter = {};
    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const itemName =
          item.name_vi ||
          item.name ||
          item.name_en ||
          item.name_zh ||
          "Món không xác định";

        itemCounter[itemName] =
          (itemCounter[itemName] || 0) + (Number(item.qty) || 1);
      });
    });

    const bestSellers = Object.entries(itemCounter)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);

    res.json({
      totalRevenue,
      totalOrders,
      totalItems,
      bestSellers
    });
  } catch (error) {
    console.log("GET /api/stats ERROR:", error.message);
    res.status(500).json({
      totalRevenue: 0,
      totalOrders: 0,
      totalItems: 0,
      bestSellers: []
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});