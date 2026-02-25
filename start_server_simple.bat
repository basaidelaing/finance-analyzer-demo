@echo off
echo 启动前端服务器...
echo.

REM 切换到脚本所在目录
cd /d "%~dp0"

REM 检查Python是否安装
python --version >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: Python未安装
    echo 请安装Python: https://www.python.org/
    pause
    exit /b 1
)

REM 运行Python脚本
echo 正在启动服务器...
python start_server.py

echo.
pause