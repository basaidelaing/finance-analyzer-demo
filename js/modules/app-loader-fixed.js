// 修复版应用加载器 - 加载真实模块
// 文件大小: <8KB

class FixedModuleLoader {
    constructor() {
        this.appContainer = null;
        this.loadingOverlay = null;
        this._initialized = false;
        this.modules = {
            search: null,
            directory: null,
            content: null
        };
    }

    async initApp() {
        console.log('模块加载器初始化...');
        
        if (this._initialized) {
            console.log('已经初始化过，跳过');
            return;
        }
        
        this.appContainer = document.getElementById('appContainer');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        
        if (!this.appContainer) {
            console.error('找不到应用容器');
            return;
        }
        
        // 构建应用界面
        this.buildAppInterface();
        
        // 加载并初始化模块
        await this.initModules();
        
        this._initialized = true;
        console.log('应用初始化完成');
    }
    
    buildAppInterface() {
        console.log('构建应用界面...');
        
        // 应用主布局
        this.appContainer.innerHTML = `
            <div id="appMainLayout" style="
                display: flex;
                height: 100vh;
                background: white;
                opacity: 1 !important;
            ">
                <!-- 左侧面板 -->
                <div style="
                    width: 300px;
                    background: #f8f9fa;
                    border-right: 1px solid #e0e0e0;
                    display: flex;
                    flex-direction: column;
                ">
                    <!-- 搜索模块 -->
                    <div style="padding: 20px; border-bottom: 1px solid #e0e0e0;">
                        <div id="searchContainer"></div>
                    </div>
                    
                    <!-- 目录模块 -->
                    <div style="flex: 1; overflow: hidden; display: flex; flex-direction: column;">
                        <div id="directoryContainer" style="flex: 1; overflow-y: auto; padding: 20px;"></div>
                    </div>
                </div>
                
                <!-- 右侧内容区域 -->
                <div style="flex: 1; background: white; overflow-y: auto;">
                    <div id="content-area" style="min-height: 100%;"></div>
                </div>
            </div>
        `;
        
        console.log('应用界面构建完成');
    }
    
    async initModules() {
        console.log('加载并初始化模块...');
        
        // 更新系统状态
        this.updateSystemStatus('正在加载模块...');
        
        try {
            // 使用Promise.race添加超时
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('模块加载超时(5秒)')), 5000);
            });
            
            await Promise.race([
                this.loadAllModules(),
                timeoutPromise
            ]);
            
            console.log('模块加载完成');
            this.updateSystemStatus('模块加载完成');
            
            // 隐藏加载遮罩
            this.hideLoadingOverlay();
            
        } catch (error) {
            console.error('模块初始化失败:', error);
            this.updateSystemStatus(`模块加载失败: ${error.message}`);
            
            // 显示错误信息
            this.showError(error);
        }
    }
    
    async loadAllModules() {
        // 并行加载所有模块
        await Promise.all([
            this.loadSearchModule(),
            this.loadDirectoryModule(),
            this.loadContentModule()
        ]);
    }
    
    async loadSearchModule() {
        console.log('加载搜索模块...');
        this.updateModuleStatus('search', 'loading');
        
        // 动态导入搜索模块 - 添加时间戳防止缓存
        const timestamp = new Date().getTime();
        const modulePath = `/js/modules/search-module.js?t=${timestamp}`;
        console.log(`导入模块: ${modulePath}`);
        
        try {
            console.log('开始导入搜索模块...');
            // 使用动态import
            const module = await import(modulePath);
            console.log('搜索模块导入成功:', module);
            
            this.modules.search = module.default || module;
            console.log('搜索模块实例:', this.modules.search);
            
            // 渲染到容器
            const container = document.getElementById('searchContainer');
            console.log('搜索容器:', container);
            
            if (container && this.modules.search.render) {
                console.log('调用搜索模块render方法...');
                container.innerHTML = this.modules.search.render();
                console.log('搜索模块渲染完成');
            }
            
            // 初始化
            if (this.modules.search.init) {
                console.log('调用搜索模块init方法...');
                await this.modules.search.init();
                console.log('搜索模块初始化完成');
            }
            
            console.log('搜索模块加载完成');
            this.updateModuleStatus('search', 'loaded');
            
        } catch (error) {
            console.error('搜索模块加载失败:', error);
            this.updateModuleStatus('search', 'error', error.message);
            throw error;
        }
    }
    
    async loadDirectoryModule() {
        console.log('加载目录模块...');
        this.updateModuleStatus('directory', 'loading');
        
        // 动态导入简单目录模块 - 添加时间戳防止缓存
        const timestamp = new Date().getTime();
        const modulePath = `/js/modules/directory-module-fixed.js?t=${timestamp}`;
        console.log(`导入模块: ${modulePath}`);
        
        try {
            console.log('开始导入目录模块...');
            // 使用动态import
            const module = await import(modulePath);
            console.log('目录模块导入成功:', module);
            
            // 检查模块导出
            if (!module.default && typeof module === 'object') {
                console.warn('目录模块没有默认导出，尝试使用整个模块对象');
                this.modules.directory = new module.DirectoryModule ? new module.DirectoryModule() : module;
            } else {
                this.modules.directory = new module.default();
            }
            console.log('目录模块实例:', this.modules.directory);
            
            // 检查实例是否有render方法
            if (!this.modules.directory || typeof this.modules.directory.render !== 'function') {
                throw new Error('目录模块实例无效或缺少render方法');
            }
            
            // 渲染到容器
            const container = document.getElementById('directoryContainer');
            console.log('目录容器:', container);
            
            if (container) {
                console.log('调用目录模块render方法...');
                container.innerHTML = this.modules.directory.render();
                console.log('目录模块渲染完成');
            }
            
            // 初始化
            if (typeof this.modules.directory.init === 'function') {
                console.log('调用目录模块init方法...');
                await this.modules.directory.init();
                console.log('目录模块初始化完成');
            } else {
                console.warn('目录模块没有init方法，跳过初始化');
            }
            
            console.log('目录模块加载完成');
            this.updateModuleStatus('directory', 'loaded');
            
        } catch (error) {
            console.error('目录模块加载失败:', error);
            this.updateModuleStatus('directory', 'error', error.message);
            throw error;
        }
    }
    
    async loadContentModule() {
        console.log('加载内容模块...');
        
        // 动态导入内容模块 - 添加时间戳防止缓存
        const timestamp = new Date().getTime();
        const modulePath = `/js/modules/content-core.js?t=${timestamp}`;
        console.log(`导入模块: ${modulePath}`);
        
        try {
            // 使用动态import
            const module = await import(modulePath);
            this.modules.content = module.default || module;
            
            // 渲染到容器
            const container = document.getElementById('content-area');
            if (container && this.modules.content.render) {
                container.innerHTML = this.modules.content.render();
            }
            
            // 初始化
            if (this.modules.content.init) {
                await this.modules.content.init();
            }
            
            console.log('内容模块加载完成');
            this.updateModuleStatus('content', 'loaded');
            
        } catch (error) {
            console.error('内容模块加载失败:', error);
            this.updateModuleStatus('content', 'error', error.message);
            throw error;
        }
    }
    
    updateModuleStatus(moduleName, status, error = '') {
        const statusMap = {
            'loaded': '✅ 已加载',
            'error': `❌ 错误: ${error}`,
            'loading': '⏳ 加载中...'
        };
        
        const statusText = statusMap[status] || status;
        console.log(`${moduleName}模块状态: ${statusText}`);
        
        // 更新UI上的模块状态
        this.updateModuleUIStatus(moduleName, statusText);
    }
    
    updateModuleUIStatus(moduleName, statusText) {
        // 直接更新模块容器内的状态文本
        // 搜索模块状态在searchContainer内
        // 目录模块状态在directoryContainer内
        
        if (moduleName === 'search') {
            const searchContainer = document.getElementById('searchContainer');
            if (searchContainer) {
                // 查找或创建状态元素
                let statusElement = searchContainer.querySelector('.module-status');
                if (!statusElement) {
                    statusElement = document.createElement('div');
                    statusElement.className = 'module-status';
                    statusElement.style.cssText = 'font-size: 12px; color: #666; margin-top: 5px;';
                    searchContainer.appendChild(statusElement);
                }
                statusElement.textContent = `搜索模块: ${statusText}`;
            }
        } else if (moduleName === 'directory') {
            const directoryContainer = document.getElementById('directoryContainer');
            if (directoryContainer) {
                let statusElement = directoryContainer.querySelector('.module-status');
                if (!statusElement) {
                    statusElement = document.createElement('div');
                    statusElement.className = 'module-status';
                    statusElement.style.cssText = 'font-size: 12px; color: #666; margin-top: 5px;';
                    directoryContainer.appendChild(statusElement);
                }
                statusElement.textContent = `目录模块: ${statusText}`;
            }
        }
        
        // 同时更新全局moduleStatus元素
        const globalStatusElement = document.getElementById('moduleStatus');
        if (globalStatusElement) {
            // 简单更新：显示所有模块状态
            let statusText = globalStatusElement.textContent || '';
            
            // 移除旧的模块状态行
            const lines = statusText.split('\\n').filter(line => 
                !line.includes('搜索模块:') && !line.includes('目录模块:')
            );
            
            // 添加新的模块状态
            if (moduleName === 'search') {
                lines.push(`🔍 搜索模块: ${statusText}`);
            } else if (moduleName === 'directory') {
                lines.push(`📊 目录模块: ${statusText}`);
            }
            
            globalStatusElement.textContent = lines.join('\\n');
        }
    }
    
    updateSystemStatus(message) {
        console.log(`系统状态: ${message}`);
        
        // 可以在UI上显示状态
        const statusElement = document.getElementById('systemStatus');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }
    
    hideLoadingOverlay() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'none';
        }
    }
    
    showError(error) {
        const contentContainer = document.getElementById('content-area');
        if (contentContainer) {
            contentContainer.innerHTML = `
                <div style="padding: 40px; text-align: center;">
                    <h3 style="color: #e74c3c;">模块加载失败，请刷新页面重试</h3>
                    <p style="color: #e74c3c;">错误信息: ${error.message}</p>
                </div>
            `;
        }
        
        // 仍然隐藏加载遮罩
        this.hideLoadingOverlay();
    }
}

// 创建全局实例
window.ModuleLoader = new FixedModuleLoader();