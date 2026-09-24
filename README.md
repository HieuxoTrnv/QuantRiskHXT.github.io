# RiskLab Hiếu Xoăn Trader

Trang web mô phỏng quản lý rủi ro và Monte Carlo, viết bằng HTML/CSS/JavaScript thuần, phù hợp triển khai trực tiếp trên GitHub Pages.

## Tính năng

- Giao diện tiếng Việt, đơn vị tiền tệ VND (`đ`).
- Vốn ban đầu có dấu phân cách hàng nghìn.
- Risk/Reward giữ nguyên dạng `R/R`.
- Winrate + Lossrate luôn bằng 100%.
- Expectancy theo đơn vị R.
- Profit Factor.
- Monte Carlo tối đa 100.000 giao dịch.
- 10–100 equity.
- Tối đa 100 đường equity trên biểu đồ.
- Sau khi chạy tự cuộn về biểu đồ mô phỏng.
- Xác suất xuất hiện chuỗi thắng/thua bằng tính toán xác suất chính xác theo mô hình Bernoulli cho số giao dịch đã chọn.
- Mối liên hệ Winrate – R/R và Winrate hòa vốn.
- Phân phối lợi nhuận.
- Phân phối rủi ro / Drawdown.
- Liên kết YouTube Hiếu Xoăn Trader, Mở Tài Khoản VPS và Giật Jackpot.

## Cách đưa lên GitHub Pages

1. Tạo repository mới, ví dụ `risklab-hieu-xoan-trader`.
2. Upload `index.html`, `style.css`, `app.js`.
3. Vào **Settings → Pages**.
4. Chọn **Deploy from a branch** → branch `main` → folder `/root`.
5. Lưu lại và mở URL GitHub Pages.

Không cần backend.

## Công thức chính

- Lossrate = 100% − Winrate.
- Expectancy = Winrate × R/R − Lossrate.
- Profit Factor lý thuyết = (Winrate × R/R) / Lossrate.
- Winrate hòa vốn = 1 / (1 + R/R).

Monte Carlo dùng risk theo % vốn hiện tại, tức là có compounding. Mỗi lệnh thắng tăng `RiskCash × R/R`; mỗi lệnh thua giảm `RiskCash`.

Công cụ mang tính giáo dục, không phải khuyến nghị đầu tư.
