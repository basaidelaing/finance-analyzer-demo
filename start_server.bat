@echo off
echo 启动前端服务器...
echo 访问地址: http://127.0.0.1:8080/index_fallback.html
echo.

REM 检查是否安装了http-server
where npx >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: 未找到Node.js或npx
    echo 请安装Node.js: https://nodejs.org/
    pause
    exit /b 1
)

REM 启动服务器
echo 正在启动服务器...
npx http-server -p 8080 -a 0.0.0.0 --cors

echo.
echo 服务器已停止
pause