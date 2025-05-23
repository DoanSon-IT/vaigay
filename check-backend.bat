@echo off
echo ========================================
echo    KIEM TRA BACKEND ECOMMERCE PHONE
echo ========================================
echo.

echo [1/2] Kiem tra port 8080...
netstat -an | findstr ":8080" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Port 8080 dang duoc su dung
) else (
    echo ❌ Port 8080 khong duoc su dung
    echo 💡 Backend chua duoc khoi dong
    echo.
    echo Chay file start-backend.bat de khoi dong backend
    pause
    exit /b 1
)

echo.
echo [2/2] Kiem tra API endpoint...
curl -s http://localhost:8080/api/products >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ API endpoint hoat dong binh thuong
    echo 🎉 Backend da san sang!
) else (
    echo ❌ Khong the ket noi den API endpoint
    echo 💡 Co the backend dang khoi dong hoac co loi
    echo.
    echo Vui long kiem tra log cua backend
)

echo.
echo ========================================
echo Ket qua kiem tra hoan tat
echo ========================================
pause
