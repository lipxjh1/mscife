# 01 - Lỗi MIME khi dynamic import module (Vite + Phaser 3)

## 1. Mô tả lỗi

-   Trình duyệt báo: "Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of \"text/html\". Strict MIME type checking is enforced for module scripts per HTML spec."
-   Log kèm theo:
    -   `Failed to load Home scene: TypeError: Failed to fetch dynamically imported module: http://localhost:3000/src/game/scenes/Home.js?t=...`
    -   `HomeNeuralinkCenterMarket.js:1 Failed to load module script ... MIME type of "text/html"`

## 2. Ý nghĩa lỗi

-   Khi trình duyệt tải module ES (import/dynamic import), nó kỳ vọng nhận về response Content-Type là `application/javascript`.
-   Nếu Vite dev server trả về nội dung HTML (thường là `index.html` do SPA fallback hoặc trang lỗi 404/500), trình duyệt xem đó là sai MIME và chặn nạp module, dẫn tới thông báo trên.

## 3. Nguyên nhân phổ biến (áp dụng case này)

-   Đường dẫn import sai tới một file đã bị xóa/di chuyển ⇒ yêu cầu HTTP trả về HTML (fallback) thay vì JS.
-   Chuỗi import động bắt đầu từ `Home.js` rồi import sâu hơn vào các module con; chỉ cần 1 import con sai sẽ khiến toàn bộ dynamic import bị coi là thất bại và log gán lỗi cho module gốc.

## 4. Bằng chứng trong codebase hiện tại

-   Dynamic import ở:
    -   `src/game/scenes/Login.js:58-73` → `import("./Home.js")`
    -   `src/game/scenes/Preloader.js:220-241` → `import("./Home.js")`
-   File đích tồn tại: `src/game/scenes/Home.js` (có export `class Home extends Scene { ... }`).
-   Có import nghi vấn tới file đã di chuyển/xóa:
    -   `src/game/scenes/Home/HomeNeuralink/HomeNeuralinkUpgrade.js:16`
        -   `import { CreateNeuralinkCenterMarket } from "../HomeNeuralinkCenterMarket.js";`
        -   Thực tế thư mục mới hiện có: `src/game/scenes/Home/HomeNeuralinkCenterMarket/` và entry chính là `HomeNeuralinkCenterMarket.js` (đường dẫn mới hợp lệ: `../HomeNeuralinkCenterMarket/HomeNeuralinkCenterMarket.js`).
    -   Các file khác đã dùng đúng đường dẫn mới, ví dụ:
        -   `src/game/scenes/Home/HomeInventory/HomeInventoryNeuralinkOptions.js:19` → `../HomeNeuralinkCenterMarket/HomeNeuralinkCenterMarket.js` (đúng)
-   Git status cho thấy nhiều file Neuralink Center Market cũ bị xóa, và đã tạo thư mục mới `HomeNeuralinkCenterMarket/` ⇒ khả năng cao còn sót import cũ.

## 5. Tác động

-   Ngắn hạn: Trang game không vào được `Home` scene, stuck ở `Login` hoặc overlay lỗi của Vite.
-   Dài hạn: Cứ mỗi lần refactor đường dẫn mà không cập nhật toàn bộ import sẽ gây gián đoạn, khó debug do lỗi MIME chung chung.
-   UX: Người chơi không thể tiếp tục sau màn Login.
-   Dev: Mất thời gian tìm nguyên nhân do lỗi trả về ở module gốc.

## 6. Cách xác nhận nhanh

-   Mở DevTools → Network → tab `JS`, click request tới `/src/game/scenes/HomeNeuralink/...` nghi vấn:
    -   Kiểm tra `Status` (thường 200 nhưng Content-Type là `text/html`, hay 404/500)
    -   Mở preview/response để xem có phải là `index.html`/trang lỗi Vite.
-   Thử mở trực tiếp URL nghi vấn trên trình duyệt để xem nội dung thực.

## 7. Hướng dẫn khắc phục cụ thể

1. Cập nhật import sai còn sót lại:
    - File: `src/game/scenes/Home/HomeNeuralink/HomeNeuralinkUpgrade.js`
    - Từ: `../HomeNeuralinkCenterMarket.js`
    - Thành: `../HomeNeuralinkCenterMarket/HomeNeuralinkCenterMarket.js`
2. Kiểm tra thêm các import trong nhóm Neuralink/CenterMarket:
    - Tìm `HomeNeuralinkCenterMarket.js` trong toàn bộ `src/` để chắc chắn không còn import cũ.
3. Khởi động lại Vite dev server (để tránh cache transform):
    - Dừng và chạy lại `npm run dev`.
4. Xác minh:
    - Reload trang, theo dõi Network cho các request module đều trả về `Content-Type: application/javascript`.
    - Đảm bảo `Login` có thể add scene `Home` không lỗi.

## 8. Ghi chú phòng tránh

-   Khi đổi cấu trúc thư mục, chạy tìm kiếm cập nhật tất cả import liên quan trước khi commit.
-   Bật lỗi strict và cấu hình ESLint plugin import để cảnh báo import không tồn tại.
-   Với dynamic import, log chi tiết module con khi bắt lỗi để khoanh vùng nhanh (đã có `console.error` nhưng có thể thêm thông tin `error.cause`/URL).

## 9. Kết luận

-   Lỗi MIME xảy ra do một hoặc nhiều import trỏ sai (ít nhất `HomeNeuralinkUpgrade.js`), khiến Vite trả về HTML fallback. Sửa lại đường dẫn import đúng tới module mới trong thư mục `HomeNeuralinkCenterMarket/` sẽ giải quyết chuỗi lỗi và cho phép `Home` scene tải bình thường.
