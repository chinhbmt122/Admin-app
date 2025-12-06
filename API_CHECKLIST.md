# ✅ API CHECKLIST - THEO DÕI API CHO TỪNG MÀN HÌNH

**Dự án:** Admin Dashboard - Hệ thống quản lý rạp chiếu phim  
**Mục đích:** Theo dõi API endpoints cho từng màn hình  
**Ngày tạo:** 06/12/2025

---

## 🎬 **1. MOVIES MANAGEMENT** (`/dashboard/movies`)

**Chức năng:** Quản lý danh sách phim

- [ ] **GET** - Lấy danh sách phim
- [ ] **POST** - Tạo phim mới
- [ ] **PUT** - Cập nhật thông tin phim
- [ ] **DELETE** - Xóa phim

**Ghi chú:**
- Frontend filter client-side (search theo tên, lọc theo thể loại, trạng thái)
- Không cần API search riêng

---

## 🎭 **2. GENRES MANAGEMENT** (`/dashboard/genres`)

**Chức năng:** Quản lý thể loại phim

- [ ] **GET** - Lấy danh sách thể loại
- [ ] **POST** - Tạo thể loại mới
- [ ] **PUT** - Cập nhật thể loại
- [ ] **DELETE** - Xóa thể loại

**Ghi chú:**
- API này cũng dùng cho dropdown trong Movies Management

---

## 🏢 **3. CINEMAS MANAGEMENT** (`/dashboard/cinemas`)

**Chức năng:** Quản lý danh sách rạp chiếu phim

- [ ] **GET** - Lấy danh sách tất cả rạp
- [ ] **POST** - Tạo rạp mới
- [ ] **PATCH** - Cập nhật thông tin rạp
- [ ] **DELETE** - Xóa rạp

**Ghi chú:**
- Frontend tự filter client-side theo tên rạp/thành phố
- Không cần API search riêng

---

## 🎪 **4. HALLS MANAGEMENT** (`/dashboard/halls`)

**Chức năng:** Quản lý phòng chiếu

- [ ] **GET** - Lấy danh sách tất cả phòng chiếu
- [ ] **GET** - Lấy chi tiết phòng chiếu kèm sơ đồ ghế (dùng cho Seat Status)
- [ ] **POST** - Tạo phòng chiếu mới
- [ ] **PATCH** - Cập nhật thông tin phòng chiếu
- [ ] **DELETE** - Xóa phòng chiếu
- [ ] **PATCH** - Cập nhật trạng thái ghế ngồi (ACTIVE/BROKEN/MAINTENANCE)

**Ghi chú:**
- Frontend tự group theo rạp (cinemaId) client-side
- API chi tiết phòng + ghế dùng cho Seat Status Management
- API GET danh sách halls cũng dùng cho dropdown khi tạo Showtime (chọn phòng chiếu)

---

## 🎬 **5. SHOWTIMES MANAGEMENT** (`/dashboard/showtimes`)

**Chức năng:** Quản lý lịch chiếu phim

- [ ] **GET** - Lấy danh sách lịch chiếu (với query params: date, cinemaId, movieId)
- [ ] **POST** - Tạo lịch chiếu đơn lẻ
- [ ] **PATCH** - Cập nhật lịch chiếu
- [ ] **DELETE** - Xóa lịch chiếu

**Query Parameters cho GET /showtimes:**
- `date` (required): yyyy-MM-dd
- `cinemaId` (optional): Filter theo rạp
- `movieId` (optional): Filter theo phim

**Ghi chú:**
- Frontend có filter: Date (required), Cinema (optional), Movie (optional)
- Frontend tự group theo phim (movieId) khi hiển thị

---

## 🎬 **6. BATCH SHOWTIMES** (`/dashboard/batch-showtimes`)

**Chức năng:** Tạo nhiều suất chiếu theo lịch lặp lại

- [ ] **GET** - Lấy danh sách lịch phát hành theo phim (từ Movie Releases)
- [ ] **POST** - Tạo lịch chiếu hàng loạt (batch)

**Ghi chú:**
- Tạo nhiều suất chiếu cùng lúc (VD: 10h, 14h, 18h, 21h từ 01/01 đến 31/01)
- Cần API lấy movie releases để chọn phiên bản phát hành

---

## 👁️ **7. SHOWTIME SEATS** (`/dashboard/showtime-seats`)

**Chức năng:** Xem sơ đồ ghế + trạng thái đặt của 1 suất chiếu

- [ ] **GET** - Xem danh sách ghế của 1 suất chiếu

**Ghi chú:**
- Hiển thị ghế còn trống/đã đặt/đã bán
- Read-only view

---

## 🪑 **8. SEAT STATUS MANAGEMENT** (`/dashboard/seat-status`)

**Chức năng:** Quản lý trạng thái ghế hỏng/bảo trì

- [ ] **GET** - Lấy chi tiết phòng chiếu kèm sơ đồ ghế (dùng API từ Halls)
- [ ] **PATCH** - Cập nhật trạng thái ghế (ACTIVE/BROKEN/MAINTENANCE)

**Ghi chú:**
- Dùng chung API với Halls Management (4.2 và 4.6)

---

## 📅 **9. MOVIE RELEASES MANAGEMENT** (`/dashboard/movie-releases`)

**Chức năng:** Quản lý lịch phát hành phim

- [ ] **GET** - Lấy danh sách lịch phát hành theo phim
- [ ] **POST** - Tạo lịch phát hành mới
- [ ] **PUT** - Cập nhật lịch phát hành
- [ ] **DELETE** - Xóa lịch phát hành

**Ghi chú:**
- Frontend có filter: Search (theo tên phim), Status (Active/Upcoming/Ended)
- Filter client-side

---

## 🎟️ **10. TICKET PRICING** (`/dashboard/ticket-pricing`)

**Chức năng:** Quản lý bảng giá vé

- [ ] **GET** - Lấy bảng giá vé của phòng chiếu
- [ ] **PATCH** - Cập nhật giá vé cơ bản

**Ghi chú:**
- Lấy giá vé cơ bản + phụ thu theo loại ghế/ngày/khung giờ

---

## 👥 **11. STAFF MANAGEMENT** (`/dashboard/staff`)

**Chức năng:** Quản lý nhân viên

⚠️ **CHƯA CÓ TRONG OPENAPI.YML**

- [ ] **GET** - Lấy danh sách nhân viên (có thể lọc theo rạp/role/status)
- [ ] **POST** - Tạo nhân viên mới
- [ ] **PUT** - Cập nhật thông tin nhân viên
- [ ] **DELETE** - Xóa nhân viên

**Ghi chú:**
- Cần thêm vào openapi.yml

---

## 📝 **12. RESERVATIONS MANAGEMENT** (`/dashboard/reservations`)

**Chức năng:** Quản lý đặt vé

⚠️ **CHƯA CÓ TRONG OPENAPI.YML**

- [ ] **GET** - Lấy danh sách đặt vé (filter theo status/payment/customer/movie/cinema/date)
- [ ] **GET** - Xem chi tiết đơn đặt vé
- [ ] **PATCH** - Cập nhật trạng thái đặt vé (confirm/cancel)

**Ghi chú:**
- Cần thêm vào openapi.yml

---

## 📊 **13. REPORTS** (`/dashboard/reports`)

**Chức năng:** Báo cáo & Thống kê

⚠️ **CHƯA CÓ TRONG OPENAPI.YML**

- [ ] **GET** - Báo cáo doanh thu theo thời gian
- [ ] **GET** - Báo cáo phân loại doanh thu (vé/đồ ăn/khác)
- [ ] **GET** - Top phim bán chạy
- [ ] **GET** - Top rạp có doanh thu cao
- [ ] **GET** - Thống kê theo khung giờ (sáng/trưa/chiều/tối)
- [ ] **GET** - Thống kê theo loại ghế (STANDARD/VIP/COUPLE)
- [ ] **GET** - Xu hướng doanh thu (area/line chart)

**Ghi chú:**
- Mức độ ưu tiên thấp (làm sau)
- Cần thêm vào openapi.yml

---

## ⭐ **14. REVIEWS MANAGEMENT** (`/dashboard/reviews`)

**Chức năng:** Quản lý đánh giá phim (Optional)

⚠️ **CHƯA CÓ TRONG OPENAPI.YML**

- [ ] **GET** - Lấy danh sách đánh giá (filter theo phim/status)
- [ ] **PATCH** - Duyệt/Ẩn đánh giá

**Ghi chú:**
- Optional feature
- Cần thêm vào openapi.yml

---

## ⚙️ **15. SETTINGS** (`/dashboard/settings`)

**Chức năng:** Cài đặt hệ thống

**Ghi chú:**
- Không yêu cầu API backend riêng
- Màn hình phụ cho cấu hình client-side

---

## 📈 **16. DASHBOARD** (`/dashboard`)

**Chức năng:** Tổng quan thống kê

**Ghi chú:**
- Có thể dùng lại API từ Reports module
- Hiển thị tổng quan: doanh thu, số vé bán, top phim, top rạp

---

## 📊 **TỔNG KẾT**

| Trạng thái | Số lượng API | Module |
|------------|--------------|--------|
| ✅ **Có trong openapi.yml** | **31 API** | Movies (4), Genres (4), Cinemas (4), Halls (6), Showtimes (7), Movie Releases (4), Ticket Pricing (2) |
| ⚠️ **Chưa có trong openapi.yml** | **16 API** | Staff (4), Reservations (3), Reports (7), Reviews (2) |
| **TỔNG CỘNG** | **47 API** | **11 modules** |

---

## 🎯 **HÀNH ĐỘNG TIẾP THEO**

### **Backend Team:**
1. ✅ Triển khai 31 API đã có trong openapi.yml
2. ⚠️ Thêm 16 API còn thiếu vào openapi.yml (Staff, Reservations, Reports, Reviews)
3. ✅ Implement query parameters cho Showtimes (date, cinemaId, movieId)

### **Frontend Team:**
1. ✅ Đã hoàn thành tất cả màn hình
2. ✅ Đã thêm filter cho Showtimes và Movie Releases
3. ⏳ Chờ backend implement API để integration test

### **Priority:**
- 🔴 **Cao:** Movies, Cinemas, Halls, Showtimes, Reservations
- 🟠 **Trung bình:** Genres, Movie Releases, Staff
- 🟡 **Thấp:** Ticket Pricing, Reports
- 🟢 **Optional:** Reviews

---

**Cập nhật lần cuối:** 06/12/2025  
**Người tạo:** Frontend Team
