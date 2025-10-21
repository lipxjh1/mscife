### 1. Mục tiêu tài liệu

-   Phân tích và phân nhóm toàn bộ request được định nghĩa trong `src/game/Data/CenterData.js`.
-   Chuẩn hóa theo module/tính năng để dễ bảo trì, mở rộng, tách code, và áp dụng code splitting.
-   Mô tả: HTTP method, endpoint, payload, tác dụng phụ (side effects) trong client state.

---

### 2. Tổng quan endpoint và kỹ thuật gọi

-   Kỹ thuật gọi:
    -   `apiClient.get/post/delete` (dựa trên `axios` cấu hình từ `APIBase.js`, có tự động gắn token qua `setTokens`).
    -   `fetch` thủ công với `Authorization: Bearer <token>` cho một số endpoint nền `BASE_SERVICE`.
-   Hằng số service:
    -   `BASE_SERVICE = https://api.tonmedia.net`.
-   Side effects phổ biến:
    -   Cập nhật token truy cập (`SetAccessToken`, `SetRefreshToken`, `setTokens`).
    -   Cập nhật state nội bộ (`userInfo`, `selectedPlayerArr`, `baseCharacterInfo`, `baseItemInfo`, `inventoryDictionary`, `itemShopDictionary`, `vipStatus`, `chipDailyReward`, `battle`, `StageInfo`, ...).
    -   Phát sự kiện UI qua `EventTarget`: `playerinfochange`, `inventorychange`, `vipstatuschange`, `chipdailyreward`.

---

### 3. Nhóm A – Xác thực & Tài khoản (Auth & Account)

-   3.1 Login Telegram
    -   Method: POST `/api/auth/login-telegram`
    -   Payload: `{ query_id: initDataRaw, reference_id: finalStartapp }`
    -   Side effects: Lưu access/refresh token, gọi `RequestCharacterInfo()` và `RequestItemInfo()`.
-   3.2 Đăng nhập Email/Password
    -   Method: POST `/api/auth-ep/signin`
    -   Payload: `{ email, password }`
    -   Side effects: Lưu token, tải nhân vật & vật phẩm.
-   3.3 Đăng ký Email/Password
    -   Method: POST `/api/auth-ep/signup`
    -   Payload: `{ email, password, reference_id }`
    -   Side effects: Lưu token, tải nhân vật & vật phẩm.
-   3.4 Quên mật khẩu
    -   Method: POST `/api/auth-ep/forgot-password`
    -   Payload: `{ email }`
-   3.5 Thông tin người dùng
    -   Method: GET `/api/me`
    -   Side effects: `userInfo`, `selectedPlayerArr`, emit `playerinfochange`.
-   3.6 Cập nhật ví
    -   Method: POST `/api/me/update-wallet`
    -   Payload: `{ walletId }`
-   3.7 Cập nhật ảnh đại diện
    -   Method: POST `/api/me/update-avatar`
    -   Payload: `{ avatar }`

---

### 4. Nhóm B – Hệ thống Điểm danh, Giao dịch, Ví

-   4.1 Tỷ giá M-coin/MUSK
    -   Method: GET `/api/config/rate`
    -   Side effects: Lưu `receiver` (địa chỉ nhận on-chain).
-   4.2 Lịch sử giao dịch
    -   Method: GET `/api/me/transactions?page=<p>&limit=10`
-   4.3 Kiểm tra trạng thái điểm danh
    -   Method: GET `/api/me/checkin-status`
-   4.4 Thực hiện điểm danh
    -   Method: POST `/api/me/daily-checkin`
-   4.5 Điểm danh bù (late checkin)
    -   Method: POST `/api/me/makeup-checkin`
    -   Payload: `{ date }`
-   4.6 Chuyển MUSK P2P
    -   Method: POST `/api/p2p/transfer-musk`
    -   Payload: `{ receiverId, amount }`
-   4.7 Rút MUSK về ví TON
    -   Method: POST `/api/withdraw/create-withdraw-request`
    -   Payload: `{ tonWalletAddress, muskAmount }`

---

### 5. Nhóm C – Nhân vật (Characters) & NFT

-   5.1 Danh mục nhân vật cơ bản
    -   Method: GET `/api/character`
    -   Side effects: `baseCharacterInfo` mapping theo `code`.
-   5.2 Nhân vật của tôi (non-NFT)
    -   Method: GET `/api/me/characters`
    -   Side effects: `unlockedPlayer` (normalize), emit `playerinfochange`.
-   5.3 Nhân vật NFT theo danh sách id (qua BASE_SERVICE)
    -   Method: POST `${BASE_SERVICE}/api/character/get-info`
    -   Payload: `{ ids: unlockedPlayerNFTIds }`
    -   Side effects: `unlockedPlayerNFT`, emit `playerinfochange`.
-   5.4 Ghép mảnh nhân vật
    -   Method: POST `/api/character/combine-fragments`
    -   Payload: `{ characterCode }`
-   5.5 Nâng cấp Level
    -   Method: POST `/api/character/upgrade-level`
    -   Payload: `{ characterOfUserId }`
-   5.6 Nâng cấp Sao
    -   Method: POST `/api/character/upgrade-star`
    -   Payload: `{ characterOfUserIds, preserveCharacterIds }`
-   5.7 Tiến hóa lên hạng S
    -   Method: POST `/api/character/upgrade-to-s-rank`
    -   Payload: `{ characterOfUserIds, preserveCharacters }`
-   5.8 Phân rã (decompose)
    -   Method: POST `/api/character/decompose`
    -   Payload: `{ characterOfUserId }`
-   5.9 Phân rã nhiều nhân vật
    -   Method: POST `/api/character/decompose-multiple`
    -   Payload: `{ characterOfUserIds, quantity }`
-   5.10 Bán nhân vật lấy MUSK
    -   Method: POST `/api/character/sell-for-musk`
    -   Payload: `{ characterOfUserId }`
-   5.11 Cập nhật đội hình chiến đấu
    -   Method: POST `/api/me/update-battle-characters`
    -   Payload: `{ characterIds }`
    -   Side effects: đồng bộ `selectedPlayerArr` phía server.
-   5.12 Mint nhân vật sang NFT
    -   Method: POST `/api/mint/character`
    -   Payload: `{ character_id }`

---

### 6. Nhóm D – Vật phẩm, Cửa hàng, Rương (Inventory/Shop/Box)

-   6.1 Danh mục vật phẩm cơ bản
    -   Method: GET `/api/game-item`
    -   Side effects: `baseItemInfo` mapping theo `code`.
-   6.2 Kho đồ (Inventory)
    -   Method: GET `/api/me/inventory`
    -   Side effects: `inventoryDictionary`, emit `inventorychange`.
-   6.3 Cửa hàng (Shop)
    -   Method: GET `/api/shop/items`
    -   Side effects: `itemShopDictionary`.
-   6.4 Mua vật phẩm trong shop
    -   Method: POST `/api/shop/buy`
    -   Payload: `{ itemCode, quantity }`
-   6.5 Mở rương
    -   Method: POST `/api/box/open`
    -   Payload: `{ box_code }`
-   6.6 Mở nhiều rương
    -   Method: POST `/api/box/open-multiple`
    -   Payload: `{ box_code, quantity }`

---

### 7. Nhóm E – Thành tích, Nhiệm vụ, Xếp hạng (Achievements/Quests/Ranking)

-   7.1 Danh sách nhiệm vụ của tôi
    -   Method: GET `/api/me/quests`
-   7.2 Đánh dấu nhiệm vụ hoàn thành
    -   Method: POST `/api/me/quests/mark-done`
    -   Payload: `{ code }`
-   7.3 Danh sách thành tích theo loại
    -   Method: GET `/api/achievement?type=<type>`
-   7.4 Nhận thưởng thành tích
    -   Method: POST `/api/achievement/claim/<achievementId>`
-   7.5 Bảng xếp hạng người chơi
    -   Method: GET `/api/rankings/users`
    -   Side effects: cập nhật `rankArr` (linh hoạt với `result.data.users` hoặc `result.data`).
-   7.6 Hạng của tôi
    -   Method: GET `/api/rankings/me`
    -   Side effects: `myRank`.

---

### 8. Nhóm F – Trận đấu, Màn chơi, Boss (Battle/Stage/Boss)

-   8.1 Trận đấu hiện tại
    -   Method: GET `/api/current-scene`
    -   Side effects: `battle`.
-   8.2 Bắt đầu trận đấu mới
    -   Method: POST `/api/start-battle`
    -   Side effects: `battle`.
-   8.3 Thông tin màn chơi
    -   Method: GET `/api/game-stage/<stage>`
    -   Side effects: `StageInfo`.
-   8.4 Boss đang hoạt động
    -   Method: GET `/api/boss/active`
-   8.5 Lịch Boss
    -   Method: GET `/api/boss/schedule`
-   8.6 Trạng thái gameplay của Boss theo `bossId`
    -   Method: GET `/api/boss/<bossId>`

---

### 9. Nhóm G – Bạn bè, Mạng lưới (Friends/Network)

-   9.1 Danh sách F1
    -   Method: GET `/api/me/f1-list`
    -   Side effects: `friendArr`.
-   9.2 Network F1 theo user `_id`
    -   Method: GET `/api/f1-users/<_id>?page=<p>&limit=20`
-   9.3 Tra cứu người dùng theo `UserId`
    -   Method: GET `/api/users/search?userId=<UserId>`

---

### 10. Nhóm H – Hộp thư (Mail)

-   10.1 Danh sách mail
    -   Method: GET `/api/mail/mails?page=<p>&limit=10`
-   10.2 Đọc mail
    -   Method: GET `/api/mail/mails/<mail_id>`
-   10.3 Nhận quà đính kèm
    -   Method: POST `/api/mail/mails/<mail_id>/receive-attachments`

---

### 11. Nhóm I – VIP & Chip Daily Reward

-   11.1 Trạng thái VIP
    -   Method: GET `/api/vip/status`
    -   Side effects: `vipStatus`, emit `vipstatuschange`.
-   11.2 Mua gói VIP
    -   Method: POST `/api/vip/purchase`
    -   Payload: `{ duration: months }`
-   11.3 Chip Daily Rewards
    -   Method: GET `/api/me/chip-rewards`
    -   Side effects: `chipDailyReward`, emit `chipdailyreward`.

---

### 12. Nhóm J – Vòng quay (Spin)

-   12.1 Spin thường
    -   Method: POST `/api/spin`
    -   Payload: `{ quantity }`
    -   Side effects: cập nhật `userInfo.Chip`, `userInfo.Musk`, emit `playerinfochange`.
-   12.2 Premium Spin
    -   Method: POST `/api/premium-spin`
    -   Payload: `{ quantity }`
    -   Side effects: tương tự spin.

---

### 13. Nhóm K – Trung tâm giao dịch (Center Market)

-   13.1 Truy vấn marketplace (bộ lọc)
    -   Method: GET `/api/market/marketplace?type=CHARACTER|GAME_ITEM&rank=...&star=...&level=...`
-   13.2 Vai trò nhân vật khả dụng
    -   Method: GET `/api/market/marketplace/character-roles`
-   13.3 Chi tiết vai trò nhân vật
    -   Method: GET `/api/market/marketplace/character-roles-detail?role=<role>`
-   13.4 Nhân vật theo code/star
    -   Method: GET `/api/market/marketplace/characters-by-star?code=<code>`
-   13.5 Nhân vật theo code/star/level
    -   Method: GET `/api/market/marketplace/characters-by-code-star-level?code=<c>&star=<s>`
-   13.6 Giá nhân vật theo code/star/level
    -   Method: GET `/api/market/marketplace/characters-by-code-star-level-price?code=<c>&star=<s>&level=<l>`
-   13.7 Lấy item theo danh sách code
    -   Method: GET `/api/market/marketplace/by-item-codes?itemCodes=<code1,code2>`
-   13.8 Mảnh nhân vật theo code
    -   Method: GET `/api/market/marketplace/character-fragments?code=<code>`
-   13.9 Tạo lệnh mua (orders)
    -   Method: POST `/api/market/marketplace/orders`
    -   Payload: `{ tradableItemId, price, quantity }`
-   13.10 Danh sách lệnh mua của tôi
    -   Method: GET `/api/market/marketplace/orders`
-   13.11 Hủy lệnh mua
    -   Method: POST `/api/market/marketplace/orders/<id>/cancel`
-   13.12 Danh sách đang bán của tôi
    -   Method: GET `/api/market/marketplace/my-listings?type=CHARACTER|GAME_ITEM`
-   13.13 Niêm yết bán (list)
    -   Method: POST `/api/market/marketplace/list`
    -   Payload: `{ characterId | itemCode | fragmentCode, price, quantity }`
-   13.14 Hủy niêm yết bán
    -   Method: POST `/api/market/marketplace/cancel/<sellingId>`
-   13.15 Lịch sử đặt lệnh mua
    -   Method: GET `/api/market/marketplace/order-history?page=<p>&limit=10`
-   13.16 Lịch sử niêm yết
    -   Method: GET `/api/market/marketplace/listing-history?page=1&limit=10`
-   13.17 Danh sách tài sản có thể giao dịch
    -   Method: GET `/api/market/tradable-items`
    -   Side effects: cache `centerMarketCharacters` và `centerMarketItems` theo key chuẩn hóa.
-   13.18 Thông tin tài sản có thể giao dịch theo `_id`
    -   Method: GET `/api/market/tradable-item/<_id>`
-   13.19 Số lệnh mua/bán theo `_id`
    -   Method: GET `/api/market/marketplace/order-counts/<_id>`

---

### 14. Nhóm L – Sàn Token MSCI

-   14.1 Orderbook MSCI
    -   Method: GET `/api/market/orderbook/token`
-   14.2 Tạo lệnh token MSCI (buy/sell)
    -   Method: POST `/api/market/order/token`
    -   Payload mặc định: `{ type: buy|sell, quantity, price, assetType: 'TOKEN', assetIdentifier: 'MSCI', currency: 'M-COIN' }`
-   14.3 Danh sách lệnh MSCI của tôi
    -   Method: GET `/api/market/orders/token/me`
-   14.4 Hủy lệnh MSCI
    -   Method: DELETE `/api/market/order/token/<_id>`
-   14.5 Bảng điều khiển MSCI của tôi
    -   Method: GET `/api/me/msci/dashboard`
-   14.6 Quy đổi CHIP -> MSCI
    -   Method: POST `/api/me/msci/convert`
    -   Payload: `{ chipAmount }`
-   14.7 Lịch sử quy đổi MSCI
    -   Method: GET `/api/me/msci/conversion-history?page=<p>`

---

### 15. Nhóm M – Neuralink (DeGameFi)

-   15.1 Khởi tạo nâng cấp Neuralink
    -   Method: POST `/api/degamefi/initiate`
    -   Payload: `{ quantity }`
-   15.2 Thanh toán bước 2 nâng cấp
    -   Method: POST `/api/degamefi/process/<_id>/pay`
-   15.3 Danh sách Neuralink có thể nâng cấp
    -   Method: GET `/api/degamefi/upgradeable_neuralinks`
-   15.4 Tiến trình chờ thanh toán bước 2
    -   Method: GET `/api/degamefi/processes?status=AWAITING_SECOND_PAYMENT`
-   15.5 Tiến trình đang tinh luyện
    -   Method: GET `/api/degamefi/processes?status=REFINING`
-   15.6 Sẵn sàng nhận (ready to claim)
    -   Method: GET `/api/degamefi/processes?status=READY_TO_CLAIM`
-   15.7 Nhận Neuralink
    -   Method: POST `/api/degamefi/process/<_id>/claim`
-   15.8 Lịch sử DeGameFi
    -   Method: GET `/api/degamefi/processes?page=<p>`
-   15.9 Quy đổi Neuralink về tài nguyên (liquidate)
    -   Method: POST `/api/degamefi/liquidate`
    -   Payload: `{ inventoryItemId, quantity }`
-   15.10 Trang bị Neuralink
    -   Method: POST `/api/degamefi/equip-item`
    -   Payload: `{ inventoryItemId, teamMember: role, itemType: 'neuralink' }`
-   15.11 Gỡ Neuralink
    -   Method: POST `/api/degamefi/unequip-item`
    -   Payload: `{ teamMember: role, itemType: 'neuralink' }`
-   15.12 Orderbook Neuralink theo type bán
    -   Method: GET `/api/market/orderbook/neuralink/sell/<type>`
-   15.13 Orderbook Neuralink theo mã
    -   Method: GET `/api/market/orderbook/neuralink?assetIdentifier=<code>`
-   15.14 Tạo lệnh Neuralink (BASE_SERVICE/fetch)
    -   Method: POST `${BASE_SERVICE}/api/market/order/token`
    -   Payload: `{ assetType: 'NEURALINK', assetIdentifier: code, type, price, quantity }`
-   15.15 Lệnh Neuralink đang mua của tôi
    -   Method: GET `/api/market/orders/neuralink/current_buy`
-   15.16 Lệnh Neuralink đang bán của tôi
    -   Method: GET `/api/market/orders/neuralink/current_sell`
-   15.17 Hủy lệnh Neuralink
    -   Method: DELETE `/api/market/order/token/<_id>`
-   15.18 Lịch sử bán Neuralink (BASE_SERVICE/fetch)
    -   Method: GET `${BASE_SERVICE}/api/market/orders/neuralink/history?type=sell&page=<p>`
-   15.19 Lịch sử mua Neuralink
    -   Method: GET `/api/market/orders/neuralink/history?type=buy&page=<p>`
-   15.20 Ghép (compose) Neuralink (BASE_SERVICE/fetch)
    -   Method: POST `${BASE_SERVICE}/api/degamefi/compose`
    -   Payload: `{ itemCode, insuranceAmount }`
    -   Side effects: Emit `inventorychange`.

---

### 16. Nhóm N – Tokenomics & Số liệu

-   16.1 Tổng quan Tokenomics
    -   Method: GET `/api/stats/tokenomics`
-   16.2 Lịch sử theo slug
    -   Method: GET `/api/stats/tokenomics/<slug>/history?page=<p>`

---

### 17. Nhóm O – Tiện ích khác

-   17.1 Lấy User ObjectId theo `UserId`
    -   Method: GET `/api/users/search?userId=<UserId>`
-   17.2 Chia sẻ Telegram URL
    -   Không gọi API; tạo URL chia sẻ dựa trên `UserId`.

---

### 18. Gợi ý tái cấu trúc theo module hóa (không thay đổi hành vi)

-   18.1 Tầng service theo domain
    -   `services/authService.js`: login, signup, forgot, me, avatar, wallet, rate.
    -   `services/userService.js`: user info, rank, quests, achievements, mails, network.
    -   `services/characterService.js`: characters CRUD, upgrades, NFT mint, selected team.
    -   `services/inventoryService.js`: inventory, shop, box.
    -   `services/battleService.js`: current scene, start battle, stage, boss.
    -   `services/marketService.js`: marketplace (items/characters/fragments), orders/listings, tradables, counts.
    -   `services/msciService.js`: orderbook MSCI, orders, dashboard, convert, history.
    -   `services/neuralinkService.js`: degamefi flows, equip/unequip, orderbooks, orders, histories, compose.
    -   `services/tokenomicsService.js`: tokenomics tổng quan và theo slug.
-   18.2 Chuẩn hóa side effects
    -   Trả về dữ liệu thuần từ service; cập nhật state/emit events ở layer `CenterData` (hoặc thông qua store như Zustand/Redux) để dễ test.
-   18.3 Đồng nhất cơ chế HTTP client
    -   Ưu tiên dùng `apiClient` cho tất cả; bọc `fetch` BASE_SERVICE thành `apiClientExternal` với interceptor token.
-   18.4 Code splitting & lazy load
    -   Tách mỗi service theo chunk; chỉ import động ở nơi dùng (React routes hoặc scene managers).

---

### 19. Lưu ý bảo mật & hiệu năng (ngắn gọn)

-   Bảo mật:
    -   Không log `initDataRaw`/token ở production.
    -   Thống nhất truyền token qua interceptor; tránh rò token khi mix `fetch`/`axios`.
-   Hiệu năng:
    -   Gom request song song cho các màn hình tổng hợp (characters + items + user) kèm cache TTL ngắn.
    -   Debounce các thao tác lọc marketplace; phân trang phía server.
    -   Ưu tiên lazy load dữ liệu không critical (orderbook neuralink/MSCI).

---

### 20. Kết luận

-   Tài liệu đã phân nhóm đầy đủ 20 nhóm tính năng/miền, bao phủ toàn bộ request trong `CenterData`.
-   Đề xuất tái cấu trúc giúp tăng khả năng bảo trì, test, áp dụng code splitting/lazy-load, và giảm coupling.
