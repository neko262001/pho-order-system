const net = require("net");

const PRINTERS = {
  kitchen: { ip: "10.0.0.14", port: 9100, name: "Bep" },
  counter: { ip: "10.0.0.11", port: 9100, name: "Quay" }
};

function safeText(value, fallback = "") {
  if (value === undefined || value === null) return fallback;
  return String(value);
}

function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function sendRaw(ip, port, text) {
  return new Promise((resolve) => {
    const client = new net.Socket();
    let settled = false;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      try { client.destroy(); } catch {}
      resolve(result);
    };

    client.setTimeout(5000);

    client.connect(port, ip, () => {
      client.write(text, "utf8", () => {
        finish({ ok: true, ip });
      });
    });

    client.on("error", (err) => {
      finish({ ok: false, ip, error: err.message });
    });

    client.on("timeout", () => {
      finish({ ok: false, ip, error: "timeout" });
    });
  });
}

function line(char = "-", length = 32) {
  return char.repeat(length);
}

function itemName(item) {
  return item.name_vi || item.name || item.name_en || item.name_zh || "Mon";
}

function addonName(addon) {
  return addon.name_vi || addon.name || addon.name_en || addon.name_zh || "Addon";
}

function formatKitchen(order) {
  let text = "";
  text += line("=") + "\n";
  text += "        GOKA BEP / KITCHEN       \n";
  text += line("=") + "\n";
  text += `Ban: ${safeText(order.table, "-")}\n`;
  text += `Ma don: ${safeText(order.id, "-")}\n`;
  text += `Gio: ${new Date().toLocaleString("zh-TW", { hour12: false, timeZone: "Asia/Taipei" })}\n`;
  text += line("-") + "\n";

  const items = Array.isArray(order.items) ? order.items : [];

  items.forEach((item, index) => {
    text += `${index + 1}. ${itemName(item)} x${safeNumber(item.qty, 1)}\n`;

    if (item.optionText) {
      text += `   Option: ${item.optionText}\n`;
    }

    if (Array.isArray(item.optionLabels) && item.optionLabels.length) {
      item.optionLabels.forEach((o) => {
        text += `   ${safeText(o.group || "Option")}: ${safeText(o.value)}\n`;
      });
    }

    if (Array.isArray(item.addons) && item.addons.length) {
      item.addons.forEach((a) => {
        text += `   + ${addonName(a)} x${safeNumber(a.qty, 1)}\n`;
      });
    }

    if (item.note || item.itemNote) {
      text += `   Note: ${safeText(item.note || item.itemNote)}\n`;
    }

    text += line(".") + "\n";
  });

  if (Array.isArray(order.noIngredients) && order.noIngredients.length) {
    text += line("-") + "\n";
    text += `Khong dung: ${order.noIngredients.join(", ")}\n`;
  }

  if (order.customerNote || order.note) {
    text += `Ghi chu: ${safeText(order.customerNote || order.note)}\n`;
  }

  text += line("=") + "\n\n\n";
  return text;
}

function formatCounter(order) {
  let text = "";
  text += line("=") + "\n";
  text += "        GOKA QUAY / COUNTER      \n";
  text += line("=") + "\n";
  text += `Ban: ${safeText(order.table, "-")}\n`;
  text += `Ma don: ${safeText(order.id, "-")}\n`;
  text += `Gio: ${new Date().toLocaleString("zh-TW", { hour12: false, timeZone: "Asia/Taipei" })}\n`;
  text += line("-") + "\n";

  const items = Array.isArray(order.items) ? order.items : [];

  items.forEach((item, index) => {
    const qty = safeNumber(item.qty, 1);
    const price = safeNumber(item.price, 0);
    const subtotal = safeNumber(item.subtotal || item.lineTotal || price * qty, 0);

    text += `${index + 1}. ${itemName(item)} x${qty}\n`;

    if (item.optionText) {
      text += `   ${item.optionText}\n`;
    }

    if (Array.isArray(item.addons) && item.addons.length) {
      item.addons.forEach((a) => {
        text += `   + ${addonName(a)} x${safeNumber(a.qty, 1)} ${safeNumber(a.price, 0)} NT$\n`;
      });
    }

    text += `   ${subtotal} NT$\n`;
  });

  text += line("-") + "\n";
  text += `Tong: ${safeNumber(order.total, 0)} NT$\n`;

  if (order.customerNote || order.note) {
    text += `Ghi chu: ${safeText(order.customerNote || order.note)}\n`;
  }

  text += line("=") + "\n\n\n";
  return text;
}

async function printOrderSafe(order) {
  const kitchenText = formatKitchen(order);
  const counterText = formatCounter(order);

  const results = await Promise.all([
    sendRaw(PRINTERS.kitchen.ip, PRINTERS.kitchen.port, kitchenText),
    sendRaw(PRINTERS.counter.ip, PRINTERS.counter.port, counterText)
  ]);

  return results;
}

module.exports = {
  printOrderSafe,
  formatKitchen,
  formatCounter
};
