// 简化版应用加载器
// 文件大小: <5KB

class SimpleModuleLoader {
    constructor() {
        this.appContainer = null;
        this.loadingOverlay = null;
        this._initialized = false;
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
        
        // 构建界面
        this.buildAppInterface();
        
        // 初始化模块
        await this.initModules();
        
        // 隐藏加载遮罩
        this.hideLoadingOverlay();
        
        this._initialized = true;
        console.log('应用初始化完成');
    }
    
    buildAppInterface() {
        console.log('构建应用界面...');
        
        const appHTML = `
            <div class="app-main-layout" style="
                display: flex;
                width: calc(100% - 40px);
                height: calc(100vh - 40px);
                background: white;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
                margin: 20px;
            ">
                <!-- 左侧边栏 -->
                <div class="left-sidebar" style="
                    width: 300px;
                    background: #f8f9fa;
                    border-right: 1px solid #e0e0e0;
                    padding: 20px;
                ">
                    <div id="searchModuleContainer" class="module-container" style="
                        background: white;
                        padding: 20px;
                        margin-bottom: 20px;
                        border-radius: 8px;
                        border: 1px solid #e0e0e0;
                    "></div>
                    <div id="directoryModuleContainer" class="module-container" style="
                        background: white;
                        padding: 20px;
                        border-radius: 8px;
                        border: 1px solid #e0e0e0;
                    "></div>
                </div>
                
                <!-- 右侧内容 -->
                <div class="right-content" style="
                    flex: 1;
                    padding: 20px;
                    background: white;
                    overflow-y: auto;
                ">
                    <div id="contentModuleContainer" class="module-container" style="
                        background: white;
                        padding: 30px;
                        border-radius: 8px;
                        border: 1px solid #e0e0e0;
                    "></div>
                </div>
            </div>
        `;
        
        this.appContainer.innerHTML = appHTML;
        console.log('应用界面构建完成');
    }
    
    async initModules() {
        console.log('初始化模块...');
        
        // 搜索模块
        const searchContainer = document.getElementById('searchModuleContainer');
        if (searchContainer) {
            searchContainer.innerHTML = `
                <div style="padding: 20px;">
                    <h3 style="color: #2c5282; margin-top: 0;">搜索公司</h3>
                    <div style="margin: 15px 0;">
                        <input type="text" 
                               id="companySearchInput" 
                               placeholder="输入公司名称或代码..."
                               style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
                    </div>
                    <div id="searchSuggestions" style="
                        border: 1px solid #e0e0e0;
                        border-radius: 4px;
                        max-height: 200px;
                        overflow-y: auto;
                        display: none;
                    "></div>
                    <p style="color: #27ae60; margin-top: 10px;">搜索模块就绪</p>
                </div>
            `;
        }
        
        // 目录模块
        const directoryContainer = document.getElementById('directoryModuleContainer');
        if (directoryContainer) {
            directoryContainer.innerHTML = `
                <div style="padding: 20px;">
                    <h3 style="color: #2c5282; margin-top: 0;">指标目录</h3>
                    <div style="margin: 15px 0;">
                        <div style="
                            background: #f0f9ff;
                            padding: 15px;
                            border-radius: 8px;
                            border: 1px solid #bee3f8;
                        ">
                            <h4 style="color: #2c5282; margin-top: 0;">维度7: 盈利能力</h4>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                <li><a href="#" class="indicator-link" data-code="7.11">7.11 销售净利率</a></li>
                                <li><a href="#" class="indicator-link" data-code="7.12">7.12 销售毛利率</a></li>
                                <li><a href="#" class="indicator-link" data-code="7.13">7.13 净资产收益率</a></li>
                                <li><a href="#" class="indicator-link" data-code="7.14">7.14 总资产报酬率</a></li>
                            </ul>
                        </div>
                    </div>
                    <p style="color: #27ae60;">目录模块就绪</p>
                </div>
            `;
        }
        
        // 内容模块
        const contentContainer = document.getElementById('contentModuleContainer');
        if (contentContainer) {
            contentContainer.innerHTML = `
                <div style="padding: 20px;">
                    <h2 style="color: #2c5282; margin-top: 0;">白酒行业财务分析系统</h2>
                    <p>系统已就绪，请选择公司和指标查看分析结果</p>
                    
                    <div style="
                        background: #f0f9ff;
                        padding: 20px;
                        border-radius: 8px;
                        margin-top: 20px;
                        border: 1px solid #bee3f8;
                    ">
                        <h4 style="color: #2c5282; margin-top: 0;">系统状态</h4>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li>服务器运行正常</li>
                            <li>前端模块加载完成</li>
                            <li>应用界面已构建</li>
                            <li>模块初始化完成</li>
                        </ul>
                    </div>
                </div>
            `;
        }
        
        console.log('模块初始化完成');
    }
    
    hideLoadingOverlay() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'none';
            console.log('加载遮罩已隐藏');
        }
    }
}

// 创建全局实例
window.ModuleLoader = new SimpleModuleLoader();

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
    window.ModuleLoader.initApp();
});

export default window.ModuleLoader;