# RiskLab Hiếu Xoăn Trader

Trang web mô phỏng quản lý rủi ro và Monte Carlo cho giao dịch cổ phiếu Việt Nam.

## Tính năng

- Monte Carlo tối đa **10.000 lần mô phỏng**.
- Vốn ban đầu hiển thị bằng **VND**, tự động phân cách hàng nghìn.
- Không dùng pip/lot của Forex.
- Rủi ro theo **% vốn** hoặc **số tiền VND cố định**.
- Giữ nguyên Risk / Reward (R:R).
- Tỷ lệ lỗ luôn được tính là `100% - Winrate`.
- Expectancy theo R:
  `Expectancy = Winrate × R:R − Lossrate × 1R`
- Profit Factor:
  `PF = (Winrate × R:R) / Lossrate`
- Chỉ hiển thị **1 đường cong vốn (1 equity)** và chỉ tính chuỗi thắng/thua dài nhất trên equity đó.
- Bảng chuỗi thắng/thua theo bảng 100 mẫu người dùng cung cấp.
- Mối liên hệ Winrate – R:R, gồm Winrate hòa vốn:
  `1 / (1 + R:R)`
- Khả năng hồi phục vốn sau Drawdown.
- Phân phối lợi nhuận cuối kỳ.
- Phân phối rủi ro / Drawdown.
- Các phân vị P5 / P25 / P50 / P75 / P95.
- Liên kết YouTube Hiếu Xoăn Trader, Mở Tài Khoản VPS và Giật Jackpot.
- Responsive cho máy tính và điện thoại.

## Cách chạy

### Cách 1 — mở trực tiếp
Mở `index.html` bằng trình duyệt.

### Cách 2 — GitHub Pages
1. Tạo repository mới trên GitHub.
2. Upload `index.html`.
3. Vào **Settings → Pages**.
4. Chọn branch `main`, thư mục `/root`.
5. Lưu lại và chờ GitHub Pages xuất bản.

Không cần backend.

## Công thức chính

### Expectancy
Với 1R là số tiền chấp nhận rủi ro cho một giao dịch:

`Expectancy (R) = W × RR − L`

Trong đó:

- `W = Winrate`
- `L = 1 − W`
- `RR = Risk / Reward`

### Profit Factor

`Profit Factor = Tổng lợi nhuận / Tổng thua lỗ`

Trong mô hình đơn giản với rủi ro 1R cố định:

`PF = (W × RR) / L`

### Winrate hòa vốn

`Winrate hòa vốn = 1 / (1 + RR)`

Ví dụ R:R = 2 thì Winrate hòa vốn ≈ 33,33%, chưa tính phí, thuế, trượt giá, gap và các yếu tố thị trường.

### Hồi phục sau Drawdown

`Mức tăng cần thiết = DD / (1 − DD)`

Ví dụ:

- Lỗ 20% → cần +25%.
- Lỗ 50% → cần +100%.
- Lỗ 60% → cần +150%.
- Lỗ 80% → cần +400%.

## Ghi chú về Monte Carlo

Mô hình giả định mỗi giao dịch là một biến ngẫu nhiên độc lập theo Winrate nhập vào và chỉ có hai kết quả:

- Thắng: `+R:R × Rủi ro`
- Thua: `−1 × Rủi ro`

Đây là mô hình giáo dục/xác suất, không phải dự báo giá cổ phiếu.

## Nguồn tham khảo

- FTMO Equity Simulator / các bài viết về Equity Simulator và quản lý rủi ro.
- Bảng chuỗi thắng/thua và biểu đồ Winrate – R:R do người dùng cung cấp trong yêu cầu.

## Liên kết

- YouTube: https://www.youtube.com/@HieuXoanTrader
- Mở Tài Khoản VPS: https://openaccount.vps.com.vn/open-account?MktID=B033
- Giật Jackpot: https://hieuxotrnv.github.io/
