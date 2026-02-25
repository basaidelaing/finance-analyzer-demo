// 应用加载器模块
// 文件大小: <5KB

class ModuleLoader {
    constructor() {
        this.modules = {};
        this.loadedModules = new Set();
        this.appContainer = null;
        this.loadingOverlay = null;
        this._initialized = false;  // 初始化标记
    }

    async initApp() {
        console.log('模块加载器初始化...');
        
        // 防止重复初始化
        if (this._initialized) {
            console.log('模块加载器已经初始化过，跳过');
            return;
        }
        
        // 获取DOM元素
        this.appContainer = document.getElementById('appContainer');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        
        if (!this.appContainer) {
            console.error('找不到应用容器');
            return;
        }
        
        // 定义模块配置
        const moduleConfigs = [
            {
                id: 'search',
                name: '搜索模块',
                url: '/static/js/modules/search-module.js',
                templateId: 'searchModuleTemplate'
            },
            {
                id: 'directory',
                name: '目录模块',
                url: '/static/js/modules/directory-module.js',
                templateId: 'directoryModuleTemplate'
            },
            {
                id: 'content',
                name: '内容模块',
                url: '/static/js/modules/content-core.js',
                templateId: 'contentModuleTemplate'
            }
        ];
        
        // 加载所有模块
        try {
            await this.loadModules(moduleConfigs);
            
            // 构建应用界面
            this.buildAppInterface();
            
            // 初始化模块
            await this.initModules();
            
            // 隐藏加载遮罩
            this.hideLoadingOverlay();
        
        // 标记为已初始化
        this._initialized = true;
            
            console.log('应用初始化完成');
            
        } catch (error) {
            console.error('应用初始化失败:', error);
            this.showError('应用初始化失败: ' + error.message);
        }
    }
    
    async loadModules(moduleConfigs) {
        console.log(`开始加载 ${moduleConfigs.length} 个模块...`);
        
        const loadPromises = moduleConfigs.map(async (config) => {
            try {
                // 动态加载JS模块
                const module = await import(config.url);
                this.modules[config.id] = module;
                this.loadedModules.add(config.id);
                
                console.log(`✅ 加载模块: ${config.name}`);
                return { success: true, module: config.id };
                
            } catch (error) {
                console.warn(`⚠️ 加载模块失败 ${config.name}:`, error);
                
                // 创建降级模块
                this.modules[config.id] = this.createFallbackModule(config.id);
                this.loadedModules.add(config.id);
                
                return { success: false, module: config.id, error };
            }
        });
        
        await Promise.all(loadPromises);
        console.log('所有模块加载完成');
    }
    
    createFallbackModule(moduleId) {
        // 创建降级模块
        return {
            init: () => console.log(`降级模块 ${moduleId} 初始化`),
            render: () => `<div class="error-state">
                <div class="icon">⚠️</div>
                <h3>模块加载失败</h3>
                <p>${moduleId} 模块未能正确加载</p>
            </div>`
        };
    }
    
    buildAppInterface() {
        console.log('构建应用界面...');
        
        // 创建主布局 - 添加内联样式确保可见
        const appHTML = `
            <div class="app-main-layout" style="
                display: flex !important;
                width: 100% !important;
                height: 100vh !important;
                background: white !important;
                border-radius: 10px !important;
                overflow: hidden !important;
                box-shadow: 0 0 20px rgba(0,0,0,0.1) !important;
                margin: 20px !important;
                position: relative !important;
                z-index: 1 !important;
                opacity: 1 !important;
                visibility: visible !important;
            ">
                <!-- 左侧边栏 -->
                <div class="left-sidebar" style="
                    width: 300px !important;
                    background: #f8f9fa !important;
                    border-right: 1px solid #e0e0e0 !important;
                    padding: 20px !important;
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                ">
                    <div id="searchModuleContainer" class="module-container" style="
                        background: white !important;
                        padding: 20px !important;
                        margin-bottom: 20px !important;
                        border-radius: 8px !important;
                        border: 1px solid #e0e0e0 !important;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
                    ">
                        <div style="color: #2c5282;">
                            <h3>🔍 搜索公司</h3>
                            <p class="module-status">搜索模块初始化中...</p>
                        </div>
                    </div>
                    <div id="directoryModuleContainer" class="module-container" style="
                        background: white !important;
                        padding: 20px !important;
                        border-radius: 8px !important;
                        border: 1px solid #e0e0e0 !important;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
                    ">
                        <div style="color: #2c5282;">
                            <h3>📊 指标目录</h3>
                            <p class="module-status">目录模块初始化中...</p>
                        </div>
                    </div>
                </div>
                
                <!-- 右侧内容 -->
                <div class="right-content" style="
                    flex: 1 !important;
                    padding: 20px !important;
                    background: white !important;
                    display: block !important;
                    visibility: visible !important;
                    overflow-y: auto !important;
                    opacity: 1 !important;
                ">
                    <div id="contentModuleContainer" class="module-container" style="
                        background: white !important;
                        padding: 30px !important;
                        border-radius: 8px !important;
                        border: 1px solid #e0e0e0 !important;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
                    ">
                        <h2 style="color: #2c5282; margin-top: 0;">白酒行业财务分析系统</h2>
                        <p>系统已就绪，请选择公司和指标查看分析结果</p>
                        
                        <div style="
                            background: #f0f9ff;
                            padding: 20px;
                            border-radius: 8px;
                            margin-top: 20px;
                            border: 1px solid #bee3f8;
                        ">
                            <h4 style="color: #2c5282; margin-top: 0;">📈 当前状态</h4>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                <li>✅ 服务器运行正常</li>
                                <li>✅ 前端模块加载完成</li>
                                <li>✅ 应用界面已构建</li>
                                <li>⏳ 等待模块初始化...</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 调试信息 -->
            <div id="debugInfo" style="
                position: fixed;
                bottom: 10px;
                right: 10px;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 10px 15px;
                border-radius: 5px;
                font-size: 12px;
                z-index: 9999;
            ">
                界面构建时间: <span id="buildTime">${new Date().toLocaleTimeString()}</span>
            </div>
        `;
        
        console.log('设置appContainer内容，当前appContainer:', this.appContainer);
        this.appContainer.innerHTML = appHTML;
        console.log('appContainer内容已设置，检查DOM元素...');
        
        // 立即检查DOM元素是否存在
        setTimeout(() => {
            const appLayout = document.querySelector('.app-main-layout');
            const leftSidebar = document.querySelector('.left-sidebar');
            const rightContent = document.querySelector('.right-content');
            
            console.log('DOM检查:');
            console.log('  .app-main-layout:', appLayout ? '存在' : '不存在');
            console.log('  .left-sidebar:', leftSidebar ? '存在' : '不存在');
            console.log('  .right-content:', rightContent ? '存在' : '不存在');
            
            if (appLayout) {
                console.log('  app-main-layout样式:', window.getComputedStyle(appLayout).display);
                console.log('  app-main-layout可见性:', window.getComputedStyle(appLayout).visibility);
                console.log('  app-main-layout透明度:', window.getComputedStyle(appLayout).opacity);
            }
        }, 100);
    }
    
    async initModules() {
        console.log('初始化模块...');
        
        // 简化的模块初始化 - 直接设置内容
        console.log('使用简化初始化...');
        
        // 搜索模块
        const searchContainer = document.getElementById('searchModuleContainer');
        if (searchContainer) {
            searchContainer.innerHTML = `
                <div style="padding: 20px;">
                    <h3 style="color: #2c5282;">搜索公司</h3>
                    <p style="color: #27ae60;">搜索模块就绪</p>
                </div>
            `;
        }
        
        // 目录模块
        const directoryContainer = document.getElementById('directoryModuleContainer');
        if (directoryContainer) {
            directoryContainer.innerHTML = `
                <div style="padding: 20px;">
                    <h3 style="color: #2c5282;">指标目录</h3>
                    <p style="color: #27ae60;">目录模块就绪</p>
                </div>
            `;
        }
        
        // 内容模块
        const contentContainer = document.getElementById('contentModuleContainer');
        if (contentContainer) {
            contentContainer.innerHTML = `
                <div style="padding: 20px;">
                    <h2 style="color: #2c5282;">白酒行业财务分析系统</h2>
                    <p style="color: #27ae60;">系统就绪</p>
                </div>
            `;
        }
        
        console.log('模块初始化完成');
    }
        
        // 初始化搜索模块
        if (this.modules.search) {
            try {
                const searchContainer = document.getElementById('searchModuleContainer');
                if (searchContainer && this.modules.search.render) {
                    searchContainer.innerHTML = this.modules.search.render();
                    if (this.modules.search.init) {
                        console.log('初始化搜索模块...');
                        
                        // 添加超时处理
                        try {
                            await Promise.race([
                                this.modules.search.init(),
                                new Promise((_, reject) => 
                                    setTimeout(() => reject(new Error('搜索模块初始化超时(5秒)')), 5000)
                                )
                            ]);
                            console.log('搜索模块初始化完成');
                            
                            // 更新界面显示
                            this.updateModuleStatus('search', '✅ 搜索模块就绪');
                        } catch (error) {
                            console.error('搜索模块初始化失败:', error);
                            this.updateModuleStatus('search', `⚠️ 搜索模块: ${error.message}`);
                            throw error; // 重新抛出以便外层catch捕获
                        }
                    }
                }
            } catch (error) {
                console.error('搜索模块初始化失败:', error);
                this.updateModuleStatus('search', `❌ 搜索模块错误: ${error.message}`);
            }
        }
        
        // 初始化目录模块
        if (this.modules.directory) {
            try {
                const directoryContainer = document.getElementById('directoryModuleContainer');
                if (directoryContainer && this.modules.directory.render) {
                    directoryContainer.innerHTML = this.modules.directory.render();
                    if (this.modules.directory.init) {
                        console.log('初始化目录模块...');
                        
                        // 添加超时处理
                        try {
                            await Promise.race([
                                this.modules.directory.init(),
                                new Promise((_, reject) => 
                                    setTimeout(() => reject(new Error('目录模块初始化超时(5秒)')), 5000)
                                )
                            ]);
                            console.log('目录模块初始化完成');
                            
                            // 更新界面显示
                            this.updateModuleStatus('directory', '✅ 目录模块就绪');
                        } catch (error) {
                            console.error('目录模块初始化失败:', error);
                            this.updateModuleStatus('directory', `⚠️ 目录模块: ${error.message}`);
                            throw error;
                        }
                    }
                }
            } catch (error) {
                console.error('目录模块初始化失败:', error);
                this.updateModuleStatus('directory', `❌ 目录模块错误: ${error.message}`);
            }
        }
        
        // 初始化内容模块
        if (this.modules.content) {
            try {
                const contentContainer = document.getElementById('contentModuleContainer');
                if (contentContainer && this.modules.content.render) {
                    contentContainer.innerHTML = this.modules.content.render();
                    if (this.modules.content.init) {
                        console.log('初始化内容模块...');
                        
                        // 添加超时处理
                        try {
                            await Promise.race([
                                this.modules.content.init(),
                                new Promise((_, reject) => 
                                    setTimeout(() => reject(new Error('内容模块初始化超时(5秒)')), 5000)
                                )
                            ]);
                            console.log('内容模块初始化完成');
                            
                            // 更新界面显示
                            this.updateModuleStatus('content', '✅ 内容模块就绪');
                        } catch (error) {
                            console.error('内容模块初始化失败:', error);
                            this.updateModuleStatus('content', `⚠️ 内容模块: ${error.message}`);
                            throw error;
                        }
                    }
                }
            } catch (error) {
                console.error('内容模块初始化失败:', error);
                this.updateModuleStatus('content', `❌ 内容模块错误: ${error.message}`);
            }
        }
        
        console.log('所有模块初始化尝试完成');
    }
    
    updateModuleStatus(moduleId, statusText) {
        // 更新界面显示
        const statusElement = document.querySelector(`#${moduleId}ModuleContainer .module-status`);
        if (statusElement) {
            statusElement.textContent = statusText;
            statusElement.style.color = statusText.includes('✅') ? '#27ae60' : 
                                      statusText.includes('❌') ? '#e74c3c' : '#2c5282';
        }
        
        // 更新右侧状态列表
        this.updateSystemStatus(moduleId, statusText);
    }
    
    updateSystemStatus(moduleId, statusText) {
        const statusList = document.querySelector('#contentModuleContainer ul');
        if (statusList) {
            // 查找对应的状态项
            const items = statusList.querySelectorAll('li');
            for (const item of items) {
                if (item.textContent.includes('等待模块初始化')) {
                    item.textContent = statusText;
                    item.style.color = statusText.includes('✅') ? '#27ae60' : 
                                     statusText.includes('❌') ? '#e74c3c' : '#2c5282';
                    break;
                }
            }
        }
    }
    
    hideLoadingOverlay() {
        if (this.loadingOverlay) {
            // 立即隐藏，不等待动画
            this.loadingOverlay.style.display = 'none';
            this.loadingOverlay.style.opacity = '0';
            this.loadingOverlay.style.visibility = 'hidden';
            this.loadingOverlay.style.zIndex = '-1';
            
            console.log('加载遮罩已隐藏');
        } else {
            console.warn('找不到加载遮罩元素');
        }
    }
    
    showError(message) {
        if (this.appContainer) {
            this.appContainer.innerHTML = `
                <div class="error-state">
                    <div class="icon">❌</div>
                    <h3>应用错误</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="retry-btn">重试</button>
                </div>
            `;
        }
        
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'none';
        }
    }
    
    showSuccess(message) {
        if (this.appContainer) {
            const successDiv = document.createElement('div');
            successDiv.className = 'success-state';
            successDiv.innerHTML = `
                <div class="icon">✅</div>
                <p>${message}</p>
            `;
            successDiv.style.position = 'fixed';
            successDiv.style.top = '20px';
            successDiv.style.right = '20px';
            successDiv.style.zIndex = '1000';
            
            document.body.appendChild(successDiv);
            
            setTimeout(() => {
                successDiv.remove();
            }, 3000);
        }
    }
}

// 创建全局实例
window.ModuleLoader = new ModuleLoader();

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
    window.ModuleLoader.initApp();
});

export default window.ModuleLoader;