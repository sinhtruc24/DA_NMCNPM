# ActiHub - Hệ thống quản lý điểm rèn luyện sinh viên

## Giới thiệu

ActiHub là một ứng dụng web quản lý hoạt động và điểm rèn luyện sinh viên. Hệ thống cho phép tổ chức tạo và quản lý các hoạt động, sinh viên đăng ký tham gia và theo dõi điểm rèn luyện.

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Cấu hình database:
- Tạo file .env và thêm DATABASE_URL

3. Chạy migration:
```bash
npm run db:push
```

4. Khởi chạy ứng dụng:
```bash
npm run dev
```

## Tài khoản mẫu

- Tổ chức: username: admin, password: password123
- Sinh viên: username: student, password: password123

## Tính năng

- Đăng nhập/Đăng ký với vai trò sinh viên hoặc tổ chức
- Quản lý hoạt động (tạo, cập nhật, xóa)
- Đăng ký tham gia hoạt động
- Theo dõi và quản lý điểm rèn luyện
- Phê duyệt đăng ký tham gia
- Gửi và giải quyết khiếu nại
- Thông báo

## Công nghệ sử dụng

- Frontend: React, TailwindCSS, shadcn/ui
- Backend: Node.js, Express
- Database: PostgreSQL
- ORM: Drizzle
