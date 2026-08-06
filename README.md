# Math Visualizer

Nhập đề bài Toán, Vật lý, Hoá học, Sinh học hoặc Địa lý → Gemini vẽ **hình minh hoạ SVG** chuẩn xác, kèm **mã TikZ** và **lời giải KaTeX**.
Xuất PNG / SVG / copy thẳng vào Word – PowerPoint – Zalo.

**Tác giả: Nguyễn Thiện · Zalo 0988.250.112**

---

## Tính năng

- **5 bộ môn** có quy tắc vẽ riêng: Toán, Vật lý, Hoá học, Sinh học, Địa lý — hoặc để chế độ Tự nhận diện
- Giao diện **Bootstrap 5 + gradient teal**, Font Awesome 6, SweetAlert2, sáng/tối, responsive, nền lưới ô ly bật/tắt được
- Nhập API key ngay trên giao diện, lưu vào `localStorage`; **nhiều key mỗi dòng một key**
- **Xoay vòng 3 model**: `gemini-3.5-flash` → `gemini-3.5-flash-lite` → `gemini-3.6-flash`, tự chuyển key/model khi gặp lỗi hạn mức hoặc quá tải
- **Streaming**: hình hiện dần theo thời gian thực, có nút Dừng
- Nhập đề bằng text, ảnh chụp đề (dán Ctrl+V / kéo thả) và ảnh phác thảo tay
- 5 phong cách vẽ: SGK chuẩn, Đen trắng in ấn, Bảng phấn, Tối giản, Sách cổ điển
- Thư viện 57 đề mẫu chia theo môn và chủ đề, lịch sử 25 bản vẽ có tìm kiếm
- Zoom / pan, toàn màn hình, tải PNG 3×, tải SVG, **tải PDF khổ A4**, copy ảnh, copy TikZ
- Nút **Sửa lại hình**: gửi ngược SVG cho AI tự rà soát và vẽ lại
- Làm sạch SVG (chặn `script`, `foreignObject`, thuộc tính `on*`) trước khi hiển thị

## Công nghệ

Vite 5 · React 18 · TypeScript (strict) · Bootstrap 5.3 · Font Awesome 6.4 · SweetAlert2 11 · KaTeX · jsPDF (nạp động). Không có backend — trình duyệt gọi thẳng Google Generative Language API.

## Chạy trên máy

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # xuất ra thư mục dist/
npm run preview    # xem thử bản build
```

Cần Node.js 18 trở lên. Lấy API key miễn phí tại https://aistudio.google.com/apikey

## Cấu trúc thư mục

```
src/
├─ main.tsx              điểm khởi động
├─ App.tsx               state trung tâm, phím tắt, luồng sinh hình
├─ styles.css            toàn bộ CSS (design token teal)
├─ types.ts              kiểu dữ liệu dùng chung
├─ components/           Header, Sidebar, Stage, Card, ApiKeyPanel, ImageDrop
├─ lib/
│  ├─ ui.ts              SweetAlert2: toast, xác nhận, thư viện đề, hướng dẫn
│  ├─ gemini.ts          prompt, streaming SSE, xoay vòng key & model
│  ├─ svg.ts             làm sạch, chuẩn hoá, tách kết quả
│  ├─ exporter.ts        xuất PNG / SVG / PDF
│  ├─ markdown.ts        Markdown + KaTeX → HTML
│  └─ storage.ts         localStorage an toàn (tự lùi về RAM khi bị chặn)
└─ data/                 phong cách vẽ, thư viện đề mẫu
```

## Đưa lên GitHub

```bash
git init
git add .
git commit -m "Math Visualizer"
git branch -M main
git remote add origin https://github.com/<tai-khoan>/math-visualizer.git
git push -u origin main
```

## Triển khai Vercel

**Cách 1 — qua giao diện web (dễ nhất)**

1. Vào https://vercel.com → **Add New… → Project**
2. **Import** repo `math-visualizer` từ GitHub
3. Vercel tự nhận Framework Preset **Vite**. Giữ nguyên:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. Bấm **Deploy**. Khoảng 1 phút sau có link `https://<ten-du-an>.vercel.app`

Không cần khai báo biến môi trường nào, vì API key do người dùng tự nhập trên giao diện và lưu trong trình duyệt của họ.

**Cách 2 — qua dòng lệnh**

```bash
npm i -g vercel
vercel          # bản xem thử
vercel --prod   # bản chính thức
```

Mỗi lần `git push` lên nhánh `main`, Vercel sẽ tự build và cập nhật bản chính thức.

### Gắn tên miền riêng

Vercel → Project → **Settings → Domains → Add**, rồi trỏ bản ghi DNS theo hướng dẫn hiện ra.

## Lưu ý bảo mật

API key nằm trong `localStorage` của từng người dùng, không bao giờ được gửi tới máy chủ nào ngoài Google.
Vì vậy **đừng** hard-code key của bạn vào mã nguồn rồi đẩy lên GitHub công khai.

## Hỗ trợ

Nguyễn Thiện — Zalo [0988.250.112](https://zalo.me/0988250112)
