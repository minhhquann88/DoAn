@echo off
echo ========================================
echo KHOI DONG BACKEND
echo ========================================
echo.

REM Kiểm tra Java
java -version >nul 2>&1
if errorlevel 1 (
    echo ❌ Java chua duoc cai dat hoac khong co trong PATH
    echo Vui long cai dat JDK 21 hoac JDK 17+
    pause
    exit /b 1
)

echo ✅ Java da san sang
echo.

REM Kiểm tra MySQL
sc query MySQL95 | find "RUNNING" >nul
if errorlevel 1 (
    echo ⚠️  MySQL co the chua chay, nhung se thu ket noi
) else (
    echo ✅ MySQL dang chay
)
echo.

REM Thử dùng Maven nếu có
where mvn >nul 2>&1
if not errorlevel 1 (
    echo ✅ Tim thay Maven
    echo Dang khoi dong backend...
    echo.
    mvn spring-boot:run
    goto :end
)

REM Thử dùng Maven Wrapper
if exist "mvnw.cmd" (
    echo ✅ Tim thay Maven Wrapper
    echo Dang khoi dong backend...
    echo.
    call mvnw.cmd spring-boot:run
    goto :end
)

REM Nếu không có Maven
echo ❌ Khong tim thay Maven hoac Maven Wrapper
echo.
echo KHUYEN NGHI: Dung IDE (IntelliJ IDEA hoac Eclipse)
echo   1. Mo IDE
echo   2. Import project: backend folder
echo   3. Chay: CourseManagementSystemApplication.java
echo.
pause

:end


