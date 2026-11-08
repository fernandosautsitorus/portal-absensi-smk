@echo off
title Portal Absensi SMK - Localhost Server
color 0A
echo ========================================================
echo         PORTAL ABSENSI SISWA SMK - LOCALHOST
echo ========================================================
echo.
set PATH=C:\Program Files\nodejs;%PATH%
cd /d "%~dp0"

echo [1/3] Memeriksa file database & skema Prisma...
call npx prisma generate

echo.
echo [2/3] Membuka browser Anda di http://localhost:3000 ...
start http://localhost:3000

echo.
echo [3/3] Menjalankan server aplikasi Next.js...
echo Tekan Ctrl + C di jendela ini untuk mematikan server.
echo ========================================================
echo.
call npx next dev -p 3000
pause
