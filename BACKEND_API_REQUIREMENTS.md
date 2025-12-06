# 📋 DANH SÁCH API BACKEND CẦN PHÁT TRIỂN

**Dự án:** Admin Dashboard - Hệ thống quản lý rạp chiếu phim  
**Ngày tạo:** 06/12/2025

---

## 🎬 **1. MOVIES (Quản lý Phim)**

### 1.1. Lấy danh sách phim
- **Dùng cho màn hình:** Movies Management (hiển thị danh sách phim trong bảng)
- **Mô tả:** Lấy tất cả phim trong hệ thống để hiển thị, tìm kiếm, lọc
- **Method:** GET

### 1.2. Tạo phim mới
- **Dùng cho màn hình:** Movies Management (dialog thêm phim mới)
- **Mô tả:** Thêm 1 bộ phim mới vào hệ thống
- **Method:** POST

### 1.3. Cập nhật thông tin phim
- **Dùng cho màn hình:** Movies Management (dialog chỉnh sửa phim)
- **Mô tả:** Chỉnh sửa thông tin phim đã có
- **Method:** PUT

### 1.4. Xóa phim
- **Dùng cho màn hình:** Movies Management (nút xóa trong bảng)
- **Mô tả:** Xóa phim khỏi hệ thống
- **Method:** DELETE

---

## 🎭 **2. GENRES (Thể loại phim)**

### 2.1. Lấy danh sách thể loại
- **Dùng cho màn hình:** Genres Management (hiển thị bảng thể loại), Movies Management (dropdown chọn thể loại khi thêm/sửa phim)
- **Mô tả:** Lấy tất cả thể loại phim (Action, Horror, Comedy, Drama...)
- **Method:** GET

### 2.2. Tạo thể loại mới
- **Dùng cho màn hình:** Genres Management (dialog thêm thể loại)
- **Mô tả:** Thêm thể loại phim mới
- **Method:** POST

### 2.3. Cập nhật thể loại
- **Dùng cho màn hình:** Genres Management (dialog chỉnh sửa thể loại)
- **Mô tả:** Chỉnh sửa tên hoặc mô tả thể loại
- **Method:** PUT

### 2.4. Xóa thể loại
- **Dùng cho màn hình:** Genres Management (nút xóa trong bảng)
- **Mô tả:** Xóa thể loại khỏi hệ thống
- **Method:** DELETE

---

## 🏢 **3. CINEMAS (Rạp chiếu phim)**

### 3.1. Lấy danh sách tất cả rạp
- **Dùng cho màn hình:** Cinemas Management (hiển thị bảng rạp + tìm kiếm), Showtimes (dropdown chọn rạp)
- **Mô tả:** Lấy danh sách tất cả rạp trong hệ thống
- **Method:** GET
- **Lưu ý:** Frontend tự filter client-side theo tên rạp/thành phố, không cần API search riêng

### 3.2. Tạo rạp mới
- **Dùng cho màn hình:** Cinemas Management (dialog thêm rạp mới)
- **Mô tả:** Thêm rạp mới vào hệ thống
- **Method:** POST

### 3.3. Cập nhật thông tin rạp
- **Dùng cho màn hình:** Cinemas Management (dialog chỉnh sửa rạp)
- **Mô tả:** Chỉnh sửa thông tin rạp (tên, địa chỉ, tọa độ, SĐT, trạng thái)
- **Method:** PATCH

### 3.4. Xóa rạp
- **Dùng cho màn hình:** Cinemas Management (nút xóa trong bảng)
- **Mô tả:** Xóa rạp khỏi hệ thống
- **Method:** DELETE

---

## 🎪 **4. HALLS (Phòng chiếu)**

### 4.1. Lấy danh sách tất cả phòng chiếu
- **Dùng cho màn hình:** Halls Management (hiển thị bảng phòng chiếu, group theo rạp)
- **Mô tả:** Lấy tất cả phòng chiếu trong hệ thống
- **Method:** GET
- **Lưu ý:** Frontend tự group theo rạp (cinemaId), không cần API filter riêng

### 4.2. Lấy chi tiết phòng chiếu kèm sơ đồ ghế
- **Dùng cho màn hình:** Seat Status Management (xem sơ đồ ghế để quản lý trạng thái ghế hỏng/bảo trì)
- **Mô tả:** Lấy thông tin chi tiết 1 phòng + danh sách tất cả ghế (hàng, số ghế, loại ghế, trạng thái)
- **Method:** GET

### 4.3. Tạo phòng chiếu mới
- **Dùng cho màn hình:** Halls Management (dialog thêm phòng chiếu)
- **Mô tả:** Thêm phòng chiếu mới vào rạp
- **Method:** POST

### 4.4. Cập nhật thông tin phòng chiếu
- **Dùng cho màn hình:** Halls Management (dialog chỉnh sửa phòng)
- **Mô tả:** Chỉnh sửa thông tin phòng chiếu
- **Method:** PATCH

### 4.5. Xóa phòng chiếu
- **Dùng cho màn hình:** Halls Management (nút xóa trong bảng)
- **Mô tả:** Xóa phòng chiếu
- **Method:** DELETE

### 4.6. Cập nhật trạng thái ghế ngồi
- **Dùng cho màn hình:** Seat Status Management (đánh dấu ghế hỏng/bảo trì/hoạt động)
- **Mô tả:** Thay đổi trạng thái ghế (ACTIVE/BROKEN/MAINTENANCE)
- **Method:** PATCH

---

## 🎬 **5. SHOWTIMES (Lịch chiếu phim)**

### 5.1. Lấy danh sách lịch chiếu
- **Dùng cho màn hình:** Showtimes Management (hiển thị bảng lịch chiếu với filter ngày/rạp/phim, group theo phim)
- **Mô tả:** Lấy danh sách lịch chiếu, có thể filter theo ngày/rạp/phim
- **Method:** GET
- **Query Parameters:**
  - `date` (required): Ngày cần lấy lịch chiếu (format: yyyy-MM-dd)
  - `cinemaId` (optional): Lọc theo rạp cụ thể
  - `movieId` (optional): Lọc theo phim cụ thể
- **Lưu ý:** Frontend tự group theo phim (movieId) khi hiển thị

### 5.2. Lấy danh sách phòng chiếu
- **Dùng cho màn hình:** Showtimes Management (dropdown chọn phòng chiếu khi tạo lịch chiếu)
- **Mô tả:** Lấy danh sách phòng chiếu (halls) cho dropdown
- **Method:** GET
- **Lưu ý:** Có thể dùng lại API 4.1 nếu lọc theo rạp

### 5.3. Tạo lịch chiếu đơn lẻ
- **Dùng cho màn hình:** Showtimes Management (dialog thêm 1 suất chiếu)
- **Mô tả:** Tạo 1 suất chiếu đơn lẻ
- **Method:** POST

### 5.4. Tạo lịch chiếu hàng loạt (batch)
- **Dùng cho màn hình:** Batch Showtimes (tạo nhiều suất chiếu theo lịch lặp lại - hàng ngày/hàng tuần)
- **Mô tả:** Tạo nhiều suất chiếu cùng lúc (VD: tạo suất 10h, 14h, 18h, 21h từ 01/01 đến 31/01)
- **Method:** POST

### 5.5. Cập nhật lịch chiếu
- **Dùng cho màn hình:** Showtimes Management (dialog chỉnh sửa suất chiếu)
- **Mô tả:** Chỉnh sửa thông tin suất chiếu
- **Method:** PATCH

### 5.6. Xóa lịch chiếu
- **Dùng cho màn hình:** Showtimes Management (nút xóa/hủy suất chiếu)
- **Mô tả:** Hủy suất chiếu
- **Method:** DELETE

### 5.7. Xem danh sách ghế của 1 suất chiếu
- **Dùng cho màn hình:** Showtime Seats (xem sơ đồ ghế + trạng thái đặt của 1 suất chiếu cụ thể)
- **Mô tả:** Lấy danh sách ghế + trạng thái đặt (còn trống/đã đặt/đã bán) của 1 suất chiếu
- **Method:** GET

---

## 📅 **6. MOVIE RELEASES (Lịch phát hành phim)**

### 6.1. Lấy danh sách lịch phát hành theo phim
- **Dùng cho màn hình:** Batch Showtimes (dropdown chọn release để tạo lịch chiếu theo phiên bản phát hành)
- **Mô tả:** Lấy các lịch phát hành của 1 bộ phim
- **Method:** GET

### 6.2. Tạo lịch phát hành mới
- **Dùng cho màn hình:** Movie Releases Management (dialog thêm lịch phát hành)
- **Mô tả:** Thêm lịch phát hành cho phim
- **Method:** POST

### 6.3. Cập nhật lịch phát hành
- **Dùng cho màn hình:** Movie Releases Management (dialog chỉnh sửa release)
- **Mô tả:** Chỉnh sửa lịch phát hành
- **Method:** PUT

### 6.4. Xóa lịch phát hành
- **Dùng cho màn hình:** Movie Releases Management (nút xóa trong bảng)
- **Mô tả:** Xóa lịch phát hành
- **Method:** DELETE

---

## 🎫 **7. TICKET PRICING (Bảng giá vé)**

### 7.1. Lấy bảng giá vé của phòng chiếu
- **Dùng cho màn hình:** Ticket Pricing (xem bảng giá vé theo phòng chiếu)
- **Mô tả:** Lấy giá vé cơ bản + các mức phụ thu theo loại ghế/ngày/khung giờ
- **Method:** GET

### 7.2. Cập nhật giá vé cơ bản
- **Dùng cho màn hình:** Ticket Pricing (chỉnh sửa giá vé cơ bản của phòng)
- **Mô tả:** Thay đổi giá vé cơ bản (basePrice) của phòng chiếu
- **Method:** PATCH

---

## 👥 **8. STAFF (Quản lý nhân viên)** ⚠️ CHƯA CÓ TRONG OPENAPI.YML

### 8.1. Lấy danh sách nhân viên
- **Dùng cho màn hình:** Staff Management (hiển thị bảng nhân viên, lọc theo rạp/chức vụ/trạng thái)
- **Mô tả:** Lấy tất cả nhân viên, có thể lọc theo rạp/role/status
- **Method:** GET
- **⚠️ API này CHƯA có trong contract (openapi.yml)**

### 8.2. Tạo nhân viên mới
- **Dùng cho màn hình:** Staff Management (dialog thêm nhân viên)
- **Mô tả:** Thêm nhân viên mới vào hệ thống
- **Method:** POST
- **⚠️ API này CHƯA có trong contract (openapi.yml)**

### 8.3. Cập nhật thông tin nhân viên
- **Dùng cho màn hình:** Staff Management (dialog chỉnh sửa nhân viên)
- **Mô tả:** Chỉnh sửa thông tin nhân viên
- **Method:** PUT
- **⚠️ API này CHƯA có trong contract (openapi.yml)**

### 8.4. Xóa nhân viên
- **Dùng cho màn hình:** Staff Management (nút xóa trong bảng)
- **Mô tả:** Xóa nhân viên
- **Method:** DELETE
- **⚠️ API này CHƯA có trong contract (openapi.yml)**

---

## 📝 **9. RESERVATIONS (Quản lý đặt vé)** ⚠️ CHƯA CÓ TRONG OPENAPI.YML

### 9.1. Lấy danh sách đặt vé
- **Dùng cho màn hình:** Reservations Management (hiển thị bảng đơn đặt vé, lọc theo trạng thái/thanh toán/khách hàng/phim/rạp/ngày)
- **Mô tả:** Lấy tất cả đơn đặt vé, có thể lọc theo nhiều tiêu chí
- **Method:** GET
- **⚠️ API này CHƠA có trong contract (openapi.yml)**

### 9.2. Xem chi tiết đơn đặt vé
- **Dùng cho màn hình:** Reservations Management (dialog xem chi tiết đơn đặt vé)
- **Mô tả:** Xem thông tin chi tiết 1 đơn (khách hàng, phim, rạp, ghế, thanh toán, lịch sử)
- **Method:** GET
- **⚠️ API này CHƠA có trong contract (openapi.yml)**

### 9.3. Cập nhật trạng thái đặt vé
- **Dùng cho màn hình:** Reservations Management (nút xác nhận/hủy đơn đặt vé)
- **Mô tả:** Xác nhận hoặc hủy đơn đặt vé
- **Method:** PATCH
- **⚠️ API này CHƠA có trong contract (openapi.yml)**

---

## 📊 **10. REPORTS (Báo cáo & Thống kê)** ⚠️ CHƯA CÓ TRONG OPENAPI.YML

### 10.1. Báo cáo doanh thu theo thời gian
- **Dùng cho màn hình:** Reports (biểu đồ cột/line chart doanh thu theo tháng/tuần/ngày)
- **Mô tả:** Lấy doanh thu theo thời gian để vẽ biểu đồ
- **Method:** GET
- **⚠️ API này CHƠA có trong contract (openapi.yml)**

### 10.2. Báo cáo phân loại doanh thu
- **Dùng cho màn hình:** Reports (biểu đồ tròn phân loại doanh thu)
- **Mô tả:** Doanh thu chia theo nguồn (vé, đồ ăn, khác)
- **Method:** GET
- **⚠️ API này CHƠA có trong contract (openapi.yml)**

### 10.3. Top phim bán chạy
- **Dùng cho màn hình:** Reports (bảng top phim có doanh thu cao nhất)
- **Mô tả:** Danh sách phim bán chạy nhất theo doanh thu
- **Method:** GET
- **⚠️ API này CHƠA có trong contract (openapi.yml)**

### 10.4. Top rạp có doanh thu cao
- **Dùng cho màn hình:** Reports (bảng top rạp có doanh thu cao nhất)
- **Mô tả:** Danh sách rạp có doanh thu cao nhất
- **Method:** GET
- **Endpoint:** `/reports/top-cinemas`
- **⚠️ API này CHƯA có trong contract (openapi.yml)**

### 10.5. Thống kê theo khung giờ
- **Dùng cho màn hình:** Reports (biểu đồ phân bố bán vé theo giờ trong ngày)
- **Mô tả:** Số vé bán theo khung giờ (sáng/trưa/chiều/tối)
- **Method:** GET
- **Endpoint:** `/reports/time-distribution`
- **⚠️ API này CHƯA có trong contract (openapi.yml)**

### 10.6. Thống kê theo loại ghế
- **Dùng cho màn hình:** Reports (biểu đồ tròn phân bố theo loại ghế)
- **Mô tả:** Số vé và doanh thu theo loại ghế (STANDARD/VIP/COUPLE...)
- **Method:** GET
- **Endpoint:** `/reports/seat-type-distribution`
- **⚠️ API này CHƯA có trong contract (openapi.yml)**

### 10.7. Xu hướng doanh thu
- **Dùng cho màn hình:** Reports (biểu đồ đường xu hướng tăng/giảm doanh thu)
- **Mô tả:** Xu hướng doanh thu theo thời gian (để vẽ area/line chart)
- **Method:** GET
- **Endpoint:** `/reports/revenue-trend`
- **⚠️ API này CHƯA có trong contract (openapi.yml)**

---

## ⭐ **11. REVIEWS (Đánh giá phim)** ⚠️ CHƯA CÓ TRONG OPENAPI.YML - OPTIONAL

### 11.1. Lấy danh sách đánh giá
- **Dùng cho màn hình:** Reviews Management (hiển thị bảng đánh giá từ khách hàng, lọc theo phim/trạng thái)
- **Mô tả:** Lấy danh sách review từ khách hàng
- **Method:** GET
- **⚠️ API này CHƯA có trong contract (openapi.yml)**

### 11.2. Duyệt/Ẩn đánh giá
- **Dùng cho màn hình:** Reviews Management (nút duyệt/ẩn review không phù hợp)
- **Mô tả:** Duyệt hoặc ẩn review
- **Method:** PATCH
- **⚠️ API này CHƯA có trong contract (openapi.yml)**

---

## 📌 **TÓM TẮT SỐ LƯỢNG**

| Module | Số API | Mức độ ưu tiên |
|--------|--------|----------------|
| Movies | 4 API | 🔴 Cao |
| Genres | 4 API | 🟠 Trung bình |
| Cinemas | 4 API | 🔴 Cao |
| Halls | 6 API | 🔴 Cao |
| Showtimes | 7 API | 🔴 Cao |
| Movie Releases | 4 API | 🟠 Trung bình |
| Ticket Pricing | 2 API | 🟡 Thấp |
| Staff | 4 API | 🟠 Trung bình | ⚠️ Chưa có trong openapi.yml |
| Reservations | 3 API | 🔴 Cao | ⚠️ Chưa có trong openapi.yml |
| Reports | 7 API | 🟡 Thấp (làm sau) | ⚠️ Chưa có trong openapi.yml |
| Reviews | 2 API | 🟢 Optional | ⚠️ Chưa có trong openapi.yml |
| **TỔNG CỘNG** | **47 endpoints** | |
| **Có trong openapi.yml** | **31 endpoints** | ✅ Movies, Genres, Cinemas, Halls, Showtimes, Movie Releases, Ticket Pricing |
| **Chưa có trong openapi.yml** | **16 endpoints** | ⚠️ Staff, Reservations, Reports, Reviews |

---

## ⚠️ **LƯU Ý CHO BACKEND**

### 🔐 Authentication
- Tất cả API cần xác thực JWT token (Bearer token)
- Phân quyền theo role: ADMIN, MANAGER, STAFF, CASHIER

### 📄 Pagination & Sorting
- Hỗ trợ phân trang: `page`, `limit`
- Cho phép sắp xếp: `sortBy`, `order`

### ❌ Error Handling
- Status code chuẩn: 400, 401, 403, 404, 409, 500
- Trả về message lỗi rõ ràng

### ✅ Validation
- Validate input: required fields, data type, format, length, business rules

### 📊 Performance
- Database indexing
- Caching cho data ít thay đổi
- Optimize N+1 query

### 🗄️ Database
- Sử dụng transaction cho thao tác phức tạp
- Soft delete thay vì hard delete
- Audit log: ai, làm gì, khi nào

---

## 🎯 **ROADMAP TRIỂN KHAI ĐỀ XUẤT**

### Phase 1: Core Features (2-3 tuần)
1. ✅ Authentication & User Management
2. ✅ Movies & Genres API
3. ✅ Cinemas & Halls API
4. ✅ Showtimes API (đơn + batch)

### Phase 2: Booking & Pricing (1-2 tuần)
5. ✅ Ticket Pricing API
6. ✅ Reservations API
7. ✅ Seat Status Management

### Phase 3: Admin Features (1 tuần)
8. ✅ Staff Management API
9. ✅ Movie Releases API

### Phase 4: Analytics (1-2 tuần)
10. ✅ Reports & Statistics API
11. ✅ Reviews API (optional)

---

**Tạo bởi:** Frontend Team  
**Liên hệ:** [Email/Slack của bạn]  
**Cập nhật lần cuối:** 06/12/2025
