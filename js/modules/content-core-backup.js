// content-core.js - 内容模块核心类
// 文件大小: <10KB

/**
 * 简单内容模块 - 核心类
 * 负责管理公司、指标选择，协调图表和AI分析显示
 */
class SimpleContent {
    constructor() {
        this.container = null;
        this.company = null;
        this.indicator = null;
        this.chartData = null;
        this.initialized = false;
        
        console.log('SimpleContent核心类初始化');
    }
    
    /**
     * 初始化模块
     */
    init() {
        if (this.initialized) return;
        
        console.log('SimpleContent开始初始化...');
        console.log('document.readyState:', document.readyState);
        console.log('document.body:', document.body ? '存在' : '不存在');
        
        // 尝试获取容器
        this.container = document.getElementById('content-area');
        console.log('查找#content-area结果:', this.container ? '找到' : '未找到');
        
        if (!this.container) {
            console.warn('内容区域容器未找到: #content-area，等待DOM加载...');
            
            // 输出所有id为调试
            this.debugAllIds();
            
            // 等待DOM加载完成
            if (document.readyState === 'loading') {
                console.log('DOM还在加载中，添加监听器...');
                document.addEventListener('DOMContentLoaded', () => {
                    console.log('DOMContentLoaded事件触发');
                    this.container = document.getElementById('content-area');
                    if (this.container) {
                        console.log('DOM加载后找到容器');
                        this.finishInit();
                    } else {
                        console.error('DOM加载后仍未找到容器: #content-area');
                        this.debugAllIds();
                    }
                });
            } else {
                // DOM已加载，但容器不存在
                console.error('DOM已加载但容器不存在: #content-area');
                this.debugAllIds();
            }
            return;
        }
        
        this.finishInit();
    }
    
    /**
     * 调试：输出所有id
     */
    debugAllIds() {
        console.log('=== 调试：所有元素id ===');
        const allElements = document.querySelectorAll('[id]');
        console.log(`找到 ${allElements.length} 个有id的元素`);
        
        if (allElements.length > 0) {
            allElements.forEach((el, i) => {
                if (i < 10) { // 只显示前10个
                    console.log(`  ${el.id}: ${el.tagName}.${el.className || '无class'}`);
                }
            });
            if (allElements.length > 10) {
                console.log(`  ... 还有 ${allElements.length - 10} 个元素`);
            }
        } else {
            console.log('  没有找到有id的元素');
        }
        console.log('=== 调试结束 ===');
    }
    
    /**
     * 完成初始化
     */
    finishInit() {
        if (this.initialized) return;
        
        this.initialized = true;
        console.log('SimpleContent模块初始化完成');
        
        // 监听事件
        this.setupEventListeners();
        
        // 显示欢迎信息
        this.showWelcome();
    }
    
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听公司选择事件
        document.addEventListener('companySelected', (event) => {
            console.log('收到companySelected事件:', event.detail);
            this.company = event.detail.company;
            this.update();
        });
        
        // 监听指标选择事件
        document.addEventListener('indicatorSelected', (event) => {
            console.log('收到indicatorSelected事件:', event.detail);
            this.indicator = event.detail.indicator;
            this.update();
        });
    }
    
    /**
     * 更新内容显示
     */
    update() {
        if (!this.container) {
            console.error('容器未初始化');
            return;
        }
        
        console.log('内容模块update()被调用:');
        console.log('公司:', this.company);
        console.log('指标:', this.indicator);
        
        // 根据选择状态显示不同内容
        if (!this.company && !this.indicator) {
            this.showWelcome();
        } else if (this.indicator && !this.company) {
            this.showIndicatorInfo();
        } else if (this.company && this.indicator) {
            this.showFullContent();
        } else if (this.company && !this.indicator) {
            this.showCompanyInfo();
        }
    }
    
    /**
     * 显示欢迎信息
     */
    showWelcome() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #666;">
                <h2 style="color: #2c5282;">📊 财务分析系统</h2>
                <p>请从左侧选择公司，从目录选择指标开始分析</p>
                <div style="margin-top: 30px; color: #999;">
                    <p><small>支持维度7的19个财务指标分析</small></p>
                    <p><small>包含图表可视化和数据洞察</small></p>
                </div>
            </div>
        `;
    }
    
    /**
     * 显示公司信息
     */
    showCompanyInfo() {
        if (!this.container || !this.company) return;
        
        this.container.innerHTML = `
            <div style="padding: 20px;">
                <h2 style="color: #2c5282; margin-top: 0;">🏢 ${this.company.name}</h2>
                <div style="background: #f0f9ff; padding: 20px; border-radius: 8px;">
                    <p><strong>股票代码:</strong> ${this.company.ts_code}</p>
                    <p><strong>行业:</strong> ${this.company.industry || '未指定'}</p>
                    <p><strong>上市日期:</strong> ${this.company.list_date || '未知'}</p>
                    ${this.company.market_cap_rank ? `<p><strong>市值排名:</strong> ${this.company.market_cap_rank}</p>` : ''}
                    <p style="margin-top: 20px; color: #666;">请从目录选择要分析的指标</p>
                </div>
            </div>
        `;
    }
    
    /**
     * 显示指标信息
     */
    showIndicatorInfo() {
        if (!this.container || !this.indicator) return;
        
        this.container.innerHTML = `
            <div style="padding: 20px;">
                <h2 style="color: #2c5282; margin-top: 0;">📈 ${this.indicator.name}</h2>
                <div style="background: #f0f9ff; padding: 20px; border-radius: 8px;">
                    <p><strong>指标代码:</strong> ${this.indicator.code}</p>
                    <p><strong>维度:</strong> ${this.indicator.dimension || '7'}</p>
                    <p><strong>类别:</strong> ${this.indicator.category || '未分类'}</p>
                    <p><strong>状态:</strong> ${this.indicator.status || '未知'}</p>
                    <p><strong>数据源:</strong> ${this.indicator.data_source || '未指定'}</p>
                    <p>${this.indicator.description || '暂无详细说明'}</p>
                    ${this.indicator.data_source ? `<p><strong>数据源:</strong> ${this.indicator.data_source}</p>` : ''}
                    ${this.indicator.charts ? `<p><strong>图表类型:</strong> ${this.indicator.charts.join(', ')}</p>` : ''}
                    <p style="margin-top: 20px; color: #666;">请从搜索框选择要分析的公司</p>
                </div>
            </div>
        `;
    }
    
    /**
     * 显示完整内容（公司+指标）
     */
    async showFullContent() {
        if (!this.container || !this.company || !this.indicator) return;
        
        // 显示加载中
        this.showLoading();
        
        try {
            // 导入图表模块和分析模块
            const [chartModule, analysisModule] = await Promise.all([
                import('./content-charts.js'),
                import('./content-analysis.js')
            ]);
            
            // 并行调用：图表数据 + AI分析 + 指标interpretation
            const [chartData, analysisData, indicatorData] = await Promise.all([
                chartModule.fetchChartData(this.company, this.indicator),
                analysisModule.fetchAIAnalysis(this.company),
                analysisModule.fetchIndicatorInterpretation(this.indicator)
            ]);
            
            // 显示真实数据（使用interpretation框架）
            this.showRealContent(chartData, analysisData, indicatorData);
            
        } catch (error) {
            console.error('加载失败:', error);
            this.showError(error);
        }
    }
    
    /**
     * 显示加载中状态
     */
    showLoading() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <h3 style="color: #2c5282;">加载中...</h3>
                <p>正在获取${this.company?.name || '公司'}的${this.indicator?.name || '指标'}数据</p>
                <div style="margin: 30px auto; width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #2c5282; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            </div>
        `;
    }
    
    /**
     * 显示错误信息
     */
    showError(error) {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div style="padding: 20px; color: #e74c3c;">
                <h3>错误</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
    
    /**
     * 显示真实内容
     */
    showRealContent(chartData, analysisData, indicatorData) {
        if (!this.container) return;
        
        // 存储图表数据，用于后续图表生成
        this.chartData = chartData;
        
        // 导入工具模块进行数据处理
        import('./content-utils.js').then(utilsModule => {
            // 处理图表数据
            const chartInfo = utilsModule.formatChartData(chartData);
            const analysisInfo = utilsModule.formatAnalysisData(analysisData, indicatorData, this.indicator);
            
            this.container.innerHTML = `
                <div style="padding: 20px;">
                    <h2 style="color: #2c5282; margin-top: 0;">${this.company.name} - ${this.indicator.name}</h2>
                    
                    <!-- 图表区域 -->
                    <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bee3f8;">
                        <h3 style="color: #2c5282; margin-top: 0;">📊 ECharts可视化图表</h3>
                        <p><strong>公司:</strong> ${this.company.name} (${this.company.ts_code})</p>
                        <p><strong>指标:</strong> ${this.indicator.code} - ${this.indicator.name}</p>
                        ${chartInfo.html}
                    </div>
                    
                    <!-- AI分析区域（已移除AI智能分析标题） -->
                    <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bee3f8;">
                        ${analysisInfo.html}
                    </div>
                    
                    <!-- 原始数据区域 -->
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px; font-size: 14px;">
                        <h4 style="color: #666; margin-top: 0;">📋 数据信息</h4>
                        <p><strong>数据状态:</strong> ${chartData.real_data ? '✅ 真实财务数据' : '⚠️ 模拟数据'}</p>
                        <p><strong>更新时间:</strong> ${new Date().toLocaleString()}</p>
                        <p><strong>分析框架:</strong> 基于JSON定义的指标分析框架</p>
                    </div>
                </div>
            `;
            
            // 渲染图表
            if (chartInfo.renderChart) {
                chartInfo.renderChart();
            }
        }).catch(error => {
            console.error('工具模块加载失败:', error);
            this.showError(error);
        });
    }
}

// 导出实例
const contentModule = new SimpleContent();
export default contentModule;