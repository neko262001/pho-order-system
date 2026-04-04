const QRCode = require("qrcode");

const baseLink = "https://frontend-pink-phi-47.vercel.app";

for (let i = 1; i <= 10; i++) {
  const url = `${baseLink}/?table=${i}`;

  QRCode.toFile(`table${i}.png`, url, function (err) {
    if (err) throw err;
    console.log(`Đã tạo QR bàn ${i}`);
  });
}