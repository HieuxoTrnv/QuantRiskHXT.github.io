# RiskLab Trader

Website quản lý rủi ro và mô phỏng Monte Carlo chạy hoàn toàn trên trình duyệt, phù hợp deploy bằng GitHub Pages.

## Tính năng
- Monte Carlo 1.000–50.000 paths
- Equity curves
- Ending balance distribution
- Max drawdown distribution
- Risk of Ruin theo các ngưỡng -10/-20/-30/-50%
- Losing streak probability
- Position size calculator
- Drawdown recovery calculator
- Expectancy calculator
- Equity Curve Simulator từ chuỗi R
- Responsive dark/light UI

## Chạy trên GitHub Pages
1. Tạo repository, ví dụ `risklab-trader`.
2. Upload `index.html`, `style.css`, `script.js`, `README.md`.
3. Vào **Settings → Pages**.
4. Chọn **Deploy from a branch** → branch `main` → folder `/ (root)`.
5. Save và mở URL GitHub Pages được cung cấp.

## Lưu ý
Chart.js và Lucide được tải từ CDN. Nếu muốn website hoạt động không cần internet sau khi tải trang, hãy tải các thư viện về repo và đổi các thẻ `<script>` trong `index.html` sang file local.

Các mô phỏng là mô hình xác suất giáo dục, không phải dự báo thị trường hoặc lời khuyên đầu tư.
