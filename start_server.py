#!/usr/bin/env python3
"""
启动前端服务器的Python脚本
支持多种方式启动服务器
"""

import os
import sys
import subprocess
import time
import webbrowser
from pathlib import Path

def check_node_installed():
    """检查Node.js是否安装"""
    try:
        result = subprocess.run(['node', '--version'], 
                              capture_output=True, text=True, shell=True)
        if result.returncode == 0:
            print(f"✅ Node.js已安装: {result.stdout.strip()}")
            return True
    except FileNotFoundError:
        pass
    
    print("❌ Node.js未安装")
    print("请安装Node.js: https://nodejs.org/")
    return False

def check_http_server_installed():
    """检查http-server是否安装"""
    try:
        result = subprocess.run(['npx', '--version'], 
                              capture_output=True, text=True, shell=True)
        if result.returncode == 0:
            print("✅ npx可用")
            return True
    except FileNotFoundError:
        pass
    
    print("❌ npx不可用")
    return False

def start_http_server():
    """使用http-server启动服务器"""
    print("\n🚀 启动http-server...")
    print("访问地址:")
    print("  http://127.0.0.1:8080/index_fallback.html")
    print("  http://192.168.5.150:8080/index_fallback.html")
    print("\n按Ctrl+C停止服务器\n")
    
    try:
        # 启动http-server
        cmd = ['npx', 'http-server', '-p', '8080', '-a', '0.0.0.0', '--cors']
        process = subprocess.Popen(cmd, shell=True)
        
        # 等待2秒后打开浏览器
        time.sleep(2)
        webbrowser.open('http://127.0.0.1:8080/index_fallback.html')
        
        # 等待进程结束
        process.wait()
        
    except KeyboardInterrupt:
        print("\n\n🛑 服务器已停止")
    except Exception as e:
        print(f"❌ 启动服务器失败: {e}")

def start_python_server():
    """使用Python内置服务器启动"""
    print("\n🐍 使用Python内置服务器启动...")
    print("访问地址:")
    print("  http://127.0.0.1:8080/index_fallback.html")
    print("\n按Ctrl+C停止服务器\n")
    
    try:
        # 切换到当前目录
        os.chdir(os.path.dirname(os.path.abspath(__file__)))
        
        # 启动Python服务器
        import http.server
        import socketserver
        
        handler = http.server.SimpleHTTPRequestHandler
        
        with socketserver.TCPServer(("0.0.0.0", 8080), handler) as httpd:
            print("服务器已启动")
            print("按Ctrl+C停止")
            
            # 打开浏览器
            webbrowser.open('http://127.0.0.1:8080/index_fallback.html')
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n\n🛑 服务器已停止")
    except Exception as e:
        print(f"❌ 启动服务器失败: {e}")

def main():
    """主函数"""
    print("=" * 50)
    print("前端服务器启动脚本")
    print("=" * 50)
    
    # 检查当前目录
    current_dir = os.path.dirname(os.path.abspath(__file__))
    print(f"📁 工作目录: {current_dir}")
    
    # 检查index_fallback.html是否存在
    index_file = os.path.join(current_dir, 'index_fallback.html')
    if not os.path.exists(index_file):
        print(f"❌ 找不到主文件: {index_file}")
        return
    
    print("✅ 主文件存在")
    
    # 选择启动方式
    print("\n请选择启动方式:")
    print("1. 使用Node.js http-server（推荐）")
    print("2. 使用Python内置服务器")
    print("3. 退出")
    
    choice = input("\n请输入选择 (1-3): ").strip()
    
    if choice == '1':
        if check_node_installed() and check_http_server_installed():
            start_http_server()
        else:
            print("\n⚠️  Node.js/http-server不可用，尝试使用Python服务器...")
            start_python_server()
    elif choice == '2':
        start_python_server()
    elif choice == '3':
        print("退出")
    else:
        print("无效选择")

if __name__ == "__main__":
    main()