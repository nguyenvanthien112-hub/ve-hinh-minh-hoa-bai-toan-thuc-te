@echo off
chcp 65001 >nul
title Đẩy Code Lên GitHub - Vẽ Hình Minh Hoạ Toán Thực Tế 5.0
cd /d "%~dp0"

echo ========================================================================
echo        ĐẨY MÃ NGUỒN LÊN GITHUB - VẼ HÌNH MINH HOẠ TOÁN THỰC TẾ 5.0
echo ========================================================================
echo.

git add .
git commit -m "update: latest changes"
git push origin main

echo.
if errorlevel 1 (
    echo [THÔNG BÁO] Quá trình đẩy code gặp sự cố. Nếu GitHub yêu cầu đăng nhập, vui lòng xác thực trên cửa sổ trình duyệt bật lên.
) else (
    echo [THÀNH CÔNG] Đã đẩy toàn bộ mã nguồn lên GitHub thành công!
)
echo.
pause
