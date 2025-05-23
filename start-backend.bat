@echo off
echo ========================================
echo    KHOI DONG BACKEND ECOMMERCE PHONE
echo ========================================
echo.

echo [1/3] Kiem tra Java...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Java khong duoc cai dat hoac khong co trong PATH
    echo Vui long cai dat Java 17 hoac cao hon
    pause
    exit /b 1
)
echo ✅ Java da duoc cai dat

echo.
echo [2/3] Chuyen den thu muc backend...
cd /d "%~dp0be_ecommerce_phone"
if %errorlevel% neq 0 (
    echo ❌ Khong tim thay thu muc be_ecommerce_phone
    pause
    exit /b 1
)
echo ✅ Da chuyen den thu muc backend

echo.
echo [3/3] Khoi dong Spring Boot server...
echo 🚀 Dang khoi dong server tren port 8080...
echo 📝 Log se hien thi ben duoi:
echo ========================================
echo.

mvnw.cmd spring-boot:run

echo.
echo ========================================
echo Server da dung hoat dong
echo ========================================
pause
